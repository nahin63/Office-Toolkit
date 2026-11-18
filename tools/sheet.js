/* Spreadsheet - Developed by Nahin */
(() => {
App.addLang({
  s_undo: 'Undo', s_bold: 'Bold', s_tc: 'Text color', s_bg: 'Fill color', s_nf: 'Number format', s_g: 'General', s_2: '0.00', s_n: '1,234.00', s_c: 'Currency $', s_p: 'Percent', s_addr: '+ Row', s_delr: '- Row', s_addc: '+ Col', s_delc: '- Col',
  s_range: 'Range', s_fd: 'Fill down', s_fr: 'Fill right', s_chart: 'Chart', s_import: 'Import', s_export: 'Export', s_clear: 'Clear', s_bar: 'Bar', s_line: 'Line', s_pie: 'Pie', s_pngs: 'Save PNG',
  s_rename: 'Sheet name:', s_rangeon: 'Range mode ON: tap cells to extend selection', s_sel: 'Select cells with numbers first', s_big: 'Large file: only the first 1500 rows / 52 columns were loaded', s_delsheet: 'Delete this sheet?', s_fx: 'Enter value or formula (=SUM(A1:A5))',
}, {
  s_undo: 'আনডু', s_bold: 'বোল্ড', s_tc: 'লেখার রং', s_bg: 'ঘরের রং', s_nf: 'নাম্বার ফরম্যাট', s_g: 'সাধারণ', s_2: '0.00', s_n: '1,234.00', s_c: 'কারেন্সি $', s_p: 'শতাংশ', s_addr: '+ সারি', s_delr: '- সারি', s_addc: '+ কলাম', s_delc: '- কলাম',
  s_range: 'রেঞ্জ', s_fd: 'নিচে ভরুন', s_fr: 'ডানে ভরুন', s_chart: 'চার্ট', s_import: 'ইমপোর্ট', s_export: 'এক্সপোর্ট', s_clear: 'মুছুন', s_bar: 'বার', s_line: 'লাইন', s_pie: 'পাই', s_pngs: 'PNG সেভ',
  s_rename: 'শিটের নাম:', s_rangeon: 'রেঞ্জ মোড চালু: ঘরে ট্যাপ করে সিলেকশন বাড়ান', s_sel: 'আগে সংখ্যাসহ ঘর সিলেক্ট করুন', s_big: 'বড় ফাইল: প্রথম ১৫০০ সারি / ৫২ কলাম লোড হয়েছে', s_delsheet: 'এই শিট মুছবেন?', s_fx: 'মান বা ফর্মুলা লিখুন (=SUM(A1:A5))',
});
const FE = Formula.FErr, CN = Formula.colName;
const NF = { g: 'General', 2: '0.00', n: '#,##0.00', c: '$#,##0.00', p: '0.00%' };
const T = { libs: ['libs/xlsx.full.min.js'], fileId: null, rangeMode: false, undo: [], sel: { r1: 0, c1: 0, r2: 0, c2: 0 }, cur: { r: 0, c: 0 }, editing: null,
  book: { sheets: [{ name: 'Sheet1', cells: {}, rows: 100, cols: 26 }], cur: 0 } };
const sh = () => T.book.sheets[T.book.cur];
const K = (r, c) => r + ',' + c;
const CIRC = {};

/* ---------- evaluation ---------- */
function evalVal(s, r, c) {
  s._c ||= new Map(); const k = K(r, c), cell = s.cells[k];
  if (!cell || cell.v === '' || cell.v == null) return null;
  const raw = cell.v;
  if (typeof raw === 'string' && raw[0] === '=') {
    if (s._c.has(k)) { const x = s._c.get(k); if (x === CIRC) throw new FE('#CIRC!'); if (x instanceof FE) throw x; return x; }
    s._c.set(k, CIRC);
    try {
      const ctx = { cell: (rr, cc) => evalVal(s, rr, cc), range: (r1, c1, r2, c2) => { if ((r2 - r1 + 1) * (c2 - c1 + 1) > 200000) throw new FE('#REF!'); const o = []; for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) o.push(evalVal(s, i, j)); return o; } };
      let v = Formula.compile(raw)(ctx); if (Array.isArray(v)) v = v.length ? v[0] : null; s._c.set(k, v); return v;
    } catch (e) { const er = e instanceof FE ? e : new FE('#ERR!'); s._c.set(k, er); throw er; }
  }
  if (typeof raw === 'number') return raw;
  const t = String(raw); if (t.trim() !== '' && !isNaN(Number(t))) return Number(t);
  if (t.toUpperCase() === 'TRUE') return true; if (t.toUpperCase() === 'FALSE') return false; return t;
}
const recalc = () => T.book.sheets.forEach(s => s._c = null);
function fmtNum(v, nf) {
  const th = x => x.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (nf === '2') return v.toFixed(2); if (nf === 'n') return th(v); if (nf === 'c') return (v < 0 ? '-$' : '$') + th(Math.abs(v)); if (nf === 'p') return (v * 100).toFixed(2) + '%';
  return Number.isInteger(v) ? String(v) : String(+v.toPrecision(12));
}
function display(s, r, c) {
  const cell = s.cells[K(r, c)]; if (!cell || cell.v === '' || cell.v == null) return { t: '', n: false };
  let v; try { v = evalVal(s, r, c); } catch (e) { return { t: e.msg || '#ERR!', n: false }; }
  if (v === null) return { t: '', n: false };
  const nf = cell.nf || 'g';
  if (typeof v === 'number') { if (nf === 'g' && typeof cell.v === 'string' && cell.v[0] !== '=') return { t: cell.v, n: true }; return { t: fmtNum(v, nf), n: true }; }
  return { t: typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v), n: false };
}

