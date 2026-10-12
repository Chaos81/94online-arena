// Verified on the supported original NHL '94 SNES ROM. The setup is driven by
// controller inputs; no ROM patches, roster injection or shipped states.
export const BOOT_VERSION = 1;
export const MENU = [
  "Anaheim",
  "Boston",
  "Buffalo",
  "Calgary",
  "Chicago",
  "Dallas",
  "Detroit",
  "Edmonton",
  "Florida",
  "Hartford",
  "Los Angeles",
  "Montreal",
  "New Jersey",
  "NY Islanders",
  "NY Rangers",
  "Ottawa",
  "Philadelphia",
  "Pittsburgh",
  "Quebec",
  "San Jose",
  "St. Louis",
  "Tampa Bay",
  "Toronto",
  "Vancouver",
  "Washington",
  "Winnipeg",
  "All Stars East",
  "All Stars West",
];
export const MATCH_SETTINGS = Object.freeze({
  players: 2,
  periodMinutes: 5,
  goalies: "manual",
  penalties: "on-except-offsides",
  lineChanges: "off",
});
export const PLAYER_MODES = Object.freeze({
  two: { p1: 1, p2: 2 },
  single_home: { p1: 1, p2: 0 },
  single_away: { p1: 2, p2: 0 },
});
export const SETTINGS_RAM = Object.freeze({
  playMode: 0x7e34bc,
  home: 0x7e34be,
  away: 0x7e34c0,
  periodLength: 0x7e34c2,
  penalties: 0x7e34c4,
  lineChanges: 0x7e34c6,
  goalies: 0x7e34c8,
  p1: 0x7e1c84,
  p2: 0x7e1c86,
});
const INDEX = { B: 0, A: 1, R: 2, START: 3, UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7, Y: 9, X: 10, L: 11 };
const press = (name) => name + " 4, wait 120";
const D = press("DOWN"),
  L = press("LEFT"),
  R = press("RIGHT");
function mode(players) {
  if (!Object.hasOwn(PLAYER_MODES, players)) throw new Error("Unknown player mode: " + players);
  return PLAYER_MODES[players];
}
function moves(team, initial) {
  if (!MENU.includes(team)) throw new Error("Unknown team: " + team);
  const n = (MENU.indexOf(team) - initial + MENU.length) % MENU.length;
  return n <= 14 ? Array(n).fill(R) : Array(28 - n).fill(L);
}
export function lineupMenuScript(home, away, players = "two") {
  mode(players);
  const controller =
    players === "two"
      ? press("2:LEFT")
      : players === "single_away"
        ? [press("LEFT"), press("LEFT")].join(", ")
        : "";
  return [
    "wait 400",
    press("START"),
    "wait 1000",
    press("START"),
    "wait 200",
    D,
    ...moves(home, 11),
    D,
    ...moves(away, 10),
    D,
    L,
    D,
    R,
    R,
    D,
    D,
    R,
    press("START"),
    "wait 300",
    controller,
    press("START"),
    "wait 600",
    press("START"),
    "wait 300",
  ]
    .filter(Boolean)
    .join(", ");
}
export function menuScript(home, away, players = "two") {
  return lineupMenuScript(home, away, players) + ", START 4, wait 40";
}
export function masks(script) {
  const out = [];
  for (const part of script
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)) {
    const i = part.lastIndexOf(" "),
      name = part.slice(0, i),
      frames = Number(part.slice(i + 1));
    if (!Number.isSafeInteger(frames) || frames < 1 || frames > 10000)
      throw new Error("Invalid menu step");
    const m = [0, 0];
    for (const b of name === "wait" ? [] : name.split("+")) {
      const two = b.startsWith("2:"),
        button = two ? b.slice(2) : b;
      if (!(button in INDEX)) throw new Error("Unknown button: " + button);
      m[two ? 1 : 0] |= 1 << INDEX[button];
    }
    for (let k = 0; k < frames; k++) out.push([...m]);
  }
  return out;
}
export function lineupSequence(home, away, players = "two") {
  return {
    frames: masks(lineupMenuScript(home, away, players)),
    writes: {},
    settings: MATCH_SETTINGS,
    version: BOOT_VERSION,
  };
}
export function sequence(home, away, players = "two") {
  return {
    frames: masks(menuScript(home, away, players)),
    writes: {},
    settings: MATCH_SETTINGS,
    version: BOOT_VERSION,
  };
}
export function verifyMatchSettings(emu, home, away, players = "two") {
  const expected = {
    playMode: 0,
    home: MENU.indexOf(home),
    away: MENU.indexOf(away),
    periodLength: 0,
    penalties: 2,
    lineChanges: 0,
    goalies: 1,
    ...mode(players),
  };
  const actual = Object.fromEntries(
    Object.entries(SETTINGS_RAM).map(([key, address]) => [key, emu.read(address, "<u2")]),
  );
  for (const key of Object.keys(expected))
    if (expected[key] < 0 || actual[key] !== expected[key])
      throw new Error("Locked SNES game setting mismatch: " + key);
  return actual;
}
export function isGameplayReady(emu, i = emu.info()) {
  return !i.paused && i.time > 0 && i.time <= 300 && i.period <= 3;
}
async function run(emu, boot, onProgress, yieldEvery) {
  if (!Number.isSafeInteger(yieldEvery) || yieldEvery < 1)
    throw new Error("Invalid boot batch size");
  for (let i = 0; i < boot.frames.length; i++) {
    emu.step(...boot.frames[i]);
    if ((i + 1) % yieldEvery === 0) {
      onProgress((i + 1) / boot.frames.length);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  onProgress(1);
}
export async function bootLineup(
  emu,
  home,
  away,
  { onProgress = () => {}, yieldEvery = 120, players = "two" } = {},
) {
  const boot = lineupSequence(home, away, players);
  await run(emu, boot, onProgress, yieldEvery);
  const settingsRAM = verifyMatchSettings(emu, home, away, players),
    info = emu.info();
  if (
    !info.paused ||
    info.time !== 300 ||
    info.period !== 0 ||
    info.p1_score !== 0 ||
    info.p2_score !== 0
  )
    throw new Error("SNES lineup menu startup could not be verified.");
  return {
    home,
    away,
    players,
    settings: MATCH_SETTINGS,
    settingsVerified: true,
    settingsRAM,
    lineupMenuReady: true,
    bootstrap: "snes-scripted-lineup-menu-ram-verified",
    bootVersion: BOOT_VERSION,
    frames: boot.frames.length,
    info,
  };
}
export async function bootMatch(
  emu,
  home,
  away,
  { onProgress = () => {}, yieldEvery = 120, players = "two" } = {},
) {
  const boot = sequence(home, away, players);
  await run(emu, boot, onProgress, yieldEvery);
  const settingsRAM = verifyMatchSettings(emu, home, away, players),
    info = emu.info();
  if (!isGameplayReady(emu) || info.period !== 0 || info.p1_score !== 0 || info.p2_score !== 0)
    throw new Error("SNES faceoff startup could not be verified.");
  return {
    home,
    away,
    players,
    settings: MATCH_SETTINGS,
    settingsVerified: true,
    settingsRAM,
    faceoffSanityCheck: true,
    bootstrap: "snes-scripted-ram-verified",
    bootVersion: BOOT_VERSION,
    frames: boot.frames.length,
    info,
  };
}
