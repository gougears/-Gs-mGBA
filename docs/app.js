'use strict';
// Detect the verified PokemonSTART flash-alias predicate by structure, not version
// or address. Identical erased banks otherwise produce a false "unsupported" result.
// The shipped core implements independent flash banks 0..95 (core-probes.cjs).
// Only the execution copy is changed; files, remembered bytes and save keys stay original.
function compatibleROM(bytes){
 if(bytes.length!==67108864)return bytes;
 const ascii=(offset,n)=>String.fromCharCode(...bytes.subarray(offset,offset+n));
 if(!['PKSJ','BPRJ'].includes(ascii(0xac,4))||ascii(0x2000000,8)!=='PKSPICS1')return bytes;
 const hex=s=>Uint8Array.from(s.match(/../g),v=>parseInt(v,16));
 const predicate=hex('114a124b126810b59a4201d0002010bd20210020fff7d2ff0028f7d020211020fff7ccff0028f1d0bc2100208900fff7c5ff0028ead0bc2110208900fff7beff431e9841e3e7c0460400000a49435331');
 const helper=hex('70b50e0088b00e4d10236a46002104ac00f07bf9102322000021300000f075f9002302e00133102b07d06a46d15ce25c9142f7d0012008b070bd0020fbe7c046');
 const calls=[20,32,46,60],helperCalls=[16,28];
 const u16=p=>bytes[p]|bytes[p+1]<<8;
 const branch=p=>{const a=u16(p),b=u16(p+2);if((a&0xf800)!==0xf000||(b&0xf800)!==0xf800)return -1;let d=((a&2047)<<12)|((b&2047)<<1);if(d&0x400000)d-=0x800000;return p+4+d;};
 const matches=(at,pattern,relocations)=>{if(at<0||at+pattern.length>0x2000000)return false;for(let i=0;i<pattern.length;i++){if(relocations.some(p=>i>=p&&i<p+4))continue;if(bytes[at+i]!==pattern[i])return false;}return true;};
 let found=-1;
 for(let at=bytes.indexOf(predicate[0],0xc0);at>=0&&at<0x2000000;at=bytes.indexOf(predicate[0],at+1)){
  if(at%4||!matches(at,predicate,calls))continue;
  const target=branch(at+calls[0]);
  if(!calls.every(p=>branch(at+p)===target)||!matches(target,helper,helperCalls))continue;
  const thunk=branch(target+helperCalls[0]);
  if(thunk<0||thunk+2>0x2000000||branch(target+helperCalls[1])!==thunk||u16(thunk)!==0x4728)continue;
  const readPointer=(bytes[target+64]|bytes[target+65]<<8|bytes[target+66]<<16|bytes[target+67]<<24)>>>0;
  if(!(readPointer&1)||readPointer<0x08000001||readPointer>=0x0a000000)continue;
  if(found!==-1)return bytes; // Ambiguous code is never patched.
  found=at;
 }
 if(found<0)return bytes;
 const execution=new Uint8Array(bytes);execution.set([0x01,0x20,0x70,0x47],found);
 return execution;
}