/* ---------- state helpers ---------- */
function snap() { try { T.undo.push(JSON.stringify(T.book)); if (T.undo.length > 25) T.undo.shift(); } catch (e) { } }
function changed() { recalc(); paint(); showFx(); App.touch('sheet'); }
function setRaw(r, c, v, keepStyle = true) {
  const s = sh(), k = K(r, c), old = s.cells[k]; v = v == null ? '' : v;
  if (v === '' && !(old && (old.b || old.c || old.bg || (old.nf && old.nf !== 'g')))) { delete s.cells[k]; return; }
  s.cells[k] = { ...(keepStyle && old ? old : {}), v };
}
const norm = () => { const q = T.sel; return { r1: Math.min(q.r1, q.r2), r2: Math.max(q.r1, q.r2), c1: Math.min(q.c1, q.c2), c2: Math.max(q.c1, q.c2) }; };
function eachSel(fn) { const q = norm(); for (let r = q.r1; r <= q.r2; r++) for (let c = q.c1; c <= q.c2; c++) fn(r, c); }

/* ---------- grid ---------- */
function buildGrid() {
  const s = sh(); let h = '<table class="grid" style="width:' + (42 + 96 * s.cols) + 'px"><colgroup><col style="width:42px">'; for (let c = 0; c < s.cols; c++) h += '<col style="width:96px">';
  h += '</colgroup><thead><tr><th class="corner rh"></th>'; for (let c = 0; c < s.cols; c++) h += `<th data-ch="${c}">${CN(c)}</th>`;
  h += '</tr></thead><tbody>'; for (let r = 0; r < s.rows; r++) { h += `<tr><th class="rh" data-rh="${r}">${r + 1}</th>`; for (let c = 0; c < s.cols; c++) h += `<td data-r="${r}" data-c="${c}"><span></span></td>`; h += '</tr>'; }
  T.wrap.innerHTML = h + '</tbody></table>'; T.tb = T.wrap.querySelector('tbody'); paint();
}
const tdAt = (r, c) => T.tb && T.tb.rows[r] && T.tb.rows[r].cells[c + 1];
function paint() {
  const s = sh(); if (!T.tb) return;
  for (let r = 0; r < s.rows; r++) { const row = T.tb.rows[r]; for (let c = 0; c < s.cols; c++) {
    const td = row.cells[c + 1], cell = s.cells[K(r, c)]; if (td.firstChild.tagName !== 'SPAN') continue;
    const d = display(s, r, c); if (td.firstChild.textContent !== d.t) td.firstChild.textContent = d.t;
    td.classList.toggle('n', d.n); td.style.fontWeight = cell && cell.b ? '700' : ''; td.style.color = cell && cell.c || ''; td.style.background = cell && cell.bg || '';
  } }
  paintSel();
}
function paintSel() {
  if (!T.tb) return; $$('td.sel,td.cur', T.tb).forEach(x => x.classList.remove('sel', 'cur'));
  const q = norm(); for (let r = q.r1; r <= q.r2; r++) for (let c = q.c1; c <= q.c2; c++) { const td = tdAt(r, c); td && td.classList.add('sel'); }
  const cu = tdAt(T.cur.r, T.cur.c); if (cu) { cu.classList.add('cur'); }
  const last = tdAt(q.r2, q.c2); if (last && !T.editing) last.appendChild(T.fh);
  $('#sh-nm', T.el).textContent = (q.r1 === q.r2 && q.c1 === q.c2) ? CN(T.cur.c) + (T.cur.r + 1) : CN(q.c1) + (q.r1 + 1) + ':' + CN(q.c2) + (q.r2 + 1);
  showFx();
}
function showFx() { const c = sh().cells[K(T.cur.r, T.cur.c)]; const fx = $('#sh-fx', T.el); if (document.activeElement !== fx) fx.value = c ? c.v : ''; const b = $('#sh-b', T.el); b && b.classList.toggle('on', !!(c && c.b)); const nf = $('#sh-nf', T.el); if (nf) nf.value = c && c.nf || 'g'; }
function select(r, c, extend) {
  const s = sh(); r = Math.max(0, Math.min(s.rows - 1, r)); c = Math.max(0, Math.min(s.cols - 1, c));
  if (extend) { T.sel = { r1: T.sel.r1, c1: T.sel.c1, r2: r, c2: c }; } else { T.cur = { r, c }; T.sel = { r1: r, c1: c, r2: r, c2: c }; }
  paintSel(); const td = tdAt(r, c); if (td) { const w = T.wrap, a = td.getBoundingClientRect(), b = w.getBoundingClientRect(); if (a.bottom > b.bottom - 10) w.scrollTop += a.bottom - b.bottom + 40; if (a.top < b.top + 32) w.scrollTop -= b.top + 40 - a.top; if (a.right > b.right - 10) w.scrollLeft += a.right - b.right + 40; if (a.left < b.left + 44) w.scrollLeft -= b.left + 50 - a.left; }
}
function startEdit(r, c, init) {
  if (T.editing) return; const td = tdAt(r, c); if (!td) return; const cell = sh().cells[K(r, c)];
  T.editing = { r, c }; const inp = document.createElement('input'); inp.type = 'text'; inp.value = init !== undefined ? init : (cell ? cell.v : ''); inp.autocapitalize = 'off'; inp.autocomplete = 'off';
  td.firstChild.style.visibility = 'hidden'; td.appendChild(inp); inp.focus(); if (init === undefined) inp.select();
  let done = false; const fin = (commit, mv) => { if (done) return; done = true; T.editing = null; const v = inp.value; inp.remove(); td.firstChild.style.visibility = ''; if (commit) { snap(); setRaw(r, c, v); changed(); } if (mv) select(r + mv[0], c + mv[1]); else paintSel(); };
  inp.oninput = () => { $('#sh-fx', T.el).value = inp.value; };
  inp.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fin(true, [e.shiftKey ? -1 : 1, 0]); } else if (e.key === 'Tab') { e.preventDefault(); fin(true, [0, e.shiftKey ? -1 : 1]); } else if (e.key === 'Escape') fin(false); e.stopPropagation(); };
  inp.onblur = () => fin(true);
}

