# The ink lab

The game's own renderer, with more ink. Where `lab/` asks what a Three.js rebuild would take, this lab asks
the other question: how far can the drawing we already have go? It loads the game's actual `js/render.js`,
`js/creatures/*` and `js/icons.js`, puts them on a set, and adds what the reference pieces have that the game
does not: ink outlines, hatching and screentone, a rim of light, monochrome with one spot colour, line boil, a
torch circle, paper, misregistration, dither, your own hands in the frame, five new creatures drawn with new
primitives, and traced SVG art as sprites. Every one of them is a knob with a cost next to it, and because it is
all the game's code path, a technique that works here moves into the game by moving a function.

## Run it

It is plain scripts like the game, so a double-clicked `lab2d/index.html` works, as does any static host
(`npm run lab`, then `/lab2d/`). `npm run test:lab2d` runs its headless test and drops screenshots into
`test/shots/lab2d-*.png`.

| Key | Action |
| --- | --- |
| `←` `→` `↑` `↓`, hold `Shift` | turn, look, zoom, as in the game |
| click, `F` | the hands reach (and, in the game, would use the thing you hold) |
| `C` | compare: the plain game on the left, the passes on the right |
| `L` | line-up: all the creatures standing in a row, instead of one coming |
| `R` `H` `P` `B` | reset, hide the panel, pause, bench |

Query options: `?scene=corridor|field|stage`, `?creature=grinner` (any id), `?lineup=lab|game|all`,
`?dist=5&hold`, `?dir=4`, `?down`, `?set=mono:true,ink:2,flash:0.8` (any panel setting), `?svg=url`, `?bare`,
`?nofr` (`LAB2.step(dt, n)` advances by hand), `?bench`, `?sweep`.

## What is in it

**Primitives** (`js/ink.js`), in the game's metre space next to `P_poly` and `P_limb`: `P_hatch` (parallel
lines clipped to a polygon, with a band for the shadow side), `P_hatchEll`, `P_tatter` (a polygon with a torn
edge), `P_ragged`, `P_drip` (a run and a drop that falls, looping on time), `P_flame` (a candle, flickering,
reporting where its light is), `P_halo`, `P_ribs`, `P_wildHair`, `P_stripes`, `P_brush` (a tapering line).
A creature uses them the way it uses `P_ell` today; the five new creatures are the demonstration.

**Creature passes** (`js/passes.js`), applied to any creature's `draw(ctx, c, P)` without touching it. The
drawing goes to an offscreen canvas the size of the sprite on screen, and the passes work on that:

| Pass | What it does | How |
| --- | --- | --- |
| ink outline | a line around the silhouette, thinner with distance | the silhouette filled with ink, drawn at 12 offsets round a ring |
| hatching | diagonal lines on the side away from the light | a seamless 45° tile, `source-atop` the drawing, the lit side erased with a gradient |
| screentone | a dot screen, same side | a staggered dot tile, the same way |
| rim | a thin light on the lit edge | the silhouette in the rim colour, minus itself shifted away from the light |
| line boil | the drawing shifts a pixel or two a few times a second | a jitter of the transform, seeded by time |
| monochrome | everything grey except what a creature marks with `P.spot` | the palette wrapper desaturates `P.col`; `P.spot` passes through |
| glow | soft light at points a creature names (`P.glow`: eyes, candles) | additive radial gradients in screen space, fogged |
| shadow | an ellipse on the ground under it | the game's own flat sprite, added before the creature |

The passes fade with the fog like the drawing, and far away (a sprite under a few pixels) nothing runs at all.
The wrapper is the game's `P` with three additions, so an existing creature needs no change and a new one can
mark its spot colour and its lights.

