// RAM viewer: read-only watch list and hex dump of the running game's work RAM.
//
// It never writes to the emulator, so it cannot change the game or desync an online match.
// Genesis work RAM is $FF0000-$FFFFFF (64 KiB, big-endian values); SNES work RAM is
// $7E0000-$7FFFFF (128 KiB, little-endian values). Short addresses such as 1234 are treated
// as offsets from the start of work RAM. Genesis NHL '94 variable names (p1_2_x ...) also work.
(function () {
  'use strict';

  var PLATFORMS = {
    genesis: { base: 0xFF0000, size: 0x10000, big: true },
    snes: { base: 0x7E0000, size: 0x20000, big: false }
  };
  var TYPES = {
    u8: { n: 1, signed: false }, s8: { n: 1, signed: true },
    u16: { n: 2, signed: false }, s16: { n: 2, signed: true },
    u32: { n: 4, signed: false }
  };
  var RETRO_TYPE = { '|u1': 'u8', '|i1': 's8', '>u2': 'u16', '>i2': 's16', '>u4': 'u32' };
  var DUMP_BYTES = 128;

  var state = {
    watches: [], nextId: 1, frozen: false, dumpAddr: null, dumpText: '',
    platform: null, names: null, targets: [], timer: null, popup: null, prev: {}
  };

  function arena() { return globalThis.__arena || null; }
  function hex(n, w) { var s = n.toString(16).toUpperCase(); while (s.length < w) s = '0' + s; return s; }
  function storeKey() { return 'nhl94online-ramwatch-' + state.platform; }
  function save() {
    try { localStorage.setItem(storeKey(), JSON.stringify(state.watches.map(function (w) { return { label: w.label, addr: w.addr, type: w.type }; }))); } catch (e) {}
  }
  function load() {
    state.watches = [];
    try {
      var list = JSON.parse(localStorage.getItem(storeKey()) || '[]');
      list.forEach(function (w) { if (w && TYPES[w.type] && typeof w.addr === 'number') state.watches.push({ id: state.nextId++, label: String(w.label || '').slice(0, 30), addr: w.addr, type: w.type }); });
    } catch (e) {}
  }

  // Resolve what the player typed to a full work-RAM address.
  function normalise(a, p) {
    var cfg = PLATFORMS[p];
    if (a >= 0 && a < cfg.size && (p === 'genesis' || a < cfg.size)) return cfg.base + a;
    if (p === 'genesis' && a >= 0xE00000 && a <= 0xFFFFFF) return cfg.base | (a & 0xFFFF);
    if (a >= cfg.base && a < cfg.base + cfg.size) return a;
    return null;
  }
  function parseAddress(text, p) {
    var t = String(text || '').trim();
    if (!t) return { error: 'Type an address such as FF1234 or a variable name.' };
    if (p === 'genesis' && state.names) {
      var key = t.toLowerCase();
      if (state.names[key]) {
        var nm = state.names[key];
        return { addr: nm.addr, type: nm.type, label: key };
      }
    }
    var h = t.replace(/^\$/, '').replace(/^0x/i, '').replace(/h$/i, '');
    if (!/^[0-9a-f]{1,6}$/i.test(h)) return { error: 'Not a hex address or known name.' };
    var full = normalise(parseInt(h, 16), p);
    if (full === null) {
      var cfg = PLATFORMS[p];
      return { error: 'Outside work RAM ($' + hex(cfg.base, 6) + '-$' + hex(cfg.base + cfg.size - 1, 6) + ').' };
    }
    return { addr: full };
  }

  function readBytes(emu, addr, n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(emu.byte(addr + i) & 0xFF);
    return out;
  }
  function valueOf(bytes, type, big) {
    var t = TYPES[type], v = 0, i;
    if (big) { for (i = 0; i < t.n; i++) v = v * 256 + bytes[i]; }
    else { for (i = t.n - 1; i >= 0; i--) v = v * 256 + bytes[i]; }
    if (t.signed) { var lim = Math.pow(2, 8 * t.n - 1); if (v >= lim) v -= lim * 2; }
    return v;
  }

  var CSS = '' +
    '.rv{font:13px/1.35 Arial,Helvetica,sans-serif;color:#101b31}' +
    '.rv form{display:flex;flex-wrap:wrap;gap:.4rem;margin:.4rem 0}' +
    '.rv input,.rv select,.rv button{font:inherit;padding:.3rem .45rem;border:1px solid #cbd5e1;border-radius:5px;background:#fff}' +
    '.rv input.addr{width:9.5em}.rv input.lbl{width:7em}' +
    '.rv button{cursor:pointer}.rv button:hover{background:#eef2f7}' +
    '.rv .err{color:#b91c1c;min-height:1.2em;margin:0 0 .3rem}' +
    '.rv table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}' +
    '.rv th,.rv td{text-align:left;padding:.2rem .4rem;border-bottom:1px solid #e2e8f0}' +
    '.rv th{font-size:.8em;color:#657080;font-weight:700;letter-spacing:.04em}' +
    '.rv td.num{font-family:ui-monospace,Menlo,Consolas,monospace}' +
    '.rv .chg{background:#fde68a}.rv .empty{color:#657080;padding:.5rem 0}' +
    '.rv pre{margin:.3rem 0;font:12px/1.5 ui-monospace,Menlo,Consolas,monospace;overflow-x:auto}' +
    '.rv pre b{background:#fde68a;font-weight:400}.rv h4{margin:.8rem 0 .2rem;font-size:.85em;letter-spacing:.04em;color:#657080}' +
    '.rv .x{border:0;background:none;color:#657080;padding:0 .3rem}.rv .tools{display:flex;gap:.8rem;align-items:center;flex-wrap:wrap;margin:.3rem 0}';

  // Build the viewer inside `root` (a container in either this page or the pop-out window).
  function build(doc, root) {
    var t = { doc: doc, root: root, rows: {} };
    root.className = 'rv';
    function el(tag, cls, text) { var e = doc.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

    var form = el('form'), addr = el('input', 'addr'), lbl = el('input', 'lbl'), type = el('select'), add = el('button', '', 'Watch');
    addr.placeholder = 'Address or name'; addr.setAttribute('aria-label', 'RAM address or variable name'); addr.setAttribute('list', 'rv-names-' + (doc === document ? 'm' : 'p')); addr.autocomplete = 'off';
    lbl.placeholder = 'Label (optional)'; lbl.maxLength = 30; lbl.setAttribute('aria-label', 'Label');
    type.setAttribute('aria-label', 'Value type');
    [['u8', '8-bit'], ['s8', '8-bit signed'], ['u16', '16-bit'], ['s16', '16-bit signed'], ['u32', '32-bit']].forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; type.appendChild(op); });
    type.value = 'u16'; add.type = 'submit';
    var dl = el('datalist'); dl.id = 'rv-names-' + (doc === document ? 'm' : 'p'); t.datalist = dl;
    form.appendChild(addr); form.appendChild(type); form.appendChild(lbl); form.appendChild(add); form.appendChild(dl);
    var err = el('p', 'err'); err.setAttribute('role', 'alert');
    var tools = el('div', 'tools'), freeze = el('label'), fcb = el('input'), clear = el('button', '', 'Clear all');
    fcb.type = 'checkbox'; fcb.checked = state.frozen; freeze.appendChild(fcb); freeze.appendChild(doc.createTextNode(' Freeze display'));
    clear.type = 'button'; tools.appendChild(freeze); tools.appendChild(clear);
    var info = el('p', 'empty'), table = el('table'), head = el('thead'), body = el('tbody');
    var hr = el('tr'); ['NAME', 'ADDRESS', 'TYPE', 'DECIMAL', 'HEX', ''].forEach(function (h) { hr.appendChild(el('th', '', h)); });
    head.appendChild(hr); table.appendChild(head); table.appendChild(body);
    var h4 = el('h4', '', 'MEMORY DUMP'), dform = el('form'), daddr = el('input', 'addr'), dgo = el('button', '', 'Show 128 bytes'), dump = el('pre');
    daddr.placeholder = 'Start address'; daddr.setAttribute('aria-label', 'Dump start address'); daddr.autocomplete = 'off'; dgo.type = 'submit';
    daddr.value = state.dumpText;
    dform.appendChild(daddr); dform.appendChild(dgo);
    [form, err, tools, info, table, h4, dform, dump].forEach(function (n) { root.appendChild(n); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var r = parseAddress(addr.value, state.platform);
      if (r.error) { err.textContent = r.error; return; }
      var ty = r.type || type.value, name = lbl.value.trim() || r.label || '';
      var size = TYPES[ty].n, cfg = PLATFORMS[state.platform];
      if (r.addr + size > cfg.base + cfg.size) { err.textContent = 'That value runs past the end of work RAM.'; return; }
      err.textContent = '';
      state.watches.push({ id: state.nextId++, label: name.slice(0, 30), addr: r.addr, type: ty });
      save(); addr.value = ''; lbl.value = ''; renderAll();
    });
    clear.addEventListener('click', function () { state.watches = []; save(); renderAll(); });
    fcb.addEventListener('change', function () { state.frozen = fcb.checked; state.targets.forEach(function (o) { o.fcb.checked = state.frozen; }); });
    dform.addEventListener('submit', function (ev) {
      ev.preventDefault();
      state.dumpText = daddr.value;
      if (!daddr.value.trim()) { state.dumpAddr = null; err.textContent = ''; return; }
      var r = parseAddress(daddr.value, state.platform);
      if (r.error) { err.textContent = r.error; return; }
      var cfg = PLATFORMS[state.platform];
      state.dumpAddr = Math.min(r.addr, cfg.base + cfg.size - DUMP_BYTES); err.textContent = '';
      state.targets.forEach(function (o) { if (o.daddr !== daddr) o.daddr.value = state.dumpText; });
      state.prev.dump = null; update();
    });
    body.addEventListener('click', function (ev) {
      var id = ev.target && ev.target.getAttribute && ev.target.getAttribute('data-del');
      if (!id) return;
      state.watches = state.watches.filter(function (w) { return String(w.id) !== id; });
      save(); renderAll();
    });

    t.body = body; t.info = info; t.dump = dump; t.err = err; t.fcb = fcb; t.daddr = daddr; t.table = table; t.addrInput = addr;
    return t;
  }

  function fillNames(t) {
    t.datalist.textContent = '';
    if (state.platform !== 'genesis' || !state.names) return;
    Object.keys(state.names).sort().forEach(function (k) { var o = t.doc.createElement('option'); o.value = k; t.datalist.appendChild(o); });
  }

  // Rebuild the watch-list rows (after add/remove).
  function renderAll() {
    state.targets = state.targets.filter(function (t) { return !t.closed || !t.closed(); });
    state.targets.forEach(function (t) {
      t.body.textContent = ''; t.rows = {};
      state.watches.forEach(function (w) {
        var doc = t.doc, tr = doc.createElement('tr'), cells = {};
        function td(cls, text) { var c = doc.createElement('td'); if (cls) c.className = cls; c.textContent = text; tr.appendChild(c); return c; }
        td('', w.label || '—'); td('num', '$' + hex(w.addr, 6)); td('', w.type.toUpperCase().replace('U', 'u').replace('S', 's'));
        cells.dec = td('num', ''); cells.hex = td('num', '');
        var x = doc.createElement('td'), b = doc.createElement('button');
        b.className = 'x'; b.type = 'button'; b.textContent = '✕'; b.title = 'Remove'; b.setAttribute('aria-label', 'Remove watch'); b.setAttribute('data-del', String(w.id));
        x.appendChild(b); tr.appendChild(x); t.body.appendChild(tr); t.rows[w.id] = cells;
      });
      t.table.style.display = state.watches.length ? '' : 'none';
    });
    state.prev = {}; update();
  }

  function update() {
    state.targets = state.targets.filter(function (t) { return !(t.closed && t.closed()); });
    var a = arena(), emu = a && a.emu, cfg = PLATFORMS[state.platform];
    var ready = !!(emu && cfg && typeof emu.byte === 'function');
    state.targets.forEach(function (t) {
      t.info.style.display = (ready && state.watches.length) ? 'none' : '';
      t.info.textContent = !ready ? 'Start a game and the values will appear here.' : 'Add an address above to start watching it.';
    });
    if (!ready || state.frozen) return;
    state.watches.forEach(function (w) {
      var bytes = readBytes(emu, w.addr, TYPES[w.type].n), v = valueOf(bytes, w.type, cfg.big);
      var hx = (v < 0 ? '-' : '') + '$' + hex(Math.abs(v), TYPES[w.type].n * 2);
      var changed = state.prev[w.id] !== undefined && state.prev[w.id] !== v;
      state.prev[w.id] = v;
      state.targets.forEach(function (t) {
        var c = t.rows[w.id]; if (!c) return;
        c.dec.textContent = String(v); c.hex.textContent = hx;
        if (changed) { c.dec.className = c.hex.className = 'num chg'; t.doc.defaultView.setTimeout(function () { c.dec.className = c.hex.className = 'num'; }, 300); }
      });
    });
    if (state.dumpAddr !== null) {
      var start = state.dumpAddr, bytes2 = readBytes(emu, start, DUMP_BYTES), old = state.prev.dump;
      state.prev.dump = bytes2;
      state.targets.forEach(function (t) {
        var d = t.dump; d.textContent = '';
        for (var row = 0; row < DUMP_BYTES / 16; row++) {
          d.appendChild(t.doc.createTextNode('$' + hex(start + row * 16, 6) + '  '));
          for (var i = 0; i < 16; i++) {
            var idx = row * 16 + i, s = hex(bytes2[idx], 2);
            if (old && old[idx] !== bytes2[idx]) { var b = t.doc.createElement('b'); b.textContent = s; d.appendChild(b); d.appendChild(t.doc.createTextNode(' ')); }
            else d.appendChild(t.doc.createTextNode(s + ' '));
            if (i === 7) d.appendChild(t.doc.createTextNode(' '));
          }
          d.appendChild(t.doc.createTextNode('\n'));
        }
      });
    } else state.targets.forEach(function (t) { t.dump.textContent = ''; });
  }

  // Follow the loaded system: load that system's saved watch list and names.
  function syncPlatform() {
    var a = arena(), p = a && a.platform;
    if (!PLATFORMS[p]) p = state.platform || 'genesis';
    if (p === state.platform) return;
    state.platform = p; state.dumpAddr = null; state.dumpText = '';
    state.targets.forEach(function (t) { t.daddr.value = ''; });
    load();
    if (p === 'genesis' && !state.names) {
      import('./game/ramvars.js').then(function (m) {
        var names = {};
        Object.keys(m.default).forEach(function (k) {
          var d = m.default[k], ty = RETRO_TYPE[d[1]];
          if (ty) names[k.toLowerCase()] = { addr: d[0], type: ty };
        });
        state.names = names; state.targets.forEach(fillNames);
      }).catch(function () {});
    }
    state.targets.forEach(fillNames);
    renderAll();
  }

  function tick() { syncPlatform(); update(); }
  function start() { if (!state.timer) state.timer = setInterval(tick, 100); }

  function mountInPage() {
    var host = document.getElementById('ram-viewer-body');
    if (!host) return;
    var style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);
    state.platform = null;
    var t = build(document, host); state.targets.push(t); fillNames(t);
    var pop = document.getElementById('ram-popout');
    if (pop) pop.addEventListener('click', popOut);
    syncPlatform(); start();
  }

  function popOut() {
    var w = state.popup;
    if (w && !w.closed) { w.focus(); return; }
    w = window.open('', 'nhl94online-ramviewer', 'width=520,height=640,resizable=yes,scrollbars=yes');
    if (!w) { alert('The pop-up was blocked. Allow pop-ups for this site, or use the RAM viewer section on the page.'); return; }
    state.popup = w;
    w.document.open();
    w.document.write('<!doctype html><meta charset="utf-8"><title>RAM viewer</title><style>body{margin:12px;background:#fff}' + CSS + '</style><div id="root"></div>');
    w.document.close();
    var t = build(w.document, w.document.getElementById('root'));
    t.closed = function () { return w.closed; };
    state.targets.push(t); fillNames(t); renderAll();
    w.addEventListener('pagehide', function () { state.targets = state.targets.filter(function (o) { return o !== t; }); });
    var details = document.getElementById('ram-viewer');
    if (details) details.open = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountInPage);
  else mountInPage();
})();
