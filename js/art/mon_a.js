// Creature art batch a — see tools/ART_BRIEF.md

const f1 = (n) => n.toFixed(1);

// Scalloped outline (tree crowns, fluff, foam): n round bumps around an ellipse. b ≥ 0.5 (0.5 = half-circles).
function cloud(cx, cy, rx, ry, n, b = 0.6, rot = -90) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = (rot + i * 360 / n) * Math.PI / 180;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  let d = `M${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i <= n; i++) {
    const p = pts[i % n], q = pts[i - 1], r = Math.hypot(p[0] - q[0], p[1] - q[1]) * b;
    d += ` A${f1(r)} ${f1(r)} 0 0 1 ${f1(p[0])} ${f1(p[1])}`;
  }
  return d + 'Z';
}

// Ring of flickering flame tongues around (cx,cy): base radius r, tip radii Rx/Ry, from angle a0 to a1 (deg).
// `lift` pulls every tip upwards so the fire rises.
function flames(cx, cy, r, Rx, Ry, n, a0 = 0, a1 = 360, curl = 0.22, lift = 0) {
  const pt = (a, kx, ky, up = 0) => {
    const t = a * Math.PI / 180;
    return `${f1(cx + Math.cos(t) * kx)} ${f1(cy + Math.sin(t) * ky - up)}`;
  };
  const step = (a1 - a0) / n;
  let d = `M${pt(a0, r, r)}`;
  for (let i = 0; i < n; i++) {
    const a = a0 + i * step;
    d += ` Q${pt(a + step * 0.15, Rx * 0.85, Ry * 0.85, lift * 0.5)} ${pt(a + step * (0.5 + curl), Rx, Ry, lift)}` +
      ` Q${pt(a + step * 0.85, r + (Rx - r) * 0.4, r + (Ry - r) * 0.4, lift * 0.3)} ${pt(a + step, r, r)}`;
  }
  return d + (a1 - a0 >= 360 ? 'Z' : ` L${cx} ${cy}Z`);
}

// Tiny five-petal flower (unoutlined) for cheeks and crowns.
function bloom(x, y, s, petal = '#ff9ec0', mid = '#ffe066') {
  let g = '';
  for (let i = 0; i < 5; i++) {
    const a = (-90 + i * 72) * Math.PI / 180;
    g += `<circle cx="${f1(x + Math.cos(a) * s)}" cy="${f1(y + Math.sin(a) * s)}" r="${f1(s * 0.78)}" fill="${petal}"/>`;
  }
  return g + `<circle cx="${x}" cy="${y}" r="${f1(s * 0.6)}" fill="${mid}"/>`;
}

// Points for a star with tips at the given angles (deg) on an ellipse Rx/Ry, valleys at radius r.
function spiky(cx, cy, angs, Rx, Ry, r) {
  const pts = [];
  angs.forEach((a, i) => {
    let b = angs[(i + 1) % angs.length];
    if (b <= a) b += 360;
    const t = a * Math.PI / 180, m = (a + b) / 2 * Math.PI / 180;
    pts.push([cx + Math.cos(t) * Rx, cy + Math.sin(t) * Ry], [cx + Math.cos(m) * r, cy + Math.sin(m) * r * Ry / Rx]);
  });
  return pts;
}
// Polygon with softly rounded corners.
function roundPoly(pts, round = 0.2) {
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  let d = '';
  pts.forEach((p, i) => {
    const a = lerp(p, pts[(i - 1 + pts.length) % pts.length], round), b = lerp(p, pts[(i + 1) % pts.length], round);
    d += `${i ? ' L' : 'M'}${f1(a[0])} ${f1(a[1])} Q${f1(p[0])} ${f1(p[1])} ${f1(b[0])} ${f1(b[1])}`;
  });
  return d + 'Z';
}
// Little rain/water drop (unoutlined).
function drop(x, y, s, c = '#8fd3f7') {
  return `<path d="M${x} ${f1(y - s * 1.5)} Q${f1(x + s)} ${f1(y - s * 0.2)} ${f1(x + s)} ${f1(y + s * 0.3)} A${s} ${s} 0 0 1 ${f1(x - s)} ${f1(y + s * 0.3)} Q${f1(x - s)} ${f1(y - s * 0.2)} ${x} ${f1(y - s * 1.5)}Z" fill="${c}"/>`;
}

// Horizontal stripe y1..y2 clipped to the ellipse (cx,cy,rx,ry) — bee stripes, tail rings.
function band(cx, cy, rx, ry, y1, y2) {
  const hw = (y) => rx * Math.sqrt(Math.max(0, 1 - ((y - cy) / ry) ** 2));
  const a = hw(y1), b = hw(y2);
  return `M${f1(cx - a)} ${y1} L${f1(cx + a)} ${y1} A${rx} ${ry} 0 0 1 ${f1(cx + b)} ${y2} L${f1(cx - b)} ${y2} A${rx} ${ry} 0 0 1 ${f1(cx - a)} ${y1}Z`;
}

// Thick outlined stroke (coral branches, antennae, stems): brown outline under a coloured core.
function tube(P, d, w, c) { return P.line(d, w + 2.6, P.OUT) + P.line(d, w, c); }

export default {
  // ── starter evolutions ────────────────────────────────────
  happa(P) {
    const leafG = P.fill('#d6f7a8', '#7ccf54', '#4f9e34');
    return P.shadow(50, 92, 27) +
      // leafy tail
      P.leaf(67, 84, 29, 64, leafG) +
      P.ell(24, 68, 5, 7, '#a9e8c0', 'transform="rotate(35 24 68)"') +
      P.ell(76, 68, 5, 7, '#a9e8c0', 'transform="rotate(-35 76 68)"') +
      // big leaf ears
      P.leaf(38, 33, 27, -38, leafG) + P.leaf(62, 33, 27, 38, leafG) +
      P.line('M50 28 L50 21', 2.4, '#4f8f3a') + P.leaf(50, 22, 9, 30, leafG) +
      P.path('M50 26 C69 26 79 42 79 63 C79 84 67 91 50 91 C33 91 21 84 21 63 C21 42 31 26 50 26Z',
        P.fill('#e2fbe8', '#9fe3b8', '#6cc493')) +
      `<ellipse cx="50" cy="79" rx="15" ry="9" fill="#f2fff5" opacity="0.7"/>` +
      P.hl(35, 41, 7, 4) +
      P.feet(89, [40, 60], '#a9e8c0', 5.5, 3.6) +
      P.eyes(50, 54, 19, 6.2) + P.mouth(50, 63, 'open', 0.85) +
      bloom(31, 63, 2.6) + bloom(69, 63, 2.6);
  },

  mori(P) {
    const crown = P.fill('#c9f5a0', '#6cc24a', '#3f8f30', 0.4, 0.3);
    return P.shadow(50, 93, 32) +
      // trunk body with stubby root legs
      P.path('M34 48 C34 60 31 72 27 82 C25 88 29 91 36 91 L46 91 Q50 86 54 91 L64 91 C71 91 75 88 73 82 C69 72 66 60 66 48Z',
        P.fill('#e2b384', '#b57d4b', '#86552e')) +
      P.line('M38 84 Q36 79 38 75 M62 84 Q64 79 62 75 M41 58 Q39 55 41 52', 1.3, '#8a5a34') +
      // branch arms with leaves
      tube(P, 'M32 70 Q22 69 17 61', 2.8, '#b57d4b') +
      P.leaf(17, 62, 10, -50, crown) +
      tube(P, 'M68 70 Q78 69 83 61', 2.8, '#b57d4b') +
      P.leaf(83, 62, 10, 50, crown) +
      // sprout on top (like たねもん's)
      P.leaf(50, 13, 11, -50, crown) + P.leaf(50, 13, 11, 50, crown) +
      // leafy crown
      P.path(cloud(50, 32, 38, 21, 11, 0.62), crown) +
      P.hl(32, 22, 8, 4) +
      bloom(28, 38, 2.4) + bloom(70, 42, 2.4, '#fff4f8') + bloom(42, 21, 2.2, '#fff4f8') + bloom(55, 44, 2) + bloom(22, 28, 1.8, '#fff4f8') +
      // bird house
      P.rect(61, 22, 12, 11, 1.5, '#ffe0a8', 'stroke-width="1.8"') +
      P.path('M59 23.5 L67 16 L75 23.5Z', '#e8574a', 'stroke-width="1.8"') +
      `<circle cx="67" cy="27.5" r="2.4" fill="#5a3b2b"/>` +
      // face on the trunk
      P.eyes(50, 65, 15, 5.2) + P.blush(50, 72, 24, 3.6, 2.1) + P.mouth(50, 72, 'smile', 0.8);
  },

  honoo(P) {
    const orange = P.fill('#ffc27a', '#ff8a2a', '#e0631a');
    const fire = P.fill('#fff6a0', '#ffb52e', '#ff5a1f', 0.5, 0.5);
    return P.shadow(50, 92, 30) +
      // big flaming tail
      P.path('M60 84 Q88 90 90 66 Q91 52 82 46 Q84 60 75 67 Q67 72 58 72Z', orange) +
      P.path('M80 52 Q66 44 72 28 Q76 37 81 34 Q78 20 88 9 Q100 28 94 44 Q90 53 80 52Z',
        P.fill('#fff6a0', '#ffb52e', '#ff5a1f', 0.5, 0.75)) +
      P.path('M84 48 Q78 40 83 31 Q89 39 88 47Z', '#fff6c0', 'stroke-width="0"') +
      // flame mane
      P.path(flames(50, 58, 15, 34, 28, 9, 10, 370, 0.3, 7), P.fill('#ffe066', '#ff9a2a', '#f0501e', 0.5, 0.5)) +
      P.flat(flames(50, 58, 12, 26, 21, 9, 30, 390, 0.3, 6), '#ffe27a') +
      // body
      P.ell(50, 77, 18, 13.5, orange) +
      P.ell(50, 80, 9.5, 8.5, '#fff1dc', 'stroke-width="0"') +
      P.feet(89, [40, 60], '#e86f22', 5.5, 3.6) +
      // ears
      P.path('M30 37 L25 8 L46 26Z', orange) + P.flat('M31 31 L28 15 L40 25Z', '#7a3b1f') +
      P.path('M70 37 L75 8 L54 26Z', orange) + P.flat('M69 31 L72 15 L60 25Z', '#7a3b1f') +
      // forelock flame
      P.path('M50 27 Q42 20 47 12 Q48 17 51 17 Q51 11 56 8 Q60 17 56 23 Q54 27 50 27Z', fire) +
      // head
      P.ell(50, 44, 24, 20, orange) +
      `<path d="M27 48 Q35 62 50 62 Q65 62 73 48 Q62 54 50 54 Q38 54 27 48Z" fill="#fff1dc"/>` +
      P.hl(37, 33, 7, 3.6) +
      P.eyes(50, 45, 19, 6.6) +
      `<ellipse cx="50" cy="52.5" rx="2.2" ry="1.5" fill="#3a2418"/>` +
      P.mouth(50, 55, 'open', 0.7) + P.blush(50, 52, 33);
  },

  taiyou(P) {
    const gold = P.fill('#ffe39a', '#ffad2e', '#e9801c');
    return P.shadow(50, 93, 30) +
      // warm glow + sun-ray halo
      `<circle cx="50" cy="44" r="44" fill="#ffe680" opacity="0.28"/>` +
      P.path(P.starPath(50, 44, 37, 28, 14, -90, 0.28), P.fill('#fffbe0', '#ffe066', '#ffbe2e', 0.5, 0.5)) +
      P.circ(50, 44, 27, P.fill('#fffdf0', '#fff1a8', '#ffd860', 0.5, 0.5), 'stroke-width="1.6"') +
      // fluffy tail with flame tip
      P.path('M62 86 Q86 90 88 70 Q89 60 82 54 Q84 66 76 72 Q68 76 60 75Z', gold) +
      P.path('M82 57 Q74 52 77 43 Q80 48 83 46 Q83 39 88 35 Q94 45 90 53 Q87 58 82 57Z',
        P.fill('#fff6a0', '#ff9a2e', '#ff4a1f', 0.5, 0.75)) +
      // body + fluffy cream ruff
      P.ell(50, 78, 17, 13, gold) +
      P.path(cloud(50, 70, 12, 8, 9, 0.6), '#fff4dc', 'stroke-width="1.6"') +
      P.feet(89, [41, 59], '#f08a1e', 5.5, 3.6) +
      // ears
      P.path('M31 41 L27 15 L46 31Z', gold) + P.flat('M32 35 L30 21 L40 30Z', '#d8481e') +
      P.path('M69 41 L73 15 L54 31Z', gold) + P.flat('M68 35 L70 21 L60 30Z', '#d8481e') +
      // head
      P.ell(50, 48, 23.5, 19.5, gold) +
      `<path d="M28 52 Q36 65 50 65 Q64 65 72 52 Q62 57 50 57 Q38 57 28 52Z" fill="#fff4dc"/>` +
      P.hl(38, 37, 6.5, 3.4) +
      // sun mark on forehead
      P.path(P.starPath(50, 35, 4.2, 2.6, 8, -90, 0.3), '#ff6a2a', 'stroke-width="1.2"') +
      P.eyes(50, 49, 18, 6.2, 'shiny', '#a0461a') +
      `<ellipse cx="50" cy="56" rx="2.2" ry="1.5" fill="#3a2418"/>` +
      P.mouth(50, 58.5, 'cat', 0.8) + P.blush(50, 55.5, 31) +
      P.sparkle(14, 14, 4) + P.sparkle(88, 84, 3.4) + P.sparkle(86, 12, 2.6);
  },

  nami(P) {
    const blue = P.fill('#e8f7ff', '#86cdf3', '#4aa3dc');
    const wave = P.fill('#d9f4ff', '#5fb8ec', '#2f86cc', 0.3, 0.2);
    return P.shadow(50, 92, 30) +
      // curling wave crest (behind the head)
      P.path('M33 46 C22 32 30 12 52 10 C70 9 82 20 80 32 C79 40 70 43 65 38 C61 34 63 28 68 28 C65 22 56 22 51 29 C48 34 49 40 52 46Z', wave) +
      P.flat('M30 22 C34 14 43 11.4 52 11.3 C67 10.6 77.5 18 78.6 28 A3.6 3.6 0 0 1 72.5 23.5 A3.6 3.6 0 0 1 65.5 19.6 A3.6 3.6 0 0 1 58.4 18.3 A3.6 3.6 0 0 1 51.2 18.5 A3.6 3.6 0 0 1 44.2 20 A3.6 3.6 0 0 1 37.8 22.8 A3.6 3.6 0 0 1 30 22Z', '#fff') +
      `<circle cx="68.5" cy="29.5" r="1.6" fill="#fff"/><circle cx="58" cy="25" r="1.1" fill="#fff" opacity="0.8"/>` +
      // tail flippers
      P.path('M26 77 Q11 80 14 90 Q25 90 33 82Z', '#5fb0e6') +
      P.path('M74 77 Q89 80 86 90 Q75 90 67 82Z', '#5fb0e6') +
      // body
      P.path('M20 80 C20 54 33 36 51 36 C70 36 81 52 80 72 C79 86 69 91 50 91 C32 91 20 88 20 80Z', blue) +
      `<ellipse cx="50" cy="80" rx="18" ry="9" fill="#fff" opacity="0.55"/>` +
      P.hl(34, 48, 6, 3.4) +
      // front flippers
      P.path('M22 66 Q12 70 13 78 Q20 78 25 72Z', '#6cbcec') +
      P.path('M78 66 Q88 70 87 78 Q80 78 75 72Z', '#6cbcec') +
      P.eyes(50, 57, 21, 6.4, 'shiny', '#244a6b') +
      `<ellipse cx="50" cy="65.5" rx="8.5" ry="5" fill="#f4fbff"/>` +
      `<ellipse cx="50" cy="62.5" rx="2.6" ry="1.8" fill="#2b2b3a"/>` +
      P.mouth(50, 65.5, 'cat', 0.75) + P.blush(50, 63, 32) +
      `<circle cx="44" cy="66" r="0.8" fill="#5b7a90"/><circle cx="56" cy="66" r="0.8" fill="#5b7a90"/>`;
  },

  umi(P) {
    const deep = P.fill('#cbe8ff', '#4b93e6', '#2b62b8');
    const coral = '#ff7f8f';
    let pearls = '';
    for (let i = 0; i <= 8; i++) {
      const t = i / 8, x = 31 + t * 38, y = 74 + Math.sin(t * Math.PI) * 7;
      if (i !== 4) pearls += `<circle cx="${f1(x)}" cy="${f1(y)}" r="1.7" fill="#fffaf0" stroke="#5a3b2b" stroke-width="0.8"/>`;
    }
    return P.shadow(50, 93, 33) +
      // whale tail
      P.path('M62 84 C80 84 88 70 84 50 L82 42 Q72 40 67 29 Q78 29 84 36 Q86 27 94 22 Q95 34 88 44 L88 52 C91 74 80 88 62 88Z', P.fill('#9cd0ff', '#3f84d8', '#2a5aa8')) +
      // body
      P.ell(50, 63, 34, 28.5, deep) +
      `<ellipse cx="50" cy="77" rx="22" ry="12" fill="#e2f2ff" opacity="0.6"/>` +
      P.hl(30, 46, 7, 4) +
      // flippers
      P.path('M18 66 Q7 72 9 82 Q17 82 23 74Z', '#3f84d8') +
      P.path('M82 66 Q93 72 91 82 Q83 82 77 74Z', '#3f84d8') +
      // coral crown
      tube(P, 'M50 37 L50 21 M50 31 Q42 29 40 21 M41 25 L36 22 M50 29 Q58 27 60 19 M59 23 L64 20', 3.4, coral) +
      `<circle cx="50" cy="20" r="2.2" fill="#ffb3bd"/><circle cx="40" cy="20.5" r="1.8" fill="#ffb3bd"/><circle cx="60" cy="18.5" r="1.8" fill="#ffb3bd"/>` +
      // face
      P.eyes(50, 56, 22, 6.6, 'shiny', '#1d3d66') +
      `<ellipse cx="50" cy="65" rx="9" ry="5.4" fill="#eef7ff"/>` +
      `<ellipse cx="50" cy="62" rx="2.8" ry="1.9" fill="#2b2b3a"/>` +
      P.mouth(50, 65, 'cat', 0.8) + P.blush(50, 62.5, 34) +
      `<circle cx="43.5" cy="65.5" r="0.85" fill="#5b7a90"/><circle cx="56.5" cy="65.5" r="0.85" fill="#5b7a90"/>` +
      // shell necklace
      P.line('M31 74 Q50 88 69 74', 1, '#5a3b2b') + pearls +
      P.path('M50 87 L44.5 80.5 Q50 76.5 55.5 80.5Z', P.fill('#fff0f3', '#ffb6c4', '#ff8fa6', 0.5, 0.2), 'stroke-width="1.4"') +
      P.line('M50 86 L47.5 80 M50 86 L50 79 M50 86 L52.5 80', 0.8, '#d46a80');
  },

  // ── さくらむら & はらっぱ ─────────────────────────────────
  ichigo(P) {
    const seeds = [[29, 45], [71, 45], [22, 57], [78, 57], [28, 70], [72, 70], [39, 80], [61, 80], [50, 86], [50, 74]];
    return P.shadow(50, 92, 24) +
      P.ell(18, 62, 4.5, 6, '#e8333f', 'transform="rotate(30 18 62)"') +
      P.ell(82, 62, 4.5, 6, '#e8333f', 'transform="rotate(-30 82 62)"') +
      P.path('M50 31 C68 29 84 37 84 53 C84 70 64 89 50 91 C36 89 16 70 16 53 C16 37 32 29 50 31Z',
        P.fill('#ffa0a0', '#ec3a48', '#b8202e')) +
      seeds.map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry="2" fill="#ffe680" transform="rotate(${f1((x - 50) * 0.9)} ${x} ${y})"/>`).join('') +
      P.hl(30, 44, 6, 3.2) +
      P.line('M50 28 Q50 20 55 15', 3, P.OUT) + P.line('M50 28 Q50 20 55 15', 1.4, '#6cc24a') +
      P.path(roundPoly(spiky(50, 31, [-150, -30, 12, 52, 90, 128, 168], 25, 14, 6), 0.22), P.fill('#c8f59a', '#6cc24a', '#3f8f30')) +
      P.eyes(50, 55, 17, 5.8) + P.blush(50, 63, 28, 4, 2.3) + P.mouth(50, 63, 'open', 0.8);
  },

  ahiru(P) {
    const yel = P.fill('#fff7c0', '#ffd93a', '#f0ad1c');
    const org = P.fill('#ffc58a', '#ff9a2e', '#e8701c');
    return P.shadow(50, 92, 29) +
      P.line('M10 89 Q16 86 22 89 M78 89 Q84 86 90 89', 1.6, '#7cc8f0') +
      // tail tip + flapping wings (behind)
      P.path('M70 66 Q84 60 87 47 Q92 62 82 74Z', yel) +
      P.path('M28 70 Q13 68 10 55 Q20 56 30 62Z', yel) + P.path('M72 70 Q87 68 90 55 Q80 56 70 62Z', yel) +
      P.feet(89, [39, 61], org, 6, 3.4) +
      P.ell(50, 73, 28, 17, yel) +
      `<ellipse cx="50" cy="78" rx="15" ry="8" fill="#fffbe0" opacity="0.7"/>` +
      // head with a little tuft
      P.path('M48 24 Q45 15 51 12 Q50 17 55 18 Q51 20 53 24Z', yel, 'stroke-width="1.8"') +
      P.circ(50, 43, 21, yel) +
      P.hl(40, 33, 6, 3.2) +
      P.eyes(50, 41, 18, 5.8) + P.blush(50, 49, 31) +
      // wide flat duck bill
      P.path('M37 53 Q37 47.5 50 47.5 Q63 47.5 63 53 Q63 59 50 59 Q37 59 37 53Z', org, 'stroke-width="2"') +
      P.line('M39.5 54 Q50 56.5 60.5 54', 1.4, '#b8501a') +
      `<ellipse cx="46" cy="50.5" rx="0.9" ry="0.6" fill="#b8501a"/><ellipse cx="54" cy="50.5" rx="0.9" ry="0.6" fill="#b8501a"/>`;
  },

  kasa(P) {
    const tips = [[7, 59], [28, 55], [50, 57], [72, 55], [93, 59]];
    let canopy = 'M7 59 C8 32 27 15 50 15 C73 15 92 32 93 59';
    for (let i = 3; i >= 0; i--) canopy += ` A11 9.5 0 0 0 ${tips[i][0]} ${tips[i][1]}`;
    const lav = P.fill('#f4e8ff', '#c39cf2', '#946ad8');
    return P.shadow(50, 93, 24) +
      P.line('M50 15 L50 8', 2.6, P.OUT) + P.circ(50, 7, 2.2, '#ffd23e', 'stroke-width="1.6"') +
      P.path(canopy + 'Z', P.fill('#e0c4ff', '#9b63e0', '#6a3bb8', 0.5, 0.15)) +
      P.flat('M50 16 Q32 24 28 55 A11 9.5 0 0 0 50 57Z M50 16 Q74 22 88 42 Q92 50 93 59 A11 9.5 0 0 0 72 55Z', '#fff', 'opacity="0.16"') +
      P.line('M50 16 Q32 24 28 55 M50 16 Q68 24 72 55', 1.5, '#5a2f9a') +
      P.hl(30, 28, 8, 3.4, -30, 0.45) +
      // curved handle tail
      tube(P, 'M50 75 L50 83 Q50 90 43.5 90 Q38 90 38 85', 3.2, '#c98a4a') +
      // little bat body
      P.path('M39 54 L28 32 L48 46Z', lav) + P.path('M61 54 L72 32 L52 46Z', lav) +
      P.flat('M38.5 48 L32 37 L44 46Z M61.5 48 L68 37 L56 46Z', '#ff9ec0') +
      P.circ(50, 61, 16.5, lav) +
      `<ellipse cx="50" cy="68" rx="8" ry="5" fill="#fff" opacity="0.4"/>` +
      P.hl(42, 53, 4, 2.2) +
      P.eyes(50, 59, 13, 5.2) + P.blush(50, 65, 23, 3.4, 2) + P.mouth(50, 65.5, 'fang', 0.8) +
      drop(15, 70, 3) + drop(86, 78, 2.4) + drop(80, 66, 1.8);
  },

  sakura(P) {
    const pink = P.fill('#fff7fa', '#ffc6da', '#ff97bb', 0.5, 0.1);
    const petal = 'M50 52 C35 46 29 30 37 19 Q42 13 46 15 L50 20 L54 15 Q58 13 63 19 C71 30 65 46 50 52Z';
    const mini = 'M0 6 C-5 3 -5 -3 -1.6 -6 L0 -4.4 L1.6 -6 C5 -3 5 3 0 6Z';
    let g = '', stamens = '';
    for (let i = 0; i < 5; i++) {
      g += `<g transform="rotate(${i * 72} 50 52)">` + P.path(petal, pink) +
        P.line('M50 47 L50 30', 1.1, 'rgba(232,96,140,.35)') + `</g>`;
      const a = (-54 + i * 72) * Math.PI / 180;
      stamens += P.line(`M${f1(50 + Math.cos(a) * 14)} ${f1(52 + Math.sin(a) * 14)} L${f1(50 + Math.cos(a) * 20)} ${f1(52 + Math.sin(a) * 20)}`, 1.2, '#e86a96') +
        `<circle cx="${f1(50 + Math.cos(a) * 20.5)}" cy="${f1(52 + Math.sin(a) * 20.5)}" r="1.9" fill="#ffd84a"/>`;
    }
    const floaty = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})">` + P.path(mini, '#ffc6da', 'stroke-width="1.3"') + `</g>`;
    return P.shadow(50, 93, 20) + g + stamens +
      P.circ(50, 52, 14, P.fill('#fffdfd', '#ffe6ee', '#ffc6d8', 0.4, 0.3), 'stroke-width="1.8"') +
      P.hl(33, 26, 4, 2.4, -30, 0.7) +
      P.eyes(50, 51, 12, 4.6) + P.blush(50, 56.5, 19, 2.8, 1.7) + P.mouth(50, 56.5, 'open', 0.6) +
      floaty(14, 16, -30) + floaty(87, 20, 35) + floaty(13, 82, 60) + floaty(86, 84, -20);
  },

  tamago(P) {
    const shell = P.fill('#ffffff', '#fbf6ec', '#e3d8c4');
    return P.shadow(50, 92, 25) +
      P.feet(89, [41, 59], '#ffa53a', 5, 3.2) +
      P.path('M50 13 C67 13 80 40 80 61 C80 79 67 90 50 90 C33 90 20 79 20 61 C20 40 33 13 50 13Z', shell) +
      `<g fill="#ece2cf"><ellipse cx="34" cy="74" rx="1.8" ry="1.3"/><ellipse cx="68" cy="70" rx="1.5" ry="1.1"/><ellipse cx="62" cy="28" rx="1.4" ry="1"/><ellipse cx="72" cy="56" rx="1.2" ry="0.9"/></g>` +
      // little chick tuft poking out of the crack
      P.path('M52.5 43 Q50 35 54 31 Q54 36 57.5 35 Q55 39 57 42Z', '#ffd93a', 'stroke-width="1.4"') +
      P.line('M22 47 L30 42.5 L36 48.5 L43 42 L49 48 L55 41.5 L61 47.5 L67 42 L78 47', 2, '#a0826a') +
      P.hl(37, 28, 6, 3.6) +
      P.eyes(50, 62, 16, 5.4) + P.blush(50, 69, 26, 3.8, 2.2) + P.mouth(50, 69.5, 'smile', 0.75);
  },

  hiyoko(P) {
    const yel = P.fill('#fff9c8', '#ffe04a', '#f5b520');
    return P.shadow(50, 92, 27) +
      P.ell(23, 66, 5.5, 8, yel, 'transform="rotate(35 23 66)"') +
      P.ell(77, 66, 5.5, 8, yel, 'transform="rotate(-35 77 66)"') +
      P.feet(89, [41, 59], '#ff9a2e', 5.5, 3.4) +
      P.path(cloud(50, 63, 29, 26, 16, 0.56), yel) +
      P.hl(35, 52, 6, 3.4) +
      // eggshell hat (same shell as たまごもん)
      `<g transform="rotate(-12 50 38)">` +
      P.path('M30 42 C29 26 38 16 50 16 C62 16 71 26 70 42 L65 37 L60 43 L55 37 L50 43 L45 37 L40 43 L35 37Z',
        P.fill('#ffffff', '#fbf6ec', '#e3d8c4')) + P.hl(41, 24, 4, 2.4) + `</g>` +
      P.eyes(50, 59, 18, 6) + P.blush(50, 67, 31) +
      P.path('M45 66.5 L50 62.5 L55 66.5 L50 71Z', P.fill('#ffc58a', '#ff9a2e', '#e8701c'), 'stroke-width="1.6"') +
      P.line('M45.5 66.5 L54.5 66.5', 1, '#b8501a');
  },

  niwatori(P) {
    const white = P.fill('#ffffff', '#f7f3ec', '#ddd3c2');
    const red = P.fill('#ff9a9a', '#ec3a48', '#b8202e');
    return P.shadow(50, 92, 29) +
      // tail feathers
      P.path('M66 60 Q70 34 84 24 Q88 40 80 62Z', white) +
      P.path('M70 64 Q80 44 92 40 Q92 56 80 68Z', white) +
      P.path('M62 58 Q60 36 70 24 Q78 38 74 60Z', white) +
      P.ell(21, 64, 6, 10, white, 'transform="rotate(35 21 64)"') +
      P.ell(79, 64, 6, 10, white, 'transform="rotate(-35 79 64)"') +
      P.feet(89, [41, 59], '#ff9a2e', 5.5, 3.4) +
      // comb
      P.path('M38 37 Q34 27 41 26 Q42 18 49 20 Q53 14 58 20 Q65 21 62 29 Q66 33 62 37Z', red) +
      // body
      P.path('M50 32 C69 32 80 47 80 64 C80 81 67 90 50 90 C33 90 20 81 20 64 C20 47 31 32 50 32Z', white) +
      P.path(cloud(50, 77, 17, 10, 11, 0.56), '#fffdf8', 'stroke-width="1.4"') +
      P.hl(35, 45, 7, 3.6) +
      P.eyes(50, 53, 19, 6) + P.blush(50, 61, 32) +
      // wattle + beak
      P.path('M50 64 Q46 66 46 70 Q46 74 50 74 Q54 74 54 70 Q54 66 50 64Z', red, 'stroke-width="1.6"') +
      P.path('M44.5 61 L50 56.5 L55.5 61 L50 66Z', P.fill('#ffd08a', '#ffa23a', '#e8701c'), 'stroke-width="1.6"') +
      P.line('M45 61 L55 61', 1, '#b8501a');
  },

  kemushi(P) {
    const green = P.fill('#e8fcc0', '#94d64e', '#5ea832');
    const seg = (x, y, r) => P.path(cloud(x, y, r, r, 12, 0.56), green, 'stroke-width="2.2"') +
      `<ellipse cx="${x}" cy="${f1(y - r * 0.35)}" rx="${f1(r * 0.32)}" ry="${f1(r * 0.24)}" fill="#ffe36a"/>`;
    return P.shadow(54, 92, 34) +
      // a nibbled leaf
      P.path('M10 88 Q12 74 26 72 Q22 77 24 80 Q27 80 28 84 Q22 92 10 88Z', P.fill('#c8f59a', '#6cc24a', '#4c9a34'), 'stroke-width="1.8"') +
      P.ell(57, 88, 3.4, 2.4, '#5ea832', 'stroke-width="1.6"') + P.ell(72, 86, 3, 2.2, '#5ea832', 'stroke-width="1.6"') +
      seg(83, 68, 9) + seg(71, 73, 12) + seg(57, 74, 14) +
      // antennae
      tube(P, 'M31 41 Q27 30 23 25', 1.4, '#5ea832') + tube(P, 'M45 41 Q49 30 53 25', 1.4, '#5ea832') +
      P.circ(23, 24, 3.2, '#ffe36a', 'stroke-width="1.8"') + P.circ(53, 24, 3.2, '#ffe36a', 'stroke-width="1.8"') +
      P.path(cloud(38, 59, 20, 19, 16, 0.56), green) +
      P.hl(29, 49, 5, 3) +
      P.eyes(38, 58, 14, 5.4) + P.blush(38, 65, 24, 3.6, 2.1) + P.mouth(38, 65.5, 'open', 0.7);
  },

  chouchou(P) {
    const upper = 'M48 54 C40 34 22 14 11 22 C3 30 8 50 20 56 C30 61 42 60 48 58Z';
    const lower = 'M48 60 C36 59 22 64 19 76 C17 87 30 90 39 84 C46 79 48 69 48 63Z';
    const wing = P.path(upper, P.fill('#ffe6f2', '#ff9ccc', '#f06aa8', 0.7, 0.4)) +
      P.path(lower, P.fill('#e3f5ff', '#8fd0ff', '#5aa8f0', 0.7, 0.3)) +
      `<circle cx="24" cy="36" r="6" fill="#ffe36a"/><circle cx="24" cy="36" r="2.6" fill="#fff6c0"/>` +
      `<circle cx="15" cy="46" r="2.4" fill="#fff"/><circle cx="34" cy="50" r="2.4" fill="#ffe36a"/>` +
      `<circle cx="30" cy="76" r="4.2" fill="#fff" opacity="0.85"/><circle cx="24" cy="82" r="1.8" fill="#ffe36a"/>`;
    return P.shadow(50, 93, 20) +
      wing + `<g transform="translate(100 0) scale(-1 1)">${wing}</g>` +
      // antennae
      tube(P, 'M45 35 Q42 24 36 22 Q33 21 34 18', 1.3, '#5ea832') + tube(P, 'M55 35 Q58 24 64 22 Q67 21 66 18', 1.3, '#5ea832') +
      P.circ(34, 17, 2.6, '#ff9ccc', 'stroke-width="1.6"') + P.circ(66, 17, 2.6, '#ff9ccc', 'stroke-width="1.6"') +
      // body + head
      P.ell(50, 70, 7, 15, P.fill('#e8fcc0', '#94d64e', '#5ea832')) +
      P.line('M44.5 68 Q50 70 55.5 68 M44.5 75 Q50 77 55.5 75', 1.2, 'rgba(60,110,30,.5)') +
      P.circ(50, 46, 14.5, P.fill('#e8fcc0', '#94d64e', '#5ea832')) +
      P.hl(44, 39, 4, 2.4) +
      P.eyes(50, 46, 12, 4.8) + P.blush(50, 51.5, 20, 3, 1.8) + P.mouth(50, 52, 'smile', 0.6) +
      P.sparkle(86, 86, 3);
  },

  neko(P) {
    const fur = P.fill('#fffaf0', '#ffe1b8', '#f2bb7c');
    return P.shadow(50, 92, 28) +
      // curly tail
      tube(P, 'M60 84 Q86 88 84 68 Q83 58 76 57', 6.5, '#f7b26a') +
      `<path d="M84 72 Q84 66 82 63" stroke="#e8893a" stroke-width="2.4" fill="none" stroke-linecap="round"/>` +
      P.ell(50, 77, 17, 13.5, fur) +
      P.ell(50, 80, 9, 8, '#fffdf8', 'stroke-width="0"') +
      P.feet(89, [41, 59], '#fff6e8', 5.5, 3.6) +
      // ears
      P.path('M28 38 Q24 18 30 13 Q40 18 47 27Z', fur) + P.flat('M30 31 Q28 21 31 18 Q37 22 41 27Z', '#ffadc0') +
      P.path('M72 38 Q76 18 70 13 Q60 18 53 27Z', fur) + P.flat('M70 31 Q72 21 69 18 Q63 22 59 27Z', '#ffadc0') +
      P.ell(50, 47, 25, 20.5, fur) +
      // tabby stripes
      P.flat('M44 27.5 Q46 33 47.5 27 Z M50 27 Q51 34.5 52.5 27 Z M53 27.2 Q54.5 33 56 27.7Z', '#f29a4a') +
      P.flat('M25.5 44 Q30 45 31 47 Q29 48.5 25.2 48Z M74.5 44 Q70 45 69 47 Q71 48.5 74.8 48Z', '#f29a4a') +
      P.hl(37, 35, 6.5, 3.4) +
      P.eyes(50, 48, 19, 6.4, 'shiny', '#3f7a3a') +
      P.path('M48 54.5 L52 54.5 L50 56.8Z', '#ff8a9e', 'stroke-width="1"') +
      P.mouth(50, 57, 'cat', 0.8) + P.blush(50, 56, 33) +
      P.line('M26 54 L16 52 M26 57.5 L16 59 M74 54 L84 52 M74 57.5 L84 59', 1.1, '#8a6a52') +
      // red collar + gold bell
      tube(P, 'M34 64.5 Q50 72 66 64.5', 3, '#e8433a') +
      P.circ(50, 72, 4.6, P.fill('#fff6b8', '#ffd23e', '#d9a019'), 'stroke-width="1.8"') +
      P.line('M50 73.5 L50 76', 1.2, P.OUT) + `<circle cx="50" cy="73" r="1" fill="#5a3b2b"/>` +
      P.line('M45.6 70.8 L54.4 70.8', 1, '#c08a16');
  },

  inu(P) {
    const tan = P.fill('#ffe0b0', '#e8a85e', '#c07a36');
    const cream = '#fff4e2';
    return P.shadow(50, 92, 28) +
      // curly tail
      P.circ(75, 66, 8.5, tan) + P.circ(75, 66, 3.6, cream, 'stroke-width="1.8"') +
      P.ell(50, 77, 18, 13.5, tan) +
      P.ell(50, 80, 10, 8.5, cream, 'stroke-width="0"') +
      P.feet(89, [40, 60], cream, 5.8, 3.8) +
      // ears
      P.path('M29 38 Q26 22 30 18 Q38 21 46 29Z', tan) + P.flat('M31.5 32 Q30 24 32 22 Q36 24 40 28.5Z', '#b8662e') +
      P.path('M71 38 Q74 22 70 18 Q62 21 54 29Z', tan) + P.flat('M68.5 32 Q70 24 68 22 Q64 24 60 28.5Z', '#b8662e') +
      P.ell(50, 47, 24.5, 20.5, tan) +
      // cream face (urajiro)
      `<path d="M27 50 Q30 67 50 67 Q70 67 73 50 Q68 47 61 50 Q56 54 50 54 Q44 54 39 50 Q32 47 27 50Z" fill="${cream}"/>` +
      `<ellipse cx="41" cy="38" rx="3" ry="2" fill="${cream}"/><ellipse cx="59" cy="38" rx="3" ry="2" fill="${cream}"/>` +
      P.hl(37, 35, 6.5, 3.4) +
      P.eyes(50, 46, 19, 6.2) +
      `<ellipse cx="50" cy="54" rx="3" ry="2.1" fill="#2b1d16"/><ellipse cx="49" cy="53.3" rx="1" ry="0.6" fill="#fff" opacity="0.7"/>` +
      P.mouth(50, 57, 'tongue', 0.85) + P.blush(50, 56, 34) +
      // blue bandana
      P.path('M35 65 Q50 71 65 65 L60 69 Q55 76 50 79 Q45 76 40 69Z', P.fill('#bfe4ff', '#5aa8f0', '#3a7fd0'), 'stroke-width="1.8"') +
      `<circle cx="47" cy="71" r="0.9" fill="#fff"/><circle cx="53" cy="71" r="0.9" fill="#fff"/><circle cx="50" cy="75" r="0.9" fill="#fff"/>`;
  },

  nasu(P) {
    const purple = P.fill('#e2c6ff', '#9b5ad8', '#5e2a9c');
    return P.shadow(50, 92, 27) +
      P.feet(89, [40, 60], '#7a3fb8', 5.5, 3.4) +
      P.ell(19, 70, 4, 6, '#8a4ac8', 'transform="rotate(30 19 70)"') +
      P.ell(81, 70, 4, 6, '#8a4ac8', 'transform="rotate(-30 81 70)"') +
      P.path('M50 24 C60 24 63 33 65 43 C68 55 81 60 81 74 C81 86 67 91 50 91 C33 91 19 86 19 74 C19 60 32 55 35 43 C37 33 40 24 50 24Z', purple) +
      P.hl(33, 62, 4, 9, 25, 0.5) + P.hl(42, 36, 2.2, 5, 15, 0.5) +
      // stem + star cap
      tube(P, 'M50 26 Q50 17 56 12', 3, '#6cc24a') +
      P.path(roundPoly(spiky(50, 29, [-160, -20, 25, 65, 115, 155], 19, 11, 6), 0.2), P.fill('#c8f59a', '#6cc24a', '#3f8f30')) +
      P.eyes(50, 66, 17, 5.8) + P.blush(50, 73, 28, 4, 2.3, '#ff9ad2') + P.mouth(50, 73.5, 'smile', 0.8);
  },

  ushi(P) {
    const white = P.fill('#ffffff', '#f7f3ee', '#d9d0c6');
    const spot = '#4a3a34';
    return P.shadow(50, 92, 28) +
      P.ell(50, 78, 19, 12.5, white) +
      P.flat('M32 75 Q35 69 41 71 Q43 77 37 80 Q32 80 32 75Z M62 72 Q68 70 68.5 76 Q66 81 61 79 Q59 75 62 72Z', spot) +
      P.feet(89, [40, 60], '#7a6660', 5.5, 3.4) +
      // horns + ears
      P.path('M35 31 Q30 22 33 16 Q39 21 41 28Z', '#fff1c8') + P.path('M65 31 Q70 22 67 16 Q61 21 59 28Z', '#fff1c8') +
      P.path('M29 42 Q17 37 12 43 Q18 50 29 48Z', white) + P.flat('M26.5 43.2 Q19 40.5 15.5 43.6 Q19.5 47 26.5 46.4Z', '#ffb6c8') +
      P.path('M71 42 Q83 37 88 43 Q82 50 71 48Z', white) + P.flat('M73.5 43.2 Q81 40.5 84.5 43.6 Q80.5 47 73.5 46.4Z', '#ffb6c8') +
      P.ell(50, 46, 24, 20, white) +
      P.flat('M56 32 Q62 29 66 32 Q70 38 65 41 Q58 41 56 36Z M27 52 Q30 47 34 50 Q35 56 30 58Z', spot) +
      P.flat('M44 29 Q46 22 50 26 Q53 21 56 28 Q50 31 44 29Z', spot) +
      P.hl(36, 36, 6, 3.2) +
      P.eyes(50, 44, 20, 6) + P.blush(50, 52, 38, 3.6, 2.2) +
      P.ell(50, 57, 14, 8.5, P.fill('#ffe6ec', '#ffb6c8', '#f590aa'), 'stroke-width="1.8"') +
      `<ellipse cx="44.5" cy="56" rx="1.5" ry="2.1" fill="#c45a78"/><ellipse cx="55.5" cy="56" rx="1.5" ry="2.1" fill="#c45a78"/>` +
      P.mouth(50, 60, 'smile', 0.7) +
      // collar + cowbell
      tube(P, 'M34 65 Q50 72 66 65', 2.6, '#e8433a') +
      P.path('M46 69 L54 69 L56.5 79 L43.5 79Z', P.fill('#fff6b8', '#ffd23e', '#d9a019'), 'stroke-width="1.8"') +
      `<circle cx="50" cy="79.5" r="1.6" fill="#5a3b2b"/>`;
  },

  // ── もり ───────────────────────────────────────────────────
  donguri(P) {
    let scales = '';
    [[25, 21], [32, 28], [39, 31], [46, 32]].forEach(([y, half], r) => {
      for (let x = 50 - half + (r % 2 ? 3.5 : 0); x <= 50 + half - 7; x += 7) scales += `M${f1(x)} ${y} q3.5 4.5 7 0 `;
    });
    return P.shadow(50, 92, 25) +
      P.feet(89, [39, 61], '#9c6430', 5, 3.2) +
      P.path('M50 42 C68 42 78 54 78 67 C78 80 64 88 53 90 L50 93 L47 90 C36 88 22 80 22 67 C22 54 32 42 50 42Z',
        P.fill('#f3c58e', '#c98b4a', '#93592a')) +
      P.hl(32, 62, 4, 6, 20) +
      tube(P, 'M50 18 Q50 11 55 8', 2.4, '#8a5a34') +
      P.path('M16 47 C16 28 31 17 50 17 C69 17 84 28 84 47 C84 54 70 55 50 55 C30 55 16 54 16 47Z',
        P.fill('#d6b088', '#a07a52', '#6e4a2c')) +
      P.line(scales, 1.3, 'rgba(90,59,43,.55)') +
      P.hl(30, 27, 6, 2.6) +
      P.eyes(50, 68, 16, 5.4) + P.blush(50, 75, 27, 3.8, 2.2) + P.mouth(50, 75.5, 'smile', 0.75);
  },

  tanuki(P) {
    const fur = P.fill('#ecd1ac', '#b88a5c', '#86603e');
    const dark = '#5e4232';
    const tail = 'M78 46 m-9 0 a9 17 0 1 0 18 0 a9 17 0 1 0 -18 0';
    return P.shadow(50, 92, 31) +
      // striped tail
      `<g transform="translate(4 18) rotate(28 78 46)">` + P.path(tail, fur) +
      P.flat(band(78, 46, 9, 17, 29, 35), dark) + P.flat(band(78, 46, 9, 17, 41, 46), dark) + `</g>` +
      P.ell(50, 74, 23, 16, fur) +
      P.ell(50, 77, 14.5, 11.5, '#fff3e0', 'stroke-width="1.6"') +
      P.feet(89, [39, 61], dark, 5.8, 3.6) +
      P.ell(35, 72, 4.5, 5.5, dark, 'transform="rotate(-30 35 72)"') + P.ell(65, 72, 4.5, 5.5, dark, 'transform="rotate(30 65 72)"') +
      // ears + head
      P.ell(31, 31, 6.5, 7, dark) + P.ell(69, 31, 6.5, 7, dark) +
      P.ell(50, 46, 25, 20.5, fur) +
      P.flat('M28.5 45 Q32 37 42 40 Q48 45 43.5 52 Q35 57 29.5 51Z M71.5 45 Q68 37 58 40 Q52 45 56.5 52 Q65 57 70.5 51Z', '#7a5640') +
      `<ellipse cx="50" cy="55" rx="9" ry="6.2" fill="#fff4e4"/>` +
      P.hl(38, 33, 6, 3) +
      P.eyes(50, 46, 21, 6) +
      `<ellipse cx="50" cy="52.5" rx="2.6" ry="1.8" fill="#2b1d16"/>` +
      P.mouth(50, 55.5, 'cat', 0.75) + P.blush(50, 58, 38, 3.6, 2.1) +
      P.leaf(52, 29, 16, -18, P.fill('#c8f59a', '#6cc24a', '#4c9a34'));
  },

  fukurou(P) {
    const brown = P.fill('#dcae7e', '#a8723f', '#784c28');
    const cream = '#fbe9cc';
    let chev = '';
    [[44, 72], [56, 72], [50, 78], [40, 79], [60, 79]].forEach(([x, y]) => { chev += `M${x - 2.4} ${y} L${x} ${y + 2.2} L${x + 2.4} ${y} `; });
    return P.shadow(50, 92, 27) +
      P.path('M25 36 L20 14 L40 27Z', brown) + P.path('M75 36 L80 14 L60 27Z', brown) +
      P.path('M50 24 C70 24 82 40 82 60 C82 80 68 90 50 90 C32 90 18 80 18 60 C18 40 30 24 50 24Z', brown) +
      `<ellipse cx="50" cy="76" rx="17" ry="11.5" fill="${cream}"/>` +
      P.line(chev, 1.3, '#b07a48') +
      P.path('M21 54 Q12 68 21 83 Q29 74 28 61Z', '#8a5a32', 'stroke-width="2"') +
      P.path('M79 54 Q88 68 79 83 Q71 74 72 61Z', '#8a5a32', 'stroke-width="2"') +
      // facial disc
      `<path d="M50 39 Q40 32 32 37 Q24 43 26 52 Q29 62 39 62 Q46 62 50 57 Q54 62 61 62 Q71 62 74 52 Q76 43 68 37 Q60 32 50 39Z" fill="${cream}"/>` +
      P.hl(33, 33, 5, 2.6) +
      P.eyes(50, 49, 23, 7, 'shiny', '#c8701a') + P.blush(50, 59, 40, 3.4, 2) +
      P.path('M46.5 55 L53.5 55 L50 60.5Z', '#ffb03a', 'stroke-width="1.5"') +
      P.feet(89, [42, 58], '#ffb03a', 4.5, 3) +
      P.sparkle(86, 16, 4) + P.sparkle(13, 20, 2.6);
  },

  hachi(P) {
    const yel = P.fill('#fff6b0', '#ffd23e', '#eea81c');
    const wing = 'fill-opacity="0.85" stroke-width="2"';
    return P.shadow(50, 93, 21) +
      P.ell(32, 31, 9, 14, '#eaf6ff', wing + ' transform="rotate(-38 32 31)"') +
      P.ell(68, 31, 9, 14, '#eaf6ff', wing + ' transform="rotate(38 68 31)"') +
      P.line('M36 36 Q31 31 28 24 M64 36 Q69 31 72 24', 1.1, 'rgba(90,120,160,.45)') +
      P.path('M45.5 84 L50 91 L54.5 84Z', '#5a3b2b', 'stroke-width="1.6"') +
      tube(P, 'M44 37 Q41 26 36 21', 1.3, '#5a3b2b') + tube(P, 'M56 37 Q59 26 64 21', 1.3, '#5a3b2b') +
      `<circle cx="35.5" cy="20.5" r="2.8" fill="#5a3b2b"/><circle cx="64.5" cy="20.5" r="2.8" fill="#5a3b2b"/>` +
      P.ell(50, 60, 28, 26, yel) +
      P.flat(band(50, 60, 28, 26, 66, 72.5), '#5a3b2b') + P.flat(band(50, 60, 28, 26, 78.5, 84), '#5a3b2b') +
      P.hl(36, 44, 7, 3.6) +
      P.eyes(50, 51, 18, 5.8) + P.blush(50, 58.5, 30) + P.mouth(50, 58.5, 'open', 0.8) +
      P.sparkle(86, 64, 3.4) + P.sparkle(14, 56, 2.6);
  },

  mushi(P) {
    return P.shadow(50, 92, 26) +
      tube(P, 'M28 67 L18 62 M27 77 L17 80 M72 67 L82 62 M73 77 L83 80', 1.8, '#6b4426') +
      P.feet(89, [38, 62], '#8a5a34', 5, 3.2) +
      tube(P, 'M42 39 Q37 31 32 29', 1.3, '#6b4426') + tube(P, 'M58 39 Q63 31 68 29', 1.3, '#6b4426') +
      P.circ(31.5, 28.5, 2.4, '#8a5a34', 'stroke-width="1.6"') + P.circ(68.5, 28.5, 2.4, '#8a5a34', 'stroke-width="1.6"') +
      P.path('M46 40 Q47 32 50 30 Q53 32 54 40Z', P.fill('#c08a5a', '#8a5a34', '#6b4426')) +
      P.circ(50, 63, 26, P.fill('#f6d2a2', '#d39a5c', '#a06a36')) +
      P.path('M27.5 50 A26 26 0 0 1 72.5 50 Q50 56 27.5 50Z', P.fill('#c08a5a', '#8a5a34', '#6b4426')) +
      P.hl(40, 43, 5, 2.2) +
      P.line('M50 54 L50 57.5', 1.4, '#6b4426') +
      `<ellipse cx="50" cy="70" rx="16" ry="11.5" fill="#fbe2bc" opacity="0.9"/>` +
      `<g fill="#b47a44"><ellipse cx="29" cy="70" rx="2.6" ry="3.4"/><ellipse cx="71" cy="70" rx="2.6" ry="3.4"/><ellipse cx="33" cy="81" rx="1.8" ry="2.2"/><ellipse cx="67" cy="81" rx="1.8" ry="2.2"/></g>` +
      P.eyes(50, 66, 16, 5.4) + P.blush(50, 73, 26, 3.6, 2.1) + P.mouth(50, 73.5, 'smile', 0.75);
  },

  kabutomushi(P) {
    const shell = P.fill('#e09a68', '#8e4626', '#5a2812');
    const dark = P.fill('#b8724a', '#6a3218', '#42200c');
    return P.shadow(50, 93, 33) +
      tube(P, 'M26 66 L14 58 M24 76 L11 77 M28 85 L18 91 M74 66 L86 58 M76 76 L89 77 M72 85 L82 91', 2, '#5a2812') +
      // big forked horn
      P.path('M45.5 46 C45.5 36 46.5 29 46.5 23 L38 13 Q36.5 8.5 41 9 L50 18.5 L59 9 Q63.5 8.5 62 13 L53.5 23 C53.5 29 54.5 36 54.5 46Z', dark) +
      P.hl(48.5, 32, 1.3, 6, 0, 0.45) +
      P.ell(50, 65, 32, 26, shell) +
      P.line('M50 60 L50 64.5', 1.6, '#4a200c') +
      P.path('M20 57 A32 26 0 0 1 80 57 Q50 63.5 20 57Z', dark) +
      P.hl(35, 47, 7, 2.6) + P.hl(25, 67, 2.4, 5, 15, 0.35) + P.hl(72, 66, 2, 4, -15, 0.3) +
      `<ellipse cx="50" cy="74" rx="17" ry="11.5" fill="#f4c290" opacity="0.9"/>` +
      P.eyes(50, 70, 17, 5.8) + P.blush(50, 77, 28, 3.8, 2.2) + P.mouth(50, 77.5, 'open', 0.8) +
      P.sparkle(84, 40, 3.6) + P.sparkle(16, 36, 2.6);
  },

  hebi(P) {
    const green = P.fill('#dcf8b0', '#7cc850', '#4c9a34');
    const cream = '#fff6d8';
    const belly = (cx, cy, rx, ry) => P.flat(band(cx, cy, rx, ry, cy + ry * 0.25, cy + ry), cream) +
      P.line([-0.6, -0.3, 0, 0.3, 0.6].map(k => `M${f1(cx + k * rx)} ${f1(cy + ry * 0.3)} L${f1(cx + k * rx)} ${f1(cy + ry * 0.92)}`).join(' '), 0.9, 'rgba(160,130,70,.45)');
    return P.shadow(50, 92, 32) +
      // tail tip curling out
      P.path('M70 84 Q84 86 87 77 Q88 72 84 70 Q85 76 80 78 Q74 79 70 78Z', green, 'stroke-width="2"') +
      P.ell(50, 80, 32, 10.5, green) + belly(50, 80, 32, 10.5) +
      P.ell(50, 66, 25, 9.5, green) + belly(50, 66, 25, 9.5) +
      `<g fill="#5ea832"><ellipse cx="32" cy="76" rx="2.4" ry="1.4"/><ellipse cx="68" cy="76" rx="2.4" ry="1.4"/><ellipse cx="34" cy="62.5" rx="2" ry="1.2"/><ellipse cx="66" cy="62.5" rx="2" ry="1.2"/></g>` +
      P.ell(50, 43, 23, 18, green) +
      `<g fill="#5ea832"><ellipse cx="50" cy="29.5" rx="2.6" ry="1.5"/><ellipse cx="42" cy="31" rx="1.8" ry="1.1"/><ellipse cx="58" cy="31" rx="1.8" ry="1.1"/></g>` +
      P.hl(38, 34, 6, 3) +
      P.eyes(50, 42, 19, 6) + P.blush(50, 50, 32) +
      // little forked tongue
      P.line('M50 52 L50 58 M50 57.5 L48 60 M50 57.5 L52 60', 1.6, '#e84a5f') +
      P.line('M45.5 51 Q50 54 54.5 51', 1.7, '#2b1d16');
  },

  shika(P) {
    const fawn = P.fill('#f8d6a8', '#d9945a', '#a86a36');
    const antler = '#f6e4bc';
    return P.shadow(50, 92, 28) +
      P.ell(50, 77, 17, 13, fawn) +
      `<g fill="#fff8ec"><circle cx="37" cy="73" r="1.8"/><circle cx="35" cy="80" r="1.4"/><circle cx="63" cy="73" r="1.8"/><circle cx="65" cy="80" r="1.4"/></g>` +
      P.ell(50, 81, 8.5, 7.5, '#fff6ea', 'stroke-width="0"') +
      P.feet(89, [40, 60], '#7a4f2e', 5, 3.4) +
      // antlers
      tube(P, 'M41 32 Q37 22 39 13 M38.5 21 Q33 20 30 15 M59 32 Q63 22 61 13 M61.5 21 Q67 20 70 15', 2.4, antler) +
      // ears
      P.path('M30 42 Q16 36 11 42 Q16 50 30 48Z', fawn) + P.flat('M27.5 43.2 Q19 40 15 43 Q19 47 27.5 46.4Z', '#ffc2c8') +
      P.path('M70 42 Q84 36 89 42 Q84 50 70 48Z', fawn) + P.flat('M72.5 43.2 Q81 40 85 43 Q81 47 72.5 46.4Z', '#ffc2c8') +
      P.ell(50, 46, 22, 19, fawn) +
      `<path d="M31 52 Q36 65 50 65 Q64 65 69 52 Q60 56 50 56 Q40 56 31 52Z" fill="#fff6ea"/>` +
      `<g fill="#fff8ec"><circle cx="35" cy="37" r="1.5"/><circle cx="65" cy="37" r="1.5"/><circle cx="40" cy="32" r="1.1"/><circle cx="60" cy="32" r="1.1"/></g>` +
      P.hl(39, 35, 5.5, 3) +
      P.eyes(50, 46, 17, 6) +
      `<ellipse cx="50" cy="54.5" rx="2.6" ry="1.8" fill="#2b1d16"/>` +
      P.mouth(50, 57.5, 'cat', 0.75) + P.blush(50, 55, 30) +
      // a rice cracker (senbei) held in little hooves
      P.circ(50, 80, 6.5, P.fill('#fbe2a8', '#e8b868', '#c8903e'), 'stroke-width="1.8"') +
      `<g fill="#b87a36" opacity="0.6"><circle cx="47.5" cy="78" r="0.8"/><circle cx="52.5" cy="79" r="0.8"/><circle cx="49" cy="82.5" r="0.8"/></g>` +
      P.ell(42, 80, 3.6, 3.2, '#e8a668') + P.ell(58, 80, 3.6, 3.2, '#e8a668');
  },

  hana(P) {
    const leafG = P.fill('#c8f59a', '#6cc24a', '#4c9a34');
    return P.shadow(50, 93, 20) +
      tube(P, 'M50 64 L50 78', 2.6, '#6cc24a') +
      P.leaf(49, 74, 15, -62, leafG) + P.leaf(51, 74, 15, 62, leafG) +
      // tiny pot
      P.path('M37 79 L63 79 L60 91 L40 91Z', P.fill('#f6b08a', '#e07a4a', '#b8562e')) +
      P.rect(34, 74, 32, 6.5, 2.5, P.fill('#f8bc98', '#e8865a', '#c0603a')) +
      // tulip head
      P.path('M26 27 Q34 29 38 37 Q42 25 50 19 Q58 25 62 37 Q66 29 74 27 C79 46 72 66 50 66 C28 66 21 46 26 27Z',
        P.fill('#ffc0cc', '#ff5f78', '#d8304e', 0.4, 0.25)) +
      P.line('M38 37 Q34 48 37 60 M62 37 Q66 48 63 60', 1.3, 'rgba(160,30,60,.35)') +
      P.hl(33, 35, 3.4, 6, 15) +
      P.eyes(50, 47, 15, 5.4) + P.blush(50, 54, 24, 3.6, 2.1, '#ffd0d8') + P.mouth(50, 54, 'open', 0.8);
  },

  semi(P) {
    const wing = 'M46 42 C33 42 20 56 15 73 C12 85 18 93 26 89 C37 81 45 62 47 48Z';
    const veins = 'M45 46 C36 54 26 68 20 85 M45 52 C39 63 33 75 26 87 M33 52 L36 60 M26 64 L31 69 M21 77 L27 79';
    const w = P.path(wing, '#e4f6ee', 'fill-opacity="0.8" stroke-width="2"') + P.line(veins, 1.2, 'rgba(100,80,50,.55)');
    const body = P.fill('#d8c08a', '#a8804a', '#7a5630');
    return P.shadow(50, 92, 27) +
      w + `<g transform="translate(100 0) scale(-1 1)">${w}</g>` +
      tube(P, 'M38 80 L34 89 M62 80 L66 89', 1.6, '#6b4426') +
      P.ell(50, 71, 16, 17, body) +
      P.flat(band(50, 71, 16, 17, 72, 75.5), '#7a5630') + P.flat(band(50, 71, 16, 17, 80, 83), '#7a5630') +
      // bulgy side eyes + wide head
      P.circ(26.5, 43, 6, P.fill('#8a6a4a', '#5a3b2b', '#3a2418')) + P.circ(73.5, 43, 6, P.fill('#8a6a4a', '#5a3b2b', '#3a2418')) +
      P.ell(50, 46, 23, 16, P.fill('#e2f7b8', '#8fd06a', '#5aa040')) +
      `<circle cx="24.8" cy="41" r="1.7" fill="#fff" opacity="0.8"/><circle cx="71.8" cy="41" r="1.7" fill="#fff" opacity="0.8"/>` +
      P.hl(40, 37, 5, 2.6) +
      P.eyes(50, 46, 15, 5.2) + P.blush(50, 52, 25, 3.4, 2) + P.mouth(50, 52.5, 'open', 0.75) +
      // singing
      P.line('M80 20 Q84 24 80 28 M85 16 Q91 24 85 32', 1.6, '#8fd06a');
  },
};
