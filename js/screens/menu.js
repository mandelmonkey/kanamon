// Menu & sub-screens: team, dex, bag, kana chart, errands/calendar, card, settings & parent area.
import { KANAMON, MON, CATS } from '../data/kanamon.js';
import { ITEMS, SEEDS } from '../data/items.js';
import { ROWS, YOON, ROMAJI } from '../data/kana.js';
import { MASTERS } from '../data/maps.js';
import { LINES } from '../data/lines.js';
import { st, save, maxHp, needXp, monName, caughtCount, unit, exportJson, importJson, exportCode, importCode, wipe, today } from '../state.js';
import { overlay, closeOverlay, onTap, $, $$, esc, en, toast, choose, yesNo, askQuestion, kanaKeyboard, sleep, celebrate } from '../ui.js';
import { say, sfx, applyVolumes } from '../audio.js';
import { monTag, monUrl } from '../art/creatures.js';
import { cardHtml, wireCard } from './card.js';
import { kanaProgress, nextQuestion, learnedCounts, level } from '../srs.js';
import { claimMission, dayInfo, streakReward, giveEgg, allClaimed, progress } from '../daily.js';
import { checkEvolutions } from '../battle.js';
import { W } from '../world.js';
import { updateHud } from '../hud.js';

function sheet(title, titleEn, body, cls = '') {
  const o = overlay(`<div class="sheet ${cls === 'menu' ? '' : 'big'} ${cls}"><div class="sheet-head"><div class="sheet-title">${esc(title)}${en(titleEn)}</div><button class="x">✕</button></div><div class="sheet-body">${body}</div></div>`, 'sheet-overlay');
  const closed = new Promise(r => onTap($('.x', o), () => { sfx('close'); closeOverlay(o); r(); }));
  return { o, closed, body: $('.sheet-body', o) };
}

export async function openMenu() {
  W.busy++;
  sfx('open');
  const s = st();
  const pending = (s.daily.missions || []).filter(m => m.done && !m.claimed).length;
  const items = [
    ['party', '🐾', 'なかま', 'Team'], ['dex', '📖', 'ずかん', 'Dex'], ['bag', '🎒', 'かばん', 'Bag'],
    ['chart', 'あ', 'ひらがな', 'Hiragana'], ['daily', '📋', 'おつかい', 'Errands', pending], ['card', '🪪', 'カード', 'My card'],
    ['settings', '⚙️', 'せってい', 'Settings'],
  ];
  const { o, closed } = sheet('メニュー', 'Menu', `<div class="menugrid">${items.map(([id, ic, ja, e, badge]) => `<button class="mbtn" data-id="${id}"><span class="mi ${id === 'chart' ? 'kana' : ''}">${ic}</span><span class="mj">${ja}</span>${en(e)}${badge ? `<span class="badge">${badge}</span>` : ''}</button>`).join('')}</div>`, 'menu');
  $$('.mbtn', o).forEach(b => onTap(b, async () => {
    sfx('tap');
    const fn = { party, dex, bag, chart, daily, card, settings }[b.dataset.id];
    await fn();
    updateHud();
  }));
  await closed;
  W.busy--;
  save();
}

// ── team ──────────────────────────────────────────────────
export async function party() {
  const s = st();
  const render = () => `<div class="partygrid">${s.party.map((m, i) => monRow(m, 'p', i)).join('')}</div>
    ${s.box.length ? `<div class="subhead">あずかりばこ <small>Storage (${s.box.length})</small></div><div class="boxgrid">${s.box.map((m, i) => `<button class="boxmon" data-b="${i}"><img src="${monUrl(m.id, m.shiny)}"><small>Lv.${m.lv}</small></button>`).join('')}</div>` : ''}`;
  const { o, closed, body } = sheet('なかま', 'Your team', render());
  const wire = () => {
    $$('.pcard', body).forEach(b => onTap(b, async () => { await monDetail(s.party[+b.dataset.i], +b.dataset.i); body.innerHTML = render(); wire(); }));
    $$('.boxmon', body).forEach(b => onTap(b, async () => {
      const m = s.box[+b.dataset.b];
      const opts = s.party.length < 6 ? [{ ja: 'なかまに いれる', en: 'Add to team' }] : s.party.map(p => ({ ja: `${monName(p)} と いれかえ`, en: `Swap with ${MON[p.id].en}-mon` }));
      const i = await choose([...opts, { ja: 'やめる', en: 'Cancel' }], { prompt: { ja: `${MON[m.id].name} Lv.${m.lv}`, en: '' } });
      if (i >= opts.length) return;
      s.box.splice(+b.dataset.b, 1);
      if (s.party.length < 6) s.party.push(m); else { const out = s.party.splice(i, 1, m)[0]; s.box.push(out); }
      save(); body.innerHTML = render(); wire();
    }));
  };
  wire();
  await closed;
}

