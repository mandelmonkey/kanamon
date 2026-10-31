// Painted art (see tools/PAINTED_ART.md): which hand-painted images exist, so each art function can
// prefer them and fall back to its code-drawn version. img/manifest.json is written by tools/build_manifest.mjs.
// file → content hash; the hash goes in the URL so a repainted image never comes from a stale cache.
let files = new Map();

export async function loadPainted() {
  try {
    const r = await fetch('img/manifest.json', { cache: 'no-cache' });
    if (r.ok) files = new Map(Object.entries(await r.json()));
  } catch { /* no painted art yet */ }
  // Warm the overworld art while the title screen is up, so the map doesn't flash its code-drawn look first.
  for (const f of files.keys()) if (/^(sprites|build|props)\//.test(f)) new Image().src = painted(f.slice(0, -5));
}

// painted('mon/tane') → 'img/mon/tane.webp?v=<hash>' when that file shipped, else null.
export function painted(name) {
  const f = name + '.webp', v = files.get(f);
  return v ? `img/${f}?v=${v}` : null;
}

// Same colour shift the SVG art uses for sparkly variants (feColorMatrix hueRotate 155 + saturate 1.25),
// applied to pixels so canvas drawing gets it too.
export function shinyCanvas(img) {
  const cv = document.createElement('canvas');
  cv.width = img.naturalWidth; cv.height = img.naturalHeight;
  const c = cv.getContext('2d');
  c.drawImage(img, 0, 0);
  const d = c.getImageData(0, 0, cv.width, cv.height), p = d.data;
  const m = matrix(155, 1.25);
  for (let i = 0; i < p.length; i += 4) {
    const r = p[i], g = p[i + 1], b = p[i + 2];
    p[i] = m[0] * r + m[1] * g + m[2] * b;
    p[i + 1] = m[3] * r + m[4] * g + m[5] * b;
    p[i + 2] = m[6] * r + m[7] * g + m[8] * b;
  }
  c.putImageData(d, 0, 0);
  return cv;
}

function matrix(deg, sat) {
  const a = deg * Math.PI / 180, cos = Math.cos(a), sin = Math.sin(a);
  const h = [
    0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
    0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.140, 0.072 - cos * 0.072 - sin * 0.283,
    0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072,
  ];
  const s = [
    0.213 + 0.787 * sat, 0.715 - 0.715 * sat, 0.072 - 0.072 * sat,
    0.213 - 0.213 * sat, 0.715 + 0.285 * sat, 0.072 - 0.072 * sat,
    0.213 - 0.213 * sat, 0.715 - 0.715 * sat, 0.072 + 0.928 * sat,
  ];
  const out = [];
  for (let r = 0; r < 3; r++) for (let col = 0; col < 3; col++) out.push(s[r * 3] * h[col] + s[r * 3 + 1] * h[3 + col] + s[r * 3 + 2] * h[6 + col]);
  return out;
}
