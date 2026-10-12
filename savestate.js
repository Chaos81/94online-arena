// Save states for the arena (Genesis, SNES and the other cores share the same code).
//
// Adds "Save state" and "Load state" buttons to the SAVES & LEAGUE STATS group, plus
// matching buttons in full screen.  Keyboard: [ = save state,  ] = load state.
//   Save state  -> downloads a .state file at any point in a match
//   Load state  -> pick a .state file to restore it
//
// LOCAL matches: either button works any time a match is running.
// ONLINE matches:
//   * Either player can save (it saves the last state BOTH players have confirmed,
//     so the file is identical no matter who saves it).
//   * Only the HOST can load.  The host sends the state to the guest; both games pause,
//     load the same state, rebuild their rollback sessions and resume together.
//   * The transfer can be cancelled safely at any point before the host loads
//     (nothing changes and both games carry on).  A failure after that stops the match
//     instead of risking a silent desync.
//
// Every state is checked against the current match with the site's own
// system, emulator build and size before it is used.
//
// File layout (.state):
//   bytes 0-3   magic "NHLS"
//   bytes 4-7   header length N (uint32, big endian)
//   next N      JSON header (ROM hash, core version, platform, teams, frame ...)
//   remainder   raw emulator state exactly as the core produced it
(function () {
  'use strict';

  var MAGIC = [0x4e, 0x48, 0x4c, 0x53]; // "NHLS"
  var FORMAT = 1;
  var CHUNK = 9000;             // raw bytes per network message (12,000 base64 chars; the lobby limit is 16,384)
  var OFFER_TIMEOUT = 15000;    // host waits this long for the guest to accept
  var HOST_TIMEOUT = 30000;     // host: accepted -> guest ready
  var GUEST_TIMEOUT = 60000;    // guest: accepted -> host says go (longer, so the host's cancel arrives first)
  var api = null, xfer = null;
  var saveBtn, loadBtn, saveFs, loadFs, fileInput, msg, toast, msgTimer, toastTimer;

  function hook() { return globalThis.__arena || null; }

  function say(text, isError) {
    if (msg) {
      msg.textContent = text;
      msg.style.color = isError ? '#b3261e' : '';
      clearTimeout(msgTimer);
      msgTimer = setTimeout(function () { msg.textContent = ''; }, 12000);
    }
    if (toast) {
      toast.textContent = text;
      toast.classList.add('show');
      toast.style.color = isError ? '#ffb3a7' : '';
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 6000);
    }
    try { api.status(text); } catch (e) { /* the status line is optional */ }
  }

  // ---------- availability ----------
  function inMatch() {
    return !!(api && api.emu && (api.phase === 'lineup' || api.phase === 'playing'));
  }
  function online() { return !!api && api.mode === 'online'; }
  function canSave() {
    if (!inMatch()) return false;
    return !online() || (api.connected && !!api.session);
  }
  function canLoad() {
    if (!inMatch()) return false;
    if (!online()) return true;
    return api.host && api.connected && !!api.session && !xfer && !api.held;
  }

  function refresh() {
    api = hook();
    if (xfer && !(api && api.connected && inMatch())) clearXfer();   // disconnected or match ended
    var s = canSave(), l = canLoad();
    [saveBtn, saveFs].forEach(function (b) { if (b) b.disabled = !s; });
    [loadBtn, loadFs].forEach(function (b) { if (b) b.disabled = !l; });
    var st = s ? 'Download a save state of this game right now'
      : !api ? 'Starting…' : 'Start a game to use save states.';
    var lt = l ? 'Restore a saved state' + (online() ? ' (the guest is resynced automatically)' : '')
      : !api ? 'Starting…'
      : (online() && !api.host) ? 'Only the host can load a state in an online match.'
      : xfer ? 'A state transfer is in progress.'
      : 'Start a game to use save states.';
    [saveBtn, saveFs].forEach(function (b) { if (b) b.title = st; });
    [loadBtn, loadFs].forEach(function (b) { if (b) b.title = lt; });
  }

  // ---------- helpers ----------
  function baseName() {                      // the ROM's file name without its extension, e.g. nhl94.bin -> nhl94
    var n = String((api && api.romName) || '').replace(/\.(bin|md|gen|smd|sfc|smc|rom|zip)$/i, '').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').trim();
    return n || ('game-' + (api ? api.platform : 'state'));
  }

  function stamp() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }
  function b64(u8) {
    var s = '';
    for (var i = 0; i < u8.length; i += 0x2000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x2000));
    return btoa(s);
  }
  function unb64(s) {
    var bin = atob(s), u = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
    return u;
  }
  function pipe(u8, stream) {
    return new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer().then(function (b) { return new Uint8Array(b); });
  }
  function sha256(u8) {
    return crypto.subtle.digest('SHA-256', u8).then(function (d) {
      return Array.from(new Uint8Array(d), function (b) { return b.toString(16).padStart(2, '0'); }).join('');
    });
  }
  function concat(parts, total) {
    var out = new Uint8Array(total), o = 0;
    parts.forEach(function (p) { out.set(p, o); o += p.length; });
    return out;
  }
  function modeName(p) {
    return p === 'two' ? 'two-player' : p === 'single_home' ? 'single-player (you as home)'
      : p === 'single_away' ? 'single-player (you as away)' : 'single-player';
  }

  // ---------- save ----------
  function saveState() {
    refresh();
    if (!canSave()) { say('Start a game first, then save.', true); return; }
    try {
      var snap = api.snapshot();                       // { bytes: Uint8Array, frame }
      var header = {
        format: FORMAT,
        created: new Date().toISOString(),
        platform: api.platform,
        romSha256: api.emu.romSha256,
        coreVersion: api.coreVersion || null,
        coreHash: api.coreHash || null,
        stateSize: snap.bytes.length,
        frame: snap.frame,
        phase: api.phase,
        savedFrom: api.mode
      };
      var head = new TextEncoder().encode(JSON.stringify(header));
      var len = new Uint8Array(4);
      new DataView(len.buffer).setUint32(0, head.length, false);
      var blob = new Blob([new Uint8Array(MAGIC), len, head, snap.bytes], { type: 'application/octet-stream' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = baseName() + '.state';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 10000);
      say('State saved (' + Math.round(snap.bytes.length / 1024) + ' KB). Check your downloads.');
    } catch (e) {
      console.error(e);
      say('Could not save the state: ' + (e && e.message || e), true);
    }
  }

  // ---------- load: parsing and validation ----------
  function parse(buffer) {
    var u8 = new Uint8Array(buffer);
    if (u8.length < 8 || MAGIC.some(function (b, i) { return u8[i] !== b; })) {
      throw new Error('This is not a save state made by this site.');
    }
    var n = new DataView(buffer).getUint32(4, false);
    if (n < 2 || n > 65536 || 8 + n > u8.length) throw new Error('The save state header is damaged.');
    var header = JSON.parse(new TextDecoder().decode(u8.subarray(8, 8 + n)));
    if (header.format !== FORMAT) throw new Error('Unsupported save state version.');
    return { header: header, bytes: u8.slice(8 + n) };
  }

  function validate(s) {
    var h = s.header;
    if (h.platform !== api.platform) throw new Error('This state is for ' + h.platform + '; the arena is set to ' + api.platform + '.');
    if (h.coreVersion && api.coreVersion && h.coreVersion !== api.coreVersion) throw new Error('This state was made with a different emulator version.');
    if (h.coreHash && api.coreHash && h.coreHash !== api.coreHash) throw new Error('This state was made with a different emulator build.');
    if (!Number.isSafeInteger(h.frame) || h.frame < 0) throw new Error('The save state header is damaged.');
    if (s.bytes.length !== h.stateSize) throw new Error('The save state is incomplete.');
    if (!api.emu.stateSize || s.bytes.length !== api.emu.stateSize) throw new Error('This state does not fit the running game.');
  }

  function loadBuffer(buffer) {
    refresh();
    if (online() && !api.host) throw new Error('Only the host can load a state in an online match.');
    if (!canLoad()) throw new Error('Start a game first, then load.');
    var s = parse(buffer);
    validate(s);
    if (online()) return hostLoad(s);
    api.emu.load({ bytes: s.bytes, frame: s.header.frame });
    api.afterLoad();
    say('State loaded (saved ' + new Date(s.header.created).toLocaleString() + ').');
  }

  // ---------- online: transfer bookkeeping ----------
  function clearXfer() {
    if (xfer) clearTimeout(xfer.timer);
    xfer = null;
    try { if (api) api.hold(false); } catch (e) { /* match already over */ }
    if (saveBtn) refresh();
  }
  // Cancel before the host has loaded: nothing changed, both games carry on.
  function abortXfer(reason, notify, userText) {
    var x = xfer;
    if (!x) return;
    clearXfer();
    if (notify) { try { api.send({ t: 'arena-state-abort', id: x.id, reason: String(reason).slice(0, 200) }); } catch (e) { /* connection gone */ } }
    say(userText || reason, true);
  }
  // Past the point of no return (one side already loaded): stop rather than desync.
  function fatal(text) {
    clearXfer();
    try { api.fail(new Error(text)); } catch (e) { console.error(e); }
  }
  function armTimer(ms) {
    clearTimeout(xfer.timer);
    var x = xfer;
    x.timer = setTimeout(function () {
      if (xfer !== x) return;
      if (x.stage === 'offered') { clearXfer(); say('Your opponent did not respond. Nothing was changed.', true); }
      else abortXfer('Timed out waiting for the other player.', true, 'The state transfer timed out. Nothing was changed.');
    }, ms);
  }

  // ---------- online: host side ----------
  async function hostLoad(s) {
    var h = s.header, enc = 'raw', payload = s.bytes;
    if (typeof CompressionStream === 'function') {
      try { payload = await pipe(s.bytes, new CompressionStream('deflate')); enc = 'deflate'; }
      catch (e) { payload = s.bytes; enc = 'raw'; }
    }
    var sha = await sha256(s.bytes);
    refresh();
    if (!canLoad()) throw new Error('The match changed while preparing the state. Try again.');
    var id = crypto.randomUUID();
    xfer = {
      id: id, role: 'host', stage: 'offered', state: { bytes: s.bytes, frame: h.frame },
      payload: payload, chunks: Math.ceil(payload.length / CHUNK), header: h, committed: false
    };
    armTimer(OFFER_TIMEOUT);
    refresh();
    api.send({ t: 'arena-state-offer', id: id, size: payload.length, rawSize: s.bytes.length, enc: enc,
      chunks: xfer.chunks, sha256: sha, frame: h.frame });
    say('Asking your opponent to accept the state\u2026');
  }

  async function hostStream(x) {
    try {
      for (var i = 0; i < x.chunks; i++) {
        if (xfer !== x) return;
        api.send({ t: 'arena-state-chunk', id: x.id, i: i, d: b64(x.payload.subarray(i * CHUNK, Math.min((i + 1) * CHUNK, x.payload.length))) });
        if ((i + 1) % 8 === 0) await new Promise(function (r) { setTimeout(r, 0); });
      }
      if (xfer !== x) return;
      x.stage = 'sent';
      api.send({ t: 'arena-state-commit', id: x.id });
      say('State sent. Waiting for your opponent\u2026');
    } catch (e) { console.error(e); abortXfer(e && e.message || e, true, 'Could not send the state. Nothing was changed.'); }
  }

  // ---------- online: incoming messages (called from the game's message handler) ----------
  globalThis.__arenaNet = async function (t) {
    api = hook();
    if (!api) return;
    try {
      switch (t.t) {
        case 'arena-state-offer': return guestOffer(t);
        case 'arena-state-accept': return hostAccepted(t);
        case 'arena-state-reject': return hostRejected(t);
        case 'arena-state-chunk': return guestChunk(t);
        case 'arena-state-commit': return await guestCommit(t);
        case 'arena-state-ready': return hostReady(t);
        case 'arena-state-go': return guestGo(t);
        case 'arena-state-abort': return onAbort(t);
      }
    } catch (e) {
      console.error(e);
      var text = 'State resync failed: ' + (e && e.message || e);
      if (xfer && xfer.committed) fatal(text); else if (xfer) abortXfer(text, true, text + ' Nothing was changed.');
    }
  };

  function guestOffer(t) {
    if (!online() || api.host) return;                         // only a guest accepts offers
    var no = function (why) { api.send({ t: 'arena-state-reject', id: t.id, reason: why }); };
    if (xfer || api.held) return no('A transfer is already in progress.');
    if (!inMatch() || !api.session) return no('The match is not in a state that can be replaced.');
    if (api.emu.stateSize && t.rawSize !== api.emu.stateSize) return no('The state does not fit this game.');
    xfer = { id: t.id, role: 'guest', stage: 'receiving', offer: t, parts: [], next: 0, got: 0, committed: false };
    api.hold(true);                                             // freeze this side while the state arrives
    armTimer(GUEST_TIMEOUT);
    refresh();
    api.send({ t: 'arena-state-accept', id: t.id });
    say('The host is loading a saved state. Pausing briefly\u2026');
  }

  function hostAccepted(t) {
    if (!xfer || xfer.role !== 'host' || xfer.id !== t.id || xfer.stage !== 'offered') return;
    xfer.stage = 'streaming';
    api.hold(true);
    armTimer(HOST_TIMEOUT);
    refresh();
    say('Sending the state to your opponent\u2026');
    hostStream(xfer);
  }

  function hostRejected(t) {
    if (!xfer || xfer.role !== 'host' || xfer.id !== t.id || xfer.stage !== 'offered') return;
    clearXfer();
    say('Your opponent could not accept the state: ' + t.reason, true);
  }

  function onAbort(t) {
    if (!xfer || xfer.id !== t.id || xfer.committed) return;
    abortXfer(t.reason, false, xfer.role === 'host'
      ? 'Your opponent could not load the state: ' + t.reason + ' Nothing was changed.'
      : 'The host cancelled the state load: ' + t.reason + ' Nothing was changed.');
  }

  function guestChunk(t) {
    if (!xfer || xfer.role !== 'guest' || xfer.id !== t.id || xfer.stage !== 'receiving') return;
    if (t.i !== xfer.next) throw new Error('State chunks arrived out of order.');
    var part = unb64(t.d);
    xfer.got += part.length;
    if (xfer.got > xfer.offer.size) throw new Error('More state data arrived than expected.');
    xfer.parts.push(part);
    xfer.next++;
  }

  async function guestCommit(t) {
    if (!xfer || xfer.role !== 'guest' || xfer.id !== t.id || xfer.stage !== 'receiving') return;
    var x = xfer, o = x.offer;
    if (x.next !== o.chunks || x.got !== o.size) throw new Error('The state arrived incomplete.');
    var data = concat(x.parts, x.got);
    if (o.enc === 'deflate') data = await pipe(data, new DecompressionStream('deflate'));
    if (xfer !== x) return;
    if (data.length !== o.rawSize) throw new Error('The state arrived damaged (size).');
    if (await sha256(data) !== o.sha256) throw new Error('The state arrived damaged (hash).');
    if (xfer !== x) return;
    x.state = { bytes: data, frame: o.frame };
    x.parts = null;
    x.stage = 'ready';
    api.send({ t: 'arena-state-ready', id: x.id });
  }

  function hostReady(t) {
    if (!xfer || xfer.role !== 'host' || xfer.id !== t.id || xfer.stage !== 'sent') return;
    var x = xfer;
    if (!inMatch()) throw new Error('The match ended during the transfer.');
    x.committed = true;                 // from here on a failure stops the match
    api.emu.load(x.state);
    api.afterLoad();                    // fresh rollback session from the loaded state
    api.hold(false);
    api.send({ t: 'arena-state-go', id: x.id });
    var h = x.header;
    clearXfer();
    say('State loaded for both players.');
  }

  function guestGo(t) {
    if (!xfer || xfer.role !== 'guest' || xfer.id !== t.id || xfer.stage !== 'ready') return;
    var x = xfer;
    if (!inMatch()) throw new Error('The match ended during the transfer.');
    x.committed = true;
    api.emu.load(x.state);
    api.afterLoad();
    api.hold(false);
    clearXfer();
    say('The host loaded a saved state. You are back in sync.');
  }

  // ---------- UI ----------
  function onFile() {
    var f = fileInput.files && fileInput.files[0];
    fileInput.value = '';
    if (!f) return;
    if (f.size > 8 * 1024 * 1024) { say('That file is too large to be a save state.', true); return; }
    f.arrayBuffer().then(loadBuffer).catch(function (e) {
      console.error(e);
      say(e && e.message || String(e), true);
    });
  }

  function chooseFile() {
    refresh();
    if (online() && !api.host) { say('Only the host can load a state in an online match.', true); return; }
    if (!canLoad()) { say(xfer ? 'A state transfer is already in progress.' : 'Start a game first, then load.', true); return; }
    fileInput.click();
  }

  function addStyle() {
    var st = document.createElement('style');
    st.textContent =
      '.k94-in-game{z-index:4;color:#fff;cursor:pointer;background:#101b31;border:1px solid #99b4ee;padding:10px 14px;' +
      'font-family:inherit;font-size:14px;font-weight:700;min-height:44px;display:none;position:absolute;left:16px}' +
      '.screen-wrap.is-fullscreen .k94-in-game{display:block}.k94-in-game:disabled{opacity:.5;cursor:default}' +
      '#k94-save-fs{top:108px}#k94-load-fs{top:160px}' +
      '.k94-toast{z-index:5;display:none;position:absolute;bottom:18px;left:50%;transform:translateX(-50%);max-width:80%;' +
      'text-align:center;color:#f5f3ec;background:#05070dd1;padding:9px 15px;font-size:14px;pointer-events:none}' +
      '.screen-wrap.is-fullscreen .k94-toast.show{display:block}' +
      '.k94-state-message{color:#526078;margin-top:10px;font-size:13px;line-height:1.6;min-height:1.2em}';
    document.head.appendChild(st);
  }

  function mkBtn(id, label, cls) {
    var b = document.createElement('button');
    b.id = id; b.type = 'button'; b.className = cls; b.textContent = label; b.disabled = true;
    return b;
  }

  function addHelp() { /* the Save states help topic is part of index.html */ }

  function build() {
    var theirs = document.getElementById('load-state');           // the setup-time recovery button
    var group = theirs && theirs.parentNode;
    var tools = group && group.closest('.arena-tools');
    var wrap = document.getElementById('screen-wrap');
    if (!group || !tools) return false;
    addStyle();

    saveBtn = mkBtn('k94-save-state', 'Save state', 'text-button');
    loadBtn = mkBtn('k94-load-state', 'Load state', 'text-button');
    saveBtn.addEventListener('click', saveState);
    loadBtn.addEventListener('click', chooseFile);
    group.insertBefore(saveBtn, theirs);
    group.insertBefore(loadBtn, theirs);
    theirs.hidden = true;

    var help = tools.querySelector('.arena-actions-help');
    if (help) {
      help.innerHTML = '<strong>Save state</strong> downloads a save at any point in a game; <strong>Load state</strong> restores one ' +
        '(online, only the host can load, and your opponent is resynced automatically). Keyboard: <kbd>[</kbd> saves, <kbd>]</kbd> loads.';
    }

    fileInput = document.createElement('input');
    fileInput.type = 'file'; fileInput.accept = '.state'; fileInput.hidden = true;
    fileInput.addEventListener('change', onFile);
    tools.appendChild(fileInput);

    msg = document.createElement('p');
    msg.id = 'k94-state-message'; msg.className = 'k94-state-message';
    msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
    tools.appendChild(msg);

    if (wrap) {
      saveFs = mkBtn('k94-save-fs', 'Save state', 'k94-in-game');
      loadFs = mkBtn('k94-load-fs', 'Load state', 'k94-in-game');
      saveFs.addEventListener('click', saveState);
      loadFs.addEventListener('click', chooseFile);
      toast = document.createElement('div');
      toast.className = 'k94-toast'; toast.setAttribute('role', 'status');
      wrap.appendChild(saveFs); wrap.appendChild(loadFs); wrap.appendChild(toast);
    }

    addHelp();

    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      if (e.key === '[') { e.preventDefault(); saveState(); }
      else if (e.key === ']') { e.preventDefault(); chooseFile(); }
    });

    setInterval(refresh, 250);
    refresh();
    return true;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
