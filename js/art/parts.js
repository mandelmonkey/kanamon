// SVG toolkit for drawing かなもん in a soft chibi style.
// Every creature is drawn in a 100×100 box, standing on y≈92, facing the viewer.
// A toolkit instance (P) is bound to a unique id prefix so many SVGs can share a page.

export const OUT = '#5a3b2b';   // warm brown outline used everywhere
export const SW = 2.4;          // standard outline width

let counter = 0;

// Default stroke attributes, unless `extra` already sets its own stroke-width (SVG forbids duplicates).
const stroke = (extra) => /stroke-width/.test(extra) ? `stroke="${OUT}"` : `stroke="${OUT}" stroke-width="${SW}"`;

export function makeToolkit() {
  const u = 'k' + (++counter).toString(36) + '_';
  const defs = [];
  const P = {
    u, defs, OUT, SW,

    // Radial gradient: light spot top-left fading to the base colour (and a darker rim).
    fill(light, base, dark = null, cx = 0.35, cy = 0.3) {
      const id = u + 'g' + defs.length;
      defs.push(`<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="0.85">` +
        `<stop offset="0" stop-color="${light}"/><stop offset="0.55" stop-color="${base}"/>` +
        `<stop offset="1" stop-color="${dark || base}"/></radialGradient>`);
      return `url(#${id})`;
    },
    // Vertical linear gradient.
    lin(top, bottom) {
      const id = u + 'g' + defs.length;
      defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
        `<stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`);
      return `url(#${id})`;
    },

    // Outlined shapes. `f` is a colour or P.fill(...) url.
    ell(cx, cy, rx, ry, f, extra = '') {
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${f}" ${stroke(extra)} ${extra}/>`;
    },
    circ(cx, cy, r, f, extra = '') { return P.ell(cx, cy, r, r, f, extra); },
    path(d, f, extra = '') {
      return `<path d="${d}" fill="${f}" ${stroke(extra)} stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
    },
    // Unoutlined path (for inner details / patterns).
    flat(d, f, extra = '') { return `<path d="${d}" fill="${f}" ${extra}/>`; },
    line(d, w = SW, c = OUT) {
      return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    rect(x, y, w, h, rx, f, extra = '') {
      return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${f}" ${stroke(extra)} ${extra}/>`;
    },

    // Soft ground shadow.
    shadow(cx = 50, cy = 93, rx = 26) {
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${Math.max(3, rx * 0.16)}" fill="#3c2a1e" opacity="0.16"/>`;
    },
    // Glossy white highlight.
    hl(cx, cy, rx, ry, rot = -25, op = 0.55) {
      return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" opacity="${op}" transform="rotate(${rot} ${cx} ${cy})"/>`;
    },

    // Big shiny anime eyes. style: 'shiny' | 'happy' | 'closed' | 'wink' | 'dot'
    eyes(x = 50, y = 52, gap = 16, r = 6, style = 'shiny', iris = '#6b3f26') {
      const one = (ex, st) => {
        if (st === 'happy') return P.line(`M${ex - r * 0.9} ${y + r * 0.3} Q${ex} ${y - r * 0.9} ${ex + r * 0.9} ${y + r * 0.3}`, SW * 1.1, '#2b1d16');
        if (st === 'closed') return P.line(`M${ex - r * 0.9} ${y - r * 0.1} Q${ex} ${y + r * 0.8} ${ex + r * 0.9} ${y - r * 0.1}`, SW * 1.1, '#2b1d16');
        if (st === 'dot') return `<ellipse cx="${ex}" cy="${y}" rx="${r * 0.45}" ry="${r * 0.6}" fill="#2b1d16"/>`;
        const id = u + 'e' + defs.length;
        defs.push(`<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0.35" stop-color="#2b1d16"/><stop offset="1" stop-color="${iris}"/></linearGradient>`);
        return `<ellipse cx="${ex}" cy="${y}" rx="${r * 0.82}" ry="${r}" fill="url(#${id})"/>` +
          `<ellipse cx="${ex + r * 0.28}" cy="${y - r * 0.38}" rx="${r * 0.36}" ry="${r * 0.4}" fill="#fff"/>` +
          `<circle cx="${ex - r * 0.3}" cy="${y + r * 0.42}" r="${r * 0.16}" fill="#fff" opacity="0.9"/>`;
      };
      const l = x - gap / 2, rr = x + gap / 2;
      if (style === 'wink') return one(l, 'shiny') + one(rr, 'happy');
      return one(l, style) + one(rr, style);
    },
    blush(x = 50, y = 60, gap = 26, rx = 4.5, ry = 2.6, color = '#ff8fa8') {
      return `<ellipse cx="${x - gap / 2}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.7"/>` +
        `<ellipse cx="${x + gap / 2}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.7"/>`;
    },
    // Mouths. type: 'smile' | 'open' | 'cat' | 'o' | 'grin' | 'tongue' | 'flat' | 'fang'
    mouth(x = 50, y = 61, type = 'smile', s = 1) {
      const w = 3.2 * s;
      switch (type) {
        case 'open':
          return `<path d="M${x - w} ${y - 0.6 * s} Q${x} ${y + 5 * s} ${x + w} ${y - 0.6 * s} Z" fill="#c7404f" stroke="#2b1d16" stroke-width="${1.6}" stroke-linejoin="round"/>` +
            `<path d="M${x - w * 0.55} ${y + 2.2 * s} Q${x} ${y + 0.6 * s} ${x + w * 0.55} ${y + 2.2 * s} Q${x} ${y + 4.1 * s} ${x - w * 0.55} ${y + 2.2 * s}Z" fill="#ff8a98"/>`;
        case 'cat':
          return P.line(`M${x - w} ${y} Q${x - w / 2} ${y + 2.4 * s} ${x} ${y} Q${x + w / 2} ${y + 2.4 * s} ${x + w} ${y}`, 1.7, '#2b1d16');
        case 'o':
          return `<ellipse cx="${x}" cy="${y + 0.8 * s}" rx="${1.8 * s}" ry="${2.2 * s}" fill="#c7404f" stroke="#2b1d16" stroke-width="1.5"/>`;
        case 'grin':
          return `<path d="M${x - w * 1.3} ${y - 0.5 * s} Q${x} ${y + 6 * s} ${x + w * 1.3} ${y - 0.5 * s} Z" fill="#fff" stroke="#2b1d16" stroke-width="1.6" stroke-linejoin="round"/>`;
        case 'tongue':
          return P.line(`M${x - w} ${y} Q${x} ${y + 3 * s} ${x + w} ${y}`, 1.7, '#2b1d16') +
            `<path d="M${x - 1.6 * s} ${y + 1.2 * s} Q${x} ${y + 5.5 * s} ${x + 1.6 * s} ${y + 1.2 * s}Z" fill="#ff7a8a" stroke="#2b1d16" stroke-width="1.2"/>`;
        case 'flat':
          return P.line(`M${x - w * 0.7} ${y + 0.5} L${x + w * 0.7} ${y + 0.5}`, 1.7, '#2b1d16');
        case 'fang':
          return P.line(`M${x - w} ${y} Q${x} ${y + 3 * s} ${x + w} ${y}`, 1.7, '#2b1d16') +
            `<path d="M${x + w * 0.2} ${y + 1.3 * s} l${1.2 * s} ${2.4 * s} l${1.2 * s} ${-2.2 * s}Z" fill="#fff" stroke="#2b1d16" stroke-width="1"/>`;
        default:
          return P.line(`M${x - w} ${y} Q${x} ${y + 3.4 * s} ${x + w} ${y}`, 1.8, '#2b1d16');
      }
    },
    // Little stubby feet.
    feet(y = 89, xs = [40, 60], f = '#fff', rx = 6, ry = 4) {
      return xs.map(x => P.ell(x, y, rx, ry, f)).join('');
    },
    // Tiny 4-point sparkle (no outline).
    sparkle(x, y, s = 4, c = '#fff8c4') {
      return `<path d="M${x} ${y - s} Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y} Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s} Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y} Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z" fill="${c}"/>`;
    },
    // Simple leaf shape pointing up at angle `rot` from base (x,y).
    leaf(x, y, len = 14, rot = 0, f = '#6cc24a') {
      const w = len * 0.45;
      return `<g transform="rotate(${rot} ${x} ${y})">` +
        P.path(`M${x} ${y} Q${x - w} ${y - len * 0.5} ${x} ${y - len} Q${x + w} ${y - len * 0.5} ${x} ${y}Z`, f) +
        P.line(`M${x} ${y - 1} L${x} ${y - len * 0.75}`, 1.3, 'rgba(60,90,40,.55)') + `</g>`;
    },
    // Rounded n-point star path (for stars, flowers, sparkles).
    starPath(cx, cy, R, r, n = 5, rot = -90, round = 0.18) {
      const pts = [];
      for (let i = 0; i < n * 2; i++) {
        const a = (rot + i * 180 / n) * Math.PI / 180, rad = i % 2 ? r : R;
        pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
      }
      // round the corners with quadratic curves through each point
      const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
      let d = '';
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], prev = pts[(i - 1 + pts.length) % pts.length], next = pts[(i + 1) % pts.length];
        const a = lerp(p, prev, round), b = lerp(p, next, round);
        d += (i === 0 ? `M${a[0].toFixed(1)} ${a[1].toFixed(1)}` : ` L${a[0].toFixed(1)} ${a[1].toFixed(1)}`) +
          ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      }
      return d + 'Z';
    },
  };
  return P;
}

// Wrap a drawing into a full SVG document string.
export function wrapSvg(P, body, { shiny = false } = {}) {
  let inner = body;
  if (shiny) {
    const f = P.u + 'shiny';
    P.defs.push(`<filter id="${f}"><feColorMatrix type="hueRotate" values="155"/><feColorMatrix type="saturate" values="1.25"/></filter>`);
    inner = `<g filter="url(#${f})">${body}</g>` +
      P.sparkle(18, 22, 6) + P.sparkle(84, 30, 5) + P.sparkle(80, 76, 4) + P.sparkle(22, 70, 3.5);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs>${P.defs.join('')}</defs>${inner}</svg>`;
}