**Scene passes** (`js/post.js`), through `R.post`'s `drawOverlay`, so the game's vignette, danger pulse and
grain still go on top: the torch (a soft circle, darkness outside it, a touch of warmth inside), misregistration
(the frame drawn again as a red plate and a cyan plate, a few pixels apart, through SVG colour-matrix filters),
dither (the frame at a third of its size, brightness quantised with an ordered 4×4 pattern, scaled back without
smoothing: a screen print, and a posterise when the levels are few), and paper (a fibre texture, multiplied and
screened). **Ink edges on the set** need one hook in the game's renderer: `R.style.ink` strokes every polygon's
edge a given width, thinner with distance; it is zero in the game and the game's tests cover that.

**Your hands** (`js/hands.js`): two ink-drawn hands at the bottom of the view, breathing, swaying as you turn,
reaching when you click, flinching when it gets you, the active item in the right one. The hallway reference
shows why: a first-person view with no body in it is a camera; with hands it is you.

**Five new creatures** (`js/creatures/`), original designs in the spirit of the reference pieces, each in the
game's registry format with `h`, `w`, `stepRate`, `init`, `speedMult` and `draw`:

| Creature | The drawing | The behaviour |
| --- | --- | --- |
| the grinner | child-sized, striped sleeves, a hole for a face with two eyes ringed red and a wide white grin, lank hair | moves only while unseen; the grin is a little wider each time you look back |
| the candlebearer | a trailing torn robe, the long skull of an animal, horns with five candles, dripping hands, rune banners | glides; the candles are point lights in the scene that it does not light itself with |
| the haloed | bone in a torn cassock, an open ribcage, a hood with nothing in it but two gold points, a crown of rays, red cloth wings that lift and fall | walks like a procession, raises both hands in blessing as it nears |
| the sackhead | skinned red, a cloth sack with three holes over its head, a bone shiv, a rag over one shoulder, long toes | stalks: a stride and a pause; leaves blood on the floor behind it |
| the gaunt | the walker's cousin starved to the bone, hatched ribs, huge white eyes, wild wire hair, claws | lopes, arms swinging, head snapping, leans at you as it closes |

**SVG as a creature** (`js/svgsprite.js`): drop an `.svg` on the page. Its paths become `Path2D` objects and
the drawing becomes a creature of the height you set, drawn either **live** (every fill, each colour fogged and
lit through the game's `P.col`, cached per colour per frame) or as a **sprite** (rendered once at three sizes,
drawn as an image with the fog composited over it). The reference tracings are 440 to 2,970 fills each; the
readout shows what each way costs. Page-sized background rectangles are dropped; `clip-path` is ignored.

**The sets** (`js/scenes.js`): the corridor (walls, skirting, a picture rail, paneled doors in frames every few
metres, a shut door at the far end, a torch cone from the eye, the fog close), the field (night 1's back door,
the field, the fence, the mist), and a bare stage for the line-up.

## Editing the creatures by hand

Every creature can go out as an SVG, be edited in Figma, Illustrator, Inkscape or anything that reads SVG,
and come back as a creature that still moves. The masters are in `lab2d/assets/creatures/` (generated by
`npm run lab2d:export`; the **Export this .svg** button in the panel writes the one on the lane).

A master is the creature at rest. One unit is one centimetre of the creature, the feet stand on the bottom edge
of a transparent rectangle called `bounds` (keep it: it sets the scale when the file comes back), and each
top-level group is a part: `head`, `armL`, `armR`, `legL`, `legR`, `body`, and sometimes more (`halo`, `wingL`,
`banners`, `rag`: those stay still). The small **magenta dot** in a group is the part's joint, where the lab
turns it: move the dot to change where a part bends; it is never drawn in the game. The four of the game's
own creatures marked up so far (the walker, the smiler, the tall one, and all five new ones) export in parts;
the other nine export as one `body` group until they are marked up (a `P.part` call per part in their draw).

Edit as much as you like inside a group: redraw the shapes, add shapes, delete shapes, change colours, add a
hand-drawn texture. Colours with real saturation (reds, golds) are kept when the lab goes monochrome; greys
and near-greys go to ink. Keep the group names (your tool keeps them as layer names) and the dots. Two ways
to work:

