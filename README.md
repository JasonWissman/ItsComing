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
down puts the active item back down (there is no line about it under the pointer). How to play shows the four that
matter most as cards (Look around, Zoom in, Interact, Pause). The pause menu has Resume, Controls (How to play, the same
dialog as on the title; closing it is the pause menu again), Settings, Scores (once the title has it: the same dialog,
over the paused night, without Erase progress; its Back is the pause menu again) and Quit, its buttons all one width;
there is no Restart or Mute in it, but `R`, `M` and `Esc` work there as anywhere (and Mute is in Settings). Quit is
quieter than the rest (no border, in the secondary, slightly darker, text colour), and it is the only way out to the
title: it asks first, in a small dialog over the pause menu, "Are you sure you want to quit? Your progress will be
lost.", with Cancel (focused; Esc, B, Start or a click off it too) and Quit. `Esc` never goes straight to the title: in
a night, on a night's card, on the death screen and on the win screen alike it opens the pause menu (a pad's B on those
screens too), and Resume (or `Esc` again) puts back exactly what it was over: the night, the card, the death screen or
the win screen.

On phones and tablets (a touch screen as the main pointer) the game is played on its side: held upright, a screen asks
for the device to be turned sideways, and a night under way pauses behind it. The view is the controls. Swipe across it
to turn one step (45 degrees) and up or down it to look down or back ahead; a swipe drags the scene, as a photo is
dragged (the finger going left turns you right, the finger going up looks down), and Settings can reverse swipes. Tap
to interact exactly where you tap, as a click there; press and hold where a thing must be held (the covers; a bow draws
while the finger stays down, its sights following the finger, and looses when it lifts). A swipe is never a tap. A
round zoom button in the bottom right corner is a toggle: a tap zooms in and the view stays zoomed (the button lit, its
plus turned to a minus) while you swipe and tap on the view as ever; a tap on it again zooms back out (the keys and a
pad's trigger still zoom while held). A menu button top left, where the sound line is on a desktop, opens the pause menu (Mute is in its Settings); it is
there on a night's card, the death screen and the win screen too, since the pause menu is the only place with Quit. The
view fills the whole screen, and the things held float over its bottom edge, each slot on a faint backing of its own
(no strip under them); a tap on a slot switches to it (never a tap on the scene behind), and tapping the held item
again while looking down puts it down. Where the browser can put the page full screen (not Safari on an iPhone), a
small button in the top right corner, on the title and in a night, goes full screen (and asks for the screen held
sideways); the same button comes out again. On a desktop it is there too, smaller and fainter (brighter under the
mouse), and F does the same; a click on it is never a click in the scene, and the objective keeps clear of it. The page itself does not
scroll or zoom. A gamepad works too: d-pad or left stick turns and
looks, A uses, B puts the held thing down, a trigger zooms, Start pauses. In
menus the d-pad moves between buttons and settings, left and right move a
slider or go along a row of choices or the Scores' tabs, A presses or ticks, and B goes back as Escape does.

On the Phone Booth, the pay phone and the notebook are looked at as anything else is, with nothing done to the view: hold
the zoom to see them closer. Click or tap the phone's keys where they are drawn (with the zoom held or not), or, facing
it, type the number with the number keys. With a gamepad the d-pad moves a highlight over the phone (receiver, coin slot,
keys, coin return; past the last one in a direction it turns as usual) and A presses what is highlighted. The notebook on
the shelf under the phone is read where it lies: click or tap it (or press A) to open it, and again to turn each page.

Settings has, first, Volume and Brightness, each with a Calibrate button beside it, then rows of choices (radio groups:
the arrows, or a pad's d-pad, go along a row choosing as they go; Enter, Space, A, a click or a tap choose): Display,
Windowed or Fullscreen (the same as the full screen button in the corner, and following it however the page goes in or
out of full screen; not saved, so Set to default leaves it be; where the page cannot go full screen, as on an iPhone, the
row says instead to add the page to the Home Screen, which opens it full screen from there: `manifest.webmanifest`), and
Text size, Smaller (1), Normal (1.4, the default) or Bigger (1.8). Every sound goes through one of two volumes, the
effects (every one-shot, sting, footstep, voice, the heartbeat, the creature loops and the menus' taps) or the ambience
(the nights' beds of wind, rain and drone, and the title's drone); there is no main volume over them, Mute aside.
Volume's Calibrate opens a dialog in the same card: a line on what to do, then two sections side by side. Sound effects:
its slider (its percentage beside it), "Play the quietest sound in the game" (the first beat of the heartbeat, its lub,
as faint as the game first plays it, seven times in about two seconds: twice in the left ear, three times across, twice
in the right) and "Play the loudest sound in the game" (the death sting itself, the effect `sting` as the game plays
it, once, in the middle). Ambience: its slider, "Play the quietest ambience in the game" (night 8's bed once its main
is off, the quietest bed by measure) and "Play the loudest ambience in the game" (night 9's rain, the loudest), a few
seconds of each faded in and out. Each of the four buttons has a play mark at its left (a triangle in a ring, as in the
Sounds Audit), which is a stop mark (a square, the ring lit) while its sound plays and a play mark again when it ends;
pressed while it plays, it stops. There is nothing under the buttons (no dots, bars or words), and they make no click
of their own, pressed to play or to stop, so nothing is over the sound being judged. One plays at a time. They are
tuned as the game tunes them and go through their own volume, with the rest ducked under them while they play; while
the dialog is open whatever ambience was playing (the title's drone, a paused night's bed) is faded out, and back in as
it closes; in a paused night they still play. Brightness's Calibrate shows the title's creature, the shape of it alone
in the demon's robe colour unlit on The Void's black, to be barely made out ("Increase your device brightness, or the
slider below, until you can barely see the outline of this creature"), and under it the game's own brightness: a slider,
60% to 160% in steps of 5%, its percentage beside it, 100% by default (on a phone on its side it sits beside Done). It
is a CSS `filter: brightness()` on the game's canvas, the title's scene and that creature (so what is judged there is
what is seen in the game), never on the menus, the HUD or their words; at 100% there is no filter at all, so it costs
nothing unless used. It is saved with the settings, and Set to default puts it back to 100%. Done
(or Esc, or B) is Settings again, with the focus back on the Calibrate that opened it. An older save carries over: its
main volume is folded into the two (each the main volume times its own, Quieter being half), and its text size to the
nearest of the three now (what was Smaller or Normal is Smaller, the same size Normal was; Bigger is Normal). Then come
switches (`role="switch"`; a click, a tap, Space, Enter or A flips one): Mute,
Reduce motion and flashing effects (one switch for both: a softer red pulse and dimmer flashes, no jitter or sway; the
game still reads the two flags, `reducedMotion` and `reducedFlash`, and the switch sets both), Captions for sounds (one
line at a time, with a marker for which side a sound came from), on a touch screen Reverse swipes, and Reduce surface
textures (off by default; on drops the boards, logs and stone built into walls and floors, which is faster on slow
machines). Reduce motion and flashing defaults on when your system asks for reduced motion. A save from before the
switches carries over: surface detail off is Reduce surface textures on, and the one reduction switch is on if either
of the old two was. At the foot, Set to default puts every setting back as a new save has it, at once and with no
question (the switches, the rows of choices, the volumes' sliders and the brightness follow; progress, the best run, the easter eggs found and the accepted warning are untouched); the
Settings opened from the warning have it too. To its right is Done (primary, as in the Calibrate dialogs; Esc or B too),
which goes back to what opened Settings. Erase progress is on the Scores screen, beside its Back (when Scores is opened
from the title: not from the pause menu), and asks first, in a small dialog of its own (Cancel, Erase); it forgets
everything as before: nights reached, the best run, the easter eggs found, the accepted warning and the settings. The UI's accent red, for its
words and controls (the warning, "It got you", muted, Erase progress), is `--red` (`#f04a54`) in `index.html`.

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

Saves from versions with several difficulties carry over: the furthest night reached on any of them counts for the one
game. Best times for single nights (older saves kept them) are dropped: the only score is a whole run, and none is made
up from them. A best run without its full breakdown (from an older save) is dropped.

## The nights

Each level is one thing coming at you and a small set of steps to survive it.
Items are scattered around you in different directions, some at eye level and
some on the ground, so you have to turn and look down to find them.

1. **The Field.** A tall thin walker crosses a moonlit field toward a farmhouse whose
   two doorways have no doors. It is black all over and starved, its skin pulled tight over its bones: thin arms and legs
   knobbed at the knees and the elbows, the wrists and ankles thinner still, points of bone for shoulders, a narrow torso
   sunk in under a ribcage that flares over a hollow belly, a neck of tendons, and long bony fingers knotted at the
   knuckles, with black nails. From far off it is only a tall black figure; as it nears, the bone shows through in faint
   greys (the collarbones, the breastbone, the ribs, the hip bones, the kneecaps), and its pale grey face comes up out of
   the dark oval of its head, gaunt, the cheeks and temples sunk in under the cheekbones, the round blank eyes deep in
   their sockets, and the mouth opening. Find the hammer, the nails and the loose planks, and board
   up both: board the one it is coming for and it runs round the house to the other (its footsteps from that doorway
   are heard once it has come round in front of it and walks again, not while it is still running). The
   window beside the front doorway is glass you can see out of, over the field, and if it
   runs round that side you see it go past. The planks are wide old boards, and three of
   them close most of a doorway, leaving a slit at eye level. A plank put up with no hammer and nails to fix it hangs
   there a moment and falls off to the floor in front of the doorway, to be picked up again; the rotten one goes up and,
   as the nail goes in, its end tears away in a shower of soft crumbs, a stub of it left on the nail, and it drops. A
   click on a boarded doorway knocks on the boards, and they shudder on their nails. Once the last one is up it
   charges that doorway, hits the boards, stoops to look in at you through the slit with its
   fingers over the board, and pounds on them until the night fades. The night's easter egg ("Give it a window of
   opportunity."): with the empty bottle in hand the window can be clicked (and only then: it is no target otherwise),
   and the bottle is thrown through the glass, which shatters; the bottle is gone and the window stands open, a ragged
   edge of glass round each pane. That alone changes nothing (it still comes through a doorway left open). But board
   both doorways with the window broken and the night is not won: it charges the boards and pounds on them as before,
   a few blows, then stops; its head turns toward the window; it runs round the house to it (from the front doorway
   along the wall, from the back one round the east side, a blow on the wall as it passes); it tears the bars out of the
   frame and climbs in, long fingers over the sill, its head coming through on its side, one thin arm feeling down the
   wall, the body pouring over the sill and the long legs lifted over one at a time, and unfolds to its full height
   inside; a moment looking at you, and it lunges. All of that plays by itself (nothing can be pressed, and the view
   turns to follow it); the egg is found as it starts through the window. "It got you": "You gave it a window of
   opportunity." With the window intact the win is as it was, and once that ending has begun the bottle can no longer be
   thrown; a bottle already in the air as the last board goes up holds the ending back until it lands, and its smash
   starts the other one. With reduced motion nothing in it shakes, the view turns more slowly, and the climb is slower
   and even.
2. **The Road.** Your car has stalled, in drive. Something pale comes up the road on all
   fours, in bursts, in the headlights, shifting across from the road to a verge and back as it comes. Most nights,
   partway in, it breaks off and runs flat out round the car through the dark (heard going, a click as it goes and as it
   gets there) to one side of the car or into the road behind, lit red by the tail lights, and shifts about there; some
   nights it goes round again. Find the car keys (the green ones), put the stick in park and turn the key in the dash
   beside the dials until it catches; then look round for it, pick a gear and hit the gas. Drive with it in the road
   ahead, or reverse with it in the road behind, and the car runs into it (the night's easter egg, kept in the save from
   the moment it is hit): it goes up off the bumper and down the road, turning over; the car lurches to a halt and stalls;
   it lies in a heap in the lights, a limb jerks, and again; it gets up a limb at a time, stands on its hind legs in jolts,
   its head hanging, looks at you, and comes through the glass. Nothing in the car answers meanwhile and the view stays on
   it. The card says "Nice try" and "You drove straight into it, but it is too strong." (backed, in reverse). Anywhere
   else either way gets away (past it on a verge, it scuttles sideways out of your lights). Once the engine runs it stops going round, and once the stick is in
   a gear it moves only while you watch it, so it never steps into your way behind your back. Caught, it comes through
   the window it reached, and the glass breaks in your face: cracks run out from where it hits, then the pane bursts in a
   flash and the shards fly at you (they drop away with reduced motion; the flash is dimmer with reduced flashing). The
   whole road slides past as you go, and the night ends: "You drove off and did not look back." Caught with the engine
   running and the car not away, the card says "The engine was running, but you couldn't get away fast enough." A thing
   put down in the car goes only where all of it stays in sight from your seat: the open floor short of the dash, beside
   or behind your seat, or the passenger seat's cushion, never under the dash, a seat or the console. The house keys are tried at the keyhole, blade first, will not go in and drop to the
   floor at your feet; a wrong key costs only the moment it takes to try it, never any of its way in.
   In reverse or drive the key will not turn (it starts in park or neutral): your hand takes it and it strains a few
   degrees and goes back. In park or neutral the gas only makes the engine roar; the car stays where it is.
   Your hand turns the key and moves the stick, and your foot comes onto the gas: with the engine dead the pedal goes
   limp to the floor under it. The stick stands up out of a plate lying flat on the console by your right hip, P R N D
   along it from the front, the letters reading the right way up as you look down at them from your seat; a click on the
   plate or on the stick moves it on a gear, park, reverse, neutral, drive and round to park.
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
   You must look away to shut both gates, chain each with its own chain, and lock each
   with its own padlock (a click anywhere on the chain, all the way across the post's face, is a click on the gate,
   from any side). A gate pulled shut swings to on a long, squealing iron hinge before it clangs into its post. The two good padlocks lie apart, each in a place of its own, and are
   found and picked up one at a time; one key opens both. A third padlock is rusted solid:
   pressed down on the chain it will not snap shut, and drops. A chain thrown round a gate still swinging shut rides on its end and is knocked off to
   the ground as the gate meets its post (clicked as it is about to shut, it goes on as it shuts), and a shut gate with nothing to hold it, pushed, swings out a little
   and falls back shut. Every glance away costs you. The gates are barred right
   across with thin iron bars, too close for it to get through and far enough apart that you
   can watch it through a shut one. Lock the gate it is coming to and it
   tries it, then runs round the outside of the yard to the other one, but only while
   nothing is looking: catch it going round and it stops dead, mid-stride. At the end it
   comes on only when you blink, up to the gate, and shakes it on its chain.
   Easter egg: win a staring contest. Look at it for a full minute (60 s) without once looking away or
   letting it out of view, while it faces you with its eyes showing (reaching, screaming or pointing, its head in the
   view; not with its hands over its face, and not side-on going round), and it blinks first: two quick blinks of its
   stone lids, a third that stays shut, its fists up to rub its eyes with a little grind of stone, and then it is at once
   exactly as it was, in the same pose, where it stood (about 2.9 s; 3.5 s, slower and gentler, with reduced motion).
   Nothing else comes of it. Look away while it is at it and it is over at once; it can be done again after another full
   minute.
5. **The Clearing.** Something that sprints at you, fast, drops to all fours to watch, and
   sprints again (down on all fours it creeps from side to side on its hands and feet, never gliding); out in the open it keeps breaking sideways to a new place, running side on
   and closing as it goes, so it is seldom where you last saw it. The bow is on the porch, and its three arrows lie about, each in a
   place of its own (driven into the wall or a post, along a rail, on the woodpile, the
   crate or the boards, stood against the wall); picked up, they go together in one slot,
   "Arrows ×2". Hold the button (or a finger on the view, or A) to draw. A power bar fills
   beside your aim, and when it tops out it is full: it turns green and says so, the string
   comes tight with a click and shines, the bow bent hard back, and it stays full for as long as
   you hold it. Let go full with it in your sights and the arrow goes in, however far off it
   is (the further, the smaller it is to aim at). Let go before full and the arrow drops into
   the snow short of it; full but off it, it misses. A click looses nothing: the bow comes up
   and is let down again. The first hit puts it all the way down: out of a sprint its knees give and it topples
   sideways into the snow (side on, it pitches forward and skids; on all fours, its arms go from under it and it rolls
   over), lies there flat for about a second, bleeding, then lifts its head to you, plants a hand, pushes itself up onto
   its hands and feet and comes on again, a little over two seconds after it was hit. There is no second arrow while it
   lies there: a draw begun too soon after the first hit comes back slower (the bar fills over longer), and is full
   only once it has got up and run about for a second or so; drawn on while it is down, it takes note as it gets up
   (and may break away then). A draw begun after that takes its usual second and a half. The second hit puts it down.
   Hit, its body twitches, small sharp jerks of its limbs and trunk, the arrows in it shaking with it; dead in the
   snow, the jerks die away over a few seconds (with reduced motion, they are barely there).
   The first shot is the easier one, the second the harder. Unhurt it is bold: while the bow is drawn on it, it holds
   its line (it does not break away by itself, and its weave narrows), and only about one draw in eight (a click that
   only lifts the bow does not count) makes it break sideways to a new place, running side on as it does in the tree
   line, and drop to watch from there; it does not do it twice within a few seconds, nor once it is close. With an
   arrow in it, it is wary: it comes on faster and never straight, weaving wide, quick and unevenly, breaking to one
   side every second or two by itself and from about every other draw, so the aim has to come after it; inside about
   14 m it comes straight. With all three arrows gone and it still up, it comes flat out, straight. Three small
   bats flit about the night sky over the clearing, faint against it and easy to miss; one can be shot (drawn full and
   let go on it: a small, restless target, and the thing itself always comes first), and it squeaks and tumbles out of
   the sky with the arrow through it. That is this night's easter egg, and it costs the arrow. The bow floats where
   your hands would hold it. Pressed with no arrows, the bow comes up and tips to show the bare shelf,
   the string is plucked twice where an arrow should sit and twitches on nothing, and it is let down; an arrow clicked at it with no bow is raised to shoot, finds nothing to sit on,
   and drops head first to the boards at your feet, where you have to pick it up again. When it reaches you it comes
   up out of its sprint into your face, its few lank strands of hair standing on end.
6. **The Boathouse.** Something swims in across the water, going under for a
   while and coming up closer. It rains outside, never under the roof: the rain shows only out through the water door
   (above the slats let down) and the side door while it stands open (not through its leaf). A lamp on the far shore shows through the water door as a small soft glow. The winch is chained and padlocked: the key is in the
   tackle box. Crank the water door down, and shut the side door and bar it with both oars
   of the upturned rowboat (painted white, a little worn, with a red sheer strake and a red keel), which lie about the boathouse each in a place of its own (lying on the deck or leaning
   on the wall, each as long as it is across the door): one
   across the iron brackets, then the other on top of it (the door or either bracket will do).
   One oar alone is not enough: it throws itself at the door, the oar snaps, the door bursts
   open and it has you ("One oar wasn't strong enough."). Shut one way first and, once it has been held
   there a moment, it goes under, swims round and comes across into the other side on.
   With both shut it throws itself at the door it came to, harder and faster, the boards
   bowing in and the water coming in under them, until it lets go and goes under. Tried too
   soon, the winch answers in iron: an empty hand rattles the padlock on its chain, the handle
   put on the boss snaps the chain taut (the padlock jumps) and comes back to your hand, the
   oar's end jams at the boss and it clatters to the deck, and with the padlock off but no
   handle the wheel moves a hair under your hand and no further. The key goes into the padlock
   before it springs open. An oar put up while the side door is still swinging shut is knocked
   back into your hands by the leaf. When it gets you it bursts up out of the water at your
   face with a body under its head, a mass of dark swampy weed hanging in dripping strands, and two thin weed-draped
   arms reaching up out of the water at you, the hooked fingers spread. The water moves as the lighthouse's sea does
   when something goes in: a heap of white thrown up and falling back, rings of foam spreading on the water, spray dragged
   up after it and flung off it, each drop on its own arc, and water streaming off its face and shoulders.
7. **The Lighthouse.** The lamp is out and something is clinging to the outside of
   the tower, climbing the wet stone hand over hand; you see it by looking over the rail,
   and it climbs faster while you do not. Put the spare bulb in the lamp, open the fuse
   box (bolted to its stanchion on an iron wedge, turned toward you), pull the blown fuse and put in the new one from
   the toolbox (the only good fuse there is), and turn the crank so
   the beam goes round: its first pass knocks it sliding back down the wall, and the next
   knocks it off the tower, to fall all the way down into the sea. The lamp turns with the
   crank, lit or dark. The night's easter egg: once the new fuse is out of the toolbox, the toolbox itself can be taken
   up (heavy, held open in front of you), and with it in hand a click on the thing, looking over the rail at it, lets it
   go over the rail on the line straight down to it. The tower flares out below the gallery, so it hits the stone and
   comes down the wall, tumbling and banging, spilling a spanner and a screwdriver. If the thing is no more than about
   8 m below the gallery floor (the hover says "Drop the toolbox on it."), the box catches it full in its upturned face
   with a clonk: its head snaps round, one hand and both feet come off the stone and it hangs by the other arm,
   swinging, for about a second; then it swings back in, hooks on again and climbs on from where it was (stopped there
   for under two seconds in all), and from then on it has a black eye, one eye swollen all but shut and purple-black
   round it, on the wall and in your face if it gets you. It is not a win: the toolbox bounces off into the sea and the
   night goes on. Further down (the hover says "Too far down.") the box, going faster and faster, kicks out off the
   stone, goes past it out over the water and into the sea, and is gone. Across the water the lights of a town show low
   on the horizon, each a small soft glow. A fuse tried with the blown one still in knocks against it and comes
   back to your hand; the blown fuse you pulled, pushed back into the empty clips, sits there a beat with nothing
   coming on and drops out onto the floor. A storm is on: now and then the lightning flashes, and a second or few later
   the thunder comes; as it sounds the view lifts a little toward a cold blue-white, a flicker as the rumble comes in and
   a stronger one with the crack, dying away in a second (with reduced flashing, one soft swell a third as strong).
8. **The Diner.** Something tall is out in the lot, taller than a man should be: a long
   belted trenchcoat in a dull dark drab, its collar turned up, grey hands hanging at its sides,
   and a hat with its brim pulled low. Under the brim there is no face, only shadow, black
   whatever light is on it: all that shows is the bottom of a grey face and a thin grin of
   small white teeth, chewing, slowly and a little, and quicker whenever it is on the move.
   It stands bolt upright and dead still, nothing swinging; it comes
   on in stiff steps, and now and then its feet stop and it slides on anyway, while its
   head lays itself slowly over to one side and slowly over to the other, hat and all. At the glass its
   hands come up flat on it either side of its face, peering in under the brim; when it runs it skips,
   the skirt of its coat flying out behind, its arms hanging
   dead straight, its head turned to you; coming at you, the mouth comes apart, the jaw
   dropping far further than a jaw goes. It is drawn to the light: while the
   lights are on it comes fast, too fast to shutter every window. Throw the power main
   on the back wall in the first ten seconds or so (your hand takes the lever and pulls it
   down, and the lights go with it), find the crank (without it, your hand tries a
   window's gearbox and it will not move), and crank all three
   shutters down. The main goes back on as well, whenever you like and as often as you like: a click on it
   while it is off and your hand pushes the lever back up, and every light comes back with it (the tubes
   striking, a blink, a blink, and on; the OPEN sign, the fountain's header, the main's own green lamp; the hum
   of the place, its powered bed again; with Reduced flashing the lights go and come back at once, no stutter).
   From the moment the lights are really on it is drawn in by them again, at the pace it has in the light
   (the whole lot in seventeen seconds, wherever it has got to; a run to another window that it is in the middle
   of quickens there and then, as it slows there and then when the main is thrown), and if it has you with
   the lights on the card reads "It was drawn in by the light." however long they were off before. It slows
   from the click when the main is thrown, and quickens only once the lever is over and the lights are on: both
   ways, the moment in between is yours. The main's hover line says which way it stands and what a click does
   (without hints, "Main switch", or "Main switch: off").
   The crank is drawn from the side wherever it is not in a gearbox (in its slot, in the hand, lying on the floor or a
   counter): an L of bright steel edged dark, the arm, the red grip square off one end of it (a round bar, its
   far end rounded, against a steel collar) and, off the other end and the other way, the short shaft that goes
   into a gearbox's eye, its tip cut down to a key. Put to a gearbox it leaves the hand (it goes toward the eye
   and is given up there, as a thing used up is) and is drawn in the eye from the front, going once round with
   every turn, its shaft in the eye and its grip pointing out at you, end on; while it is in a gearbox the hand
   does not hold it, and 0.9 s after its last turn it comes back out of the eye up into the hand, as a thing
   picked up does: there is only ever one of it.
   Each time its window shuts it turns side on (stiffly, on the spot, as a
   solid figure turns, never squeezing thin) and skips to one still
   open, along the glass if it is already there, across the lot if not. If it reaches an
   open window it comes through the glass. If it reaches one whose shutter is only part
   way down, it takes the bottom edge in both hands (jumping for it and hanging there if
   even its long arms cannot reach it, with the shutter barely started down; the crank will not turn against it), tugs, and shoves it up: the
   steel slams into its housing with a crash that shakes the place, every turn of the
   crank on it is lost, and it comes through the glass. A shutter all the way down holds
   it. With the last shutter down it runs up to it
   and beats on it, hard and fast, until the night fades.
   There is a soda fountain behind you, on a cabinet against the back wall on the other side of the kitchen pass from
   the main (a lit red Soda header, three valves over a dark well, a drip tray, and a little window that says EMPTY,
   dark), and a row of plain paper cups along the shelf on the back wall, all alike: one of them (and only that one)
   can be taken, and nothing marks which. Nothing says either does
   anything: the fountain cannot be pointed at (no pointer, no line, nothing the view can hit) until the cup is in hand,
   and the counter's top not until the cup in hand is full. With the cup, the fountain pours it full, fizzing, the cup
   held under the nozzle (in hand it shows dark cola under a head of foam); full, a click on the counter sets it on the
   far side, across from where you clicked and clear of the register, the napkins, the bottles and the pie. Thrown
   main or not, it is optional and costs nothing else (the cup is a tool, and the crank comes back into the hand for a
   shutter); with the main thrown the fountain's header goes dark, but it still pours. But if it comes through the glass
   (the glass breaking with the same sound as when it comes through for you), lit or in the dark, and the full cup is
   standing on the counter, it does not come for you: it walks in to the counter across from the cup, takes it up, tips it to its mouth
   and drinks it off in three gulps, and sets it down again, empty. Then it pounds the counter, one fist and slowly at
   first, then both, faster and harder, the cup jumping at every blow, its head snapping over and its body shuddering,
   its teeth bared. Refill it (pick the cup up, the fountain, the counter) within nine seconds and it drinks that too and
   starts again, with eight seconds this time. Tried a third time, the fountain coughs and sputters, EMPTY blinks red on
   its front (with the power on), and it goes into a flurry of blows and has you; and if it waits too long, it has you anyway. Either way,
   it is insatiable ("Nice try"). Its first gulp is the night's easter egg found ("Serve the customer a drink."):
   kept in the save there and then (`foundEgg`), whatever happens after.
9. **The Phone Booth.** It is raining and something is coming toward the booth, up the main street or along the far
   pavement of the cross street from the east: a shade, far too tall and far too thin, all one dark, its body and its long
   arms and legs one shadow with no clothes and no edges to it, so that most of the time all you see of it is two small
   pale points, its eyes. It carries no light. The street lamps stand along its way, and it starts at the very last of
   them, the furthest down its street, and goes from one to the next, every one: it stands behind a lamp, peering round
   the post, utterly still for a few seconds, and even in that light there is no face to it, only the two pale points of
   its eyes and a faint rim of light along its shoulder; then its arm unspools up out of it,
   the same shadow, impossibly long, to the lamp's head and breaks it (a pop and a white flare, glass and sparks coming
   down), and it stutters and is out for good (under a lamp there is only the pool of its light on the ground round the
   post). In the dark it skitters on, low and fast on all four
   of its long limbs like a spider, to the next lamp nearer the booth, waits, breaks that, and so on to the last; then it
   walks across to the glass. With every lamp to get through it is quick about all of it, and its whole way in takes as
   long as its steady walk used to, so the race is the same. Only coming at you does a face come out of the dark into
   yours: its whole head splits open into five petals lined with teeth, and out of the throat in the middle ring after ring of teeth keeps coming up and out toward you, while long black tentacles
   unfurl all round behind it, waving, more of them out from behind the maw between its petals, and two that come round
   from its shoulders and curl in at your face from either side (its own black, a faint cold rim along their edges; they
   wave slowly with reduced motion). The pay phone, a slim unit a size smaller than life on a backboard no wider than itself,
   stands across the corner of the booth between the two streets, the glass clear either side of it, so while you use it
   both streets are at the edges of the view and you see it coming out of the corner of your eye. Your notebook lies shut
   on the little shelf under the phone. Click it and its cover goes back over the
   spiral; click again and the page is lifted by its corner and turned over, and a click on the last page shuts it. Nothing
   is done to the view: you look down at it and hold the zoom to read it, and it stays open where it lies when you turn
   away. Find the number in it (it has a page to itself, always page 3, 4 or 5, scrawled large across it in red
   that has run, as if in blood, in a hurry) and a coin (in the coin return, on the shelf or on the
   floor by the panes near the phone), then do what the card under the keys says, in big bold words you can read from
   where you stand (LIFT PHONE, INSERT COIN, DIAL NUMBER): lift the receiver, put
   the coin in and dial on the phone's own keys. Lifted, the receiver is in your left hand, its armoured cord running from
   the bottom of the phone down in a loop and up into the bottom of the receiver (wherever you look, it meets it), and
   your right hand presses each key with a fingertip, going from key to key as you dial (what it held goes
   down meanwhile; keys pressed faster than it can go are pressed in turn); a key goes down when the finger gets there, and
   one the phone will not take only clicks, the display blinking its credit at you (or NOT IN SERVICE). A coin put in with
   the receiver on its hook goes from your fingers into the slot, rattles down through the works and drops into the coin
   return, to be taken out again. It rings for seven seconds before anyone
   answers, and it keeps coming the whole time. A wrong number is not in service, and
   hanging up drops the coin back into the coin return. When someone answers, a car comes
   down its street and pulls up at the curb for you; the moment it starts coming, the shade scurries off
   the road, low and fast, behind the nearest lamp post on its street, and stands there still, looking back
   at you, until the car has pulled up and its door swings open; only then does it turn its back and walk off down the
   pavement the way it came, never in the car's way. The rain falls outside the booth only: it is seen out through the
   glass and never inside it, nor over the pay phone across the corner. If it gets to you
   first, the pane between you goes as it hits: cracks run out across it to the frame, then as it
   comes through the middle bursts in with a flash and the pieces fly in at you, turning, and
   drop (fewer, and only falling, with reduced motion; the flash held down with reduced flash).
   There is also 911 (lift the receiver and press 9, 1, 1; with no coin in, as an emergency call is free on any pay
   phone, or with one): it rings once and a dispatcher answers, a crackle of a voice (this is the night's easter egg,
   "Call 911.", kept in the save from the moment she answers). While the shade has still to get to its last lamp she has
   three lines, one after another, each with its crackle and a beat between them for what you say back, which is not
   heard: "911, what is your emergency?", "a WHAT?", "Ok, stay there. I'm sending a unit now."; and with the last the
   police are sent. Once the shade is at its last lamp, or past it, she says only that last line, at once. Hang up while
   she is still talking and she is cut off: the rest is not said and no car is sent (call again and she starts over).
   Nothing comes
   until the shade has got to the last lamp on its way in (called once it is past it, they come at once, and it skitters
   back behind that post). Then a police car comes tearing down its street, black and white with a gold star on its
   doors, its siren wailing and its light bar flashing red and blue on the wet street (with reduced flashing the bar
   swells slowly from red to blue and back instead), and screeches to a halt on the road beside that lamp post, its nose
   dipping, black rubber left on the road. The siren winds down. A flashlight comes on at its window, sweeps in and finds
   the shade: a beam through the rain, a pool of light round its feet and on the wall behind, a pale light down its side
   and its eyes shining back. In that light it convulses for a second, with a shriek tearing upward: thrown over at the
   waist one way and the other, its spine kinked, one shoulder up and the other down, its knees buckling, its elbows out
   and its forearms flung about from them at wrong angles, its head snapping from side to side and its jaw dropping out
   of it, every joint jerked somewhere new several times a second, and the first of its tentacles squirming out of its
   back. Then it springs out of that, out in front of the post at the car, with a snarl, shrill and gravelly (the demon's
   growl of the last night, far up: popping the lamp over it if
   it still burns), upright and leaning at it, one arm out at it and the other up over its head, its head split open into
   its petals of teeth, turned to the car, and long black tentacles unfurling out of its back and shoulders, waving: a
   fan of them behind it, one up over its head and one out low at the car. The flashlight goes off, and the car slams its foot down: its back tyres spin,
   smoking and squealing, and it fishtails away down the road (on round the corner and off along the cross street from
   the main street; on past the booth and away west, wide of the parked car, along the cross street), keeping to the road,
   until it is out of sight. The shade shuts, its tentacles drawing back into it, and comes on for you from where it stands. (With reduced flashing the
   flashlight comes and goes smoothly; with reduced motion the shade does not leap, its convulsion is a slow writhe that
   comes on gently, its tentacles wave slowly and the car hardly swerves.) Should the
   right number be answered while the police are there, the shade sees them off first, and the car that comes for you
   comes once they have gone; answered before they have come, they never come. The line stays open to the dispatcher
   until you hang up (keys do nothing meanwhile), and then the phone is as it was: a coin put in for the call comes back,
   and the right number still brings the car. The police come once a night; 911 again, once they have been sent, gets a dispatcher who says a car
   has already been sent. Caught after calling them, the screen says "Nice try": "The police can't help
   you here." A 9 pressed with no coin in is taken; any key that is not the rest of 911 wipes it (and clicks as a key with no
   credit does), as does a coin put in, so the right number dialled after is never spoiled.
10. **The Mirror Maze.** A porcelain doll is always behind you and you only ever see
    it in the glass. The night has a clock: it comes on all night, steadily while the mirror you face does not show it,
    and more slowly held in the glass, where it comes a step nearer in the snap of each move of its dance and is dead still
    between them, so its reflections creep in from well back in every mirror, a little larger with every snap, and doing
    nothing is always the end of you (about a minute and a half for a player who spends half the night facing a mirror;
    two and a half minutes standing still square on before a live one, about one never facing one). In every glass it dances on the spot, a
    wind-up doll's dance, every move snapped into all at once and then held dead still a long
    beat before the next (an arm going up and coming down, a wrist flopping over, a knee
    coming up, a leg kicked out to the side, the head snapping over to one side, a lean from
    one foot onto the other), in step in all of them. Every move is lopsided, even its
    waiting stance (one foot set out to the side) and the move with both forearms jerked up
    together (one leg kicked out). One of the four mirrors is not like the others: in it the
    doll dances the other way round, the mirror image of the rest (the arm the others raise,
    it raises on the other side, the leg they kick out it kicks out on the other side, and
    its head goes over the other way; which arm the others
    raise changes from one load to the next, so only comparing tells). The mirrors are
    otherwise alike, and two are under dust sheets. The music box lies in one place and its
    crank in another. Any pedestal takes the box, sitting square on its top with its front to
    you and its lid open, and the crank fits its front on any of them,
    but its tune plays only before the odd mirror: there each turn plays a few notes of it,
    and on the last the doll stops dancing, turns round once on the spot like the dancer on
    the box, and comes running out through the glass for the box, smiling, lifts it off the
    pedestal and takes it back in with it. Before any other mirror the first turn plays wrong
    notes and the crank sticks; in the glass the doll stops dancing dead, upset with you: its
    face crumples into weeping (the painted brows up in the middle, the glass eyes gone red,
    red tears down its cheeks, its mouth pulled down into an open, trembling sob), its head
    bowed over to one side and its shoulders heaving, and behind you it takes three quick steps, three tenths of its whole
    way in at once (never right up to you), so a couple of wrong tries can lose the night; it dances again once its temper has gone. The next click on the box
    lifts it back off, its crank still in it, to put before another mirror. Before the crank
    is in, a click on the box takes it back too, unless you are holding the crank (then the
    click fits it). It is your hand on the crank, turn by turn; when it jams the box jumps on the pedestal and the hand
    wrenches at it, and the box taken back comes up off the pedestal into your hand. The crank tried on a pedestal with no
    box on it feels about the bare top for something to fit and comes back to your hand; with nothing in hand, the hand
    goes out to the empty top. A dust sheet is pulled down by hand and slides off the glass into a heap.
    If it reaches you, it comes at you weeping, whatever it was before: the red eyes and the red tears all the way in to
    your face, the sob opening into a wail and its hands coming up as it lunges. After a wrong mirror the card reads "You
    played for an illusion. The creature surprised you from behind."; caught without the box ever having played, "It
    just wants to hear its song."
    The dust sheets go back up. A sheet pulled down lies in a heap at the foot of its glass; a click on the heap (either
    side of the pedestal) takes it up, a bundle of pale cloth in your hand, and two more lie folded on the floor under the
    lamp's table (always there: they take no roll of the night's dice, so the box and the crank lie where they always
    did). A click on a bare mirror with a sheet in hand throws it up over the glass, where it hangs as the first two did
    and can be pulled down again. A covered mirror shows nothing, so standing before one counts as looking away (it
    comes on at its unseen pace), and the box plays before a covered odd mirror as it always did (the tune pulls the
    sheet off). The night's easter egg ("Cover every mirror."): the moment all four are under sheets the night is over.
    The last sheet settles and the room is dead quiet for a second; then in that sheet its face presses out through the
    cloth from inside (the swell of its head, its brow, the hollows of its eyes, its nose, its mouth opening), a hand
    either side of it, fingers spread, the cloth stretched toward you and creaking, its sob rising to a wail, the other
    three sheets bulging with its face too (and they stay so); at 2.9 s that same face and those hands come at you as
    they are, in the cloth: the night's usual lunge (0.55 s, the same sting), but what lunges is the sheet with it
    inside. The moulded face grows toward your eye, its mouth dropping open, a cloth-covered hand reaching either side,
    and the rest of the sheet is dragged along behind them: pulled out into a cone with its edges still on the frame,
    then off the mirror altogether, rounding into a ring of folds that run out from the face to the hem, the hem flaring
    and rippling like a shroud, until the cloth is past every edge of the view. The doll itself is never seen, and no
    sheet is left on that mirror ("Nice try": "It does not like to be ignored."). Nothing can be pressed meanwhile (it
    is the death, from the moment the sheet goes up). With reduced motion the cloth bulges less and does not tremble,
    the sheet flares less and does not ripple, and nothing shakes.
11. **The Farm.** You stand in the yard by the farm's electrical box, the house at your back with its porch light on,
    facing the barn: the night always starts that way, wherever the thing is, and finding it is part of it (the card
    does not say where it is coming from). Round you in a ring, at the compass points, are the farm's places, each with
    a floodlight of its own and all of them dark: the tractor shed (SW), the shed (W), the stables (NW), the barn (N), the
    silo (NE), the coop (E) and the driveway (SE); each has a neighbour either side, and the driveway and the tractor shed
    meet behind the house. The yard is grass all round, and the porch light lays a smooth pool of warm light on it. The
    box is on its post at your left hand, its top at your chest: turn left from the barn to face the stables and it is
    right there in the middle of the view, under the stables (too low to hide them), its front square to you, its main
    breaker at the foot of the view as you look ahead (look down for the rest: this night looks down less than the
    others, to keep the whole box in view, a little below the middle). Zoom on it (held, or the zoom button on) closes in only as far as keeps
    the whole box and every label on it in view, clear of the compass (the night's own zoom level, `L.heldZoom`, which the
    game eases to as to any zoom: smooth, no bounce); looking anywhere else it zooms as usual. It stands open, with no door, on the MAIN breaker across the top, a big lever over to
    ON with a green lamp beside it, and under it two rows of big toggle switches, each with a red pilot lamp and a strip of tape with the place
    written on it in marker (HOUSE, then the places in order round from the tractor shed); a click flips one, up is on.
    Each strip of tape is on a little plate that stands out from the panel under its switch, tipped back 32 degrees to
    face up at you (a shadow under it on the panel), so its writing is read nearly square on, not squashed as the
    panel is, seen from above; the box is wide enough (0.58 m) that every label, the longest (DRIVEWAY) and the
    outermost, sits inside the panel's pale plate with room to spare, looking down at it and zoomed in
    (`test/nights/night11.js` puts each label's tape and writing on the view and measures them against the plate).
    The panel and its parts are fixed flat on the front of the box, so they stay where they are drawn however you look
    (the tipped labels too: the eye never moves, so each is drawn on the panel where it is seen from the eye, and a
    click on a label is a click on its switch).
    Something bent under a bundle stands in the dark at the foot of one place, all but black, two pale points of eyes;
    its mouth is sewn shut with thick crosses of twine over a patch of burlap. It cannot stand the light:
    light its place and it throws an arm over its face and runs, side on, to a neighbouring place that is dark, at the
    same distance from you. Light both its neighbours and then its own place and it has nowhere dark to go: it shrieks,
    the stitches of its mouth tearing, its knees go, and it comes apart in the light, sacking and straw. The box takes
    three lights at once: a fourth trips the main with a bang and sparks, the main snaps over to OFF, every switch drops to
    off and every light on the farm goes out (the porch light too). Nothing comes on again until the main is pushed back
    over to ON, and all the while it comes for you through the dark, at its own pace (caught that way, the card reads
    "The power tripped, and it came for you in the dark."). With the main off the switches can
    still be set, up or down (each lever stands where it is set; no pilot lamp lights and nothing comes on): pushed back
    on, the main brings on whatever is set with it, as if each had been switched on there and then, so three or fewer
    come on (and with its place and both its neighbours set, it is caught the moment they do: a way to win), and more
    than three trip it straight back off again, sparks, every switch dropping and every light going out, as before.
    You can push the main over to OFF yourself, too, whenever you like (a click on it while it is on): every light on
    the farm goes out, the porch light with them, but the switches stay where they are set (no sparks, nothing drops),
    and pushed back on it brings on what is set by the same rules (three or fewer light, four to seven trip it, all
    eight set the farm alight). To the thing the main off by hand is the dark, as when it trips: it stops flinching
    from a light that has gone out, and comes in for you at its own pace, all the way, the porch light no longer
    keeping it off; caught that way, the card reads "You put the main off. In the dark, it came for you." While the porch light is on it creeps in no nearer than the edge of that light and waits there;
    with it off, it comes all the way. So the porch light has to go off before the trap, and then there is not long. If it
    reaches you, it is lit up in your face however dark it is: the stitches pulling wide, two of them snapping, its teeth
    showing through.
    Every switch set with the main off, the porch light too, and the main pushed on: the box was not built for that. It
    bursts with a cracking bang (shake; a flash, not with Reduced flashing) in a spray of sparks, every lamp on the farm
    flares for 0.3 s and blows, and big glowing sparks fly out of it in high arcs, trailing, one to every place, one to
    the house and one to the thing (0.5 to 1.7 s, the further the later). Each catches where its spark lands, the fire
    running out over it from there (flickering flames on its front, roof and doors, each growing over 1.1 s, the whole
    place over 2.2 s; smoke rolling up off it and embers going up; its light out over the yard and on the ground before
    it, and its glow), and the box itself goes up at once, spitting sparks. Every flame stands on something: its foot
    fades in softly (no hard flat line along the bottom of it) and sits on a wall, a roof just under its edge, a door,
    the pickup or the ground, kept in from the edges by its own width, so none hangs off a corner or an eave into the
    air from wherever you look (`test/nights/night11.js` checks every foot against the building behind it). The sky and the haze go red, the fire roars
    and crackles all round. The thing, its spark on it, goes up (the fire taking it from its middle out, scorching it
    near black), shrieking, and runs flat out about the open yard where you are looking, side on, flames streaming
    back off it and an arm beating at them over its head (the bundle let go of, nothing on its front) (round you, never through you, and in front of the house, not
    through it; out of sight it tears round faster to where you are looking), until you have had about 3 s of it in
    view (9 s at most). Then it stops, faces you, both arms flailing over its head (0.6 s), and charges straight in at
    8.5 m/s, arms reaching, and has you, burning (its face clear of the flames in the lunge). The flames on it have their
    feet on it in every pose: those on its front low on its body, kept in from its edges, and the fire over its head
    and shoulders rising from behind it, its feet hidden behind its body, so nothing floats over its head. The card reads
    "Apparently the electrical box wasn't rated for that." The box bursting is the night's easter egg found
    ("Overload the electrical box."): kept in the save there and then (`foundEgg`), long before it has you. Its sounds: the box bursting, each place catching, the
    crackle (its caption soft), the fire's roar (a loop, louder as more burns), its burning shrieks and its own sting.
    Reduced motion: the flames flicker slower and sway less.
12. **The Bedroom.** You are in bed. It is already there, in the hall beyond the doorway
    or in the closet (in front of the clothes on the rail), behind the wall at the side of
    the opening: at first only its head leans out round the edge, its fingers curled round
    the frame (its arm stays behind the wall; having its head in view counts as watching
    it). The night's card shows it just so, and it is still there when you begin. Then it
    glides out into the room, in extreme slow motion: round the edge of the opening and on
    toward the bed along the same way, slow and even however far ahead its clock runs, with
    nothing sudden in it, its feet stepping softly under it; its fingers slide back off the
    frame as it goes, and it stoops under the top of the frame until it is through. On
    Nightmare, once, early and unseen, it changes its way: it glides round the foot of the
    bed to the other way in, setting off with three quick, heavy thumping footsteps (the
    running step), panned from where it was to where it goes. (`test/nights/night12.js` watches every frame
    from your eye: nothing of it, body, head, hands or feet, jumps.) It is all but black, even
    in the lamp's light; only its two pale eyes show. It
    cannot stand the light: when the lamp comes on it lifts an arm across its face and
    folds down onto its haunches out of sight, keeps low (out in the open, a dark shape
    crawling along the floor on its hands and feet, its two pale eyes on you all the way) to the bed, and comes up at the foot of it (or at its
    side, out of the closet) until only its eyes are over the edge. Lit while it is still
    behind the wall or in the opening, it first goes along behind the wall to the middle of the
    frame and comes straight out through the middle of it before it turns for the bed, so it never
    goes through the wall, the frame or the closet's doors (the same way when it rips the covers away). It is always drawn
    whole, and drawn before the bed, so the bed hides whatever of it is behind the bed.
    Then its long hands snatch up over the edge onto the covers, and pull: one and then
    the other, each reaching on up the bed with its
    fingers spread, closing on the cloth and dragging it back, the covers jerking, every
    pull nearer to you. Pull the covers up before they reach you; if they do, it comes up the
    bed after them. The lamp must come
    first: pulled up in the dark, the covers do not save you; it is at the bed all at once,
    takes hold of them, rips them down off you and is in your face ("It pulled the covers
    away. It is strong in the dark."). If the lamp burns
    out before the covers are up (it flickers first), its hands let go and it rises again
    from behind the bed and comes on; one pull of the chain brings the light back, and it
    goes down again. When it has you, its hands shoot out over the bed and take hold of you;
    then all at once its face is right in front of yours, its head twitching, and its head
    swells out over everything until the black of it is all there is. Your hand
    pulls the lamp's chain (nothing comes of it with no bulb in, and the line is "It's missing something."; nor
    with the cord out; and it sticks),
    opens the drawer, pushes the plug in and is on the covers' hem as you hold them; the wrong
    bulb will not go into the socket and drops onto the bed, to be taken again. Then they
    come up over your eyes and the rest happens under them, the cloth hanging in long folds:
    its steps to the bed, the shadows of its two hands coming up onto the lamp-lit cloth and
    taking hold as they did on the bed, three hard pulls (one hand, the other, then both)
    that the covers hold; then its hands let go and sink away, and its steps go away.
13. **The Void.** Your hands are empty, and everything you ever held against it lies
    around you, within reach. It comes in a black hooded robe, nothing of its face to be
    seen in the dark of the hood but two small pale eyes. Take up anything and it is
    enraged: its eyes burn red, a snarling mouth opens under them, it screeches (again and
    again, more often and wilder the more you hold; quiet again once you hold nothing), and it
    comes on in fits, stopping dead, lurching, jerking aside, its head twitching. Holding anything when it
    reaches you is a death. The bow still comes up as it did in the Clearing (with the bow or
    the arrows in your hand), and holding draws it, but here it is never loosed: drawn at, it
    comes for you, slowly and then faster and faster as the string comes back, more and more
    enraged, and it is on you before the bow is full ("Fighting only made it stronger."; never
    the ending). Let go early and the bow only comes back down, no arrow gone, and it comes on
    at its own pace again. However it comes (enraged and taller, holding anything or rushing
    you as the bow is drawn, or calm), it bends over toward you as it nears, its shoulders
    hunched, as far as keeps its face in the view as you look ahead at it, all the way in and
    up through its death lunge (on a phone held sideways too). Far off its eyes are two points a pixel or so across, set as far
    apart on its head as they always are, with no haze round them.
    Put it all down again (each falls from your hand to the floor;
    reach for another with your hands full and the full hand only goes toward it) and it
    calms. Let it come, and face it when it does: empty-handed, it bends down to you over the
    last few metres (its head stays in the view) and the view lifts to its face.
    Turned away from it, or looking at the floor, when it reaches you is a death too; doing
    nothing at all, facing it as the night starts, is always the ending (on Nightmare it may
    change its way once, unseen, far out, but never once it is within 12 m). Faced
    empty-handed, it stops close in front of you, bent down to your face, and lifts its arms,
    the hands open high either side of its head; quick, it reaches out and takes hold of you,
    as the tall thing in the bedroom did: its arms come at you out of the bottom of the view,
    its hands low in the corners gripping the bottom edge of the view, the faintest soft glow
    of its light about the dark arms and hands; and only once its hands are there does its face
    come up out of the dark of the hood, angry. All through the night in the void a faint
    cold light stands straight behind it, soft and wide (far wider than it is, so wider in the
    view as it nears, and falling off gently with no edge), so its dark shape reads against
    the black, until the pale light comes.
    Holding you, its face goes slowly through angry (its eyes round and burning red, square
    teeth, the top row uneven; a deep, gravelly growl as it comes up out of the hood),
    neutral, angry (growling again, leaning right in at you, its face filling the view, then
    drawing back), confused, the same confused face mirrored (going smoothly over, its head
    righting itself and tipping the other way, each held as long as the other; then,
    glitching, a flicker of faces under a second: pain, envy, sorrow, grimace,
    terror, empty, shock; with reduced motion no glitch, but pain, sorrow, terror and empty
    each fading slowly into the next, and every change of face a slow fade) and sad; it cries a while, its shoulders
    heaving, still holding you; its head goes down, bowed toward the ground, its face lost in
    the shadow of the hood, and it cries on a few seconds more, sobbing, its tears dropping
    out of the dark of the hood; then it stops, and for a moment it is still and quiet. Then all at
    once it throws its head back, its face enraged, screeching (its own screech, a blow under
    it, the view shaken and a soft white flash), and all round it in the dark, at once and big,
    are the faces of every thing that came for you before, each as it was coming up into your
    face in its death lunge, jittering and glitching (each drawn alone, once, while it held its
    first faces, from its own night built again, whether or not you played it; a face that
    could not be drawn is simply not there). It was this one all along. Nearly two seconds
    later it takes them back: one after another they fly into the opening of its hood, turning and
    shrinking to nothing, with a rush of air drawn in, and its face is its grey neutral face
    again, a few seconds, in the dark. Confused, and confused the other way (as before, the
    one going smoothly into the other, each held as long) as the dark opens into a pale light; it is
    content, and happy, and the meadow (wild flowers, trees, clouds, birdsong and a breeze)
    comes out of the pale void, turning round you and settling into place in the sun; then it
    lets you go and steps back. With reduced motion its head lifts slowly and not as far, the
    view is not shaken, the faces fade in and out where they are, and the meadow simply comes;
    with reduced flashing there is no flash and the faces are dimmer.
    As a music box starts it pushes its hood back, lets the robe
    drop, the long sleeves and black gloves sliding off its arms, and hops clear of the heap
    of black cloth: underneath it wears a yellow shirt striped sky blue, red shorts, white
    socks and blue sneakers, and it dances a little beside the robe on the grass. The view is yours again there: turn, look down and zoom as in
    any night, for as long as you like; only if you do nothing at all for five seconds does a
    small line say CLICK WHEN YOU ARE READY.
    The night's easter egg ("Take up everything."): have every one of the sixteen things in
    your hand at least once in the same attempt. Your hands hold six, so some must be put
    down again to take up the rest, while it comes on enraged; a thing taken up twice counts
    once, and a full hand reaching for a seventh takes nothing. The moment the last thing not
    yet taken is in your hand the night is won another way (the easter egg is saved then, and
    the run's clock stops as at any win): it stops where it is and backs off into the dark,
    the view is taken (level, to the north), and out of the dark each of the twelve others,
    in the order of their nights, 0.7 s apart, rushes up to you along its own way (half a
    second, to under two metres, with its own steps and voice and a jolt of the view), takes
    what was its own out of your hands, or from the floor where you put it down, and backs
    away slowly, facing you, holding it: the walker the hammer and the planks, the crawler
    the car keys, the warden the salt and the lantern, the stone one the chain and the
    padlock (never seen to move: it is nearer all at once, three times, and goes back a pose
    at a time), the runner the bow and the arrows, the swimmer the bar (it skims in, only
    its head above the black floor, and bursts up out of it; a pool of its own lies round
    it), the climber the fuse, the customer the winch handle (the nearest thing to its
    shutter crank), the shade the notebook, the doll the music box (in its arms, as it
    carried it off), the carrier the matches, and the tall one the bulb. Each is drawn by
    its own code, in its own poses, with what it holds at its hand. They end in two rows in
    an arc in front of you, the shorter in front and the taller behind, six either side, and
    the thing in the hood comes back, calm, two pale eyes, into the middle of them, a faint
    cold light behind them all. They stand there, still and quiet, three seconds. Then all
    at once (a bright flourish, and the chord of a night won) they throw it all up into the
    air, where it turns, and falls, and lies where it lands; and they leap up and down for
    joy, each in its own time, arms up where they have them (the stone one in a new pose
    each time it comes down), as its happy face comes up out of the hood and it takes off
    its robe and dances, the music box plays, and the dark turns to the pale light and the
    meadow, all thirteen of them in it, leaping, gentler after a while and now and then a
    little more. From there it is the ending as it always is: the view is yours, a press
    goes on (they all fade, glittering, as the bedroom comes), the last screen, The End,
    the results, the campaign complete. With reduced motion each comes slower and from
    nearer with no jolt, the things thrown turn slowly, and a leap is only a gentle bob.
    The view closes in a little on a wide screen (a phone held sideways) so the whole
    gathering fills it, and eases back out as the meadow comes.

Creatures move faster when you are not looking at them, but otherwise they
come at a steady pace, no faster at the end than at the start. A thread runs through the
nights that the text never states: a
clock ticks for the first ten seconds of each night from the same direction. Surviving a night
offers Next night and nothing else (no Quit there: that is in the pause menu, which Esc opens over the win screen). The
next night's card then takes no click, tap, Enter or pad press until its words have faded in (about a second and a
half; with reduced motion, where it is all there at once, only a moment), and the prompt to go on follows. Finishing the last night ends in that meadow; a click, a key (other than those that
turn, look and zoom), a tap of Use or A there fades
the meadow and the thing away into the bedroom, in the morning, and switches the game to a light theme for its last
screen. The last
screen there says "You have faced your demons." over one button, The End, which brings up how the nights went this
time, back in the dark theme to match the Scores dialog (the pale veil over the morning room eases to a dark one, the
room still there behind, dimmed, and the results come in the Scores dialog's dark card): the thirteen cards of the Scores screen, each coming in whole with this run's time for that night one after
another (nothing there before it comes: no empty placeholders), then this run's whole time with its stars (under 3:00
three, under 6:00 two, else one: drawn, those earned filled, read out as "2 of 3 stars"; what each takes is their tooltip and their description when read out, and a tap or click on them shows it) and, only if it beats the
best run saved (or is the first), a red Best run stamp beside the time: it is then the best run on the Scores screen.
A click or a key hurries the results to the end, and with reduced motion they are all there at once. Then Finish
game, home to the title: the usual dark one, with it out there again (the light theme is never kept for the title),
slowly: everything fades smoothly to black (1.2 s), a brief pause in black, then the light behind the thing comes on
in one smooth, eased fade (1.4 s, no flicker, with or without reduced flashing), it and its eyes coming up out of the
black with it, then the title, its buttons, the corner controls and the title's drone fade in together (1.4 s);
nothing can be pressed until it is all in (`finishHome` in js/game.js, `TITLE.lightUp` in js/title.js).

Each night is a little different every time it loads, and trying a night again never brings it the same way twice in a row: every item has several
places it might be, the creature's starting distance and pace vary slightly,
and the car takes a different number of tries to start. Some pause, some lurch, one only moves when unseen.
There is no picking a night and no continuing: it is a short game, and every game is all thirteen nights in a row,
from the prologue and night 1 (Begin, or Enter on the title). The death screen offers Try again (the same night) and
nothing else: the only way out to the title is the pause menu's Quit (Esc there, as anywhere), which asks first.
Progress, the best full run and the easter eggs found are saved in `localStorage`. Once there is a best full run (a
whole game finished) or an easter egg has been found, the title has a Scores button, and the pause menu too. Scores
shows the best full run: a card for every night with that run's time for it, in two columns (three on a
phone on its side), and under them its whole time and stars; with no full run yet, only a word on what one is. The
cards are not buttons. Under them, beside Back, is Erase progress. There are no best times for single nights.

There is one easter egg a night, on the nights that have one so far (each night's `text.egg`, a line naming it, in
`js/levels/`; a night calls `foundEgg()` in js/game.js the moment it happens, and the save keeps which have been found,
by the night's id). As soon as the first is found, Scores has two tabs, Best run and Easter eggs (`role="tablist"`,
`tab`, `tabpanel`: a click or a tap chooses one; with the focus on the chosen tab, left and right, or a pad's d-pad, go
along them). Easter eggs lists the thirteen nights in order: one whose easter egg has been found shows its name and
that line; one not found yet shows its name and "???", giving nothing away; a night with no easter egg yet shows a
dash, dimmed. Under the list is how many have been found ("3 of 6 found"). It is drawn entirely from the nights'
`text.egg`, so a night given one later appears with no change here. Erase progress forgets them too.

A full run is night 1 to the end of night 13 in one go, timed: every game is one. Its clock runs only while you play:
every attempt counts, retries after a death and restarts included, but not the cards, the death and win screens, the
pause menu, or the watching after a night is won. It carries on through Next night; quitting to the title ends it,
and so does reloading the page. It finishes the moment the last night is won, and the best is kept in the save, its
breakdown with it. Each night's time is its share of the run's clock, every attempt at it, so the nights add up to the
whole run. Shown in whole seconds, each night is rounded and The Void, the last, is whatever makes them add up to the
whole run exactly as shown (rounding each on its own would drift a second or a few). A run only replaces the best when
it is faster by the whole seconds shown. (The
test switches such as `?level=N` still start a night directly, for debugging, but never on a run.)

The title screen is pitch black, with two pale points of eyes a long way off. The title and its buttons sit below them,
with no intro text or list of controls on it: those are in How to play. How to play, Scores and Settings open as
dialogs over the middle of the view, over what is out there, and it comes on only behind them: each time one closes
it is a step nearer and more of it shows, until it is close enough to touch, bent down to you with its head sunk
between its shoulders, where it stays. A faint light straight behind it, one soft round of cold light a little wider
than it is at every step, keeps its edges dark against light, so its outline holds even on a screen whose blacks
swallow a dark figure. A click on
the dark of the title does not begin the night: it scuttles at you to where its next step would put it, in plain sight,
fast and jerky as an insect (about 0.4 s, in lunges, its legs and clawing arms going, low and wide); at its nearest it
twitches instead. With reduced motion it slides there smoothly. The light behind it does not jerk with it: it is left
where it was for a moment (0.14 s), then glides after it to behind where it now stands, its middle and its reach
together, easing as a critically damped spring does (most of the way in half a second, at rest in about one; `GLIDE`
in js/title.js), so the thing jumps forward out of its light and the light comes smoothly after. Otherwise it never moves while you can see it. A faint deep drone sits under the title, a little louder and thicker each step it takes (and 2 dB
up on that far off, easing to nothing as it nears). The sound is made as the page loads and the drone set fading in at
once; where the browser will not start sound before the page is touched (most do not, on a first visit: Chrome may
once the site has been played on before, Firefox and Safari not by default), it waits at the start of its fade and
plays it out from the first gesture of any kind (a press, a key, a touch, a wheel). Begin (or Enter) first shows a
warning, in a card like the other dialogs on black: an eye struck through and red words ("This game contains flashing
imagery that may cause discomfort and/or seizures for those with photosensitive epilepsy." / "Options for reduced
motion and flashing are available in the settings dialog." / a blank line / "Player discretion is advised."), a solid
red Accept, focused (Enter, Space, a click or tap, or A or Start on a pad), and beside it a text-only Adjust settings,
which turns the card into Settings (all of it, Set to default too); its Done (or Esc, or B) is the warning again, Accept
focused, so it still takes Accept to go on. Nothing else gets past it. Once accepted it is remembered with the save
(`warned`), and a later game goes straight on (Erase progress forgets it with the rest). Then a
prologue (silent: the title's drone fades slowly away under it, and night 1's bed fades in as night 1 begins): black, and two lines, one at a time, each fading up and away (the second dimmer) ("You haven't had a good night's sleep in ages." /
"Each night something visits you in your dreams..."), then all of it fades into night 1's card. It is short and it is not skippable: no click or key gets past it, or through it
to the game (`newGame` in js/game.js). A night's card comes in a little at a time: the night and its name, then a
moment later its words, then "Click or press Enter when you are ready" (all together with reduced motion); a click or
Enter goes on at once, as ever. Begin is the one button drawn inverted,
light with dark letters. Every button and control in the menus answers with a soft tap. All the game's text is set in
IM Fell English (`fonts/`, under the SIL Open Font License, `fonts/OFL.txt`), except the keycaps drawn in How to play,
which are a plain sans, and the lettering on things in the nights themselves (a gear plate, a breaker box's tape).

## Project layout

```
index.html              page shell, HUD and styles
js/util.js              math, color and drawing helpers
js/audio.js             Web Audio synthesis: wind, drones, heartbeat, footsteps, effects
js/soundtune.js         how each sound is tuned (TUNES: pitch, speed, tone, volume per sound, set by ear in the
                        Sounds Audit), laid over js/audio.js by bending the Web Audio calls it makes
js/render.js            tiny painter's-algorithm 3D renderer on Canvas 2D (sky, ground, props, billboards, fog, post effects)
js/approach.js          approach lanes: apertures, blockers, how much of the thing you can see, lane validation
js/seq.js               beat sequencer for aftermaths, deaths and set pieces
js/save.js              versioned saved progress and settings
js/creatures.js         drawing helpers and the CREATURES registry
js/creatures/<name>.js  one creature each: procedural drawing plus movement behavior
js/icons.js             item icons and scenery builders (walls, boxes, trees, fences, openings, road, moon, stars)
js/title.js             the title screen's scene: the eyes in the dark, nearer each time a dialog over it closes
js/levels.js            item, target, container and recipe helpers and the LEVELS list
js/levels/nightNN.js    one night each
js/game.js              game state, input, interaction, HUD, main loop
js/hands.js             your hands: what you hold drawn over the view, a thing tried where it will not go (the fumble), the reach
test/                   headless Playwright suite (see Testing)
```

### Anatomy of a night

A night is an object pushed onto `LEVELS` from `js/levels/nightNN.js`. It is defined in a local
frame where the default lane points along +z; `facing` rotates the whole night so the compass
shows a different world direction. `lookDown` (degrees, 45 by default) is how far down `↓` looks on that night: the
Lighthouse looks further, down over the rail at the wall it climbs, and the Farm less far, to keep its tall breaker box
all in view (`PITCH_DOWN` is the one in play). `startFacing` (degrees, in the night's frame) is where the
view starts, before the card and after it; without it the view starts toward where the thing is coming from (the Farm
starts facing the barn, and finding it is up to you). `text.where` replaces the card's "It is coming from..." line.

```js
LEVELS.push({
  id: 'field', title: 'The Field', facing: 0, eyeH: 1.65,
  pal: { skyTop, fog, ground, fogDist }, ambient: { wind, drone, droneFreq, windFreq },
  text: { intro, hint, objective, death: { default, reached }, win },   // '\n' in a text breaks the line there
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
  seconds (or, for one draw, what `fillFor(L)` gives as it starts: `G.draw.fill`) to full (it turns green, and `bowFull` clicks), and stays full for as long as it is held. All that matters
  is whether it is full when you let go: full with the aim on the thing's body, at any distance, and
  `loose('hit', ...)` is called; full but off the thing is 'miss'; before full is 'short'. Each spends one of the ammo.
  Let go before `min` seconds and nothing is loosed. `inHands` draws what you hold over the view (and asks
  `HANDS.showHands`, the switch in `js/hands.js`, whether to draw any hands on it). Items that share an
  id and are made with `stack: true` (night 1's planks, night 5's arrows) go together in one slot as they are picked up.
- **Items and targets** are placed in `build(L)`: `mkItem(L, id, name, spot | [spots], opts)`
  picks one of several spots per load (never the same spot twice, never within 0.8 m of another
  item); `mkTarget(L, { accepts, requires, needed, use(item), hint(), onClick(), hold, crank })`
  for anything you use things on (`face`: one fixed flat on an upright face, as below); `mkContainer(L, { opens, yields, spot })` for drawers and boxes;
  `mkRecipe(L, { parts, result })` for combining two held items. Items can be `tool` (never
  consumed), `throwable`, or `decoy`.
- **Sprites and panels**: a sprite (`SC.sprite`) is a billboard that stands upright on the view; `flat` lays it on the
  ground and `card` stands it facing you (an item). A part fixed to a wall or a box (a panel of switches, a label on a
  door) takes `face` instead: the yaw its front looks toward, in the night's frame (`Math.PI` looks back at you from in
  front). It is drawn flat on that face in true perspective, as the face itself is, never turning toward you and not
  drawn from behind; a target given the same `face` has a hit area of exactly the shape it covers on the view, so what
  you click stays on what is drawn however you turn or look down (night 11's breaker box, night 2's gearstick, pedal
  and ignition, night 9's pay phone, night 6's winch, night 7's fuse box and crank, night 8's main switch and
  shutters). A plain billboard on a wall or a console turns with the view as you look round,
  so anything fixed to a surface takes `face` (or is built of polys, as night 10's fallen dust sheet is). With `flat`
  as well, a sprite or target given `face` lies on a level surface instead (night 2's gear plate on top of the console):
  `face` is then the yaw the top of its drawing points along the floor, and it is seen only from above. `face` is not
  turned by `SC.withYaw`: inside one, give the world yaw (the frame's own yaw plus `Math.PI` for a front looking back
  at you).
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
  where a modifier, a chord or a function key, as for alt-tab or a screenshot, does not go on), `L.lookFree()` (true while
  a won night gives the view back: turning, looking and zooming by key, swipe and the zoom button, or pad work as in play and are not
  taken as the press; the last night's meadow), `L.viewZoom()` (a zoom the view comes in to while playing;
  no night uses it now), `L.padDir(dir)` and `L.padUse()` (a night may take the gamepad's d-pad and A before the
  game does), `L.overlay(ctx, W, H)` (a night's own picture over the view: the covers over your eyes), `L.visFrac(c)`, `L.eye = { x, y, z }` (move the eye: renderables, targets, items
  and lights flagged `attach: true` ride with it, everything else slides past; the night 2 car drives off this way),
  `L.onDecoy(t, item)`, `L.onLaneSwitch(c, lane)`, and `L.sealed(lane)`: a creature reaching a
  sealed way is held at the barrier (or where it is, if it got inside first; a lurch across the line in
  one frame still stops at it) until the night is won.
  On Nightmare it goes round after 2.5 s to a way that is still open, starting 3 m outside that way's
  barrier and announced by its `cue` (whatever sound a night names there, a cue is always played as the thing's own
  footsteps from that way: `laneCues` in game.js; a thing with none of its own uses a walker's); below Nightmare it never changes its way. `L.roundOpen(lane, c)`
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
  the zoom button on a phone, measured from where they are on the page: it moves in from them, up over them or
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

## Labs

Four pages under `lab/` for working on the game's look and sound, opened the same way as the game (from disk or the
static host):

- `lab/creatures.html`, the creature lab: every night's creature, drawn by its own code from `js/creatures`, in a card
  that steps through its animations on a click. Each animation is driven the way its night drives it (the poses are in
  `lab/poses/<type>.js`, one per creature, registered with `LAB.creature`; `lab/lab.js` is the harness and documents
  the format). Tune opens one large, with time, distance, light and fog, and a notes box; Copy notes gathers the notes
  to paste back.
- `lab/titles.html`, the title lab: five title screens behind the game's own title menu, each closer every time you
  look away onto the menu and back. A corner panel picks the concept, the title typeface and the menu layout, and
  keeps notes.
- `lab/sounds.html`, the sounds audit: one row for every sound the game makes (each effect and death sting, voice,
  footstep kind, loop, the heartbeat and each night's ambient bed with its parameters), played through `js/audio.js`
  itself and tuned as the game has it (`js/soundtune.js`), with what it is, which nights use it (or that nothing does),
  four small sliders to nudge it further (pitch, speed, tone, volume, on top of its tune: copy them into `TUNES` to
  keep them) and a comment box. Complete: its first round of adjustments is in `TUNES`. The index is written by hand in
  `lab/sounds.js` from the call sites, so a new sound wants a row there. Copy all (or Copy comments) puts the table,
  the adjustments and the comments on the clipboard to paste back.
- `lab/journal.html`, the notebook lab: night 9's notebook from the phone booth, written and drawn by
  `js/levels/night09.js` itself (the lab runs the night's build with a bare `L` and keeps the canvases it draws the
  pages into). How it is put together (which pages are always in it, how the rest are drawn, where the number goes,
  the hand), the notebook a run seed and attempt give, page by page, and a card for every page it can hold with how
  often it turns up, its text and a comment box. Copy notes puts every page's id, title, text and comment on the
  clipboard to paste back.

## Testing

```
npm ci                 # Playwright and ESLint at the versions in package-lock.json
npx playwright install chromium   # the browser (or set PW_CHROMIUM to a Chromium binary)
npm test               # sounds, nights, flow, features, lanes, lane switches, story, clickability sweep
npm run test:play      # NIGHTS=1,3 SEEDS=1,2 narrow it
npm run test:sounds    # no browser: every sound exists and has its caption; lane cues are footsteps
npm run test:bench     # frame time per night at 1920x1080 (BUDGET=8 ms p95 by default)
npm run test:spots     # screenshot every item spot into montages under test/shots
```

`test/play.js` runs each night's declared solution per tier and seed (a night's steps can `draw` a bow: let go at
once, short of full, as soon as it is full, or after a time; on the thing or off it; by mouse, touch or pad). `test/flow.js` covers the
screens, death and retry (Try again only; Esc is the pause menu there, on a card and on the win screen, never the
title; Quit asking first), pause, mute, drops and the error overlay. `test/features.js` covers
the one game (no picker, no hints), the warning (its card, Adjust settings and back, remembered once accepted), a
night's card held until its words are in, restart, mute, menus (the pause menu, its Controls, its Scores and its Quit
with the question it asks, Settings' rows of choices and switches, How to play's cards, Set to default, the Scores screen (the best run, its
breakdown adding up, its stars; the Easter eggs tab, its tabs by click, keys, pad and tap, its rows and count, driven by the nights' `text.egg`), erasing progress from it (eggs too), the results after the ending (the Best run stamp only for a
new best), the win screen between nights, the title's click, and the light behind the thing lagging its scuttle and gliding after it), the full run's clock, captions, the gamepad, a phone (emulated: turn it sideways, swipes, taps, the zoom and menu buttons, the menu button on the death screen, the win screen and a card, How to play's touch cards, the bow and the covers held by a finger, the pay phone tapped), sealed ways, the death
camera, save migration, the last night's two endings, and your hands: what you hold (shown, swapped, lowered, still with
reduced motion, clear of the zoom button on a phone), a wrong thing coming back, a plank falling to the floor where a
click takes it again (hanging, as it tips, from the end it is meant to), a decoy dropping, the empty hand's reach, one fumble for many fast clicks, and a target's own choices. `test/lanes.js` runs `validateContent()` and checks every
lane gets picked on Nightmare. `test/switch.js` checks the Nightmare lane switch happens only while
unseen, early, without a jump in distance, and never on nights that opt out.
`test/hittest.js` checks every item (each one, where several share an id) is visible and clickable from some direction across many layouts.
`test/story.js` checks the bedside lamp is only in the bedroom, the clock ticks, and no text before the bedroom uses
the words that would give the ending away. `test/sounds.js` reads the sources and checks that every sound
the game asks for exists in the synthesiser, that every lane cue is played as footsteps, and that every death
sting, footstep and voice has a caption (and that the volume calibration's loudest sound is the sting itself, played
once and not panned, and that its four play buttons make no click). `test/settings.js` (run by `test/features.js` too, or on its own) covers Settings' Calibrate dialogs:
from the title, a paused night and the warning, by keys, a pad and touch, on a phone on its side, the five pans left to
right, the loudest once in the middle, each button's play mark turning to a stop mark and back, stopping one by
pressing it again, no click from the four, the focus coming back; the brightness slider (no filter at 100%, a filter
on the view, the title's scene and the creature otherwise, never on the menus; saved; Set to default); and renders the
two sounds offline through the game's own chain, against the heartbeat and the sting as the game plays them. `test/hittest.js` takes `NIGHTS=` and `N=` (layouts per night) to narrow it.

## Debugging

- `index.html?level=3` jumps to a night's card; `&go` skips the card.
- `index.html?seed=42` reproduces a whole run (layout, creature timing, drops).
- `index.html?debug` shows the seed, lane, distance, visibility and FPS, and runs `validateContent()`.
- `index.html?nofr` disables the frame loop so `G.step(dt, n)` can advance the game by hand.
