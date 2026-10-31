// Canvas drawing for map tiles, buildings and decor. Everything is drawn procedurally and cached
// per tile size so the overworld stays crisp on Retina iPads.

const THEMES = {
  spring:   { grass: '#a9dd7c', grass2: '#97d06a', tuft: '#7dbb55', tall: '#5cb158', tall2: '#3f9a45', path: '#ecd4a0', path2: '#d9bc84', edge: '#c9a86e' },
  forest:   { grass: '#93cc6b', grass2: '#84bf5d', tuft: '#6aa64a', tall: '#4fa04d', tall2: '#357f3a', path: '#e3c993', path2: '#cfb27b', edge: '#b8975e' },
  beach:    { grass: '#b4e08a', grass2: '#a3d477', tuft: '#86bd5f', tall: '#62b45c', tall2: '#459a47', path: '#f0dcae', path2: '#e0c690', edge: '#cdb07a' },
  mountain: { grass: '#b3d58a', grass2: '#a1c877', tuft: '#88b062', tall: '#6aa85a', tall2: '#4e8c45', path: '#dccaa6', path2: '#c8b48e', edge: '#b29c75' },
  snow:     { grass: '#eef5fb', grass2: '#e2edf7', tuft: '#c9d9ea', tall: '#a9c8a0', tall2: '#86ad80', path: '#d9d2c7', path2: '#c5bcae', edge: '#b1a797' },
  night:    { grass: '#8ccf7a', grass2: '#7cc26b', tuft: '#63a955', tall: '#4f9e58', tall2: '#3a8247', path: '#e2d0a6', path2: '#cdb88c', edge: '#b6a074' },
  castle:   { grass: '#a5d97c', grass2: '#94cc6b', tuft: '#7ab656', tall: '#5aae58', tall2: '#3e9444', path: '#ddd8cf', path2: '#c9c2b6', edge: '#b0a898' },
};
export const themeOf = (t) => THEMES[t] || THEMES.spring;

const OUT = '#5a3b2b';
const hash = (x, y, s = 0) => { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect ? c.roundRect(x, y, w, h, r) : c.rect(x, y, w, h); }

const cache = new Map();
function cached(key, w, h, draw) {
  let cv = cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas');
    cv.width = Math.ceil(w); cv.height = Math.ceil(h);
    draw(cv.getContext('2d'));
    cache.set(key, cv);
  }
  return cv;
}
export function clearTileCache() { cache.clear(); }

// ── ground ────────────────────────────────────────────────
function grass(c, s, th, v) {
  c.fillStyle = th.grass;
  c.fillRect(0, 0, s, s);
  c.fillStyle = th.grass2;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(s * hash(i, v * 31 + 1), s * hash(v * 47 + 2, i), s * 0.09, s * 0.05, 0, 0, 7); c.fill(); }
  c.strokeStyle = th.tuft; c.lineWidth = s * 0.035; c.lineCap = 'round';
  const n = v < 0.3 ? 2 : v < 0.7 ? 1 : 0;
  for (let i = 0; i < n; i++) {
    const x = s * (0.2 + hash(i, v * 99) * 0.6), y = s * (0.3 + hash(v * 77, i) * 0.5);
    c.beginPath(); c.moveTo(x - s * 0.06, y - s * 0.07); c.lineTo(x, y); c.lineTo(x + s * 0.06, y - s * 0.08); c.stroke();
  }
}

function flowers(c, s, th, v) {
  grass(c, s, th, 0.9);
  const cols = ['#ffffff', '#ffd1e0', '#fff27a', '#ffb0c8'];
  for (let i = 0; i < 3; i++) {
    const x = s * (0.2 + hash(i, v * 50) * 0.6), y = s * (0.2 + hash(v * 30, i + 4) * 0.6), r = s * 0.06;
    c.fillStyle = cols[Math.floor(hash(i, v * 9) * cols.length)];
    for (let k = 0; k < 5; k++) { const a = k * 1.2566; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, r * 0.75, 0, 7); c.fill(); }
    c.fillStyle = '#ffb627'; c.beginPath(); c.arc(x, y, r * 0.55, 0, 7); c.fill();
  }
}

// Tall grass, with a sway offset for animation frames.
function tallGrass(c, s, th, frame) {
  grass(c, s, th, 0.8);
  const sway = Math.sin(frame * Math.PI / 2) * s * 0.03;
  const blades = (y0, dark) => {
    for (let i = 0; i < 4; i++) {
      const bx = s * (0.12 + i * 0.25), by = y0;
      c.fillStyle = dark ? th.tall2 : th.tall;
      c.beginPath();
      c.moveTo(bx - s * 0.13, by);
      c.quadraticCurveTo(bx - s * 0.06 + sway, by - s * 0.3, bx + sway * 1.6, by - s * 0.42);
      c.quadraticCurveTo(bx + s * 0.02 + sway, by - s * 0.22, bx + s * 0.13, by);
      c.closePath(); c.fill();
    }
  };
  blades(s * 0.62, true);
  blades(s * 1.0, false);
  c.fillStyle = 'rgba(255,255,255,0.25)';
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(s * (0.12 + i * 0.25) + sway * 1.4, s * 0.6, s * 0.025, 0, 7); c.fill(); }
}

