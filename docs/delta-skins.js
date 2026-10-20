'use strict';
// Delta import stays local. Converted artwork is persisted independently of ROMs/saves.
const DeltaSkins=(()=>{
 const MAX=32*1024*1024, allowed=new Set(['a','b','l','r','up','down','left','right','start','select','menu','quickSave','quickLoad','toggleFastForward','fastForward','screenshot']);
 const validFrame=(f,s)=>f&&['x','y','width','height'].every(k=>Number.isFinite(f[k]))&&f.x>=0&&f.y>=0&&f.width>0&&f.height>0&&f.x+f.width<=s.width+1&&f.y+f.height<=s.height+1;
 function layout(r,orientation){
  const size=r?.mappingSize;if(!size||![size.width,size.height].every(n=>Number.isFinite(n)&&n>0&&n<=10000))throw Error('スキンの画面サイズが不正です。');
  let screen=r.screens?.[0]?.outputFrame||r.gameScreenFrame;
  const originalSize={...size};let artFrame={x:0,y:0,width:size.width,height:size.height},offset=0;
  if(!screen){if(orientation==='portrait'){offset=size.width*2/3;screen={x:0,y:0,width:size.width,height:offset};artFrame.y=offset;}else{const width=size.width*.46;screen={x:(size.width-width)/2,y:(size.height-width*2/3)/2,width,height:width*2/3};}}
  if(!validFrame(screen,{width:size.width,height:size.height+offset}))throw Error('ゲーム画面の位置情報がない、または対応していません。');
  if(r.screens?.length>1||r.screens?.[0]?.filters?.length)throw Error('複数画面・画面フィルター付きスキンは未対応です。');
  const warnings=new Set(),items=[];
  for(const i of r.items||[]){if(!validFrame(i.frame,size))throw Error('ボタンの位置情報が不正です。');let inputs=i.inputs;
   if(Array.isArray(inputs)){if(!inputs.length)continue;const bad=inputs.filter(n=>!allowed.has(n));if(bad.length){bad.forEach(n=>warnings.add(String(n)));continue;}}
   else if(!inputs||!['up','down','left','right'].every(n=>inputs[n]===n)){warnings.add('特殊入力');continue;}
   const asset=i.asset?.name;if(asset&&(typeof asset!=='string'||asset.includes('..')||/^(\/|https?:)/i.test(asset)))throw Error('ボタン画像の指定が不正です。');
   items.push({inputs,frame:{...i.frame,y:i.frame.y+offset},asset});
  }
  if(!items.length)throw Error('対応するボタン配置がありません。');
  const asset=r.assets?.large||r.assets?.medium||r.assets?.small||r.assets?.resizable;
  if(typeof asset!=='string'||asset.includes('..')||/^(\/|https?:)/i.test(asset))throw Error('画像ファイルの指定が不正です。');
  return {size:{width:size.width,height:size.height+offset},screen,items,asset,artFrame,warnings:[...warnings]};
 }
 function metadata(info){
  if(info.gameTypeIdentifier!=='com.rileytestut.delta.game.gba')throw Error('GBA用のDeltaスキンを選んでください。');
  const reps=info.representations||{},families=[reps.iphone?.edgeToEdge,reps.iphone?.standard,reps.ipad?.standard];
  const result={name:String(info.name||'Deltaスキン').slice(0,100),identifier:String(info.identifier||'').slice(0,200),layouts:{}};
  for(const orientation of ['portrait','landscape']){const r=families.find(f=>f?.[orientation])?.[orientation];if(r)result.layouts[orientation]=layout(r,orientation);}
  if(!Object.keys(result.layouts).length)throw Error('iPhone・iPad用の画面配置がありません。');
  return result;
 }
 function unpack(bytes){let total=0,count=0;const files=fflate.unzipSync(bytes,{filter:f=>{if(++count>256||f.originalSize>MAX||(total+=f.originalSize)>MAX*2)throw Error('展開後のスキンが大きすぎます。');return /(^|\/)info.json$|\.(png|jpe?g|pdf)$/i.test(f.name)&&!f.name.startsWith('__MACOSX/');}});const names=Object.keys(files).filter(n=>/(^|\/)info.json$/.test(n));if(names.length!==1)throw Error('info.jsonが1つ必要です。');if(files[names[0]].length>1024*1024)throw Error('設定ファイルが大きすぎます。');const data=metadata(JSON.parse(new TextDecoder().decode(files[names[0]])));return {data,files,prefix:names[0].slice(0,-9)};}
 async function artwork(bytes,name){
  if(/\.pdf$/i.test(name)){
   const pdfjs=await import('./vendor/pdfjs/pdf.js');pdfjs.GlobalWorkerOptions.workerSrc=new URL('vendor/pdfjs/pdf.worker.js',document.baseURI).href;
   const task=pdfjs.getDocument({data:bytes.slice(),isEvalSupported:false,useWasm:false,wasmUrl:new URL('vendor/pdfjs/',document.baseURI).href,stopAtErrors:true});
   try{const pdf=await task.promise,page=await pdf.getPage(1),v=page.getViewport({scale:1}),scale=Math.min(3,1800/Math.max(v.width,v.height));const viewport=page.getViewport({scale});const c=document.createElement('canvas');c.width=Math.ceil(viewport.width);c.height=Math.ceil(viewport.height);await page.render({canvasContext:c.getContext('2d'),viewport,background:'rgba(0,0,0,0)'}).promise;return await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('画像変換に失敗しました。')),'image/png'));}finally{await task.destroy();}
  }
  if(!/\.(png|jpe?g)$/i.test(name))throw Error('画像形式はPNG・JPEG・PDFに対応しています。');
  const blob=new Blob([bytes],{type:/\.png$/i.test(name)?'image/png':'image/jpeg'}),url=URL.createObjectURL(blob);
  try{const img=new Image();img.src=url;await img.decode();if(img.naturalWidth*img.naturalHeight>16000000)throw Error('画像の解像度が大きすぎます。');return blob;}finally{URL.revokeObjectURL(url);}
 }
 const dbReady=new Promise((resolve,reject)=>{try{const q=indexedDB.open('gs-delta-skins',1);q.onupgradeneeded=()=>q.result.createObjectStore('skins',{keyPath:'key'});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);q.onblocked=()=>reject(Error('他のタブを閉じてもう一度試してください。'));}catch(e){reject(e);}});dbReady.catch(()=>{});
 async function dbop(action,value){const db=await dbReady;return new Promise((resolve,reject)=>{let data;const tx=db.transaction('skins',action==='getAll'?'readonly':'readwrite');const q=tx.objectStore('skins')[action](value);q.onsuccess=()=>data=q.result;tx.oncomplete=()=>resolve(data);tx.onerror=tx.onabort=()=>reject(tx.error);});}
 function install(record){const previous=CELIO_SKINS[record.key];if(previous?.delta)for(const r of Object.values(previous.layouts))URL.revokeObjectURL(r.art);const layouts={};for(const [o,r] of Object.entries(record.layouts))layouts[o]={...r,art:URL.createObjectURL(r.blob)};const primary=layouts.portrait||layouts.landscape;CELIO_SKINS[record.key]={name:record.name,group:'delta',delta:true,layouts,size:primary.size,items:primary.items};return record.key;}
 async function importFile(file){if(file.size>MAX)throw Error('スキンは32MiB以下にしてください。');const bytes=new Uint8Array(await file.arrayBuffer());const {data,files,prefix}=unpack(bytes),cache=new Map();
  const load=async name=>{if(cache.has(name))return cache.get(name);const bytes=files[prefix+name]||files[name];if(!bytes)throw Error('画像が見つかりません：'+name);const blob=await artwork(bytes,name);cache.set(name,blob);return blob;};
  for(const r of Object.values(data.layouts)){
   r.blob=await load(r.asset);delete r.asset;
   if(r.items.some(i=>i.asset)){
    const c=document.createElement('canvas'),scale=Math.min(3,1800/Math.max(r.artFrame.width,r.artFrame.height));c.width=Math.ceil(r.artFrame.width*scale);c.height=Math.ceil(r.artFrame.height*scale);const context=c.getContext('2d');
    const paint=async(blob,f)=>{const url=URL.createObjectURL(blob);try{const img=new Image();img.src=url;await img.decode();context.drawImage(img,(f.x-r.artFrame.x)*scale,(f.y-r.artFrame.y)*scale,f.width*scale,f.height*scale);}finally{URL.revokeObjectURL(url);}};
    await paint(r.blob,r.artFrame);for(const item of r.items)if(item.asset){await paint(await load(item.asset),item.frame);delete item.asset;}
    r.blob=await new Promise((resolve,reject)=>c.toBlob(b=>b?resolve(b):reject(Error('ボタン画像の変換に失敗しました。')),'image/png'));
   }
  }
  data.key='delta:'+encodeURIComponent(data.identifier||data.name);await dbop('put',data);return install(data);
 }
 async function remove(key){await dbop('delete',key);const s=CELIO_SKINS[key];if(s?.delta)for(const r of Object.values(s.layouts))URL.revokeObjectURL(r.art);delete CELIO_SKINS[key];}
 const ready=dbop('getAll').then(rows=>rows.forEach(install));ready.catch(()=>{});
 return {metadata,unpack,importFile,remove,ready};
})();