function monRow(m, kind, i) {
  const r = m.hp / maxHp(m);
  return `<button class="pcard ${m.hp <= 0 ? 'out' : ''}" data-i="${i}"><img src="${monUrl(m.id, m.shiny)}">
    <div class="pc-info"><div class="pc-name">${esc(monName(m))}${m.shiny ? ' ✨' : ''} ${i === 0 ? '<span class="lead">せんとう</span>' : ''}</div>
    <div class="pc-lv">Lv.${m.lv} · ${MON[m.id].word} = ${MON[m.id].en}</div>
    <div class="hp"><i class="${r > 0.5 ? '' : r > 0.2 ? 'mid' : 'low'}" style="width:${r * 100}%"></i></div><div class="pc-hp">${Math.ceil(m.hp)} / ${maxHp(m)}</div>
    <div class="xp"><i style="width:${Math.min(100, m.xp / needXp(m.lv) * 100)}%"></i></div></div></button>`;
}

async function monDetail(m, idx) {
  const s = st();
  const d = MON[m.id];
  const { o, closed, body } = sheet(monName(m), `${d.en}-mon · Lv.${m.lv}`, `<div class="detail">${cardHtml(m.id, { shiny: m.shiny, showDesc: true })}
    <div class="dt-side"><div class="dt-stat">Lv.${m.lv} · HP ${Math.ceil(m.hp)}/${maxHp(m)}</div>
    ${d.evo ? `<div class="dt-evo">Lv.${d.evo.lv}で <b>${MON[d.evo.to].name}</b>に しんか！${en(`Evolves at Lv.${d.evo.lv}`)}</div>` : ''}
    <div class="dt-btns">
      ${idx > 0 ? '<button class="btn" data-a="lead">⭐ せんとうに する<small>Make leader</small></button>' : ''}
      <button class="btn" data-a="nick">✏️ ニックネーム<small>Nickname</small></button>
      <button class="btn" data-a="item">🎒 どうぐを つかう<small>Use item</small></button>
      ${s.party.length > 1 ? '<button class="btn" data-a="box">📦 あずける<small>Put in storage</small></button>' : ''}
    </div></div></div>`);
  wireCard(body, m.id);
  say([d.name]);
  $$('[data-a]', body).forEach(b => onTap(b, async () => {
    const a = b.dataset.a;
    if (a === 'lead') { s.party.splice(idx, 1); s.party.unshift(m); save(); toast('⭐ せんとうに なった！'); closeOverlay(o); }
    if (a === 'nick') { m.nick = await kanaKeyboard({ title: 'ニックネーム', titleEn: 'Nickname', max: 6, initial: m.nick || '' }); save(); closeOverlay(o); }
    if (a === 'box') { s.party.splice(idx, 1); s.box.push(m); save(); closeOverlay(o); }
    if (a === 'item') { await useItemOn(m); closeOverlay(o); }
  }));
  await Promise.race([closed, new Promise(r => { const iv = setInterval(() => { if (!o.isConnected) { clearInterval(iv); r(); } }, 200); })]);
}

async function useItemOn(m) {
  const s = st();
  const usable = Object.entries(s.items).filter(([k, n]) => n > 0 && ITEMS[k] && (ITEMS[k].heal || k === 'ame'));
  if (!usable.length) return toast('つかえる どうぐが ないよ <small>No usable items</small>');
  const i = await choose([...usable.map(([k, n]) => ({ ja: `${ITEMS[k].icon} ${ITEMS[k].ja} ×${n}`, en: ITEMS[k].descEn })), { ja: 'やめる', en: 'Cancel' }]);
  if (i >= usable.length) return;
  const [k] = usable[i];
  s.items[k]--;
  if (k === 'ame') {
    const before = maxHp(m); m.lv = Math.min(60, m.lv + 1); m.hp += maxHp(m) - before; m.xp = 0;
    sfx('levelup'); toast(`🍬 ${monName(m)}は Lv.${m.lv}に なった！`);
    save(); await checkEvolutions();
  } else { m.hp = Math.min(maxHp(m), m.hp + ITEMS[k].heal); sfx('heal'); toast(`💖 ${monName(m)}が げんきに なった！`); }
  save();
}