/* ---------- structure ---------- */
function remap(fnCell, fnRef) {
  const s = sh(), nc = {};
  for (const k in s.cells) { const [r, c] = k.split(',').map(Number), p = fnCell(r, c); if (!p) continue; const cell = { ...s.cells[k] }; if (typeof cell.v === 'string' && cell.v[0] === '=') cell.v = Formula.mapRefs(cell.v, fnRef); nc[K(p[0], p[1])] = cell; }
  s.cells = nc;
}
function insRow(at) { snap(); const s = sh(); remap((r, c) => [r >= at ? r + 1 : r, c], x => ({ ...x, r: x.r >= at ? x.r + 1 : x.r })); s.rows++; rebuild(); select(at, T.cur.c); }
function insCol(at) { snap(); const s = sh(); remap((r, c) => [r, c >= at ? c + 1 : c], x => ({ ...x, c: x.c >= at ? x.c + 1 : x.c })); s.cols++; rebuild(); select(T.cur.r, at); }
function delRows(a, b) { snap(); const s = sh(), n = b - a + 1; if (s.rows - n < 1) return App.toast('Min 1 row', true); remap((r, c) => r >= a && r <= b ? null : [r > b ? r - n : r, c], x => x.r >= a && x.r <= b ? null : { ...x, r: x.r > b ? x.r - n : x.r }); s.rows -= n; rebuild(); select(Math.min(a, s.rows - 1), T.cur.c); }
function delCols(a, b) { snap(); const s = sh(), n = b - a + 1; if (s.cols - n < 1) return App.toast('Min 1 column', true); remap((r, c) => c >= a && c <= b ? null : [r, c > b ? c - n : c], x => x.c >= a && x.c <= b ? null : { ...x, c: x.c > b ? x.c - n : x.c }); s.cols -= n; rebuild(); select(T.cur.r, Math.min(a, s.cols - 1)); }
function rebuild() { recalc(); buildGrid(); App.touch('sheet'); }

