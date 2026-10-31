// Builds tools/painted_prompts.json: one image-generation prompt per painted asset (see PAINTED_ART.md).
// Usage: node tools/gen_art_prompts.mjs
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { KANAMON, MON } from '../js/data/kanamon.js';
import { MASTERS, RIVAL, BUILDING_SIZE } from '../js/data/maps.js';

const STYLE = 'Soft painted anime storybook illustration for a cozy Japanese kids\' game: gentle cel shading with soft gradients, '
  + 'warm brown line art, pastel colours, warm afternoon light, rounded friendly shapes. Clean, cute, detailed. No text, no letters, no watermark.';
// Only characters get faces; without this split the model puts eyes on houses, trees and rocks.
const FACE = 'Big glossy eyes with two highlights and rosy blush.';
const THING = 'It is an ordinary object, not a character: no face, no eyes, no people, no animals.';
// Cut-outs are generated with Qwen Image 2.1's native transparency (rgba: true wraps the prompt for it).
const CUTOUT = 'Single subject, no ground shadow, no scenery, whole subject visible with a small margin.';

const out = [];
const add = (group, file, aspect, prompt) => out.push({ group, file, aspect, rgba: prompt.includes(CUTOUT), prompt: `${prompt} ${STYLE}` });

// Where the game's one-line look made the model go astray, a clearer design brief for the painting.
const LOOK_FIX = {
  densha: 'a little cream-and-green Japanese commuter train engine with a friendly face on its front window, two short carriages behind and small round wheels',
  n: 'a majestic glowing white-and-gold spirit whose long curving body traces the shape of the hiragana ん, with a soft golden aura and sparkles; no letters or writing anywhere',
};

for (const m of KANAMON) {
  const from = m.from ? ` It is the evolved form of the "${MON[m.from].en}" creature; keep the same colours and face.` : '';
  const rare = m.id === 'n' ? ' A legendary, majestic but still cute final creature with a soft golden glow.' : '';
  add('creature', `img/mon/${m.id}.png`, '1:1',
    `Creature design: a cute "${m.en}" creature — ${LOOK_FIX[m.id] || m.look}.${from}${rare} `
    + `Full body, facing the viewer at a slight three-quarter angle, friendly expression. ${FACE} ${CUTOUT}`);
}

const BG = {
  spring: 'a sunny meadow ringed by blossoming cherry trees, petals drifting, distant green hills and Mount Fuji',
  forest: 'a mossy forest clearing with tall cedar trees, ferns, little mushrooms and dappled sunlight',
  beach: 'a Japanese seaside cove with soft sand, turquoise waves, smooth rocks, seashells and a small lighthouse far away',
  mountain: 'a rocky mountain meadow with pine trees, alpine flowers and misty blue peaks',
  snow: 'a snowy clearing outside a mountain village, snow-covered pines, soft falling snow',
  night: 'a grassy hilltop under a deep starry night sky with a big glowing moon, fireflies and silhouetted trees',
  castle: 'a Japanese castle courtyard with stone walls, a white castle keep, banners and cherry trees',
};
const PAD = {
  spring: 'soft grass disc with tiny flowers and a brown soil edge', forest: 'mossy grass disc with clover and a soil edge',
  beach: 'smooth sand disc with a few shells', mountain: 'grass and flat stone disc with a rocky edge', snow: 'snowy disc with a packed-snow edge',
  night: 'dark grass disc with tiny glowing flowers', castle: 'round stone-tiled disc with a stone edge',
};
for (const [theme, scene] of Object.entries(BG)) {
  add('battle', `img/bg/${theme}.jpg`, '16:9',
    `An empty landscape with nobody in it, no people and no animals: ${scene}. Wide backdrop, eye-level view across an open clearing; `
    + 'the lower half is open, even ground with nothing on it, the horizon sits a little above the middle, and the top corners are calm and simple. No platforms.');
  add('battle', `img/bg/${theme}_pad.png`, '2:1',
    `An empty round battle platform with nothing standing on it (${PAD[theme]}), seen from slightly above so it is a wide oval disc with a little visible side edge. ${THING} ${CUTOUT}`);
}
add('title', 'img/bg/title.jpg', '16:9',
  'An empty landscape with nobody in it, no people and no animals: a sunny cherry-blossom park with a small red torii gate off to one side and Mount Fuji behind, '
  + 'open grass across the lower half, soft clouds in the upper third.');

