/* PDF Maker - Developed by Nahin */
(() => {
App.addLang({
  p_img: 'Images to PDF', p_txt: 'Text to PDF', p_merge: 'Merge / Split', p_add: 'Add images', p_cam: 'Camera', p_size: 'Page size', p_orient: 'Orientation', p_portrait: 'Portrait', p_land: 'Landscape', p_auto: 'Auto (match image)',
  p_margin: 'Margin (mm)', p_fs: 'Font size', p_preview: 'Preview', p_typehere: 'Type or paste your text here...', p_addpdf: 'Add PDF files', p_merge_btn: 'Merge all', p_extract: 'Extract pages', p_splitall: 'Split every page',
  p_range: 'Pages e.g. 1-3,5,8-', p_empty: 'Nothing added yet', p_unicode: 'Note: Bangla/other scripts are drawn as page images (text not selectable).', p_pages: 'pages', p_need2: 'Add at least 2 PDFs to merge', p_need1: 'Add a PDF first', p_badrange: 'Invalid page range', p_done: 'Ready! Preview below, then press Save.', p_rot: 'Rotate',
}, {
  p_img: 'ছবি থেকে পিডিএফ', p_txt: 'টেক্সট থেকে পিডিএফ', p_merge: 'মার্জ / স্প্লিট', p_add: 'ছবি যোগ করুন', p_cam: 'ক্যামেরা', p_size: 'পেজ সাইজ', p_orient: 'ওরিয়েন্টেশন', p_portrait: 'পোর্ট্রেট', p_land: 'ল্যান্ডস্কেপ', p_auto: 'অটো (ছবি অনুযায়ী)',
  p_margin: 'মার্জিন (mm)', p_fs: 'ফন্ট সাইজ', p_preview: 'প্রিভিউ', p_typehere: 'এখানে লিখুন বা পেস্ট করুন...', p_addpdf: 'পিডিএফ ফাইল যোগ করুন', p_merge_btn: 'সব মার্জ করুন', p_extract: 'পেজ আলাদা করুন', p_splitall: 'প্রতি পেজ আলাদা করুন',
  p_range: 'পেজ যেমন 1-3,5,8-', p_empty: 'এখনো কিছু যোগ হয়নি', p_unicode: 'বাংলা/অন্য ভাষার লেখা ছবি আকারে বসে (সিলেক্ট করা যাবে না)।', p_pages: 'পেজ', p_need2: 'মার্জ করতে কমপক্ষে ২টি পিডিএফ দিন', p_need1: 'আগে একটি পিডিএফ দিন', p_badrange: 'পেজ রেঞ্জ ঠিক নয়', p_done: 'তৈরি! নিচে প্রিভিউ দেখুন, তারপর সেভ চাপুন।', p_rot: 'ঘোরান',
});

/* shared drag-sort (touch + mouse) */
function sortable(box, sel, cb) {
  box.addEventListener('pointerdown', e => {
    const h = e.target.closest('.drag'); if (!h) return; const el = h.closest(sel); if (!el) return;
    e.preventDefault(); h.setPointerCapture(e.pointerId); el.classList.add('dragging');
    const mv = ev => {
      const o = document.elementFromPoint(ev.clientX, ev.clientY), over = o && o.closest(sel);
      if (!over || over === el || over.parentNode !== box) return; const r = over.getBoundingClientRect();
      box.insertBefore(el, ev.clientY < r.top + r.height / 2 ? over : over.nextSibling);
    };
    const up = () => { el.classList.remove('dragging'); h.removeEventListener('pointermove', mv); h.removeEventListener('pointerup', up); h.removeEventListener('pointercancel', up); cb($$(sel, box).map(x => x.dataset.id)); };
    h.addEventListener('pointermove', mv); h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
  });
}
App.sortable = sortable;

const PS = { a4: [210, 297], letter: [215.9, 279.4] };
const needUni = bl => bl.some(b => /[^\x00-\xFF\u2013\u2014\u2018\u2019\u201C\u201D\u2022\u2026]/.test(b.text));

/* blocks: [{text,size,bold,align,bullet}] -> Blob.  Used by PDF Maker and Document editor */
App.textToPdf = async function (blocks, o) {
  await App.load(['libs/jspdf.umd.min.js']); const { jsPDF } = window.jspdf;
  o = Object.assign({ size: 'a4', orient: 'portrait', margin: 15, fontSize: 12 }, o);
  const ori = o.orient === 'landscape' ? 'l' : 'p', doc = new jsPDF({ unit: 'mm', format: o.size, orientation: ori });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = o.margin, mw = W - 2 * m;
  if (!needUni(blocks)) {
    let y = m;
    for (const b of blocks) {
      const pt = b.size || o.fontSize, lh = pt * 0.3528 * 1.35; doc.setFont('helvetica', b.bold ? 'bold' : 'normal'); doc.setFontSize(pt);
      const lines = doc.splitTextToSize((b.bullet ? '\u2022 ' : '') + b.text, mw);
      for (const l of lines) { if (y + lh > H - m) { doc.addPage(o.size, ori); y = m; } doc.text(l, b.align === 'center' ? W / 2 : b.align === 'right' ? W - m : m, y + lh * .75, { align: b.align || 'left' }); y += lh; }
      y += lh * .3;
    }
    return doc.output('blob');
  }
  const K = 8, pw = Math.round(W * K), ph = Math.round(H * K), mpx = m * K, fam = '"Noto Sans Bengali","Noto Sans","Segoe UI",Arial,sans-serif';
  let cv, cx, y; const pages = [];
  const newPage = () => { cv = document.createElement('canvas'); cv.width = pw; cv.height = ph; cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, pw, ph); cx.fillStyle = '#000'; cx.textBaseline = 'top'; y = mpx; pages.push(cv); };
  newPage();
  for (const b of blocks) {
    const px = (b.size || o.fontSize) * 25.4 / 72 * K, lh = px * 1.4; cx.font = (b.bold ? 'bold ' : '') + px + 'px ' + fam;
    const words = ((b.bullet ? '\u2022 ' : '') + b.text).split(/(\s+)/); const lines = []; let cur = '';
    for (let w of words) {
      if (cx.measureText(cur + w).width <= pw - 2 * mpx) { cur += w; continue; }
      if (cur) lines.push(cur.trimEnd()); cur = '';
      while (cx.measureText(w).width > pw - 2 * mpx) { let i = w.length; while (i > 1 && cx.measureText(w.slice(0, i)).width > pw - 2 * mpx) i--; lines.push(w.slice(0, i)); w = w.slice(i); }
      cur = w.trimStart();
    }
    lines.push(cur.trimEnd());
    for (const l of lines) {
      if (y + lh > ph - mpx) { newPage(); cx.font = (b.bold ? 'bold ' : '') + px + 'px ' + fam; }
      const tw = cx.measureText(l).width; cx.fillText(l, b.align === 'center' ? (pw - tw) / 2 : b.align === 'right' ? pw - mpx - tw : mpx, y); y += lh;
    }
    y += lh * .3;
  }
  pages.forEach((c, i) => { if (i) doc.addPage(o.size, ori); doc.addImage(c.toDataURL('image/jpeg', .92), 'JPEG', 0, 0, W, H); });
  return doc.output('blob');
};

function parseRange(str, n) {
  const out = []; for (const part of str.split(',').map(x => x.trim()).filter(Boolean)) {
    const m = part.match(/^(\d*)\s*-\s*(\d*)$/); let a, b;
    if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : n; } else if (/^\d+$/.test(part)) a = b = +part; else return null;
    if (a < 1 || b > n || a > b) return null; for (let i = a; i <= b; i++) out.push(i - 1);
  } return out.length ? out : null;
}

