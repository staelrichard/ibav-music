const CACHE_NAME = "ibav-music-v3";

const ARQUIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./logo-ibav-music.png",
  "./fundo-ibav-music.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => {
      return Promise.all(
        nomes
          .filter((nome) => nome.startsWith("ibav-music-") && nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (
    url.origin === self.location.origin &&
    event.request.method === "GET"
  ) {
    event.respondWith(
      fetch(event.request)
        .then((resposta) => {
          const copia = resposta.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copia);
          });

          return resposta;
        })
        .catch(() => caches.match(event.request))
    );
  }
});

self.addEventListener('push',event=>{event.waitUntil((async()=>{let p={};try{p=event.data.json();}catch(e){}const d=p.data||p.notification||{};await self.registration.showNotification(d.title||'IBAV Music',{body:d.body||'Você tem uma nova notificação.',icon:'./logo-ibav-music.png',tag:d.id||undefined,data:{url:new URL('./',self.registration.scope).href}});})());});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil((async () => {
    const url = new URL('./', self.registration.scope).href;
    const windows = await self.clients.matchAll({type:'window', includeUncontrolled:true});
    const existing = windows.find(c => c.url.startsWith(url));
    if (existing) {
      try { await existing.focus(); return; } catch (_) {}
    }
    await self.clients.openWindow(url);
  })());
});
