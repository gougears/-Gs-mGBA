// Ball artwork with the existing editable controller; independent of custom layout.
(()=>{
 const fields=['positions','buttonSizes','visibleButtons','gridSize','scale'];
 const copy=o=>JSON.parse(JSON.stringify(o));let layouts={};try{layouts=JSON.parse(localStorage.getItem('gs-ball-layouts-v1')||'{}')||{};}catch{}
 let editing=null;
 const supported=key=>key!=='custom'&&key!=='Cobalt'&&!!CELIO_SKINS[key]&&!CELIO_SKINS[key].delta;
 const pick=()=>Object.fromEntries(fields.map(k=>[k,copy(settings[k]??(k==='gridSize'?16:k==='scale'?100:{}))]));
 function background(key){const pad=$('padarea');pad.querySelector('.ball-layout-art')?.remove();pad.classList.toggle('ball-free-layout',!!key);if(!key)return;const base=CELIO_SKINS[key],art=document.createElement('div');art.className='ball-layout-art';art.style.backgroundColor=base.bodyColor||'#eef2f2';const layer=document.createElement('div');layer.style.cssText='position:absolute;left:0;width:100%;height:100%;background-repeat:no-repeat;background-size:100% auto';layer.style.backgroundImage='url("'+(base.artPlain||base.artBody||'skins/'+key+'-body.svg')+'")';layer.style.top=base.artPlain?'0':(-90*pad.clientWidth/320)+'px';art.append(layer);pad.prepend(art);}
 const originalDraw=drawSkin,originalPositions=applyPositions;
 function withLayout(fn){const key=settings.skin,cfg=layouts[key];if(!supported(key)||!cfg?.active||editing)return fn();const before=pick();settings.skin='custom';Object.assign(settings,copy(cfg.data));try{return fn();}finally{settings.skin=key;Object.assign(settings,before);}}
 drawSkin=function(){const key=settings.skin;withLayout(()=>originalDraw());background(editing||(supported(key)&&layouts[key]?.active?key:null));if(supported(key)&&layouts[key]?.active){$('skinhand').closest('label').hidden=false;$('skinhand').value='free';withLayout(()=>originalPositions());}};
 applyPositions=function(){return withLayout(()=>originalPositions());};
 const option=document.createElement('option');option.value='free';option.textContent='自由配置';$('skinhand').append(option);
 const oldChange=$('skinhand').onchange;$('skinhand').onchange=e=>{const key=settings.skin;if(e.target.value==='free'){if(layouts[key]?.data){layouts[key].active=true;localStorage.setItem('gs-ball-layouts-v1',JSON.stringify(layouts));drawSkin();}else $('layout-live-open').click();return;}if(layouts[key]){layouts[key].active=false;localStorage.setItem('gs-ball-layouts-v1',JSON.stringify(layouts));}oldChange(e);};
 window.gsBallLayout={
  begin(){const key=settings.skin;if(!supported(key))return null;editing=key;if(layouts[key]?.data)Object.assign(settings,copy(layouts[key].data));return key;},
  save(key){const next={...layouts,[key]:{active:true,data:pick()}};localStorage.setItem('gs-ball-layouts-v1',JSON.stringify(next));layouts=next;},
  finish(){editing=null;}
 };
 $('layout-live-open').textContent='実際の画面でボタン配置を編集';drawSkin();
})();
