// Network first, cache as the fallback when offline. The page registers this file as
// sw.js?v=<build>, so every new build gets its own cache and the old one is cleared.
const V="inv-"+(new URL(self.location).searchParams.get("v")||"1"),SHELL=["./","index.html","manifest.json","icon.svg","icon-192.png","apple-touch-icon.png","firebase-config.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET"||!/^https?:$/.test(u.protocol))return;
  // Firestore/Auth API traffic is handled by the Firebase SDK itself
  if(/googleapis\.com|firebaseio\.com|identitytoolkit/.test(u.host))return;
  e.respondWith(fetch(e.request).then(r=>{
    // keep only complete, readable answers — never an error page or an opaque response
    if(r.ok&&(r.type==="basic"||r.type==="cors")){const c=r.clone();e.waitUntil(caches.open(V).then(x=>x.put(e.request,c)))}
    return r;
  }).catch(()=>caches.match(e.request).then(r=>r||(e.request.mode==="navigate"?caches.match("index.html"):Response.error()))));
});
