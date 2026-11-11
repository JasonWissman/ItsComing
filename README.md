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
return; past the last one in a direction it turns as usual) and A presses what is highlighted. The notebook on the
shelf under the phone is read where it lies: click it (or press Use, or A) to open it, and again to turn each page.

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
   window beside the front doorway is glass you can see out of, over the field, and if it
   runs round that side you see it go past. The planks are wide old boards, and three of
   them close most of a doorway, leaving a slit at eye level. A plank put up with no hammer and nails to fix it hangs
   there a moment and falls off to the floor in front of the doorway, to be picked up again; the rotten one goes up and,
   as the nail goes in, its end tears away in a shower of soft crumbs, a stub of it left on the nail, and it drops. A
   click on a boarded doorway knocks on the boards, and they shudder on their nails. Once the last one is up it
   charges that doorway, hits the boards, stoops to look in at you through the slit with its
   fingers over the board, and pounds on them until the night fades.
2. **The Road.** Your car has stalled, in drive. Something pale comes up the road on all
   fours, in bursts, in the headlights. Find the car keys (the green ones), put the stick in
   park and turn the key in the dash beside the dials until it catches; then pick a gear and
   hit the gas. Reverse always gets away; drive does only if it is coming along a verge, and
   then, if it is near the road, it scuttles sideways out of your lights as you pass. The
   whole road slides past as you go. The house keys are tried at the keyhole, blade first, will not go in and drop to the
   floor at your feet. Out of park the key will not turn: your hand takes it and it strains a few degrees and goes back.
   Your hand turns the key and moves the stick, and your foot comes onto the gas: with the engine dead the pedal goes
   limp to the floor under it.
3. **The Graveyard.** The old warden walks between the graves and never stops
   smiling: a crypt keeper bent double over the hump on his back, his bald head jutting
   forward low, white wisps of hair, a long ragged coat and cape, a ring of keys at his
   belt and a hooked staff with no lantern on it. Salt both ways in, the doorway and the
   side gate, and hang and light a lantern by each: a way is done only with both. The
   sugar comes in a red bag: poured across a way, it lies there a moment and the wind takes
   it off the stone in a drift of grains, and the bag is let fall by the slab. A match struck
   at a hook with no lantern on it flares, finds nothing to light and is shaken out, and
   anything knocked against a hook or its lantern sets it swinging. A salt line stops him; he comes up to it and looks down at
   it, and if the other way is not done (bare, or its lantern dark while this one burns)
   he runs round to it, side on. With nowhere better to go, a line with no light by it
   holds him only a while: he looks down at the salt once more and steps over. When the
   last lantern is lit he comes right up to the salt, looks down at it, then turns round
   and walks back into the dark.
4. **The Quarry.** A stone figure that only moves when nothing is looking at it.
   You must look away to shut both gates, chain each with its own chain, and padlock
   them. One padlock is rusted solid: pressed down on the chain it will not snap shut, and
   drops. A chain thrown round a gate still swinging shut rides on its end and is knocked off to
   the ground as the gate meets its post (clicked as it is about to shut, it goes on as it shuts), and a shut gate with nothing to hold it, pushed, swings out a little
   and falls back shut. Every glance away costs you. The gates are barred right
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
   Hit, its body twitches, small sharp jerks of its limbs and trunk, the arrows in it shaking with it; dead in the
   snow, the jerks die away over a few seconds (with reduced motion, they are barely there).
   Drawn on, it may react: about one draw in three (a click that only lifts the bow does not count), it
   breaks sideways to a new place, running side on as it does in the tree line, and drops to watch
   from there, so the aim has to come after it; it does not do it twice within a few seconds, nor once
   it is close. With all three arrows gone and it still up, it comes flat out. The bow floats where
   your hands would hold it. Pressed with no arrows, the bow comes up and tips to show the bare shelf,
   the string is plucked twice where an arrow should sit and twitches on nothing, and it is let down; an arrow clicked at it with no bow is raised to shoot, finds nothing to sit on,
   and drops head first to the boards at your feet, where you have to pick it up again.
