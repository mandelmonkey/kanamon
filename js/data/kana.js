// Hiragana tables, romaji, and look-alike groups used for distractors.

export const ROWS = [
  { id: 'a',  kana: ['あ','い','う','え','お'], romaji: ['a','i','u','e','o'] },
  { id: 'ka', kana: ['か','き','く','け','こ'], romaji: ['ka','ki','ku','ke','ko'] },
  { id: 'sa', kana: ['さ','し','す','せ','そ'], romaji: ['sa','shi','su','se','so'] },
  { id: 'ta', kana: ['た','ち','つ','て','と'], romaji: ['ta','chi','tsu','te','to'] },
  { id: 'na', kana: ['な','に','ぬ','ね','の'], romaji: ['na','ni','nu','ne','no'] },
  { id: 'ha', kana: ['は','ひ','ふ','へ','ほ'], romaji: ['ha','hi','fu','he','ho'] },
  { id: 'ma', kana: ['ま','み','む','め','も'], romaji: ['ma','mi','mu','me','mo'] },
  { id: 'ya', kana: ['や','','ゆ','','よ'],     romaji: ['ya','','yu','','yo'] },
  { id: 'ra', kana: ['ら','り','る','れ','ろ'], romaji: ['ra','ri','ru','re','ro'] },
  { id: 'wa', kana: ['わ','','','','を'],       romaji: ['wa','','','','wo'] },
  { id: 'n',  kana: ['ん','','','',''],         romaji: ['n','','','',''] },
  // dakuten / handakuten
  { id: 'ga', kana: ['が','ぎ','ぐ','げ','ご'], romaji: ['ga','gi','gu','ge','go'], dakuten: true },
  { id: 'za', kana: ['ざ','じ','ず','ぜ','ぞ'], romaji: ['za','ji','zu','ze','zo'], dakuten: true },
  { id: 'da', kana: ['だ','ぢ','づ','で','ど'], romaji: ['da','ji','zu','de','do'], dakuten: true },
  { id: 'ba', kana: ['ば','び','ぶ','べ','ぼ'], romaji: ['ba','bi','bu','be','bo'], dakuten: true },
  { id: 'pa', kana: ['ぱ','ぴ','ぷ','ぺ','ぽ'], romaji: ['pa','pi','pu','pe','po'], dakuten: true },
];

// Combination sounds (yōon) — taught last.
export const YOON = [
  ['きゃ','kya'],['きゅ','kyu'],['きょ','kyo'],
  ['しゃ','sha'],['しゅ','shu'],['しょ','sho'],
  ['ちゃ','cha'],['ちゅ','chu'],['ちょ','cho'],
  ['にゃ','nya'],['にゅ','nyu'],['にょ','nyo'],
  ['ひゃ','hya'],['ひゅ','hyu'],['ひょ','hyo'],
  ['みゃ','mya'],['みゅ','myu'],['みょ','myo'],
  ['りゃ','rya'],['りゅ','ryu'],['りょ','ryo'],
  ['ぎゃ','gya'],['ぎゅ','gyu'],['ぎょ','gyo'],
  ['じゃ','ja'],['じゅ','ju'],['じょ','jo'],
  ['びゃ','bya'],['びゅ','byu'],['びょ','byo'],
  ['ぴゃ','pya'],['ぴゅ','pyu'],['ぴょ','pyo'],
];

export const ROMAJI = {};
for (const r of ROWS) r.kana.forEach((k, i) => { if (k) ROMAJI[k] = r.romaji[i]; });
for (const [k, r] of YOON) ROMAJI[k] = r;
// ぢ/づ are rare; keep them out of quizzes.
export const RARE = new Set(['ぢ','づ','を']);

export const ROW_OF = {};
for (const r of ROWS) for (const k of r.kana) if (k) ROW_OF[k] = r.id;
for (const [k] of YOON) ROW_OF[k] = 'yoon';

export const ALL_BASIC = ROWS.filter(r => !r.dakuten).flatMap(r => r.kana.filter(Boolean));
export const ALL_DAKUTEN = ROWS.filter(r => r.dakuten).flatMap(r => r.kana.filter(Boolean));
export const ALL_YOON = YOON.map(y => y[0]);

// Kana that children commonly mix up. Used to make distractors harder as mastery grows.
const LOOKALIKE_GROUPS = [
  ['あ','お','め','ぬ'], ['い','り','こ','に'], ['う','つ','ら','ろ'], ['さ','ち','き','そ'],
  ['ね','れ','わ'], ['る','ろ','そ'], ['は','ほ','け','ま'], ['め','ぬ','の','あ'],
  ['く','へ','し','つ'], ['た','な','に','こ'], ['ま','も','よ','ほ'], ['す','む','お','あ'],
  ['か','や','せ','ち'], ['て','そ','と'], ['ゆ','よ','れ'], ['ん','そ','え','ろ'],
  ['き','さ','ち','ま'], ['ふ','ぶ','ぷ','か'], ['ひ','び','ぴ','い'],
  ['が','か','ぎ','き'], ['ざ','さ','じ','し'], ['だ','た','で','て'], ['ば','は','ぱ','ほ'],
  ['しゃ','しゅ','しょ','ちゃ'], ['きゃ','きゅ','きょ','ぎゃ'], ['ちゃ','ちゅ','ちょ','しゃ'],
];
export const LOOKALIKES = {};
for (const g of LOOKALIKE_GROUPS) for (const k of g) {
  LOOKALIKES[k] = [...new Set([...(LOOKALIKES[k] || []), ...g.filter(x => x !== k)])];
}

// Split a hiragana word into the tiles a child would tap: small ゃゅょ join the
// previous kana, everything else (including small っ and long vowels) stands alone.
export function splitKana(word) {
  const out = [];
  for (const ch of word) {
    if ('ゃゅょ'.includes(ch) && out.length) out[out.length - 1] += ch;
    else if (ch !== ' ') out.push(ch);
  }
  return out;
}

// Romaji for a whole word (used for small hints only).
export function toRomaji(word) {
  let s = '';
  const tiles = splitKana(word);
  for (let i = 0; i < tiles.length; i++) {
    const t = tiles[i];
    if (t === 'っ') { const nx = ROMAJI[tiles[i + 1]] || ''; s += nx[0] || ''; continue; }
    if (t === 'ー') { s += s.slice(-1); continue; }
    s += ROMAJI[t] ?? t;
  }
  return s;
}

// Lesson units: which kana rows each region teaches.
export const UNITS = [
  { id: 1, rows: ['a', 'ka'] },
  { id: 2, rows: ['sa', 'ta'] },
  { id: 3, rows: ['na', 'ha'] },
  { id: 4, rows: ['ma', 'ya', 'ra', 'wa', 'n'] },
  { id: 5, rows: ['ga', 'za', 'da', 'ba', 'pa'] },
  { id: 6, rows: ['yoon'] },
];

export function kanaForUnit(unitId) {
  const u = UNITS.find(x => x.id === unitId);
  if (!u) return [];
  if (u.rows.includes('yoon')) return [...ALL_YOON];
  return u.rows.flatMap(id => ROWS.find(r => r.id === id).kana.filter(k => k && !RARE.has(k)));
}
