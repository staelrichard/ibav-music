
const CACHE_NAME = "ibav-music-v1";

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
          .filter((nome) => nome !== CACHE_NAME)
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
