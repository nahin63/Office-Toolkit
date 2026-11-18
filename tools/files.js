/* My Files - Developed by Nahin */
(() => {
App.addLang({ f_all: 'All', f_image: 'Images', f_pdf: 'PDF', f_doc: 'Docs', f_sheet: 'Sheets', f_slides: 'Slides', f_empty: 'No saved files yet. Press the green Save button inside any tool.', f_search: 'Search files...', f_ren: 'New name:', f_del: 'Delete this file permanently?', f_used: 'Stored on this device' },
  { f_all: 'সব', f_image: 'ছবি', f_pdf: 'পিডিএফ', f_doc: 'ডক', f_sheet: 'শিট', f_slides: 'স্লাইড', f_empty: 'এখনো কোনো ফাইল সেভ হয়নি। যেকোনো টুলে সবুজ সেভ বাটন চাপুন।', f_search: 'ফাইল খুঁজুন...', f_ren: 'নতুন নাম:', f_del: 'ফাইলটি চিরতরে মুছবেন?', f_used: 'এই ডিভাইসে জমা আছে' });
const ICON = { image: '\uD83D\uDDBC\uFE0F', pdf: '\uD83D\uDCC4', doc: '\uD83D\uDCDD', sheet: '\uD83D\uDCCA', slides: '\uD83C\uDFAC' };
const T = {
  filter: 'all', q: '',
  mount(el) {
    T.el = el;
    el.innerHTML = `<div class="tabs" id="fl-tabs">${['all', 'image', 'pdf', 'doc', 'sheet', 'slides'].map(k => `<button data-k="${k}" data-i18n="f_${k}"></button>`).join('')}</div>
      <input type="text" id="fl-q" data-i18n-ph="f_search" style="margin-bottom:10px"><div class="list" id="fl-list"></div><p class="muted" id="fl-use" style="text-align:center;margin-top:14px"></p>`;
    $$('[data-k]', el).forEach(b => b.onclick = () => { T.filter = b.dataset.k; T.render(); });
    $('#fl-q', el).oninput = e => { T.q = e.target.value.toLowerCase(); T.render(); };
  },
  async render() {
    const el = T.el; $$('[data-k]', el).forEach(b => b.classList.toggle('on', b.dataset.k === T.filter));
    let files = await App.DB.all('files'); files.sort((a, b) => b.updated - a.updated);
    files = files.filter(f => (T.filter === 'all' || f.type === T.filter) && (!T.q || (f.name + '.' + f.ext).toLowerCase().includes(T.q)));
    const L = $('#fl-list', el); L.innerHTML = files.length ? '' : `<div class="empty">&#128193;<br>${App.t('f_empty')}</div>`;
    files.forEach(f => {
      const d = document.createElement('div'); d.className = 'item'; d.style.flexWrap = 'wrap';
      d.innerHTML = `<div class="ftype">${ICON[f.type] || '\uD83D\uDCC4'}</div><div class="meta"><b>${App.esc(f.name)}.${App.esc(f.ext)}</b><span class="stat">${App.fmtSize(f.size)} &middot; ${new Date(f.updated).toLocaleString()}</span></div>
      <div class="row" style="width:100%"><button class="btn sm grow" data-a="o">&#128194; ${App.t('open')}</button><button class="btn sec sm" data-a="r">&#9998;&#65039;</button><button class="btn ok sm" data-a="d">&#11015;&#65039;</button><button class="btn red sm" data-a="x">&#128465;&#65039;</button></div>`;
      d.onclick = async e => {
        const a = e.target.closest('button'); if (!a) return;
        try {
          if (a.dataset.a === 'o') { await App.go(f.type); await App.tools[f.type].openFile(f); }
          else if (a.dataset.a === 'r') { const n = prompt(App.t('f_ren'), f.name); if (n && n.trim()) { f.name = n.trim(); await App.DB.put('files', f); T.render(); } }
          else if (a.dataset.a === 'd') App.download(f.blob, f.name + '.' + f.ext);
          else if (a.dataset.a === 'x') { if (confirm(App.t('f_del'))) { await App.DB.del('files', f.id); T.render(); } }
        } catch (err) { App.toast(App.t('err') + ': ' + err.message, true); }
      };
      L.appendChild(d);
    });
    try { const e = await navigator.storage.estimate(); $('#fl-use', el).textContent = App.t('f_used') + ': ' + App.fmtSize(e.usage); } catch (x) { }
  },
  onShow() { T.render(); },
  onLang() { T.render(); },
  hasContent: () => false,
};
App.reg('files', T);
})();