- **In pieces**, keeping the groups: the parts come back animated with the creature's own rules (the walk,
  the arms rising as it nears, the head tilt), and parts can be nested, a `handL` group inside `armL`.
- **As one drawing**: flatten it, or draw a new creature from scratch without groups. It comes back as one
  part, bobbing with the walk; the arms and head will not move on their own. Fine for a still thing, or for
  judging a design before cutting it into parts.

Bringing it back: drop the file on the lab page and it appears in the list as "the grinner (edited)", next to
the code version, with the grinner's pace and behaviour. To keep it, `npm run lab2d:import -- path/to/grinner.svg`
writes it into `lab2d/js/creatures/edited/` so it is there on every load; commit that. Hand me the edited
file (or commit it) and I will take the design back into the drawing code, or keep it data-driven, whichever
you prefer; the rig is the same either way.

Notes for the tools: Figma and Illustrator write group transforms (`transform="..."` on a `<g>`) when you move
or scale a group, which the lab reads; clipping masks come back as `clip-path`, which it also reads;
gradients and raster effects do not (a gradient is read as its middle colour). Illustrator escapes layer names
(`armL` may come back as `armL_x5F_1`); the lab matches the start of the name.

## Experiments to try

- **The compare split (`C`).** Any creature, any set. Then take the passes away one at a time.
- **Monochrome with spot colour.** Tick *monochrome*, and the grinner's eye rings, the haloed's halo and wings,
  the sackhead's flesh and the candles stay coloured while the set goes to ink. Try it on the game's own
  creatures: they have no spot colour, so they go fully grey, which is itself a look.
- **Hatching on the game's creatures.** The smiler's coat and the walker's torso take the hatch and rim
  without a line of change. Spacing 3, strength 0.6, light from the left: an engraving. Spacing 8, strength 0.25: a wash.
- **The torch in the corridor.** `flash` 0.8, radius 0.4, the fog at 16 m: the hallway reference. Turn
  *faster unseen* on and look away.
- **Dither at 4, levels 4, monochrome:** a photocopied zine. Misregistration 2: a cheap print.
- **The line-up (`L`)**, *acts as if at* 8 m: every creature with its arms coming up. At 30 m: all at rest.
- **A traced reference as a sprite.** Drop one of the vectorised files on the page; set *svg drawn as* to live
  and read the ms; set it back to a sprite. Then ink, hatch and rim on top of a tracing.
- **The cost sweep** button: each pass alone against a plain frame, in ms, on your machine.

## Measurements

The numbers below are from the headless test on a software canvas, after thirty frames of warm-up (the game's
own tests run the same way; its frame budget there is 8 ms p95). Real browsers draw Canvas 2D on the GPU, where
the compositing passes are far cheaper and the pixel loop of the dither is the one that stays expensive; the
**Cost sweep** button gives the numbers for your machine. 1280×760, the thing in the corridor:

| Frame | Whole frame, ms | Of which the passes, ms |
| --- | --- | --- |
| the game as it is: the smiler at 3 m, no passes, no hands | 1.3 | 0.1 |
| the same with the defaults: ink, hatch, rim, shadow, hands, paper | 5.8 | 4.4 |
| the candlebearer at 3.5 m (a 300×430 px sprite), defaults | 9.4 | 8.6 |
| the five new creatures in a line at 8 m, passes on all | 23.7 | 21.0 |
| a 919-fill tracing at 4 m as a sprite, passes on top | 4.6 | 3.7 |
| the same tracing live, each fill fogged through `P.col` | 9.7 | 9.0 |
| the smiler with the dither on (a third of the frame, five levels) | 48.8 | 48.1 (the dither) |

