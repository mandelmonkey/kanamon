// Regenerate sw.js with the full precache list: node tools/build_sw.mjs
import { readdirSync, statSync, writeFileSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const walk = (d) => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const rel = (p) => relative(root, p);
const core = ['index.html', 'manifest.webmanifest', ...walk(join(root, 'css')), ...walk(join(root, 'js')), ...walk(join(root, 'icons'))].map(p => typeof p === 'string' && p.startsWith('/') ? rel(p) : p);
const audio = walk(join(root, 'audio')).map(rel).filter(f => /\.(mp3|json)$/.test(f));
// painted images ride along with the audio: fetched in the background after install, cache-first
// (as the hashed URLs painted.js asks for, from img/manifest.json)
let img = [];
try {
  const m = JSON.parse(readFileSync(join(root, 'img/manifest.json'), 'utf8'));
  img = ['img/manifest.json', ...Object.entries(m).map(([f, v]) => `img/${f}?v=${v}`)];
} catch { /* no painted art yet */ }
audio.push(...img);
const h = createHash('sha1');
for (const f of [...core, ...audio]) h.update(f + statSync(join(root, f.split('?')[0])).mtimeMs);
const version = h.digest('hex').slice(0, 10);
const tpl = readFileSync(join(root, 'tools/sw.template.js'), 'utf8');
writeFileSync(join(root, 'sw.js'), tpl.replace('__VERSION__', version).replace('__CORE__', JSON.stringify(['./', ...core])).replace('__AUDIO__', JSON.stringify(audio)));
console.log(`sw.js v${version}: ${core.length} core files, ${audio.length - img.length} audio + ${img.length} image files`);
