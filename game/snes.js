// SNES adapter. ROM bytes never leave the player’s emulator instance.
import createSNES from './core/snes.mjs';

export const CORE_VERSION = 'snes9x2010-fe690dd-king94-v1';
export const BUTTONS = ['B', 'A', 'R', 'START', 'UP', 'DOWN', 'LEFT', 'RIGHT', '', 'Y', 'X', 'L'];
const RAM_BASE = 0x7E0000;
const WARM_FRAMES = 2;   // Fixed startup convention covered by SNES core acceptance tests.

export async function sha256Hex(bytes) {
  const d = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(d), b => b.toString(16).padStart(2, '0')).join('');
}

export function normalizeROM(bytes) {
  const rom = new Uint8Array(bytes);
  if (rom.length % 1024 === 512) return rom.slice(512);   // drop a 512-byte copier header
  return rom;
}

export class SNES {
  static async create(romBytes, opts = {}) {
    romBytes = normalizeROM(romBytes);
    const M = await createSNES(opts);
    M.FS.writeFile('/rom.sfc', new Uint8Array(romBytes));
    const r = M.ccall('fe_start', 'number', ['string'], ['/rom.sfc']);
    if (r !== 0) throw new Error('The emulator could not load this ROM (' + r + ').');
    M.FS.unlink('/rom.sfc');
    for (let i = 0; i < WARM_FRAMES; i++) M._fe_frame(0, 0);
    const emulator = new SNES(M);
    emulator.romSha256 = await sha256Hex(new Uint8Array(romBytes));
    return emulator;
  }

  constructor(M) {
    this.M = M;
    this.ram = M._fe_ram();
    this.ramSize = M._fe_ram_size();
    if (this.ramSize !== 131072) throw new Error('Expected 128 KiB SNES work RAM.');
    this.frames = 0;
    this.audioRate = M._fe_audio_rate();
    this.fps = M._fe_fps();
    this.rgba = null;
    this.videoDirty = true;
    this.lut = new Uint32Array(65536);       // RGB565 -> canvas RGBA (little endian)
    for (let c = 0; c < 65536; c++) {
      const r = (c >> 11) & 31, g = (c >> 5) & 63, b = c & 31;
      this.lut[c] = 0xFF000000 | (((b << 3) | (b >> 2)) << 16) | (((g << 2) | (g >> 4)) << 8) | ((r << 3) | (r >> 2));
    }
  }

  step(p1 = 0, p2 = 0) {
    if (this.closed) throw new Error('Emulator is closed.');
    this.M._fe_frame(p1, p2); this.frames++; this.videoDirty = true;
  }

  dispose() {
    if (this.closed) return;
    if (this.statePtr) this.M._free(this.statePtr);
    this.M._fe_stop(); this.closed = true;
  }

  save() {
    const M = this.M, size = M._fe_state_size();
    if (this.closed) throw new Error('Emulator is closed.');
    if (!size) throw new Error('This core does not support rollback.');
    if (!this.statePtr) { this.statePtr = M._malloc(size); this.stateSize = size; }
    if (!M._fe_save(this.statePtr, size)) throw new Error('Could not save emulator state.');
    return { bytes: M.HEAPU8.slice(this.statePtr, this.statePtr + size), frame: this.frames };
  }

  load(state) {
    if (this.closed) throw new Error('Emulator is closed.');
    if (!state || !(state.bytes instanceof Uint8Array) || !Number.isSafeInteger(state.frame) || state.frame < 0) throw new Error('Invalid emulator snapshot.');
    if (!this.statePtr) this.save();
    if (state.bytes.length !== this.stateSize) throw new Error('Invalid emulator state size.');
    // GPGX unserialize clears its live framebuffer. Preserve the last rendered
    // picture through rollback and temporary confirmed-score reads, until step().
    this.video();
    this.M.HEAPU8.set(state.bytes, this.statePtr);
    if (!this.M._fe_load(this.statePtr, this.stateSize)) throw new Error('Could not restore emulator state.');
    this.frames = state.frame;
  }

  checksum() {
    let h = 2166136261;
    const ram = this.M.HEAPU8.subarray(this.ram, this.ram + this.ramSize);
    for (const b of ram) h = Math.imul(h ^ b, 16777619) >>> 0;
    return h;
  }

  byte(addr) { return this.M.HEAPU8[this.ram + (addr >= RAM_BASE ? addr - RAM_BASE : addr)]; }
  writeByte(addr, v) { this.M.HEAPU8[this.ram + (addr >= RAM_BASE ? addr - RAM_BASE : addr)] = v & 0xFF; }

  read(addr, type) {
    const b = a => this.byte(a);
    switch (type) {
      case '|u1': return b(addr);
      case '|i1': { const v = b(addr); return v > 127 ? v - 256 : v; }
      case '<u2': return b(addr) | (b(addr + 1) << 8);
      case '<i2': { const v = b(addr) | (b(addr + 1) << 8); return v > 32767 ? v - 65536 : v; }
      case '>u2': return (b(addr) << 8) | b(addr + 1);
      case '>i2': { const v = (b(addr) << 8) | b(addr + 1); return v > 32767 ? v - 65536 : v; }
      case '>u4': return ((b(addr) << 24) | (b(addr + 1) << 16) | (b(addr + 2) << 8) | b(addr + 3)) >>> 0;
      default: throw new Error('RAM type ' + type);
    }
  }

  /** Verified NHL '94 SNES work RAM; see snes-boot.js for setup fields. */
  info() {
    return {period:this.read(0x7E1630,'<u2'),time:this.read(0x7E1632,'<u2'),
      p1_score:this.read(0x7E178E,'<u2'),p2_score:this.read(0x7E1790,'<u2'),
      paused:this.read(0x7E15DA,'<u2') !== 0,
      p1_team:this.read(0x7E1C84,'<u2'),p2_team:this.read(0x7E1C86,'<u2')};
  }

  /** Copy the last frame into ImageData-ready RGBA; returns {data, width, height}. */
  video() {
    if (!this.videoDirty && this.img) return {data:this.img,width:this.videoWidth,height:this.videoHeight};
    const M = this.M, w = M._fe_width(), h = M._fe_height(), pitch = M._fe_pitch() >> 1, src = M._fe_video() >> 1;
    if (!w || !h) return null;
    if (!this.rgba || this.rgba.length !== w * h) { this.rgba = new Uint32Array(w * h); this.img = new Uint8ClampedArray(this.rgba.buffer); }
    const px = M.HEAPU16, lut = this.lut, out = this.rgba;
    for (let y = 0; y < h; y++) {
      const row = src + y * pitch, o = y * w;
      for (let x = 0; x < w; x++) out[o + x] = lut[px[row + x]];
    }
    this.videoWidth=w; this.videoHeight=h; this.videoDirty=false;
    return { data: this.img, width: w, height: h };
  }

  /** This frame's sound: interleaved stereo int16 (a view; copy before the next step). */
  audio() {
    const n = this.M._fe_audio_frames();
    return this.M.HEAP16.subarray(this.M._fe_audio() >> 1, (this.M._fe_audio() >> 1) + n * 2);
  }
}

export { SNES as Genesis };