The cost sweep on a small sprite (the grinner at 6 m) puts each pass alone at: ink +0.5, hatch +1.1, tone +0.5,
rim +0.5, boil +0.1, glow, shadow, edges, torch, paper and hands at or under +0.1, misregistration +7.4,
dither +9.9 ms. So: the per-creature passes cost in proportion to the sprite's area on screen, a few
milliseconds of compositing for a near thing on a software canvas (there is rarely more than one near thing),
the sprite path makes a traced drawing as cheap as a procedural one, and the two passes to be careful with are
the ones that copy the whole frame: the dither reads pixels back, the misregistration draws it three times.

## What has been learned so far

- **Most of the distance to the references is drawing, not rendering.** Hatching, torn edges, drips, a halo,
  a sack with holes in it: they are a dozen primitives, each a few lines, used in the creatures' own draw
  functions. The passes add the ink line, the shading side and the rim on top of any of them.
- **The game's lighting model is already most of the look.** A candle on a creature is a point light in the
  set and a glow on the sprite, both things the game has; the only new rule was that a thing is not lit by the
  light it carries.
- **Monochrome with spot colour is cheap and strong,** and it works on the existing creatures today.
- **The hands change the genre.** They cost nothing and they are the single thing in the hallway reference
  the game lacks most.
- **A tracing is usable as a sprite**, not as live paths: three sizes rendered once, fog composited after.
  Whether tracings belong in the game is a style question more than a cost one; they sit flat next to the
  procedural creatures, which move.
- **What still needs an artist's hand:** the drawings here are built from primitives and read as such up
  close; the primitives are the point, the particular shapes are a first pass.

## Moving it into the game

In order of value against effort:

1. **The hands.** `HANDS.draw` into `game.js`'s render, after `R.post`'s overlay, with the active item and
   the game's own states (reach on use, flinch on a hit, the lantern's light).
2. **Monochrome with spot colour, and the ink primitives.** The `P` wrapper into `js/render.js`'s `spriteP`,
   `P.spot` and `P.glow` into the creatures that want them, the primitives into `js/util.js`.
3. **The creature passes** into `game.js` where the creature renderable's `draw` is defined (one call:
   `PASSES.drawEnhanced` around `CR.draw`), as a Settings toggle with a cost tier.
4. **The torch and paper** into `R.post`, behind the same toggle; the ink edges are already in `render.js`
   behind `R.style.ink`.
5. **New creatures** as new nights: each needs a night's mechanic, which the lab does not try to invent.
6. **Dither and misregistration** last, as a Settings look, with the dither off on slow machines.

## Files

```
lab2d/index.html           the page: the game's scripts, then the lab's
lab2d/lab2d.css            on top of lab/lab.css
lab2d/js/stubs.js          the little of G, AUDIO and SAVE the creature files expect
lab2d/js/ink.js            the new drawing primitives
lab2d/js/passes.js         the creature passes and the palette wrapper
lab2d/js/post.js           the scene passes
lab2d/js/hands.js          your hands
lab2d/js/svgsprite.js      SVG in, as live paths or a sprite
lab2d/js/record.js         a creature's drawing out as an SVG of parts (the editing master)
lab2d/js/rig.js            an edited master back in as a creature whose parts turn about their joints
lab2d/js/creatures/edited/ edited masters brought in for good (generated by lab2d/tools/import-creature.js)
lab2d/assets/creatures/    the masters: one .svg per creature, written by lab2d/tools/export-creatures.js
lab2d/tools/               export-creatures.js, import-creature.js
lab2d/js/creatures/*.js    the five new creatures
lab2d/js/scenes.js         the corridor, the field, the stage
lab2d/js/panel.js          the panel and persisted settings
lab2d/js/main.js           the loop on R, the line-up, the compare, the sweep, the bench, window.LAB2
test/lab2d.js              the headless test
js/render.js               one hook: R.style.ink (zero in the game)
```

The reference images and the traced SVGs are not in the repository: they are other artists' work, used here
as study. The five creatures are original drawings in the same spirit.
