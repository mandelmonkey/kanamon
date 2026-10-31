// Learning engine: spaced repetition (Leitner boxes) + question generation.
// Items: k:<kana>  m:<creature id>  v:<vocab id>  s:<sentence id>
import { ROMAJI, LOOKALIKES, kanaForUnit, splitKana, ALL_BASIC, toRomaji } from './data/kana.js';
import { KANAMON, MON } from './data/kanamon.js';
import { VOCAB, VOC } from './data/vocab.js';
import { SENTENCES, SEN, PARTICLES, SITUATIONS } from './data/sentences.js';
import { st, unit } from './state.js';

const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR;
const INTERVALS = [0, 1 * MIN, 5 * MIN, 30 * MIN, 4 * HOUR, DAY, 3 * DAY, 7 * DAY, 14 * DAY];
export const MASTERED = 5;

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (a) => a[rnd(a.length)];
export function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export const rec = (key) => st().srs[key] || { b: 0, due: 0, n: 0, c: 0, last: 0 };

export function record(key, correct, ms = 5000) {
  const s = st(), r = { ...rec(key) }, now = Date.now();
  r.n++; r.last = now;
  if (correct) {
    r.c++;
    r.b = Math.min(INTERVALS.length - 1, r.b + (ms < 2500 && r.b >= 1 ? 2 : 1));
    r.due = now + INTERVALS[r.b];
  } else {
    r.b = Math.floor(r.b / 2);
    r.due = now + 20e3;
  }
  s.srs[key] = r;
  s.stats[correct ? 'correct' : 'wrong']++;
  return r;
}

export function level(key) {
  const r = st().srs[key];
  if (!r || !r.n) return 0;         // unseen
  if (r.b >= MASTERED) return 3;    // mastered
  if (r.b >= 3) return 2;           // getting there
  return 1;                         // started
}

// ── what the child can be asked about right now ─────────────
export function wordPic(item) {
  // item: creature or vocab entry → picture spec
  if (item.pic !== undefined) return item.pic;
  return item.emoji ? item.emoji : { mon: item.id };
}

function unlockedKana(u = unit()) {
  const out = [];
  for (let i = 1; i <= u; i++) out.push(...kanaForUnit(i));
  return out;
}

function pool(ctx) {
  const u = ctx.unit || unit();
  const items = [];
  for (const k of unlockedKana(u)) items.push({ key: 'k:' + k, type: 'kana', kana: k, unit: unitOfKana(k) });
  const dex = st().dex;
  for (const m of KANAMON) {
    if (dex[m.id]?.caught || ctx.enemyId === m.id) items.push({ key: 'm:' + m.id, type: 'word', item: m, unit: 1 });
  }
  for (const v of VOCAB) if (v.unit <= u) items.push({ key: 'v:' + v.id, type: 'word', item: v, unit: v.unit });
  for (const s of SENTENCES) if (s.unit <= u) items.push({ key: 's:' + s.id, type: 'sent', sen: s, unit: s.unit });
  return items;
}

const kanaUnitCache = {};
function unitOfKana(k) {
  if (kanaUnitCache[k]) return kanaUnitCache[k];
  for (let i = 1; i <= 6; i++) if (kanaForUnit(i).includes(k)) return (kanaUnitCache[k] = i);
  return 6;
}

const recent = [];
function remember(key) { recent.unshift(key); recent.length = Math.min(recent.length, 6); }

