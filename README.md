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
| click | pick up an item, place it, use a target |
| hold the button, then let go | draw a bow, and loose the arrow |
| `1`–`6`, `Tab` | choose which held item is active |
| `R` | restart the current night |
| `Esc` | pause |
| `M` | mute |

`WASD` also works for turning and looking. Clicking the floor while looking
down puts the active item back down.

Touch controls appear on phones and tablets: turn, look, hold to zoom, Use
(whatever is nearest the middle of the view, or put the held thing down when
looking down; hold Use to draw a bow, as holding A does on a gamepad) and Pause; tapping the held item again while looking down also puts it
down. A gamepad works too: d-pad or left stick turns and
looks, A uses, B puts the held thing down, a trigger zooms, Start pauses. In
menus the d-pad moves between buttons and settings, left and right move a
slider, A presses or ticks, and B goes back as Escape does.

On the Phone Booth, facing the pay phone brings the view in close to it: click or tap its keys, or type the number
with the number keys. With a gamepad the d-pad moves a highlight over the phone (receiver, coin slot, keys, coin
return; past the last one in a direction it turns as usual) and A presses what is highlighted.

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
An arrow let go before the bow is fully drawn, or drawn full but not at it, still spends the arrow. A way you have shut holds it
where it is; where more than one way must be shut, it waits there a moment and then goes round to a way that is still
open (a thing that can run is seen running there, side on, as the walker runs round the house on the first night).
Where you cannot see it any more once you have won (behind a shut door or shutter), you hear and feel it beating on
that door instead, hard and fast, until the night fades.

Saves from versions with several difficulties carry over: the furthest night reached on any of them,
and the best time on any of them, count for the one game.

## The nights

Each level is one thing coming at you and a small set of steps to survive it.
Items are scattered around you in different directions, some at eye level and
some on the ground, so you have to turn and look down to find them.

1. **The Field.** A tall thin walker crosses a moonlit field toward a farmhouse whose
   two doorways have no doors. Find the hammer, the nails and the loose planks, and board
   up both: board the one it is coming for and it runs round the house to the other. The
   planks are wide old boards, and three of them close most of a doorway, leaving a slit at
   eye level. Once the last one is up it charges that doorway, hits the boards, stoops to
   look in at you through the slit with its fingers over the board, and pounds on them until
   the night fades.
2. **The Road.** Your car has stalled, in drive. Something pale comes up the road on all
   fours, in bursts, in the headlights. Find the car keys (the green ones), put the stick in
   park and turn the key in the dash beside the dials until it catches; then pick a gear and
   hit the gas. Reverse always gets away; drive does only if it is coming along a verge, and
   then, if it is near the road, it scuttles sideways out of your lights as you pass. The
   whole road slides past as you go.
3. **The Graveyard.** The old warden walks between the graves and never stops
   smiling: a crypt keeper bent double over the hump on his back, his bald head jutting
   forward low, white wisps of hair, a long ragged coat and cape, a ring of keys at his
   belt and a hooked staff with no lantern on it. Salt both ways in, the doorway and the
   side gate, and hang and light a lantern by each: a way is done only with both. The
   sugar comes in a red bag. A salt line stops him; he comes up to it and looks down at
   it, and if the other way is not done (bare, or its lantern dark while this one burns)
   he runs round to it, side on. With nowhere better to go, a line with no light by it
   holds him only a while: he looks down at the salt once more and steps over. When the
   last lantern is lit he comes right up to the salt, looks down at it, then turns round
   and walks back into the dark.
4. **The Quarry.** A stone figure that only moves when nothing is looking at it.
   You must look away to shut both gates, chain each with its own chain, and padlock
   them. One padlock is rusted solid. Every glance away costs you. The gates are barred right
   across with thin iron bars, too close for it to get through and far enough apart that you
   can watch it through a shut one. Lock the gate it is coming to and it
   tries it, then runs round the outside of the yard to the other one, but only while
   nothing is looking: catch it going round and it stops dead, mid-stride. At the end it
   comes on only when you blink, up to the gate, and shakes it on its chain.
5. **The Clearing.** Something that sprints, drops to all fours to watch, and
   sprints again; out in the tree line it sometimes breaks sideways to a new place,
   running side on. The bow is on the porch, and its three arrows lie about, each in a
   place of its own (driven into the wall or a post, along a rail, on the woodpile, the
   crate or the boards, stood against the wall); picked up, they go together in one slot,
   "Arrows ×2". Hold the button (or the touch Use button, or A) to draw. A power bar fills
   beside your aim, and when it tops out it is full: it turns green and says so, the string
   comes tight with a click and shines, the bow bent hard back, and it stays full for as long as
   you hold it. Let go full with it in your sights and the arrow goes in, however far off it
   is (the further, the smaller it is to aim at). Let go before full and the arrow drops into
   the snow short of it; full but off it, it misses. A click looses nothing: the bow comes up
   and is let down again. The first hit drops it for a moment and the second puts it down.
   With all three arrows gone and it still up, it comes flat out.
