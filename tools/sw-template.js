'use strict';
const ASSETS = __ASSETS__;
const VERSION = '__VERSION__';
const ROOT = new URL('./', self.location.href);
const PREFIX = 'celio-offline-' + encodeURIComponent(ROOT.pathname) + '-';
const CACHE = PREFIX + VERSION;
const entries = new Map(ASSETS.map(([path, hash]) => [new URL(path, ROOT).href, hash]));
let saving;
async function complete() {
  if (!(await caches.has(CACHE))) return false;
  const cache = await caches.open(CACHE);
  for (const url of entries.keys()) if (!(await cache.match(url))) return false;
  return true;
}
async function verified(response, hash) {
  if (!response?.ok || response.type === 'opaque') return false;
  if (response.redirected && (new URL(response.url).origin !== ROOT.origin || !new URL(response.url).pathname.startsWith(ROOT.pathname))) return false;
  const bytes = await response.clone().arrayBuffer();
  if (hash.startsWith('html:')) return new TextDecoder().decode(bytes).includes('<meta name="gs-offline-shell" content="' + hash.slice(5) + '">');
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), x => x.toString(16).padStart(2, '0')).join('');
  return digest === hash;
}
async function populate() {
  if (saving) return saving;
  saving = (async () => {
    const cache = await caches.open(CACHE);
    const oldNames = (await caches.keys()).filter(key => key.startsWith(PREFIX) && key !== CACHE);
    const oldCaches = await Promise.all(oldNames.map(key => caches.open(key)));
    const pending = [...entries];
    let cursor = 0, failure;
    async function saveAsset(url, hash) {
      if (await cache.match(url)) return;
      // Reuse only bytes matching this release, including caches created by older workers.
      for (const old of oldCaches) {
        const candidate = await old.match(url);
        if (candidate && await verified(candidate, hash)) {await cache.put(url, candidate);return;}
      }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      try {
        const response = await fetch(url, {cache:'reload', credentials:'same-origin', signal:controller.signal});
        if (!await verified(response, hash)) throw Error('内容が更新途中、または取得できません。オンラインで再試行してください。');
        await cache.put(url, response);
      } catch (error) {throw Error(new URL(url).pathname + '：' + error.message);}
      finally {clearTimeout(timeout);}
    }
    async function worker() {
      while (!failure && cursor < pending.length) {
        const [url, hash] = pending[cursor++];
        try {await saveAsset(url, hash);}catch(error){failure=error;}
      }
    }
    // Bound network/memory use; drain every worker before failed-cache cleanup.
    await Promise.all(Array.from({length:Math.min(4,pending.length)},worker));
    if (failure) throw failure;
  })().finally(() => { saving = null; });
  return saving;
}
self.addEventListener('install', event => event.waitUntil(populate().catch(async error => {
  await caches.delete(CACHE);
  const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for (const client of clients) client.postMessage({type:'OFFLINE_ERROR',message:error.message});
  throw error;
})));
// Activate on an idle single-tab launch only; running games keep their version.
self.addEventListener('activate', event => event.waitUntil((async () => {
  for (const key of await caches.keys()) if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
  await self.clients.claim();
})()));
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== ROOT.origin) return;
  url.search = ''; url.hash = '';
  if (url.pathname === ROOT.pathname) url.pathname += 'index.html';
  if (!entries.has(url.href)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(url.href);
    return saved || fetch(request);
  })());
});
self.addEventListener('message', event => {
  const port = event.ports[0];
  if (!port || !['STATUS', 'REPAIR', 'ACTIVATE_IDLE'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    try {
      if (event.data.type === 'ACTIVATE_IDLE') {
        const windows = await self.clients.matchAll({type:'window',includeUncontrolled:true});
        const own = windows.filter(c => c.url.startsWith(ROOT.href));
        if (own.length !== 1 || own[0].id !== event.source?.id || !(await complete())) {port.postMessage({activated:false});return;}
        await self.skipWaiting();port.postMessage({activated:true});return;
      }
      if (event.data.type === 'REPAIR') await populate();
      port.postMessage({ready: await complete(), version: VERSION});
    } catch (error) { port.postMessage({error: error.message}); }
  })());
});