// "Blob" surfaces (path/sand/snow/water) with corners rounded where neighbours differ.
function blob(c, s, color, mask, inset = 0) {
  const n = mask & 1, e = mask & 2, so = mask & 4, w = mask & 8;
  const r = s * 0.32;
  c.fillStyle = color;
  c.beginPath();
  const x0 = w ? 0 : inset, y0 = n ? 0 : inset, x1 = e ? s : s - inset, y1 = so ? s : s - inset;
  const tl = !n && !w ? r : 0, tr = !n && !e ? r : 0, br = !so && !e ? r : 0, bl = !so && !w ? r : 0;
  c.moveTo(x0 + tl, y0); c.lineTo(x1 - tr, y0); c.quadraticCurveTo(x1, y0, x1, y0 + tr);
  c.lineTo(x1, y1 - br); c.quadraticCurveTo(x1, y1, x1 - br, y1); c.lineTo(x0 + bl, y1);
  c.quadraticCurveTo(x0, y1, x0, y1 - bl); c.lineTo(x0, y0 + tl); c.quadraticCurveTo(x0, y0, x0 + tl, y0);
  c.fill();
}

function path(c, s, th, mask, v, theme) {
  grass(c, s, th, v);
  blob(c, s, th.edge, mask, s * 0.02);
  blob(c, s, theme === 'castle' ? th.path : th.path, mask, s * 0.07);
  c.fillStyle = th.path2;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(s * (0.2 + hash(i, v * 40) * 0.6), s * (0.2 + hash(v * 20, i) * 0.6), s * 0.04, s * 0.025, 0, 0, 7); c.fill(); }
}

function sand(c, s, th, mask, v) {
  grass(c, s, th, v);
  blob(c, s, '#e9cf92', mask, s * 0.02);
  blob(c, s, '#f6e4b0', mask, s * 0.06);
  c.fillStyle = '#e6cc8f';
  for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(s * hash(i, v * 13), s * hash(v * 17, i), s * 0.018, 0, 7); c.fill(); }
}

function snow(c, s, v) {
  c.fillStyle = v < 0.5 ? '#f3f8fd' : '#eaf2fa'; c.fillRect(0, 0, s, s);
  c.fillStyle = '#dde8f4';
  for (let i = 0; i < 3; i++) { c.beginPath(); c.ellipse(s * hash(i, v * 21), s * hash(v * 11, i), s * 0.07, s * 0.03, 0, 0, 7); c.fill(); }
}

function water(c, s, mask, frame, th) {
  // shore: grass around, then water blob
  c.fillStyle = th.grass; c.fillRect(0, 0, s, s);
  blob(c, s, '#bfe9f7', mask, 0);
  blob(c, s, '#5cbde6', mask, s * 0.06);
  c.strokeStyle = 'rgba(255,255,255,0.65)'; c.lineWidth = s * 0.04; c.lineCap = 'round';
  const o = frame * s * 0.12;
  for (let i = 0; i < 2; i++) {
    const y = s * (0.3 + i * 0.4), x = ((s * (0.15 + i * 0.4) + o) % (s * 0.8)) + s * 0.05;
    c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + s * 0.08, y - s * 0.06, x + s * 0.16, y); c.stroke();
  }
}

function bridge(c, s, nWater, sWater) {
  c.fillStyle = '#5cbde6'; c.fillRect(0, 0, s, s);
  c.fillStyle = '#c98f55'; c.fillRect(0, s * 0.08, s, s * 0.84);
  c.strokeStyle = '#9c6a3a'; c.lineWidth = s * 0.03;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(s * i / 4, s * 0.08); c.lineTo(s * i / 4, s * 0.92); c.stroke(); }
  c.fillStyle = '#8a5a30';
  if (nWater) c.fillRect(0, s * 0.04, s, s * 0.09);
  if (sWater) c.fillRect(0, s * 0.87, s, s * 0.09);
}

function deck(c, s) {
  c.fillStyle = '#5cbde6'; c.fillRect(0, 0, s, s);
  c.fillStyle = '#d29c62'; c.fillRect(s * 0.04, 0, s * 0.92, s);
  c.strokeStyle = '#a7703f'; c.lineWidth = s * 0.03;
  for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(s * 0.04, s * i / 4); c.lineTo(s * 0.96, s * i / 4); c.stroke(); }
}

function stoneFloor(c, s, v) {
  c.fillStyle = '#e7e2d8'; c.fillRect(0, 0, s, s);
  c.strokeStyle = '#cfc7b8'; c.lineWidth = s * 0.03;
  c.strokeRect(s * 0.03, s * 0.03, s * 0.94, s * 0.94);
  c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(s * 0.08, s * 0.08, s * 0.4, s * 0.1);
}