const $=id=>document.getElementById(id),ctx=$('screen').getContext('2d',{alpha:false}),image=ctx.createImageData(240,160);
const tell=s=>{$('status').textContent=s;$('startupstatus').textContent=s;};
const defaults={rapidMode:'auto',rapidRate:8,audioMode:'recording',externalScale:100,skin:'PokeBall',direction:'dpad',quickSlot:0,rememberROM:true,keepAwake:true,volume:80,turbo:2,scale:100,layout:'standard',positions:{dpad:[0,30],ab:[100,30],l:[0,0],r:[100,0],select:[0,78],start:[100,78],home:[50,0],turbo:[50,100],rapid:[50,78],quickSave:[0,100],quickLoad:[100,100]}};
let settings=JSON.parse(JSON.stringify(defaults));try{const s=JSON.parse(localStorage.getItem('celio-settings-v4')||'null');if(s){settings.rapidMode=s.rapidMode==='hold'?'hold':'auto';settings.rapidRate=[5,8,12].includes(s.rapidRate)?s.rapidRate:8;settings.audioMode=s.audioMode==='lowlatency'?'lowlatency':'recording';settings.externalScale=[100,90,80,70].includes(s.externalScale)?s.externalScale:100;settings.keepAwake=s.keepAwake!==false;settings.rememberROM=s.rememberROM!==false;settings.direction=s.direction==='stick'?'stick':'dpad';settings.quickSlot=Number.isInteger(s.quickSlot)&&s.quickSlot>=0&&s.quickSlot<4?s.quickSlot:0;settings.skin=(s.skin==='custom'||CELIO_SKINS[s.skin])?s.skin:'PokeBall';settings.volume=Math.min(100,Math.max(0,Number(s.volume)||0));settings.turbo=[2,3,4].includes(s.turbo)?s.turbo:2;settings.scale=Math.min(115,Math.max(75,Number(s.scale)||100));settings.layout=['standard','left','compact'].includes(s.layout)?s.layout:'standard';if(s.positions?.menu&&!s.positions.select&&!s.positions.start){const [x,y]=s.positions.menu;for(const key of ['l','r'])if(s.positions[key]?.[1]===100&&s.positions[key]?.[0]===(key==='l'?0:100))s.positions[key]=[key==='l'?0:100,0];settings.positions.select=[Math.max(0,Number(x)-50),Math.min(78,Number(y))];settings.positions.start=[Math.min(100,Number(x)+50),Math.min(78,Number(y))];}for(const k of Object.keys(defaults.positions))if(Array.isArray(s.positions?.[k]))settings.positions[k]=s.positions[k].map(v=>Math.min(100,Math.max(0,Number(v)||0)));}}catch{}
function remember(){try{localStorage.setItem('celio-settings-v4',JSON.stringify(settings));}catch{tell('設定を保存できません。今回のプレイには反映します。');}}
let M,db,loaded=false,paused=false,busy=false,keys=0,speed=1,romKey='',romName='',quickNamespace='',audio,gain,muted=false,nextSound=0,last=0,acc=0,link=null;
let audioNeedsRebuild=false,audioRetryTimer,startupStarted=false,startupRequested=false,startupReady=false,externalPadConnected=false;
let linkMode='local',localLink=null,restoringROM=false,backupRunning=false;const backupTimes=new Map();
let recordingSession=null,recordingStarting=false,pendingRecording=null,recordingNoticeTimer,captureFromPad=false,captureIndex=0,captureNavDirection=null,captureNavNext=0;
let pendingSave=null,exportFile=null,exportURL=null,quickAction=null,quickCache=[],quickMode="save";
const held=new Map(),sounds=new Set(),directionResets=new Set();let toastTimer;
function gameNotice(message){tell(message);$('quickstatus').textContent=message;$('gametoast').textContent=message;$('gametoast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{$('gametoast').hidden=true;},2400);}
const players=[{M:null,loaded:false,romKey:'',romName:'',quickNamespace:''},{M:null,loaded:false,romKey:'',romName:'',quickNamespace:''}];let activePlayer=0;
function capturePlayer(){Object.assign(players[activePlayer],{M,loaded,romKey,romName,quickNamespace});}
function playerUI(){
 $('playerlabel').textContent='P'+(activePlayer+1);$('playerlabel').disabled=linkMode!=='local'||!players[1-activePlayer].loaded;$('playerlabel').setAttribute('aria-label','プレイヤー'+(activePlayer+1)+'：タップで切替');$('romversion').textContent=romName||'ROM未読込';$('romversion').title=romName||'';
 $('closeplayer2').disabled=!players[1].M;$('switchplayer').hidden=!players[1].M;$('switchplayer').textContent='プレイヤー'+(2-activePlayer)+'へ切替';
 for(let i=0;i<2;i++)$('p'+(i+1)+'info').textContent=(i+1)+'：'+(players[i].romName||'未読込');
 for(const id of ['pause','export','import','reset'])$(id).disabled=!loaded||!!link?.active&&['import','reset'].includes(id);
 $('empty').hidden=loaded;$('rom').disabled=!M||restoringROM;$('firstrom').disabled=!M||restoringROM;$('secondrom').disabled=restoringROM;
}
async function selectPlayer(i){
 if(busy||i===activePlayer)return;if(linkMode==='online')link?.disconnect('プレイヤー切替のためオンライン通信を終了しました。');
 closeSavePanel();cancelQuick();persist();capturePlayer();clearKeys();flushAudio();busy=true;
 try{if(!players[i].M)players[i].M=await createCelio({print:()=>{},printErr:()=>{}});
 activePlayer=i;({M,loaded,romKey,romName,quickNamespace}=players[i]);if(linkMode==='online')link=createCelioLink(M,linkHooks);last=0;acc=0;
 playerUI();if(loaded)paint();else ctx.clearRect(0,0,240,160);
 quickCache=[];tell('プレイヤー'+(i+1)+'を操作中。'+(loaded?'':'ROMを開いてください。'));
 }catch(e){tell('切り替えられません：'+e.message);}finally{busy=false;}
}
async function persistBoth(){capturePlayer();for(const p of players){if(!p.loaded)continue;const n=p.M._save_size();if(!n)continue;const data=p.M.HEAPU8.slice(p.M._save_ptr(),p.M._save_ptr()+n);try{await dbOp('saves','put',p.romKey,data);}catch(e){tell(e.message);}}}
$('playerlabel').onclick=async()=>{if(linkMode==='local'&&players[1-activePlayer].loaded&&!busy)await selectPlayer(1-activePlayer);};
$('switchplayer').onclick=async()=>{await selectPlayer(1-activePlayer);closeSettings();};
$('selectp1').onclick=async()=>{await selectPlayer(0);if(loaded)closeSettings();};
$('selectp2').onclick=async()=>{await selectPlayer(1);if(loaded)closeSettings();};
const dbReady=new Promise(resolve=>{let done=false;const finish=()=>{if(!done){done=true;clearTimeout(timeout);resolve();}};const timeout=setTimeout(finish,5000);try{const r=indexedDB.open('celio-local-saves-v1',3);r.onupgradeneeded=()=>{for(const name of ['saves','quick','roms','backups'])if(!r.result.objectStoreNames.contains(name))r.result.createObjectStore(name);};r.onsuccess=()=>{db=r.result;db.onversionchange=()=>{db.close();db=null;};finish();};r.onerror=finish;r.onblocked=()=>{tell('他のタブを閉じると端末内保存を更新できます。');finish();};}catch{finish();}});
async function dbOp(store,mode,key,value){await dbReady;if(!db)throw Error('端末内保存が使えません。Safariで開くか、他のタブを閉じてください。');return new Promise((resolve,reject)=>{let result;try{const tx=db.transaction(store,mode==='get'?'readonly':'readwrite'),os=tx.objectStore(store);const r=mode==='get'?os.get(key):mode==='put'?os.put(value,key):os.delete(key);r.onsuccess=()=>{result=r.result;};tx.oncomplete=()=>resolve(result);tx.onabort=tx.onerror=()=>reject(tx.error||Error('端末内保存に失敗しました'));}catch(e){reject(e);}});}
function snapshot(){if(!loaded)return null;const n=M._save_size();return n?M.HEAPU8.slice(M._save_ptr(),M._save_ptr()+n):null;}
async function persist(){const key=romKey,data=snapshot();if(!key||!data)return;try{await dbOp('saves','put',key,data);}catch(e){tell(e.message+' .savを書き出して保管してください。');}}
function alloc(bytes,fn){const p=M._malloc(bytes.length);if(!p)throw Error('メモリが不足しています');try{M.HEAPU8.set(bytes,p);return fn(p,bytes.length);}finally{M._free(p);}}
function paint(){if(!loaded)return;const p=M._video();image.data.set(M.HEAPU8.subarray(p,p+153600));for(let i=3;i<image.data.length;i+=4)image.data[i]=255;ctx.putImageData(image,0,0);if(recordingSession&&!recordingSession.stopping)drawCaptureFrame(recordingSession.capture);}
function audioLabel(message){$('audiostatus').textContent=message||('音量 '+settings.volume+'% · '+(audio?.state==='running'?'音声エンジン動作中':'「音声を開始・再開」を押してください。'));}
function flushAudio(){for(const s of sounds){try{s.stop();s.disconnect();}catch{}}sounds.clear();nextSound=0;}
function updateGain(){if(gain&&audio)gain.gain.setTargetAtTime(muted?0:settings.volume/100,audio.currentTime,.01);audioLabel();}
function retireAudio(){
 if(recordingSession)stopGameRecording('音声の再接続のため録画を終了しました。');
 flushAudio();const old=audio;audio=null;gain=null;
 if(old){old.onstatechange=null;try{old.close?.().catch(()=>{});}catch{}}
}
async function audioStart(force=false){
 if(!startupStarted&&!startupRequested)return;
 requestWakeLock();let current;
 try{
  if(force){muted=false;audioNeedsRebuild=true;}
  if(audioNeedsRebuild||audio?.state==='closed'){audioNeedsRebuild=false;retireAudio();}
  if(!audio){
   try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch{}
   audio=new(window.AudioContext||window.webkitAudioContext)({latencyHint:settings.audioMode==='recording'?'playback':'interactive'});
   gain=audio.createGain();gain.connect(audio.destination);
   const owner=audio;owner.onstatechange=()=>{if(owner!==audio)return;if(owner.state==='interrupted'){audioNeedsRebuild=true;flushAudio();}audioLabel();};
  }
  current=audio;
  clearTimeout(audioRetryTimer);audioRetryTimer=setTimeout(()=>{if(audio===current&&current.state!=='running'&&!document.hidden){audioNeedsRebuild=true;gameNotice('音声を再開するにはゲーム画面をタップしてください');}},800);
  if(current.state!=='running'){await current.resume();if(current!==audio)return;nextSound=0;}
  updateGain();
  if(current.state!=='running')audioLabel('ゲーム画面をタップすると音声を再開します。');
 }catch(e){if(!current||current===audio)audioLabel('音声を開始できません：'+e.message);}
}
function scheduleAudioTime(now,duration){
 const lead=settings.audioMode==='recording'?.08:.025;
 if(nextSound>now+lead+.16)return null;
 const start=nextSound>now+.002?nextSound:now+lead;nextSound=start+duration;return start;
}
function consumeAudio(){const n=M._audio_read();if(!audio||audio.state!=='running'||paused||muted||settings.volume===0||!n)return;const scheduled=scheduleAudioTime(audio.currentTime,n/M._audio_rate()/speed);if(scheduled===null)return;const a=M.HEAP16.subarray(M._audio_ptr()/2,M._audio_ptr()/2+n*2),b=audio.createBuffer(2,n,M._audio_rate());for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=a[2*i+ch]/32768;}const s=audio.createBufferSource();s.buffer=b;s.playbackRate.value=speed;s.connect(gain);sounds.add(s);s.onended=()=>{sounds.delete(s);s.disconnect();};s.start(scheduled);}
function clearKeys(){stopRapid();for(const reset of directionResets)reset();held.clear();keys=0;document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
function pause(value){paused=value||!startupStarted;$('pauseoverlay').hidden=!paused||!loaded;last=0;acc=0;clearKeys();$('pause').textContent=paused?'再開':'一時停止';$('onlinepausenote').hidden=!(paused&&linkMode==='online'&&link?.active);flushAudio();if(paused){if(link?.active&&linkMode!=='online')link.disconnect('一時停止したため通信を終了しました。');persistBoth();}else audioStart();}
function updateTurboButton(button){
 if(!button)return;
 const on=speed>1;button.classList.add('turbo-state');button.classList.toggle('turbo-on',on);
 button.textContent=on?'TURBO ON · '+speed+'×':'TURBO OFF';
 button.setAttribute('aria-pressed',String(on));button.title=on?'ターボON：'+speed+'倍':'ターボOFF：1倍';
 const colors={"QuickBall": "#365f7d", "UltraBall": "#484b4c", "CherishBall": "#893742", "LuxuryBall": "#49424a", "BeastBall": "#244c72", "PokeBall": "#82404a", "LoveBall": "#94516f", "GreatBall": "#345779", "MasterBall": "#604277", "DiveBall": "#2b687d", "MoonBall": "#315467"};button.style.setProperty('--turbo-face',colors[settings.skin]||'#344455');
}
function syncTurboIndicator(){for(const button of document.querySelectorAll('.turbo-state'))updateTurboButton(button);updateTurboButton($('custom-turbo'));}
function setSpeed(n){speed=n;last=0;acc=0;flushAudio();$('speedstatus').textContent='現在の速度：'+speed+'倍';updateGain();syncTurboIndicator();}
function loop(t){requestAnimationFrame(loop);pollGamepad();const onlineHold=paused&&linkMode==='online'&&link?.active;if(!startupStarted||!loaded||(paused&&!onlineHold)||busy){last=t;return;}if(!last)last=t;acc+=Math.min(100,t-last);last=t;const dt=1000/59.7275;let count=0;try{while(acc>=dt&&count<6){for(let i=0;i<speed;i++){M._frame(onlineHold?0:rapidFrameKeys());consumeAudio();if(link?.active){link.pump();if(linkMode==='local'&&link.active){const peer=players[1-activePlayer].M;peer._frame(0);peer._audio_read();link.pump();}}}acc-=dt;count++;}if(count&&!onlineHold)paint();}catch(e){pause(true);tell('実行エラー：'+e.message);}}
function openPanel(id){if(id==='quickpanel'||id==='savepanel')selectSettingsTab('saves');if(id==='netpanel')selectSettingsTab('network');clearKeys();$('settingspanel').hidden=false;$(id).hidden=false;renderLayoutPreview();$(id).scrollIntoView({behavior:'smooth',block:'nearest'});if(externalPadConnected&&id==='settingspanel'){padNavZone='tabs';focusPadSetting($('tab-'+activeSettingsTab));}}
function closeSettings(){cancelGameRestart();closePadChoices(false);clearPadFocus();$('settingspanel').hidden=true;clearKeys();applyPositions();if(loaded&&!paused)audioStart();}
for(const b of document.querySelectorAll('[data-close]'))b.onclick=()=>{if(b.dataset.close==='settingspanel')closeSettings();else $(b.dataset.close).hidden=true;};
$('rom').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file||busy)return;audioStart();busy=true;try{if(!/\.(gba|bin)$/i.test(file.name))throw Error('.gbaファイルを選んでください。ZIPは先に解凍してください');if(file.size<192||file.size>67108864||(file.size>33554432&&file.size!==67108864))throw Error('ROMは32MiB以下、またはちょうど64MiBにしてください');link?.disconnect('ROM変更のため未接続');closeSavePanel();cancelQuick();tell('ROMを端末内で読み込み中…');await persist();const bytes=e.rememberedBytes||new Uint8Array(await file.arrayBuffer());const digest=/^[a-f0-9]{64}$/.test(e.rememberedDigest||'')?e.rememberedDigest:Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');const key=digest+(activePlayer===1?':player2':'');loaded=false;if(!alloc(compatibleROM(bytes),(p,n)=>M._start(p,n)))throw Error('ROMを起動できません');loaded=true;romKey=key;romName=file.name;quickNamespace='name:'+activePlayer+':'+normalizedROMName(romName);await migrateNamedQuick(bytes);let saved;try{saved=await dbOp('saves','get',key);}catch{}if(saved&&!alloc(new Uint8Array(saved),(p,n)=>M._restore(p,n)))throw Error('端末内セーブを復元できません');M._reset_game();if(settings.rememberROM&&!restoringROM){try{await dbOp('roms','put',activePlayer,{name:file.name,bytes,digest});$('rommemorystatus').textContent='プレイヤー'+(activePlayer+1)+'のROMを端末内に記憶しました。';}catch(e){$('rommemorystatus').textContent='ROMを記憶できません：'+e.message;}}backupTimes.set(key,Date.now());$('empty').hidden=true;for(const id of ['pause','export','import','reset'])$(id).disabled=false;pause(false);capturePlayer();playerUI();quickCache=[];closeSettings();tell('プレイヤー'+(activePlayer+1)+' · '+file.name+' · '+(saved?'端末内セーブを復元':'実行中')+' · ROM送信なし');}catch(err){tell(err.message);selectSettingsTab('rom');openPanel('settingspanel');}finally{busy=false;capturePlayer();playerUI();}};
$('firstrom').onchange=e=>$('rom').onchange(e);
$('secondrom').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file||busy)return;audioStart();if(link?.active)link.disconnect('ROM変更のため通信を終了しました。');await selectPlayer(1);if(activePlayer===1)await $('rom').onchange({target:{files:[file],value:''}});};
$('pause').onclick=()=>{if(busy||!loaded)return;pause(!paused);if(paused)closeSettings();};
$('pauseoverlay').onclick=()=>{if(!loaded||!paused||busy||!$('settingspanel').hidden)return;pause(false);};
function toggleTurbo(){if(link?.active)return gameNotice('通信中は1倍速で動作します。');setSpeed(speed===1?settings.turbo:1);}
$('audiomode').onchange=e=>{settings.audioMode=e.target.value==='lowlatency'?'lowlatency':'recording';remember();audioNeedsRebuild=true;audioStart();};
$('soundtest').onclick=()=>{if(settings.volume===0){settings.volume=80;syncSettings();remember();}audioStart(true);};
function closeSavePanel(){pendingSave=null;exportFile=null;if(exportURL)URL.revokeObjectURL(exportURL);exportURL=null;$('savepanel').hidden=true;$('applysave').hidden=true;$('applysave').disabled=false;}
function savePanel(message){$('saveinfo').textContent=message;openPanel('savepanel');}
$('cancelsave').onclick=closeSavePanel;
$('export').onclick=()=>exportSave(false);
async function exportSave(fromPad=false){
 try{
  if(!loaded||busy)return tell('先にROMを開いてください。');
  const bytes=snapshot();if(!bytes)return tell('セーブがまだありません。ゲーム内でレポートを書いてからお試しください。');
  const name=romName.replace(/\.[^.]+$/,'')+(activePlayer===1?'_P2':'')+'.sav';
  const file=new File([bytes],name,{type:'application/octet-stream'});
  if(fromPad){downloadLocalFile(file);gameNotice('セーブファイルのダウンロードを開始しました。ブラウザのダウンロード一覧をご確認ください。');
  }else if(typeof window.showSaveFilePicker==='function'){
   const handle=await window.showSaveFilePicker({suggestedName:name,types:[{description:'GBAセーブ',accept:{'application/octet-stream':['.sav']}}]});
   const writer=await handle.createWritable();await writer.write(file);await writer.close();tell(name+' をファイルに保存しました。');
  }else if(navigator.canShare?.({files:[file]})){
   tell('開いたメニューで「ファイルに保存」を選んでください。');
   await navigator.share({files:[file]});tell('保存操作が終了しました。「ファイル」アプリで保存先をご確認ください。');
  }else{
   const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
   tell('ファイル保存を開始しました。ブラウザの保存先をご確認ください。');
  }
  persist();
 }catch(e){tell(e.name==='AbortError'?'ファイル保存をキャンセルしました。':'ファイルに保存できません：'+e.message);}
}
$('import').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 if(!loaded||busy)return gameNotice('先に対応するROMを開いてください。');
 if(link?.active)return gameNotice('通信を終了してから読み込んでください。');
 if(!/\.sav$/i.test(file.name))return gameNotice('.savファイルを選んでください。');
 // mGBA may append a 16-byte RTC footer. Pass it intact to the core.
 if(![512,8192,32768,65536,131072,1048576,6291456].some(size=>file.size===size||file.size===size+16))return gameNotice('対応していないセーブサイズです：'+file.size.toLocaleString()+' バイト');
 audioStart();const wasPaused=paused;closeSavePanel();pause(true);busy=true;
 try{pendingSave=new Uint8Array(await file.arrayBuffer());}
 catch(e){gameNotice('ファイルを開けません：'+e.message);pause(wasPaused);}
 finally{busy=false;}
 if(pendingSave)await $('applysave').onclick();
};
$('applysave').onclick=async()=>{if(!pendingSave||!loaded||busy)return;busy=true;$('applysave').disabled=true;try{await persist();if(!alloc(pendingSave,(p,n)=>M._restore(p,n)))throw Error('セーブを取り込めませんでした');M._reset_game();await persist();closeSavePanel();pause(false);closeSettings();gameNotice('セーブを反映しました。ゲームの「つづきから」を選んでください。');}catch(e){gameNotice('読み込み失敗：'+e.message);savePanel('読み込みを完了できませんでした。再度お試しください。');$('applysave').hidden=false;$('applysave').disabled=false;}finally{busy=false;}};
let pendingRestart=null;
function cancelGameRestart(){pendingRestart=null;for(const id of ['reset'])$(id+'-confirm').hidden=true;}
function requestGameRestart(id='reset'){
 if(!loaded||busy)return;
 if(link?.active)return gameNotice('通信を終了してからゲームを再起動してください。');
 audioStart();cancelGameRestart();pendingRestart={target:M,key:romKey,id};
 $(id+'-confirm').hidden=false;
 if(externalPadConnected){padNavZone='content';focusPadSetting($(id+'-yes'));}
}
async function confirmGameRestart(){
 const pending=pendingRestart;if(!pending)return;
 cancelGameRestart();
 if(!loaded||busy||M!==pending.target||romKey!==pending.key||link?.active)return;
 busy=true;clearKeys();flushAudio();
 try{await persist();M._reset_game();pause(false);closeSettings();gameNotice('ゲームを再起動しました。');}
 catch(e){gameNotice('再起動できませんでした：'+e.message);}
 finally{busy=false;last=0;acc=0;capturePlayer();playerUI();}
}
for(const id of ['reset']){
 $(id).onclick=()=>requestGameRestart(id);
 $(id+'-yes').onclick=confirmGameRestart;
 $(id+'-no').onclick=()=>{cancelGameRestart();if(externalPadConnected)focusPadSetting($(id));};
}
let rapidArmed=false,rapidMask=0,rapidBaseline=0;
function stopRapid(){rapidArmed=false;rapidMask=0;rapidBaseline=0;syncRapidStatus();}
function syncRapidStatus(){const message=rapidArmed?'連射するボタンを押してください':rapidMask?'連射ON · '+(settings.rapidMode==='auto'?'自動':'押している間'):'連射OFF';$('rapidstatus').textContent=message;$('rapidbutton').textContent=rapidArmed?'連射選択中':rapidMask?'連射ON':'連射';$('rapidbutton').setAttribute('aria-pressed',String(rapidArmed||!!rapidMask));}
function toggleRapid(){if(rapidArmed||rapidMask){stopRapid();return;}if(!loaded||paused||busy)return gameNotice('ゲームを再開してから連射を設定してください。');rapidArmed=true;rapidBaseline=keys;syncRapidStatus();gameNotice('連射したいボタンを押してください。');}
function rapidFrameKeys(now=Date.now()){if(!rapidMask)return keys;const active=settings.rapidMode==='auto'?rapidMask:rapidMask&keys;return (keys&~rapidMask)|((Math.floor(now*settings.rapidRate*2/1000)%2===0)?active:0);}
function updateKeys(){keys=0;for(const v of held.values())for(const k of (Array.isArray(v)?v:[v]))keys|=1<<k;if(rapidArmed){rapidBaseline&=keys;const picked=keys&~rapidBaseline;if(picked){rapidMask=picked&-picked;rapidArmed=false;syncRapidStatus();}}}
$('rapidbutton').onclick=toggleRapid;$('rapidstop').onclick=stopRapid;
$('rapidmode').onchange=e=>{settings.rapidMode=e.target.value==='hold'?'hold':'auto';stopRapid();remember();};$('rapidrate').onchange=e=>{settings.rapidRate=[5,8,12].includes(+e.target.value)?+e.target.value:8;remember();};

