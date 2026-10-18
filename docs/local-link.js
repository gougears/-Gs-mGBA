'use strict';
// In-page Celio relay. No network APIs, ROM bytes or save files enter the transport.
// Status transitions follow Celio-Server/src/session.ts; core protocol is in browser-link.cpp.
function createLocalCelioLink(getCores,hooks){
 let active=false,cores=[],states=[0,0],packets=0;
 function report(s){hooks.status(s);}
 function disconnect(message='端末内通信を終了しました。'){
  for(const m of cores)m._link_disable();cores=[];active=false;states=[0,0];hooks.active(false);report(message);
 }
 function start(){
  disconnect();const pair=getCores();if(pair.length!==2||pair.some(m=>!m)){report('プレイヤー1・2の両方にROMを開いてください。');return false;}
  cores=pair;try{for(const m of cores)if(!m._link_enable())throw Error('ROMを起動してから接続してください。');
   active=true;states=[0,0];packets=0;for(const m of cores){m._link_command(1);m._link_command(0);}hooks.active(true);pump();report('端末内で接続準備完了。両方のゲームで通信受付へ進んでください。');return true;
  }catch(e){disconnect(e.message);return false;}
 }
 function status(i,s){
  states[i]=s;
  if(s===0xff02)cores[i]._link_command(i===0?0x10:0x11);
  else if(s===0xff01)cores[i]._link_command(0x11);
  else if(s===0xff03&&states.every(v=>v===0xff03)){for(const m of cores)m._link_command(0x12);}
  else if(s===0xff05){cores[1-i]._link_command(0x13);report('端末内通信中 · プレイヤーを切り替えて操作してください。');}
  else if(s===0xff07&&states.every(v=>v===0xff07))disconnect('両方のゲームが通信を終了しました。');
 }
 function pump(){
  if(!active)return;
  try{for(let i=0;i<2&&active;i++)for(let n=0;n<256&&active;n++){
   const m=cores[i],p=m._link_event();if(!p)break;
   const v=m.HEAPU16.slice(p/2,p/2+34);
   if(v[0]===3)throw Error('端末内通信の処理が追いつきません。通信を開始し直してください。');
   if(v[0]===1)status(i,v[1]);
   else if(v[0]===2){if(v[1]!==32)throw Error('通信データの長さが不正です。');const peer=cores[1-i],q=peer._malloc(64);if(!q)throw Error('通信メモリが不足しています。');try{peer.HEAPU16.set(v.subarray(2,34),q/2);if(!peer._link_receive(q,32))throw Error('通信データを渡せませんでした。');packets++;}finally{peer._free(q);}}
  }}catch(e){disconnect(e.message);}
 }
 return{start,pump,disconnect,get active(){return active;},get packets(){return packets;}};
}
if(typeof module!=='undefined')module.exports=createLocalCelioLink;
