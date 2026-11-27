/* === LEXFLOW SERVICE WORKER (OFFLINE PWA SUPPORT v6) === */
const APP_CACHE = 'lexflow-app-shell-v6';
const CDN_CACHE = 'lexflow-cdn-assets-v6';

const APP_SHELL_URLS = [
    './',
    './index.html',
    './manifest.json',
    './lexflow-icon.png',
    './js/lexicon-scripture-search.js',
    './js/lexflow-phase1.js',
    './js/lexflow-phase2-dock.js',
    './js/lexflow-phase3-exegesis.js',
    './js/lexflow-phase4-export.js',
    './js/lexflow-church-fathers.js',
    './js/lexflow-tablet-mode.js',
    './js/lexflow-fix.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(APP_CACHE).then((cache) => {
            return Promise.allSettled(
                APP_SHELL_URLS.map((url) =>
                    cache.add(new Request(url, { cache: 'reload' })).catch(() => {})
                )
            );
        }).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k !== APP_CACHE && k !== CDN_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    const isSameOrigin = url.origin === self.location.origin;

    // 1. Same-origin app files: Network-First with cache revalidation so GitHub updates arrive immediately
    if (isSameOrigin) {
        const isNav = req.mode === 'navigate';
        const isCodeOrManifest = /\.(js|json|css|html)$/i.test(url.pathname);
        const networkReq = (!isNav && isCodeOrManifest)
            ? new Request(req.url, { cache: 'no-cache' })
            : req;

        event.respondWith(
            fetch(networkReq)
                .then((res) => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(APP_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return res;
                })
                .catch(() =>
                    caches.match(req).then((cached) => {
                        if (cached) return cached;
                        if (isNav) return caches.match('./index.html');
                        return Response.error();
                    })
                )
        );
        return;
    }

    // 2. Static CDN libraries & fonts: Cache-First for instant offline speed
    const isStaticCdn =
        /cdn\.tailwindcss\.com|cdnjs\.cloudflare\.com|cdn\.jsdelivr\.net|fonts\.googleapis\.com|fonts\.gstatic\.com/i.test(url.hostname);

    if (isStaticCdn) {
        event.respondWith(
            caches.match(req).then((cached) => {
                if (cached) return cached;
                return fetch(req).then((res) => {
                    if (res && (res.ok || res.type === 'opaque')) {
                        const copy = res.clone();
                        caches.open(CDN_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return res;
                }).catch(() => cached || Response.error());
            })
        );
    }
});
