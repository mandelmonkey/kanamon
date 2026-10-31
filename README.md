# かなもん — ひらがなの ぼうけん

A monster-collecting adventure for learning Japanese, built for iPad. Every かなもん is a real
Japanese word with a face (りんご + もん = りんごもん). Battles are won by answering hiragana, word and
grammar questions, and creatures are caught by spelling their names.

It's a static web app: plain HTML/CSS/JS, no build step, no server code. All voices and music were
generated with ElevenLabs and live in `audio/`.

**Play it:** <https://mandelmonkey.github.io/kanamon/> (GitHub Pages, deployed from the `main` branch of
this repo; pushing to `main` updates it).

## Put it on the iPad

1. **Host the folder** (already done at the link above; to host a copy elsewhere, any static host works,
   and it needs HTTPS for "Add to Home Screen" offline mode):
   - **Netlify Drop (easiest):** open <https://app.netlify.com/drop> and drag this whole `kanamon`
     folder (or unzip `kanamon-site.zip` and drag that) onto the page. You get an `https://….netlify.app`
     link in a few seconds. Creating a free account keeps the site permanent.
   - **GitHub Pages:** push this folder to a repo, then Settings → Pages → deploy from the main branch.
   - **Cloudflare Pages:** create a project and upload the folder.
2. On the iPad, open the link in **Safari**, tap **Share → Add to Home Screen**.
3. Open it once from the home-screen icon while on Wi-Fi. The game downloads all of its audio
   (about 16 MB) in the background, and after that it works offline.

## Saves and backup

Progress is saved automatically on the iPad (in the app's own storage). To back it up or move it:
**Menu → せってい (Settings) → おうちの かたへ (Parents)** and answer the times-table question. From
there you can:

- **Share / email save file**: opens the iPad share sheet (Mail, Messages, AirDrop, Files).
- **Copy save code**: a short text code you can paste into an email or note.
- **Restore from file / code**: brings a backup back, on this or another device.

The parent page also shows how many kana, words and sentences he knows well, overall accuracy,
days played, and which items are trickiest right now.

> Safari can clear storage for sites that haven't been opened in a long time. Using the home-screen
> app regularly avoids that, but a monthly backup is cheap insurance.

## What's in the game

- **96 かなもん**, one or more for every hiragana, with evolutions that teach related words
  (たまご → ひよこ → にわとり, いし → いわ → やま, つき → まんげつ …). Rare and night-only
  creatures, sparkly (✨) variants, and a legendary ん at the very end.
- **10 areas**: さくらむら, はらっぱ みち, もりの まち, ふしぎな もり, かわの みち, うみの まち,
  やまみち, やまの まち, ほしの おか, かなの しろ. Each town has a teacher (せんせい) to beat for a
  はんこ stamp, which unlocks the next lesson.
- **Curriculum** in 6 units: あ–こ → さ–と → な–ほ → ま–ん → が/ぱ (dakuten) → きゃ (combinations),
  plus about 130 everyday words (colours, numbers, greetings, family, verbs…) and 51 sentences
  covering です, これは, の, が すき, を ください, を ～ます, に いきます, ～ません, ～ました, と.
- **Spaced repetition**: every answer updates that item's memory box; due and weak items come back
  more often, and question types get harder (hear and pick → read → spell) as he improves.
- **Every day**: a stamp calendar with streak rewards, 3 daily errands (おつかい), a day-of-the-week
  bonus (げつようび brings moon creatures, and so on), today's rare creature, kanamon hiding in houses,
  fox-spirit quizzes, a garden that grows in real time, fishing, and eggs that hatch as you walk.
- **After the ending**: the かなの とう (endless tower), teacher rematches, filling the dex and finding
  sparkly variants.

## Editing / extending

- Creatures: `js/data/kanamon.js` (data) and `js/art/mon_*.js` (SVG art). Preview all art at
  `tools/art_preview.html`; validate with `node tools/check_art.mjs`.
- Words and sentences: `js/data/vocab.js`, `js/data/sentences.js`. Maps, NPCs and dialogue:
  `js/data/maps.js` (validate with `node tools/check_maps.mjs`).
- New spoken lines: run `node tools/gen_audio_src.mjs > tools/audio_src.json` to list clips that need
  recording (see `tools/AUDIO_BRIEF.md`). Anything without a clip falls back to the iPad's built-in
  Japanese voice.
- After changing files, run `node tools/build_sw.mjs` so the offline cache picks up the new version,
  or run `tools/package.sh` to rebuild everything and make a fresh `kanamon-site.zip`.
- Local testing: `python3 -m http.server 8765` in this folder, then open <http://localhost:8765>.
