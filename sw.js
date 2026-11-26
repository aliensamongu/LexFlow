/* === LEXFLOW SERVICE WORKER (OFFLINE PWA SUPPORT v3) === */
const APP_CACHE = 'lexflow-app-shell-v3';
const CDN_CACHE = 'lexflow-cdn-assets-v3';

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
    './js/lexflow-tablet-mode.js'
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

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);
    const isSameOrigin = url.origin === self.location.origin;

    // 1. Same-origin app files: Network-First so GitHub updates always arrive immediately
    if (isSameOrigin) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    if (res && res.ok) {
                        const copy = res.clone();
                        caches.open(APP_CACHE).then((c) => c.put(req, copy)).catch(() => {});
                    }
                    return res;
                })
                .catch(() => caches.match(req).then((cached) => cached || caches.match('./index.html')))
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
                }).catch(() => cached);
            })
        );
    }
});
