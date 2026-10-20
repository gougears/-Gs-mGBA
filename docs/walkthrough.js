'use strict';
(()=>{const panel=$('walkthrough-panel'),toggle=$('topwalkthrough'),frame=$('walkthrough-frame'),pad=$('padarea');
 function position(){if(panel.hidden)return;const p=pad.getBoundingClientRect(),g=$('screen').getBoundingClientRect(),v=window.visualViewport,left=v?.offsetLeft||0,top=v?.offsetTop||0,right=left+(v?.width||innerWidth),bottom=top+(v?.height||innerHeight);
  const x=Math.max(left,p.left),y=Math.max(top,p.top),r=Math.min(right,p.right),b=Math.min(bottom,p.bottom);
  // Choose a controller rectangle that never covers the game screen, including Delta skins.
  const regions=[{x,y:Math.max(y,g.bottom),r,b},{x,y,r:Math.min(r,g.left),b},{x:Math.max(x,g.right),y,r,b},{x,y,r,b:Math.min(b,g.top)}].filter(a=>a.r-a.x>0&&a.b-a.y>0).sort((a,b)=>(b.r-b.x)*(b.b-b.y)-(a.r-a.x)*(a.b-a.y));
  const a=regions[0];if(!a){panel.hidden=true;toggle.setAttribute('aria-expanded','false');gameNotice('攻略を表示するコントローラー領域がありません。縦向きにするか、外部パッドの全画面表示を解除してください。');return;}
  const width=Math.max(1,a.r-a.x-8),available=Math.max(1,a.b-a.y-8),height=panel.classList.contains('large')?available:Math.min(available,Math.max(180,available*.65));
  Object.assign(panel.style,{left:(a.x+4)+'px',top:(a.b-height-4)+'px',right:'auto',width:width+'px',height:height+'px'});
 }
 function show(open){clearKeys();panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open){position();if(!panel.hidden&&!frame.hasAttribute('src'))frame.src='https://docs.pm-start.online/';}else toggle.focus({preventScroll:true});}
 toggle.onclick=()=>show(panel.hidden);$('walkthrough-close').onclick=()=>show(false);$('walkthrough-size').onchange=e=>{panel.classList.toggle('large',e.target.value==='large');position();};
 panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Escape')show(false);});
 let scheduled=false;function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;position();});}
 new ResizeObserver(schedule).observe(pad);new ResizeObserver(schedule).observe($('screen'));new MutationObserver(schedule).observe($('player'),{attributes:true,attributeFilter:['class','style']});addEventListener('resize',schedule);window.visualViewport?.addEventListener('resize',schedule);window.visualViewport?.addEventListener('scroll',schedule);
})();
