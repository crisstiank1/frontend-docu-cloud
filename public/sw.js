// Service worker desactivado en desarrollo
// Solo cachea en producción

const CACHE = "docucloud-vue-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (e) => {
  // No interceptar nada — dejar pasar todo al navegador
  return;
});