// Stick uses cardinal sectors; d-pad uses only its four visible rectangular arms.
function cardinalDirection(x,y,previous=null){
 if(Math.hypot(x,y)<.14)return null;
 if(previous===4||previous===5){if(Math.abs(y)<=Math.abs(x)*1.3)return x<0?5:4;}
 if(previous===6||previous===7){if(Math.abs(x)<=Math.abs(y)*1.3)return y<0?6:7;}
 return Math.abs(y)>=Math.abs(x)?(y<0?6:7):(x<0?5:4);
}
function dpadDirection(x,y){
 if(x < -1||x > 1||y < -1||y > 1)return null;
 if(Math.abs(x)<=1/3){if(y < -1/3)return 6;if(y > 1/3)return 7;}
 if(Math.abs(y)<=1/3){if(x < -1/3)return 5;if(x > 1/3)return 4;}
 return null;
}
function bindDirection(b,stick=false){
 let pointer=null,lastDirection=null;const knob=stick?document.createElement('span'):null;
 if(knob){knob.className='stick-knob';b.append(knob);}
 else {b.classList.add('cross-direction');for(const [key,label,cell] of [[6,'上','up'],[7,'下','down'],[5,'左','left'],[4,'右','right']]){
  const arm=document.createElement('button');arm.className='direction-arm '+cell;arm.setAttribute('aria-label',label);arm.dataset.arm=String(key);b.append(arm);
  arm.addEventListener('keydown',e=>{if((e.code==='Space'||e.code==='Enter')&&loaded&&!paused&&!busy){e.preventDefault();held.set('arm'+key,key);updateKeys();}});
  arm.addEventListener('keyup',()=>{held.delete('arm'+key);updateKeys();});arm.addEventListener('blur',()=>{held.delete('arm'+key);updateKeys();});
 }}
 const reset=()=>{if(pointer!==null)held.delete(pointer);pointer=null;lastDirection=null;b.classList.remove('held');b.dataset.direction='';if(knob)knob.style.transform='translate(-50%,-50%)';updateKeys();};directionResets.add(reset);
 const move=e=>{const r=b.getBoundingClientRect(),x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);lastDirection=stick?cardinalDirection(x,y,lastDirection):dpadDirection(x,y);held.set(e.pointerId,lastDirection===null?[]:[lastDirection]);b.dataset.direction=lastDirection===null?'':String(lastDirection);updateKeys();
  if(knob){const length=Math.hypot(x,y),factor=length>1?1/length:1;knob.style.transform='translate(calc(-50% + '+(x*factor*r.width*.28)+'px),calc(-50% + '+(y*factor*r.height*.28)+'px))';}
 };
 b.addEventListener('pointerdown',e=>{e.preventDefault();if(pointer!==null||!loaded||paused||busy)return;audioStart();pointer=e.pointerId;lastDirection=null;b.setPointerCapture(pointer);move(e);if(stick)b.classList.add('held');});
 b.addEventListener('pointermove',e=>{if(pointer===e.pointerId){e.preventDefault();move(e);}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(ev,e=>{if(pointer===e.pointerId)reset();});
 b.addEventListener('contextmenu',e=>e.preventDefault());
}
function externalDisplay(){return externalPadConnected&&!!window.matchMedia?.('(orientation: landscape)').matches;}
function updateExternalDisplay(){
 $('settingspanel').classList.toggle('controller-settings',externalPadConnected);
 const enabled=externalDisplay();$('player').classList.toggle('external-display',enabled);$('player').dataset.externalScale=String(settings.externalScale);
 if(!enabled)$('externalmenu').hidden=true;
}
$('externalscale').onchange=e=>{settings.externalScale=[100,90,80,70].includes(+e.target.value)?+e.target.value:100;updateExternalDisplay();remember();};
$('externalmenu').onclick=()=>{$('externalmenu').hidden=true;$('settingsopen').onclick();};
$('screen').onclick=()=>{if(externalDisplay()&&startupStarted&&!paused)$('externalmenu').hidden=!$('externalmenu').hidden;};
function landscapeSkin(){return settings.skin!=='custom'&&!!window.matchMedia?.('(orientation: landscape)').matches;}
let portraitSkinHeight=240;
function fitSkin(){
 const area=$('padarea');
 if(settings.skin==='custom'){
  const player=$('player'),portrait=!window.matchMedia?.('(orientation: landscape)').matches;
  if(portrait){const width=player.clientWidth||area.clientWidth,padding=parseFloat(window.getComputedStyle?.(player).paddingTop||0)+parseFloat(window.getComputedStyle?.(player).paddingBottom||0);const height=Math.max(1,(player.clientHeight||10000)-padding-($('playerlabel').parentElement?.offsetHeight||44)-width*2/3);area.style.width=width+'px';area.style.height=height+'px';area.style.flex='0 0 auto';area.style.aspectRatio='';}
  else{area.style.width='';area.style.height='';area.style.flex='';area.style.aspectRatio='';}
  return;
 }
 if(landscapeSkin()){area.style.width='';area.style.height='';area.style.flex='';area.style.aspectRatio='';return;}
 const skin=CELIO_SKINS[settings.skin],player=$('player');
 const width=player.clientWidth||area.clientWidth;
 const padding=parseFloat(window.getComputedStyle?.(player).paddingTop||0)+parseFloat(window.getComputedStyle?.(player).paddingBottom||0);
 const available=(player.clientHeight||10000)-padding-($('playerlabel').parentElement?.offsetHeight||44)-width*2/3;
 const fitted=Math.max(1,Math.min(width,available*skin.size.width/skin.size.height));
 if(settings.skin!=='Cobalt'){
  const height=Math.max(1,available);portraitSkinHeight=height*320/fitted;
  area.style.width=fitted+'px';area.style.height=height+'px';area.style.flex='0 0 auto';area.style.aspectRatio='';return;
 }
 area.style.width=fitted+'px';area.style.height=(fitted*skin.size.height/skin.size.width)+'px';area.style.flex='0 0 auto';area.style.aspectRatio=skin.size.width+'/'+skin.size.height;
}
function drawSkin(){
 clearKeys();directionResets.clear();updateExternalDisplay();const area=$('padarea');$('player').classList.toggle('landscape-skin',landscapeSkin());area.querySelectorAll('.skin-art,.skin-hit').forEach(n=>n.remove());area.classList.toggle('skin-mode',settings.skin!=='custom');fitSkin();
 if(settings.skin==='custom'){
 const group=document.querySelector('.dpad');group.querySelectorAll('.direction-overlay').forEach(n=>n.remove());
 const b=document.createElement('div');b.className='direction-overlay'+(settings.direction==='stick'?' stick-control':'');b.setAttribute('aria-label',settings.direction==='stick'?'スティック':'十字キー');bindDirection(b,settings.direction==='stick');group.append(b);addScreenshotHit(area);applyPositions();return;
 }
 const base=CELIO_SKINS[settings.skin],reflow=!landscapeSkin()&&settings.skin!=='Cobalt';
 const lowerLift=0,controlDrop=Math.max(98,Math.min(portraitSkinHeight*.5-124,portraitSkinHeight-282));
 const skin=landscapeSkin()?base.landscape:reflow?{size:{width:320,height:portraitSkinHeight},items:base.items.map(item=>({...item,frame:{...item.frame,y:item.frame.y+(item.frame.y>=188?portraitSkinHeight-270-lowerLift:(!Array.isArray(item.inputs)||['a','b'].includes(item.inputs[0]))?controlDrop:0)}}))}:base,w=skin.size.width,h=skin.size.height;
 if(reflow){const rows={"quickSave": {"x": 8, "y": 3, "width": 92, "height": 28}, "toggleFastForward": {"x": 114, "y": 3, "width": 92, "height": 28}, "quickLoad": {"x": 220, "y": 3, "width": 92, "height": 28}, "l": {"x": 6, "y": 47, "width": 100, "height": 36}, "menu": {"x": 116, "y": 47, "width": 88, "height": 36}, "r": {"x": 214, "y": 47, "width": 100, "height": 36}};for(const item of skin.items){const key=Array.isArray(item.inputs)?item.inputs[0]:'';if(rows[key])item.frame={...rows[key]};else if(key==='select'||key==='start')item.frame.y=h-38;}}
 const art=document.createElement(reflow?'div':'img');art.className='skin-art';art.src='skins/'+settings.skin+(landscapeSkin()?'-landscape':'')+'.svg?v=ball50';art.alt=base.name+'のコントローラー';art.draggable=false;
 if(reflow){
  art.style.background=base.bodyColor;
  for(const [position,height] of [['top',250],['bottom',80]]){const part=document.createElement('div');part.className='skin-slice';Object.assign(part.style,{position:'absolute',left:'0',width:'100%',height:(height/h*100)+'%',backgroundImage:'url("'+art.src.replace('.svg',position==='bottom'?'-actions.svg':'-body.svg')+'")',backgroundSize:'100% auto',backgroundRepeat:'no-repeat',backgroundPosition:'left '+position});part.style[position]=position==='bottom'?(lowerLift/h*100)+'%':'0';art.append(part);}
  const controls=document.createElement('img');controls.src=art.src.replace('.svg','-controls.svg');controls.alt='';Object.assign(controls.style,{position:'absolute',left:'0',top:(controlDrop/h*100)+'%',width:'100%',height:(240/h*100)+'%'});art.append(controls);
 }
 area.append(art);
 const keymap={a:0,b:1,select:2,start:3,right:4,left:5,up:6,down:7,r:8,l:9};
 for(const item of skin.items){const b=document.createElement(Array.isArray(item.inputs)?'button':'div');b.className='skin-hit';const f=item.frame;Object.assign(b.style,{left:(f.x/w*100)+'%',top:(f.y/h*100)+'%',width:(f.width/w*100)+'%',height:(f.height/h*100)+'%'});
  const name=Array.isArray(item.inputs)?item.inputs[0]:'dpad';b.setAttribute('aria-label',({dpad:'十字キー',menu:'設定',quickSave:'クイックセーブ',quickLoad:'クイックロード',toggleFastForward:'倍速切替',rapidFire:'連射'})[name]||name.toUpperCase());
  if(name in keymap){b.dataset.key=keymap[name];if(item.inputs.length>1)b.dataset.keys=item.inputs.map(n=>keymap[n]).join(',');bindKey(b);}
  else if(name==='dpad'){
   if(settings.direction==='stick'){b.classList.add('stick-control');b.setAttribute('aria-label','スティック');}
   bindDirection(b,settings.direction==='stick');
  }else b.onclick=()=>{if(name==='menu')$('settingsopen').onclick();else if(name==='quickSave')return quickSaveSelected();else if(name==='quickLoad')return quickLoadSelected();else if(name==='rapidFire')toggleRapid();else if(name==='toggleFastForward'&&loaded)toggleTurbo();};
  if(name==='toggleFastForward')updateTurboButton(b);
  b.addEventListener('contextmenu',e=>e.preventDefault());area.append(b);
 }
 addScreenshotHit(area);
}
function bindKey(b){b.addEventListener('pointerdown',e=>{e.preventDefault();if(!loaded||paused||busy)return;audioStart();b.setPointerCapture(e.pointerId);held.set(e.pointerId,b.dataset.keys?b.dataset.keys.split(',').map(Number):+b.dataset.key);b.classList.add('held');updateKeys();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,e=>{held.delete(e.pointerId);b.classList.remove('held');updateKeys();});b.addEventListener('contextmenu',e=>e.preventDefault());}
for(const b of document.querySelectorAll('[data-key]'))if(!b.closest('.dpad'))bindKey(b);
const keyboard={ArrowUp:6,ArrowDown:7,ArrowLeft:5,ArrowRight:4,KeyX:0,KeyZ:1,KeyA:9,KeyS:8,Enter:3,ShiftLeft:2,ShiftRight:2};
addEventListener('keydown',e=>{if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target?.tagName))return;if(e.code in keyboard&&loaded&&!paused){e.preventDefault();audioStart();held.set(e.code,keyboard[e.code]);updateKeys();}});addEventListener('keyup',e=>{held.delete(e.code);updateKeys();});addEventListener('blur',clearKeys);
function normalizedROMName(name){return name.normalize('NFKC').trim().toLowerCase();}
function quickKey(i){return quickNamespace+':'+i;}
async function migrateNamedQuick(){
 const marker='celio-migrated-v1:'+quickNamespace+':'+romKey;
 try{if(localStorage.getItem(marker)==='1')return;}catch{}
 const legacy=[romKey];try{
  const old=restoringROM?null:await dbOp('roms','get',activePlayer);
  if(old?.bytes&&normalizedROMName(old.name)===normalizedROMName(romName)){
   const hash=await crypto.subtle.digest('SHA-256',old.bytes),key=Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('')+(activePlayer===1?':player2':'');if(!legacy.includes(key))legacy.push(key);
  }
  for(let i=0;i<4;i++){if(await dbOp('quick','get',quickKey(i)))continue;for(const key of legacy){const oldState=await dbOp('quick','get',key+':'+i);if(oldState){await dbOp('quick','put',quickKey(i),{...oldState,name:normalizedROMName(romName),player:activePlayer});break;}}}
  try{localStorage.setItem(marker,'1');}catch{}
 }catch(e){gameNotice('過去のクイックセーブを確認できません：'+e.message);}
}
function cancelQuick(){quickAction=null;$('quickconfirm').hidden=true;}
function showQuickConfirm(message,action){quickAction=action;$('quickquestion').textContent=message;$('quickconfirm').hidden=false;}
$('quickno').onclick=cancelQuick;$('quickyes').onclick=async()=>{const run=quickAction;cancelQuick();if(run)await run();};
async function renderSlots(){quickCache=[];$('slots').replaceChildren();if(!loaded){$('quickstatus').textContent='先にROMを開いてください。';return;}try{quickCache=await Promise.all([0,1,2,3].map(i=>dbOp('quick','get',quickKey(i))));$('quickstatus').textContent=romName;}catch(e){$('quickstatus').textContent=e.message;quickCache=[null,null,null,null];}for(let i=0;i<4;i++){const data=quickCache[i],card=document.createElement('div');card.className='slot';const title=document.createElement('strong');title.textContent='スロット '+(i+1);card.append(title);if(data?.thumb){const img=document.createElement('img');img.src=data.thumb;img.alt='スロット'+(i+1)+'の画面';card.append(img);}else{const blank=document.createElement('div');blank.className='thumbempty';blank.textContent='未保存';card.append(blank);}const meta=document.createElement('small');meta.textContent=data?new Date(data.at).toLocaleString('ja-JP'):'保存できます';card.append(meta);for(const [text,fn,disabled] of [[settings.quickSlot===i?'選択中':'この枠を使う',()=>chooseQuickSlot(i),settings.quickSlot===i],['削除',()=>requestQuickDelete(i),!data]]){const b=document.createElement('button');b.textContent=text;b.disabled=disabled||!!link?.active;b.onclick=fn;if(text==='削除')b.className='slotdelete';card.append(b);}$('slots').append(card);}}
function quickAllowed(){if(!loaded||busy){gameNotice('ROMを開き、処理が終わってから操作してください。');return false;}if(link?.active){gameNotice('通信中はクイックセーブ／ロードを使用できません。');return false;}return true;}
function requestQuickSave(i){if(!quickAllowed())return;const key=romKey,run=()=>saveQuick(i,key);if(quickCache[i])showQuickConfirm('スロット '+(i+1)+' を現在の進行で上書きしますか？',run);else run();}
async function saveQuick(i,key){if(key!==romKey||!quickAllowed())return;busy=true;clearKeys();try{const n=M._quick_size();if(!n)throw Error('状態を保存できません');const data=M.HEAPU8.slice(M._quick_ptr(),M._quick_ptr()+n);paint();const thumb=$('screen').toDataURL('image/png');await dbOp('quick','put',quickKey(i),{format:1,data,thumb,at:Date.now(),rom:romKey,name:normalizedROMName(romName),player:activePlayer});await renderSlots();gameNotice('スロット '+(i+1)+' に保存しました。');}catch(e){gameNotice('保存失敗：'+e.message);}finally{busy=false;last=0;acc=0;}}
async function loadQuick(i){
 if(!quickAllowed())return;busy=true;clearKeys();
 try{const state=await dbOp('quick','get',quickKey(i));if(!state||state.name!==normalizedROMName(romName)||state.player!==activePlayer||state.format!==1)throw Error('スロット '+(i+1)+' は未保存です');await persist();if(!alloc(new Uint8Array(state.data),(p,n)=>M._quick_load(p,n)))throw Error('状態を復元できません');flushAudio();paint();await persist();pause(false);closeSettings();gameNotice('スロット '+(i+1)+' から再開しました。');}
 catch(e){gameNotice('ロードできません：'+e.message);}finally{busy=false;last=0;acc=0;}
}
function requestQuickLoad(i){return loadQuick(i);}
function quickSaveSelected(){cancelQuick();audioStart();return saveQuick(settings.quickSlot,romKey);}
function quickLoadSelected(){cancelQuick();audioStart();return loadQuick(settings.quickSlot);}
function chooseQuickSlot(i){settings.quickSlot=i;$('quickslot').value=i;remember();quickLabels();renderSlots();}
function quickLabels(){$('quicksaveopen').textContent='クイックセーブ '+(settings.quickSlot+1);$('quickloadopen').textContent='クイックロード '+(settings.quickSlot+1);}
function requestQuickDelete(i){const key=romKey;showQuickConfirm('スロット '+(i+1)+' のクイックセーブを削除しますか？',async()=>{if(key!==romKey)return;try{await dbOp('quick','delete',quickKey(i));await renderSlots();}catch(e){$('quickstatus').textContent=e.message;}});}
async function openQuick(mode){quickMode=mode;cancelQuick();$('quicktitle').textContent='保存枠の管理';openPanel('quickpanel');await renderSlots();}
$('quicksaveopen').onclick=quickSaveSelected;$('quickloadopen').onclick=quickLoadSelected;$('quickmanage').onclick=()=>openQuick('manage');$('quickslot').onchange=e=>chooseQuickSlot(+e.target.value);
function customPadScale(){const area=$('padarea');return Math.max(.1,Math.min(area.clientWidth/320,area.clientHeight/270))*settings.scale/100;}
function applyPositions(){const area=$('padarea');if(!area.clientWidth||!area.clientHeight)return;const scale=settings.skin==='custom'?customPadScale():settings.scale/100;for(const group of document.querySelectorAll('.padgroup')){const [x,y]=settings.positions[group.dataset.group];const w=group.offsetWidth*scale,h=group.offsetHeight*scale;group.style.transform='scale('+scale+')';group.style.left=(Math.max(0,area.clientWidth-w)*x/100)+'px';group.style.top=(Math.max(0,area.clientHeight-h)*y/100)+'px';}renderLayoutPreview();}
function syncPositionInputs(){const p=settings.positions[$('positiongroup').value];$('positionx').value=p[0];$('positiony').value=p[1];renderLayoutPreview();}
function syncSettings(){$('rapidmode').value=settings.rapidMode;$('rapidrate').value=settings.rapidRate;$('audiomode').value=settings.audioMode;$('externalscale').value=settings.externalScale;$('keepawake').checked=settings.keepAwake;$('rememberrom').checked=settings.rememberROM;$('directiontype').value=settings.direction;$('quickslot').value=settings.quickSlot;quickLabels();$('skinselect').value=settings.skin;$('volume').value=settings.volume;$('volumevalue').textContent=settings.volume+'%';$('speedsetting').value=settings.turbo;$('layout').value=settings.layout;$('buttonscale').value=settings.scale;$('scalevalue').textContent=settings.scale+'%';syncPositionInputs();applyPositions();updateGain();}
function preset(name){settings.skin='custom';drawSkin();settings.layout=name;settings.positions=JSON.parse(JSON.stringify(defaults.positions));if(name==='left'){settings.positions.dpad=[100,23];settings.positions.ab=[0,30];}if(name==='compact'){settings.positions.dpad=[15,20];settings.positions.ab=[85,25];settings.scale=85;}syncSettings();remember();}
$('netshortcut').onclick=()=>openPanel('netpanel');
$('settingsopen').onclick=()=>{syncSettings();openPanel('settingspanel');};$('directiontype').onchange=e=>{settings.direction=e.target.value;drawSkin();remember();};$('skinselect').onchange=e=>{clearKeys();settings.skin=e.target.value;drawSkin();syncSettings();remember();};$('volume').oninput=e=>{settings.volume=+e.target.value;muted=false;$('volumevalue').textContent=settings.volume+'%';updateGain();remember();};$('speedsetting').onchange=e=>{settings.turbo=+e.target.value;if(speed!==1&&!link?.active)setSpeed(settings.turbo);remember();};$('layout').onchange=e=>preset(e.target.value);$('buttonscale').oninput=e=>{settings.skin='custom';drawSkin();$('skinselect').value='custom';settings.scale=+e.target.value;$('scalevalue').textContent=settings.scale+'%';applyPositions();remember();};$('positiongroup').onchange=syncPositionInputs;for(const [id,index] of [['positionx',0],['positiony',1]])$(id).oninput=e=>{settings.skin='custom';drawSkin();$('skinselect').value='custom';settings.positions[$('positiongroup').value][index]=+e.target.value;applyPositions();remember();};$('layoutreset').onclick=()=>{settings.scale=100;preset('standard');};
$('clearcache').onclick=async()=>{try{if(!('caches'in window)){ $('cachestatus').textContent='この環境ではアプリキャッシュを利用していません。セーブは保持しています。';return;}const names=await caches.keys();const own=names.filter(n=>n.startsWith('celio-'));for(const n of own)await caches.delete(n);$('cachestatus').textContent=own.length?'アプリキャッシュを削除しました。セーブと設定は保持しています。':'削除対象のアプリキャッシュはありません。セーブと設定は保持しています。';}catch(e){$('cachestatus').textContent='キャッシュを削除できません：'+e.message;}};
addEventListener('resize',()=>{drawSkin();applyPositions();});document.addEventListener('pointerdown',()=>{if(loaded&&(!paused||audioNeedsRebuild))audioStart();},{capture:true});$('screen').addEventListener('pointerdown',()=>audioStart());syncSettings();drawSkin();