function garden(c, s, th) {
  grass(c, s, th, 0.9);
  c.fillStyle = '#8d5e3a'; rr(c, s * 0.06, s * 0.08, s * 0.88, s * 0.84, s * 0.12); c.fill();
  c.strokeStyle = '#6e4528'; c.lineWidth = s * 0.05;
  for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(s * 0.16, s * (0.28 + i * 0.22)); c.lineTo(s * 0.84, s * (0.28 + i * 0.22)); c.stroke(); }
}

// ── things that stand up (drawn in the object pass, may overhang upward) ──
function shadow(c, cx, cy, rx) {
  c.fillStyle = 'rgba(40,30,20,0.18)'; c.beginPath(); c.ellipse(cx, cy, rx, rx * 0.3, 0, 0, 7); c.fill();
}
function outline(c, w) { c.strokeStyle = OUT; c.lineWidth = w; c.lineJoin = 'round'; c.stroke(); }

function tree(c, s, kind, theme) {
  // canvas is s wide × 1.5s tall; ground row is the bottom s
  const top = s * 0.5, cx = s / 2;
  shadow(c, cx, top + s * 0.86, s * 0.38);
  if (kind === 'P') {
    c.fillStyle = '#7a4a2a'; c.fillRect(cx - s * 0.07, top + s * 0.62, s * 0.14, s * 0.26);
    const snowy = theme === 'snow' || theme === 'mountain';
    const layers = [[0.72, 0.46], [0.42, 0.38], [0.14, 0.28]];
    layers.forEach(([y, w], i) => {
      c.beginPath(); c.moveTo(cx, top + s * (y - 0.42)); c.lineTo(cx + s * w, top + s * y); c.lineTo(cx - s * w, top + s * y); c.closePath();
      c.fillStyle = i === 0 ? '#2f7a4f' : i === 1 ? '#358a58' : '#3f9a63'; c.fill(); outline(c, s * 0.03);
      if (snowy) { c.beginPath(); c.moveTo(cx, top + s * (y - 0.42)); c.lineTo(cx + s * w * 0.45, top + s * (y - 0.2)); c.lineTo(cx - s * w * 0.45, top + s * (y - 0.2)); c.closePath(); c.fillStyle = '#fbfdff'; c.fill(); }
    });
    return;
  }
  c.fillStyle = '#8a5a34'; rr(c, cx - s * 0.08, top + s * 0.5, s * 0.16, s * 0.38, s * 0.04); c.fill(); outline(c, s * 0.03);
  const sak = kind === 'S';
  const base = sak ? '#ffb3cc' : theme === 'forest' ? '#4fa24e' : '#5fb35a';
  const light = sak ? '#ffd6e4' : theme === 'forest' ? '#6dbb5f' : '#7fcb6a';
  const dark = sak ? '#f28fb0' : theme === 'forest' ? '#3a8a40' : '#469a48';
  const blobs = [[0.5, 0.2, 0.36], [0.26, 0.4, 0.26], [0.74, 0.4, 0.26], [0.5, 0.44, 0.3]];
  c.beginPath(); for (const [bx, by, r] of blobs) { c.moveTo(s * bx + s * r, top + s * by - s * 0.1); c.arc(s * bx, top + s * by - s * 0.1, s * r, 0, 7); }
  c.fillStyle = dark; c.fill(); outline(c, s * 0.035);
  c.beginPath(); for (const [bx, by, r] of blobs) { c.moveTo(s * bx + s * r * 0.82, top + s * by - s * 0.14); c.arc(s * bx, top + s * by - s * 0.14, s * r * 0.82, 0, 7); }
  c.fillStyle = base; c.fill();
  c.fillStyle = light; c.beginPath(); c.ellipse(s * 0.4, top - s * 0.02, s * 0.14, s * 0.08, -0.4, 0, 7); c.fill();
  if (sak) {
    c.fillStyle = '#fff0f5';
    for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(s * (0.2 + hash(i, 3) * 0.6), top + s * (-0.15 + hash(5, i) * 0.55), s * 0.03, 0, 7); c.fill(); }
  }
}

function rock(c, s, theme) {
  const top = s * 0.5;
  shadow(c, s / 2, top + s * 0.86, s * 0.38);
  c.beginPath(); c.moveTo(s * 0.12, top + s * 0.82); c.quadraticCurveTo(s * 0.08, top + s * 0.3, s * 0.42, top + s * 0.18);
  c.quadraticCurveTo(s * 0.86, top + s * 0.14, s * 0.9, top + s * 0.62); c.quadraticCurveTo(s * 0.9, top + s * 0.86, s * 0.5, top + s * 0.86); c.closePath();
  c.fillStyle = '#a7a39c'; c.fill(); outline(c, s * 0.035);
  c.fillStyle = '#c9c5be'; c.beginPath(); c.ellipse(s * 0.4, top + s * 0.36, s * 0.16, s * 0.08, -0.3, 0, 7); c.fill();
  if (theme === 'snow') { c.fillStyle = '#fbfdff'; c.beginPath(); c.ellipse(s * 0.48, top + s * 0.22, s * 0.28, s * 0.08, 0, 0, 7); c.fill(); }
}

