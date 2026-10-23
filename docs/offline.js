'use strict';
(() => {
  const status = document.getElementById('offline-status');
  const save = document.getElementById('offline-save');
  const set = text => { status.textContent = text; };
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    set('この環境ではオフライン保存を利用できません。Safariで開いてください。');
    save.disabled = true; return;
  }
  let registration, busy = false, lastError = '', checking = false, lastCheck = 0;
  const hadController = !!navigator.serviceWorker.controller;
  let applying = false, reloading = false;
  const idle = () => !startupStarted && !startupRequested && !window.gsUpdatePending;
  async function applyWaiting() {
    if (!registration?.waiting || applying || !idle()) return;
    applying = true;window.gsUpdatePending = true;
    try {
      const result = await ask(registration.waiting, 'ACTIVATE_IDLE');
      if (result.activated) {set('最新版を適用しています…');setTimeout(()=>{window.gsUpdatePending=false;applying=false;},10000);return;}
    } catch {}
    window.gsUpdatePending=false;applying=false;
  }
  async function checkUpdate(force=false) {
    if (!registration || checking || !navigator.onLine || (!force && Date.now()-lastCheck<60000)) return;
    checking=true;lastCheck=Date.now();
    try {await registration.update();await applyWaiting();await refresh();} catch {} finally {checking=false;}
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
    if (busy || !registration) return;
    if(lastError){set('保存できません：'+lastError);return;}
    if (registration.waiting) {
      set('最新版を自動取得しました。プレイ中は中断せず、次回起動時に適用します。複数の画面で開いている場合は、すべて閉じて開き直してください。'); await applyWaiting(); return;
    }
    if (registration.installing) { set('オフライン用に本体・スキンを保存中…'); return; }
    if (!registration.active) { set('まだ保存できていません。「保存・更新を確認」を押してください。'); return; }
    try {
      const result = await ask(registration.active, 'STATUS');
      set(result.ready ? 'オフライン準備完了。本体・全スキンを保存済みです。' + (navigator.onLine ? '' : ' 現在オフラインです。') : 'オフライン用の保存が不足しています。オンラインで「保存・更新を確認」を押してください。');
    } catch (error) { set(error.message); }
  }
  function watch() {
    const worker = registration.installing;
    if (worker) worker.addEventListener('statechange', () => {
      if (worker.state === 'redundant') set('保存に失敗しました：'+(lastError||'通信状態・空き容量を確認して再試行してください。'));
      else {refresh();if(worker.state==='installed')applyWaiting();}
    });
    refresh();
  }
  async function register() {
    registration = await navigator.serviceWorker.register(new URL('sw.js', location.href), {scope: './', updateViaCache: 'none'});
    registration.addEventListener('updatefound', watch); watch();
  }
  save.addEventListener('click', async () => {
    lastError = ''; busy = true; save.disabled = true; set('オフライン保存・更新を確認中…');
    try {
      if (!registration) await register();
      await registration.update();
      if (!registration.installing && !registration.waiting && registration.active) await ask(registration.active, 'REPAIR');
    } catch (error) { lastError=error.name+': '+error.message; set('保存できません：'+lastError); }
    finally { busy = false; save.disabled = false; await refresh(); }
  });
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloading && (applying || (hadController && !startupStarted && !startupRequested))) {reloading=true;location.reload();return;}
    refresh();
  });
  window.addEventListener('online', () => checkUpdate(true)); window.addEventListener('offline', refresh);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) {checkUpdate();refresh();} });
  document.getElementById('clearcache')?.addEventListener('click', () => set('キャッシュ削除後はオフラインで起動できません。オンラインで「保存・更新を確認」を押してください。'));
  setInterval(()=>{if(!document.hidden)checkUpdate();},300000);
  register().then(()=>checkUpdate(true)).catch(error => {lastError=error.name+': '+error.message;set('保存を開始できません：'+lastError);});
})();
