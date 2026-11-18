/* Document Reader & Editor - Developed by Nahin */
(() => {
App.addLang({
  d_open: 'Open file', d_new: 'New', d_read: 'Read', d_edit: 'Edit', d_search: 'Search in document...', d_words: 'words', d_chars: 'characters', d_export: 'Export', d_h1: 'Heading 1', d_h2: 'Heading 2', d_p: 'Paragraph',
  d_empty: 'Open a .txt, .docx, .pdf or .md file, or press New to write', d_pages: 'Page view', d_text: 'Text view', d_name: 'Untitled document', d_found: 'found', d_fs: 'Size', d_unsup: 'Unsupported file type', d_scan: 'No text found in this PDF (maybe scanned). Use Page view.',
}, {
  d_open: 'ফাইল খুলুন', d_new: 'নতুন', d_read: 'পড়ুন', d_edit: 'এডিট', d_search: 'ডকুমেন্টে খুঁজুন...', d_words: 'শব্দ', d_chars: 'অক্ষর', d_export: 'এক্সপোর্ট', d_h1: 'হেডিং ১', d_h2: 'হেডিং ২', d_p: 'প্যারাগ্রাফ',
  d_empty: '.txt, .docx, .pdf বা .md ফাইল খুলুন, অথবা নতুন লিখতে "নতুন" চাপুন', d_pages: 'পেজ ভিউ', d_text: 'টেক্সট ভিউ', d_name: 'নামহীন ডকুমেন্ট', d_found: 'টি পাওয়া গেছে', d_fs: 'সাইজ', d_unsup: 'এই ফাইল টাইপ সাপোর্ট করে না', d_scan: 'এই পিডিএফে লেখা পাওয়া যায়নি (স্ক্যান হতে পারে)। পেজ ভিউ ব্যবহার করুন।',
});

const SIZES = { 1: 8, 2: 10, 3: 12, 4: 14, 5: 18, 6: 24, 7: 36 };
function md2html(src) {
  const inl = s => App.esc(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*([^*]+)\*/g, '$1<i>$2</i>').replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  let out = '', list = null, code = false;
  const close = () => { if (list) { out += '</' + list + '>'; list = null; } };
  for (const line of src.replace(/\r/g, '').split('\n')) {
    if (/^```/.test(line)) { close(); out += code ? '</pre>' : '<pre>'; code = !code; continue; }
    if (code) { out += App.esc(line) + '\n'; continue; }
    let m;
    if ((m = line.match(/^(#{1,6})\s+(.*)/))) { close(); out += `<h${m[1].length}>${inl(m[2])}</h${m[1].length}>`; }
    else if ((m = line.match(/^\s*[-*+]\s+(.*)/))) { if (list !== 'ul') { close(); out += '<ul>'; list = 'ul'; } out += '<li>' + inl(m[1]) + '</li>'; }
    else if ((m = line.match(/^\s*\d+[.)]\s+(.*)/))) { if (list !== 'ol') { close(); out += '<ol>'; list = 'ol'; } out += '<li>' + inl(m[1]) + '</li>'; }
    else if (/^>\s?/.test(line)) { close(); out += '<blockquote>' + inl(line.replace(/^>\s?/, '')) + '</blockquote>'; }
    else if (!line.trim()) close(); else { close(); out += '<p>' + inl(line) + '</p>'; }
  } close(); return out;
}
const txt2html = s => s.replace(/\r/g, '').split('\n').map(l => '<p>' + (App.esc(l) || '<br>') + '</p>').join('');

const T = {
  libs: ['libs/mammoth.browser.min.js', 'libs/docx.umd.js', 'libs/jspdf.umd.min.js'],
  html: '', name: '', mode: 'read', zoom: 1, src: null, view: 'text', fileId: null, hits: [], hi: -1,

  mount(el) {
    T.el = el;
    el.innerHTML = `
    <div class="row" style="margin-bottom:10px"><button class="btn grow" id="dc-open">&#128194; <span data-i18n="d_open"></span></button><button class="btn sec" id="dc-new">&#10133; <span data-i18n="d_new"></span></button>
      <button class="btn sec" id="dc-exp">&#11015;&#65039; <span data-i18n="d_export"></span></button></div>
    <div class="tabs"><button id="dc-mr" data-i18n="d_read"></button><button id="dc-me" data-i18n="d_edit"></button></div>
    <div id="dc-rtools" class="tb"><button class="btn sec" id="dc-zo">A&minus;</button><button class="btn sec" id="dc-zi">A+</button><span class="sep"></span>
      <input type="text" id="dc-q" data-i18n-ph="d_search" style="min-width:150px;min-height:38px"><button class="btn sec" id="dc-pv">&#9650;</button><button class="btn sec" id="dc-nx">&#9660;</button><span class="muted" id="dc-cnt" style="white-space:nowrap"></span>
      <button class="btn sec hidden" id="dc-vw"></button></div>
    <div id="dc-etools" class="tb hidden">
      <button class="btn sec" data-c="undo">&#8630;</button><button class="btn sec" data-c="redo">&#8631;</button><span class="sep"></span>
      <button class="btn sec" data-c="bold"><b>B</b></button><button class="btn sec" data-c="italic"><i>I</i></button><button class="btn sec" data-c="underline"><u>U</u></button><span class="sep"></span>
      <select id="dc-blk"><option value="p" data-i18n="d_p"></option><option value="h1" data-i18n="d_h1"></option><option value="h2" data-i18n="d_h2"></option></select>
      <select id="dc-fs"><option value="">Size</option><option value="1">8</option><option value="2">10</option><option value="3">12</option><option value="4">14</option><option value="5">18</option><option value="6">24</option><option value="7">36</option></select>
      <input type="color" id="dc-col" value="#dc2626" title="Color"><span class="sep"></span>
      <button class="btn sec" data-c="insertUnorderedList">&#8226;&#8801;</button><button class="btn sec" data-c="insertOrderedList">1.&#8801;</button><span class="sep"></span>
      <button class="btn sec" data-c="justifyLeft">&#8676;</button><button class="btn sec" data-c="justifyCenter">&#8596;</button><button class="btn sec" data-c="justifyRight">&#8677;</button></div>
    <div class="muted" id="dc-wc" style="margin:0 2px 8px"></div>
    <div class="empty" id="dc-empty" data-i18n="d_empty"></div>
    <div id="dc-ed" class="doc hidden" spellcheck="true"></div><div id="dc-pg" class="pdfpages hidden"></div>`;
    const $e = s => $(s, el), ed = $e('#dc-ed'); T.ed = ed;
    $e('#dc-open').onclick = async () => { const [f] = await App.pick('.txt,.md,.markdown,.docx,.pdf,text/plain,application/pdf'); if (f) T.openBlob(f); };
    $e('#dc-new').onclick = () => { T.name = ''; T.src = null; T.fileId = null; T.html = '<p><br></p>'; T.view = 'text'; T.setMode('edit'); T.show(); ed.focus(); };
    $e('#dc-exp').onclick = () => T.exportMenu();
    $e('#dc-mr').onclick = () => T.setMode('read'); $e('#dc-me').onclick = () => T.setMode('edit');
    $e('#dc-zo').onclick = () => T.setZoom(T.zoom - .15); $e('#dc-zi').onclick = () => T.setZoom(T.zoom + .15);
    $e('#dc-q').oninput = () => T.search(); $e('#dc-nx').onclick = () => T.step(1); $e('#dc-pv').onclick = () => T.step(-1);
    $e('#dc-vw').onclick = () => { T.view = T.view === 'text' ? 'pages' : 'text'; T.show(); };
    ed.addEventListener('input', () => { T.html = ed.innerHTML; T.count(); App.touch('doc'); });
    $$('[data-c]', el).forEach(b => { b.onmousedown = e => e.preventDefault(); b.onclick = () => { ed.focus(); document.execCommand('styleWithCSS', false, false); document.execCommand(b.dataset.c); T.html = ed.innerHTML; T.count(); App.touch('doc'); }; });
    $e('#dc-blk').onchange = e => { ed.focus(); document.execCommand('formatBlock', false, e.target.value); T.html = ed.innerHTML; App.touch('doc'); };
    $e('#dc-fs').onchange = e => { if (!e.target.value) return; ed.focus(); document.execCommand('styleWithCSS', false, false); document.execCommand('fontSize', false, e.target.value); e.target.value = ''; T.html = ed.innerHTML; App.touch('doc'); };
    $e('#dc-col').onchange = e => { ed.focus(); document.execCommand('styleWithCSS', false, false); document.execCommand('foreColor', false, e.target.value); T.html = ed.innerHTML; App.touch('doc'); };
    $$('select,input[type=color]', $e('#dc-etools')).forEach(s => s.addEventListener('mousedown', () => { T.saveSel(); }));
    T.sync();
  },
  saveSel() { },
  sync() {
    const el = T.el, has = !!(T.html || T.src); $('#dc-mr', el).classList.toggle('on', T.mode === 'read'); $('#dc-me', el).classList.toggle('on', T.mode === 'edit');
    $('#dc-rtools', el).classList.toggle('hidden', T.mode !== 'read' || !has); $('#dc-etools', el).classList.toggle('hidden', T.mode !== 'edit' || !has || T.view === 'pages');
    $('#dc-empty', el).classList.toggle('hidden', has);
  },
  async show() {
    const el = T.el, ed = T.ed, pg = $('#dc-pg', el), pages = T.view === 'pages' && T.src;
    $('#dc-vw', el).classList.toggle('hidden', !(T.src && T.mode === 'read')); $('#dc-vw', el).textContent = T.view === 'pages' ? App.t('d_text') : App.t('d_pages');
    ed.classList.toggle('hidden', !!pages || !(T.html)); pg.classList.toggle('hidden', !pages);
    if (!pages) { if (ed.innerHTML !== T.html) ed.innerHTML = T.html; ed.contentEditable = T.mode === 'edit'; ed.style.setProperty('--z', T.zoom); }
    else { App.busy(true); try { await App.renderPdf(T.src, pg, { zoom: T.zoom }); } finally { App.busy(false); } }
    T.sync(); T.count();
  },
  setMode(m) { T.clearMarks(); if (m === 'edit' && T.view === 'pages') T.view = 'text'; T.mode = m; T.show(); },
  setZoom(z) { T.zoom = Math.min(3, Math.max(.6, z)); if (T.view === 'pages') T.show(); else T.ed.style.setProperty('--z', T.zoom); },
  count() {
    const txt = (T.ed.innerText || '').trim(), w = txt ? txt.split(/\s+/).length : 0;
    $('#dc-wc', T.el).textContent = T.html ? `${T.name || App.t('d_name')} \u2022 ${w} ${App.t('d_words')} \u2022 ${txt.length} ${App.t('d_chars')}` : '';
  },

  /* ----- open ----- */
  async openBlob(f) {
    App.busy(true);
    try {
      const n = f.name || 'document', ext = (n.split('.').pop() || '').toLowerCase(); T.name = n.replace(/\.[^.]+$/, ''); T.src = null; T.view = 'text'; T.fileId = null;
      if (ext === 'txt') T.html = txt2html(await f.text());
      else if (ext === 'md' || ext === 'markdown') T.html = md2html(await f.text());
      else if (ext === 'docx') { const r = await mammoth.convertToHtml({ arrayBuffer: await f.arrayBuffer() }); T.html = r.value || '<p><br></p>'; }
      else if (ext === 'pdf') { T.src = await f.arrayBuffer(); T.html = await T.pdfToHtml(T.src); if (!T.html) { T.view = 'pages'; App.toast(App.t('d_scan')); } }
      else throw new Error(App.t('d_unsup'));
      T.mode = 'read'; T.zoom = 1; await T.show(); App.touch('doc');
    } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); } finally { App.busy(false); }
  },
  async pdfToHtml(buf) {
    const lib = await App.pdfjs(), doc = await lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise; let out = '';
    for (let i = 1; i <= doc.numPages; i++) {
      const tc = await (await doc.getPage(i)).getTextContent(); let line = '', lastY = null, paras = [];
      for (const it of tc.items) { if (lastY !== null && Math.abs(it.transform[5] - lastY) > 2) { paras.push(line); line = ''; } line += it.str + (it.hasEOL ? ' ' : ''); lastY = it.transform[5]; }
      paras.push(line); const t = paras.map(s => s.trim()).filter(Boolean); if (t.length) out += (i > 1 ? '<hr>' : '') + t.map(s => '<p>' + App.esc(s) + '</p>').join('');
    } return out;
  },

  /* ----- search ----- */
  clearMarks() { $$('mark.hl', T.ed).forEach(m => { const p = m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); }); T.hits = []; T.hi = -1; const c = $('#dc-cnt', T.el); if (c) c.textContent = ''; },
  search() {
    T.clearMarks(); const q = $('#dc-q', T.el).value.trim().toLowerCase(); if (!q || T.mode !== 'read' || T.view === 'pages') return;
    const w = document.createTreeWalker(T.ed, NodeFilter.SHOW_TEXT), nodes = []; while (w.nextNode()) nodes.push(w.currentNode);
    for (const n of nodes) {
      const s = n.nodeValue, l = s.toLowerCase(); let i = l.indexOf(q), last = 0; if (i < 0) continue; const f = document.createDocumentFragment();
      while (i >= 0) { f.appendChild(document.createTextNode(s.slice(last, i))); const m = document.createElement('mark'); m.className = 'hl'; m.textContent = s.slice(i, i + q.length); f.appendChild(m); last = i + q.length; i = l.indexOf(q, last); }
      f.appendChild(document.createTextNode(s.slice(last))); n.parentNode.replaceChild(f, n);
    }
    T.hits = $$('mark.hl', T.ed); $('#dc-cnt', T.el).textContent = T.hits.length + ' ' + App.t('d_found'); if (T.hits.length) T.step(1);
  },
  step(d) {
    if (!T.hits.length) return; if (T.hits[T.hi]) T.hits[T.hi].classList.remove('cur'); T.hi = (T.hi + d + T.hits.length) % T.hits.length;
    const m = T.hits[T.hi]; m.classList.add('cur'); m.scrollIntoView({ block: 'center', behavior: 'smooth' });
  },

  /* ----- export ----- */
  cleanHtml() { T.clearMarks(); return T.ed.innerHTML; },
  exportMenu() {
    if (!T.html) return App.toast(App.t('nothing'), true);
    const b = document.createElement('div'); b.className = 'list';
    [['docx', '\uD83D\uDCD8 Word (.docx)'], ['pdf', '\uD83D\uDCD5 PDF (.pdf)'], ['txt', '\uD83D\uDCC4 Text (.txt)']].forEach(([k, l]) => { const x = document.createElement('button'); x.className = 'btn sec'; x.textContent = l; x.onclick = async () => { App.closeModal(); App.busy(true); try { const r = await T.build(k); App.download(r.blob, r.name + '.' + r.ext); } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); } finally { App.busy(false); } }; b.appendChild(x); });
    App.modal({ title: App.t('d_export'), body: b });
  },
  async build(kind) {
    const html = T.ed.innerHTML || T.html, name = T.name || 'document', root = new DOMParser().parseFromString('<body>' + html + '</body>', 'text/html').body;
    if (kind === 'txt') { const lines = []; [...root.children].forEach(function f(n) { if (/^(UL|OL)$/.test(n.tagName)) [...n.children].forEach((li, i) => lines.push((n.tagName === 'UL' ? '\u2022 ' : (i + 1) + '. ') + li.textContent)); else lines.push(n.textContent); }); return { name, ext: 'txt', blob: new Blob([lines.join('\n')], { type: 'text/plain' }) }; }
    if (kind === 'pdf') {
      const blocks = []; [...root.children].forEach(n => {
        const tg = n.tagName, al = (n.style && n.style.textAlign) || '';
        if (/^(UL|OL)$/.test(tg)) [...n.children].forEach(li => blocks.push({ text: li.textContent, bullet: true }));
        else { const sz = { H1: 22, H2: 17, H3: 14 }[tg]; const b = !!sz || (n.textContent.trim() && n.querySelectorAll('b,strong').length && [...n.querySelectorAll('b,strong')].map(x => x.textContent).join('') === n.textContent); blocks.push({ text: n.textContent || ' ', size: sz, bold: b, align: al === 'center' || al === 'right' ? al : 'left' }); }
      });
      return { name, ext: 'pdf', blob: await App.textToPdf(blocks, { size: 'a4', margin: 18, fontSize: 12 }) };
    }
    const D = window.docx, AL = { left: D.AlignmentType.LEFT, center: D.AlignmentType.CENTER, right: D.AlignmentType.RIGHT, justify: D.AlignmentType.JUSTIFIED };
    const runs = (node, st = {}) => {
      const out = [];
      node.childNodes.forEach(c => {
        if (c.nodeType === 3) { if (c.nodeValue) out.push(new D.TextRun({ text: c.nodeValue.replace(/\s+/g, ' '), bold: st.b, italics: st.i, underline: st.u ? {} : undefined, color: st.c, size: st.s })); }
        else if (c.nodeType === 1) {
          const t = c.tagName, s = { ...st };
          if (t === 'BR') { out.push(new D.TextRun({ break: 1 })); return; }
          if (t === 'B' || t === 'STRONG') s.b = true; if (t === 'I' || t === 'EM') s.i = true; if (t === 'U') s.u = true;
          if (t === 'FONT') { if (c.getAttribute('color')) s.c = c.getAttribute('color').replace('#', ''); if (SIZES[c.getAttribute('size')]) s.s = SIZES[c.getAttribute('size')] * 2; }
          if (c.style && c.style.color) { const m = c.style.color.match(/\d+/g); if (m && m.length >= 3) s.c = m.slice(0, 3).map(x => (+x).toString(16).padStart(2, '0')).join(''); }
          if (c.style && c.style.fontWeight === 'bold') s.b = true;
          out.push(...runs(c, s));
        }
      }); return out;
    };
    const kids = [], H = { H1: D.HeadingLevel.HEADING_1, H2: D.HeadingLevel.HEADING_2, H3: D.HeadingLevel.HEADING_3 };
    const para = (n, extra = {}) => new D.Paragraph({ children: runs(n), alignment: AL[(n.style && n.style.textAlign) || 'left'], ...extra });
    [...root.children].forEach(n => {
      const t = n.tagName;
      if (t === 'UL' || t === 'OL') [...n.children].forEach(li => kids.push(para(li, t === 'UL' ? { bullet: { level: 0 } } : { numbering: { reference: 'num', level: 0 } })));
      else if (H[t]) kids.push(para(n, { heading: H[t] }));
      else kids.push(para(n));
    });
    if (!kids.length) kids.push(new D.Paragraph(''));
    const doc = new D.Document({ numbering: { config: [{ reference: 'num', levels: [{ level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.LEFT }] }] }, sections: [{ children: kids }] });
    return { name, ext: 'docx', blob: await D.Packer.toBlob(doc) };
  },

  hasContent: () => !!T.html,
  async exportFile() { const r = await T.build('docx'); r.id = T.fileId ||= App.uid(); r.state = { html: T.cleanHtml(), name: T.name }; return r; },
  getState: () => ({ html: T.html, name: T.name, mode: T.mode, fileId: T.fileId }),
  setState(s) { T.html = s.html || ''; T.name = s.name || ''; T.mode = s.mode || 'read'; T.fileId = s.fileId || null; T.src = null; T.view = 'text'; return T.show(); },
  async openFile(r) { if (r.state && r.state.html) { T.html = r.state.html; T.name = r.name; T.fileId = r.id; T.src = null; T.view = 'text'; T.mode = 'edit'; await T.show(); } else T.openBlob(new File([r.blob], r.name + '.' + r.ext)); },
  onLang() { T.count(); },
};
App.reg('doc', T);
})();
