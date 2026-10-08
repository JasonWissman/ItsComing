# The 3D lab

Night 1 of *It's Coming* rebuilt on [Three.js](https://threejs.org), as a place to find out what it takes to
reach the visual richness of a browser game like [Typing Dead](https://typingdead.com) (rigged characters,
real lighting, fog, bloom, grain, at 60 fps) without losing this game's feel: something walking at you from a
long way off, in first person, faster when you are not looking. It follows the architecture the research report
drew from Typing Dead's public write-up. It is an experiment next to the game, not a replacement for it; the game
is untouched.

## Run it

The lab is ES modules, so it needs an HTTP server (a `file://` URL will not do):

```
npm run lab          # serves the repository; open http://localhost:3000/lab/
npm run test:lab     # the headless test, screenshots into test/shots/lab-*.png, a short bench
```

Any static host works: on GitHub Pages it is `<site>/lab/`. Three.js is vendored (`lab/vendor/three`, pinned to
the version in `package.json`, copied by `npm run lab:vendor`), so there is no build step and no CDN.

| Key | Action |
| --- | --- |
| `←` `→` | turn to one of 8 directions |
| `↑` `↓` | look ahead, look down |
| hold `Shift` (or `Z`, `Space`) | zoom |
| click, `F` | fire (a flash, a shell casing from the pool, a hit flash on the thing; three hits dissolve it) |
| `X` | dissolve it now |
| `R` | start over |
| `H` | hide the panel |
| `P` | pause |
| `B` | run the bench |

Query options for links that reproduce an experiment: `?dist=5&hold` (put it at 5 m and keep it there),
`?dir=4` (face south), `?down`, `?quality=low|medium|high|auto`, `?set=ink:true,outlineWidth:4,fogDist:60`
(any panel setting), `?model=url` (load a GLB), `?bare` (no panel, no HUD), `?nofr` (no frame loop; `LAB.step(dt, n)`
advances by hand), `?bench` or `?bench=10` (frames per view).

## What is in it, and where it comes from

The pieces map onto the report's recommendations. Every number that defines the thing's behaviour is the game's own.

| Report | Lab | File |
| --- | --- | --- |
| Headless game model; input mutates it synchronously; the renderer reads snapshots | `createModel`: the walker's approach (`D0 = 130 m`, `T = 80 s`, `gamma 0.72`, ×1.35 unseen), the camera, the game's visibility rule (`projectRect`, the doorway aperture, seen = 20 % on screen), the heartbeat and danger pulse, the lunge and the catch, hits and dissolve. No Three.js in it. | `js/model.js` |
| Fixed-step loop, interpolation, UI off the frame loop | 60 Hz steps with an accumulator, an interpolated snapshot per frame, the DOM HUD and panel touched every eighth frame, `window.LAB` for the tests | `js/main.js` |
| Rigged GLB characters with baked clips, an `AnimationMixer` per character, a small state machine | The walker as a 25-bone skeleton driving a skinned mesh built from capsules; `walk` and `idle` clips baked from the 2D walker's gait, bob and sway; `reach` (arms up and forward, fingers spread) as an **additive** layer whose weight is how near it is; the walk's time driven by the gait phase so feet never slide; the snapping head tilt and the opening mouth as procedural layers on top | `js/walker.js`, `js/character.js` |
| Custom GLSL toon and dissolve shaders | A `ShaderMaterial` on Three's chunks (so it skins, fogs and tone-maps like a built-in): hemisphere ambient, the moon in anti-aliased bands, the lamp by the door in bands, a hard rim so the silhouette reads against the fog, a hurt flash, and a dissolve that burns away along object-space noise with an emissive edge for the bloom | `js/materials.js` |
| Selective ink outlines | Two techniques to compare: an **inverted hull** (the mesh again, back faces, pushed out a few pixels; costs one draw call per mesh) and a **screen-space edge pass** (depth and normal discontinuities; draws the scene twice) | `js/materials.js`, `js/post.js` |
| Instanced repeated scenery | 77 trees in 6 draw calls (3 bare and 3 round variants), fence posts, 220 grass tufts, 90 dark patches: all `InstancedMesh` | `js/scene.js` |
| Fog, bloom, grain, chromatic damage, dynamic lighting | The game's fog curve (`1 − e^(−d/105)`, patched into Three's fog chunk, since FogExp2 is quadratic in distance), a sky dome with the game's bands, the moon with bloom, stars, drifting clouds, the mist sprites, a moon shadow on the field, the lamp pulsing with the heartbeat; after tone mapping, the film pass: the game's grain, vignette, red danger edge, chromatic aberration growing with the pulse, flash and fade | `js/scene.js`, `js/post.js` |
| Pooled physics effects | 24 shell casings in an `InstancedMesh`, never allocated after start | `js/view.js` |
| GLB + Draco + KTX2 + Meshopt | `GLTFLoader` with all three decoders wired to the vendored copies; drop a `.glb` on the page or `?model=url`; feet put on the floor, centimetre exports scaled, materials swapped for the toon shader keeping colour and albedo map, hulls added, clips mapped to walk / idle / reach by name (and re-mappable in the panel); the current character exported back out as a GLB | `js/loader.js` |
| Quality tiers, measured | low / medium / high (pixel ratio, bloom, shadows, edge pass, mist, MSAA), **auto** drops a tier when the CPU p95 goes over 14 ms and climbs back when it stays under 7; `renderer.info` counters and a p50 / p95 / max readout; a bench that sweeps every direction and pitch like the game's `?bench` | `js/view.js`, `js/stats.js`, `js/main.js` |