function bush(c, s) {
  const top = s * 0.5;
  shadow(c, s / 2, top + s * 0.86, s * 0.36);
  c.beginPath(); c.arc(s * 0.32, top + s * 0.58, s * 0.24, 0, 7); c.arc(s * 0.68, top + s * 0.58, s * 0.24, 0, 7); c.arc(s * 0.5, top + s * 0.42, s * 0.26, 0, 7);
  c.fillStyle = '#4ea64f'; c.fill(); outline(c, s * 0.03);
  c.fillStyle = '#6fc061'; c.beginPath(); c.arc(s * 0.44, top + s * 0.36, s * 0.1, 0, 7); c.fill();
}

function lantern(c, s) {
  const top = s * 0.5, cx = s / 2;
  shadow(c, cx, top + s * 0.88, s * 0.26);
  const g = '#b8b2a7';
  const part = (x, y, w, h) => { rr(c, cx - s * w / 2, top + s * y, s * w, s * h, s * 0.03); c.fillStyle = g; c.fill(); outline(c, s * 0.03); };
  part(0, 0.74, 0.5, 0.14); part(0, 0.5, 0.18, 0.26);
  part(0, 0.3, 0.42, 0.22);
  c.fillStyle = '#ffe9a8'; c.fillRect(cx - s * 0.1, top + s * 0.35, s * 0.2, s * 0.12);
  c.beginPath(); c.moveTo(cx - s * 0.36, top + s * 0.32); c.lineTo(cx, top + s * 0.08); c.lineTo(cx + s * 0.36, top + s * 0.32); c.closePath();
  c.fillStyle = '#9d978c'; c.fill(); outline(c, s * 0.03);
}

function cliff(c, s, v, theme, below) {
  c.fillStyle = theme === 'snow' ? '#9aa6b5' : '#a38c74'; c.fillRect(0, 0, s, s);
  c.fillStyle = theme === 'snow' ? '#b9c4d1' : '#bba48a'; c.fillRect(0, 0, s, s * 0.35);
  c.strokeStyle = 'rgba(60,40,30,0.35)'; c.lineWidth = s * 0.03;
  c.beginPath(); c.moveTo(s * (0.2 + v * 0.3), s * 0.4); c.lineTo(s * (0.35 + v * 0.2), s * 0.75); c.stroke();
  if (below) { c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(0, s * 0.85, s, s * 0.15); }
}

function castleWall(c, s) {
  c.fillStyle = '#8e8a83'; c.fillRect(0, 0, s, s);
  c.strokeStyle = '#6f6b64'; c.lineWidth = s * 0.03;
  for (let r = 0; r < 3; r++) {
    const y = s * r / 3; c.strokeRect((r % 2) * -s * 0.25, y, s * 0.5, s / 3); c.strokeRect((r % 2) * -s * 0.25 + s * 0.5, y, s * 0.5, s / 3);
  }
  c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, s, s * 0.14);
}

function fence(c, s, th) {
  grass(c, s, th, 0.9);
  c.fillStyle = '#c4935e';
  c.fillRect(0, s * 0.42, s, s * 0.1); c.fillRect(0, s * 0.62, s, s * 0.1);
  for (const x of [0.2, 0.8]) { rr(c, s * x - s * 0.06, s * 0.28, s * 0.12, s * 0.56, s * 0.03); c.fill(); }
}

function flowerBed(c, s, th) {
  grass(c, s, th, 0.9);
  c.fillStyle = '#8d5e3a'; rr(c, s * 0.04, s * 0.2, s * 0.92, s * 0.72, s * 0.1); c.fill();
  const cols = ['#ff6b8b', '#ffd23e', '#ffffff', '#b38bff'];
  for (let i = 0; i < 6; i++) {
    c.fillStyle = '#4c9a40'; c.fillRect(s * (0.14 + (i % 3) * 0.3), s * (0.36 + Math.floor(i / 3) * 0.28), s * 0.04, s * 0.14);
    c.fillStyle = cols[i % 4]; c.beginPath(); c.arc(s * (0.16 + (i % 3) * 0.3), s * (0.34 + Math.floor(i / 3) * 0.28), s * 0.08, 0, 7); c.fill();
  }
}

