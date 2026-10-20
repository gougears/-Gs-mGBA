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
async function populate() {
  if (saving) return saving;
  saving = (async () => {
    const cache = await caches.open(CACHE);
    for (const [url, hash] of entries) {
      if (await cache.match(url)) continue;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      let response;
      try { response = await fetch(url, {cache: 'reload', credentials: 'same-origin', signal: controller.signal}); }
      catch (error) { throw Error(new URL(url).pathname + '：通信失敗 (' + error.name + ')'); }
      finally { clearTimeout(timeout); }
      if (!response.ok || response.type === 'opaque') throw Error(new URL(url).pathname + '：HTTP ' + response.status);
      if (response.redirected && (new URL(response.url).origin !== ROOT.origin || !new URL(response.url).pathname.startsWith(ROOT.pathname))) throw Error(new URL(url).pathname + '：別サイトへの転送');
      const bytes = await response.clone().arrayBuffer();
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), x => x.toString(16).padStart(2, '0')).join('');
      const matches = hash.startsWith('html:') ? new TextDecoder().decode(bytes).includes('<meta name="gs-offline-shell" content="' + hash.slice(5) + '">') : digest === hash;
      if (!matches) throw Error(new URL(url).pathname + '：内容が更新途中です。オンラインで開き直してください。');
      await cache.put(url, response);
    }
  })().finally(() => { saving = null; });
  return saving;
}
self.addEventListener('install', event => event.waitUntil(populate().catch(async error => {
  await caches.delete(CACHE);
  const clients = await self.clients.matchAll({type:'window',includeUncontrolled:true});
  for (const client of clients) client.postMessage({type:'OFFLINE_ERROR',message:error.message});
  throw error;
})));
// No skipWaiting: running games keep their existing complete version until all tabs close.
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
  if (!port || !['STATUS', 'REPAIR'].includes(event.data?.type)) return;
  event.waitUntil((async () => {
    try {
      if (event.data.type === 'REPAIR') await populate();
      port.postMessage({ready: await complete(), version: VERSION});
    } catch (error) { port.postMessage({error: error.message}); }
  })());
});
