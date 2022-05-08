const APP_PREFIX = "PWA";
const VERSION = "version_01";
const CACHE_NAME = APP_PREFIX + VERSION;
const FILES_TO_CACHE = [
  "/index.html",
  "/css/styles.css",
  "/js/index.js",
  "/js/idb.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    // Add files to the cache
    caches.open(CACHE_NAME).then((cache) => {
      console.log(`Installing cache : ${CACHE_NAME}`);
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    
    caches.keys().then((keyList) => {
      let cacheKeepList = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX);
      });

     
      cacheKeepList.push(CACHE_NAME);

      
      return Promise.all(
        keyList.map(function (key, i) {
          if (cacheKeepList.indexOf(key) === -1) {
            console.log(`Deleting cache : ${keyList[i]}`);
            return caches.delete(keyList[i]);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(function (request) {
      if (request) {
        return request;
      } else {
        return fetch(event.request);
      }
    })
  );
});