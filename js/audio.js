// Audio: ElevenLabs voice clips (with speech-synthesis fallback), looping music, synth SFX.
import { akey } from './akey.js';
import { st } from './state.js';

let ctx = null, master, voiceGain, musicGain, sfxGain;
let manifest = { voice: {}, music: {} };
const buffers = new Map();     // file -> Promise<AudioBuffer>
let voiceToken = 0;
let currentSrc = null;

const vol = (k) => (st()?.settings?.[k] ?? 1);

export async function loadManifest() {
  try {
    const r = await fetch('audio/manifest.json', { cache: 'no-cache' });
    if (r.ok) manifest = await r.json();
  } catch { /* offline first run without manifest: speech synthesis only */ }
}

export function hasClip(text) { return !!manifest.voice[akey(text)]; }

function ensureCtx() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain(); master.connect(ctx.destination);
  voiceGain = ctx.createGain(); voiceGain.connect(master);
  musicGain = ctx.createGain(); musicGain.connect(master);
  sfxGain = ctx.createGain(); sfxGain.connect(master);
  applyVolumes();
  return ctx;
}

export function applyVolumes() {
  if (!ctx) return;
  voiceGain.gain.value = vol('voice');
  sfxGain.gain.value = vol('sfx') * 0.6;
  musicGain.gain.value = vol('music') * 0.55;
}

// iOS needs audio to be started from a user gesture once.
export function unlock() {
  const c = ensureCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  const b = c.createBuffer(1, 1, 22050), s = c.createBufferSource();
  s.buffer = b; s.connect(c.destination); s.start(0);
  if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(''); speechSynthesis.speak(u); }
}

function getBuffer(file) {
  if (!buffers.has(file)) {
    buffers.set(file, fetch('audio/' + file)
      .then(r => { if (!r.ok) throw new Error(file); return r.arrayBuffer(); })
      .then(ab => new Promise((res, rej) => ensureCtx().decodeAudioData(ab, res, rej)))
      .catch(e => { buffers.delete(file); throw e; }));
  }
  return buffers.get(file);
}

export function preload(texts) {
  if (!ensureCtx()) return;
  for (const t of texts) { const f = manifest.voice[akey(t)]; if (f) getBuffer(f).catch(() => {}); }
}

function playBuffer(buf, gainNode, rate = 1) {
  return new Promise(res => {
    const s = ctx.createBufferSource();
    s.buffer = buf; s.playbackRate.value = rate;
    s.connect(gainNode); s.onended = () => res(); s.start();
    currentSrc = s;
  });
}

let jaVoice = null;
function pickJaVoice() {
  if (jaVoice || !window.speechSynthesis) return jaVoice;
  const vs = speechSynthesis.getVoices().filter(v => /ja/i.test(v.lang));
  jaVoice = vs.find(v => /Kyoko|O-ren|Hattori|Google/.test(v.name)) || vs[0] || null;
  return jaVoice;
}
if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { jaVoice = null; pickJaVoice(); };

function speakFallback(text, token) {
  return new Promise(res => {
    if (!window.speechSynthesis || vol('voice') === 0) return res();
    const u = new SpeechSynthesisUtterance(text.replace(/\s+/g, ''));
    u.lang = 'ja-JP'; u.rate = 0.85; u.volume = vol('voice');
    const v = pickJaVoice(); if (v) u.voice = v;
    let done = false;
    const fin = () => { if (!done) { done = true; res(); } };
    u.onend = fin; u.onerror = fin;
    setTimeout(fin, 900 + text.length * 260);
    if (token === voiceToken) speechSynthesis.speak(u); else fin();
  });
}

// Speak one text or a sequence of texts. Cancels any speech already playing.
export async function say(texts, { gap = 80 } = {}) {
  const list = (Array.isArray(texts) ? texts : [texts]).filter(Boolean);
  const token = ++voiceToken;
  stopVoice(false);
  if (!list.length || vol('voice') === 0) return;
  ensureCtx();
  for (const t of list) {
    if (token !== voiceToken) return;
    const file = manifest.voice[akey(t)];
    if (file && ctx) {
      try {
        const buf = await getBuffer(file);
        if (token !== voiceToken) return;
        await playBuffer(buf, voiceGain);
      } catch { await speakFallback(t, token); }
    } else {
      await speakFallback(t, token);
    }
    if (gap) await new Promise(r => setTimeout(r, gap));
  }
}

export function stopVoice(bump = true) {
  if (bump) voiceToken++;
  try { currentSrc?.stop(); } catch {}
  currentSrc = null;
  if (window.speechSynthesis?.speaking) speechSynthesis.cancel();
}

// ── music ─────────────────────────────────────────────────
let musicEl = null, musicName = '', musicNode = null, fadeTimer = 0;

