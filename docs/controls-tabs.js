'use strict';
(()=>{
 const host=$('page-controls'),children=[...host.children],nav=document.createElement('nav');nav.className='controls-subtabs';nav.setAttribute('role','tablist');nav.setAttribute('aria-label','操作とスキンの設定');
 const names=[['input','操作'],['skin','スキン'],['photo','画像作成'],['layout','配置']];const panels={};let current='input';
 for(const [key,title]of names){const p=document.createElement('div');p.id='controls-'+key;p.className='controls-subpage';p.setAttribute('role','tabpanel');p.setAttribute('aria-labelledby','controls-tab-'+key);panels[key]=p;const b=document.createElement('button');b.id='controls-tab-'+key;b.type='button';b.textContent=title;b.setAttribute('role','tab');b.setAttribute('aria-controls',p.id);b.onclick=()=>select(key);b.onkeydown=e=>{if(!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();const i=names.findIndex(n=>n[0]===key),next=names[(i+(e.key==='ArrowRight'?1:3))%4][0];select(next);$('controls-tab-'+next).focus({preventScroll:true});};nav.append(b);}
 for(const node of children){if(node.tagName==='H3'){if(node.textContent.includes('スキン'))current='skin';if(node.textContent==='ボタン配置')current='layout';}if(node.contains($('photo-skin-file')))panels.photo.append(node);else panels[current].append(node);}
 host.append(nav,...names.map(([key])=>panels[key]));
 function select(key){for(const [k]of names){panels[k].hidden=k!==key;const b=$('controls-tab-'+k);b.setAttribute('aria-selected',String(k===key));b.tabIndex=k===key?0:-1;}}
 select('input');
})();
