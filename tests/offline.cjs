const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
async function test(root,base){
 const stores=new Map(),handlers={};let online=true,broken='',calls=0,claimed=false;
 const key=r=>typeof r==='string'?r:r.url;
 const caches={has:async n=>stores.has(n),keys:async()=>[...stores.keys()],delete:async n=>stores.delete(n),open:async n=>{
  if(!stores.has(n))stores.set(n,new Map());const m=stores.get(n);
  return {match:async r=>m.get(key(r))?.clone(),put:async(r,v)=>m.set(key(r),v.clone())};
 }};
 const fetch=async r=>{calls++;if(!online)throw Error('offline');const url=new URL(key(r));let rel=decodeURIComponent(url.pathname.slice(new URL(base).pathname.length));if(rel===broken)throw Error('network failure');const p=path.join(root,rel||'index.html');return new Response(fs.readFileSync(p));};
 const self={location:{href:base+'sw.js'},clients:{claim:async()=>{claimed=true;}},addEventListener:(n,f)=>handlers[n]=f};
 vm.runInNewContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),{self,URL,caches,fetch,crypto:webcrypto,Map,Array,Uint8Array,Error,TextDecoder});
 async function event(name,more={}){let p;handlers[name]({...more,waitUntil:v=>p=v});await p;}
 async function message(type){let out;await event('message',{data:{type},ports:[{postMessage:x=>out=x}]});return out;}
 async function request(url,method='GET'){let result;handlers.fetch({request:{url,method},respondWith:p=>result=p});return result&&await result;}
 await event('install');assert((await message('STATUS')).ready);await event('activate');assert(claimed);
 online=false;let count=calls;
 assert.equal(await(await request(base)).text(),fs.readFileSync(path.join(root,'index.html'),'utf8'));
 assert.equal(await(await request(base+'app.js?v=test')).text(),fs.readFileSync(path.join(root,'app.js'),'utf8'));
 for(const [url] of stores.values().next().value) assert(await request(url));
 assert.equal(calls,count,'offline app loads must not touch network');
 assert.equal(await request('https://other.example/file'),undefined);
 assert.equal(await request(base+'source.zip'),undefined);
 assert.equal(await request(base+'rom.gba'),undefined);
 assert.equal(await request(base+'app.js','POST'),undefined);
 const cache=stores.values().next().value;cache.delete(base+'app.js');assert.equal((await message('STATUS')).ready,false);
 assert((await message('REPAIR')).error);online=true;assert((await message('REPAIR')).ready);
 stores.clear();broken='app.js';await assert.rejects(event('install'));assert.equal(stores.size,0,'failed install is removed');
 console.log(root+': PASS install, offline navigation/query/assets, exclusions, cache deletion/repair, failed install rollback');
}
(async()=>{await test(process.argv[2],process.argv[3]);})().catch(e=>{console.error(e);process.exit(1)});
