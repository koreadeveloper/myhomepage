// sia.kr 서비스 워커 — 오프라인 폴백 + 정적 에셋 캐시
// HTML은 네트워크 우선(배포 즉시 반영), 해시된 /assets만 캐시 우선
const CACHE = 'sia-v1';
const OFFLINE_URL = '/';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.add(OFFLINE_URL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // 해시된 빌드 에셋은 캐시 우선 (파일명이 바뀌면 자연히 무효화)
  if (url.pathname.startsWith('/assets/')) {
    e.respondWith(
      caches.match(e.request).then(
        (hit) => hit ||
          fetch(e.request).then((res) => {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone));
            return res;
          })
      )
    );
    return;
  }

  // 페이지·나머지는 네트워크 우선, 실패 시 캐시/홈 폴백
  e.respondWith(
    fetch(e.request).catch(() =>
      caches.match(e.request).then((hit) => hit || caches.match(OFFLINE_URL))
    )
  );
});
