/* Small spreadsheet formula engine - Developed by Nahin */
(function (root) {
  class FErr { constructor(m) { this.msg = m; } toString() { return this.msg; } }
  const colNum = s => { let n = 0; for (const ch of s.toUpperCase()) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
  const colName = n => { let s = ''; n++; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };
  const parseRef = s => { const m = s.match(/^(\$?)([A-Za-z]+)(\$?)(\d+)$/); return { c: colNum(m[2]), r: +m[4] - 1, ac: !!m[1], ar: !!m[3] }; };
  const REFRE = /("(?:[^"]|"")*")|(^|[^A-Za-z0-9_$.])(\$?)([A-Za-z]{1,3})(\$?)(\d+)(?![A-Za-z0-9_(])/g;
  function mapRefs(f, fn) {
    return f.replace(REFRE, (m, str, pre, d1, L, d2, N) => {
      if (str) return str; const r = fn({ r: +N - 1, c: colNum(L), ac: !!d1, ar: !!d2 });
      return pre + (r ? (r.ac ? '$' : '') + colName(r.c) + (r.ar ? '$' : '') + (r.r + 1) : '#REF!');
    });
  }
  const shift = (f, dr, dc) => mapRefs(f, x => { const r = x.ar ? x.r : x.r + dr, c = x.ac ? x.c : x.c + dc; return r < 0 || c < 0 ? null : { ...x, r, c }; });

  const TOK = /\s*(?:(\d+\.?\d*(?:[eE][+-]?\d+)?|\.\d+)|"((?:[^"]|"")*)"|(#REF!)|(\$?[A-Za-z]{1,3}\$?\d+)(?::(\$?[A-Za-z]{1,3}\$?\d+))?(?![A-Za-z0-9_(])|([A-Za-z_][A-Za-z0-9_.]*)|(<=|>=|<>|[-+*\/^&=<>(),%]))/y;
  function tokenize(s) {
    const out = []; let i = 0;
    while (i < s.length) {
      TOK.lastIndex = i; const m = TOK.exec(s);
      if (!m) { if (/^\s*$/.test(s.slice(i))) break; throw new FErr('#ERR!'); }
      i = TOK.lastIndex;
      if (m[1] !== undefined) out.push({ t: 'n', v: parseFloat(m[1]) });
      else if (m[2] !== undefined) out.push({ t: 's', v: m[2].replace(/""/g, '"') });
      else if (m[3]) out.push({ t: 'e' });
      else if (m[4]) out.push({ t: 'r', a: parseRef(m[4]), b: m[5] ? parseRef(m[5]) : null });
      else if (m[6]) out.push({ t: 'f', v: m[6].toUpperCase() });
      else out.push({ t: 'o', v: m[7] });
    }
    return out;
  }
  const first = v => Array.isArray(v) ? (v.length ? v[0] : null) : v;
  const num = v => { v = first(v); if (typeof v === 'number') return v; if (v === null || v === '') return 0; if (typeof v === 'boolean') return v ? 1 : 0; const n = Number(v); if (isNaN(n)) throw new FErr('#VALUE!'); return n; };
  const str = v => { v = first(v); return v === null ? '' : typeof v === 'boolean' ? (v ? 'TRUE' : 'FALSE') : String(v); };
  const truthy = v => { v = first(v); if (typeof v === 'string') return v !== '' && v.toUpperCase() !== 'FALSE'; return !!v; };
  const flat = (a, c) => { const o = []; for (const f of a) { const v = f(c); if (Array.isArray(v)) for (const x of v) o.push(x); else o.push(v); } return o; };
  const nums = (a, c) => flat(a, c).filter(x => typeof x === 'number');
  function cmp(a, b, op) {
    a = first(a); b = first(b); if (a === null) a = typeof b === 'string' ? '' : 0; if (b === null) b = typeof a === 'string' ? '' : 0;
    if (typeof a === 'string' && typeof b === 'string') { a = a.toLowerCase(); b = b.toLowerCase(); }
    else if (typeof a !== typeof b) { const k = x => typeof x === 'number' ? 0 : typeof x === 'string' ? 1 : 2; a = k(a); b = k(b); }
    return op === '=' ? a === b : op === '<>' ? a !== b : op === '<' ? a < b : op === '>' ? a > b : op === '<=' ? a <= b : a >= b;
  }
  const F = {
    SUM: (a, c) => nums(a, c).reduce((x, y) => x + y, 0),
    AVERAGE: (a, c) => { const n = nums(a, c); if (!n.length) throw new FErr('#DIV/0!'); return n.reduce((x, y) => x + y, 0) / n.length; },
    MIN: (a, c) => { const n = nums(a, c); return n.length ? Math.min(...n) : 0; },
    MAX: (a, c) => { const n = nums(a, c); return n.length ? Math.max(...n) : 0; },
    COUNT: (a, c) => nums(a, c).length,
    COUNTA: (a, c) => flat(a, c).filter(x => x !== null && x !== '').length,
    PRODUCT: (a, c) => nums(a, c).reduce((x, y) => x * y, 1),
    IF: (a, c) => truthy(a[0](c)) ? (a[1] ? a[1](c) : true) : (a[2] ? a[2](c) : false),
    ROUND: (a, c) => { const m = Math.pow(10, a[1] ? num(a[1](c)) : 0); return Math.round(num(a[0](c)) * m) / m; },
    ABS: (a, c) => Math.abs(num(a[0](c))),
    SQRT: (a, c) => { const v = num(a[0](c)); if (v < 0) throw new FErr('#NUM!'); return Math.sqrt(v); },
    POWER: (a, c) => Math.pow(num(a[0](c)), num(a[1](c))),
    MOD: (a, c) => { const d = num(a[1](c)); if (!d) throw new FErr('#DIV/0!'); const n = num(a[0](c)); return n - d * Math.floor(n / d); },
    AND: (a, c) => flat(a, c).every(truthy), OR: (a, c) => flat(a, c).some(truthy), NOT: (a, c) => !truthy(a[0](c)),
    CONCAT: (a, c) => flat(a, c).map(str).join(''), LEN: (a, c) => str(a[0](c)).length,
    UPPER: (a, c) => str(a[0](c)).toUpperCase(), LOWER: (a, c) => str(a[0](c)).toLowerCase(), TRIM: (a, c) => str(a[0](c)).trim().replace(/\s+/g, ' '),
    TRUE: () => true, FALSE: () => false, PI: () => Math.PI,
  };
  F.CONCATENATE = F.CONCAT;

  function build(src) {
    const t = tokenize(src.replace(/^=/, '')); let p = 0;
    const isOp = (...v) => t[p] && t[p].t === 'o' && v.includes(t[p].v);
    const need = v => { if (!isOp(v)) throw new FErr('#ERR!'); p++; };
    function cmpE() { let l = cat(); while (isOp('=', '<>', '<', '>', '<=', '>=')) { const op = t[p++].v, L = l, R = cat(); l = c => cmp(L(c), R(c), op); } return l; }
    function cat() { let l = add(); while (isOp('&')) { p++; const L = l, R = add(); l = c => str(L(c)) + str(R(c)); } return l; }
    function add() { let l = mul(); while (isOp('+', '-')) { const op = t[p++].v, L = l, R = mul(); l = op === '+' ? c => num(L(c)) + num(R(c)) : c => num(L(c)) - num(R(c)); } return l; }
    function mul() { let l = pow(); while (isOp('*', '/')) { const op = t[p++].v, L = l, R = pow(); l = op === '*' ? c => num(L(c)) * num(R(c)) : c => { const d = num(R(c)); if (!d) throw new FErr('#DIV/0!'); return num(L(c)) / d; }; } return l; }
    function pow() { let l = un(); while (isOp('^')) { p++; const L = l, R = un(); l = c => Math.pow(num(L(c)), num(R(c))); } return l; }
    function un() { if (isOp('-')) { p++; const x = un(); return c => -num(x(c)); } if (isOp('+')) { p++; return un(); } return post(); }
    function post() { let l = prim(); while (isOp('%')) { p++; const L = l; l = c => num(L(c)) / 100; } return l; }
    function prim() {
      const k = t[p++]; if (!k) throw new FErr('#ERR!');
      if (k.t === 'n') return () => k.v; if (k.t === 's') return () => k.v; if (k.t === 'e') return () => { throw new FErr('#REF!'); };
      if (k.t === 'r') {
        if (!k.b) return c => c.cell(k.a.r, k.a.c);
        const r1 = Math.min(k.a.r, k.b.r), r2 = Math.max(k.a.r, k.b.r), c1 = Math.min(k.a.c, k.b.c), c2 = Math.max(k.a.c, k.b.c); return c => c.range(r1, c1, r2, c2);
      }
      if (k.t === 'f') {
        if (isOp('(')) {
          p++; const args = []; if (!isOp(')')) { do { args.push(isOp(',', ')') ? () => null : cmpE()); } while (isOp(',') && ++p); } need(')');
          const fn = F[k.v]; if (!fn) throw new FErr('#NAME?'); return c => fn(args, c);
        }
        if (k.v === 'TRUE') return () => true; if (k.v === 'FALSE') return () => false; throw new FErr('#NAME?');
      }
      if (k.v === '(') { const e = cmpE(); need(')'); return e; }
      throw new FErr('#ERR!');
    }
    const f = cmpE(); if (p < t.length) throw new FErr('#ERR!'); return f;
  }
  const cache = new Map();
  function compile(src) {
    let f = cache.get(src);
    if (!f) { try { f = build(src); } catch (e) { const er = e instanceof FErr ? e : new FErr('#ERR!'); f = () => { throw er; }; } if (cache.size > 5000) cache.clear(); cache.set(src, f); }
    return f;
  }
  root.Formula = { compile, FErr, colNum, colName, mapRefs, shift, parseRef };
  if (typeof module !== 'undefined') module.exports = root.Formula;
})(typeof window !== 'undefined' ? window : globalThis);