function netStart(){if(linkMode!=='local')return;capturePlayer();if(busy||players.some(p=>!p.loaded))return $('netstatus').textContent='プレイヤー1・2の両方にROMを開いてください。';closeSavePanel();cancelQuick();pause(false);link.start();}
$('netcreate').onclick=netStart;$('netstop').onclick=()=>link?.disconnect();
function backgroundAudio(){if(recordingSession)stopGameRecording('画面を切り替えたため録画を終了しました。');audioNeedsRebuild=true;flushAudio();clearTimeout(audioRetryTimer);if(loaded)pause(true);}
function foregroundAudio(){
 last=0;acc=0;requestWakeLock();
 if(loaded&&!paused)audioStart();
}
try{if(navigator.mediaSession){
 if(window.MediaMetadata)navigator.mediaSession.metadata=new MediaMetadata({title:'mGBA Celio · ゲーム音声',artist:'Pocket'});
 navigator.mediaSession.setActionHandler('play',()=>{if(loaded){pause(false);audioStart(true);}});
 navigator.mediaSession.setActionHandler('pause',()=>{if(loaded)pause(true);});
}}catch{}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)backgroundAudio();else foregroundAudio();});
 addEventListener('pagehide',()=>{backgroundAudio();link?.disconnect();persistBoth();clearKeys();});
 addEventListener('pageshow',e=>{if(e.persisted){audioNeedsRebuild=true;flushAudio();foregroundAudio();}});setInterval(()=>{if(!busy)persistBoth();},3000);
