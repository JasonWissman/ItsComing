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
slider, A presses or ticks, and B goes back.

Settings has volume sliders, a mute, reduced flashing (a softer red pulse and
dimmer flashes), reduced motion (no jitter or sway), captions for sounds (one
line at a time, with a marker for which side a sound came from), a text size
slider and a switch to put the touch controls on the left. The two reduction settings default on when your system asks for reduced
motion.

## Difficulty

Pick a difficulty on the title screen (click a button or press `1` to `4`).
The choice is remembered.

| | Time before it reaches you | Speed while you look away | Hints | Extra steps | Where it comes from |
| --- | --- | --- | --- | --- | --- |
| Easy | 35% more | a little slower | on, and the card names the direction | none | the usual way |
| Normal | as designed | as designed | off | none | the usual way |
| Hard | 28% less | 25% faster | off | one (a pawl, a choke, a key, a crank, a blown fuse to mend) | either way, fixed per run |
| Nightmare | 40% less | 40% faster | off | two, plus a decoy item | anywhere, no compass mark, and on some nights it changes its mind once while you are not looking |

Every way it can come is fully visible from where you stand: the approach lanes are checked by
`validateContent()` so the thing is never hidden behind a wall on its way in.
On Hard and Nightmare a shot fired out of range still spends a shell; Easy and Normal refuse it
for free. A way you have shut holds it where it is. On Nightmare, where more than one way must be
shut, it waits there a moment and then goes round to a way that is still open.

With hints off, the level card gives only the situation, not the solution; the
objective line at the top of the screen is hidden; hovering a target shows its
name rather than what it needs; and failed attempts get a vague response. You
have to work out what each night wants from what you can find and try.

## The nights

Each level is one thing coming at you and a small set of steps to survive it.
Items are scattered around you in different directions, some at eye level and
some on the ground, so you have to turn and look down to find them.

1. **The Field.** A tall thin walker crosses a moonlit field toward the open back
   door of a farmhouse. Find the hammer and the planks and board the door up.
2. **The Road.** Your car has stalled. Something pale comes up the road on all
   fours, in bursts, in the headlights. Find the keys and start the engine.
3. **The Graveyard.** A smiling man walks between the graves and never stops
   smiling. Salt the chapel threshold and light the lantern by the door.
4. **The Quarry.** A stone figure that only moves when nothing is looking at it.
   You must look away to chain and padlock the gate. Every glance away costs you.
5. **The Clearing.** Something that sprints, drops to all fours to watch, and
   sprints again. Get the shotgun, load it, and wait for it to come close enough.
6. **The Boathouse.** Something swims in across the water, going under for a
   while and coming up closer. Crank the water door down, or bar the side door.
7. **The Lighthouse.** The lamp is out and something is climbing the outside of
   the tower. You only see it by looking over the rail. Fit the fuse and wind
   the clockwork so the beam turns.
8. **The Diner.** A man-shaped thing in the lot that only moves while you are
   looking at it, and freely once the lights are gone. Hold the shutter down
   and reset the breakers before the last tube dies.
9. **The Crossing.** Two things. A signalman walks the line straight at your box
   and obeys the signal; something else comes across the field for the stairs.
   Hold him with the signal, set the points, let the train have him, bar the door.
10. **The Mirror Maze.** It is always behind you and you only ever see it in the
    glass. It moves while no mirror shows it. Wind the music box and it comes
    to the tune instead of to you.
11. **The Barn.** It goes faster the more you carry. Fill the lantern, light it,
    and throw it into the hay between you, carrying as little as you can.
12. **The Bedroom.** You are in bed. It is already in the doorway, or in the
    closet, moving in extreme slow motion. Get the lamp on, pull the covers up.
13. **The Void.** Everything you ever held against it lies around you, and you
    start the night holding some of it. Holding anything makes it angrier.

