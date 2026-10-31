// Reference creatures (the trailer cast + starters). Each function returns the SVG body.

export default {
  tane(P) {
    return P.shadow(50, 92, 26) +
      P.line('M50 32 L50 21', 2.6, '#4f8f3a') +
      P.leaf(50, 23, 15, -55, P.fill('#c8f59a', '#7ccf54', '#58a83a')) +
      P.leaf(50, 23, 15, 55, P.fill('#c8f59a', '#7ccf54', '#58a83a')) +
      P.path('M50 30 C70 30 81 50 81 70 C81 86 67 91 50 91 C33 91 19 86 19 70 C19 50 30 30 50 30Z',
        P.fill('#e2fbe8', '#9fe3b8', '#6cc493')) +
      P.hl(36, 46, 7, 4) +
      P.eyes(50, 57, 19, 6.2) + P.blush(50, 66, 30) + P.mouth(50, 66, 'smile') +
      // acorn held in tiny hands
      P.ell(50, 82, 6, 6.5, P.fill('#e3a868', '#c98b4a', '#9c6430')) +
      P.path('M43 79 Q43 73 50 73 Q57 73 57 79Z', '#8a5a34') +
      P.line('M50 73 L50 70', 2, '#6b4426') +
      P.ell(41, 81, 4.2, 3.6, '#a9e8c0') + P.ell(59, 81, 4.2, 3.6, '#a9e8c0');
  },

  hinoko(P) {
    const orange = P.fill('#ffc27a', '#ff8a2a', '#e0631a');
    return P.shadow(50, 92, 28) +
      // tail with a little flame tip
      P.path('M60 82 Q84 86 88 66 Q90 52 80 46 Q84 60 74 68 Q66 74 58 72Z', orange) +
      P.path('M80 50 Q73 42 78 32 Q80 38 84 36 Q82 27 89 21 Q96 34 91 44 Q88 50 80 50Z',
        P.fill('#fff6a0', '#ffb52e', '#ff5a1f', 0.5, 0.75)) +
      P.path('M84 46 Q81 40 85 35 Q88 41 87 46Z', '#fff6c0', 'stroke-width="0"') +
      // body
      P.ell(50, 77, 17, 13.5, orange) +
      P.ell(50, 80, 9, 8.5, '#fff1dc', 'stroke-width="0"') +
      P.feet(89, [41, 59], '#e86f22', 5.5, 3.6) +
      // ears
      P.path('M31 40 L27 13 L46 30Z', orange) + P.flat('M32 34 L30 19 L40 29Z', '#7a3b1f') +
      P.path('M69 40 L73 13 L54 30Z', orange) + P.flat('M68 34 L70 19 L60 29Z', '#7a3b1f') +
      // head
      P.ell(50, 48, 24.5, 21, orange) +
      `<path d="M28 52 Q36 66 50 66 Q64 66 72 52 Q62 58 50 58 Q38 58 28 52Z" fill="#fff1dc"/>` +
      P.hl(38, 36, 7, 3.6) +
      P.eyes(50, 49, 19, 6.6) +
      `<ellipse cx="50" cy="56.5" rx="2.2" ry="1.5" fill="#3a2418"/>` +
      P.mouth(50, 59, 'cat', 0.8) + P.blush(50, 56, 32);
  },

  shizuku(P) {
    const blue = P.fill('#eefaff', '#a6dcf6', '#6db7e4');
    return P.shadow(50, 92, 28) +
      P.path('M26 76 Q12 80 15 89 Q25 89 33 81Z', '#86c8ee') +
      P.path('M74 76 Q88 80 85 89 Q75 89 67 81Z', '#86c8ee') +
      P.path('M22 80 C22 56 34 38 51 38 C69 38 80 54 78 72 C77 85 68 91 50 91 C33 91 22 88 22 80Z', blue) +
      `<ellipse cx="50" cy="79" rx="17" ry="9" fill="#fff" opacity="0.55"/>` +
      P.hl(36, 50, 6, 3.4) +
      P.eyes(50, 57, 21, 6.4, 'shiny', '#244a6b') +
      `<ellipse cx="50" cy="65.5" rx="8.5" ry="5" fill="#f4fbff"/>` +
      `<ellipse cx="50" cy="62.5" rx="2.6" ry="1.8" fill="#2b2b3a"/>` +
      P.mouth(50, 65.5, 'cat', 0.75) + P.blush(50, 63, 32) +
      `<circle cx="44" cy="66" r="0.8" fill="#5b7a90"/><circle cx="56" cy="66" r="0.8" fill="#5b7a90"/>` +
      // water drop on head
      P.path('M50 14 Q59 27 59 32 A9 9 0 0 1 41 32 Q41 27 50 14Z', P.fill('#f2fbff', '#7fd0f5', '#3ea6e0')) +
      P.hl(46.5, 29, 2.2, 3.4, 0, 0.8);
  },

  tsuki(P) {
    return P.shadow(48, 92, 26) +
      // crescent moon
      P.path('M50 22 A33 33 0 1 0 79 76 A31 31 0 0 1 50 22Z', P.fill('#fff9d6', '#f7df82', '#e2bd55', 0.3, 0.6)) +
      `<ellipse cx="26" cy="58" rx="4" ry="3" fill="#e5c262"/><ellipse cx="33" cy="76" rx="3" ry="2.4" fill="#e5c262"/><ellipse cx="25" cy="44" rx="2.4" ry="2" fill="#e5c262"/>` +
      // bunny ears
      P.ell(55, 27, 5, 13, '#fff1d6', 'transform="rotate(-12 55 27)"') +
      `<ellipse cx="55" cy="28" rx="2.2" ry="8.5" fill="#ffb3c1" transform="rotate(-12 55 27)"/>` +
      P.ell(68, 28, 5, 13, '#fff1d6', 'transform="rotate(14 68 28)"') +
      `<ellipse cx="68" cy="29" rx="2.2" ry="8.5" fill="#ffb3c1" transform="rotate(14 68 28)"/>` +
      // body + head
      P.ell(62, 70, 12, 11, P.fill('#fffaf0', '#f7e3bb', '#e8c98e')) +
      P.circ(74, 74, 4, '#fffaf0') +
      P.circ(61, 49, 15, P.fill('#fffaf0', '#f7e3bb', '#e8c98e')) +
      P.hl(55, 42, 4, 2.4) +
      P.eyes(61, 50, 12, 4.6) + P.blush(61, 55, 20, 3.4, 2) + P.mouth(61, 55.5, 'cat', 0.6) +
      // little arms hugging the moon
      P.ell(50, 66, 4, 3.2, '#fbefd5') + P.ell(54, 72, 3.6, 3, '#fbefd5') +
      P.sparkle(84, 40, 4) + P.sparkle(80, 22, 2.6);
  },

  ringo(P) {
    // spikes around the back
    let spikes = 'M22 64';
    for (let i = 0; i <= 14; i++) {
      const a = (195 + i * 10.7) * Math.PI / 180, r = i % 2 ? 26 : 36;
      spikes += ` L${(50 + Math.cos(a) * r).toFixed(1)} ${(60 + Math.sin(a) * r).toFixed(1)}`;
    }
    spikes += ' L78 64Z';
    return P.shadow(50, 92, 28) +
      P.path(spikes, P.fill('#c9925e', '#9a6338', '#71431f')) +
      P.path('M50 36 C40 28 22 32 20 53 C18 75 34 90 50 88 C66 90 82 75 80 53 C78 32 60 28 50 36Z',
        P.fill('#ff9a9a', '#e8333f', '#b51f2b')) +
      P.hl(33, 46, 6, 3.4) +
      P.line('M50 36 Q50 28 54 23', 3, '#6b4426') +
      P.leaf(53, 28, 14, 60, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.ell(50, 66, 18, 14, P.fill('#fffaf0', '#ffe9cc', '#f3d2a8')) +
      P.eyes(50, 63, 16, 5.6) +
      `<ellipse cx="50" cy="68.5" rx="2" ry="1.5" fill="#3a2418"/>` +
      P.mouth(50, 71, 'smile', 0.7) + P.blush(50, 69, 27, 3.8, 2.2) +
      P.feet(89, [40, 60], '#9a6338', 5, 3.4);
  },

  hoshi(P) {
    return P.shadow(50, 93, 22) +
      P.path(P.starPath(50, 57, 41, 21, 5, -90, 0.22), P.fill('#fffbd8', '#ffe04a', '#f0b11a')) +
      P.hl(38, 44, 5, 3) +
      P.eyes(50, 56, 15, 5.4) + P.blush(50, 63, 24, 3.8, 2.2) + P.mouth(50, 63, 'open', 0.9) +
      P.sparkle(14, 26, 4.5) + P.sparkle(88, 22, 3.5) + P.sparkle(86, 84, 3);
  },

  onigiri(P) {
    return P.shadow(50, 92, 28) +
      P.feet(89, [38, 62], '#fbfaf6', 5, 3.4) +
      P.path('M50 20 C57 20 61 25 65 32 L83 67 C88 76 83 87 72 87 L28 87 C17 87 12 76 17 67 L35 32 C39 25 43 20 50 20Z',
        P.fill('#ffffff', '#f7f4ee', '#e0d9cb')) +
      `<g fill="#e9e3d6"><ellipse cx="36" cy="54" rx="2" ry="1.2"/><ellipse cx="64" cy="50" rx="2" ry="1.2" transform="rotate(30 64 50)"/><ellipse cx="44" cy="38" rx="1.8" ry="1.1"/><ellipse cx="60" cy="68" rx="2" ry="1.2"/></g>` +
      P.path('M33 68 L67 68 L69 87 L31 87Z', '#2f3f2c') +
      P.line('M36 72 L64 72', 1.2, 'rgba(255,255,255,.18)') +
      P.circ(50, 29, 4.6, P.fill('#ff8a8a', '#e23a4a', '#a8202e')) +
      P.hl(40, 36, 4, 2.4) +
      P.eyes(50, 52, 15, 5) + P.blush(50, 59, 26, 4, 2.2) + P.mouth(50, 59, 'smile', 0.8);
  },

  tokei(P) {
    return P.shadow(50, 93, 26) +
      P.line('M38 84 L34 92 M62 84 L66 92', 3, P.OUT) +
      P.path('M41 27 Q41 13 50 13 Q59 13 59 27Z', P.fill('#ff8a7a', '#e8433a', '#b82820')) +
      P.circ(50, 11, 2.6, '#f6c54a') +
      P.circ(50, 58, 31, P.fill('#fff6b8', '#ffd23e', '#e2a419')) +
      P.circ(50, 58, 23, '#fffaf0', 'stroke-width="1.6"') +
      `<g stroke="#5a3b2b" stroke-width="2" stroke-linecap="round"><path d="M50 37.5 L50 41"/><path d="M50 75 L50 78.5"/><path d="M29.5 58 L33 58"/><path d="M67 58 L70.5 58"/></g>` +
      P.hl(33, 40, 5, 2.6) +
      P.eyes(50, 56, 14, 5) + P.blush(50, 62, 24, 3.6, 2) + P.mouth(50, 63, 'smile', 0.8);
  },

  kinoko(P) {
    return P.shadow(50, 92, 24) +
      P.feet(89, [42, 58], '#f4e3c3', 5, 3.2) +
      P.path('M34 60 C32 77 36 89 50 89 C64 89 68 77 66 60Z', P.fill('#fffdf6', '#f7ead0', '#e8d2a8')) +
      P.path('M13 60 C13 34 30 19 50 19 C70 19 87 34 87 60 C87 67 80 69 50 69 C20 69 13 67 13 60Z',
        P.fill('#ff9a8a', '#e8433a', '#b8261e')) +
      `<g fill="#fff8f0"><ellipse cx="31" cy="42" rx="6.5" ry="5.5"/><ellipse cx="53" cy="30" rx="5" ry="4"/><ellipse cx="70" cy="46" rx="6" ry="5"/><ellipse cx="48" cy="54" rx="3.5" ry="3"/><ellipse cx="20" cy="58" rx="2.6" ry="2.2"/><ellipse cx="80" cy="60" rx="2.4" ry="2"/></g>` +
      P.leaf(64, 24, 11, 35, P.fill('#c8f59a', '#6cc24a', '#4c9a34')) +
      P.eyes(50, 76, 13, 4.6) + P.blush(50, 81, 22, 3.2, 1.8) + P.mouth(50, 81.5, 'smile', 0.65);
  },
};