const linkHooks={status:s=>$('netstatus').textContent=s,active:on=>{$('netstop').disabled=!on;$('netcreate').disabled=on;$('onlinecreate').disabled=on;$('onlinejoin').disabled=on;if(on)setSpeed(1);playerUI();if(!$('quickpanel').hidden)renderSlots();}};
$('linkmode').onchange=e=>{link?.disconnect();linkMode=e.target.value;link=linkMode==='local'?localLink:(M?createCelioLink(M,linkHooks):null);$('localoptions').hidden=linkMode!=='local';$('onlineoptions').hidden=linkMode!=='online';};
function onlineStart(room){if(!loaded||busy||linkMode!=='online')return gameNotice('先にROMを読み込んでください。');closeSavePanel();cancelQuick();pause(false);link.start(room);}
$('onlinecreate').onclick=()=>onlineStart('');$('onlinejoin').onclick=()=>onlineStart($('room').value.trim());
$('netlogsave').onclick=async()=>{try{const stamp=new Date().toISOString().replace(/[:.]/g,'-');await saveFile(new File([celioDiagnostics.export()],'Gs-mGBA-link-'+stamp+'.json',{type:'application/json'}));$('netlogstatus').textContent='通信ログの保存メニューを開きました。';}catch(e){if(e.name!=='AbortError')$('netlogstatus').textContent='ログを保存できません：'+e.message;}};
$('netlogclear').onclick=()=>{celioDiagnostics.clear();$('netlogstatus').textContent=celioDiagnostics.storageOK?'保存した通信ログを削除しました。':'端末の保存領域にアクセスできません。';};

$('rememberrom').onchange=e=>{settings.rememberROM=e.target.checked;remember();$('rommemorystatus').textContent=settings.rememberROM?'次に開いたROMから記憶します。':'ROMの記憶・自動読込をオフにしました。保存済みROMは削除ボタンから消せます。';};
$('forgetrom').onclick=async()=>{try{await dbOp('roms','delete',activePlayer);$('rommemorystatus').textContent='記憶ROMを削除しました。ゲームとセーブはそのままです。';}catch(e){$('rommemorystatus').textContent=e.message;}};
async function restoreRememberedROMs(prefetched){
 if(!settings.rememberROM)return;restoringROM=true;playerUI();
 try{for(let i=0;i<2;i++){const record=prefetched?prefetched[i]:await dbOp('roms','get',i);if(!record?.bytes||record.closed)continue;await selectPlayer(i);const bytes=record.bytes instanceof Uint8Array?record.bytes:new Uint8Array(record.bytes);await $('rom').onchange({target:{files:[{name:record.name,size:bytes.byteLength}],value:''},rememberedBytes:bytes,rememberedDigest:record.digest});}if(players[0].loaded)await selectPlayer(0);}
 catch(e){tell('記憶ROMを読み込めません：'+e.message);}finally{restoringROM=false;playerUI();}
}
let startupROMs=settings.rememberROM?Promise.all([0,1].map(i=>dbOp('roms','get',i))).catch(()=>null):Promise.resolve(null);
try{createCelio({print:()=>{},printErr:()=>{}}).then(async m=>{M=m;capturePlayer();localLink=createLocalCelioLink(()=>players.map(p=>p.loaded?p.M:null),linkHooks);link=localLink;playerUI();tell('ROMを選んでください · 端末内で処理します');await restoreRememberedROMs(await startupROMs);startupROMs=null;startupReady=true;$('startgame').disabled=false;$('startmessage').textContent=loaded?'記憶したROMで再開します':'開始後にROMを選んでください';if(startupRequested&&!document.hidden)finishStartup();requestAnimationFrame(loop);}).catch(e=>{tell('エンジンを起動できません：'+e.message);$('startmessage').textContent='起動できません。ページを再読み込みしてください。';});}catch(e){tell('エンジン読込エラー。Safariでページを再読み込みしてください。');}


for(const name of ['contextmenu','selectstart','dragstart'])document.addEventListener(name,e=>e.preventDefault());
for(const name of ['gesturestart','gesturechange','gestureend'])document.addEventListener(name,e=>e.preventDefault(),{passive:false});
$('player').addEventListener('touchmove',e=>e.preventDefault(),{passive:false});
$('player').addEventListener('dblclick',e=>e.preventDefault());

