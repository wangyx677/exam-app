// 鑰冭瘯缁冭禌 Service Worker - 绂荤嚎鏀寔
const CACHE_NAME = 'exam-v4';
const CDN_XLSX = 'https://cdn.sheetjs.com/xlsx-0.20.2/package/dist/xlsx.full.min.js';

// 瀹夎锛氶缂撳瓨鏈湴鏂囦欢 + CDN
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching...');
      return Promise.allSettled([
        cache.add('./index.html'),
        cache.add('./manifest.json'),
        cache.add('./exam_bank_template.xlsx'),
        cache.add(CDN_XLSX)
      ]);
    }).then(() => self.skipWaiting())
  );
});

// 婵€娲伙細娓呯悊鏃х増鏈紦瀛?self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 璇锋眰鎷︽埅锛氱紦瀛樹紭鍏堬紝绂荤嚎鍙敤
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  var url = event.request.url;
  if (!url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 缂撳瓨鍛戒腑锛岀洿鎺ヨ繑鍥?      if (cached) return cached;

      // 鍚﹀垯璧扮綉缁滐紝鍚屾椂鍐欏叆缂撳瓨
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200) return response;
        var clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(() => {
        // 绂荤嚎涓旀棤缂撳瓨
        return new Response('绂荤嚎鐘舵€侊紝璇疯繛鎺ョ綉缁滃悗閲嶆柊鎵撳紑涓€娆″嵆鍙绾夸娇鐢?, {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