// ── public tile API ───────────────────────────────────────
// Returns { ground: canvas (s×s), tall?: canvas (s×1.5s) } for one map cell.
export function tileImages(map, x, y, s, frame) {
  const ch = map.tiles[y][x], th = themeOf(map.theme), v = hash(x, y);
  const at = (xx, yy) => (map.tiles[yy] || '')[xx];
  const same = (set) => (at(x, y - 1) && set.includes(at(x, y - 1)) ? 1 : 0) | (at(x + 1, y) && set.includes(at(x + 1, y)) ? 2 : 0) |
    (at(x, y + 1) && set.includes(at(x, y + 1)) ? 4 : 0) | (at(x - 1, y) && set.includes(at(x - 1, y)) ? 8 : 0);
  const vk = Math.floor(v * 4);
  const T = map.theme;
  const base = () => T === 'snow' ? cached(`snow${vk}|${s}`, s, s, c => snow(c, s, vk / 4)) : cached(`g${T}${vk}|${s}`, s, s, c => grass(c, s, th, vk / 4));
  switch (ch) {
    case ',': return { ground: cached(`f${T}${vk}|${s}`, s, s, c => flowers(c, s, th, vk / 4)) };
    case '"': return { ground: cached(`t${T}${frame}|${s}`, s, s, c => tallGrass(c, s, th, frame)) };
    case ':': { const m = same(':=wc'); return { ground: cached(`p${T}${m}${vk}|${s}`, s, s, c => path(c, s, th, m, vk / 4, T)) }; }
    case '_': { const m = same('_:w~'); return { ground: cached(`s${T}${m}${vk}|${s}`, s, s, c => sand(c, s, th, m, vk / 4)) }; }
    case '*': return { ground: cached(`snow${vk}|${s}`, s, s, c => snow(c, s, vk / 4)) };
    case '~': { const m = same('~=w'); return { ground: cached(`w${T}${m}${frame}|${s}`, s, s, c => water(c, s, m, frame, th)) }; }
    case '=': { const n = at(x, y - 1) === '~', so = at(x, y + 1) === '~'; return { ground: cached(`b${n}${so}|${s}`, s, s, c => bridge(c, s, n, so)) }; }
    case 'w': return { ground: cached(`deck|${s}`, s, s, c => deck(c, s)) };
    case 'c': return { ground: cached(`stone${vk}|${s}`, s, s, c => stoneFloor(c, s, vk)) };
    case 'g': return { ground: cached(`garden${T}|${s}`, s, s, c => garden(c, s, th)) };
    case '#': { const b = at(x, y + 1) && at(x, y + 1) !== '#'; return { ground: cached(`cliff${T}${vk}${b}|${s}`, s, s, c => cliff(c, s, vk / 4, T, b)) }; }
    case 'C': return { ground: cached(`cwall|${s}`, s, s, c => castleWall(c, s)) };
    case '|': return { ground: cached(`fence${T}|${s}`, s, s, c => fence(c, s, th)) };
    case 'f': return { ground: cached(`fbed${T}|${s}`, s, s, c => flowerBed(c, s, th)) };
    case 'T': case 'S': case 'P':
      return { ground: base(), tall: cached(`tree${ch}${T}|${s}`, s, s * 1.5, c => tree(c, s, ch, T)) };
    case 'R': return { ground: base(), tall: cached(`rock${T}|${s}`, s, s * 1.5, c => rock(c, s, T)) };
    case 'o': return { ground: base(), tall: cached(`bush|${s}`, s, s * 1.5, c => bush(c, s)) };
    case 'l': return { ground: base(), tall: cached(`lantern|${s}`, s, s * 1.5, c => lantern(c, s)) };
    default: return { ground: base() };
  }
}

// ── buildings ─────────────────────────────────────────────
const ROOFS = {
  home: ['#b5523b', '#8f3d2b'], house: ['#4f7fa3', '#3b6280'], lab: ['#5d8fd6', '#4570b0'], shop: ['#3f8fe0', '#2f6fb3'],
  hospital: ['#ff7a9c', '#d95c7c'], dojo: ['#4a4a5a', '#33333f'], station: ['#3aa17e', '#2c7d61'], onsen: ['#7a5a9e', '#5e4580'],
  observatory: ['#5b4a9e', '#45387a'], castle: ['#3c8a6e', '#2c6b55'], tower: ['#a33b3b', '#7d2c2c'],
};
const HOUSE_ROOFS = [['#4f7fa3', '#3b6280'], ['#c0573d', '#99432f'], ['#6b8e4e', '#55733d'], ['#8b6bb1', '#6e5490'], ['#d19a3b', '#a8792b']];
const SIGNS = { shop: 'みせ', hospital: 'びょういん', dojo: 'どうじょう', station: 'えき', onsen: '♨ おんせん', lab: 'けんきゅうじょ', tower: 'かなの とう', observatory: 'てんもんだい' };

// Returns a canvas (w*s × (h+1.2)*s) — the building overhangs upward by 1.2 tiles.
export function buildingImage(b, s) {
  const [w, h] = b.size;
  const key = `bld:${b.kind}:${b.id || ''}:${b.label?.ja || ''}:${s}`;
  return cached(key, w * s, (h + 1.2) * s, c => drawBuilding(c, b, s, w, h));
}

