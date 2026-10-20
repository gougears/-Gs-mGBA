'use strict';
(() => {
 const byId=id=>document.getElementById(id), panel=byId('page-guide');
 const parts=[
 ['方向','十字キー・スティックで移動や項目選択。指を離すと入力を止めます。','.skin-hit[aria-label="十字キー"],.skin-hit[aria-label="スティック"],.padgroup[data-group="dpad"]'],
 ['A','ゲームのAボタン。多くのゲームでは決定・調べる操作です。','.skin-hit[data-key="0"],.ab [data-key="0"]'],
 ['B','ゲームのBボタン。多くのゲームではキャンセル・戻る操作です。','.skin-hit[data-key="1"],.ab [data-key="1"]'],
 ['L / R','ゲームのL・Rボタン。機能はゲームによって異なります。','.skin-hit[data-key="9"],.skin-hit[data-key="8"],.padgroup[data-group="l"],.padgroup[data-group="r"]'],
 ['START / SELECT','ゲームのスタート・セレクトボタン。メニューなど、役割はゲームによって異なります。','.skin-hit[data-key="3"],.skin-hit[data-key="2"],#custom-start,#custom-select'],
 ['設定 / MENU','音量、倍速、ボタン配置、ROM、セーブなどを設定します。','#settingsopen,.skin-hit[aria-label="設定"],#custom-home'],
 ['TURBO','標準速度と、設定した2〜4倍速を切り替えます。通信中は1倍速です。','.skin-hit[aria-label="倍速切替"],#custom-turbo'],
 ['Q.SAVE','選択中のクイックセーブ枠へ現在の状態を保存します。同じ枠は上書きされます。ゲーム内セーブ・.savとは別です。','.skin-hit[aria-label="クイックセーブ"],#custom-quickSave'],
 ['Q.LOAD','選択中のクイックセーブ枠から再開します。未保存の進行は戻りません。通信中は使えません。','.skin-hit[aria-label="クイックロード"],#custom-quickLoad'],
 ['連射','「連射」→連射したいゲームボタンの順に押します。もう一度「連射」で解除。速さは設定で変更できます。','#rapidbutton,#custom-rapid,.skin-hit[aria-label="連射"]'],
 ['撮影','撮影ボタンからスクリーンショット・録画を選びます。録画中に撮影ボタンをもう一度押すと終了。保存する操作まで行ってください。','[data-screenshot]' ],
 ['P1 / P2','1台通信で相手側のROMも読み込んだ後、操作するプレイヤーを切り替えます。','#playerlabel'],
 ['通信','1台で2つのゲームを動かす通信、またはオンライン通信を設定します。オンライン通信にはネットが必要です。','#netshortcut']
 ];
 let selected=0, boxes=[], scale=1, snapshot=null;
 const list=byId('guide-buttons'), detail=byId('guide-detail'), stage=byId('guide-stage');
 function select(i){selected=i;detail.textContent=parts[i][0]+'：'+parts[i][1];for(const [j,b]of [...list.children].entries())b.setAttribute('aria-pressed',String(i===j));highlight();}
 function highlight(){stage.querySelectorAll('.guide-mark').forEach(n=>n.remove());for(const r of boxes[selected]||[]){const mark=document.createElement('span');mark.className='guide-mark';Object.assign(mark.style,{left:r.x*scale+'px',top:r.y*scale+'px',width:r.w*scale+'px',height:r.h*scale+'px'});stage.append(mark);}}
 for(const [i,part]of parts.entries()){const b=document.createElement('button');b.type='button';b.textContent=part[0];b.onclick=()=>select(i);list.append(b);}
 function render(){
  if(panel.hidden||panel.closest('[hidden]'))return;
  const source=byId('player'), rect=source.getBoundingClientRect();
  if(!rect.width||!rect.height)return;
  const copy=source.cloneNode(true), originals=[source,...source.querySelectorAll('*')], clones=[copy,...copy.querySelectorAll('*')];
  for(let i=0;i<clones.length;i++){
   const original=originals[i], clone=clones[i], css=getComputedStyle(original);
   clone.removeAttribute('id');clone.removeAttribute('name');
   for(const attr of [...clone.attributes])if(attr.name.startsWith('on'))clone.removeAttribute(attr.name);
   for(const property of css)clone.style.setProperty(property,css.getPropertyValue(property));
   if(original.tagName==='CANVAS')clone.getContext('2d')?.drawImage(original,0,0);
   clone.tabIndex=-1;
  }
  copy.inert=true;copy.setAttribute('aria-hidden','true');
  scale=Math.min((stage.clientWidth||320)/rect.width,440/rect.height,1);
  Object.assign(copy.style,{position:'absolute',inset:'auto',left:'0',top:'0',margin:'0',width:rect.width+'px',height:rect.height+'px',minHeight:'0',maxHeight:'none',transformOrigin:'top left',transform:'scale('+scale+')',pointerEvents:'none'});
  stage.replaceChildren(copy);stage.style.height=rect.height*scale+'px';snapshot=copy;
  boxes=parts.map(part=>[...source.querySelectorAll(part[2])].flatMap(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&getComputedStyle(el).display!=='none'?[{x:r.left-rect.left,y:r.top-rect.top,w:r.width,h:r.height}]:[];}));
  byId('guide-caption').textContent='現在の画面・配置のプレビュー（静止画）。説明を押すと位置が光ります。ゲーム入力は行いません。';
  select(selected);
 }
 byId('open-guide').onclick=()=>{const open=panel.hidden;for(const name of ['controls','audio','system','rapid','guide']){byId('page-'+name).hidden=true;byId('open-'+name).setAttribute('aria-expanded','false');}if(open){panel.hidden=false;byId('open-guide').setAttribute('aria-expanded','true');requestAnimationFrame(render);}};
 byId('guide-refresh').onclick=render;
 window.addEventListener('resize',()=>{if(!panel.hidden)requestAnimationFrame(render);});
 select(0);
})();