/* ---------- fill ---------- */
function fillRange(q, dir, n) {
  const s = sh(), vert = dir === 'd' || dir === 'u', fwd = dir === 'd' || dir === 'r', lines = vert ? q.c2 - q.c1 + 1 : q.r2 - q.r1 + 1;
  for (let L = 0; L < lines; L++) {
    let co = []; if (vert) for (let r = q.r1; r <= q.r2; r++) co.push([r, q.c1 + L]); else for (let c = q.c1; c <= q.c2; c++) co.push([q.r1 + L, c]); if (!fwd) co.reverse();
    const cells = co.map(([r, c]) => s.cells[K(r, c)]);
    const nums = cells.map(x => x && x.v !== '' && !(typeof x.v === 'string' && x.v[0] === '=') && !isNaN(Number(x.v)) ? Number(x.v) : null);
    const series = cells.length >= 2 && nums.every(x => x !== null), step = series ? (nums[nums.length - 1] - nums[0]) / (nums.length - 1) : 0, last = co[co.length - 1];
    for (let k = 1; k <= n; k++) {
      const tr = last[0] + (vert ? (fwd ? k : -k) : 0), tc = last[1] + (vert ? 0 : (fwd ? k : -k)); if (tr < 0 || tc < 0 || tr >= s.rows || tc >= s.cols) break;
      const j = (k - 1) % cells.length, src = cells[j], [sr, sc] = co[j]; if (!src) { delete s.cells[K(tr, tc)]; continue; }
      let v = src.v;
      if (series) v = +(nums[nums.length - 1] + step * k).toPrecision(12);
      else if (typeof v === 'string' && v[0] === '=') v = Formula.shift(v, tr - sr, tc - sc);
      else if (cells.length === 1 && typeof v === 'string' && /\d+$/.test(v) && isNaN(Number(v))) v = v.replace(/\d+$/, m => String(+m + k).padStart(m.length, '0'));
      s.cells[K(tr, tc)] = { ...src, v };
    }
  }
}
function fillSel(dir) { const q = norm(), s = sh(); snap(); if (dir === 'd') { fillRange({ ...q, r2: q.r1 }, 'd', q.r2 - q.r1); } else fillRange({ ...q, c2: q.c1 }, 'r', q.c2 - q.c1); changed(); }

/* ---------- import / export ---------- */
function toNf(z) { z = z || ''; return /%/.test(z) ? 'p' : /\$/.test(z) ? 'c' : /#,##0\.00/.test(z) ? 'n' : /^0\.00$/.test(z) ? '2' : undefined; }
async function importFile(f) {
  App.busy(true);
  try {
    const isCsv = /\.(csv|tsv|txt)$/i.test(f.name), wb = isCsv ? XLSX.read(await f.text(), { type: 'string' }) : XLSX.read(await f.arrayBuffer(), { type: 'array' }), sheets = []; let big = false;
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name], rg = XLSX.utils.decode_range(ws['!ref'] || 'A1:A1'), cells = {}; let mr = 0, mc = 0;
      if (rg.e.r > 1499 || rg.e.c > 51) big = true;
      for (let r = rg.s.r; r <= Math.min(rg.e.r, 1499); r++) for (let c = rg.s.c; c <= Math.min(rg.e.c, 51); c++) {
        const x = ws[XLSX.utils.encode_cell({ r, c })]; if (!x) continue;
        let v = x.f ? '=' + x.f : x.t === 'n' ? (x.w && /[\/]/.test(x.w) && /[dmy]/i.test(x.z || '') ? x.w : x.v) : x.t === 'b' ? (x.v ? 'TRUE' : 'FALSE') : String(x.v ?? x.w ?? ''); if (v === '') continue;
        const cell = { v }; const nf = toNf(x.z); if (nf) cell.nf = nf; cells[K(r - rg.s.r, c - rg.s.c)] = cell; mr = Math.max(mr, r - rg.s.r + 1); mc = Math.max(mc, c - rg.s.c + 1);
      }
      sheets.push({ name: name.slice(0, 31), cells, rows: Math.max(100, mr + 30), cols: Math.max(26, mc + 2) });
    }
    if (!sheets.length) throw new Error('Empty file'); snap(); T.book = { sheets, cur: 0 }; T.fileId = null; T.name = f.name.replace(/\.[^.]+$/, ''); renderTabs(); rebuild(); select(0, 0); if (big) App.toast(App.t('s_big'));
  } catch (e) { App.toast(App.t('err') + ': ' + e.message, true); } finally { App.busy(false); }
}
function toWs(s) {
  const ws = {}; let mr = 0, mc = 0;
  for (const k in s.cells) {
    const [r, c] = k.split(',').map(Number), cell = s.cells[k], addr = XLSX.utils.encode_cell({ r, c }); let v; try { v = evalVal(s, r, c); } catch (e) { v = e.msg; } if (v === null) continue;
    const o = typeof v === 'number' ? { t: 'n', v } : typeof v === 'boolean' ? { t: 'b', v } : { t: 's', v: String(v) };
    if (typeof cell.v === 'string' && cell.v[0] === '=') o.f = cell.v.slice(1); if (cell.nf && cell.nf !== 'g' && o.t === 'n') o.z = NF[cell.nf]; ws[addr] = o; mr = Math.max(mr, r); mc = Math.max(mc, c);
  }
  ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: mr, c: mc } }); return ws;
}
function buildXlsx() { recalc(); const wb = XLSX.utils.book_new(); T.book.sheets.forEach((s, i) => XLSX.utils.book_append_sheet(wb, toWs(s), (s.name || 'Sheet' + (i + 1)).replace(/[\\\/?*\[\]:]/g, '').slice(0, 31) || 'Sheet' + (i + 1))); return new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }); }
function buildCsv() { recalc(); return new Blob(['\uFEFF' + XLSX.utils.sheet_to_csv(toWs(sh()))], { type: 'text/csv;charset=utf-8' }); }