// Persistent .sav backup history; a single IndexedDB put commits the bounded history.
async function makeBackups(now=Date.now()){
 if(backupRunning||busy||document.hidden)return;backupRunning=true;capturePlayer();
 try{for(const p of players){if(!p.loaded||now-(backupTimes.get(p.romKey)||now)<300000)continue;
  const n=p.M._save_size();if(!n){backupTimes.set(p.romKey,now);continue;}
  const data=p.M.HEAPU8.slice(p.M._save_ptr(),p.M._save_ptr()+n),key=p.romKey;
  try{const history=await dbOp('backups','get',key)||[];history.push({at:now,name:p.romName,data});await dbOp('backups','put',key,history.slice(-10));backupTimes.set(key,now);$('backupstatus').textContent='最終バックアップ：'+new Date(now).toLocaleString('ja-JP');}
  catch(e){backupTimes.set(key,now);$('backupstatus').textContent='バックアップできません：'+e.message;}
 }}finally{backupRunning=false;}
}
setInterval(()=>makeBackups(),15000);
function downloadLocalFile(file){
 const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function saveFile(file){
 const video=file.type.startsWith('video/'),extension=video?(file.type.includes('mp4')?'.mp4':'.webm'):file.type==='image/png'?'.png':file.type==='application/json'?'.json':'.sav';
 if(typeof window.showSaveFilePicker==='function'){const handle=await window.showSaveFilePicker({suggestedName:file.name,types:[{description:video?'ゲーム録画':file.type==='image/png'?'スクリーンショット':file.type==='application/json'?'通信ログ':'GBAセーブ',accept:{[file.type||'application/octet-stream']:[extension]}}]});const writer=await handle.createWritable();await writer.write(file);await writer.close();gameNotice('ファイルに保存しました。');}
 else if(navigator.canShare?.({files:[file]})){gameNotice('開いたメニューで「ファイルに保存」を選んでください。');await navigator.share({files:[file]});}
 else{const url=URL.createObjectURL(file),a=document.createElement('a');a.href=url;a.download=file.name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);gameNotice('ファイル保存を開始しました。');}
}
async function renderBackups(){
 $('backuplist').replaceChildren();if(!loaded)return $('backupstatus').textContent='先にROMを開いてください。';
 const key=romKey;try{const history=await dbOp('backups','get',key)||[];if(key!==romKey)return;$('backupstatus').textContent='プレイヤー'+(activePlayer+1)+' · '+history.length+' / 10個';
 for(const record of history.slice().reverse()){
  const row=document.createElement('div');row.className='backuprow';const title=document.createElement('span');title.textContent=new Date(record.at).toLocaleString('ja-JP');row.append(title);
  const download=document.createElement('button');download.textContent='ファイルに保存';download.onclick=async()=>{try{const filename=record.name.replace(/\.[^.]+$/,'')+'_backup_'+record.at+'.sav';await saveFile(new File([record.data],filename,{type:'application/octet-stream'}));}catch(e){if(e.name!=='AbortError')gameNotice(e.message);}};row.append(download);
  const restore=document.createElement('button');restore.textContent='復元';restore.onclick=()=>{if(key!==romKey||busy)return gameNotice('一覧を開き直してください。');if(link?.active)return gameNotice('通信を終了してから復元してください。');pause(true);pendingSave=new Uint8Array(record.data);savePanel(new Date(record.at).toLocaleString('ja-JP')+' のセーブで現在の進行を置き換えます。');$('applysave').hidden=false;};row.append(restore);$('backuplist').append(row);
 }}catch(e){$('backupstatus').textContent=e.message;}
}
$('showbackups').onclick=renderBackups;
// Per-controller mappings; notifications also work when browsers expose pads only after input.
const gamepadDefaults={buttons:{a:0,b:1,l:4,r:5,select:8,start:9,up:12,down:13,left:14,right:15,quickSave:-1,quickLoad:-1,home:-1,turbo:-1,screenshot:-1},axisX:0,axisY:1,deadzone:.25,invertX:false,invertY:false};
const gamepadActions={a:['A',0],b:['B',1],l:['L',9],r:['R',8],select:['SELECT',2],start:['START',3],up:['上',6],down:['下',7],left:['左',5],right:['右',4],quickSave:['クイックセーブ',null],quickLoad:['クイックロード',null],home:['ホーム（設定）',null],turbo:['倍速',null],screenshot:['スクリーンショット',null]};
let gamepadProfiles={};try{gamepadProfiles=JSON.parse(localStorage.getItem('celio-gamepad-v1')||'{}')||{};}catch{}
let gamepadWasPressed=false,activePadId='',gamepadCapture=null,capturePrevious=[],padPrevious=[];
function padProfile(){
 const saved=Object.hasOwn(gamepadProfiles,activePadId)?gamepadProfiles[activePadId]:null,p=JSON.parse(JSON.stringify(gamepadDefaults));
 if(saved){for(const k of Object.keys(p.buttons)){const n=saved.buttons?.[k];if(Number.isInteger(n)&&n>=-1&&n<64)p.buttons[k]=n;}for(const k of ['axisX','axisY'])if(Number.isInteger(saved[k])&&saved[k]>=-1&&saved[k]<16)p[k]=saved[k];p.deadzone=Math.min(.8,Math.max(.05,Number(saved.deadzone)||.25));p.invertX=!!saved.invertX;p.invertY=!!saved.invertY;}return p;
}
function savePadProfile(p){if(!activePadId)return;Object.defineProperty(gamepadProfiles,activePadId,{value:p,enumerable:true,writable:true,configurable:true});try{localStorage.setItem('celio-gamepad-v1',JSON.stringify(gamepadProfiles));}catch{gameNotice('コントローラー設定を保存できませんでした。');}held.delete('gamepad');updateKeys();}
function beginPadCapture(action){
 gamepadCapture=action;capturePrevious=padPrevious.slice();capturePrevious.ready=true;
 $('padlearnstatus').textContent=gamepadActions[action][0]+'：ボタンを離してから、割り当てたいボタンを押してください。';
}
function renderPadSettings(focusAction){
 let focusTarget;
 const p=padProfile();$('gamepadname').textContent=activePadId||'未接続：コントローラーのボタンを押してください。';$('padmapping').replaceChildren();
 for(const [action,[label]] of Object.entries(gamepadActions)){
  const row=document.createElement('div');row.className='pad-map-row';const title=document.createElement('span');title.textContent=label;
  const select=document.createElement('select');select.dataset.padAction=action;if(action===focusAction)focusTarget=select;select.setAttribute('aria-label',label+' の割り当て。Aでボタン入力待ち');for(let i=-1;i<64;i++){const o=document.createElement('option');o.value=String(i);o.textContent=i<0?'未割当':'ボタン '+i;select.append(o);}select.value=String(p.buttons[action]);select.disabled=!activePadId;
  select.onchange=()=>{const v=padProfile();v.buttons[action]=Number(select.value);savePadProfile(v);};
  const learn=document.createElement('button');learn.textContent='押して設定';learn.disabled=!activePadId;learn.onclick=()=>beginPadCapture(action);row.append(title,select,learn);$('padmapping').append(row);
 }
 for(const k of ['axisX','axisY'])$('pad'+k).value=p[k];$('paddeadzone').value=Math.round(p.deadzone*100);$('paddeadzonevalue').textContent=Math.round(p.deadzone*100)+'%';$('padinvertX').checked=p.invertX;$('padinvertY').checked=p.invertY;
 for(const id of ['padaxisX','padaxisY','paddeadzone','padinvertX','padinvertY','padreset'])$(id).disabled=!activePadId;
 if(focusTarget)focusPadSetting(focusTarget);
}
for(const k of ['axisX','axisY'])$('pad'+k).onchange=e=>{const p=padProfile();p[k]=Number(e.target.value);savePadProfile(p);};
for(const k of ['invertX','invertY'])$('pad'+k).onchange=e=>{const p=padProfile();p[k]=e.target.checked;savePadProfile(p);};
$('paddeadzone').oninput=e=>{const p=padProfile();p.deadzone=Number(e.target.value)/100;savePadProfile(p);$('paddeadzonevalue').textContent=e.target.value+'%';};
$('padreset').onclick=()=>{savePadProfile(JSON.parse(JSON.stringify(gamepadDefaults)));gamepadCapture=null;renderPadSettings();$('padlearnstatus').textContent='標準配置に戻しました。';};
$('padcancel').onclick=()=>{gamepadCapture=null;$('padlearnstatus').textContent='割り当て待ちを解除しました。';};
let padFocus=null,padNavDirection=null,padNavNext=0,padNavZone='content',padChoiceSource=null,padChoiceButtons=[];
function clearPadFocus(){padFocus?.classList.remove('pad-focus');padFocus=null;padNavDirection=null;}
function padSettingsTargets(){return Array.from($('page-'+activeSettingsTab).querySelectorAll('button,select,input,a[href],summary')).filter(e=>!e.disabled&&!e.closest('[hidden]')&&e.getClientRects().length);}
function focusPadSetting(e){if(!e)return;padFocus?.classList.remove('pad-focus');padFocus=e;e.classList.add('pad-focus');e.focus({preventScroll:true});scrollPadSetting(e);}
function scrollPadSetting(e){
 const target=e.closest('.pad-map-row')||e.closest('.field')||e,scroller=e.closest('#settingscontent');
 if(scroller&&externalPadConnected){const r=target.getBoundingClientRect(),v=scroller.getBoundingClientRect();if(r.top<v.top+16||r.bottom>v.bottom-16)target.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});}
 else target.scrollIntoView({block:'nearest',inline:'nearest',behavior:'auto'});
}
function changePadValue(e,delta){
 if(e.tagName==='SELECT'){
  const options=Array.from(e.options).filter(o=>!o.disabled);if(!options.length)return true;
  const i=options.findIndex(o=>o.value===e.value);e.value=options[Math.max(0,Math.min(options.length-1,i+delta))].value;
  e.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 if(e.tagName==='INPUT'&&e.type==='range'){
  const step=e.step==='any'?1:Number(e.step)||1;e.value=String(Math.min(Number(e.max||100),Math.max(Number(e.min||0),Number(e.value)+delta*step)));
  e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));return true;
 }
 return false;
}
function openPadChoices(select){
 padChoiceSource=select;padChoiceButtons=[];$('padchoicelist').replaceChildren();
 $('padchoicetitle').textContent=select.getAttribute?.('aria-label')||'設定を選択';$('padchoices').hidden=false;
 for(const option of Array.from(select.options)){
  if(option.disabled||option.hidden)continue;
  const button=document.createElement('button');button.type='button';button.textContent=option.textContent;button.dataset.value=option.value;button.setAttribute('aria-pressed',String(option.value===select.value));
  button.onclick=()=>{select.value=option.value;select.dispatchEvent(new Event('input',{bubbles:true}));select.dispatchEvent(new Event('change',{bubbles:true}));closePadChoices();};
  padChoiceButtons.push(button);$('padchoicelist').append(button);
 }
 focusPadSetting(padChoiceButtons.find(b=>b.dataset.value===select.value)||padChoiceButtons[0]);padNavDirection=null;
}
function closePadChoices(restore=true){const source=padChoiceSource;padChoiceSource=null;padChoiceButtons=[];$('padchoices').hidden=true;if(restore&&source)focusPadSetting(source);}
$('padchoicecancel').onclick=()=>closePadChoices();
function navigatePadSettings(pressed,triggered,now=Date.now()){
 if(triggered('b')){
  if(padChoiceSource)closePadChoices();
  else if(padNavZone==='content'){padNavZone='tabs';focusPadSetting($('tab-'+activeSettingsTab));}
  else closeSettings();return;
 }
 if(!padChoiceSource&&(triggered('l')||triggered('r'))){
  const i=settingsTabNames.indexOf(activeSettingsTab),d=triggered('r')?1:-1;
  selectSettingsTab(settingsTabNames[(i+d+settingsTabNames.length)%settingsTabNames.length]);
  padNavZone='tabs';focusPadSetting($('tab-'+activeSettingsTab));return;
 }
 const targets=padChoiceSource?padChoiceButtons:padNavZone==='tabs'?settingsTabNames.map(k=>$('tab-'+k)):padSettingsTargets();
 if(!targets.length){padNavZone='tabs';focusPadSetting($('tab-'+activeSettingsTab));return;}
 if(!targets.includes(padFocus))focusPadSetting(targets.includes(document.activeElement)?document.activeElement:targets[0]);
 const direction=pressed.find(k=>k>=4&&k<=7);
 if(direction===undefined)padNavDirection=null;
 else if(direction!==padNavDirection||now>=padNavNext){
  const fresh=direction!==padNavDirection;padNavDirection=direction;padNavNext=now+(fresh?420:140);
  const delta=direction===4||direction===7?1:-1;
  if(!(padNavZone==='content'&&!padChoiceSource&&direction<=5&&changePadValue(padFocus,delta))){
   const i=targets.indexOf(padFocus),next=targets[(i+delta+targets.length)%targets.length];focusPadSetting(next);
   if(padNavZone==='tabs'&&!padChoiceSource)selectSettingsTab(next.id.slice(4));
  }
 }
 if(triggered('a')&&padFocus){
  if(padChoiceSource){padFocus.click();return;}
  if(padNavZone==='tabs'){padNavZone='content';clearPadFocus();focusPadSetting(padSettingsTargets()[0]);return;}
  if(padFocus.id==='export'){exportSave(true);return;}
  if(padFocus.dataset.padAction){beginPadCapture(padFocus.dataset.padAction);return;}
  if(padFocus.tagName==='SELECT'){openPadChoices(padFocus);return;}
  if(padFocus.tagName==='INPUT'&&['text','number','file'].includes(padFocus.type)){gameNotice('文字入力・ファイル選択は画面をタップして操作してください。');return;}
  padFocus.click();
 }
}
function pollGamepad(){
 let pad;try{pad=Array.from(navigator.getGamepads?.()||[]).find(p=>p&&p.connected);}catch{}
 externalPadConnected=!!pad;updateExternalDisplay();
 held.delete('gamepad');
 if(!pad){closePadChoices();clearPadFocus();padPrevious=[];if(activePadId){gameNotice('外部コントローラーの接続が解除されました。');activePadId='';gamepadCapture=null;renderPadSettings();}$('gamepadstatus').textContent=navigator.getGamepads?'コントローラー未接続 · ボタンを押すと認識されます。':'このブラウザではコントローラーを利用できません。';gamepadWasPressed=false;updateKeys();return;}
 if(activePadId!==pad.id){padPrevious=pad.buttons.map((b,i)=>b.pressed||b.value>.5?i:-1);activePadId=pad.id;gamepadCapture=null;renderPadSettings();gameNotice('外部コントローラーを接続しました：'+pad.id);}
 $('gamepadstatus').textContent='接続中：'+pad.id;
 const down=i=>i>=0&&!!pad.buttons[i]&&(pad.buttons[i].pressed||pad.buttons[i].value>.5),pressed=[],p=padProfile();
 const live=pad.buttons.map((_,i)=>i).filter(down),edges=live.filter(i=>!padPrevious.includes(i));padPrevious=live.slice();$('padlive').textContent='入力：'+(live.length?live.map(i=>'ボタン '+i).join(' / '):'なし');
 if(gamepadCapture&&($('settingspanel').hidden||activeSettingsTab!=='gamepad'))gamepadCapture=null;
 if(gamepadCapture){const next=live.find(i=>i<64&&!capturePrevious.includes(i));if(next!==undefined&&capturePrevious.ready){const action=gamepadCapture;p.buttons[action]=next;savePadProfile(p);gamepadCapture=null;renderPadSettings(action);$('padlearnstatus').textContent='ボタン '+next+' を割り当てました。';}capturePrevious=live.slice();capturePrevious.ready=true;updateKeys();return;}
 const triggered=action=>edges.includes(p.buttons[action]),captureWasOpen=!$('capturemenu').hidden;
 if(triggered('screenshot')&&recordingSession){stopGameRecording();updateKeys();return;}
 const settingsWereOpen=!$('settingspanel').hidden;
 if(startupStarted&&!busy&&!captureWasOpen){
  if(triggered('home')){if(settingsWereOpen)closeSettings();else $('settingsopen').onclick();}
  else if(loaded&&!paused&&!settingsWereOpen){
   if(triggered('quickSave'))quickSaveSelected();
   else if(triggered('quickLoad'))quickLoadSelected();
   else if(triggered('turbo'))toggleTurbo();
   else if(triggered('screenshot'))requestCapture(true);
  }
 }
 for(const [action,[,key]] of Object.entries(gamepadActions))if(key!==null&&down(p.buttons[action]))pressed.push(key);
 if(!pressed.some(k=>k>=4&&k<=7)){let dx=p.axisX<0?0:Number(pad.axes[p.axisX])||0,dy=p.axisY<0?0:Number(pad.axes[p.axisY])||0;if(p.invertX)dx=-dx;if(p.invertY)dy=-dy;if(Math.hypot(dx,dy)>=p.deadzone)pressed.push(cardinalDirection(dx,dy));}
 if(!$('capturemenu').hidden){if(captureWasOpen)navigateCaptureMenu(pressed,triggered);updateKeys();return;}
 if(settingsWereOpen){if(!$('settingspanel').hidden&&!busy)navigatePadSettings(pressed,triggered);gamepadWasPressed=false;updateKeys();return;}
 if($('settingspanel').hidden)clearPadFocus();
 if(loaded&&!paused&&!busy&&$('settingspanel').hidden){held.set('gamepad',pressed);if(pressed.length&&!gamepadWasPressed)audioStart();}
 gamepadWasPressed=pressed.length>0;updateKeys();
}
addEventListener('gamepadconnected',pollGamepad);addEventListener('gamepaddisconnected',()=>{held.delete('gamepad');gamepadWasPressed=false;updateKeys();pollGamepad();});
renderPadSettings();