// ── dex ───────────────────────────────────────────────────
export async function dex() {
  const s = st();
  const n = caughtCount();
  const shinies = Object.values(s.dex).filter(d => d.shiny).length;
  const { o, closed, body } = sheet('かなもんずかん', `Kanamon Dex · ${n} / ${KANAMON.length}${shinies ? ` · ✨${shinies}` : ''}`, `
    <div class="dexgrid">${KANAMON.map(m => {
      const d = s.dex[m.id];
      if (d?.caught) return `<button class="dexcell got" data-id="${m.id}" style="--cc:${CATS[m.cat].color};--cs:${CATS[m.cat].soft}">${monTag(m.id, { shiny: false })}<small>${m.name}</small>${d.shiny ? '<i class="sh">✨</i>' : ''}</button>`;
      if (d?.seen) return `<button class="dexcell seen" data-id="${m.id}">${monTag(m.id, { silhouette: true })}<small>？？？</small></button>`;
      return `<div class="dexcell none"><span>？</span><small>No.${m.no}</small></div>`;
    }).join('')}</div><div class="dexfoot">${LINES.collect.ja}${en(LINES.collect.en)}</div>`, 'dexsheet');
  say(LINES.dex.ja);
  $$('.dexcell.got', body).forEach(b => onTap(b, async () => {
    const id = b.dataset.id, d = s.dex[id];
    const c = overlay(`<div class="cardview">${cardHtml(id, { shiny: false, count: d.caught, showDesc: true })}${d.shiny ? `<div class="shinyswap">${monTag(id, { shiny: true })}<small>✨ きらきら</small></div>` : ''}<div class="tapnext">タップで もどる</div></div>`, 'card-overlay');
    wireCard(c, id);
    say([MON[id].name, MON[id].word]);
    onTap(c, (e) => { if (!e.target.closest('button')) { closeOverlay(c); } });
  }));
  $$('.dexcell.seen', body).forEach(b => onTap(b, () => { sfx('bump'); toast('まだ つかまえて いないよ <small>Not caught yet</small>'); }));
  await closed;
}

// ── bag ───────────────────────────────────────────────────
async function bag() {
  const s = st();
  const items = Object.entries(s.items).filter(([k, n]) => n > 0 && ITEMS[k]);
  const seeds = Object.entries(s.seeds).filter(([, n]) => n > 0);
  const { o, closed, body } = sheet('かばん', 'Bag', `
    <div class="itemlist">${items.map(([k, n]) => `<div class="item"><span class="ii">${ITEMS[k].icon}</span><span class="in">${ITEMS[k].ja}${en(ITEMS[k].en)}</span><span class="ic">×${n}</span><span class="id">${ITEMS[k].desc}</span></div>`).join('') || '<p class="empty">なにも ないよ</p>'}</div>
    ${seeds.length ? `<div class="subhead">たね <small>Seeds — plant them in the garden by your house</small></div><div class="itemlist">${seeds.map(([k, n]) => `<div class="item"><span class="ii">${SEEDS[k].icon}</span><span class="in">${SEEDS[k].ja}${en(SEEDS[k].en)}</span><span class="ic">×${n}</span></div>`).join('')}</div>` : ''}
    ${s.eggs.length ? `<div class="subhead">たまご <small>Eggs — walk to hatch!</small></div><div class="itemlist">${s.eggs.map(e => `<div class="item"><span class="ii">🥚</span><span class="in">たまご${en('Egg')}</span><span class="egg-bar"><i style="width:${e.steps / e.need * 100}%"></i></span></div>`).join('')}</div>` : ''}
    <div class="subhead">だいじな もの <small>Key items</small></div>
    <div class="itemlist"><div class="item"><span class="ii">📖</span><span class="in">かなもんずかん${en('Kanamon Dex')}</span></div>
    ${s.flags.rod ? `<div class="item"><span class="ii">🎣</span><span class="in">つりざお${en('Fishing rod — tap water to fish')}</span></div>` : ''}
    ${s.flags.train ? `<div class="item"><span class="ii">🎫</span><span class="in">でんしゃの きっぷ${en('Train pass — travel from any hospital')}</span></div>` : ''}</div>
    <p class="hint">${en('Use healing items from the Team screen or in battle.')}</p>`);
  await closed;
}

