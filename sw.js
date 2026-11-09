/* AETHER Gym service worker: keeps the app's own files on the phone so it opens instantly and works offline.
   Bump VERSION whenever you upload changed files, so phones fetch the new ones. */
var VERSION="aether-gym-v1";
var FILES=["./","index.html","hub.css","app-gym.css","app.css","config.js","supa.js","hub.js","theme.js","app-gym.js","manifest.webmanifest","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png"];
self.addEventListener("install",function(e){e.waitUntil(caches.open(VERSION).then(function(c){return c.addAll(FILES)}).then(function(){return self.skipWaiting()}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==VERSION&&k!==VERSION+"-cdn"}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener("fetch",function(e){
  var r=e.request,u=new URL(r.url);
  if(r.method!=="GET")return;
  /* never cache account data or photos */
  if(/supabase\.co$/.test(u.hostname))return;
  if(u.origin===location.origin){
    /* the app's own files: show the saved copy straight away, refresh it in the background */
    e.respondWith(caches.open(VERSION).then(function(c){return c.match(r,{ignoreSearch:true}).then(function(hit){
      var net=fetch(r).then(function(res){if(res&&res.ok)c.put(r,res.clone());return res}).catch(function(){return hit});
      return hit||net;
    })}));
    return;
  }
  /* fonts and the Supabase library from their CDNs: cache after first use */
  if(/fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$/.test(u.hostname)){
    e.respondWith(caches.open(VERSION+"-cdn").then(function(c){return c.match(r).then(function(hit){return hit||fetch(r).then(function(res){if(res&&(res.ok||res.type==="opaque"))c.put(r,res.clone());return res})})}));
  }
});
