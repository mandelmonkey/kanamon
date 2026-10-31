// Creature art batch b — see tools/ART_BRIEF.md

// Outlined tube: a thick brown stroke under a coloured one (legs, tentacles, stalks).
const tube = (P, d, w, c) => P.line(d, w + 4.4, P.OUT) + P.line(d, w, c);
// Mirror an absolute M/L/Q/C/Z path left↔right across x=50.
const flipX = (d) => { let i = 0; return d.replace(/-?\d*\.?\d+/g, (n) => (i++ % 2 ? n : +(100 - n).toFixed(1))); };
const both = (d) => [d, flipX(d)];
// Flat-topped hexagon path.
const hex = (cx, cy, r) => {
  let d = '';
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3;
    d += (i ? ' L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r).toFixed(1);
  }
  return d + 'Z';
};
// Little see-through bubble.
const bubble = (P, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#e4f7ff" fill-opacity="0.75" stroke="#5aaee0" stroke-width="1.3"/>` +
  `<circle cx="${x - r * 0.35}" cy="${y - r * 0.35}" r="${r * 0.28}" fill="#fff"/>`;

export default {
  kani(P) {
    const red = P.fill('#ffb4a2', '#f2533f', '#c4302a');
    const legs = ['M30 71 L18 73 L15 81', 'M33 77 L22 81 L21 89', 'M40 83 L34 88 L35 91'];
    const claw = 'M19 36 Q14 30 14 21 Q7 24 6 33 Q6 45 18 47 Q30 47 31 36 Q31 28 26 23 Q25 31 19 36Z';
    return P.shadow(50, 92, 30) +
      legs.flatMap(both).map(d => tube(P, d, 3.2, '#ea4a3b')).join('') +
      both('M31 63 Q22 60 20 45').map(d => tube(P, d, 5, '#ee4f3e')).join('') +
      both(claw).map(d => P.path(d, red)).join('') +
      P.hl(13, 31, 2.4, 4, 15) + P.hl(87, 31, 2.4, 4, -15, 0.4) +
      tube(P, 'M42 56 L40 42', 3.4, '#ee4f3e') + tube(P, 'M58 56 L60 42', 3.4, '#ee4f3e') +
      P.ell(50, 68, 26, 18, red) +
      `<g fill="#ffd3c6" opacity="0.85"><ellipse cx="33" cy="75" rx="2.4" ry="1.7"/><ellipse cx="67" cy="75" rx="2.4" ry="1.7"/><ellipse cx="64" cy="57" rx="1.9" ry="1.3"/></g>` +
      P.hl(37, 58, 6, 3) +
      P.circ(40, 37, 7.6, '#fffaf4') + P.circ(60, 37, 7.6, '#fffaf4') +
      P.eyes(50, 37.5, 20, 5.1) +
      P.blush(50, 69, 30, 4, 2.4, '#ffc0c6') + P.mouth(50, 67, 'open', 0.9);
  },

  tako(P) {
    const pink = P.fill('#ffc8cc', '#ff6f7d', '#e0475a');
    const legs = ['M31 60 Q17 68 14 79 Q12 89 19 89 Q25 89 24 83', 'M42 66 Q38 78 34 84 Q31 90 37 90'];
    const all = legs.flatMap(both);
    return P.shadow(50, 92, 30) +
      all.map(d => P.line(d, 11, P.OUT)).join('') + all.map(d => P.line(d, 6.6, '#ff7584')).join('') +
      `<g fill="#ffd9dc"><circle cx="17" cy="78" r="1.3"/><circle cx="20" cy="72" r="1.3"/><circle cx="83" cy="78" r="1.3"/><circle cx="80" cy="72" r="1.3"/><circle cx="37" cy="80" r="1.2"/><circle cx="63" cy="80" r="1.2"/></g>` +
      P.ell(50, 44, 27, 25, pink) +
      `<g fill="#f2566a" opacity="0.45"><ellipse cx="60" cy="26" rx="3" ry="2"/><ellipse cx="68" cy="31" rx="2.2" ry="1.6"/><ellipse cx="55" cy="22" rx="1.6" ry="1.1"/></g>` +
      P.hl(37, 27, 6, 3.2) +
      // hachimaki headband with a knot
      P.path('M77 41 Q87 33 91 37 Q86 41 79 44Z', '#fffaf2') + P.path('M78 44 Q88 46 89 53 Q83 51 77 46Z', '#fffaf2') +
      P.path('M24 37 Q50 26 76 37 L77 45 Q50 34 23 45Z', '#fffaf2') +
      P.circ(77, 42, 3.4, '#fffaf2') +
      P.eyes(50, 54, 18, 5.8) + P.blush(50, 61, 32, 4.2, 2.4, '#ff4f6e') + P.mouth(50, 61, 'o', 1);
  },

  ika(P) {
    const white = P.fill('#ffffff', '#f8f1fb', '#dccdea');
    const legs = ['M37 70 Q34 79 37 87', 'M44 72 Q42 81 45 89'];
    const all = [...legs.flatMap(both), 'M50 72 Q51 81 50 89'];
    const arm = 'M33 66 Q21 70 19 81';
    return P.shadow(50, 92, 26) +
      both(arm).map(d => tube(P, d, 3.6, '#f6eef9')).join('') +
      P.ell(17, 84, 4.2, 5.2, white, 'transform="rotate(20 17 84)"') + P.ell(83, 84, 4.2, 5.2, white, 'transform="rotate(-20 83 84)"') +
      all.map(d => P.line(d, 9, P.OUT)).join('') + all.map(d => P.line(d, 4.6, '#f6eef9')).join('') +
      P.path('M50 10 Q56 13 81 35 Q84 40 78 40 L22 40 Q16 40 19 35 Q44 13 50 10Z', white) +
      P.path('M32 72 L31 42 Q31 24 50 22 Q69 24 69 42 L68 72 Q68 77 50 77 Q32 77 32 72Z', white) +
      `<g fill="#ffb9a6" opacity="0.8"><circle cx="40" cy="31" r="1.5"/><circle cx="58" cy="29" r="1.8"/><circle cx="62" cy="38" r="1.2"/><circle cx="27" cy="36" r="1.2"/><circle cx="72" cy="35" r="1.4"/><circle cx="62" cy="70" r="1.2"/></g>` +
      P.hl(40, 33, 4, 6, 0) +
      P.eyes(50, 54, 16, 5.6, 'shiny', '#3b3f72') + P.blush(50, 61.5, 27, 4, 2.3) + P.mouth(50, 61.5, 'smile', 0.85) +
      P.sparkle(84, 18, 3.5, '#d8f0ff') + P.sparkle(14, 22, 2.6, '#d8f0ff');
  },

  sakana(P) {
    const blue = P.fill('#c4ecff', '#4fb0f2', '#2b7fd0');
    const fin = P.fill('#eefbff', '#8fd8f8', '#56b0e4');
    return P.shadow(46, 92, 25) +
      P.path('M66 57 Q76 43 88 36 Q93 36 92 42 Q87 57 92 72 Q93 78 88 78 Q76 71 66 57Z', fin) +
      P.line('M79 48 L87 44 M80 57 L89 57 M79 66 L87 70', 1.4, 'rgba(40,110,170,.45)') +
      P.path('M32 39 Q38 18 57 22 Q64 26 62 41Z', fin) +
      P.line('M42 26 L44 36 M51 23 L52 35', 1.3, 'rgba(40,110,170,.4)') +
      P.ell(34, 85, 5.4, 3.6, '#8fd8f8') + P.ell(53, 85, 5.4, 3.6, '#8fd8f8') +
      P.ell(44, 58, 28, 25, blue) +
      `<ellipse cx="42" cy="71" rx="19" ry="9" fill="#e9f7ff"/>` +
      P.line('M60 44 Q64 47 60 51 M66 50 Q70 53 66 57', 1.4, 'rgba(255,255,255,.55)') +
      P.hl(30, 43, 6, 3.4) +
      P.path('M60 64 Q71 60 73 71 Q66 75 60 68Z', fin) +
      P.eyes(40, 55, 17, 5.8, 'shiny', '#244a6b') + P.blush(40, 62, 27, 3.8, 2.2) + P.mouth(40, 63, 'open', 0.8) +
      bubble(P, 15, 28, 4.2) + bubble(P, 22, 17, 2.8) + bubble(P, 12, 12, 1.8);
  },

  same(P) {
    const grey = P.fill('#e2f2fc', '#86acd0', '#58799e');
    return P.shadow(48, 92, 32) +
      P.path('M70 58 Q81 42 89 24 Q94 22 94 29 Q92 47 85 58 Q91 68 94 78 Q94 84 88 81 Q79 72 70 64Z', grey) +
      P.path('M34 38 Q44 24 56 10 Q61 8 61 14 Q61 28 65 41Z', grey) +
      P.ell(46, 60, 32, 26, grey) +
      P.flat('M15 64 Q30 72 50 73 Q66 73 77 66 Q70 80 50 84 Q28 84 15 64Z', '#f7fbff') +
      P.hl(30, 43, 7, 3.6) +
      P.line('M55 51 Q57.5 56 55 61 M60 50 Q62.5 55 60 60 M65 51 Q67.5 56 65 61', 1.6, 'rgba(45,75,115,.5)') +
      P.path('M50 73 Q62 72 69 87 Q58 88 47 79Z', grey) +
      P.eyes(34, 53, 18, 6, 'shiny', '#244a6b') + P.blush(34, 61, 30, 4, 2.3) +
      `<path d="M26.5 63 Q34 72 41.5 63Z" fill="#c7404f" stroke="#2b1d16" stroke-width="1.6" stroke-linejoin="round"/>` +
      `<path d="M31 67.6 Q34 65.6 37 67.6 Q34 69.6 31 67.6Z" fill="#ff8a98"/>` +
      `<path d="M28.4 63.5 l1.5 2.3 l1.5 -2.3Z M32.5 63.5 l1.5 2.6 l1.5 -2.6Z M36.6 63.5 l1.5 2.3 l1.5 -2.3Z" fill="#fff"/>` +
      bubble(P, 14, 26, 3.6) + bubble(P, 20, 16, 2.4) + P.sparkle(82, 12, 3.2);
  },

  kame(P) {
    const skin = P.fill('#f1fcc8', '#a8db6c', '#7ab846');
    const shell = P.fill('#b8ea8c', '#5aa83c', '#3a7f2a');
    const legD = (x) => `M${x - 6} 74 L${x - 6} 86 Q${x - 6} 91 ${x} 91 Q${x + 6} 91 ${x + 6} 86 L${x + 6} 74Z`;
    return P.shadow(54, 92, 34) +
      P.path(legD(52), '#93c95a') + P.path(legD(84), '#93c95a') +
      P.path('M84 71 Q93 73 94 80 Q89 81 83 78Z', skin) +
      P.path(legD(42), skin) + P.path(legD(73), skin) +
      P.path('M34 72 C34 46 46 31 60 31 C74 31 86 46 86 72 Q60 80 34 72Z', shell) +
      P.flat(hex(60, 52, 9.5), '#92d466') + P.flat(hex(44.5, 61, 7.6), '#92d466') + P.flat(hex(75.5, 61, 7.6), '#92d466') +
      P.flat(hex(47, 41.5, 6.4), '#92d466') + P.flat(hex(73, 41.5, 6.4), '#92d466') + P.flat(hex(60, 34.5, 3.6), '#92d466') +
      P.hl(50, 38, 5, 2.6) +
      P.path('M29 71 Q60 79 91 71 Q92 77 87 78 Q60 85 33 78 Q28 77 29 71Z', '#e2f3a8') +
      P.path('M36 64 Q40 70 46 69 L45 56Z', skin) +
      P.circ(29, 52, 17, skin) +
      P.hl(22, 43, 4.4, 2.6) +
      P.eyes(29, 51, 14, 5.2) + P.blush(29, 58.5, 23, 3.4, 2) + P.mouth(29, 59, 'smile', 0.75);
  },
  kurage(P) {
    const dome = P.fill('#fff6fa', '#ffbad8', '#f08dbb');
    const tents = ['M27 57 Q23 65 28 72 Q33 79 28 87', 'M38 60 Q35 68 39 75 Q43 82 39 89'];
    const all = tents.flatMap(both);
    return P.shadow(50, 93, 20) +
      all.map(d => P.line(d, 7.4, P.OUT)).join('') + all.map(d => P.line(d, 3, '#ffcfe3')).join('') +
      P.path('M45 57 Q40 65 46 71 Q41 78 47 85 Q53 82 51 76 Q58 71 53 64 Q57 60 56 57Z', '#ffe1ee', 'stroke-width="2"') +
      P.path('M17 54 Q17 20 50 20 Q83 20 83 54 Q76.4 62 70.2 55 Q63.8 62 57.4 55 Q51 62 44.6 55 Q38.2 62 31.8 55 Q25.4 62 17 54Z', dome, 'fill-opacity="0.94"') +
      P.line('M23 51 Q26 54 30 52 Q34 55 38 52 Q42 55 46 52 Q50 55 54 52 Q58 55 62 52 Q66 55 70 52 Q74 54 77 51', 1.4, 'rgba(255,255,255,.8)') +
      P.hl(34, 30, 7, 3.6) + `<circle cx="66" cy="30" r="1.6" fill="#fff" opacity="0.7"/>` +
      P.eyes(50, 40, 18, 5.6) + P.blush(50, 46.5, 30, 4, 2.3) + P.mouth(50, 46.5, 'open', 0.8) +
      bubble(P, 84, 66, 3.4) + bubble(P, 89, 56, 2.2) + bubble(P, 13, 72, 2.6) + P.sparkle(14, 22, 3.4) + P.sparkle(87, 16, 2.6);
  },

  kujira(P) {
    const blue = P.fill('#b6e3ff', '#3f92e2', '#2664b8');
    const water = P.fill('#ffffff', '#cdeeff', '#8fd0f4');
    return P.shadow(46, 92, 34) +
      // rainbow behind the spout
      ['#ff8a8a', '#ffd25a', '#7fd0ff'].map((c, i) => P.line(`M${41 + i * 2.6} 30 A${12 - i * 2.6} ${12 - i * 2.6} 0 0 1 ${65 - i * 2.6} 30`, 2.6, c)).join('') +
      P.path('M66 74 Q80 68 78 47 Q73 43 68 35 Q67 31 71 31 Q77 32 80 39 Q83 32 89 31 Q93 31 92 35 Q87 43 82 47 Q84 70 72 80Z', blue) +
      P.ell(44, 64, 32, 25, blue) +
      P.flat('M15 70 Q40 79 72 72 Q66 87 44 89 Q22 89 15 70Z', '#e6f5ff') +
      P.line('M24 79 Q44 84 64 79 M31 84.5 Q44 87.5 57 85', 1.3, 'rgba(60,120,185,.35)') +
      P.hl(28, 48, 7, 3.6) +
      P.path('M53 74 Q65 72 69 83 Q59 85 53 79Z', blue) +
      P.path('M32 41 Q33 32 31 25 Q25 20 18 23 Q22 15 31 17 Q34 11 38 17 Q47 15 50 23 Q43 20 37 25 Q35 32 36 41Z', water, 'stroke-width="2"') +
      P.circ(16, 28, 2.2, water, 'stroke-width="1.6"') + P.circ(52, 28, 2.2, water, 'stroke-width="1.6"') +
      P.eyes(35, 61, 18, 5.8) + P.blush(35, 68, 30, 4, 2.3) + P.mouth(35, 68.5, 'smile', 1) +
      P.sparkle(60, 14, 3.4) + P.sparkle(10, 14, 2.4);
  },

  fune(P) {
    const wood = P.fill('#f8c890', '#d08a4c', '#9e6230');
    const sail = P.fill('#ffffff', '#fbf8f0', '#e3dccb');
    return P.shadow(50, 92, 34) +
      tube(P, 'M50 62 L50 15', 2.4, '#b9773e') +
      P.path('M51.5 14 L63 17.5 L51.5 21.5Z', '#ff6b6b', 'stroke-width="1.8"') +
      P.path('M53.5 20 Q73 36 79 58 L53.5 58Z', sail) +
      P.flat('M53.5 44 L74.5 44 Q76.5 49 77.6 53 L53.5 53Z', '#ff9a8a') +
      P.path('M46.5 24 Q34 40 27 58 L46.5 58Z', sail) +
      P.path('M12 60 Q50 66 88 60 Q84 82 68 86 L32 86 Q16 82 12 60Z', wood) +
      P.path('M11 58 Q50 64.5 89 58 L88.4 63 Q50 69.5 11.6 63Z', '#a86a3a') +
      P.line('M20 77 Q50 82 80 77', 1.3, 'rgba(90,50,20,.35)') +
      P.hl(22, 69, 4, 2.2) +
      P.eyes(50, 72, 19, 5.3) + P.blush(50, 78, 32, 4, 2.3) + P.mouth(50, 78, 'open', 0.8) +
      P.path('M9 87 Q15 82 21 87 Q27 82 33 87 Q39 82 45 87 Q51 82 57 87 Q63 82 69 87 Q75 82 81 87 Q87 82 91 86 L91 89 Q50 93 9 89Z', P.lin('#bfe9ff', '#6cc4ef'), 'stroke-width="2"') +
      P.sparkle(80, 22, 3.4, '#ffe58a') + P.sparkle(22, 34, 2.4, '#ffe58a');
  },

  suika(P) {
    let stripes = '';
    for (const k of [-0.93, -0.62, 0, 0.62, 0.93]) {
      let d = '';
      for (let i = 0; i <= 16; i++) {
        const lat = (-80 + i * 10) * Math.PI / 180, c = Math.cos(lat);
        d += (i ? ' L' : 'M') + (50 + k * 31 * c + (i % 2 ? 1.7 : -1.7) * c).toFixed(1) + ' ' + (59 + 31 * Math.sin(lat)).toFixed(1);
      }
      stripes += P.line(d, 3.6, '#2f7a24');
    }
    return P.shadow(50, 92, 28) +
      P.circ(50, 59, 31, P.fill('#d2f8a8', '#62c440', '#3a8c28')) + stripes + P.circ(50, 59, 31, 'none') +
      P.hl(35, 41, 7, 4) +
      P.line('M50 29 Q49 22 54 20 Q59 19 58 24', 2.4, '#5d7f26') +
      P.leaf(48, 28, 11, -55, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.eyes(50, 53, 20, 5.4) + P.blush(50, 61, 27, 3.6, 2.2) +
      P.path('M35 63 Q50 85 65 63Z', '#4fae34') +
      P.flat('M37.2 64.2 Q50 81.6 62.8 64.2Z', '#f4ffe6') +
      P.flat('M39.2 64.2 Q50 78.6 60.8 64.2Z', '#ff4d5e') +
      `<g fill="#2b1d16"><ellipse cx="45" cy="67.5" rx="1" ry="1.5"/><ellipse cx="50" cy="70.5" rx="1" ry="1.5"/><ellipse cx="55" cy="67.5" rx="1" ry="1.5"/></g>` +
      P.sparkle(84, 30, 3.4);
  },

  kaeru(P) {
    const green = P.fill('#d8f8ae', '#72c94a', '#4a9e34');
    return P.shadow(50, 92, 32) +
      P.ell(22, 80, 9, 8, green) + P.ell(78, 80, 9, 8, green) +
      P.circ(37, 40, 11.5, green) + P.circ(63, 40, 11.5, green) +
      P.path('M17 71 Q17 47 50 47 Q83 47 83 71 Q83 89 50 89 Q17 89 17 71Z', green) +
      `<circle cx="37" cy="40" r="10.3" fill="#93d86a"/><circle cx="63" cy="40" r="10.3" fill="#93d86a"/>` +
      `<g fill="#58ad3c" opacity="0.5"><ellipse cx="24" cy="66" rx="2.6" ry="2"/><ellipse cx="77" cy="64" rx="2.2" ry="1.7"/><ellipse cx="73" cy="72" rx="1.6" ry="1.2"/></g>` +
      `<ellipse cx="50" cy="78" rx="19" ry="9" fill="#f0fbc6"/>` +
      `<circle cx="37" cy="40" r="7.6" fill="#fff"/><circle cx="63" cy="40" r="7.6" fill="#fff"/>` +
      P.hl(30, 33, 3, 1.8) +
      P.eyes(50, 40.5, 26, 5.8) +
      `<circle cx="46.5" cy="56" r="1.1" fill="#2f5a22"/><circle cx="53.5" cy="56" r="1.1" fill="#2f5a22"/>` +
      P.line('M31 61 Q50 76 69 61', 2, '#2b1d16') + P.line('M30 59.6 L32 62.2 M70 59.6 L68 62.2', 1.6, '#2b1d16') +
      P.blush(50, 63, 46, 4.2, 2.4) +
      P.ell(36, 88.5, 7, 3.6, '#8fd65e') + P.ell(64, 88.5, 7, 3.6, '#8fd65e') +
      P.path('M84 18 Q88 24 88 26 A4 4 0 0 1 80 26 Q80 24 84 18Z', P.fill('#f2fbff', '#8fd6f8', '#4cb0e6'), 'stroke-width="1.6"');
  },

  wani(P) {
    const green = P.fill('#c8f2a0', '#5cb84a', '#3a8a32');
    const bumps = [[56, 57], [65, 55], [74, 56], [82, 60], [89, 52]].map(([x, y]) => P.circ(x, y, 3.8, '#4ea83f', 'stroke-width="2"')).join('');
    const leg = (x, f) => P.path(`M${x - 5} 78 L${x - 5} 87 Q${x - 5} 91 ${x} 91 Q${x + 5} 91 ${x + 5} 87 L${x + 5} 78Z`, f);
    return P.shadow(52, 92, 36) +
      bumps +
      P.path('M76 78 Q91 79 92 64 Q93 54 87 49 Q87 60 82 66 Q78 70 72 69Z', green) +
      leg(58, '#4ea83f') + leg(82, '#4ea83f') +
      P.ell(67, 73, 20, 15, green) +
      P.flat('M50 79 Q67 86 84 80 Q78 87 67 88 Q56 88 50 79Z', '#eef7bf') +
      leg(50, green) + leg(75, green) +
      P.circ(35, 44, 9, green) + P.circ(52, 44, 9, green) +
      P.path('M9 61 Q8 51 18 50 L38 47 Q59 44 61 59 Q62 73 46 74 L18 74 Q9 73 9 61Z', green) +
      `<circle cx="35" cy="44" r="7.8" fill="#86d062"/><circle cx="52" cy="44" r="7.8" fill="#86d062"/>` +
      `<circle cx="35" cy="44" r="6.4" fill="#fff"/><circle cx="52" cy="44" r="6.4" fill="#fff"/>` +
      P.flat('M14 70 Q34 74 58 68 Q56 73 46 74 L18 74 Q14 73 14 70Z', '#eef7bf') +
      `<circle cx="13.5" cy="55" r="1.4" fill="#2f5a22"/><circle cx="19" cy="54" r="1.4" fill="#2f5a22"/>` +
      P.line('M12 64 Q34 69 57 62', 1.9, '#2b1d16') +
      `<path d="M19 65.3 l1.5 2.5 l1.5 -2.3Z M26 66.6 l1.5 2.6 l1.5 -2.4Z M33 67.1 l1.5 2.5 l1.5 -2.5Z M40 66.9 l1.5 2.4 l1.5 -2.5Z" fill="#fff" stroke="#2b1d16" stroke-width="0.8" stroke-linejoin="round"/>` +
      P.hl(26, 54, 5, 2.2, -8) +
      P.eyes(43.5, 44.5, 17, 4.8) + P.blush(50, 59, 14, 3.4, 2);
  },
  kumo(P) {
    return P.shadow(50, 93, 26) +
      P.path('M24 84 A11 11 0 0 1 14 66 A12 12 0 0 1 26 47 A14 14 0 0 1 50 34 A14 14 0 0 1 74 46 A12 12 0 0 1 86 66 A11 11 0 0 1 76 84 Q50 88 24 84Z',
        P.fill('#ffffff', '#f3f7ff', '#c6d6ee')) +
      P.line('M26 78 Q50 82 74 78', 1.4, 'rgba(150,175,215,.45)') +
      P.hl(33, 43, 7, 3.6) +
      P.eyes(50, 60, 18, 5.8, 'shiny', '#3a5a8a') + P.blush(50, 67, 32, 4.2, 2.4) + P.mouth(50, 67, 'open', 0.9) +
      P.line('M5 46 Q11 41 15 45 Q18 49 13 50', 1.8, '#9ec4ea') + P.line('M86 32 Q91 28 95 31', 1.8, '#9ec4ea') +
      P.sparkle(84, 18, 3.4, '#ffe58a') + P.sparkle(16, 26, 2.6, '#ffe58a');
  },

  kaminari(P) {
    const gold = P.fill('#fffbc0', '#ffd92e', '#f0a81a');
    return P.shadow(50, 93, 30) +
      P.path('M62 63 L80 63 L72 74 L83 74 L60 92 L67 79 L57 79Z', gold) +
      P.path('M22 70 A12 12 0 0 1 10 52 A13 13 0 0 1 24 32 A15 15 0 0 1 50 20 A15 15 0 0 1 76 32 A13 13 0 0 1 90 52 A12 12 0 0 1 78 70 Q50 74 22 70Z',
        P.fill('#c3cbe0', '#76839f', '#4c5772')) +
      P.line('M24 64 Q50 68 76 64', 1.4, 'rgba(40,48,70,.35)') +
      P.hl(30, 34, 7, 3.4, -25, 0.4) +
      // little taiko drum + stick
      P.path('M18 74 Q16 81 19 88 Q29 91 39 88 Q42 81 40 74Z', P.fill('#ff9a7a', '#e8433a', '#b82820')) +
      P.line('M18.6 80.5 Q29 83.5 39.4 80.5', 1.4, '#f6c54a') +
      P.ell(29, 74, 11, 3.8, '#fff4dc') +
      tube(P, 'M46 66 L36 72', 1.8, '#d9a066') + P.circ(35, 72.6, 2.4, '#fff4dc', 'stroke-width="1.6"') +
      P.eyes(50, 45, 18, 6, 'shiny', '#3a3f5a') + P.blush(50, 52, 32, 4.4, 2.4) + P.mouth(50, 52, 'open', 1) +
      P.sparkle(88, 78, 3.6, '#ffe58a') + P.sparkle(12, 18, 3, '#ffe58a') + P.sparkle(92, 14, 2.4, '#ffe58a');
  },

  niji(P) {
    const cols = ['#ff7b7b', '#ffad5a', '#ffe066', '#7fd67a', '#6ec3f4', '#b08ef0'];
    const band = (rx1, ry1, rx2, ry2) => `M${50 - rx1} 82 A${rx1} ${ry1} 0 0 1 ${50 + rx1} 82 L${50 + rx2} 82 A${rx2} ${ry2} 0 0 0 ${50 - rx2} 82Z`;
    const cloud = (cx, s) => {
      const x = (d) => cx + s * d, sw = s > 0 ? 1 : 0;
      return `M${x(-12)} 89 A6 6 0 0 ${sw} ${x(-13)} 79 A8 8 0 0 ${sw} ${x(1)} 73 A7 7 0 0 ${sw} ${x(11)} 82 A5 5 0 0 ${sw} ${x(10)} 89Z`;
    };
    const cf = P.fill('#ffffff', '#f5f8ff', '#cfdcf0');
    return P.shadow(50, 92, 36) +
      cols.map((c, i) => P.flat(band(38 - i * 4, 52 - i * 4, 34 - i * 4, 48 - i * 4), c)).join('') +
      P.path(band(38, 52, 14, 28), 'none') +
      P.hl(30, 46, 3, 7, -35, 0.5) +
      P.path(cloud(24, 1), cf) + P.path(cloud(76, -1), cf) +
      P.eyes(50, 41, 16, 5.2) + P.blush(50, 47.5, 28, 3.8, 2.2) + P.mouth(50, 48, 'open', 0.8) +
      P.sparkle(14, 30, 4.4, '#ffe58a') + P.sparkle(87, 24, 3.6, '#ffe58a') + P.sparkle(50, 16, 2.8, '#ffe58a');
  },

  ishi(P) {
    return P.shadow(50, 92, 30) +
      P.path('M16 74 C14 54 30 44 50 44 C70 44 86 54 84 74 C83 88 68 91 50 91 C32 91 17 88 16 74Z', P.fill('#f4f5f7', '#b8bec6', '#8a919c')) +
      `<g fill="#8f96a2" opacity="0.5"><circle cx="70" cy="58" r="1.5"/><circle cx="76" cy="66" r="1"/><circle cx="26" cy="78" r="1.3"/><circle cx="66" cy="83" r="1.1"/><circle cx="34" cy="55" r="0.9"/></g>` +
      P.hl(33, 55, 7, 3.6) +
      P.path('M54 45 Q55 38 61 38 Q66 38 66 44 Q62 47 54 45Z', P.fill('#c8f09a', '#7cc454', '#5a9a3a'), 'stroke-width="1.8"') +
      P.eyes(50, 67, 18, 5.6) + P.blush(50, 74, 32, 4.2, 2.4) + P.mouth(50, 74, 'cat', 0.8) +
      P.sparkle(84, 40, 3.6, '#ffe58a') + P.sparkle(16, 40, 2.6, '#ffe58a');
  },

  iwa(P) {
    const grey = P.fill('#eceef2', '#a6aeb9', '#77808d');
    return P.shadow(50, 92, 34) +
      P.ell(36, 89, 7, 3.6, '#8d95a1') + P.ell(64, 89, 7, 3.6, '#8d95a1') +
      P.path('M17 87 L13 66 Q12 56 19 50 L30 34 Q36 26 46 26 L64 28 Q76 30 82 40 L88 58 Q91 70 86 80 L82 87 Q50 91 17 87Z', grey) +
      P.flat('M84 46 L88 58 Q91 70 86 80 L82 87 Q80 70 84 46Z', 'rgba(60,70,90,.16)') +
      P.line('M72 37 L68 45 L72 51', 1.4, 'rgba(70,78,95,.45)') + P.line('M22 74 L27 79', 1.4, 'rgba(70,78,95,.4)') +
      P.path('M30 34 Q36 26 46 26 L64 28 Q70 29 69 34 Q65 39 61 35 Q57 41 51 37 Q45 42 40 37 Q34 41 31 37Z', P.fill('#d0f4a4', '#7cc454', '#5a9a3a')) +
      P.circ(58, 30, 2.4, '#fff', 'stroke-width="1.2"') + `<circle cx="58" cy="30" r="1" fill="#ffd23e"/>` +
      P.hl(25, 52, 5, 3, -40) +
      P.ell(17, 73, 6.5, 9, grey, 'transform="rotate(-12 17 73)"') + P.ell(83, 73, 6.5, 9, grey, 'transform="rotate(12 83 73)"') +
      P.eyes(50, 59, 19, 6) + P.blush(50, 67, 33, 4.4, 2.5) + P.mouth(50, 67, 'open', 1);
  },

  yama(P) {
    const tree = (x, y, s) => P.line(`M${x} ${y} L${x} ${y - 4 * s}`, 2, '#8a5a34') +
      P.path(`M${x} ${y - 16 * s} L${x + 6 * s} ${y - 3 * s} L${x - 6 * s} ${y - 3 * s}Z`, P.fill('#b8ec8a', '#4fae4a', '#2f7f36'), 'stroke-width="1.8"');
    return P.shadow(50, 93, 40) +
      P.path('M6 90 C24 84 30 62 38 34 Q41 25 50 25 Q59 25 62 34 C70 62 76 84 94 90 Q50 94 6 90Z', P.fill('#e6eefb', '#9aa9cc', '#6a79a0')) +
      P.path('M38 34 Q41 25 50 25 Q59 25 62 34 L64.4 44 Q61 48.5 58 43.5 Q54 49.5 50 44 Q46 49.5 42 43.5 Q39 48.5 35.6 44Z', P.fill('#ffffff', '#f6f9ff', '#d6e2f4')) +
      P.hl(43, 32, 2, 4, 25, 0.7) +
      tree(15, 89, 0.9) + tree(25, 86, 0.75) + tree(85, 89, 0.9) + tree(75, 86, 0.75) +
      P.path('M66 58 A4 4 0 0 1 71 52 A5 5 0 0 1 80 53 A4 4 0 0 1 82 60 Q74 62 66 58Z', '#fff', 'stroke-width="1.8"') +
      P.eyes(50, 62, 19, 6) + P.blush(50, 70, 32, 4.4, 2.5) + P.mouth(50, 70, 'open', 1) +
      P.sparkle(28, 22, 3.6, '#ffe58a') + P.sparkle(74, 18, 2.8, '#ffe58a');
  },
  yuki(P) {
    const ice = P.fill('#f4fcff', '#aee0fa', '#6cb8e8');
    let pts = '', fluff = '';
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a), at = (r, w) => `${(50 + c * r - s * w).toFixed(1)} ${(56 + s * r + c * w).toFixed(1)}`;
      pts += P.path(`M${at(20, 0)} L${at(29, 4.6)} L${at(37, 0)} L${at(29, -4.6)}Z`, ice, 'stroke-width="2"') +
        P.line(`M${at(25, 0)} L${at(34, 0)}`, 1.3, '#fff');
    }
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6, m = a + Math.PI / 12;
      fluff += (i ? ' Q' : `M${(50 + 24.5).toFixed(1)} 56 Q`) + `${(50 + Math.cos(m) * 29).toFixed(1)} ${(56 + Math.sin(m) * 29).toFixed(1)} ${(50 + Math.cos(a + Math.PI / 6) * 24.5).toFixed(1)} ${(56 + Math.sin(a + Math.PI / 6) * 24.5).toFixed(1)}`;
    }
    return P.shadow(50, 92, 26) + pts +
      P.path(fluff + 'Z', P.fill('#ffffff', '#f3f9ff', '#c9dcf2')) +
      P.hl(39, 43, 6, 3.4) +
      P.eyes(50, 56, 17, 5.6, 'shiny', '#3a6a9a') + P.blush(50, 63, 29, 4, 2.3) + P.mouth(50, 63, 'cat', 0.8) +
      P.sparkle(14, 26, 3.4, '#d8f0ff') + P.sparkle(88, 80, 3, '#d8f0ff') + P.sparkle(85, 16, 2.4, '#d8f0ff');
  },

  yukidaruma(P) {
    const snow = P.fill('#ffffff', '#f3f9ff', '#c9dcf2');
    const scarf = P.fill('#d6f1ff', '#7ccaf2', '#4aa2d8');
    let flake = '';
    for (let i = 0; i < 3; i++) flake += P.line(`M${40 + 3.4 * Math.cos(i * 1.047)} ${64 + 3.4 * Math.sin(i * 1.047)} L${40 - 3.4 * Math.cos(i * 1.047)} ${64 - 3.4 * Math.sin(i * 1.047)}`, 1.4, '#fff');
    return P.shadow(50, 92, 28) +
      P.line('M33 68 L14 56 M20 60 L16 52 M18 58.6 L11 60', 2.6, '#8a5a34') +
      P.line('M67 68 L86 56 M80 60 L84 52 M82 58.6 L89 60', 2.6, '#8a5a34') +
      P.circ(50, 73, 19.5, snow) +
      P.hl(39, 66, 4.4, 2.6) +
      `<circle cx="50" cy="74" r="2.2" fill="#3a3a4a"/><circle cx="50" cy="83" r="2.2" fill="#3a3a4a"/>` +
      P.path('M60 60 L63 80 Q67 82 71 79 L66 59Z', scarf, 'stroke-width="2"') +
      P.line('M64 79.5 L64 83 M67 80.4 L67.6 84 M70 79 L71 82.4', 1.6, '#4aa2d8') +
      P.circ(50, 43, 18, snow) +
      P.path('M32.6 54 Q50 63 67.4 54 L68 60.5 Q50 70 32 60.5Z', scarf, 'stroke-width="2"') +
      P.line('M37 60 Q50 66 63 60', 1.4, 'rgba(255,255,255,.7)') +
      `<circle cx="40" cy="64" r="4.2" fill="#a8dcf8" stroke="${P.OUT}" stroke-width="1.4"/>` + flake +
      `<g transform="rotate(-10 50 24)">` +
      P.path('M37 31 L40.5 13.5 Q50 10.5 59.5 13.5 L63 31 Q50 34.5 37 31Z', P.fill('#ff9a8a', '#e8433a', '#b82820')) +
      P.line('M38.2 25 Q50 28 61.8 25', 1.8, 'rgba(255,255,255,.45)') +
      P.path('M35 30 Q50 34 65 30 L65.5 33 Q50 37.5 34.5 33Z', '#c9302a', 'stroke-width="2"') + `</g>` +
      P.hl(40, 38, 4, 2.4) +
      P.eyes(50, 43, 14, 5, 'shiny', '#3a6a9a') +
      P.path('M49.5 47.4 L58.5 49.6 L49.5 51.4Z', '#ff9a3c', 'stroke-width="1.4"') +
      P.blush(50, 49, 24, 3.4, 2) + P.mouth(50, 53, 'smile', 0.7) +
      P.sparkle(14, 30, 3.4, '#d8f0ff') + P.sparkle(88, 34, 2.8, '#d8f0ff') + P.sparkle(86, 82, 2.6, '#d8f0ff');
  },

  koori(P) {
    const sil = 'M18 42 L34 26 L82 26 L82 74 L66 90 L18 90Z';
    return P.shadow(50, 93, 32) +
      P.flat('M18 42 L34 26 L82 26 L66 42Z', '#e6f7ff', 'opacity="0.95"') +
      P.flat('M66 42 L82 26 L82 74 L66 90Z', '#98d2f0', 'opacity="0.95"') +
      P.flat('M18 42 L66 42 L66 90 L18 90Z', P.fill('#f8feff', '#c4ebfb', '#94d2f0'), 'opacity="0.95"') +
      P.path(sil, 'none') +
      P.line('M18.5 42 L66 42 L66 89.5 M66 42 L81.5 26.5', 1.6, 'rgba(255,255,255,.95)') +
      P.line('M23 56 L23 49 L30 47', 2.6, 'rgba(255,255,255,.95)') + P.line('M26 85 L60 85', 1.6, 'rgba(255,255,255,.6)') +
      P.line('M72 40 L72 60', 2, 'rgba(255,255,255,.55)') +
      `<g fill="#fff" opacity="0.8"><circle cx="58" cy="52" r="1.6"/><circle cx="61" cy="56" r="1"/><circle cx="26" cy="78" r="1.2"/></g>` +
      P.eyes(42, 64, 16, 5.6, 'shiny', '#2f6a9a') + P.blush(42, 71, 28, 4, 2.3) + P.mouth(42, 71, 'open', 0.8) +
      P.sparkle(84, 14, 4.6) + P.sparkle(12, 30, 3.2, '#d8f0ff') + P.sparkle(90, 86, 2.8, '#d8f0ff');
  },

  sori(P) {
    const red = P.fill('#ffa092', '#e8433a', '#b82820');
    return P.shadow(52, 92, 36) +
      P.line('M88 46 L94 46 M90 54 L97 54 M89 62 L94 62', 1.8, '#a8d4f2') +
      [42, 60, 78].map(x => tube(P, `M${x} 64 L${x} 82`, 2.6, '#d39a5a')).join('') +
      tube(P, 'M90 84 L28 84 Q12 84 12 72 Q12 62 21 62 Q29 62 29 69 Q29 75 23 75', 3.2, '#e0aa66') +
      [[28, 46], [47, 65], [66, 84]].map(([a, b]) => P.path(`M${a} 42 L${a + 7} 33 L${b + 5} 33 L${b - 2} 42Z`, P.fill('#ffc4b8', '#f2675a', '#d8483c'), 'stroke-width="2"')).join('') +
      P.rect(26, 41, 60, 25, 5, red) +
      P.line('M30 61 L82 61', 1.3, 'rgba(255,255,255,.35)') +
      P.hl(33, 47, 4.6, 2.4) +
      P.eyes(56, 52, 18, 5.4) + P.blush(56, 58.5, 31, 4, 2.3) + P.mouth(56, 59, 'open', 0.85) +
      P.sparkle(66, 18, 3.4, '#d8f0ff') + P.sparkle(44, 22, 2.6, '#d8f0ff');
  },

  mikan(P) {
    const dots = [[36, 50], [44, 44], [60, 46], [68, 52], [28, 62], [74, 64], [32, 76], [70, 76], [42, 82], [58, 83], [54, 42], [24, 70], [78, 71], [62, 60], [36, 60]];
    return P.shadow(50, 92, 30) +
      P.ell(50, 63, 33, 27, P.fill('#ffdc9e', '#ff9c22', '#e2700e')) +
      `<g fill="#e8781a" opacity="0.45">${dots.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.9"/>`).join('')}</g>` +
      P.hl(33, 49, 7, 3.6) +
      P.leaf(52, 37, 15, 62, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.path(P.starPath(50, 37.5, 6.4, 3.2, 5, -90, 0.3), '#5aa83c', 'stroke-width="1.8"') +
      P.line('M50 36 L50 31', 2.2, '#6b4426') +
      P.eyes(50, 62, 18, 5.8) + P.blush(50, 69, 32, 4.2, 2.4) + P.mouth(50, 69, 'open', 0.9) +
      P.sparkle(85, 34, 3.6) + P.sparkle(15, 40, 2.6);
  },

  makura(P) {
    const cap = P.fill('#c6dcff', '#7aa4f2', '#4f78cc');
    return P.shadow(50, 93, 36) +
      P.path('M14 46 Q50 38 86 46 Q94 67 86 88 Q50 95 14 88 Q6 67 14 46Z', P.fill('#ffffff', '#e9f1ff', '#b9cdee')) +
      `<path d="M19 51 Q50 44.5 81 51 Q87.5 67 81 83 Q50 89 19 83 Q12.5 67 19 51Z" fill="none" stroke="#9fb8e6" stroke-width="1.3" stroke-dasharray="2.6 2.4"/>` +
      P.line('M14 46 L19 50 M86 46 L81 50 M86 88 L81 84 M14 88 L19 84', 1.4, '#9fb8e6') +
      P.hl(26, 56, 5, 2.8) +
      // nightcap flopping to the right
      P.path('M28 44 Q30 22 50 15 Q68 10 79 22 Q65 20 59 28 Q59 36 64 41Z', cap) +
      `<g fill="#fff6b0"><circle cx="43" cy="28" r="1.4"/><circle cx="54" cy="22" r="1.2"/><circle cx="51" cy="34" r="1.3"/><circle cx="66" cy="16" r="1"/></g>` +
      P.path('M26 41 Q45 35 65 39 Q67 43 65 47 Q45 43 27 48 Q24 45 26 41Z', '#fffaf2') +
      P.circ(80, 24, 5.4, P.fill('#ffffff', '#fffaf2', '#e8dccb')) +
      P.eyes(50, 66, 22, 5.6, 'closed') + P.blush(50, 72, 36, 4.6, 2.6) + P.mouth(50, 74, 'o', 0.7) +
      P.line('M12 16 L19 16 L12 23 L19 23', 2, '#8fa8e0') + P.line('M21 6 L26 6 L21 11 L26 11', 1.7, '#8fa8e0');
  },
  tebukuro(P) {
    const red = P.fill('#ff9f8f', '#e8433a', '#b82820');
    const flake = (x, y, r) => P.line([0, 1, 2].map(i => { const a = i * Math.PI / 3, c = Math.cos(a) * r, s = Math.sin(a) * r; return `M${(x - c).toFixed(1)} ${(y - s).toFixed(1)} L${(x + c).toFixed(1)} ${(y + s).toFixed(1)}`; }).join(' '), 1.5, '#fff');
    const hand = 'M26 72 L24 42 Q23 18 45 17 Q67 17 67 40 L66 72Z';
    const cuff = (f) => P.rect(22, 68, 48, 20, 6, f) + P.line('M30 71 L30 85 M38 71 L38 85 M46 71 L46 85 M54 71 L54 85 M62 71 L62 85', 1.3, '#e3d8c6');
    return P.shadow(54, 92, 34) +
      // the twin, always right behind
      `<g transform="rotate(12 70 80) translate(20 2)">` + P.path(hand, P.fill('#ff9f8f', '#d93a32', '#a8241c')) + flake(45, 32, 4.4) + cuff('#f6efe2') + `</g>` +
      P.path('M27 60 Q16 60 14 49 Q12 39 19 38 Q25 38 27 46Z', red) +
      P.path(hand, red) +
      P.line('M27 62 L31 58 L35 62 L39 58 L43 62 L47 58 L51 62 L55 58 L59 62 L63 58 L66 61', 1.6, '#fff') +
      flake(36, 29, 4) + flake(56, 28, 3.2) + `<circle cx="46" cy="24" r="1.2" fill="#fff"/>` +
      P.hl(31, 30, 4, 6, 10) +
      cuff('#fffaf2') +
      P.eyes(45, 45, 18, 5.6) + P.blush(45, 52, 30, 4, 2.3, '#ffc0c8') + P.mouth(45, 52, 'open', 0.85) +
      P.sparkle(12, 22, 3, '#d8f0ff') + P.sparkle(86, 18, 3.4, '#d8f0ff');
  },

  yakan(P) {
    const teal = P.fill('#d8fcf7', '#4fc6c2', '#2a9590');
    return P.shadow(47, 92, 32) +
      P.path('M73 33 A5 5 0 0 1 75 24 A6.5 6.5 0 0 1 87 21 A5 5 0 0 1 91 30 Q82 35 73 33Z', P.fill('#ffffff', '#f6f9fc', '#d6e0ec'), 'stroke-width="1.8"') +
      P.path('M80 16 A3.4 3.4 0 0 1 83 10 A4 4 0 0 1 90 11 A3 3 0 0 1 90 17 Q85 19 80 16Z', P.fill('#ffffff', '#f6f9fc', '#d6e0ec'), 'stroke-width="1.6"') +
      P.line('M89 41 Q86 38 88.5 35.5', 1.6, '#b9c8da') +
      tube(P, 'M30 54 Q28 21 47 21 Q66 21 64 54', 3.4, '#4a5262') +
      P.path('M70 62 Q80 60 84 48 L85 45 Q88 41 91 44 Q92.6 47 89.4 50 Q86 70 72 80Z', teal) +
      P.path('M18 84 C14 62 28 46 47 46 C66 46 80 62 76 84 Q47 90 18 84Z', teal) +
      P.line('M19 80 Q47 86 75 80', 1.6, 'rgba(20,90,90,.3)') +
      P.hl(28, 62, 3.4, 9, 25, 0.6) +
      P.ell(47, 47.5, 14, 4, '#3fb0ac') +
      P.path('M35 47 Q37 38.5 47 38.5 Q57 38.5 59 47 Q47 50 35 47Z', teal) +
      P.circ(47, 35.6, 3.2, '#4a5262') +
      P.eyes(47, 65, 19, 5.8) + P.blush(47, 72, 32, 4.2, 2.4) + P.mouth(47, 72, 'smile', 0.9);
  },

  mochi(P) {
    const white = P.fill('#ffffff', '#fbf8f1', '#e4d9c6');
    return P.shadow(50, 93, 36) +
      P.path('M12 84 C10 58 28 42 50 42 C72 42 90 58 88 84 C87 91 70 92 50 92 C30 92 13 91 12 84Z', white) +
      P.circ(70, 41, 8.4, white) +
      P.flat('M65 37 Q70 33 75 37 Q72 35.6 65 37Z', '#e6c48e') + `<ellipse cx="70" cy="36" rx="4" ry="1.8" fill="#efd3a2" opacity="0.8"/>` +
      P.hl(28, 56, 6, 3.2) + P.hl(67, 38, 2.2, 1.4, -20, 0.8) +
      P.line('M6 66 L10 68 M5 74 L9.6 74.4 M94 66 L90 68 M95 74 L90.4 74.4', 1.6, '#c9b9a0') +
      P.eyes(50, 68, 20, 5.8) + P.blush(50, 75, 38, 5, 2.8) + P.mouth(50, 75, 'cat', 0.9) +
      P.sparkle(22, 30, 3, '#ffe58a') + P.sparkle(86, 26, 2.6, '#ffe58a');
  },

  tori(P) {
    const blue = P.fill('#c8eeff', '#58b4f4', '#2f80d4');
    return P.shadow(50, 92, 26) +
      P.path('M70 70 Q84 72 90 60 Q90 70 84 78 Q78 82 70 80Z', '#3f8fdc') +
      P.path('M46 31 Q40 18 48 13 Q48 22 53 29Z', '#58b4f4', 'stroke-width="2"') +
      P.path('M51 30 Q54 18 62 18 Q57 24 56 31Z', '#58b4f4', 'stroke-width="2"') +
      P.feet(89, [42, 58], '#ffb22e', 4.6, 2.8) +
      P.circ(50, 59, 30, blue) +
      `<ellipse cx="50" cy="72" rx="18" ry="13" fill="#fff6e0"/>` +
      P.hl(36, 42, 7, 3.6) +
      P.ell(21, 62, 6.4, 11, '#3f8fdc', 'transform="rotate(30 21 62)"') + P.ell(79, 62, 6.4, 11, '#3f8fdc', 'transform="rotate(-30 79 62)"') +
      P.eyes(50, 53, 20, 5.8) + P.blush(50, 61, 34, 4.2, 2.4) +
      P.path('M45.5 59 L50 56.6 L54.5 59 L50 64Z', P.fill('#fff2a0', '#ffc22e', '#f09a1a'), 'stroke-width="1.6"') +
      P.line('M45.5 59 L54.5 59', 1, P.OUT) +
      P.ell(80, 29, 3.6, 2.7, '#ffd23e', 'stroke-width="1.6" transform="rotate(-20 80 29)"') + P.line('M83.2 28 L83.2 16 Q87 17.5 89 21.5', 1.8, P.OUT) +
      P.sparkle(16, 28, 3, '#ffe58a');
  },

  mangetsu(P) {
    // the tsuki bunny (same parts & colours), scaled a touch and centred in the full moon
    const s = 1.1, hx = 50, hy = 54, X = (dx) => +(hx + dx * s).toFixed(1), Y = (dy) => +(hy + dy * s).toFixed(1);
    const cream = P.fill('#fffaf0', '#f7e3bb', '#e8c98e');
    return P.shadow(50, 93, 30) +
      `<circle cx="50" cy="52" r="44" fill="#fff3b0" opacity="0.3"/><circle cx="50" cy="52" r="40.5" fill="#fff0a0" opacity="0.45"/>` +
      P.circ(50, 52, 37, P.fill('#fffbe2', '#f7df82', '#e2bd55', 0.35, 0.3)) +
      `<g fill="#e5c262"><ellipse cx="24" cy="44" rx="4.4" ry="3.4"/><ellipse cx="22" cy="60" rx="2.6" ry="2"/><ellipse cx="28" cy="74" rx="3.4" ry="2.6"/><ellipse cx="76" cy="40" rx="3.6" ry="2.8"/><ellipse cx="79" cy="56" rx="2.4" ry="1.9"/><ellipse cx="72" cy="27" rx="2.2" ry="1.7"/></g>` +
      P.hl(32, 30, 7, 3.6) +
      P.ell(X(-6), Y(-22), 5 * s, 13 * s, '#fff1d6', `transform="rotate(-12 ${X(-6)} ${Y(-22)})"`) +
      `<ellipse cx="${X(-6)}" cy="${Y(-21)}" rx="${2.2 * s}" ry="${8.5 * s}" fill="#ffb3c1" transform="rotate(-12 ${X(-6)} ${Y(-22)})"/>` +
      P.ell(X(7), Y(-21), 5 * s, 13 * s, '#fff1d6', `transform="rotate(14 ${X(7)} ${Y(-21)})"`) +
      `<ellipse cx="${X(7)}" cy="${Y(-20)}" rx="${2.2 * s}" ry="${8.5 * s}" fill="#ffb3c1" transform="rotate(14 ${X(7)} ${Y(-21)})"/>` +
      P.ell(X(1), Y(21), 12 * s, 11 * s, cream) +
      P.circ(X(13), Y(25), 4 * s, '#fffaf0') +
      P.circ(hx, hy, 15 * s, cream) +
      P.hl(X(-6), Y(-7), 4 * s, 2.4 * s) +
      P.eyes(hx, Y(1), 12 * s, 4.6 * s) +
      `<ellipse cx="${X(-10)}" cy="${Y(6)}" rx="${3.4 * s}" ry="${2 * s}" fill="#ff8fa8" opacity="0.7"/>` +
      P.path(P.starPath(X(10.5), Y(5.6), 4.4, 2, 5, -90, 0.2), '#ffd23e', 'stroke-width="1.2"') +
      P.mouth(hx, Y(6.5), 'cat', 0.6 * s) +
      P.ell(X(-6), Y(17), 4 * s, 3.2 * s, '#fbefd5') + P.ell(X(7), Y(17), 4 * s, 3.2 * s, '#fbefd5') +
      P.sparkle(12, 16, 4) + P.sparkle(88, 18, 3.4) + P.sparkle(90, 80, 3) + P.sparkle(10, 84, 2.6);
  },
};