// Room backdrops for the building scenes: the host's portrait stands in front, behind a counter drawn by the game.
const ROOM = {
  home: 'a cozy Japanese family living room with tatami mats, a low table, a cabinet, sliding shoji doors and a window with potted plants',
  house: 'a cozy villager\'s home with tatami mats, a low table with a tea set, a wooden cabinet and a round window',
  lab: 'a friendly professor\'s research lab with tall bookshelves, glass jars, a big map on the wall, a computer and a round capsule machine',
  hospital: 'a bright village clinic with pink and white walls, a healing machine with glowing round pods, potted plants and soft lamps',
  shop: 'a cozy village shop with wooden shelves full of snacks, jars, baskets and colourful goods, lanterns overhead',
  dojo: 'a traditional wooden dojo hall with a polished wooden floor, wooden pillars, paper lanterns and a hanging scroll painting of a mountain',
  station: 'a small countryside train station waiting room with wooden benches, a ticket window, a big round clock and a window onto the platform',
  onsen: 'a hot-spring bathhouse lobby with warm wooden walls, a noren curtain over a doorway, steam drifting from a stone pool beyond',
  tower: 'inside a tall pagoda tower: red pillars, golden hanging lanterns, a wooden staircase going up and a hanging scroll painting',
  castle: 'a grand Japanese castle throne room with golden sliding doors painted with pine trees, a tatami floor and red pillars',
  observatory: 'an observatory room with a big brass telescope pointing through the open dome at a starry night sky, star charts on the walls',
};
for (const [kind, desc] of Object.entries(ROOM)) {
  add('room', `img/bg/in_${kind}.jpg`, '16:9',
    `An empty room interior with nobody in it, no people and no animals: ${desc}. Eye-level view straight at the back wall; `
    + 'the centre of the picture is calm and uncluttered, and the floor across the lower third is open and empty.');
}

const PLAYER = 'a cheerful 7-year-old Japanese boy in a yellow round school hat, teal-green hoodie, red messenger bag, brown cargo shorts and red sneakers';
const ROLE = { m1: 'the cherry-blossom village teacher', m2: 'the wise forest-town teacher', m3: 'the sea-town teacher, sporty',
  m4: 'the mountain-town teacher, outdoorsy', m5: 'the star-hill teacher, dreamy', m6: 'the Kana King, the final teacher who lives in the castle' };
const people = [
  ['player', 'a cheerful 7-year-old Japanese boy in a yellow round school hat and a teal-green hoodie with a red bag strap across his chest'],
  ['sora', `the rival, a confident kid with spiky navy-blue hair, a red t-shirt and dark trousers, big grin`],
  ['professor', 'a kind grandfatherly professor with white hair, round glasses and a white lab coat over a green sweater'],
  ['mom', 'a warm young mother with a brown ponytail and an apron'],
  ['nurse', 'a gentle nurse with a pink cap and a pink uniform'],
  ['shopkeeper', 'a smiling shopkeeper with a headband and a blue happi coat'],
  ['fox', 'a small white fox spirit with red markings and a floating blue flame, mysterious but friendly'],
  ['stationmaster', 'a cheerful train station master in a green uniform and cap'],
  ...Object.entries(MASTERS).map(([id, m]) => [id, `${ROLE[id] || 'a town teacher'}: ${describe(m.look)}`]),
  ...['girl', 'boy', 'boy2', 'girl2', 'woman', 'woman2', 'man', 'man2', 'grandpa', 'grandma', 'guard'].map(k => [k, `a friendly villager (${k.replace(/\d/, '')})`]),
];
for (const [id, who] of people) {
  add('portrait', `img/people/${id}.png`, '1:1', `Head-and-shoulders bust portrait of ${who}. Only the head, shoulders and upper chest are shown; `
    + `the picture is cut off at mid-chest, so legs and shoes are not visible. Facing slightly to the right, friendly expression. ${FACE} ${CUTOUT}`);
}