// ── kana chart ────────────────────────────────────────────
async function chart() {
  const render = (tab) => {
    const prog = kanaProgress();
    const cell = (k) => k ? `<button class="kc l${prog[k] || 0}" data-k="${k}"><b>${k}</b><small>${ROMAJI[k]}</small></button>` : '<span class="kc empty"></span>';
    if (tab === 'yoon') return `<div class="kchart yoon">${YOON.map(([k]) => cell(k)).join('')}</div>`;
    const rows = ROWS.filter(r => tab === 'dakuten' ? r.dakuten : !r.dakuten);
    return `<div class="kchart">${rows.map(r => `<div class="kcol">${r.kana.map(cell).join('')}</div>`).join('')}</div>`;
  };
  const lc = learnedCounts();
  const { o, closed, body } = sheet('あいうえお ひょう', `Hiragana chart · ${lc.kana} kana learned`, `
    <div class="tabs"><button class="tab on" data-t="basic">あいう</button><button class="tab" data-t="dakuten">が・ぱ</button><button class="tab" data-t="yoon">きゃ</button></div>
    <div class="kwrap">${render('basic')}</div>
    <div class="klegend"><span class="kc l0"></span>まだ <span class="kc l1"></span>はじめた <span class="kc l2"></span>もうすこし <span class="kc l3"></span>おぼえた！</div>
    <button class="btn primary big practice">📝 れんしゅう する <small>Practise your weakest kana</small></button>`, 'chartsheet');
  let tab = 'basic';
  const wire = () => $$('.kc[data-k]', body).forEach(b => onTap(b, () => { sfx('tile'); say(b.dataset.k); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }));
  wire();
  $$('.tab', body).forEach(t => onTap(t, () => { tab = t.dataset.t; $$('.tab', body).forEach(x => x.classList.toggle('on', x === t)); $('.kwrap', body).innerHTML = render(tab); wire(); }));
  onTap($('.practice', body), async () => {
    const qo = overlay(`<div class="quizbox"><div class="qz-head">📝 <span class="qz-n">1</span> / 10</div><div class="qz-host"></div></div>`, 'quiz-overlay');
    let right = 0;
    for (let i = 0; i < 10; i++) {
      $('.qz-n', qo).textContent = i + 1;
      const r = await askQuestion(nextQuestion({ mode: 'practice', types: ['kana'] }), $('.qz-host', qo));
      if (r.correct) right++;
      progress('study');
    }
    closeOverlay(qo);
    st().coins += right * 5;
    await celebrate(right >= 8 ? LINES.great : LINES.welldone, { sub: `${right} / 10 せいかい · +${right * 5}えん` });
    $('.kwrap', body).innerHTML = render(tab); wire();
    save();
  });
  await closed;
}

// ── errands & calendar ────────────────────────────────────
export async function daily() {
  const s = st(), d = s.daily, day = dayInfo();
  const now = new Date(), ym = today().slice(0, 7);
  const first = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
  const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const stamps = d.stamps[ym] || [];
  const render = () => `
    <div class="dayban"><span class="dicon">${day.icon}</span><div><b>きょうは ${day.ja}</b>${en(day.en)}<div class="dtip">${day.tip}${en(day.tipEn)}</div></div>
      <button class="btn small dsay">🔊</button></div>
    ${d.rare ? `<div class="rare">✨ きょうの レア: <b>${MON[d.rare[0]].name}</b> <small>Today's rare is out somewhere you've been!</small></div>` : ''}
    <div class="subhead">${LINES.mission.ja} <small>${LINES.mission.en}</small></div>
    <div class="missions">${d.missions.map((m, i) => `<div class="mission ${m.done ? 'done' : ''} ${m.claimed ? 'claimed' : ''}"><span class="mic">${m.icon}</span>
      <div class="mtx"><b>${esc(m.ja)}</b>${en(m.en)}<div class="mbar"><i style="width:${m.have / m.n * 100}%"></i></div></div>
      ${m.claimed ? '<span class="mok">✓</span>' : m.done ? `<button class="btn primary claim" data-i="${i}">もらう<small>${m.coins}えん</small></button>` : `<span class="mcount">${m.have}/${m.n}</span>`}</div>`).join('')}</div>
    ${allClaimed() && !d.claimedAll ? '<button class="btn primary big bonus">🥚 ぜんぶ できた！ ごほうび<small>All done! Get your bonus egg</small></button>' : ''}
    <div class="subhead">まいにち カレンダー <small>${d.streak} days in a row 🔥</small></div>
    <div class="cal">${['にち', 'げつ', 'か', 'すい', 'もく', 'きん', 'ど'].map(w => `<b>${w}</b>`).join('')}${'<span></span>'.repeat(first)}${Array.from({ length: days }, (_, i) => `<span class="${stamps.includes(i + 1) ? 'stamp' : ''} ${i + 1 === now.getDate() ? 'today' : ''}">${i + 1}</span>`).join('')}</div>`;
  const { o, closed, body } = sheet('おつかい', "Today's errands", render());
  const wire = () => {
    onTap($('.dsay', body), () => say([LINES.today.ja, day.ja]));
    $$('.claim', body).forEach(b => onTap(b, () => {
      const c = claimMission(+b.dataset.i);
      sfx('coin'); toast(`💴 ${c}えん もらった！`);
      body.innerHTML = render(); wire(); updateHud();
    }));
    const bonus = $('.bonus', body);
    if (bonus) onTap(bonus, async () => { d.claimedAll = true; giveEgg(); save(); await celebrate(LINES.yatta, { pic: '<div class="stampbig">🥚</div>', sub: 'たまごを もらった！<br><small>Walk around to hatch it!</small>' }); body.innerHTML = render(); wire(); });
  };
  wire();
  await closed;
}

