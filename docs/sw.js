'use strict';
const ASSETS = [["access.css","58f0d7badecfc007bea107a6367c673ac7a269fc36e1db1e273de22ffb41d790"],["access.js","f8074631eebff93a9d1375823167aa6327878a2a886a2dafddd92920f6b246bd"],["add-to-home.html","e2940dbd44b17083e885dff8fc370dd53eeb8c83578ae34a00e9861a8a81a69b"],["app.js","510c0d8de5f620f7b597ab7f1b51f54c14fc896bdde9143dc8e3f529c8bc6578"],["apple-touch-icon.png","7f215fe9e7475c6410f0c3a7674f8f300b37c5ede35633ad54898e04a242ffab"],["ball-layout.js","30c383bf5cd715cd2b12d10bac9f060a4ebbec8aa97d2cf2a303738dc6169e94"],["celio-web.js","b69b28b112ab6f8b9d7a2b340a9f107aeeb4cd1204f2189f27a3bcb70cff00cd"],["delta-skins.js","57d5f255589648ea9da144191271e5568adf203d0c132d892016336acd50d620"],["enhancements.css","5195d50cf060b867a1894e4bd1a39af9c75cc60784eb48cb593038232a3483ef"],["enhancements.js","7e1204d06cb69d9de34d0115a0c58f445ffcc708a9ef65f20518f8c51c6c4f76"],["guide.css","423f80189c2a8d2cc1520f0f041e8411e451e53b11f4a5aecd8262750b76c502"],["guide.js","91bce6828f103ca7bae74afb07925fcec4577faedf56451a914da4639e527775"],["home-icon-512.png","5fbec04f8bbdfec890106d23328c399850aa20adbeabd9a4d418cca67afff338"],["icons/gba-180.png","7f215fe9e7475c6410f0c3a7674f8f300b37c5ede35633ad54898e04a242ffab"],["icons/gba-192.png","14db02541a69670042b99531fdc0a2ecf69434e79bd7912765ef91b4d891ce2b"],["icons/gba-512.png","5fbec04f8bbdfec890106d23328c399850aa20adbeabd9a4d418cca67afff338"],["index.html","html:b781b77d8fca4bb732a65bb52ba81d2211991f19fc666941caf3876b57fd6c01"],["install.css","14868529aa96201ce25eb557f22bc8d43d104bbc224e51b933b5a02098a7e8c1"],["layout-editor.css","efbce4d4e81e2a96aa19660be564687fdb32d41db71d2e7cfeeedb2633274dbd"],["layout-editor.js","67495f89af6c38cff346093432f462bafefcc987b0815c28dd7cab281630ce9e"],["link.js","b4eeb8fef8285ab5418f630e06f5487f485fd556b4d2a2f63c6e6fee9490d465"],["local-link.js","5aeb82ee83727d280ea8d5d4f42b47185787d8d20b61b8aa09de0cf97f88df7a"],["macro.css","6b31a3e2ff1f56848bfb0795aee776fafa8249534248ce636199f0f9991f1d55"],["macro.js","3f61f7e2ca151334eac82ea57ef63071d75e48d42059ccbfd9d322ca8459b70d"],["manifest.webmanifest","2169f2e09dc2a7150cdad63e65142d902c2581377ec3e5b206b4c2a7d989d789"],["offline.js","049eb8b61d76ce50056502a414b0c162e120e3511067992a5f1d0941083d0ce5"],["one-hand.js","499b1ecc24f832718cac4daa23b313545bdc69a06dbb5371e09162cd7861ca92"],["player-bar.css","a21c444eec1cb54a837784ec06cf9a319aba3b95911e87e71f9de375e8e4ec07"],["skins/BeastBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/BeastBall-body.svg","f10725ccee3a85a128b5fa1599dcf0e81d7a9a3d4fbbd355104ff429b51a41d4"],["skins/BeastBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/BeastBall-landscape.png","783b349451e372aee0f4acdcdfad877105b4d97c3bb88e59d648aaab41fa8c0f"],["skins/BeastBall-landscape.svg","8c53161c3d09697089024da874029ef37ce64aabcf831e2db13c55dc6b685fab"],["skins/BeastBall.png","f50d2de04ff771f5a87bca966fcc63a9059ecb15868008e716c53903e075d299"],["skins/BeastBall.svg","e9b3fbf141a35296ee015f053538edd665dd7aff17b845f300259dd1fcdddac7"],["skins/CherishBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/CherishBall-body.svg","e4d3efa9085cf30c38951582733426abdd4f8a003b1fde3ef304a118b62751f6"],["skins/CherishBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/CherishBall-landscape.svg","68ecbf529927eadab6b018f7fee12c5e368a10d7412e66cc118150cbacf879c5"],["skins/CherishBall.svg","ecea913c35745b1701534f07253f0445a6c227b9d4018d2b0729bd6840347ab2"],["skins/Cobalt-landscape.svg","e62befef7ab4a37d1d74c55163bc94a0cba2cc70055ba547fac7b205754cd0d2"],["skins/Cobalt.svg","370f5b15860c1ab2a7781b242ef2f9a485b47dc24dd052f100fd25288de4bb0f"],["skins/DiveBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/DiveBall-body.svg","6b2da400469245b488811a5339c8434b2f0c23823595ddf5dfd369aebd28f4bb"],["skins/DiveBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/DiveBall-landscape.svg","7d0cfec8310ee2bbbcd91de62a162900aee02f15728136d40b44462f1e17758b"],["skins/DiveBall.svg","3a28f8ee5c4fa8c8174ab11907d24a3e875a355bb126f67edb31e06aee1c8e8c"],["skins/GreatBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/GreatBall-body.svg","bd6e201c21feae27c16e29058bf4221f2d5a4b43b8b6ee8931b8c845b0bcb004"],["skins/GreatBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/GreatBall-landscape.png","e2fe12f40e59d2a73e3200b5f1995eb3f5d67840f593f93d55c65cfcb105fa8e"],["skins/GreatBall-landscape.svg","a6e56ccb0e025c0978988942a05389597769a7e8b35367437a79f4cf9e0381aa"],["skins/GreatBall.png","5dcf0cfddc7c3928f1ffc498c050d29d3e23475091288b11ef2b42c958c53a7f"],["skins/GreatBall.svg","fb12e2c0f3883d381fffad979eb67a56da8ece02363b75279a20416cf44abc59"],["skins/LoveBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/LoveBall-body.svg","858bf47d37236f3f6c32e01f08c8aa9f709e3eab9ab924f2644e1f8c5defe953"],["skins/LoveBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/LoveBall-landscape.svg","59e4a0c8c6bb26d333992efa213fa5505e1d34f48650c1bbda987e670b23c6f4"],["skins/LoveBall.svg","389378d82069034870bccd738653d9528ae338cd8c87b3f1cbe4b86480598c98"],["skins/LuxuryBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/LuxuryBall-body.svg","a6aef1f7a7f163e35b52fa7a1625e006c43a23639fedb484ae68e18ce7d859a8"],["skins/LuxuryBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/LuxuryBall-landscape.svg","ff7da8bc2c49548ffa983be0c6873def2648af88c69458ef53a50a6baacf31ab"],["skins/LuxuryBall.svg","7524ff67923b1c745494da641900ddf9f639d147723572f7598b62d2a758b941"],["skins/MasterBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/MasterBall-body.svg","08f592aaa5b72fb83f56680b4d8c25ea59c70b27ebc0456adbe054346b6641f6"],["skins/MasterBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/MasterBall-landscape.png","1c0e6844b39ac957d7e0fd92be39890921acbf0d823cbc744749de9a3418f26e"],["skins/MasterBall-landscape.svg","142e00a147d28b7d68012c12db76781e9bfa9c6bb8318bfc9d1cbcb83d4dd995"],["skins/MasterBall.png","e7a29f621169df13b1f124ea3ee82b72f4a56da186544bdc14c942b8cc4c31fa"],["skins/MasterBall.svg","4fd4c66a6858a00b2dd5478cd6b3b6752d4a48d9cc9fa9b3e8118ecfc6af6008"],["skins/MoonBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/MoonBall-body.svg","794efda15609378fb3467aafac8df299d295a00326a712a0ff574e986f4c8175"],["skins/MoonBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/MoonBall-landscape.svg","2ec4a348d7d206b55accbfa17ce33679d4fbdf449e52e78ea723acb5ea5a2683"],["skins/MoonBall.svg","bb844949faa6fbc490bf39fe72c3dd3e8483b8123569076b33b43fe8485c3896"],["skins/PokeBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/PokeBall-body.svg","054aa137b9e70df8fb85647129ac873997fd212c346109c7d8af62138ed3732e"],["skins/PokeBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/PokeBall-landscape.png","0ef1602ddea148ccc4e86c267f3e39992a83a925b35f42e7d8f489876e2b15d6"],["skins/PokeBall-landscape.svg","d89dfa832cd9736d47e07053e94d3fa4ce855e42e5bd7eb0cbc514b8f3c15f02"],["skins/PokeBall.png","25dfdd01237af04774d2576711a3daaeb4c49da047188ee6f510a9091a68bd7a"],["skins/PokeBall.svg","1691e0f369c82877916f6fadf7e93c16cc5b0ecc14c5fef7fe32402c2fe12f59"],["skins/QuickBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/QuickBall-body.svg","4fc0f77e5af876f1fb68e6457610d73a385c4550b2ac8262a268492247f7ddf4"],["skins/QuickBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/QuickBall-landscape.svg","5cc03e0fd5cba4fe456efd8e54b0db6e276d1e254711641399a1e36a14242dc3"],["skins/QuickBall.svg","0ad99711980ef34ce3c92647a8205ce7449095ac3efee838b852364da8e24b3c"],["skins/UltraBall-actions.svg","52e36f2d02f81f8fe681cc3d5646265c6b637b8b5ebfbcbe5576409cb7e7015e"],["skins/UltraBall-body.svg","3b1e781ac67382fb30641dbc807ec070f8067821667eb48fffe059f355b79ca0"],["skins/UltraBall-controls.svg","62941b518e8e169af24b872d759970968b7317b329254fd046dddab15b4bd117"],["skins/UltraBall-landscape.png","217496e8fd3f8a36677e5a63d6b45da0baddfa4884746c13bd805bfefb141192"],["skins/UltraBall-landscape.svg","70a312a67cd4dca44424d6cc94d2f900918115931d8f0f7a4ba6305d97e72d24"],["skins/UltraBall.png","81e31dbaeacc87238bd4fddb8622b950387c0814e341b2e6111c9b20123c1186"],["skins/UltraBall.svg","b8f32de80e58994054433470887965a78111fbef769320192417cf764427a1c0"],["skins.js","0cb6fd2735ae5950d0f3e9289db67e11793043cb313f0d2ba76cd6a97f2e54b4"],["style.css","14ef2e0316a6e1b5825856c2507e8c496fbf19afafe0a789f9db6e2ff77ca255"],["vendor/fflate.js","462ef8041fc970e3615a20a9dd2b2e3047a073b2da729ef4f02b634bba8b7b83"],["vendor/pdfjs/chunks/jbig.0.bin","f816a123311ee569c947811fabf7c0980c651b402880ff978e4a980ede53b3ae"],["vendor/pdfjs/chunks/jbig.1.bin","ca3bf72770580866f61ead24de39c832f85b965b63548122c973fc9688dab296"],["vendor/pdfjs/chunks/jpeg.0.bin","f8e5ec4ac025b5c3dc2462aa1267bb3ac08e4b1570cd1cab73a301d22309a257"],["vendor/pdfjs/chunks/jpeg.1.bin","e15a8e3aaa810ef3182d2190f5528285bf304e4d4cf57354471f94176f564f6b"],["vendor/pdfjs/chunks/jpeg.2.bin","e17576b7eed1ed8780aa444272f26e25567dd62f908f615a90ad1b0c4338a564"],["vendor/pdfjs/chunks/jpeg.3.bin","69df6d866c35bd9adebba7e13e87bc61b5e91968d4be2f8c182c8937d34527ba"],["vendor/pdfjs/chunks/jpeg.4.bin","f28565563932eaf8f26d7a2142f97f8cdceaae310d0921b9e6980d9c9e0d0545"],["vendor/pdfjs/chunks/pdf.0.bin","c26d73ca188949588e3080dafa6784777d61bfd3205bc0f1590f1755650d2b08"],["vendor/pdfjs/chunks/pdf.1.bin","45db1e7c9987c4101562db7b4ac657dbf32b64712166a367bc822f10b1bf4699"],["vendor/pdfjs/chunks/pdf.2.bin","b65762a786dda28235bcb9da632e4d1711274cea391607b8a56243e9dbd80154"],["vendor/pdfjs/chunks/pdf.3.bin","c77c3d680085876e182598f4844cbdb2a5917ac483486c0ee1f74f95888bd024"],["vendor/pdfjs/chunks/pdf.4.bin","0a3985439efaadcebbf9dac1b9bd4dea2d137098f67e37a796ee5196814ead65"],["vendor/pdfjs/chunks/pdf.5.bin","a77f65d86958c10b871aea5aa09c1192fab7faa66ddeb7e56f8949fbfa38ec98"],["vendor/pdfjs/chunks/pdf.6.bin","f934900167c7d8b6c4b4819b3bbc8449949ca4668b863d2d1de5566e35cc77cf"],["vendor/pdfjs/chunks/worker.0.bin","3994dcce8a94a24e8f4c7895d0e7222f0b31fb8a2fe3c69d48000d5a67fe4771"],["vendor/pdfjs/chunks/worker.1.bin","7b99ec220cf70036523e5e283cfc3112bc9aa9480799949b2b920f3790a5f8f7"],["vendor/pdfjs/chunks/worker.10.bin","9fe25f4bbfca8285d2ee62bd1343449bdc3362b0fbd3f52905967f3e77f6935e"],["vendor/pdfjs/chunks/worker.11.bin","636b6c0d71687fa37448df552bd1d50b74c339a70ad5f515f63dc484052151e4"],["vendor/pdfjs/chunks/worker.12.bin","ad72f6e7de63e563b48bdd3ef6907bd66c7fdc0e100223d5e313f8b9c761aa4b"],["vendor/pdfjs/chunks/worker.13.bin","3cf025b8b21760cbc579a1581bebe57ced84b6b77ee332db2775946bc8619b33"],["vendor/pdfjs/chunks/worker.14.bin","01cb35b374621e8c6cff64313091ae5bd7e7c7eb45baa50a742e6b7ddd3c5421"],["vendor/pdfjs/chunks/worker.15.bin","4319ecc3e6b0d4fb4b35afb218faf1b428c47063d57045d8a2130fe966aad1e4"],["vendor/pdfjs/chunks/worker.16.bin","bc5a5fedc0584934f8537c9bd768a39588fb90feb86b04001973f08494dff57d"],["vendor/pdfjs/chunks/worker.2.bin","9a02912e1bb2d15ada16e54b64f3d1cb83570f9d87fd5509a75037cd4b2f7ddb"],["vendor/pdfjs/chunks/worker.3.bin","b7cdf15325de91e30df789c32d240a65cc47a285dcfcaf4aa382077f9fa7ca81"],["vendor/pdfjs/chunks/worker.4.bin","bd323feb4378ae9b262a2644aa19fe1678847c70bf6d68f0d92ce034fc20d1d7"],["vendor/pdfjs/chunks/worker.5.bin","85b93dc06c0c8dee9368bb5d85c30ee2b0b6ca63bf2a21b3cd67f8fa11c6ad8a"],["vendor/pdfjs/chunks/worker.6.bin","b51a78f0e9a1183b6f698cc539e68d39b19623006043fdad6b42ca0f89549922"],["vendor/pdfjs/chunks/worker.7.bin","95505c083d17c2e3c66def14b4ef7f15c32582d75739ab6c9469b5e5de314a11"],["vendor/pdfjs/chunks/worker.8.bin","eaebea65cdc3060e3025920c5c5842b06de2bc75ba43fb05c3dccc1f0c93bbf7"],["vendor/pdfjs/chunks/worker.9.bin","4a2b0614ae3b854164492952b36a59033042e00174c9e1f6259615dcc7a35f73"],["vendor/pdfjs/jbig2_nowasm_fallback.js","f73c6dfa49907f199955e8adbf2ff30de78c0b14b1414394c611cfe155a61cbb"],["vendor/pdfjs/openjpeg_nowasm_fallback.js","4790e98d118272ab4f096496dbafe9367a5cceccab4351e2ff3b9b689ffa26b4"],["vendor/pdfjs/pdf.js","bf24e9efeca38338e5732f340d388e130bfeca1b40d83723650b1b12d9973b1f"],["vendor/pdfjs/pdf.worker.js","dc6ff31b747803cd9086fab8d9e5ad501a97eb19c5f358ba198c05ca86126911"],["vendor/pdfjs/unpack.js","a470ff53acd4946872361c27eaa5751b8cb46c113f2c4855b9c4b9b5b816d7a5"],["walkthrough.js","b38461808e34a66f74a9943fb6e24fdae530d6fd04645e94fb98753ad00576ee"]];
const VERSION = '881ad532732f0a12';
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
