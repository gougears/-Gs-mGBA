const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'../docs/app.js'),'utf8');
const timers=new Map(),handlers={},frames=[];let serial=0,now=100,paints=0,pumps=0,disconnected=0;
const ctx=vm.createContext({document:{hidden:false,addEventListener:(n,f)=>handlers[n]=f},addEventListener:(n,f)=>handlers[n]=f,
 setInterval:f=>{timers.set(++serial,f);return serial;},clearInterval:id=>timers.delete(id),clearTimeout(){},performance:{now:()=>now},
 requestAnimationFrame(){},pollGamepad(){},window:{},M:{_frame:k=>frames.push(k)},consumeAudio(){},paint(){paints++;},tell:s=>{throw Error(s);},
 link:{active:true,pump(){pumps++;},disconnect(){disconnected++;}},linkMode:'online',paused:false,startupStarted:true,loaded:true,busy:false,last:0,acc:0,speed:1,
 rapidFrameKeys:()=>9,recordingSession:null,audioRetryTimer:null,flushAudio(){},pause:v=>{ctx.paused=v;},persistBoth(){},clearKeys(){},requestWakeLock(){},audioStart(){},settings:{soundOutput:'off'}});
vm.runInContext(source.slice(source.indexOf('function loop(t)'),source.indexOf('function openPanel')),ctx);
vm.runInContext(source.slice(source.indexOf('let backgroundLinkTimer='),source.indexOf('function syncMediaAudio')),ctx);
vm.runInContext(source.split('\n').filter(l=>l.includes("document.addEventListener('visibilitychange'")||l.includes("addEventListener('pagehide'")).join('\n'),ctx);
ctx.document.hidden=true;handlers.visibilitychange();assert(ctx.paused);assert.equal(timers.size,1);
for(let i=0;i<10;i++){now+=17;for(const f of [...timers.values()])f();}
assert(frames.length>=8);assert(frames.every(k=>k===0));assert(pumps>0);assert.equal(paints,0);
const before=frames.length;ctx.loop(now+100);assert.equal(frames.length,before,'hidden RAF must not advance twice');
handlers.pagehide();assert.equal(disconnected,0);assert.equal(timers.size,1,'duplicate background events keep one timer');
ctx.foregroundAudio();assert.equal(timers.size,1,'focus while hidden must not stop timer');
ctx.document.hidden=false;handlers.visibilitychange();assert.equal(timers.size,0);ctx.loop(now+17);ctx.loop(now+34);assert(frames.length>before);
ctx.paused=false;ctx.loop(now+51);assert.equal(frames.at(-1),9);assert(paints>0);
ctx.document.hidden=true;handlers.visibilitychange();ctx.link.active=false;for(const f of [...timers.values()])f();assert.equal(timers.size,0);
ctx.linkMode='local';ctx.link.active=true;handlers.visibilitychange();assert.equal(timers.size,0);handlers.pagehide();assert.equal(disconnected,1);
console.log('PASS background online stepping, neutral input, no rendering, single scheduler, pagehide retention, foreground return, disconnected/local cleanup');
