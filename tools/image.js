/* Image Resizer - Developed by Nahin */
(() => {
App.addLang({
  i_gallery: 'Gallery', i_camera: 'Camera', i_hint: 'Pick one or many images to start', i_size: 'Size', i_px: 'Pixels', i_pct: 'Percent', i_w: 'Width (px)', i_h: 'Height (px)',
  i_lock: 'Lock aspect ratio', i_fit: 'When shape differs', i_cover: 'Crop to fill', i_contain: 'Fit inside', i_stretch: 'Stretch', i_presets: 'Presets', i_passport: 'Passport',
  i_fmt: 'Format', i_q: 'Quality', i_before: 'Before', i_after: 'After', i_save: 'Download', i_saveall: 'Save all', i_remove: 'Remove', i_clear: 'Clear all', i_proc: 'Processing...', i_bad: 'Could not read this image', i_saved: 'saved smaller', i_tl: 'Limit file size (max)', i_tmet: 'target met', i_tsm: 'already below target', i_tdim: 'dimensions reduced to', i_tpng: 'PNG is lossless, so dimensions are reduced to reach the size. Choose JPG or WebP to keep the dimensions.', i_tmin: 'could not reach target',
}, {
  i_gallery: 'গ্যালারি', i_camera: 'ক্যামেরা', i_hint: 'এক বা একাধিক ছবি বেছে নিন', i_size: 'সাইজ', i_px: 'পিক্সেল', i_pct: 'শতাংশ', i_w: 'প্রস্থ (px)', i_h: 'উচ্চতা (px)',
  i_lock: 'অ্যাসপেক্ট রেশিও লক', i_fit: 'শেপ আলাদা হলে', i_cover: 'ক্রপ করে ভরাট', i_contain: 'ভেতরে ফিট', i_stretch: 'টেনে বসান', i_presets: 'প্রিসেট', i_passport: 'পাসপোর্ট',
  i_fmt: 'ফরম্যাট', i_q: 'কোয়ালিটি', i_before: 'আগে', i_after: 'পরে', i_save: 'ডাউনলোড', i_saveall: 'সব সেভ', i_remove: 'বাদ দিন', i_clear: 'সব মুছুন', i_proc: 'প্রসেস হচ্ছে...', i_bad: 'ছবিটি পড়া যায়নি', i_saved: 'ছোট হয়েছে', i_tl: 'ফাইল সাইজ সীমা (সর্বোচ্চ)', i_tmet: 'টার্গেট পূরণ', i_tsm: 'আগেই টার্গেটের চেয়ে ছোট', i_tdim: 'সাইজ কমিয়ে করা হয়েছে', i_tpng: 'PNG লসলেস, তাই সাইজ পেতে ছবির মাপ কমানো হয়। মাপ ঠিক রাখতে JPG বা WebP বেছে নিন।', i_tmin: 'টার্গেটে পৌঁছানো যায়নি',
});

const T = {
  libs: ['libs/jszip.min.js'], items: [], bm: new Map(), run: 0,
  s: { mode: 'px', w: '', h: '', lock: true, last: 'w', pct: 50, fmt: 'jpeg', q: 85, fit: 'cover', tOn: false, tVal: 200, tUnit: 'KB' },

  mount(el) {
    el.innerHTML = `
    <div class="panel"><div class="row">
      <button class="btn grow" id="im-gal">&#128444;&#65039; <span data-i18n="i_gallery"></span></button>
      <button class="btn grow sec" id="im-cam">&#128247; <span data-i18n="i_camera"></span></button></div>
      <p class="muted" id="im-hint" data-i18n="i_hint" style="margin:8px 0 0"></p></div>
    <div class="panel" id="im-opts"><h3 data-i18n="i_size"></h3>
      <div class="tabs"><button id="im-mpx" data-i18n="i_px"></button><button id="im-mpc" data-i18n="i_pct"></button></div>
      <div id="im-pxbox"><div class="row"><label class="f"><span data-i18n="i_w"></span><input id="im-w" type="number" min="1" inputmode="numeric"></label>
        <label class="f"><span data-i18n="i_h"></span><input id="im-h" type="number" min="1" inputmode="numeric"></label></div>
        <label class="row" style="margin-top:10px"><input type="checkbox" id="im-lock" style="width:22px;height:22px"> <span data-i18n="i_lock"></span></label>
        <label class="f" style="margin-top:8px" id="im-fitbox"><span data-i18n="i_fit"></span><select id="im-fit"><option value="cover" data-i18n="i_cover"></option><option value="contain" data-i18n="i_contain"></option><option value="stretch" data-i18n="i_stretch"></option></select></label></div>
      <div id="im-pcbox" class="hidden"><label class="f"><span><b id="im-pcv">50</b>%</span><input id="im-pc" type="range" min="5" max="200" step="1"></label></div>
      <h3 style="margin-top:14px" data-i18n="i_presets"></h3>
      <div class="pills"><button class="btn sec" data-p="512x512">512&times;512</button><button class="btn sec" data-p="1080x1080">1080&times;1080</button>
        <button class="btn sec" data-p="413x531"><span data-i18n="i_passport"></span> 35&times;45mm</button><button class="btn sec" data-p="50">50%</button><button class="btn sec" data-p="25">25%</button></div>
      <div class="row" style="margin-top:14px"><label class="f"><span data-i18n="i_fmt"></span><select id="im-fmt"><option value="jpeg">JPG</option><option value="png">PNG</option><option value="webp">WebP</option></select></label></div>
      <label class="f" id="im-qbox" style="margin-top:8px"><span><span data-i18n="i_q"></span>: <b id="im-qv">85</b>%</span><input id="im-q" type="range" min="10" max="100"></label>
      <div style="margin-top:14px"><label class="row"><input type="checkbox" id="im-ton" style="width:22px;height:22px"> <b data-i18n="i_tl"></b></label>
        <div id="im-tbox" class="hidden" style="margin-top:10px"><div class="row"><input id="im-tv" type="number" min="1" inputmode="numeric" class="grow"><select id="im-tu" style="width:90px"><option>KB</option><option>MB</option></select></div>
        <div class="pills" style="margin-top:8px"><button class="btn sec" data-t="50 KB">50 KB</button><button class="btn sec" data-t="100 KB">100 KB</button><button class="btn sec" data-t="200 KB">200 KB</button><button class="btn sec" data-t="500 KB">500 KB</button><button class="btn sec" data-t="1 MB">1 MB</button><button class="btn sec" data-t="2 MB">2 MB</button></div>
        <p class="muted hidden" id="im-tpng" data-i18n="i_tpng" style="margin:8px 0 0"></p></div></div></div>
    <div class="row" style="margin-bottom:10px"><button class="btn ok grow" id="im-all">&#11015;&#65039; <span data-i18n="i_saveall"></span></button><button class="btn sec" id="im-clr">&#128465;&#65039; <span data-i18n="i_clear"></span></button></div>
    <div class="list" id="im-list"></div>`;
    const $e = s => $(s, el), s = T.s;
    $e('#im-gal').onclick = async () => T.add(await App.pick('image/*', true));
    $e('#im-cam').onclick = async () => T.add(await App.pick('image/*', false, true));
    $e('#im-mpx').onclick = () => { s.mode = 'px'; T.sync(); T.sched(); };
    $e('#im-mpc').onclick = () => { s.mode = 'pct'; T.sync(); T.sched(); };
    $e('#im-w').oninput = e => { s.w = e.target.value; s.last = 'w'; if (s.lock && T.items[0]) { const a = T.items[0]; $e('#im-h').value = s.w ? Math.round(s.w * a.h / a.w) : ''; } T.sched(); };
    $e('#im-h').oninput = e => { s.h = e.target.value; s.last = 'h'; if (s.lock && T.items[0]) { const a = T.items[0]; $e('#im-w').value = s.h ? Math.round(s.h * a.w / a.h) : ''; } T.sched(); };
    $e('#im-lock').onchange = e => { s.lock = e.target.checked; T.sync(); T.sched(); };
    $e('#im-fit').onchange = e => { s.fit = e.target.value; T.sched(); };
    $e('#im-pc').oninput = e => { s.pct = +e.target.value; $e('#im-pcv').textContent = s.pct; T.sched(); };
    $e('#im-fmt').onchange = e => { s.fmt = e.target.value; T.sync(); T.sched(); };
    $e('#im-q').oninput = e => { s.q = +e.target.value; $e('#im-qv').textContent = s.q; T.sched(); };
    $$('[data-p]', el).forEach(b => b.onclick = () => {
      const p = b.dataset.p;
      if (p.includes('x')) { const [w, h] = p.split('x'); s.mode = 'px'; s.w = w; s.h = h; s.lock = false; }
      else { s.mode = 'pct'; s.pct = +p; }
      T.sync(); T.sched();
    });
    $e('#im-ton').onchange = e => { s.tOn = e.target.checked; T.sync(); T.sched(); };
    $e('#im-tv').oninput = e => { s.tVal = Math.max(1, +e.target.value || 1); T.sched(); };
    $e('#im-tu').onchange = e => { s.tUnit = e.target.value; T.sched(); };
    $$('[data-t]', el).forEach(b => b.onclick = () => { const [v, u] = b.dataset.t.split(' '); s.tVal = +v; s.tUnit = u; s.tOn = true; T.sync(); T.sched(); });
    $e('#im-all').onclick = () => App.onSaveBtn();
    $e('#im-clr').onclick = () => { T.items.forEach(T.free); T.items = []; T.renderList(); App.touch('image'); };
    T.el = el; T.sync();
  },
  sync() {
    const el = T.el, s = T.s, $e = x => $(x, el);
    $e('#im-mpx').classList.toggle('on', s.mode === 'px'); $e('#im-mpc').classList.toggle('on', s.mode === 'pct');
    $e('#im-pxbox').classList.toggle('hidden', s.mode !== 'px'); $e('#im-pcbox').classList.toggle('hidden', s.mode !== 'pct');
    $e('#im-w').value = s.w; $e('#im-h').value = s.h; $e('#im-lock').checked = s.lock; $e('#im-fit').value = s.fit;
    $e('#im-fitbox').classList.toggle('hidden', s.lock);
    $e('#im-pc').value = s.pct; $e('#im-pcv').textContent = s.pct; $e('#im-fmt').value = s.fmt; $e('#im-q').value = s.q; $e('#im-qv').textContent = s.q;
    $e('#im-qbox').classList.toggle('hidden', s.fmt === 'png' || s.tOn);
    $e('#im-ton').checked = s.tOn; $e('#im-tbox').classList.toggle('hidden', !s.tOn); $e('#im-tv').value = s.tVal; $e('#im-tu').value = s.tUnit; $e('#im-tpng').classList.toggle('hidden', s.fmt !== 'png');
  },
  async add(files, saved) {
    files = files.filter(f => f.type.startsWith('image/') || /\.(jpe?g|png|webp|gif|bmp)$/i.test(f.name)); if (!files.length) return;
    App.busy(true);
    try {
      for (const f of files) {
        const it = { id: App.uid(), blob: f, name: (f.name || 'photo').replace(/\.[^.]+$/, ''), w: 0, h: 0 };
        try { const b = await T.bitmap(it); it.w = b.width; it.h = b.height; if (saved) it.fileId = saved; T.items.push(it); }
        catch (e) { App.toast(App.t('i_bad') + ': ' + f.name, true); }
      }
    } finally { App.busy(false); }
    T.renderList(); T.sched(); App.touch('image');
  },
  async bitmap(it) {
    if (T.bm.has(it.id)) return T.bm.get(it.id);
    let b;
    try { b = await createImageBitmap(it.blob); }
    catch (e) { b = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(it.blob); }); }
    T.bm.set(it.id, b); return b;
  },
  free(it) { T.bm.delete(it.id); it.srcUrl && URL.revokeObjectURL(it.srcUrl); it.outUrl && URL.revokeObjectURL(it.outUrl); },
  renderList() {
    const L = $('#im-list', T.el); L.innerHTML = '';
    $('#im-hint', T.el).classList.toggle('hidden', T.items.length > 0);
    if (!T.items.length) { L.innerHTML = '<div class="empty">&#128247;</div>'; return; }
    T.items.forEach(it => {
      it.srcUrl ||= URL.createObjectURL(it.blob);
      const d = document.createElement('div'); d.className = 'imgcard'; d.dataset.id = it.id;
      d.innerHTML = `<div class="row"><div class="meta grow" style="min-width:0"><b style="display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${App.esc(it.name)}</b>
        <div class="stat"><span data-i18n="i_before"></span>: <b>${it.w}&times;${it.h}</b> &middot; <b>${App.fmtSize(it.blob.size)}</b></div>
        <div class="stat"><span data-i18n="i_after"></span>: <b class="o">...</b></div></div></div>
        <div class="imgcmp"><div><img src="${it.srcUrl}" alt=""><span data-i18n="i_before"></span></div><div><img class="oi" alt=""><span data-i18n="i_after"></span></div></div>
        <div class="row" style="margin-top:8px"><button class="btn ok sm grow dl">&#11015;&#65039; <span data-i18n="i_save"></span></button><button class="btn sec sm rm">&#10005; <span data-i18n="i_remove"></span></button></div>`;
      d.querySelector('.dl').onclick = async () => { try { await T.ready(); const r = T.rec(it); await T.store(r); App.download(r.blob, r.name + '.' + r.ext); App.toast('\u2705 ' + App.t('saved')); } catch (e) { App.toast(e.message, true); } };
      d.querySelector('.rm').onclick = () => { T.free(it); T.items = T.items.filter(x => x !== it); T.renderList(); App.touch('image'); };
      L.appendChild(d); if (it.out) T.paint(it);
    });
    App.i18n(L);
  },
  paint(it) {
    const d = $(`[data-id="${it.id}"]`, T.el); if (!d) return;
    const pct = Math.round((1 - it.out.size / it.blob.size) * 100);
    $('.o', d).innerHTML = `${it.ow}&times;${it.oh} &middot; ${App.fmtSize(it.out.size)} ` + (pct > 0 ? `<span class="good">(${pct}% ${App.t('i_saved')})</span>` : `<span>(+${-pct}%)</span>`);
    $('.oi', d).src = it.outUrl;
    if (it.note) { const t = T.s.tVal + ' ' + T.s.tUnit, m = it.note === 'min' ? '<span style="color:#f59e0b"> &#9888; ' + App.t('i_tmin') + '</span>' : '<span class="good"> &#10003; ' + App.t(it.note === 'small' ? 'i_tsm' : 'i_tmet') + ' (&le; ' + t + ')</span>'; $('.o', d).insertAdjacentHTML('beforeend', m); }
  },
  sched() { clearTimeout(T._st); T._st = setTimeout(() => { T.prom = T.processAll(); }, 180); App.touch('image'); },
  async ready() { clearTimeout(T._st); if (T.items.some(i => !i.out)) T.prom = T.processAll(); await T.prom; },
  async processAll() {
    const my = ++T.run;
    for (const it of T.items) {
      if (my !== T.run) return;
      try { await T.proc(it); T.paint(it); } catch (e) { console.error(e); App.toast(App.t('err') + ': ' + e.message, true); }
    }
  },
  async proc(it) {
    const s = T.s, bm = await T.bitmap(it), ar = it.w / it.h; let tw, th, locked = false;
    if (s.mode === 'pct') { tw = Math.max(1, Math.round(it.w * s.pct / 100)); th = Math.max(1, Math.round(it.h * s.pct / 100)); locked = true; }
    else {
      let w = +s.w || 0, h = +s.h || 0;
      if (!w && !h) { w = it.w; h = it.h; locked = true; }
      else if (s.lock || !w || !h) { locked = true; const drv = w && !h ? 'w' : h && !w ? 'h' : s.last; if (drv === 'w') h = Math.round(w / ar); else w = Math.round(h * ar); }
      tw = Math.min(w, 12000); th = Math.min(h, 12000);
    }
    const draw = (W, H) => {
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
      if (s.fmt === 'jpeg') { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
      if (locked || s.fit === 'stretch') x.drawImage(bm, 0, 0, W, H);
      else { const sc = s.fit === 'cover' ? Math.max(W / it.w, H / it.h) : Math.min(W / it.w, H / it.h), dw = it.w * sc, dh = it.h * sc; x.drawImage(bm, (W - dw) / 2, (H - dh) / 2, dw, dh); }
      return c;
    };
    const mime = 'image/' + s.fmt, enc = (c, q) => new Promise(r => c.toBlob(r, mime, q)), target = s.tOn ? s.tVal * (s.tUnit === 'MB' ? 1048576 : 1024) : 0;
    let blob, W = tw, H = th, note = '';
    if (!target) blob = await enc(draw(W, H), s.fmt === 'png' ? undefined : s.q / 100);
    else {
      for (let round = 0; round < 8; round++) {
        const c = draw(W, H);
        if (s.fmt === 'png') blob = await enc(c);
        else {
          const top = await enc(c, .95); blob = top;
          if (top.size > target) {
            let lo = .03, hi = .95, best = null; for (let i = 0; i < 7; i++) { const q = (lo + hi) / 2, b2 = await enc(c, q); if (b2.size <= target) { best = b2; lo = q; } else hi = q; }
            if (best) blob = best; else blob = await enc(c, .03);
          }
        }
        if (blob.size <= target) break;
        const k = Math.max(.5, Math.min(.92, Math.sqrt(target / blob.size) * .96)); W = Math.max(16, Math.round(W * k)); H = Math.max(16, Math.round(H * k));
      }
      note = blob.size <= target ? (blob.size < target * .5 && W === tw ? 'small' : 'met') : 'min';
    }
    if (!blob) throw new Error('Could not encode image');
    tw = W; th = H; it.note = note;
    it.outUrl && URL.revokeObjectURL(it.outUrl); it.out = blob; it.ow = tw; it.oh = th; it.outUrl = URL.createObjectURL(blob);
  },
  rec(it) {
    const ext = it.out.type === 'image/png' ? 'png' : it.out.type === 'image/webp' ? 'webp' : 'jpg';
    return { id: it.fileId ||= App.uid(), name: it.name.replace(/-resized$/, '') + '-resized', ext, blob: it.out, mime: it.out.type };
  },
  store: r => App.DB.put('files', { id: r.id, type: 'image', name: r.name, ext: r.ext, mime: r.mime, blob: r.blob, size: r.blob.size, updated: Date.now() }),
  hasContent: () => T.items.length > 0,
  async exportFile() { await T.ready(); return T.items.filter(i => i.out).map(T.rec); },
  getState: () => ({ s: T.s, items: T.items.map(i => ({ id: i.id, name: i.name, blob: i.blob, w: i.w, h: i.h, fileId: i.fileId })) }),
  async setState(st) {
    Object.assign(T.s, st.s); T.items.forEach(T.free); T.items = (st.items || []).map(i => ({ ...i })); T.sync();
    for (const i of T.items) { try { await T.bitmap(i); } catch (e) { i.bad = true; } }
    T.items = T.items.filter(i => !i.bad); T.renderList(); T.sched();
  },
  async openFile(r) { await T.add([new File([r.blob], r.name + '.' + r.ext, { type: r.blob.type })]); },
};
App.reg('image', T);
})();
