// Validate creature SVGs: node tools/check_art.mjs [ids...]
// Renders every creature (or the given ids) and checks the SVG is well-formed XML via python.
import { KANAMON } from '../js/data/kanamon.js';
import { ART, monSvg } from '../js/art/creatures.js';
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const want = process.argv.slice(2);
const list = KANAMON.filter(m => !want.length || want.includes(m.id));
const dir = mkdtempSync(join(tmpdir(), 'kart-'));
const files = [];
for (const m of list) {
  if (!ART[m.id]) { console.log(`MISSING ${m.id}`); continue; }
  for (const shiny of [false, true]) {
    const f = join(dir, `${m.id}${shiny ? '_s' : ''}.svg`);
    writeFileSync(f, monSvg(m.id, { shiny }));
    files.push(f);
  }
}
const py = `import sys, xml.etree.ElementTree as ET
bad = 0
for f in sys.argv[1:]:
    try: ET.parse(f)
    except Exception as e: bad += 1; print('BAD', f.rsplit('/',1)[-1], e)
print('checked', len(sys.argv)-1, 'svgs,', bad, 'bad')`;
console.log(execFileSync('python3', ['-c', py, ...files]).toString());