6. **The Boathouse.** Something swims in across the water, going under for a
   while and coming up closer. The winch is chained and padlocked: the key is in the
   tackle box. Crank the water door down, and shut and bar the side door (the door or
   either iron bracket beside it will do). Shut one way first and, once it has been held
   there a moment, it goes under, swims round and comes across into the other side on.
   With both shut it throws itself at the door it came to, harder and faster, the boards
   bowing in and the water coming in under them, until it lets go and goes under. Tried too
   soon, the winch answers in iron: an empty hand rattles the padlock on its chain, the handle
   put on the boss snaps the chain taut (the padlock jumps) and comes back to your hand, the
   oar's end jams at the boss and it clatters to the deck, and with the padlock off but no
   handle the wheel moves a hair under your hand and no further. The key goes into the padlock
   before it springs open. The bar put up while the side door is still swinging shut is knocked
   back into your hands by the leaf.
7. **The Lighthouse.** The lamp is out and something is clinging to the outside of
   the tower, climbing the wet stone hand over hand; you see it by looking over the rail,
   and it climbs faster while you do not. Put the spare bulb in the lamp, open the fuse
   box, pull the blown fuse and put in the new one from the toolbox, and turn the crank so
   the beam goes round: its first pass knocks it sliding back down the wall, and the next
   knocks it off the tower, to fall all the way down into the sea. The lamp turns with the
   crank, lit or dark. There is another way: once the new fuse is out of the toolbox, the toolbox itself can be taken
   up (heavy, held open in front of you), and with it in hand a click on the thing, looking over the rail at it, lets it
   go over the rail on the line straight down to it. The tower flares out below the gallery, so it hits the stone and
   comes down the wall, tumbling and banging, spilling a spanner and a screwdriver. If the thing is no more than about
   8 m below the gallery floor (the hover says "Drop the toolbox on it."), the box comes down onto its back, and it
   loses its hold, slides scrabbling and falls all the way into the sea as from the beam: a win, with a line of its own.
   Further down (the hover says "Too far down.") the box, going faster and faster, kicks out off the stone, goes past
   it out over the water and into the sea, and is gone. A fuse tried with the blown one still in knocks against it and comes
   back to your hand; a blown fuse pushed into the empty clips (the one you pulled, or the
   worn one lying about) sits there a beat with nothing coming on and drops out onto the
   floor.
