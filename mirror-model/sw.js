const CACHE='mirror-model-after-dark-v2-20261029';
const SHELL=['./','index.html','v2/mirror.css','v2/lines.js','v2/face.js','v2/app.js','v2/icon.svg','v2/manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);await cache.addAll(SHELL);
  const response=await fetch('v2/lines.js');const text=await response.text();
  const rows=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));
  await Promise.all(rows.map(row=>cache.add(row.audio).catch(()=>{})));
  await self.skipWaiting();
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('mirror-model-')&&key!==CACHE)await caches.delete(key);await self.clients.claim();})()));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
  if(!new URL(event.request.url).pathname.startsWith(new URL(self.registration.scope).pathname))return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    if(cached)return cached;
    return fetch(event.request);
  })());
});
