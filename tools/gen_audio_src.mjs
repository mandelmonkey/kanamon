// Build the list of every spoken clip: node tools/gen_audio_src.mjs > tools/audio_src.json
// Each entry: { file, text, voice: 'f'|'m', group }. Already-generated files are skipped by the generator.
import { ROWS, YOON, RARE } from '../js/data/kana.js';
import { KANAMON } from '../js/data/kanamon.js';
import { VOCAB } from '../js/data/vocab.js';
import { SENTENCES } from '../js/data/sentences.js';
import { LINES } from '../js/data/lines.js';
import { akey, afile } from '../js/akey.js';

const out = [], seen = new Set();
function add(text, group, voice = 'f') {
  const k = akey(text);
  if (!k || seen.has(k)) return;
  seen.add(k);
  out.push({ file: afile(text), text, voice, group });
}
for (const r of ROWS) for (const k of r.kana) if (k && !RARE.has(k)) add(k, 'kana');
for (const [k] of YOON) add(k, 'kana');
for (const m of KANAMON) add(m.word, 'word');
for (const v of VOCAB) add(v.word, 'word');
for (const m of KANAMON) add(m.name, 'name');
for (const m of KANAMON) add(m.atk, 'atk');
for (const s of SENTENCES) add(s.ja, 'sent');
for (const l of Object.values(LINES)) add(l.ja, 'line');
for (const m of KANAMON) add(m.d.ja, 'desc');

// Dialogue lines are appended by the maps module once it exists.
try {
  const { allDialogue } = await import('../js/data/maps.js');
  for (const d of allDialogue()) add(d.ja, 'dlg', d.voice || 'f');
} catch (e) { if (e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }

process.stdout.write(JSON.stringify(out, null, 1));
const by = {};
for (const e of out) by[e.group] = (by[e.group] || 0) + 1;
console.error('clips:', out.length, by);
