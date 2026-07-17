/*
===========================================
KliseApp
Service Worker v1.0
===========================================
*/

const CACHE_NAME = "kliseapp-v1.0.0";

const APP_SHELL = [

    "./",
    "./index.html",

    "./manifest.json",

    "./css/style.css",

    "./js/app.js",
    "./js/viewer.js",
    "./js/film-engine.js",
    "./js/export.js",

    "./assets/logo.png"

];

// ======================================
// INSTALL
// ======================================

self.addEventListener("install", event => {

    console.log("Service Worker Installing...");

    event.waitUntil(

        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))

    );

    self.skipWaiting();

});

// ======================================
// ACTIVATE
// ======================================

self.addEventListener("activate", event => {

    console.log("Service Worker Activated");

    event.waitUntil(

        caches.keys().then(keys => {

            return Promise.all(

                keys.map(key => {

                    if (key !== CACHE_NAME) {

                        console.log("Deleting old cache:", key);

                        return caches.delete(key);

                    }

                })

            );

        })

    );

    self.clients.claim();

});

// ======================================
// FETCH
// ======================================

self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    const request = event.request;

    // HTML → selalu cek jaringan dulu
    if (request.mode === "navigate") {

        event.respondWith(

            fetch(request)

                .then(response => {

                    const clone = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(request, clone));

                    return response;

                })

                .catch(() => caches.match(request))
                .then(res => res || caches.match("./index.html"))

        );

        return;

    }

    // CSS, JS, IMG → cache dulu
    event.respondWith(

        caches.match(request)

            .then(cacheResponse => {

                if (cacheResponse) {

                    return cacheResponse;

                }

                return fetch(request)

                    .then(networkResponse => {

                        if (!networkResponse || networkResponse.status !== 200) {

                            return networkResponse;

                        }

                        const clone = networkResponse.clone();

                        caches.open(CACHE_NAME)

                            .then(cache => {

                                cache.put(request, clone);

                            });

                        return networkResponse;

                    });

            })

    );

});
