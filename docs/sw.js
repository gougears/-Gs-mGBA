'use strict';
const ASSETS = [["app.js","0c2eb8889eb920a8fb771f076a0cc339ef4e6c1147932033a0f2c07fd00d3541"],["celio-web.js","6f344e0c9e9fee630690c387e878807fa6afe579d03f1ff8e6e829502b7220df"],["guide.css","423f80189c2a8d2cc1520f0f041e8411e451e53b11f4a5aecd8262750b76c502"],["guide.js","13342140551ad98627f0dcb2269a385d809db2f003ca59ce7ace2314b73a547e"],["index.html","html:590ac6a87851dd69d5a9a9339f8153a746d4fe6e97debbd96dd57b61900bb429"],["link.js","1ffa9a6d083b9f994369e34fc299887ddcc0094b7f5b8c5c4f6661263e760725"],["local-link.js","5aeb82ee83727d280ea8d5d4f42b47185787d8d20b61b8aa09de0cf97f88df7a"],["manifest.webmanifest","e47a348f672e96e79e1cad8d6f54481895613acc110fb94d274b354c06ce451e"],["offline.js","113988675fea4ce48874568acfe4dad661c2db220133d98dba21e49f67df6758"],["player-bar.css","880060bcdf515aeb7cc3fdb15e28b77bd58050162616fea3c3f723da273bbc9d"],["skins/BeastBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/BeastBall-body.svg","f10725ccee3a85a128b5fa1599dcf0e81d7a9a3d4fbbd355104ff429b51a41d4"],["skins/BeastBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/BeastBall-landscape.png","783b349451e372aee0f4acdcdfad877105b4d97c3bb88e59d648aaab41fa8c0f"],["skins/BeastBall-landscape.svg","8c53161c3d09697089024da874029ef37ce64aabcf831e2db13c55dc6b685fab"],["skins/BeastBall.png","f50d2de04ff771f5a87bca966fcc63a9059ecb15868008e716c53903e075d299"],["skins/BeastBall.svg","e9b3fbf141a35296ee015f053538edd665dd7aff17b845f300259dd1fcdddac7"],["skins/CherishBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/CherishBall-body.svg","e4d3efa9085cf30c38951582733426abdd4f8a003b1fde3ef304a118b62751f6"],["skins/CherishBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/CherishBall-landscape.svg","68ecbf529927eadab6b018f7fee12c5e368a10d7412e66cc118150cbacf879c5"],["skins/CherishBall.svg","ecea913c35745b1701534f07253f0445a6c227b9d4018d2b0729bd6840347ab2"],["skins/Cobalt-landscape.svg","e62befef7ab4a37d1d74c55163bc94a0cba2cc70055ba547fac7b205754cd0d2"],["skins/Cobalt.svg","370f5b15860c1ab2a7781b242ef2f9a485b47dc24dd052f100fd25288de4bb0f"],["skins/DiveBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/DiveBall-body.svg","6b2da400469245b488811a5339c8434b2f0c23823595ddf5dfd369aebd28f4bb"],["skins/DiveBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/DiveBall-landscape.svg","7d0cfec8310ee2bbbcd91de62a162900aee02f15728136d40b44462f1e17758b"],["skins/DiveBall.svg","3a28f8ee5c4fa8c8174ab11907d24a3e875a355bb126f67edb31e06aee1c8e8c"],["skins/GreatBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/GreatBall-body.svg","bd6e201c21feae27c16e29058bf4221f2d5a4b43b8b6ee8931b8c845b0bcb004"],["skins/GreatBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/GreatBall-landscape.png","e2fe12f40e59d2a73e3200b5f1995eb3f5d67840f593f93d55c65cfcb105fa8e"],["skins/GreatBall-landscape.svg","a6e56ccb0e025c0978988942a05389597769a7e8b35367437a79f4cf9e0381aa"],["skins/GreatBall.png","5dcf0cfddc7c3928f1ffc498c050d29d3e23475091288b11ef2b42c958c53a7f"],["skins/GreatBall.svg","fb12e2c0f3883d381fffad979eb67a56da8ece02363b75279a20416cf44abc59"],["skins/LoveBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/LoveBall-body.svg","858bf47d37236f3f6c32e01f08c8aa9f709e3eab9ab924f2644e1f8c5defe953"],["skins/LoveBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/LoveBall-landscape.svg","59e4a0c8c6bb26d333992efa213fa5505e1d34f48650c1bbda987e670b23c6f4"],["skins/LoveBall.svg","389378d82069034870bccd738653d9528ae338cd8c87b3f1cbe4b86480598c98"],["skins/LuxuryBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/LuxuryBall-body.svg","a6aef1f7a7f163e35b52fa7a1625e006c43a23639fedb484ae68e18ce7d859a8"],["skins/LuxuryBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/LuxuryBall-landscape.svg","ff7da8bc2c49548ffa983be0c6873def2648af88c69458ef53a50a6baacf31ab"],["skins/LuxuryBall.svg","7524ff67923b1c745494da641900ddf9f639d147723572f7598b62d2a758b941"],["skins/MasterBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/MasterBall-body.svg","08f592aaa5b72fb83f56680b4d8c25ea59c70b27ebc0456adbe054346b6641f6"],["skins/MasterBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/MasterBall-landscape.png","1c0e6844b39ac957d7e0fd92be39890921acbf0d823cbc744749de9a3418f26e"],["skins/MasterBall-landscape.svg","142e00a147d28b7d68012c12db76781e9bfa9c6bb8318bfc9d1cbcb83d4dd995"],["skins/MasterBall.png","e7a29f621169df13b1f124ea3ee82b72f4a56da186544bdc14c942b8cc4c31fa"],["skins/MasterBall.svg","4fd4c66a6858a00b2dd5478cd6b3b6752d4a48d9cc9fa9b3e8118ecfc6af6008"],["skins/MoonBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/MoonBall-body.svg","794efda15609378fb3467aafac8df299d295a00326a712a0ff574e986f4c8175"],["skins/MoonBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/MoonBall-landscape.svg","2ec4a348d7d206b55accbfa17ce33679d4fbdf449e52e78ea723acb5ea5a2683"],["skins/MoonBall.svg","bb844949faa6fbc490bf39fe72c3dd3e8483b8123569076b33b43fe8485c3896"],["skins/PokeBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/PokeBall-body.svg","054aa137b9e70df8fb85647129ac873997fd212c346109c7d8af62138ed3732e"],["skins/PokeBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/PokeBall-landscape.png","0ef1602ddea148ccc4e86c267f3e39992a83a925b35f42e7d8f489876e2b15d6"],["skins/PokeBall-landscape.svg","d89dfa832cd9736d47e07053e94d3fa4ce855e42e5bd7eb0cbc514b8f3c15f02"],["skins/PokeBall.png","25dfdd01237af04774d2576711a3daaeb4c49da047188ee6f510a9091a68bd7a"],["skins/PokeBall.svg","1691e0f369c82877916f6fadf7e93c16cc5b0ecc14c5fef7fe32402c2fe12f59"],["skins/QuickBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/QuickBall-body.svg","4fc0f77e5af876f1fb68e6457610d73a385c4550b2ac8262a268492247f7ddf4"],["skins/QuickBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/QuickBall-landscape.svg","5cc03e0fd5cba4fe456efd8e54b0db6e276d1e254711641399a1e36a14242dc3"],["skins/QuickBall.svg","0ad99711980ef34ce3c92647a8205ce7449095ac3efee838b852364da8e24b3c"],["skins/UltraBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/UltraBall-body.svg","3b1e781ac67382fb30641dbc807ec070f8067821667eb48fffe059f355b79ca0"],["skins/UltraBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/UltraBall-landscape.png","217496e8fd3f8a36677e5a63d6b45da0baddfa4884746c13bd805bfefb141192"],["skins/UltraBall-landscape.svg","70a312a67cd4dca44424d6cc94d2f900918115931d8f0f7a4ba6305d97e72d24"],["skins/UltraBall.png","81e31dbaeacc87238bd4fddb8622b950387c0814e341b2e6111c9b20123c1186"],["skins/UltraBall.svg","b8f32de80e58994054433470887965a78111fbef769320192417cf764427a1c0"],["skins.js","eedf0fba13b8a62bcdea7947c96773eeda0fada36c7945d91dbfed8013104a4c"],["style.css","14ef2e0316a6e1b5825856c2507e8c496fbf19afafe0a789f9db6e2ff77ca255"]];
const VERSION = '14258ee326d0cf45';
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
