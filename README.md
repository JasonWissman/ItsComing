# It's Coming

A short first-person horror game that runs in a browser tab. No build step, no
dependencies, no asset files: the world, the creatures and every sound are
generated in code.

Something is coming straight at you from a long way off. You can watch it come,
or you can look away and find the thing that will keep it out. You cannot do
both, and every time you look back it is closer.

## Play

Open `index.html` in a modern browser (Chrome, Firefox, Safari, Edge). It works
from a plain `file://` URL or any static host such as GitHub Pages.

To serve it locally instead:

```
npx serve .
# or
python3 -m http.server 8000
```

Headphones are recommended. Sound starts after your first click.

## Controls

| Key | Action |
| --- | --- |
| `←` `→` | turn to one of 8 directions (N, NE, E, SE, S, SW, W, NW) |
| `↑` | look straight ahead |
| `↓` | look down at the ground in front of you |
| hold `Shift` (or `Z` / `Space`) | zoom in on whatever you are facing |
| click | pick up an item, place it, use a target, fire |
| `1`–`6`, `Tab` | choose which held item is active |
| `R` | restart the current night |
| `Esc` | pause |
| `M` | mute |

`WASD` also works for turning and looking. Clicking the floor while looking
down puts the active item back down.

Touch controls appear on phones and tablets: turn, look, hold to zoom, Use
(whatever is nearest the middle of the view, or put the held thing down when
looking down) and Pause; tapping the held item again while looking down also puts it
down. A gamepad works too: d-pad or left stick turns and
looks, A uses, B puts the held thing down, a trigger zooms, Start pauses. In
menus the d-pad moves between buttons and settings, left and right move a
slider, A presses or ticks, and B goes back as Escape does.

Settings has volume sliders, a mute, reduced flashing (a softer red pulse and
dimmer flashes), reduced motion (no jitter or sway), captions for sounds (one
line at a time, with a marker for which side a sound came from), a text size
slider, a switch to put the touch controls on the left, and one for surface detail (boards, logs and stone
built into walls and floors; off is faster on slow machines). The two reduction settings default on when your
system asks for reduced motion.

## One game

There is no difficulty to pick: the game is one hard game.

- It gives you about 40% less time than the nights were first built around, and it moves 40% faster while you look away.
- There are no hints. The card gives only the situation, there is no objective line, and hovering a target shows only its name.
- When something does not work, the line you get says what is wrong without saying what to do.
- It can come from any way a night allows, with no compass mark, and on some nights it changes its mind once while you are not looking.
- Lying about are things that look right and are not: a rotten plank, a set of house keys, a bag of sugar, a rusted padlock, a blown fuse. They look worn and off-colour (drained toward rust-brown, the plank grey-green with rot, the house keys' cover red where the car keys' is green, the sugar in a red bag), so a careful eye can tell them apart.
- Every task is something you would do in a real place on a bad night: board a doorway with a hammer and planks, chain and padlock a gate, put a new bulb in a lamp, crank a shutter down, make a phone call.

Every way it can come is fully visible from where you stand: the approach lanes are checked by
`validateContent()` so the thing is never hidden behind a wall on its way in.
A shot fired out of range still spends a shell. A way you have shut holds it where it is; where more
than one way must be shut, it waits there a moment and then goes round to a way that is still open.

Saves from versions with several difficulties carry over: the furthest night reached on any of them,
and the best time on any of them, count for the one game.

## The nights

Each level is one thing coming at you and a small set of steps to survive it.
Items are scattered around you in different directions, some at eye level and
some on the ground, so you have to turn and look down to find them.

1. **The Field.** A tall thin walker crosses a moonlit field toward a farmhouse whose
   two doorways have no doors. Find the hammer, the nails and the loose planks, and board
   up both: board the one it is coming for and it runs round the house to the other.
2. **The Road.** Your car has stalled, in drive. Something pale comes up the road on all
   fours, in bursts, in the headlights. Find the car keys (the green ones), put the stick in
   park and turn the key until it catches; then pick a gear and hit the gas. Reverse always
   gets away; drive does only if it is coming along a verge. The whole road slides past as
   you go.
3. **The Graveyard.** A smiling man walks between the graves and never stops
   smiling. Salt both ways in, the doorway and the side gate, and hang and light a
   lantern by each. The sugar comes in a red bag.
4. **The Quarry.** A stone figure that only moves when nothing is looking at it.
   You must look away to shut both gates, chain each with its own chain, and padlock
   them. One padlock is rusted solid. Every glance away costs you.
5. **The Clearing.** Something that sprints, drops to all fours to watch, and
   sprints again. Get the shotgun, load it, and wait for it to come close enough.
6. **The Boathouse.** Something swims in across the water, going under for a
   while and coming up closer. The winch is chained and padlocked: the key is in the
   tackle box. Crank the water door down, and shut and bar the side door.
7. **The Lighthouse.** The lamp is out and something is climbing the outside of
   the tower; you see it by looking over the rail, and it climbs faster while you do
   not. Put the spare bulb in the lamp, open the fuse box, pull the blown fuse and put
   in the new one from the toolbox, and turn the crank so the beam goes round.
