const CACHE_NAME = 'financial-manager-v1.7.6'; // غيّر الرقم مع كل إصدار جديد

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// تثبيت الكاش عند أول تحميل
self.addEventListener('install', event => {
  self.skipWaiting(); // يجبر التحديث الفوري
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// تفعيل الكاش الجديد وحذف القديم
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
});

// التعامل مع الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // إذا وجدنا الملف في الكاش نعيده، وإلا نطلبه من الشبكة
      return response || fetch(event.request);
    })
  );
});