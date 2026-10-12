var __stubs = {},
  __roms = new Map(),
  __romNames = new Map(),
  __peerRom = null,
  __peerFor = null,
  __sentKey = null,
  __sentFor = null,
  __crcFor = null,
  __crcVal = null;
function __crc32(b) {
  let t = __crc32.t;
  if (!t) {
    t = __crc32.t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 3988292384 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
  }
  let c = 4294967295;
  for (let i = 0; i < b.length; i++) c = t[(c ^ b[i]) & 255] ^ (c >>> 8);
  return ((c ^ 4294967295) >>> 0).toString(16).padStart(8, `0`);
}
function __myRom() {
  if (!P) return null;
  if (__crcFor !== P) {
    let n = Vi?.normalizeROM ? Vi.normalizeROM(P) : P;
    ((__crcVal = { crc: __crc32(n), size: n.length }), (__crcFor = P));
  }
  return __crcVal;
}
function __romBad() {
  let m = __myRom();
  if (
    M !== `online` ||
    !m ||
    !R?.open ||
    __peerFor !== R ||
    !__peerRom ||
    __peerRom.platform !== z.platform
  )
    return ``;
  return __peerRom.crc === m.crc && __peerRom.size === m.size
    ? ``
    : `Your ROM (CRC32 ${m.crc}) is different from your opponent's ROM (CRC32 ${__peerRom.crc}). Both players must load the same ROM file.`;
}
function __syncRom() {
  try {
    let m = __myRom();
    if (!m || !k) return;
    if (M === `online` && R?.open) {
      let key = z.platform + m.crc + m.size;
      if (__sentFor !== R || __sentKey !== key) {
        ((__sentFor = R),
          (__sentKey = key),
          X({ t: `arena-rom`, platform: z.platform, crc: m.crc, size: m.size }));
      }
    }
    let bad = __romBad(),
      el = k(`rom-status`);
    if (!Xi) {
      el.textContent =
        bad ||
        `ROM loaded · CRC32 ${m.crc}` +
          (M === `online` && __peerFor === R && __peerRom && __peerRom.platform === z.platform
            ? ` · matches your opponent's ROM`
            : ``);
      if (bad && __sentBad !== bad) Y(bad);
      __sentBad = bad;
    }
  } catch {}
}
var __sentBad = ``;
import { A as e, O as r, k as i } from "./shared.js";
var m = Object.freeze({
  genesis: { status: [16762676, 16763544], list: [16762728, 16763596], type: `>u2` },
  nhl95: { status: [16761584, 16762454], list: [16761636, 16762506], type: `>u2` },
  snes: { status: [8263762, 8263814], list: [8263866, 8263892], type: `<u2` },
});
function h(e, t) {
  let n = m[t];
  return !n || typeof e?.read != `function` || typeof e?.byte != `function`
    ? null
    : n.list.map((t, r) => {
        let i = [],
          a = new Set();
        for (let o = 0; o < 26; o++) {
          let s = e.byte(t + o);
          if (s & 128) return i;
          if (s > 50 || s % 2 || a.has(s)) return null;
          a.add(s);
          let c = e.read(n.status[r] + s, n.type);
          Number.isInteger(c) && c > 0 && c <= 600 && i.push(c);
        }
        return null;
      });
}
function g(e) {
  return `${Math.floor(e / 60)}:${String(e % 60).padStart(2, `0`)}`;
}
function _(e, t, n = e.info()) {
  let r = t === `genesis` ? n.time & 65535 : n.time;
  return Number.isInteger(n.time) &&
    Number.isInteger(n.period) &&
    n.period >= 0 &&
    n.period <= 7 &&
    Number.isInteger(r) &&
    r >= 0 &&
    r <= 1200 &&
    [n.p1_score, n.p2_score].every((e) => Number.isInteger(e) && e >= 0 && e <= 99)
    ? {
        homeScore: n.p1_score,
        awayScore: n.p2_score,
        seconds: r,
        period: n.period,
        periodLabel: [`1ST`, `2ND`, `3RD`, `OT`, `2OT`, `3OT`, `4OT`, `5OT`][n.period],
        paused: n.paused === !0,
        penalties: h(e, t),
      }
    : null;
}
function v(e, t, n) {
  return;
  let r = (t, n) => {
      e.getElementById(t).textContent = n;
    },
    i = t && [`playing`, `finished`].includes(n);
  (r(`home-score`, i ? String(t.homeScore) : `—`),
    r(`away-score`, i ? String(t.awayScore) : `—`),
    r(
      `scoreboard-clock`,
      i ? `${t.periodLabel} · ${g(t.seconds)}` : n === `lineup` ? `LINEUP` : `PREGAME`,
    ),
    r(
      `scoreboard-status`,
      n === `finished` ? `MATCH ENDED` : i && t.paused ? `PAUSED` : `LIVE GAME DATA`,
    ));
  for (let [e, n] of [`home`, `away`].entries()) {
    let a = t?.penalties?.[e];
    r(
      `${n}-penalties`,
      i
        ? a
          ? a.length
            ? `PEN ${a.slice(0, 2).map(g).join(` · `)}${a.length > 2 ? ` +${a.length - 2}` : ``}`
            : ``
          : `Penalty data unavailable`
        : ``,
    );
  }
}
function ee(e) {
  return `${e.awayTeam} ${e.awayScore} – ${e.homeScore} ${e.homeTeam} · ${e.reason === `mercy` ? `Six-goal mercy` : `Match ended`} · ${e.gameLabel}`;
}
function y(e, t, n = {}) {
  let r = 1200;
  ((e.canvas.width = r),
    (e.canvas.height = 800),
    (e.fillStyle = `#101b31`),
    e.fillRect(0, 0, r, 800),
    (e.fillStyle = `#193558`));
  for (let t = -800; t < r; t += 120)
    (e.beginPath(),
      e.moveTo(t, 0),
      e.lineTo(t + 36, 0),
      e.lineTo(t + 836, 800),
      e.lineTo(t + 800, 800),
      e.fill());
  let i = (t, n, r, i, a = `#fff`, o = `left`) => {
    ((e.fillStyle = a),
      (e.font = `900 ${i}px Arial, sans-serif`),
      (e.textAlign = o),
      e.fillText(t, n, r));
  };
  return (
    (e.fillStyle = `#f6c94c`),
    e.fillRect(48, 42, 9, 83),
    i(`ONLINE ARENA`, 82, 89, 52),
    i(`CLASSIC HOCKEY`, 84, 121, 19, `#d6e4f7`),
    i(t.reason === `mercy` ? `SIX-GOAL MERCY` : `MATCH ENDED`, 1150, 92, 25, `#f6c94c`, `right`),
    i(t.gameLabel.toUpperCase(), 1150, 122, 18, `#d6e4f7`, `right`),
    (e.fillStyle = `#efefef`),
    e.fillRect(48, 176, 1104, 384),
    (e.fillStyle = `#183656`),
    e.fillRect(535, 176, 130, 384),
    (e.imageSmoothingEnabled = !1),
    n.away && e.drawImage(n.away, 140, 205, 176, 176),
    n.home && e.drawImage(n.home, 880, 205, 176, 176),
    i(`AWAY`, 228, 411, 18, `#40566f`, `center`),
    i(`HOME`, 968, 411, 18, `#40566f`, `center`),
    i(t.awayTeam, 228, 487, 60, `#101b31`, `center`),
    i(t.homeTeam, 968, 487, 60, `#101b31`, `center`),
    i(String(t.awayScore), 430, 422, 112, `#101b31`, `center`),
    i(String(t.homeScore), 770, 422, 112, `#101b31`, `center`),
    i(`VS`, 600, 379, 28, `#f6c94c`, `center`),
    i(
      t.telemetry
        ? `${t.telemetry.periodLabel} · ${g(t.telemetry.seconds)} REMAINING`
        : `SCORE AT END OF SESSION`,
      600,
      614,
      25,
      `#d6e4f7`,
      `center`,
    ),
    i(
      `${t.matchType === `tournament` ? `TOURNAMENT RULES` : `REGULAR MATCH`}  /  MERCY ${t.mercyEnabled ? `ON` : `OFF`}`,
      600,
      655,
      18,
      `#f6c94c`,
      `center`,
    ),
    (e.fillStyle = `#f6c94c`),
    e.fillRect(48, 700, 1104, 2),
    i(`CLASSIC HOCKEY. SAME RIVALRY.`, 48, 745, 24),
    i(`PLAYER-SHARED SCORE · NOT AN OFFICIAL LEAGUE SUBMISSION`, 48, 778, 13, `#aabbd2`),
    e.canvas
  );
}
async function te(e, t, { nav: n = navigator, download: r } = {}) {
  if (n.share && n.canShare?.({ files: [e] }))
    try {
      return (await n.share({ files: [e], title: `Match result`, text: t }), `shared`);
    } catch (e) {
      if (e.name === `AbortError`) return `cancelled`;
    }
  return (r(e), `downloaded`);
}
function ne(e, t) {
  let n = 0,
    r = null,
    i = null,
    a = (t) => e.getElementById(t) || document.createElement(`div`),
    o = (e) => {
      a(`share-result-status`).textContent = e;
    },
    s = (t) => {
      let n = URL.createObjectURL(t),
        r = e.createElement(`a`);
      ((r.href = n),
        (r.download = t.name),
        r.click(),
        setTimeout(() => URL.revokeObjectURL(n), 3e4));
    };
  return (
    a(`download-result`).addEventListener(`click`, () => {
      r && (s(r), o(`PNG downloaded. Post it wherever you share your games.`));
    }),
    a(`share-result`).addEventListener(`click`, async () => {
      if (!r) return;
      let e = n,
        t = r,
        c = i;
      a(`share-result`).disabled = !0;
      try {
        let r = await te(t, ee(c), { download: s });
        e === n &&
          o(
            r === `cancelled`
              ? `Sharing cancelled. Your card is still available.`
              : r === `shared`
                ? `Result shared.`
                : `PNG downloaded. This browser does not support image sharing.`,
          );
      } catch {
        e === n && o(`Could not share. Choose Download image to save your card.`);
      } finally {
        e === n && (a(`share-result`).disabled = !r);
      }
    }),
    {
      clear() {
        (n++,
          (r = i = null),
          a(`share-result-preview`).removeAttribute(`src`),
          (a(`match-share`).hidden = !0),
          (a(`share-result-preview`).hidden = !0));
      },
      async prepare(s) {
        let c = ++n;
        ((r = null),
          (i = s),
          (a(`match-share`).hidden = !1),
          (a(`share-result`).disabled = a(`download-result`).disabled = !0),
          (a(`share-result-preview`).hidden = !0),
          (a(`share-result-copy`).textContent = ee(s)),
          o(`Preparing your result card…`));
        try {
          let i = (e) =>
              new Promise((n) => {
                let r = new Image();
                ((r.onload = () => n(r)),
                  (r.onerror = () => n(null)),
                  (r.src = `${t}game/team-sprites/${s[`${e}Team`]}.png`));
              }),
            [l, u] = await Promise.all([i(`home`), i(`away`)]);
          if (c !== n) return;
          let d = e.createElement(`canvas`);
          y(d.getContext(`2d`, { alpha: !1 }), s, { home: l, away: u });
          let f = await new Promise((e) => d.toBlob(e, `image/png`));
          if (c !== n) return;
          if (!f) throw Error(`Image unavailable`);
          ((r = new File(
            [f],
            `match-${s.awayTeam}-${s.awayScore}-${s.homeTeam}-${s.homeScore}.png`,
            { type: `image/png` },
          )),
            (a(`share-result-preview`).src = d.toDataURL(`image/png`)),
            (a(`share-result-preview`).hidden = !1),
            (a(`share-result`).disabled = a(`download-result`).disabled = !1),
            o(`Ready to share. Your card stays on this device.`));
        } catch {
          c === n &&
            o(
              `Could not create the image. Your score is shown above; try ending the next match again.`,
            );
        }
      },
    }
  );
}
var re = (e) => new TextEncoder().encode(e),
  ie = {
    genesis: { game: `NHL94`, console: `Genesis`, base: 16711680, size: 65536, endian: `big` },
    snes: { game: `NHL94`, console: `SNES`, base: 8257536, size: 131072, endian: `little` },
    nhl95: { game: `NHL95`, console: `Genesis`, base: 16711680, size: 65536, endian: `big` },
  };
function ae(e, t, n) {
  let r = ie[n.platform];
  if (!r || !e) throw Error(`Start a supported match before saving stats.`);
  let i = t ? t.confirmed : e.frames;
  if (t && t.dirty < i)
    throw Error(`Waiting for confirmed game inputs. Try saving again in a moment.`);
  let a = t && t.frame !== i ? t.states.get(i) : null;
  if (t && t.frame !== i && !a)
    throw Error(`Confirmed game state is unavailable. Try again in a moment.`);
  let o = a ? e.save() : null;
  try {
    a && e.load(a);
    let t = e.save();
    if (!(t.bytes instanceof Uint8Array) || t.bytes.length < 1 || t.bytes.length > 4194304)
      throw Error(`Game state could not be captured.`);
    let o = new Uint8Array(r.size);
    for (let t = 0; t < o.length; t++) o[t] = e.byte(r.base + t);
    let s = e.info(),
      c = {};
    for (let e of [
      `period`,
      `time`,
      `p1_score`,
      `p2_score`,
      `p1_shots`,
      `p2_shots`,
      `p1_attackzone`,
      `p2_attackzone`,
      `p1_bodychecks`,
      `p2_bodychecks`,
      `p1_faceoffwon`,
      `p2_faceoffwon`,
      `p1_pass_attempts`,
      `p2_pass_attempts`,
      `p1_passing`,
      `p2_passing`,
    ])
      Number.isFinite(s[e]) && (c[e] = s[e]);
    return {
      native: t.bytes.slice(),
      ram: o,
      metadata: {
        ...structuredClone(n),
        schema: `king94-stat-export-v1`,
        capturedAt: new Date().toISOString(),
        game: r.game,
        console: r.console,
        matchFrame: i,
        emulatorFrame: t.frame,
        summary: c,
        verification: `client capture; not an official result`,
        completion: `screen and match completion must be checked by the collector`,
        ram: {
          baseAddress: `0x` + r.base.toString(16),
          bytes: r.size,
          byteOrder: `console address order`,
          wordEndian: r.endian,
        },
      },
    };
  } finally {
    o && e.load(o);
  }
}
function oe(e) {
  let t = Math.ceil(e.length / 8) * 8,
    n = new Uint8Array(24 + t),
    r = new DataView(n.buffer);
  return (
    n.set(re(`RASTATE`)),
    (n[7] = 1),
    n.set(re(`MEM `), 8),
    r.setUint32(12, e.length, !0),
    n.set(e, 16),
    n.set(re(`END `), 16 + t),
    n
  );
}
function se(e) {
  let t = 4294967295;
  for (let n of e) {
    t ^= n;
    for (let e = 0; e < 8; e++) t = (t >>> 1) ^ (t & 1 ? 3988292384 : 0);
  }
  return (t ^ 4294967295) >>> 0;
}
function ce(e) {
  let t = 0,
    n = [],
    r = [];
  for (let [i, a] of e) {
    let e = re(i),
      o = se(a),
      s = new Uint8Array(30 + e.length),
      c = new DataView(s.buffer);
    (c.setUint32(0, 67324752, !0),
      c.setUint16(4, 20, !0),
      c.setUint16(12, 33, !0),
      c.setUint32(14, o, !0),
      c.setUint32(18, a.length, !0),
      c.setUint32(22, a.length, !0),
      c.setUint16(26, e.length, !0),
      s.set(e, 30));
    let l = new Uint8Array(46 + e.length),
      u = new DataView(l.buffer);
    (u.setUint32(0, 33639248, !0),
      u.setUint16(4, 20, !0),
      u.setUint16(6, 20, !0),
      u.setUint16(14, 33, !0),
      u.setUint32(16, o, !0),
      u.setUint32(20, a.length, !0),
      u.setUint32(24, a.length, !0),
      u.setUint16(28, e.length, !0),
      u.setUint32(42, t, !0),
      l.set(e, 46),
      n.push(s, a),
      r.push(l),
      (t += s.length + a.length));
  }
  let i = r.reduce((e, t) => e + t.length, 0),
    a = new Uint8Array(22),
    o = new DataView(a.buffer);
  (o.setUint32(0, 101010256, !0),
    o.setUint16(8, e.length, !0),
    o.setUint16(10, e.length, !0),
    o.setUint32(12, i, !0),
    o.setUint32(16, t, !0));
  let s = new Uint8Array(t + i + a.length),
    c = 0;
  for (let e of [...n, ...r, a]) (s.set(e, c), (c += e.length));
  return s;
}
function le(e, t) {
  return `nhl-${e.platform}-${e.config.homeTeam}-${e.config.awayTeam}-${e.capturedAt.replace(/[:.]/g, `-`)}.${t}`;
}
function ue(e) {
  if (![`genesis`, `snes`].includes(e.metadata.platform))
    throw Error(`NHL94Online export is for NHL ’94 Genesis and SNES.`);
  return {
    filename: le(e.metadata, `state`),
    bytes: oe(e.native),
    mime: `application/octet-stream`,
  };
}
async function de(e) {
  let t = oe(e.native),
    n = async (e) =>
      Array.from(new Uint8Array(await globalThis.crypto.subtle.digest(`SHA-256`, e)), (e) =>
        e.toString(16).padStart(2, `0`),
      ).join(``),
    [r, i] = await Promise.all([n(t), n(e.ram)]),
    a = {
      ...e.metadata,
      files: {
        "match.state": {
          format: `RetroArch RASTATE v1 / native core MEM`,
          bytes: t.length,
          sha256: r,
        },
        "match.ram": { bytes: e.ram.length, sha256: i },
      },
    };
  return {
    filename: le(a, `zip`),
    bytes: ce([
      [`match.state`, t],
      [`match.ram`, e.ram],
      [`match.json`, re(JSON.stringify(a, null, 2))],
      [
        `README.txt`,
        re(`Match stat export

Save after the final whistle at Three Stars or the final game summary, BEFORE leaving for the main menu. Mid-game, mercy, manual endings and highlights may be incomplete or rejected by league tools. The site does not detect full time automatically.

Extract this ZIP first. match.state is an uncompressed RetroArch state containing the exact serialized state from the core identified in match.json. Use the same game revision and emulator core. No ROM is included.

Genesis NHL94: Chaos81's extractor documents RetroArch 1.10+ Genesis Plus GX states; this file uses that container and RAM placement. End-game acceptance by external uploaders still needs verification.
SNES NHL94: this site uses Snes9x2010 snapshot version 10, which differs from regular Snes9x/ZSNES. Do not rename it to a ZSNES state. Existing league parser compatibility is unverified.
Genesis NHL95: NHL95.net advertises RetroArch Genesis states; acceptance of this site's exports is unverified. NHL94 stat offsets must not be reused for NHL95.

match.ram contains full work RAM in console address order (Genesis words big-endian; SNES words little-endian). It retains player and scoring tables for community extractor authors. match.json includes verified adapter summary fields, game/core/ROM identity, teams, frame and capture context. These are client captures, not authenticated tournament results.

Downloads are created on your device. No save state or RAM is uploaded to the server. The last capture for each game is retained only in this tab; download before closing or reloading it.

Community references:
https://www.nhl94online.com/html/rules.php
https://github.com/Chaos81/nhl94-stat-extractor
https://www.nhl95.net/upload
`),
      ],
    ]),
  };
}
function fe(e) {
  let t = URL.createObjectURL(new Blob([e.bytes], { type: e.mime || `application/zip` })),
    n = document.createElement(`a`);
  ((n.href = t), (n.download = e.filename), document.body.append(n));
  try {
    n.click();
  } finally {
    (n.remove(), setTimeout(() => URL.revokeObjectURL(t), 1e4));
  }
}
var pe = (e) => new TextDecoder().decode(e);
function me(e) {
  if (!(e instanceof Uint8Array) || e.length < 32 || e.length > 5242880)
    throw Error(`Choose a .state file or stats ZIP (up to 5 MB).`);
  if (pe(e.subarray(0, 7)) !== `RASTATE` || e[7] !== 1)
    throw Error(`Use an uncompressed RetroArch .state exported by this site.`);
  let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
    n = 8,
    r = null;
  for (; n + 8 <= e.length;) {
    let i = pe(e.subarray(n, n + 4)),
      a = t.getUint32(n + 4, !0),
      o = n + 8 + a;
    if (o > e.length) throw Error(`State file is incomplete.`);
    if (i === `END `) {
      if (a || o !== e.length || !r) throw Error(`Invalid state ending.`);
      return r;
    }
    if (i === `MEM `) {
      if (r || !a || a > 4194304) throw Error(`Invalid core state.`);
      r = e.slice(n + 8, o);
    }
    n += 8 + Math.ceil(a / 8) * 8;
  }
  throw Error(`State file is incomplete.`);
}
function he(e) {
  if (!(e instanceof Uint8Array) || e.length > 5242880)
    throw Error(`State files must be no larger than 5 MB.`);
  if (pe(e.subarray(0, 7)) === `RASTATE`) return { native: me(e), metadata: null };
  if (
    e.length < 30 ||
    new DataView(e.buffer, e.byteOffset, e.byteLength).getUint32(0, !0) !== 67324752
  )
    throw Error(`Choose a .state file or a stats ZIP exported by this site.`);
  let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
    n = new Map(),
    r = 0,
    i = 0;
  for (; r + 30 <= e.length && t.getUint32(r, !0) === 67324752;) {
    if (++i > 8) throw Error(`Unexpected stats ZIP contents.`);
    let a = t.getUint16(r + 6, !0),
      o = t.getUint16(r + 8, !0),
      s = t.getUint32(r + 14, !0),
      c = t.getUint32(r + 18, !0),
      l = t.getUint32(r + 22, !0),
      u = t.getUint16(r + 26, !0),
      d = t.getUint16(r + 28, !0),
      f = r + 30 + u + d,
      p = f + c;
    if (a || o || c !== l || u > 256 || p > e.length)
      throw Error(`Use the original, uncompressed stats ZIP.`);
    let m = pe(e.subarray(r + 30, r + 30 + u)),
      h = e.subarray(f, p);
    if (n.has(m) || se(h) !== s) throw Error(`Stats ZIP is damaged.`);
    (n.set(m, h), (r = p));
  }
  if (!n.has(`match.state`) || !n.has(`match.json`) || n.get(`match.json`).length > 16384)
    throw Error(`Stats ZIP is missing its state or match details.`);
  let a;
  try {
    a = JSON.parse(pe(n.get(`match.json`)));
  } catch {
    throw Error(`Invalid match details in stats ZIP.`);
  }
  if (!a || a.schema !== `king94-stat-export-v1`) throw Error(`Unsupported stats ZIP version.`);
  return { native: me(n.get(`match.state`)), metadata: a };
}
function ge(e, t, n) {
  let r = e.save().bytes;
  if (t.length !== r.length || !r.subarray(0, 16).every((e, n) => t[n] === e))
    throw Error(
      `State format does not match this emulator core. Use a state exported by this site for the selected game.`,
    );
  return (e.load({ bytes: t, frame: 0 }), n(), e.info());
}
var _e = `https://www.nhl94online.com/`,
  ve = (e) => e === `genesis` || e === `snes`;
function ye(e) {
  if (typeof e != `string` || e.length > 1e3)
    throw Error(`Paste your full NHL94Online coach-page link.`);
  if (!e.trim()) return ``;
  let t;
  try {
    t = new URL(e.trim());
  } catch {
    throw Error(`Paste your full NHL94Online coach-page link.`);
  }
  if (
    t.protocol !== `https:` ||
    ![`nhl94online.com`, `www.nhl94online.com`].includes(t.hostname) ||
    t.port ||
    t.username ||
    t.password ||
    t.pathname !== `/html/coachpage.php`
  )
    throw Error(`Use an HTTPS coach-page link from NHL94Online.com.`);
  let n = t.searchParams.get(`lg`),
    r = t.searchParams.get(`team_ID`),
    i = t.searchParams.get(`sublg`);
  if (
    !/^[1-9]\d{0,8}$/.test(n || ``) ||
    !/^[1-9]\d{0,8}$/.test(r || ``) ||
    !i ||
    !/^[A-Za-z0-9 -]{1,30}$/.test(i)
  )
    throw Error(`Copy the coach-page link with its league, level and team.`);
  let a = new URL(`html/coachpage.php`, _e);
  return (
    a.searchParams.set(`lg`, n),
    a.searchParams.set(`sublg`, i),
    a.searchParams.set(`team_ID`, r),
    a.href
  );
}
function be(e) {
  if (e === void 0)
    try {
      e = globalThis.localStorage;
    } catch {
      e = null;
    }
  let t = new Map(),
    n = (e) => `king94-nhl94online-coach-` + e + `-v1`;
  return {
    get(r) {
      if (!ve(r)) return ``;
      if (!t.has(r)) {
        let i = ``;
        try {
          i = ye(e?.getItem(n(r)) || ``);
        } catch {}
        t.set(r, i);
      }
      return t.get(r);
    },
    set(r, i) {
      if (!ve(r)) throw Error(`NHL94Online export is for NHL ’94 Genesis and SNES.`);
      let a = ye(i);
      t.set(r, a);
      let o = !1;
      try {
        if (!e) throw Error(`Storage unavailable`);
        (a ? e.setItem(n(r), a) : e.removeItem(n(r)), (o = !0));
      } catch {}
      return { url: a, persisted: o };
    },
  };
}
var xe = Object.freeze([`genesis`, `snes`, `nhl95`]),
  Se = (e) => xe.includes(e),
  Ce = class {
    constructor() {
      ((this.encoder = new TextEncoder()), (this._pieces = []), (this._parts = []));
    }
    append_buffer(e) {
      (this.flush(), this._parts.push(e));
    }
    append(e) {
      this._pieces.push(e);
    }
    flush() {
      if (this._pieces.length > 0) {
        let e = new Uint8Array(this._pieces);
        (this._parts.push(e), (this._pieces = []));
      }
    }
    toArrayBuffer() {
      let e = [];
      for (let t of this._parts) e.push(t);
      return we(e).buffer;
    }
  };
function we(e) {
  let t = 0;
  for (let n of e) t += n.byteLength;
  let n = new Uint8Array(t),
    r = 0;
  for (let t of e) {
    let e = new Uint8Array(t.buffer, t.byteOffset, t.byteLength);
    (n.set(e, r), (r += t.byteLength));
  }
  return n;
}
function Te(e) {
  return new De(e).unpack();
}
function Ee(e) {
  let t = new Oe(),
    n = t.pack(e);
  return n instanceof Promise ? n.then(() => t.getBuffer()) : t.getBuffer();
}
var De = class {
    constructor(e) {
      ((this.index = 0),
        (this.dataBuffer = e),
        (this.dataView = new Uint8Array(this.dataBuffer)),
        (this.length = this.dataBuffer.byteLength));
    }
    unpack() {
      let e = this.unpack_uint8();
      if (e < 128) return e;
      if ((e ^ 224) < 32) return (e ^ 224) - 32;
      let t;
      if ((t = e ^ 160) <= 15) return this.unpack_raw(t);
      if ((t = e ^ 176) <= 15) return this.unpack_string(t);
      if ((t = e ^ 144) <= 15) return this.unpack_array(t);
      if ((t = e ^ 128) <= 15) return this.unpack_map(t);
      switch (e) {
        case 192:
          return null;
        case 193:
          return;
        case 194:
          return !1;
        case 195:
          return !0;
        case 202:
          return this.unpack_float();
        case 203:
          return this.unpack_double();
        case 204:
          return this.unpack_uint8();
        case 205:
          return this.unpack_uint16();
        case 206:
          return this.unpack_uint32();
        case 207:
          return this.unpack_uint64();
        case 208:
          return this.unpack_int8();
        case 209:
          return this.unpack_int16();
        case 210:
          return this.unpack_int32();
        case 211:
          return this.unpack_int64();
        case 212:
          return;
        case 213:
          return;
        case 214:
          return;
        case 215:
          return;
        case 216:
          return ((t = this.unpack_uint16()), this.unpack_string(t));
        case 217:
          return ((t = this.unpack_uint32()), this.unpack_string(t));
        case 218:
          return ((t = this.unpack_uint16()), this.unpack_raw(t));
        case 219:
          return ((t = this.unpack_uint32()), this.unpack_raw(t));
        case 220:
          return ((t = this.unpack_uint16()), this.unpack_array(t));
        case 221:
          return ((t = this.unpack_uint32()), this.unpack_array(t));
        case 222:
          return ((t = this.unpack_uint16()), this.unpack_map(t));
        case 223:
          return ((t = this.unpack_uint32()), this.unpack_map(t));
      }
    }
    unpack_uint8() {
      let e = this.dataView[this.index] & 255;
      return (this.index++, e);
    }
    unpack_uint16() {
      let e = this.read(2),
        t = (e[0] & 255) * 256 + (e[1] & 255);
      return ((this.index += 2), t);
    }
    unpack_uint32() {
      let e = this.read(4),
        t = ((e[0] * 256 + e[1]) * 256 + e[2]) * 256 + e[3];
      return ((this.index += 4), t);
    }
    unpack_uint64() {
      let e = this.read(8),
        t =
          ((((((e[0] * 256 + e[1]) * 256 + e[2]) * 256 + e[3]) * 256 + e[4]) * 256 + e[5]) * 256 +
            e[6]) *
            256 +
          e[7];
      return ((this.index += 8), t);
    }
    unpack_int8() {
      let e = this.unpack_uint8();
      return e < 128 ? e : e - 256;
    }
    unpack_int16() {
      let e = this.unpack_uint16();
      return e < 32768 ? e : e - 65536;
    }
    unpack_int32() {
      let e = this.unpack_uint32();
      return e < 2 ** 31 ? e : e - 2 ** 32;
    }
    unpack_int64() {
      let e = this.unpack_uint64();
      return e < 2 ** 63 ? e : e - 2 ** 64;
    }
    unpack_raw(e) {
      if (this.length < this.index + e)
        throw Error(`BinaryPackFailure: index is out of range ${this.index} ${e} ${this.length}`);
      let t = this.dataBuffer.slice(this.index, this.index + e);
      return ((this.index += e), t);
    }
    unpack_string(e) {
      let t = this.read(e),
        n = 0,
        r = ``,
        i,
        a;
      for (; n < e;)
        ((i = t[n]),
          i < 160
            ? ((a = i), n++)
            : (i ^ 192) < 32
              ? ((a = ((i & 31) << 6) | (t[n + 1] & 63)), (n += 2))
              : (i ^ 224) < 16
                ? ((a = ((i & 15) << 12) | ((t[n + 1] & 63) << 6) | (t[n + 2] & 63)), (n += 3))
                : ((a =
                    ((i & 7) << 18) |
                    ((t[n + 1] & 63) << 12) |
                    ((t[n + 2] & 63) << 6) |
                    (t[n + 3] & 63)),
                  (n += 4)),
          (r += String.fromCodePoint(a)));
      return ((this.index += e), r);
    }
    unpack_array(e) {
      let t = Array(e);
      for (let n = 0; n < e; n++) t[n] = this.unpack();
      return t;
    }
    unpack_map(e) {
      let t = {};
      for (let n = 0; n < e; n++) {
        let e = this.unpack();
        t[e] = this.unpack();
      }
      return t;
    }
    unpack_float() {
      let e = this.unpack_uint32(),
        t = e >> 31,
        n = ((e >> 23) & 255) - 127,
        r = (e & 8388607) | 8388608;
      return (t === 0 ? 1 : -1) * r * 2 ** (n - 23);
    }
    unpack_double() {
      let e = this.unpack_uint32(),
        t = this.unpack_uint32(),
        n = e >> 31,
        r = ((e >> 20) & 2047) - 1023,
        i = ((e & 1048575) | 1048576) * 2 ** (r - 20) + t * 2 ** (r - 52);
      return (n === 0 ? 1 : -1) * i;
    }
    read(e) {
      let t = this.index;
      if (t + e <= this.length) return this.dataView.subarray(t, t + e);
      throw Error(`BinaryPackFailure: read index out of range`);
    }
  },
  Oe = class {
    getBuffer() {
      return this._bufferBuilder.toArrayBuffer();
    }
    pack(e) {
      if (typeof e == `string`) this.pack_string(e);
      else if (typeof e == `number`)
        Math.floor(e) === e ? this.pack_integer(e) : this.pack_double(e);
      else if (typeof e == `boolean`)
        e === !0 ? this._bufferBuilder.append(195) : e === !1 && this._bufferBuilder.append(194);
      else if (e === void 0) this._bufferBuilder.append(192);
      else if (typeof e == `object`) {
        if (e === null) this._bufferBuilder.append(192);
        else {
          let t = e.constructor;
          if (e instanceof Array) {
            let t = this.pack_array(e);
            if (t instanceof Promise) return t.then(() => this._bufferBuilder.flush());
          } else if (e instanceof ArrayBuffer) this.pack_bin(new Uint8Array(e));
          else if (`BYTES_PER_ELEMENT` in e) {
            let t = e;
            this.pack_bin(new Uint8Array(t.buffer, t.byteOffset, t.byteLength));
          } else if (e instanceof Date) this.pack_string(e.toString());
          else if (e instanceof Blob)
            return e.arrayBuffer().then((e) => {
              (this.pack_bin(new Uint8Array(e)), this._bufferBuilder.flush());
            });
          else if (t == Object || t.toString().startsWith(`class`)) {
            let t = this.pack_object(e);
            if (t instanceof Promise) return t.then(() => this._bufferBuilder.flush());
          } else throw Error(`Type "${t.toString()}" not yet supported`);
        }
      } else throw Error(`Type "${typeof e}" not yet supported`);
      this._bufferBuilder.flush();
    }
    pack_bin(e) {
      let t = e.length;
      if (t <= 15) this.pack_uint8(160 + t);
      else if (t <= 65535) (this._bufferBuilder.append(218), this.pack_uint16(t));
      else if (t <= 4294967295) (this._bufferBuilder.append(219), this.pack_uint32(t));
      else throw Error(`Invalid length`);
      this._bufferBuilder.append_buffer(e);
    }
    pack_string(e) {
      let t = this._textEncoder.encode(e),
        n = t.length;
      if (n <= 15) this.pack_uint8(176 + n);
      else if (n <= 65535) (this._bufferBuilder.append(216), this.pack_uint16(n));
      else if (n <= 4294967295) (this._bufferBuilder.append(217), this.pack_uint32(n));
      else throw Error(`Invalid length`);
      this._bufferBuilder.append_buffer(t);
    }
    pack_array(e) {
      let t = e.length;
      if (t <= 15) this.pack_uint8(144 + t);
      else if (t <= 65535) (this._bufferBuilder.append(220), this.pack_uint16(t));
      else if (t <= 4294967295) (this._bufferBuilder.append(221), this.pack_uint32(t));
      else throw Error(`Invalid length`);
      let n = (r) => {
        if (r < t) {
          let t = this.pack(e[r]);
          return t instanceof Promise ? t.then(() => n(r + 1)) : n(r + 1);
        }
      };
      return n(0);
    }
    pack_integer(e) {
      if (e >= -32 && e <= 127) this._bufferBuilder.append(e & 255);
      else if (e >= 0 && e <= 255) (this._bufferBuilder.append(204), this.pack_uint8(e));
      else if (e >= -128 && e <= 127) (this._bufferBuilder.append(208), this.pack_int8(e));
      else if (e >= 0 && e <= 65535) (this._bufferBuilder.append(205), this.pack_uint16(e));
      else if (e >= -32768 && e <= 32767) (this._bufferBuilder.append(209), this.pack_int16(e));
      else if (e >= 0 && e <= 4294967295) (this._bufferBuilder.append(206), this.pack_uint32(e));
      else if (e >= -2147483648 && e <= 2147483647)
        (this._bufferBuilder.append(210), this.pack_int32(e));
      else if (e >= -0x8000000000000000 && e <= 0x8000000000000000)
        (this._bufferBuilder.append(211), this.pack_int64(e));
      else if (e >= 0 && e <= 0x10000000000000000)
        (this._bufferBuilder.append(207), this.pack_uint64(e));
      else throw Error(`Invalid integer`);
    }
    pack_double(e) {
      let t = 0;
      e < 0 && ((t = 1), (e = -e));
      let n = Math.floor(Math.log(e) / Math.LN2),
        r = e / 2 ** n - 1,
        i = Math.floor(r * 2 ** 52),
        a = 2 ** 32,
        o = (t << 31) | ((n + 1023) << 20) | ((i / a) & 1048575),
        s = i % a;
      (this._bufferBuilder.append(203), this.pack_int32(o), this.pack_int32(s));
    }
    pack_object(e) {
      let t = Object.keys(e),
        n = t.length;
      if (n <= 15) this.pack_uint8(128 + n);
      else if (n <= 65535) (this._bufferBuilder.append(222), this.pack_uint16(n));
      else if (n <= 4294967295) (this._bufferBuilder.append(223), this.pack_uint32(n));
      else throw Error(`Invalid length`);
      let r = (n) => {
        if (n < t.length) {
          let i = t[n];
          if (e.hasOwnProperty(i)) {
            this.pack(i);
            let t = this.pack(e[i]);
            if (t instanceof Promise) return t.then(() => r(n + 1));
          }
          return r(n + 1);
        }
      };
      return r(0);
    }
    pack_uint8(e) {
      this._bufferBuilder.append(e);
    }
    pack_uint16(e) {
      (this._bufferBuilder.append(e >> 8), this._bufferBuilder.append(e & 255));
    }
    pack_uint32(e) {
      let t = e & 4294967295;
      (this._bufferBuilder.append((t & 4278190080) >>> 24),
        this._bufferBuilder.append((t & 16711680) >>> 16),
        this._bufferBuilder.append((t & 65280) >>> 8),
        this._bufferBuilder.append(t & 255));
    }
    pack_uint64(e) {
      let t = e / 2 ** 32,
        n = e % 2 ** 32;
      (this._bufferBuilder.append((t & 4278190080) >>> 24),
        this._bufferBuilder.append((t & 16711680) >>> 16),
        this._bufferBuilder.append((t & 65280) >>> 8),
        this._bufferBuilder.append(t & 255),
        this._bufferBuilder.append((n & 4278190080) >>> 24),
        this._bufferBuilder.append((n & 16711680) >>> 16),
        this._bufferBuilder.append((n & 65280) >>> 8),
        this._bufferBuilder.append(n & 255));
    }
    pack_int8(e) {
      this._bufferBuilder.append(e & 255);
    }
    pack_int16(e) {
      (this._bufferBuilder.append((e & 65280) >> 8), this._bufferBuilder.append(e & 255));
    }
    pack_int32(e) {
      (this._bufferBuilder.append((e >>> 24) & 255),
        this._bufferBuilder.append((e & 16711680) >>> 16),
        this._bufferBuilder.append((e & 65280) >>> 8),
        this._bufferBuilder.append(e & 255));
    }
    pack_int64(e) {
      let t = Math.floor(e / 2 ** 32),
        n = e % 2 ** 32;
      (this._bufferBuilder.append((t & 4278190080) >>> 24),
        this._bufferBuilder.append((t & 16711680) >>> 16),
        this._bufferBuilder.append((t & 65280) >>> 8),
        this._bufferBuilder.append(t & 255),
        this._bufferBuilder.append((n & 4278190080) >>> 24),
        this._bufferBuilder.append((n & 16711680) >>> 16),
        this._bufferBuilder.append((n & 65280) >>> 8),
        this._bufferBuilder.append(n & 255));
    }
    constructor() {
      ((this._bufferBuilder = new Ce()), (this._textEncoder = new TextEncoder()));
    }
  },
  ke = !0,
  Ae = !0;
function je(e, t, n) {
  let r = e.match(t);
  return r && r.length >= n && parseFloat(r[n], 10);
}
function Me(e, t, n) {
  if (!e.RTCPeerConnection) return;
  if (!Object.getOwnPropertyDescriptor(EventTarget.prototype, `addEventListener`).writable) {
    Fe(`Unable to polyfill events`);
    return;
  }
  let r = e.RTCPeerConnection.prototype,
    i = r.addEventListener;
  r.addEventListener = function (e, r) {
    if (e !== t) return i.apply(this, arguments);
    let a = (e) => {
      let t = n(e);
      t && (r.handleEvent ? r.handleEvent(t) : r(t));
    };
    return (
      (this._eventMap = this._eventMap || {}),
      this._eventMap[t] || (this._eventMap[t] = new Map()),
      this._eventMap[t].set(r, a),
      i.apply(this, [e, a])
    );
  };
  let a = r.removeEventListener;
  ((r.removeEventListener = function (e, n) {
    if (e !== t || !this._eventMap || !this._eventMap[t] || !this._eventMap[t].has(n))
      return a.apply(this, arguments);
    let r = this._eventMap[t].get(n);
    return (
      this._eventMap[t].delete(n),
      this._eventMap[t].size === 0 && delete this._eventMap[t],
      Object.keys(this._eventMap).length === 0 && delete this._eventMap,
      a.apply(this, [e, r])
    );
  }),
    Object.defineProperty(r, `on` + t, {
      get() {
        return this[`_on` + t];
      },
      set(e) {
        (this[`_on` + t] && (this.removeEventListener(t, this[`_on` + t]), delete this[`_on` + t]),
          e && this.addEventListener(t, (this[`_on` + t] = e)));
      },
      enumerable: !0,
      configurable: !0,
    }));
}
function Ne(e) {
  return typeof e == `boolean`
    ? ((ke = e), e ? `adapter.js logging disabled` : `adapter.js logging enabled`)
    : Error(`Argument type: ` + typeof e + `. Please use a boolean.`);
}
function Pe(e) {
  return typeof e == `boolean`
    ? ((Ae = !e), `adapter.js deprecation warnings ` + (e ? `disabled` : `enabled`))
    : Error(`Argument type: ` + typeof e + `. Please use a boolean.`);
}
function Fe() {
  if (typeof window == `object`) {
    if (ke) return;
    typeof console < `u` &&
      typeof console.log == `function` &&
      console.log.apply(console, arguments);
  }
}
function Ie(e, t) {
  Ae && console.warn(e + ` is deprecated, please use ` + t + ` instead.`);
}
function Le(e) {
  let t = { browser: null, version: null };
  if (e === void 0 || !e.navigator || !e.navigator.userAgent)
    return ((t.browser = `Not a browser.`), t);
  let { navigator: n } = e;
  if (n.userAgentData && n.userAgentData.brands) {
    let e = n.userAgentData.brands.find((e) => e.brand === `Chromium`);
    if (e) {
      let t = parseInt(e.version, 10);
      if (t >= 90) return { browser: `chrome`, version: t };
    }
  }
  if (n.mozGetUserMedia)
    ((t.browser = `firefox`), (t.version = parseInt(je(n.userAgent, /Firefox\/(\d+)\./, 1))));
  else if (n.webkitGetUserMedia || (e.isSecureContext === !1 && e.webkitRTCPeerConnection))
    ((t.browser = `chrome`),
      (t.version = parseInt(je(n.userAgent, /Chrom(e|ium)\/(\d+)\./, 2)) || null));
  else if (e.RTCPeerConnection && n.userAgent.match(/AppleWebKit\/(\d+)\./))
    ((t.browser = `safari`),
      (t.version = parseInt(je(n.userAgent, /AppleWebKit\/(\d+)\./, 1))),
      (t.supportsUnifiedPlan =
        e.RTCRtpTransceiver && `currentDirection` in e.RTCRtpTransceiver.prototype),
      (t._safariVersion = je(n.userAgent, /Version\/(\d+(\.?\d+))/, 1)));
  else return ((t.browser = `Not a supported browser.`), t);
  return t;
}
function Re(e) {
  return Object.prototype.toString.call(e) === `[object Object]`;
}
function ze(e) {
  return Re(e)
    ? Object.keys(e).reduce(function (t, n) {
        let r = Re(e[n]),
          i = r ? ze(e[n]) : e[n],
          a = r && !Object.keys(i).length;
        return i === void 0 || a ? t : Object.assign(t, { [n]: i });
      }, {})
    : e;
}
function Be(e, t, n) {
  t &&
    !n.has(t.id) &&
    (n.set(t.id, t),
    Object.keys(t).forEach((r) => {
      r.endsWith(`Id`)
        ? Be(e, e.get(t[r]), n)
        : r.endsWith(`Ids`) &&
          t[r].forEach((t) => {
            Be(e, e.get(t), n);
          });
    }));
}
function Ve(e, t, n) {
  let r = n ? `outbound-rtp` : `inbound-rtp`,
    i = new Map();
  if (t === null) return i;
  let a = [];
  return (
    e.forEach((e) => {
      e.type === `track` && e.trackIdentifier === t.id && a.push(e);
    }),
    a.forEach((t) => {
      e.forEach((n) => {
        n.type === r && n.trackId === t.id && Be(e, n, i);
      });
    }),
    i
  );
}
var He = Fe;
function Ue(e, t) {
  if (t.version >= 64) return;
  let n = e && e.navigator;
  if (!n.mediaDevices) return;
  let r = function (e) {
      if (typeof e != `object` || e.mandatory || e.optional) return e;
      let t = {};
      return (
        Object.keys(e).forEach((n) => {
          if (n === `require` || n === `advanced` || n === `mediaSource`) return;
          let r = typeof e[n] == `object` ? e[n] : { ideal: e[n] };
          r.exact !== void 0 && typeof r.exact == `number` && (r.min = r.max = r.exact);
          let i = function (e, t) {
            return e
              ? e + t.charAt(0).toUpperCase() + t.slice(1)
              : t === `deviceId`
                ? `sourceId`
                : t;
          };
          if (r.ideal !== void 0) {
            t.optional = t.optional || [];
            let e = {};
            typeof r.ideal == `number`
              ? ((e[i(`min`, n)] = r.ideal),
                t.optional.push(e),
                (e = {}),
                (e[i(`max`, n)] = r.ideal),
                t.optional.push(e))
              : ((e[i(``, n)] = r.ideal), t.optional.push(e));
          }
          r.exact !== void 0 && typeof r.exact != `number`
            ? ((t.mandatory = t.mandatory || {}), (t.mandatory[i(``, n)] = r.exact))
            : [`min`, `max`].forEach((e) => {
                r[e] !== void 0 &&
                  ((t.mandatory = t.mandatory || {}), (t.mandatory[i(e, n)] = r[e]));
              });
        }),
        e.advanced && (t.optional = (t.optional || []).concat(e.advanced)),
        t
      );
    },
    i = function (e, i) {
      if (t.version >= 61) return i(e);
      if (((e = JSON.parse(JSON.stringify(e))), e && typeof e.audio == `object`)) {
        let t = function (e, t, n) {
          t in e && !(n in e) && ((e[n] = e[t]), delete e[t]);
        };
        ((e = JSON.parse(JSON.stringify(e))),
          t(e.audio, `autoGainControl`, `googAutoGainControl`),
          t(e.audio, `noiseSuppression`, `googNoiseSuppression`),
          (e.audio = r(e.audio)));
      }
      if (e && typeof e.video == `object`) {
        let a = e.video.facingMode;
        a &&= typeof a == `object` ? a : { ideal: a };
        let o = t.version < 66;
        if (
          a &&
          (a.exact === `user` ||
            a.exact === `environment` ||
            a.ideal === `user` ||
            a.ideal === `environment`) &&
          !(
            n.mediaDevices.getSupportedConstraints &&
            n.mediaDevices.getSupportedConstraints().facingMode &&
            !o
          )
        ) {
          delete e.video.facingMode;
          let t;
          if (
            (a.exact === `environment` || a.ideal === `environment`
              ? (t = [`back`, `rear`])
              : (a.exact === `user` || a.ideal === `user`) && (t = [`front`]),
            t)
          )
            return n.mediaDevices.enumerateDevices().then((n) => {
              n = n.filter((e) => e.kind === `videoinput`);
              let o = n.find((e) => t.some((t) => e.label.toLowerCase().includes(t)));
              return (
                !o && n.length && t.includes(`back`) && (o = n[n.length - 1]),
                o && (e.video.deviceId = a.exact ? { exact: o.deviceId } : { ideal: o.deviceId }),
                (e.video = r(e.video)),
                He(`chrome: ` + JSON.stringify(e)),
                i(e)
              );
            });
        }
        e.video = r(e.video);
      }
      return (He(`chrome: ` + JSON.stringify(e)), i(e));
    },
    a = function (e) {
      return t.version >= 64
        ? e
        : {
            name:
              {
                PermissionDeniedError: `NotAllowedError`,
                PermissionDismissedError: `NotAllowedError`,
                InvalidStateError: `NotAllowedError`,
                DevicesNotFoundError: `NotFoundError`,
                ConstraintNotSatisfiedError: `OverconstrainedError`,
                TrackStartError: `NotReadableError`,
                MediaDeviceFailedDueToShutdown: `NotAllowedError`,
                MediaDeviceKillSwitchOn: `NotAllowedError`,
                TabCaptureError: `AbortError`,
                ScreenCaptureError: `AbortError`,
                DeviceCaptureError: `AbortError`,
              }[e.name] || e.name,
            message: e.message,
            constraint: e.constraint || e.constraintName,
            toString() {
              return this.name + (this.message && `: `) + this.message;
            },
          };
    };
  if (
    ((n.getUserMedia = function (e, t, r) {
      i(e, (e) => {
        n.webkitGetUserMedia(e, t, (e) => {
          r && r(a(e));
        });
      });
    }.bind(n)),
    n.mediaDevices.getUserMedia)
  ) {
    let e = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
    n.mediaDevices.getUserMedia = function (t) {
      return i(t, (t) =>
        e(t).then(
          (e) => {
            if ((t.audio && !e.getAudioTracks().length) || (t.video && !e.getVideoTracks().length))
              throw (
                e.getTracks().forEach((e) => {
                  e.stop();
                }),
                new DOMException(``, `NotFoundError`)
              );
            return e;
          },
          (e) => Promise.reject(a(e)),
        ),
      );
    };
  }
}
var We = i({
  fixNegotiationNeeded: () => Qe,
  shimAddTrackRemoveTrack: () => Xe,
  shimAddTrackRemoveTrackWithNative: () => Ye,
  shimGetSendersWithDtmf: () => qe,
  shimGetUserMedia: () => Ue,
  shimMediaStream: () => Ge,
  shimOnTrack: () => Ke,
  shimPeerConnection: () => Ze,
  shimSenderReceiverGetStats: () => Je,
});
function Ge(e) {
  e.MediaStream = e.MediaStream || e.webkitMediaStream;
}
function Ke(e, t) {
  if (!(t.version > 102)) {
    if (
      typeof e == `object` &&
      e.RTCPeerConnection &&
      !(`ontrack` in e.RTCPeerConnection.prototype)
    ) {
      Object.defineProperty(e.RTCPeerConnection.prototype, "ontrack", {
        get() {
          return this._ontrack;
        },
        set(e) {
          (this._ontrack && this.removeEventListener(`track`, this._ontrack),
            this.addEventListener(`track`, (this._ontrack = e)));
        },
        enumerable: !0,
        configurable: !0,
      });
      let t = e.RTCPeerConnection.prototype.setRemoteDescription;
      e.RTCPeerConnection.prototype.setRemoteDescription = function () {
        return (
          this._ontrackpoly ||
            ((this._ontrackpoly = (t) => {
              (t.stream.addEventListener(`addtrack`, (n) => {
                let r;
                r = e.RTCPeerConnection.prototype.getReceivers
                  ? this.getReceivers().find((e) => e.track && e.track.id === n.track.id)
                  : { track: n.track };
                let i = new Event(`track`);
                ((i.track = n.track),
                  (i.receiver = r),
                  (i.transceiver = { receiver: r }),
                  (i.streams = [t.stream]),
                  this.dispatchEvent(i));
              }),
                t.stream.getTracks().forEach((n) => {
                  let r;
                  r = e.RTCPeerConnection.prototype.getReceivers
                    ? this.getReceivers().find((e) => e.track && e.track.id === n.id)
                    : { track: n };
                  let i = new Event(`track`);
                  ((i.track = n),
                    (i.receiver = r),
                    (i.transceiver = { receiver: r }),
                    (i.streams = [t.stream]),
                    this.dispatchEvent(i));
                }));
            }),
            this.addEventListener(`addstream`, this._ontrackpoly)),
          t.apply(this, arguments)
        );
      };
    } else
      Me(
        e,
        `track`,
        (e) => (
          e.transceiver ||
            Object.defineProperty(e, "transceiver", { value: { receiver: e.receiver } }),
          e
        ),
      );
  }
}
function qe(e) {
  if (
    typeof e == `object` &&
    e.RTCPeerConnection &&
    !(`getSenders` in e.RTCPeerConnection.prototype) &&
    `createDTMFSender` in e.RTCPeerConnection.prototype
  ) {
    let t = function (e, t) {
      return {
        track: t,
        get dtmf() {
          return (
            this._dtmf === void 0 &&
              (this._dtmf = t.kind === `audio` ? e.createDTMFSender(t) : null),
            this._dtmf
          );
        },
        _pc: e,
      };
    };
    if (!e.RTCPeerConnection.prototype.getSenders) {
      e.RTCPeerConnection.prototype.getSenders = function () {
        return ((this._senders = this._senders || []), this._senders.slice());
      };
      let n = e.RTCPeerConnection.prototype.addTrack;
      e.RTCPeerConnection.prototype.addTrack = function (e, r) {
        let i = n.apply(this, arguments);
        return (i || ((i = t(this, e)), this._senders.push(i)), i);
      };
      let r = e.RTCPeerConnection.prototype.removeTrack;
      e.RTCPeerConnection.prototype.removeTrack = function (e) {
        r.apply(this, arguments);
        let t = this._senders.indexOf(e);
        t !== -1 && this._senders.splice(t, 1);
      };
    }
    let n = e.RTCPeerConnection.prototype.addStream;
    e.RTCPeerConnection.prototype.addStream = function (e) {
      ((this._senders = this._senders || []),
        n.apply(this, [e]),
        e.getTracks().forEach((e) => {
          this._senders.push(t(this, e));
        }));
    };
    let r = e.RTCPeerConnection.prototype.removeStream;
    e.RTCPeerConnection.prototype.removeStream = function (e) {
      ((this._senders = this._senders || []),
        r.apply(this, [e]),
        e.getTracks().forEach((e) => {
          let t = this._senders.find((t) => t.track === e);
          t && this._senders.splice(this._senders.indexOf(t), 1);
        }));
    };
  } else if (
    typeof e == `object` &&
    e.RTCPeerConnection &&
    `getSenders` in e.RTCPeerConnection.prototype &&
    `createDTMFSender` in e.RTCPeerConnection.prototype &&
    e.RTCRtpSender &&
    !(`dtmf` in e.RTCRtpSender.prototype)
  ) {
    let t = e.RTCPeerConnection.prototype.getSenders;
    ((e.RTCPeerConnection.prototype.getSenders = function () {
      let e = t.apply(this, []);
      return (e.forEach((e) => (e._pc = this)), e);
    }),
      Object.defineProperty(e.RTCRtpSender.prototype, "dtmf", {
        get() {
          return (
            this._dtmf === void 0 &&
              (this._dtmf =
                this.track.kind === `audio` ? this._pc.createDTMFSender(this.track) : null),
            this._dtmf
          );
        },
      }));
  }
}
function Je(e, t) {
  if (
    t.version >= 67 ||
    !(typeof e == `object` && e.RTCPeerConnection && e.RTCRtpSender && e.RTCRtpReceiver)
  )
    return;
  if (!(`getStats` in e.RTCRtpSender.prototype)) {
    let t = e.RTCPeerConnection.prototype.getSenders;
    t &&
      (e.RTCPeerConnection.prototype.getSenders = function () {
        let e = t.apply(this, []);
        return (e.forEach((e) => (e._pc = this)), e);
      });
    let n = e.RTCPeerConnection.prototype.addTrack;
    (n &&
      (e.RTCPeerConnection.prototype.addTrack = function () {
        let e = n.apply(this, arguments);
        return ((e._pc = this), e);
      }),
      (e.RTCRtpSender.prototype.getStats = function () {
        let e = this;
        return this._pc.getStats().then((t) => Ve(t, e.track, !0));
      }));
  }
  if (!(`getStats` in e.RTCRtpReceiver.prototype)) {
    let t = e.RTCPeerConnection.prototype.getReceivers;
    (t &&
      (e.RTCPeerConnection.prototype.getReceivers = function () {
        let e = t.apply(this, []);
        return (e.forEach((e) => (e._pc = this)), e);
      }),
      Me(e, `track`, (e) => ((e.receiver._pc = e.srcElement), e)),
      (e.RTCRtpReceiver.prototype.getStats = function () {
        let e = this;
        return this._pc.getStats().then((t) => Ve(t, e.track, !1));
      }));
  }
  if (!(`getStats` in e.RTCRtpSender.prototype && `getStats` in e.RTCRtpReceiver.prototype)) return;
  let n = e.RTCPeerConnection.prototype.getStats;
  e.RTCPeerConnection.prototype.getStats = function () {
    if (arguments.length > 0 && arguments[0] instanceof e.MediaStreamTrack) {
      let e = arguments[0],
        t,
        n,
        r;
      return (
        this.getSenders().forEach((n) => {
          n.track === e && (t ? (r = !0) : (t = n));
        }),
        this.getReceivers().forEach(
          (t) => (t.track === e && (n ? (r = !0) : (n = t)), t.track === e),
        ),
        r || (t && n)
          ? Promise.reject(
              new DOMException(
                `There are more than one sender or receiver for the track.`,
                `InvalidAccessError`,
              ),
            )
          : t
            ? t.getStats()
            : n
              ? n.getStats()
              : Promise.reject(
                  new DOMException(
                    `There is no sender or receiver for the track.`,
                    `InvalidAccessError`,
                  ),
                )
      );
    }
    return n.apply(this, arguments);
  };
}
function Ye(e) {
  e.RTCPeerConnection.prototype.getLocalStreams = function () {
    return (
      (this._shimmedLocalStreams = this._shimmedLocalStreams || {}),
      Object.keys(this._shimmedLocalStreams).map((e) => this._shimmedLocalStreams[e][0])
    );
  };
  let t = e.RTCPeerConnection.prototype.addTrack;
  e.RTCPeerConnection.prototype.addTrack = function (e, n) {
    if (!n) return t.apply(this, arguments);
    this._shimmedLocalStreams = this._shimmedLocalStreams || {};
    let r = t.apply(this, arguments);
    return (
      this._shimmedLocalStreams[n.id]
        ? this._shimmedLocalStreams[n.id].indexOf(r) === -1 &&
          this._shimmedLocalStreams[n.id].push(r)
        : (this._shimmedLocalStreams[n.id] = [n, r]),
      r
    );
  };
  let n = e.RTCPeerConnection.prototype.addStream;
  e.RTCPeerConnection.prototype.addStream = function (e) {
    ((this._shimmedLocalStreams = this._shimmedLocalStreams || {}),
      e.getTracks().forEach((e) => {
        if (this.getSenders().find((t) => t.track === e))
          throw new DOMException(`Track already exists.`, `InvalidAccessError`);
      }));
    let t = this.getSenders();
    n.apply(this, arguments);
    let r = this.getSenders().filter((e) => t.indexOf(e) === -1);
    this._shimmedLocalStreams[e.id] = [e].concat(r);
  };
  let r = e.RTCPeerConnection.prototype.removeStream;
  e.RTCPeerConnection.prototype.removeStream = function (e) {
    return (
      (this._shimmedLocalStreams = this._shimmedLocalStreams || {}),
      delete this._shimmedLocalStreams[e.id],
      r.apply(this, arguments)
    );
  };
  let i = e.RTCPeerConnection.prototype.removeTrack;
  e.RTCPeerConnection.prototype.removeTrack = function (e) {
    return (
      (this._shimmedLocalStreams = this._shimmedLocalStreams || {}),
      e &&
        Object.keys(this._shimmedLocalStreams).forEach((t) => {
          let n = this._shimmedLocalStreams[t].indexOf(e);
          (n !== -1 && this._shimmedLocalStreams[t].splice(n, 1),
            this._shimmedLocalStreams[t].length === 1 && delete this._shimmedLocalStreams[t]);
        }),
      i.apply(this, arguments)
    );
  };
}
function Xe(e, t) {
  if (!e.RTCPeerConnection) return;
  if (e.RTCPeerConnection.prototype.addTrack && t.version >= 65) return Ye(e);
  let n = e.RTCPeerConnection.prototype.getLocalStreams;
  e.RTCPeerConnection.prototype.getLocalStreams = function () {
    let e = n.apply(this);
    return (
      (this._reverseStreams = this._reverseStreams || {}),
      e.map((e) => this._reverseStreams[e.id])
    );
  };
  let r = e.RTCPeerConnection.prototype.addStream;
  e.RTCPeerConnection.prototype.addStream = function (t) {
    if (
      ((this._streams = this._streams || {}),
      (this._reverseStreams = this._reverseStreams || {}),
      t.getTracks().forEach((e) => {
        if (this.getSenders().find((t) => t.track === e))
          throw new DOMException(`Track already exists.`, `InvalidAccessError`);
      }),
      !this._reverseStreams[t.id])
    ) {
      let n = new e.MediaStream(t.getTracks());
      ((this._streams[t.id] = n), (this._reverseStreams[n.id] = t), (t = n));
    }
    r.apply(this, [t]);
  };
  let i = e.RTCPeerConnection.prototype.removeStream;
  ((e.RTCPeerConnection.prototype.removeStream = function (e) {
    ((this._streams = this._streams || {}),
      (this._reverseStreams = this._reverseStreams || {}),
      i.apply(this, [this._streams[e.id] || e]),
      delete this._reverseStreams[this._streams[e.id] ? this._streams[e.id].id : e.id],
      delete this._streams[e.id]);
  }),
    (e.RTCPeerConnection.prototype.addTrack = function (t, n) {
      if (this.signalingState === `closed`)
        throw new DOMException(
          `The RTCPeerConnection's signalingState is 'closed'.`,
          `InvalidStateError`,
        );
      let r = [].slice.call(arguments, 1);
      if (r.length !== 1 || !r[0].getTracks().find((e) => e === t))
        throw new DOMException(
          `The adapter.js addTrack polyfill only supports a single  stream which is associated with the specified track.`,
          `NotSupportedError`,
        );
      if (this.getSenders().find((e) => e.track === t))
        throw new DOMException(`Track already exists.`, `InvalidAccessError`);
      ((this._streams = this._streams || {}), (this._reverseStreams = this._reverseStreams || {}));
      let i = this._streams[n.id];
      if (i)
        (i.addTrack(t),
          Promise.resolve().then(() => {
            this.dispatchEvent(new Event(`negotiationneeded`));
          }));
      else {
        let r = new e.MediaStream([t]);
        ((this._streams[n.id] = r), (this._reverseStreams[r.id] = n), this.addStream(r));
      }
      return this.getSenders().find((e) => e.track === t);
    }));
  function a(e, t) {
    let n = t.sdp;
    return (
      Object.keys(e._reverseStreams || []).forEach((t) => {
        let r = e._reverseStreams[t],
          i = e._streams[r.id];
        n = n.replace(new RegExp(i.id, `g`), r.id);
      }),
      new RTCSessionDescription({ type: t.type, sdp: n })
    );
  }
  function o(e, t) {
    let n = t.sdp;
    return (
      Object.keys(e._reverseStreams || []).forEach((t) => {
        let r = e._reverseStreams[t],
          i = e._streams[r.id];
        n = n.replace(new RegExp(r.id, `g`), i.id);
      }),
      new RTCSessionDescription({ type: t.type, sdp: n })
    );
  }
  [`createOffer`, `createAnswer`].forEach(function (t) {
    let n = e.RTCPeerConnection.prototype[t],
      r = {
        [t]() {
          let e = arguments;
          return arguments.length && typeof arguments[0] == `function`
            ? n.apply(this, [
                (t) => {
                  let n = a(this, t);
                  e[0].apply(null, [n]);
                },
                (t) => {
                  e[1] && e[1].apply(null, t);
                },
                arguments[2],
              ])
            : n.apply(this, arguments).then((e) => a(this, e));
        },
      };
    e.RTCPeerConnection.prototype[t] = r[t];
  });
  let s = e.RTCPeerConnection.prototype.setLocalDescription;
  e.RTCPeerConnection.prototype.setLocalDescription = function () {
    return (
      !arguments.length || !arguments[0].type || (arguments[0] = o(this, arguments[0])),
      s.apply(this, arguments)
    );
  };
  let c = Object.getOwnPropertyDescriptor(e.RTCPeerConnection.prototype, `localDescription`);
  (Object.defineProperty(e.RTCPeerConnection.prototype, "localDescription", {
    get() {
      let e = c.get.apply(this);
      return e.type === `` ? e : a(this, e);
    },
  }),
    (e.RTCPeerConnection.prototype.removeTrack = function (e) {
      if (this.signalingState === `closed`)
        throw new DOMException(
          `The RTCPeerConnection's signalingState is 'closed'.`,
          `InvalidStateError`,
        );
      if (!e._pc)
        throw new DOMException(
          `Argument 1 of RTCPeerConnection.removeTrack does not implement interface RTCRtpSender.`,
          `TypeError`,
        );
      if (e._pc !== this)
        throw new DOMException(`Sender was not created by this connection.`, `InvalidAccessError`);
      this._streams = this._streams || {};
      let t;
      (Object.keys(this._streams).forEach((n) => {
        this._streams[n].getTracks().find((t) => e.track === t) && (t = this._streams[n]);
      }),
        t &&
          (t.getTracks().length === 1
            ? this.removeStream(this._reverseStreams[t.id])
            : t.removeTrack(e.track),
          this.dispatchEvent(new Event(`negotiationneeded`))));
    }));
}
function Ze(e, t) {
  (!e.RTCPeerConnection &&
    e.webkitRTCPeerConnection &&
    (e.RTCPeerConnection = e.webkitRTCPeerConnection),
    e.RTCPeerConnection &&
      t.version < 53 &&
      [`setLocalDescription`, `setRemoteDescription`, `addIceCandidate`].forEach(function (t) {
        let n = e.RTCPeerConnection.prototype[t],
          r = {
            [t]() {
              return (
                (arguments[0] = new (
                  t === `addIceCandidate` ? e.RTCIceCandidate : e.RTCSessionDescription
                )(arguments[0])),
                n.apply(this, arguments)
              );
            },
          };
        e.RTCPeerConnection.prototype[t] = r[t];
      }));
}
function Qe(e, t) {
  t.version > 102 ||
    Me(e, `negotiationneeded`, (e) => {
      let n = e.target;
      if (!(
        (t.version < 72 ||
          (n.getConfiguration && n.getConfiguration().sdpSemantics === `plan-b`)) &&
        n.signalingState !== `stable`
      ))
        return e;
    });
}
function $e(e, t) {
  let n = e && e.navigator;
  if (!n.mediaDevices) return;
  let r = e && e.MediaStreamTrack;
  if (
    ((n.getUserMedia = function (e, t, r) {
      (Ie(`navigator.getUserMedia`, `navigator.mediaDevices.getUserMedia`),
        n.mediaDevices.getUserMedia(e).then(t, r));
    }),
    !(t.version > 55 && `autoGainControl` in n.mediaDevices.getSupportedConstraints()))
  ) {
    let e = function (e, t, n) {
        t in e && !(n in e) && ((e[n] = e[t]), delete e[t]);
      },
      t = n.mediaDevices.getUserMedia.bind(n.mediaDevices);
    if (
      ((n.mediaDevices.getUserMedia = function (n) {
        return (
          typeof n == `object` &&
            typeof n.audio == `object` &&
            ((n = JSON.parse(JSON.stringify(n))),
            e(n.audio, `autoGainControl`, `mozAutoGainControl`),
            e(n.audio, `noiseSuppression`, `mozNoiseSuppression`)),
          t(n)
        );
      }),
      r && r.prototype.getSettings)
    ) {
      let t = r.prototype.getSettings;
      r.prototype.getSettings = function () {
        let n = t.apply(this, arguments);
        return (
          e(n, `mozAutoGainControl`, `autoGainControl`),
          e(n, `mozNoiseSuppression`, `noiseSuppression`),
          n
        );
      };
    }
    if (r && r.prototype.applyConstraints) {
      let t = r.prototype.applyConstraints;
      r.prototype.applyConstraints = function (n) {
        return (
          this.kind === `audio` &&
            typeof n == `object` &&
            ((n = JSON.parse(JSON.stringify(n))),
            e(n, `autoGainControl`, `mozAutoGainControl`),
            e(n, `noiseSuppression`, `mozNoiseSuppression`)),
          t.apply(this, [n])
        );
      };
    }
  }
}
function et(e, t) {
  e.navigator.mediaDevices &&
    ((e.navigator.mediaDevices && `getDisplayMedia` in e.navigator.mediaDevices) ||
      (e.navigator.mediaDevices.getDisplayMedia = function (n) {
        if (!(n && n.video)) {
          let e = new DOMException(`getDisplayMedia without video constraints is undefined`);
          return ((e.name = `NotFoundError`), (e.code = 8), Promise.reject(e));
        }
        return (
          n.video === !0 ? (n.video = { mediaSource: t }) : (n.video.mediaSource = t),
          e.navigator.mediaDevices.getUserMedia(n)
        );
      }));
}
var tt = i({
  shimAddTransceiver: () => lt,
  shimCreateAnswer: () => ft,
  shimCreateOffer: () => dt,
  shimGetDisplayMedia: () => et,
  shimGetParameters: () => ut,
  shimGetStats: () => it,
  shimGetUserMedia: () => $e,
  shimOnTrack: () => nt,
  shimPeerConnection: () => rt,
  shimRTCDataChannel: () => ct,
  shimReceiverGetStats: () => ot,
  shimRemoveStream: () => st,
  shimSenderGetStats: () => at,
});
function nt(e) {
  typeof e == `object` &&
    e.RTCTrackEvent &&
    `receiver` in e.RTCTrackEvent.prototype &&
    !(`transceiver` in e.RTCTrackEvent.prototype) &&
    Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      },
    });
}
function rt(e, t) {
  typeof e == `object` &&
    (e.RTCPeerConnection || e.mozRTCPeerConnection) &&
    (!e.RTCPeerConnection &&
      e.mozRTCPeerConnection &&
      (e.RTCPeerConnection = e.mozRTCPeerConnection),
    t.version < 53 &&
      [`setLocalDescription`, `setRemoteDescription`, `addIceCandidate`].forEach(function (t) {
        let n = e.RTCPeerConnection.prototype[t],
          r = {
            [t]() {
              return (
                (arguments[0] = new (
                  t === `addIceCandidate` ? e.RTCIceCandidate : e.RTCSessionDescription
                )(arguments[0])),
                n.apply(this, arguments)
              );
            },
          };
        e.RTCPeerConnection.prototype[t] = r[t];
      }));
}
function it(e, t) {
  if (typeof e != `object` || !(e.RTCPeerConnection || e.mozRTCPeerConnection) || t.version >= 151)
    return;
  let n = {
      inboundrtp: `inbound-rtp`,
      outboundrtp: `outbound-rtp`,
      candidatepair: `candidate-pair`,
      localcandidate: `local-candidate`,
      remotecandidate: `remote-candidate`,
    },
    r = e.RTCPeerConnection.prototype.getStats;
  e.RTCPeerConnection.prototype.getStats = function () {
    let [e, i, a] = arguments;
    return this.signalingState === `closed`
      ? Promise.resolve(new Map())
      : r
          .apply(this, [e || null])
          .then((e) => {
            if (t.version < 53 && !i)
              try {
                e.forEach((e) => {
                  e.type = n[e.type] || e.type;
                });
              } catch (t) {
                if (t.name !== `TypeError`) throw t;
                e.forEach((t, r) => {
                  e.set(r, Object.assign({}, t, { type: n[t.type] || t.type }));
                });
              }
            return e;
          })
          .then(i, a);
  };
}
function at(e) {
  if (
    !(typeof e == `object` && e.RTCPeerConnection && e.RTCRtpSender) ||
    (e.RTCRtpSender && `getStats` in e.RTCRtpSender.prototype)
  )
    return;
  let t = e.RTCPeerConnection.prototype.getSenders;
  t &&
    (e.RTCPeerConnection.prototype.getSenders = function () {
      let e = t.apply(this, []);
      return (e.forEach((e) => (e._pc = this)), e);
    });
  let n = e.RTCPeerConnection.prototype.addTrack;
  (n &&
    (e.RTCPeerConnection.prototype.addTrack = function () {
      let e = n.apply(this, arguments);
      return ((e._pc = this), e);
    }),
    (e.RTCRtpSender.prototype.getStats = function () {
      return this.track ? this._pc.getStats(this.track) : Promise.resolve(new Map());
    }));
}
function ot(e) {
  if (
    !(typeof e == `object` && e.RTCPeerConnection && e.RTCRtpSender) ||
    (e.RTCRtpSender && `getStats` in e.RTCRtpReceiver.prototype)
  )
    return;
  let t = e.RTCPeerConnection.prototype.getReceivers;
  (t &&
    (e.RTCPeerConnection.prototype.getReceivers = function () {
      let e = t.apply(this, []);
      return (e.forEach((e) => (e._pc = this)), e);
    }),
    Me(e, `track`, (e) => ((e.receiver._pc = e.srcElement), e)),
    (e.RTCRtpReceiver.prototype.getStats = function () {
      return this._pc.getStats(this.track);
    }));
}
function st(e) {
  !e.RTCPeerConnection ||
    `removeStream` in e.RTCPeerConnection.prototype ||
    (e.RTCPeerConnection.prototype.removeStream = function (e) {
      (Ie(`removeStream`, `removeTrack`),
        this.getSenders().forEach((t) => {
          t.track && e.getTracks().includes(t.track) && this.removeTrack(t);
        }));
    });
}
function ct(e) {
  e.DataChannel && !e.RTCDataChannel && (e.RTCDataChannel = e.DataChannel);
}
function lt(e, t) {
  if (!(typeof e == `object` && e.RTCPeerConnection) || t.version >= 110) return;
  let n = e.RTCPeerConnection.prototype.addTransceiver;
  n &&
    (e.RTCPeerConnection.prototype.addTransceiver = function () {
      this.setParametersPromises = [];
      let e = arguments[1] && arguments[1].sendEncodings;
      (e === void 0 && (e = []), (e = [...e]));
      let t = e.length > 0;
      t &&
        e.forEach((e) => {
          if (`rid` in e && !/^[a-z0-9]{0,16}$/i.test(e.rid))
            throw TypeError(`Invalid RID value provided.`);
          if (`scaleResolutionDownBy` in e && !(parseFloat(e.scaleResolutionDownBy) >= 1))
            throw RangeError(`scale_resolution_down_by must be >= 1.0`);
          if (`maxFramerate` in e && !(parseFloat(e.maxFramerate) >= 0))
            throw RangeError(`max_framerate must be >= 0.0`);
        });
      let r = n.apply(this, arguments);
      if (t) {
        let { sender: t } = r,
          n = t.getParameters();
        (!(`encodings` in n) ||
          (n.encodings.length === 1 && Object.keys(n.encodings[0]).length === 0)) &&
          ((n.encodings = e),
          (t.sendEncodings = e),
          this.setParametersPromises.push(
            t
              .setParameters(n)
              .then(() => {
                delete t.sendEncodings;
              })
              .catch(() => {
                delete t.sendEncodings;
              }),
          ));
      }
      return r;
    });
}
function ut(e, t) {
  if (!(typeof e == `object` && e.RTCRtpSender) || t.version >= 110) return;
  let n = e.RTCRtpSender.prototype.getParameters;
  n &&
    (e.RTCRtpSender.prototype.getParameters = function () {
      let e = n.apply(this, arguments);
      return (`encodings` in e || (e.encodings = [].concat(this.sendEncodings || [{}])), e);
    });
}
function dt(e, t) {
  if (!(typeof e == `object` && e.RTCPeerConnection) || t.version >= 110) return;
  let n = e.RTCPeerConnection.prototype.createOffer;
  e.RTCPeerConnection.prototype.createOffer = function () {
    return this.setParametersPromises && this.setParametersPromises.length
      ? Promise.all(this.setParametersPromises)
          .then(() => n.apply(this, arguments))
          .finally(() => {
            this.setParametersPromises = [];
          })
      : n.apply(this, arguments);
  };
}
function ft(e, t) {
  if (!(typeof e == `object` && e.RTCPeerConnection) || t.version >= 110) return;
  let n = e.RTCPeerConnection.prototype.createAnswer;
  e.RTCPeerConnection.prototype.createAnswer = function () {
    return this.setParametersPromises && this.setParametersPromises.length
      ? Promise.all(this.setParametersPromises)
          .then(() => n.apply(this, arguments))
          .finally(() => {
            this.setParametersPromises = [];
          })
      : n.apply(this, arguments);
  };
}
var pt = i({
  shimAudioContext: () => St,
  shimCallbacksAPI: () => gt,
  shimConstraints: () => vt,
  shimCreateOfferLegacy: () => xt,
  shimGetUserMedia: () => _t,
  shimLocalStreamsAPI: () => mt,
  shimRTCIceServerUrls: () => yt,
  shimRemoteStreamsAPI: () => ht,
  shimTrackEventTransceiver: () => bt,
});
function mt(e) {
  if (typeof e == `object` && e.RTCPeerConnection) {
    if (
      (`getLocalStreams` in e.RTCPeerConnection.prototype ||
        (e.RTCPeerConnection.prototype.getLocalStreams = function () {
          return ((this._localStreams ||= []), this._localStreams);
        }),
      !(`addStream` in e.RTCPeerConnection.prototype))
    ) {
      let t = e.RTCPeerConnection.prototype.addTrack;
      ((e.RTCPeerConnection.prototype.addStream = function (e) {
        ((this._localStreams ||= []),
          this._localStreams.includes(e) || this._localStreams.push(e),
          e.getAudioTracks().forEach((n) => t.call(this, n, e)),
          e.getVideoTracks().forEach((n) => t.call(this, n, e)));
      }),
        (e.RTCPeerConnection.prototype.addTrack = function (e, ...n) {
          return (
            n &&
              n.forEach((e) => {
                this._localStreams
                  ? this._localStreams.includes(e) || this._localStreams.push(e)
                  : (this._localStreams = [e]);
              }),
            t.apply(this, arguments)
          );
        }));
    }
    `removeStream` in e.RTCPeerConnection.prototype ||
      (e.RTCPeerConnection.prototype.removeStream = function (e) {
        this._localStreams ||= [];
        let t = this._localStreams.indexOf(e);
        if (t === -1) return;
        this._localStreams.splice(t, 1);
        let n = e.getTracks();
        this.getSenders().forEach((e) => {
          n.includes(e.track) && this.removeTrack(e);
        });
      });
  }
}
function ht(e) {
  if (
    typeof e == `object` &&
    e.RTCPeerConnection &&
    (`getRemoteStreams` in e.RTCPeerConnection.prototype ||
      (e.RTCPeerConnection.prototype.getRemoteStreams = function () {
        return this._remoteStreams ? this._remoteStreams : [];
      }),
    !(`onaddstream` in e.RTCPeerConnection.prototype))
  ) {
    Object.defineProperty(e.RTCPeerConnection.prototype, "onaddstream", {
      get() {
        return this._onaddstream;
      },
      set(e) {
        (this._onaddstream &&
          (this.removeEventListener(`addstream`, this._onaddstream),
          this.removeEventListener(`track`, this._onaddstreampoly)),
          this.addEventListener(`addstream`, (this._onaddstream = e)),
          this.addEventListener(
            `track`,
            (this._onaddstreampoly = (e) => {
              e.streams.forEach((e) => {
                if (((this._remoteStreams ||= []), this._remoteStreams.includes(e))) return;
                this._remoteStreams.push(e);
                let t = new Event(`addstream`);
                ((t.stream = e), this.dispatchEvent(t));
              });
            }),
          ));
      },
    });
    let t = e.RTCPeerConnection.prototype.setRemoteDescription;
    e.RTCPeerConnection.prototype.setRemoteDescription = function () {
      let e = this;
      return (
        this._onaddstreampoly ||
          this.addEventListener(
            `track`,
            (this._onaddstreampoly = function (t) {
              t.streams.forEach((t) => {
                if (((e._remoteStreams ||= []), e._remoteStreams.indexOf(t) >= 0)) return;
                e._remoteStreams.push(t);
                let n = new Event(`addstream`);
                ((n.stream = t), e.dispatchEvent(n));
              });
            }),
          ),
        t.apply(e, arguments)
      );
    };
  }
}
function gt(e) {
  if (typeof e != `object` || !e.RTCPeerConnection) return;
  let t = e.RTCPeerConnection.prototype,
    n = t.createOffer,
    r = t.createAnswer,
    i = t.setLocalDescription,
    a = t.setRemoteDescription,
    o = t.addIceCandidate;
  ((t.createOffer = function (e, t) {
    let r = arguments.length >= 2 ? arguments[2] : arguments[0],
      i = n.apply(this, [r]);
    return t ? (i.then(e, t), Promise.resolve()) : i;
  }),
    (t.createAnswer = function (e, t) {
      let n = arguments.length >= 2 ? arguments[2] : arguments[0],
        i = r.apply(this, [n]);
      return t ? (i.then(e, t), Promise.resolve()) : i;
    }));
  let s = function (e, t, n) {
    let r = i.apply(this, [e]);
    return n ? (r.then(t, n), Promise.resolve()) : r;
  };
  ((t.setLocalDescription = s),
    (s = function (e, t, n) {
      let r = a.apply(this, [e]);
      return n ? (r.then(t, n), Promise.resolve()) : r;
    }),
    (t.setRemoteDescription = s),
    (s = function (e, t, n) {
      let r = o.apply(this, [e]);
      return n ? (r.then(t, n), Promise.resolve()) : r;
    }),
    (t.addIceCandidate = s));
}
function _t(e) {
  let t = e && e.navigator;
  if (t.mediaDevices && t.mediaDevices.getUserMedia) {
    let e = t.mediaDevices,
      n = e.getUserMedia.bind(e);
    t.mediaDevices.getUserMedia = (e) => n(vt(e));
  }
  !t.getUserMedia &&
    t.mediaDevices &&
    t.mediaDevices.getUserMedia &&
    (t.getUserMedia = function (e, n, r) {
      t.mediaDevices.getUserMedia(e).then(n, r);
    }.bind(t));
}
function vt(e) {
  return e && e.video !== void 0 ? Object.assign({}, e, { video: ze(e.video) }) : e;
}
function yt(e) {
  if (!e.RTCPeerConnection) return;
  let t = e.RTCPeerConnection;
  ((e.RTCPeerConnection = function (e, n) {
    if (e && e.iceServers) {
      let t = [];
      for (let n = 0; n < e.iceServers.length; n++) {
        let r = e.iceServers[n];
        r.urls === void 0 && r.url
          ? (Ie(`RTCIceServer.url`, `RTCIceServer.urls`),
            (r = JSON.parse(JSON.stringify(r))),
            (r.urls = r.url),
            delete r.url,
            t.push(r))
          : t.push(e.iceServers[n]);
      }
      e.iceServers = t;
    }
    return new t(e, n);
  }),
    (e.RTCPeerConnection.prototype = t.prototype),
    `generateCertificate` in t &&
      Object.defineProperty(e.RTCPeerConnection, "generateCertificate", {
        get() {
          return t.generateCertificate;
        },
      }));
}
function bt(e) {
  typeof e == `object` &&
    e.RTCTrackEvent &&
    `receiver` in e.RTCTrackEvent.prototype &&
    !(`transceiver` in e.RTCTrackEvent.prototype) &&
    Object.defineProperty(e.RTCTrackEvent.prototype, "transceiver", {
      get() {
        return { receiver: this.receiver };
      },
    });
}
function xt(e) {
  let t = e.RTCPeerConnection.prototype.createOffer;
  e.RTCPeerConnection.prototype.createOffer = function (e) {
    if (e) {
      e.offerToReceiveAudio !== void 0 && (e.offerToReceiveAudio = !!e.offerToReceiveAudio);
      let t = this.getTransceivers().find((e) => e.receiver.track.kind === `audio`);
      (e.offerToReceiveAudio === !1 && t
        ? t.direction === `sendrecv`
          ? t.setDirection
            ? t.setDirection(`sendonly`)
            : (t.direction = `sendonly`)
          : t.direction === `recvonly` &&
            (t.setDirection ? t.setDirection(`inactive`) : (t.direction = `inactive`))
        : e.offerToReceiveAudio === !0 &&
          !t &&
          this.addTransceiver(`audio`, { direction: `recvonly` }),
        e.offerToReceiveVideo !== void 0 && (e.offerToReceiveVideo = !!e.offerToReceiveVideo));
      let n = this.getTransceivers().find((e) => e.receiver.track.kind === `video`);
      e.offerToReceiveVideo === !1 && n
        ? n.direction === `sendrecv`
          ? n.setDirection
            ? n.setDirection(`sendonly`)
            : (n.direction = `sendonly`)
          : n.direction === `recvonly` &&
            (n.setDirection ? n.setDirection(`inactive`) : (n.direction = `inactive`))
        : e.offerToReceiveVideo === !0 &&
          !n &&
          this.addTransceiver(`video`, { direction: `recvonly` });
    }
    return t.apply(this, arguments);
  };
}
function St(e) {
  typeof e != `object` || e.AudioContext || (e.AudioContext = e.webkitAudioContext);
}
var Ct = r((e, t) => {
    var n = {};
    ((n.generateIdentifier = function () {
      return Math.random().toString(36).substring(2, 12);
    }),
      (n.localCName = n.generateIdentifier()),
      (n.splitLines = function (e) {
        return e
          .trim()
          .split(
            `
`,
          )
          .map((e) => e.trim());
      }),
      (n.splitSections = function (e) {
        return e
          .split(
            `
m=`,
          )
          .map(
            (e, t) =>
              (t > 0 ? `m=` + e : e).trim() +
              `\r
`,
          );
      }),
      (n.getDescription = function (e) {
        let t = n.splitSections(e);
        return t && t[0];
      }),
      (n.getMediaSections = function (e) {
        let t = n.splitSections(e);
        return (t.shift(), t);
      }),
      (n.matchPrefix = function (e, t) {
        return n.splitLines(e).filter((e) => e.indexOf(t) === 0);
      }),
      (n.parseCandidate = function (e) {
        let t;
        t =
          e.indexOf(`a=candidate:`) === 0 ? e.substring(12).split(` `) : e.substring(10).split(` `);
        let n = {
          foundation: t[0],
          component: { 1: `rtp`, 2: `rtcp` }[t[1]] || t[1],
          protocol: t[2].toLowerCase(),
          priority: parseInt(t[3], 10),
          ip: t[4],
          address: t[4],
          port: parseInt(t[5], 10),
          type: t[7],
        };
        for (let e = 8; e < t.length; e += 2)
          switch (t[e]) {
            case `raddr`:
              n.relatedAddress = t[e + 1];
              break;
            case `rport`:
              n.relatedPort = parseInt(t[e + 1], 10);
              break;
            case `tcptype`:
              n.tcpType = t[e + 1];
              break;
            case `ufrag`:
              ((n.ufrag = t[e + 1]), (n.usernameFragment = t[e + 1]));
              break;
            default:
              n[t[e]] === void 0 && (n[t[e]] = t[e + 1]);
          }
        return n;
      }),
      (n.writeCandidate = function (e) {
        let t = [];
        t.push(e.foundation);
        let n = e.component;
        (n === `rtp` ? t.push(1) : n === `rtcp` ? t.push(2) : t.push(n),
          t.push(e.protocol.toUpperCase()),
          t.push(e.priority),
          t.push(e.address || e.ip),
          t.push(e.port));
        let r = e.type;
        return (
          t.push(`typ`),
          t.push(r),
          r !== `host` &&
            e.relatedAddress &&
            e.relatedPort !== void 0 &&
            (t.push(`raddr`), t.push(e.relatedAddress), t.push(`rport`), t.push(e.relatedPort)),
          e.tcpType && e.protocol.toLowerCase() === `tcp` && (t.push(`tcptype`), t.push(e.tcpType)),
          (e.usernameFragment || e.ufrag) &&
            (t.push(`ufrag`), t.push(e.usernameFragment || e.ufrag)),
          `candidate:` + t.join(` `)
        );
      }),
      (n.parseIceOptions = function (e) {
        return e.substring(14).split(` `);
      }),
      (n.parseRtpMap = function (e) {
        let t = e.substring(9).split(` `),
          n = { payloadType: parseInt(t.shift(), 10) };
        return (
          (t = t[0].split(`/`)),
          (n.name = t[0]),
          (n.clockRate = parseInt(t[1], 10)),
          (n.channels = t.length === 3 ? parseInt(t[2], 10) : 1),
          (n.numChannels = n.channels),
          n
        );
      }),
      (n.writeRtpMap = function (e) {
        let t = e.payloadType;
        e.preferredPayloadType !== void 0 && (t = e.preferredPayloadType);
        let n = e.channels || e.numChannels || 1;
        return (
          `a=rtpmap:` +
          t +
          ` ` +
          e.name +
          `/` +
          e.clockRate +
          (n === 1 ? `` : `/` + n) +
          `\r
`
        );
      }),
      (n.parseExtmap = function (e) {
        let t = e.substring(9).split(` `);
        return {
          id: parseInt(t[0], 10),
          direction: t[0].indexOf(`/`) > 0 ? t[0].split(`/`)[1] : `sendrecv`,
          uri: t[1],
          attributes: t.slice(2).join(` `),
        };
      }),
      (n.writeExtmap = function (e) {
        return (
          `a=extmap:` +
          (e.id || e.preferredId) +
          (e.direction && e.direction !== `sendrecv` ? `/` + e.direction : ``) +
          ` ` +
          e.uri +
          (e.attributes ? ` ` + e.attributes : ``) +
          `\r
`
        );
      }),
      (n.parseFmtp = function (e) {
        let t = {},
          n,
          r = e.substring(e.indexOf(` `) + 1).split(`;`);
        for (let e = 0; e < r.length; e++) ((n = r[e].trim().split(`=`)), (t[n[0].trim()] = n[1]));
        return t;
      }),
      (n.writeFmtp = function (e) {
        let t = ``,
          n = e.payloadType;
        if (
          (e.preferredPayloadType !== void 0 && (n = e.preferredPayloadType),
          e.parameters && Object.keys(e.parameters).length)
        ) {
          let r = [];
          (Object.keys(e.parameters).forEach((t) => {
            e.parameters[t] === void 0 ? r.push(t) : r.push(t + `=` + e.parameters[t]);
          }),
            (t +=
              `a=fmtp:` +
              n +
              ` ` +
              r.join(`;`) +
              `\r
`));
        }
        return t;
      }),
      (n.parseRtcpFb = function (e) {
        let t = e.substring(e.indexOf(` `) + 1).split(` `);
        return { type: t.shift(), parameter: t.join(` `) };
      }),
      (n.writeRtcpFb = function (e) {
        let t = ``,
          n = e.payloadType;
        return (
          e.preferredPayloadType !== void 0 && (n = e.preferredPayloadType),
          e.rtcpFeedback &&
            e.rtcpFeedback.length &&
            e.rtcpFeedback.forEach((e) => {
              t +=
                `a=rtcp-fb:` +
                n +
                ` ` +
                e.type +
                (e.parameter && e.parameter.length ? ` ` + e.parameter : ``) +
                `\r
`;
            }),
          t
        );
      }),
      (n.parseSsrcMedia = function (e) {
        let t = e.indexOf(` `),
          n = { ssrc: parseInt(e.substring(7, t), 10) },
          r = e.indexOf(`:`, t);
        return (
          r > -1
            ? ((n.attribute = e.substring(t + 1, r)), (n.value = e.substring(r + 1)))
            : (n.attribute = e.substring(t + 1)),
          n
        );
      }),
      (n.parseSsrcGroup = function (e) {
        let t = e.substring(13).split(` `);
        return { semantics: t.shift(), ssrcs: t.map((e) => parseInt(e, 10)) };
      }),
      (n.getMid = function (e) {
        let t = n.matchPrefix(e, `a=mid:`)[0];
        if (t) return t.substring(6);
      }),
      (n.parseFingerprint = function (e) {
        let t = e.substring(14).split(` `);
        return { algorithm: t[0].toLowerCase(), value: t[1].toUpperCase() };
      }),
      (n.getDtlsParameters = function (e, t) {
        return {
          role: `auto`,
          fingerprints: n.matchPrefix(e + t, `a=fingerprint:`).map(n.parseFingerprint),
        };
      }),
      (n.writeDtlsParameters = function (e, t) {
        let n =
          `a=setup:` +
          t +
          `\r
`;
        return (
          e.fingerprints.forEach((e) => {
            n +=
              `a=fingerprint:` +
              e.algorithm +
              ` ` +
              e.value +
              `\r
`;
          }),
          n
        );
      }),
      (n.parseCryptoLine = function (e) {
        let t = e.substring(9).split(` `);
        return {
          tag: parseInt(t[0], 10),
          cryptoSuite: t[1],
          keyParams: t[2],
          sessionParams: t.slice(3),
        };
      }),
      (n.writeCryptoLine = function (e) {
        return (
          `a=crypto:` +
          e.tag +
          ` ` +
          e.cryptoSuite +
          ` ` +
          (typeof e.keyParams == `object` ? n.writeCryptoKeyParams(e.keyParams) : e.keyParams) +
          (e.sessionParams ? ` ` + e.sessionParams.join(` `) : ``) +
          `\r
`
        );
      }),
      (n.parseCryptoKeyParams = function (e) {
        if (e.indexOf(`inline:`) !== 0) return null;
        let t = e.substring(7).split(`|`);
        return {
          keyMethod: `inline`,
          keySalt: t[0],
          lifeTime: t[1],
          mkiValue: t[2] ? t[2].split(`:`)[0] : void 0,
          mkiLength: t[2] ? t[2].split(`:`)[1] : void 0,
        };
      }),
      (n.writeCryptoKeyParams = function (e) {
        return (
          e.keyMethod +
          `:` +
          e.keySalt +
          (e.lifeTime ? `|` + e.lifeTime : ``) +
          (e.mkiValue && e.mkiLength ? `|` + e.mkiValue + `:` + e.mkiLength : ``)
        );
      }),
      (n.getCryptoParameters = function (e, t) {
        return n.matchPrefix(e + t, `a=crypto:`).map(n.parseCryptoLine);
      }),
      (n.getIceParameters = function (e, t) {
        let r = n.matchPrefix(e + t, `a=ice-ufrag:`)[0],
          i = n.matchPrefix(e + t, `a=ice-pwd:`)[0];
        return r && i ? { usernameFragment: r.substring(12), password: i.substring(10) } : null;
      }),
      (n.writeIceParameters = function (e) {
        let t =
          `a=ice-ufrag:` +
          e.usernameFragment +
          `\r
a=ice-pwd:` +
          e.password +
          `\r
`;
        return (
          e.iceLite &&
            (t += `a=ice-lite\r
`),
          t
        );
      }),
      (n.parseRtpParameters = function (e) {
        let t = { codecs: [], headerExtensions: [], fecMechanisms: [], rtcp: [] },
          r = n.splitLines(e)[0].split(` `);
        t.profile = r[2];
        for (let i = 3; i < r.length; i++) {
          let a = r[i],
            o = n.matchPrefix(e, `a=rtpmap:` + a + ` `)[0];
          if (o) {
            let r = n.parseRtpMap(o),
              i = n.matchPrefix(e, `a=fmtp:` + a + ` `);
            switch (
              ((r.parameters = i.length ? n.parseFmtp(i[0]) : {}),
              (r.rtcpFeedback = n.matchPrefix(e, `a=rtcp-fb:` + a + ` `).map(n.parseRtcpFb)),
              t.codecs.push(r),
              r.name.toUpperCase())
            ) {
              case `RED`:
              case `ULPFEC`:
                t.fecMechanisms.push(r.name.toUpperCase());
            }
          }
        }
        n.matchPrefix(e, `a=extmap:`).forEach((e) => {
          t.headerExtensions.push(n.parseExtmap(e));
        });
        let i = n.matchPrefix(e, `a=rtcp-fb:* `).map(n.parseRtcpFb);
        return (
          t.codecs.forEach((e) => {
            i.forEach((t) => {
              e.rtcpFeedback.find((e) => e.type === t.type && e.parameter === t.parameter) ||
                e.rtcpFeedback.push(t);
            });
          }),
          t
        );
      }),
      (n.writeRtpDescription = function (e, t) {
        let r = ``;
        ((r += `m=` + e + ` `),
          (r += t.codecs.length > 0 ? `9` : `0`),
          (r += ` ` + (t.profile || `UDP/TLS/RTP/SAVPF`) + ` `),
          (r +=
            t.codecs
              .map((e) =>
                e.preferredPayloadType === void 0 ? e.payloadType : e.preferredPayloadType,
              )
              .join(` `) +
            `\r
`),
          (r += `c=IN IP4 0.0.0.0\r
`),
          (r += `a=rtcp:9 IN IP4 0.0.0.0\r
`),
          t.codecs.forEach((e) => {
            ((r += n.writeRtpMap(e)), (r += n.writeFmtp(e)), (r += n.writeRtcpFb(e)));
          }));
        let i = 0;
        return (
          t.codecs.forEach((e) => {
            e.maxptime > i && (i = e.maxptime);
          }),
          i > 0 &&
            (r +=
              `a=maxptime:` +
              i +
              `\r
`),
          t.headerExtensions &&
            t.headerExtensions.forEach((e) => {
              r += n.writeExtmap(e);
            }),
          r
        );
      }),
      (n.parseRtpEncodingParameters = function (e) {
        let t = [],
          r = n.parseRtpParameters(e),
          i = r.fecMechanisms.indexOf(`RED`) !== -1,
          a = r.fecMechanisms.indexOf(`ULPFEC`) !== -1,
          o = n
            .matchPrefix(e, `a=ssrc:`)
            .map((e) => n.parseSsrcMedia(e))
            .filter((e) => e.attribute === `cname`),
          s = o.length > 0 && o[0].ssrc,
          c,
          l = n.matchPrefix(e, `a=ssrc-group:FID`).map((e) =>
            e
              .substring(17)
              .split(` `)
              .map((e) => parseInt(e, 10)),
          );
        (l.length > 0 && l[0].length > 1 && l[0][0] === s && (c = l[0][1]),
          r.codecs.forEach((e) => {
            if (e.name.toUpperCase() === `RTX` && e.parameters.apt) {
              let n = { ssrc: s, codecPayloadType: parseInt(e.parameters.apt, 10) };
              (s && c && (n.rtx = { ssrc: c }),
                t.push(n),
                i &&
                  ((n = JSON.parse(JSON.stringify(n))),
                  (n.fec = { ssrc: s, mechanism: a ? `red+ulpfec` : `red` }),
                  t.push(n)));
            }
          }),
          t.length === 0 && s && t.push({ ssrc: s }));
        let u = n.matchPrefix(e, `b=`);
        return (
          u.length &&
            ((u =
              u[0].indexOf(`b=TIAS:`) === 0
                ? parseInt(u[0].substring(7), 10)
                : u[0].indexOf(`b=AS:`) === 0
                  ? parseInt(u[0].substring(5), 10) * 1e3 * 0.95 - 16e3
                  : void 0),
            t.forEach((e) => {
              e.maxBitrate = u;
            })),
          t
        );
      }),
      (n.parseRtcpParameters = function (e) {
        let t = {},
          r = n
            .matchPrefix(e, `a=ssrc:`)
            .map((e) => n.parseSsrcMedia(e))
            .filter((e) => e.attribute === `cname`)[0];
        r && ((t.cname = r.value), (t.ssrc = r.ssrc));
        let i = n.matchPrefix(e, `a=rtcp-rsize`);
        return (
          (t.reducedSize = i.length > 0),
          (t.compound = i.length === 0),
          (t.mux = n.matchPrefix(e, `a=rtcp-mux`).length > 0),
          t
        );
      }),
      (n.writeRtcpParameters = function (e) {
        let t = ``;
        return (
          e.reducedSize &&
            (t += `a=rtcp-rsize\r
`),
          e.mux &&
            (t += `a=rtcp-mux\r
`),
          e.ssrc !== void 0 &&
            e.cname &&
            (t +=
              `a=ssrc:` +
              e.ssrc +
              ` cname:` +
              e.cname +
              `\r
`),
          t
        );
      }),
      (n.parseMsid = function (e) {
        let t,
          r = n.matchPrefix(e, `a=msid:`);
        if (r.length === 1)
          return ((t = r[0].substring(7).split(` `)), { stream: t[0], track: t[1] });
        let i = n
          .matchPrefix(e, `a=ssrc:`)
          .map((e) => n.parseSsrcMedia(e))
          .filter((e) => e.attribute === `msid`);
        if (i.length > 0) return ((t = i[0].value.split(` `)), { stream: t[0], track: t[1] });
      }),
      (n.parseSctpDescription = function (e) {
        let t = n.parseMLine(e),
          r = n.matchPrefix(e, `a=max-message-size:`),
          i;
        (r.length > 0 && (i = parseInt(r[0].substring(19), 10)), isNaN(i) && (i = 65536));
        let a = n.matchPrefix(e, `a=sctp-port:`);
        if (a.length > 0)
          return { port: parseInt(a[0].substring(12), 10), protocol: t.fmt, maxMessageSize: i };
        let o = n.matchPrefix(e, `a=sctpmap:`);
        if (o.length > 0) {
          let e = o[0].substring(10).split(` `);
          return { port: parseInt(e[0], 10), protocol: e[1], maxMessageSize: i };
        }
      }),
      (n.writeSctpDescription = function (e, t) {
        let n = [];
        return (
          (n =
            e.protocol === `DTLS/SCTP`
              ? [
                  `m=` +
                    e.kind +
                    ` 9 ` +
                    e.protocol +
                    ` ` +
                    t.port +
                    `\r
`,
                  `c=IN IP4 0.0.0.0\r
`,
                  `a=sctpmap:` +
                    t.port +
                    ` ` +
                    t.protocol +
                    ` 65535\r
`,
                ]
              : [
                  `m=` +
                    e.kind +
                    ` 9 ` +
                    e.protocol +
                    ` ` +
                    t.protocol +
                    `\r
`,
                  `c=IN IP4 0.0.0.0\r
`,
                  `a=sctp-port:` +
                    t.port +
                    `\r
`,
                ]),
          t.maxMessageSize !== void 0 &&
            n.push(
              `a=max-message-size:` +
                t.maxMessageSize +
                `\r
`,
            ),
          n.join(``)
        );
      }),
      (n.generateSessionId = function () {
        return Math.random().toString().substr(2, 22);
      }),
      (n.writeSessionBoilerplate = function (e, t, r) {
        let i,
          a = t === void 0 ? 2 : t;
        return (
          (i = e || n.generateSessionId()),
          `v=0\r
o=` +
            (r || `thisisadapterortc`) +
            ` ` +
            i +
            ` ` +
            a +
            ` IN IP4 127.0.0.1\r
s=-\r
t=0 0\r
`
        );
      }),
      (n.getDirection = function (e, t) {
        let r = n.splitLines(e);
        for (let e = 0; e < r.length; e++)
          switch (r[e]) {
            case `a=sendrecv`:
            case `a=sendonly`:
            case `a=recvonly`:
            case `a=inactive`:
              return r[e].substring(2);
          }
        return t ? n.getDirection(t) : `sendrecv`;
      }),
      (n.getKind = function (e) {
        return n.splitLines(e)[0].split(` `)[0].substring(2);
      }),
      (n.isRejected = function (e) {
        return e.split(` `, 2)[1] === `0`;
      }),
      (n.parseMLine = function (e) {
        let t = n.splitLines(e)[0].substring(2).split(` `);
        return { kind: t[0], port: parseInt(t[1], 10), protocol: t[2], fmt: t.slice(3).join(` `) };
      }),
      (n.parseOLine = function (e) {
        let t = n.matchPrefix(e, `o=`)[0].substring(2).split(` `);
        return {
          username: t[0],
          sessionId: t[1],
          sessionVersion: parseInt(t[2], 10),
          netType: t[3],
          addressType: t[4],
          address: t[5],
        };
      }),
      (n.isValidSDP = function (e) {
        if (typeof e != `string` || e.length === 0) return !1;
        let t = n.splitLines(e);
        for (let e = 0; e < t.length; e++) if (t[e].length < 2 || t[e].charAt(1) !== `=`) return !1;
        return !0;
      }),
      typeof t == `object` && (t.exports = n));
  }),
  wt = i({
    removeExtmapAllowMixed: () => jt,
    shimAddIceCandidateNullOrEmpty: () => Mt,
    shimConnectionState: () => At,
    shimMaxMessageSize: () => Ot,
    shimParameterlessSetLocalDescription: () => Nt,
    shimRTCIceCandidate: () => Et,
    shimRTCIceCandidateRelayProtocol: () => Dt,
    shimSendThrowTypeError: () => kt,
  }),
  Tt = e(Ct());
function Et(e) {
  if (!e.RTCIceCandidate || (e.RTCIceCandidate && `foundation` in e.RTCIceCandidate.prototype))
    return;
  let t = e.RTCIceCandidate;
  ((e.RTCIceCandidate = function (e) {
    if (
      (typeof e == `object` &&
        e.candidate &&
        e.candidate.indexOf(`a=`) === 0 &&
        ((e = JSON.parse(JSON.stringify(e))), (e.candidate = e.candidate.substring(2))),
      e.candidate && e.candidate.length)
    ) {
      let n = new t(e),
        r = Tt.default.parseCandidate(e.candidate);
      for (let e in r) e in n || Object.defineProperty(n, e, { value: r[e] });
      return (
        (n.toJSON = function () {
          return {
            candidate: n.candidate,
            sdpMid: n.sdpMid,
            sdpMLineIndex: n.sdpMLineIndex,
            usernameFragment: n.usernameFragment,
          };
        }),
        n
      );
    }
    return new t(e);
  }),
    (e.RTCIceCandidate.prototype = t.prototype),
    Me(
      e,
      `icecandidate`,
      (t) => (
        t.candidate &&
          Object.defineProperty(t, "candidate", {
            value: new e.RTCIceCandidate(t.candidate),
            writable: `false`,
          }),
        t
      ),
    ));
}
function Dt(e) {
  !e.RTCIceCandidate ||
    (e.RTCIceCandidate && `relayProtocol` in e.RTCIceCandidate.prototype) ||
    Me(e, `icecandidate`, (e) => {
      if (e.candidate) {
        let t = Tt.default.parseCandidate(e.candidate.candidate);
        t.type === `relay` &&
          (e.candidate.relayProtocol = { 0: `tls`, 1: `tcp`, 2: `udp` }[t.priority >> 24]);
      }
      return e;
    });
}
function Ot(e, t) {
  if (
    !e.RTCPeerConnection ||
    (t.browser === `chrome` && t.version > 102) ||
    (t.browser === `firefox` && t.version >= 113)
  )
    return;
  `sctp` in e.RTCPeerConnection.prototype ||
    Object.defineProperty(e.RTCPeerConnection.prototype, "sctp", {
      get() {
        return this._sctp === void 0 ? null : this._sctp;
      },
    });
  let n = function (e) {
      if (!e || !e.sdp) return !1;
      let t = Tt.default.splitSections(e.sdp);
      return (
        t.shift(),
        t.some((e) => {
          let t = Tt.default.parseMLine(e);
          return t && t.kind === `application` && t.protocol.indexOf(`SCTP`) !== -1;
        })
      );
    },
    r = function (e) {
      let t = e.sdp.match(/mozilla...THIS_IS_SDPARTA-(\d+)/);
      if (t === null || t.length < 2) return -1;
      let n = parseInt(t[1], 10);
      return n === n ? n : -1;
    },
    i = function (e) {
      let n = 65536;
      return (
        t.browser === `firefox` &&
          (n =
            t.version < 57
              ? e === -1
                ? 16384
                : 2147483637
              : t.version < 60
                ? t.version === 57
                  ? 65535
                  : 65536
                : 2147483637),
        n
      );
    },
    a = function (e, n) {
      let r = 65536;
      t.browser === `firefox` && t.version === 57 && (r = 65535);
      let i = Tt.default.matchPrefix(e.sdp, `a=max-message-size:`);
      return (
        i.length > 0
          ? (r = parseInt(i[0].substring(19), 10))
          : t.browser === `firefox` && n !== -1 && (r = 2147483637),
        r
      );
    },
    o = e.RTCPeerConnection.prototype.setRemoteDescription;
  e.RTCPeerConnection.prototype.setRemoteDescription = function () {
    if (((this._sctp = null), t.browser === `chrome` && t.version >= 76)) {
      let { sdpSemantics: e } = this.getConfiguration();
      e === `plan-b` &&
        Object.defineProperty(this, "sctp", {
          get() {
            return this._sctp === void 0 ? null : this._sctp;
          },
          enumerable: !0,
          configurable: !0,
        });
    }
    if (n(arguments[0])) {
      let e = r(arguments[0]),
        t = i(e),
        n = a(arguments[0], e),
        o;
      o = t === 0 && n === 0 ? 1 / 0 : t === 0 || n === 0 ? Math.max(t, n) : Math.min(t, n);
      let s = {};
      (Object.defineProperty(s, "maxMessageSize", {
        get() {
          return o;
        },
      }),
        (this._sctp = s));
    }
    return o.apply(this, arguments);
  };
}
function kt(e, t) {
  if (
    !(e.RTCPeerConnection && `createDataChannel` in e.RTCPeerConnection.prototype) ||
    (t.browser === `chrome` && t.version >= 149) ||
    (t.browser === `firefox` && t.version > 60)
  )
    return;
  function n(e, t) {
    let n = e.send;
    e.send = function () {
      let r = arguments[0],
        i = r.length || r.size || r.byteLength;
      if (e.readyState === `open` && t.sctp && i > t.sctp.maxMessageSize)
        throw TypeError(
          `Message too large (can send a maximum of ` + t.sctp.maxMessageSize + ` bytes)`,
        );
      return n.apply(e, arguments);
    };
  }
  let r = e.RTCPeerConnection.prototype.createDataChannel;
  ((e.RTCPeerConnection.prototype.createDataChannel = function () {
    let e = r.apply(this, arguments);
    return (n(e, this), e);
  }),
    Me(e, `datachannel`, (e) => (n(e.channel, e.target), e)));
}
function At(e) {
  if (!e.RTCPeerConnection || `connectionState` in e.RTCPeerConnection.prototype) return;
  let t = e.RTCPeerConnection.prototype;
  (Object.defineProperty(t, "connectionState", {
    get() {
      return (
        { completed: `connected`, checking: `connecting` }[this.iceConnectionState] ||
        this.iceConnectionState
      );
    },
    enumerable: !0,
    configurable: !0,
  }),
    Object.defineProperty(t, "onconnectionstatechange", {
      get() {
        return this._onconnectionstatechange || null;
      },
      set(e) {
        (this._onconnectionstatechange &&
          (this.removeEventListener(`connectionstatechange`, this._onconnectionstatechange),
          delete this._onconnectionstatechange),
          e && this.addEventListener(`connectionstatechange`, (this._onconnectionstatechange = e)));
      },
      enumerable: !0,
      configurable: !0,
    }),
    [`setLocalDescription`, `setRemoteDescription`].forEach((e) => {
      let n = t[e];
      t[e] = function () {
        return (
          this._connectionstatechangepoly ||
            ((this._connectionstatechangepoly = (e) => {
              let t = e.target;
              if (t._lastConnectionState !== t.connectionState) {
                t._lastConnectionState = t.connectionState;
                let n = new Event(`connectionstatechange`, e);
                t.dispatchEvent(n);
              }
              return e;
            }),
            this.addEventListener(`iceconnectionstatechange`, this._connectionstatechangepoly)),
          n.apply(this, arguments)
        );
      };
    }));
}
function jt(e, t) {
  if (
    !e.RTCPeerConnection ||
    (t.browser === `chrome` && t.version >= 71) ||
    (t.browser === `safari` && t._safariVersion >= 13.1)
  )
    return;
  let n = e.RTCPeerConnection.prototype.setRemoteDescription;
  e.RTCPeerConnection.prototype.setRemoteDescription = function (t) {
    if (
      t &&
      t.sdp &&
      t.sdp.indexOf(`
a=extmap-allow-mixed`) !== -1
    ) {
      let n = t.sdp
        .split(
          `
`,
        )
        .filter((e) => e.trim() !== `a=extmap-allow-mixed`).join(`
`);
      e.RTCSessionDescription && t instanceof e.RTCSessionDescription
        ? (arguments[0] = new e.RTCSessionDescription({ type: t.type, sdp: n }))
        : (t.sdp = n);
    }
    return n.apply(this, arguments);
  };
}
function Mt(e, t) {
  if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
  let n = e.RTCPeerConnection.prototype.addIceCandidate;
  n &&
    n.length !== 0 &&
    (e.RTCPeerConnection.prototype.addIceCandidate = function () {
      return arguments[0]
        ? ((t.browser === `chrome` && t.version < 78) ||
            (t.browser === `firefox` && t.version < 68) ||
            t.browser === `safari`) &&
          arguments[0] &&
          arguments[0].candidate === ``
          ? Promise.resolve()
          : n.apply(this, arguments)
        : (arguments[1] && arguments[1].apply(null), Promise.resolve());
    });
}
function Nt(e, t) {
  if (!(e.RTCPeerConnection && e.RTCPeerConnection.prototype)) return;
  let n = e.RTCPeerConnection.prototype.setLocalDescription;
  n &&
    n.length !== 0 &&
    (e.RTCPeerConnection.prototype.setLocalDescription = function () {
      let e = arguments[0] || {};
      if (typeof e != `object` || (e.type && e.sdp)) return n.apply(this, arguments);
      if (((e = { type: e.type, sdp: e.sdp }), !e.type))
        switch (this.signalingState) {
          case `stable`:
          case `have-local-offer`:
          case `have-remote-pranswer`:
            e.type = `offer`;
            break;
          default:
            e.type = `answer`;
        }
      return e.sdp || (e.type !== `offer` && e.type !== `answer`)
        ? n.apply(this, [e])
        : (e.type === `offer` ? this.createOffer : this.createAnswer)
            .apply(this)
            .then((e) => n.apply(this, [e]));
    });
}
function Pt({ window: e } = {}, t = { shimChrome: !0, shimFirefox: !0, shimSafari: !0 }) {
  let n = Fe,
    r = Le(e),
    i = {
      browserDetails: r,
      commonShim: wt,
      extractVersion: je,
      disableLog: Ne,
      disableWarnings: Pe,
      sdp: Tt,
    };
  switch (r.browser) {
    case `chrome`:
      if (!We || !Ze || !t.shimChrome)
        return (n(`Chrome shim is not included in this adapter release.`), i);
      if (r.version === null) return (n(`Chrome shim can not determine version, not shimming.`), i);
      (n(`adapter.js shimming chrome.`),
        (i.browserShim = We),
        Mt(e, r),
        Nt(e, r),
        Ue(e, r),
        Ge(e, r),
        Ze(e, r),
        Ke(e, r),
        Xe(e, r),
        qe(e, r),
        Je(e, r),
        Qe(e, r),
        Et(e, r),
        Dt(e, r),
        At(e, r),
        Ot(e, r),
        kt(e, r),
        jt(e, r));
      break;
    case `firefox`:
      if (!tt || !rt || !t.shimFirefox)
        return (n(`Firefox shim is not included in this adapter release.`), i);
      (n(`adapter.js shimming firefox.`),
        (i.browserShim = tt),
        Mt(e, r),
        Nt(e, r),
        $e(e, r),
        rt(e, r),
        it(e, r),
        nt(e, r),
        st(e, r),
        at(e, r),
        ot(e, r),
        ct(e, r),
        lt(e, r),
        ut(e, r),
        dt(e, r),
        ft(e, r),
        Et(e, r),
        At(e, r),
        Ot(e, r),
        kt(e, r));
      break;
    case `safari`:
      if (!pt || !t.shimSafari)
        return (n(`Safari shim is not included in this adapter release.`), i);
      (n(`adapter.js shimming safari.`),
        (i.browserShim = pt),
        Mt(e, r),
        Nt(e, r),
        yt(e, r),
        xt(e, r),
        gt(e, r),
        mt(e, r),
        ht(e, r),
        bt(e, r),
        _t(e, r),
        St(e, r),
        Et(e, r),
        Dt(e, r),
        Ot(e, r),
        kt(e, r),
        jt(e, r));
      break;
    default:
      n(`Unsupported browser!`);
  }
  return i;
}
var Ft = Pt({ window: typeof window > `u` ? void 0 : window });
function It(e, t, n, r) {
  Object.defineProperty(e, t, { get: n, set: r, enumerable: !0, configurable: !0 });
}
var Lt = class {
  constructor() {
    ((this.chunkedMTU = 16300),
      (this._dataCount = 1),
      (this.chunk = (e) => {
        let t = [],
          n = e.byteLength,
          r = Math.ceil(n / this.chunkedMTU),
          i = 0,
          a = 0;
        for (; a < n;) {
          let o = Math.min(n, a + this.chunkedMTU),
            s = e.slice(a, o),
            c = { __peerData: this._dataCount, n: i, data: s, total: r };
          (t.push(c), (a = o), i++);
        }
        return (this._dataCount++, t);
      }));
  }
};
function Rt(e) {
  let t = 0;
  for (let n of e) t += n.byteLength;
  let n = new Uint8Array(t),
    r = 0;
  for (let t of e) (n.set(t, r), (r += t.byteLength));
  return n;
}
var zt = Ft.default || Ft,
  Bt = new (class {
    isWebRTCSupported() {
      return typeof RTCPeerConnection < `u`;
    }
    isBrowserSupported() {
      let e = this.getBrowser(),
        t = this.getVersion();
      return this.supportedBrowsers.includes(e)
        ? e === `chrome`
          ? t >= this.minChromeVersion
          : e === `firefox`
            ? t >= this.minFirefoxVersion
            : e === `safari` && !this.isIOS && t >= this.minSafariVersion
        : !1;
    }
    getBrowser() {
      return zt.browserDetails.browser;
    }
    getVersion() {
      return zt.browserDetails.version || 0;
    }
    isUnifiedPlanSupported() {
      let e = this.getBrowser(),
        t = zt.browserDetails.version || 0;
      if (e === `chrome` && t < this.minChromeVersion) return !1;
      if (e === `firefox` && t >= this.minFirefoxVersion) return !0;
      if (!window.RTCRtpTransceiver || !(`currentDirection` in RTCRtpTransceiver.prototype))
        return !1;
      let n,
        r = !1;
      try {
        ((n = new RTCPeerConnection()), n.addTransceiver(`audio`), (r = !0));
      } catch {
      } finally {
        n && n.close();
      }
      return r;
    }
    toString() {
      return `Supports:
    browser:${this.getBrowser()}
    version:${this.getVersion()}
    isIOS:${this.isIOS}
    isWebRTCSupported:${this.isWebRTCSupported()}
    isBrowserSupported:${this.isBrowserSupported()}
    isUnifiedPlanSupported:${this.isUnifiedPlanSupported()}`;
    }
    constructor() {
      ((this.isIOS =
        typeof navigator < `u` && [`iPad`, `iPhone`, `iPod`].includes(navigator.platform)),
        (this.supportedBrowsers = [`firefox`, `chrome`, `safari`]),
        (this.minFirefoxVersion = 59),
        (this.minChromeVersion = 72),
        (this.minSafariVersion = 605));
    }
  })(),
  Vt = (e) => !e || /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/.test(e),
  Ht = () => Math.random().toString(36).slice(2),
  Ut = {
    iceServers: [
      { urls: `stun:stun.l.google.com:19302` },
      {
        urls: [`turn:eu-0.turn.peerjs.com:3478`, `turn:us-0.turn.peerjs.com:3478`],
        username: `peerjs`,
        credential: `peerjsp`,
      },
    ],
    sdpSemantics: `unified-plan`,
  },
  b = new (class extends Lt {
    noop() {}
    blobToArrayBuffer(e, t) {
      let n = new FileReader();
      return (
        (n.onload = function (e) {
          e.target && t(e.target.result);
        }),
        n.readAsArrayBuffer(e),
        n
      );
    }
    binaryStringToArrayBuffer(e) {
      let t = new Uint8Array(e.length);
      for (let n = 0; n < e.length; n++) t[n] = e.charCodeAt(n) & 255;
      return t.buffer;
    }
    isSecure() {
      return location.protocol === `https:`;
    }
    constructor(...e) {
      (super(...e),
        (this.CLOUD_HOST = `0.peerjs.com`),
        (this.CLOUD_PORT = 443),
        (this.chunkedBrowsers = { Chrome: 1, chrome: 1 }),
        (this.defaultConfig = Ut),
        (this.browser = Bt.getBrowser()),
        (this.browserVersion = Bt.getVersion()),
        (this.pack = Ee),
        (this.unpack = Te),
        (this.supports = (function () {
          let e = {
            browser: Bt.isBrowserSupported(),
            webRTC: Bt.isWebRTCSupported(),
            audioVideo: !1,
            data: !1,
            binaryBlob: !1,
            reliable: !1,
          };
          if (!e.webRTC) return e;
          let t;
          try {
            ((t = new RTCPeerConnection(Ut)), (e.audioVideo = !0));
            let n;
            try {
              ((n = t.createDataChannel(`_PEERJSTEST`, { ordered: !0 })),
                (e.data = !0),
                (e.reliable = !!n.ordered));
              try {
                ((n.binaryType = `blob`), (e.binaryBlob = !Bt.isIOS));
              } catch {}
            } catch {
            } finally {
              n && n.close();
            }
          } catch {
          } finally {
            t && t.close();
          }
          return e;
        })()),
        (this.validateId = Vt),
        (this.randomToken = Ht));
    }
  })(),
  Wt = `PeerJS: `,
  x = new (class {
    get logLevel() {
      return this._logLevel;
    }
    set logLevel(e) {
      this._logLevel = e;
    }
    log(...e) {
      this._logLevel >= 3 && this._print(3, ...e);
    }
    warn(...e) {
      this._logLevel >= 2 && this._print(2, ...e);
    }
    error(...e) {
      this._logLevel >= 1 && this._print(1, ...e);
    }
    setLogFunction(e) {
      this._print = e;
    }
    _print(e, ...t) {
      let n = [Wt, ...t];
      for (let e in n) n[e] instanceof Error && (n[e] = `(` + n[e].name + `) ` + n[e].message);
      e >= 3
        ? console.log(...n)
        : e >= 2
          ? console.warn(`WARNING`, ...n)
          : e >= 1 && console.error(`ERROR`, ...n);
    }
    constructor() {
      this._logLevel = 0;
    }
  })(),
  Gt = {},
  Kt = Object.prototype.hasOwnProperty,
  S = `~`;
function qt() {}
Object.create && ((qt.prototype = Object.create(null)), new qt().__proto__ || (S = !1));
function Jt(e, t, n) {
  ((this.fn = e), (this.context = t), (this.once = n || !1));
}
function Yt(e, t, n, r, i) {
  if (typeof n != `function`) throw TypeError(`The listener must be a function`);
  var a = new Jt(n, r || e, i),
    o = S ? S + t : t;
  return (
    e._events[o]
      ? e._events[o].fn
        ? (e._events[o] = [e._events[o], a])
        : e._events[o].push(a)
      : ((e._events[o] = a), e._eventsCount++),
    e
  );
}
function Xt(e, t) {
  --e._eventsCount === 0 ? (e._events = new qt()) : delete e._events[t];
}
function C() {
  ((this._events = new qt()), (this._eventsCount = 0));
}
((C.prototype.eventNames = function () {
  var e = [],
    t,
    n;
  if (this._eventsCount === 0) return e;
  for (n in (t = this._events)) Kt.call(t, n) && e.push(S ? n.slice(1) : n);
  return Object.getOwnPropertySymbols ? e.concat(Object.getOwnPropertySymbols(t)) : e;
}),
  (C.prototype.listeners = function (e) {
    var t = S ? S + e : e,
      n = this._events[t];
    if (!n) return [];
    if (n.fn) return [n.fn];
    for (var r = 0, i = n.length, a = Array(i); r < i; r++) a[r] = n[r].fn;
    return a;
  }),
  (C.prototype.listenerCount = function (e) {
    var t = S ? S + e : e,
      n = this._events[t];
    return n ? (n.fn ? 1 : n.length) : 0;
  }),
  (C.prototype.emit = function (e, t, n, r, i, a) {
    var o = S ? S + e : e;
    if (!this._events[o]) return !1;
    var s = this._events[o],
      c = arguments.length,
      l,
      u;
    if (s.fn) {
      switch ((s.once && this.removeListener(e, s.fn, void 0, !0), c)) {
        case 1:
          return (s.fn.call(s.context), !0);
        case 2:
          return (s.fn.call(s.context, t), !0);
        case 3:
          return (s.fn.call(s.context, t, n), !0);
        case 4:
          return (s.fn.call(s.context, t, n, r), !0);
        case 5:
          return (s.fn.call(s.context, t, n, r, i), !0);
        case 6:
          return (s.fn.call(s.context, t, n, r, i, a), !0);
      }
      for (u = 1, l = Array(c - 1); u < c; u++) l[u - 1] = arguments[u];
      s.fn.apply(s.context, l);
    } else {
      var d = s.length,
        f;
      for (u = 0; u < d; u++)
        switch ((s[u].once && this.removeListener(e, s[u].fn, void 0, !0), c)) {
          case 1:
            s[u].fn.call(s[u].context);
            break;
          case 2:
            s[u].fn.call(s[u].context, t);
            break;
          case 3:
            s[u].fn.call(s[u].context, t, n);
            break;
          case 4:
            s[u].fn.call(s[u].context, t, n, r);
            break;
          default:
            if (!l) for (f = 1, l = Array(c - 1); f < c; f++) l[f - 1] = arguments[f];
            s[u].fn.apply(s[u].context, l);
        }
    }
    return !0;
  }),
  (C.prototype.on = function (e, t, n) {
    return Yt(this, e, t, n, !1);
  }),
  (C.prototype.once = function (e, t, n) {
    return Yt(this, e, t, n, !0);
  }),
  (C.prototype.removeListener = function (e, t, n, r) {
    var i = S ? S + e : e;
    if (!this._events[i]) return this;
    if (!t) return (Xt(this, i), this);
    var a = this._events[i];
    if (a.fn) a.fn === t && (!r || a.once) && (!n || a.context === n) && Xt(this, i);
    else {
      for (var o = 0, s = [], c = a.length; o < c; o++)
        (a[o].fn !== t || (r && !a[o].once) || (n && a[o].context !== n)) && s.push(a[o]);
      s.length ? (this._events[i] = s.length === 1 ? s[0] : s) : Xt(this, i);
    }
    return this;
  }),
  (C.prototype.removeAllListeners = function (e) {
    var t;
    return (
      e
        ? ((t = S ? S + e : e), this._events[t] && Xt(this, t))
        : ((this._events = new qt()), (this._eventsCount = 0)),
      this
    );
  }),
  (C.prototype.off = C.prototype.removeListener),
  (C.prototype.addListener = C.prototype.on),
  (C.prefixed = S),
  (C.EventEmitter = C),
  (Gt = C));
var Zt = {};
(It(Zt, `ConnectionType`, () => Qt),
  It(Zt, `PeerErrorType`, () => w),
  It(Zt, `BaseConnectionErrorType`, () => $t),
  It(Zt, `DataConnectionErrorType`, () => en),
  It(Zt, `SerializationType`, () => tn),
  It(Zt, `SocketEventType`, () => nn),
  It(Zt, `ServerMessageType`, () => T));
var Qt = (function (e) {
    return ((e.Data = `data`), (e.Media = `media`), e);
  })({}),
  w = (function (e) {
    return (
      (e.BrowserIncompatible = `browser-incompatible`),
      (e.Disconnected = `disconnected`),
      (e.InvalidID = `invalid-id`),
      (e.InvalidKey = `invalid-key`),
      (e.Network = `network`),
      (e.PeerUnavailable = `peer-unavailable`),
      (e.SslUnavailable = `ssl-unavailable`),
      (e.ServerError = `server-error`),
      (e.SocketError = `socket-error`),
      (e.SocketClosed = `socket-closed`),
      (e.UnavailableID = `unavailable-id`),
      (e.WebRTC = `webrtc`),
      e
    );
  })({}),
  $t = (function (e) {
    return (
      (e.NegotiationFailed = `negotiation-failed`),
      (e.ConnectionClosed = `connection-closed`),
      e
    );
  })({}),
  en = (function (e) {
    return ((e.NotOpenYet = `not-open-yet`), (e.MessageToBig = `message-too-big`), e);
  })({}),
  tn = (function (e) {
    return (
      (e.Binary = `binary`),
      (e.BinaryUTF8 = `binary-utf8`),
      (e.JSON = `json`),
      (e.None = `raw`),
      e
    );
  })({}),
  nn = (function (e) {
    return (
      (e.Message = `message`),
      (e.Disconnected = `disconnected`),
      (e.Error = `error`),
      (e.Close = `close`),
      e
    );
  })({}),
  T = (function (e) {
    return (
      (e.Heartbeat = `HEARTBEAT`),
      (e.Candidate = `CANDIDATE`),
      (e.Offer = `OFFER`),
      (e.Answer = `ANSWER`),
      (e.Open = `OPEN`),
      (e.Error = `ERROR`),
      (e.IdTaken = `ID-TAKEN`),
      (e.InvalidKey = `INVALID-KEY`),
      (e.Leave = `LEAVE`),
      (e.Expire = `EXPIRE`),
      e
    );
  })({}),
  rn = `1.5.5`,
  an = class extends Gt.EventEmitter {
    constructor(e, t, n, r, i, a = 5e3) {
      (super(), (this.pingInterval = a), (this._disconnected = !0), (this._messagesQueue = []));
      let o = e ? `wss://` : `ws://`;
      this._baseUrl = o + t + `:` + n + r + `peerjs?key=` + i;
    }
    start(e, t) {
      this._id = e;
      let n = `${this._baseUrl}&id=${e}&token=${t}`;
      !this._socket &&
        this._disconnected &&
        ((this._socket = new WebSocket(n + `&version=1.5.5`)),
        (this._disconnected = !1),
        (this._socket.onmessage = (e) => {
          let t;
          try {
            ((t = JSON.parse(e.data)), x.log(`Server message received:`, t));
          } catch {
            x.log(`Invalid server message`, e.data);
            return;
          }
          this.emit(nn.Message, t);
        }),
        (this._socket.onclose = (e) => {
          this._disconnected ||
            (x.log(`Socket closed.`, e),
            this._cleanup(),
            (this._disconnected = !0),
            this.emit(nn.Disconnected));
        }),
        (this._socket.onopen = () => {
          this._disconnected ||
            (this._sendQueuedMessages(), x.log(`Socket open`), this._scheduleHeartbeat());
        }));
    }
    _scheduleHeartbeat() {
      this._wsPingTimer = setTimeout(() => {
        this._sendHeartbeat();
      }, this.pingInterval);
    }
    _sendHeartbeat() {
      if (!this._wsOpen()) {
        x.log(`Cannot send heartbeat, because socket closed`);
        return;
      }
      let e = JSON.stringify({ type: T.Heartbeat });
      (this._socket.send(e), this._scheduleHeartbeat());
    }
    _wsOpen() {
      return !!this._socket && this._socket.readyState === 1;
    }
    _sendQueuedMessages() {
      let e = [...this._messagesQueue];
      this._messagesQueue = [];
      for (let t of e) this.send(t);
    }
    send(e) {
      if (this._disconnected) return;
      if (!this._id) {
        this._messagesQueue.push(e);
        return;
      }
      if (!e.type) {
        this.emit(nn.Error, `Invalid message`);
        return;
      }
      if (!this._wsOpen()) return;
      let t = JSON.stringify(e);
      this._socket.send(t);
    }
    close() {
      this._disconnected ||= (this._cleanup(), !0);
    }
    _cleanup() {
      ((this._socket &&=
        ((this._socket.onopen = this._socket.onmessage = this._socket.onclose = null),
        this._socket.close(),
        void 0)),
        clearTimeout(this._wsPingTimer));
    }
  },
  on = class {
    constructor(e) {
      this.connection = e;
    }
    startConnection(e) {
      let t = this._startPeerConnection();
      if (
        ((this.connection.peerConnection = t),
        this.connection.type === Qt.Media && e._stream && this._addTracksToConnection(e._stream, t),
        e.originator)
      ) {
        let n = this.connection,
          r = { ordered: !!e.reliable },
          i = t.createDataChannel(n.label, r);
        (n._initializeDataChannel(i), this._makeOffer());
      } else this.handleSDP(`OFFER`, e.sdp);
    }
    _startPeerConnection() {
      x.log(`Creating RTCPeerConnection.`);
      let e = new RTCPeerConnection(this.connection.provider.options.config);
      return (this._setupListeners(e), e);
    }
    _setupListeners(e) {
      let t = this.connection.peer,
        n = this.connection.connectionId,
        r = this.connection.type,
        i = this.connection.provider;
      (x.log(`Listening for ICE candidates.`),
        (e.onicecandidate = (e) => {
          e.candidate &&
            e.candidate.candidate &&
            (x.log(`Received ICE candidates for ${t}:`, e.candidate),
            i.socket.send({
              type: T.Candidate,
              payload: { candidate: e.candidate, type: r, connectionId: n },
              dst: t,
            }));
        }),
        (e.oniceconnectionstatechange = () => {
          switch (e.iceConnectionState) {
            case `failed`:
              (x.log(`iceConnectionState is failed, closing connections to ` + t),
                this.connection.emitError(
                  $t.NegotiationFailed,
                  `Negotiation of connection to ` + t + ` failed.`,
                ),
                this.connection.close());
              break;
            case `closed`:
              (x.log(`iceConnectionState is closed, closing connections to ` + t),
                this.connection.emitError($t.ConnectionClosed, `Connection to ` + t + ` closed.`),
                this.connection.close());
              break;
            case `disconnected`:
              x.log(`iceConnectionState changed to disconnected on the connection with ` + t);
              break;
            case `completed`:
              e.onicecandidate = () => {};
          }
          this.connection.emit(`iceStateChanged`, e.iceConnectionState);
        }),
        x.log(`Listening for data channel`),
        (e.ondatachannel = (e) => {
          x.log(`Received data channel`);
          let r = e.channel;
          i.getConnection(t, n)._initializeDataChannel(r);
        }),
        x.log(`Listening for remote stream`),
        (e.ontrack = (e) => {
          x.log(`Received remote stream`);
          let r = e.streams[0],
            a = i.getConnection(t, n);
          if (a.type === Qt.Media) {
            let e = a;
            this._addStreamToMediaConnection(r, e);
          }
        }));
    }
    cleanup() {
      x.log(`Cleaning up PeerConnection to ` + this.connection.peer);
      let e = this.connection.peerConnection;
      if (!e) return;
      ((this.connection.peerConnection = null),
        (e.onicecandidate = e.oniceconnectionstatechange = e.ondatachannel = e.ontrack = () => {}));
      let t = e.signalingState !== `closed`,
        n = !1,
        r = this.connection.dataChannel;
      (r && (n = !!r.readyState && r.readyState !== `closed`), (t || n) && e.close());
    }
    async _makeOffer() {
      let e = this.connection.peerConnection,
        t = this.connection.provider;
      try {
        let n = await e.createOffer(this.connection.options.constraints);
        (x.log(`Created offer.`),
          this.connection.options.sdpTransform &&
            typeof this.connection.options.sdpTransform == `function` &&
            (n.sdp = this.connection.options.sdpTransform(n.sdp) || n.sdp));
        try {
          (await e.setLocalDescription(n),
            x.log(`Set localDescription:`, n, `for:${this.connection.peer}`));
          let r = {
            sdp: n,
            type: this.connection.type,
            connectionId: this.connection.connectionId,
            metadata: this.connection.metadata,
          };
          if (this.connection.type === Qt.Data) {
            let e = this.connection;
            r = { ...r, label: e.label, reliable: e.reliable, serialization: e.serialization };
          }
          t.socket.send({ type: T.Offer, payload: r, dst: this.connection.peer });
        } catch (e) {
          e !=
            `OperationError: Failed to set local offer sdp: Called in wrong state: kHaveRemoteOffer` &&
            (t.emitError(w.WebRTC, e), x.log(`Failed to setLocalDescription, `, e));
        }
      } catch (e) {
        (t.emitError(w.WebRTC, e), x.log(`Failed to createOffer, `, e));
      }
    }
    async _makeAnswer() {
      let e = this.connection.peerConnection,
        t = this.connection.provider;
      try {
        let n = await e.createAnswer();
        (x.log(`Created answer.`),
          this.connection.options.sdpTransform &&
            typeof this.connection.options.sdpTransform == `function` &&
            (n.sdp = this.connection.options.sdpTransform(n.sdp) || n.sdp));
        try {
          (await e.setLocalDescription(n),
            x.log(`Set localDescription:`, n, `for:${this.connection.peer}`),
            t.socket.send({
              type: T.Answer,
              payload: {
                sdp: n,
                type: this.connection.type,
                connectionId: this.connection.connectionId,
              },
              dst: this.connection.peer,
            }));
        } catch (e) {
          (t.emitError(w.WebRTC, e), x.log(`Failed to setLocalDescription, `, e));
        }
      } catch (e) {
        (t.emitError(w.WebRTC, e), x.log(`Failed to create answer, `, e));
      }
    }
    async handleSDP(e, t) {
      t = new RTCSessionDescription(t);
      let n = this.connection.peerConnection,
        r = this.connection.provider;
      x.log(`Setting remote description`, t);
      let i = this;
      try {
        (await n.setRemoteDescription(t),
          x.log(`Set remoteDescription:${e} for:${this.connection.peer}`),
          e === `OFFER` && (await i._makeAnswer()));
      } catch (e) {
        (r.emitError(w.WebRTC, e), x.log(`Failed to setRemoteDescription, `, e));
      }
    }
    async handleCandidate(e) {
      x.log(`handleCandidate:`, e);
      try {
        (await this.connection.peerConnection.addIceCandidate(e),
          x.log(`Added ICE candidate for:${this.connection.peer}`));
      } catch (e) {
        (this.connection.provider.emitError(w.WebRTC, e), x.log(`Failed to handleCandidate, `, e));
      }
    }
    _addTracksToConnection(e, t) {
      if ((x.log(`add tracks from stream ${e.id} to peer connection`), !t.addTrack))
        return x.error(`Your browser does't support RTCPeerConnection#addTrack. Ignored.`);
      e.getTracks().forEach((n) => {
        t.addTrack(n, e);
      });
    }
    _addStreamToMediaConnection(e, t) {
      (x.log(`add stream ${e.id} to media connection ${t.connectionId}`), t.addStream(e));
    }
  },
  sn = class extends Gt.EventEmitter {
    emitError(e, t) {
      (x.error(`Error:`, t), this.emit(`error`, new cn(`${e}`, t)));
    }
  },
  cn = class extends Error {
    constructor(e, t) {
      (typeof t == `string` ? super(t) : (super(), Object.assign(this, t)), (this.type = e));
    }
  },
  ln = class extends sn {
    get open() {
      return this._open;
    }
    constructor(e, t, n) {
      (super(),
        (this.peer = e),
        (this.provider = t),
        (this.options = n),
        (this._open = !1),
        (this.metadata = n.metadata));
    }
  },
  un = class e extends ln {
    static #e = (this.ID_PREFIX = `mc_`);
    get type() {
      return Qt.Media;
    }
    get localStream() {
      return this._localStream;
    }
    get remoteStream() {
      return this._remoteStream;
    }
    constructor(t, n, r) {
      (super(t, n, r),
        (this._localStream = this.options._stream),
        (this.connectionId = this.options.connectionId || e.ID_PREFIX + b.randomToken()),
        (this._negotiator = new on(this)),
        this._localStream &&
          this._negotiator.startConnection({ _stream: this._localStream, originator: !0 }));
    }
    _initializeDataChannel(e) {
      ((this.dataChannel = e),
        (this.dataChannel.onopen = () => {
          (x.log(`DC#${this.connectionId} dc connection success`), this.emit(`willCloseOnRemote`));
        }),
        (this.dataChannel.onclose = () => {
          (x.log(`DC#${this.connectionId} dc closed for:`, this.peer), this.close());
        }));
    }
    addStream(e) {
      (x.log(`Receiving stream`, e), (this._remoteStream = e), super.emit(`stream`, e));
    }
    handleMessage(e) {
      let t = e.type,
        n = e.payload;
      switch (e.type) {
        case T.Answer:
          (this._negotiator.handleSDP(t, n.sdp), (this._open = !0));
          break;
        case T.Candidate:
          this._negotiator.handleCandidate(n.candidate);
          break;
        default:
          x.warn(`Unrecognized message type:${t} from peer:${this.peer}`);
      }
    }
    answer(e, t = {}) {
      if (this._localStream) {
        x.warn(
          `Local stream already exists on this MediaConnection. Are you answering a call twice?`,
        );
        return;
      }
      ((this._localStream = e),
        t && t.sdpTransform && (this.options.sdpTransform = t.sdpTransform),
        this._negotiator.startConnection({ ...this.options._payload, _stream: e }));
      let n = this.provider._getMessages(this.connectionId);
      for (let e of n) this.handleMessage(e);
      this._open = !0;
    }
    close() {
      ((this._negotiator &&= (this._negotiator.cleanup(), null)),
        (this._localStream = null),
        (this._remoteStream = null),
        (this.provider &&= (this.provider._removeConnection(this), null)),
        this.options && this.options._stream && (this.options._stream = null),
        this.open && ((this._open = !1), super.emit(`close`)));
    }
  },
  dn = class {
    constructor(e) {
      this._options = e;
    }
    _buildRequest(e) {
      let t = this._options.secure ? `https` : `http`,
        { host: n, port: r, path: i, key: a } = this._options,
        o = new URL(`${t}://${n}:${r}${i}${a}/${e}`);
      return (
        o.searchParams.set(`ts`, `${Date.now()}${Math.random()}`),
        o.searchParams.set(`version`, rn),
        fetch(o.href, { referrerPolicy: this._options.referrerPolicy })
      );
    }
    async retrieveId() {
      try {
        let e = await this._buildRequest(`id`);
        if (e.status !== 200) throw Error(`Error. Status:${e.status}`);
        return e.text();
      } catch (e) {
        x.error(`Error retrieving ID`, e);
        let t = ``;
        throw (
          this._options.path === `/` &&
            this._options.host !== b.CLOUD_HOST &&
            (t =
              " If you passed in a `path` to your self-hosted PeerServer, you'll also need to pass in that same path when creating a new Peer."),
          Error(`Could not get an ID from the server.` + t)
        );
      }
    }
    async listAllPeers() {
      try {
        let e = await this._buildRequest(`peers`);
        if (e.status !== 200) {
          if (e.status === 401) {
            let e = ``;
            throw (
              (e =
                this._options.host === b.CLOUD_HOST
                  ? `It looks like you're using the cloud server. You can email team@peerjs.com to enable peer listing for your API key.`
                  : "You need to enable `allow_discovery` on your self-hosted PeerServer to use this feature."),
              Error(`It doesn't look like you have permission to list peers IDs. ` + e)
            );
          }
          throw Error(`Error. Status:${e.status}`);
        }
        return e.json();
      } catch (e) {
        throw (
          x.error(`Error retrieving list peers`, e),
          Error(`Could not get list peers from the server.` + e)
        );
      }
    }
  },
  fn = class e extends ln {
    static #e = (this.ID_PREFIX = `dc_`);
    static #t = (this.MAX_BUFFERED_AMOUNT = 8388608);
    get type() {
      return Qt.Data;
    }
    constructor(t, n, r) {
      (super(t, n, r),
        (this.connectionId = this.options.connectionId || e.ID_PREFIX + Ht()),
        (this.label = this.options.label || this.connectionId),
        (this.reliable = !!this.options.reliable),
        (this._negotiator = new on(this)),
        this._negotiator.startConnection(
          this.options._payload || { originator: !0, reliable: this.reliable },
        ));
    }
    _initializeDataChannel(e) {
      ((this.dataChannel = e),
        (this.dataChannel.onopen = () => {
          (x.log(`DC#${this.connectionId} dc connection success`),
            (this._open = !0),
            this.emit(`open`));
        }),
        (this.dataChannel.onmessage = (e) => {
          x.log(`DC#${this.connectionId} dc onmessage:`, e.data);
        }),
        (this.dataChannel.onclose = () => {
          (x.log(`DC#${this.connectionId} dc closed for:`, this.peer), this.close());
        }));
    }
    close(e) {
      if (e?.flush) {
        this.send({ __peerData: { type: `close` } });
        return;
      }
      ((this._negotiator &&= (this._negotiator.cleanup(), null)),
        (this.provider &&= (this.provider._removeConnection(this), null)),
        (this.dataChannel &&=
          ((this.dataChannel.onopen = null),
          (this.dataChannel.onmessage = null),
          (this.dataChannel.onclose = null),
          null)),
        this.open && ((this._open = !1), super.emit(`close`)));
    }
    send(e, t = !1) {
      if (!this.open) {
        this.emitError(
          en.NotOpenYet,
          "Connection is not open. You should listen for the `open` event before sending messages.",
        );
        return;
      }
      return this._send(e, t);
    }
    async handleMessage(e) {
      let t = e.payload;
      switch (e.type) {
        case T.Answer:
          await this._negotiator.handleSDP(e.type, t.sdp);
          break;
        case T.Candidate:
          await this._negotiator.handleCandidate(t.candidate);
          break;
        default:
          x.warn(`Unrecognized message type:`, e.type, `from peer:`, this.peer);
      }
    }
  },
  pn = class extends fn {
    get bufferSize() {
      return this._bufferSize;
    }
    _initializeDataChannel(e) {
      (super._initializeDataChannel(e),
        (this.dataChannel.binaryType = `arraybuffer`),
        this.dataChannel.addEventListener(`message`, (e) => this._handleDataMessage(e)));
    }
    _bufferedSend(e) {
      (this._buffering || !this._trySend(e)) &&
        (this._buffer.push(e), (this._bufferSize = this._buffer.length));
    }
    _trySend(e) {
      if (!this.open) return !1;
      if (this.dataChannel.bufferedAmount > fn.MAX_BUFFERED_AMOUNT)
        return (
          (this._buffering = !0),
          setTimeout(() => {
            ((this._buffering = !1), this._tryBuffer());
          }, 50),
          !1
        );
      try {
        this.dataChannel.send(e);
      } catch (e) {
        return (
          x.error(`DC#:${this.connectionId} Error when sending:`, e),
          (this._buffering = !0),
          this.close(),
          !1
        );
      }
      return !0;
    }
    _tryBuffer() {
      if (!this.open || this._buffer.length === 0) return;
      let e = this._buffer[0];
      this._trySend(e) &&
        (this._buffer.shift(), (this._bufferSize = this._buffer.length), this._tryBuffer());
    }
    close(e) {
      if (e?.flush) {
        this.send({ __peerData: { type: `close` } });
        return;
      }
      ((this._buffer = []), (this._bufferSize = 0), super.close());
    }
    constructor(...e) {
      (super(...e), (this._buffer = []), (this._bufferSize = 0), (this._buffering = !1));
    }
  },
  mn = class extends pn {
    close(e) {
      (super.close(e), (this._chunkedData = {}));
    }
    constructor(e, t, n) {
      (super(e, t, n),
        (this.chunker = new Lt()),
        (this.serialization = tn.Binary),
        (this._chunkedData = {}));
    }
    _handleDataMessage({ data: e }) {
      let t = Te(e),
        n = t.__peerData;
      if (n) {
        if (n.type === `close`) {
          this.close();
          return;
        }
        this._handleChunk(t);
        return;
      }
      this.emit(`data`, t);
    }
    _handleChunk(e) {
      let t = e.__peerData,
        n = this._chunkedData[t] || { data: [], count: 0, total: e.total };
      if (
        ((n.data[e.n] = new Uint8Array(e.data)),
        n.count++,
        (this._chunkedData[t] = n),
        n.total === n.count)
      ) {
        delete this._chunkedData[t];
        let e = Rt(n.data);
        this._handleDataMessage({ data: e });
      }
    }
    _send(e, t) {
      let n = Ee(e);
      if (n instanceof Promise) return this._send_blob(n);
      if (!t && n.byteLength > this.chunker.chunkedMTU) {
        this._sendChunks(n);
        return;
      }
      this._bufferedSend(n);
    }
    async _send_blob(e) {
      let t = await e;
      if (t.byteLength > this.chunker.chunkedMTU) {
        this._sendChunks(t);
        return;
      }
      this._bufferedSend(t);
    }
    _sendChunks(e) {
      let t = this.chunker.chunk(e);
      x.log(`DC#${this.connectionId} Try to send ${t.length} chunks...`);
      for (let e of t) this.send(e, !0);
    }
  },
  hn = class extends pn {
    _handleDataMessage({ data: e }) {
      super.emit(`data`, e);
    }
    _send(e, t) {
      this._bufferedSend(e);
    }
    constructor(...e) {
      (super(...e), (this.serialization = tn.None));
    }
  },
  gn = class extends pn {
    _handleDataMessage({ data: e }) {
      let t = this.parse(this.decoder.decode(e)),
        n = t.__peerData;
      if (n && n.type === `close`) {
        this.close();
        return;
      }
      this.emit(`data`, t);
    }
    _send(e, t) {
      let n = this.encoder.encode(this.stringify(e));
      if (n.byteLength >= b.chunkedMTU) {
        this.emitError(en.MessageToBig, `Message too big for JSON channel`);
        return;
      }
      this._bufferedSend(n);
    }
    constructor(...e) {
      (super(...e),
        (this.serialization = tn.JSON),
        (this.encoder = new TextEncoder()),
        (this.decoder = new TextDecoder()),
        (this.stringify = JSON.stringify),
        (this.parse = JSON.parse));
    }
  },
  _n = class e extends sn {
    static #e = (this.DEFAULT_KEY = `peerjs`);
    get id() {
      return this._id;
    }
    get options() {
      return this._options;
    }
    get open() {
      return this._open;
    }
    get socket() {
      return this._socket;
    }
    get connections() {
      let e = Object.create(null);
      for (let [t, n] of this._connections) e[t] = n;
      return e;
    }
    get destroyed() {
      return this._destroyed;
    }
    get disconnected() {
      return this._disconnected;
    }
    constructor(t, n) {
      (super(),
        (this._serializers = { raw: hn, json: gn, binary: mn, "binary-utf8": mn, default: mn }),
        (this._id = null),
        (this._lastServerId = null),
        (this._destroyed = !1),
        (this._disconnected = !1),
        (this._open = !1),
        (this._connections = new Map()),
        (this._lostMessages = new Map()));
      let r;
      if (
        (t && t.constructor == Object ? (n = t) : t && (r = t.toString()),
        (n = {
          debug: 0,
          host: b.CLOUD_HOST,
          port: b.CLOUD_PORT,
          path: `/`,
          key: e.DEFAULT_KEY,
          token: b.randomToken(),
          config: b.defaultConfig,
          referrerPolicy: `strict-origin-when-cross-origin`,
          serializers: {},
          ...n,
        }),
        (this._options = n),
        (this._serializers = { ...this._serializers, ...this.options.serializers }),
        this._options.host === `/` && (this._options.host = window.location.hostname),
        this._options.path &&
          (this._options.path[0] !== `/` && (this._options.path = `/` + this._options.path),
          this._options.path[this._options.path.length - 1] !== `/` && (this._options.path += `/`)),
        this._options.secure === void 0 && this._options.host !== b.CLOUD_HOST
          ? (this._options.secure = b.isSecure())
          : this._options.host == b.CLOUD_HOST && (this._options.secure = !0),
        this._options.logFunction && x.setLogFunction(this._options.logFunction),
        (x.logLevel = this._options.debug || 0),
        (this._api = new dn(n)),
        (this._socket = this._createServerConnection()),
        !b.supports.audioVideo && !b.supports.data)
      ) {
        this._delayedAbort(w.BrowserIncompatible, `The current browser does not support WebRTC`);
        return;
      }
      if (r && !b.validateId(r)) {
        this._delayedAbort(w.InvalidID, `ID "${r}" is invalid`);
        return;
      }
      r
        ? this._initialize(r)
        : this._api
            .retrieveId()
            .then((e) => this._initialize(e))
            .catch((e) => this._abort(w.ServerError, e));
    }
    _createServerConnection() {
      let e = new an(
        this._options.secure,
        this._options.host,
        this._options.port,
        this._options.path,
        this._options.key,
        this._options.pingInterval,
      );
      return (
        e.on(nn.Message, (e) => {
          this._handleMessage(e);
        }),
        e.on(nn.Error, (e) => {
          this._abort(w.SocketError, e);
        }),
        e.on(nn.Disconnected, () => {
          this.disconnected ||
            (this.emitError(w.Network, `Lost connection to server.`), this.disconnect());
        }),
        e.on(nn.Close, () => {
          this.disconnected || this._abort(w.SocketClosed, `Underlying socket is already closed.`);
        }),
        e
      );
    }
    _initialize(e) {
      ((this._id = e), this.socket.start(e, this._options.token));
    }
    _handleMessage(e) {
      let t = e.type,
        n = e.payload,
        r = e.src;
      switch (t) {
        case T.Open:
          ((this._lastServerId = this.id), (this._open = !0), this.emit(`open`, this.id));
          break;
        case T.Error:
          this._abort(w.ServerError, n.msg);
          break;
        case T.IdTaken:
          this._abort(w.UnavailableID, `ID "${this.id}" is taken`);
          break;
        case T.InvalidKey:
          this._abort(w.InvalidKey, `API KEY "${this._options.key}" is invalid`);
          break;
        case T.Leave:
          (x.log(`Received leave message from ${r}`),
            this._cleanupPeer(r),
            this._connections.delete(r));
          break;
        case T.Expire:
          this.emitError(w.PeerUnavailable, `Could not connect to peer ${r}`);
          break;
        case T.Offer: {
          let e = n.connectionId,
            t = this.getConnection(r, e);
          if (
            (t && (t.close(), x.warn(`Offer received for existing Connection ID:${e}`)),
            n.type === Qt.Media)
          ) {
            let i = new un(r, this, { connectionId: e, _payload: n, metadata: n.metadata });
            ((t = i), this._addConnection(r, t), this.emit(`call`, i));
          } else if (n.type === Qt.Data) {
            let i = new this._serializers[n.serialization](r, this, {
              connectionId: e,
              _payload: n,
              metadata: n.metadata,
              label: n.label,
              serialization: n.serialization,
              reliable: n.reliable,
            });
            ((t = i), this._addConnection(r, t), this.emit(`connection`, i));
          } else {
            x.warn(`Received malformed connection type:${n.type}`);
            return;
          }
          let i = this._getMessages(e);
          for (let e of i) t.handleMessage(e);
          break;
        }
        default: {
          if (!n) {
            x.warn(`You received a malformed message from ${r} of type ${t}`);
            return;
          }
          let i = n.connectionId,
            a = this.getConnection(r, i);
          a && a.peerConnection
            ? a.handleMessage(e)
            : i
              ? this._storeMessage(i, e)
              : x.warn(`You received an unrecognized message:`, e);
          break;
        }
      }
    }
    _storeMessage(e, t) {
      (this._lostMessages.has(e) || this._lostMessages.set(e, []),
        this._lostMessages.get(e).push(t));
    }
    _getMessages(e) {
      let t = this._lostMessages.get(e);
      return t ? (this._lostMessages.delete(e), t) : [];
    }
    connect(e, t = {}) {
      if (((t = { serialization: `default`, ...t }), this.disconnected)) {
        (x.warn(
          `You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect, or call reconnect on this peer if you believe its ID to still be available.`,
        ),
          this.emitError(
            w.Disconnected,
            `Cannot connect to new Peer after disconnecting from server.`,
          ));
        return;
      }
      let n = new this._serializers[t.serialization](e, this, t);
      return (this._addConnection(e, n), n);
    }
    call(e, t, n = {}) {
      if (this.disconnected) {
        (x.warn(
          `You cannot connect to a new Peer because you called .disconnect() on this Peer and ended your connection with the server. You can create a new Peer to reconnect.`,
        ),
          this.emitError(
            w.Disconnected,
            `Cannot connect to new Peer after disconnecting from server.`,
          ));
        return;
      }
      if (!t) {
        x.error("To call a peer, you must provide a stream from your browser's `getUserMedia`.");
        return;
      }
      let r = new un(e, this, { ...n, _stream: t });
      return (this._addConnection(e, r), r);
    }
    _addConnection(e, t) {
      (x.log(`add connection ${t.type}:${t.connectionId} to peerId:${e}`),
        this._connections.has(e) || this._connections.set(e, []),
        this._connections.get(e).push(t));
    }
    _removeConnection(e) {
      let t = this._connections.get(e.peer);
      if (t) {
        let n = t.indexOf(e);
        n !== -1 && t.splice(n, 1);
      }
      this._lostMessages.delete(e.connectionId);
    }
    getConnection(e, t) {
      let n = this._connections.get(e);
      if (!n) return null;
      for (let e of n) if (e.connectionId === t) return e;
      return null;
    }
    _delayedAbort(e, t) {
      setTimeout(() => {
        this._abort(e, t);
      }, 0);
    }
    _abort(e, t) {
      (x.error(`Aborting!`),
        this.emitError(e, t),
        this._lastServerId ? this.disconnect() : this.destroy());
    }
    destroy() {
      this.destroyed ||
        (x.log(`Destroy peer with ID:${this.id}`),
        this.disconnect(),
        this._cleanup(),
        (this._destroyed = !0),
        this.emit(`close`));
    }
    _cleanup() {
      for (let e of this._connections.keys()) (this._cleanupPeer(e), this._connections.delete(e));
      this.socket.removeAllListeners();
    }
    _cleanupPeer(e) {
      let t = this._connections.get(e);
      if (t) for (let e of t) e.close();
    }
    disconnect() {
      if (this.disconnected) return;
      let e = this.id;
      (x.log(`Disconnect peer with ID:${e}`),
        (this._disconnected = !0),
        (this._open = !1),
        this.socket.close(),
        (this._lastServerId = e),
        (this._id = null),
        this.emit(`disconnected`, e));
    }
    reconnect() {
      if (this.disconnected && !this.destroyed)
        (x.log(`Attempting reconnection to server with ID ${this._lastServerId}`),
          (this._disconnected = !1),
          this._initialize(this._lastServerId));
      else if (this.destroyed)
        throw Error(`This peer cannot reconnect to the server. It has already been destroyed.`);
      else if (!this.disconnected && !this.open)
        x.error(`In a hurry? We're still trying to make the initial connection!`);
      else
        throw Error(
          `Peer ${this.id} cannot reconnect because it is not disconnected from the server!`,
        );
    }
    listAllPeers(e = (e) => {}) {
      this._api
        .listAllPeers()
        .then((t) => e(t))
        .catch((e) => this._abort(w.ServerError, e));
    }
  },
  vn = [
    { id: `up`, label: `D-pad Up`, bit: 16, hint: `Press UP on the D-pad` },
    { id: `down`, label: `D-pad Down`, bit: 32, hint: `Press DOWN on the D-pad` },
    { id: `left`, label: `D-pad Left`, bit: 64, hint: `Press LEFT on the D-pad` },
    { id: `right`, label: `D-pad Right`, bit: 128, hint: `Press RIGHT on the D-pad` },
    { id: `a`, label: `Genesis A`, bit: 2, hint: `Press the button you want for A` },
    { id: `b`, label: `Genesis B`, bit: 1, hint: `Press the button you want for B` },
    { id: `c`, label: `Genesis C`, bit: 256, hint: `Press the button you want for C` },
    { id: `start`, label: `Start`, bit: 8, hint: `Press the button you want for START` },
  ],
  yn = [
    ...vn.slice(0, 4),
    { id: `a`, label: `SNES A`, bit: 2, hint: `Press SNES A` },
    { id: `b`, label: `SNES B`, bit: 1, hint: `Press SNES B` },
    { id: `y`, label: `SNES Y · check / recovery`, required: !0, bit: 512, hint: `Press SNES Y` },
    { id: `x`, label: `SNES X · goalie`, required: !0, bit: 1024, hint: `Press SNES X` },
    { id: `l`, label: `SNES L`, bit: 2048, hint: `Press SNES L` },
    { id: `r`, label: `SNES R`, bit: 4, hint: `Press SNES R` },
    vn.at(-1),
  ],
  bn = (e = `genesis`) => (e === `snes` ? yn : vn),
  xn = [...vn, ...yn.filter((e) => !vn.some((t) => t.id === e.id))],
  Sn = (e, t = `genesis`) => An(e) + (t === `snes` ? `|snes` : ``),
  Cn = `king94-controller-profiles-v1`,
  wn = { capturing: !1 },
  Tn = 0.45,
  En = 0.1,
  Dn = 0.5,
  On = 250,
  kn = new Map();
function An(e) {
  let t = String(e?.id || ``),
    n = `${t}|${e?.mapping}|${e?.buttons?.length}|${e?.axes?.length}`;
  if (kn.has(n)) return kn.get(n);
  let r =
      /vendor:\s*([0-9a-f]{4}).*?product:\s*([0-9a-f]{4})/i.exec(t) ||
      /^([0-9a-f]{4})-([0-9a-f]{4})-/i.exec(t),
    i = `${
      r
        ? `${r[1].toLowerCase()}:${r[2].toLowerCase()}`
        : `id:${t
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, `-`)
            .slice(0, 60)}`
    }|${e?.mapping === `standard` ? `std` : `raw`}|${e?.buttons?.length ?? 0}b${e?.axes?.length ?? 0}a`;
  return (kn.size > 50 && kn.clear(), kn.set(n, i), i);
}
function jn(e) {
  return (
    String(e?.id || `Controller`)
      .replace(/^[0-9a-f]{4}-[0-9a-f]{4}-/i, ``)
      .replace(/\s*\(.*\)\s*$/, ``)
      .trim() || `Controller`
  );
}
function Mn(e = `genesis`) {
  return e === `snes`
    ? {
        ...Mn(),
        a: [{ t: `b`, i: 1 }],
        b: [{ t: `b`, i: 0 }],
        y: [{ t: `b`, i: 2 }],
        x: [{ t: `b`, i: 3 }],
        l: [{ t: `b`, i: 4 }],
        r: [{ t: `b`, i: 5 }],
      }
    : {
        up: [
          { t: `b`, i: 12 },
          { t: `a`, i: 1, s: -1 },
        ],
        down: [
          { t: `b`, i: 13 },
          { t: `a`, i: 1, s: 1 },
        ],
        left: [
          { t: `b`, i: 14 },
          { t: `a`, i: 0, s: -1 },
        ],
        right: [
          { t: `b`, i: 15 },
          { t: `a`, i: 0, s: 1 },
        ],
        a: [{ t: `b`, i: 2 }],
        b: [{ t: `b`, i: 0 }],
        c: [
          { t: `b`, i: 1 },
          { t: `b`, i: 3 },
        ],
        start: [{ t: `b`, i: 9 }],
      };
}
function Nn(e, t) {
  if (t.t === `b`) {
    let n = e.buttons?.[t.i];
    return !!(n && (n.pressed || n.value > 0.6));
  }
  let n = e.axes?.[t.i];
  return typeof n == `number` ? (t.t === `a` ? n * t.s > Tn : Math.abs(n - t.v) < En) : !1;
}
function Pn(e, t, n = `genesis`) {
  let r = 0;
  for (let i of bn(n)) (t[i.id] || []).some((t) => Nn(e, t)) && (r |= i.bit);
  return r;
}
function Fn(e) {
  return e.t === `b`
    ? `Button ${e.i}`
    : e.t === `a`
      ? `Axis ${e.i} ${e.s < 0 ? `−` : `+`}`
      : `D-pad hat ${e.i} · ${e.v.toFixed(2)}`;
}
var In = (e, t) =>
    e.t === t.t &&
    e.i === t.i &&
    (e.t === `a` ? e.s === t.s : e.t !== `h` || Math.abs(e.v - t.v) < 0.01),
  Ln = (e) =>
    e &&
    typeof e == `object` &&
    Number.isInteger(e.i) &&
    e.i >= 0 &&
    e.i < 64 &&
    (e.t === `b` ||
      (e.t === `a` && (e.s === 1 || e.s === -1)) ||
      (e.t === `h` && Number.isFinite(e.v) && e.v > -2 && e.v < 5)),
  Rn = (e) =>
    e.t === `b`
      ? { t: `b`, i: e.i }
      : e.t === `a`
        ? { t: `a`, i: e.i, s: e.s }
        : { t: `h`, i: e.i, v: Math.round(e.v * 1e3) / 1e3 };
function zn(e) {
  let t = {};
  if (!e || typeof e != `object` || Array.isArray(e)) return t;
  for (let [n, r] of Object.entries(e).slice(0, 20)) {
    if (
      typeof n != `string` ||
      n.length > 120 ||
      !r ||
      typeof r != `object` ||
      !r.bindings ||
      typeof r.bindings != `object`
    )
      continue;
    let e = {};
    for (let t of xn)
      e[t.id] = (Array.isArray(r.bindings[t.id]) ? r.bindings[t.id] : [])
        .filter(Ln)
        .slice(0, 4)
        .map(Rn);
    t[n] = {
      name: String(r.name || `Controller`).slice(0, 80),
      saved: String(r.saved || ``).slice(0, 30),
      bindings: e,
    };
  }
  return t;
}
var Bn = null;
function Vn(e) {
  if (e !== void 0) return e;
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}
function Hn(e) {
  try {
    let t = Vn(e);
    if (!t) throw Error(`Storage unavailable`);
    return zn(JSON.parse(t.getItem(`king94-controller-profiles-v1`) || `{}`));
  } catch {
    return (e === void 0 && Bn) || {};
  }
}
function Un() {
  return (Bn ||= Hn());
}
function Wn() {
  return ((Bn = null), Un());
}
function Gn(e, t) {
  Bn = e;
  try {
    return (t.setItem(Cn, JSON.stringify(e)), !0);
  } catch {
    return !1;
  }
}
function Kn(e, t, n, r, i = new Date()) {
  let a = r === void 0 ? { ...Un() } : Hn(r);
  return ((a[e] = { name: t, saved: i.toISOString(), bindings: n }), Gn(zn(a), Vn(r)));
}
function qn(e, t) {
  let n = t === void 0 ? { ...Un() } : Hn(t);
  return (delete n[e], Gn(n, Vn(t)));
}
function Jn(e, t = Un(), n = `genesis`) {
  let r = t[Sn(e, n)];
  return r && (n !== `snes` || (r.bindings.x?.length && r.bindings.y?.length))
    ? { bindings: r.bindings, source: `saved` }
    : { bindings: Mn(n), source: e.mapping === `standard` ? `standard` : `unconfigured` };
}
var Yn = (e, t = Un(), n = `genesis`) => Jn(e, t, n).source !== `saved`;
function Xn(e) {
  return {
    b: Array.from(e.buttons || [], (e) => !!(e.pressed || e.value > 0.6)),
    a: Array.from(e.axes || []),
  };
}
function Zn(e, t) {
  for (let n = 0; n < t.buttons.length; n++)
    if ((t.buttons[n].pressed || t.buttons[n].value > 0.6) && !e.b[n]) return { t: `b`, i: n };
  for (let n = 0; n < t.axes.length; n++) {
    let r = e.a[n] ?? 0,
      i = t.axes[n],
      a = i - r;
    if (!(!Number.isFinite(i) || Math.abs(a) < Dn))
      return Math.abs(r) > 1.05
        ? Math.abs(i) > 1.05
          ? null
          : { t: `h`, i: n, v: Math.round(i * 1e3) / 1e3 }
        : { t: `a`, i: n, s: Math.sign(a) };
  }
  return null;
}
var Qn = class {
    constructor(e = vn) {
      ((this.actions = e),
        (this.index = 0),
        (this.bindings = {}),
        (this.message = ``),
        (this.state = `settling`),
        (this.calmSince = null),
        (this.last = null),
        (this.base = null));
    }
    get done() {
      return this.index >= this.actions.length;
    }
    get current() {
      return this.actions[this.index] || null;
    }
    update(e, t) {
      if (this.done) return !1;
      let n = Xn(e);
      if (this.state === `settling`) {
        let e =
          !n.b.some(Boolean) &&
          (!this.last || n.a.every((e, t) => Math.abs(e - (this.last.a[t] ?? e)) < 0.05));
        return (
          (this.last = n),
          e
            ? ((this.calmSince ??= t),
              t - this.calmSince >= On && ((this.base = n), (this.state = `listening`)),
              !1)
            : ((this.calmSince = null), !1)
        );
      }
      let r = Zn(this.base, e);
      if (!r) return !1;
      let i = this.actions.find((e) => (this.bindings[e.id] || []).some((e) => In(e, r)));
      return i
        ? ((this.message = `That input is already used for ${i.label}. Press a different one.`),
          this.#e(),
          !1)
        : ((this.message = ``),
          (this.bindings[this.current.id] = [r]),
          this.index++,
          this.#e(),
          !0);
    }
    skip() {
      if (this.done) return !1;
      if (this.current.required)
        return (
          (this.message = `${this.current.label} is required. Press a controller button to map it.`),
          !1
        );
      ((this.bindings[this.current.id] = []), (this.message = ``), this.index++, this.#e());
    }
    back() {
      this.index !== 0 &&
        (this.index--, delete this.bindings[this.current.id], (this.message = ``), this.#e());
    }
    restart() {
      ((this.index = 0), (this.bindings = {}), (this.message = ``), this.#e());
    }
    #e() {
      ((this.state = `settling`), (this.calmSince = null), (this.last = null));
    }
    result() {
      let e = {};
      for (let t of this.actions) e[t.id] = this.bindings[t.id] || [];
      return e;
    }
  },
  E = (e) => document.getElementById(e),
  $n = E(`controller-dialog`);
$n && er();
function er() {
  let e = null,
    t = `view`,
    n = 0,
    r = null,
    i = !0,
    a = `genesis`,
    o = null,
    s = ``,
    c = () => Array.from(navigator.getGamepads?.() || []).filter(Boolean),
    l = () => c().find((e) => e.index === r) || c()[0] || null,
    u = () => E(`arena`)?.getAttribute(`data-platform`) || `genesis`,
    d = () => bn(u()),
    f = (e) => (e ? `${e.index}|${An(e)}` : null),
    p = (e) => `king94-controller-banner:${Sn(e, u())}`,
    m = (e) => {
      try {
        return sessionStorage.getItem(e) === `1`;
      } catch {
        return !1;
      }
    },
    h = (e) => {
      try {
        sessionStorage.setItem(e, `1`);
      } catch {}
    };
  function g(e) {
    let t = e.mapping !== `standard`;
    ((E(`controller-banner-text`).textContent = t
      ? `${jn(e)} connected. Browsers number this controller’s buttons differently. Set it up for ${u() === `snes` ? `SNES A, B, X, Y, L, R` : `Sega A, B, C`} and the D-pad.`
      : `${jn(e)} connected. If any button feels wrong, you can set it up in about 20 seconds.`),
      (E(`controller-banner`).hidden = !1),
      (E(`controller-banner`).dataset.pad = String(e.index)));
  }
  function _(e) {
    e && Yn(e, Un(), u()) && !m(p(e)) && g(e);
  }
  (addEventListener(`gamepadconnected`, (e) => {
    ((r ??= e.gamepad.index), _(e.gamepad));
  }),
    addEventListener(`gamepaddisconnected`, (n) => {
      (n.gamepad?.index === r && ((e = null), (t = `view`), (o = null), (r = null)),
        c().length || (E(`controller-banner`).hidden = !0));
    }),
    addEventListener(`storage`, () => Wn()),
    E(`controller-banner-setup`).addEventListener(`click`, () => {
      let e = c().find((e) => String(e.index) === E(`controller-banner`).dataset.pad);
      (e && (r = e.index), re());
    }),
    E(`controller-banner-dismiss`).addEventListener(`click`, () => {
      let e = c().find((e) => String(e.index) === E(`controller-banner`).dataset.pad) || c()[0];
      (e && h(p(e)), (E(`controller-banner`).hidden = !0));
    }));
  function v(n) {
    return e && t === `learn` ? e.bindings : Jn(n, Un(), u()).bindings;
  }
  function ee(n) {
    let r = c(),
      a = r.map(f).join(`,`);
    (a !== s &&
      ((s = a),
      E(`controller-select`).replaceChildren(
        ...r.map((e, t) => new Option(`Controller ${t + 1} · ${jn(e)}`, String(e.index))),
      )),
      (E(`controller-picker`).hidden = r.length < 2),
      (E(`controller-select`).value = n ? String(n.index) : ``),
      (E(`controller-name`).textContent = n ? jn(n) : `No controller detected`));
    let o = E(`controller-steps`);
    o.children.length !== d().length &&
      o.replaceChildren(
        ...d().map((e) => {
          let t = document.createElement(`li`);
          return (
            (t.dataset.action = e.id),
            (t.innerHTML = `<span class="step-dot" aria-hidden="true"></span><strong></strong><span class="step-binding"></span>`),
            (t.querySelector(`strong`).textContent = e.label),
            t
          );
        }),
      );
    let l = n ? v(n) : {};
    d().forEach((r, i) => {
      let a = o.children[i],
        s = l[r.id],
        c = t === `learn` && e && !e.done && e.current.id === r.id;
      (a.classList.toggle(`current`, !!c),
        a.classList.toggle(`active`, !!(n && s?.some((e) => Nn(n, e)))),
        (a.querySelector(`.step-binding`).textContent = c
          ? `press now…`
          : s === void 0
            ? ``
            : s.length
              ? s.map(Fn).join(` or `)
              : `not set`));
    });
    let p;
    ((p = n
      ? t === `learn` && e && !e.done
        ? e.message || `${e.current.hint}. (${e.index + 1} of ${d().length})`
        : t === `saved`
          ? i
            ? `All set. Saved in this browser, so you only do this once. Press buttons to test them, then close.`
            : `Layout applied for this visit, but this browser would not store it (private window or blocked storage).`
          : `Press buttons to test them. Layout: ${Jn(n, Un(), u()).source === `saved` ? `your saved setup` : `standard`}.`
      : `Press any button on your controller so the browser can see it.`),
      (E(`controller-prompt`).textContent = p));
    let m = t === `learn` && e && !e.done;
    ((E(`controller-skip`).hidden = !m || !!e?.current?.required),
      (E(`controller-back`).hidden = !m || e.index === 0),
      (E(`controller-remap`).hidden = m || !n),
      (E(`controller-remap`).textContent =
        t === `view` && n && Yn(n, Un(), u()) ? `Set up buttons` : `Start over`),
      (E(`controller-reset`).hidden = m || !n || Yn(n, Un(), u())));
  }
  function y(i) {
    if (((n = 0), !$n.open)) return;
    a !== u() && ((e = null), (t = `view`), (a = u()), E(`controller-steps`).replaceChildren());
    let s = l();
    if (
      (e && o !== f(s) && ((e = null), (t = `view`), (o = null)),
      s && (r = s.index),
      s && !e && t === `view` && Yn(s, Un(), u()) && te(s),
      s && t === `learn` && e)
    ) {
      let t = e.update(s, i);
      e.done ? ne(s) : t && (E(`controller-prompt`).dataset.flash = String(i));
    }
    (ee(s), (n = requestAnimationFrame(y)));
  }
  function te(n = l()) {
    n && ((a = u()), (o = f(n)), (e = new Qn(d())), (t = `learn`));
  }
  function ne(n) {
    if (a !== u() || o !== f(n)) {
      ((e = null), (t = `view`));
      return;
    }
    ((i = Kn(Sn(n, u()), jn(n), e.result())),
      (t = `saved`),
      (e = null),
      (E(`controller-banner`).hidden = !0));
  }
  function re() {
    $n.open ||
      ((wn.capturing = !0),
      (e = null),
      (t = `view`),
      (i = !0),
      (a = u()),
      typeof $n.showModal == `function` ? $n.showModal() : $n.setAttribute(`open`, ``),
      E(`controller-close`).focus?.(),
      document.dispatchEvent(new Event(`king94-controller-open`)),
      cancelAnimationFrame(n),
      (n = requestAnimationFrame(y)));
  }
  function ie() {
    wn.capturing &&
      ((wn.capturing = !1),
      (e = null),
      (t = `view`),
      cancelAnimationFrame(n),
      (n = 0),
      document.dispatchEvent(new Event(`king94-controller-close`)));
  }
  function ae() {
    $n.open && (typeof $n.close == `function` ? $n.close() : ($n.removeAttribute(`open`), ie()));
  }
  ($n.addEventListener(`close`, ie),
    E(`controller-setup`).addEventListener(`click`, re),
    E(`controller-before-play`)?.addEventListener(`click`, re),
    E(`controller-in-game`)?.addEventListener(`click`, re),
    E(`controller-close`).addEventListener(`click`, ae),
    E(`controller-skip`).addEventListener(`click`, () => {
      e?.skip();
    }),
    E(`controller-back`).addEventListener(`click`, () => {
      e?.back();
    }),
    E(`controller-remap`).addEventListener(`click`, () => te()),
    E(`controller-select`).addEventListener(`change`, () => {
      let n = c().find((e) => String(e.index) === E(`controller-select`).value);
      n && ((r = n.index), (e = null), (o = null), (t = `view`));
    }),
    E(`controller-reset`).addEventListener(`click`, () => {
      let n = l();
      n &&
        (qn(Sn(n, u())),
        (t = `view`),
        (e = null),
        (E(`controller-prompt`).textContent =
          `Saved setup removed. The standard layout is active.`));
    }));
}
var tr = 1200;
function nr({
  doc: e,
  wrap: t,
  canvas: n = null,
  button: r = null,
  hint: i = null,
  setTimer: a = setTimeout,
  clearTimer: o = clearTimeout,
}) {
  let s = 0,
    c = !1,
    l = 0,
    u = () => e.fullscreenElement === t || e.webkitFullscreenElement === t,
    d = () => t.classList.contains(`pseudo-fullscreen`),
    f = () => u() || d();
  function p() {
    u() && t.classList.remove(`pseudo-fullscreen`);
    let c = f();
    (r &&
      ((r.textContent = c ? `Exit full screen` : `Full screen`),
      r.setAttribute(`aria-pressed`, String(c))),
      t.classList.toggle(`is-fullscreen`, c),
      e.documentElement?.classList.toggle(`fullscreen-lock`, c),
      i &&
        (o(s),
        (i.hidden = !c),
        c &&
          (s = a(() => {
            i.hidden = !0;
          }, 3e3))),
      c && n?.focus?.());
  }
  async function m() {
    c = !0;
    let e = ++l,
      n = t.requestFullscreen || t.webkitRequestFullscreen;
    if (n) {
      let r = Promise.resolve()
          .then(() => n.call(t, { navigationUI: `hide` }))
          .then(
            () => `ok`,
            () => `denied`,
          ),
        i,
        s = await Promise.race([
          r,
          new Promise((e) => {
            i = a(() => e(`timeout`), tr);
          }),
        ]);
      if ((o(i), e !== l || !c)) return;
      if (s === `ok` || u()) {
        p();
        return;
      }
    }
    (t.classList.add(`pseudo-fullscreen`), p());
  }
  async function h() {
    if (((c = !1), l++, t.classList.remove(`pseudo-fullscreen`), u()))
      try {
        await (e.exitFullscreen || e.webkitExitFullscreen).call(e);
      } catch {}
    p();
  }
  let g = () => (f() || c ? h() : m()),
    _ = (e) => /^(INPUT|SELECT|TEXTAREA)$/.test(e?.tagName || ``) || e?.isContentEditable;
  function v() {
    if (u() && !c) {
      h();
      return;
    }
    (!u() && !d() && ((c = !1), l++), p());
  }
  return (
    e.addEventListener(`fullscreenchange`, v),
    e.addEventListener(`webkitfullscreenchange`, v),
    e.addEventListener(`keydown`, (t) => {
      if (t.key === `Escape` && d()) {
        h();
        return;
      }
      (t.key === `f` || t.key === `F`) &&
        !t.ctrlKey &&
        !t.metaKey &&
        !t.altKey &&
        !t.repeat &&
        !_(t.target) &&
        !e.querySelector?.(`dialog[open]`) &&
        (t.preventDefault(), g());
    }),
    r?.addEventListener(`click`, () => {
      g();
    }),
    n?.addEventListener(`dblclick`, () => {
      g();
    }),
    p(),
    { toggle: g, enter: m, exit: h, isActive: f }
  );
}
typeof document < `u` &&
  document.getElementById(`screen-wrap`) &&
  nr({
    doc: document,
    wrap: document.getElementById(`screen-wrap`),
    canvas: document.getElementById(`game-canvas`),
    button: document.getElementById(`fullscreen-toggle`),
    hint: document.getElementById(`fullscreen-hint`),
  });
var rr = document.getElementById(`help-dialog`);
if (rr) {
  let e = null;
  function t(t) {
    rr.open ||
      ((e = t.currentTarget),
      typeof rr.showModal == `function` ? rr.showModal() : rr.setAttribute(`open`, ``),
      document.getElementById(`help-close`).focus(),
      document.dispatchEvent(new Event(`king94-help-open`)));
  }
  function n() {
    (document.dispatchEvent(new Event(`king94-help-close`)), e?.focus());
  }
  for (let e of [`help-open`, `help-toolbar`, `help-in-game`])
    document.getElementById(e)?.addEventListener(`click`, t);
  (document.getElementById(`help-close`).addEventListener(`click`, () => {
    typeof rr.close == `function` ? rr.close() : (rr.removeAttribute(`open`), n());
  }),
    rr.addEventListener(`close`, n),
    rr.addEventListener(`click`, (e) => {
      let t = e.target.closest(`[data-help-topic]`);
      if (!t) return;
      let n = document.getElementById(t.dataset.helpTopic);
      n &&
        rr.contains(n) &&
        ((n.open = !0), n.scrollIntoView({ block: `nearest` }), n.querySelector(`summary`).focus());
    }));
}
var ir = {
    ArrowUp: 16,
    ArrowDown: 32,
    ArrowLeft: 64,
    ArrowRight: 128,
    KeyA: 2,
    KeyS: 1,
    KeyD: 256,
    Enter: 8,
  },
  ar = { KeyI: 16, KeyK: 32, KeyJ: 64, KeyL: 128, KeyZ: 2, KeyX: 1, KeyC: 256, ShiftRight: 8 },
  or = { ...ir, KeyD: 0, KeyQ: 512, KeyW: 1024, KeyE: 2048, KeyR: 4 },
  sr = { ...ar, KeyC: 0, KeyU: 512, KeyO: 1024, KeyN: 2048, KeyM: 4 },
  cr = class {
    constructor(e, t = () => `genesis`) {
      ((this.platform = t),
        (this.held = new Set()),
        (this.active = e),
        (this.awaitRelease = new Set()),
        (this.dialogOpen = () => !!document.querySelector?.(`dialog[open]`)),
        addEventListener(`keydown`, (e) => {
          !wn.capturing &&
            !this.dialogOpen() &&
            this.active() &&
            !/^(INPUT|SELECT|TEXTAREA|BUTTON|A|SUMMARY)$/.test(e.target.tagName) &&
            !e.target.isContentEditable &&
            (ir[e.code] || ar[e.code] || or[e.code] || sr[e.code]) &&
            (e.preventDefault(), this.held.add(e.code));
        }),
        addEventListener(`keyup`, (e) => this.held.delete(e.code)),
        addEventListener(`blur`, () => this.held.clear()),
        document.addEventListener(`focusin`, (e) => {
          (/^(INPUT|SELECT|TEXTAREA|BUTTON|A|SUMMARY)$/.test(e.target?.tagName || ``) ||
            e.target?.isContentEditable) &&
            this.held.clear();
        }));
      let n = () => {
        this.held.clear();
        for (let e of Array.from(navigator.getGamepads?.() || []).filter(Boolean))
          this.awaitRelease.add(e.index);
      };
      (document.addEventListener(`king94-controller-close`, n),
        document.addEventListener(`king94-help-close`, n));
    }
    mask(e = 0) {
      let t = Array.from(navigator.getGamepads?.() || []).filter(Boolean),
        n = t[e];
      if (wn.capturing || this.dialogOpen()) {
        this.held.clear();
        for (let e of t) this.awaitRelease.add(e.index);
        return 0;
      }
      let r = 0;
      for (let t of this.held)
        r |= (this.platform() === `snes` ? (e ? sr : or) : e ? ar : ir)[t] || 0;
      let i = n ? Pn(n, Jn(n, Un(), this.platform()).bindings, this.platform()) : 0;
      if (n && this.awaitRelease.has(n.index)) {
        if (i) return r;
        this.awaitRelease.delete(n.index);
      }
      return ((r |= i), r);
    }
  };
function lr(e = globalThis.indexedDB) {
  return e
    ? new Promise((t) => {
        let n = !1,
          r = (e) => {
            if (n) {
              e?.close();
              return;
            }
            ((n = !0), clearTimeout(i), t(e));
          },
          i = setTimeout(() => r(null), 1500),
          a;
        try {
          a = e.open(`king94-disc-cache`, 1);
        } catch {
          r(null);
          return;
        }
        ((a.onupgradeneeded = () => a.result.createObjectStore(`chunks`)),
          (a.onerror = () => r(null)),
          (a.onblocked = () => r(null)),
          (a.onsuccess = () => {
            let e = a.result,
              t = (t, n) =>
                new Promise((r, i) => {
                  let a;
                  try {
                    let o = e.transaction(`chunks`, t),
                      s = n(o.objectStore(`chunks`));
                    ((s.onsuccess = () => {
                      a = s.result;
                    }),
                      (o.oncomplete = () => r(a)),
                      (o.onabort = o.onerror =
                        () => i(o.error || Error(`Disc cache unavailable.`))));
                  } catch (e) {
                    i(e);
                  }
                });
            (r({
              get: (e) => t(`readonly`, (t) => t.get(e)),
              put: (e, n) => t(`readwrite`, (t) => t.put(n, e)),
              remove: (e) => t(`readwrite`, (t) => t.delete(e)),
              clear: () => t(`readwrite`, (e) => e.clear()),
              close: () => e.close(),
            }),
              (e.onversionchange = () => e.close()));
          }));
      })
    : Promise.resolve(null);
}
var ur = 4194304,
  dr = async (e) =>
    Array.from(new Uint8Array(await crypto.subtle.digest(`SHA-256`, e)), (e) =>
      e.toString(16).padStart(2, `0`),
    ).join(``);
async function fr(
  e,
  t,
  {
    fetcher: n = fetch,
    onProgress: r = () => {},
    expectedHash: i = null,
    cacheFactory: a = lr,
    workers: o = i ? 4 : 2,
  } = {},
) {
  if (!Number.isSafeInteger(t) || t < 1 || t > 536870912) throw Error(`Invalid disc size.`);
  if (i !== null && !/^[a-f0-9]{64}$/.test(i)) throw Error(`Invalid disc identity.`);
  if (!Number.isSafeInteger(o) || o < 1 || o > 4) throw Error(`Invalid disc worker count.`);
  let s = new URL(e, globalThis.location?.href || `https://tester.invalid`),
    c = null,
    l = !1;
  if (i) {
    let e = new URL(s.href);
    e.searchParams.set(`info`, `1`);
    let r = await n(e.href, { credentials: `same-origin`, cache: `no-store` });
    if (
      r.status === 401 ||
      r.status === 403 ||
      r.status === 303 ||
      (r.redirected && new URL(r.url).pathname.startsWith(`${globalThis.__BASE}login`))
    )
      throw Error(`Your tester session expired. Sign in again to load Sega CD.`);
    if (r.status !== 200 || !r.headers.get(`content-type`)?.startsWith(`application/json`))
      throw Error(`Sega CD disc information is unavailable. Reload to retry.`);
    if ((await r.json()).bytes !== t)
      throw Error(`The Sega CD disc version has changed. Reload the page.`);
    try {
      ((c = await a()), (l = !!c));
    } catch {}
  }
  let u = new Uint8Array(t),
    d = new AbortController(),
    f = 0,
    p = 0,
    m = 0,
    h = 0,
    g = !1,
    _ = (e) =>
      r(p / t, { phase: e, cachedBytes: h, downloadedBytes: m, cacheAvailable: l, totalBytes: t }),
    v = (e) => `${i}:${t}:${e}`,
    ee = () => {
      l = !1;
    };
  async function y() {
    try {
      for (; !g && f < t;) {
        let e = f,
          r = Math.min(ur, t - e);
        f += r;
        let i;
        if (l)
          try {
            let t = await c.get(v(e));
            t?.bytes instanceof Uint8Array &&
            t.bytes.byteLength === r &&
            (await dr(t.bytes)) === t.hash
              ? ((i = t.bytes), (h += r))
              : t && (await c.remove(v(e)));
          } catch {
            ee();
          }
        if (g) return;
        if (!i) {
          let a = new URL(s.href);
          (a.searchParams.set(`offset`, String(e)), a.searchParams.set(`length`, String(r)));
          let o = await n(a.href, { credentials: `same-origin`, signal: d.signal });
          if (o.status !== 206 || o.headers.get(`content-range`) !== `bytes ${e}-${e + r - 1}/${t}`)
            throw Error(
              `The Sega CD disc could not be loaded. Sign in again or reload; saved chunks will resume.`,
            );
          if (((i = new Uint8Array(await o.arrayBuffer())), i.byteLength !== r))
            throw Error(`The Sega CD download was incomplete.`);
          if (g) return;
          if (((m += r), l))
            try {
              await c.put(v(e), { bytes: i, hash: await dr(i) });
            } catch {
              ee();
            }
        }
        if (g) return;
        (u.set(i, e), (p += r), _(`loading`));
      }
    } catch (e) {
      throw ((g = !0), d.abort(), e);
    }
  }
  try {
    i && _(`checking`);
    let e = (await Promise.allSettled(Array.from({ length: o }, y))).find(
      (e) => e.status === `rejected`,
    );
    if (e) throw e.reason;
    if (i && (_(`verifying`), (await dr(u)) !== i))
      throw (
        await c?.clear().catch(() => {}),
        Error(`Sega CD disc verification failed. Reload to download a clean copy.`)
      );
    return u;
  } finally {
    c?.close();
  }
}
var pr = class {
    constructor() {
      ((this.context = null), (this.next = 0), (this.attempt = 0), (this.gain = null));
      let v = NaN;
      try {
        v = parseFloat(localStorage.getItem(`nhl94online-volume`));
      } catch {}
      ((this.volume = Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 1),
        (this.muted = !1));
    }
    setVolume(v, m) {
      ((this.volume = Math.min(1, Math.max(0, +v || 0))),
        m !== void 0 && (this.muted = !!m));
      try {
        localStorage.setItem(`nhl94online-volume`, String(this.volume));
      } catch {}
      this.applyVolume();
    }
    applyVolume() {
      if (!this.gain) return;
      let v = this.muted ? 0 : this.volume * this.volume;
      try {
        this.gain.gain.setTargetAtTime(v, this.context.currentTime, 0.01);
      } catch {
        this.gain.gain.value = v;
      }
    }
    async unlock() {
      let e = ++this.attempt,
        t;
      try {
        let n = window.AudioContext || window.webkitAudioContext;
        if (!n) return !1;
        this.context ||= new n();
        let r = await Promise.race([
          Promise.resolve(this.context.resume()).then(
            () => !0,
            () => !1,
          ),
          new Promise((e) => {
            t = setTimeout(() => e(!1), 750);
          }),
        ]);
        return (
          e === this.attempt &&
          ((this.next = this.context.currentTime), r && this.context.state === `running`)
        );
      } catch {
        return !1;
      } finally {
        clearTimeout(t);
      }
    }
    push(e, t) {
      let n = this.context;
      if (n && n.state === `running` && e.length && !(this.next > n.currentTime + 0.15))
        try {
          let r = e.length / 2,
            i = n.createBuffer(2, r, t);
          for (let t = 0; t < 2; t++) {
            let n = i.getChannelData(t);
            for (let i = 0; i < r; i++) n[i] = e[i * 2 + t] / 32768;
          }
          let a = n.createBufferSource();
          ((a.buffer = i),
            this.gain ||
              ((this.gain = n.createGain()), this.gain.connect(n.destination), this.applyVolume()),
            a.connect(this.gain),
            (this.next = Math.max(this.next, n.currentTime + 0.015)),
            a.start(this.next),
            (this.next += i.duration));
        } catch {
          this.next = 0;
        }
    }
    suspend() {
      this.attempt++;
      try {
        Promise.resolve(this.context?.suspend()).catch(() => {});
      } catch {}
      this.next = 0;
    }
  },
  mr = Object.freeze({
    id: `king94-genesis-2026-10-v1`,
    console: `genesis`,
    periodMinutes: 5,
    offsides: !1,
    penalties: !0,
    lineChanges: !1,
    goalie: `manual`,
    mercyGoalDifference: 6,
    allowTies: !1,
    turboAllowed: !1,
    overtime: `restart-sudden-death-after-tied-overtime`,
    lineEdits: `pregame-or-stoppage`,
  }),
  hr = Object.freeze(
    [
      [`ANA`, `Anaheim Mighty Ducks`],
      [`BOS`, `Boston Bruins`],
      [`BUF`, `Buffalo Sabres`],
      [`CGY`, `Calgary Flames`],
      [`CHI`, `Chicago Blackhawks`],
      [`DAL`, `Dallas Stars`],
      [`DET`, `Detroit Red Wings`],
      [`EDM`, `Edmonton Oilers`],
      [`FLA`, `Florida Panthers`],
      [`HFD`, `Hartford Whalers`],
      [`LA`, `Los Angeles Kings`],
      [`MTL`, `Montreal Canadiens`],
      [`NJ`, `New Jersey Devils`],
      [`NYI`, `New York Islanders`],
      [`NYR`, `New York Rangers`],
      [`OTT`, `Ottawa Senators`],
      [`PHI`, `Philadelphia Flyers`],
      [`PIT`, `Pittsburgh Penguins`],
      [`QUE`, `Quebec Nordiques`],
      [`SJ`, `San Jose Sharks`],
      [`STL`, `St. Louis Blues`],
      [`TB`, `Tampa Bay Lightning`],
      [`TOR`, `Toronto Maple Leafs`],
      [`VAN`, `Vancouver Canucks`],
      [`WSH`, `Washington Capitals`],
      [`WPG`, `Winnipeg Jets`],
    ].map(([e, t]) => Object.freeze({ id: e, name: t })),
  ),
  gr = Object.freeze(
    [
      [`CHI`, `DET`],
      [`BUF`, `VAN`],
      [`MTL`, `BOS`],
      [`WPG`, `CGY`],
      [`DAL`, `LA`],
      [`QUE`, `TOR`],
      [`NYR`, `EDM`],
      [`PHI`, `PIT`],
      [`STL`, `WSH`],
      [`HFD`, `NJ`],
      [`NYI`, `SJ`],
      [`TB`, `FLA`],
      [`OTT`, `ANA`],
    ].map((e, t) => Object.freeze({ id: `pair-${t + 1}`, pair: Object.freeze(e) })),
  );
function _r({ pair: e, usedTeams: t = [], allowedTeams: n = hr.map((e) => e.id) }) {
  return !Array.isArray(e) || e.length !== 2
    ? { valid: !1, reason: `Call exactly two teams.` }
    : e[0] === e[1]
      ? { valid: !1, reason: `Choose two different teams.` }
      : e.some((e) => !n.includes(e))
        ? { valid: !1, reason: `Team is not enabled in this event.` }
        : e.some((e) => t.includes(e))
          ? { valid: !1, reason: `A called team has already been used in this scope.` }
          : { valid: !0, reason: null };
}
function vr(e, t) {
  let n = _r({ pair: e });
  if (!n.valid) throw Error(n.reason);
  if (!e.includes(t)) throw Error(`Home must choose one of the two called teams.`);
  return { homeTeam: t, awayTeam: e.find((e) => e !== t) };
}
function yr({
  homeScore: e,
  awayScore: t,
  regulationAndOvertimeEnded: n = !1,
  mercyEnabled: r = !0,
}) {
  if (![e, t].every((e) => Number.isInteger(e) && e >= 0)) throw Error(`Invalid score.`);
  let i = e - t;
  return r && Math.abs(i) >= mr.mercyGoalDifference
    ? { status: `complete`, reason: `mercy`, winner: i > 0 ? `home` : `away` }
    : n
      ? i === 0
        ? { status: `restart-sudden-death`, carryPenalties: !1, carryInjuries: !1 }
        : { status: `complete`, reason: `time`, winner: i > 0 ? `home` : `away` }
      : { status: `playing` };
}
function br(e) {
  let t = e.map((e) => (typeof e == `string` ? e : e.id));
  if (t.some((e) => typeof e != `string` || !e) || new Set(t).size !== t.length)
    throw Error(`Player IDs must be unique nonempty strings.`);
  return t;
}
function xr(e) {
  let t = br(e),
    n = t.length;
  if (n < 7 || n > 100) throw Error(`This draft qualifier supports 7–100 players.`);
  let r = [];
  if (n % 2 == 0 && n >= 12) {
    let e = n / 2;
    for (let n = 0; n < 6; n++)
      for (let i = 0; i < e; i++) {
        let a = t[i],
          o = t[e + ((i + n) % e)];
        r.push({
          id: `rr-${n + 1}-${i + 1}`,
          round: n + 1,
          homePlayerId: n % 2 ? o : a,
          awayPlayerId: n % 2 ? a : o,
        });
      }
  } else {
    let e = [];
    for (let i = 1; i <= 3; i++)
      for (let a = 0; a < n; a++) {
        let o = t[a],
          s = t[(a + i) % n],
          c = e.findIndex((e) => !e.has(o) && !e.has(s));
        (c < 0 && ((c = e.length), e.push(new Set())),
          e[c].add(o),
          e[c].add(s),
          r.push({ id: `rr-${i}-${a + 1}`, round: c + 1, homePlayerId: o, awayPlayerId: s }));
      }
    r.sort((e, t) => e.round - t.round);
  }
  return r;
}
var Sr = 59.922743,
  Cr = `king94-rb2`,
  wr = (e, t, n) => Number.isSafeInteger(e) && e >= t && e <= n,
  Tr = class {
    constructor(e, t, n, r = 3, i = 12, a = {}) {
      if (![0, 1].includes(t) || !wr(r, 0, 8) || !wr(i, 1, 30))
        throw Error(`Invalid rollback settings.`);
      for (let t of [`save`, `load`, `step`, `checksum`])
        if (typeof e[t] != `function`) throw Error(`Emulator missing ${t}.`);
      if (
        ((this.emu = e),
        (this.slot = t),
        (this.send = n),
        (this.delay = r),
        (this.window = i),
        (this.frame = 0),
        (this.local = new Map()),
        (this.remote = new Map()),
        (this.used = new Map()),
        (this.states = new Map()),
        (this.hashes = new Map()),
        (this.peerHashes = new Map()),
        (this.sentHashes = new Set()),
        (this.remoteThrough = r - 1),
        (this.dirty = 1 / 0),
        (this.rollbacks = 0),
        (this.replayed = 0),
        (this.stalls = 0),
        (this.maxRollback = 0),
        (this.error = null),
        (this.futureLimit = a.futureLimit ?? 120),
        (this.hashInterval = a.hashInterval ?? 120),
        !wr(this.futureLimit, i + r, 240) || !wr(this.hashInterval, 1, 600))
      )
        throw Error(`Invalid history limits.`);
      ((this.onConfirmedInput = a.onConfirmedInput), (this.exportedThrough = -1));
      for (let e = 0; e < r; e++) (this.local.set(e, 0), this.remote.set(e, 0));
    }
    fail(e) {
      throw ((this.error = e), Error(e));
    }
    assertActive() {
      if (this.error) throw Error(this.error);
    }
    get oldest() {
      return Math.max(0, this.frame - this.window - 2);
    }
    receive(e, t) {
      if (
        (this.assertActive(), !wr(e, this.delay, this.frame + this.futureLimit) || !wr(t, 0, 4095))
      )
        throw Error(`Invalid input packet.`);
      if (e < this.oldest) return !1;
      if (this.remote.has(e))
        return (
          this.remote.get(e) !== t && this.fail(`Conflicting input packet. Match stopped.`),
          !1
        );
      for (this.remote.set(e, t); this.remote.has(this.remoteThrough + 1);) this.remoteThrough++;
      return (
        e < this.frame && this.used.get(e) !== t && (this.dirty = Math.min(this.dirty, e)),
        !0
      );
    }
    receiveChecksum(e, t) {
      if (
        !wr(e, 1, this.frame + this.futureLimit) ||
        e % this.hashInterval !== 0 ||
        !wr(t, 0, 4294967295)
      )
        throw Error(`Invalid checksum packet.`);
      return e < Math.max(1, this.frame - this.hashInterval * 16)
        ? !1
        : (this.peerHashes.has(e) &&
            this.peerHashes.get(e) !== t &&
            this.fail(`Conflicting checksum packet.`),
          this.peerHashes.set(e, t),
          this.checkHashes(),
          !0);
    }
    checkHashes() {
      if (this.dirty === 1 / 0)
        for (let [e, t] of this.peerHashes)
          e <= this.confirmed &&
            this.hashes.has(e) &&
            t !== this.hashes.get(e) &&
            this.fail(`Desync detected at confirmed frame ${e}. Match stopped.`);
    }
    reconcile() {
      if ((this.assertActive(), this.dirty !== 1 / 0)) {
        let e = this.dirty,
          t = this.frame;
        (this.states.has(e) || this.fail(`Rollback window exceeded. Match stopped.`),
          this.emu.load(structuredClone(this.states.get(e))),
          this.rollbacks++,
          (this.replayed += t - e),
          (this.maxRollback = Math.max(this.maxRollback, t - e)));
        for (let n = e; n < t; n++) this.simulate(n, !0);
        this.dirty = 1 / 0;
      }
      this.checkHashes();
      for (let [e, t] of this.hashes)
        e <= this.confirmed &&
          !this.sentHashes.has(e) &&
          (this.sentHashes.add(e), this.send({ t: `checksum`, frame: e, hash: t }));
      for (; this.exportedThrough + 1 < this.confirmed;) {
        let e = ++this.exportedThrough,
          t = this.local.get(e),
          n = this.remote.get(e);
        this.onConfirmedInput?.(e, ...(this.slot === 0 ? [t, n] : [n, t]));
      }
      this.prune();
    }
    simulate(e, t = !1) {
      this.states.set(e, structuredClone(this.emu.save()));
      let n = this.remote.get(e) ?? this.used.get(e - 1) ?? 0;
      this.used.set(e, n);
      let r = this.local.get(e);
      r === void 0 && this.fail(`Missing local input.`);
      let i = this.slot === 0 ? [r, n] : [n, r];
      (this.emu.step(i[0], i[1], { replay: t, mute: t, render: !t }),
        (e + 1) % this.hashInterval === 0 && this.hashes.set(e + 1, this.emu.checksum() >>> 0));
    }
    advance(e) {
      if ((this.assertActive(), !wr(e, 0, 4095))) throw Error(`Invalid local input.`);
      this.reconcile();
      let t = this.frame + this.delay;
      return (
        this.local.has(t) || (this.local.set(t, e), this.send({ t: `input`, frame: t, mask: e })),
        this.frame - (this.remoteThrough + 1) >= this.window
          ? (this.stalls++, !1)
          : (this.simulate(this.frame), this.frame++, this.reconcile(), !0)
      );
    }
    prune() {
      let e = this.oldest;
      for (let t of [this.local, this.remote, this.used, this.states])
        for (let n of t.keys()) n < e && t.delete(n);
      let t = Math.max(1, this.frame - this.hashInterval * 16);
      for (let e of [this.hashes, this.peerHashes]) for (let n of e.keys()) n < t && e.delete(n);
      for (let e of this.sentHashes) e < t && this.sentHashes.delete(e);
    }
    get confirmed() {
      return Math.min(this.frame, this.remoteThrough + 1);
    }
    get metrics() {
      return {
        frame: this.frame,
        confirmed: this.confirmed,
        predictedFrames: this.frame - this.confirmed,
        rollbacks: this.rollbacks,
        replayed: this.replayed,
        maxRollback: this.maxRollback,
        stalls: this.stalls,
        snapshots: this.states.size,
        error: this.error,
      };
    }
    log() {
      let e = [];
      for (let t = this.oldest; t < this.confirmed; t++)
        e.push({
          frame: t,
          inputs:
            this.slot === 0
              ? [this.local.get(t), this.remote.get(t)]
              : [this.remote.get(t), this.local.get(t)],
        });
      return e;
    }
  },
  Er = `king94-net-v1`,
  Dr = (e, t, n) => Number.isSafeInteger(e) && e >= t && e <= n,
  Or = (e) => typeof e == `string` && /^[a-f0-9]{64}$/i.test(e),
  kr = (e) => typeof e == `string` && e.length > 0 && e.length <= 128,
  Ar = [`protocol`, `romHash`, `coreHash`, `configHash`, `stateHash`, `delay`, `window`, `matchId`];
function jr(e) {
  return Mr({ t: `hello`, ...e, protocol: Er });
}
function Mr(e) {
  if (typeof e == `string`) {
    if (new TextEncoder().encode(e).length > 16384) throw Error(`Packet too large.`);
    e = JSON.parse(e);
  }
  if (!e || typeof e != `object` || Array.isArray(e)) throw Error(`Malformed packet.`);
  let t = e;
  if (JSON.stringify(t).length > 16384) throw Error(`Packet too large.`);
  let n = !1;
  switch (t.t) {
    case `input`:
      n = Dr(t.frame, 0, 2147483647) && Dr(t.mask, 0, 4095);
      break;
    case `checksum`:
      n = Dr(t.frame, 1, 2147483647) && Dr(t.hash, 0, 4294967295);
      break;
    case `ping`:
    case `pong`:
      n = Dr(t.id, 0, 2147483647) && Number.isFinite(t.sentAt) && t.sentAt >= 0;
      break;
    case `hello`:
      n =
        t.protocol === `king94-net-v1` &&
        [`romHash`, `coreHash`, `configHash`, `stateHash`].every((e) => Or(t[e])) &&
        Dr(t.delay, 0, 8) &&
        Dr(t.window, 1, 30) &&
        kr(t.matchId);
      break;
    case `ready`:
      n = kr(t.matchId) && Or(t.configHash);
      break;
    default:
      n = !1;
  }
  if (!n) throw Error(`Invalid ${String(t.t).slice(0, 20)} packet.`);
  return t;
}
function Nr(e, t) {
  if ((Mr(e), Mr(t), e.t !== `hello` || t.t !== `hello`)) throw Error(`Expected handshake.`);
  for (let n of Ar)
    if (e[n] !== t[n])
      throw Error(
        n === `romHash`
          ? `Your game ROM is not the same file as your opponent's. Both players must load the same ROM.`
          : `Match handshake mismatch: ${n}.`,
      );
  return !0;
}
var Pr = class {
  constructor(e = 120) {
    if (!Number.isInteger(e) || e < 2 || e > 1e3) throw Error(`Invalid metrics window.`);
    ((this.limit = e), (this.rtts = []), (this.frameTimes = []), (this.sent = 0), (this.lost = 0));
  }
  recordRtt(e) {
    if (!Number.isFinite(e) || e < 0 || e > 6e4) throw Error(`Invalid RTT.`);
    (this.rtts.push(e), this.rtts.length > this.limit && this.rtts.shift());
  }
  recordFrame(e) {
    return !Number.isFinite(e) || e < 0
      ? !1
      : (this.frameTimes.push(e),
        this.frameTimes.length > this.limit && this.frameTimes.shift(),
        !0);
  }
  recordProbe(e = !0) {
    (this.sent++, e || this.lost++);
  }
  summary() {
    let e = (e, t) => (e.length ? [...e].sort((e, t) => e - t)[Math.ceil(e.length * t) - 1] : null),
      t = e(this.rtts, 0.5),
      n = e(this.rtts, 0.95),
      r =
        this.rtts.length > 1
          ? this.rtts.slice(1).reduce((e, t, n) => e + Math.abs(t - this.rtts[n]), 0) /
            (this.rtts.length - 1)
          : 0,
      i = n === null ? 3 : Math.max(3, Math.min(8, Math.ceil((n / 2 + r) / (1e3 / Sr))));
    return {
      samples: this.rtts.length,
      rttMs: t,
      p95RttMs: n,
      jitterMs: r,
      probeLoss: this.sent ? this.lost / this.sent : null,
      frameP95Ms: e(this.frameTimes, 0.95),
      suggestedDelay: i,
      status:
        n === null
          ? `untested`
          : n > 220 || r > 35
            ? `needs-review`
            : n > 140
              ? `test-match-required`
              : `ready-for-test`,
    };
  }
};
function Fr({
  reason: e,
  phase: t,
  platform: n,
  hidden: r,
  browser: i,
  pc: a,
  network: o,
  rollback: s,
}) {
  return {
    version: 1,
    capturedAt: new Date().toISOString(),
    reason: e,
    phase: t,
    platform: n,
    hidden: !!r,
    browser: String(i || `unknown`).slice(0, 250),
    transport: {
      connection: a?.connectionState || `unknown`,
      ice: a?.iceConnectionState || `unknown`,
      signaling: a?.signalingState || `unknown`,
    },
    network: Object.fromEntries(
      [
        `samples`,
        `rttMs`,
        `p95RttMs`,
        `jitterMs`,
        `probeLoss`,
        `frameP95Ms`,
        `suggestedDelay`,
        `status`,
      ]
        .filter((e) => o?.[e] !== void 0)
        .map((e) => [e, o[e]]),
    ),
    game: s
      ? {
          frame: s.frame,
          rollbacks: s.rollbacks,
          stalls: s.stalls,
          predictedFrames: s.predictedFrames,
        }
      : null,
  };
}
async function Ir(e, t) {
  try {
    let n = await t?.getStats();
    if (!n) return;
    let r;
    for (let e of n.values())
      e.type === `transport` && e.selectedCandidatePairId && (r = n.get(e.selectedCandidatePairId));
    if (!r) {
      for (let e of n.values())
        if (e.type === `candidate-pair` && e.state === `succeeded` && (e.selected || e.nominated)) {
          r = e;
          break;
        }
    }
    if (!r) return;
    let i = n.get(r.localCandidateId),
      a = n.get(r.remoteCandidateId),
      o = (e) => ([`host`, `srflx`, `prflx`, `relay`].includes(e) ? e : `unknown`);
    ((e.transport.localCandidate = o(i?.candidateType)),
      (e.transport.remoteCandidate = o(a?.candidateType)),
      (e.transport.protocol = [`udp`, `tcp`].includes(i?.protocol) ? i.protocol : `unknown`));
  } catch {}
}
var Lr = class {
    constructor() {
      ((this.state = { frame: 0, hash: 2166136261 }), (this.replaySteps = 0));
    }
    save() {
      return { ...this.state };
    }
    load(e) {
      this.state = { ...e };
    }
    step(e, t, n = {}) {
      if (
        ((this.state.hash =
          Math.imul(this.state.hash ^ (e + 8191 * t + this.state.frame), 16777619) >>> 0),
        this.state.frame++,
        n.replay)
      ) {
        if (!n.mute || n.render) throw Error(`Replay must suppress presentation.`);
        this.replaySteps++;
      }
    }
    checksum() {
      return this.state.hash;
    }
  },
  Rr = (e, t) => ((Math.imul(e + t * 911, 2654435761) >>> 19) ^ (e >>> 2)) & 4095;
function zr({
  rttMs: e = 100,
  jitterMs: t = 15,
  loss: n = 0.02,
  duplicate: r = 0.03,
  frames: i = 1800,
  seed: a = 94,
  outage: o = !1,
} = {}) {
  let s = a >>> 0,
    c = () => ((s ^= s << 13), (s ^= s >>> 17), (s ^= s << 5), (s >>> 0) / 4294967296),
    l = 0,
    u = [],
    d = 0,
    f = 0,
    p = [new Lr(), new Lr()],
    m = (i) => (a) => {
      let s = Math.max(0, e / 2 + (c() * 2 - 1) * t);
      (c() < n && ((s += e * (1 + c() * 2)), d++), o && l >= 3e3 && l < 3450 && (s += 3450 - l));
      let f = 1 - i;
      (u.push({ at: l + s, target: f, packet: { ...a } }),
        c() < r && u.push({ at: l + s + c() * 30, target: f, packet: { ...a } }));
    },
    h = p.map((e, t) => new Tr(e, t, m(t), 3, 12, { hashInterval: 60 })),
    g = () => {
      for (u.sort((e, t) => e.at - t.at); u.length && u[0].at <= l;) {
        let { target: e, packet: t } = u.shift();
        t.t === `input` ? h[e].receive(t.frame, t.mask) : h[e].receiveChecksum(t.frame, t.hash);
      }
    },
    _ = 0;
  for (; _ < i * 5; _++) {
    g();
    for (let [e, t] of h.entries())
      (t.frame < i ? t.advance(Rr(t.frame + t.delay, e)) : t.reconcile(),
        (f = Math.max(f, t.states.size, t.local.size, t.remote.size, t.used.size)));
    if (h.every((e) => e.frame === i && e.confirmed === i)) break;
    l += 1e3 / Sr;
  }
  for (let e = 0; e < 200 && u.length; e++) ((l += 1e3 / Sr), g(), h.forEach((e) => e.reconcile()));
  let v = new Lr();
  for (let e = 0; e < i; e++) v.step(e < 3 ? 0 : Rr(e, 0), e < 3 ? 0 : Rr(e, 1));
  return {
    kind: `synthetic`,
    rttMs: e,
    jitterMs: t,
    loss: n,
    frames: i,
    converged:
      h.every((e) => e.frame === i && e.confirmed === i) &&
      p.every((e) => e.checksum() === v.checksum()),
    ticks: _,
    retransmissions: d,
    maxEntries: f,
    rollbacks: h.map((e) => e.rollbacks),
    replayed: h.map((e) => e.replayed),
    stalls: h.map((e) => e.stalls),
    maxRollback: h.map((e) => e.maxRollback),
    hashes: p.map((e) => e.checksum()),
    expectedHash: v.checksum(),
  };
}
function Br() {
  return [40, 100, 180, 240].map((e) => zr({ rttMs: e, jitterMs: e < 100 ? 8 : 22 }));
}
function Vr() {
  return { status: `playing`, frame: -1, freeze: !1, certified: !1 };
}
function Hr(e, t) {
  if (e.freeze || t.confirmed !== !0) return e;
  if (!Number.isSafeInteger(t.frame) || t.frame < 0)
    throw Error(`Confirmed frame must be a nonnegative integer.`);
  if (t.frame < e.frame) return e;
  let n = yr({
    homeScore: t.homeScore,
    awayScore: t.awayScore,
    mercyEnabled: t.mercyEnabled ?? !0,
    regulationAndOvertimeEnded: t.regulationAndOvertimeEnded === !0,
  });
  return {
    ...n,
    frame: t.frame,
    homeScore: t.homeScore,
    awayScore: t.awayScore,
    freeze: n.status !== `playing`,
    certified: !1,
    ...(n.status === `restart-sudden-death` ? { restartPending: !0 } : {}),
  };
}
var Ur = [
    `mercy`,
    `ended`,
    `left`,
    `remote-left`,
    `connection-closed`,
    `hidden`,
    `hidden-timeout`,
    `error`,
    `page-closed`,
  ],
  Wr = (e, t, n) => Number.isSafeInteger(e) && e >= t && e <= n;
function Gr(e) {
  return e.map(([e, t, n]) => `${e.toString(16)}.${t.toString(16)}.${n.toString(36)}`).join(` `);
}
var Kr = class {
    constructor(e) {
      ((this.meta = e),
        (this.runs = []),
        (this.frames = 0),
        (this.reason = null),
        (this.score = null),
        (this.finished = !1),
        (this.inputChars = 0));
    }
    push(e, t, n) {
      if (this.finished) return;
      if (e !== this.frames) throw Error(`Recorder expected frame ${this.frames}, got ${e}.`);
      if (!Wr(t, 0, 4095) || !Wr(n, 0, 4095)) throw Error(`Recorder got an invalid input mask.`);
      let r = this.runs[this.runs.length - 1],
        i = r && r[0] === t && r[1] === n,
        a = i
          ? (r[2] + 1).toString(36).length - r[2].toString(36).length
          : t.toString(16).length + n.toString(16).length + 3 + +!!r;
      if (this.frames >= 4e5 || this.inputChars + a > 45e4)
        throw (
          (this.finished = !0),
          (this.runs = []),
          (this.score = null),
          Error(`Recording reached its size limit; gameplay can continue.`)
        );
      ((this.inputChars += a), i ? r[2]++ : this.runs.push([t, n, 1]), this.frames++);
    }
    setScore(e, t, n, r) {
      Wr(e, 0, 1e6) &&
        Wr(t, 0, 99) &&
        Wr(n, 0, 99) &&
        (this.score = {
          frame: e,
          homeScore: t,
          awayScore: n,
          status: String(r || `playing`).slice(0, 40),
        });
    }
    setReason(e) {
      !this.reason && Ur.includes(e) && (this.reason = e);
    }
    finish(e, t = null, n = new Date()) {
      if (
        this.finished ||
        ((this.finished = !0), this.setReason(e), this.setReason(`ended`), this.frames < 120)
      )
        return null;
      let r = this.meta;
      return {
        v: 1,
        id: `${r.matchId}-${r.side}`,
        matchId: r.matchId,
        side: r.side,
        mode: r.mode,
        started: r.started,
        ended: n.toISOString(),
        reason: this.reason,
        frames: this.frames,
        config: r.config,
        romSha256: r.romSha256,
        coreHash: r.coreHash,
        rollbackVersion: r.rollbackVersion,
        startStateHash: r.startStateHash,
        inputs: Gr(this.runs),
        result: this.score,
        net: t,
      };
    }
  },
  qr = `king94-match-queue`,
  Jr = 12,
  Yr = 3e6,
  Xr = 6e4;
function Zr(e) {
  try {
    let t = e.getItem(qr) || `[]`;
    if (t.length > Yr) return [];
    let n = JSON.parse(t);
    return Array.isArray(n)
      ? n
          .slice(-12)
          .filter(
            (e) =>
              e &&
              typeof e == `object` &&
              !Array.isArray(e) &&
              typeof e.id == `string` &&
              e.id.length <= 200,
          )
      : [];
  } catch {
    return null;
  }
}
function Qr(e, t) {
  try {
    return (e.setItem(qr, JSON.stringify(t)), !0);
  } catch {
    return !1;
  }
}
function $r({ endpoint: e, fetchImpl: t = globalThis.fetch?.bind(globalThis), storage: n } = {}) {
  if (n === void 0)
    try {
      n = globalThis.localStorage;
    } catch {
      n = null;
    }
  let r = null,
    i = Zr(n) || [],
    a = !!n,
    o = () => {
      if (a) {
        let e = Zr(n);
        e ? (i = e) : (a = !1);
      }
      return i;
    },
    s = (e) => {
      ((i = e), Qr(n, e) || (a = !1));
    };
  async function c(n, r = !1) {
    let i = JSON.stringify(n),
      a = await t(e, {
        method: `POST`,
        headers: { "Content-Type": `application/json` },
        body: i,
        credentials: `same-origin`,
        redirect: `manual`,
        cache: `no-store`,
        keepalive: r && i.length < Xr,
      });
    return { ok: a.ok, rejected: [400, 413, 422].includes(a.status) };
  }
  async function l() {
    return (
      r ||
      ((r = (async () => {
        let e = 0;
        for (let t of o()) {
          let n;
          try {
            n = await c(t);
          } catch {
            break;
          }
          if (!n.ok && !n.rejected) break;
          (s(o().filter((e) => e.id !== t.id)), n.ok && e++);
        }
        return e;
      })().finally(() => {
        r = null;
      })),
      r)
    );
  }
  function u(e, { unloading: t = !1 } = {}) {
    if (!e) return Promise.resolve(!1);
    let n = o().filter((t) => t.id !== e.id);
    for (n.push(e); n.length > Jr || JSON.stringify(n).length > Yr;) n.shift();
    return (
      s(n),
      t
        ? (c(e, !0)
            .then((t) => {
              (t.ok || t.rejected) && s(o().filter((t) => t.id !== e.id));
            })
            .catch(() => {}),
          Promise.resolve(!0))
        : l()
            .then(() => !0)
            .catch(() => !1)
    );
  }
  return { submit: u, flush: l, pending: () => o().length };
}
var ei = Object.freeze(
    [
      [`PIT`, `BOS`],
      [`DET`, `CHI`],
      [`NYR`, `CGY`],
      [`LA`, `BUF`],
      [`VAN`, `MTL`],
      [`WPG`, `TOR`],
      [`QUE`, `WSH`],
      [`PHI`, `STL`],
      [`NJ`, `DAL`],
      [`EDM`, `HFD`],
      [`NYI`, `SJ`],
      [`OTT`, `TB`],
      [`FLA`, `ANA`],
    ].map((e, t) => Object.freeze({ id: `snes-pair-${t + 1}`, pair: Object.freeze(e) })),
  ),
  ti = Object.freeze({
    genesis: {
      name: `Sega Genesis`,
      tag: `GENESIS`,
      emu: `emu.js`,
      boot: `boot.js`,
      media: `nhl94.bin`,
      bytes: 1048576,
      files: [`core/gpgx.wasm`, `core/gpgx.mjs`, `emu.js`, `boot.js`],
      mask: 507,
      pairingNote: `Choose any two teams.`,
      note: `Genesis controls. Manual goalie control uses the original game controls.`,
    },
    snes: {
      name: `Super Nintendo`,
      tag: `SNES`,
      emu: `snes.js`,
      boot: `snes-boot.js`,
      media: `nhl94.sfc`,
      bytes: 1048576,
      files: [`core/snes.wasm`, `core/snes.mjs`, `snes.js`, `snes-boot.js`],
      mask: 3839,
      pairingNote: `Choose any two teams.`,
      note: `SNES has its own controls. X selects the manual goalie; Y checks/holds and can get a knocked-down skater back up. The Y recovery trick is allowed. Pass shots are allowed. Native SNES gameplay differences remain.`,
    },
    nhl95: {
      game: `nhl95`,
      gameName: `NHL ’95`,
      name: `Sega Genesis`,
      tag: `NHL ’95`,
      emu: `nhl95.js`,
      boot: `nhl95-boot.js`,
      media: `nhl95.bin`,
      bytes: 2097152,
      files: [
        `core/gpgx.wasm`,
        `core/gpgx.mjs`,
        `emu.js`,
        `ramvars.js`,
        `boot.js`,
        `nhl95.js`,
        `nhl95-boot.js`,
      ],
      mask: 507,
      pairingNote: `Each player chooses their own team. Regular teams only; choose different teams.`,
      note: `NHL ’95 on Genesis. Each player chooses their own team. The locked match conditions are an online adaptation for this game; its original gameplay differences remain.`,
    },
    segacd: {
      name: `Sega CD`,
      tag: `SEGA CD`,
      emu: `segacd.js`,
      boot: `segacd-boot.js`,
      media: `nhl94.chd`,
      bios: `bios_CD_U.bin`,
      bytes: 227439378,
      files: [
        `core/segacd.wasm`,
        `core/segacd.mjs`,
        `emu.js`,
        `ramvars.js`,
        `boot.js`,
        `segacd.js`,
        `segacd-boot.js`,
      ],
      mask: 507,
      mediaHash: `642215da118e2dfe4432dee82f299627f2945fb756dce134db00735d0520916d`,
      pairingNote: `Genesis pairings reused for Sega CD practice; these are an online adaptation.`,
      note: `Sega CD uses Sega controls. The first disc download is 227 MB; saved chunks make return visits faster and resume interrupted downloads. Sega CD is an online adaptation.`,
    },
  });
function D(e = `genesis`) {
  if (typeof e != `string` || !Object.hasOwn(ti, e)) throw Error(`Unsupported game platform.`);
  return ti[e];
}
function ni(e = `genesis`) {
  return (
    D(e),
    e === `genesis` ? mr : Object.freeze({ ...mr, id: `king94-${e}-2026-10-v1`, console: e })
  );
}
function ri(e = `genesis`) {
  return (D(e), e === `nhl95` ? [] : e === `snes` ? ei : gr);
}
function ii(e, t = `genesis`) {
  return ri(t).find((t) => t.pair.every((t) => e.includes(t))) || null;
}
var ai = Object.freeze({
    ANA: `Anaheim`,
    BOS: `Boston`,
    BUF: `Buffalo`,
    CGY: `Calgary`,
    CHI: `Chicago`,
    DAL: `Dallas`,
    DET: `Detroit`,
    EDM: `Edmonton`,
    FLA: `Florida`,
    HFD: `Hartford`,
    LA: `Los Angeles`,
    MTL: `Montreal`,
    NJ: `New Jersey`,
    NYI: `NY Islanders`,
    NYR: `NY Rangers`,
    OTT: `Ottawa`,
    PHI: `Philadelphia`,
    PIT: `Pittsburgh`,
    QUE: `Quebec`,
    SJ: `San Jose`,
    STL: `St. Louis`,
    TB: `Tampa Bay`,
    TOR: `Toronto`,
    VAN: `Vancouver`,
    WSH: `Washington`,
    WPG: `Winnipeg`,
  }),
  oi = `23456789ABCDEFGHJKLMNPQRSTUVWXYZ`;
function si(e = crypto) {
  let t = e.getRandomValues(new Uint8Array(3));
  return Array.from(t, (e) => oi[e & 31]).join(``);
}
function ci(e, t, n = 3, r = 0, i = `genesis`, a = {}) {
  D(i);
  let o = _r({ pair: e });
  if (!o.valid) throw Error(o.reason);
  if (!Number.isSafeInteger(n) || n < 3 || n > 8) throw Error(`Invalid network delay.`);
  if (![0, 1].includes(r)) throw Error(`Invalid host player side.`);
  let s = a.matchType ?? `exhibition`,
    c = a.mercyEnabled ?? s === `tournament`;
  if (![`exhibition`, `tournament`].includes(s) || typeof c != `boolean`)
    throw Error(`Invalid match rules.`);
  let l = vr(e, t);
  return {
    version: 1,
    platform: i,
    matchType: s,
    mercyEnabled: c,
    rules: { ...ni(i) },
    pair: i === `nhl95` ? [l.homeTeam, l.awayTeam] : [...e],
    ...l,
    hostSlot: r,
    delay: n,
    window: 12,
  };
}
function O(e) {
  return Array.isArray(e)
    ? `[${e.map(O).join(`,`)}]`
    : e && typeof e == `object`
      ? `{${Object.keys(e)
          .sort()
          .map((t) => `${JSON.stringify(t)}:${O(e[t])}`)
          .join(`,`)}}`
      : JSON.stringify(e);
}
async function li(e) {
  let t = e instanceof Uint8Array ? e : new TextEncoder().encode(O(e)),
    n = await crypto.subtle.digest(`SHA-256`, t);
  return Array.from(new Uint8Array(n), (e) => e.toString(16).padStart(2, `0`)).join(``);
}
var ui = (e) => typeof e == `string` && /^[a-f0-9]{64}$/.test(e),
  di = (e) => typeof e == `string` && /^[a-zA-Z0-9-]{1,100}$/.test(e);
function fi(e) {
  if (!e || typeof e != `object` || Array.isArray(e) || JSON.stringify(e).length > 16384)
    throw Error(`Invalid lobby message.`);
  switch (e.t) {
    case `arena-config`:
      if (
        (e.matchType !== void 0 && ![`exhibition`, `tournament`].includes(e.matchType)) ||
        (e.mercyEnabled !== void 0 && typeof e.mercyEnabled != `boolean`)
      )
        throw Error(`Invalid match rules.`);
      if (
        (D(e.platform === void 0 ? `genesis` : e.platform),
        !_r({ pair: e.pair }).valid ||
          !e.pair.includes(e.homeChoice) ||
          ![0, 1].includes(e.hostSlot))
      )
        throw Error(`Invalid team selection.`);
      break;
    case `arena-team`:
      if (e.platform !== `nhl95` || !Object.hasOwn(ai, e.team))
        throw Error(`Invalid independent team selection.`);
      break;
    case `arena-team-rejected`:
      if (e.platform !== `nhl95` || e.reason !== `duplicate`)
        throw Error(`Invalid team selection response.`);
      break;
    case `arena-resume`:
      if (![`genesis`, `snes`, `nhl95`].includes(e.platform) || (e.hash !== null && !ui(e.hash)))
        throw Error(`Invalid saved-game selection.`);
      break;
    case `arena-lock`:
      if (!ui(e.configHash) || typeof e.locked != `boolean`) throw Error(`Invalid lock-in.`);
      break;
    case `arena-delay`:
      if (!Number.isSafeInteger(e.delay) || e.delay < 3 || e.delay > 8)
        throw Error(`Invalid network delay.`);
      break;
    case `arena-prepare`:
      if (!di(e.matchId) || !ui(e.configHash)) throw Error(`Invalid match preparation.`);
      break;
    case `arena-start`:
      if (!di(e.matchId)) throw Error(`Invalid match start.`);
      break;
    case `arena-end-request`:
      if (!di(e.matchId)) throw Error(`Invalid end request.`);
      break;
    case `arena-end`:
      if (e.reason !== void 0 && ![`ended`, `mercy`].includes(e.reason))
        throw Error(`Invalid match end reason.`);
      if (e.reason === `mercy` && Math.abs(e.homeScore - e.awayScore) < 6)
        throw Error(`Invalid mercy score.`);
      if (
        !di(e.matchId) ||
        !Number.isSafeInteger(e.frame) ||
        e.frame < 0 ||
        e.frame > 2147483647 ||
        !Number.isSafeInteger(e.homeScore) ||
        e.homeScore < 0 ||
        e.homeScore > 99 ||
        !Number.isSafeInteger(e.awayScore) ||
        e.awayScore < 0 ||
        e.awayScore > 99
      )
        throw Error(`Invalid match end.`);
      break;
    case `arena-reset`:
      if (!di(e.matchId)) throw Error(`Invalid match reset.`);
      break;
    case `arena-state-offer`:
      if (
        !di(e.id) ||
        !wr(e.size, 1, 8388608) ||
        !wr(e.rawSize, 1, 8388608) ||
        ![`raw`, `deflate`].includes(e.enc) ||
        !wr(e.chunks, 1, 1000) ||
        !ui(e.sha256) ||
        !wr(e.frame, 0, 2147483647)
      )
        throw Error(`Invalid state offer.`);
      break;
    case `arena-state-chunk`:
      if (
        !di(e.id) ||
        !wr(e.i, 0, 999) ||
        typeof e.d != `string` ||
        e.d.length > 12400 ||
        !/^[A-Za-z0-9+/=]*$/.test(e.d)
      )
        throw Error(`Invalid state chunk.`);
      break;
    case `arena-state-reject`:
    case `arena-state-abort`:
      if (!di(e.id) || typeof e.reason != `string` || e.reason.length > 240)
        throw Error(`Invalid state reply.`);
      break;
    case `arena-state-accept`:
    case `arena-state-commit`:
    case `arena-state-ready`:
    case `arena-state-go`:
      if (!di(e.id)) throw Error(`Invalid state message.`);
      break;
    case `arena-rom`:
      if (
        typeof e.crc != `string` ||
        !/^[0-9a-f]{8}$/.test(e.crc) ||
        !wr(e.size, 1, 8388608) ||
        typeof e.platform != `string`
      )
        throw Error(`Invalid ROM info.`);
      break;
    case `arena-chat`:
      if (typeof e.text != `string` || e.text.length < 1 || e.text.length > 200)
        throw Error(`Invalid chat message.`);
      break;
    case `arena-leave`:
      break;
    default:
      throw Error(`Unknown lobby message.`);
  }
  return e;
}
function pi(e) {
  let t = /^king94-([23456789A-HJ-NP-Z]{3})$/.exec(e);
  if (!t) throw Error(`Invalid room ID.`);
  return t[1];
}
function mi(e) {
  let t = e.trim();
  if (t.includes(`://`)) {
    let e = new URL(t);
    t = /^\/r\/([23456789A-HJ-NP-Z]{3})$/i.exec(e.pathname)?.[1] || e.searchParams.get(`j`) || ``;
  }
  if (((t = t.toUpperCase().replace(/^KING94-/, ``)), !/^[23456789A-HJ-NP-Z]{3}$/.test(t)))
    throw Error(`Enter the three-character room code.`);
  return `king94-${t}`;
}
var hi = `modulepreload`,
  gi = function (e) {
    return `${globalThis.__BASE}` + e;
  },
  _i = {},
  vi = function (e) {
    return e.pathname.endsWith(`.css`);
  },
  yi = function (e, t, n) {
    let r = Promise.resolve();
    if (t && t.length > 0) {
      let e,
        i = document.querySelector(`meta[property=csp-nonce]`),
        a = i?.nonce || i?.getAttribute(`nonce`);
      function o(e) {
        return Promise.all(
          e.map((e) =>
            Promise.resolve(e).then(
              (e) => ({ status: `fulfilled`, value: e }),
              (e) => ({ status: `rejected`, reason: e }),
            ),
          ),
        );
      }
      function s(e) {
        return import.meta.resolve ? new URL(import.meta.resolve(e)) : new URL(e, import.meta.url);
      }
      r = o(
        t
          .map((t) => {
            t = gi(t, n);
            let r = s(t);
            if (r.href in _i) return;
            _i[r.href] = !0;
            let i = vi(r);
            if (e === void 0) {
              e = { all: new Set(), styles: new Set() };
              let t = document.getElementsByTagName(`link`);
              for (let n = t.length - 1; n >= 0; n--) {
                let r = t[n];
                (e.all.add(r.href), r.rel === `stylesheet` && e.styles.add(r.href));
              }
            }
            if ((i ? e.styles : e.all).has(r.href)) return;
            let o = document.createElement(`link`);
            if (
              ((o.rel = i ? `stylesheet` : hi),
              i || (o.as = `script`),
              (o.crossOrigin = ``),
              (o.href = r.href),
              a && o.setAttribute(`nonce`, a),
              document.head.appendChild(o),
              i)
            )
              return new Promise((e, t) => {
                (o.addEventListener(`load`, e),
                  o.addEventListener(`error`, () => t(Error(`Unable to preload CSS for ${r}`))));
              });
          })
          .filter((e) => e !== void 0),
      );
    }
    function i(e) {
      let t = new Event(`vite:preloadError`, { cancelable: !0 });
      if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented)) throw e;
    }
    return r.then((t) => {
      for (let e of t || []) e.status === `rejected` && i(e.reason);
      return e().catch(i);
    });
  },
  k = (e) =>
    document.getElementById(e) ||
    (__stubs[e] ??= Object.assign(document.createElement(`div`), { hidden: !0 })),
  A = new pr(),
  bi = new cr(
    () => [`lineup`, `playing`].includes(j) && !W,
    () => z.platform,
  ),
  j = `lobby`,
  M = `local`,
  N = !0,
  xi = 0,
  P = null,
  Si = null,
  Ci = null,
  wi = null,
  F = null,
  I = null,
  L = null,
  R = null,
  Ti = new Pr(),
  Ei = null,
  Di = null,
  Oi = 0,
  ki = 0,
  z = ci([`MTL`, `BOS`], `MTL`),
  Ai = !0,
  B = !1,
  V = !1,
  ji = null,
  Mi = null,
  Ni = !1,
  Pi = !1,
  H = null,
  U = 0,
  Fi = 0,
  Ii = null,
  Li = 0,
  W = !1,
  Ri = Promise.resolve(),
  zi = new Map(),
  Bi = 0,
  Vi = null,
  Hi = null,
  Ui = null,
  Wi = null,
  Gi = !1,
  Ki = Vr(),
  qi = -1,
  Ji = -1,
  Yi = 0,
  Xi = null,
  G = !1,
  Zi = Promise.resolve(),
  K = !1,
  Qi = 0,
  $i = `two`,
  ea = 0,
  ta = null,
  na = null,
  ra = null,
  ia = !1,
  aa = ``,
  oa = null,
  sa = 0,
  ca = document.title,
  la = { submit() {}, flush: async () => {} },
  ua = {
    requested: !1,
    flush: async () => {},
    submit: async () => {},
    load: async () => null,
    waitForRoom: async () => null,
    matchId: () => null,
    roomReady: async () => {},
  },
  da = null,
  fa = 45e3,
  pa = 3e4,
  ma = null,
  ha = null,
  ga = null,
  _a = null,
  va = null,
  ya = {},
  ba = null,
  xa = new WeakMap(),
  Sa = new Map(),
  Ca = !1,
  wa = be(),
  Ta = null,
  q = null,
  Ea = null,
  Da = null,
  J = !1,
  Oa = 0;
function ka() {
  return q &&
    q.platform === z.platform &&
    q.homeTeam === z.homeTeam &&
    q.awayTeam === z.awayTeam &&
    q.players === $a()
    ? q
    : null;
}
function Aa() {
  return (ka()?.hash || null) === (Da?.platform === z.platform ? Da.hash : null);
}
function ja() {
  R?.open &&
    [`genesis`, `snes`, `nhl95`].includes(z.platform) &&
    X({ t: `arena-resume`, platform: z.platform, hash: ka()?.hash || null });
}
function Ma() {
  let e = j === `lobby` && !K && !B && !V && !G && !J;
  ((k(`load-state`).disabled = k(`load-state-file`).disabled = !e),
    (k(`recover-last-state`).disabled = !e || !Sa.has(z.platform)),
    (k(`clear-loaded-state`).disabled = !e || !q));
  let t = ka(),
    n = Da?.platform === z.platform ? Da.hash : null;
  k(`loaded-state-status`).textContent = J
    ? `Checking your saved game…`
    : t
      ? `Saved game ready · ${z.homeTeam} ${t.info.p1_score} – ${t.info.p2_score} ${z.awayTeam}. ${M === `online` ? (Aa() ? `Both players loaded the same state. Ready to resume.` : `Waiting for your opponent to load the same state.`) : `Start to resume this saved game.`}`
      : n
        ? `Your opponent loaded a saved game. Load the same file before choosing Ready.`
        : q
          ? `Choose the saved game’s original teams and player mode, or clear it to start fresh.`
          : `No saved game loaded. New matches start normally.`;
}
async function Na(e) {
  if (j !== `lobby` || K || B || V || G || J)
    throw Error(`Return to team selection and load the state before either player chooses Ready.`);
  if (!P || !Hi?.verifyMatchSettings) throw Error(`Wait for the selected game to finish loading.`);
  let t = ++Oa,
    n = U,
    r = O(z),
    i = $a(),
    a = Ui,
    o = Si;
  ((J = !0), Z());
  let s;
  try {
    let { native: c, metadata: l } = e;
    if (
      l &&
      (l.platform !== z.platform ||
        l.coreIdentity !== a ||
        l.config?.homeTeam !== z.homeTeam ||
        l.config?.awayTeam !== z.awayTeam ||
        l.players !== i)
    )
      throw Error(
        `Select this save’s original game, home/away teams and player mode. It must use this site’s current core and ROM version.`,
      );
    if (
      ((s = await (Vi.Genesis || Vi.SNES).create(P, {
        locateFile: (e) => (e.endsWith(`.wasm`) ? `${globalThis.__BASE}game/core/` + e : e),
      })),
      t !== Oa || n !== U || j !== `lobby` || r !== O(z) || i !== $a())
    )
      throw Error(`Setup changed while loading. Choose the state again.`);
    let u = ge(s, c, () => Hi.verifyMatchSettings(s, ai[z.homeTeam], ai[z.awayTeam], i)),
      d = await li(c);
    if (t !== Oa || n !== U || j !== `lobby` || r !== O(z) || i !== $a())
      throw Error(`Setup changed while loading. Choose the state again.`);
    ((q = {
      bytes: c.slice(),
      hash: d,
      platform: z.platform,
      homeTeam: z.homeTeam,
      awayTeam: z.awayTeam,
      players: i,
      info: u,
    }),
      (B = V = !1),
      ja(),
      Y(`Saved game checked. Choose Start to resume; online players must load the same save.`));
  } finally {
    (s?.dispose(), t === Oa && ((J = !1), Z()));
  }
}
async function Pa() {
  let e = k(`load-state-file`).files?.[0];
  if (e)
    try {
      if (e.size > 5242880) throw Error(`State files must be no larger than 5 MB.`);
      let t = O(z),
        n = U,
        r = new Uint8Array(await e.arrayBuffer());
      if (n !== U || t !== O(z))
        throw Error(`Setup changed while reading. Choose the state again.`);
      await Na(he(r));
    } catch (e) {
      Y(`Could not load state: ` + e.message + ` Check the original teams and player mode.`);
    } finally {
      k(`load-state-file`).value = ``;
    }
}
function Fa(e) {
  return ae(F, I, {
    platform: z.platform,
    config: z,
    matchId: H,
    mode: M,
    players: $a(),
    phase: j,
    reason: e,
    romSha256: Si,
    coreVersion: Vi?.CORE_VERSION,
    coreIdentity: Ui,
    ...(Ea ? { resumedFromStateHash: Ea.hash } : {}),
  });
}
function Ia(e) {
  if (!F || ![`lineup`, `playing`, `finished`].includes(j)) return;
  let t = Sa.get(z.platform);
  if (t?.metadata.matchId !== H || t.metadata.reason === `player-request`)
    try {
      Sa.set(z.platform, Fa(e));
    } catch {}
}
function La() {
  if (j === `preparing`) throw Error(`Wait for game preparation to finish before exporting stats.`);
  let e = Sa.get(z.platform),
    t = F && e?.metadata.matchId !== H ? null : e,
    n =
      F && [`lineup`, `playing`].includes(j)
        ? Fa(`player-request`)
        : t || (F && j === `finished` ? Fa(ra || `ended`) : null);
  if (!n) throw Error(`Start a match before saving stats.`);
  return (Sa.set(n.metadata.platform, n), n);
}
async function Ra() {
  if (!Ca) {
    ((Ca = !0), Z());
    try {
      (fe(await de(La())),
        Y(
          `Stats ZIP downloaded. Extract it for the save state, game memory and match details. Save final stats at Three Stars or the final summary.`,
        ));
    } catch (e) {
      Y(`Could not save stats: ` + e.message);
    } finally {
      ((Ca = !1), Z());
    }
  }
}
function za() {
  let e = ve(z.platform);
  k(`nhl94online-tools`).hidden = !e;
  for (let t of [`export-nhl94online`, `export-nhl94online-in-game`]) {
    let n = k(t);
    ((n.hidden = !e), (n.disabled = k(`save-stats`).disabled || !e));
  }
  e &&
    (Ta !== z.platform &&
      ((Ta = z.platform),
      (k(`nhl94online-coach-url`).value = wa.get(z.platform)),
      (k(`nhl94online-link-status`).textContent = ``)),
    (k(`nhl94online-coach-label`).textContent =
      `Your ${z.platform === `snes` ? `SNES` : `Genesis`} coach-page link (optional)`),
    (k(`nhl94online-open`).href = wa.get(z.platform) || `https://www.nhl94online.com/`),
    (k(`nhl94online-compatibility`).textContent =
      z.platform === `snes`
        ? `SNES format check needed: our Snes9x2010 states differ from regular Snes9x. NHL94Online acceptance has not been verified.`
        : `Genesis format check needed: NHL94Online acceptance of our exported states has not been verified.`));
}
function Ba() {
  if (!Ca) {
    try {
      if (!ve(z.platform)) throw Error(`NHL94Online export is for NHL ’94 Genesis and SNES.`);
      let e = ue(La());
      (fe(e),
        (k(`nhl94online-tools`).open = !0),
        k(`nhl94online-open`).click(),
        Y(
          `Download requested: ${e.filename}. On NHL94Online, choose the matching scheduled game, select this file, enter your password there and upload once. If no new tab opened, use Open coach page below.`,
        ));
    } catch (e) {
      Y(`Could not export for NHL94Online: ` + e.message);
    }
    Z();
  }
}
function Va(e) {
  if (M !== `online`) return va;
  let t = R?.peerConnection,
    n = Fr({
      reason: e,
      phase: j,
      platform: z.platform,
      hidden: document.hidden,
      browser: navigator.userAgent,
      pc: t,
      network: Ti.summary(),
      rollback: I?.metrics,
    });
  (Object.assign(n.transport, ya), (va = n));
  let r = Ir(n, t).then(() => {
    if (t && R?.peerConnection === t && n.transport.localCandidate) {
      let { localCandidate: e, remoteCandidate: t, protocol: r } = n.transport;
      ((ya = { localCandidate: e, remoteCandidate: t, protocol: r }),
        (k(`stat-transport`).textContent =
          `WebRTC · ${e === `relay` || t === `relay` ? `relay` : `direct`} · ${r}`));
    }
  });
  return (xa.set(n, r), (k(`copy-connection-report`).hidden = !1), n);
}
var __chatTimes = [],
  __chatLastSend = 0;
function __chatAdd(who, text, mine) {
  let log = k(`chat-log`),
    row = document.createElement(`div`),
    name = document.createElement(`strong`),
    body = document.createElement(`span`);
  ((row.className = `chat-msg` + (mine ? ` mine` : ``)),
    (name.textContent = who + `: `),
    (body.textContent = text),
    row.append(name, body),
    log.append(row));
  while (log.children.length > 100) log.firstChild.remove();
  log.scrollTop = log.scrollHeight;
}
function __chatReceive(text) {
  let now = performance.now();
  __chatTimes = __chatTimes.filter((t) => now - t < 5e3);
  if (__chatTimes.length >= 8) return;
  (__chatTimes.push(now), __chatAdd(`Opponent`, text.replace(/[\u0000-\u001f\u007f]/g, ` `), !1));
  document.hidden && Xa(`New chat message`);
}
function __chatSend() {
  let input = k(`chat-input`),
    text = input.value.replace(/[\u0000-\u001f\u007f]/g, ` `).trim().slice(0, 200),
    now = performance.now();
  if (!text || now - __chatLastSend < 400) return;
  try {
    X({ t: `arena-chat`, text });
  } catch {
    __chatAdd(`System`, `Message not sent: the other player is disconnected.`, !1);
    return;
  }
  ((__chatLastSend = now), __chatAdd(`You`, text, !0), (input.value = ``));
}
function __chatOpen(on) {
  let box = k(`chat-box`);
  ((box.hidden = !on), on || (k(`chat-log`).textContent = ``, (k(`chat-input`).value = ``)));
}
var __routeKind = null,
  __routeBusy = !1,
  __highJitter = 25;
function __renderNet() {
  let el = k(`stat-nettype`),
    sm = Ti.summary(),
    jit = sm.jitterMs;
  if (sm.samples < 3) {
    ((el.textContent = `—`), (el.title = ``), el.classList.remove(`relayed`));
    return;
  }
  let high = jit > __highJitter;
  ((el.textContent = high ? `High jitter (${jit.toFixed(0)} ms)` : `Stable (${jit.toFixed(0)} ms)`),
    (el.title = high
      ? `Your connection speed is uneven. This is common on Wi-Fi; a wired connection usually plays smoother.`
      : `Your connection speed is steady.`),
    el.classList.toggle(`relayed`, high));
}
async function __checkRoute(conn) {
  if (__routeBusy || !conn || conn !== R) return;
  let pc = conn.peerConnection;
  if (!pc || !pc.getStats) return;
  __routeBusy = !0;
  try {
    let stats = await pc.getStats(),
      byId = new Map(),
      pair = null;
    stats.forEach((r) => byId.set(r.id, r));
    stats.forEach((r) => {
      r.type === `transport` && r.selectedCandidatePairId && (pair = byId.get(r.selectedCandidatePairId));
    });
    pair ||
      stats.forEach((r) => {
        r.type === `candidate-pair` &&
          (r.selected || (r.nominated && r.state === `succeeded`)) &&
          (pair = r);
      });
    if (!pair || conn !== R) return;
    let local = byId.get(pair.localCandidateId),
      remote = byId.get(pair.remoteCandidateId);
    if (!local || !remote) return;
    let relayed = local.candidateType === `relay` || remote.candidateType === `relay`,
      kind = relayed ? `relay` : `direct`,
      proto = String(local.protocol || remote.protocol || ``).toUpperCase(),
      el = k(`stat-transport`);
    el.textContent = relayed
      ? `Relayed via TURN${proto ? ` · ` + proto : ``}`
      : `Direct peer-to-peer${proto ? ` · ` + proto : ``}`;
    el.classList.toggle(`relayed`, relayed);
    el.title = relayed
      ? `Your connection is passing through a TURN relay server. Expect extra lag.`
      : `Your connection goes straight to your opponent.`;
    if (kind !== __routeKind) {
      __routeKind = kind;
      Y(
        relayed
          ? `Notice: this connection is relayed through a TURN server, not direct. Expect extra lag; a wired connection or a different network may help.`
          : `Direct peer-to-peer connection established.`,
      );
    }
  } catch {
  } finally {
    __routeBusy = !1;
  }
}
function Y(e) {
  k(`setup-status`).textContent = e;
}
function Ha(e, t = !0) {
  k(`game-message`).textContent = e;
  ((k(`game-overlay`).hidden = !t), !G && j !== `preparing` && Ua());
}
function Ua() {
  ((k(`disc-loader`).hidden = !0), (k(`cartridge-loader`).hidden = !0));
}
function Wa(e, t = null, n = ``) {
  ((k(`cartridge-loader`).hidden = !0),
    (k(`disc-loader`).hidden = !0),
    (k(`game-overlay`).hidden = !1),
    (k(`game-message`).textContent = n || e));
}
function Ga(e, t = 0, n = ``, r = !1) {
  ((k(`cartridge-loader`).hidden = !0),
    (k(`disc-loader`).hidden = !1),
    (k(`game-overlay`).hidden = !0));
  let i = k(`disc-loader-startup`);
  (i.getAttribute(`src`) ||
    i.setAttribute(
      `src`,
      `${globalThis.__BASE}game/segacd-startup.` +
        (globalThis.matchMedia?.(`(prefers-reduced-motion: reduce)`).matches ? `png` : `gif`),
    ),
    k(`disc-loader`).classList.toggle(`is-boot`, r),
    k(`disc-loader`).classList.toggle(`is-error`, e === `LOAD INTERRUPTED`),
    (k(`disc-loader-stage`).textContent = e),
    (k(`disc-loader-percent`).textContent = `${Math.round(Math.max(0, Math.min(1, t)) * 100)}%`),
    (k(`disc-loader-progress`).value = t),
    (k(`disc-loader-copy`).textContent = n));
}
function Ka() {
  let e = ka();
  return li(e ? { ...z, resumeStateHash: e.hash } : z);
}
function X(e) {
  if (!R?.open) throw Error(`The other player is disconnected.`);
  R.send(e);
}
function qa() {
  try {
    if (typeof AudioContext > `u`) return;
    ((oa ||= new AudioContext()), Promise.resolve(oa.resume?.()).catch(() => {}));
  } catch {
    oa = null;
  }
}
function Ja() {
  try {
    if (!oa) return;
    let e = oa.currentTime;
    for (let [t, n] of [660, 880].entries()) {
      let r = oa.createOscillator(),
        i = oa.createGain();
      ((r.type = `sine`),
        (r.frequency.value = n),
        i.gain.setValueAtTime(1e-4, e + t * 0.16),
        i.gain.exponentialRampToValueAtTime(0.18, e + t * 0.16 + 0.02),
        i.gain.exponentialRampToValueAtTime(1e-4, e + t * 0.16 + 0.22),
        r.connect(i),
        i.connect(oa.destination),
        r.start(e + t * 0.16),
        r.stop(e + t * 0.16 + 0.25));
    }
  } catch {}
}
function Ya() {
  (clearInterval(sa), (sa = 0), (document.title = ca));
}
function Xa(e) {
  if (!document.hidden) return;
  clearInterval(sa);
  let t = !0;
  ((document.title = e),
    (sa = setInterval(() => {
      ((document.title = t ? ca : e), (t = !t));
    }, 1e3)));
}
function Za() {
  (qa(), Ja(), Xa(`● Opponent joined`));
}
function Qa() {
  if (M !== `online` || j !== `lobby`) return null;
  let e = !!R?.open;
  return N
    ? e
      ? B
        ? { state: `ready`, title: `YOU’RE READY`, copy: `Waiting for your opponent to confirm.` }
        : V
          ? { state: `ready`, title: `OPPONENT IS READY`, copy: `Press START MATCH to begin.` }
          : {
              state: `joined`,
              title: `OPPONENT JOINED`,
              copy:
                z.platform === `nhl95`
                  ? `Choose your own team. Your opponent chooses theirs. Start when both players are ready.`
                  : `They’re connected. Set the matchup and your side, then press START MATCH.`,
            }
      : {
          state: `waiting`,
          title: `WAITING FOR OPPONENT`,
          copy: `Share room code ${aa || `…`}. The match cannot start until your opponent joins.`,
        }
    : e
      ? B
        ? {
            state: `ready`,
            title: `YOU’RE READY`,
            copy: `Waiting for the host to start the match.`,
          }
        : {
            state: `joined`,
            title: `CONNECTED TO HOST`,
            copy:
              z.platform === `nhl95`
                ? `Choose your own team, then press READY TO PLAY.`
                : `The host sets the matchup. Press READY TO PLAY when you’re set.`,
          }
      : {
          state: `waiting`,
          title: `JOINING ROOM…`,
          copy: `Connecting to the host. Keep this tab open.`,
        };
}
function $a() {
  return M === `online` || $i === `two` ? `two` : ea === 0 ? `single_home` : `single_away`;
}
var eo = (e) => (e === 0 ? `Home` : `Away`),
  to = null,
  no = ne(document, `${globalThis.__BASE}`);
function ro(e = to) {
  ((to = e), v(document, e, j));
}
function Z() {
  __syncRom();
  let e = j !== `lobby` || K || G || J,
    t = !e && (M !== `online` || N),
    n = !!da?.tournamentId;
  ((k(`match-type`).value = z.matchType),
    (k(`match-type`).disabled = !t || n),
    (k(`mercy-toggle`).checked = z.mercyEnabled),
    (k(`mercy-toggle`).disabled = !t || n),
    (k(`match-options-note`).textContent = n
      ? `Tournament game and six-goal mercy are fixed for this event.`
      : M === `online` && !N
        ? `The host sets these rules. Confirm the same settings before play.`
        : `Set before starting. Both online players confirm the same rules.`),
    ro(j === `lobby` || j === `preparing` ? null : to));
  let r = ii(z.pair, z.platform),
    i = D(z.platform),
    a = z.platform === `nhl95`,
    o = `Your game`;
  ((k(`game-select`).value = a ? `nhl95` : `nhl94`),
    (k(`game-select`).disabled = !t || n),
    k(`platform-select`).replaceChildren(
      ...xe.filter((e) => (e === `nhl95`) === a).map((e) => new Option(ti[e].name, e)),
    ),
    (k(`platform-select`).value = z.platform),
    (k(`platform-select`).disabled = !t || n),
    (k(`platform-note`).textContent = i.note),
    (k(`edition-platform`).textContent = i.tag),
    k(`arena`).setAttribute(`data-platform`, z.platform),
    k(`arena`).setAttribute(`data-mode`, M),
    k(`arena`).setAttribute(`data-game`, a ? `nhl95` : `nhl94`),
    k(`game-canvas`).setAttribute(
      `aria-label`,
      `${o} hockey gameplay. Keyboard and gamepad controls listed below.`,
    ),
    (k(`nhl94-matchup`).hidden = a),
    (k(`nhl95-selection`).hidden = !a));
  let s = M === `online` ? xi : $i === `single` ? ea : 0;
  ((k(`your-team`).value = s === 0 ? z.homeTeam : z.awayTeam),
    (k(`your-team`).disabled = e || (M === `online` && !N && !Gi)),
    (k(`local-opponent-team`).value = s === 0 ? z.awayTeam : z.homeTeam),
    (k(`local-opponent-team`).disabled = e),
    (k(`local-opponent-choice`).hidden = M === `online`),
    (k(`your-team-label`).textContent =
      M === `local` && $i === `two` ? `Player 1 · Home team` : `Your team · ${eo(s)}`),
    (k(`local-opponent-label`).textContent = $i === `single` ? `CPU team` : `Player 2 · Away team`),
    (k(`nhl95-opponent`).textContent =
      M === `online`
        ? `Opponent: ${hr.find((e) => e.id === (s === 0 ? z.awayTeam : z.homeTeam)).name}. Each player chooses their own team.`
        : ``),
    (k(`team-rule-copy`).textContent = a
      ? `Each player selects their own regular team. Choose different teams. Five-minute periods, manual goalies, penalties on with offsides off, line changes off, no ties and no turbo. These NHL ’95 settings are an online adaptation.`
      : `Choose any two different teams from the list, then pick which one is home. All-Stars are excluded. No ties, no turbo.`),
    (k(`team-rule-copy`).textContent +=
      ` Mercy ${z.mercyEnabled ? `on: stop at a six-goal lead.` : `off: keep playing after a six-goal lead.`}`),
    (k(`team-a`).value = z.pair[0]),
    (k(`team-b`).value = z.pair[1]),
    (k(`home-choice`).value = z.homeTeam === z.pair[0] ? `a` : `b`));
  for (let [e, t] of [...(k(`home-choice`).options || [])].entries())
    t.textContent = hr.find((t) => t.id === z.pair[e]).name;
  ((k(`team-a`).disabled = k(`team-b`).disabled = !t || !Ai),
    (k(`home-choice`).disabled = !t),
    (k(`start-match`).disabled =
      e ||
      !P ||
      __romBad() ||
      (M === `online` && !R?.open) ||
      B ||
      !(!q || ka()) ||
      (M === `online` && !Aa())),
    (k(`start-match`).textContent = J
      ? `CHECKING SAVE…`
      : G
        ? `LOADING GAME…`
        : K
          ? `CONFIRMING…`
          : j === `preparing`
            ? `PREPARING MATCH…`
            : j === `finished`
              ? `MATCH COMPLETE`
              : e
                ? `MATCH IN PROGRESS`
                : B
                  ? N
                    ? `READY · WAITING FOR GUEST`
                    : `READY · WAITING FOR HOST`
                  : M === `online`
                    ? R?.open
                      ? N
                        ? `START MATCH`
                        : `READY TO PLAY`
                      : N
                        ? `WAITING FOR OPPONENT TO JOIN`
                        : `CONNECTING…`
                    : `START GAME`),
    k(`start-match`).classList.toggle(
      `ready-pulse`,
      M === `online` && !!R?.open && !e && !B && !!P,
    ));
  let c = Qa();
  ((k(`join-indicator`).hidden = !c),
    c &&
      (k(`join-indicator`).setAttribute(`data-state`, c.state),
      (k(`join-indicator-title`).textContent = c.title),
      (k(`join-indicator-copy`).textContent = c.copy)),
    k(`arena`).setAttribute(`data-phase`, j));
  for (let e of [`home`, `away`]) {
    let t = hr.find((t) => t.id === z[`${e}Team`]);
    k(`${e}-team-name`).textContent = t.name;
    let n = k(`${e}-team-sprite`);
    ((n.onerror = () => {
      n.style.visibility = `hidden`;
    }),
      (n.onload = () => {
        n.style.visibility = ``;
      }),
      (n.src = `${globalThis.__BASE}game/team-sprites/${t.id}.png`));
  }
  ((k(`practice-mode`).disabled = k(`host-mode`).disabled = k(`join-room`).disabled = e),
    k(`practice-mode`).setAttribute(`aria-pressed`, String(M === `local`)),
    k(`host-mode`).setAttribute(`aria-pressed`, String(M === `online` && N)),
    k(`practice-mode`).classList.toggle(`selected`, M === `local`),
    k(`host-mode`).classList.toggle(`selected`, M === `online` && N),
    (k(`side-assignment`).hidden = M !== `online`));
  for (let t of [0, 1]) {
    let n = k(`host-side-${t}`),
      r = xi === t;
    ((n.disabled = e || !N),
      n.setAttribute(`aria-pressed`, String(r)),
      n.classList.toggle(`selected`, r));
  }
  ((k(`side-assignment-copy`).textContent = N
    ? a
      ? `Choose Player 1 (home) or Player 2 (away). The guest takes the other controller port.`
      : `Choose Player 1 (home) or Player 2 (away). The guest takes the other controller port.`
    : `The host assigned you to Player ${xi + 1} · ${xi === 0 ? `Home` : `Away`}.`),
    (k(`disconnect`).disabled = !L),
    (k(`return-select`).disabled = j === `lobby` || j === `preparing` || ia),
    (k(`return-select`).textContent = ia
      ? `ENDING…`
      : j === `finished`
        ? `NEXT MATCHUP`
        : `END GAME`));
  for (let e of [`save-stats`, `save-stats-in-game`]) {
    let t = k(e);
    ((t.disabled =
      Ca ||
      j === `preparing` ||
      !((F && [`lineup`, `playing`, `finished`].includes(j)) || Sa.has(z.platform))),
      (t.textContent = Ca ? `Saving…` : j === `lobby` ? `Save last stats` : `Save stats`));
  }
  (za(),
    Ma(),
    (k(`pause-match`).disabled = j !== `playing`),
    (k(`pause-match`).textContent = M === `online` ? `Game Start / pause` : W ? `Resume` : `Pause`),
    (k(`rule-version`).textContent = `${o} · ${i.name} · conditions checked at game startup`),
    (k(`session-status`).textContent =
      j === `playing`
        ? W
          ? `LOCAL MATCH PAUSED`
          : `EXPERIMENTAL TEST MATCH`
        : j === `lineup`
          ? `CHOOSE YOUR LINES`
          : j === `preparing`
            ? `PREPARING MATCH`
            : j === `finished`
              ? `MATCH COMPLETE`
              : `NO MATCH IN PROGRESS`),
    k(`screen-wrap`).classList.toggle(`gameplay-view`, j === `playing`),
    (k(`game-build-title`).textContent = P
      ? `${o} is ready`
      : Xi
        ? `Game build unavailable`
        : G
          ? `${o} is loading`
          : `ROM needed`),
    (k(`game-build-state`).textContent = P ? `READY` : Xi ? `ERROR` : G ? `CHECKING` : `NEEDED`));
  let l = P ? `CHECKING` : `CHOOSE ROM`,
    u = P
      ? `Almost ready.`
      : `Choose your game ROM file from this computer in the Game ROM box above.`;
  (Xi
    ? ((l = `NEEDS ATTENTION`), (u = `That ROM could not be used. Choose a different ROM file.`))
    : P && M === `local`
      ? ((l = `READY TO START`),
        (u = `Ready. Start to boot the game; use its own menus to set up. Two keyboard layouts or controllers work on this computer.`))
      : P && !R?.open
        ? ((l = L ? (N ? `WAITING FOR GUEST` : `CONNECTING`) : `CHOOSE A ROOM`),
          (u = L
            ? N
              ? `Your room is ready. Share the code, then start when your guest joins.`
              : `Opening the room. Keep this tab active.`
            : `Host a room or enter a friend’s three-character code.`))
        : P && B
          ? ((l = N ? `WAITING FOR GUEST` : `WAITING FOR HOST`),
            (u = `Your side is ready. The match starts when both players confirm.`))
          : P &&
            R?.open &&
            ((l = N ? `OPPONENT JOINED` : `READY TO PLAY`),
            (u = N ? `Start when your guest is ready.` : `Confirm when you are ready.`)),
    a &&
      P &&
      !Xi &&
      !B &&
      (u =
        M === `local`
          ? `Choose each team independently, then start your NHL ’95 match.`
          : R?.open
            ? `Choose your own team, then confirm when both players are ready.`
            : `Choose your team and share your room code to invite an opponent.`),
    !Xi &&
      j === `lobby` &&
      (J
        ? ((l = `CHECKING SAVE`),
          (u = `Checking your saved game. Wait here before choosing Start or Ready.`))
        : G
          ? ((l = `LOADING GAME`),
            (u = `Wait for the selected game to finish loading. Your start button will unlock when it is ready.`))
          : q && !ka()
            ? ((l = `CHECK SAVE SETUP`),
              (u = `Choose the save’s original home/away teams and player mode, or use Clear loaded state below the arena to start fresh.`))
            : M === `online` &&
              R?.open &&
              !Aa() &&
              ((l = `MATCH YOUR SAVES`),
              (u = `Both players must load the same file before Ready. Open Load state, or both use Clear loaded state to start fresh.`))),
    j === `preparing`
      ? ((l = `PREPARING MATCH`),
        (u = `Setting up the game. Keep this tab open; the lineup menu is next.`))
      : j === `lineup`
        ? ((l = `CHOOSE YOUR LINES`),
          (u = `Choose your lines in the original game menu, then press Start on your controller or keyboard.`))
        : j === `playing`
          ? ((l = W ? `MATCH PAUSED` : `MATCH IN PROGRESS`),
            (u = W
              ? `Choose Resume below the game to continue.`
              : `Game controls and save options are below the game. Save final stats before ending the match.`))
          : j === `finished` &&
            ((l = `MATCH COMPLETE`),
            (u = `Save your final stats, then choose Next matchup below the game to play again.`)),
    (k(`ready-check-title`).textContent =
      j === `lobby` ? `Get ready` : j === `preparing` ? `Getting ready` : `Match status`),
    (k(`ready-state`).textContent = l),
    (k(`ready-copy`).textContent = u));
  let d = M === `local`,
    f = $i === `single`;
  k(`local-options`).hidden = !d;
  for (let [t, n] of [
    [`local-single`, f],
    [`local-two`, !f],
  ]) {
    let r = k(t);
    ((r.disabled = e),
      r.setAttribute(`aria-pressed`, String(n)),
      r.classList.toggle(`selected`, n));
  }
  ((k(`single-side`).hidden = !f),
    d && (k(`connection-status`).textContent = `Offline · local game`));
  for (let t of [0, 1]) {
    let n = k(`human-side-${t}`),
      r = ea === t;
    ((n.disabled = e),
      n.setAttribute(`aria-pressed`, String(r)),
      n.classList.toggle(`selected`, r));
  }
  let p = ea === 0 ? z.homeTeam : z.awayTeam,
    m = ea === 0 ? z.awayTeam : z.homeTeam;
  ((k(`single-summary`).textContent =
    `You play ${Po(p)} (${eo(ea)}). The game’s CPU plays ${Po(m)}. Use player one’s keyboard keys or your controller.`),
    (k(`screen-tag`).textContent = i.tag));
}
function io(e, t, n = z.hostSlot, r = z.platform, i = z) {
  if (j !== `lobby`) throw Error(`Team settings are locked during a match.`);
  ((z = ci(e, t, z.delay, n, r, i)),
    q &&
      (q.platform !== r || q.homeTeam !== z.homeTeam || q.awayTeam !== z.awayTeam) &&
      ((q = null), ja()),
    (B = !1),
    (V = !1),
    Z());
}
function ao(e) {
  return j !== `lobby` || J || B || V
    ? !1
    : ((z = ci(z.pair, z.homeTeam, e, z.hostSlot, z.platform, z)),
      (k(`stat-delay`).textContent = String(e)),
      Z(),
      !0);
}
var oo = () => ({
  t: `arena-config`,
  pair: z.pair,
  homeChoice: z.homeTeam,
  hostSlot: z.hostSlot,
  platform: z.platform,
  matchType: z.matchType,
  mercyEnabled: z.mercyEnabled,
});
function so(e, t, n) {
  if (ta)
    try {
      ta.push(e, t, n);
    } catch (e) {
      (console.error(`Recording stopped`, e), (ta = null));
    }
}
function co(e = !1) {
  let t = ta;
  if (((ta = null), !t)) return;
  let n = null;
  if (M === `online` && I) {
    let e = Ti.summary(),
      t = I.metrics;
    n = {
      samples: e.samples,
      rttMs: e.rttMs,
      p95RttMs: e.p95RttMs,
      jitterMs: e.jitterMs,
      probeLoss: e.probeLoss,
      frameP95Ms: e.frameP95Ms,
      rollbacks: t.rollbacks,
      replayed: t.replayed,
      maxRollback: t.maxRollback,
      stalls: t.stalls,
      delay: I.delay,
    };
  }
  try {
    let r = t.finish(ra || `ended`, n);
    r &&
      (la.submit(r, { unloading: e }),
      ua
        .submit(r)
        .catch(() =>
          Y(`Your community replay is queued on this device. Return while signed in to retry.`),
        ));
  } catch (e) {
    console.error(`Match recording failed`, e);
  }
}
function lo() {
  (Ia(ra || `left`),
    co(),
    (ra = null),
    (Ea = null),
    Oa++,
    (J = !1),
    U++,
    cancelAnimationFrame(Fi),
    (Fi = 0),
    A.suspend(),
    F?.dispose(),
    (F = null),
    (I = null),
    G || Ua(),
    (j = `lobby`),
    (W = !1),
    (B = V = !1),
    (Ni = Pi = !1),
    (Bi = 0),
    (ji = Mi = null),
    (H = null),
    bi.held.clear(),
    (Ki = Vr()),
    (qi = Ji = -1),
    Qi++,
    (K = !1),
    (ia = !1));
}
function uo() {
  return { frame: I ? I.confirmed : F?.frames || 0, homeScore: 0, awayScore: 0 };
}
function fo(e, t = `ended`) {
  [`lineup`, `playing`, `finished`].includes(j) &&
    H &&
    j !== `finished` &&
    (Ia(t),
    (ia = !1),
    (ra ||= t),
    (j = `finished`),
    (W = !1),
    (ba = H),
    U++,
    cancelAnimationFrame(Fi),
    (Fi = 0),
    A.suspend(),
    bi.held.clear(),
    ta?.setScore(e.frame, e.homeScore, e.awayScore, t === `mercy` ? `complete` : `ended`),
    co(),
    to && ro({ ...to, homeScore: e.homeScore, awayScore: e.awayScore }),
    mo(!1),
    Z());
}
function po() {
  if (M !== `online` || !N || ![`lineup`, `playing`].includes(j)) return;
  let e = uo();
  (X({ t: `arena-end`, matchId: H, ...e }), fo(e));
}
function mo(e = !0) {
  if (j !== `finished`) return;
  let t = H;
  ((ba = t),
    e && M === `online` && R?.open && X({ t: `arena-reset`, matchId: t }),
    lo(),
    Ha(`Game ended. Start another when ready.`),
    Y(
      M === `online`
        ? `Both players are connected. Start another game when ready.`
        : `Game ended. Start another when ready.`,
    ),
    Z());
}
function ho(e = `Disconnected. No tournament result was recorded.`, t = !0, n = `left`) {
  __chatOpen(!1);
  if (
    ((L || R) && Va(n),
    clearTimeout(ha),
    (ha = null),
    (ma = null),
    (ga = null),
    (ra ||= n),
    t && R?.open)
  )
    try {
      X({ t: `arena-leave` });
    } catch {}
  (lo(), clearInterval(Ei), (Ei = null), clearTimeout(Di), (Di = null));
  let r = R;
  ((R = null), r?.close());
  let i = L;
  ((L = null),
    i?.destroy(),
    zi.clear(),
    (Da = null),
    (M = `local`),
    (N = !0),
    (xi = 0),
    (k(`room-share`).hidden = !0),
    (ba = null),
    (Gi = !1),
    (aa = ``),
    Ya(),
    (k(`connection-status`).textContent = `Offline · local game`),
    (k(`stat-transport`).textContent = `Not connected`),
    Y(e),
    Ha(e),
    Z());
}
function Q(e) {
  (console.error(e), ho(e?.message || `The test stopped. Please reconnect.`, !0, `error`));
}
function $(e) {
  return (...t) =>
    Promise.resolve()
      .then(() => e(...t))
      .catch(Q);
}
async function go() {
  return (
    (Wi ||= (async () => {
      let e = D(z.platform);
      [Vi, Hi] = await Promise.all([
        yi(() => import(`${globalThis.__BASE}game/` + e.emu), []),
        yi(() => import(`${globalThis.__BASE}game/` + e.boot), []),
      ]);
      let t = await Promise.all(
        e.files
          .map((e) => `game/` + e)
          .map(async (e) => {
            let t = await fetch(`${globalThis.__BASE}` + e);
            if (!t.ok) throw Error(`Missing emulator file: ${e}`);
            return new Uint8Array(await t.arrayBuffer());
          }),
      );
      Ui = await li({ version: Vi.CORE_VERSION, files: await Promise.all(t.map(li)) });
    })()),
    Wi
  );
}
async function _o(e) {
  let t = ++Yi;
  if (
    ((P = null),
    (Si = null),
    (Xi = null),
    Z(),
    (k(`rom-status`).textContent = `Checking your ROM file…`),
    e.byteLength < 16384 || e.byteLength > 8388608)
  )
    throw Error(`That file does not look like a game ROM.`);
  await go();
  let n = await Vi.sha256Hex(Vi.normalizeROM ? Vi.normalizeROM(e) : e);
  if (t === Yi) {
    ((P = e),
      (Si = n),
      (k(`rom-status`).textContent =
        `ROM loaded (${(e.byteLength / 1048576).toFixed(2)} MB). It stays on this computer.`),
      Y(`Game ready. Choose how you want to play.`),
      Z());
  }
}
async function vo() {
  let e = z.platform,
    t = D(e),
    n = `${globalThis.__BASE}game/` + t.media;
  try {
    let r;
    if (z.platform === `segacd`) {
      Ga(`CHECKING DISC`, 0, `Checking your saved disc and tester access.`);
      let e = go();
      (e.catch(() => {}),
        (r = await fr(n, t.bytes, {
          expectedHash: t.mediaHash,
          onProgress: (e, t) => {
            let n = Math.round((t?.cachedBytes || 0) / 1048576),
              r = Math.round((t?.downloadedBytes || 0) / 1048576),
              i =
                t?.phase === `verifying`
                  ? `VERIFYING DISC`
                  : t?.downloadedBytes
                    ? `DOWNLOADING DISC`
                    : t?.cachedBytes
                      ? `READING SAVED DISC`
                      : `CHECKING DISC`,
              a =
                t?.phase === `verifying`
                  ? `Checking the complete disc before play.`
                  : t?.downloadedBytes
                    ? `${r} MB downloaded · ${n} MB from this device. ${t.cacheAvailable ? `Saved chunks resume next time.` : `Device storage unavailable; this visit can still play.`}`
                    : t?.cachedBytes
                      ? `Your saved disc is loading. No disc download needed for these chunks.`
                      : `First visit: saving the 227 MB disc for faster return visits.`;
            ((k(`rom-status`).textContent = `${i} · ${Math.round(e * 100)}%`), Ga(i, e, a));
          },
        })),
        await e,
        Ga(`PREPARING GAME`, 1, `Disc loaded. Checking the game and BIOS.`));
    } else {
      if (((r = __roms.get(e)), !r)) {
        (Ua(), Ha(`Choose your ROM file to begin.`));
        return;
      }
      Wa(`CHECKING GAME`, null, `Checking your game…`);
    }
    if (t.bios) {
      let e = await fetch(`${globalThis.__BASE}game/` + t.bios, { credentials: `same-origin` });
      if (!e.ok) throw Error(`The Sega CD BIOS could not be loaded.`);
      ((Ci = new Uint8Array(await e.arrayBuffer())), (wi = await li(Ci)));
    }
    if ((await _o(r), z.platform !== e || !P)) return;
    (z.platform === `segacd` ? (Ua(), Ha(`Game ready. Choose your matchup and start.`)) : Ua(),
      Ha(`Your ROM is ready. Host online or start a local game.`));
  } catch (e) {
    throw (
      z.platform === `segacd`
        ? Ga(`LOAD INTERRUPTED`, 0, `${e.message} Reload to resume saved chunks.`)
        : Wa(`LOAD INTERRUPTED`, null, e.message + ` Reload to try again.`),
      e
    );
  }
}
async function yo(e) {
  let t = ka();
  Ea = null;
  let n = ++U;
  ((j = `preparing`), (H = e), Z());
  try {
    if (
      (Ha(`Starting your game…`),
      z.platform === `segacd`
        ? Ga(`STARTING SEGA CD`, 0, `Starting NHL ’94 and applying your matchup.`)
        : Wa(`SETTING UP YOUR MATCH`, 0, `Starting your game…`),
      await go(),
      n !== U)
    )
      return !1;
    let r = await (Vi.Genesis || Vi.SNES || Vi.SegaCD).create(P, {
      biosBytes: Ci,
      locateFile: (e) => (e.endsWith(`.wasm`) ? `${globalThis.__BASE}game/core/` + e : e),
    });
    if (n !== U) return (r.dispose(), !1);
    F = r;
    let i;
    if (
      (t
        ? (ge(F, t.bytes, () => Hi.verifyMatchSettings(F, ai[z.homeTeam], ai[z.awayTeam], $a())),
          (Ea = t),
          (i = { settingsVerified: !0 }))
        : (i = {}),
      n !== U || ((na = await li(F.save().bytes)), n !== U))
    )
      return !1;
    if (
      ((ta = new Kr({
        matchId: e,
        side: M === `online` ? (xi === 0 ? `home` : `away`) : `local`,
        mode: M === `online` ? `online` : `local`,
        started: null,
        config: {
          ...structuredClone(z),
          players: $a(),
          ...(t ? { resume: { stateHash: t.hash, source: `browser-load` } } : {}),
        },
        romSha256: Si,
        coreHash: Ui,
        rollbackVersion: Cr,
        startStateHash: na,
      })),
      Y(`Starting your game from power-on.`),
      M === `online`)
    ) {
      z.platform === `segacd`
        ? Ga(`WAITING FOR PLAYER`, 1, `Game ready. Waiting for the other player.`, !0)
        : Wa(`WAITING FOR PLAYER`, 1, `Your game is ready. Waiting for your opponent.`);
      let r = await li({
        ...z,
        biosHash: z.platform === `segacd` ? wi : null,
        ...(t ? { resumeStateHash: t.hash } : {}),
      });
      if (n !== U) return !1;
      ((ji = jr({
        romHash: Si,
        coreHash: Ui,
        configHash: r,
        stateHash: na,
        delay: z.delay,
        window: z.window,
        matchId: e,
      })),
        X(ji),
        await bo());
    }
    return !0;
  } catch (e) {
    if (n !== U) return !1;
    throw e;
  }
}
async function bo() {
  ji &&
    Mi &&
    (Nr(ji, Mi),
    Ni ||
      ((I = new Tr(F, xi, X, z.delay, z.window, { onConfirmedInput: so })),
      (Ni = !0),
      X({ t: `ready`, matchId: H, configHash: ji.configHash })),
    N && Pi && j === `preparing` && (X({ t: `arena-start`, matchId: H }), Co()));
}
async function xo() {
  if (M === `online` && N && j === `lobby` && B && V) {
    ((j = `preparing`), Z());
    let e = R,
      t = U,
      n = O(z),
      r = ua.matchId() || crypto.randomUUID(),
      i = await Ka();
    if (R !== e || t !== U || j !== `preparing` || n !== O(z)) return;
    (X({ t: `arena-prepare`, matchId: r, configHash: i }), await yo(r));
  }
}
async function So() {
  if (j !== `lobby` || K || B || J) return;
  if (M === `online` && !R?.open) {
    Y(
      N
        ? `Waiting for your opponent to join. The match starts once they are connected.`
        : `Still connecting to the host.`,
    );
    return;
  }
  let e = ++Qi,
    t = O(z);
  ((K = !0), Z());
  try {
    if ((await A.unlock(), e !== Qi || j !== `lobby`)) return;
    if (t !== O(z)) {
      Y(`The matchup changed. Please review and lock in again.`);
      return;
    }
    if (q && !ka()) {
      Y(
        `Choose this save’s original teams and player mode, or clear the loaded state to start fresh.`,
      );
      return;
    }
    if (M === `online` && !Aa()) {
      Y(`Both players must load the same saved game, or clear the loaded state to start fresh.`);
      return;
    }
    if (__romBad()) {
      Y(__romBad());
      return;
    }
    if (!P || G) throw Error(`The game ROM is not loaded yet.`);
    if (M === `local`) {
      (await yo(crypto.randomUUID())) && Co();
      return;
    }
    let n = await Ka();
    if (e !== Qi || t !== O(z)) return;
    ((B = !0),
      X({ t: `arena-lock`, configHash: n, locked: !0 }),
      Y(V ? `Both players locked in.` : `Locked in. Waiting for the other player.`),
      Z(),
      await xo());
  } finally {
    e === Qi && ((K = !1), Z());
  }
}
function Co() {
  (wo(`playing`),
    Y(`Your game is running. Use the game’s own menus to choose teams, players and rules.`));
}
function wo(e) {
  if (j === `preparing` && F) {
    if (
      (Ea && ((q = null), (Da = null)),
      no.clear(),
      (to = null),
      (j = e),
      (W = !1),
      (Bi = 0),
      (Ii = null),
      (Li = 0),
      k(`controller-dialog`).open && Bo(),
      k(`help-dialog`).open && Ho(),
      Ua(),
      ta && (ta.meta.started = new Date().toISOString()),
      Ha(``, !1),
      !k(`controller-dialog`).open && !k(`help-dialog`).open && k(`game-canvas`).focus(),
      j === `lineup`)
    ) {
      let e = D(z.platform).gameName || `NHL ’94`,
        t = M === `local` && $i === `single`;
      Y(
        z.platform === `nhl95`
          ? `NHL ’95 menu: press C on Edit Lines to change your lineup, then START when ready.${t ? ` The CPU picks its own.` : ` Both players can edit their lines.`}`
          : t
            ? `Choose your lines in the ${e} menu, then press START when you are ready. The CPU picks its own.`
            : `Choose your lines in the ${e} menu. Both players press START when ready.`,
      );
    }
    (Ea &&
      Y(
        `Saved game resumed. Scores, clock and in-game pause are restored; press Start in the game if it was paused.`,
      ),
      Z(),
      (Fi = requestAnimationFrame(Oo)));
  }
}
function To() {
  let e = F.video();
  if (!e) return;
  let t = k(`game-canvas`);
  (k(`screen-wrap`).classList.toggle(`wide-game-screen`, e.width === 320),
    (t.width !== e.width || t.height !== e.height) && ((t.width = e.width), (t.height = e.height)),
    t.getContext(`2d`, { alpha: !1 }).putImageData(new ImageData(e.data, e.width, e.height), 0, 0));
}
function Eo() {
  return;
  let e = I ? I.confirmed : F.frames;
  if (e <= qi || (qi >= 0 && e - qi < 10)) return;
  let t, n;
  if (I && I.frame !== e) {
    let r = I.states.get(e);
    if (!r) return;
    let i = F.save();
    try {
      (F.load(r), (t = F.info()), (n = _(F, z.platform, t)));
    } finally {
      F.load(i);
    }
  } else ((t = F.info()), (n = _(F, z.platform, t)));
  if (
    ((qi = e),
    ro(n),
    (Ki = Hr(Ki, {
      confirmed: !0,
      frame: e,
      homeScore: t.p1_score,
      awayScore: t.p2_score,
      mercyEnabled: z.mercyEnabled,
    })),
    ta?.setScore(e, t.p1_score, t.p2_score, Ki.status),
    Ki.freeze)
  ) {
    let n = { frame: e, homeScore: t.p1_score, awayScore: t.p2_score };
    (M === `online` && N && X({ t: `arena-end`, matchId: H, ...n, reason: `mercy` }),
      fo(n, `mercy`),
      Y(`Match stopped at a confirmed six-goal lead. Save stats or share your result below.`));
  }
}
function Do() {
  return;
  let e = I ? I.confirmed : F.frames;
  if (e <= Ji || (Ji >= 0 && e - Ji < 10)) return;
  let t;
  if (I && I.frame !== e) {
    let n = I.states.get(e);
    if (!n) return;
    let r = F.save();
    (F.load(n), (t = F.info()), F.load(r));
  } else t = F.info();
  ((Ji = e),
    (Hi?.isGameplayReady
      ? Hi.isGameplayReady(F, t)
      : t.period === 0 &&
        (t.time & 65535) > 0 &&
        (t.time & 65535) <= 300 &&
        t.p1_score === 0 &&
        t.p2_score === 0 &&
        Math.abs(t.g1_y) > 100 &&
        Math.abs(t.g2_y) > 100) &&
      ((j = `playing`), bi.held.clear(), (qi = -1), Y(`Puck dropped. The match is live.`), Z()));
}
function Oo(e) {
  if ([`lineup`, `playing`].includes(j)) {
    if (document.hidden && M === `online`) {
      ((Ii = null), (Li = 0), (Fi = requestAnimationFrame(Oo)));
      return;
    }
    try {
      if (!Number.isFinite(e)) {
        ((Ii = null), (Fi = requestAnimationFrame(Oo)));
        return;
      }
      let t = Ii === null ? 0 : Math.max(0, e - Ii);
      if (((Ii = e), t > 0 && Ti.recordFrame(t), !W && !(__rsOn && __rsId === H))) {
        let e = 1e3 / (F.fps ?? 59.922743);
        Li = Math.min(Li + t, e * 5);
        let n = 0;
        for (; Li >= e && n++ < 5;) {
          let t = D(z.platform).mask,
            n = (bi.mask(0) | (Bi > 0 ? 8 : 0)) & t,
            r;
          if (M === `online`) r = I.advance(n);
          else {
            let e = $i === `single` ? 0 : bi.mask(1) & t;
            (F.step(n, e), so(ta?.frames, n, e), (r = !0));
          }
          if (!r) {
            Li = 0;
            break;
          }
          (Bi > 0 && Bi--, A.push(F.audio(), F.audioRate), (Li -= e));
        }
        (To(), j === `lineup` && Do(), j === `playing` && Eo());
      }
      if (I) {
        let e = I.metrics;
        ((k(`stat-rollback`).textContent = String(e.predictedFrames)),
          (k(`stat-delay`).textContent = String(I.delay)),
          (k(`connection-status`).textContent =
            `WebRTC · frame ${e.frame} · ${e.rollbacks} corrections · ${e.stalls} waits`));
      }
      Fi = requestAnimationFrame(Oo);
    } catch (e) {
      Q(e);
    }
  }
}
async function ko(e, t = R) {
  let n = () => t === R;
  if (!n()) return;
  if (e?.t?.startsWith(`arena-`)) {
    let t = fi(e);
    if (t.t === `arena-rom`) {
      ((__peerRom = t), (__peerFor = R), Z());
      return;
    }
    if (t.t === `arena-chat`) {
      __chatReceive(t.text);
      return;
    }
    if (t.t.startsWith(`arena-state-`)) {
      await globalThis.__arenaNet?.(t);
      return;
    }
    if (t.t === `arena-leave`) {
      ho(`The other player left. No result was recorded.`, !1, `remote-left`);
      return;
    }
    if (t.t === `arena-team`) {
      if (!N || z.platform !== `nhl95`)
        throw Error(`Independent team selection is only available in NHL ’95.`);
      if (j !== `lobby` || K) return;
      let e = 1 - z.hostSlot,
        n = [z.homeTeam, z.awayTeam];
      if (t.team === n[1 - e]) {
        X({ t: `arena-team-rejected`, platform: `nhl95`, reason: `duplicate` });
        return;
      }
      ((n[e] = t.team),
        io(n, n[0]),
        X(oo()),
        Y(`Opponent selected their team. Both players confirm the updated match.`));
      return;
    }
    if (t.t === `arena-team-rejected`) {
      if (N || z.platform !== `nhl95`) throw Error(`Unexpected team selection response.`);
      (Y(`Your opponent already chose that team. Choose a different team.`), Z());
      return;
    }
    if (t.t === `arena-config`) {
      if (N) throw Error(`Only the host sets the matchup.`);
      if (
        da?.tournamentId &&
        (t.platform !== da.platform || t.matchType !== `tournament` || t.mercyEnabled !== !0)
      )
        throw Error(`The host settings do not match this tournament.`);
      if (j !== `lobby`) throw Error(`Platform and matchup are locked during play.`);
      if ((Qi++, (K = !1), (Gi = !0), (Ai = !0), (t.platform ?? `genesis`) !== z.platform)) {
        let e = await Ro(t.platform ?? `genesis`, !1, n);
        if (!n()) return;
        if (!e) throw Error(`The host platform could not be selected.`);
      }
      if (!n()) return;
      (io(t.pair, t.homeChoice, t.hostSlot, t.platform ?? `genesis`, t),
        (xi = 1 - t.hostSlot),
        ka() && ja(),
        Z(),
        Y(
          z.platform === `nhl95`
            ? `NHL ’95 teams updated. Choose your own team and confirm when ready.`
            : `Host updated the matchup and player sides. Choose READY TO PLAY when you are set.`,
        ));
      return;
    }
    if (t.t === `arena-resume`) {
      if (j !== `lobby` || (Da?.platform === t.platform && Da.hash === t.hash)) return;
      ((Da = { platform: t.platform, hash: t.hash }),
        (B = V = !1),
        Qi++,
        (K = !1),
        Y(
          t.hash
            ? `Opponent selected a saved game. Load the same save, then both choose Ready.`
            : `Opponent cleared their saved game. Both players must use the same save or start fresh.`,
        ),
        Z());
      return;
    }
    if (t.t === `arena-lock`) {
      let e = O(z),
        r = await Ka();
      if (!n() || j !== `lobby` || e !== O(z) || t.configHash !== r) return;
      ((V = t.locked),
        Y(
          t.locked
            ? `Opponent locked in. Confirm your selection to continue.`
            : `Opponent is not ready yet.`,
        ),
        Z(),
        await xo());
      return;
    }
    if (t.t === `arena-delay`) {
      if (N || !ao(t.delay)) return;
      Y(`Host selected ${t.delay} frames of input delay from the connection test.`);
      return;
    }
    if (t.t === `arena-prepare`) {
      let e = O(z),
        r = await Ka();
      if (!n()) return;
      if (N || j !== `lobby` || !B || e !== O(z) || t.configHash !== r)
        throw Error(`Match preparation did not match your locked selection.`);
      if (ua.matchId() && t.matchId !== ua.matchId())
        throw Error(`This is not the community match you accepted.`);
      await yo(t.matchId);
      return;
    }
    if (t.t === `arena-start`) {
      if (N || t.matchId !== H || !Ni || !Pi)
        throw Error(`Match start arrived before verification.`);
      Co();
      return;
    }
    if (t.t === `arena-end-request`) {
      if (N && t.matchId === ba && (j === `finished` || t.matchId !== H)) return;
      if (!N || t.matchId !== H || ![`lineup`, `playing`].includes(j))
        throw Error(`Unexpected end request.`);
      po();
      return;
    }
    if (t.t === `arena-end`) {
      if (!N && t.matchId === ba && (j === `finished` || t.matchId !== H)) return;
      if (N || t.matchId !== H || ![`lineup`, `playing`].includes(j))
        throw Error(`Unexpected match end.`);
      if (t.reason === `mercy` && !z.mercyEnabled) throw Error(`Unexpected mercy finish.`);
      fo(t, t.reason ?? `ended`);
      return;
    }
    if (t.t === `arena-reset`) {
      if (t.matchId === ba && t.matchId !== H) return;
      if (t.matchId !== H || j !== `finished`) throw Error(`Unexpected match reset.`);
      mo(!1);
      return;
    }
  }
  let r = Mr(e);
  if (r.t === `ping`) {
    X({ t: `pong`, id: r.id, sentAt: r.sentAt });
    return;
  }
  if (r.t === `pong`) {
    let e = zi.get(r.id);
    e !== void 0 &&
      (Ti.recordRtt(performance.now() - e), Ti.recordProbe(!0), zi.delete(r.id), Ao());
    return;
  }
  if (r.t === `hello`) {
    if (j !== `preparing` || (H && r.matchId !== H)) throw Error(`Unexpected emulator handshake.`);
    ((Mi = r), await bo());
    return;
  }
  if (r.t === `ready`) {
    if (!ji || r.matchId !== H || r.configHash !== ji.configHash)
      throw Error(`Opponent readiness mismatch.`);
    ((Pi = !0), await bo());
    return;
  }
  if (j !== `finished` || (r.t !== `input` && r.t !== `checksum`)) {
    if (!I || ![`lineup`, `playing`].includes(j))
      throw Error(`Gameplay packet arrived outside a verified match.`);
    if (r.t === `input`) {
      if (r.mask & ~D(z.platform).mask) throw Error(`Unsupported controller input.`);
      (I.receive(r.frame, r.mask), I.reconcile());
    } else r.t === `checksum` && I.receiveChecksum(r.frame, r.hash);
  }
}
function Ao() {
  let e = Ti.summary();
  (__renderNet(),
    (k(`stat-ping`).textContent = e.rttMs === null ? `—` : e.rttMs.toFixed(0)),
    (k(`stat-jitter`).textContent = e.jitterMs.toFixed(0)),
    j === `lobby` &&
      M === `online` &&
      N &&
      !B &&
      !V &&
      e.samples >= 3 &&
      e.suggestedDelay !== z.delay &&
      (ao(e.suggestedDelay), X({ t: `arena-delay`, delay: z.delay })),
    j === `lobby` &&
      (k(`connection-status`).textContent =
        `Opponent connected · ${e.status.replaceAll(`-`, ` `)}${__routeKind === `relay` ? ` · RELAYED via TURN (extra lag)` : __routeKind === `direct` ? ` · direct connection` : ``}`));
}
function jo(e, t) {
  (Y(e), j === `lobby` && Ha(e), (k(`connection-status`).textContent = t));
}
function Mo(e) {
  if (!e) throw Error(`The browser could not create the player connection.`);
  if (R) {
    e.close();
    return;
  }
  ((R = e),
    (Da = null),
    (ya = {}),
    (Ri = Promise.resolve()),
    (Ti = new Pr()),
    zi.clear(),
    (ki = performance.now()),
    clearTimeout(Di),
    jo(`Connecting both players…`, `Connecting players`),
    (Di = setTimeout(() => {
      if (e === R && !e.open) {
        let t = e.peerConnection,
          n = t ? ` (ICE: ${t.iceConnectionState}; negotiation: ${t.signalingState})` : ``;
        Q(
          Error(
            `The players could not connect within 20 seconds` +
              n +
              `. Try a different network or disable a VPN, then create a new room.`,
          ),
        );
      }
    }, 2e4)),
    e.on(`iceStateChanged`, (t) => {
      e === R &&
        ((e.open && __routeKind) || (k(`stat-transport`).textContent = `WebRTC · ${t}`),
        t === `failed` &&
          Q(
            Error(
              `The network route between players failed. Try another network or disable a VPN, then create a new room.`,
            ),
          ));
    }),
    e.on(`open`, () => {
      e === R &&
        ((ki = performance.now()),
        clearTimeout(Di),
        (Di = null),
        (k(`stat-transport`).textContent = `Checking connection…`),
        __chatOpen(!0),
        (__routeKind = null),
        __renderNet(),
        setTimeout(() => __checkRoute(e), 1500),
        Va(`connected`),
        N && (X(oo()), X({ t: `arena-delay`, delay: z.delay }), Za()),
        ka() && ja(),
        jo(
          N
            ? `Opponent joined. Choose the matchup and your side, then start when the guest is ready.`
            : `Joined. The host controls the matchup; choose READY TO PLAY when you are set.`,
          `Opponent joined · connected`,
        ),
        Z(),
        (Ei = setInterval(() => {
          if (e === R)
            try {
              let e = performance.now();
              if (e - ki > fa) throw Error(`Connection timed out. No result was recorded.`);
              for (let [t, n] of zi) e - n > 5e3 && (zi.delete(t), Ti.recordProbe(!1));
              let t = Oi++;
              (zi.set(t, e), X({ t: `ping`, id: t, sentAt: e }), t % 5 === 4 && __checkRoute(R));
            } catch (e) {
              Q(e);
            }
        }, 1e3)));
    }));
  let t = 0;
  (e.on(`data`, (n) => {
    if (e === R) {
      try {
        (n?.t?.startsWith(`arena-`) ? fi(n) : Mr(n), (ki = performance.now()));
      } catch (e) {
        Q(e);
        return;
      }
      if (n?.t === `ping` || n?.t === `pong`) {
        e === R &&
          ko(n, e).catch((t) => {
            e === R && Q(t);
          });
        return;
      }
      if (t >= 256) {
        Q(
          Error(
            `Player messages arrived faster than the game could process them. Reconnect and copy the connection report.`,
          ),
        );
        return;
      }
      (t++,
        (Ri = Ri.then(() => {
          if (e === R) return ko(n, e);
        })
          .catch((t) => {
            e === R && Q(t);
          })
          .finally(() => {
            t--;
          })));
    }
  }),
    e.on(`close`, () => {
      e === R && ho(`Connection closed. No result was recorded.`, !1, `connection-closed`);
    }),
    e.on(`error`, (t) => {
      e === R && Q(t);
    }));
}
async function No(e = null) {
  (qa(), ho(`Opening a test room…`), (M = `online`), (N = !e), (xi = e ? 1 : z.hostSlot));
  let t = new _n(`king94-${si()}`, { debug: 0, secure: !0, host: `0.peerjs.com`, port: 443 });
  ((L = t),
    jo(`Connecting to the room service…`, `Opening room`),
    Z(),
    (Di = setTimeout(() => {
      L === t &&
        Q(
          Error(
            `The room service did not respond within 15 seconds. Check your connection or VPN and try Host online again.`,
          ),
        );
    }, 15e3)),
    t.on(`open`, (n) => {
      if (L === t) {
        (clearTimeout(Di), (Di = null));
        try {
          if (e) Mo(t.connect(e, { reliable: !0, serialization: `json` }));
          else {
            let e = pi(n),
              t = new URL(`/r/${e}`, location.origin);
            ((k(`room-link`).value = t.href),
              (k(`room-short-code`).textContent = e),
              (aa = e),
              ua
                .roomReady(e)
                .catch(() =>
                  Y(`The community room could not be shared. Return to the locker room and retry.`),
                ),
              (k(`room-share`).hidden = !1),
              jo(
                `Room is ready. Share the mini link or three-character code. Keep this tab open while you wait.`,
                `Room ready · waiting for opponent`,
              ));
          }
          Z();
        } catch (e) {
          L === t && Q(e);
        }
      }
    }),
    t.on(`connection`, (e) => {
      try {
        L === t && N ? Mo(e) : e?.close();
      } catch (e) {
        L === t && Q(e);
      }
    }),
    t.on(`error`, (e) => {
      L === t && Q(e);
    }),
    t.on(`disconnected`, () => {
      L === t && !R?.open && Q(Error(`Signaling disconnected. Create a new room.`));
    }));
}
var Po = (e) => hr.find((t) => t.id === e).name;
function Fo() {}
Fo();
for (let e of [`your-team`, `local-opponent-team`])
  (k(e).replaceChildren(...hr.map((e) => new Option(e.name, e.id))),
    k(e).addEventListener(
      `change`,
      $(() => {
        if (z.platform !== `nhl95` || j !== `lobby` || K || G) return;
        let t = k(e).value;
        if (M === `online` && !N) {
          e === `your-team` && R?.open && X({ t: `arena-team`, platform: `nhl95`, team: t });
          return;
        }
        if (M === `online` && e !== `your-team`) return;
        let n = M === `online` ? xi : $i === `single` ? ea : 0,
          r = e === `your-team` ? n : 1 - n,
          i = [z.homeTeam, z.awayTeam];
        i[r] = t;
        try {
          ci(i, i[0], z.delay, z.hostSlot, `nhl95`);
        } catch (e) {
          (Y(e.message), Z());
          return;
        }
        (io(i, i[0]),
          M === `online` && R?.open && X(oo()),
          Y(`NHL ’95 team selected. Confirm your match when ready.`));
      }),
    ));
for (let e of [`team-a`, `team-b`])
  (k(e).replaceChildren(...hr.map((e) => new Option(e.name, e.id))),
    k(e).addEventListener(
      `change`,
      $(() => {
        if (z.platform === `nhl95` || !Ai) return;
        let e = [k(`team-a`).value, k(`team-b`).value];
        try {
          ci(e, e[0]);
        } catch (e) {
          (Y(e.message), Z());
          return;
        }
        (io(e, e.includes(z.homeTeam) ? z.homeTeam : e[0]),
          M === `online` &&
            (R?.open && X(oo()), Y(`Matchup updated. Waiting for the guest to ready up.`)));
      }),
    ));
for (let e of [`match-type`, `mercy-toggle`])
  k(e).addEventListener(`change`, () => {
    if (da?.tournamentId || j !== `lobby` || K || G || J || (M === `online` && !N)) {
      Z();
      return;
    }
    let t = e === `match-type` ? k(`match-type`).value : z.matchType,
      n = e === `match-type` ? t === `tournament` : k(`mercy-toggle`).checked;
    try {
      (io(z.pair, z.homeTeam, z.hostSlot, z.platform, { matchType: t, mercyEnabled: n }),
        M === `online` && R?.open && X(oo()),
        Y(
          `Mercy ${n ? `on: match stops at a six-goal lead.` : `off: play continues after a six-goal lead.`}`,
        ));
    } catch (e) {
      (Y(e.message), Z());
    }
  });
var Io = !1;
for (let e of [`scanlines-toggle`, `scanlines-in-game`])
  k(e).addEventListener(`click`, () => {
    ((Io = !Io), (k(`scanline-overlay`).hidden = !Io));
    for (let e of [`scanlines-toggle`, `scanlines-in-game`])
      (k(e).setAttribute(`aria-pressed`, String(Io)),
        (k(e).textContent = `Scanlines: ${Io ? `on` : `off`}`));
  });
k(`home-choice`).addEventListener(
  `change`,
  $(() => {
    z.platform !== `nhl95` &&
      (io(z.pair, z.pair[k(`home-choice`).value === `a` ? 0 : 1]),
      M === `online` &&
        (R?.open && X(oo()), Y(`Home team updated. Waiting for the guest to ready up.`)));
  }),
);
function Lo(e) {
  if (M !== `online` || !N || j !== `lobby` || K) return;
  let t = z.platform === `nhl95`,
    n = e !== z.hostSlot,
    r = t && n ? [z.awayTeam, z.homeTeam] : z.pair;
  ((xi = e),
    io(r, t ? r[0] : z.homeTeam, e),
    R?.open && X(oo()),
    Y(
      `You are Player ${e + 1} · ${eo(e)}. ${t ? `Your chosen team stays with you.` : `You still control the full match setup.`}`,
    ));
}
(k(`host-side-0`).addEventListener(
  `click`,
  $(() => Lo(0)),
),
  k(`host-side-1`).addEventListener(
    `click`,
    $(() => Lo(1)),
  ));
async function Ro(e, t = !0, n = () => !0) {
  if ((await Zi.catch(() => {}), !n() || j !== `lobby` || K || G)) return;
  if ((D(e), da?.tournamentId && e !== da.platform))
    throw Error(`This tournament uses a fixed game.`);
  if (!Se(e)) throw Error(`Sega CD is temporarily unavailable. Choose Genesis or SNES.`);
  ((G = !0),
    (q = null),
    (Da = null),
    Oa++,
    (J = !1),
    Ua(),
    Yi++,
    (P = null),
    (Si = null),
    (Ci = null),
    (wi = null),
    (Xi = null),
    (Vi = Hi = Ui = Wi = null));
  let r = e === `nhl95` ? [z.homeTeam, z.awayTeam] : z.pair;
  ((z = ci([...r], r.includes(z.homeTeam) ? z.homeTeam : r[0], z.delay, z.hostSlot, e, z)),
    (B = V = !1),
    bi.held.clear(),
    Fo(),
    Z(),
    t && M === `online` && N && R?.open && X(oo()));
  try {
    ((Zi = vo()), await Zi);
  } catch (e) {
    ((Xi = e.message), (k(`rom-status`).textContent = Xi));
  } finally {
    ((G = !1), Z());
  }
  return !0;
}
(k(`platform-select`).addEventListener(
  `change`,
  $(() => Ro(k(`platform-select`).value)),
),
  k(`game-select`).addEventListener(
    `change`,
    $(() => Ro(k(`game-select`).value === `nhl95` ? `nhl95` : `genesis`)),
  ),
  k(`load-state`).addEventListener(`click`, () => {
    ((k(`state-recovery`).open = !0), k(`load-state-file`).click());
  }),
  k(`load-state-file`).addEventListener(`change`, Pa),
  k(`recover-last-state`).addEventListener(`click`, async () => {
    let e = Sa.get(z.platform);
    if (e)
      try {
        await Na({ native: e.native, metadata: e.metadata });
      } catch (e) {
        Y(`Could not recover state: ` + e.message);
      }
  }),
  k(`clear-loaded-state`).addEventListener(`click`, () => {
    j !== `lobby` ||
      K ||
      B ||
      V ||
      J ||
      ((q = null),
      ja(),
      Z(),
      Y(`Loaded state cleared. Both players can start a fresh match once their selections match.`));
  }),
  k(`practice-mode`).addEventListener(`click`, () => {
    (($i = `single`),
      (ea = 0),
      ho(`Single player: you against the game’s CPU. Choose your side and start.`));
  }));
for (let [e, t] of [
  [`local-single`, `single`],
  [`local-two`, `two`],
])
  k(e).addEventListener(`click`, () => {
    M !== `local` ||
      j !== `lobby` ||
      K ||
      (($i = t),
      Y(
        t === `single`
          ? `Single player: you against the game’s CPU.`
          : `Two players on this computer: player one uses the arrow keys, player two uses I J K L.`,
      ),
      Z());
  });
for (let e of [0, 1])
  k(`human-side-${e}`).addEventListener(`click`, () => {
    M !== `local` || j !== `lobby` || K || ((ea = e), Y(`You play ${eo(e)}.`), Z());
  });
(k(`host-mode`).addEventListener(
  `click`,
  $(() => No()),
),
  k(`join-form`).addEventListener(`submit`, (e) => {
    (e.preventDefault(), $(() => No(mi(k(`room-code`).value)))());
  }));
async function zo(e) {
  let t = e === `code`,
    n = t ? k(`room-short-code`).textContent : k(`room-link`).value;
  if (n)
    try {
      (await navigator.clipboard.writeText(n),
        Y(t ? `Room code copied. Send it to your opponent.` : `Room link copied.`));
    } catch {
      (t || k(`room-link`).select(),
        Y(
          t ? `Room code: ${n}. Select and copy the code above.` : `Select and copy the room link.`,
        ));
    }
}
(k(`copy-room-link`).addEventListener(`click`, () => zo(`link`)),
  k(`copy-room-code`).addEventListener(`click`, () => zo(`code`)),
  k(`start-match`).addEventListener(`click`, $(So)),
  k(`disconnect`).addEventListener(`click`, () => ho()),
  k(`return-select`).addEventListener(
    `click`,
    $(() => {
      if (j === `finished`) {
        mo();
        return;
      }
      if ([`lineup`, `playing`].includes(j)) {
        if (M === `local`) {
          fo(uo());
          return;
        }
        if (N) {
          po();
          return;
        }
        ((ia = !0),
          X({ t: `arena-end-request`, matchId: H }),
          Y(`End requested. Waiting for the host to stop both games together.`),
          Z());
      }
    }),
  ));
for (let e of [`save-stats`, `save-stats-in-game`]) k(e).addEventListener(`click`, Ra);
for (let e of [`export-nhl94online`, `export-nhl94online-in-game`])
  k(e).addEventListener(`click`, Ba);
(k(`nhl94online-coach-form`).addEventListener(`submit`, (e) => {
  e.preventDefault();
  try {
    let e = wa.set(z.platform, k(`nhl94online-coach-url`).value);
    ((k(`nhl94online-coach-url`).value = e.url),
      (k(`nhl94online-link-status`).textContent = e.url
        ? e.persisted
          ? `Coach-page link saved on this device.`
          : `Coach-page link kept for this visit; browser storage is unavailable.`
        : `Saved coach-page link cleared. NHL94Online will open its home page.`),
      za());
  } catch (e) {
    k(`nhl94online-link-status`).textContent = e.message;
  }
}),
  k(`pause-match`).addEventListener(
    `click`,
    $(async () => {
      if (j === `playing`) {
        if (M === `online`) {
          ((Bi = z.platform === `snes` ? 4 : 2),
            bi.held.clear(),
            k(`game-canvas`).focus(),
            Y(`START sent to the game. Use it to pause, resume, or leave the stats screen.`));
          return;
        }
        ((W = !W),
          bi.held.clear(),
          W
            ? (A.suspend(), Ha(`Local test paused.`))
            : (await A.unlock(), Ha(``, !1), (Ii = null), (Li = 0)),
          Z());
      }
    }),
  ));
function Bo() {
  (bi.held.clear(),
    (Bi = 0),
    M === `local` &&
      [`lineup`, `playing`].includes(j) &&
      !ga &&
      ((ga = { generation: U, matchId: H, wasPaused: W }), (W = !0), A.suspend()),
    (k(`controller-session-note`).textContent =
      M === `online` && [`lineup`, `playing`, `preparing`].includes(j)
        ? `Your game inputs are held neutral while you map. Online play continues for both players. Agree on an in-game pause with your opponent first.`
        : ga
          ? `Your local game is paused while you map. Close this panel to return.`
          : `Change buttons here at any time. No restart needed.`));
}
function Vo() {
  (bi.held.clear(),
    (Ii = null),
    (Li = 0),
    ga && ga.generation === U && ga.matchId === H && ((W = ga.wasPaused), W || A.unlock()),
    (ga = null),
    [`lineup`, `playing`].includes(j) && k(`game-canvas`).focus(),
    Z());
}
(document.addEventListener(`king94-controller-open`, Bo),
  document.addEventListener(`king94-controller-close`, Vo));
function Ho() {
  (bi.held.clear(),
    (Bi = 0),
    M === `local` &&
      [`lineup`, `playing`].includes(j) &&
      !_a &&
      ((_a = { generation: U, matchId: H, wasPaused: W }), (W = !0), A.suspend()),
    (k(`help-session-note`).textContent =
      M === `online` && [`lineup`, `playing`, `preparing`].includes(j)
        ? `Online play keeps running while Help is open. Your controls are held neutral. Agree on an in-game pause with your opponent before reading.`
        : _a
          ? `Your local game is paused while Help is open. Choose Done to return.`
          : `Choose a topic below. You can return to Help at any time.`));
}
function Uo() {
  (bi.held.clear(),
    (Ii = null),
    (Li = 0),
    _a && _a.generation === U && _a.matchId === H && ((W = _a.wasPaused), W || A.unlock()),
    (_a = null),
    Z());
}
(document.addEventListener(`king94-help-open`, Ho),
  document.addEventListener(`king94-help-close`, Uo),
  k(`enable-sound`).addEventListener(`click`, async () => {
    let e = k(`enable-sound`);
    e.disabled = !0;
    let t = await A.unlock();
    ((e.textContent = t ? `Sound enabled` : `Retry sound`),
      (e.disabled = !1),
      Y(
        t
          ? `Game sound is enabled.`
          : `Sound is unavailable right now. The game can still run; try enabling sound again.`,
      ),
      W && A.suspend());
  }),
  k(`copy-connection-report`).addEventListener(`click`, async () => {
    let e = R?.open ? Va(`player-request`) : va;
    if (!e) {
      Y(`Open an online room to collect connection details.`);
      return;
    }
    let t;
    try {
      await Promise.race([
        xa.get(e) || Promise.resolve(),
        new Promise((e) => {
          t = setTimeout(e, 750);
        }),
      ]);
    } finally {
      clearTimeout(t);
    }
    let n = k(`connection-report`);
    ((n.hidden = !1), (n.textContent = JSON.stringify(e, null, 2)));
    try {
      (await navigator.clipboard.writeText(n.textContent),
        Y(`Connection report copied. Share it with the site team when reporting a problem.`));
    } catch {
      Y(`Select and copy the connection report below.`);
    }
  }),
  document.addEventListener(`visibilitychange`, () => {
    if ((document.hidden || Ya(), document.hidden && [`lineup`, `playing`].includes(j))) {
      if (M === `online`) {
        if (ma !== null) return;
        ((ma = performance.now()), bi.held.clear(), (Ii = null), (Li = 0), A.suspend());
        let e = R;
        (Y(`Return to the game within 30 seconds to keep this match connected.`),
          (ha = setTimeout(() => {
            R === e &&
              ma !== null &&
              ho(
                `The game tab was away for over 30 seconds. Reconnect to play again.`,
                !0,
                `hidden-timeout`,
              );
          }, pa)));
      } else W || k(`pause-match`).click();
    }
    if (!document.hidden && ma !== null) {
      let e = performance.now() - ma;
      if ((clearTimeout(ha), (ha = null), (ma = null), e >= pa)) {
        ho(
          `The game tab was away for over 30 seconds. Reconnect to play again.`,
          !0,
          `hidden-timeout`,
        );
        return;
      }
      (bi.held.clear(),
        (Ii = null),
        (Li = 0),
        A.unlock(),
        Y(`Back in the game. Waiting for both players to catch up.`));
    }
  }),
  document.addEventListener(`click`, (e) => {
    [`lineup`, `playing`].includes(j) &&
      !k(`controller-dialog`).open &&
      !e.target.closest?.(`.arena-tools,button,a,input,select,textarea,summary`) &&
      k(`game-canvas`).focus();
  }),
  k(`schedule-tournament`).addEventListener(`click`, () => {
    let e = xr(Array.from({ length: 100 }, (e, t) => `Player ${String(t + 1).padStart(3, `0`)}`)),
      t = k(`tournament-results`);
    ((t.hidden = !1),
      (t.textContent =
        `PROPOSED ONLINE QUALIFIER · SAMPLE PLAYERS
100 players · 300 games · 6 rounds · 50 games per round
Each player: six unique opponents, three home, three away.
Organizer seeding and connection grouping are still required.

` +
        e.map((e) => `Round ${e.round}  ${e.awayPlayerId} at ${e.homePlayerId}`).join(`
`)));
  }),
  k(`run-simulator`).addEventListener(
    `click`,
    $(async () => {
      let e = k(`run-simulator`),
        t = k(`test-results`);
      ((e.disabled = !0),
        (t.hidden = !1),
        (t.textContent = `Running synthetic synchronization tests…`),
        await new Promise((e) => setTimeout(e, 20)));
      try {
        t.textContent =
          `SYNTHETIC STATE TESTS · NOT NHL GAMEPLAY OR MEASURED INTERNET PLAY

` +
          Br().map(
            (e) =>
              `${e.rttMs} ms RTT · ±${e.jitterMs} ms jitter · ${(e.loss * 100).toFixed(0)}% loss: ${e.converged ? `CONVERGED` : `FAILED`}\n  rollbacks ${e.rollbacks.join(`/`)} · stall ticks ${e.stalls.join(`/`)} · deepest rollback ${Math.max(...e.maxRollback)} frames`,
          ).join(`

`) +
          `

Convergence checks correctness, not smoothness. Real Canada–Europe matches remain required.`;
      } finally {
        e.disabled = !1;
      }
    }),
  ));
var Wo = new URL(location.href).searchParams.get(`j`);
Wo && (k(`room-code`).value = Wo);
for (let e of [`pointerdown`, `keydown`]) addEventListener(e, qa, { once: !0 });
((k(`stat-delay`).textContent = `3`),
  Z(),
  document.documentElement?.setAttribute(`data-arena-ready`, `true`),
  addEventListener(`pagehide`, () => {
    ta && ((ra ||= `page-closed`), co(!0));
  }),
  la.flush().catch(() => {}),
  !Wo && !ua.requested && globalThis.KING94_NO_AUTOHOST !== !0 && $(() => No())(),
  (G = !0),
  (Zi = vo()
    .catch((e) => {
      ((Xi = e?.message || `The ROM could not be loaded.`),
        (k(`rom-status`).textContent = Xi),
        Y(Xi));
    })
    .finally(() => {
      ((G = !1), Z());
    })),
  ua.requested &&
    $(async () => {
      ((da = await ua.load()),
        da &&
          (await Zi,
          da.platform && da.platform !== z.platform && (await Ro(da.platform)),
          da.tournamentId &&
            ((z = ci(z.pair, z.homeTeam, z.delay, z.hostSlot, z.platform, {
              matchType: `tournament`,
              mercyEnabled: !0,
            })),
            Z()),
          da.isHost ? await No() : await No(mi(await ua.waitForRoom()))));
    })());
var __rsOn = !1,
  __rsId = null;
async function __loadRom(bytes) {
  if (G || j !== `lobby`) return;
  let plat = z.platform,
    t = D(plat);
  ((G = !0), (Xi = null), Z());
  try {
    (__roms.set(plat, bytes),
      Wa(`CHECKING GAME`, null, `Checking your game before the puck drops.`),
      await _o(bytes));
    if (z.platform !== plat || !P) return;
    (Ua(), Ha(`Your ROM is ready. Host online or start a local game.`));
  } catch (e) {
    (__roms.delete(plat),
      (P = null),
      (Si = null),
      (Xi = e?.message || `The ROM could not be loaded.`),
      (k(`rom-status`).textContent = Xi),
      Wa(`LOAD INTERRUPTED`, null, Xi + ` Choose a different ROM file.`),
      Y(Xi));
  } finally {
    ((G = !1), Z());
  }
}
k(`rom-file`).addEventListener(`change`, async (e) => {
  let f = e.target.files[0];
  if (!f) return;
  try {
    if (f.size > 8388608) throw Error(`That file does not look like a game ROM.`);
    (__romNames.set(z.platform, f.name), await __loadRom(new Uint8Array(await f.arrayBuffer())));
  } catch (err) {
    ((Xi = err.message), (k(`rom-status`).textContent = Xi), Y(Xi), Z());
  }
  e.target.value = ``;
});
for (let ev of [`pointerdown`, `keydown`]) {
  let h = async () => {
    try {
      (await A.unlock()) &&
        (removeEventListener(`pointerdown`, h, !0), removeEventListener(`keydown`, h, !0));
    } catch {}
  };
  addEventListener(ev, h, !0);
}
globalThis.__arena = Object.freeze({
  get emu() {
    return F;
  },
  get phase() {
    return j;
  },
  get mode() {
    return M;
  },
  get host() {
    return N;
  },
  get connected() {
    return !!R?.open;
  },
  get session() {
    return I;
  },
  get platform() {
    return z.platform;
  },
  get home() {
    return z.homeTeam;
  },
  get away() {
    return z.awayTeam;
  },
  get players() {
    return $a();
  },
  get coreVersion() {
    return Vi?.CORE_VERSION;
  },
  get coreHash() {
    return Ui;
  },
  get held() {
    return __rsOn && __rsId === H;
  },
  hold(e) {
    ((__rsOn = !!e), (__rsId = H));
  },
  send(e) {
    X(e);
  },
  fail(e) {
    Q(e);
  },
  status(e) {
    Y(e);
  },
  loadRom: __loadRom,
  get romName() {
    return __romNames.get(z.platform) || ``;
  },
  snapshot() {
    if (M === `online` && I) {
      let e = I.confirmed;
      if (I.dirty < e) throw Error(`Waiting for confirmed game inputs. Try again in a moment.`);
      if (I.frame !== e) {
        let t = I.states.get(e);
        if (!t) throw Error(`Confirmed game state is unavailable. Try again in a moment.`);
        return t;
      }
    }
    return F.save();
  },
  verify(e) {
    if (!Hi?.verifyMatchSettings) throw Error(`The game is still loading.`);
    let t = F.save();
    try {
      (F.load(e), Hi.verifyMatchSettings(F, ai[z.homeTeam], ai[z.awayTeam], $a()));
    } finally {
      F.load(t);
    }
  },
  afterLoad() {
    (M === `online` && (I = new Tr(F, xi, X, z.delay, z.window, { onConfirmedInput: so })),
      (Ki = Vr()),
      (qi = -1),
      (Ji = -1),
      (Bi = 0),
      (Ii = null),
      (Li = 0),
      (ta = null),
      bi.held.clear());
    try {
      To();
    } catch {}
  },
});
globalThis.__setEmuVolume = (v, m) => A.setVolume(v, m);
globalThis.__getEmuVolume = () => ({ volume: A.volume, muted: A.muted });
k(`chat-send`).addEventListener(`click`, __chatSend);
k(`chat-input`).addEventListener(`keydown`, (e) => {
  e.key === `Enter` && (e.preventDefault(), __chatSend());
});
addEventListener(
  `keydown`,
  (e) => {
    if (e.key !== `Tab` || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) return;
    let box = k(`chat-box`),
      input = k(`chat-input`);
    if (box.hidden || document.querySelector(`dialog[open]`)) return;
    if (document.activeElement === input) {
      (e.preventDefault(), input.blur(), k(`game-canvas`).focus());
    } else if (!/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement?.tagName || ``)) {
      (e.preventDefault(), input.focus());
    }
  },
  !0,
);
k(`chat-input`).addEventListener(`keydown`, (e) => {
  e.key === `Escape` && (e.preventDefault(), e.target.blur(), k(`game-canvas`).focus());
});
