/* Office Toolkit service worker - Developed by Nahin */
const VERSION = 'office-toolkit-v6';
const ASSETS = ['./', 'index.html', 'style.css', 'app.js', 'manifest.json',
  'tools/formula.js', 'tools/image.js', 'tools/pdf.js', 'tools/doc.js', 'tools/sheet.js', 'tools/slides.js', 'tools/files.js',
  'libs/jspdf.umd.min.js', 'libs/pdf-lib.min.js', 'libs/mammoth.browser.min.js', 'libs/docx.umd.js', 'libs/pdf.min.js', 'libs/pdf.worker.min.js', 'libs/xlsx.full.min.js', 'libs/pptxgen.bundle.js', 'libs/jszip.min.js',
  'fonts/inter-latin-wght-normal.woff2', 'fonts/fraunces-latin-wght-normal.woff2', 'fonts/fraunces-latin-wght-italic.woff2', 'fonts/jetbrains-mono-latin-wght-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(req, copy)); } return res; }).catch(() => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
    return hit || net;
  }));
});
