// 离线缓存：本地文件预缓存；地图数据与字体首次联网后缓存，之后可离线使用
const CACHE='kyzz-v20';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const put=res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(req,cp));}return res;};
  // 页面本身联网优先：更新后下次打开就是新版，断网时再用缓存
  if(req.mode==='navigate'){e.respondWith(fetch(req).then(put).catch(()=>caches.match(req).then(hit=>hit||caches.match('./index.html'))));return;}
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(put).catch(()=>hit);
    return hit||net;
  }));
});
