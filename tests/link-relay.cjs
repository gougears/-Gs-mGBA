const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function fixture(){
 const sockets=[],commands=[],received=[],messages=[],events=[];let next=1;const timers=new Map();
 class WS{constructor(){this.readyState=1;this.bufferedAmount=0;this.sent=[];sockets.push(this);}send(x){this.sent.push(x);}close(){this.readyState=3;}receive(x){this.onmessage?.({data:x});}}
 const heap=new Uint16Array(1024),M={HEAPU16:heap,_malloc:()=>128,_free(){},_link_enable:()=>1,_link_disable(){},_link_command:c=>commands.push(c),_link_receive:(p,n)=>{received.push(Array.from(heap.slice(p/2,p/2+n)));return 1;},_link_event:()=>{if(!events.length)return 0;heap.set(events.shift(),128);return 256;}};
 const ctx=vm.createContext({WebSocket:WS,crypto:{randomUUID:()=>String(next++)},localStorage:{getItem:()=>null,setItem(){}},document:{hidden:false},Date,console,setTimeout:(f)=>{const id=next++;timers.set(id,f);return id;},clearTimeout:id=>timers.delete(id),setInterval:()=>next++,clearInterval(){}});
 vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../docs/link.js'),'utf8'),ctx);
 const link=ctx.createCelioLink(M,{status:s=>messages.push(s),active(){}});
 const frame=(name,payload,id=10)=>'42'+id+JSON.stringify([name,payload]);
 function connect(format='relay51',early=false){link.start('',format);const ws=sockets.at(-1);ws.receive('0{"pingInterval":25000,"pingTimeout":5000}');ws.receive('40{}');if(early)ws.receive(frame('partyReady',null,8));ws.receive('430[{"variant":"Ok","value":{"id":"1234","playerCount":2}}]');return ws;}
 function command(ws,seat=0,count=2){ws.receive(frame('deviceCommand',{command:16,uuid:'role',args:{playerCount:count,playerIndex:seat}},11));}
 return {link,sockets,commands,received,messages,events,connect,command,frame};
}
const packet=(seat,words)=>{const bytes=[];for(let c=0;c<3;c++){bytes.push(seat);for(let j=0;j<8;j++){const w=words[c*8+j]||0;bytes.push(w&255,w>>>8);}}return bytes;};
(async()=>{
 const f=fixture(),ws=f.connect('relay51',true);assert(ws.sent.includes('420["sessionCreate",2]'));assert(ws.sent.includes('438[true]'));f.command(ws,0);assert.equal(f.commands.at(-1),17);
 ws.receive(f.frame('deviceCommand',{command:19,uuid:'connect'},12));assert.equal(f.commands.at(-1),17,'seat 0 must not initiate slave handshake');
 const a=Array.from({length:24},(_,i)=>0xab00+i),b=Array.from({length:24},(_,i)=>i+1);
 ws.receive(f.frame('deviceData',[{sequence:1,data:packet(1,b)}],13));assert.equal(f.received.length,0);
 ws.receive(f.frame('deviceData',[{sequence:0,data:packet(1,a)}],14));assert.equal(f.received.length,2);assert.deepEqual(f.received[0].slice(0,24),a);assert.deepEqual(f.received[1].slice(0,24),b);
 ws.receive(f.frame('deviceData',[{sequence:0,data:packet(1,a)}],15));assert.equal(f.received.length,2,'duplicates not delivered');
 ws.receive(f.frame('deviceData',[{sequence:2,data:packet(0,a)}],16));assert.equal(f.received.length,2,'own seat filtered');
 const out=Array.from({length:32},(_,i)=>0xff00+i);f.events.push([2,32,...out]);f.link.pump();await Promise.resolve();
 const data=ws.sent.filter(s=>/^42\d+\["deviceData"/.test(s)).flatMap(s=>JSON.parse(s.replace(/^42\d+/,''))[1]);assert.equal(data.length,2);assert.deepEqual(data.map(p=>p.data.length),[51,51]);const decoded=data.flatMap(p=>{const v=[];for(let o=0;o<51;o+=17){assert.equal(p.data[o],0);for(let j=o+1;j<o+17;j+=2)v.push(p.data[j]|p.data[j+1]<<8);}return v;});assert.deepEqual(decoded.slice(0,32),out,'fourth command preserved');assert(decoded.slice(32).every(v=>v===0));
 const g=fixture(),w=g.connect();g.command(w,1);assert.equal(g.commands.at(-1),16);w.receive(g.frame('deviceCommand',{command:19,uuid:'connect'}));assert.equal(g.commands.at(-1),19);
 const bad=fixture(),bw=bad.connect();bad.command(bw,0,4);assert(!bad.link.active);assert(bad.messages.at(-1).includes('2人'));
 const malformed=fixture(),mw=malformed.connect();malformed.command(mw);mw.receive(malformed.frame('deviceData',[{sequence:0,data:Array(51).fill(256)}]));assert(!malformed.link.active);
 const old=fixture(),ow=old.connect('legacy32');assert(ow.sent.includes('420["sessionCreate",null]'));ow.receive(old.frame('deviceCommand',{command:16,uuid:'legacy'}));assert.equal(old.commands.at(-1),16);ow.receive(old.frame('deviceData',{sequence:0,data:out}));assert.deepEqual(old.received[0],out);
 ws.receive(f.frame('partyNotReady',null));assert(!f.link.active);
 console.log('PASS relay51 creation, early ready/ACK, role mapping, handshake, LE codec, ordering/deduplication, four-command preservation, seat filtering, malformed/4-player rejection, legacy32, disconnect');
})();