// ctx: { mode: 'wild'|'trainer'|'master'|'practice', enemyId, unit, focusUnit, only: [keys], types: [...] }
export function nextQuestion(ctx = {}) {
  const now = Date.now();
  let items = pool(ctx);
  if (ctx.only) items = items.filter(i => ctx.only.includes(i.key));
  if (ctx.types) items = items.filter(i => ctx.types.includes(i.type));
  if (!items.length) items = pool({}).filter(i => i.type === 'kana');

  // choose a type first so kana / words / sentences stay balanced
  const u = ctx.unit || unit();
  const mix = u === 1 ? { kana: 6, word: 3, sent: 1 } : u === 2 ? { kana: 4.5, word: 3.5, sent: 2 } : { kana: 3.5, word: 3.5, sent: 3 };
  const types = Object.keys(mix).filter(t => items.some(i => i.type === t));
  let type = types[0], roll = Math.random() * types.reduce((a, t) => a + mix[t], 0);
  for (const t of types) { roll -= mix[t]; if (roll <= 0) { type = t; break; } }

  const enemy = ctx.enemyId && MON[ctx.enemyId];
  const struggling = items.filter(i => { const r = st().srs[i.key]; return r && r.n && r.b <= 1; }).length;
  const cands = items.filter(i => i.type === type);
  const weights = cands.map(i => {
    const r = st().srs[i.key];
    let w = 1;
    if (!r || !r.n) w *= struggling > 8 ? 0.15 : 1.4;
    else {
      if (now >= r.due) w *= 6;
      w *= 1 + (4 - Math.min(r.b, 4)) * 0.6;
      if (r.b >= MASTERED && now < r.due) w *= 0.25;
    }
    if (enemy) {
      if (i.key === 'm:' + enemy.id) w *= 8;
      if (i.type === 'kana' && splitKana(enemy.word).includes(i.kana)) w *= 5;
    }
    if (ctx.focusUnit && i.unit === ctx.focusUnit) w *= 5;
    if (recent.includes(i.key)) w *= 0.03;
    return w;
  });
  let total = weights.reduce((a, b) => a + b, 0), x = Math.random() * total, chosen = cands[0];
  for (let i = 0; i < cands.length; i++) { x -= weights[i]; if (x <= 0) { chosen = cands[i]; break; } }
  remember(chosen.key);
  return build(chosen, ctx);
}

// ── question builders ─────────────────────────────────────
function build(it, ctx) {
  const r = rec(it.key), romajiOn = st().settings.romaji;
  if (it.type === 'kana') {
    const opts = [];
    if (r.b >= 2 && romajiOn) opts.push('read');
    if (r.b >= 3) opts.push('first');
    opts.push('listen', 'listen');
    const f = pick(opts);
    if (f === 'first') { const q = qKanaFirst(it, r); if (q) return q; }
    if (f === 'read') return qKanaRead(it, r);
    return qKanaListen(it, r);
  }
  if (it.type === 'word') {
    const v = it.item;
    if (v.cat === 'greet' && r.b >= 1 && Math.random() < 0.5) { const q = qSituation(it); if (q) return q; }
    // abstract words have no clear picture: ask for the meaning instead
    if (SYMBOLIC.has(v.cat)) return r.b >= 3 && Math.random() < 0.5 ? qMeaningToWord(it) : qWordMeaning(it, r.b === 0);
    if (r.b === 0) return qWordPic(it, true);
    if (r.b <= 2) return Math.random() < 0.5 ? qWordPic(it, false) : qListenPic(it);
    if (r.b >= 4 && splitKana(v.word).length <= 4 && ctx.mode !== 'master' && Math.random() < 0.35) return qSpell(it);
    return Math.random() < 0.6 ? qPicWord(it) : qWordPic(it, false);
  }
  const s = it.sen;
  if (r.b <= 1 || s.blank < 0) return r.b >= 3 && s.tokens.length >= 3 ? qBuild(it) : qMeaning(it);
  if (r.b <= 3) return qParticle(it);
  return Math.random() < 0.5 ? qBuild(it) : qParticle(it);
}

function kanaDistractors(k, n, hard) {
  const unlocked = unlockedKana(Math.max(unit(), 2));
  const set = new Set();
  if (hard) for (const x of shuffle(LOOKALIKES[k] || [])) if (x !== k && ROMAJI[x]) set.add(x);
  for (const x of shuffle(unlocked)) { if (set.size >= n * 2) break; if (x !== k) set.add(x); }
  for (const x of shuffle(ALL_BASIC)) { if (set.size >= n * 2) break; if (x !== k) set.add(x); }
  // never two options with the same sound (じ/ぢ etc.)
  const out = [];
  for (const x of set) if (ROMAJI[x] !== ROMAJI[k] && !out.some(o => ROMAJI[o] === ROMAJI[x])) out.push(x);
  return out.slice(0, n);
}

function qKanaListen(it, r) {
  const k = it.kana;
  const opts = shuffle([k, ...kanaDistractors(k, 3, r.b >= 2)]);
  return {
    key: it.key, kind: 'choice', layout: 'kana',
    // beginners see the kana to match; after that they must find it by sound alone
    prompt: { ja: r.b >= 1 ? '「？」は どれ？' : `「${k}」は どれ？`, en: `Which one is "${ROMAJI[k]}"?`, audio: [k], listen: r.b >= 1 },
    options: opts.map(x => ({ label: x, value: x })), answer: k,
    explain: { ja: k, audio: [k] },
  };
}

