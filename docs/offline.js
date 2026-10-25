'use strict';
(() => {
  const status = document.getElementById('offline-status');
  const save = document.getElementById('offline-save');
  const set = text => { status.textContent = text; };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    set('この環境ではオフライン保存を利用できません。Safariで開いてください。');
    save.disabled = true; return;
  }
  let registration, saving = false, lastError = '', checking = false, lastCheck = 0;
  let applying = false, reloading = false;
  const notice=document.createElement('aside');notice.id='update-notice';notice.hidden=false;notice.setAttribute('aria-label','エミュの更新');
  notice.innerHTML='<span role="status">更新を確認しています…</span><button type="button">確認中…</button>';
  document.body.append(notice);
  const updateButton=notice.querySelector('button'),message=notice.querySelector('span');
  const settingsUpdate=document.createElement('button');settingsUpdate.type='button';settingsUpdate.textContent='最新版に更新する';settingsUpdate.hidden=true;save.after(settingsUpdate);
  let noticeMode='checking',dismissed=false;
  const version=document.querySelector('meta[name="gs-offline-shell"]')?.content;
  let previousVersion=null;try{previousVersion=localStorage.getItem('gs-last-launch-version');if(version)localStorage.setItem('gs-last-launch-version',version);}catch{}
  function show(mode,text){
    if(applying)return;
    noticeMode=mode;message.textContent=text;
    updateButton.textContent=({waiting:'更新する',checking:'確認中…',installing:'準備中…',retry:'再確認'})[mode]||'閉じる';
    updateButton.disabled=['checking','installing'].includes(mode);
    notice.hidden=dismissed&&!['waiting','installing','retry'].includes(mode);
    settingsUpdate.hidden=mode!=='waiting';
  }
  show('checking','更新を確認しています…');
  async function applyWaiting() {
    if (!registration?.waiting || applying) return;
    if (window.gsUpdatePending || window.gsLayoutEditing || busy || saving) return;
    if (typeof link!=='undefined' && link?.active) {message.textContent='通信を終了してから更新してください';return;}
    if (!window.confirm('更新するとエミュを再読み込みします。未保存の進行は失われます。ゲーム内でセーブしましたか？')) return;
    const previousPause=paused;pause(true);
    applying=true;window.gsUpdatePending=true;updateButton.disabled=settingsUpdate.disabled=true;
    message.textContent='更新を適用しています…';
    try {
      await persistBoth();
      const result=await ask(registration.waiting,'ACTIVATE_IDLE');
      if(!result.activated)throw Error('ほかのタブ・ホーム画面のエミュを閉じてから、もう一度更新してください。');
      setTimeout(()=>{if(!reloading){message.textContent='更新を確認できませんでした。もう一度更新してください';window.gsUpdatePending=false;applying=false;updateButton.disabled=settingsUpdate.disabled=false;pause(previousPause);}},10000);
      return;
    }catch(error){message.textContent=error.message;}
    window.gsUpdatePending=false;applying=false;updateButton.disabled=settingsUpdate.disabled=false;pause(previousPause);
  }
  settingsUpdate.onclick=applyWaiting;
  updateButton.onclick=()=>{if(noticeMode==='waiting')return applyWaiting();if(noticeMode==='retry')return checkUpdate(true);dismissed=true;notice.hidden=true;};
  async function checkUpdate(force=false) {
    if (!registration || checking || !navigator.onLine || (!force && Date.now()-lastCheck<60000)) return;
    checking=true;lastCheck=Date.now();if(!registration.waiting)show('checking','更新を確認しています…');
    try {await registration.update();} catch {show('retry','更新を確認できませんでした。通信を確認してください');checking=false;return;} finally {checking=false;}await refresh();
  }
  navigator.serviceWorker.addEventListener('message', ({data}) => { if(data?.type === 'OFFLINE_ERROR'){lastError=data.message;set('保存できません：'+lastError);} });
  function ask(worker, type) {
    return new Promise((resolve, reject) => {
      const channel = new MessageChannel();
      const timer = setTimeout(() => { channel.port1.close(); reject(Error('確認がタイムアウトしました。オンラインで再試行してください。')); }, 120000);
      channel.port1.onmessage = ({data}) => { clearTimeout(timer); channel.port1.close(); data.error ? reject(Error(data.error)) : resolve(data); };
      worker.postMessage({type}, [channel.port2]);
    });
  }
  async function refresh() {
    if (saving || !registration) return;
    if(lastError){set('保存できません：'+lastError);return;}
    if (registration.waiting) {
      show('waiting','新しい更新があります');set('新しい更新があります。ゲーム内でセーブしてから「更新する」を押してください。');return;
    }
    if (registration.installing) { show('installing','更新ファイルを準備しています…');set('オフライン用に本体・スキンを保存中…'); return; }
    if (!registration.active) { set('まだ保存できていません。「保存・更新を確認」を押してください。'); return; }
    try {
      const result = await ask(registration.active, 'STATUS');
      if(registration.waiting||registration.installing)return refresh();
      if(!checking)show('done',!navigator.onLine?'オフラインのため更新確認はできません':previousVersion&&version&&previousVersion!==version?'新しい版に更新されました':'現在、新しい更新はありません');
      set(result.ready ? 'オフライン準備完了。本体・全スキンを保存済みです。' + (navigator.onLine ? '' : ' 現在オフラインです。') : 'オフライン用の保存が不足しています。オンラインで「保存・更新を確認」を押してください。');
    } catch (error) { set(error.message);show('retry','更新状態を確認できませんでした'); }
  }
  function watch() {
    const worker = registration.installing;
    if (worker) worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant') set('保存に失敗しました：'+(lastError||'通信状態・空き容量を確認して再試行してください。'));
      else refresh();
    });
    refresh();
  }
  async function register() {
    registration = await navigator.serviceWorker.register(new URL('sw.js', location.href), {scope: './', updateViaCache: 'none'});
    registration.addEventListener('updatefound', watch); watch();
  }
  save.addEventListener('click', async () => {
    lastError = ''; saving = true; save.disabled = true; set('オフライン保存・更新を確認中…');
    try {
      if (!registration) await register();
      await registration.update();
      if (!registration.installing && !registration.waiting && registration.active) await ask(registration.active, 'REPAIR');
    } catch (error) { lastError=error.name+': '+error.message; set('保存できません：'+lastError); }
    finally { saving = false; save.disabled = false; await refresh(); }
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading && applying) {reloading=true;location.reload();return;}
    refresh();
  });
  window.addEventListener('online', () => checkUpdate(true)); window.addEventListener('offline', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) {checkUpdate();refresh();} });
  document.getElementById('clearcache')?.addEventListener('click', () => set('キャッシュ削除後はオフラインで起動できません。オンラインで「保存・更新を確認」を押してください。'));
  setInterval(()=>{if(!document.hidden)checkUpdate();},300000);
  register().then(()=>checkUpdate(true)).catch(error => {lastError=error.name+': '+error.message;set('保存を開始できません：'+lastError);show('retry','更新確認を開始できませんでした');});
})();