Creatures move faster when you are not looking at them, and all of them
accelerate as they close in. Difficulty scales both. A thread runs through the
nights that the text never states: the same lamp is somewhere in every room, a
clock ticks for the first ten seconds of each night from the same direction, and
surviving a night leaves a fragment, one odd sentence, collected on the Nights
screen. Finishing the last night switches the game to a light theme.

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
  aftermath: { type: 'held', dur: 3.8, every: 0.75, sfx: 'bang' },   // held, stand, retreat, down, custom
  uses: [{ tool, ammo, dudAmmo, range, onHit(c, hits, L), onMiss(L) }], // things you use on the creature itself
  build(L) { ... }
});
```

- **Lanes** are the directions the thing may come from. Each must be fully visible along its
  whole length; `apertures` describe the openings it is seen through (a doorway, a window, a gap
  between posts) and `blockers` the stretches where it is hidden regardless. `SC.doorway`,
  `SC.window` and `SC.gap` build the wall pieces and return the matching aperture. `buildLevel`
  picks the lane (the default below Hard, a seeded pick on Hard, random on Nightmare, or the
  night's own `laneMode`) and `validateContent()` fails a lane that is not at least 85% visible
  at every metre. `L.lane` is the chosen lane inside `build`.
- **Creatures** are listed in `creatures`; each gets its own lane, timer and seeded random
  stream. `CREATURES[type]` provides `draw`, `speedMult`, optional `onSeen`, `lateral`,
  `timeScale` (slow motion), `death` ({ delay, dur, sting, pose }) and `seenFrac`.
- **Items and targets** are placed in `build(L)`: `mkItem(L, id, name, spot | [spots], opts)`
  picks one of several spots per load (never the same spot twice, never within 0.8 m of another
  item); `mkTarget(L, { accepts, requires, needed, use(item), hint(), onClick(), hold, crank })`
  for anything you use things on; `mkContainer(L, { opens, yields, spot })` for drawers and boxes;
  `mkRecipe(L, { parts, result })` for combining two held items. Items can be `tool` (never
  consumed), `throwable`, or `decoy`.
- **Difficulty tiers**: `L.tier(normal, hard, nightmare)` and `L.extra(minTier, fn)` scale
  counts, add prerequisites or items. `L.diff` is the profile in play.
- **Hooks** set inside `build`: `L.isWon()`, `L.barrierDist`, `L.floor = { poly, y }` (where
  dropped items may land), `L.dynamic()` (per-frame props via `SC.mkQuad` and friends),
  `L.update(dt)`, `L.onReach(c)`, `L.onCatch(c)`, `L.onPickup(it)`, `L.onDrop(it)`, `L.glows()`,
  `L.creatureLit(c)`, `L.objectiveText()`, `L.onEnd()`, `L.deathCause(c)` (a key into `text.death`),
  `L.onDecoy(t, item)`, `L.onLaneSwitch(c, lane)`, and `L.sealed(lane)`: a creature reaching a
  sealed way is held at the barrier (or where it is, if it got inside first) until the night is won.
  On Nightmare it goes round after 2.5 s to a way that is still open, starting 3 m outside that way's
  barrier and announced by its `cue`; below Nightmare it never changes its way.
- **Feedback text** goes through `G.say(specific, vague)`: the first is shown with hints on, the
  second otherwise.
- Every night has a solution in `test/nights/nightNN.js` so the suite can play it.

## Testing

```
npm install            # Playwright (or set PW_CHROMIUM to a Chromium binary)
npm test               # sounds, nights, flow, features, lanes, lane switches, story, clickability sweep
npm run test:play      # NIGHTS=1,3 TIERS=normal,hard SEEDS=1,2 narrow it
npm run test:sounds    # no browser: every sound exists, every cue has a caption
npm run test:bench     # frame time per night at 1920x1080 (BUDGET=8 ms p95 by default)
npm run test:spots     # screenshot every item spot into montages under test/shots
```

`test/play.js` runs each night's declared solution per tier and seed. `test/flow.js` covers the
screens, death and retry, pause, mute, drops and the error overlay. `test/features.js` covers
difficulty, hints, restart and mute. `test/lanes.js` runs `validateContent()` and checks every
lane gets picked on Nightmare. `test/switch.js` checks the Nightmare lane switch happens only while
unseen, early, without a jump in distance, and never on nights that opt out or on lower tiers.
`test/hittest.js` checks every item is visible and clickable from some direction across many layouts.
`test/story.js` checks the lamp is in every room, the clock ticks, and no text before the last night uses
the words that would give the ending away. `test/sounds.js` reads the sources and checks that every sound
the game asks for exists in the synthesiser and that every lane cue, death sting, footstep and voice has a
caption. `test/hittest.js` takes `NIGHTS=` and `N=` (layouts per night) to narrow it.

## Debugging

- `index.html?level=3` jumps to a night's card; `&go` skips the card; `&diff=hard` picks a difficulty.
- `index.html?seed=42` reproduces a whole run (layout, creature timing, drops).
- `index.html?debug` shows the seed, lane, distance, visibility and FPS, and runs `validateContent()`.
- `index.html?nofr` disables the frame loop so `G.step(dt, n)` can advance the game by hand.
