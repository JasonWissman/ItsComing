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
| `Esc` | pause |
| `M` | mute |

`WASD` also works for turning and looking. Touch controls appear on phones and
tablets. Clicking the floor while looking down puts the active item back down.

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

Creatures move faster when you are not looking at them, and all of them
accelerate as they close in. Some pause, some lurch, one only moves when unseen.
Progress is saved in `localStorage`; the title screen offers to continue from
the furthest night reached.

## Project layout

```
index.html        page shell, HUD and styles
js/util.js        math, color and drawing helpers
js/audio.js       Web Audio synthesis: wind, drones, heartbeat, footsteps, effects
js/render.js      tiny painter's-algorithm 3D renderer on Canvas 2D (sky, ground, props, billboards, fog, post effects)
js/creatures.js   the five creatures: procedural drawing plus movement behavior
js/icons.js       item icons and scenery builders (walls, boxes, trees, fences, gravestones, road, moon, stars)
js/levels.js      the five level definitions
js/game.js        game state, input, interaction, HUD, main loop
```

### Adding a level

Add an object to `LEVELS` in `js/levels.js`. A level is defined in a local frame
where the creature comes from local "ahead" (+z); `facing` rotates the whole
level so the compass shows a different world direction. In `build(L)`:

- place scenery with the `SC` helpers (`wallV`, `floorQ`, `box`, `tree`, ...);
- place items with `mkItem(L, id, name, {deg, dist, y} | {x, y, z}, {w, h, flat, uses, tool})`;
- place targets with `mkTarget(L, {...accepts, requires, needed, use(item), hint()})`;
- set `L.isWon()`, `L.barrierDist`, `L.aftermath(t, dt)` and `L.aftermathText`;
- optionally `L.dynamic()` for per-frame props, `L.update(dt)`, `L.onReach()`,
  `L.glows()`, `L.creatureLit(c)`.

Creatures are registered in `CREATURES` (`js/creatures.js`) with a `draw(ctx, c, P)`
that paints in meters with the feet at the origin, and a `speedMult(c, dt, seen)`
that shapes how it moves.

### Debugging

- `index.html?level=3` jumps to a level's title card.
- `index.html?level=3&go` skips the card.
- `index.html?debug` shows distance, progress, visibility and FPS in the corner.
