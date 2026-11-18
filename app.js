/* Office Toolkit - core. Developed by Nahin */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ICONS = {
  image: '<rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>',
  layers: '<path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/>',
  fileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  table: '<path d="M12 3v18"/><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/>',
  present: '<path d="M2 3h20"/><path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3"/><path d="m7 21 5-5 5 5"/>',
  folder: '<path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2"/>',
  save: '<path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
};
const svg = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n] || ''}</svg>`;
const VIEW_META = { image: ['image', 't_image'], pdf: ['layers', 't_pdf'], doc: ['fileText', 't_doc'], sheet: ['table', 't_sheet'], slides: ['present', 't_slides'], files: ['folder', 't_files'] };

const App = {
  ico: svg, layers: [], missing: [],
  tools: {}, mounted: {}, cur: 'home', dict: { en: {}, bn: {} }, libs: {}, deferred: null,
  lang: localStorage.getItem('ot_lang') || 'en',
  esc: s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
  uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  fmtSize(b) { b = b || 0; return b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB'; },
  addLang(en, bn) { Object.assign(App.dict.en, en); Object.assign(App.dict.bn, bn || {}); },
  t(k) { return App.dict[App.lang][k] ?? App.dict.en[k] ?? k; },
  i18n(root = document) {
    $$('[data-i18n]', root).forEach(e => e.textContent = App.t(e.dataset.i18n));
    $$('[data-i18n-ph]', root).forEach(e => e.placeholder = App.t(e.dataset.i18nPh));
    $$('[data-i18n-title]', root).forEach(e => e.title = App.t(e.dataset.i18nTitle));
  },
  reg(id, tool) { tool.id = id; App.tools[id] = tool; },

  /* ---------- UI helpers ---------- */
  toast(msg, err) {
    const el = $('#toast'); el.textContent = msg; el.className = 'toast show' + (err ? ' err' : '');
    clearTimeout(App._tt); App._tt = setTimeout(() => el.classList.remove('show'), err ? 4500 : 2200);
  },
  busy(on, msg) { $('#loader').classList.toggle('hidden', !on); if (on) $('#loaderMsg').textContent = msg || App.t('loading'); },
  modal({ title, body, buttons = [] }) {
    $('#modalTitle').textContent = title || '';
    const b = $('#modalBody'); b.innerHTML = ''; typeof body === 'string' ? b.innerHTML = body : b.appendChild(body);
    const f = $('#modalFoot'); f.innerHTML = '';
    buttons.forEach(x => { const e = document.createElement('button'); e.className = 'btn ' + (x.cls || ''); e.textContent = x.label; e.onclick = () => x.fn && x.fn(e); f.appendChild(e); });
    if ($('#modal').classList.contains('hidden')) App.pushLayer(() => App.hideModal());
    $('#modal').classList.remove('hidden'); return b;
  },
  hideModal() { $('#modal').classList.add('hidden'); $('#modalBody').innerHTML = ''; },
  closeModal() { if (!$('#modal').classList.contains('hidden')) App.closeLayer(); },
  /* back-button support: every modal / fullscreen layer owns one history entry */
  pushLayer(close) { App.layers.push(close); history.pushState({ v: App.cur, l: App.layers.length }, '', '#' + App.cur); App.updateBack(); },
  closeLayer() { if (App.layers.length) history.back(); },
  updateBack() { $('#backBtn').classList.toggle('hidden', App.cur === 'home' && !App.layers.length); },
  async renderRecent() {
    try {
      const files = (await App.DB.all('files')).sort((a, b) => b.updated - a.updated); $('#fileCount').textContent = files.length;
      const box = $('#recent'); box.innerHTML = files.length ? '' : '<p class="muted">' + App.t('noRecent') + '</p>';
      const ic = { image: 'image', pdf: 'layers', doc: 'fileText', sheet: 'table', slides: 'present' };
      files.slice(0, 4).forEach(f => { const d = document.createElement('div'); d.className = 'item'; d.style.cursor = 'pointer'; d.innerHTML = `<div class="ftype">${svg(ic[f.type] || 'fileText')}</div><div class="meta"><b>${App.esc(f.name)}.${App.esc(f.ext)}</b><span class="stat">${App.fmtSize(f.size)} · ${new Date(f.updated).toLocaleDateString()}</span></div>${svg('arrowRight')}`; d.onclick = async () => { await App.go(f.type); await App.tools[f.type].openFile(f); }; box.appendChild(d); });
    } catch (e) { }
  },
  download(blob, name) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 20000);
  },
  pick(accept, multiple, capture) {
    return new Promise(res => {
      const i = document.createElement('input'); i.type = 'file'; i.accept = accept || '*/*'; i.multiple = !!multiple;
      if (capture) i.setAttribute('capture', 'environment');
      i.onchange = () => res([...i.files]); i.click();
    });
  },
  readBuf: f => f.arrayBuffer(),
  readText: f => f.text(),
  readURL: f => new Promise((r, j) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.onerror = j; fr.readAsDataURL(f); }),
  blobFromURL: u => fetch(u).then(r => r.blob()),

  /* ---------- lazy library loader ---------- */
  load(list) {
    return Promise.all((list || []).map(src => App.libs[src] ||= new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => { delete App.libs[src]; rej(new Error('Could not load ' + src)); };
      document.head.appendChild(s);
    })));
  },
  async pdfjs() {
    await App.load(['libs/pdf.min.js']);
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'libs/pdf.worker.min.js'; return pdfjsLib;
  },
  /* render every page of a PDF (ArrayBuffer) as canvases into container */
  async renderPdf(buf, container, opt = {}) {
    const lib = await App.pdfjs();
    const doc = await lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise;
    container.innerHTML = '';
    const w = (container.clientWidth || 360) * (opt.zoom || 1), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const max = Math.min(doc.numPages, opt.maxPages || 200);
    for (let i = 1; i <= max; i++) {
      const p = await doc.getPage(i), v1 = p.getViewport({ scale: 1 }), sc = (w / v1.width) * dpr, v = p.getViewport({ scale: sc });
      const c = document.createElement('canvas'); c.width = v.width; c.height = v.height; c.style.width = (opt.zoom || 1) * 100 + '%';
      container.appendChild(c); await p.render({ canvasContext: c.getContext('2d'), viewport: v }).promise;
    }
    return doc.numPages;
  },

  /* ---------- IndexedDB ---------- */
  DB: {
    db: null,
    open() {
      return new Promise((res, rej) => {
        const r = indexedDB.open('office-toolkit', 1);
        r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('files', { keyPath: 'id' }); d.createObjectStore('drafts', { keyPath: 'key' }); };
        r.onsuccess = () => { App.DB.db = r.result; res(); }; r.onerror = () => rej(r.error);
      });
    },
    tx(store, mode, fn) {
      return new Promise((res, rej) => {
        const t = App.DB.db.transaction(store, mode), s = t.objectStore(store), q = fn(s);
        t.oncomplete = () => res(q && q.result); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
      });
    },
    put: (s, v) => App.DB.tx(s, 'readwrite', o => o.put(v)),
    get: (s, k) => App.DB.tx(s, 'readonly', o => o.get(k)),
    all: s => App.DB.tx(s, 'readonly', o => o.getAll()),
    del: (s, k) => App.DB.tx(s, 'readwrite', o => o.delete(k)),
  },

  /* ---------- tools / routing ---------- */
  async ensure(id) {
    const tool = App.tools[id]; if (!tool) return null;
    if (!App.mounted[id]) {
      App.busy(true);
      try {
        await App.load(tool.libs);
        const el = $('#view-' + id); await tool.mount(el);
        const vm = VIEW_META[id]; if (vm) el.insertAdjacentHTML('afterbegin', `<div class="thead"><span class="ti">${svg(vm[0])}</span><h2 data-i18n="${vm[1]}"></h2></div>`);
        el.insertAdjacentHTML('beforeend', '<div class="foot" data-i18n="by"></div>'); App.i18n(el);
        const d = await App.DB.get('drafts', id).catch(() => null);
        if (d && d.state && tool.setState) { try { await tool.setState(d.state); } catch (e) { console.warn('draft restore failed', e); } }
        App.mounted[id] = true;
      } finally { App.busy(false); }
    }
    return tool;
  },
  showMissing() {
    const b = document.createElement('div'); b.innerHTML = `<p>${App.t('miss_b')}</p><pre style="white-space:pre-wrap;background:rgba(0,0,0,.3);padding:10px;border-radius:10px;font-size:13px">${App.missing.map(App.esc).join('\n') || '-'}</pre><p>${App.t('miss_h')}</p>`;
    App.modal({ title: App.t('miss_t'), body: b, buttons: [{ label: App.t('close'), cls: 'sec', fn: App.closeModal }] });
  },
  async go(id, noPush) {
    if (id !== 'home' && !App.tools[id]) { App.toast(App.t('miss_t') + ': tools/' + id + '.js', true); App.showMissing(); return; }
    if (id === App.cur && !noPush && !App.layers.length) return;
    try { await App.ensure(id); } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); return; }
    while (App.layers.length && !noPush) { const f = App.layers.pop(); try { f(); } catch (e) { } }
    App.cur = id;
    $$('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + id));
    $$('.bottomnav button').forEach(b => b.classList.toggle('on', b.dataset.go === id));
    if (!noPush) history.pushState({ v: id, l: 0 }, '', '#' + id);
    App.updateBack(); if (id === 'home') App.renderRecent();
    const t = App.tools[id]; if (t && t.onShow) t.onShow();
    $('#view-' + id).scrollTop = 0;
  },
  touch(id) { if (App.tools[id]) App.tools[id].dirty = true; },
  async flushDrafts() {
    for (const id in App.mounted) {
      const t = App.tools[id];
      if (t.dirty && t.getState) { t.dirty = false; try { await App.DB.put('drafts', { key: id, state: await t.getState(), updated: Date.now() }); } catch (e) { console.warn('draft save', e); } }
    }
  },
  /* Save current screen: store in My Files + download to phone */
  async save(id, opt = {}) {
    const tool = App.tools[id];
    if (!tool || !App.mounted[id] || !tool.hasContent()) return 0;
    const out = await tool.exportFile(); const list = (Array.isArray(out) ? out : [out]).filter(Boolean);
    for (const r of list) {
      r.id ||= App.uid();
      await App.DB.put('files', { id: r.id, type: id, name: r.name, ext: r.ext, mime: r.mime || r.blob.type, blob: r.blob, state: r.state || null, size: r.blob.size, updated: Date.now() });
    }
    if (tool.dirty !== undefined) { await App.flushDrafts(); }
    if (opt.download !== false && list.length) {
      if (list.length === 1) App.download(list[0].blob, list[0].name + '.' + list[0].ext);
      else { await App.load(['libs/jszip.min.js']); const z = new JSZip(); const used = {}; list.forEach(r => { let n = r.name + '.' + r.ext; if (used[n]) n = r.name + '-' + used[n]++ + '.' + r.ext; else used[n] = 1; z.file(n, r.blob); }); App.download(await z.generateAsync({ type: 'blob' }), id + '-files.zip'); }
    }
    return list.length;
  },
  async onSaveBtn() {
    const id = App.cur;
    try {
      if (App.tools[id] && id !== 'files') {
        if (!App.mounted[id] || !App.tools[id].hasContent()) return App.toast(App.t('nothing'), true);
        App.busy(true, App.t('saving'));
        const n = await App.save(id); App.toast('\u2705 ' + App.t('saved') + (n > 1 ? ' (' + n + ')' : ''));
      } else {
        App.busy(true, App.t('saving')); let n = 0;
        for (const k in App.mounted) if (k !== 'files') n += await App.save(k, { download: false });
        if (!n) return App.toast(App.t('nothing'), true);
        App.toast('\u2705 ' + App.t('savedAll') + ' (' + n + ')');
      }
    } catch (e) { console.error(e); App.toast(App.t('err') + ': ' + e.message, true); }
    finally { App.busy(false); }
  },

  /* ---------- start ---------- */
  setLang(l) {
    App.lang = l; localStorage.setItem('ot_lang', l); document.documentElement.lang = l === 'bn' ? 'bn' : 'en';
    $('#langTxt').textContent = l === 'bn' ? 'English' : 'বাংলা'; App.i18n(); App.renderRecent(); for (const id in App.mounted) { const t = App.tools[id]; t.onLang && t.onLang(); }
  },
  setTheme(m) { document.documentElement.dataset.theme = m; localStorage.setItem('ot_theme', m); $('#themeBtn').innerHTML = svg(m === 'dark' ? 'sun' : 'moon'); $('meta[name=theme-color]').content = m === 'dark' ? '#070b1f' : '#ffffff'; },
  async install() {
    if (App.standalone) return App.toast(App.t('installed'));
    if (App.deferred) { const d = App.deferred; App.deferred = null; try { await d.prompt(); const r = await d.userChoice; if (r.outcome === 'accepted') App.toast(App.t('installing')); else App.deferred = d; } catch (e) { App.deferred = d; App.installGuide(); } return; }
    App.installGuide();
  },
  installGuide() {
    const ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1), android = /android/i.test(ua),
      inapp = /FBAN|FBAV|Instagram|Line\/|Messenger|WhatsApp|Snapchat|TikTok|; wv\)/i.test(ua), safari = /safari/i.test(ua) && !/crios|fxios|edgios|chrome/i.test(ua);
    let k = 'ig3'; if (inapp) k = 'ig_inapp'; else if (ios) k = safari ? 'ig2' : 'ig_ios2'; else if (android) k = 'ig_and';
    const b = document.createElement('div'); b.innerHTML = `<p style="font-size:16px"><b>${App.t(k)}</b></p><p class="muted">${App.t('ig0')}</p>`;
    App.modal({ title: App.t('installApp'), body: b, buttons: [{ label: App.t('close'), cls: 'sec', fn: App.closeModal }] });
  },
  async start() {
    $$('[data-ico]').forEach(e => e.innerHTML = svg(e.dataset.ico));
    App.setTheme(localStorage.getItem('ot_theme') || 'dark');
    try { await App.DB.open(); } catch (e) { App.toast('Storage unavailable: ' + e.message, true); }
    App.setLang(App.lang);
    $$('[data-go]').forEach(b => b.addEventListener('click', () => App.go(b.dataset.go)));
    $('#saveBtn').onclick = App.onSaveBtn;
    $('#backBtn').onclick = () => { if (App.layers.length || App.cur !== 'home') history.back(); };
    $('#langBtn').onclick = () => App.setLang(App.lang === 'en' ? 'bn' : 'en');
    $('#themeBtn').onclick = () => App.setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
    $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') App.closeModal(); });
    window.addEventListener('popstate', e => {
      const st = e.state || { v: 'home', l: 0 }, n = st.l || 0;
      while (App.layers.length > n) { const f = App.layers.pop(); try { f(); } catch (x) { } }
      const v = st.v || 'home'; if (!n && v !== App.cur && (v === 'home' || App.tools[v])) App.go(v, true); else App.updateBack();
    });
    window.addEventListener('error', e => { if (e.message && !/ResizeObserver/.test(e.message)) App.toast(App.t('err') + ': ' + e.message, true); });
    window.addEventListener('unhandledrejection', e => App.toast(App.t('err') + ': ' + (e.reason && e.reason.message || e.reason), true));
    setInterval(App.flushDrafts, 3000);
    document.addEventListener('visibilitychange', () => { if (document.hidden) App.flushDrafts(); });
    window.addEventListener('pagehide', App.flushDrafts);
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist();
    // install
    const standalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    const btns = $$('#installBtn,#heroInstall'); App.standalone = standalone;
    if (standalone) btns.forEach(b => b.classList.add('hidden'));
    window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); App.deferred = e; });
    window.addEventListener('appinstalled', () => { App.deferred = null; btns.forEach(b => b.classList.add('hidden')); App.toast('\u2705 ' + App.t('installed')); });
    btns.forEach(b => b.onclick = App.install);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(e => console.warn('SW', e));
    const h = location.hash.slice(1); history.replaceState({ v: 'home', l: 0 }, '', '#home');
    await App.go('home', true); App.renderRecent(); if (App.missing.length) App.showMissing(); else if (App.tools[h]) App.go(h);
  },
};

App.addLang({
  miss_t: 'App files missing', miss_b: 'These files were not found on the server, so some tools cannot open:', miss_h: 'Fix: upload the whole folders (tools, libs, fonts, icons) to your GitHub repository next to index.html, wait 1-2 minutes, then reload with Ctrl+Shift+R.',
  installApp: 'Install App', installed: 'App is already installed', installing: 'Installing... check your home screen', ig_and: 'Tap the browser menu (three dots) at the top right, then tap "Install app" (or "Add to Home screen"). If you do not see it, open this link in Chrome.', ig_ios2: 'Open this link in Safari, tap the Share button, then "Add to Home Screen".', ig_inapp: 'This in-app browser cannot install apps. Tap the three dots (or Share) and choose "Open in browser" / "Open in Chrome", then press Install App again.',
  appName: 'Office Toolkit', by: 'Developed by Nahin', installGuide: 'Install Guide', installNow: 'Install now', badge: 'Works 100% offline · Zero login · Local storage', h1a: 'Your pocket office,', h1b: 'ready offline.',
  homeSub: 'Resize photos, build PDFs, edit documents, and crunch spreadsheets directly on your device with local auto-save.', recent: 'Recent Saved Work', noRecent: 'No saved files yet. Open any tool below and press Save.',
  nt_image: 'Resizer', nt_doc: 'Docs', nt_sheet: 'Sheet', nt_slides: 'Slides',
  ig0: 'Install Office Toolkit like a real app. Open this page once while online, then it works offline.', ig1: 'Tap the browser menu (three dots), then "Install app" or "Add to Home screen".', ig2: 'Tap the Share button, then "Add to Home Screen".', ig3: 'Click the install icon at the right end of the address bar.',
  t_image: 'Image Resizer', d_image: 'Batch resize, passport presets, JPG/PNG/WebP compression & live preview.', t_pdf: 'PDF Maker', d_pdf: 'Images or text to PDF, reorder & rotate pages, merge & split PDFs.', t_doc: 'Document Reader & Editor', d_doc: 'Read .docx, .pdf, .md, .txt and edit rich text with .docx/.pdf export.',
  t_sheet: 'Spreadsheet', d_sheet: 'Formulas (SUM, IF, AVERAGE), multi-sheet tabs, .xlsx/.csv & charts.', t_slides: 'Presentation Maker', d_slides: 'Build slide decks with themes, transitions & animations, present fullscreen, export .pptx.', t_files: 'My Files', d_files: 'All your saved work',
  new: 'NEW', save: 'Save', n_home: 'Home', n_image: 'Image', n_doc: 'Doc', n_sheet: 'Sheet', n_slides: 'Slides', n_files: 'Files',
  loading: 'Loading...', saving: 'Saving...', saved: 'Saved', savedAll: 'All work saved', nothing: 'Nothing to save yet', err: 'Error', cancel: 'Cancel', close: 'Close', delete: 'Delete', rename: 'Rename', open: 'Open', download: 'Download',
  iosHint: 'On iPhone: tap the Share button in Safari, then "Add to Home Screen". On Android: use the browser menu, then "Install app".',
}, {
  miss_t: 'অ্যাপের ফাইল নেই', miss_b: 'এই ফাইলগুলো সার্ভারে পাওয়া যায়নি, তাই কিছু টুল খুলছে না:', miss_h: 'সমাধান: tools, libs, fonts, icons ফোল্ডারগুলো পুরোটা index.html এর পাশে GitHub এ আপলোড করুন, ১-২ মিনিট অপেক্ষা করে Ctrl+Shift+R দিয়ে রিলোড করুন।',
  installApp: 'অ্যাপ ইনস্টল', installed: 'অ্যাপ আগেই ইনস্টল করা আছে', installing: 'ইনস্টল হচ্ছে... হোম স্ক্রিন দেখুন', ig_and: 'ব্রাউজারের উপরের ডানের মেনু (তিন ডট) চেপে "Install app" (বা "Add to Home screen") চাপুন। না দেখালে লিংকটা Chrome এ খুলুন।', ig_ios2: 'লিংকটা Safari তে খুলুন, Share বাটন চেপে "Add to Home Screen" দিন।', ig_inapp: 'এই ইন-অ্যাপ ব্রাউজারে ইনস্টল হয় না। তিন ডট (বা Share) চেপে "Open in browser" / "Open in Chrome" বেছে নিন, তারপর আবার অ্যাপ ইনস্টল চাপুন।',
  appName: 'অফিস টুলকিট', by: 'Developed by Nahin', installGuide: 'ইনস্টল গাইড', installNow: 'এখনই ইনস্টল', badge: '১০০% অফলাইনে চলে · লগইন লাগে না · লোকাল স্টোরেজ', h1a: 'আপনার পকেট অফিস,', h1b: 'অফলাইনেই প্রস্তুত।',
  homeSub: 'ছবি রিসাইজ, পিডিএফ তৈরি, ডকুমেন্ট এডিট আর স্প্রেডশিটের কাজ করুন সরাসরি আপনার ডিভাইসে, অটো-সেভসহ।', recent: 'সাম্প্রতিক সেভ করা কাজ', noRecent: 'এখনো কোনো ফাইল সেভ হয়নি। যেকোনো টুল খুলে সেভ চাপুন।',
  nt_image: 'রিসাইজার', nt_doc: 'ডকস', nt_sheet: 'শিট', nt_slides: 'স্লাইড',
  ig0: 'অফিস টুলকিট আসল অ্যাপের মতো ইনস্টল করুন। একবার অনলাইনে খুললেই পরে অফলাইনে চলবে।', ig1: 'ব্রাউজার মেনু (তিন ডট) থেকে "Install app" বা "Add to Home screen" চাপুন।', ig2: 'Share বাটনে চেপে "Add to Home Screen" দিন।', ig3: 'অ্যাড্রেস বারের ডান দিকের ইনস্টল আইকনে ক্লিক করুন।',
  t_image: 'ছবি রিসাইজার', d_image: 'ব্যাচ রিসাইজ, পাসপোর্ট প্রিসেট, JPG/PNG/WebP কমপ্রেশন ও লাইভ প্রিভিউ।', t_pdf: 'পিডিএফ মেকার', d_pdf: 'ছবি বা টেক্সট থেকে পিডিএফ, পেজ সাজান ও ঘোরান, মার্জ ও স্প্লিট।', t_doc: 'ডকুমেন্ট রিডার ও এডিটর', d_doc: '.docx, .pdf, .md, .txt পড়ুন এবং এডিট করে .docx/.pdf এক্সপোর্ট করুন।',
  t_sheet: 'স্প্রেডশিট', d_sheet: 'ফর্মুলা (SUM, IF, AVERAGE), মাল্টি-শিট, .xlsx/.csv ও চার্ট।', t_slides: 'প্রেজেন্টেশন মেকার', d_slides: 'থিম, ট্রানজিশন ও অ্যানিমেশনসহ স্লাইড বানান, ফুলস্ক্রিনে প্রেজেন্ট করুন, .pptx এক্সপোর্ট করুন।', t_files: 'আমার ফাইল', d_files: 'আপনার সব সেভ করা কাজ',
  new: 'নতুন', save: 'সেভ', n_home: 'হোম', n_image: 'ছবি', n_doc: 'ডক', n_sheet: 'শিট', n_slides: 'স্লাইড', n_files: 'ফাইল',
  loading: 'লোড হচ্ছে...', saving: 'সেভ হচ্ছে...', saved: 'সেভ হয়েছে', savedAll: 'সব কাজ সেভ হয়েছে', nothing: 'সেভ করার মতো কিছু নেই', err: 'সমস্যা', cancel: 'বাতিল', close: 'বন্ধ', delete: 'মুছুন', rename: 'নাম বদল', open: 'খুলুন', download: 'ডাউনলোড',
  iosHint: 'আইফোনে: Safari-তে Share বাটনে ট্যাপ করে "Add to Home Screen" দিন। অ্যান্ড্রয়েডে: ব্রাউজার মেনু থেকে "Install app" দিন।',
});
