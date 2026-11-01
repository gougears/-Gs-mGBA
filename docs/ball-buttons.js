'use strict';
(()=>{
 let style='ball';try{if(localStorage.getItem('gs-ball-button-style')==='normal')style='normal';}catch{}
 const field=document.createElement('label');field.className='field';field.innerHTML='ボールスキンのボタン<select id="ball-button-style"><option value="normal">通常</option><option value="ball">ボールデザイン（光沢・立体）</option></select>';
 $('skinselect').closest('label').after(field);const choice=$('ball-button-style');choice.value=style;
 choice.onchange=()=>{style=choice.value;try{localStorage.setItem('gs-ball-button-style',style);}catch{}drawSkin();};
 function apply(){const area=$('padarea'),key=window.gsBallLayout?.skinKey||settings.skin,t=CELIO_SKINS[key]?.buttonTheme;
  area.classList.toggle('ball-buttons',style==='ball'&&!!t);field.hidden=!t;
  area.querySelectorAll('.ball-button,.ball-round,.ball-direction').forEach(e=>e.classList.remove('ball-button','ball-round','ball-direction'));
  if(style!=='ball'||!t)return;
  area.style.setProperty('--ball-color',t.color);area.style.setProperty('--ball-edge',t.edge);area.style.setProperty('--ball-art','url("'+t.art+'")');area.style.setProperty('--ball-panel','url("'+t.panel+'")');
  for(const b of area.querySelectorAll('button.skin-hit,.padgroup button')){
   if(b.classList.contains('direction-arm')||b.closest('.dpad'))continue;
   b.classList.add('ball-button');
   const k=b.dataset.key;
   if((k==='0'||k==='1')&&!b.dataset.keys||b.dataset.screenshot)b.classList.add('ball-round');
  }
  for(const d of area.querySelectorAll('.cross-direction,.dpad,.stick-control'))d.classList.add('ball-direction');
 }
 const old=drawSkin;drawSkin=function(){old();apply();};drawSkin();
})();
