/* PowerPoint Slides: themes, transitions, animations, present mode - Developed by Nahin */
(() => {
App.addLang({
  l_present: 'Present', l_add: 'Add', l_dup: 'Copy', l_del: 'Delete', l_pptx: 'Export .pptx', l_layout: 'Layout', l_title: 'Title', l_body: 'Text (one point per line)', l_notes: 'Speaker notes', l_theme: 'Theme', l_font: 'Font', l_img: 'Add image', l_rmimg: 'Remove image',
  l_trans: 'Transition', l_dur: 'Duration', l_all: 'Apply to all slides', l_anim: 'Animations', l_at: 'Title', l_ab: 'Text', l_ai: 'Image', l_play: 'Preview animation', l_auto: 'Auto-play (sec, 0 = off)', l_loop: 'Loop',
  l_lt: 'Title slide', l_lc: 'Title + points', l_li: 'Image + text', l_lf: 'Full image', l_none: 'None', l_fade: 'Fade', l_slide: 'Slide', l_push: 'Push up', l_zoom: 'Zoom', l_flip: 'Flip', l_cube: 'Cube', l_dissolve: 'Dissolve',
  l_left: 'Fly in left', l_right: 'Fly in right', l_up: 'Fly in bottom', l_bounce: 'Bounce', l_spin: 'Spin in', l_sans: 'Modern', l_serif: 'Classic', l_mono: 'Code', l_rotate: 'Tip: rotate your phone for a bigger view', l_ph_t: 'Click to add title', l_ph_b: 'Click to add text', l_noteexp: 'Note: .pptx keeps transitions (Flip/Cube export as Fade); element animations play in Present mode here.', l_end: 'End of slides',
}, {
  l_present: 'প্রেজেন্ট', l_add: 'যোগ', l_dup: 'কপি', l_del: 'মুছুন', l_pptx: '.pptx এক্সপোর্ট', l_layout: 'লেআউট', l_title: 'শিরোনাম', l_body: 'লেখা (প্রতি লাইনে একটি পয়েন্ট)', l_notes: 'স্পিকার নোট', l_theme: 'থিম', l_font: 'ফন্ট', l_img: 'ছবি যোগ', l_rmimg: 'ছবি সরান',
  l_trans: 'ট্রানজিশন', l_dur: 'সময়', l_all: 'সব স্লাইডে প্রয়োগ', l_anim: 'অ্যানিমেশন', l_at: 'শিরোনাম', l_ab: 'লেখা', l_ai: 'ছবি', l_play: 'অ্যানিমেশন প্রিভিউ', l_auto: 'অটো-প্লে (সেকেন্ড, 0 = বন্ধ)', l_loop: 'লুপ',
  l_lt: 'টাইটেল স্লাইড', l_lc: 'শিরোনাম + পয়েন্ট', l_li: 'ছবি + লেখা', l_lf: 'ফুল ছবি', l_none: 'নেই', l_fade: 'ফেড', l_slide: 'স্লাইড', l_push: 'পুশ আপ', l_zoom: 'জুম', l_flip: 'ফ্লিপ', l_cube: 'কিউব', l_dissolve: 'ডিজল্ভ',
  l_left: 'বাঁ থেকে আসা', l_right: 'ডান থেকে আসা', l_up: 'নিচ থেকে আসা', l_bounce: 'বাউন্স', l_spin: 'ঘুরে আসা', l_sans: 'আধুনিক', l_serif: 'ক্লাসিক', l_mono: 'কোড', l_rotate: 'টিপ: বড় দেখতে ফোন আড়াআড়ি করুন', l_ph_t: 'শিরোনাম লিখুন', l_ph_b: 'লেখা যোগ করুন', l_noteexp: 'নোট: .pptx-এ ট্রানজিশন থাকে (ফ্লিপ/কিউব ফেড হিসেবে যায়); এলিমেন্ট অ্যানিমেশন এখানে প্রেজেন্ট মোডে চলে।', l_end: 'স্লাইড শেষ',
});

const THEMES = {
  ocean: { n: 'Ocean', a: '#0ea5e9', b: '#1e3a8a', c: '#ffffff' }, sunset: { n: 'Sunset', a: '#f97316', b: '#be185d', c: '#ffffff' }, forest: { n: 'Forest', a: '#22c55e', b: '#064e3b', c: '#ffffff' },
  midnight: { n: 'Midnight', a: '#334155', b: '#020617', c: '#ffffff' }, royal: { n: 'Royal', a: '#8b5cf6', b: '#312e81', c: '#ffffff' }, clean: { n: 'Clean', a: '#ffffff', b: '#e2e8f0', c: '#0f172a' }, gold: { n: 'Gold', a: '#fde68a', b: '#f59e0b', c: '#422006' },
};
const FONTS = { sans: ['system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Bengali",sans-serif', 'Arial'], serif: ['Georgia,"Times New Roman","Noto Serif Bengali",serif', 'Georgia'], mono: ['ui-monospace,Menlo,Consolas,monospace', 'Courier New'] };
const TRS = ['none', 'fade', 'slide', 'push', 'zoom', 'flip', 'cube', 'dissolve'], PFX = { fade: 'fade', slide: 'slide', push: 'push', zoom: 'zoom', flip: 'flip', cube: 'cube', dissolve: 'diss' };
const ANS = ['none', 'fade', 'left', 'right', 'up', 'zoom', 'bounce', 'spin'];
const LAYS = { title: 'l_lt', content: 'l_lc', image: 'l_li', full: 'l_lf' };
const mk = (o = {}) => ({ layout: 'content', title: '', body: '', notes: '', theme: 'ocean', font: 'sans', img: null, iw: 0, ih: 0, tr: { type: 'fade', dur: .7 }, an: { t: 'fade', b: 'up', i: 'zoom' }, ...o });

const T = { libs: ['libs/pptxgen.bundle.js', 'libs/jszip.min.js'], slides: [mk({ layout: 'title' })], cur: 0, name: '', fileId: null, auto: 0, loop: false };
const bgCss = t => `linear-gradient(135deg,${THEMES[t].a},${THEMES[t].b})`;
const fit = el => el.style.setProperty('--u', (el.clientWidth / 100) + 'px');

function slideEl(s, edit) {
  const el = document.createElement('div'), th = THEMES[s.theme] || THEMES.ocean;
  el.className = 'slide L-' + s.layout; el.style.setProperty('--sb', bgCss(s.theme)); el.style.setProperty('--sc', th.c); el.style.setProperty('--sf', FONTS[s.font][0]);
  const showImg = (s.layout === 'image' || s.layout === 'full');
  let h = '';
  if (showImg && s.img) h += `<div class="el im" data-a="${s.an.i}" style="background-image:url(${s.img})"></div>`;
  else if (showImg && edit) h += `<div class="el im" style="border:2px dashed currentColor;opacity:.4;display:grid;place-items:center;font-size:calc(var(--u)*3)">&#128444;&#65039;</div>`;
  const tt = s.title || (edit ? App.t('l_ph_t') : ''), lines = s.body.split('\n').filter(x => x.trim()), bb = lines.length ? lines : (edit ? [App.t('l_ph_b')] : []);
  if (tt) h += `<div class="el t" data-a="${s.an.t}" style="${s.title ? '' : 'opacity:.4'}">${App.esc(tt)}</div>`;
  if (bb.length) h += `<div class="el b" data-a="${s.an.b}" style="${lines.length ? '' : 'opacity:.4'}"><ul>${bb.map(x => '<li>' + App.esc(x) + '</li>').join('')}</ul></div>`;
  el.innerHTML = h; return el;
}
function playAnim(el, base = 0) {
  $$('.el[data-a]', el).forEach((e, i) => { const a = e.dataset.a; e.style.animation = 'none'; if (a === 'none') return; void e.offsetWidth; e.style.animation = `a-${a} .8s cubic-bezier(.2,.8,.2,1) ${base + i * .35}s both`; });
}

/* ---------- present mode ---------- */
function present(start = 0) {
  const ov = document.createElement('div'); ov.className = 'present';
  ov.innerHTML = '<div class="pstage"></div><div class="pbar"><i></i></div><div class="pnum"></div><div class="pctl off"><button data-a="prev">&#9664;</button><button data-a="auto">&#9654;&#65039;</button><button data-a="next">&#9654;</button><button data-a="exit">&#10005;</button></div>';
  document.body.appendChild(ov); const stage = $('.pstage', ov), ctl = $('.pctl', ov); let i = -1, timer = null, hide = null, busy = false;
  const show = (n, dir) => {
    if (n < 0 || busy) return; if (n >= T.slides.length) { if (T.loop && dir > 0) n = 0; else return stop(true); }
    const old = $('.slide', stage), s = T.slides[n], from = i >= 0 ? T.slides[i] : null, nw = slideEl(s); stage.appendChild(nw); fit(nw);
    const tr = dir > 0 || !from ? s.tr : from.tr, p = PFX[tr.type]; i = n; $('.pbar i', ov).style.width = ((n + 1) / T.slides.length * 100) + '%'; $('.pnum', ov).textContent = (n + 1) + ' / ' + T.slides.length;
    if (old && p) {
      busy = true; const d = tr.dur, rev = dir < 0 ? ' reverse' : '';
      old.style.animation = dir > 0 ? `${p}Out ${d}s ease both` : `${p}In ${d}s ease both reverse`; nw.style.animation = dir > 0 ? `${p}In ${d}s ease both` : `${p}Out ${d}s ease both reverse`; nw.style.zIndex = dir > 0 ? 2 : 1; old.style.zIndex = dir > 0 ? 1 : 2;
      setTimeout(() => { old.remove(); nw.style.animation = ''; nw.style.zIndex = ''; busy = false; }, d * 1000 + 30); playAnim(nw, d * .55);
    } else { old && old.remove(); playAnim(nw, 0); }
  };
  const next = () => show(i + 1, 1), prev = () => show(i - 1, -1);
  const stop = fin => { clearInterval(timer); timer = null; $('[data-a=auto]', ov).innerHTML = '&#9654;&#65039;'; if (fin === true && !T.loop) { } };
  const toggleAuto = () => { if (timer) return stop(); const sec = Math.max(1, T.auto || 4); $('[data-a=auto]', ov).innerHTML = '&#9208;&#65039;'; timer = setInterval(() => { if (i >= T.slides.length - 1 && !T.loop) return stop(); next(); }, sec * 1000); };
  const exit = () => { if (!document.body.contains(ov)) return; stop(); document.removeEventListener('keydown', key); document.removeEventListener('fullscreenchange', fsc); clearTimeout(hide); ov.remove(); if (document.fullscreenElement) document.exitFullscreen().catch(() => { }); };
  const fsc = () => { if (!document.fullscreenElement && document.body.contains(ov)) { /* keep open if user left fullscreen */ } };
  const key = e => { const k = e.key; if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(k)) { next(); e.preventDefault(); } else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { prev(); e.preventDefault(); } else if (k === 'Escape') leave(); else if (k === 'f' || k === 'F') { document.fullscreenElement ? document.exitFullscreen() : ov.requestFullscreen && ov.requestFullscreen(); } };
  const leave = () => App.closeLayer(); App.pushLayer(exit);
  document.addEventListener('keydown', key); document.addEventListener('fullscreenchange', fsc);
  const wake = () => { ctl.classList.remove('off'); clearTimeout(hide); hide = setTimeout(() => ctl.classList.add('off'), 2800); };
  ov.addEventListener('pointermove', wake);
  ov.addEventListener('click', e => { const b = e.target.closest('button'); wake(); if (b) { const a = b.dataset.a; a === 'next' ? next() : a === 'prev' ? prev() : a === 'auto' ? toggleAuto() : leave(); return; } const x = e.clientX / innerWidth; x < .3 ? prev() : next(); });
  let sx = 0; ov.addEventListener('touchstart', e => { sx = e.changedTouches[0].clientX; }, { passive: true }); ov.addEventListener('touchend', e => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) { e.preventDefault(); dx < 0 ? next() : prev(); } });
  if (ov.requestFullscreen) ov.requestFullscreen().catch(() => { }); window.addEventListener('resize', () => $$('.slide', stage).forEach(fit));
  if (innerHeight > innerWidth) App.toast(App.t('l_rotate')); wake(); show(start, 1); if (T.auto > 0) toggleAuto();
}

