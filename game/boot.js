// Canonical menu path adapted from Happy Jay tools/make_states.py at ed7c2719.
// No AI lineup injection: both human players begin with the original default lines.
// The UI hides all these frames; the ROM itself is not altered or redistributed.

export const BOOT_VERSION = 3;
export const MENU = ['Anaheim', 'Boston', 'Buffalo', 'Calgary', 'Chicago', 'Dallas', 'Detroit', 'Edmonton', 'Florida',
  'Hartford', 'Los Angeles', 'Montreal', 'New Jersey', 'NY Islanders', 'NY Rangers', 'Ottawa', 'Philadelphia',
  'Pittsburgh', 'Quebec', 'San Jose', 'St. Louis', 'Tampa Bay', 'Toronto', 'Vancouver', 'Washington', 'Winnipeg',
  'All Stars East', 'All Stars West'];
// The ROM's own "Players" setting: 1 One - Home, 2 One - Visitor, 3 Two - Teammates, 4 Two - Head to Head.
// In the one-player modes the game's built-in CPU plays the other team and controller 1 plays the human side.
// `presses` is how many RIGHT presses move the setting from its default (One - Home).
export const PLAYER_MODES = Object.freeze({
  single_home: { presses: 0, ram: 1, label: 'One - Home' },
  single_away: { presses: 1, ram: 2, label: 'One - Visitor' },
  two: { presses: 3, ram: 4, label: 'Two - Head to Head' },
});
function playerMode(players) {
  const mode = PLAYER_MODES[players];
  if (!mode) throw new Error('Unknown player mode: ' + players);
  return mode;
}
export const MATCH_SETTINGS = Object.freeze({ players: 2, periodMinutes: 5, goalies: 'manual', penalties: 'on-except-offsides', lineChanges: 'off' });
const INDEX = { B: 0, A: 1, MODE: 2, START: 3, UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7, C: 8, Y: 9, X: 10, Z: 11 };
const DEFAULT_HOME = MENU.indexOf('Montreal'), DEFAULT_AWAY = MENU.indexOf('Los Angeles');
const BOOT = 'wait 400, START 3, wait 200, START 3, wait 200, START 3, wait 200';
const R = 'RIGHT 4, wait 25', L = 'LEFT 4, wait 25', D = 'DOWN 4, wait 25';
function moves(target, def) {
  if (!MENU.includes(target)) throw new Error('Unknown team: ' + target);
  const n = (MENU.indexOf(target) - def + MENU.length) % MENU.length;
  return n <= MENU.length / 2 ? Array(n).fill(R) : Array(MENU.length - n).fill(L);
}
export function menuScript(home, away, players = 'two') {
  return [lineupMenuScript(home,away,players),'START 3, wait 240'].join(', ');
}
export function lineupMenuScript(home, away, players = 'two') {
  return [BOOT, D, ...Array(playerMode(players).presses).fill(R), D, ...moves(home, DEFAULT_HOME), D, ...moves(away, DEFAULT_AWAY),
    D, L, D, D, D, R, R, 'START 3, wait 240', 'START 3, wait 240'].join(', ');
}
export function masks(script) {
  const out = [];
  for (const part of script.split(',').map(p => p.trim()).filter(Boolean)) {
    const i = part.lastIndexOf(' '), name = part.slice(0, i), frames = Number(part.slice(i + 1));
    if (!Number.isSafeInteger(frames) || frames < 1 || frames > 10000) throw new Error('Invalid menu step');
    const m = [0, 0];
    for (const b of name === 'wait' ? [] : name.split('+')) {
      const two = b.startsWith('2:'), button = two ? b.slice(2) : b;
      if (!(button in INDEX)) throw new Error('Unknown button: ' + button);
      m[two ? 1 : 0] |= 1 << INDEX[button];
    }
    for (let k = 0; k < frames; k++) out.push(k < frames - 1 || frames === 1 ? [...m] : [0, 0]);
  }
  return out;
}
export function sequence(home, away, players = 'two') {
  return { frames: [[0, 0], ...masks(menuScript(home, away, players))], writes: {}, settings: MATCH_SETTINGS, version: BOOT_VERSION };
}
export function lineupSequence(home, away, players = 'two') {
  return { frames: [[0, 0], ...masks(lineupMenuScript(home, away, players))], writes: {}, settings: MATCH_SETTINGS, version: BOOT_VERSION };
}
// Addresses established through isolated menu toggles on the supported ROM and
// visually checked against its rendered setup screen. Values persist into play.
export const SETTINGS_RAM = Object.freeze({playMode:0xffd048,players:0xffd04a,home:0xffd04c,away:0xffd04e,
  periodLength:0xffd050,goalies:0xffd052,userRecords:0xffd054,penalties:0xffd056,lineChanges:0xffd058});