const T = {
  libs: ['libs/jspdf.umd.min.js', 'libs/pdf-lib.min.js', 'libs/jszip.min.js'],
  tab: 'img', o: { size: 'a4', orient: 'portrait', margin: 10, fs: 12 }, imgs: [], text: '', pdfs: [], range: '', out: null, ids: {},

  mount(el) {
    T.el = el;
    el.innerHTML = `
    <div class="tabs"><button data-t="img" data-i18n="p_img"></button><button data-t="txt" data-i18n="p_txt"></button><button data-t="merge" data-i18n="p_merge"></button></div>
    <div class="panel" id="pd-opts"><div class="row">
      <label class="f"><span data-i18n="p_size"></span><select id="pd-size"><option value="a4">A4</option><option value="letter">Letter</option></select></label>
      <label class="f"><span data-i18n="p_orient"></span><select id="pd-or"><option value="portrait" data-i18n="p_portrait"></option><option value="landscape" data-i18n="p_land"></option><option value="auto" data-i18n="p_auto"></option></select></label>
      <label class="f"><span data-i18n="p_margin"></span><input id="pd-m" type="number" min="0" max="50" inputmode="numeric"></label></div></div>
    <div id="pd-img"><div class="row" style="margin-bottom:10px"><button class="btn grow" id="pd-add">&#10133; <span data-i18n="p_add"></span></button><button class="btn sec" id="pd-cam">&#128247;</button></div><div class="list" id="pd-il"></div></div>
    <div id="pd-txt" class="hidden"><div class="panel"><textarea id="pd-ta" rows="12" data-i18n-ph="p_typehere"></textarea>
      <label class="f" style="margin-top:8px"><span data-i18n="p_fs"></span><select id="pd-fs"><option>10</option><option>12</option><option>14</option><option>16</option><option>18</option><option>24</option></select></label>
      <p class="muted" data-i18n="p_unicode"></p></div></div>
    <div id="pd-merge" class="hidden"><div class="row" style="margin-bottom:10px"><button class="btn grow" id="pd-addpdf">&#10133; <span data-i18n="p_addpdf"></span></button></div><div class="list" id="pd-pl"></div>
      <div class="panel" style="margin-top:12px"><div class="row"><button class="btn ok grow" id="pd-mg" data-i18n="p_merge_btn"></button></div>
      <div class="row" style="margin-top:10px"><input id="pd-rg" type="text" class="grow" data-i18n-ph="p_range"><button class="btn" id="pd-ex" data-i18n="p_extract"></button></div>
      <div class="row" style="margin-top:10px"><button class="btn sec grow" id="pd-sp" data-i18n="p_splitall"></button></div></div></div>
    <div class="row" id="pd-prev" style="margin-top:6px"><button class="btn sec grow" id="pd-pv">&#128065;&#65039; <span data-i18n="p_preview"></span></button></div>`;
    const $e = s => $(s, el);
    $$('[data-t]', el).forEach(b => b.onclick = () => { T.tab = b.dataset.t; T.out = null; T.sync(); App.touch('pdf'); });
    const o = T.o;
    $e('#pd-size').onchange = e => { o.size = e.target.value; App.touch('pdf'); };
    $e('#pd-or').onchange = e => { o.orient = e.target.value; App.touch('pdf'); };
    $e('#pd-m').oninput = e => { o.margin = Math.max(0, +e.target.value || 0); App.touch('pdf'); };
    $e('#pd-fs').onchange = e => { o.fs = +e.target.value; App.touch('pdf'); };
    $e('#pd-ta').oninput = e => { T.text = e.target.value; App.touch('pdf'); };
    $e('#pd-rg').oninput = e => { T.range = e.target.value; App.touch('pdf'); };
    $e('#pd-add').onclick = async () => T.addImgs(await App.pick('image/*', true));
    $e('#pd-cam').onclick = async () => T.addImgs(await App.pick('image/*', false, true));
    $e('#pd-addpdf').onclick = async () => T.addPdfs(await App.pick('application/pdf,.pdf', true));
    $e('#pd-pv').onclick = () => T.preview();
    $e('#pd-mg').onclick = () => T.guard(T.merge);
    $e('#pd-ex').onclick = () => T.guard(T.extract);
    $e('#pd-sp').onclick = () => T.guard(T.splitAll);
    sortable($e('#pd-il'), '.item', ids => { T.imgs = ids.map(id => T.imgs.find(i => i.id === id)); App.touch('pdf'); });
    sortable($e('#pd-pl'), '.item', ids => { T.pdfs = ids.map(id => T.pdfs.find(i => i.id === id)); App.touch('pdf'); });
    T.sync(); T.renderImgs(); T.renderPdfs();
  },
  sync() {
    const el = T.el, o = T.o; $$('[data-t]', el).forEach(b => b.classList.toggle('on', b.dataset.t === T.tab));
    ['img', 'txt', 'merge'].forEach(k => $('#pd-' + k, el).classList.toggle('hidden', k !== T.tab));
    $('#pd-opts', el).classList.toggle('hidden', T.tab === 'merge'); $('#pd-prev', el).classList.toggle('hidden', T.tab === 'merge');
    $('#pd-size', el).value = o.size; $('#pd-or', el).value = o.orient; $('#pd-m', el).value = o.margin; $('#pd-fs', el).value = o.fs; $('#pd-ta', el).value = T.text; $('#pd-rg', el).value = T.range;
    $('#pd-or', el).querySelector('[value=auto]').hidden = T.tab !== 'img'; if (T.tab !== 'img' && o.orient === 'auto') { o.orient = 'portrait'; $('#pd-or', el).value = 'portrait'; }
  },
  async guard(fn) { try { App.busy(true); await fn(); } catch (e) { console.error(e); App.toast(App.t('err') + ': ' + e.message, true); } finally { App.busy(false); } },

  /* ----- images ----- */
  async addImgs(files) { for (const f of files) T.imgs.push({ id: App.uid(), name: (f.name || 'image').replace(/\.[^.]+$/, ''), blob: f, rot: 0 }); T.renderImgs(); App.touch('pdf'); },
  renderImgs() {
    const L = $('#pd-il', T.el); L.innerHTML = ''; if (!T.imgs.length) { L.innerHTML = '<div class="empty">&#128444;&#65039; ' + App.t('p_empty') + '</div>'; return; }
    T.imgs.forEach((it, i) => {
      it.url ||= URL.createObjectURL(it.blob); const d = document.createElement('div'); d.className = 'item'; d.dataset.id = it.id;
      d.innerHTML = `<span class="drag">&#8942;&#8942;</span><img class="th" src="${it.url}" style="transform:rotate(${it.rot}deg)" alt=""><div class="meta"><b>${App.esc(it.name)}</b><span class="stat">${App.fmtSize(it.blob.size)}</span></div>
      <button class="btn sec sm rot" title="Rotate">&#8635;</button><button class="btn red sm del">&#10005;</button>`;
      d.querySelector('.rot').onclick = () => { it.rot = (it.rot + 90) % 360; d.querySelector('.th').style.transform = `rotate(${it.rot}deg)`; App.touch('pdf'); };
      d.querySelector('.del').onclick = () => { it.url && URL.revokeObjectURL(it.url); T.imgs = T.imgs.filter(x => x !== it); T.renderImgs(); App.touch('pdf'); };
      L.appendChild(d);
    });
  },
  async buildImages() {
    await App.load(['libs/jspdf.umd.min.js']); const { jsPDF } = window.jspdf, o = T.o; let doc;
    for (let i = 0; i < T.imgs.length; i++) {
      const it = T.imgs[i], bm = await createImageBitmap(it.blob).catch(() => null); if (!bm) throw new Error('Cannot read ' + it.name);
      const sw = it.rot % 180 ? bm.height : bm.width, sh = it.rot % 180 ? bm.width : bm.height, k = Math.min(1, 2200 / Math.max(sw, sh));
      const c = document.createElement('canvas'); c.width = Math.round(sw * k); c.height = Math.round(sh * k); const x = c.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.translate(c.width / 2, c.height / 2); x.rotate(it.rot * Math.PI / 180);
      const dw = bm.width * k, dh = bm.height * k; x.drawImage(bm, -dw / 2, -dh / 2, dw, dh);
      const ori = o.orient === 'auto' ? (sw > sh ? 'l' : 'p') : o.orient === 'landscape' ? 'l' : 'p';
      if (!doc) doc = new jsPDF({ unit: 'mm', format: o.size, orientation: ori }); else doc.addPage(o.size, ori);
      const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), m = o.margin, sc = Math.min((W - 2 * m) / sw, (H - 2 * m) / sh), w = sw * sc, h = sh * sc;
      doc.addImage(c.toDataURL('image/jpeg', .9), 'JPEG', (W - w) / 2, (H - h) / 2, w, h);
    }
    return doc.output('blob');
  },
  async buildText() {
    const blocks = T.text.split('\n').map(l => ({ text: l || ' ' })); return App.textToPdf(blocks, { size: T.o.size, orient: T.o.orient === 'landscape' ? 'landscape' : 'portrait', margin: T.o.margin, fontSize: T.o.fs });
  },

  /* ----- merge / split ----- */
  async addPdfs(files) {
    App.busy(true);
    try {
      for (const f of files) {
        try { const buf = await f.arrayBuffer(), d = await PDFLib.PDFDocument.load(buf, { ignoreEncryption: true }); T.pdfs.push({ id: App.uid(), name: f.name.replace(/\.pdf$/i, ''), buf, pages: d.getPageCount() }); }
        catch (e) { App.toast(App.t('err') + ': ' + f.name, true); }
      }
    } finally { App.busy(false); } T.renderPdfs(); App.touch('pdf');
  },
  renderPdfs() {
    const L = $('#pd-pl', T.el); L.innerHTML = ''; if (!T.pdfs.length) { L.innerHTML = '<div class="empty">&#128196; ' + App.t('p_empty') + '</div>'; return; }
    T.pdfs.forEach(p => {
      const d = document.createElement('div'); d.className = 'item'; d.dataset.id = p.id;
      d.innerHTML = `<span class="drag">&#8942;&#8942;</span><div class="ftype">&#128196;</div><div class="meta"><b>${App.esc(p.name)}</b><span class="stat">${p.pages} ${App.t('p_pages')} &middot; ${App.fmtSize(p.buf.byteLength)}</span></div><button class="btn red sm del">&#10005;</button>`;
      d.querySelector('.del').onclick = () => { T.pdfs = T.pdfs.filter(x => x !== p); T.renderPdfs(); App.touch('pdf'); }; L.appendChild(d);
    });
  },
  async merge() {
    if (T.pdfs.length < 2) throw new Error(App.t('p_need2'));
    const out = await PDFLib.PDFDocument.create();
    for (const p of T.pdfs) { const s = await PDFLib.PDFDocument.load(p.buf, { ignoreEncryption: true }); (await out.copyPages(s, s.getPageIndices())).forEach(pg => out.addPage(pg)); }
    T.done([{ name: 'merged', ext: 'pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) }]);
  },
  async extract() {
    if (!T.pdfs.length) throw new Error(App.t('p_need1')); const p = T.pdfs[0], idx = parseRange(T.range, p.pages); if (!idx) throw new Error(App.t('p_badrange'));
    const s = await PDFLib.PDFDocument.load(p.buf, { ignoreEncryption: true }), out = await PDFLib.PDFDocument.create(); (await out.copyPages(s, idx)).forEach(pg => out.addPage(pg));
    T.done([{ name: p.name + '-pages', ext: 'pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) }]);
  },
  async splitAll() {
    if (!T.pdfs.length) throw new Error(App.t('p_need1')); const p = T.pdfs[0], s = await PDFLib.PDFDocument.load(p.buf, { ignoreEncryption: true }), res = [];
    for (let i = 0; i < p.pages; i++) { const out = await PDFLib.PDFDocument.create(); out.addPage((await out.copyPages(s, [i]))[0]); res.push({ name: p.name + '-page' + (i + 1), ext: 'pdf', blob: new Blob([await out.save()], { type: 'application/pdf' }) }); }
    T.done(res);
  },
  async done(list) {
    T.out = list; App.toast(App.t('p_done'));
    if (list.length === 1) await T.showPreview(list[0].blob);
    else { const z = new JSZip(); list.forEach(r => z.file(r.name + '.pdf', r.blob)); App.download(await z.generateAsync({ type: 'blob' }), 'split-pages.zip'); }
  },

  /* ----- preview / save ----- */
  async current() {
    if (T.tab === 'img') return [{ name: 'images', ext: 'pdf', blob: await T.buildImages() }];
    if (T.tab === 'txt') { const first = (T.text.trim().split('\n')[0] || 'document').slice(0, 30).replace(/[\\/:*?"<>|]/g, ''); return [{ name: first || 'document', ext: 'pdf', blob: await T.buildText() }]; }
    if (!T.out) { if (T.pdfs.length > 1) await T.merge(); else if (T.range && T.pdfs.length) await T.extract(); else throw new Error(App.t('p_need2')); }
    return T.out;
  },
  async preview() { await T.guard(async () => { const [r] = await T.current(); await T.showPreview(r.blob); }); },
  async showPreview(blob) {
    const box = document.createElement('div'); box.className = 'pdfpages';
    App.modal({ title: App.t('p_preview'), body: box, buttons: [{ label: '\uD83D\uDCBE ' + App.t('save'), cls: 'ok', fn: async () => { App.closeModal(); await App.onSaveBtn(); } }, { label: App.t('close'), cls: 'sec', fn: App.closeModal }] });
    box.innerHTML = '<div class="empty">' + App.t('loading') + '</div>'; await App.renderPdf(await blob.arrayBuffer(), box, { maxPages: 30 });
  },
  hasContent() { return T.tab === 'img' ? T.imgs.length > 0 : T.tab === 'txt' ? !!T.text.trim() : T.pdfs.length > 0; },
  async exportFile() { const list = await T.current(); if (list.length === 1) list[0].id = T.ids[T.tab] ||= App.uid(); return list; },
  getState: () => ({ tab: T.tab, o: T.o, imgs: T.imgs.map(({ id, name, blob, rot }) => ({ id, name, blob, rot })), text: T.text, pdfs: T.pdfs, range: T.range }),
  setState(s) { T.tab = s.tab || 'img'; Object.assign(T.o, s.o); T.imgs = s.imgs || []; T.text = s.text || ''; T.pdfs = s.pdfs || []; T.range = s.range || ''; T.sync(); T.renderImgs(); T.renderPdfs(); },
  async openFile(r) { if (r.ext === 'pdf') { T.tab = 'merge'; T.sync(); await T.addPdfs([new File([r.blob], r.name + '.pdf', { type: 'application/pdf' })]); } },
};
App.reg('pdf', T);
})();