export function music(name) {
  if (name === musicName) return;
  musicName = name;
  const file = manifest.music[name];
  ensureCtx();
  const old = musicEl, oldNode = musicNode;
  if (old) fadeOut(old, oldNode);
  musicEl = null; musicNode = null;
  if (!file || !ctx) return;
  const el = new Audio('audio/' + file);
  el.loop = true; el.preload = 'auto'; el.crossOrigin = 'anonymous';
  const node = ctx.createGain();
  node.gain.value = 0;
  try { ctx.createMediaElementSource(el).connect(node); } catch { /* already connected */ }
  node.connect(musicGain);
  el.play().catch(() => {});
  node.gain.linearRampToValueAtTime(1, ctx.currentTime + 1.2);
  musicEl = el; musicNode = node;
}

function fadeOut(el, node) {
  if (!node || !ctx) { el.pause(); return; }
  node.gain.cancelScheduledValues(ctx.currentTime);
  node.gain.setValueAtTime(node.gain.value, ctx.currentTime);
  node.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
  setTimeout(() => { el.pause(); el.src = ''; node.disconnect(); }, 900);
}

export function duckMusic(seconds = 2) {
  if (!musicNode || !ctx) return;
  const g = musicNode.gain, t = ctx.currentTime;
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(0.15, t + 0.15);
  g.linearRampToValueAtTime(1, t + seconds);
}

export function pauseAll() { musicEl?.pause(); stopVoice(); }
export function resumeAll() { if (ctx?.state === 'suspended') ctx.resume(); musicEl?.play().catch(() => {}); }
document.addEventListener('visibilitychange', () => document.hidden ? pauseAll() : resumeAll());

// One-shot jingle from the music folder (falls back to a synth flourish).
export async function jingle(name) {
  const file = manifest.music[name];
  ensureCtx();
  if (!file || !ctx) return sfx(name.includes('win') || name.includes('badge') ? 'fanfare' : 'levelup');
  try {
    const buf = await getBuffer(file);
    duckMusic(buf.duration + 0.4);
    playBuffer(buf, sfxGain);
  } catch { sfx('levelup'); }
}

// ── synth sound effects ───────────────────────────────────
function tone(freq, start, dur, type = 'sine', vol = 0.3, slideTo = null) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, start);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(sfxGain);
  o.start(start); o.stop(start + dur + 0.05);
}

export function sfx(name) {
  if (!ensureCtx() || vol('sfx') === 0) return;
  const t = ctx.currentTime;
  switch (name) {
    case 'tap': tone(880, t, 0.06, 'triangle', 0.18); break;
    case 'open': tone(660, t, 0.07, 'triangle', 0.2); tone(990, t + 0.06, 0.09, 'triangle', 0.2); break;
    case 'close': tone(700, t, 0.07, 'triangle', 0.18); tone(520, t + 0.06, 0.08, 'triangle', 0.16); break;
    case 'correct': tone(1046, t, 0.12, 'sine', 0.3); tone(1568, t + 0.09, 0.22, 'sine', 0.28); break;
    case 'wrong': tone(300, t, 0.18, 'triangle', 0.22, 220); break;
    case 'hit': tone(180, t, 0.12, 'square', 0.12, 80); tone(900, t, 0.05, 'triangle', 0.15); break;
    case 'bigHit': tone(140, t, 0.2, 'square', 0.15, 60); tone(1200, t, 0.08, 'triangle', 0.2); tone(1600, t + 0.05, 0.1, 'sine', 0.15); break;
    case 'bump': tone(120, t, 0.08, 'square', 0.08); break;
    case 'coin': tone(1318, t, 0.07, 'square', 0.12); tone(1760, t + 0.07, 0.16, 'square', 0.12); break;
    case 'step': tone(220, t, 0.03, 'triangle', 0.04); break;
    case 'grass': tone(2400, t, 0.04, 'triangle', 0.03, 1600); break;
    case 'throw': tone(400, t, 0.3, 'sine', 0.15, 1400); break;
    case 'shake': tone(500, t, 0.06, 'square', 0.08); tone(420, t + 0.08, 0.06, 'square', 0.08); break;
    case 'tile': tone(1200 + Math.random() * 200, t, 0.05, 'sine', 0.16); break;
    case 'encounter': [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.05, 0.12, 'square', 0.1)); break;
    case 'levelup': [523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, t + i * 0.07, 0.18, 'triangle', 0.22)); break;
    case 'fanfare': [[523, 0], [523, 0.12], [523, 0.24], [698, 0.36], [880, 0.6], [784, 0.78], [1046, 0.96]].forEach(([f, d]) => tone(f, t + d, 0.28, 'square', 0.12)); break;
    case 'sparkle': for (let i = 0; i < 6; i++) tone(1800 + i * 300, t + i * 0.04, 0.12, 'sine', 0.08); break;
    case 'heal': [392, 523, 659, 784].forEach((f, i) => tone(f, t + i * 0.12, 0.3, 'sine', 0.2)); break;
    case 'door': tone(330, t, 0.1, 'triangle', 0.15); tone(440, t + 0.1, 0.12, 'triangle', 0.15); break;
  }
}
