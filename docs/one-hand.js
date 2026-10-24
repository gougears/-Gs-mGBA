// Per-skin handedness, kept separate from free-layout coordinates.
(()=>{
 let choices={};try{choices=JSON.parse(localStorage.getItem('gs-skin-hands-v1')||'{}')||{};}catch{}
 const supported=()=>settings.skin!=='custom'&&settings.skin!=='Cobalt'&&!CELIO_SKINS[settings.skin]?.delta;
 const mode=()=>supported()&&['left','right'].includes(choices[settings.skin])?choices[settings.skin]:'normal';
 const field=document.createElement('label');field.className='field';field.innerHTML='持ち方（ボールごとに保存）<select id="skinhand"><option value="normal">通常</option><option value="left">左持ち</option><option value="right">右持ち</option></select><small>片手用は縦画面で使用できます。横画面は通常配置です。</small>';
 $('skinselect').closest('label').after(field);
 const selector=$('skinhand');selector.onchange=()=>{choices[settings.skin]=selector.value;try{localStorage.setItem('gs-skin-hands-v1',JSON.stringify(choices));}catch{}drawSkin();};
 const original=drawSkin;
 drawSkin=function(){original();selector.value=mode();field.hidden=!supported();const area=$('padarea');area.classList.remove('one-hand');if(mode()==='normal'||landscapeSkin()||externalDisplay())return;
  area.classList.add('one-hand');
  // Keep only the decorative body slice, hiding the original control artwork.
  const art=area.querySelector('.skin-art');if(art){const base=CELIO_SKINS[settings.skin],body=art.firstElementChild?.cloneNode(true);art.replaceChildren();if(base.artPlain){const img=document.createElement('img');img.src=base.artPlain;img.alt='';img.style.cssText='width:100%;height:auto;display:block';art.append(img);}else if(body){Object.assign(body.style,{top:(-90*area.clientWidth/320)+'px',height:'100%',backgroundSize:'100% auto'});art.append(body);}}
  const left=mode()==='left',width=area.clientWidth,height=area.clientHeight;
  // 218 x 300 logical layout, anchored to the chosen lower corner.
  const scale=Math.min(1,width/250,height/308),ox=left?8:width-218*scale-8,oy=height-300*scale-5;
  const frames={dpad:[8,112,112,112],a:[158,117,54,54],b:[137,177,54,54],l:[8,62,94,40],r:[112,62,94,40],menu:[8,8,62,40],quickSave:[76,8,62,40],quickLoad:[144,8,62,40],toggleFastForward:[8,234,94,32],select:[8,274,94,26],start:[112,274,94,26],capture:[112,234,94,32]};
  for(const b of area.querySelectorAll('.skin-hit')){const key=b.dataset.screenshot?'capture':b.hasAttribute('data-key')?['a','b','select','start','right','left','up','down','r','l'][+b.dataset.key]:({'十字キー':'dpad','スティック':'dpad','設定':'menu','クイックセーブ':'quickSave','クイックロード':'quickLoad','倍速切替':'toggleFastForward'})[b.getAttribute('aria-label')];const f=frames[key];if(!f){b.hidden=true;continue;}let [x,y,w,h]=f;if(!left)x=218-x-w;
   Object.assign(b.style,{left:(ox+x*scale)+'px',top:(oy+y*scale)+'px',width:w*scale+'px',height:h*scale+'px',fontSize:(key==='a'||key==='b'?26:11)*scale+'px',background:'linear-gradient(#466782,#263d55)',color:'#fff',border:'2px solid #93adbf',boxShadow:'0 4px 0 #152432',borderRadius:key==='a'||key==='b'?'50%':'10px'});
   if(key==='dpad'){b.insertAdjacentHTML('beforeend','<span class="hand-up">▲</span><span class="hand-left">◀</span><span class="hand-right">▶</span><span class="hand-down">▼</span>');b.style.setProperty('background','linear-gradient(#466782,#263d55)','important');b.style.clipPath='polygon(33% 0,67% 0,67% 33%,100% 33%,100% 67%,67% 67%,67% 100%,33% 100%,33% 67%,0 67%,0 33%,33% 33%)';}
   else if(key!=='toggleFastForward')b.textContent=({menu:'MENU',quickSave:'Q.SAVE',quickLoad:'Q.LOAD',capture:'撮影'})[key]||key.toUpperCase();
  }
 };
 drawSkin();
})();
