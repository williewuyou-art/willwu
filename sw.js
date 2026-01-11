// 更新版本號以強制瀏覽器重新抓取新檔案
const CACHE_NAME = 'eng-cam-v5.3'; 

const ASSETS_TO_CACHE = [
    './camera.html',
    './manifest.json',
    // 外部資源 (CDN)
    'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Outfit:wght@300;400;600;700&display=swap',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];

// 安裝時快取
self.addEventListener('install', (event) => {
    // 強制立即接管頁面，不用等待下次重新整理
    self.skipWaiting(); 
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching new assets:', CACHE_NAME);
            return Promise.all(
                ASSETS_TO_CACHE.map(url => {
                    return fetch(url, { mode: 'no-cors' }).then(response => {
                        return cache.put(url, response);
                    }).catch(err => console.warn('[SW] Cache fail:', url));
                })
            );
        })
    );
});

// 攔截請求
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            // 有快取就用快取，沒快取就上網抓
            return response || fetch(event.request);
        })
    );
});

// 啟動與清理舊快取
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // 刪除所有不等於當前版本號的快取
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // 立即取得控制權
    );
});