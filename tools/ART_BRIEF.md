# Kanamon creature art brief

かなもん is a children's hiragana-learning monster-collecting game for iPad. Every creature is an
everyday Japanese word with a cute chibi face (りんごもん = apple hedgehog, とけいもん = alarm clock).
A child will see these art pieces constantly; they must be **adorable, readable at 64px, and
instantly recognisable as the object/animal named**.

## Where things live (project root = `kanamon/`)
- `js/art/parts.js` — the SVG toolkit `P` (read it fully first). Key helpers:
  `P.fill(light, base, dark)` radial gradient · `P.lin(top,bottom)` · `P.ell/circ/path/rect` outlined shapes ·
  `P.flat(d, fill)` unoutlined path · `P.line(d, width, colour)` · `P.shadow(cx,cy,rx)` ·
  `P.hl(cx,cy,rx,ry)` gloss highlight · `P.eyes(x,y,gap,r,style,iris)` · `P.blush(x,y,gap)` ·
  `P.mouth(x,y,type,scale)` · `P.feet(y,[x1,x2],fill)` · `P.sparkle(x,y,s)` · `P.leaf(x,y,len,rot,fill)` ·
  `P.starPath(cx,cy,R,r,n,rot,round)` · `P.OUT` outline colour.
  To override the outline width on one shape pass e.g. `'stroke-width="1.6"'` as the `extra` argument
  (the helper drops its default then). Never emit the same attribute twice on one element.
- `js/art/mon_core.js` — **9 finished reference creatures. Match this style exactly.** Study them.
- `js/data/kanamon.js` — the roster. Each entry has `id`, `word`, `en`, `cat`, and a `look` art brief.
  Evolutions (`evo`) must look clearly related to their earlier form (same palette/face, bigger & grander).
- Your output file: `js/art/mon_a.js`, `mon_b.js` or `mon_c.js` (whichever you are assigned). Keep the
  existing shape: `export default { id(P) { return '...svg body...'; }, ... }`. Only edit your own file.

## Style rules
1. 100×100 viewBox, creature centred, standing on y≈90 with `P.shadow(...)` at y≈92–93. Fill most of the box
   (roughly x 12–88, y 12–92). Leave a little breathing room.
2. Warm brown outline (`P.OUT`, width `P.SW`) on main shapes; inner details (spots, patterns, seeds, cheek patches)
   usually unoutlined via `P.flat` or plain `<ellipse fill>`.
3. Soft gradients via `P.fill(light, base, dark)` on big shapes + one `P.hl(...)` gloss highlight top-left.
4. Face: `P.eyes` (big shiny, gap 12–21, r 4.5–6.6), `P.blush`, a small `P.mouth`. Faces sit roughly at the centre of
   the main body mass. Vary expressions a little (open mouth, cat mouth, wink, sleepy 'closed' for pillow/night types),
   but keep everything friendly. Nothing scary — even the shark, ghost and crocodile are sweet.
5. Saturated but soft palette, like the reference set. Each creature should read as its object at a glance
   (silhouette first!). Add 1–2 charming details (leaf, bell, scarf, sparkle), not clutter.
6. Draw back-to-front: shadow → tail/back parts → body → front details → face → sparkles.
7. Plain SVG only: no `<text>`, no external images, no filters (shiny variants are added automatically), no CSS.
   Keep each creature under ~40 lines. Use helper loops if repeating shapes (see `ringo` spikes).

## How to check your work
- Validity: from `kanamon/` run `node tools/check_art.mjs id1 id2 ...` (must report 0 bad).
- Visual: a static server is already running. Open your **own new tab** in the built-in browser
  (`mcp__Claude_Browser__tabs_create`, then navigate that tabId) at
  `http://localhost:8765/tools/art_preview.html?ids=id1,id2,...` and take screenshots/zooms. Iterate until each
  creature looks great next to the references (include a couple of reference ids like `ringo,hinoko` in the list to
  compare). Close your tab when done. If browser tools are unavailable, rely on careful geometry + the validator.
- Do not modify any file other than your assigned `mon_X.js`.
