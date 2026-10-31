// Game state, persistence (localStorage) and backup/restore helpers.
import { MON, power } from './data/kanamon.js';

const KEY = 'kanamon.save.v1';
const SAVE_VERSION = 1;

export const S = { state: null };

export function newState() {
  return {
    v: SAVE_VERSION,
    name: '',
    created: Date.now(),
    lastSaved: 0,
    playMs: 0,
    map: 'sakura', x: 9, y: 9, dir: 'down',
    heal: { map: 'sakura', x: 9, y: 9 },
    party: [],
    box: [],
    dex: {},           // id -> { seen, caught, shiny }
    items: { onigiri: 3, ami: 0, kusuri: 1, ame: 0 },
    seeds: {},         // seed id -> count
    coins: 200,
    badges: [],        // master ids
    flags: {},         // story flags, picked treasures, beaten trainers
    srs: {},           // learning items -> { b, due, n, c, last }
    daily: { date: '', missions: [], claimedAll: false, stamps: {}, streak: 0, lastDay: '', houses: {}, rare: null },
    garden: [null, null, null],
    eggs: [],          // { id, steps, need }
    tower: { best: 0 },
    stats: { correct: 0, wrong: 0, battles: 0, caught: 0, steps: 0, days: 0, fastest: 0 },
    log: [],           // recent day summaries for the parent page
    settings: { english: true, romaji: true, music: 0.5, voice: 1, sfx: 0.7, dpad: false },
  };
}

export const st = () => S.state;

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { S.state = migrate(JSON.parse(raw)); return true; }
  } catch (e) { console.warn('load failed', e); }
  S.state = newState();
  return false;
}

function migrate(s) {
  const base = newState();
  // shallow-fill any keys added in later versions
  for (const k of Object.keys(base)) if (s[k] === undefined) s[k] = base[k];
  for (const k of Object.keys(base.settings)) if (s.settings[k] === undefined) s.settings[k] = base.settings[k];
  for (const k of Object.keys(base.daily)) if (s.daily[k] === undefined) s.daily[k] = base.daily[k];
  for (const k of Object.keys(base.stats)) if (s.stats[k] === undefined) s.stats[k] = base.stats[k];
  s.v = SAVE_VERSION;
  return s;
}

let saveTimer = 0;
export function save(now = false) {
  if (!S.state || !S.state.name) return;
  clearTimeout(saveTimer);
  const doSave = () => {
    S.state.lastSaved = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(S.state)); } catch (e) { console.warn('save failed', e); }
  };
  if (now) doSave(); else saveTimer = setTimeout(doSave, 400);
}

export function hasSave() {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}

export function wipe() {
  try { localStorage.removeItem(KEY); } catch {}
  S.state = newState();
}

// ── backup ────────────────────────────────────────────────
export function exportJson() {
  return JSON.stringify({ app: 'kanamon', exported: new Date().toISOString(), save: S.state });
}

export function importJson(text) {
  const data = JSON.parse(text);
  const s = data.save || data;
  if (!s || !Array.isArray(s.party) || typeof s.dex !== 'object') throw new Error('not a kanamon save');
  S.state = migrate(s);
  save(true);
}

// Compact "save code" (gzip + base64) for pasting into email/messages.
export async function exportCode() {
  const bytes = new TextEncoder().encode(JSON.stringify(S.state));
  if (typeof CompressionStream === 'undefined') return 'KM0' + b64(bytes);
  const cs = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'));
  const buf = new Uint8Array(await new Response(cs).arrayBuffer());
  return 'KM1' + b64(buf);
}

export async function importCode(code) {
  code = code.replace(/\s+/g, '');
  const tag = code.slice(0, 3), body = unb64(code.slice(3));
  let text;
  if (tag === 'KM1') {
    const ds = new Blob([body]).stream().pipeThrough(new DecompressionStream('gzip'));
    text = await new Response(ds).text();
  } else if (tag === 'KM0') text = new TextDecoder().decode(body);
  else throw new Error('bad code');
  importJson(text);
}

function b64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function unb64(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ── creatures ─────────────────────────────────────────────
let uidc = 0;
export function makeMon(id, lv, shiny = false) {
  const m = { uid: Date.now().toString(36) + (uidc++).toString(36) + Math.floor(Math.random() * 1e4).toString(36), id, lv, xp: 0, shiny, caught: Date.now() };
  m.hp = maxHp(m);
  return m;
}
export const maxHp = (m) => Math.floor((18 + m.lv * 4) * power(m.id));
export const atkOf = (m) => (6 + m.lv * 1.5) * power(m.id);
export const needXp = (lv) => Math.floor(10 + lv * 8 + lv * lv * 1.2);
export const monName = (m) => m.nick || MON[m.id].name;

export function healAll() {
  for (const m of st().party) m.hp = maxHp(m);
}

export function addMon(m) {
  const s = st();
  if (s.party.length < 6) s.party.push(m); else s.box.push(m);
  const d = s.dex[m.id] || (s.dex[m.id] = { seen: true, caught: 0 });
  d.seen = true; d.caught++;
  if (m.shiny) d.shiny = true;
  s.stats.caught++;
}

export function seeMon(id) {
  const s = st();
  if (!s.dex[id]) s.dex[id] = { seen: true, caught: 0 };
}

export const caughtCount = () => Object.values(st().dex).filter(d => d.caught > 0).length;
export const leadMon = () => st().party.find(m => m.hp > 0) || st().party[0];
export const unit = () => Math.min(6, (st()?.badges.length || 0) + 1);

export function today(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
