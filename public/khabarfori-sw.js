// Only a generic offline screen is cached. Never store HTML sessions, API data,
// private directory records, premium articles or auth responses in Cache Storage.
const CACHE='khabarfori-offline-v1';
const OFFLINE='/offline-khabarfori.html';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.add(new Request(OFFLINE,{cache:'reload'}))));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('khabarfori-offline-')&&key!==CACHE).map(key=>caches.delete(key)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==self.location.origin||!(url.pathname==='/mobile'||url.pathname.startsWith('/mobile/')))return;
 event.respondWith(fetch(event.request).catch(async()=>{const offline=await caches.match(OFFLINE);return offline||new Response('برای استفاده از خبرفوری به اینترنت متصل شوید.',{status:503,headers:{'Content-Type':'text/plain;charset=utf-8'}})}));
});