const chibi = 'Small chibi game sprite (head about a third of the height), seen from a high three-quarter top-down camera as in classic handheld RPG town maps.';
for (const pose of ['front', 'back', 'side']) {
  const view = {
    front: 'standing and facing the camera. Big glossy eyes with two highlights and rosy blush.',
    back: 'back view: he is walking away from the camera, so we see the back of his yellow hat, the back of his teal hoodie and his red bag; his face is hidden.',
    side: 'side view: he is walking to the right, seen exactly from his left side in profile, only one eye visible.',
  }[pose];
  add('sprite', `img/sprites/player_${pose}.png`, '3:4', `${chibi} ${PLAYER}, ${view} ${CUTOUT}`);
}
// Walk frames are edits of a standing pose (ref → <image1>), so the boy stays identical from frame to frame.
// walk0 = feet together (the back and side poses were drawn mid-stride; front already stands), walk1/walk2 = each foot forward.
const BOY = 'Redraw the boy from <image1> as a frame of a walking animation: the exact same boy, same face, hat, hoodie, bag, shorts and shoes, '
  + 'same art style, same size and same position in the frame, ';
const STAND = {
  back: 'still seen from behind, but standing still with both feet together side by side on the ground and his arms relaxed at his sides.',
  side: 'still in profile facing right, but standing still with both feet together side by side on the ground and his arms relaxed at his sides.',
};
const STRIDE = {
  front: ['still facing the camera, but mid-stride: his left foot steps forward toward the camera and his right foot is behind, his arms swing a little in step.',
    'still facing the camera, but mid-stride: his right foot steps forward toward the camera and his left foot is behind, his arms swing a little in step.'],
  back: ['still seen from behind walking away, but mid-stride: his left leg is forward and planted and his right heel is lifted behind him, his arms swing in step.',
    'still seen from behind walking away, but mid-stride: his right leg is forward and planted and his left heel is lifted behind him, his arms swing in step.'],
  side: ['still walking to the right in profile, but mid-stride: his near leg reaches forward and his far leg pushes off behind, his arms swing in step.',
    'still walking to the right in profile, but mid-stride: his far leg reaches forward and his near leg pushes off behind, his arms swing in step.'],
};
const walk = (file, ref, prompt) => out.push({ group: 'walk', file: `img/sprites/${file}.png`, aspect: '3:4', rgba: true, ref: `img/sprites/${ref}.png`, prompt: BOY + prompt });
for (const pose of ['front', 'back', 'side']) {
  const stand = STAND[pose] ? `player_${pose}_walk0` : `player_${pose}`;
  if (STAND[pose]) walk(stand, `player_${pose}`, STAND[pose]);
  STRIDE[pose].forEach((prompt, i) => walk(`player_${pose}_walk${i + 1}`, stand, prompt));
}
for (const [id, who] of people.slice(1)) {
  if (id === 'player') continue;
  add('sprite', `img/sprites/${id}_front.png`, '3:4', `${chibi} ${who}, standing and facing the camera. ${FACE} ${CUTOUT}`);
}

