// Boot: title screen, new game / continue, daily welcome, play-time tracking, service worker.
import { load, save, st, hasSave, newState, S, today } from './state.js';
import { loadManifest, unlock, music, say, sfx, applyVolumes } from './audio.js';
import { initWorld, W } from './world.js';
import { installHooks, placePlayer } from './events.js';
import { initHud, updateHud, showHud } from './hud.js';
import { openMenu, dex, party, daily } from './screens/menu.js';
import { overlay, closeOverlay, onTap, $, $$, esc, en, dialog, celebrate, toast, sleep } from './ui.js';
import { ensureDaily, dayInfo, streakReward, giveEgg } from './daily.js';
import { LINES } from './data/lines.js';
import { MON, STARTERS } from './data/kanamon.js';
import { ITEMS } from './data/items.js';
import { monTag } from './art/creatures.js';
import { portraitUrl, PLAYER_LOOK } from './art/people.js';
import { loadPainted, painted } from './art/painted.js';

async function boot() {
  load();
  await Promise.all([loadManifest(), loadPainted()]);
  initWorld($('#world'));
  installHooks();
  initHud({
    menu: () => openMenu(),
    dex: async () => { W.busy++; await dex(); W.busy--; },
    party: async () => { W.busy++; await party(); W.busy--; updateHud(); },
    errands: async () => { W.busy++; await daily(); W.busy--; updateHud(); },
  });
  showHud(false);
  title();
  if ('serviceWorker' in navigator && location.protocol !== 'file:' && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) navigator.serviceWorker.register('sw.js').catch(() => {});
  setInterval(() => { if (!document.hidden && st()?.name) { st().playMs += 10000; save(); } }, 10000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && st()?.name) dailyCheck(); else save(true); });
  window.addEventListener('pagehide', () => save(true));
}

function logo() {
  return `<div class="logo"><span class="l1">か</span><span class="l2">な</span><span class="l3">も</span><span class="l4">ん</span></div>
    <div class="ribbon">ひらがなの ぼうけん</div><div class="sublogo">KANAMON — The Hiragana Adventure</div>`;
}

function title() {
  const cont = hasSave() && st().name;
  const o = overlay(`<div class="title">
    ${painted('bg/title') ? `<img class="t-paint" src="${painted('bg/title')}" alt="">` : '<div class="t-sky"><div class="t-sun"></div><div class="t-fuji"></div><div class="t-torii"></div><div class="t-tree a"></div><div class="t-tree b"></div><div class="t-tree c"></div><div class="t-tree d"></div></div>'}
    <div class="t-petals">${Array.from({ length: 18 }, (_, i) => `<i style="--x:${(i * 53) % 100}%;--d:${(i * 0.7) % 6}s;--s:${0.7 + (i % 4) * 0.2}"></i>`).join('')}</div>
    ${logo()}
    <div class="t-cast"><span class="t-mon">${monTag('tane')}</span><img class="t-boy" src="${painted('sprites/player_front') || portraitUrl(PLAYER_LOOK, 240)}" alt=""><span class="t-mon">${monTag('hinoko')}</span><span class="t-mon">${monTag('shizuku')}</span></div>
    <div class="t-btns">
      ${cont ? `<button class="btn primary big t-cont">▶ つづきから<small>Continue — ${esc(st().name)}</small></button>` : ''}
      <button class="btn big t-new ${cont ? '' : 'primary'}">✨ はじめから<small>New game</small></button>
    </div>
    <div class="t-tap">タップして スタート</div>
  </div>`, 'title-overlay');
  let started = false;
  const first = () => { if (started) return; started = true; unlock(); applyVolumes(); music('title'); say([LINES.title.ja, LINES.subtitle.ja]); o.classList.add('ready'); };
  o.addEventListener('pointerdown', first, { once: true });
  if (cont) onTap($('.t-cont', o), () => { first(); closeOverlay(o); startGame(false); });
  onTap($('.t-new', o), async () => {
    first();
    if (cont) {
      const { yesNo } = await import('./ui.js');
      if (!(await yesNo({ ja: 'まえの データは きえるよ。 いい？', en: 'This erases the old save. OK?' }))) return;
    }
    closeOverlay(o); startGame(true);
  });
}

async function startGame(fresh) {
  if (fresh) { S.state = newState(); S.state.name = ''; }
  showHud(true);
  if (fresh) {
    const s = st();
    s.map = 'sakura'; s.x = 5; s.y = 10; s.dir = 'down';
    placePlayer();
    updateHud();
    W.busy++;
    await dialog([
      { ja: 'ここは さくらむら。', en: 'This is Sakura Village.' },
      { ja: 'けんきゅうじょで はかせが まっているよ！', en: 'The Professor is waiting for you at the lab! (top right)' },
      { ja: 'いきたい ところを タップしてね。', en: 'Tap where you want to go.' },
    ]);
    W.busy--;
    return;
  }
  placePlayer();
  updateHud();
  await dailyCheck();
}

let lastCheck = '';
async function dailyCheck() {
  const s = st();
  if (!s?.flags?.starter || lastCheck === today()) return;
  lastCheck = today();
  const r = ensureDaily();
  if (!r.newDay) return;
  // streak reward
  const rw = streakReward(r.streak);
  s.items[rw.item] = (s.items[rw.item] || 0) + rw.n;
  if (rw.egg) giveEgg();
  save();
  const day = dayInfo();
  W.busy++;
  const o = overlay(`<div class="welcome">
    <div class="wl-title">${LINES.thanksday.ja}${en(LINES.thanksday.en)}</div>
    <div class="wl-row">
      <div class="wl-box"><div class="wl-big">${day.icon}</div><b>きょうは ${day.ja}</b>${en(day.en)}<div class="wl-tip">${day.tip}${en(day.tipEn)}</div></div>
      <div class="wl-box"><div class="wl-big">🔥 ${r.streak}</div><b>${r.streak}にち れんぞく！</b>${en(`${r.streak} days in a row!`)}<div class="wl-tip">🎁 ${rw.ja}${en(rw.en)}</div></div>
      <div class="wl-box"><div class="wl-big">📋</div><b>${LINES.mission.ja}</b>${en(LINES.mission.en)}<div class="wl-list">${s.daily.missions.map(m => `<div>${m.icon} ${esc(m.ja)}</div>`).join('')}</div></div>
    </div>
    <div class="tapnext">タップ ▶</div>
  </div>`, 'welcome-overlay');
  sfx('fanfare');
  await say([LINES.thanksday.ja, LINES.today.ja, day.ja]);
  await new Promise(res => onTap(o, res));
  closeOverlay(o);
  W.busy--;
  updateHud();
}

boot();
