
const CACHE_NAME = 'financial-manager-v2.3.0'; // تم تحديث الإصدار إلى 2.3.0

const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/fb.png',
  '/icons/yb.png',
  '/oauth2callback.html'
];

// تثبيت الكاش عند أول تحميل
self.addEventListener('install', event => {
  self.skipWaiting(); // يجبر التحديث الفوري
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('تم فتح الكاش');
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
            console.log('حذف الكاش القديم:', key);
            return caches.delete(key);
          }
        })
      )
    ).then(() => {
      console.log('تم تفعيل الإصدار الجديد:', CACHE_NAME);
      return self.clients.claim();
    })
  );
});

// التعامل مع الطلبات - استراتيجية الكاش أولاً
self.addEventListener('fetch', event => {
  // تجاهل طلبات غير GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدنا الملف في الكاش نعيده
        if (response) {
          return response;
        }

        // إذا لم يوجد في الكاش، نحمله من الشبكة
        return fetch(event.request)
          .then(networkResponse => {
            // نضع نسخة في الكاش للاستخدام المستقبلي
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            // إذا فشل الاتصال بالشبكة، نعيد صفحة الأساس
            if (event.request.url.indexOf(location.origin) !== -1) {
              return caches.match('/index.html');
            }
            console.log('فشل تحميل المورد:', event.request.url);
          });
      })
  );
});
