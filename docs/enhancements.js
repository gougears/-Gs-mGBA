'use strict';
(()=>{
 const root=document.documentElement;
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 root.classList.toggle('ios-home-app',ios&&(navigator.standalone===true||matchMedia('(display-mode: standalone)').matches));
 let resizing=0;
 function fit(){cancelAnimationFrame(resizing);resizing=requestAnimationFrame(()=>{
  const h=Math.round(window.visualViewport?.height||innerHeight),w=Math.round(window.visualViewport?.width||innerWidth);
  root.style.setProperty('--viewport-h',h+'px');root.classList.toggle('auto-fit',settings.autoFit!==false);
  $('viewportstatus').textContent=w+' × '+h+' · '+(w>h?'横画面':'縦画面')+' · '+(settings.autoFit!==false?'自動調整ON':'標準表示');
  drawSkin();applyPositions();
 });}
 $('autofit').checked=settings.autoFit!==false;
 $('autofit').onchange=e=>{settings.autoFit=e.target.checked;remember();fit();};$('fitnow').onclick=fit;
 window.visualViewport?.addEventListener('resize',fit);addEventListener('resize',fit);
 // iOS can report the old viewport during orientationchange. Refit after settling.
 let rotationTimers=[];
 function rotated(){
  rotationTimers.forEach(clearTimeout);rotationTimers=[];
  const panel=$('settingspanel');
  if(!panel.hidden&&panel.contains(document.activeElement))document.activeElement.blur();
  const settle=()=>{fit();if(!panel.hidden){panel.scrollTop=0;panel.scrollLeft=0;const nav=panel.querySelector('.settings-navigation');nav.scrollTop=0;nav.scrollLeft=0;renderLayoutPreview();}};
  settle();for(const delay of [150,450])rotationTimers.push(setTimeout(settle,delay));
 }
 addEventListener('orientationchange',rotated);matchMedia('(orientation: landscape)').addEventListener('change',rotated);fit();
 for(const [id,label] of Object.entries({'open-controls':'操作・スキン・ボタン配置','open-audio':'音量・倍速','open-system':'端末・オフライン・更新','open-rapid':'連射・マクロの設定','open-guide':'使い方・操作ガイド'}))$(id).textContent=label;
 // Keep all categories adjacent to their content; prioritize everyday settings.
 const general=$('page-settings');for(const key of ['display','controls','rapid','audio']){general.append($('open-'+key),$('page-'+key));}
 const status=$('cheatstatus');let context='',rows=[],applied='',button=false,revision=0,clearedPeers=new WeakSet();
 function load(){if(context===romKey)return;context=romKey;rows=[];applied='';button=false;revision++;
  try{const data=JSON.parse(localStorage.getItem('gs-cheats:'+context)||'[]');if(Array.isArray(data))rows=data.filter(r=>typeof r.code==='string'&&typeof r.name==='string'&&[0,1,2,3,4].includes(r.type)).slice(0,100);}catch{}
  render();
 }
 function save(){localStorage.setItem('gs-cheats:'+context,JSON.stringify(rows));applied='';revision++;}
 function normalize(code,type){const lines=code.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);if(!lines.length||lines.length>256)throw Error('1〜256行のコードを入力してください。');
  return lines.map((line,i)=>{line=line.replace(/\s/g,'').toUpperCase();if(type===4||(type===0&&line.includes(':'))){if(!/^[0-9A-F]{8}:(?:[0-9A-F]{2}|[0-9A-F]{4}|[0-9A-F]{8})$/.test(line))throw Error((i+1)+'行目：アドレス:値の形式にしてください。');return line;}
   if(!/^[0-9A-F]{12}([0-9A-F]{4})?$/.test(line))throw Error((i+1)+'行目：16進数のコードを確認してください。');return line.slice(0,8)+' '+line.slice(8);}).join('\n');}
 function install(row){const bytes=new TextEncoder().encode(row.code+'\0');return alloc(bytes,p=>M._cheats_add(p,row.type));}
 function available(){if(!loaded||busy)throw Error('先にROMを開いてください。');if(link?.active)throw Error('通信を終了してから変更してください。');if(!M._cheats_add)throw Error('アプリの更新後に開き直してください。');}
 function sync(){load();if(link?.active){for(const p of players)if(p.M&&p.M!==M&&!clearedPeers.has(p.M)){p.M._cheats_clear?.();p.M._cheats_button?.(0);clearedPeers.add(p.M);}}else clearedPeers=new WeakSet();if(!loaded||!M?._cheats_clear)return;const signature=romKey+'|'+(link?.active?'link':revision)+'|'+button;
  if(applied===signature)return;M._cheats_clear();M._cheats_button(button&&!link?.active?1:0);
  if(!link?.active)for(const row of rows)if(row.enabled){const result=install(row);if(result<1){row.enabled=false;status.textContent=row.name+'：'+(-result)+'行目付近を解釈できません。OFFにしました。';try{save();}catch{}}}
  applied=signature;
 }
 window.gsCheatsSync=sync;
 function render(){const host=$('cheatlist');host.replaceChildren();$('cheatgame').textContent=loaded?'P'+(activePlayer+1)+'：'+romName:'先にROMを開いてください。';
  rows.forEach((row,i)=>{const box=document.createElement('div');box.className='cheat-entry';const label=document.createElement('label'),toggle=document.createElement('input');toggle.type='checkbox';toggle.checked=!!row.enabled;label.append(toggle,document.createTextNode(row.name));const del=document.createElement('button');del.type='button';del.textContent='削除';
   toggle.onchange=()=>{try{available();row.enabled=toggle.checked;save();sync();render();}catch(e){toggle.checked=!!row.enabled;status.textContent=e.message;}};
   del.onclick=()=>{try{available();rows.splice(i,1);save();sync();render();}catch(e){status.textContent=e.message;}};box.append(label,del);host.append(box);
  });$('cheatbutton').setAttribute('aria-pressed',String(button));$('cheatbutton').textContent='チート専用ボタン：'+(button?'ON':'OFF');}
 $('cheatadd').onclick=()=>{try{available();load();if(rows.length>=100)throw Error('登録は100件までです。');const row={name:$('cheatname').value.trim()||'チート '+(rows.length+1),type:+$('cheattype').value,code:normalize($('cheatcode').value,+$('cheattype').value),enabled:false};
   // A temporary native set validates encrypted and multiline codes without running a frame.
   const result=install(row);applied='';sync();if(result<1)throw Error((-result)+'行目付近を解釈できません。形式と複数行コードを確認してください。');rows.push(row);save();render();$('cheatcode').value='';$('cheatname').value='';status.textContent='登録しました。左のチェックでONにできます。';
  }catch(e){status.textContent=e.message;}};
 $('cheatbutton').onclick=()=>{try{available();button=!button;applied='';sync();render();}catch(e){status.textContent=e.message;}};
 $('tab-cheats').addEventListener('click',()=>{load();render();});
 // Re-apply after reset/load, even when the ROM identifier is unchanged.
 for(const id of ['topreset-yes','applysave'])$(id).addEventListener('click',()=>{applied='';});
 for(const id of ['rom','secondrom'])$(id).addEventListener('change',()=>{applied='';});
 function memory(step=0){try{if(!loaded||busy)throw Error('先にROMを開いてください。');let text=$('memaddr').value.trim().replace(/^0x/i,'');if(!/^[0-9a-f]{1,8}$/i.test(text))throw Error('アドレスは8桁以内の16進数で入力してください。');let addr=parseInt(text,16)+step;if(addr<0||addr>0x0fffff00)throw Error('00000000〜0FFFFF00の範囲を指定してください。');addr=Math.floor(addr/16)*16;$('memaddr').value=addr.toString(16).toUpperCase().padStart(8,'0');const width=+$('memwidth').value,lines=[];
  for(let offset=0;offset<256;offset+=16){const bytes=Array.from({length:16},(_,i)=>M._read_mem(addr+offset+i)&255),values=[];for(let i=0;i<16;i+=width){let value=0;for(let j=0;j<width;j++)value+=bytes[i+j]*2**(8*j);values.push(value.toString(16).toUpperCase().padStart(width*2,'0'));}lines.push((addr+offset).toString(16).toUpperCase().padStart(8,'0')+'  '+values.join(' ')+'  '+bytes.map(b=>b>=32&&b<127?String.fromCharCode(b):'.').join(''));}
  $('memoutput').textContent=lines.join('\n');$('memstatus').textContent='P'+(activePlayer+1)+' · '+romName+' · 256バイト · リトルエンディアン';
 }catch(e){$('memstatus').textContent=e.message;$('memoutput').textContent='';}}
 $('memread').onclick=()=>memory();$('memprev').onclick=()=>memory(-256);$('memnext').onclick=()=>memory(256);$('memregion').onchange=e=>{$('memaddr').value=e.target.value;memory();};$('memwidth').onchange=()=>memory();$('open-memory').addEventListener('click',()=>{if(!$('page-memory').hidden)memory();});
})();
