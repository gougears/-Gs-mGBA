'use strict';
(()=>{const panel=$('walkthrough-panel'),toggle=$('topwalkthrough'),frame=$('walkthrough-frame');
function show(open){clearKeys();panel.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open&&!frame.hasAttribute('src'))frame.src='https://docs.pm-start.online/';if(!open)toggle.focus({preventScroll:true});}
toggle.onclick=()=>show(panel.hidden);$('walkthrough-close').onclick=()=>show(false);$('walkthrough-size').onchange=e=>panel.classList.toggle('large',e.target.value==='large');
panel.addEventListener('keydown',e=>{e.stopPropagation();if(e.code==='Escape')show(false);});
})();