const settingsTabNames=['rom','saves','settings','network','info','gamepad'];let activeSettingsTab='rom';
function selectSettingsTab(name){
 cancelGameRestart();
 if(['controls','audio','system','rapid'].includes(name)){openGeneralSection(name);name='settings';}if(!settingsTabNames.includes(name))return;if(name!==activeSettingsTab)$('settingscontent').scrollTop=0;activeSettingsTab=name;
 for(const k of settingsTabNames){$('page-'+k).hidden=k!==name;$('tab-'+k).setAttribute('aria-selected',String(k===name));$('tab-'+k).tabIndex=k===name?0:-1;}
 renderLayoutPreview();
}
for(const [i,k] of settingsTabNames.entries()){
 $('tab-'+k).onclick=()=>{closePadChoices(false);selectSettingsTab(k);padNavZone='content';clearPadFocus();};
 $('tab-'+k).addEventListener('keydown',e=>{let n;if(e.key==='ArrowRight')n=(i+1)%settingsTabNames.length;else if(e.key==='ArrowLeft')n=(i+settingsTabNames.length-1)%settingsTabNames.length;else return;e.preventDefault();selectSettingsTab(settingsTabNames[n]);$('tab-'+settingsTabNames[n]).focus();});
}
let wakeLock=null,wakePending=false;
async function requestWakeLock(){
 if(!settings.keepAwake||!loaded||paused||document.hidden)return;
 if(!navigator.wakeLock){$('wakestatus').textContent='このブラウザでは画面消灯の防止を利用できません。';return;}
 if(wakeLock&&!wakeLock.released||wakePending)return;wakePending=true;
 try{const lock=await navigator.wakeLock.request('screen');if(!settings.keepAwake||document.hidden){await lock.release();return;}wakeLock=lock;lock.addEventListener('release',()=>{if(wakeLock===lock)wakeLock=null;$('wakestatus').textContent='画面消灯の防止は解除されています。';});$('wakestatus').textContent='画面消灯の防止：動作中';}
 catch(e){$('wakestatus').textContent='画面消灯を防止できません。ブラウザまたは省電力設定をご確認ください。';}finally{wakePending=false;}
}
$('keepawake').onchange=async e=>{settings.keepAwake=e.target.checked;remember();if(!settings.keepAwake){await wakeLock?.release();wakeLock=null;$('wakestatus').textContent='画面消灯の防止：オフ';}else requestWakeLock();};