const BUILD = {
  home: 'the player\'s family home: a two-room Japanese house with a dark kawara tile roof, white plaster walls, wooden beams and a sliding door',
  house: 'a traditional Japanese village house with a grey kawara tile roof, wooden walls, a sliding door and a few potted plants by the door',
  lab: 'the professor\'s research lab: a larger Japanese building with a green tile roof, round window and a small satellite dish',
  shop: 'a small village shop with a blue noren curtain over the door, an awning, crates of fruit outside and a blank wooden signboard',
  hospital: 'a friendly village clinic with a pink tile roof, white walls and a blank round sign',
  dojo: 'a traditional wooden dojo with a big curved tile roof, wide steps and paper lanterns',
  station: 'a small countryside train station with a platform roof, a bench and a clock',
  onsen: 'a hot-spring bathhouse with a wooden roof, steam rising and a blank noren curtain',
  observatory: 'a small observatory: a round white dome on a short round wooden building with a door',
  castle: 'a grand Japanese castle keep with white walls, layered dark roofs with gold trim, on a stone base',
  tower: 'a tall five-storey pagoda tower with red pillars and dark roofs',
};
for (const [kind, desc] of Object.entries(BUILD)) {
  const [w, h] = BUILDING_SIZE[kind] || [4, 3];
  add('building', `img/build/${kind}.png`, `${w}:${h + 1}`,
    `Single game building sprite: ${desc}. High three-quarter top-down view as in classic handheld RPG town maps, front facing straight down (not at a diagonal), roof and front wall both visible, entrance at the bottom centre. `
    + `It stands on a thin strip of ground only; no hill, no grass island. ${THING} ${CUTOUT}`);
}

const PROPS = {
  sakura: 'a round blossoming cherry tree', tree: 'a round leafy green tree', pine: 'a Japanese black pine tree', snowpine: 'a snow-covered pine tree',
  bush: 'a small round bush', rock: 'a mossy grey boulder', lantern: 'a stone tōrō lantern', torii: 'a red torii gate',
  sign: 'a wooden signpost with a blank board', chest: 'a small wooden treasure chest with gold trim', flowers: 'a patch of colourful flowers', grass: 'a clump of tall wild grass',
};
for (const [id, desc] of Object.entries(PROPS)) {
  add('prop', `img/props/${id}.png`, '1:1', `Single game map prop: ${desc}, high three-quarter top-down view as in classic handheld RPG town maps. `
    + `Just the ${id === 'flowers' || id === 'grass' ? 'plants' : 'object'} itself with no ground under it: no base, no pedestal, no grass disc. ${THING} ${CUTOUT}`);
}

function describe(l) {
  const age = l.kind === 'old' ? 'an older person' : 'an adult';
  const hair = l.hairStyle === 'bald' ? 'a bald head and a long white beard' : l.hairStyle === 'bun' ? `${colour(l.hair)} hair in a bun` : `${l.hairStyle} ${colour(l.hair)} hair`;
  return `${age} with ${hair}, wearing a ${colour(l.shirt)} top and ${colour(l.pants)} trousers${l.hat ? ' and a hat' : ''}${l.crown ? ' and a small golden crown' : ''}`;
}

// Nearest named colour, so prompts say "pink" rather than "#ff8fb1".
function colour(hex) {
  const NAMES = { black: '#1a1a1a', 'dark brown': '#3a2418', brown: '#8a5a3c', 'chestnut brown': '#5a3b2b', grey: '#9a9a9a', 'silver-grey': '#dcdcdc', white: '#ffffff',
    pink: '#ff8fb1', red: '#c0392b', orange: '#f08a24', gold: '#b8860b', yellow: '#f5d142', green: '#4c9a50', blue: '#2f80ed',
    'pale blue': '#e0e7ff', navy: '#1f3b73', lavender: '#c9b8ff', 'deep purple': '#3b2d6b', plum: '#7a3b5c', maroon: '#7b241c', slate: '#4a5a7a' };
  const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  const [r, g, b] = rgb(hex);
  let best = 'grey', bd = Infinity;
  for (const [name, h] of Object.entries(NAMES)) {
    const [R, G, B] = rgb(h), d = (r - R) ** 2 + (g - G) ** 2 + (b - B) ** 2;
    if (d < bd) { bd = d; best = name; }
  }
  return best;
}

const file = fileURLToPath(new URL('./painted_prompts.json', import.meta.url));
writeFileSync(file, JSON.stringify(out, null, 1));
const count = out.reduce((a, p) => (a[p.group] = (a[p.group] || 0) + 1, a), {});
console.log(`wrote ${out.length} prompts`, count);
