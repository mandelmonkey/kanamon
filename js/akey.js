// Normalise Japanese text into an audio-manifest key (spacing & punctuation don't change the sound).
export const akey = (s) => String(s).replace(/[\s「」『』、。！？!?…・〜]/g, '');

// Stable short file name for a piece of text (FNV-1a).
export function afile(s) {
  let h = 0x811c9dc5;
  for (const ch of akey(s)) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return 'v_' + h.toString(16).padStart(8, '0') + '.mp3';
}