## Experiments to try

The panel changes everything live; settings persist in `localStorage` (**Reset settings** clears them).

- **How much of the look is the character?** Tick *compare: PBR character*: the same rig with a standard
  material under the same lights. Then set *toon bands* to 1 (plain Lambert in the same shader), 2, 3, 6.
- **Which outline?** *Ink outline (hull)* against *ink edges (screen pass)*. Watch the draw-call line: the hull
  costs 2 calls, the pass draws the whole scene again. The hull is almost invisible on this near-black walker; it
  earns its place on a lit, coloured model (drop one in).
- **The silhouette.** *Rim light* is what keeps it readable at 40 m against the fog. Turn it off and find it.
- **Fog and mist.** *Fog distance* 60 and the field closes in; 200 and the trees come out.
- **The post stack.** Bloom strength and threshold (the moon and the dissolve edge are what glow; the moon is
  visible from the field, not from inside the house), grain, vignette, chromatic.
- **The approach.** *Pace ×8* to watch the whole walk in ten seconds; untick *faster unseen* to see how much the
  gaze rule contributes; **Hold it there** and the *distance* slider to study any range; fire three times.
- **Budgets.** Set the tier by hand and read the counters; run the bench (`B`) and keep the numbers (below).
- **A real character.** See the next section. Then play with *stride* (metres per walk cycle, which is what
  stops the feet sliding) and the clip mapping.

## Bringing a modelled character in

The pipeline the report recommends, as it applies here. Mixamo is the quickest way to a rigged, animated
humanoid for a prototype (Adobe's terms allow use in games, including commercial ones; keep a copy of the terms
on the day you download). A modelled creature from an artist goes through the same steps from Blender onward.

