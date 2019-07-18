let CACHE_VERSION = 3;
let CACHE_NAME = 'cache_v' + CACHE_VERSION;
let CACHE_URLS = [
    '/',
    '/api/movies',
    '/js/main.js',
    '/js/render.js',
    '/css/main.css',
    '/img/logo.png'
]

function preCache() {
    return caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(CACHE_URLS)
        })
}
function clearCache() {
    return caches.keys().then(keys =>{
        keys.forEach(key => {
            if(key !== CACHE_NAME) {
                caches.delete(key);
            }
        })
    })
}

function saveToCache (req, res) {
    return caches
        .open(CACHE_NAME)
        .then(cache => cache.put(req, res))
}

function fetchAndCache(req) {
    return fetch(req).then(function(res){
        saveToCache(req, res.clone());
        return res;
    })
}
self.addEventListener("install", function(event) {
    event.waitUntil(
        preCache().then(self.skipWaiting)
    )
})

// 激活 sw也事先注册监听了activate事件
// acitvate事件触发，就意味着这个sw即将获得他注册的作用域的控制权
self.addEventListener('activate', function(event) {
    event.waitUntil(
        // 清除缓存同时获得控制权
        Promise.all([
            clearCache(),
            self.clients.claim()//在激活的过程里，需要调用clients.claim方法来让正在被激活的sw获得对cliam的完全控制权，
                                // 首次加载页面的时候 ，页面是没有被sw控制的，只有重新刷新页面才能不要重新刷新页面，就可是sw获得请求拦截等的页面控制权
        ])
        
    )
})
// fetch请求结束并且失败了才拿缓存中的数据
self.addEventListener('fetch', function(event) {
    let url = new URL(event.request.url); // 获取当前面请求的数据请求地址
    console.log('origin:' + origin,self.origin,'请求地址：'+event.request.url );// 如果不是同源数据就不拿sw的数据
    if(url.origin !== self.origin) {
        return ;
    }

    if(event.request.url.includes('/api/movies')) {
        event.respondWith(
            fetchAndCache(event.request).catch( //有网的情况下请求保存到本地 如果失败了 拿缓存
                function() {
                    return caches.match(event.request);
                }
            )
        )
        return;
    }
    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request);
        })
    )
})