6. **The Boathouse.** Something swims in across the water, going under for a
   while and coming up closer. The winch is chained and padlocked: the key is in the
   tackle box. Crank the water door down, and shut and bar the side door (the door or
   either iron bracket beside it will do). Shut one way first and, once it has been held
   there a moment, it goes under, swims round and comes across into the other side on.
   With both shut it throws itself at the door it came to, harder and faster, the boards
   bowing in and the water coming in under them, until it lets go and goes under.
7. **The Lighthouse.** The lamp is out and something is clinging to the outside of
   the tower, climbing the wet stone hand over hand; you see it by looking over the rail,
   and it climbs faster while you do not. Put the spare bulb in the lamp, open the fuse
   box, pull the blown fuse and put in the new one from the toolbox, and turn the crank so
   the beam goes round: its first pass knocks it sliding back down the wall, and the next
   knocks it off the tower, to fall all the way down into the sea.
8. **The Diner.** A man-shaped thing in the lot is drawn to the light: while the
   lights are on it comes fast, too fast to shutter every window. Throw the power main
   on the back wall in the first ten seconds or so, find the crank, and crank all three
   shutters down; each time its window shuts it turns side on and runs to one still
   open, along the glass if it is already there, across the lot if not. If it reaches an
   open window it comes through the glass. With the last shutter down it runs up to it
   and beats on it, hard and fast, until the night fades.
9. **The Phone Booth.** It is raining and a man in a long coat is walking toward the
   booth, up the main street or along the pavement from the east. The pay phone is on the
   west wall, so using it means looking away from him; facing it brings the view in close.
   Find the number in your notebook and a coin (in the coin return, on the shelf or on the
   floor by the phone), then do what the card beside the keys says: lift the receiver, put
   the coin in and dial on the phone's own keys. It rings for seven seconds before anyone
   answers, and he keeps coming the whole time. A wrong number is not in service, and
   hanging up drops the coin back into the coin return. When someone answers, a car comes
   down his street and pulls up at the kerb for you.
10. **The Mirror Maze.** A porcelain doll is always behind you and you only ever see
    it in the glass: facing a mirror holds it. One of the four mirrors is not like the
    others, and two are under dust sheets. The music box lies in one place and its crank
    in another. Any pedestal takes the box, and the crank fits its side on any of them, but
    its tune plays only before the odd mirror: there each turn plays a few notes of it, and
    on the last the doll comes running out through the glass for the box, smiling, lifts it
    off the pedestal and takes it back in with it. Before any other mirror the first turn
    plays wrong notes and the crank sticks; in the glass the doll's face turns angry (brows
    down, a red glare, its teeth bared, its fists out) and behind you it takes three quick
    steps. The next click on the box lifts it back off, its crank still in it, to put before
    another mirror. Before the crank is in, a click on the box takes it back too, unless you
    are holding the crank (then the click fits it).
11. **The Barn.** Something bent double under a bundle is coming for the hayloft,
    across the yard to the loft door or in at the far end of the barn and up the ladder,
    and it goes faster the more you carry. A stack of hay stands in each way in, and both
    must burn. Fill a bottle at the oil drum, stuff a rag in its neck, light the rag with
    the matches (they light the second one too) and throw it into the hay. Fire in the
    stack it is coming past sends it running round, side on, to the other way; fire it is
    already past is no use. Carry one bottle and one rag at a time.
12. **The Bedroom.** You are in bed. It is already in the doorway, or in the
    closet, moving in extreme slow motion. Get the lamp on, pull the covers up. Then they
    come up over your eyes and the rest happens under them: its steps to the bed, the
    shadow of its hand on the lamp-lit cloth, three hard pulls that the covers hold, and
    the light through them going grey.
13. **The Void.** Everything you ever held against it lies around you, and you
    start the night holding some of it. Holding anything enrages it. Put it all down
    and let it come, and face it when it does: as it looms in the view lifts to its face.
    Turned away from it, or looking at the floor, when it reaches you is a death too. Faced
    empty-handed, it stops close in front of you and slowly reaches its open hands out to you,
    and its arms close round you, its hands over the top of the view. While it holds you its
    face goes slowly through rage, anguish, fear, sorrow and calm until it is happy. Then it
    lets you go and the dark opens into a green meadow in the sun (wild flowers, trees, clouds,
    birdsong and a breeze), where it dances a little; the meadow stays as long as you like.