/* ---------- export pptx ---------- */
function bgPng(t) { const c = document.createElement('canvas'); c.width = 1280; c.height = 720; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 1280, 720); g.addColorStop(0, THEMES[t].a); g.addColorStop(1, THEMES[t].b); x.fillStyle = g; x.fillRect(0, 0, 1280, 720); return c.toDataURL('image/jpeg', .9).replace(/^data:/, ''); }
function trXml(tr) {
  if (!tr || tr.type === 'none') return ''; const spd = tr.dur < .6 ? 'fast' : tr.dur < 1.3 ? 'med' : 'slow';
  const inner = { fade: '<p:fade/>', slide: '<p:push dir="l"/>', push: '<p:push dir="u"/>', zoom: '<p:zoom dir="in"/>', dissolve: '<p:dissolve/>', flip: '<p:fade/>', cube: '<p:fade/>' }[tr.type]; return `<p:transition spd="${spd}">${inner}</p:transition>`;
}
async function buildPptx() {
  const P = new PptxGenJS(); P.layout = 'LAYOUT_16x9'; P.author = 'Office Toolkit - Developed by Nahin'; P.title = T.name || 'Presentation';
  for (const s of T.slides) {
    const sl = P.addSlide(), th = THEMES[s.theme], col = th.c.slice(1), ff = FONTS[s.font][1]; sl.background = { data: bgPng(s.theme) };
    const lines = s.body.split('\n').filter(x => x.trim()), bullets = lines.map(x => ({ text: x, options: { bullet: s.layout !== 'title', breakLine: true } }));
    const fitImg = (x, y, w, h) => { if (!s.img) return; let iw = w, ih = h; if (s.iw && s.ih) { const k = Math.min(w / s.iw, h / s.ih); iw = s.iw * k; ih = s.ih * k; } sl.addImage({ data: s.img.replace(/^data:/, ''), x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih }); };
    const T1 = (o) => s.title && sl.addText(s.title, { fontFace: ff, color: col, bold: true, valign: 'middle', ...o });
    const B1 = (o) => lines.length && sl.addText(bullets, { fontFace: ff, color: col, valign: 'top', ...o });
    if (s.layout === 'title') { T1({ x: .8, y: 1.6, w: 8.4, h: 1.4, fontSize: 44, align: 'center' }); B1({ x: 1.2, y: 3.2, w: 7.6, h: 1.6, fontSize: 22, align: 'center' }); }
    else if (s.layout === 'content') { T1({ x: .6, y: .35, w: 8.8, h: 1, fontSize: 34 }); B1({ x: .6, y: 1.5, w: 8.8, h: 3.7, fontSize: 22 }); }
    else if (s.layout === 'image') { T1({ x: .6, y: .35, w: 8.8, h: 1, fontSize: 34 }); B1({ x: .6, y: 1.5, w: 4.2, h: 3.7, fontSize: 20 }); fitImg(5.1, 1.5, 4.3, 3.7); }
    else { if (s.img) sl.addImage({ data: s.img.replace(/^data:/, ''), x: 0, y: 0, w: 10, h: 5.625, sizing: { type: 'cover', w: 10, h: 5.625 } }); T1({ x: .6, y: 3.3, w: 8.8, h: 1, fontSize: 34, color: 'FFFFFF' }); B1({ x: .6, y: 4.3, w: 8.8, h: 1, fontSize: 18, color: 'FFFFFF' }); }
    if (s.notes) sl.addNotes(s.notes);
  }
  const buf = await P.write({ outputType: 'arraybuffer' }), z = await JSZip.loadAsync(buf);
  for (let i = 0; i < T.slides.length; i++) { const f = z.file(`ppt/slides/slide${i + 1}.xml`), tx = trXml(T.slides[i].tr); if (!f || !tx) continue; let x = await f.async('string'); x = x.includes('</p:clrMapOvr>') ? x.replace('</p:clrMapOvr>', '</p:clrMapOvr>' + tx) : x.replace('</p:cSld>', '</p:cSld>' + tx); z.file(`ppt/slides/slide${i + 1}.xml`, x); }
  return z.generateAsync({ type: 'blob', mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', compression: 'DEFLATE' });
}

/* ---------- editor UI ---------- */
const cur = () => T.slides[T.cur];
function opts(list, pre) { return list.map(k => `<option value="${k}" data-i18n="${pre}${k}"></option>`).join(''); }
T.mount = function (el) {
  T.el = el;
  el.innerHTML = `
  <div class="row" style="margin-bottom:10px"><button class="btn ok grow" id="sl-pr">&#9654; <span data-i18n="l_present"></span></button><button class="btn sec" id="sl-add">&#10133; <span data-i18n="l_add"></span></button><button class="btn sec" id="sl-dup">&#10064; <span data-i18n="l_dup"></span></button><button class="btn red" id="sl-del">&#128465;&#65039;</button></div>
  <div class="panel" style="padding:8px"><div id="sl-pv"></div></div>
  <div class="row" style="margin-bottom:6px"><button class="btn sec sm" id="sl-ml">&#9664;</button><div class="strip grow" id="sl-strip"></div><button class="btn sec sm" id="sl-mr">&#9654;</button></div>
  <div class="panel"><div class="row"><label class="f"><span data-i18n="l_layout"></span><select id="sl-lay">${Object.entries(LAYS).map(([k, v]) => `<option value="${k}" data-i18n="${v}"></option>`).join('')}</select></label>
    <label class="f"><span data-i18n="l_font"></span><select id="sl-font"><option value="sans" data-i18n="l_sans"></option><option value="serif" data-i18n="l_serif"></option><option value="mono" data-i18n="l_mono"></option></select></label></div>
    <label class="f" style="margin-top:8px"><span data-i18n="l_title"></span><input type="text" id="sl-t"></label>
    <label class="f" style="margin-top:8px"><span data-i18n="l_body"></span><textarea id="sl-b" rows="4"></textarea></label>
    <label class="f" style="margin-top:8px"><span data-i18n="l_theme"></span></label><div class="pills" id="sl-th"></div>
    <div class="row" style="margin-top:10px"><button class="btn sec" id="sl-im">&#128444;&#65039; <span data-i18n="l_img"></span></button><button class="btn sec" id="sl-rim"><span data-i18n="l_rmimg"></span></button></div>
    <label class="f" style="margin-top:8px"><span data-i18n="l_notes"></span><textarea id="sl-n" rows="2"></textarea></label></div>
  <div class="panel"><h3>&#10024; <span data-i18n="l_trans"></span></h3><div class="row"><label class="f"><select id="sl-tr">${opts(TRS, 'l_')}</select></label>
    <label class="f"><span><span data-i18n="l_dur"></span>: <b id="sl-dv">0.7</b>s</span><input type="range" id="sl-d" min="0.2" max="2.5" step="0.1"></label></div>
    <button class="btn sec sm" id="sl-tra" style="margin-top:8px" data-i18n="l_all"></button></div>
  <div class="panel"><h3>&#127916; <span data-i18n="l_anim"></span></h3><div class="row">
    <label class="f"><span data-i18n="l_at"></span><select id="sl-at">${opts(ANS, 'l_')}</select></label><label class="f"><span data-i18n="l_ab"></span><select id="sl-ab">${opts(ANS, 'l_')}</select></label><label class="f"><span data-i18n="l_ai"></span><select id="sl-ai">${opts(ANS, 'l_')}</select></label></div>
    <div class="row" style="margin-top:8px"><button class="btn sm" id="sl-pa">&#9654; <span data-i18n="l_play"></span></button><button class="btn sec sm" id="sl-ana" data-i18n="l_all"></button></div></div>
  <div class="panel"><div class="row"><label class="f"><span data-i18n="l_auto"></span><input type="number" id="sl-au" min="0" max="120" inputmode="numeric"></label><label class="row" style="margin-top:16px"><input type="checkbox" id="sl-lp" style="width:22px;height:22px"> <span data-i18n="l_loop"></span></label></div>
    <button class="btn grow" id="sl-ex" style="width:100%;margin-top:10px">&#11015;&#65039; <span data-i18n="l_pptx"></span></button><p class="muted" data-i18n="l_noteexp"></p></div>`;
  const $e = s => $(s, el), S = () => cur();
  $e('#sl-th').innerHTML = Object.entries(THEMES).map(([k, v]) => `<button class="btn sec" data-th="${k}" style="background:${bgCss(k)};color:${v.c};min-width:64px">${v.n}</button>`).join('');
  const upd = (thumbs = true) => { render(false, thumbs); App.touch('slides'); };
  $e('#sl-pr').onclick = () => present(T.cur);
  $e('#sl-add').onclick = () => { const c = cur(); T.slides.splice(T.cur + 1, 0, mk({ theme: c.theme, font: c.font, tr: { ...c.tr }, an: { ...c.an } })); T.cur++; render(true); App.touch('slides'); };
  $e('#sl-dup').onclick = () => { T.slides.splice(T.cur + 1, 0, JSON.parse(JSON.stringify(cur()))); T.cur++; render(true); App.touch('slides'); };
  $e('#sl-del').onclick = () => { if (T.slides.length < 2) { T.slides[0] = mk({ layout: 'title' }); } else { T.slides.splice(T.cur, 1); T.cur = Math.min(T.cur, T.slides.length - 1); } render(true); App.touch('slides'); };
  $e('#sl-ml').onclick = () => { if (T.cur > 0) { [T.slides[T.cur - 1], T.slides[T.cur]] = [T.slides[T.cur], T.slides[T.cur - 1]]; T.cur--; render(true); App.touch('slides'); } };
  $e('#sl-mr').onclick = () => { if (T.cur < T.slides.length - 1) { [T.slides[T.cur + 1], T.slides[T.cur]] = [T.slides[T.cur], T.slides[T.cur + 1]]; T.cur++; render(true); App.touch('slides'); } };
  $e('#sl-lay').onchange = e => { S().layout = e.target.value; upd(); };
  $e('#sl-font').onchange = e => { S().font = e.target.value; upd(); };
  $e('#sl-t').oninput = e => { S().title = e.target.value; if (T.cur === 0 && !T.name) { } upd(); };
  $e('#sl-b').oninput = e => { S().body = e.target.value; upd(); }; $e('#sl-n').oninput = e => { S().notes = e.target.value; App.touch('slides'); };
  $$('[data-th]', el).forEach(b => b.onclick = () => { S().theme = b.dataset.th; upd(); });
  $e('#sl-im').onclick = async () => { const [f] = await App.pick('image/*'); if (!f) return; try { const bm = await createImageBitmap(f), k = Math.min(1, 1280 / Math.max(bm.width, bm.height)), c = document.createElement('canvas'); c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k); const x = c.getContext('2d'); if (f.type !== 'image/png') { x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); } x.drawImage(bm, 0, 0, c.width, c.height); const s = S(); s.img = c.toDataURL(f.type === 'image/png' ? 'image/png' : 'image/jpeg', .85); s.iw = c.width; s.ih = c.height; if (s.layout === 'title' || s.layout === 'content') s.layout = 'image'; render(true); App.touch('slides'); } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); } };
  $e('#sl-rim').onclick = () => { S().img = null; upd(); };
  $e('#sl-tr').onchange = e => { S().tr.type = e.target.value; App.touch('slides'); }; $e('#sl-d').oninput = e => { S().tr.dur = +e.target.value; $e('#sl-dv').textContent = e.target.value; App.touch('slides'); };
  $e('#sl-tra').onclick = () => { const t = { ...S().tr }; T.slides.forEach(s => s.tr = { ...t }); App.toast('\u2705'); App.touch('slides'); };
  [['#sl-at', 't'], ['#sl-ab', 'b'], ['#sl-ai', 'i']].forEach(([id, k]) => $e(id).onchange = e => { S().an[k] = e.target.value; upd(false); playAnim($('.slide', $e('#sl-pv'))); });
  $e('#sl-pa').onclick = () => { render(false, false); playAnim($('.slide', $e('#sl-pv'))); };
  $e('#sl-ana').onclick = () => { const a = { ...S().an }; T.slides.forEach(s => s.an = { ...a }); App.toast('\u2705'); App.touch('slides'); };
  $e('#sl-au').oninput = e => { T.auto = +e.target.value || 0; App.touch('slides'); }; $e('#sl-lp').onchange = e => { T.loop = e.target.checked; App.touch('slides'); };
  $e('#sl-ex').onclick = async () => { try { App.busy(true); const b = await buildPptx(); App.download(b, (T.title() || 'presentation') + '.pptx'); } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); } finally { App.busy(false); } };
  window.addEventListener('resize', () => { if (App.cur === 'slides') $$('.slide', el).forEach(fit); });
  render(true);
};
T.title = () => (T.name || (T.slides.find(s => s.title) || {}).title || '').slice(0, 40).replace(/[\\/:*?"<>|]/g, '').trim();
function render(full, thumbs = true) {
  const el = T.el, s = cur(), pv = $('#sl-pv', el); pv.innerHTML = ''; const se = slideEl(s, true); pv.appendChild(se); fit(se);
  if (full) { $('#sl-lay', el).value = s.layout; $('#sl-font', el).value = s.font; $('#sl-t', el).value = s.title; $('#sl-b', el).value = s.body; $('#sl-n', el).value = s.notes; $('#sl-tr', el).value = s.tr.type; $('#sl-d', el).value = s.tr.dur; $('#sl-dv', el).textContent = s.tr.dur; $('#sl-at', el).value = s.an.t; $('#sl-ab', el).value = s.an.b; $('#sl-ai', el).value = s.an.i; $('#sl-au', el).value = T.auto; $('#sl-lp', el).checked = T.loop; }
  const st = $('#sl-strip', el);
  if (full || !st.children.length) { st.innerHTML = ''; T.slides.forEach((x, i) => { const d = document.createElement('div'); d.className = 'thumb' + (i === T.cur ? ' on' : ''); d.innerHTML = '<span class="no">' + (i + 1) + '</span>'; d.appendChild(slideEl(x)); d.onclick = () => { T.cur = i; render(true); }; st.appendChild(d); fit(d.lastChild); }); const on = $('.thumb.on', st); on && on.scrollIntoView({ inline: 'center', block: 'nearest' }); }
  else if (thumbs) { const d = st.children[T.cur]; if (d) { d.lastChild.replaceWith(slideEl(s)); fit(d.lastChild); } }
}
T.hasContent = () => T.slides.some(s => s.title || s.body || s.img);
T.exportFile = async function () { const state = { slides: T.slides, name: T.name, auto: T.auto, loop: T.loop }; return { id: T.fileId ||= App.uid(), name: T.title() || 'presentation', ext: 'pptx', blob: await buildPptx(), state: JSON.parse(JSON.stringify(state)) }; };
T.getState = () => ({ slides: T.slides, cur: T.cur, name: T.name, fileId: T.fileId, auto: T.auto, loop: T.loop });
T.setState = function (s) { if (!s.slides || !s.slides.length) return; T.slides = s.slides.map(x => mk(x)); T.cur = Math.min(s.cur || 0, T.slides.length - 1); T.name = s.name || ''; T.fileId = s.fileId || null; T.auto = s.auto || 0; T.loop = !!s.loop; if (T.el) render(true); };
T.openFile = async function (r) { if (r.state && r.state.slides) { T.setState({ ...r.state, fileId: r.id, cur: 0 }); T.name = r.name; } };
T.onShow = () => { if (T.el) $$('.slide', T.el).forEach(fit); };
T.onLang = () => { if (T.el) render(true); };
App.reg('slides', T);
})();
