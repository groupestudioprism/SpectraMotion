/* Spectra Motion · service worker : l'app s'installe et se rouvre même avec une connexion instable.
   Pages : réseau d'abord (toujours la dernière version), copie de secours hors ligne. Polices et bibliothèques : copie locale.
   Jamais de cache pour Firebase (comptes, projets, médias du cloud). */
const CACHE = 'spectra-motion-v4';
const CORE = ['./', './index.html', './manifest.webmanifest', './assets/branding/spectra-motion-favicon.svg', './assets/branding/spectra-motion-192.png', './assets/branding/spectra-motion-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (/googleapis\.com$/.test(u.hostname) && !/fonts\.googleapis\.com$/.test(u.hostname)) return;
  if (/firebaseio|identitytoolkit|securetoken|firestore|firebasestorage/.test(u.hostname)) return;
  if (r.headers.has('range')) return; // lecture de vidéos par morceaux : toujours le réseau
  if (r.mode === 'navigate' || (u.origin === location.origin && /\.(html|webmanifest)$|\/$/.test(u.pathname))){
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./index.html'))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$|cdn\.jsdelivr\.net$|www\.gstatic\.com$/.test(u.hostname) || (u.origin === location.origin && /\/assets\//.test(u.pathname))){
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok || res.type === 'opaque'){ const c = res.clone(); caches.open(CACHE).then(k => k.put(r, c)); } return res; })));
  }
});