function drawBuilding(c, b, s, w, h) {
  const W = w * s, top = 1.2 * s, H = h * s;
  const font = (px) => `800 ${px}px "M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Hiragino Sans",sans-serif`;
  let [roof, roofDark] = ROOFS[b.kind] || ROOFS.house;
  if (b.kind === 'house') [roof, roofDark] = HOUSE_ROOFS[Math.floor(hash((b.id || '').length, b.x * 7 + b.y) * HOUSE_ROOFS.length)];
  shadow(c, W / 2, top + H - s * 0.05, W * 0.48);

  if (b.kind === 'castle') return drawCastle(c, s, W, H, top, font);
  if (b.kind === 'tower') return drawTower(c, s, W, H, top, font);

  // walls
  const wallTop = top + H * 0.28;
  rr(c, s * 0.15, wallTop, W - s * 0.3, top + H - wallTop - s * 0.06, s * 0.08);
  c.fillStyle = b.kind === 'dojo' ? '#d9b98a' : b.kind === 'observatory' ? '#e8e4f5' : '#fbf3e4'; c.fill(); outline(c, s * 0.05);
  // timber frame
  c.strokeStyle = '#7a4f2e'; c.lineWidth = s * 0.07;
  c.beginPath(); c.moveTo(s * 0.18, wallTop + s * 0.18); c.lineTo(W - s * 0.18, wallTop + s * 0.18); c.stroke();
  for (let i = 1; i < w; i++) { c.beginPath(); c.moveTo(i * s, wallTop + s * 0.18); c.lineTo(i * s, top + H - s * 0.1); c.stroke(); }
  // windows (shoji lattice)
  const doorX = Math.floor(w / 2) * s;
  for (let i = 0; i < w; i++) {
    if (i * s === doorX) continue;
    const wx = i * s + s * 0.22, wy = wallTop + s * 0.38, ww = s * 0.56, wh = s * 0.46;
    c.fillStyle = '#fffbe8'; rr(c, wx, wy, ww, wh, s * 0.04); c.fill(); outline(c, s * 0.035);
    c.strokeStyle = '#b08a60'; c.lineWidth = s * 0.025;
    c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
  }
  // door + noren curtain
  const dx = doorX + s * 0.14, dw = s * 0.72, dy = top + H - s * 0.92, dh = s * 0.86;
  c.fillStyle = '#8a5a34'; rr(c, dx, dy, dw, dh, s * 0.05); c.fill(); outline(c, s * 0.04);
  c.fillStyle = '#5a3820'; c.fillRect(dx + dw / 2 - s * 0.015, dy + s * 0.05, s * 0.03, dh - s * 0.08);
  const noren = { shop: '#2f6fb3', hospital: '#ff6f91', dojo: '#2d2d3a', station: '#2c7d61', onsen: '#e05a5a', lab: '#4f8fd6', home: '#d2493b', observatory: '#45387a' }[b.kind] || roofDark;
  c.fillStyle = noren;
  for (let k = 0; k < 3; k++) { rr(c, dx + k * dw / 3 + s * 0.01, dy - s * 0.02, dw / 3 - s * 0.02, s * 0.36, s * 0.03); c.fill(); }
  if (b.kind === 'hospital') { c.fillStyle = '#fff'; c.font = font(s * 0.26); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', dx + dw / 2, dy + s * 0.16); }

  // roof (curved eaves)
  const ry = top + H * 0.3, peak = top - s * 0.2;
  c.beginPath();
  c.moveTo(-s * 0.02, ry + s * 0.12);
  c.quadraticCurveTo(W * 0.08, ry - s * 0.02, W * 0.16, peak + s * 0.5);
  c.lineTo(W * 0.84, peak + s * 0.5);
  c.quadraticCurveTo(W * 0.92, ry - s * 0.02, W + s * 0.02, ry + s * 0.12);
  c.closePath();
  c.fillStyle = roof; c.fill(); outline(c, s * 0.05);
  // tile lines
  c.strokeStyle = roofDark; c.lineWidth = s * 0.04;
  for (let i = 1; i < w * 2; i++) {
    const x = W * 0.16 + (W * 0.68) * i / (w * 2);
    c.beginPath(); c.moveTo(x, peak + s * 0.55); c.lineTo(x + (x - W / 2) * 0.12, ry + s * 0.02); c.stroke();
  }
  // ridge
  rr(c, W * 0.14, peak + s * 0.38, W * 0.72, s * 0.16, s * 0.06); c.fillStyle = roofDark; c.fill(); outline(c, s * 0.04);
  if (b.kind === 'observatory') {
    c.beginPath(); c.arc(W / 2, peak + s * 0.36, s * 0.9, Math.PI, 0); c.closePath();
    c.fillStyle = '#c9cfe8'; c.fill(); outline(c, s * 0.05);
    c.fillStyle = '#45387a'; c.fillRect(W / 2 - s * 0.12, peak - s * 0.5, s * 0.24, s * 0.8);
  }
  if (b.kind === 'onsen') {
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = s * 0.07;
    for (let i = 0; i < 3; i++) { const x = W * 0.3 + i * W * 0.2; c.beginPath(); c.moveTo(x, peak + s * 0.2); c.bezierCurveTo(x - s * 0.2, peak - s * 0.1, x + s * 0.2, peak - s * 0.3, x, peak - s * 0.6); c.stroke(); }
  }
  // signboard
  const label = b.label?.ja || SIGNS[b.kind];
  if (label) {
    c.font = font(s * 0.3);
    const tw = c.measureText(label).width + s * 0.4;
    const sx = W / 2 - tw / 2, sy = wallTop - s * 0.08;
    c.fillStyle = '#fff6df'; rr(c, sx, sy, tw, s * 0.42, s * 0.1); c.fill(); outline(c, s * 0.04);
    c.fillStyle = '#5a3b2b'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(label, W / 2, sy + s * 0.22);
  }
}

function drawCastle(c, s, W, H, top, font) {
  const stone = '#9a958c';
  // stone base
  c.beginPath(); c.moveTo(s * 0.2, top + H); c.lineTo(s * 0.8, top + H * 0.45); c.lineTo(W - s * 0.8, top + H * 0.45); c.lineTo(W - s * 0.2, top + H); c.closePath();
  c.fillStyle = stone; c.fill(); outline(c, s * 0.05);
  const tier = (y, w, h, roofW) => {
    const x = W / 2 - w / 2;
    rr(c, x, y, w, h, s * 0.05); c.fillStyle = '#fbf8f0'; c.fill(); outline(c, s * 0.04);
    for (let i = 0; i < Math.floor(w / s); i++) { c.fillStyle = '#3a3a48'; c.fillRect(x + s * 0.3 + i * s, y + h * 0.35, s * 0.3, h * 0.35); }
    const rx = W / 2 - roofW / 2;
    c.beginPath(); c.moveTo(rx, y + s * 0.1); c.quadraticCurveTo(rx + roofW * 0.1, y - s * 0.3, rx + roofW * 0.22, y - s * 0.45);
    c.lineTo(rx + roofW * 0.78, y - s * 0.45); c.quadraticCurveTo(rx + roofW * 0.9, y - s * 0.3, rx + roofW, y + s * 0.1); c.closePath();
    c.fillStyle = '#3c8a6e'; c.fill(); outline(c, s * 0.045);
  };
  tier(top + H * 0.28, W * 0.7, s * 1.1, W * 0.86);
  tier(top + H * 0.02, W * 0.5, s * 0.9, W * 0.64);
  tier(top - H * 0.2, W * 0.32, s * 0.8, W * 0.44);
  // golden shachihoko
  c.fillStyle = '#f2c230';
  c.beginPath(); c.arc(W / 2 - W * 0.15, top - H * 0.2 - s * 0.5, s * 0.12, 0, 7); c.arc(W / 2 + W * 0.15, top - H * 0.2 - s * 0.5, s * 0.12, 0, 7); c.fill();
  // gate
  const gx = W / 2 - s * 0.55;
  c.fillStyle = '#6b4226'; rr(c, gx, top + H - s * 1.05, s * 1.1, s, s * 0.1); c.fill(); outline(c, s * 0.05);
  c.fillStyle = '#f2c230'; c.beginPath(); c.arc(W / 2 - s * 0.2, top + H - s * 0.5, s * 0.05, 0, 7); c.arc(W / 2 + s * 0.2, top + H - s * 0.5, s * 0.05, 0, 7); c.fill();
}

function drawTower(c, s, W, H, top, font) {
  const tiers = 5;
  for (let i = 0; i < tiers; i++) {
    const y = top + H - (i + 1) * (H + s) / tiers + s * 0.1, w = W * (0.8 - i * 0.1);
    rr(c, W / 2 - w * 0.36, y + s * 0.2, w * 0.72, (H + s) / tiers - s * 0.15, s * 0.05); c.fillStyle = '#f6e7d0'; c.fill(); outline(c, s * 0.04);
    c.beginPath(); c.moveTo(W / 2 - w / 2, y + s * 0.3); c.lineTo(W / 2 - w * 0.3, y - s * 0.05); c.lineTo(W / 2 + w * 0.3, y - s * 0.05); c.lineTo(W / 2 + w / 2, y + s * 0.3); c.closePath();
    c.fillStyle = '#a33b3b'; c.fill(); outline(c, s * 0.04);
  }
  c.strokeStyle = '#f2c230'; c.lineWidth = s * 0.08; c.beginPath(); c.moveTo(W / 2, top - s * 0.1); c.lineTo(W / 2, top - s * 1.1); c.stroke();
  c.fillStyle = '#6b4226'; rr(c, W / 2 - s * 0.35, top + H - s * 0.85, s * 0.7, s * 0.8, s * 0.08); c.fill(); outline(c, s * 0.04);
}

// Torii gate: 4 tiles wide, drawn standing on row y (canvas 4s × 2.4s).
export function toriiImage(s) {
  return cached(`torii|${s}`, 4 * s, 2.4 * s, c => {
    const red = '#e2483d', dark = '#b33429', base = 2.4 * s;
    for (const x of [0.5, 3.5]) {
      rr(c, x * s - s * 0.14, s * 0.6, s * 0.28, base - s * 0.75, s * 0.05); c.fillStyle = red; c.fill(); outline(c, s * 0.04);
      c.fillStyle = '#2d2d2d'; c.fillRect(x * s - s * 0.17, base - s * 0.32, s * 0.34, s * 0.22);
    }
    rr(c, s * 0.2, s * 0.9, 3.6 * s, s * 0.18, s * 0.04); c.fillStyle = red; c.fill(); outline(c, s * 0.035);
    c.beginPath(); c.moveTo(-s * 0.05, s * 0.45); c.quadraticCurveTo(2 * s, s * 0.6, 4.05 * s, s * 0.45); c.lineTo(3.9 * s, s * 0.7); c.quadraticCurveTo(2 * s, s * 0.82, 0.1 * s, s * 0.7); c.closePath();
    c.fillStyle = '#2d2d2d'; c.fill(); outline(c, s * 0.035);
    c.beginPath(); c.moveTo(0.05 * s, s * 0.65); c.quadraticCurveTo(2 * s, s * 0.78, 3.95 * s, s * 0.65); c.lineTo(3.85 * s, s * 0.82); c.quadraticCurveTo(2 * s, s * 0.95, 0.15 * s, s * 0.82); c.closePath();
    c.fillStyle = red; c.fill(); outline(c, s * 0.035);
    c.fillStyle = dark; c.fillRect(1.85 * s, s * 0.85, s * 0.3, s * 0.3);
  });
}

// Wooden signpost (1 tile, overhanging).
export function signImage(s, quiz = false) {
  return cached(`sign${quiz}|${s}`, s, s * 1.5, c => {
    const top = s * 0.5;
    shadow(c, s / 2, top + s * 0.88, s * 0.24);
    c.fillStyle = '#8a5a34'; c.fillRect(s * 0.45, top + s * 0.4, s * 0.1, s * 0.48);
    if (quiz) {
      c.beginPath(); c.moveTo(s * 0.06, top + s * 0.2); c.lineTo(s * 0.2, top + s * 0.02); c.lineTo(s * 0.5, top + s * 0.02); c.lineTo(s * 0.5, top + s * 0.38); c.lineTo(s * 0.2, top + s * 0.38); c.closePath();
      c.fillStyle = '#d9a86a'; c.fill(); outline(c, s * 0.035);
      c.beginPath(); c.moveTo(s * 0.94, top + s * 0.3); c.lineTo(s * 0.8, top + s * 0.12); c.lineTo(s * 0.5, top + s * 0.12); c.lineTo(s * 0.5, top + s * 0.48); c.lineTo(s * 0.8, top + s * 0.48); c.closePath();
      c.fillStyle = '#e6b878'; c.fill(); outline(c, s * 0.035);
    } else {
      rr(c, s * 0.12, top + s * 0.06, s * 0.76, s * 0.4, s * 0.06); c.fillStyle = '#d9a86a'; c.fill(); outline(c, s * 0.035);
      c.strokeStyle = '#a7743f'; c.lineWidth = s * 0.03;
      c.beginPath(); c.moveTo(s * 0.22, top + s * 0.2); c.lineTo(s * 0.78, top + s * 0.2); c.moveTo(s * 0.22, top + s * 0.32); c.lineTo(s * 0.62, top + s * 0.32); c.stroke();
    }
  });
}

export function chestImage(s, open) {
  return cached(`chest${open}|${s}`, s, s * 1.5, c => {
    const top = s * 0.5;
    shadow(c, s / 2, top + s * 0.86, s * 0.3);
    rr(c, s * 0.18, top + s * 0.42, s * 0.64, s * 0.42, s * 0.06); c.fillStyle = '#c47a3a'; c.fill(); outline(c, s * 0.035);
    if (open) { rr(c, s * 0.18, top + s * 0.2, s * 0.64, s * 0.2, s * 0.06); c.fillStyle = '#8a5226'; c.fill(); outline(c, s * 0.035); }
    else { rr(c, s * 0.16, top + s * 0.28, s * 0.68, s * 0.22, s * 0.08); c.fillStyle = '#d98c45'; c.fill(); outline(c, s * 0.035); }
    c.fillStyle = '#f2c230'; c.fillRect(s * 0.45, top + s * 0.44, s * 0.1, s * 0.12);
  });
}

export function gateImage(s) {
  return cached(`gate|${s}`, s, s * 1.5, c => {
    const top = s * 0.5;
    c.fillStyle = '#c4935e';
    rr(c, s * 0.08, top + s * 0.3, s * 0.14, s * 0.56, s * 0.04); c.fill(); outline(c, s * 0.03);
    rr(c, s * 0.78, top + s * 0.3, s * 0.14, s * 0.56, s * 0.04); c.fill(); outline(c, s * 0.03);
    rr(c, 0, top + s * 0.4, s, s * 0.14, s * 0.04); c.fillStyle = '#f2d16b'; c.fill(); outline(c, s * 0.03);
    c.fillStyle = '#e2483d'; for (let i = 0; i < 3; i++) c.fillRect(s * (0.1 + i * 0.32), top + s * 0.4, s * 0.14, s * 0.14);
  });
}