// ── trainer card ──────────────────────────────────────────
async function card() {
  const s = st(), lc = learnedCounts();
  const { closed } = sheet('きみの カード', 'Your card', `<div class="tcard">
    <div class="tc-name">${esc(s.name)}</div>
    <div class="tc-stats"><div><b>${caughtCount()}</b><small>ずかん / dex</small></div><div><b>${lc.kana}</b><small>ひらがな / kana</small></div><div><b>${lc.words}</b><small>ことば / words</small></div><div><b>${s.daily.streak}🔥</b><small>れんぞく / streak</small></div></div>
    <div class="subhead">はんこ <small>Teacher stamps</small></div>
    <div class="stamps">${Object.entries(MASTERS).map(([id, m]) => `<div class="stampcell ${s.badges.includes(id) ? 'got' : ''}"><span>${s.badges.includes(id) ? m.stamp : '？'}</span><small>${m.name}</small></div>`).join('')}</div>
    ${s.tower.best ? `<div class="tc-tower">🗼 かなの とう: ${s.tower.best}かい</div>` : ''}
  </div>`);
  await closed;
}

// ── settings & parent area ────────────────────────────────
async function settings() {
  const s = st(), set = s.settings;
  const tog = (k, ja, e) => `<label class="set"><span>${ja}${en(e)}</span><input type="checkbox" data-k="${k}" ${set[k] ? 'checked' : ''}></label>`;
  const sl = (k, ja, e) => `<label class="set"><span>${ja}${en(e)}</span><input type="range" min="0" max="1" step="0.1" data-k="${k}" value="${set[k]}"></label>`;
  const { o, closed, body } = sheet('せってい', 'Settings', `
    ${tog('english', 'えいごの ヒント', 'Show English help')}${tog('romaji', 'ローマじの もんだい', 'Romaji reading questions')}${tog('dpad', 'じゅうじキー', 'Show the D-pad')}
    ${sl('music', 'おんがく', 'Music')}${sl('voice', 'こえ', 'Voice')}${sl('sfx', 'こうかおん', 'Sound effects')}
    <button class="btn big parent">👪 おうちの かたへ <small>Parents: progress & save backup</small></button>`);
  $$('input[type=checkbox]', body).forEach(i => i.addEventListener('change', () => { set[i.dataset.k] = i.checked; save(); updateHud(); }));
  $$('input[type=range]', body).forEach(i => i.addEventListener('input', () => { set[i.dataset.k] = +i.value; applyVolumes(); save(); }));
  onTap($('.parent', body), async () => { if (await parentGate()) await parentPage(); });
  await closed;
}

async function parentGate() {
  const a = 6 + Math.floor(Math.random() * 4), b = 7 + Math.floor(Math.random() * 3);
  const ans = a * b;
  const opts = [ans, ans + a, ans - b, ans + 2].sort(() => Math.random() - 0.5);
  const i = await choose(opts.map(x => ({ ja: String(x), en: '' })), { prompt: { ja: `${a} × ${b} = ?`, en: 'Grown-ups only' } });
  return opts[i] === ans;
}