/* ---------- chart ---------- */
function chartData() {
  const s = sh(), q = norm(), val = (r, c) => { try { return evalVal(s, r, c); } catch (e) { return null; } };
  const multi = q.c2 > q.c1, vc0 = multi ? q.c1 + 1 : q.c1; let hdr = false;
  if (q.r2 > q.r1) { hdr = true; for (let c = vc0; c <= q.c2; c++) if (typeof val(q.r1, c) === 'number') hdr = false; }
  const r0 = hdr ? q.r1 + 1 : q.r1, labels = [], series = [];
  for (let r = r0; r <= q.r2; r++) labels.push(multi ? display(s, r, q.c1).t : String(r - r0 + 1));
  for (let c = vc0; c <= q.c2; c++) { const v = []; for (let r = r0; r <= q.r2; r++) { const x = val(r, c); v.push(typeof x === 'number' ? x : 0); } series.push({ name: hdr ? display(s, q.r1, c).t : CN(c), v }); }
  return { labels, series };
}
const PAL = ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#3b82f6', '#a855f7', '#14b8a6', '#f97316'];
function drawChart(cv, type, d) {
  const W = cv.width = 800, H = cv.height = 500, x = cv.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.font = '15px sans-serif'; x.textBaseline = 'middle';
  if (type === 'pie') {
    const v = d.series[0].v.map(a => Math.max(0, a)), tot = v.reduce((a, b) => a + b, 0) || 1; let ang = -Math.PI / 2;
    v.forEach((a, i) => { const e = ang + a / tot * Math.PI * 2; x.beginPath(); x.moveTo(280, 250); x.arc(280, 250, 200, ang, e); x.closePath(); x.fillStyle = PAL[i % 8]; x.fill(); x.strokeStyle = '#fff'; x.lineWidth = 2; x.stroke(); ang = e; });
    d.labels.slice(0, 16).forEach((l, i) => { x.fillStyle = PAL[i % 8]; x.fillRect(520, 40 + i * 26, 16, 16); x.fillStyle = '#111'; x.textAlign = 'left'; x.fillText(l.slice(0, 18) + ' (' + Math.round(v[i] / tot * 100) + '%)', 544, 49 + i * 26); }); return;
  }
  const L = 64, R = 20, Tp = d.series.length > 1 ? 44 : 24, B = 60, pw = W - L - R, ph = H - Tp - B; let mx = 0, mn = 0; d.series.forEach(s => s.v.forEach(a => { mx = Math.max(mx, a); mn = Math.min(mn, a); })); if (mx === mn) mx = mn + 1;
  const rng = mx - mn, mag = Math.pow(10, Math.floor(Math.log10(rng))), step = rng / mag <= 2 ? mag / 5 : rng / mag <= 5 ? mag / 2 : mag, top = Math.ceil(mx / step) * step, bot = Math.floor(mn / step) * step, y = v => Tp + ph - (v - bot) / (top - bot) * ph;
  x.strokeStyle = '#e5e7eb'; x.fillStyle = '#555'; x.textAlign = 'right'; x.lineWidth = 1; for (let t = bot; t <= top + 1e-9; t += step) { x.beginPath(); x.moveTo(L, y(t)); x.lineTo(W - R, y(t)); x.stroke(); x.fillText(+t.toPrecision(6), L - 6, y(t)); }
  const n = d.labels.length, gw = pw / n; x.textAlign = 'center';
  d.labels.forEach((l, i) => { x.fillStyle = '#333'; x.save(); x.translate(L + gw * (i + .5), H - B + 14); if (n > 12) x.rotate(-.6); x.fillText(l.slice(0, 10), 0, 0); x.restore(); });
  d.series.forEach((s, si) => {
    x.fillStyle = x.strokeStyle = PAL[si % 8];
    if (type === 'bar') { const bw = gw * .8 / d.series.length; s.v.forEach((a, i) => { const bx = L + gw * i + gw * .1 + bw * si; x.fillRect(bx, Math.min(y(a), y(0 < bot ? bot : 0)), bw - 2, Math.abs(y(a) - y(0 < bot ? bot : 0))); }); }
    else { x.lineWidth = 3; x.beginPath(); s.v.forEach((a, i) => { const px = L + gw * (i + .5); i ? x.lineTo(px, y(a)) : x.moveTo(px, y(a)); }); x.stroke(); s.v.forEach((a, i) => { x.beginPath(); x.arc(L + gw * (i + .5), y(a), 4, 0, 7); x.fill(); }); }
    if (d.series.length > 1) { x.fillRect(L + si * 130, 12, 14, 14); x.fillStyle = '#111'; x.textAlign = 'left'; x.fillText(s.name.slice(0, 12), L + si * 130 + 20, 20); }
  });
}
function openChart() {
  const q = norm(); if (q.r1 === q.r2 && q.c1 === q.c2) return App.toast(App.t('s_sel'), true);
  const box = document.createElement('div'), cv = document.createElement('canvas'); cv.className = 'chart';
  box.innerHTML = `<div class="tabs"><button data-k="bar" data-i18n="s_bar"></button><button data-k="line" data-i18n="s_line"></button><button data-k="pie" data-i18n="s_pie"></button></div>`; box.appendChild(cv); App.i18n(box);
  const d = chartData(); let kind = 'bar'; const go = () => { $$('[data-k]', box).forEach(b => b.classList.toggle('on', b.dataset.k === kind)); drawChart(cv, kind, d); };
  $$('[data-k]', box).forEach(b => b.onclick = () => { kind = b.dataset.k; go(); }); go();
  App.modal({ title: App.t('s_chart'), body: box, buttons: [{ label: '\u2B07\uFE0F ' + App.t('s_pngs'), cls: 'ok', fn: () => cv.toBlob(b => App.download(b, 'chart.png')) }, { label: App.t('close'), cls: 'sec', fn: App.closeModal }] });
}

