// Overworld HUD: location, clock, coins, quick buttons, lead kanamon, optional D-pad.
import { st, maxHp, monName, leadMon } from './state.js';
import { MAPS } from './data/maps.js';
import { $, $$, onTap, esc, en } from './ui.js';
import { W, isNight, holdDir, interactFacing } from './world.js';
import { say, sfx } from './audio.js';
import { dayInfo } from './daily.js';
import { monUrl } from './art/creatures.js';

let handlers = {};
export function initHud(h) {
  handlers = h;
  const hud = $('#hud');
  hud.innerHTML = `
    <div class="h-loc"><span class="h-time"></span><span class="h-name"></span></div>
    <div class="h-coins">💴 <b></b></div>
    <button class="h-lead"><img alt=""><span class="hp"><i></i></span></button>
    <div class="h-btns">
      <button class="hbtn h-errand">📋<span class="badge"></span></button>
      <button class="hbtn h-dex">📖</button>
      <button class="hbtn h-menu">🎒<small>メニュー</small></button>
    </div>
    <div class="dpad"><button data-d="up">▲</button><button data-d="left">◀</button><button data-d="right">▶</button><button data-d="down">▼</button></div>
    <button class="abtn">A</button>
    <div class="banner"></div>`;
  onTap($('.h-menu', hud), () => !W.busy && handlers.menu());
  onTap($('.h-dex', hud), () => !W.busy && handlers.dex());
  onTap($('.h-errand', hud), () => !W.busy && handlers.errands());
  onTap($('.h-lead', hud), () => !W.busy && handlers.party());
  $$('.dpad button', hud).forEach(b => {
    b.addEventListener('pointerdown', (e) => { e.preventDefault(); holdDir(b.dataset.d); b.classList.add('on'); });
    const up = () => { if (W.held === b.dataset.d) holdDir(null); b.classList.remove('on'); };
    b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });
  onTap($('.abtn', hud), () => interactFacing());
  setInterval(updateHud, 30000);
}

export function updateHud() {
  const s = st(), hud = $('#hud');
  if (!s || !hud.firstChild || !W.map) return;
  const day = dayInfo();
  $('.h-time', hud).textContent = (W.map.alwaysNight || isNight() ? '🌙' : '☀️') + ' ' + day.ja;
  $('.h-name', hud).textContent = W.map.name.ja;
  $('.h-coins b', hud).textContent = s.coins;
  const pending = (s.daily.missions || []).filter(m => m.done && !m.claimed).length;
  const b = $('.h-errand .badge', hud);
  b.textContent = pending || ''; b.style.display = pending ? '' : 'none';
  const lead = leadMon();
  const lb = $('.h-lead', hud);
  lb.style.display = lead ? '' : 'none';
  if (lead) {
    const img = $('img', lb), src = monUrl(lead.id, lead.shiny);
    if (img.getAttribute('src') !== src) img.src = src;
    const r = lead.hp / maxHp(lead);
    const i = $('.hp i', lb); i.style.width = r * 100 + '%'; i.className = r > 0.5 ? '' : r > 0.2 ? 'mid' : 'low';
  }
  hud.classList.toggle('show-dpad', !!s.settings.dpad);
}

let bannerT = 0;
export function locationBanner(name, speak) {
  const el = $('#hud .banner');
  if (!el) return;
  el.innerHTML = `<b>${esc(name.ja)}</b>${en(name.en)}`;
  el.classList.add('show');
  clearTimeout(bannerT);
  bannerT = setTimeout(() => el.classList.remove('show'), 2600);
  if (speak) say(name.ja);
}

export function showHud(on) { $('#hud').classList.toggle('hidden', !on); }
