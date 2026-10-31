# Kanamon audio generation brief

Project root = `kanamon/`. A children's hiragana game needs ~700 short Japanese voice clips plus music.
The user explicitly asked for ElevenLabs to be used for all Japanese voice and audio.

## Tools
- `mcp__ElevenLabs_Player__generate_tts` (load via ToolSearch `select:mcp__ElevenLabs_Player__generate_tts,mcp__ElevenLabs_Player__generate_music,mcp__ElevenLabs_Player__generate_sound_effect`).
  It returns `{"tracks":[{"filePath": "/Users/christianmoss/Music/ElevenLabs/tts_....mp3"}]}` — the mp3 is saved there.
  Use the default model (eleven_v3). Voices (voice_id):
  - `f` → `oRjJxMXs2RKFFbRt3qwK` (Hana, clear Japanese narrator) — default for everything
  - `m` → `XyteuzpsRwhuNEnFiQlX` (Nagi, bright young man)
  - `o` → `VT0wVMJ0AQzXrETjweon` (Hatake, cheerful old man — the professor)
  - `g` → `xE6NbKmUvY3BhBzNAYsV` (Chieko, warm grandma)
  - `k` → `nvAEN8lxUT4UJcAyxcCQ` (Koume, playful child)
- `tools/split_batch.py BATCH.json RECORDING.mp3` splits one recording into clips (tested, works) and writes
  `audio/<file>`. Exit code 2 = segment count mismatch.
- `node tools/build_manifest.mjs` writes `audio/manifest.json` and reports what is still missing.

## Voice clips (batched — do NOT make one call per clip)
Input: `tools/audio_src.json` — list of `{file, text, voice, group}`. Skip any entry whose `audio/<file>` already exists.
1. Group entries by (`voice`, `group`) and take chunks: 20 for `kana`/`word`/`name`/`atk`, 12 for `line`/`sent`, 8 for `desc`/`dlg`.
2. For each chunk write a batch json (just that chunk's entries, in order) to your scratch dir. Build the TTS text:
   each item's `text` with all spaces removed, ending in `。` unless it already ends in `。！？…`, items joined by a
   blank line (`"\n\n"`). Call generate_tts with the chunk's voice_id.
3. Run `python3 tools/split_batch.py <batch.json> <filePath>`. If it exits 2, split the chunk in half and regenerate each
   half (down to single items if needed). Never commit a split whose count doesn't match.
4. Parallelise: issue several generate_tts calls in one message (e.g. 6–8), then split them all in one bash call.
5. After all groups, run `node tools/build_manifest.mjs` and confirm "missing 0".
Spot-check: durations should be sensible (single kana ~0.2–1.1 s, words 0.3–1.5 s, sentences 1–4 s). If a clip is
suspiciously long/short, regenerate that item alone.

## Music (save into `audio/music/`, mp3)
Use `generate_music` with `instrumental: true`, then copy the returned file to `audio/music/<name>.mp3`
(re-encode with ffmpeg to 128k mp3 if it isn't already; apply a 1.5 s fade-in and 2 s fade-out).
- `town` (~80 s): Cheerful, cozy Japanese-inspired children's video game village theme. Koto and shamisen melody with soft marimba, glockenspiel and light acoustic guitar, gentle bouncy rhythm, spring cherry-blossom village, warm and happy, 105 bpm, loopable.
- `route` (~80 s): Upbeat adventurous children's game overworld theme for walking through sunny fields and forests. Bright bamboo flute melody, pizzicato strings, light taiko and hand claps, Japanese pentatonic, 124 bpm, loopable.
- `battle` (~70 s): Energetic but friendly kids' creature battle theme. Fast taiko drums, shamisen riffs, playful synth brass, exciting yet cute, never scary, 150 bpm, loopable.
- `master` (~70 s): Bigger, more heroic version of a kids' battle theme for a boss match against a teacher. Taiko ensemble, koto runs, brass, determined and fun, 156 bpm, loopable.
- `night` (~70 s): Calm magical night theme for a children's game. Music box, soft koto, celesta, warm pads, twinkling, sleepy and wondrous, 80 bpm, loopable.
- `title` (~45 s): Joyful opening title theme for a children's Japanese adventure game, sweeping and sparkly, koto, strings, glockenspiel, small taiko, ends gracefully.
Short jingles via `generate_sound_effect` (save as `audio/music/<name>.mp3`):
- `jingle_win` (4 s): short triumphant cheerful video game victory fanfare, xylophone and trumpet, cute.
- `jingle_catch` (3 s): short sparkly magical success jingle, chimes and harp glissando, children's game.
- `jingle_evolve` (6 s): magical rising shimmering transformation sound ending in a bright chime chord.
- `jingle_levelup` (2 s): quick happy ascending arpeggio chime, video game level up.
- `jingle_badge` (5 s): proud little fanfare with taiko hit and bell, receiving an award in a kids' game.
- `sfx_encounter` (1.5 s): playful whoosh and sparkle swirl, a wild creature appears in a kids' game.
Then run `node tools/build_manifest.mjs` again.

## Report back
Counts generated, anything that failed or was regenerated, music files + durations, final manifest output.
Do not edit any game code — only `audio/` and your own scratch files.
