// Write audio/manifest.json from tools/audio_src.json, listing only clips that exist on disk.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
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

// img/manifest.json: every painted image that shipped → a short content hash. js/art/painted.js uses it to
// know what to prefer, and puts the hash in the URL so a repainted image isn't served from an old cache.
const idir = new URL('../img/', import.meta.url);
const walk = (u, pre = '') => readdirSync(u, { withFileTypes: true }).flatMap(d => d.isDirectory() ? walk(new URL(d.name + '/', u), pre + d.name + '/') : [pre + d.name]);
if (existsSync(idir)) {
  const imgs = Object.fromEntries(walk(idir).filter(f => f.endsWith('.webp')).sort()
    .map(f => [f, createHash('sha1').update(readFileSync(new URL(f, idir))).digest('hex').slice(0, 8)]));
  writeFileSync(new URL('manifest.json', idir), JSON.stringify(imgs));
  console.log(`painted: ${Object.keys(imgs).length} images`);
}
console.log(`manifest: ${Object.keys(voice).length} voice clips, ${Object.keys(music).length} music; missing ${missing.length}`);
if (missing.length) console.log('missing groups:', [...new Set(missing.map(m => m.group))].join(','));