8. **The Diner.** Something the size of a child is out in the lot: a pale, rumpled
   button-up onesie with dark-striped sleeves, little dark shoes, small bare hands hanging at
   its sides, and from the neck up all black, long straggly black hair hanging over a black
   face with two huge round red-rimmed staring eyes and a grin of big white teeth from one
   side of it to the other. It stands bolt upright and dead still, nothing swinging; it comes
   on in small stiff steps, and now and then its feet stop and it slides on anyway, while its
   head lays itself slowly over to one side and slowly over to the other. At the glass its
   hands come up flat on it either side of its face; when it runs it skips, its arms hanging
   dead straight, its head turned to you; coming at you, the grin comes apart, the jaw
   dropping far further than a jaw goes. It is drawn to the light: while the
   lights are on it comes fast, too fast to shutter every window. Throw the power main
   on the back wall in the first ten seconds or so (your hand takes the lever and pulls it
   down, and the lights go with it), find the crank (without it, your hand tries a
   window's gearbox and it will not move), and crank all three
   shutters down; each time its window shuts it turns side on and skips to one still
   open, along the glass if it is already there, across the lot if not. If it reaches an
   open window it comes through the glass. With the last shutter down it runs up to it
   and beats on it, hard and fast, until the night fades.
9. **The Phone Booth.** It is raining and a man in a long coat is walking toward the
   booth, up the main street or along the pavement from the east. He carries no light: he is a dark shape
   against the wet haze, seen as he passes under the street lamps, until his eyes open close by. The pay phone is on
   the west wall, so using it means looking away from him; facing it brings the view in close.
   Your notebook lies shut on the shelf under the phone. Click it and its cover goes back over the spiral, and the view
   comes down close over the page lying open; click again and the page is lifted by its corner and turned over, and a
   click on the last page shuts it. Turning away lets the view go, and the notebook stays open where it lies. Find the
   number in it (it has a page to itself, scrawled large across it in red
   that has run, as if in blood, in a hurry) and a coin (in the coin return, on the shelf or on the
   floor by the phone), then do what the card beside the keys says: lift the receiver, put
   the coin in and dial on the phone's own keys. Lifted, the receiver is in your left hand, its cord running down out of
   the view, and your right hand presses each key with a fingertip, going from key to key as you dial (what it held goes
   down meanwhile; keys pressed faster than it can go are pressed in turn); a key goes down when the finger gets there, and
   one the phone will not take only clicks, the display blinking its credit at you (or NOT IN SERVICE). A coin put in with
   the receiver on its hook goes from your fingers into the slot, rattles down through the works and drops into the coin
   return, to be taken out again. It rings for seven seconds before anyone
   answers, and he keeps coming the whole time. A wrong number is not in service, and
   hanging up drops the coin back into the coin return. When someone answers, a car comes
   down his street and pulls up at the curb for you.
10. **The Mirror Maze.** A porcelain doll is always behind you and you only ever see
    it in the glass: facing a mirror holds it. In every glass it dances on the spot, a slow,
    jerky wind-up doll's dance (an arm going up and coming down in little ticks, a wrist
    rolling, a knee coming up, the head snapping over to one side, a rock from foot to
    foot), in step in all of them. One of the four mirrors is not like the others: in it the
    doll dances the other way round, the mirror image of the rest (the arm the others raise,
    it raises on the other side, and its head goes over the other way; which arm the others
    raise changes from one load to the next, so only comparing tells). The mirrors are
    otherwise alike, and two are under dust sheets. The music box lies in one place and its
    crank in another. Any pedestal takes the box, and the crank fits its side on any of them,
    but its tune plays only before the odd mirror: there each turn plays a few notes of it,
    and on the last the doll stops dancing, turns round once on the spot like the dancer on
    the box, and comes running out through the glass for the box, smiling, lifts it off the
    pedestal and takes it back in with it. Before any other mirror the first turn plays wrong
    notes and the crank sticks; in the glass the doll stops dancing dead, its face turns
    angry (brows down, a red glare, its teeth bared, its fists out) and behind you it takes
    three quick steps; it dances again once its temper has gone. The next click on the box
    lifts it back off, its crank still in it, to put before another mirror. Before the crank
    is in, a click on the box takes it back too, unless you are holding the crank (then the
    click fits it). It is your hand on the crank, turn by turn; when it jams the box jumps on the pedestal and the hand
    wrenches at it, and the box taken back comes up off the pedestal into your hand. The crank tried on a pedestal with no
    box on it feels about the bare top for something to fit and comes back to your hand; with nothing in hand, the hand
    goes out to the empty top. A dust sheet is pulled down by hand and slides off the glass into a heap.
    If it reaches you, it comes at you angry, whatever it was before: brows down, the red glare and its teeth bared all
    the way in to your face, its jaw dropping and its fists opening as it lunges.