8. **The Diner.** A man-shaped thing in the lot is drawn to the light: while the
   lights are on it comes fast. Throw the power main on the back wall, find the crank,
   and crank all three shutters down; each time its window shuts it slides along the
   glass to one still open.
9. **The Phone Booth.** It is raining and a man in a long coat is walking down the
   street toward the booth. Find the number in your notebook and dial it. It rings
   for seven seconds before anyone answers, and he keeps coming the whole time.
10. **The Mirror Maze.** A porcelain doll is always behind you and you only ever see
    it in the glass: facing a mirror holds it. One of the four mirrors is not like the
    others. Put the music box on that mirror's pedestal, fit the key with the heart and
    wind it, and it comes to the tune, smiling, instead of to you.
11. **The Barn.** It goes faster the more you carry. Fill the lantern, light it,
    and throw it into the hay between you, carrying as little as you can.
12. **The Bedroom.** You are in bed. It is already in the doorway, or in the
    closet, moving in extreme slow motion. Get the lamp on, pull the covers up.
13. **The Void.** Everything you ever held against it lies around you, and you
    start the night holding some of it. Holding anything enrages it. Put it all down
    and let it come.

Creatures move faster when you are not looking at them, but otherwise they
come at a steady pace, no faster at the end than at the start. A thread runs through the
nights that the text never states: the same lamp is somewhere in every room, a
clock ticks for the first ten seconds of each night from the same direction, and
surviving a night leaves a fragment, one odd sentence, collected on the Nights
screen. Finishing the last night lightens the void into the bedroom, in the morning,
and switches the game to a light theme.

Each night is a little different every time it loads: every item has several
places it might be, the creature's starting distance and pace vary slightly,
and the car takes a different number of tries to start. Some pause, some lurch, one only moves when unseen.
Progress is saved in `localStorage`; the title screen offers to continue from
the furthest night reached.

## Project layout

```
index.html              page shell, HUD and styles
js/util.js              math, color and drawing helpers
js/audio.js             Web Audio synthesis: wind, drones, heartbeat, footsteps, effects
js/render.js            tiny painter's-algorithm 3D renderer on Canvas 2D (sky, ground, props, billboards, fog, post effects)
js/approach.js          approach lanes: apertures, blockers, how much of the thing you can see, lane validation
js/seq.js               beat sequencer for aftermaths, deaths and set pieces
js/save.js              versioned saved progress and settings
js/creatures.js         drawing helpers and the CREATURES registry
js/creatures/<name>.js  one creature each: procedural drawing plus movement behavior
js/icons.js             item icons and scenery builders (walls, boxes, trees, fences, openings, road, moon, stars)
js/levels.js            item, target, container and recipe helpers and the LEVELS list
js/levels/nightNN.js    one night each
js/game.js              game state, input, interaction, HUD, main loop
test/                   headless Playwright suite (see Testing)
```

### Anatomy of a night

A night is an object pushed onto `LEVELS` from `js/levels/nightNN.js`. It is defined in a local
frame where the default lane points along +z; `facing` rotates the whole night so the compass
shows a different world direction.

```js
LEVELS.push({
  id: 'field', title: 'The Field', facing: 0, eyeH: 1.65,
  pal: { skyTop, fog, ground, fogDist }, ambient: { wind, drone, droneFreq, windFreq },
  text: { intro, hint, objective, death: { default, reached }, win, fragment },
  lanes: [{ deg: 0, name: 'back door', barrierDist: 2.75, apertures: [{ z, x0, x1, y0, y1 }], blockers: [[d0, d1]] }],
  creatures: [{ type: 'walker', startDist: 130, time: 80, gamma: 0.72, unseenMult: 1.35 }],
  aftermath: { type: 'held', dur: 3.8, every: 0.75, sfx: 'bang' },   // held, stand, retreat, down, away, custom
  uses: [{ tool, ammo, dudAmmo, range, onHit(c, hits, L), onMiss(L) }], // things you use on the creature itself
  build(L) { ... }
});
```