async function parentPage() {
  const s = st(), lc = learnedCounts();
  const acc = s.stats.correct + s.stats.wrong ? Math.round(s.stats.correct / (s.stats.correct + s.stats.wrong) * 100) : 0;
  const hours = Math.round(s.playMs / 36e5 * 10) / 10;
  const weak = Object.entries(s.srs).filter(([k, r]) => r.n >= 3 && r.c / r.n < 0.6).sort((a, b) => a[1].c / a[1].n - b[1].c / b[1].n).slice(0, 8).map(([k]) => k.split(':')[1]);
  const { o, closed, body } = sheet('おうちの かたへ', 'For parents', `
    <div class="pstats">
      <div><b>${lc.kana}</b><small>kana known well</small></div><div><b>${lc.words}</b><small>words known well</small></div><div><b>${lc.sentences}</b><small>sentences</small></div>
      <div><b>${acc}%</b><small>accuracy (${s.stats.correct + s.stats.wrong} answers)</small></div><div><b>${s.stats.days}</b><small>days played · ${s.daily.streak} streak</small></div><div><b>${hours}h</b><small>play time</small></div>
    </div>
    ${weak.length ? `<p class="pnote">Trickiest right now: <b>${weak.map(esc).join('、 ')}</b></p>` : ''}
    <p class="pnote">Progress is stored on this iPad (in Safari's storage for this app). Back it up now and then, especially before clearing website data or changing devices.</p>
    <div class="pbtns">
      <button class="btn big" data-a="share">📤 Share / email save file</button>
      <button class="btn big" data-a="download">💾 Download save file</button>
      <button class="btn big" data-a="code">📋 Copy save code</button>
      <button class="btn big" data-a="restore">📥 Restore from file</button>
      <button class="btn big" data-a="paste">🔑 Restore from code</button>
      <button class="btn big danger" data-a="reset">🗑️ Start over</button>
    </div><input type="file" accept=".json,application/json" class="hidden-file">`);
  const fileName = () => `kanamon-save-${(s.name || 'player')}-${today()}.json`;
  $$('[data-a]', body).forEach(b => onTap(b, async () => {
    const a = b.dataset.a;
    try {
      if (a === 'share') {
        const file = new File([exportJson()], fileName(), { type: 'application/json' });
        if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], title: 'Kanamon save', text: `Kanamon save for ${s.name} (${today()})` });
        else {
          const code = await exportCode();
          location.href = `mailto:?subject=${encodeURIComponent('Kanamon save ' + today())}&body=${encodeURIComponent('Kanamon save code (paste into Parents > Restore from code):\n\n' + code)}`;
        }
      }
      if (a === 'download') {
        const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
        const link = document.createElement('a'); link.href = url; link.download = fileName(); document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
      }
      if (a === 'code') {
        const code = await exportCode();
        try { await navigator.clipboard.writeText(code); toast('📋 Copied save code'); }
        catch { const c = overlay(`<div class="sheet"><div class="sheet-title">Save code</div><textarea class="codebox" readonly>${code}</textarea><button class="btn close">OK</button></div>`, 'sheet-overlay'); onTap($('.close', c), () => closeOverlay(c)); }
      }
      if (a === 'restore') {
        const inp = $('.hidden-file', body);
        inp.onchange = async () => {
          const f = inp.files[0]; if (!f) return;
          if (!(await yesNo({ ja: 'いまの データを うわがき する？', en: 'Replace current progress with this file?' }))) return;
          importJson(await f.text()); toast('✅ Restored! Reloading…'); setTimeout(() => location.reload(), 900);
        };
        inp.click();
      }
      if (a === 'paste') {
        const c = overlay(`<div class="sheet"><div class="sheet-title">Paste save code</div><textarea class="codebox"></textarea><div class="row"><button class="btn cancel">Cancel</button><button class="btn primary ok">Restore</button></div></div>`, 'sheet-overlay');
        onTap($('.cancel', c), () => closeOverlay(c));
        onTap($('.ok', c), async () => {
          try { await importCode($('.codebox', c).value); toast('✅ Restored! Reloading…'); setTimeout(() => location.reload(), 900); }
          catch (e) { toast('That code did not work'); }
        });
      }
      if (a === 'reset') {
        if (await yesNo({ ja: 'ほんとうに さいしょから？', en: 'Really erase ALL progress?' }) && await yesNo({ ja: 'ぜんぶ きえるよ。 いい？', en: 'This cannot be undone. Are you sure?' })) { wipe(); location.reload(); }
      }
    } catch (e) { if (e.name !== 'AbortError') toast('Something went wrong: ' + e.message); }
  }));
  await closed;
}
