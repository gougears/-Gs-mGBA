'use strict';
// Inputs are recorded after rapid-fire processing, once per emulated frame.
class GSMacroEngine {
 constructor(done=()=>{}){this.done=done;this.mode='idle';this.steps=[];}
 static validate(steps){
  if(!Array.isArray(steps)||!steps.length||steps.length>600)throw Error('操作は1〜600行で入力してください。');
  let total=0;
  const copy=steps.map(s=>{if(!s||!Number.isInteger(s.mask)||s.mask<0||s.mask>1023||!Number.isInteger(s.frames)||s.frames<1||s.frames>36000)throw Error('ボタンや時間の指定が不正です。');total+=s.frames;return {mask:s.mask,frames:s.frames};});
  if(total>36000)throw Error('1回分は約10分以内にしてください。');return copy;
 }
 record(){this.mode='record';this.steps=[];this.total=0;}
 play(steps,repeat){const valid=GSMacroEngine.validate(steps);if(!Number.isInteger(repeat)||repeat<0||repeat>99)throw Error('繰り返しは0〜99回です。');this.steps=valid;this.repeat=repeat;this.round=0;this.index=0;this.tick=0;this.mode='play';}
 stop(){if(this.mode==='idle')return;const mode=this.mode;this.mode='idle';this.done(mode,this.steps.map(s=>({...s})));}
 frame(input){
  if(this.mode==='record'){
   const last=this.steps[this.steps.length-1];
   if(last&&last.mask===input)last.frames++;else if(this.steps.length<600)this.steps.push({mask:input,frames:1});else{this.stop();return input;}
   if(++this.total>=36000)this.stop();return input;
  }
  if(this.mode!=='play')return input;
  const step=this.steps[this.index],output=step.mask;
  if(++this.tick>=step.frames){this.tick=0;if(++this.index===this.steps.length){this.index=0;if(this.repeat&&++this.round>=this.repeat)this.stop();}}
  return output;
 }
}
if(typeof module!=='undefined')module.exports=GSMacroEngine;
if(typeof window!=='undefined')(()=>{
 const labels=['A','B','SELECT','START','RIGHT','LEFT','UP','DOWN','R','L'];
 const storageKey='gs-macros-v1';let data={};try{const v=JSON.parse(localStorage.getItem(storageKey)||'{}');if(v&&typeof v==='object'&&!Array.isArray(v))data=v;}catch{}
 for(const [key,e] of Object.entries(data)){if(key==='show'){data.show=e===true;continue;}try{if(!e||!Array.isArray(e.slots))throw Error();e.slots=e.slots.slice(0,4).map(item=>{try{return {name:String(item.name||'').slice(0,40),repeat:Number.isInteger(item.repeat)&&item.repeat>=0&&item.repeat<=99?item.repeat:1,steps:GSMacroEngine.validate(item.steps)};}catch{return null;}});}catch{delete data[key];}}
 let scope='',slot=0,target='',recordSlot=0;
 const root=document.createElement('div');root.id='macro-settings';root.innerHTML=`<h3>マクロ</h3><p>操作を記録して再生できます。ROM・プレイヤーごとに4枠を端末内へ保存します。</p>
 <label class="field">使用するマクロ<select id="macro-slot"><option value="0">マクロ1</option><option value="1">マクロ2</option><option value="2">マクロ3</option><option value="3">マクロ4</option></select></label>
 <label class="field">名前<input id="macro-name" maxlength="40" placeholder="例：Aボタンを繰り返す"></label>
 <div class="action-grid"><button id="macro-record" type="button">操作を記録</button><button id="macro-play" type="button">再生する</button></div>
 <button id="macro-stop" type="button">停止・記録を保存</button>
 <label class="field">繰り返し回数（0＝停止するまで）<input id="macro-repeat" type="number" min="0" max="99" step="1" value="1"></label>
 <details><summary>操作を手動で編集</summary><p>1行に「ボタン 秒数」。同時押しは＋、待ちはWAIT。例：A 0.2 → WAIT 1 → B 0.2 を改行して入力します。方向はUP / DOWN / LEFT / RIGHT。最大600行・約10分です。</p><textarea id="macro-steps" rows="7" spellcheck="false" aria-label="マクロの操作と秒数" placeholder="A 0.2&#10;WAIT 1&#10;B 0.2"></textarea></details>
 <div class="action-grid"><button id="macro-save" type="button">編集内容を保存</button><button id="macro-delete" type="button">この枠を削除</button></div>
 <label class="switchfield"><input id="macro-show" type="checkbox">プレイ画面にマクロボタンを表示</label><p id="macro-status" role="status"></p><p>記録を始めると設定が閉じます。停止ボタンか設定を開く操作で記録を保存します。再生中はマクロの操作を優先します。倍速中はマクロも速くなります。通信中は使用できません。</p>`;
 $('page-rapid').append(root);
 const bar=document.createElement('div');bar.id='macro-bar';bar.hidden=true;bar.innerHTML='<button id="macro-toggle" type="button">マクロ再生</button><button id="macro-emergency" type="button">停止</button>';document.querySelector('.playbar').after(bar);
 if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>{if(CELIO_SKINS[settings.skin]?.delta)fitDeltaSkin();}).observe(bar);
 const context=()=>loaded?romKey+':player'+activePlayer:'';
 const entry=()=>data[scope]||{slots:[],selected:0};
 const status=text=>{$('macro-status').textContent=text;};
 function persist(){try{localStorage.setItem(storageKey,JSON.stringify(data));return true;}catch{status('端末に保存できませんでした。この画面を閉じる前に操作欄をコピーしてください。');gameNotice('マクロを端末に保存できませんでした。');return false;}}
 function setEntry(key,value){Object.defineProperty(data,key,{value,enumerable:true,writable:true,configurable:true});}
 function syncBar(){const running=engine.mode!=='idle';bar.hidden=!running&&!(loaded&&data.show);$('macro-toggle').textContent=engine.mode==='record'?'● 記録中':engine.mode==='play'?'■ マクロ停止':'▶ マクロ再生';$('macro-emergency').hidden=!running;}
 function render(){
  scope=context();const e=entry();slot=Number.isInteger(e.selected)&&e.selected>=0&&e.selected<4?e.selected:0;
  $('macro-slot').value=slot;const item=e.slots?.[slot];$('macro-name').value=item?.name||'';$('macro-repeat').value=item?.repeat??1;
  $('macro-steps').value=(item?.steps||[]).map(s=>[labels.filter((_,i)=>s.mask&(1<<i)).join('+')||'WAIT',(s.frames/60).toFixed(3)].join(' ')).join('\n');
  $('macro-show').checked=!!data.show;for(const id of ['macro-record','macro-play','macro-save','macro-delete'])$(id).disabled=!scope;
  status(scope?'選択中：'+romName+' / P'+(activePlayer+1)+(item?' · 保存済み':' · 未保存'):'先にROMを開いてください。');syncBar();
 }
 const engine=new GSMacroEngine((mode,steps)=>{
  if(mode==='record'&&steps.length){const e=data[target]||{slots:[],selected:recordSlot};e.slots=e.slots||[];const old=e.slots[recordSlot];e.slots[recordSlot]={name:old?.name||'マクロ'+(recordSlot+1),repeat:old?.repeat??1,steps};setEntry(target,e);const saved=persist();render();if(!saved)status('端末保存に失敗しました。操作欄をコピーして保管してください。');else status('記録を保存しました。');}
  else status('マクロを停止しました。');syncBar();
 });
 function parse(){return GSMacroEngine.validate($('macro-steps').value.trim().split(/\n/).map((line,i)=>{
  const match=line.trim().toUpperCase().match(/^(\S+)\s+(\d+(?:\.\d+)?)$/);if(!match)throw Error((i+1)+'行目は「A 0.2」の形式で入力してください。');
  let mask=0;if(match[1]!=='WAIT')for(const key of match[1].split('+')){const bit=labels.indexOf(key);if(bit<0)throw Error((i+1)+'行目のボタン名が不正です。');mask|=1<<bit;}
  return {mask,frames:Math.round(Number(match[2])*60)};
 }));}
 function save(){if(!scope||scope!==context())throw Error('ROMが変わりました。設定を開き直してください。');const repeat=Number($('macro-repeat').value);if(!Number.isInteger(repeat)||repeat<0||repeat>99)throw Error('繰り返しは0〜99回です。');const steps=parse();const e=entry();e.slots=e.slots||[];e.slots[slot]={name:$('macro-name').value.trim().slice(0,40)||'マクロ'+(slot+1),repeat,steps};e.selected=slot;setEntry(scope,e);if(persist())status('マクロを保存しました。');return e.slots[slot];}
 function ready(){if(!loaded||busy||!startupStarted){gameNotice('ゲームを開始してから操作してください。');return false;}if(link?.active){gameNotice('通信を終了してからマクロを使用してください。');return false;}return true;}
 function start(record,fromEditor=false){
  if(engine.mode!=='idle'){engine.stop();return;}if(!ready())return;
  try{
   if(scope!==context())render();
   const item=record?null:(fromEditor?save():entry().slots?.[slot]);if(!record&&!item)throw Error('設定 → 一般 → 連射・マクロで操作を登録してください。');
   if(!record)GSMacroEngine.validate(item.steps);
   closeSettings();document.activeElement?.blur();pause(false);stopRapid();target=context();recordSlot=slot;
   if(record)engine.record();else engine.play(item.steps,item.repeat);
   status(record?'記録中：プレイ画面で操作してください。':'マクロ再生中');syncBar();
  }catch(e){gameNotice(e.message);status(e.message);}
 }
 window.gsMacro={frame(input){if(engine.mode!=='idle'&&(target!==context()||link?.active||paused||busy||document.hidden)){engine.stop();return input;}return engine.frame(input);},cancel(){engine.stop();},toggle(){start(false);}};
 $('macro-slot').onchange=()=>{engine.stop();const selected=+$('macro-slot').value;const e=entry();e.selected=selected;if(scope){setEntry(scope,e);persist();}render();};
 $('macro-record').onclick=()=>start(true);$('macro-play').onclick=()=>start(false,true);
 $('macro-stop').onclick=$('macro-emergency').onclick=()=>engine.stop();$('macro-toggle').onclick=()=>start(false);
 $('macro-save').onclick=()=>{try{save();}catch(e){status(e.message);}};
 $('macro-delete').onclick=()=>{if(!scope||!confirm('このマクロを削除しますか？'))return;engine.stop();const e=entry();if(e.slots)delete e.slots[slot];setEntry(scope,e);persist();render();};
 $('macro-show').onchange=()=>{data.show=$('macro-show').checked;persist();syncBar();};
 $('settingsopen').addEventListener('click',render);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)engine.stop();});window.addEventListener('blur',()=>engine.stop());
 // Reflect ROM/player changes even when settings were already open during loading.
 let previous=context();setInterval(()=>{const key=context();if(key!==previous){previous=key;engine.stop();render();}},300);
 render();
})();
