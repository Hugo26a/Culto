/* Culto : coquille de l'app en cache, éditions en réseau d'abord (lecture hors ligne de la dernière édition ouverte). */
const CACHE="culto-v4";
const SHELL=["./","index.html","app.css?v=4","app.js?v=4","manifest.webmanifest","icons/icon-180.png","icons/icon-192.png","icons/icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  const fresh=u.origin===location.origin&&(u.pathname.includes("/editions/")||/\.(html|js|css)$/.test(u.pathname)||u.pathname.endsWith("/"));
  if(fresh){
    e.respondWith(fetch(e.request,{cache:"no-store"}).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request)));
  }else{
    e.respondWith(caches.match(e.request).then(m=>m||fetch(e.request).then(r=>{if(r.ok&&(u.origin===location.origin||u.host.includes("fonts.g"))){const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c))}return r})));
  }
});