- **Lanes** are the directions the thing may come from. Each must be fully visible along its
  whole length; `apertures` describe the openings it is seen through (a doorway, a window, a gap
  between posts) and `blockers` the stretches where it is hidden regardless. `SC.doorway`,
  `SC.window` and `SC.gap` build the wall pieces and return the matching aperture. `buildLevel`
  picks the lane (random, or the
  night's own `laneMode`) and `validateContent()` fails a lane that is not at least 85% visible
  at every metre. `L.lane` is the chosen lane inside `build`. A lane may set its own `startDist`
  (and a `maxStart` cap, for the back of a closet).
- **Creatures** are listed in `creatures`; each gets its own lane, timer and seeded random
  stream. `CREATURES[type]` provides `draw`, `speedMult`, optional `onSeen`, `lateral`,
  `timeScale` (slow motion), `death` ({ delay, dur, sting, pose }) and `seenFrac`.
- **Items and targets** are placed in `build(L)`: `mkItem(L, id, name, spot | [spots], opts)`
  picks one of several spots per load (never the same spot twice, never within 0.8 m of another
  item); `mkTarget(L, { accepts, requires, needed, use(item), hint(), onClick(), hold, crank })`
  for anything you use things on; `mkContainer(L, { opens, yields, spot })` for drawers and boxes;
  `mkRecipe(L, { parts, result })` for combining two held items. Items can be `tool` (never
  consumed), `throwable`, or `decoy`.
- **Difficulty**: there is one profile, `L.diff` (Nightmare). `L.tier(normal, nightmare)` and `L.nightmare` remain,
  always answering for Nightmare, so a second, easier profile could come back without touching the nights.
- **Hooks** set inside `build`: `L.isWon()`, `L.barrierDist`, `L.floor = { poly, y }` (where
  dropped items may land), `L.dynamic()` (per-frame props via `SC.mkQuad` and friends),
  `L.update(dt)`, `L.onReach(c)`, `L.onCatch(c)`, `L.onPickup(it)`, `L.onDrop(it)`, `L.glows()`,
  `L.creatureLit(c)`, `L.objectiveText()`, `L.onEnd()`, `L.deathCause(c)` (a key into `text.death`),
  `L.aftermath(t, dt)` (a custom aftermath; return true when it is over), `L.watchPoint()` (where the win camera
  looks instead of at the thing), `L.visFrac(c)`, `L.eye = { x, y, z }` (move the eye: renderables, targets, items
  and lights flagged `attach: true` ride with it, everything else slides past; the night 2 car drives off this way),
  `L.onDecoy(t, item)`, `L.onLaneSwitch(c, lane)`, and `L.sealed(lane)`: a creature reaching a
  sealed way is held at the barrier (or where it is, if it got inside first) until the night is won.
  On Nightmare it goes round after 2.5 s to a way that is still open, starting 3 m outside that way's
  barrier and announced by its `cue`; below Nightmare it never changes its way.
- **Changing ways**: on Nightmare the thing may switch ways once, early and unseen, and goes round
  sealed ways as above. Neither ever picks a lane marked `noSwitch` (a lure's destination), a lane
  outside a creature's own `lanes` list, or moves a creature given a fixed `lane`; a night with
  `laneSwitch: false` opts out of both. `laneMode: 'default'` or `'random'` overrides how the first
  way is picked (the profile rolls again on every attempt).
- **Surfaces and drawing order**: `SC.quad(..., { tex: 'planks' | 'logs' | 'stone' | 'tin', texScale })`
  builds boards, logs, stone blocks or tin bands as real pieces on top of the quad (dropped with
  distance, and switched off by the surface detail setting). A renderable's `sortDist` orders it
  without changing its fog, and `alpha` fades polys and sprites (the last night's room comes up that way).
- **Feedback text** goes through `G.say(specific, vague)`: the first is shown with hints on, the
  second otherwise.
- Every night has a solution in `test/nights/nightNN.js` so the suite can play it.

## Testing

```
npm ci                 # Playwright and ESLint at the versions in package-lock.json
npx playwright install chromium   # the browser (or set PW_CHROMIUM to a Chromium binary)
npm test               # sounds, nights, flow, features, lanes, lane switches, story, clickability sweep
npm run test:play      # NIGHTS=1,3 SEEDS=1,2 narrow it
npm run test:sounds    # no browser: every sound exists, every cue has a caption
npm run test:bench     # frame time per night at 1920x1080 (BUDGET=8 ms p95 by default)
npm run test:spots     # screenshot every item spot into montages under test/shots
```

`test/play.js` runs each night's declared solution per tier and seed. `test/flow.js` covers the
screens, death and retry, pause, mute, drops and the error overlay. `test/features.js` covers
the one game (no picker, no hints), restart, mute, menus, captions, the gamepad and touch pad, sealed ways, the death
camera, save migration and the last night's two endings. `test/lanes.js` runs `validateContent()` and checks every
lane gets picked on Nightmare. `test/switch.js` checks the Nightmare lane switch happens only while
unseen, early, without a jump in distance, and never on nights that opt out.
`test/hittest.js` checks every item is visible and clickable from some direction across many layouts.
`test/story.js` checks the lamp is in every room, the clock ticks, and no text before the bedroom uses
the words that would give the ending away. `test/sounds.js` reads the sources and checks that every sound
the game asks for exists in the synthesiser and that every lane cue, death sting, footstep and voice has a
caption. `test/hittest.js` takes `NIGHTS=` and `N=` (layouts per night) to narrow it.

## Debugging

- `index.html?level=3` jumps to a night's card; `&go` skips the card.
- `index.html?seed=42` reproduces a whole run (layout, creature timing, drops).
- `index.html?debug` shows the seed, lane, distance, visibility and FPS, and runs `validateContent()`.
- `index.html?nofr` disables the frame loop so `G.step(dt, n)` can advance the game by hand.
