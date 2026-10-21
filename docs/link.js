'use strict';
// Celio Engine.IO 4 / Socket.IO transport. No ROM/save bytes are logged.
const celioDiagnostics=(()=>{
 const key='celio-link-history-v1';let history=[];
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');if(Array.isArray(saved))history=saved.slice(-5);}catch{}
 let live=null,storageOK=true;
 function save(){try{localStorage.setItem(key,JSON.stringify(history));storageOK=true;}catch{storageOK=false;}}
 return {
  begin(role){live={build:'net53',started:new Date().toISOString(),role,events:[],sent:0,received:0};return live;},
  event(log,kind,detail={}){if(!log||log.ended)return;log.events.push({at:new Date().toISOString(),kind,...detail});if(log.events.length>160)log.events.shift();},
  finish(log,reason,error){if(!log||log.ended)return;log.ended=new Date().toISOString();log.reason=reason;log.error=error;history.push(log);history=history.slice(-5);save();},
  export(){return JSON.stringify({format:1,build:'net53',storageOK,history,active:live&&!live.ended?live:null},null,2);},
  clear(){history=[];if(live?.ended)live=null;save();},
  get storageOK(){return storageOK;}
 };
})();
function createCelioLink(M,hooks){
 const endpoint='wss://celio-server.up.railway.app/socket.io/?EIO=4&transport=websocket';
 const commands=new Set([0,1,0x10,0x11,0x12,0x13,0xff0a]);
 const words=d=>Array.isArray(d)&&d.length===32&&d.every(n=>Number.isInteger(n)&&n>=0&&n<=65535);
 let ws=null,active=false,inSession=false,joined=false,deviceStarted=false,batched=false;
 let sequence=0,expected=0,nextAck=1,timer=null,startTimer=null,lastReceive=0,pingLimit=30000,lastTick=0,resumeUntil=0,lastPing=0,lastPong=0,log=null,gameClosed=false;
 let queued=0,scheduled=false;
 let roomCode='';
 const displaySession=phase=>hooks.session?.(phase?{phase,room:roomCode}:null);
 const buffered=new Map(),seen=new Set(),inFlight=new Map(),outgoing=[];
 const note=(kind,detail)=>celioDiagnostics.event(log,kind,detail);
 const report=s=>hooks.status(s);
 function wire(s){if(ws?.readyState!==1)throw Error('通信回線が開いていません');if(ws.bufferedAmount>262144)throw Error('回線が遅いため通信を中止しました');ws.send(s);}
 function disconnect(message='通信を終了しました。',error=false){
  note('connection_summary',{receiveIdleMs:Date.now()-lastReceive,pingIdleMs:lastPing?Date.now()-lastPing:null,pongIdleMs:lastPong?Date.now()-lastPong:null,pingLimit,expectedSequence:expected,bufferedPackets:buffered.size,pendingAcks:inFlight.size,gameClosed,hidden:!!globalThis.document?.hidden});
  clearInterval(timer);clearTimeout(startTimer);timer=startTimer=null;
  for(const req of inFlight.values())clearTimeout(req.timer);inFlight.clear();outgoing.length=0;queued=0;scheduled=false;
  if(ws){const old=ws;ws=null;old.onclose=old.onmessage=old.onerror=null;try{if(old.readyState===1)old.send('42["sessionLeft"]');old.close();}catch{}}
  if(active)M._link_disable();active=inSession=deviceStarted=false;buffered.clear();seen.clear();
  note('end',{reason:message,error});celioDiagnostics.finish(log,message,error);
  roomCode='';displaySession(null);hooks.active(false);report(message+(error?(celioDiagnostics.storageOK?' 通信ログを記録しました。':' 通信ログはメモリ内にあります。閉じる前に保存してください。'):''));
 }
 function fail(message){disconnect(message,true);}
 function startDevice(){
  if(deviceStarted){note('duplicate_join_ignored');return;}
  deviceStarted=true;note('device_start');M._link_command(1);
  startTimer=setTimeout(()=>{startTimer=null;if(active){M._link_command(0);note('mode_request');}},500);
 }
 function schedule(){if(scheduled||!active)return;scheduled=true;Promise.resolve().then(()=>{scheduled=false;if(active)try{flush();}catch(e){fail(e.message);}});}
 function transmit(id,req){
  wire(req.text);req.attempt++;
  req.timer=setTimeout(()=>{if(!active||!inFlight.has(id))return;if(req.attempt>=6){fail('通信の受信確認が届きません');return;}note('retry',{ack:id,attempt:req.attempt+1});try{transmit(id,req);}catch(e){fail(e.message);}},1000+(req.attempt-1)*100);
 }
 function flush(){
  while(outgoing.length&&inFlight.size<64){
   const first=outgoing.shift();let payload=first.value,count=1;
   if(first.name==='deviceData'){payload=[payload];while(payload.length<32&&outgoing[0]?.name==='deviceData'){payload.push(outgoing.shift().value);count++;}}
   if(nextAck>1e9)throw Error('通信番号の上限に達しました');
   const id=nextAck++,req={text:'42'+id+JSON.stringify([first.name,payload]),count,attempt:0,timer:null};inFlight.set(id,req);transmit(id,req);
  }
 }
 function emit(name,value){
  // Legacy relay handlers require a single object and no ACK callback.
  if(!batched){wire('42'+JSON.stringify([name,value]));return;}
  if(queued>=1024)throw Error('通信の送信待ちがいっぱいです');outgoing.push({name,value});queued++;schedule();
 }
 function acknowledge(id){if(id!==null)wire('43'+id+'[true]');}
 function modern(){if(!batched){batched=true;note('protocol',{mode:'batched-ack'});}}
 function deliver(data){
  const p=M._malloc(64);if(!p)throw Error('通信メモリ不足');
  try{M.HEAPU16.set(data,p/2);if(!M._link_receive(p,32))throw Error('通信バッファがいっぱいです');}finally{M._free(p);}
  if(log)log.received++;
 }
 function event(name,payload,id){
  if(!inSession)throw Error('部屋への参加前に通信を受信しました');
  if(name==='deviceData'){
   const packets=Array.isArray(payload)?payload:[payload];
   if(!packets.length||packets.length>1024||!packets.every(p=>p&&Number.isSafeInteger(p.sequence)&&p.sequence>=0&&p.sequence<Number.MAX_SAFE_INTEGER&&words(p.data)))throw Error('通信データの形式が違います');
   if(Array.isArray(payload))modern();
   for(const packet of packets){
    const n=packet.sequence;if(n<expected)continue;
    if(n>expected){if(n-expected>1024||buffered.size>=1024)throw Error('通信順序の同期が取れません');buffered.set(n,packet.data);continue;}
    deliver(packet.data);expected++;while(buffered.has(expected)){deliver(buffered.get(expected));buffered.delete(expected++);}
   }
   acknowledge(id);
  }else if(name==='deviceCommand'){
   if(!payload||!commands.has(payload.command)||typeof payload.uuid!=='string'||!payload.uuid.length||payload.uuid.length>128)throw Error('通信コマンドが不正です');
   if(id!==null)modern();
   if(!seen.has(payload.uuid)){if(seen.size>=4096)throw Error('通信コマンドが多すぎます');seen.add(payload.uuid);note('command',{command:payload.command});M._link_command(payload.command);}
   acknowledge(id);
  }else if(name==='partnerJoined'){
   startDevice();acknowledge(id);displaySession('connected');report('相手が参加しました。両者ともゲーム内の通信受付へ進んでください。');
  }else if(name==='partnerLeft'){
   acknowledge(id);fail('相手が退出しました。部屋を作り直してください。');
  }else if(name==='sessionClose'){
   note('session_close',{gameClosed,outcome:'unknown'});acknowledge(id);disconnect('通信セッションが終了しました。ゲーム内の結果を確認してください。',!gameClosed);
  }else note('unknown_event',{name:String(name).slice(0,50)});
 }
 function packet(message,room){
  if(typeof message!=='string'||message.length>262144)throw Error('通信パケットが不正です');lastReceive=Date.now();
  if(message[0]==='0'){const open=JSON.parse(message.slice(1));const interval=Number.isFinite(open.pingInterval)&&open.pingInterval>0?open.pingInterval:25000,timeout=Number.isFinite(open.pingTimeout)&&open.pingTimeout>0?open.pingTimeout:5000;pingLimit=Math.max(30000,interval+timeout+5000);note('engine_open',{pingInterval:interval,pingTimeout:timeout,pingLimit});wire('40'+JSON.stringify({clientId:crypto.randomUUID()}));return;}
  if(message[0]==='2'){lastPing=Date.now();wire('3'+message.slice(1));lastPong=Date.now();if(log)log.heartbeats=(log.heartbeats||0)+1;return;}
  if(message[0]==='1'){fail('サーバーとの接続が終了しました。');return;}
  const m=message.match(/^4([0-4])(\d*)(.*)$/s);if(!m)return;
  const type=m[1],id=m[2]?Number(m[2]):null;
  if(id!==null&&(!Number.isSafeInteger(id)||id>1e9))throw Error('受信確認番号が不正です');
  if(type==='0'){if(!joined){joined=true;note('room_request');wire('420'+JSON.stringify(room?['sessionJoin',room]:['sessionCreate',null]));}return;}
  if(type==='1'||type==='4'){fail('中継サーバーに接続できませんでした。');return;}
  const data=m[3]?JSON.parse(m[3]):[];if(!Array.isArray(data))throw Error('通信イベントが不正です');
  if(type==='3'&&id===0){
   if(inSession)return;
   const result=data[0];if(!result||result.variant!=='Ok')throw Error(result?.error==='Session is full'?'部屋が満員です':result?.error==='Session not found'?'部屋が見つかりません':'部屋への接続に失敗しました');
   const session=result.value||result.data||result,code=session.id;
   if(!/^\d{4}$/.test(String(code)))throw Error('部屋番号を取得できません');
   inSession=true;roomCode=String(code);displaySession(room?'connected':'waiting');note('room_joined');report('部屋番号：'+String(code)+'\n'+(room?'参加しました。ゲーム内の通信受付へ進んでください。':'相手に番号を伝えてください。'));if(room)startDevice();
  }else if(type==='3'&&inFlight.has(id)){
   if(data.length!==1||data[0]!==true)throw Error('通信データが中継サーバーに拒否されました');
   const req=inFlight.get(id);clearTimeout(req.timer);inFlight.delete(id);queued-=req.count;schedule();
  }else if(type==='2')event(data[0],data[1],id);
 }
 function pump(){
  if(!active||!inSession)return;
  try{for(let i=0;i<256;i++){
   const p=M._link_event();if(!p)break;const v=M.HEAPU16.subarray(p/2,p/2+34);
   if(v[0]===3)throw Error('通信処理が追いつきません。部屋に入り直してください。');
   if(v[0]===1){note('device_status',{status:v[1]});if(v[1]===0xff07)gameClosed=true;emit('deviceStatus',{uuid:crypto.randomUUID(),linkStatus:v[1]});if(v[1]===0xff05){displaySession('connected');report('通信中 · ゲーム内で対戦・交換を操作してください。');}}
   else if(v[0]===2){if(v[1]!==32)throw Error('通信データの長さが不正です');emit('deviceData',{sequence:sequence++,data:Array.from(v.subarray(2,34))});if(log)log.sent++;}
  }}catch(e){fail(e.message);}
 }
 function heartbeat(){
  if(!active)return;
  const now=Date.now(),gap=now-lastTick;lastTick=now;
  // A suspended/busy browser may run timers before queued WebSocket messages.
  // Give those messages one bounded recovery window instead of closing at once.
  if(gap>2000){resumeUntil=now+5000;note('event_loop_delay',{gapMs:gap,receiveIdleMs:now-lastReceive,hidden:!!globalThis.document?.hidden});}
  if(now-lastReceive>pingLimit&&now>=resumeUntil){fail('サーバーからの受信が途絶えました。');return;}
  pump();
 }
 function start(room=''){
  if(room&&!/^\d{4}$/.test(room)){report('部屋番号は4桁の数字です。');return false;}
  disconnect('接続準備中…');log=celioDiagnostics.begin(room?'guest':'host');note('protocol',{mode:'legacy'});
  if(!M._link_enable()){fail('先にROMを開いてください。');return false;}
  active=true;joined=inSession=deviceStarted=batched=gameClosed=false;sequence=expected=0;nextAck=1;pingLimit=30000;lastReceive=lastTick=Date.now();resumeUntil=lastPing=lastPong=0;hooks.active(true);displaySession('connecting');report('Celio中継サーバーに接続中…');
  try{const socket=ws=new WebSocket(endpoint);
   socket.onmessage=e=>{if(ws!==socket)return;try{packet(e.data,room);}catch(err){fail(err instanceof SyntaxError?'通信メッセージを解析できません':err.message);}};
   socket.onerror=()=>{if(ws===socket)fail('中継サーバーに接続できません。回線・サーバーの状態をご確認ください。');};
   socket.onclose=e=>{if(ws!==socket)return;note('socket_close',{code:e?.code,clean:!!e?.wasClean});fail('接続が切れました。部屋に入り直してください。');};
   timer=setInterval(heartbeat,50);
  }catch(err){fail('接続できません：'+err.message);return false;}return true;
 }
 return {start,disconnect,pump,get active(){return active;}};
}