function addScreenshotHit(area){
 const b=document.createElement('button');b.className='skin-hit';b.dataset.screenshot='true';b.setAttribute('aria-label','撮影メニュー・録画停止');Object.assign(b.style,{left:'44.6875%',top:'50.833333%',width:'10.625%',height:'14.166667%',borderRadius:'50%'});if(settings.skin!=='Cobalt'&&settings.skin!=='custom'&&!landscapeSkin())Object.assign(b.style,{top:(184/portraitSkinHeight*100)+'%',height:(34/portraitSkinHeight*100)+'%'});if(settings.skin==='Cobalt'&&!landscapeSkin()){const f=CELIO_SKINS.Cobalt.screenshot;Object.assign(b.style,{left:(f.x/1290*100)+'%',top:(f.y/1616*100)+'%',width:(f.width/1290*100)+'%',height:(f.height/1616*100)+'%'});}if(landscapeSkin())Object.assign(b.style,{left:'47.5%',top:'89%',width:'5%',height:'10.83%',background:'radial-gradient(circle,#fff 0 22%,#26364b 24% 36%,transparent 38%),linear-gradient(#d64149 43%,#26364b 44% 56%,#fff 57%)',border:'2px solid #26364b'});if(settings.skin==='custom'){const size=34*customPadScale();Object.assign(b.style,{width:size+'px',height:size+'px',left:((area.clientWidth-size)/2)+'px',top:((area.clientHeight-size)/2)+'px'});}b.onclick=()=>requestCapture();area.append(b);
}
function requestCapture(fromPad=false){
 if(recordingSession)return stopGameRecording();
 if(recordingStarting)return gameNotice('録画を準備しています。');
 if(!loaded||busy)return gameNotice('先にROMを開いてください。');
 captureFromPad=fromPad===true;captureIndex=0;captureNavDirection=null;clearKeys();$('capturemenu').hidden=false;highlightCaptureChoice();
}
function captureButtons(){return [$('capturephoto'),$('capturevideo'),$('capturecancel')];}
function highlightCaptureChoice(){captureButtons().forEach((b,i)=>b.classList.toggle('capture-focus',i===captureIndex));captureButtons()[captureIndex].focus({preventScroll:true});}
function closeCaptureMenu(){$('capturemenu').hidden=true;clearKeys();}
function navigateCaptureMenu(pressed,triggered,now=Date.now()){
 if(triggered('b'))return closeCaptureMenu();
 const d=pressed.find(k=>k>=4&&k<=7);
 if(d===undefined)captureNavDirection=null;
 else if(d!==captureNavDirection||now>=captureNavNext){const fresh=d!==captureNavDirection;captureNavDirection=d;captureNavNext=now+(fresh?420:140);captureIndex=(captureIndex+(d===4||d===7?1:2))%3;highlightCaptureChoice();}
 if(triggered('a'))captureButtons()[captureIndex].click();
}
$('capturephoto').onclick=()=>{const defer=captureFromPad;closeCaptureMenu();return captureScreenshot(defer);};
$('capturevideo').onclick=()=>{closeCaptureMenu();return startGameRecording();};
$('capturecancel').onclick=closeCaptureMenu;
// Integer scaling preserves the original pixel edges in exported media.
function createCaptureSurface(scale){
 const source=$('screen'),canvas=document.createElement('canvas');
 canvas.width=source.width*scale;canvas.height=source.height*scale;
 const context=canvas.getContext('2d',{alpha:false});
 if(!context)throw Error('撮影用の画面を作成できません。');
 context.imageSmoothingEnabled=false;
 const capture={canvas,context};drawCaptureFrame(capture);return capture;
}
function drawCaptureFrame(capture){
 capture.context.drawImage($('screen'),0,0,capture.canvas.width,capture.canvas.height);
}
function cleanRecording(session){
 clearInterval(session.timer);try{session.gain.disconnect(session.output);}catch{}
 for(const track of session.stream.getTracks())track.stop();
}
function stopGameRecording(reason=''){
 const session=recordingSession;if(!session||session.stopping)return;
 session.stopping=true;session.reason=reason;$('recordingbadge').textContent='録画を保存用に処理中…';
 try{if(session.recorder.state!=='inactive')session.recorder.stop();}catch(e){cleanRecording(session);recordingSession=null;$('recordingbadge').hidden=true;gameNotice('録画を終了できません：'+e.message);}
}
async function startGameRecording(){
 if(recordingStarting||recordingSession||!loaded||busy)return;
 const Recorder=window.MediaRecorder;
 if(!Recorder||typeof $('screen').captureStream!=='function')return gameNotice('このブラウザはゲーム画面の録画に対応していません。');
 recordingStarting=true;let stream,output,recordGain;
 try{
  await audioStart();if(!audio||audio.state!=='running')throw Error('先にゲーム画面をタップして音声を開始してください。');
  if(typeof audio.createMediaStreamDestination!=='function')throw Error('ゲーム音声の録音に対応していません。');
  const mime=['video/mp4','video/webm;codecs=vp8,opus','video/webm'].find(t=>Recorder.isTypeSupported(t));if(!mime)throw Error('対応する動画形式が見つかりません。');
  paint();const capture=createCaptureSurface(4);stream=capture.canvas.captureStream(60);output=audio.createMediaStreamDestination();recordGain=gain;recordGain.connect(output);for(const track of output.stream.getAudioTracks())stream.addTrack(track);
  const recorder=new Recorder(stream,{mimeType:mime,videoBitsPerSecond:8000000,audioBitsPerSecond:128000});
  const session={recorder,stream,output,capture,gain:recordGain,chunks:[],size:0,started:Date.now(),name:romName.replace(/\.[^.]+$/,''),player:activePlayer+1,stopping:false};recordingSession=session;
  recorder.ondataavailable=e=>{if(e.data?.size){session.chunks.push(e.data);session.size+=e.data.size;if(session.size>256*1024*1024)stopGameRecording('録画データが大きくなったため終了しました。');}};
  recorder.onerror=e=>{session.reason='録画中にエラーが発生しました。';if(recorder.state==='inactive')recorder.onstop();else stopGameRecording(session.reason);};
  recorder.onstop=()=>{
   if(session.finished)return;session.finished=true;cleanRecording(session);if(recordingSession===session)recordingSession=null;$('recordingbadge').hidden=true;
   if(!session.chunks.length)return gameNotice('録画データを取得できませんでした。');
   const type=(recorder.mimeType||mime).split(';')[0],ext=type.includes('mp4')?'mp4':'webm',stamp=new Date().toISOString().replace(/[:.]/g,'-');
   pendingRecording=new File(session.chunks,session.name+'_P'+session.player+'_'+stamp+'.'+ext,{type});session.chunks=[];
   $('recordsavepending').hidden=false;$('recordnotice').hidden=false;clearTimeout(recordingNoticeTimer);recordingNoticeTimer=setTimeout(()=>{$('recordnotice').hidden=true;},6000);
   gameNotice((session.reason||'録画を終了しました。')+'「動画を保存」または設定のセーブから保存できます。');
  };
  recorder.start(1000);closeSettings();$('recordingbadge').hidden=false;$('recordingbadge').textContent='● 録画中 0:00 · 停止';
  session.timer=setInterval(()=>{if(session.stopping)return;const sec=Math.floor((Date.now()-session.started)/1000);$('recordingbadge').textContent='● 録画中 '+Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0')+' · 停止';},1000);
  gameNotice('ゲーム画面とゲーム音声を録画中。撮影ボタンをもう一度押すと停止します。');
 }catch(e){if(recordingSession){cleanRecording(recordingSession);recordingSession=null;}else{try{recordGain?.disconnect(output);}catch{}for(const track of stream?.getTracks()||[])track.stop();for(const track of output?.stream.getTracks()||[])track.stop();}$('recordingbadge').hidden=true;gameNotice('録画を開始できません：'+e.message);}
 finally{recordingStarting=false;}
}
$('recordingbadge').onclick=()=>stopGameRecording();
$('recorddismiss').onclick=()=>{$('recordnotice').hidden=true;clearTimeout(recordingNoticeTimer);};
$('recordsavepending').onclick=$('recordsave').onclick=async()=>{
 $('recordnotice').hidden=true;clearTimeout(recordingNoticeTimer);const file=pendingRecording;if(!file)return;
 try{await saveFile(file);if(pendingRecording===file){pendingRecording=null;$('recordsavepending').hidden=true;}}catch(e){if(e.name!=='AbortError')gameNotice('動画を保存できません：'+e.message);}
};
let pendingControllerShot=null,shotNoticeTimer;
function dismissShotNotice(){clearTimeout(shotNoticeTimer);$('shotsave').hidden=true;$('shotdismiss').hidden=true;}
function showShotNotice(){clearTimeout(shotNoticeTimer);$('shotsave').hidden=false;$('shotdismiss').hidden=false;$('shotsavepending').hidden=false;shotNoticeTimer=setTimeout(dismissShotNotice,6000);}
async function captureScreenshot(deferSave=false){
 if(!loaded||busy)return gameNotice('先にROMを開いてください。');
 try{paint();const encoded=createCaptureSurface(6).canvas.toDataURL('image/png').split(',')[1],raw=atob(encoded),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));const stamp=new Date().toISOString().replace(/[:.]/g,'-');const name=romName.replace(/\.[^.]+$/,'')+'_P'+(activePlayer+1)+'_'+stamp+'.png';const file=new File([bytes],name,{type:'image/png'});if(deferSave===true){pendingControllerShot=file;showShotNotice();gameNotice('撮影しました。設定の「セーブ」からも画像を保存できます。');}else await saveFile(file);}
 catch(e){if(e.name!=='AbortError')gameNotice('撮影画像を保存できません：'+e.message);}
}
$('screenshot').onclick=()=>requestCapture();
$('shotdismiss').onclick=dismissShotNotice;
$('shotsavepending').onclick=$('shotsave').onclick=async()=>{dismissShotNotice();const file=pendingControllerShot;if(!file)return;try{await saveFile(file);if(pendingControllerShot===file){pendingControllerShot=null;$('shotsavepending').hidden=true;}}catch(e){if(e.name!=='AbortError')gameNotice('保存できません：'+e.message);}};
async function closePlayer2(){
 if(busy||!players[1].M)return;busy=true;clearKeys();flushAudio();
 try{capturePlayer();const second=players[1];
  if(linkMode==='local'||activePlayer===1)link?.disconnect('プレイヤー2を終了しました。');
  if(second.loaded){const n=second.M._save_size();if(n)await dbOp('saves','put',second.romKey,second.M.HEAPU8.slice(second.M._save_ptr(),second.M._save_ptr()+n));}
  const cached=await dbOp('roms','get',1);if(cached)await dbOp('roms','put',1,{...cached,closed:true});
  second.M._stop();backupTimes.delete(second.romKey);players[1]={M:null,loaded:false,romKey:'',romName:'',quickNamespace:''};
  if(activePlayer===1){activePlayer=0;({M,loaded,romKey,romName,quickNamespace}=players[0]);if(linkMode==='online')link=createCelioLink(M,linkHooks);}
  last=0;acc=0;playerUI();if(loaded)paint();else ctx.clearRect(0,0,240,160);await renderSlots();gameNotice('プレイヤー2を終了しました。セーブは保持しています。');
 }catch(e){gameNotice('終了できません：'+e.message);}finally{busy=false;}
}
$('closeplayer2').onclick=closePlayer2;

// Unlock audio on the first touch, even while the engine/remembered ROM is preparing.
function finishStartup(){
 if(!M||busy||restoringROM||!startupReady||startupStarted)return;
 startupStarted=true;$('startgate').hidden=true;
 if(loaded){paint();pause(false);}
}
$('startgame').onclick=()=>{
 if(startupStarted)return;
 startupRequested=true;audioStart(!audio);
 if(startupReady)finishStartup();
 else{$('startmessage').textContent='読み込みが終わり次第、自動で開始します…';$('startgame').textContent='起動を準備しています…';}
};

function openGeneralSection(name){for(const key of ['controls','audio','system','rapid']){$('page-'+key).hidden=key!==name;$('open-'+key).setAttribute('aria-expanded',String(key===name));}if(name==='controls')renderLayoutPreview();}
for(const key of ['controls','audio','system','rapid'])$('open-'+key).onclick=()=>{const open=$('page-'+key).hidden;for(const k of ['controls','audio','system','rapid']){$('page-'+k).hidden=true;$('open-'+k).setAttribute('aria-expanded','false');}if(open)openGeneralSection(key);};
function renderLayoutPreview(){const area=$('layoutpreview'),pad=$('padarea');
 if(area.closest('[hidden]')||!area.clientWidth||!pad.clientWidth||!pad.clientHeight)return;
 const pw=pad.clientWidth||320,ph=pad.clientHeight||270;
 area.style.height=Math.max(280,Math.min(460,(area.clientWidth||320)*ph/pw))+'px';
 const fit=Math.min((area.clientWidth||320)/pw,(area.clientHeight||280)/ph),scale=customPadScale()*fit;
 const sizes={dpad:[117,117],ab:[116,82],l:[42,38],r:[42,38],select:[78,32],start:[78,32],home:[78,32],turbo:[78,32],rapid:[78,32],quickSave:[78,32],quickLoad:[78,32]};
 for(const key of Object.keys(defaults.positions)){const b=$('preview-'+key),[x,y]=settings.positions[key],[w,h]=sizes[key];b.style.width=w*scale+'px';b.style.height=h*scale+'px';b.style.left=Math.max(0,area.clientWidth-w*scale)*x/100+'px';b.style.top=Math.max(0,area.clientHeight-h*scale)*y/100+'px';b.classList.toggle('selected',key===$('positiongroup').value);}}

for(const key of Object.keys(defaults.positions)){const b=$('preview-'+key);let drag=null;b.addEventListener('pointerdown',e=>{e.preventDefault();$('positiongroup').value=key;syncPositionInputs();const r=b.getBoundingClientRect();drag={id:e.pointerId,x:e.clientX-r.left,y:e.clientY-r.top};b.setPointerCapture(e.pointerId);renderLayoutPreview();});b.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;e.preventDefault();const a=$('layoutpreview'),r=a.getBoundingClientRect();settings.positions[key]=[Math.min(100,Math.max(0,(e.clientX-r.left-drag.x)/Math.max(1,a.clientWidth-b.offsetWidth)*100)),Math.min(100,Math.max(0,(e.clientY-r.top-drag.y)/Math.max(1,a.clientHeight-b.offsetHeight)*100))];settings.skin='custom';$('skinselect').value='custom';drawSkin();applyPositions();syncPositionInputs();renderLayoutPreview();remember();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{drag=null;});}

$('custom-home').onclick=()=>{$('settingsopen').onclick();};$('custom-turbo').onclick=()=>{if(loaded)toggleTurbo();};$('custom-rapid').onclick=toggleRapid;$('custom-quickSave').onclick=quickSaveSelected;$('custom-quickLoad').onclick=quickLoadSelected;

// Recompute only after layout has a measurable surface; never change saved coordinates.
if(typeof ResizeObserver!=='undefined'){const layoutObserver=new ResizeObserver(()=>{applyPositions();renderLayoutPreview();});layoutObserver.observe($('layoutpreview'));layoutObserver.observe($('padarea'));}

syncTurboIndicator();
