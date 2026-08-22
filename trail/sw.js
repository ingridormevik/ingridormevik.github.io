
var CACHE = 'trailmix-trail-bf7dedaa';
var FILES = ["/assets/folklore/draugen.png", "/assets/folklore/fossegrimen.png", "/assets/folklore/huldra.png", "/assets/folklore/mare.png", "/assets/folklore/nisse.png", "/assets/folklore/nokken.png", "/assets/folklore/troll.png", "/assets/folklore/underjordiske.png", "/assets/locations/city-edge.png", "/assets/locations/floibanen-top.png", "/assets/locations/floyen.png", "/assets/locations/sandviken-sykehus.png", "/assets/locations/sandvikspilen.png", "/assets/locations/trail-forest.png", "/trail/", "/trail/floibanen/", "/trail/floyen/", "/trail/forest-transition/", "/trail/munkebotn/", "/trail/print.html", "/trail/sandviken-sykehus/", "/trail/sandviksbatteriet/", "/trail/sandvikspilen/"];
self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){
    // addAll fails the whole install if any one file 404s, so fetch individually.
    return Promise.all(FILES.map(function(f){
      return c.add(f).catch(function(){});
    }));
  }).then(function(){ return self.skipWaiting(); }));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.map(function(k){
      return k === CACHE ? null : caches.delete(k);
    }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(function(hit){
    if(hit) return hit;
    return fetch(e.request).then(function(res){
      if(res && res.ok && res.type === 'basic'){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, copy); });
      }
      return res;
    }).catch(function(){ return caches.match('/trail/'); });
  }));
});
