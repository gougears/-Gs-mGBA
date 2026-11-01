'use strict';
(()=>{
 // Dedicated moulded controls: independent geometry for badges, shells and D-pad.
 const materials=new Map();
 function material(key,t){
  if(materials.has(key))return materials.get(key);
  const moon=key==='MoonBall',gold=t.edge,navy='#09234c',color=t.color;
  const raw=decodeURIComponent(t.art.split(',')[1]).replace(/^<svg[^>]*>|<\/svg>$/g,'');
  const crescent='<path d="M30 0A25 25 0 1 0 48 39A24 24 0 0 1 30 0Z" fill="url(#gold)"/>';
  const badge=moon?crescent:`<svg width="50" height="50" viewBox="0 0 320 112" preserveAspectRatio="xMidYMid slice">${raw}</svg>`;
  const defs=`<defs><linearGradient id="gold" x2=".3" y2="1"><stop stop-color="#fff8c0"/><stop offset=".3" stop-color="${gold}"/><stop offset=".6" stop-color="#a06b19"/><stop offset=".8" stop-color="#ffe48a"/><stop offset="1" stop-color="${gold}"/></linearGradient><linearGradient id="paint" x2=".25" y2="1"><stop stop-color="#b7ffff"/><stop offset=".15" stop-color="${color}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="#063349"/></linearGradient><radialGradient id="shade" cx=".3" cy=".2" r=".85"><stop stop-color="white" stop-opacity=".25"/><stop offset=".45" stop-color="white" stop-opacity="0"/><stop offset=".85" stop-opacity=".1"/><stop offset="1" stop-opacity=".7"/></radialGradient><linearGradient id="cream" x2=".7" y2="1"><stop stop-color="#fffef7"/><stop offset=".55" stop-color="#ece7d7"/><stop offset="1" stop-color="#938779"/></linearGradient></defs>`;
  const svg=(w,h,body)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${defs}${body}</svg>`);
  const rim=(shape)=>`${shape('fill="#081b2b" stroke="#06121c" stroke-width="10"')}${shape('fill="none" stroke="url(#gold)" stroke-width="6"')}${shape('fill="none" stroke="#fff9d1" stroke-width="1"')}`;
  const panelShape=a=>`<rect x="6" y="6" width="308" height="100" rx="28" ${a}/>`;
  const panel=svg(320,112,`${rim(panelShape)}<rect x="13" y="13" width="294" height="86" rx="22" fill="url(#paint)" stroke="#75e7f3" stroke-width="2"/><clipPath id="p"><rect x="14" y="14" width="292" height="84" rx="21"/></clipPath><g clip-path="url(#p)"><path d="M0 0H142L65 112H0Z" fill="${navy}"/><path d="M142 0L65 112" stroke="url(#gold)" stroke-width="6"/><g transform="translate(26 32) scale(.8)">${badge}</g><rect width="320" height="112" fill="url(#shade)"/></g><path d="M22 43Q19 20 43 20H278Q299 21 299 38" fill="none" stroke="white" stroke-width="3"/><path d="M23 79Q24 92 44 92H278Q295 90 299 78" fill="none" stroke="#69efff" stroke-width="3"/><ellipse cx="30" cy="29" rx="13" ry="6" fill="white" transform="rotate(-30 30 29)"/>`);
  const orb=svg(240,240,`<circle cx="120" cy="120" r="116" fill="#081c2c" stroke="#07131d" stroke-width="4"/><circle cx="120" cy="118" r="112" fill="url(#cream)" stroke="url(#gold)" stroke-width="3"/><clipPath id="o"><circle cx="120" cy="118" r="109"/></clipPath><g clip-path="url(#o)">${moon?`<path d="M0 0H240V143Q120 176 0 143Z" fill="url(#paint)"/><path d="M98 0H240V143Q202 155 156 158Z" fill="${navy}"/><g transform="translate(116 26) scale(1.05)">${crescent}</g>`:`<svg width="240" height="155" viewBox="0 0 320 112" preserveAspectRatio="none">${raw}</svg>`}<path d="M0 137Q120 190 240 137" fill="none" stroke="#071928" stroke-width="15"/><path d="M0 148Q120 201 240 148" fill="none" stroke="url(#gold)" stroke-width="2"/><circle cx="120" cy="118" r="109" fill="url(#shade)"/><path d="M26 86Q37 29 104 17" fill="none" stroke="#caffff" stroke-width="5"/><ellipse cx="49" cy="49" rx="24" ry="9" transform="rotate(-48 49 49)" fill="white"/><ellipse cx="207" cy="115" rx="5" ry="14" fill="#b6ddff" opacity=".4"/></g><circle cx="120" cy="168" r="23" fill="#071928" stroke="#fff5c4" stroke-width="2"/><circle cx="120" cy="168" r="18" fill="url(#gold)" stroke="#b78934" stroke-width="2"/><circle cx="120" cy="168" r="13" fill="url(#gold)" stroke="#fff3b2" stroke-width="1"/>`);
  const d='M113 8H187Q199 8 199 20V90Q199 101 210 101H280Q292 101 292 113V187Q292 199 280 199H210Q199 199 199 210V280Q199 292 187 292H113Q101 292 101 280V210Q101 199 90 199H20Q8 199 8 187V113Q8 101 20 101H90Q101 101 101 90V20Q101 8 113 8Z';
  const shape=a=>`<path d="${d}" ${a}/>`;
  const cross=svg(300,300,`${rim(shape)}<clipPath id="d">${shape('')}</clipPath><g clip-path="url(#d)">${shape(`fill="${navy}"`)}${[0,90,180,270].map(a=>`<g transform="rotate(${a} 150 150)"><path d="M107 14H193V83L150 132 107 83Z" fill="url(#paint)" stroke="url(#gold)" stroke-width="3"/><path d="M112 51V24Q112 18 126 18H181" fill="none" stroke="white" stroke-width="3"/><path d="M113 20L188 89 150 128 112 82Z" fill="#5ee9ff" opacity=".18"/></g>`).join('')}${shape('fill="url(#shade)"')}<circle cx="150" cy="150" r="39" fill="${navy}" stroke="url(#gold)" stroke-width="5"/><circle cx="150" cy="150" r="33" fill="url(#shade)" stroke="#6ab3d8"/><g transform="translate(126 125)">${badge}</g></g>${shape('fill="none" stroke="#e7ffff" stroke-width="1"')}`);
  const capture=svg(120,120,`<circle cx="60" cy="60" r="56" fill="${navy}" stroke="#091822" stroke-width="6"/><circle cx="60" cy="60" r="52" fill="url(#shade)" stroke="url(#gold)" stroke-width="4"/><circle cx="60" cy="60" r="33" fill="url(#cream)"/><circle cx="60" cy="60" r="18" fill="#aab6c0"/><path d="M22 44Q28 21 52 16" fill="none" stroke="white" stroke-width="5"/>`);
  const result={panel,orb,cross,capture};materials.set(key,result);return result;
 }
 let style='ball';try{if(localStorage.getItem('gs-ball-button-style')==='normal')style='normal';}catch{}
 const field=document.createElement('label');field.className='field';field.innerHTML='ボールスキンのボタン<select id="ball-button-style"><option value="normal">通常</option><option value="ball">ボールデザイン（光沢・立体）</option></select>';
 $('skinselect').closest('label').after(field);const choice=$('ball-button-style');choice.value=style;
 choice.onchange=()=>{style=choice.value;try{localStorage.setItem('gs-ball-button-style',style);}catch{}drawSkin();};
 function apply(){const area=$('padarea'),key=window.gsBallLayout?.skinKey||settings.skin,t=CELIO_SKINS[key]?.buttonTheme;
  area.classList.toggle('ball-buttons',style==='ball'&&!!t);field.hidden=!t;
  area.querySelectorAll('.ball-button,.ball-round,.ball-direction').forEach(e=>e.classList.remove('ball-button','ball-round','ball-direction'));
  if(style!=='ball'||!t)return;
  const m=material(key,t);for(const [k,v] of Object.entries(m))area.style.setProperty('--mould-'+k,'url("'+v+'")');
  area.style.setProperty('--ball-color',t.color);area.style.setProperty('--ball-edge',t.edge);area.style.setProperty('--ball-art','url("'+t.art+'")');area.style.setProperty('--ball-panel','url("'+t.panel+'")');
  for(const b of area.querySelectorAll('button.skin-hit,.padgroup button')){
   if(b.classList.contains('direction-arm')||b.closest('.dpad'))continue;
   b.classList.add('ball-button');
   const k=b.dataset.key;
   if((k==='0'||k==='1')&&!b.dataset.keys||b.dataset.screenshot)b.classList.add('ball-round');
   b.classList.toggle('ball-capture',!!b.dataset.screenshot);
   if(b.dataset.screenshot&&area.classList.contains('skin-mode')&&!landscapeSkin())Object.assign(b.style,{left:(139/320*100)+'%',top:(163/portraitSkinHeight*100)+'%',width:(42/320*100)+'%',height:(42/portraitSkinHeight*100)+'%'});
  }
  for(const d of area.querySelectorAll('.cross-direction,.dpad,.stick-control'))d.classList.add('ball-direction');
 }
 const old=drawSkin;drawSkin=function(){old();apply();};drawSkin();
})();