/* ---------- UI ---------- */
function renderTabs() {
  const box = $('#sh-tabs', T.el); box.innerHTML = '';
  T.book.sheets.forEach((s, i) => { const b = document.createElement('button'); b.textContent = s.name; b.className = i === T.book.cur ? 'on' : ''; b.onclick = () => { if (i === T.book.cur) { const n = prompt(App.t('s_rename'), s.name); if (n && n.trim()) { s.name = n.trim().slice(0, 31); renderTabs(); App.touch('sheet'); } } else { T.book.cur = i; T.sel = { r1: 0, c1: 0, r2: 0, c2: 0 }; T.cur = { r: 0, c: 0 }; renderTabs(); buildGrid(); App.touch('sheet'); } }; box.appendChild(b); });
  const add = document.createElement('button'); add.textContent = '+'; add.onclick = () => { T.book.sheets.push({ name: 'Sheet' + (T.book.sheets.length + 1), cells: {}, rows: 100, cols: 26 }); T.book.cur = T.book.sheets.length - 1; T.sel = { r1: 0, c1: 0, r2: 0, c2: 0 }; T.cur = { r: 0, c: 0 }; renderTabs(); buildGrid(); App.touch('sheet'); }; box.appendChild(add);
  const del = document.createElement('button'); del.textContent = '\uD83D\uDDD1'; del.onclick = () => { if (T.book.sheets.length < 2) return; if (!confirm(App.t('s_delsheet'))) return; T.book.sheets.splice(T.book.cur, 1); T.book.cur = 0; renderTabs(); buildGrid(); App.touch('sheet'); }; box.appendChild(del);
}
T.mount = function (el) {
  T.el = el;
  el.innerHTML = `
  <div class="fbar"><div class="nm panel" id="sh-nm" style="margin:0;padding:10px 4px">A1</div><input type="text" id="sh-fx" data-i18n-ph="s_fx" autocomplete="off" autocapitalize="off"></div>
  <div class="tb">
    <button class="btn sec" id="sh-un" title="Undo">&#8630;</button><button class="btn sec" id="sh-b"><b>B</b></button>
    <input type="color" id="sh-tc" value="#dc2626" title="Text color"><input type="color" id="sh-bg" value="#fde68a" title="Fill color">
    <select id="sh-nf"><option value="g" data-i18n="s_g"></option><option value="2" data-i18n="s_2"></option><option value="n" data-i18n="s_n"></option><option value="c" data-i18n="s_c"></option><option value="p" data-i18n="s_p"></option></select><span class="sep"></span>
    <button class="btn sec" id="sh-ar" data-i18n="s_addr"></button><button class="btn sec" id="sh-dr" data-i18n="s_delr"></button><button class="btn sec" id="sh-ac" data-i18n="s_addc"></button><button class="btn sec" id="sh-dc" data-i18n="s_delc"></button><span class="sep"></span>
    <button class="btn sec" id="sh-rm" data-i18n="s_range"></button><button class="btn sec" id="sh-fd">&#11015;&#65039;</button><button class="btn sec" id="sh-fr">&#10145;&#65039;</button><button class="btn sec" id="sh-ch">&#128202; <span data-i18n="s_chart"></span></button><span class="sep"></span>
    <button class="btn sec" id="sh-im">&#128194; <span data-i18n="s_import"></span></button><button class="btn sec" id="sh-xx">xlsx</button><button class="btn sec" id="sh-xc">csv</button><button class="btn sec" id="sh-cl">&#128465;&#65039;</button></div>
  <div class="sheetwrap" id="sh-wrap" tabindex="0"></div><div class="sheettabs" id="sh-tabs"></div>`;
  const $e = s => $(s, el); T.wrap = $e('#sh-wrap');
  T.fh = document.createElement('div'); T.fh.className = 'fillh';
  $e('#sh-fx').onfocus = () => { }; $e('#sh-fx').onchange = e => { snap(); setRaw(T.cur.r, T.cur.c, e.target.value); changed(); };
  $e('#sh-fx').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); e.target.blur(); select(T.cur.r + 1, T.cur.c); } };
  $e('#sh-un').onclick = () => { const p = T.undo.pop(); if (!p) return; T.book = JSON.parse(p); T.cur = { r: Math.min(T.cur.r, sh().rows - 1), c: Math.min(T.cur.c, sh().cols - 1) }; T.sel = { r1: T.cur.r, c1: T.cur.c, r2: T.cur.r, c2: T.cur.c }; renderTabs(); rebuild(); };
  $e('#sh-b').onclick = () => { snap(); const on = !(sh().cells[K(T.cur.r, T.cur.c)] || {}).b; eachSel((r, c) => { const k = K(r, c); const cell = sh().cells[k] ||= { v: '' }; cell.b = on ? 1 : 0; }); changed(); };
  $e('#sh-tc').onchange = e => { snap(); eachSel((r, c) => { (sh().cells[K(r, c)] ||= { v: '' }).c = e.target.value; }); changed(); };
  $e('#sh-bg').onchange = e => { snap(); eachSel((r, c) => { (sh().cells[K(r, c)] ||= { v: '' }).bg = e.target.value; }); changed(); };
  $e('#sh-nf').onchange = e => { snap(); eachSel((r, c) => { (sh().cells[K(r, c)] ||= { v: '' }).nf = e.target.value; }); changed(); };
  $e('#sh-ar').onclick = () => insRow(norm().r2 + 1); $e('#sh-ac').onclick = () => insCol(norm().c2 + 1);
  $e('#sh-dr').onclick = () => { const q = norm(); delRows(q.r1, q.r2); }; $e('#sh-dc').onclick = () => { const q = norm(); delCols(q.c1, q.c2); };
  $e('#sh-rm').onclick = e => { T.rangeMode = !T.rangeMode; e.currentTarget.classList.toggle('on', T.rangeMode); if (T.rangeMode) App.toast(App.t('s_rangeon')); };
  $e('#sh-fd').onclick = () => fillSel('d'); $e('#sh-fr').onclick = () => fillSel('r'); $e('#sh-ch').onclick = openChart;
  $e('#sh-im').onclick = async () => { const [f] = await App.pick('.xlsx,.xls,.csv,.tsv,.ods'); if (f) importFile(f); };
  $e('#sh-xx').onclick = () => { App.download(buildXlsx(), (T.name || 'spreadsheet') + '.xlsx'); }; $e('#sh-xc').onclick = () => App.download(buildCsv(), (sh().name || 'sheet') + '.csv');
  $e('#sh-cl').onclick = () => { snap(); eachSel((r, c) => setRaw(r, c, '')); changed(); };
  /* grid events */
  let pt = 'mouse', drag = false;
  T.wrap.addEventListener('pointerdown', e => {
    pt = e.pointerType; const td = e.target.closest('td[data-r]'); if (!td || e.target.closest('.fillh') || T.editing) return;
    if (pt === 'mouse' && e.button === 0 && !e.shiftKey && !T.rangeMode) { drag = true; T.cur = { r: +td.dataset.r, c: +td.dataset.c }; T.sel = { r1: T.cur.r, c1: T.cur.c, r2: T.cur.r, c2: T.cur.c }; paintSel(); }
  });
  T.wrap.addEventListener('pointermove', e => { if (!drag) return; const o = document.elementFromPoint(e.clientX, e.clientY), td = o && o.closest('td[data-r]'); if (td) { T.sel.r2 = +td.dataset.r; T.sel.c2 = +td.dataset.c; paintSel(); } });
  window.addEventListener('pointerup', () => { drag = false; });
  T.wrap.addEventListener('click', e => {
    const th = e.target.closest('th'); if (th) { if (th.dataset.ch !== undefined) { const c = +th.dataset.ch; T.cur = { r: 0, c }; T.sel = { r1: 0, c1: c, r2: sh().rows - 1, c2: c }; paintSel(); } else if (th.dataset.rh !== undefined) { const r = +th.dataset.rh; T.cur = { r, c: 0 }; T.sel = { r1: r, c1: 0, r2: r, c2: sh().cols - 1 }; paintSel(); } return; }
    const td = e.target.closest('td[data-r]'); if (!td || T.editing) return; const r = +td.dataset.r, c = +td.dataset.c;
    if (e.shiftKey || T.rangeMode) return select(r, c, true);
    if (e.detail >= 2 || (pt !== 'mouse' && T.cur.r === r && T.cur.c === c && norm().r1 === norm().r2 && norm().c1 === norm().c2)) return startEdit(r, c);
    const q = norm(); if (q.r1 === q.r2 && q.c1 === q.c2 && T.cur.r === r && T.cur.c === c) return; select(r, c);
  });
  /* fill handle drag */
  let fill = null;
  T.fh.addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); T.fh.setPointerCapture(e.pointerId); fill = { q: norm(), ext: null }; });
  T.fh.addEventListener('pointermove', e => {
    if (!fill) return; $$('td.fillp', T.tb).forEach(x => x.classList.remove('fillp')); const o = document.elementFromPoint(e.clientX, e.clientY), td = o && o.closest('td[data-r]'); if (!td) return;
    const tr = +td.dataset.r, tc = +td.dataset.c, q = fill.q, dr = tr > q.r2 ? tr - q.r2 : tr < q.r1 ? tr - q.r1 : 0, dc = tc > q.c2 ? tc - q.c2 : tc < q.c1 ? tc - q.c1 : 0;
    if (!dr && !dc) { fill.ext = null; return; }
    if (Math.abs(dr) >= Math.abs(dc)) { fill.ext = { dir: dr > 0 ? 'd' : 'u', n: Math.abs(dr) }; const a = dr > 0 ? q.r2 + 1 : tr, b = dr > 0 ? tr : q.r1 - 1; for (let r = a; r <= b; r++) for (let c = q.c1; c <= q.c2; c++) { const t = tdAt(r, c); t && t.classList.add('fillp'); } }
    else { fill.ext = { dir: dc > 0 ? 'r' : 'l', n: Math.abs(dc) }; const a = dc > 0 ? q.c2 + 1 : tc, b = dc > 0 ? tc : q.c1 - 1; for (let c = a; c <= b; c++) for (let r = q.r1; r <= q.r2; r++) { const t = tdAt(r, c); t && t.classList.add('fillp'); } }
  });
  const fe = () => { if (!fill) return; $$('td.fillp', T.tb).forEach(x => x.classList.remove('fillp')); const f = fill; fill = null; if (!f.ext) return; snap(); fillRange(f.q, f.ext.dir, f.ext.n); const q = f.q, n = f.ext.n; T.sel = { r1: f.ext.dir === 'u' ? q.r1 - n : q.r1, r2: f.ext.dir === 'd' ? q.r2 + n : q.r2, c1: f.ext.dir === 'l' ? q.c1 - n : q.c1, c2: f.ext.dir === 'r' ? q.c2 + n : q.c2 }; changed(); };
  T.fh.addEventListener('pointerup', fe); T.fh.addEventListener('pointercancel', fe);
  document.addEventListener('keydown', e => {
    if (App.cur !== 'sheet' || T.editing || /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName) || !$('#modal').classList.contains('hidden')) return;
    const { r, c } = T.cur, ex = e.shiftKey, k = e.key;
    if (k === 'ArrowDown') select(r + 1, c, ex), e.preventDefault(); else if (k === 'ArrowUp') select(r - 1, c, ex), e.preventDefault(); else if (k === 'ArrowLeft') select(r, c - 1, ex), e.preventDefault(); else if (k === 'ArrowRight' || k === 'Tab') select(r, c + 1, ex), e.preventDefault();
    else if (k === 'Enter' || k === 'F2') { startEdit(r, c); e.preventDefault(); } else if (k === 'Delete' || k === 'Backspace') { snap(); eachSel((rr, cc) => setRaw(rr, cc, '')); changed(); e.preventDefault(); }
    else if (k.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) { startEdit(r, c, k); e.preventDefault(); }
  });
  renderTabs(); buildGrid(); select(0, 0);
};
T.hasContent = () => T.book.sheets.some(s => Object.keys(s.cells).length > 0);
T.exportFile = async function () { recalc(); return { id: T.fileId ||= App.uid(), name: T.name || 'spreadsheet', ext: 'xlsx', blob: buildXlsx(), state: { book: T.book, name: T.name } }; };
T.getState = () => ({ book: T.book, name: T.name, fileId: T.fileId, sel: T.cur });
T.setState = function (s) { if (!s.book) return; T.book = s.book; T.name = s.name || ''; T.fileId = s.fileId || null; T.undo = []; recalc(); if (T.wrap) { renderTabs(); buildGrid(); select(0, 0); } };
T.openFile = async function (r) { if (r.state && r.state.book) { T.setState({ ...r.state, fileId: r.id }); T.name = r.name; } else { const f = new File([r.blob], r.name + '.' + r.ext); await importFile(f); } };
T.onShow = () => { if (T.wrap) paint(); };
T.onLang = () => { };
App.reg('sheet', T);
})();
