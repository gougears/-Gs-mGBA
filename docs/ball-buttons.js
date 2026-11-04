'use strict';
(()=>{
 // Dedicated moulded controls: independent geometry for badges, shells and D-pad.
 // Purpose-drawn 50 x 50 emblems, not cropped controller backgrounds.
 const emblemPath=(d,c='url(#gold)',w=0)=>`<path d="${d}" fill="${w?'none':c}"${w?` stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`:''}/>`;
 const disc=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
 function emblem(key){
  const p=emblemPath,c=disc,white='#fff5d9',gold='url(#gold)';
  const ball=(top,bottom='#fff6de',band='#142635')=>c(25,25,23,bottom)+p('M2 25A23 23 0 0 1 48 25Z',top)+p('M3 25H47',band,5)+c(25,25,9,band)+c(25,25,5,white);
  const wing=(ink,n)=>Array.from({length:n},(_,i)=>p(`M5 ${20+i*12}L25 ${4+i*12}L45 ${20+i*12}`,ink,5)).join('');
  const map={
   PokeBall:ball('#ed414e'),GreatBall:ball('#268bcc')+p('M9 17L14 8 20 13M30 13L36 8 41 17','#f34b4d',5),
   UltraBall:p('M5 44V6H15V20H35V6H45V44H35V30H15V44Z'),
   MasterBall:p('M5 40V12L15 7 25 25 35 7 45 12V40H36V23L25 39 14 23V40Z','#f8e9ff'),
   LoveBall:p('M25 45L5 25C-7 9 16-4 25 12C35-4 57 9 45 25Z','#ff9ac9'),
   MoonBall:p('M30 0A25 25 0 1 0 48 39A24 24 0 0 1 30 0Z'),
   QuickBall:p('M3 3L21 21 3 47H15L25 33 35 47H47L29 21 47 3H35L25 13 15 3Z'),
   DiveBall:p('M2 19Q9 5 18 19T34 19T50 19M2 34Q9 20 18 34T34 34T50 34','#a6edff',6),
   LuxuryBall:ball('#252a30','#252a30','#d8b051')+p('M7 12H43','#ed5050',4),GoldBall:ball('#edc347','#c49b34','#704c21'),
   BeastBall:p('M25 2L32 16 48 25 32 32 25 48 18 32 2 25 18 16Z')+p('M25 12L37 25 25 38 13 25Z','#5ae3ff',4),
   CherishBall:p('M10 5Q1 25 10 45M40 5Q49 25 40 45','#ffb379',6)+p('M17 8Q25 17 33 8L30 39H20Z','#ff634b'),
   SafariBall:p('M5 5H22L26 16 13 23 4 16Z','#a6bb62')+p('M29 3L46 8 44 25 32 21 26 12Z','#d9c394')+p('M7 29L24 23 39 34 31 47 10 44Z','#79995c'),
   FastBall:p('M27 1L5 29H22L17 49 46 17H28L36 1Z'),
   LevelBall:p('M3 7L25 44 47 7H34L25 24 16 7Z','#f04b3b'),
   LureBall:p('M4 4L25 24 46 4M25 24V45','#fa5053',7)+p('M8 7L25 22 42 7',gold,3),
   HeavyBall:c(25,25,22,'#b0bec5')+[8,42].map(x=>[12,36].map(y=>c(x,y,6,'#3865a3')).join('')).join('')+c(25,25,8,'#425369'),
   FriendBall:p('M25 3L31 14 44 17 34 27 36 42 25 35 14 42 16 27 6 17 19 14Z','#f5e572')+c(25,24,6,'#ef575a'),
   SportBall:p('M37 8H17Q7 8 7 19Q7 27 24 27H31Q43 27 43 37Q43 45 31 45H12',white,7),
   DreamBall:p('M25 4C3 4 2 24 20 25C36 26 32 9 21 14C12 19 26 32 41 27Q49 39 32 46H10','#e591c4',6),
   NetBall:[8,24,40].map(x=>p(`M${x} 3V47M3 ${x}H47`,'#77d7e0',3)).join(''),
   NestBall:p('M4 40Q25 12 46 40M8 26Q25 0 42 26','#e2d66d',7),
   RepeatBall:p('M37 9A19 19 0 1 0 43 33',gold,7)+p('M30 3L46 4 44 20Z'),
   TimerBall:p('M10 3H40M10 47H40M14 5Q14 18 25 25Q36 32 36 45M36 5Q36 18 25 25Q14 32 14 45',white,5)+p('M25 25L35 39H15Z','#ef6041'),
   PremierBall:ball('#fffdf2','#fffdf2','#dd4850'),
   DuskBall:p('M25 2L46 15V35L25 48 4 35V15Z','#71b75b')+p('M25 12L36 19V31L25 38 14 31V19Z','#ed6e36'),
   HealBall:p('M18 4H32V18H46V32H32V46H18V32H4V18H18Z','#e9c7ed'),
   StrangeBall:ball('#83e3bd','#b8f4d7','#478e72'),
   OriginBall:p('M25 2L46 14 40 38 25 48 8 35 3 13Z','#f26b46')+p('M25 2L18 23 3 13M18 23L8 35M18 23L40 38M18 23L46 14','#ffce82',3),
   HisuiPokeBall:ball('#d56b32','#c9b57d','#75674b'),
   HisuiGreatBall:ball('#396da1','#c9b57d','#75674b')+p('M9 16L16 6M34 6L41 16','#df7545',5),
   HisuiUltraBall:p('M7 46L13 4H22L18 20H32L28 4H37L43 46H32V30H18V46Z','#d7b744'),
   FeatherBall:wing('#83d8e2',2),WingBall:wing('#f3efd0',3),JetBall:wing('#87e7ec',3)+p('M25 2V46','#fff9d7',3),
   HisuiHeavyBall:ball('#434d53','#788386','#bcc4b7'),
   LeadenBall:p('M9 43V17Q9 4 25 4Q41 4 41 17V43','#c5af59',8)+c(25,25,8,'#98a1a1'),
   GigatonBall:[10,25,40].map(x=>p(`M${x} 44V12Q${x} 4 ${x+1} 4`,'#9ea6a0',7)+c(x,22,4,'#24333e')).join('')
  };
  if(!map[key])throw new Error('Missing ball emblem: '+key);
  return map[key];
 }
 // Match ink to each material, with separate choices for the patterned A/B faces.
 const luminance=hex=>{const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*c[0]+.7152*c[1]+.0722*c[2];};
 const inkFor=color=>luminance(color)>.32?{ink:'#102131',outline:'#fffdf1'}:{ink:'#ffffff',outline:'#102131'};
 const orbLight=new Set(['SafariBall','HeavyBall','DreamBall','NestBall','RepeatBall','TimerBall','PremierBall','HealBall','StrangeBall','FeatherBall','JetBall','GoldBall']);
 const materials=new Map();
 function material(key,t){
  if(materials.has(key))return materials.get(key);
  const moon=key==='MoonBall',gold=t.edge,navy='#09234c',color=t.color;
  let raw=decodeURIComponent(t.art.split(',')[1]).replace(/^<svg[^>]*>|<\/svg>$/g,'');
  if(key==='CherishBall')raw='<rect width="320" height="240" fill="#be1732"/><path d="M0 78Q28 80 37 107H283Q292 80 320 78V157Q288 159 281 136H39Q32 158 0 157Z" fill="#464744"/><path d="M0 118H320" stroke="#8b1128" stroke-width="9"/><circle cx="160" cy="118" r="34" fill="#41433f"/><circle cx="160" cy="118" r="24" fill="#a80b29"/><circle cx="160" cy="118" r="17" fill="#c51a37"/>';
  const sourceDoc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+raw+'</svg>','image/svg+xml');
  const centreGroup=Array.from(sourceDoc.querySelectorAll('g')).find(e=>(e.getAttribute('transform')||'').startsWith('translate(160 118)'));
  const centreArt=centreGroup?centreGroup.outerHTML:Array.from(sourceDoc.documentElement.children).filter(e=>e.tagName==='circle'&&e.getAttribute('cx')==='160').map(e=>e.outerHTML).join('');
  const shellDoc=sourceDoc.cloneNode(true);
  for(const e of shellDoc.querySelectorAll('circle'))if(e.getAttribute('cx')==='160')e.remove();
  for(const e of shellDoc.querySelectorAll('g'))if((e.getAttribute('transform')||'').startsWith('translate(160 118)'))e.remove();
  const fullShell=shellDoc.documentElement.innerHTML;
  const badge=emblem(key);
  const defs=`<defs><linearGradient id="gold" x2=".3" y2="1"><stop stop-color="#fff8c0"/><stop offset=".3" stop-color="${gold}"/><stop offset=".6" stop-color="#a06b19"/><stop offset=".8" stop-color="#ffe48a"/><stop offset="1" stop-color="${gold}"/></linearGradient><linearGradient id="paint" x2=".25" y2="1"><stop stop-color="#b7ffff"/><stop offset=".15" stop-color="${color}"/><stop offset=".6" stop-color="${color}"/><stop offset="1" stop-color="#063349"/></linearGradient><radialGradient id="shade" cx=".3" cy=".2" r=".85"><stop stop-color="white" stop-opacity=".25"/><stop offset=".45" stop-color="white" stop-opacity="0"/><stop offset=".85" stop-opacity=".1"/><stop offset="1" stop-opacity=".7"/></radialGradient><linearGradient id="cream" x2=".7" y2="1"><stop stop-color="#fffef7"/><stop offset=".55" stop-color="#ece7d7"/><stop offset="1" stop-color="#938779"/></linearGradient></defs>`;
  const svg=(w,h,body)=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${defs}${body}</svg>`);
  const rim=(shape)=>`${shape('fill="#081b2b" stroke="#06121c" stroke-width="10"')}${shape('fill="none" stroke="url(#gold)" stroke-width="6"')}${shape('fill="none" stroke="#fff9d1" stroke-width="1"')}`;
  const panelShape=a=>`<rect x="6" y="6" width="308" height="100" rx="28" ${a}/>`;
  const panel=svg(320,112,`${rim(panelShape)}<rect x="13" y="13" width="294" height="86" rx="22" fill="url(#paint)" stroke="#75e7f3" stroke-width="2"/><clipPath id="p"><rect x="14" y="14" width="292" height="84" rx="21"/></clipPath><g clip-path="url(#p)"><path d="M0 0H142L65 112H0Z" fill="${navy}"/><path d="M142 0L65 112" stroke="url(#gold)" stroke-width="6"/><g transform="translate(26 32) scale(.8)">${badge}</g><rect width="320" height="112" fill="url(#shade)"/></g><path d="M22 43Q19 20 43 20H278Q299 21 299 38" fill="none" stroke="white" stroke-width="3"/><path d="M23 79Q24 92 44 92H278Q295 90 299 78" fill="none" stroke="#69efff" stroke-width="3"/><ellipse cx="30" cy="29" rx="13" ry="6" fill="white" transform="rotate(-30 30 29)"/>`);
  // Use the entire original ball face: original lower shell, seam and latch.
  const orb=svg(240,240,`<defs><clipPath id="o"><circle cx="120" cy="120" r="113"/></clipPath></defs><circle cx="120" cy="120" r="117" fill="#16232c"/><g clip-path="url(#o)"><svg x="7" y="7" width="226" height="226" viewBox="0 0 320 240" preserveAspectRatio="none">${fullShell}</svg><g transform="translate(120 118.12) scale(.8) translate(-160 -118)">${centreArt}</g><circle cx="120" cy="120" r="113" fill="url(#shade)"/><path d="M28 77Q45 29 100 17" fill="none" stroke="#ffffffba" stroke-width="4"/><ellipse cx="46" cy="49" rx="20" ry="7" transform="rotate(-48 46 49)" fill="white" opacity=".85"/></g>`);
  const d='M113 8H187Q199 8 199 20V90Q199 101 210 101H280Q292 101 292 113V187Q292 199 280 199H210Q199 199 199 210V280Q199 292 187 292H113Q101 292 101 280V210Q101 199 90 199H20Q8 199 8 187V113Q8 101 20 101H90Q101 101 101 90V20Q101 8 113 8Z';
  const shape=a=>`<path d="${d}" ${a}/>`;
  const cross=svg(300,300,`${rim(shape)}<clipPath id="d">${shape('')}</clipPath><g clip-path="url(#d)">${shape(`fill="${navy}"`)}${[0,90,180,270].map(a=>`<g transform="rotate(${a} 150 150)"><path d="M107 14H193V83L150 132 107 83Z" fill="url(#paint)" stroke="url(#gold)" stroke-width="3"/><path d="M112 51V24Q112 18 126 18H181" fill="none" stroke="white" stroke-width="3"/><path d="M113 20L188 89 150 128 112 82Z" fill="#5ee9ff" opacity=".18"/></g>`).join('')}${shape('fill="url(#shade)"')}<circle cx="150" cy="150" r="39" fill="${navy}" stroke="url(#gold)" stroke-width="5"/><circle cx="150" cy="150" r="33" fill="url(#shade)" stroke="#6ab3d8"/><g transform="translate(126 125)">${badge}</g></g>${shape('fill="none" stroke="#e7ffff" stroke-width="1"')}`);
  // The screenshot control is only the original centre component, with no badge.
  const centreRadius=centreGroup?36:key==='CherishBall'?34:21;
  const capture=svg(120,120,`<g transform="translate(60 60) scale(${56/centreRadius}) translate(-160 -118)">${centreArt}</g>`);
  const doc=new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">'+raw+'</svg>','image/svg+xml');
  for(const e of doc.querySelectorAll('circle'))if(e.getAttribute('cx')==='160')e.remove();
  for(const e of doc.querySelectorAll('g'))if((e.getAttribute('transform')||'').startsWith('translate(160 118)'))e.remove();
  // A shallow raised edge follows the existing painted motifs without changing their shape.
  for(const e of doc.querySelectorAll('path')){
   if(e.getAttribute('fill')!=='none'&&!e.hasAttribute('stroke'))e.setAttribute('filter','url(#shell-relief)');
  }
  const relief='<defs><filter id="shell-relief" x="-10%" y="-10%" width="120%" height="120%"><feDropShadow dx="0" dy="1.1" stdDeviation=".6" flood-color="#07121d" flood-opacity=".38"/><feDropShadow dx="0" dy="-.7" stdDeviation=".35" flood-color="#ffffff" flood-opacity=".45"/></filter></defs>';
  const seamLine=centreGroup?'M0 112Q160 128 320 112':'M0 118H320';
  const seamEdge=`<path d="${seamLine}" transform="translate(0 -5)" fill="none" stroke="#ffffff" stroke-opacity=".42" stroke-width="1.4"/><path d="${seamLine}" transform="translate(0 6)" fill="none" stroke="#07121d" stroke-opacity=".32" stroke-width="2"/>`;
  const clean=relief+doc.documentElement.innerHTML+seamEdge;
  const ground=doc.querySelector('rect')?.getAttribute('fill')||CELIO_SKINS[key].bodyColor||'#f2f0ed';
  const header=({PokeBall:'#532933',GreatBall:'#203653',UltraBall:'#282a2b',QuickBall:'#203e59',DiveBall:'#194658',LuxuryBall:'#29272b'})[key];
  const offset=header?83:66,seam=offset+118;
  const backdrop=svg(320,240,clean);
  const portrait=svg(320,306,`<rect width="320" height="306" fill="${ground}"/><g transform="translate(0 ${offset})">${clean}</g>${header?`<rect width="320" height="90" fill="${header}"/>`:""}`);
  const result={panel,orb,cross,capture,backdrop,portrait,ground,seam};materials.set(key,result);return result;
 }
 let style='ball';try{if(localStorage.getItem('gs-ball-button-style')==='normal')style='normal';}catch{}
 const field=document.createElement('label');field.className='field';field.innerHTML='ボールスキンのボタン<select id="ball-button-style"><option value="normal">通常</option><option value="ball">ボールデザイン（光沢・立体）</option></select>';
 $('skinselect').closest('label').after(field);const choice=$('ball-button-style');choice.value=style;
 choice.onchange=()=>{style=choice.value;try{localStorage.setItem('gs-ball-button-style',style);}catch{}drawSkin();};
 function apply(){const area=$('padarea'),key=window.gsBallLayout?.skinKey||settings.skin,t=CELIO_SKINS[key]?.buttonTheme;
  area.classList.toggle('ball-buttons',style==='ball'&&!!t);field.hidden=!t;
  area.querySelectorAll('.ball-button,.ball-round,.ball-direction').forEach(e=>e.classList.remove('ball-button','ball-round','ball-direction'));
  area.querySelectorAll('.ball-shell-art,.ball-shell-sheen').forEach(e=>e.remove());
  if(style!=='ball'||!t)return;
  const m=material(key,t),panelInk=inkFor(t.color),orbInk=orbLight.has(key)?inkFor('#f5f1df'):inkFor('#172737');
  for(const [part,colors] of [['label',panelInk],['arrow',panelInk],['orb-label',orbInk]]){area.style.setProperty('--ball-'+part,colors.ink);area.style.setProperty('--ball-'+part+'-outline',colors.outline);}
  for(const [k,v] of Object.entries(m).filter(([k])=>!['ground','seam'].includes(k)))area.style.setProperty('--mould-'+k,'url("'+v+'")');
  const shell=document.createElement('div');shell.className='ball-shell-art';
  shell.style.backgroundColor=m.ground;
  shell.style.backgroundImage='url("'+(area.classList.contains('skin-mode')&&!landscapeSkin()?m.portrait:m.backdrop)+'")';
  shell.style.backgroundSize=landscapeSkin()?'100% 100%':'100% auto';area.prepend(shell);
  const sheen=document.createElement('div');sheen.className='ball-shell-sheen';
  sheen.dataset.finish=['LuxuryBall','GoldBall','HeavyBall','HisuiHeavyBall','LeadenBall','GigatonBall','UltraBall','HisuiUltraBall'].includes(key)?'metal':'resin';shell.after(sheen);
  area.style.setProperty('--ball-color' ,t.color);area.style.setProperty('--ball-edge',t.edge);area.style.setProperty('--ball-art','url("'+t.art+'")');area.style.setProperty('--ball-panel','url("'+t.panel+'")');
  for(const b of area.querySelectorAll('button.skin-hit,.padgroup button')){
   if(b.classList.contains('direction-arm')||b.closest('.dpad'))continue;
   b.classList.add('ball-button');
   const k=b.dataset.key;
   if((k==='0'||k==='1')&&!b.dataset.keys||b.dataset.screenshot)b.classList.add('ball-round');
   b.classList.toggle('ball-capture',!!b.dataset.screenshot);
   if(b.dataset.screenshot&&area.classList.contains('skin-mode')&&!landscapeSkin())Object.assign(b.style,{left:(139/320*100)+'%',top:((m.seam-21)/portraitSkinHeight*100)+'%',width:(42/320*100)+'%',height:(42/portraitSkinHeight*100)+'%'});
  }
  for(const d of area.querySelectorAll('.cross-direction,.dpad,.stick-control'))d.classList.add('ball-direction');
 }
 const old=drawSkin;drawSkin=function(){old();apply();};drawSkin();
})();