11. **The Barn.** Something bent double under a bundle is coming for the hayloft,
    across the yard to the loft door or in at the far end of the barn and up the ladder,
    and it goes faster the more you carry. A stack of hay stands in each way in, and both
    must burn. Fill a bottle at the oil drum, stuff a rag in its neck, light the rag with
    the matches (they light the second one too) and throw it into the hay. Fire in the
    stack it is coming to, or walking in between, sends it running round, side on, to the
    other way; fire in a stack it has already walked past does not turn it. Once both burn
    it cannot reach you, wherever it is, unless it is already up in the loft: out beyond a
    fire it rears back from the flames, paces them and sits down; caught between a fire and
    you, it rears back, backs away from you into the smoke and sits down there. The rags
    are squares of old grey-blue cloth. Carry one bottle and one rag at a time. Only a lit
    bottle is let go of: anything else tried at the hay is swung out toward it and held back
    (oil slops out of an open bottle and spatters the boards), and a match flicked at it goes
    out as it falls. A full bottle held to the drum's tap runs it over into a pool on the
    boards; a lit one, or the matches, is snatched back before it gets there. The wrong things
    put together stay as they were, the other one (or a struck match, flaring and going out)
    up in your other hand a moment.
12. **The Bedroom.** You are in bed. It is already there, in the hall beyond the doorway
    or in the closet, behind the wall at the side of the opening: at first only its head
    leans out round the edge, its fingers curled round the frame (having its head in view
    counts as watching it). Then it steps out into the room, in extreme slow motion. It
    cannot stand the light: when the lamp comes on it throws an arm across its face and
    sinks down out of sight, keeps low (only a dark shape along the floor, if it is out in
    the open) to the bed, and comes up at the foot of it (or at its corner, out of the
    closet) until only its eyes are over the edge; then its long hands come up over the
    edge onto the covers. That is the moment: pull the covers up. The lamp must come
    first: pulled up in the dark, the covers do not save you; it is at the bed all at once,
    takes hold of them, rips them down off you and is in your face. If the lamp burns
    out before the covers are up (it flickers first), it rises again from behind the bed
    and comes on; one pull of the chain brings the light back, and it goes down again. Your hand
    pulls the lamp's chain (nothing comes of it with no bulb in or the cord out, and it sticks),
    opens the drawer, pushes the plug in and is on the covers' hem as you hold them; the wrong
    bulb will not go into the socket and drops onto the bed, to be taken again. Then they
    come up over your eyes and the rest happens under them: its steps to the bed, the
    shadow of its hand on the lamp-lit cloth, three hard pulls that the covers hold, and
    the light through them going grey.
13. **The Void.** Everything you ever held against it lies around you, and you
    start the night holding some of it, a thing in each hand. Holding anything enrages it.
    Put it all down (each falls from your hand to the floor; reach for another with your hands
    full and the full hand only goes toward it) and let it come, and face it
    when it does: as it looms in the view lifts to its face.
    Turned away from it, or looking at the floor, when it reaches you is a death too. Faced
    empty-handed, it stops close in front of you and slowly reaches its open hands out to you,
    and its arms close round you, its hands over the top of the view. While it holds you its
    face goes slowly through rage, anguish, fear, sorrow and calm until it is happy. Then it
    lets you go and the dark opens into a green meadow in the sun (wild flowers, trees, clouds,
    birdsong and a breeze), where it dances a little; the meadow stays as long as you like.

Creatures move faster when you are not looking at them, but otherwise they
come at a steady pace, no faster at the end than at the start. A thread runs through the
nights that the text never states: a
clock ticks for the first ten seconds of each night from the same direction, and
surviving a night leaves a fragment, one odd sentence, collected on the Nights
screen. Finishing the last night ends in that meadow; a click, key, tap or A there fades
the meadow and the thing away into the bedroom, in the morning, and switches the game to a light theme.