function qKanaRead(it, r) {
  const k = it.kana;
  const ds = kanaDistractors(k, 3, true);
  const opts = shuffle([k, ...ds]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: 'よみかたは？', en: 'How do you read it?', big: k, audio: [] },
    options: opts.map(x => ({ label: ROMAJI[x], value: x })), answer: k,
    explain: { ja: k, audio: [k] },
  };
}

function wordsWithFirst(k) {
  const all = [...KANAMON.filter(m => st().dex[m.id]?.caught), ...VOCAB.filter(v => v.unit <= unit() && typeof v.pic === 'string' && !SYMBOLIC.has(v.cat))];
  return all.filter(w => splitKana(w.word)[0] === k && splitKana(w.word).length >= 2);
}

function qKanaFirst(it, r) {
  const k = it.kana, cands = wordsWithFirst(k);
  if (!cands.length) return null;
  const w = pick(cands), tiles = splitKana(w.word);
  const opts = shuffle([k, ...kanaDistractors(k, 3, r.b >= 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'kana',
    prompt: { ja: 'さいしょの おとは？', en: `What's the first sound of "${w.en}"?`, pic: wordPic(w), big: '＿' + tiles.slice(1).join(''), audio: [] },
    options: opts.map(x => ({ label: x, value: x })), answer: k,
    explain: { ja: w.word, audio: [w.word] },
  };
}

const SYMBOLIC = new Set(['pron', 'adj', 'verb', 'time', 'day', 'greet']);

function meaningDistractors(w, n) {
  const pool = shuffle(VOCAB.filter(x => x.word !== w.word && x.en !== w.en && (x.cat === w.cat || SYMBOLIC.has(x.cat))));
  pool.sort((a, b) => (b.cat === w.cat) - (a.cat === w.cat));
  return pool.slice(0, n);
}

function qWordMeaning(it, withAudio) {
  const w = it.item, opts = shuffle([w, ...meaningDistractors(w, 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: `「${w.word}」って なに？`, en: 'What does it mean?', big: w.word, audio: withAudio ? [w.word] : [] },
    options: opts.map(x => ({ label: x.en, value: x.word, pic: typeof x.pic === 'string' ? x.pic : null })), answer: w.word,
    explain: { ja: `${w.word} = ${w.en}`, audio: [w.word] },
  };
}

function qMeaningToWord(it) {
  const w = it.item, opts = shuffle([w, ...meaningDistractors(w, 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: 'にほんごで なんて いう？', en: `How do you say "${w.en}"?`, pic: typeof w.pic === 'string' ? w.pic : null, audio: [] },
    options: opts.map(x => ({ label: x.word, value: x.word })), answer: w.word,
    explain: { ja: `${w.word} = ${w.en}`, audio: [w.word] },
  };
}

function wordDistractors(w, n) {
  const all = [...KANAMON.filter(m => m.id !== 'n'), ...VOCAB.filter(v => !SYMBOLIC.has(v.cat))];
  const picKey = (x) => JSON.stringify(wordPic(x));
  const mine = picKey(w);
  const same = shuffle(all.filter(x => x.cat === w.cat && x.word !== w.word && picKey(x) !== mine));
  const any = shuffle(all.filter(x => x.word !== w.word && picKey(x) !== mine));
  const out = [], seenPic = new Set([mine]), seenWord = new Set([w.word]);
  for (const x of [...same, ...any]) {
    const p = picKey(x);
    if (seenPic.has(p) || seenWord.has(x.word)) continue;
    // pictures of a colour / number only make sense against others of the same kind
    if ((typeof w.pic === 'object') !== (typeof x.pic === 'object' && x.pic !== null)) continue;
    seenPic.add(p); seenWord.add(x.word); out.push(x);
    if (out.length >= n) break;
  }
  return out;
}

function qWordPic(it, withAudio) {
  const w = it.item, opts = shuffle([w, ...wordDistractors(w, 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'pic',
    prompt: { ja: `「${w.word}」は どれ？`, en: `Which one is "${w.word}"?`, big: w.word, audio: withAudio ? [w.word] : [] },
    options: opts.map(x => ({ pic: wordPic(x), value: x.word, sub: x.en })), answer: w.word,
    explain: { ja: `${w.word} = ${w.en}`, audio: [w.word] },
  };
}

function qListenPic(it) {
  const w = it.item, opts = shuffle([w, ...wordDistractors(w, 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'pic',
    prompt: { ja: 'よく きいてね', en: 'Listen! Which picture is it?', audio: [w.word], listenOnly: true },
    options: opts.map(x => ({ pic: wordPic(x), value: x.word, sub: x.en })), answer: w.word,
    explain: { ja: `${w.word} = ${w.en}`, audio: [w.word] },
  };
}

function qPicWord(it) {
  const w = it.item, opts = shuffle([w, ...wordDistractors(w, 3)]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: 'これは なに？', en: `What is this in Japanese?`, pic: wordPic(w), audio: [] },
    options: opts.map(x => ({ label: x.word, value: x.word })), answer: w.word,
    explain: { ja: `${w.word} = ${w.en}`, audio: [w.word] },
  };
}

function qSituation(it) {
  const w = it.item, sit = SITUATIONS.find(s => s.answer === w.word);
  if (!sit || (sit.unit || 1) > unit()) return null;
  const others = shuffle(SITUATIONS.filter(s => s !== sit && (s.unit || 1) <= unit())).slice(0, 3);
  const opts = shuffle([sit, ...others]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: 'なんて いう？', en: sit.en, pic: sit.pic, audio: [] },
    options: opts.map(s => ({ label: s.answer, value: s.answer })), answer: sit.answer,
    explain: { ja: sit.answer, audio: [sit.answer] },
  };
}

export function spellTiles(word, extra = 3) {
  const tiles = splitKana(word);
  const pool = kanaDistractors(tiles[0], extra + 3, true).filter(x => !tiles.includes(x));
  return { answer: tiles, tiles: shuffle([...tiles, ...pool.slice(0, extra)]) };
}

function qSpell(it) {
  const w = it.item, { answer, tiles } = spellTiles(w.word, 2);
  return {
    key: it.key, kind: 'tiles', layout: 'tiles',
    prompt: { ja: 'なまえを つくろう！', en: `Spell "${w.en}"!`, pic: wordPic(w), audio: [w.word] },
    tiles, answer, explain: { ja: w.word, audio: [w.word] },
  };
}

function qMeaning(it) {
  const s = it.sen;
  const others = shuffle(SENTENCES.filter(x => x.id !== s.id && x.unit <= Math.max(unit(), 2) && x.en !== s.en));
  const opts = shuffle([s, ...others.slice(0, 2)]);
  return {
    key: it.key, kind: 'choice', layout: 'text',
    prompt: { ja: s.ja, en: 'What does it mean?', audio: [s.ja], sentence: true },
    options: opts.map(x => ({ label: x.en, value: x.id, pic: x.pic })), answer: s.id,
    explain: { ja: s.ja, en: s.en, audio: [s.ja] },
  };
}

function qParticle(it) {
  const s = it.sen, ans = s.tokens[s.blank];
  const opts = shuffle([ans, ...shuffle(PARTICLES.filter(p => p !== ans)).slice(0, 3)]);
  const shown = s.tokens.map((t, i) => i === s.blank ? '［ ？ ］' : t).join(' ');
  return {
    key: it.key, kind: 'choice', layout: 'kana',
    prompt: { ja: shown, en: s.en, pic: s.pic, audio: [], sentence: true },
    options: opts.map(x => ({ label: x, value: x })), answer: ans,
    explain: { ja: s.ja, en: s.en, audio: [s.ja] },
  };
}

function qBuild(it) {
  const s = it.sen;
  return {
    key: it.key, kind: 'tiles', layout: 'words',
    prompt: { ja: 'ならべて みよう！', en: s.en, pic: s.pic, audio: [] },
    tiles: shuffle(s.tokens), answer: s.tokens,
    explain: { ja: s.ja, en: s.en, audio: [s.ja] },
  };
}

// Small helpers used by screens.
export function kanaProgress() {
  const out = {};
  for (const k of Object.keys(ROMAJI)) out[k] = level('k:' + k);
  return out;
}

export function learnedCounts() {
  const s = st().srs;
  let kana = 0, words = 0, sentences = 0;
  for (const [k, r] of Object.entries(s)) {
    if (r.b < 3) continue;
    if (k.startsWith('k:')) kana++; else if (k.startsWith('s:')) sentences++; else words++;
  }
  return { kana, words, sentences };
}

export { toRomaji, SEN, VOC, MON };