export function verifyMatchSettings(emu, home, away, players = 'two') {
  const expected={playMode:0,players:playerMode(players).ram,home:MENU.indexOf(home),away:MENU.indexOf(away),
    periodLength:0,goalies:0,userRecords:1,penalties:2,lineChanges:1};
  const actual=Object.fromEntries(Object.entries(SETTINGS_RAM).map(([key,address])=>[key,emu.read(address,'>u2')]));
  for(const key of Object.keys(expected)) {
    if(expected[key]<0 || actual[key]!==expected[key]) throw new Error('Locked game setting mismatch: '+key);
  }
  return actual;
}
/** Run the menus invisibly, then verify the ROM, settings words and opening state.
 * This verifies local startup; it is not remote-client attestation or cheat prevention.
 */
async function runBoot(emu,boot,onProgress,yieldEvery) {
  if (!Number.isSafeInteger(yieldEvery) || yieldEvery < 1) throw new Error('Invalid boot batch size');
  for (let i = 0; i < boot.frames.length; i++) {
    emu.step(...boot.frames[i]);
    if ((i + 1) % yieldEvery === 0) {
      onProgress((i + 1) / boot.frames.length);
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
  onProgress(1);
}
/** Stop at the NHL '94 pre-game Start Game menu so both humans can edit their lines. */
export async function bootLineup(emu, home, away, { onProgress = () => {}, yieldEvery = 120, players = 'two' } = {}) {
  const boot=lineupSequence(home,away,players);
  await runBoot(emu,boot,onProgress,yieldEvery);
  const settingsRAM=verifyMatchSettings(emu,home,away,players),info=emu.info();
  if(info.p1_score!==0||info.p2_score!==0)throw new Error('Lineup menu startup could not be verified.');
  return {home,away,players,settings:MATCH_SETTINGS,settingsVerified:true,settingsRAM,lineupMenuReady:true,
    bootstrap:'scripted-lineup-menu-ram-verified',bootVersion:BOOT_VERSION,frames:boot.frames.length,info};
}
export async function bootMatch(emu, home, away, { onProgress = () => {}, yieldEvery = 120, players = 'two' } = {}) {
  const boot=sequence(home,away,players);
  await runBoot(emu,boot,onProgress,yieldEvery);
  const settingsRAM = verifyMatchSettings(emu,home,away,players);
  const info = emu.info();
  const plausibleFaceoff = info.period === 0 && (info.time & 0xffff) > 0 && (info.time & 0xffff) <= 300
    && info.p1_score === 0 && info.p2_score === 0 && Math.abs(info.g1_y) > 100 && Math.abs(info.g2_y) > 100;
  if (!plausibleFaceoff) throw new Error('Game startup could not be verified. This ROM/core boot requires validation before play.');
  return { home, away, settings: MATCH_SETTINGS, settingsVerified: true, settingsRAM, faceoffSanityCheck: true,
    bootstrap: 'scripted-ram-verified', bootVersion: BOOT_VERSION, frames: boot.frames.length, info };
}
