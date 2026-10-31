# Painted art (direction A)

Goal: the game looks like the trailer. Every picture that is a "picture" (creatures, battle backdrops,
title, rooms, portraits, sprites, buildings, props) is a painted image; the walkable ground stays a tile
grid drawn in code, restyled with painterly texture so the painted sprites sit on it naturally.

## Style

Soft painted anime storybook, as in the trailer: gentle cel shading with soft gradients, warm brown line
art, pastel colours, warm afternoon light, rounded friendly shapes. Characters (creatures, portraits,
sprites) also get big glossy eyes with two highlights and rosy blush.

Lessons from generating them:
- Keep the face text (`FACE`) out of the shared style, or the model puts eyes on houses, trees and rocks;
  objects get `THING` ("not a character: no face…").
- Scenes start with "An empty landscape with nobody in it…", otherwise a mascot wanders into the middle.
- Props and buildings need "no base, no pedestal, no grass island" or they arrive on little dioramas.
- Portraits need "cut off at mid-chest" and no mention of trousers or shoes, or they come out full-body.
- `LOOK_FIX` in the prompt script overrides a creature's one-line look when the model misreads it.

## Making the images

`node tools/gen_art_prompts.mjs` writes `tools/painted_prompts.json` (one entry per image: group, file,
aspect, rgba, prompt). `python3 tools/paint.py` renders every missing one with Qwen Image 2.1 Turbo on a
ComfyUI server (`COMFY=http://host:port` to override), about 5 s each when the GPU is free. Cut-outs use
Qwen's native transparency, then are trimmed and saved as WebP in `img/`; raw PNGs and seeds stay in
`art_raw/` (not committed). Re-run one image with `python3 tools/paint.py mon/densha --redo`.

| Group | Count | File | Notes |
|---|---|---|---|
| creature | 96 | `img/mon/<id>` | front-facing cut-outs, 512 px; the player's side is mirrored in battle |
| battle | 14 | `img/bg/<theme>`, `<theme>_pad` | 7 backdrops (night versions are tinted in code) + the oval pads creatures stand on |
| title | 1 | `img/bg/title` | logo is drawn in HTML on top |
| room | 11 | `img/bg/in_<kind>` | building interiors; the host's portrait stands in front, behind the code-drawn counter |
| portrait | 25 | `img/people/<pid>` | head-and-shoulders, used in scenes, dialogue and trainer intros |
| sprite | 27 | `img/sprites/<pid>_<pose>` | overworld characters; the player has front/back/side, others front |
| building | 11 | `img/build/<kind>` | 3/4 top-down, fitted to the footprint with 2.2 tiles of headroom |
| prop | 12 | `img/props/<id>` | trees, rock, bush, lantern, torii, sign, chest… |

## How it plugs in

`node tools/build_manifest.mjs` lists the shipped files in `img/manifest.json`; `js/art/painted.js`
loads it, and each art function asks `painted(name)` and falls back to its code-drawn version, so the
game works with any subset of images:

- `js/art/creatures.js` `monUrl/monImg/monTag` → `img/mon/<id>` (shiny = hue-rotate in CSS, or a pixel
  recolour for canvas use).
- `js/art/scenes.js` `battleBg/battlePad`, `js/scenes.js` room backdrops, `js/main.js` title.
- `js/art/people.js` portraits and sprites, by each look's `pid`.
- `js/art/tiles.js` buildings, trees, rocks, signs, chests, torii; `canvas.box` tells `world.js` how far a
  painted image overhangs its tile.
- `tools/build_sw.mjs` caches `img/` alongside audio for offline play.
