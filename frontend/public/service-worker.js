const CACHE_NAME = "funmath-v1"
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/assets/index.css",
  "/assets/index.js",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
]

// Cài đặt Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Opened cache")
      return cache.addAll(urlsToCache)
    }),
  )
})

// Chiến lược cache: Cache first, then network
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Cache hit - return response
      if (response) {
        return response
      }
      return fetch(event.request).then((response) => {
        // Kiểm tra response hợp lệ
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response
        }

        // Clone response để cache
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          // Không cache API requests
          if (!event.request.url.includes("/api/")) {
            cache.put(event.request, responseToCache)
          }
        })

        return response
      })
    }),
  )
})

// Xóa cache cũ khi có phiên bản mới
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})

// Đồng bộ hóa dữ liệu khi online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(syncData())
  }
})

// Xử lý thông báo đẩy
self.addEventListener("push", (event) => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    data: {
      url: data.url,
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

// Xử lý khi người dùng click vào thông báo
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url))
  }
})

// Hàm đồng bộ dữ liệu
async function syncData() {
  const db = await openDB()
  const offlineData = await db.getAll("offlineActions")

  for (const data of offlineData) {
    try {
      await fetch(data.url, {
        method: data.method,
        headers: data.headers,
        body: data.body,
      })
      await db.delete("offlineActions", data.id)
    } catch (error) {
      console.error("Sync failed:", error)
    }
  }
}

// Mở IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("FunMathOfflineDB", 1)

    request.onupgradeneeded = (event) => {
      const db = event.target.result
      db.createObjectStore("offlineActions", { keyPath: "id", autoIncrement: true })
    }

    request.onsuccess = (event) => {
      resolve(event.target.result)
    }

    request.onerror = (event) => {
      reject("IndexedDB error: " + event.target.errorCode)
    }
  })
}
