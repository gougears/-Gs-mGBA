'use strict';
(()=>{
 const host=document.createElement('section');host.className='settings-card';
 host.innerHTML='<h3>過去の保存データ</h3><p>このブラウザに残っている全ROM・両プレイヤーのデータを確認できます。ROM本体の一覧ではありません。</p><button type="button" id="saved-refresh">保存データを表示・更新</button><p id="saved-status" role="status"></p><div id="saved-confirm" hidden><p id="saved-question"></p><button type="button" id="saved-delete">削除する</button><button type="button" id="saved-cancel">キャンセル</button></div><div id="saved-list"></div>';
 $('page-saves').insertBefore(host,$('page-saves').lastElementChild);
 const status=$('saved-status'),list=$('saved-list');let generation=0,pending=null;
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b;}
 function active(key){return (loaded&&romKey===key)||players.some(p=>p.loaded&&p.romKey===key);}
 function entries(){return new Promise((resolve,reject)=>{const names=['saves','quick','backups','roms','saveMeta'],tx=db.transaction(names,'readonly'),out={};for(const name of names){out[name]=[];const r=tx.objectStore(name).openCursor();r.onsuccess=()=>{const c=r.result;if(c){out[name].push([c.key,c.value]);c.continue();}};}tx.oncomplete=()=>resolve(out);tx.onabort=tx.onerror=()=>reject(tx.error);});}
 const date=at=>at?new Date(at).toLocaleString('ja-JP'):'日時不明（旧データ）';
 function ask(item){pending=item;$('saved-question').textContent=item.title+' を削除しますか？削除すると元に戻せません。';$('saved-confirm').hidden=false;$('saved-cancel').focus();}
 function cancel(){pending=null;$('saved-confirm').hidden=true;}
 $('saved-cancel').onclick=cancel;
 // Read and delete in the same transaction so a concurrent backup cannot be overwritten.
 function remove(item){return new Promise((resolve,reject)=>{const tx=db.transaction(item.store,'readwrite'),os=tx.objectStore(item.store);if(item.store==='backups'){const r=os.get(item.key);r.onsuccess=()=>{const history=r.result||[],next=history.filter(v=>v.at!==item.at);if(next.length)os.put(next,item.key);else os.delete(item.key);};}else os.delete(item.key);tx.oncomplete=resolve;tx.onabort=tx.onerror=()=>reject(tx.error);});}
 $('saved-delete').onclick=async()=>{const item=pending;if(!item)return;cancel();try{if(item.store==='saves'&&active(item.key))throw Error('起動中のROMの通常セーブは自動保存されます。該当プレイヤーで別のROMを開いてから削除してください。');await remove(item);quickCache=[];await renderSlots();await renderBackups();await render();status.textContent+=' · 選んだデータを削除しました。';}catch(e){status.textContent=e.message;}};
 async function render(){const turn=++generation;cancel();status.textContent='保存データを確認中…';list.replaceChildren();try{await dbReady;if(!db)throw Error('端末内保存が使えません。');const all=await entries();if(turn!==generation)return;const names=new Map(all.saveMeta.map(([key,v])=>[key,v.name]));for(const [key,history]of all.backups)for(const v of history)if(v.name)names.set(key,v.name);for(const [,v]of all.quick)if(v.rom&&v.name)names.set(v.rom,v.name);for(const [player,v]of all.roms)if(v.digest&&v.name)names.set(v.digest+(player===1?':player2':''),v.name);if(loaded)names.set(romKey,romName);for(const p of players)if(p.romKey&&p.romName)names.set(p.romKey,p.romName);
 const records=[];const metas=new Map(all.saveMeta);
 for(const [key,data]of all.saves)records.push({store:'saves',key,rom:key,data,at:metas.get(key)?.at,label:'通常セーブ'});
 for(const [key,v]of all.quick)records.push({...v,store:'quick',key,rom:v.rom||String(key).replace(/:\d+$/,''),label:'クイックセーブ '+(Number(String(key).split(':').pop())+1)});
 for(const [key,history]of all.backups)for(const v of history)records.push({...v,store:'backups',key,rom:key,label:'自動バックアップ'});
 records.sort((a,b)=>(b.at||0)-(a.at||0));status.textContent=records.length?records.length+'件 · 名前や日時のない旧データも表示しています。':'保存データはありません。';
 for(const item of records){const player=item.player??(String(item.rom).endsWith(':player2')?1:0),name=item.name||names.get(item.rom)||'ROM名不明（旧データ）';item.title=name+' · P'+(player+1)+' · '+item.label+' · '+date(item.at);const card=document.createElement('details');card.className='settings-card';const summary=document.createElement('summary');summary.textContent=item.title;card.append(summary);const info=document.createElement('p');info.textContent='容量：'+Math.ceil((item.data?.byteLength||item.data?.length||0)/1024)+' KB · 識別番号：'+item.rom;info.style.overflowWrap='anywhere';card.append(info);
 if(item.store==='quick'&&typeof item.thumb==='string'&&item.thumb.startsWith('data:image/png')){const img=document.createElement('img');img.src=item.thumb;img.alt='保存時のゲーム画面';img.width=240;img.style.maxWidth='100%';card.append(img);}
 if(item.store!=='quick'){card.append(button('ファイルに保存',async()=>{try{const filename=name.replace(/\.[^.]+$/,'').replace(/[\\/:*?"<>|]/g,'_')+'_'+(item.at||'save')+'.sav';await saveFile(new File([item.data],filename,{type:'application/octet-stream'}));}catch(e){if(e.name!=='AbortError')status.textContent=e.message;}}));card.append(button('復元',()=>{if(!loaded||romKey!==item.rom)return status.textContent='対応するROMをプレイヤー'+(player+1)+'で開いてから復元してください。';if(busy||link?.active)return status.textContent='処理・通信を終了してから復元してください。';pause(true);pendingSave=new Uint8Array(item.data);savePanel(item.title+' のセーブで現在の進行を置き換えます。');$('applysave').hidden=false;}));}
 else{const note=document.createElement('p');note.textContent='同じROMを開き「保存枠を確認・管理」から確認できます。旧形式のデータはROM読込時に移行されます。';card.append(note);}
 card.append(button('削除',()=>ask(item)));list.append(card);}
 }catch(e){if(turn===generation)status.textContent='確認できません：'+e.message;}}
 $('saved-refresh').onclick=render;
})();
