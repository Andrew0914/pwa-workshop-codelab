/*
Copyright 2021 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */
const CACHE_NAME = 'cache-v1';
const PRECACHE_RESOURCES = ['/', '/index.html', '/css/style.css', '/js/main.js', '/js/app/editor.js', '/js/lib/actions.js'];

// save all pre-selected resources in cache
async function saveCache() {
  const cacheSpace = await caches.open(CACHE_NAME);
  return cacheSpace.addAll(PRECACHE_RESOURCES);
}

// check if there is already a cached resource and then use it, if not then get it from the network
async function handleRequest(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;
  return fetch(request);
}
// Listen for service worker installing so that we can save our resources in cache
self.addEventListener('install', (event) => {
  console.log('Service worker install event ⬇');
  event.waitUntil(saveCache());
});

// the service worker can now handle functional events
self.addEventListener('activate', (event) => {
  console.log('Service worker activate event! ✅');
});

// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for 🟡: ', event.request.url);
  event.respondWith(handleRequest(event.request));
});