1. **Mixamo** ([mixamo.com](https://www.mixamo.com)): choose a character; download it with one animation
   as FBX Binary, *With Skin*, 30 fps; download the other animations *Without Skin*. For the walker's roles you
   want a walk, an idle and a reach/attack.
2. **Blender**: import the skinned FBX, then the others; each arrives as an action on the same rig. Name the
   actions `walk`, `idle`, `reach` (or map them in the lab's panel later). Set the scale so the character is in
   metres (Mixamo exports centimetres; the lab scales a model taller than 10 m by 0.01, but fix it at the source),
   apply transforms, feet on the floor, facing +Z. Export glTF 2.0 Binary (`.glb`) with animations, +Y up.
3. **Compress** (optional for a test, required to ship): `npx gltfpack -i walker.glb -o walker.packed.glb -cc`
   gives Meshopt geometry; add `-tc` for KTX2 textures where your gltfpack build supports it, or use
   `@gltf-transform/cli` (`optimize --compress draco` or `meshopt`, `--texture-compress ktx2` with the KTX
   tools installed). The lab decodes Draco, Meshopt and KTX2. Benchmark Draco against Meshopt on *time to first
   usable frame*, not file size.
4. **Drop it** on the lab page, or put it under `lab/assets/` and open `?model=assets/walker.glb`. The panel
   shows its clips; set the stride (a human walk cycle is about 0.75 × height; a shuffle is less).
5. **Record it** in `lab/assets/LICENSES.json` (one record per asset: creator, source, date, license, proof).
   Nothing goes into the repository without a record.

### The asset contract

What every character must satisfy so that neither the lab nor the game needs a special case:

```
units:          metres (1 unit = 1 m)
ground:         feet at y = 0
forward:        +Z (the lab turns it to face the player)
height:         documented; the walker is 2.45 m
clips:          walk (one full cycle, loops), idle (loops), reach (a pose or a short loop); more are fine
stride:         metres per walk cycle, documented (the walker: 3.64)
root motion:    none (the game moves the root)
head:           a bone whose name contains "head" (the tilt and the mouth hook on to it)
materials:      as few as possible; colour and albedo map survive the toon swap, nothing else is read
textures:       power-of-two, ≤ 1024² for a creature, KTX2 at ship time
budget:         under 10 k triangles for a creature, under 60 bones
```

## Measurements

CPU time is update plus the render call on the main thread (what the game's own bench measures); the GPU is not
in it. The headless numbers below are from the test's Chromium on SwiftShader (software GL), so the GPU side is
meaningless there (about 550 ms a frame at high) but the CPU side is real, and the draw-call and triangle counts
are the budget.

| Tier (1280×760) | Draw calls | Triangles | CPU p50 | What is on |
| --- | --- | --- | --- | --- |
| low | 50 | 43 k | 2.1 ms | ratio 1, no bloom, no shadows, 8 mist |
| medium | 66 | 43 k | 2.2 ms | + bloom at half size, MSAA |
| high | 95 | 80 k | 3.1 ms | + moon shadows (2048² map, the field and the thing) |
| high + edge pass | 155 | 160 k | 4.2 ms | + the scene drawn again for normals and depth |

For comparison, the game's own bench keeps every night's Canvas 2D frame under 8 ms p95 at 1920×1080.

Fill this in from real hardware (press `B`; the result is also in `LAB.benchResult` and the console):

| Machine, GPU, browser | Tier | Ratio | CPU p50 / p95 | fps | Notes |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## What has been learned so far

- **Lighting has to be calibrated to a display-referred palette.** The game's colours already have the night in
  them. Lit in linear space with a modest ambient, everything crushes to black; what works is an ambient of about
  1.0 (so a surface shows as authored), the moon as a strong banded key on top, and a neutral tone curve (ACES
  darkens the shadows the palette lives in).
- **Overlays blend differently in linear space.** The mist at the game's 11 % was three times too strong; 4 % in
  linear space is the same haze. Anything ported from Canvas 2D alpha needs the same rescaling.
- **Three clips are enough for the walker,** with the reach as an additive layer over a gait-driven walk and the
  head and mouth procedural. A modelled character needs the same three.
- **The outline technique depends on the character.** On a near-black silhouette the hull does nothing visible
  and the rim light does all the work; the screen-space pass outlines every grass tuft before it outlines the thing.
- **The budget is comfortable.** 95 draw calls and 80 k triangles at high, 3 ms of CPU, with headroom for
  twelve more creatures of this size and real textures. Instancing matters: the trees would be 77 calls, not 6.
- **The architecture holds.** Input never waits on a frame; the model is testable without a browser; the view
  can be swapped (the roundtrip test loads a GLB of the walker in place of the procedural one with no change
  elsewhere).

Open questions: shadows from the house onto the field (the house casts; is it worth it?), a cheaper mist (a
ground-fog shader instead of sprites), whether the game's palette should be re-authored for 3D rather than
reproduced, and what the walker looks like modelled rather than built from capsules.

## From the lab back into the game

The game is closer to the report's target architecture than it looks: rules, nights and creatures' behaviour
(`speedMult`, `lateral`, `onSeen`, lanes, apertures) are already independent of drawing. The rendering coupling is
in four places: `CREATURES[type].draw(ctx, c, P)`, the `SC.*` builders that push polys and sprites into
`L.props`, the per-frame renderables from `L.dynamic()`, and `R.hits` / `R.projectRect` for clicks and visibility.

1. **Freeze behaviour.** The Playwright suite already plays every night; it is the regression net.
2. **A renderer interface.** `prepare(L)`, `begin(cam, L, t)`, `add(renderable)`, `flush()`, `post(fx)`, `hits`,
   `projectRect`: the present `R` already has this shape. A `ThreeRenderer` with the same surface, chosen by
   `?renderer=3d`, lets both run against the same `G`.
3. **One night's environment.** The `SC.*` builders gain a 3D twin each (`js/scene.js` is night 1's), or the
   polys they produce are merged into geometry by colour and layer, which keeps every night working at once but
   looks like the Canvas game with lighting. Start with the twins for one night.
4. **One creature.** `CREATURES.walker` gains a `model` entry (GLB, clip roles, stride, height); the 3D renderer
   drives it through `character.js`; `draw` stays for the Canvas renderer. Hit testing projects the model's box
   the way `model.js` does, so `R.hits` keeps its shape.
5. **Items and the HUD.** Icons stay Canvas-drawn (each becomes a sprite texture); the inventory, compass,
   captions and menus stay DOM, as the report advises.
6. **Effects, tiers, then the other twelve creatures,** one GLB each, three to five clips each.

## Files

```
lab/index.html          the page: canvas, HUD, panel, drop zone, import map
lab/lab.css
lab/js/main.js          boot, input, the loop, HUD, bench, drop zone, window.LAB
lab/js/model.js         the headless model (the walker's approach, the camera, seen/unseen, lunge, heartbeat)
lab/js/view.js          renderer, camera, quality tiers, casings pool, export/import roundtrip
lab/js/scene.js         the field: house, fences, instanced trees and tufts, sky, moon, stars, clouds, mist, lights
lab/js/walker.js        the procedural rigged walker and its baked clips
lab/js/character.js     the character view: mixer, roles, blending, procedural layers; shared with loaded GLBs
lab/js/materials.js     the toon/dissolve shader, the hull outline, the fog patch, the gradient map
lab/js/post.js          composer: ink pass, bloom, output, film
lab/js/loader.js        GLTFLoader with Draco/KTX2/Meshopt, GLB in, GLB out
lab/js/panel.js         the control panel and persisted settings
lab/js/stats.js         frame-time percentiles and renderer counters
lab/tools/vendor.js     copies the pinned three into lab/vendor
lab/vendor/three        the vendored library (committed; CI checks it matches the pinned package)
lab/assets/LICENSES.json the asset ledger (empty of art: the lab ships none)
test/lab.js             the headless test
```
