/* Simple client-side launch lock. Not server-side access control. */
'use strict';
(async () => {
  const digest = '5920685f0175d61efe0fb40a3249fb4248eca5baef7c23c093cf17d6d8814e1a';
  const key = 'gs-launch-access-v1';
  const gate = document.getElementById('access-gate');
  const form = document.getElementById('access-form');
  const input = document.getElementById('access-password');
  const button = document.getElementById('access-submit');
  const status = document.getElementById('access-status');
  let starting = false;
  async function start() {
    if (starting) return;
    starting = true;
    gate.hidden = true;
    button.disabled = true;
    input.value = '';
    status.textContent = '起動しています…';
    document.documentElement.classList.remove('access-locked');
    // Recovery is independent of the emulator scripts, including a stalled download.
    const recoveryTimer=setTimeout(()=>{
      if(window.gsStartupReady)return;
      const host=document.getElementById('startgate');if(!host)return;
      const box=document.createElement('section');box.id='startup-recovery';
      const message=document.createElement('p');message.textContent='起動に時間がかかっています。ROMの自動読込を止めて開き直せます。保存データは削除しません。';
      const retry=document.createElement('button');retry.type='button';retry.textContent='ROMを読み込まずに再起動';
      retry.onclick=()=>{try{sessionStorage.setItem('gs-safe-start','1');}catch{}const url=new URL(location.href);url.searchParams.set('safe-start','1');location.replace(url.href);};
      box.append(message,retry);host.append(box);
    },20000);
    window.addEventListener('gs-startup-ready',()=>{clearTimeout(recoveryTimer);document.getElementById('startup-recovery')?.remove();},{once:true});
    try {
      for (const pending of document.querySelectorAll('script[data-gs-src]')) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = pending.dataset.gsSrc;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      document.getElementById('access-gate').remove();
      document.documentElement.classList.remove('access-locked');
    } catch {
      const error = document.createElement('section');
      const text = document.createElement('p');
      text.textContent = '起動ファイルを読み込めませんでした。通信を確認して再読み込みしてください。';
      const reload = document.createElement('button');
      reload.type = 'button'; reload.textContent = '再読み込み';
      reload.onclick = () => location.reload();
      error.append(text, reload); gate.replaceChildren(error); gate.hidden = false;
    }
  }
  let remembered = false;
  try { remembered = localStorage.getItem(key) === digest; } catch {}
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (starting || button.disabled) return;
    button.disabled = true;
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input.value));
      const value = Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
      if (value !== digest) {
        status.textContent = 'パスワードが違います。もう一度入力してください。';
        input.select();
        button.disabled = false;
        return;
      }
      try { localStorage.setItem(key, digest); } catch {}
      await start();
    } catch {
      status.textContent = '認証できませんでした。Safariなどのブラウザで開き直してください。';
      button.disabled = false;
    }
  });
  if (remembered) await start();
  else gate.hidden = false;
})();
