// Write audio/manifest.json from tools/audio_src.json, listing only clips that exist on disk.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { akey } from '../js/akey.js';

const src = JSON.parse(readFileSync(new URL('./audio_src.json', import.meta.url)));
const dir = new URL('../audio/', import.meta.url);
const voice = {}, missing = [];
for (const e of src) {
  if (existsSync(new URL(e.file, dir))) voice[akey(e.text)] = e.file;
  else missing.push(e);
}
const music = {};
const mdir = new URL('../audio/music/', import.meta.url);
if (existsSync(mdir)) for (const f of readdirSync(mdir)) if (/\.(mp3|m4a)$/.test(f)) music[f.replace(/\.\w+$/, '')] = 'music/' + f;
writeFileSync(new URL('manifest.json', dir), JSON.stringify({ voice, music }));
console.log(`manifest: ${Object.keys(voice).length} voice clips, ${Object.keys(music).length} music; missing ${missing.length}`);
if (missing.length) console.log('missing groups:', [...new Set(missing.map(m => m.group))].join(','));