Each night is a little different every time it loads, and trying a night again never brings it the same way twice in a row: every item has several
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
js/hands.js             your hands: what you hold drawn over the view, a thing tried where it will not go (the fumble), the reach
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
  uses: [{ tool, ammo, dudAmmo, range, onHit(c, hits, L), onMiss(L), draw: { loose(outcome, c, aim, power, L), fill, min }, inHands(ctx, W, H, draw, L, aim),
          onClick(c, L), hoverText(c, L), sights }], // things you use on the creature itself (onClick: the night does it all, as night 7's toolbox; sights: false, no crosshair)
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
  Let go before `min` seconds and nothing is loosed. `inHands` draws what you hold over the view (and asks
  `HANDS.showHands`, the switch in `js/hands.js`, whether to draw any hands on it). Items that share an
  id and are made with `stack: true` (night 1's planks, night 5's arrows) go together in one slot as they are picked up.
- **Items and targets** are placed in `build(L)`: `mkItem(L, id, name, spot | [spots], opts)`
  picks one of several spots per load (never the same spot twice, never within 0.8 m of another
  item); `mkTarget(L, { accepts, requires, needed, use(item), hint(), onClick(), hold, crank })`
  for anything you use things on; `mkContainer(L, { opens, yields, spot })` for drawers and boxes;
  `mkRecipe(L, { parts, result })` for combining two held items. Items can be `tool` (never
  consumed), `throwable`, or `decoy`.