Creatures move faster when you are not looking at them, but otherwise they
come at a steady pace, no faster at the end than at the start. A thread runs through the
nights that the text never states: the same lamp is somewhere in every room, a
clock ticks for the first ten seconds of each night from the same direction, and
surviving a night leaves a fragment, one odd sentence, collected on the Nights
screen. Finishing the last night ends in that meadow; a click, key, tap or A there fades
the meadow and the thing away into the bedroom, in the morning, and switches the game to a light theme.

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
  uses: [{ tool, ammo, dudAmmo, range, onHit(c, hits, L), onMiss(L), draw: { loose(outcome, c, aim, power, L), fill, min }, inHands(ctx, W, H, draw, L, aim) }], // things you use on the creature itself
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
  `timeScale` (slow motion), `death` ({ delay, dur, sting, pose }) and `seenFrac`, and `drawRun` (a side-on run,
  drawn by the creature's own `draw` while `c.runPose` is set; see Changing ways) with `runW` (how wide that run is
  drawn, stride and all, when it is wider than `w`). A night can send its creature running sideways: `c.runPose` on,
  `c.runDir` (+1 to the right of the view), `c.runGait`, and either `c.runLat` (the walker, night 1) or the night
  moving it along a way of its own (the customer, night 8, which also takes `c.runTurn` and `c.runAmt`).
  `CREATURES[type].body(c)` gives the part of its box its pose fills (what a bow must be aimed at). A creature need
  not be drawn on its lane: the climber takes `c.wallAt(c)` and `c.wallFrame(c)` from its night and is drawn on the
  tower's stone, and the night's `L.visFrac(c)` judges whether it is seen where it is drawn.
- **A bow** (`uses[].draw`): held, the button (Use, A) draws it, and the power bar beside the aim fills over `fill`
  seconds to full (it turns green, and `bowFull` clicks), and stays full for as long as it is held. All that matters
  is whether it is full when you let go: full with the aim on the thing's body, at any distance, and
  `loose('hit', ...)` is called; full but off the thing is 'miss'; before full is 'short'. Each spends one of the ammo.
  Let go before `min` seconds and nothing is loosed. `inHands` draws what you hold over the view. Items that share an
  id and are made with `stack: true` (night 1's planks, night 5's arrows) go together in one slot as they are picked up.
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
  looks instead of at the thing; it may also return a `zoom`), `L.watchZoom()` (close the win camera in further),
  `L.watchPitch` (how far down the win camera may look), `L.watchUp` (how far up it may look: the last night, into its face),
  `L.onPress(e)` (a won night waiting on a click, key, tap or A; true when it took the press: the last night's meadow,
  where a modifier, a chord or a function key, as for alt-tab or a screenshot, does not go on), `L.viewZoom()` (a zoom the view comes in to while playing:
  the pay phone close up), `L.padDir(dir)` and `L.padUse()` (a night may take the gamepad's d-pad and A before the
  game does), `L.overlay(ctx, W, H)` (a night's own picture over the view: the covers over your eyes), `L.visFrac(c)`, `L.eye = { x, y, z }` (move the eye: renderables, targets, items
  and lights flagged `attach: true` ride with it, everything else slides past; the night 2 car drives off this way),
  `L.onDecoy(t, item)`, `L.onLaneSwitch(c, lane)`, and `L.sealed(lane)`: a creature reaching a
  sealed way is held at the barrier (or where it is, if it got inside first; a lurch across the line in
  one frame still stops at it) until the night is won.
  On Nightmare it goes round after 2.5 s to a way that is still open, starting 3 m outside that way's
  barrier and announced by its `cue`; below Nightmare it never changes its way. `L.roundOpen(lane, c)`
  lets a night judge for itself which ways it goes round to (night 3: one weaker than the way it is held
  at); the night is then asked every frame while the thing is held, until it has somewhere to go. A creature whose type defines
  `drawRun` goes round on its feet instead (`goRound` in game.js, modelled on night 1's run round the house): it
  sprints sideways out of the way's opening, is heard running while out of sight, and comes in 3 m outside the open
  way's barrier from the side it went round by.
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

`test/play.js` runs each night's declared solution per tier and seed (a night's steps can `draw` a bow: let go at
once, short of full, as soon as it is full, or after a time; on the thing or off it; by mouse, touch or pad). `test/flow.js` covers the
screens, death and retry, pause, mute, drops and the error overlay. `test/features.js` covers
the one game (no picker, no hints), restart, mute, menus, captions, the gamepad and touch pad, sealed ways, the death
camera, save migration and the last night's two endings. `test/lanes.js` runs `validateContent()` and checks every
lane gets picked on Nightmare. `test/switch.js` checks the Nightmare lane switch happens only while
unseen, early, without a jump in distance, and never on nights that opt out.
`test/hittest.js` checks every item (each one, where several share an id) is visible and clickable from some direction across many layouts.
`test/story.js` checks the lamp is in every room, the clock ticks, and no text before the bedroom uses
the words that would give the ending away. `test/sounds.js` reads the sources and checks that every sound
the game asks for exists in the synthesiser and that every lane cue, death sting, footstep and voice has a
caption. `test/hittest.js` takes `NIGHTS=` and `N=` (layouts per night) to narrow it.

## Debugging

- `index.html?level=3` jumps to a night's card; `&go` skips the card.
- `index.html?seed=42` reproduces a whole run (layout, creature timing, drops).
- `index.html?debug` shows the seed, lane, distance, visibility and FPS, and runs `validateContent()`.
- `index.html?nofr` disables the frame loop so `G.step(dt, n)` can advance the game by hand.
