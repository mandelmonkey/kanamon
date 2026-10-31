// Creature art batch c — see tools/ART_BRIEF.md

// Mirror an absolute M/L/Q/C path (space-separated "x y" pairs) across x = 50.
const mx = (d) => d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (m, x, y) => `${+(100 - x).toFixed(2)} ${y}`);

export default {
  obake(P) {
    const sheet = P.fill('#ffffff', '#f6f3ff', '#d2c9f0');
    return P.shadow(50, 93, 18) +
      P.path('M25 48 C15 48 9 55 10.5 60.5 C12 65 18 63 25 60Z', sheet) +
      P.path('M75 50 C83 46 84 37 89 36.5 C94 36.5 94 50 75 60Z', sheet) +
      P.path('M22 78 L22 48 C22 28 34 15 50 15 C66 15 78 28 78 48 L78 78 Q71 92 64 82 Q57 92 50 82 Q43 92 36 82 Q29 92 22 78Z', sheet) +
      P.hl(36, 29, 7, 4) +
      P.eyes(50, 47, 18, 6, 'shiny', '#5b4a8a') +
      P.blush(50, 56, 30) +
      P.mouth(50, 56, 'tongue', 1.1) +
      P.sparkle(13, 26, 3.6, '#cbbcff') + P.sparkle(88, 68, 3, '#cbbcff');
  },

  rousoku(P) {
    const gold = P.fill('#fff3b8', '#f2c14e', '#c98f22');
    const body = 'M29 46 Q29 37 38 37 L62 37 Q71 37 71 46 L71 89 L29 89Z';
    const drip = 'M29 46 Q29 37 38 37 L62 37 Q71 37 71 46 L71 55 Q71 59 68 59 Q65 59 65 55 L65 50 Q65 47.5 62 47.5 Q56 47.5 55 49.5 Q54 51.5 51.5 51.5 Q49 51.5 48 49.5 Q47 47.5 43 47.5 Q38 47.5 38 50.5 L38 60 Q38 64 34.5 64 Q31 64 31 60 L31 54 Q31 51 29 51Z';
    return P.shadow(50, 93, 28) +
      `<circle cx="50" cy="22" r="18" fill="#ffe27a" opacity="0.25"/><circle cx="50" cy="23" r="12" fill="#ffd34a" opacity="0.25"/>` +
      `<circle cx="80" cy="82" r="5" fill="none" stroke="${P.OUT}" stroke-width="5.6"/><circle cx="80" cy="82" r="5" fill="none" stroke="#f2c14e" stroke-width="2.6"/>` +
      P.ell(50, 86, 28, 5, gold) +
      P.path(body, P.fill('#fff7e6', '#f6dfae', '#e0bf80')) +
      P.flat(drip, '#e8cc94', 'transform="translate(0 1.5)"') + P.flat(drip, '#fffcf4') + P.path(body, 'none') +
      P.path('M22 86 Q22 92.5 50 92.5 Q78 92.5 78 86 Q50 91 22 86Z', gold) +
      P.hl(35, 43, 4, 2.2) +
      P.line('M50 38 L50 31', 2.2, '#4a3426') +
      P.path('M50 6 Q61 18 60.5 23.5 A10.5 10.5 0 0 1 39.5 23.5 Q39 18 50 6Z', P.fill('#fff8b0', '#ffbe3b', '#ff6a1f', 0.5, 0.75)) +
      P.flat('M50 16 Q56 23.5 56 27 A6 6 0 0 1 44 27 Q44 23.5 50 16Z', '#fff6c8') +
      P.eyes(50, 67, 16, 5.4) + P.blush(50, 74, 28, 4, 2.3) + P.mouth(50, 74.5, 'smile', 0.8);
  },

  chouchin(P) {
    const red = P.fill('#ffb3a3', '#f04a3e', '#b8221d');
    const bez = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * t * (1 - t) ** 2 * b + 3 * t * t * (1 - t) * c + t ** 3 * d;
    let ribs = '';
    for (const t of [0.18, 0.31, 0.44, 0.57, 0.7, 0.83]) {
      const x = bez(t, 37, 18, 18, 37) + 1.4, y = bez(t, 27, 31, 77, 81);
      ribs += P.line(`M${x.toFixed(1)} ${y.toFixed(1)} Q50 ${(y + 2).toFixed(1)} ${(100 - x).toFixed(1)} ${y.toFixed(1)}`, 1.1, 'rgba(130,20,20,.4)');
    }
    return P.shadow(50, 93, 20) +
      P.line('M42 20 Q42 9 50 9 Q58 9 58 20', 2.4) +
      P.path('M37 27 C18 31 18 77 37 81 L63 81 C82 77 82 31 63 27Z', red) +
      `<ellipse cx="50" cy="54" rx="17" ry="20" fill="#ffe08a" opacity="0.32"/>` + ribs +
      P.rect(34, 19, 32, 8, 2.5, '#3d2e2c') + P.rect(34, 80, 32, 8, 2.5, '#3d2e2c') +
      P.line('M37 21.5 L63 21.5', 1.2, 'rgba(255,215,120,.6)') +
      P.hl(33, 40, 5, 3) +
      P.eyes(50, 48, 18, 6) + P.blush(50, 57, 32) +
      P.path('M40 59 Q50 69 60 59 Q50 62 40 59Z', '#7a1d26', 'stroke-width="1.6"') +
      P.path('M46.5 63 Q45 76 49 84 Q53 89 56 83 Q57.5 74 55 63Z', P.fill('#ffc0c8', '#ff7a8a', '#e2566a'), 'stroke-width="1.6"') +
      P.line('M51 66 L51.6 79', 1.1, 'rgba(160,40,60,.45)');
  },

  yoru(P) {
    const sky = P.fill('#6c86e6', '#2c4596', '#1a2a62');
    const stars = [[28, 50, 3.2], [72, 48, 2.6], [24, 72, 2.6], [76, 72, 3.2], [62, 84, 2.2], [38, 84, 2]]
      .map(([x, y, s]) => P.sparkle(x, y, s, '#fff3a8')).join('');
    const dots = [[42, 40], [62, 41], [20, 62], [80, 61], [50, 86], [34, 62], [66, 62]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="0.9" fill="#fff" opacity="0.8"/>`).join('');
    const pale = '#fff3c4';
    return P.shadow(50, 92, 30) +
      P.ell(17, 71, 5.5, 4.4, '#2c4596') + P.ell(83, 71, 5.5, 4.4, '#2c4596') +
      P.path('M16 74 C14 50 30 33 50 33 C70 33 86 50 84 74 C83 87 70 91 50 91 C30 91 17 87 16 74Z', sky) +
      stars + dots + P.hl(33, 45, 6, 3.4, -25, 0.3) +
      P.path('M53.5 11.7 A11.5 11.5 0 1 0 63.6 30.6 A10.8 10.8 0 0 1 53.5 11.7Z', P.fill('#fffbe0', '#ffe37a', '#efb93a'), 'transform="translate(-20 11) rotate(-28 55 21)"') +
      P.sparkle(42, 22, 2.6, '#ffe27a') +
      P.line('M36.5 61 Q41.5 66 46.5 61', 3.1, pale) + P.line('M53.5 61 Q58.5 66 63.5 61', 3.1, pale) +
      P.blush(50, 68, 32, 4.4, 2.5, '#ff9ac6') + P.line('M46.5 69 Q50 72 53.5 69', 2.2, pale) +
      P.sparkle(84, 26, 3.4, '#ffe27a') + P.sparkle(74, 14, 2.4, '#ffe27a');
  },


  koumori(P) {
    const fur = P.fill('#c4aef0', '#7d5ec6', '#523891');
    const wing = P.fill('#b9a2ea', '#6a4db3', '#45307f', 0.6, 0.3);
    const L = 'M37 50 Q26 31 8 34 Q9 44 13 50 Q18 49 20 56 Q25 55 27 62 Q32 60 38 66Z';
    const bones = 'M35 52 L10 36 M34 54 L14 49 M35 57 L21 55 M36 60 L27 61';
    const ear = 'M35 48 L31 24 L46 40Z', earIn = 'M36 43 L33.5 30 L42 39Z';
    return P.shadow(50, 93, 18) +
      P.path(L, wing) + P.path(mx(L), wing) +
      P.line(bones, 1.3, 'rgba(50,25,90,.45)') + P.line(mx(bones), 1.3, 'rgba(50,25,90,.45)') +
      P.path(ear, fur) + P.path(mx(ear), fur) +
      P.flat(earIn, '#ffa6c6') + P.flat(mx(earIn), '#ffa6c6') +
      P.ell(50, 60, 21, 20, fur) +
      P.feet(80, [44, 56], '#6a4db3', 3.8, 2.6) +
      P.flat('M50 55 C44 48 33 51 35 61 C36 69 44 74 50 74 C56 74 64 69 65 61 C67 51 56 48 50 55Z', '#f1e9ff') +
      P.hl(39, 46, 5, 2.6) +
      P.eyes(50, 61, 14, 5, 'shiny', '#5a3a8a') + P.blush(50, 67, 26, 3.4, 2) +
      P.line('M46 67.5 Q50 70 54 67.5', 1.7, '#2b1d16') +
      `<path d="M46.8 68.2 l1.1 2.7 l1.1 -2.2Z M51 68.7 l1.1 2.2 l1.1 -2.7Z" fill="#fff" stroke="#2b1d16" stroke-width="0.9" stroke-linejoin="round"/>`;
  },

  ruri(P) {
    const blue = P.fill('#a9c6ff', '#3a62d6', '#1b3290', 0.4, 0.2);
    const flecks = [[24, 48, 1.2], [29, 60, 0.9], [74, 51, 1.1], [65, 70, 0.9], [57, 29, 1], [43, 77, 0.8], [20, 44, 0.8], [79, 46, 0.9], [40, 31, 0.8]]
      .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd45e"/>`).join('');
    return P.shadow(50, 92, 22) +
      P.feet(88, [42, 58], '#2c4bb8', 5, 3.2) +
      P.path('M34 24 L66 24 L86 42 Q80 66 50 88 Q20 66 14 42Z', blue) +
      P.flat('M34 24 L66 24 L50 42Z', 'rgba(255,255,255,.38)') +
      P.flat('M14 42 L34 24 L32 42Z', 'rgba(255,255,255,.22)') +
      P.flat('M66 24 L86 42 L68 42Z', 'rgba(10,20,80,.2)') +
      P.flat('M14 42 L32 42 L50 88 Q20 66 14 42Z', 'rgba(255,255,255,.14)') +
      P.flat('M68 42 L86 42 Q80 66 50 88Z', 'rgba(10,20,80,.18)') +
      P.line('M14 42 L86 42 M34 24 L32 42 L50 88 M66 24 L68 42 L50 88 M34 24 L50 42 L66 24', 1.1, 'rgba(220,235,255,.7)') +
      flecks + P.hl(42, 29, 5, 2, -10, 0.75) +
      P.eyes(50, 53, 14, 5.2, 'shiny', '#1e3a8a') + P.blush(50, 59.5, 22, 3.2, 1.9) + P.mouth(50, 60, 'smile', 0.7) +
      P.sparkle(14, 20, 5, '#ffe27a') + P.sparkle(88, 18, 3.6, '#9fc0ff') + P.sparkle(86, 72, 3.2, '#ffe27a');
  },
  megane(P) {
    const skin = P.fill('#eefcf6', '#a9e6cf', '#6cc4a4');
    const frame = (cx) => `<circle cx="${cx}" cy="56" r="13" fill="#eef8ff" fill-opacity="0.75" stroke="${P.OUT}" stroke-width="6"/>` +
      `<circle cx="${cx}" cy="56" r="13" fill="none" stroke="#e5484f" stroke-width="3.4"/>`;
    return P.shadow(50, 93, 26) +
      P.feet(88, [38, 62], '#6cc4a4', 5.5, 3.6) +
      P.ell(50, 62, 30, 27, skin) +
      P.line('M50 35 Q45 27 51 24 Q57 24 55 30', 2.2) +
      P.hl(33, 44, 5, 2.6) +
      P.line('M22 53 L19 50 M78 53 L81 50', 3.4, '#e5484f') +
      frame(36) + frame(64) +
      P.line('M47.5 53 Q50 50 52.5 53', 5.6) + P.line('M47.5 53 Q50 50 52.5 53', 3, '#e5484f') +
      P.eyes(50, 57, 28, 6.2, 'shiny', '#3a5fa8') +
      P.line('M40 47 L44 51 M68 47 L72 51', 1.6, 'rgba(255,255,255,.95)') +
      P.blush(50, 72, 42, 4, 2.3) + P.mouth(50, 74, 'o', 0.8) +
      P.path('M50 82 L42 78 L42 86Z M50 82 L58 78 L58 86Z', '#4a6fd0', 'stroke-width="1.6"') + P.circ(50, 82, 2.2, '#3553a8', 'stroke-width="1.4"');
  },

  enpitsu(P) {
    const body = 'M30 30 L70 30 L70 70 L30 70Z';
    return P.shadow(50, 93, 14) +
      P.line('M12 88 Q17 82 22 88 Q27 93 31 87', 2, '#6d6d82') +
      P.path('M30 69 L70 69 L50 91Z', P.fill('#ffeccc', '#f6d29c', '#dcae6c')) +
      P.flat('M43.3 84 L50 91 L56.7 84 Q50 86 43.3 84Z', '#4a4a58') +
      P.line('M43.3 84 L50 91 L56.7 84', P.SW) +
      P.path(body, P.fill('#fff3a6', '#ffd23e', '#f0a91c')) +
      P.flat('M31.2 31 L37 31 L37 69 L31.2 69Z', 'rgba(255,255,255,.35)') +
      P.flat('M63 31 L68.8 31 L68.8 69 L63 69Z', 'rgba(200,110,0,.18)') +
      P.path('M30 68 Q35 74 40 70 Q45 74 50 70 Q55 74 60 70 Q65 74 70 68', '#ffd23e', 'stroke-width="2"') +
      P.path('M32 21 Q32 9 44 9 L56 9 Q68 9 68 21 L68 23 L32 23Z', P.fill('#ffd0dd', '#ff8fb0', '#e8648e')) +
      P.rect(30, 21, 40, 10, 2, P.lin('#f4f6fa', '#b9bfcc')) +
      P.line('M31.5 24.5 L68.5 24.5 M31.5 27.5 L68.5 27.5', 1.1, 'rgba(90,100,120,.5)') +
      P.hl(38, 13, 4, 2) +
      P.eyes(50, 47, 16, 5.4) + P.blush(50, 55, 26, 3.8, 2.2) + P.mouth(50, 55.5, 'smile', 0.8);
  },

  rappa(P) {
    const gold = P.fill('#fff4b0', '#f5c331', '#c98a12');
    const tube = (d) => P.line(d, 7.4) + P.line(d, 4.4, '#f2bc2c');
    const note = (x, y, c) => `<ellipse cx="${x}" cy="${y}" rx="3" ry="2.3" fill="${c}" transform="rotate(-20 ${x} ${y})"/>` +
      P.line(`M${x + 2.6} ${y - 0.8} L${x + 2.6} ${y - 10} Q${x + 6} ${y - 8} ${x + 7} ${y - 5}`, 1.8, c);
    return P.shadow(48, 93, 28) +
      tube('M24 72 Q9 74 9 60 Q9 49 17 47') + P.path('M13 44 L19 42 L20 50 L14 51Z', '#e8b02a', 'stroke-width="1.8"') +
      [34, 42, 50].map(x => P.line(`M${x} 39 L${x} 28`, 4.6) + P.line(`M${x} 39 L${x} 28`, 2.2, '#f5c331') +
        P.ell(x, 27, 3.8, 2.2, '#fff6e2', 'stroke-width="1.6"')).join('') +
      P.feet(88, [32, 50], '#e0a21e', 5.5, 3.6) +
      P.circ(42, 59, 24, gold) +
      P.path('M52 62 C63 62 72 58 81 48 L81 84 C72 75 63 71 52 71Z', gold) +
      P.ell(81, 66, 6, 18, gold) + P.ell(82, 66, 3.6, 14, '#b9790f', 'stroke-width="1.4"') +
      P.flat('M55 64 C64 64 71 61 78 54 L78 57 C71 63 64 66 55 66Z', 'rgba(255,255,255,.5)') +
      P.hl(32, 46, 6, 3.2) +
      P.eyes(40, 56, 14, 5.4) + P.blush(41, 64, 24, 3.6, 2.1) +
      note(88, 30, '#ff6fa5') + note(70, 22, '#4a90e2');
  },

  tegami(P) {
    const paper = P.fill('#ffffff', '#fbf7f0', '#e6dbc6');
    const heart = (x, y, s, f, extra = '') => P.path(`M${x} ${y + 6 * s} C${x - 8 * s} ${y + 0.5 * s} ${x - 8 * s} ${y - 6 * s} ${x - 3.6 * s} ${y - 6 * s} C${x - 1.6 * s} ${y - 6 * s} ${x} ${y - 4.4 * s} ${x} ${y - 3 * s} C${x} ${y - 4.4 * s} ${x + 1.6 * s} ${y - 6 * s} ${x + 3.6 * s} ${y - 6 * s} C${x + 8 * s} ${y - 6 * s} ${x + 8 * s} ${y + 0.5 * s} ${x} ${y + 6 * s}Z`, f, extra);
    return P.shadow(50, 93, 28) +
      P.feet(88, [36, 64], '#efe6d6', 5, 3.2) +
      P.rect(14, 24, 72, 61, 7, paper) +
      P.line('M17 82 L38 66 M83 82 L62 66', 1.4, 'rgba(150,120,90,.3)') +
      P.path('M17 26 L50 51 L83 26Z', P.fill('#fffdf8', '#f2eadb', '#ddd0b8'), 'stroke-width="1.8"') +
      P.hl(25, 34, 4, 2) +
      heart(50, 49, 1, P.fill('#ffa0ad', '#e8384f', '#b81f38'), 'stroke-width="1.8"') +
      P.hl(47, 45, 1.6, 1, -25, 0.7) +
      P.eyes(50, 65, 20, 5.4) + P.blush(50, 72, 34, 4, 2.3) + P.mouth(50, 72.5, 'smile', 0.85) +
      heart(82, 16, 0.55, '#ff8fa8', 'stroke-width="1.4"') + heart(91, 27, 0.38, '#ffb3c1', 'stroke-width="1.2"');
  },

  hon(P) {
    const red = P.fill('#ff9b8e', '#e23b3b', '#a8222a');
    return P.shadow(50, 93, 28) +
      P.feet(89, [36, 62], '#a8222a', 5, 3.4) +
      P.path('M68 26 Q80 14 92 18 Q86 24 84 32 Q78 26 70 32Z', '#fffaf0', 'stroke-width="1.8"') +
      P.path('M70 34 Q84 30 93 38 Q86 41 82 48 Q78 40 70 42Z', '#fff5e2', 'stroke-width="1.8"') +
      P.rect(28, 15, 52, 69, 4, P.lin('#fffaf0', '#f1e4c8')) +
      P.line('M77 20 L77 80 M74.5 18 L74.5 82', 1, 'rgba(150,120,80,.45)') +
      P.rect(21, 18, 54, 69, 5, red) +
      P.flat('M23 23 Q23 20 26 20 L31 20 L31 85 L26 85 Q23 85 23 82Z', 'rgba(90,10,20,.25)') +
      P.line('M31 19.5 L31 85.5', 1.4, 'rgba(90,10,20,.45)') +
      P.line('M23.5 27 L30 27 M23.5 78 L30 78', 2, '#f5c84a') +
      P.rect(39, 27, 28, 11, 3, P.lin('#fff3b8', '#f2c14e'), 'stroke-width="1.6"') +
      P.line('M44 31 L62 31 M46 34.5 L60 34.5', 1.3, 'rgba(120,70,20,.55)') +
      P.hl(36, 24, 3, 1.6) +
      P.eyes(53, 56, 17, 5.6) + P.blush(53, 64, 28, 4, 2.3) + P.mouth(53, 64.5, 'open', 0.85) +
      P.sparkle(14, 30, 3.4, '#ffd45e');
  },

  hasami(P) {
    const pink = P.fill('#ffd3e2', '#ff86ad', '#e2577f');
    const steel = P.fill('#ffffff', '#d5dbe6', '#9aa4b6', 0.3, 0.2);
    const blade = 'M46.5 62.5 L53.5 59 Q63 74 65.5 87 Q65.5 91 62 89.5 Q54 77 46.5 62.5Z';
    const shine = 'M51 61.5 Q58 73 62.5 86.5';
    return P.shadow(50, 93, 22) +
      P.path(mx(blade), steel) + P.line(mx(shine), 1.2, 'rgba(255,255,255,.85)') +
      P.path(blade, steel) + P.line(shine, 1.2, 'rgba(255,255,255,.85)') +
      P.path('M27 41 L50 36 L73 41 C67 52 58 56 55 64 L45 64 C42 56 33 52 27 41Z', pink) +
      P.circ(36, 34, 14, pink) + P.circ(36, 34, 8, '#fff7fb') +
      P.circ(64, 34, 14, pink) + P.circ(64, 34, 8, '#fff7fb') +
      P.circ(50, 62, 3.4, P.fill('#ffffff', '#c7cedb', '#8a94a8'), 'stroke-width="1.8"') +
      P.hl(30, 26, 4, 2.2) + P.hl(58, 26, 4, 2.2) +
      P.eyes(50, 34.5, 28, 5.4) +
      P.blush(50, 49, 26, 3.6, 2.1, '#ff4f86') +
      P.mouth(50, 49.5, 'open', 0.95);
  },
  nuigurumi(P) {
    const fur = P.fill('#ffe2b8', '#e3a967', '#bf8040');
    const cream = '#fff0d8';
    return P.shadow(50, 93, 30) +
      P.circ(28, 27, 9.5, fur) + P.circ(72, 27, 9.5, fur) +
      P.flat('M28 22 a5 5 0 1 0 0.1 0Z', '#ffc2a6') + P.flat('M72 22 a5 5 0 1 0 0.1 0Z', '#ffc2a6') +
      P.ell(30, 70, 7, 9, fur, 'transform="rotate(25 30 70)"') + P.ell(70, 70, 7, 9, fur, 'transform="rotate(-25 70 70)"') +
      P.ell(50, 74, 20, 15, fur) +
      P.ell(36, 85, 8.5, 6.5, fur) + P.ell(64, 85, 8.5, 6.5, fur) +
      `<ellipse cx="36" cy="86" rx="4.6" ry="3.6" fill="${cream}"/><ellipse cx="64" cy="86" rx="4.6" ry="3.6" fill="${cream}"/>` +
      `<rect x="51" y="69" width="11" height="11" rx="1.5" fill="#9fd4f2" transform="rotate(10 56.5 74.5)"/>` +
      `<rect x="52.4" y="70.4" width="8.2" height="8.2" rx="1" fill="none" stroke="#5a8fb8" stroke-width="0.9" stroke-dasharray="1.6 1.2" transform="rotate(10 56.5 74.5)"/>` +
      P.ell(50, 44, 25, 22, fur) +
      P.line('M50 22.5 L50 31', 1, 'rgba(120,70,30,.6)') + P.line('M48 24 L52 24 M48 27 L52 27 M48 30 L52 30', 1, 'rgba(120,70,30,.6)') +
      P.ell(50, 54, 9.5, 7, cream, 'stroke-width="0"') +
      P.path('M38 63 Q50 69 62 63 L60 67 Q50 72 40 67Z', '#ff8fb0', 'stroke-width="1.6"') +
      P.path('M50 66 L43 61 L43 71Z M50 66 L57 61 L57 71Z', '#ff8fb0', 'stroke-width="1.6"') + P.circ(50, 66, 2.2, '#e8648e', 'stroke-width="1.4"') +
      P.hl(36, 32, 5, 2.6) +
      P.eyes(39.5, 44, 0, 5.4) +
      P.circ(60.5, 44, 5, P.fill('#ffe0ea', '#ff9ab8', '#e8648e'), 'stroke-width="1.6"') +
      `<g fill="#7a3550"><circle cx="58.9" cy="42.4" r="0.9"/><circle cx="62.1" cy="42.4" r="0.9"/><circle cx="58.9" cy="45.6" r="0.9"/><circle cx="62.1" cy="45.6" r="0.9"/></g>` +
      P.line('M58.9 42.4 L62.1 45.6 M62.1 42.4 L58.9 45.6', 0.9, '#7a3550') +
      `<ellipse cx="50" cy="51" rx="2.8" ry="2" fill="#3a2418"/>` + P.mouth(50, 54, 'cat', 0.75) +
      P.blush(50, 52, 34, 3.8, 2.2);
  },

  reizouko(P) {
    const body = P.fill('#ffffff', '#d9f5ec', '#9fd8c6');
    return P.shadow(50, 93, 26) +
      P.feet(89, [34, 66], '#8fcab6', 4.5, 3) +
      P.rect(25, 11, 50, 78, 10, body) +
      P.line('M25.5 56 L74.5 56', P.SW) +
      P.line('M31 22 L31 36 M31 63 L31 75', 3.6) + P.line('M31 22 L31 36 M31 63 L31 75', 1.6, '#eef3f7') +
      P.hl(36, 17, 5, 2.4) +
      P.eyes(53, 34, 16, 5.4) + P.blush(53, 41, 27, 3.8, 2.2) + P.mouth(53, 42, 'open', 0.85) +
      P.path(P.starPath(46, 70, 5, 2.5, 5, -90, 0.2), '#ffd84a', 'stroke-width="1.4"') +
      P.circ(64, 64, 3.4, P.fill('#ffb3b3', '#ef4b4b', '#b8262e'), 'stroke-width="1.4"') +
      P.path('M58 72 L69 72 L69 81 L58 81Z', '#fffbe8', 'stroke-width="1.2"') + P.line('M60 75.5 L67 75.5 M60 78 L65 78', 0.9, '#9aa') +
      P.circ(63.5, 72, 1.8, '#4a90e2', 'stroke-width="1"') +
      P.sparkle(84, 18, 4, '#9fe0ff') + P.sparkle(16, 30, 3, '#9fe0ff') +
      P.line('M84 29 l0 8 M80.5 31 l7 4 M80.5 35 l7 -4', 1.6, '#7cc8ec');
  },

  densha(P) {
    const fur = P.fill('#f2c48e', '#d48a4c', '#a8622c');
    const cream = P.fill('#fffdf4', '#fbefcf', '#e6d2a2');
    const car = (x, w) => P.rect(x, 50, w, 30, 8, cream) +
      P.flat(`M${x + 1.2} 66 L${x + w - 1.2} 66 L${x + w - 1.2} 73 L${x + 1.2} 73Z`, '#46ad66');
    const win = (x) => P.rect(x, 54, 9, 8.5, 2.4, P.lin('#e8f6ff', '#9fd0f2'), 'stroke-width="1.6"') + P.line(`M${x + 2} 59.5 L${x + 5} 55.5`, 1, 'rgba(255,255,255,.9)');
    return P.shadow(51, 92, 37) + '<g transform="translate(5 9) scale(0.9)">' +
      P.path('M88 58 Q96 54 95 44 Q99 46 98 54 Q96 62 88 64Z', fur) +
      P.line('M41 50 L44 43 L50 43 L53 50 M43 43 L51 43 M47 43 L47 39', 1.8) +
      [31, 48, 70, 84].map(x => P.circ(x, 83, 5.4, '#4c4a58') + `<circle cx="${x}" cy="83" r="1.9" fill="#c9ccd6"/>`).join('') +
      P.rect(56, 55, 10, 20, 2, '#7d7a80', 'stroke-width="1.8"') + P.line('M58.5 58 L58.5 72 M61 58 L61 72 M63.5 58 L63.5 72', 1, 'rgba(255,255,255,.35)') +
      car(62, 28) + car(22, 38) +
      win(37) + win(48) + win(67) + win(78) +
      P.hl(68, 53, 3, 1.4, 0, 0.7) +
      P.path('M10 40 Q3 46 4 58 Q5 66 11 64 Q15 56 16 46Z', '#9c5f2e') +
      P.path('M30 40 Q37 46 36 58 Q35 66 29 64 Q25 56 24 46Z', '#9c5f2e') +
      P.circ(20, 45, 14, fur) +
      P.path('M10 33 Q10 23.5 20 23.5 Q30 23.5 30 33Z', '#3f58a8') +
      P.path('M8 33.5 Q20 30 32 33.5 Q32 36.5 20 35.5 Q8 36.5 8 33.5Z', '#2f4385', 'stroke-width="1.8"') +
      P.circ(20, 28.5, 2.1, '#f5c84a', 'stroke-width="1.2"') +
      P.ell(20, 52.5, 8, 5.8, '#ffeccf', 'stroke-width="0"') +
      P.eyes(20, 44, 12.5, 4.6) + `<ellipse cx="20" cy="49.6" rx="2.6" ry="1.9" fill="#3a2418"/>` +
      P.mouth(20, 52.6, 'cat', 0.6) + P.blush(20, 50.5, 22, 3, 1.8) + '</g>';
  },
  shinkansen(P) {
    const white = P.fill('#ffffff', '#f2f6fc', '#c8d3e6', 0.3, 0.25);
    const ear = 'M57 33 Q70 29 72.5 41 Q75 55 68 61 Q61.5 63 60.5 54.5 Q58.5 44 57 33Z';
    return P.shadow(50, 93, 40) +
      P.line('M74 26 L97 26 M80 20 L98 20 M88 14 L98 14', 2, '#9fcff5') +
      P.path('M89 48 Q97 42 96 32 Q100 35 99 43 Q97 52 90 54Z', P.fill('#f2c48e', '#d48a4c', '#a8622c')) +
      [30, 48, 66, 80].map(x => P.circ(x, 83, 4.6, '#4c4a58')).join('') +
      P.path('M8 76 C8 66 24 48 42 39 C50 35 56 32 64 32 L84 32 Q91 32 91 39 L91 77 Q91 82 86 82 L16 82 C10 82 8 80 8 76Z', white) +
      P.flat('M10.5 76.5 C20 72.5 34 71.5 52 71.5 L89.8 71.5 L89.8 77 L52 77 C36 77 24 78.5 12 81Z', '#2f6fd6') +
      P.line('M32 79.6 L89.5 79.6', 1.3, '#46ad66') +
      P.path('M35 48.5 Q45 39 58.5 36.5 L59.5 43 Q47 44 38.5 51.5Z', P.lin('#4a6aa8', '#1e2c55'), 'stroke-width="1.8"') +
      P.line('M43 45 L50 41', 1.3, 'rgba(255,255,255,.7)') +
      [76, 84].map(x => P.rect(x, 42, 5, 7, 1.6, '#3a5594', 'stroke-width="1.4"')).join('') +
      P.hl(70, 35.5, 8, 1.5, 0, 0.8) +
      P.path(ear, P.fill('#c98a55', '#9c5f2e', '#7a4520')) + P.line('M62 38 Q66 48 65 57', 1.3, 'rgba(255,220,180,.5)') +
      P.eyes(31, 60, 14, 5.6) + P.blush(31, 67, 24, 3.6, 2.1) + P.mouth(32, 67, 'smile', 0.75) +
      P.ell(11.5, 74, 3.2, 2.6, '#2b1d16', 'stroke-width="0"') + `<circle cx="10.6" cy="73" r="1" fill="#fff" opacity="0.8"/>` +
      P.sparkle(14, 36, 5, '#ffd45e') + P.sparkle(28, 23, 3.2, '#9fcff5');
  },



  kuruma(P) {
    const red = P.fill('#ffa9a0', '#ec3b3b', '#b0222a');
    return P.shadow(50, 93, 36) +
      P.rect(15, 71, 15, 19, 5, '#3d3b48') + P.rect(70, 71, 15, 19, 5, '#3d3b48') +
      P.line('M58 25 L63 13', 1.8) + P.circ(63.5, 12, 2.6, '#ffd84a', 'stroke-width="1.6"') +
      P.line('M22 50 L24 46 M78 50 L76 46', 2) + P.ell(20, 45, 5, 3.6, red) + P.ell(80, 45, 5, 3.6, red) +
      P.path('M27 50 C29 31 37 23 50 23 C63 23 71 31 73 50Z', red) +
      P.path('M33 48 C35 35 41 29 50 29 C59 29 65 35 67 48Z', P.lin('#eef9ff', '#9fd0f2'), 'stroke-width="1.8"') +
      P.line('M40 44 L46 33 M45 45 L50 36', 1.6, 'rgba(255,255,255,.85)') +
      P.path('M13 66 C13 54 20 48 32 47 L68 47 C80 48 87 54 87 66 L87 77 Q87 84 80 84 L20 84 Q13 84 13 77Z', red) +
      P.hl(24, 54, 5, 2.4) +
      P.circ(31, 62, 9, '#fff8dc', 'stroke-width="2"') + P.circ(69, 62, 9, '#fff8dc', 'stroke-width="2"') +
      P.eyes(50, 62, 38, 6.2) +
      P.path('M38 70 Q50 81 62 70 Q50 74 38 70Z', '#3d3b48', 'stroke-width="1.8"') +
      P.line('M45 72.6 L45.6 75.4 M50 73.2 L50 76.4 M55 72.6 L54.4 75.4', 1.2, '#c9ccd6') +
      P.rect(20, 79, 60, 6, 3, P.lin('#ffffff', '#b9bfcc'), 'stroke-width="1.8"') +
      P.blush(50, 73, 54, 4, 2.3);
  },

  hikouki(P) {
    const white = P.fill('#ffffff', '#f2f6fc', '#c5d0e2', 0.3, 0.25);
    const cloud = (x, y, k) => P.path(`M${x} ${y} q${-2 * k} ${-6 * k} ${4 * k} ${-7 * k} q${1 * k} ${-5 * k} ${7 * k} ${-4 * k} q${4 * k} ${-3 * k} ${7 * k} ${2 * k} q${5 * k} 0 ${4 * k} ${5 * k} q${1 * k} ${4 * k} ${-4 * k} ${4 * k}Z`, '#eef7ff', 'stroke-width="1.6"');
    return P.shadow(50, 93, 24) +
      cloud(70, 90, 1) +
      P.path('M48 45 L60 28 Q62 26 65 27 L66 29 L60 46Z', '#dfe6f2') +
      P.path('M68 45 L79 18 Q80.5 15 84 16 L89 18 L88 50Z', P.fill('#9ccaff', '#4a90e2', '#2f6ab8')) +
      P.path('M12 58 C12 44 24 38 38 38 C56 38 74 42 86 45 Q93 47 92 53 Q91 59 84 61 C72 66 56 72 38 74 C22 75 12 70 12 58Z', white) +
      P.line('M42 68.5 C58 66 72 62 89 56', 3.2, '#4a90e2') +
      [52, 61, 70, 79].map((x, i) => P.circ(x, 50 - i * 0.6, 2.6, '#bfe4ff', 'stroke-width="1.3"')).join('') +
      P.path('M20 47 Q27 41 37 40.5 L38.5 47 Q30 47.5 23 51Z', P.lin('#5d7fc0', '#22325e'), 'stroke-width="1.8"') +
      P.line('M26 45.5 L31 43', 1.2, 'rgba(255,255,255,.75)') +
      P.path('M76 54 L92 48 Q95.5 47.5 95 50.5 L86 59Z', '#e6ecf6') +
      P.path('M44 62 L58 61 L71 82 Q72 85.5 68 85.5 L63 85.5Z', white) +
      P.hl(24, 42, 5, 2, -15, 0.8) +
      P.eyes(28, 56, 12.5, 4.8, 'shiny', '#244a6b') + P.blush(28, 62, 22, 3.2, 1.9) + P.mouth(28.5, 62.5, 'smile', 0.7) +
      cloud(8, 84, 1);
  },
  jitensha(P) {
    const tube = (d) => P.line(d, 6.6) + P.line(d, 3.8, '#4cbb6c');
    const wheel = (x) => P.circ(x, 74, 14.5, 'none', 'stroke-width="6.6"') + `<circle cx="${x}" cy="74" r="14.5" fill="none" stroke="#5a5866" stroke-width="3.8"/>` +
      `<circle cx="${x}" cy="74" r="10.5" fill="none" stroke="#c9ccd6" stroke-width="1.2"/>` +
      P.line(`M${x - 10} 74 L${x + 10} 74 M${x} 64 L${x} 84 M${x - 7} 67 L${x + 7} 81 M${x + 7} 67 L${x - 7} 81`, 0.9, '#b9bdc8') +
      P.circ(x, 74, 2.4, '#e9ebf0', 'stroke-width="1.4"');
    return P.shadow(50, 93, 38) +
      wheel(26) + wheel(73) +
      tube('M26 74 L46 76 L37 51 Z M38 54 L63 50 M64 52 L46 76 M63 46 L73 74') +
      P.line('M63 46 L60 33', 3.8) + P.line('M63 46 L60 33', 1.8, '#9aa0ac') +
      P.path('M28 46 Q36 42 44 46 Q42 50 35 50 Q29 50 28 46Z', '#7a4a2a', 'stroke-width="1.8"') +
      P.circ(46, 76, 3.6, '#c9ccd6', 'stroke-width="1.6"') + P.line('M46 76 L50 81 M47.5 81 L53 81', 2.2) +
      P.line('M60 33 Q57 27 51 28', 3.8) + P.line('M60 33 Q57 27 51 28', 1.8, '#9aa0ac') +
      P.circ(53.5, 25, 3.4, P.fill('#fff6b0', '#ffc93a', '#d99a14'), 'stroke-width="1.6"') + P.circ(53.5, 21.2, 1, '#ffc93a', 'stroke-width="1"') +
      P.leaf(66, 36, 11, -35, '#7ed36a') + P.circ(70, 32, 4.4, '#ff8fb0', 'stroke-width="1.6"') + P.circ(70, 32, 1.6, '#ffe27a', 'stroke-width="0"') +
      P.path('M56 39 L92 39 L87.5 64 Q86.5 67 83 67 L65 67 Q61.5 67 60.5 64Z', P.fill('#ffe9c2', '#e8b878', '#c48e4c')) +
      P.line('M58 46 L90.5 46 M59.5 53 L89 53 M60.5 60 L88 60 M66 39.5 L68.5 66.5 M74 39.5 L74 66.5 M82 39.5 L79.5 66.5', 0.8, 'rgba(140,90,40,.3)') +
      P.rect(54.5, 35, 39, 5.5, 2.75, '#d9a35e', 'stroke-width="1.8"') +
      P.hl(62, 45, 2.6, 1.4, 0, 0.6) +
      P.eyes(74, 51, 15, 5.2) + P.blush(74, 58, 24, 3.4, 2) + P.mouth(74, 58.5, 'open', 0.8);
  },

  fuusen(P) {
    const red = P.fill('#ffb6ae', '#f0424a', '#b81f2e');
    return P.shadow(50, 93, 12) +
      P.line('M50 75 C43 78 43 84 49 84 C55 84 54 78 49 79 C44 80 45 87 50 89 C53 90.5 52 92 50 92.5', 1.6) +
      P.path('M50 72 L45.5 77 L54.5 77Z', '#d12e3b', 'stroke-width="1.8"') +
      P.path('M50 12 C66 12 78 25 78 41 C78 58 64 72 50 73 C36 72 22 58 22 41 C22 25 34 12 50 12Z', red) +
      P.hl(36, 27, 7, 4.5, -35, 0.7) + `<circle cx="31" cy="37" r="1.8" fill="#fff" opacity="0.7"/>` +
      P.eyes(50, 44, 17, 5.8) + P.blush(50, 52, 28, 4.2, 2.4, '#ff9fb0') + P.mouth(50, 52, 'open', 0.9) +
      P.sparkle(84, 20, 3.4, '#ffd45e') + P.sparkle(16, 60, 2.8, '#ffd45e');
  },

  dango(P) {
    const pink = P.fill('#fff0f5', '#ffadc8', '#ef7fa3');
    const white = P.fill('#ffffff', '#fbf8f0', '#e3d9c6');
    const green = P.fill('#f0fbe0', '#a9dc7c', '#7cbf54');
    return P.shadow(46, 93, 22) + '<g transform="rotate(16 50 52)">' +
      P.rect(48.2, 2, 3.6, 92, 1.8, P.lin('#f6dcae', '#d9ac6a'), 'stroke-width="1.8"') +
      P.circ(50, 74, 15.5, green) + P.hl(42, 67, 3.6, 2) +
      P.eyes(50, 73, 11, 3.8, 'closed') + P.blush(50, 78, 19, 2.8, 1.6) + P.mouth(50, 78.5, 'cat', 0.55) +
      P.circ(50, 49, 15.5, white) + P.hl(42, 42, 3.6, 2) +
      P.eyes(50, 48, 11, 3.8, 'wink') + P.blush(50, 53, 19, 2.8, 1.6) + P.mouth(50, 53.5, 'smile', 0.6) +
      P.circ(50, 24, 15.5, pink) + P.hl(42, 17, 3.6, 2) +
      P.eyes(50, 23, 11, 3.8) + P.blush(50, 28, 19, 2.8, 1.6) + P.mouth(50, 28.5, 'open', 0.6) +
      '</g>';
  },

  sushi(P) {
    const grains = [[28, 66, 20], [36, 80, -30], [62, 82, 15], [72, 70, -20], [24, 78, 40], [76, 80, 60], [50, 85, 0], [44, 76, -60], [58, 75, 30]]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.2" fill="#e8e1d1" transform="rotate(${r} ${x} ${y})"/>`).join('');
    return P.shadow(50, 93, 32) +
      P.path('M17 64 C17 52 30 48 50 48 C70 48 83 52 83 64 L83 79 C83 87 74 90 50 90 C26 90 17 87 17 79Z', P.fill('#ffffff', '#f8f5ee', '#ddd6c6')) +
      grains +
      P.path('M10 50 C8 38 22 27 42 27 L64 27 C80 27 92 35 90 47 C89 54 83 57 77 53 C66 48 34 48 24 55 C17 59 11 57 10 50Z', P.fill('#ffc7a0', '#ff8a5c', '#e8603a', 0.4, 0.3)) +
      P.line('M26 31 Q33 40 30 51 M41 28.5 Q48 38 45 48.5 M56 28 Q63 38 60 48.5 M71 29 Q78 38 76 50', 2.2, 'rgba(255,240,225,.8)') +
      P.hl(22, 35, 5, 2.2, -20, 0.6) +
      P.eyes(50, 66, 17, 5.4) + P.blush(50, 74, 30, 4, 2.3) + P.mouth(50, 74.5, 'grin', 0.8);
  },

  momo(P) {
    return P.shadow(50, 93, 28) +
      P.line('M50 18 Q51 13 54 11', 2.6, '#7a5230') +
      P.leaf(51, 17, 15, -62, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.leaf(52, 17, 13, 58, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.path('M50 17 C56 23 64 23 72 27 C86 35 88 57 80 73 C72 87 60 90 50 90 C40 90 28 87 20 73 C12 57 14 35 28 27 C36 23 44 23 50 17Z',
        P.fill('#fff6ea', '#ffc6c2', '#f5899c', 0.5, 0.78)) +
      `<ellipse cx="66" cy="38" rx="14" ry="11" fill="#ff7e98" opacity="0.28" transform="rotate(30 66 38)"/>` +
      P.line('M50 18.5 Q40 34 44 56', 1.8, 'rgba(214,92,118,.55)') +
      P.hl(33, 38, 5, 3) +
      P.eyes(52, 60, 16, 5.2) + P.blush(52, 67, 30, 5.4, 3.2, '#ff7e98') + P.mouth(52, 67, 'cat', 0.8);
  },

  budou(P) {
    const g = P.fill('#e2c6ff', '#8a4fd0', '#5a2b96');
    const grape = (x, y, r) => P.circ(x, y, r, g) + `<circle cx="${(x - r * 0.4).toFixed(1)}" cy="${(y - r * 0.4).toFixed(1)}" r="${(r * 0.22).toFixed(1)}" fill="#fff" opacity="0.6"/>`;
    return P.shadow(50, 93, 22) +
      P.line('M50 22 Q50 14 46 9', 3, '#7a5230') + P.line('M49 14 Q58 10 58 16 Q58 20 62 19', 1.4, '#6cae4a') +
      P.leaf(51, 17, 18, 68, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      grape(29, 42, 10) + grape(71, 42, 10) +
      grape(50, 86, 6.5) + grape(40, 79, 9.5) + grape(60, 79, 9.5) +
      grape(33, 61, 11) + grape(67, 61, 11) + grape(50, 66, 12) +
      P.circ(50, 39, 18, g) + P.hl(42, 29, 5, 2.8) +
      P.eyes(50, 40, 14, 5) + P.blush(50, 47, 24, 3.6, 2.1, '#ff9fd0') + P.mouth(50, 47.5, 'smile', 0.75);
  },
  ninjin(P) {
    const leafF = P.fill('#c8f59a', '#6cc24a', '#4c9a34');
    return P.shadow(50, 93, 16) +
      P.line('M50 29 L40 16 M50 29 L50 12 M50 29 L60 16', 2.4, '#4f9a3a') +
      P.leaf(47, 28, 17, -42, leafF) + P.leaf(53, 28, 17, 42, leafF) + P.leaf(50, 27, 20, 0, leafF) +
      P.path('M27 37 C27 28 38 26 50 26 C62 26 73 28 73 37 C73 55 61 76 54 88 Q50 93 46 88 C39 76 27 55 27 37Z', P.fill('#ffd6a8', '#ff8c2e', '#e0661a')) +
      P.line('M30 55 Q34 56.5 37 54 M66 58 Q68.5 59 70 56.5 M41 73 Q44 74.5 46.5 72.5 M57 77 Q59 78 60.5 76', 1.5, 'rgba(180,80,10,.45)') +
      P.hl(35, 34, 5, 2.6) +
      P.eyes(50, 44, 16, 5.3) + P.blush(50, 51, 28, 4, 2.3) + P.mouth(50, 51.5, 'open', 0.85);
  },

  nori(P) {
    const eyeWhite = (x) => `<ellipse cx="${x}" cy="46" rx="6.6" ry="7.6" fill="#fff"/>`;
    const dots = [[30, 30], [66, 28], [72, 60], [28, 64], [42, 72], [62, 74], [36, 40], [70, 42]]
      .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#7aa86a" opacity="0.55"/>`).join('');
    return P.shadow(50, 93, 20) + '<g transform="rotate(-6 50 50)">' +
      P.path('M24 21 Q50 15 76 21 Q80 49 78 75 Q71 87 64 78 Q57 87 50 78 Q43 87 36 78 Q29 87 22 75 Q20 49 24 21Z', P.fill('#6d9a5c', '#36562f', '#203823')) +
      dots + P.line('M30 26 L70 24 M28 34 L72 33', 0.8, 'rgba(160,200,140,.25)') +
      P.hl(33, 27, 6, 2.6, -10, 0.35) +
      eyeWhite(41) + eyeWhite(59) + P.eyes(50, 46, 18, 5.8, 'shiny', '#3c6b34') +
      P.blush(50, 56, 32, 4.2, 2.4, '#ff8fb0') + P.mouth(50, 56, 'open', 0.9) +
      `<ellipse cx="71" cy="27" rx="3.2" ry="1.9" fill="#fffdf6" stroke="${P.OUT}" stroke-width="1.2" transform="rotate(-30 71 27)"/>` +
      '</g>';
  },

  gohan(P) {
    const red = P.fill('#ff8f86', '#d8303a', '#9c1c26');
    let rice = 'M17 58';
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a0 = Math.PI * (1 + i / n), a1 = Math.PI * (1 + (i + 1) / n), am = (a0 + a1) / 2;
      const x1 = 50 + Math.cos(a1) * 33, y1 = 58 + Math.sin(a1) * 38;
      const cx = 50 + Math.cos(am) * 37.5, cy = 58 + Math.sin(am) * 43;
      rice += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
    }
    const grains = [[32, 34, 30], [64, 30, -30], [26, 48, 60], [74, 46, -60], [42, 26, 10], [58, 50, 20], [38, 52, -20]]
      .map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.2" ry="1.2" fill="#ebe5d6" transform="rotate(${r} ${x} ${y})"/>`).join('');
    const flower = (x, y) => P.flat(P.starPath(x, y, 4.2, 2.6, 5, -90, 0.45), '#fff3f5') + `<circle cx="${x}" cy="${y}" r="1.2" fill="#f5c84a"/>`;
    return P.shadow(50, 93, 28) +
      P.line('M18 26 Q14 20 18 15 Q22 10 18 5', 2, '#c3d3e2') + P.line('M84 28 Q80 22 84 17 Q88 12 84 7', 2, '#c3d3e2') +
      P.path(rice + 'Z', P.fill('#ffffff', '#fbf9f3', '#e2dccd')) + grains +
      P.rect(36, 84, 28, 7, 2.5, '#9c1c26') +
      P.path('M11 56 L89 56 C89 74 77 87 62 88 L38 88 C23 87 11 74 11 56Z', red) +
      P.line('M12.5 59.5 L87.5 59.5', 1.4, '#f5c84a') +
      flower(28, 70) + flower(50, 76) + flower(72, 70) +
      P.hl(22, 64, 4, 2, -30, 0.5) + P.hl(36, 30, 5, 2.6) +
      P.eyes(50, 38, 17, 5.6) + P.blush(50, 46, 30, 4.2, 2.4) + P.mouth(50, 46.5, 'open', 0.9);
  },

  zou(P) {
    const grey = P.fill('#e6eef8', '#a3b7d3', '#7389ab');
    const ear = 'M30 34 C18 24 4 30 6 48 C8 62 20 68 32 60Z';
    const earIn = 'M27 39 C19 33 11 37 12 48 C13 57 21 60 28 55Z';
    const B = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * t * (1 - t) ** 2 * b + 3 * t * t * (1 - t) * c + t ** 3 * d;
    const side = [[], []];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, e = 0.001, w = 7.4 - 3.2 * t;
      const x = B(t, 50, 50, 70, 79), y = B(t, 42, 66, 68, 35);
      const dx = B(t + e, 50, 50, 70, 79) - x, dy = B(t + e, 42, 66, 68, 35) - y, l = Math.hypot(dx, dy);
      side[0].push(`${(x - dy / l * w).toFixed(1)} ${(y + dx / l * w).toFixed(1)}`);
      side[1].unshift(`${(x + dy / l * w).toFixed(1)} ${(y - dx / l * w).toFixed(1)}`);
    }
    const trunk = 'M' + side[0].join(' L') + ' L' + side[1].join(' L') + 'Z';
    const drop = (x, y, s) => P.path(`M${x} ${y - 4 * s} Q${x + 3 * s} ${y} ${x + 3 * s} ${y + 1.2 * s} A${3 * s} ${3 * s} 0 0 1 ${x - 3 * s} ${y + 1.2 * s} Q${x - 3 * s} ${y} ${x} ${y - 4 * s}Z`, '#9fdcff', 'stroke-width="1.4"');
    return P.shadow(50, 93, 26) +
      P.path(ear, grey) + P.path(mx(ear), grey) +
      P.flat(earIn, '#ffc2cf') + P.flat(mx(earIn), '#ffc2cf') +
      P.ell(50, 78, 21, 13, grey) +
      P.rect(35, 79, 12, 12, 5, grey) + P.rect(53, 79, 12, 12, 5, grey) +
      P.line('M38 89 L44 89 M56 89 L62 89', 1.6, '#fff') +
      P.circ(50, 45, 23, grey) +
      P.hl(38, 31, 6, 3) +
      P.eyes(50, 42, 22, 5.4) + P.blush(50, 52, 34, 4, 2.3) + P.mouth(40, 59, 'open', 0.7) +
      P.flat(trunk, '#a8bbd6') + P.line('M' + side[0].slice(2).join(' L'), P.SW) + P.line('M' + side[1].slice(0, -2).join(' L'), P.SW) +
      P.line('M45.5 55 L50 54 M49 62.5 L53 59.5 M58 65 L59.5 61 M66.5 62 L69 64.5 M72 53 L75 55', 1.2, 'rgba(70,90,120,.45)') +
      P.ell(79.2, 35.4, 4.4, 2.4, '#6f86a8', 'stroke-width="1.6" transform="rotate(-78 79.2 35.4)"') +
      drop(80, 22, 0.9) + drop(88, 28, 0.75) + drop(71, 21, 0.7) +
      `<path d="M8 56 Q14 48 24 50" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1.4"/>`;
  },

  n(P) {
    const id = P.u + 'aura';
    P.defs.push(`<radialGradient id="${id}"><stop offset="0" stop-color="#fff6c8" stop-opacity="0.95"/><stop offset="0.55" stop-color="#ffe58a" stop-opacity="0.45"/><stop offset="1" stop-color="#ffe58a" stop-opacity="0"/></radialGradient>`);
    const glow = P.fill('#ffffff', '#fff3c2', '#f2c64a', 0.35, 0.3);
    const body = 'M52 37 L30.5 76 Q26.5 84.5 34 77 C41 64 48 52 55.5 56 C62 60 58 76 66 81 C73 85 80 79 83.5 70';
    let rays = '';
    for (let i = 0; i < 12; i++) {
      const a = i * Math.PI / 6 + 0.2;
      rays += `M${(50 + Math.cos(a) * 30).toFixed(1)} ${(54 + Math.sin(a) * 30).toFixed(1)} L${(50 + Math.cos(a) * 44).toFixed(1)} ${(54 + Math.sin(a) * 44).toFixed(1)} `;
    }
    return `<circle cx="50" cy="54" r="46" fill="url(#${id})"/>` +
      P.line(rays, 2, 'rgba(255,214,90,.35)') +
      P.shadow(52, 93, 22) +
      P.line(body, 19.6) + `<path d="${body}" fill="none" stroke="${glow}" stroke-width="14.8" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<path d="${body}" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" opacity="0.7" transform="translate(-2.2 -1.4)"/>` +
      `<ellipse cx="56" cy="10" rx="9" ry="2.8" fill="none" stroke="${P.OUT}" stroke-width="4.6"/><ellipse cx="56" cy="10" rx="9" ry="2.8" fill="none" stroke="#ffd45e" stroke-width="2.2"/>` +
      P.circ(56, 27, 13.5, glow) + P.hl(50, 20, 4.4, 2.4, -25, 0.8) +
      P.eyes(56, 27, 12, 4.8, 'shiny', '#c08a1a') + P.blush(56, 33, 21, 3.2, 1.9, '#ffa0b8') + P.mouth(56, 33, 'open', 0.7) +
      P.sparkle(84.5, 69, 4.6, '#ffd45e') +
      P.sparkle(16, 26, 4.4, '#ffd45e') + P.sparkle(86, 30, 3.4, '#ffe9a0') + P.sparkle(20, 60, 2.8, '#ffe9a0') + P.sparkle(76, 12, 2.4, '#ffd45e') +
      `<circle cx="28" cy="40" r="1.3" fill="#ffd45e"/><circle cx="80" cy="48" r="1.1" fill="#ffd45e"/><circle cx="44" cy="86" r="1" fill="#ffd45e"/>`;
  },
};