- **Hover glow**: only things you can pick up (items) glow when pointed at; a target (a door, a gate, a switch) gets the
  pointer cursor alone. The glow plumbing below still exists for a night that lights a target its own way (`L.highlight()`,
  the phone's keys under a gamepad): a target glows in the shape of the things it is drawn with, as an item glows in its own. `glowWith(t, props)` names them (`SC.grab(L, fn)` returns the props `fn` builds); a per-frame
  piece takes `glowOf: t`, or everything added between `R.glowAs(t)` and `R.glowAs(null)` belongs to `t`. A piece with
  `hoverOnly` is drawn only while its target is pointed at (night 7's blown fuse, which the fuse box otherwise draws).
  A container glows in its box by itself. `L.highlight()` can light a target chosen another way (night 9's keypad from
  a gamepad). Nothing is ever outlined with a box.
- **Difficulty**: there is one profile, `L.diff` (Nightmare). `L.tier(normal, nightmare)` and `L.nightmare` remain,
  always answering for Nightmare, so a second, easier profile could come back without touching the nights.
- **Hooks** set inside `build`: `L.isWon()`, `L.barrierDist`, `L.floor = { poly, y }` (where
  dropped items may land), `L.dynamic()` (per-frame props via `SC.mkQuad` and friends),
  `L.update(dt)`, `L.onReach(c)`, `L.onCatch(c)`, `L.onPickup(it)`, `L.onDrop(it)`, `L.glows()`,
  `L.creatureLit(c)`, `L.objectiveText()`, `L.onEnd()`, `L.deathCause(c)` (a key into `text.death`; a night that
  calls `die(c, cause)` itself may first set `c.deathSpec = { delay, dur, sting }` to give that death its own timing and sting),
  `L.aftermath(t, dt)` (a custom aftermath; return true when it is over), `L.watchPoint()` (where the win camera
  looks instead of at the thing; it may also return a `zoom`), `L.watchZoom()` (close the win camera in further),
  `L.watchPitch` (how far down the win camera may look), `L.watchUp` (how far up it may look: the last night, into its face),
  `L.onPress(e)` (a won night waiting on a click, key, tap or A; true when it took the press: the last night's meadow,
  where a modifier, a chord or a function key, as for alt-tab or a screenshot, does not go on), `L.viewZoom()` (a zoom the view comes in to while playing:
  the pay phone close up, or the notebook open on its shelf), `L.padDir(dir)` and `L.padUse()` (a night may take the gamepad's d-pad and A before the
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
  second otherwise. It is still said when something does not work, for the captions, but what you see happen is the
  feedback (below).
- **What you hold** (`js/hands.js`) is drawn in your right hand at the bottom right of the view: a sleeve, the hand
  closed round the thing, and the thing in its own icon, lit as the night lights a thing at your chest (a lamp-lit room,
  a dark field) and a shade darker than what lies about. It breathes, lags a moment as you turn and bobs as you look
  up or down (none of that with reduced motion), is lowered when you look down so it does not hide the floor, and dips a
  little when it is in front of something you could take or a small thing you could use (a lock, a switch). A new active thing swaps in (the old one goes down, the new
  one comes up), a thing picked up comes from where it lay up into the hand, a use pushes the hand toward the target
  (`G.thrust(target, item, release)`; a thing used up is let go of there), and the hand goes down out of view when you
  hold nothing or the night is won or lost. It keeps clear of the middle of the view, the hover line, the inventory and
  the touch buttons, measured from where they are on the page: on a phone it moves in from them, up over them or
  shrinks. How a thing sits in the hand comes from its shape (long: carried in one fist at your side; small: between
  finger and thumb; tall: in a fist; wide and low: on the palm; a key by its bow; a chain hanging), and a few shared
  icons know better (the hammer by its handle, the lantern hanging by its bail). `item.held` overrides any of it:
  `{ grip: 'fist' | 'pinch' | 'flat' | 'hang', at: [x, y] (where the hand closes on it, in its icon's units:
  x -0.5..0.5 across, y 0..1 up), axis (the line the fingers close round, off the icon's upright, radians clockwise),
  angle (its tilt in the hand, clockwise), size (its longer side as a share of the view's height), scale, x, y (a nudge),
  swing (how freely a hanging thing swings), tip: [x, y]
  (the point it is pushed in with: a key's blade) }`; `G.heldSpec(item)` gives what is used. A night's own
  `uses[].inHands` (the bow) replaces it whenever that tool is held. `L.heldItem(item)` may return another item to draw,
  or null to show nothing (undefined keeps the default); `L.offHand()` returns an item to draw in the left hand, at the
  bottom left; `L.keepHeld` keeps it up once the night is won; `L.hands = { glove, skin, sleeve, lit }` dresses the hands.
- **When a thing will not go**, it is tried there and fails, in the world: `G.fumble(item, target, opts)` takes it from
  your hand to a spot on the target (drawn by the renderer, in the scene's order, fog and light) and fails there, by a
  preset: `'bump'` (pokes the spot, jiggles and drops: keys at a keyhole), `'slip'` (is put in place, hangs a beat, tips
  off one end and drops: a plank on a doorway without nails), `'bounce'` (hits and rebounds toward you, and drops),
  `'clatter'` (hits and is knocked aside, spinning, and drops) and `'return'` (bumps and comes back to the hand). A thing
  that drops leaves the inventory at once (one of a pile, if it is a pile; the hand stays out, open, until it falls, and
  only then does the next thing come up into it) and falls with a bounce to the floor in front
  of the target, where it is an ordinary item again (`taken` false, on `L.floor`, `L.onDrop(item, fx)` called): inside the
  floor's outline, in sight from where you stand, clear of every other item and of any target lying on the floor, near
  enough to see looking down, and never behind you; with nowhere like that, it comes back to the hand instead.
  `G.landSpot(target, item, opts)` says where it would land. Options: `at` (`[u, v]` across and up the target, or a
  world point; by default its middle, or the part of it in view nearest that when its middle is off the view or behind
  what you hold), `standoff` (how far in front of it, along your line of sight), `angle` (its turn at the target), `tip`
  (the point it leads with: a key's blade goes to the spot, the rest of it trailing back toward your hand), `pivot`
  ('left' / 'right': the end a slipping thing hangs from), `hold` (how long it hangs), `drop` (true / false over the
  preset's own), `land` (`{ x, y, z }`), `side` (-1 / 1), `floorY`, `flat` and `restAngle` (how it lies), `speed`, `scale`
  (its size at the target, as a share of its own: by default no bigger than the target, so a set of keys at an ignition is
  no bigger than the lock; it grows back as it falls),
  `sortDist`, `sfx: { hit, land }` (by default by what it is made of: `item.material` 'metal',
  'wood', 'glass' or 'soft', or a guess from its name: a light metal `tink`, a wooden `woodKnock`, a soft `pat`; it lands
  with a `clatter`, or a `flop`), and `onHit(fx)`, `onLand(item, fx)`, `onDone(fx)`. One leaves the hand at a time: another
  while it is on its way returns null, so fast clicks do not start a second (one already falling to the floor goes on by
  itself). `G.fumbling` is the one in play. Input is never locked; using the thing after all while it is on its way back
  puts it straight in hand.
  `G.reach(target, opts)` is the empty hand: it comes up to the target (all the way to a thing within a step, out toward it
  further off), and `style` 'touch', 'push', 'knock', 'rattle' or 'pull' (with `at`, `sfx`, `onTouch(target)`; the
  target's `touchedAt` is set to the night's clock at the first touch); clicked again while it is there it stays for
  another go. Called with something in hand (from a night's own `onClick`, say), what it holds goes down while the empty
  hand does it and comes back up after.
- **What useTarget does when nothing works**, before a night says otherwise: a wrong thing in hand (nothing in the
  inventory the target takes) is tried there and comes back (`'return'`); nothing in hand brings the empty hand up to it
  (`G.reach`); a thing whose target needs something you have not got (`requires`) is put in place and falls off
  (`'slip'`, onto the floor); a decoy is tried there and drops (`'bump'`; the time it costs and `L.onDecoy` stay); a
  night's own refusal inside `t.use(item)` (returning false) is a `'return'`, or `return G.refuse(preset | opts | false)`
  picks another. A box opened brings the hand to it, and each turn of a crank. The right thing picked from the inventory
  for you (the active one would not do) is swapped into your hand first. A target chooses for itself with
  `t.onWrong(item)`, `t.onEmpty()`, `t.onMissing(item, missing)`, `t.onDecoy(item)` and `t.onRefuse(item)` (each replaces
  the animation for its case), `t.fumble` (a preset's name, or options for every case, with per-case entries `wrong`,
  `missing`, `decoy` and `refuse`, each a preset's name, options or false; false for none at all) and `t.reach` (a style,
  or options; false for none). A click a target's own `onClick` takes (returning true: the ignition with no key to hand,
  a gearstick, a gate) shows nothing of this by itself: the night calls `G.fumble`, `G.reach` or `G.thrust` there.
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
camera, save migration, the last night's two endings, and your hands: what you hold (shown, swapped, lowered, still with
reduced motion, clear of the touch buttons on a phone), a wrong thing coming back, a plank falling to the floor where a
click takes it again (hanging, as it tips, from the end it is meant to), a decoy dropping, the empty hand's reach, one fumble for many fast clicks, and a target's own choices. `test/lanes.js` runs `validateContent()` and checks every
lane gets picked on Nightmare. `test/switch.js` checks the Nightmare lane switch happens only while
unseen, early, without a jump in distance, and never on nights that opt out.
`test/hittest.js` checks every item (each one, where several share an id) is visible and clickable from some direction across many layouts.
`test/story.js` checks the bedside lamp is only in the bedroom, the clock ticks, and no text before the bedroom uses
the words that would give the ending away. `test/sounds.js` reads the sources and checks that every sound
the game asks for exists in the synthesiser and that every lane cue, death sting, footstep and voice has a
caption. `test/hittest.js` takes `NIGHTS=` and `N=` (layouts per night) to narrow it.

## Debugging

- `index.html?level=3` jumps to a night's card; `&go` skips the card.
- `index.html?seed=42` reproduces a whole run (layout, creature timing, drops).
- `index.html?debug` shows the seed, lane, distance, visibility and FPS, and runs `validateContent()`.
- `index.html?nofr` disables the frame loop so `G.step(dt, n)` can advance the game by hand.
