'use strict';
// ---------- Sounds Audit: every sound the game makes, played by its own code (js/audio.js), with a comment box each ----------
// The index below is written by hand from the call sites (AUDIO.sfx / voice / footstep / setLoop / heartbeat / startAmbient
// across js/, lane cues, creature sound/voice/death.sting, the hands' fumble and reach sounds). Each row:
//   { kind: 'sfx'|'sting'|'voice'|'footstep'|'loop'|'heartbeat'|'ambient', name, n (nights: 'all', 'unused' or [1..13]),
//     d (what it sounds like, what it means), src (where it is played from), p (an ambient's parameters) }

// stand-ins for the game's globals the audio and caption code reach for: captions on, so the page can show them
const SAVE = { data: { settings: { captions: true } } };

const NIGHTS = ['The Field', 'The Road', 'The Graveyard', 'The Quarry', 'The Clearing', 'The Boathouse', 'The Lighthouse', 'The Diner', 'The Phone Booth', 'The Mirror Maze', 'The Farm', 'The Bedroom', 'The Void'];
const R12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const SOUNDS = [
  // ---- hands, items, the generic interactions (every night) ----
  { kind: 'sfx', name: 'ui', n: 'all', d: 'A tiny soft click. Switching the item in hand (keys 1–6, Tab, tapping the strip); on night 9 also choosing a key on the pay phone.', src: 'game.js inventory · night09 keypad' },
  { kind: 'sfx', name: 'tap', n: 'all', d: 'A soft, short tap, quieter than ui and with no caption. Any button or control in the menus pressed: the title, its dialogs, pause, the death and win screens, settings, the Nights cards, the end; each card filling in on the results after the ending.', src: 'menu.js (every button and setting) · game.js mute' },
  { kind: 'sfx', name: 'stingCalibrate', n: 'all', d: 'The death sting’s crash alone: its noise burst and the deep drop under it (the impact), as loud as they are in the sting, with no saw (rising or falling) and no glitter. Tuned as the sting is; rendered offline it is no louder than the sting (test/settings.js). Settings, Volume, Calibrate, Sound effects: “Play the loudest sound in the game”, seven times in about two seconds, twice in the left ear, three times across, twice in the right (there with the heartbeat’s lub, the quietest).', src: 'menu.js volume calibration (AUDIO.calibrate)' },
  { kind: 'sfx', name: 'pickup', n: 'all', d: 'A short rising pluck with a brush of air. You take something into your hands.', src: 'game.js pickup · night07, 09, 10' },
  { kind: 'sfx', name: 'drop', n: 'all', d: 'A soft thump. You put the thing in hand down.', src: 'game.js drop · night10' },
  { kind: 'sfx', name: 'nope', n: 'all', d: 'A low buzzy blip. That will not work: wrong item, hands full, nothing to do there.', src: 'game.js · most nights' },
  { kind: 'sfx', name: 'tink', n: 'all', d: 'A light metal tick. A metal or glass thing tried somewhere it will not go (a fumble), or a fingertip on metal.', src: 'hands.js fumble (metal/glass) · nights 2, 4, 6, 7, 9, 10' },
  { kind: 'sfx', name: 'woodKnock', n: 'all', d: 'A hollow wooden clunk. A wooden thing bumps where it will not go, or a knuckle on wood.', src: 'hands.js fumble (wood), reach knock · nights 1, 6, 7' },
  { kind: 'sfx', name: 'clatter', n: 'all', d: 'A hard thing clattering down on the floor, bouncing a few times. A fumbled item falls.', src: 'hands.js fumble land · nights 4, 7 (toolbox), 13' },
  { kind: 'sfx', name: 'flop', n: 'all', d: 'A soft thing dropping (a bag, cloth, paper). A soft fumble lands; a body slumps.', src: 'hands.js fumble land · nights 1, 3, 4, 9, 10, 11, 12, 13' },
  { kind: 'sfx', name: 'pat', n: 'all', d: 'A hand laid flat on something. The empty hand reaches and touches; groping an empty shelf (night 5).', src: 'hands.js reach default · nights 2, 3, 4, 5' },
  { kind: 'sfx', name: 'rattle', n: [6, 8], d: 'A short rattle of loose metal parts. The hand shaking something that will not give.', src: 'hands.js reach rattle · night06 tackle box, night08 shutters' },
  { kind: 'sfx', name: 'hiss', n: [3, 10, 11, 12], d: 'A breathy hiss. Sugar blown off the line (3), a sheet sliding off a mirror (10), the carrier flinching from light (11), covers pulled up (12).', src: 'night03, 10, 11, 12 · game.js throw (no throwable items)' },
  // ---- night 1: the field ----
  { kind: 'sfx', name: 'hammer', n: [1], d: 'Three hard knocks. Nailing a board over a doorway.', src: 'night01 boards; fumble hit' },
  { kind: 'sfx', name: 'smash', n: [1], d: 'A loud splintering crash. It tears half-nailed boards away.', src: 'night01 onReach' },
  { kind: 'sfx', name: 'bang', n: [1, 6], d: 'A heavy boom. Something hits the boards (1), the side door bangs open (6).', src: 'night01, 06 · game.js “held” aftermath (unused)' },
  { kind: 'sfx', name: 'boardRattle', n: [1], d: 'Boards rattling on their nails after a blow. It pounds on the boards at the end.', src: 'night01 aftermath' },
  { kind: 'sfx', name: 'crack', n: [1, 6], d: 'A sharp dry crack. A board splits (1); the one oar across the side door snaps (6).', src: 'night01 boards · night06' },
  { kind: 'sfx', name: 'thud', n: [1, 4, 6, 11, 13], d: 'A deep dull thud. A blow on the wall (1), it hits the gate (4), a door swinging shut (6), the carrier falling (11); the blow under the demon’s screech at the scare (13).', src: 'night01, 04, 06, 11, 13' },
  // ---- night 2: the road ----
  { kind: 'sfx', name: 'keys', n: [2, 6], d: 'A small jingle of keys. Key into the ignition (2), the tackle box key (6).', src: 'night02, night06' },
  { kind: 'sfx', name: 'crank', n: [2], d: 'The starter motor chugging for a second without catching. The engine will not start yet.', src: 'night02 ignition' },
  { kind: 'sfx', name: 'start', n: [2], d: 'The engine catches and roars up, then idles (it also starts the engine loop).', src: 'night02 ignition' },
  { kind: 'sfx', name: 'rev', n: [2], d: 'The engine revving hard as the car pulls away, and again changing up a gear.', src: 'night02 pedal' },
  { kind: 'sfx', name: 'lever', n: [2, 7, 8, 11], d: 'A heavy lever thrown over with a clack. Gearstick (2), the lamp starts turning (7), the main switched off (8) or on (11).', src: 'night02, 07, 08, 11' },
  { kind: 'sfx', name: 'clunk', n: [2, 4, 6, 7, 8, 9, 11, 12], d: 'A heavy click. Pedal to the floor (2), a wrong thing knocked on the gate lock (4), boxes opening (6, 7), shutter down (8), receiver hung up (9), breakers (11), plug in (12).', src: 'many nights' },
  // ---- night 3: the graveyard ----
  { kind: 'sfx', name: 'pour', n: [3], d: 'A fine hiss of grains pouring. A salt (or sugar) line laid across a way in.', src: 'night03' },
  { kind: 'sfx', name: 'strike', n: [3], d: 'A match struck and flaring.', src: 'night03 lanterns' },
  { kind: 'sfx', name: 'candle', n: [3], d: 'A faint rising tone. A lantern’s flame catches.', src: 'night03 lanterns' },
  { kind: 'sfx', name: 'chain', n: [3, 4, 6], d: 'A run of small metal links. Lantern hung on its hook (3), chain round the gate (4), the winch chain springs loose (6).', src: 'night03, 04, 06' },
  { kind: 'sfx', name: 'gate', n: [4], d: 'Iron on iron, a heavy clang. The quarry gates shut and shaken (4).', src: 'night04' },
  { kind: 'sfx', name: 'creak', n: [4, 6, 7], d: 'A long creak of hinges. Gates and doors swinging, boxes and lids opening.', src: 'night04, 06, 07 · levels.js opening' },
  // ---- night 4: the quarry ----
  { kind: 'sfx', name: 'hinge', n: [4], d: 'One reedy iron note, steady, rising a little (about 2.5 semitones) as a heavy gate swings, and gone as it stops. A quarry gate pulled shut, swinging until it clangs into its post.', src: 'night04 gate' },
  { kind: 'sfx', name: 'lock', n: [4, 6], d: 'A padlock snapping shut (4), or springing open (6).', src: 'night04, night06' },
  { kind: 'sfx', name: 'scrape', n: [7], d: 'A grating scratch. The climber’s claws on the lighthouse stone: knocked down the wall by the beam, and hooking on again after the toolbox.', src: 'night07' },
  // ---- night 5: the clearing; the bow ----
  { kind: 'sfx', name: 'bowCreak', n: [5, 13], d: 'A small wooden creak, repeated while the bow is drawn.', src: 'game.js draw' },
  { kind: 'sfx', name: 'bowFull', n: [5, 13], d: 'A hard click as the string comes tight: the bow is fully drawn.', src: 'game.js draw' },
  { kind: 'sfx', name: 'twang', n: [5, 13], d: 'A low bowstring twang. An arrow is loosed.', src: 'game.js loose · night05, 13 uses' },
  { kind: 'sfx', name: 'thunk', n: [5, 13], d: 'A heavy wet thunk. An arrow hits the creature.', src: 'night05, night13' },
  // ---- night 6: the boathouse ----
  { kind: 'sfx', name: 'splash', n: [6], d: 'A splash. The swimmer surfaces.', src: 'swimmer.js · night06' },
  { kind: 'sfx', name: 'dive', n: [6], d: 'A low gulp of water. It goes under.', src: 'swimmer.js · night06' },
  { kind: 'sfx', name: 'slosh', n: [6], d: 'Water slapping. Its strokes as it swims in; water slopping under the door.', src: 'night06' },
  { kind: 'sfx', name: 'wetPound', n: [6], d: 'A deep wet boom with the oars rattling. It throws itself against a barred door; against the side door with one oar across it, just before the oar snaps.', src: 'night06 aftermath, onReach' },
  { kind: 'sfx', name: 'bar', n: [6], d: 'A heavy thing dropping into place. The water door comes down; an oar drops into the side door’s brackets.', src: 'night06' },
  { kind: 'sfx', name: 'ratchet', n: [6, 7, 8], d: 'One click of a ratchet. Each turn of a crank or winch.', src: 'game.js crank · night06, 07, 08' },
  { kind: 'sfx', name: 'fit', n: [6, 7, 10, 12], d: 'A neat click. A part goes into place: winch handle (6), bulb or fuse (7), crank (10), bulb (12).', src: 'night06, 07, 10, 12' },
  // ---- night 7: the lighthouse ----
  { kind: 'sfx', name: 'lampOn', n: [7, 12], d: 'A deep hum rising as a lamp comes on.', src: 'night07, night12' },
  { kind: 'sfx', name: 'thunder', n: [7], d: 'A long low rumble a few seconds after each lightning flash.', src: 'weather.js (lightning only on night 7)' },
  { kind: 'sfx', name: 'plunge', n: [7], d: 'A deep thump and spray, far below. Something falls into the sea.', src: 'night07' },
  { kind: 'sfx', name: 'clonk', n: [7], d: 'One hard, hollow knock with a short dull ring of steel and the tools jumping in the box. The dropped toolbox catches the climber full in the face (the night’s easter egg); the box’s clatter plays with it.', src: 'night07 toolbox hit' },
  // ---- night 8: the diner ----
  { kind: 'sfx', name: 'glassTap', n: [8], d: 'Three light taps on glass. It touches the windows as it passes; your knuckle on the glass.', src: 'night08' },
  { kind: 'sfx', name: 'glassGive', n: [8], d: 'Glass groaning and starting to crack. A window is giving way.', src: 'night08' },
  { kind: 'sfx', name: 'tubeDie', n: [8], d: 'Fluorescent tubes crackling out. The power goes.', src: 'night08 main off' },
  { kind: 'sfx', name: 'shutterGrab', n: [8], d: 'Small hands tugging a roller shutter: a jerk and a steel rattle.', src: 'night08' },
  { kind: 'sfx', name: 'shutterSlam', n: [8], d: 'A huge metal crash. A shutter shoved up into its housing.', src: 'night08' },
  { kind: 'sfx', name: 'shutterBang', n: [8], d: 'Deep booming fists on a steel shutter.', src: 'night08 aftermath' },
  { kind: 'sfx', name: 'sodaPour', n: [8], d: 'A valve click, soda drumming into a paper cup and fizzing. The soda fountain fills the cup.', src: 'night08 soda fountain' },
  { kind: 'sfx', name: 'sodaSputter', n: [8], d: 'A valve click, air, a few wet spits and a gurgle. The soda fountain run dry.', src: 'night08 soda fountain' },
  { kind: 'sfx', name: 'gulp', n: [8], d: 'A big low swallow. It drinks the soda, three of them a cup.', src: 'night08 soda' },
  { kind: 'sfx', name: 'counterPound', n: [8], d: 'A heavy fist on the diner counter, things on it jumping. Slow and single, then fast with both fists.', src: 'night08 soda' },
  { kind: 'sfx', name: 'cupDown', n: [8], d: 'A light paper tap. A paper cup set down on the counter.', src: 'night08 soda' },
  // ---- night 9: the phone booth ----
  { kind: 'sfx', name: 'receiver', n: [9], d: 'The receiver lifted, then a dial tone.', src: 'night09' },
  { kind: 'sfx', name: 'dial', n: [9], d: 'A touch-tone beep (a random key pair). A number key pressed.', src: 'night09 keypad' },
  { kind: 'sfx', name: 'keyClick', n: [9], d: 'A dead key click: no line, no credit.', src: 'night09 keypad' },
  { kind: 'sfx', name: 'coin', n: [9], d: 'A coin rattling down into the phone, then a soft chime: credit.', src: 'night09' },
  { kind: 'sfx', name: 'coinReturn', n: [9], d: 'A coin rattling into the return cup.', src: 'night09' },
  { kind: 'sfx', name: 'noService', n: [9], d: 'Three rising tones: the number is not in service.', src: 'night09' },
  { kind: 'sfx', name: 'ringback', n: [9], d: 'One long ring on the line (every 3 s while it rings).', src: 'night09' },
  { kind: 'sfx', name: 'answer', n: [9], d: 'A click and a murmur of a voice: someone picks up.', src: 'night09' },
  { kind: 'sfx', name: 'lampBreak', n: [9], d: 'A street lamp popping, glass tinkling down, a dying buzz. It breaks the lamps as it comes.', src: 'night09' },
  { kind: 'sfx', name: 'carCome', n: [9], d: 'A car engine swelling as it comes fast up the street.', src: 'night09 aftermath' },
  { kind: 'sfx', name: 'brake', n: [9], d: 'Tyres hissing on a wet road as it brakes.', src: 'night09 aftermath' },
  { kind: 'sfx', name: 'horn', n: [9], d: 'A car horn, twice.', src: 'night09 aftermath' },
  { kind: 'sfx', name: 'carDoor', n: [9], d: 'A car door opening.', src: 'night09 aftermath' },
  { kind: 'sfx', name: 'dispatch', n: [9], d: 'A click, then a few clipped, crackling bursts of a voice too thin to make out, over the line\'s hiss: 911 answers a second call that night (a car has already been sent).', src: 'night09 (911)' },
  { kind: 'sfx', name: 'dispatchAsk', n: [9], d: 'The dispatcher\'s first line, "911, what is your emergency?": a click as the line opens, then ten quick crackling syllables over the line\'s hiss, the last of them rising. About 1.3 s.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'dispatchWhat', n: [9], d: 'The dispatcher\'s second line, "a WHAT?": a short low crackle, then a long loud one torn upward. Under half a second.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'dispatchSend', n: [9], d: 'The dispatcher\'s last line, "Ok, stay there. I\'m sending a unit now.": three crackling phrases, level, the last falling, and a tick on the line as the voice stops. About 1.7 s. (Alone, when the shade is already at its last lamp.)', src: 'night09 (911)' },
  { kind: 'sfx', name: 'siren', n: [9], d: 'One wail of a police siren, up and down again in 1.6 s; played back to back while the police car comes down the street.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'tireScreech', n: [9], d: 'Tyres locked on a wet road: a high squeal wavering over a rough hiss, held about a second and cut off. The police car screeching to a halt by the shade\'s last lamp.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'sirenOff', n: [9], d: 'The siren switched off: its wail sagging down in pitch, slower and slower, and gone in a little over a second. The police car halted by the lamp post, at the end of the wail it was in.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'shadeShriek', n: [9], d: 'The shade\'s shriek: three voices at odds tearing upward, a rasp through them, a deep thud under them. Caught in the police flashlight it convulses for a second, twisting, with this.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'growlHigh', n: [9], d: 'The demon\'s growl (growl) tuned far up and quicker: a shrill, gravelly snarl, its flutter a rattle in the throat. The shade jumping out in front of the post at the police car, its head split open and its tentacles out.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'peelOut', n: [9], d: 'The police car slamming its foot down to get away: the engine roaring up, the back tyres squealing three times as they spin and catch, and the roar going off down the road.', src: 'night09 (911)' },
  { kind: 'sfx', name: 'page', n: [9], d: 'A page turned over. Leafing the notebook.', src: 'night09' },
  // ---- night 10: the mirror maze ----
  { kind: 'sfx', name: 'musicbox', n: [10, 13], d: 'A short music-box tune. The box’s song (10); the ending (13).', src: 'night10, night13' },
  { kind: 'sfx', name: 'musicTurn', n: [10], d: 'One crank turn: a click and the next few notes of the tune.', src: 'night10' },
  { kind: 'sfx', name: 'musicSour', n: [10], d: 'The notes dragged flat and out of tune, the crank sticks. Wrong mirror: it comes closer.', src: 'night10' },
  // ---- night 11: the farm ----
  { kind: 'sfx', name: 'breakerTrip', n: [11], d: 'A bang, the clack of a breaker, sparks, a hum dying. The power trips.', src: 'night11' },
  { kind: 'sfx', name: 'switch', n: [11, 12], d: 'A small switch click. Breakers (11), the lamp’s pull switch (12).', src: 'night11, night12' },
  { kind: 'sfx', name: 'tubeOn', n: [11], d: 'A tube light humming on.', src: 'night11' },
  { kind: 'sfx', name: 'sparkBlast', n: [11], d: 'A cracking bang, a buzz dying under it, sparks crackling away round the speakers and a few pops (the lamps round the farm). Every switch on and the main pushed on: the box bursts and the farm goes up.', src: 'night11 (the fire)' },
  { kind: 'sfx', name: 'fireCatch', n: [11], d: 'A deep whump and a rush of flame, spitting. A building (or the house) catching as a big spark lands on it.', src: 'night11 (the fire)' },
  { kind: 'sfx', name: 'fireCrackle', n: [11], d: 'A few pops and snaps of burning wood, every fraction of a second while the farm burns (its caption soft).', src: 'night11 (the fire)' },
  { kind: 'sfx', name: 'burnShriek', n: [11], d: 'A ragged rising shriek, cracking, through a stitched mouth. The carrier on fire, running about, and as it turns to charge you.', src: 'night11 (the fire)' },
  { kind: 'sting', name: 'stingBurn', n: [11], d: 'A roar of fire in your face, a shriek rising over it, the sting’s deep drop. Caught by the carrier burning.', src: 'night11 (the fire: deathSpec)' },
  { kind: 'loop', name: 'fire', n: [11], d: 'A low rushing roar breathing slowly, a brighter hiss over it, louder as more of the farm burns.', src: 'night11 (the fire)' },
  // ---- night 12: the bedroom, and the story sounds of every night ----
  { kind: 'sfx', name: 'drawer', n: [12], d: 'A drawer sliding open.', src: 'night12' },
  { kind: 'sfx', name: 'cloth', n: [12, 13], d: 'Cloth twisting. Its hands on the covers; pulling them up (12). The demon\u2019s robe as it takes hold of you, and as it lets you go (13).', src: 'night12 · night13 grab, release' },
  { kind: 'sfx', name: 'tug', n: [12], d: 'The covers yanked hard, the bed creaking.', src: 'night12' },
  { kind: 'sfx', name: 'flicker', n: [12], d: 'A bulb flickering out with a buzz. The lamp goes dark.', src: 'night12' },
  { kind: 'sfx', name: 'tick', n: R12, d: 'A clock tick (one a second). For the first ten seconds of every night, from the north-west; on night 12 again once won.', src: 'story.js · night12' },
  { kind: 'sfx', name: 'knock', n: R12, d: 'Two knocks on a pipe, once, when it is halfway to you. A story thread.', src: 'story.js' },
  { kind: 'sfx', name: 'hangers', n: R12, d: 'Coat hangers clinking now and then on the wind; not on night 12, where the closet is a way in.', src: 'story.js' },
  // ---- night 13: the void and the ending ----
  { kind: 'sfx', name: 'growl', n: [13], d: 'A deep, gravelly growl: a low voice and a rough fifth over it and a breath of grit, rattled by a fast uneven flutter, lifting a little and sinking as it dies. The demon holding you: its angry face coming up out of the hood (its second angry face is growl2).', src: 'night13.js' },
  { kind: 'sfx', name: 'growl2', n: [13], d: 'The same growl, tuned higher: the demon\u2019s second angry face, as it snaps to angry again and leans in at you.', src: 'night13.js' },
  { kind: 'sfx', name: 'screech', n: [13], d: 'A scraping shriek, rising and breaking, gritty; a little different each time; an octave up, slower and duller than it was made. The demon enraged: again and again while you hold anything, more often the angrier it is (every 3 s down to under 1 s); and at the scare, as it throws its head back and the faces of the others are all round it (with thud under it).', src: 'night13 screech · scare' },
  { kind: 'sfx', name: 'absorb', n: [13], d: 'A rush of air drawn in, swelling, falling in pitch and cut off short, a low note rising under it, and a soft blow at the end. The demon taking the faces of the others back into itself after the scare.', src: 'night13 ending' },
  { kind: 'sfx', name: 'screechRage', n: [13], d: 'A longer, wilder screech: two shrieks at odds and a growl under them; an octave up, slower and duller, as screech. The demon beside itself (five or more held, or the bow drawn at it), every second or so.', src: 'night13 screech' },
  { kind: 'sfx', name: 'warp', n: [13], d: 'A rushing that swells and climbs for ten seconds over a rising low note. The dark turning at the end, as the pale light comes and the meadow turns into place.', src: 'night13 ending' },
  { kind: 'sfx', name: 'birds', n: [13], d: 'A little birdsong. Dawn in the meadow at the end.', src: 'night13 ending' },
  { kind: 'sfx', name: 'win', n: 'all', d: 'A soft rising chord. A night survived (the fade at the end of the aftermath); the ending’s last moment.', src: 'game.js · night13' },
  // ---- defined but never played ----
  { kind: 'sfx', name: 'shot', n: 'unused', d: 'A gunshot with a long tail. Only the default for a click-to-fire weapon; no night has one.', src: 'game.js fireUse default' },
  { kind: 'sfx', name: 'empty', n: 'unused', d: 'Click-click of an empty gun. Only for a click-to-fire weapon with no ammo; no night has one.', src: 'game.js useOnCreature' },
  { kind: 'sfx', name: 'load', n: 'unused', d: 'A gun being loaded. Default for combining two items; no night has a recipe.', src: 'game.js combine default' },
  { kind: 'sfx', name: 'bell', n: 'unused', d: 'A small bright bell, twice. Never called.', src: '—' },
  { kind: 'sfx', name: 'phoneRing', n: 'unused', d: 'An old phone’s trilling ring. Never called.', src: '—' },
  { kind: 'sfx', name: 'wetThud', n: 'unused', d: 'A wet heavy blow. Never called.', src: '—' },
  // ---- death stings (and the other uses of the same sounds) ----
  { kind: 'sting', name: 'sting', n: [1, 11, 12, 13], d: 'A scream: white noise, a falling saw tone, glitter. Death by the walker (1, the default), the carrier (11), grabbed or in the dark (12), the demon (13).', src: 'game.js die default · carrier, demon, night12' },
  { kind: 'sting', name: 'stingShriek', n: [2, 11], d: 'A rising shriek. Death by the crawler (2); the carrier’s shriek as it falls (11).', src: 'crawler.js · night11' },
  { kind: 'sting', name: 'stingHum', n: [3, 10, 12, 13], d: 'A soft chord, then a thump. Death by the smiler (3), the other (10), the tall one (12); on 13 it catches you empty-handed and the ending begins.', src: 'smiler, other, tall · night13' },
  { kind: 'sting', name: 'stingStone', n: [4], d: 'Stone grinding and a crash. Death by the watcher.', src: 'watcher.js' },
  { kind: 'sting', name: 'stingHit', n: [5], d: 'A heavy blow. Death by the runner.', src: 'runner.js' },
  { kind: 'sting', name: 'stingWet', n: [6], d: 'A wet scream. Death by the swimmer.', src: 'swimmer.js' },
  { kind: 'sting', name: 'stingScrape', n: [7], d: 'Hooks screeching on stone. Death by the climber.', src: 'climber.js' },
  { kind: 'sting', name: 'stingGlass', n: [8, 9], d: 'Glass shattering. Death by the customer (8; also the glass breaking as it comes in for the soda) or the signalman (9).', src: 'customer.js, night08, signalman.js' },
  // ---- creature voices ----
  { kind: 'voice', name: 'exhale', n: [1, 7, 13], d: 'A long low breath. The walker (1), the climber (7), the demon (13; also when it has hold of you at the end).', src: 'walker, climber, demon · night13' },
  { kind: 'voice', name: 'clicks', n: [2], d: 'A run of dry clicks. The crawler.', src: 'crawler.js' },
  { kind: 'voice', name: 'hum', n: [3, 9, 10, 13], d: 'A soft hummed note. The smiler (3, and as it walks away), the signalman (9), the other (10); the demon happy at the end (13).', src: 'smiler, signalman, other · night03, 13' },
  { kind: 'voice', name: 'pant', n: [5], d: 'Two quick pants. The runner.', src: 'runner.js' },
  { kind: 'voice', name: 'gurgle', n: [6], d: 'A wet gurgle. The swimmer.', src: 'swimmer.js' },
  { kind: 'voice', name: 'slow', n: [11, 12, 13], d: 'A very slow, deep breath. The carrier (11), the tall one (12); the demon’s sorrow at the end (13).', src: 'carrier, tall · night12, 13' },
  // ---- footsteps ----
  { kind: 'footstep', name: 'walker', n: [1, 4, 6, 9, 11, 13], d: 'Slow heavy footsteps. The walker (1), the signalman (9), the carrier (11), the demon (13). Also every lane cue of its nights: three of its steps from the way it is now coming (game.js laneCues). The lane cues of a thing that makes no steps of its own are these: the watcher (4), the swimmer (6).', src: 'creature sound: walker, signalman, carrier, demon · lane cues' },
  { kind: 'footstep', name: 'crawler', n: [2], d: 'Quick scuttling. The crawler.', src: 'crawler.js · night02' },
  { kind: 'footstep', name: 'smiler', n: [3, 10], d: 'Light quick steps. The smiler (3); the other running between mirrors, and three quick steps behind you (10). Also every lane cue of its nights: three of its steps from the way it is now coming (game.js laneCues).', src: 'smiler.js · night10 · lane cues' },
  { kind: 'footstep', name: 'runner', n: [1, 3, 5, 11, 12], d: 'Fast running steps. The runner (5); the walker running round the house and charging (1); the smiler going round on Nightmare (3); the carrier running (11); on Nightmare three quick, heavy thumps as the tall one shifts round the bed to the other way in, panned from where it was to where it goes (12). Also every lane cue of its nights: three of its steps from the way it is now coming (game.js laneCues).', src: 'runner.js · night01, 11, 12 · game.js going round · lane cues' },
  { kind: 'footstep', name: 'climber', n: [7], d: 'Hooks biting into stone. The climber. Also every lane cue of its nights: three of its steps from the way it is now coming (game.js laneCues).', src: 'climber.js · lane cues' },
  { kind: 'footstep', name: 'shoes', n: [8], d: 'Small hard heels clicking. The customer walking.', src: 'customer.js' },
  { kind: 'footstep', name: 'shoesRun', n: [8], d: 'Hard heels running. The customer running to another window.', src: 'night08' },
  { kind: 'footstep', name: 'tall', n: [12], d: 'One slow, very heavy step. The tall one. (Its lane cues are set to these too, but it changes its way itself, so they are not played.)', src: 'tall.js' },
  // ---- loops ----
  { kind: 'loop', name: 'grind', n: [4], d: 'Stone grinding, on and on. The watcher moving while you are not looking at it; silent when watched.', src: 'game.js (silentWhenSeen)' },
  { kind: 'loop', name: 'engine', n: [2, 9], d: 'A low engine idle. The car running (2); the car waiting in the street (9).', src: 'night02 · night09 aftermath' },
  { kind: 'heartbeat', name: 'heartbeat', n: 'all', d: 'Your heartbeat: silent until it is halfway to you, then louder and quicker as it closes (this plays the whole ramp).', src: 'game.js heartbeat' },
  // ---- ambient beds: wind (noise through a wandering low-pass), optional rain (bright hiss), a quiet drone ----
  { kind: 'ambient', name: 'night 1', n: [1], p: { tune: 'ambient:1', wind: 1, drone: 0.8, droneFreq: 50, windFreq: 380 }, d: 'Open wind over the field, a low hum under it.', src: 'night01 ambient' },
  { kind: 'ambient', name: 'night 2', n: [2], p: { tune: 'ambient:2', wind: 0.45, drone: 1, droneFreq: 41, windFreq: 220, rain: 0.8 }, d: 'Rain on the car, muffled wind, a deep drone.', src: 'night02 ambient' },
  { kind: 'ambient', name: 'night 3', n: [3], p: { tune: 'ambient:3', wind: 0.7, drone: 0.7, droneFreq: 58, windFreq: 300, rain: 0.35 }, d: 'Light rain and wind among the stones.', src: 'night03 ambient' },
  { kind: 'ambient', name: 'night 4', n: [4], p: { tune: 'ambient:4', wind: 0.9, drone: 0.5, droneFreq: 65, windFreq: 500 }, d: 'Brighter gusting wind in the pit, a thin drone.', src: 'night04 ambient' },
  { kind: 'ambient', name: 'night 5', n: [5], p: { tune: 'ambient:5', wind: 1.1, drone: 0.6, droneFreq: 46, windFreq: 420 }, d: 'A strong cold wind (it is snowing).', src: 'night05 ambient' },
  { kind: 'ambient', name: 'night 6', n: [6], p: { tune: 'ambient:6', wind: 0.6, drone: 0.7, droneFreq: 44, windFreq: 260, rain: 0.5 }, d: 'Rain on the water, a low wind.', src: 'night06 ambient' },
  { kind: 'ambient', name: 'night 7', n: [7], p: { tune: 'ambient:7', wind: 1.6, drone: 0.5, droneFreq: 48, windFreq: 520, rain: 1.0 }, d: 'A storm: the loudest wind and heavy rain (thunder comes on top). Settings, Volume, Calibrate, Ambience plays a few seconds of it for “Play the loudest ambience in the game”.', src: 'night07 ambient · menu.js volume calibration (AUDIO.calibrate)' },
  { kind: 'ambient', name: 'night 8', n: [8], p: { tune: 'ambient:8', wind: 0.25, drone: 1.0, droneFreq: 60, windFreq: 300 }, d: 'Mostly the hum of the place (a strong 60 Hz drone), little wind.', src: 'night08 ambient' },
  { kind: 'ambient', name: 'night 8 · power off', n: [8], p: { tune: 'ambient:8off', wind: 0.25, drone: 0.12, droneFreq: 60, windFreq: 300 }, d: 'The same, with the hum gone: the main is switched off. The quietest bed in the game (rendered offline with its tune, K-weighted): Settings, Volume, Calibrate, Ambience plays a few seconds of it for “Play the quietest ambience in the game”.', src: 'night08 main off · menu.js volume calibration (AUDIO.calibrate)' },
  { kind: 'ambient', name: 'night 9', n: [9], p: { tune: 'ambient:9', wind: 0.35, rain: 1, drone: 0.45, droneFreq: 47, windFreq: 300 }, d: 'Steady rain on the street.', src: 'night09 ambient' },
  { kind: 'ambient', name: 'night 10', n: [10], p: { tune: 'ambient:10', wind: 0, drone: 0.3, droneFreq: 55, windFreq: 340 }, d: 'A quiet stage indoors: no wind at all, only a low hanging drone.', src: 'night10 ambient' },
  { kind: 'ambient', name: 'night 11', n: [11], p: { tune: 'ambient:11', wind: 0.9, drone: 0.6, droneFreq: 44, windFreq: 300 }, d: 'Wind over the farm, a low drone.', src: 'night11 ambient' },
  { kind: 'ambient', name: 'night 12', n: [12], p: { tune: 'ambient:12', wind: 0.15, drone: 0.9, droneFreq: 38, windFreq: 200 }, d: 'A near-silent room, a very low drone.', src: 'night12 ambient' },
  { kind: 'ambient', name: 'night 13', n: [13], p: { tune: 'ambient:13', wind: 0.2, drone: 1.3, droneFreq: 34, windFreq: 160 }, d: 'The deepest, loudest drone; almost no wind.', src: 'night13 ambient' },
  { kind: 'ambient', name: 'night 13 · dawn', n: [13], p: { tune: 'ambient:13dawn', wind: 0.32, drone: 0, windFreq: 760 }, d: 'A light breeze and no drone: the meadow at dawn, at the very end.', src: 'night13 ending' },
  { kind: 'ambient', name: 'title · far', n: 'all', p: { tune: 'ambient:title', near: 0 }, d: 'The title: no wind, a deep drone of two low notes beating slowly with a breath of rumble under them, and over it a low buzzing hum in the throat (a note beating against itself, a sour tritone, a band of breathing noise) that small speakers carry. About as loud as a night\'s wind, an octave lower than it was (the low notes now felt more than heard, the hum carrying it), and 2 dB up far off (titleBed\'s far gain, easing to nothing as it nears). It is a long way off. On a page load it fades in at once where the browser lets sound start, else from the first gesture of any kind.', src: 'game.js titleSound · audio.js titleDrone' },
  { kind: 'ambient', name: 'title · close', n: 'all', p: { tune: 'ambient:title', near: 1 }, d: 'The same drone with it bent over you (the last step; the 2 dB far gain gone): twice as loud and more, the filters open so the hum is brighter and harsher, a rough fifth and octave thickening it. Each step between moves it part way, over a second or so.', src: 'game.js titleSound · audio.js titleDrone' },
];
const KINDS = { sfx: 'effect', sting: 'death sting', voice: 'voice', footstep: 'footsteps', loop: 'loop', heartbeat: 'heartbeat', ambient: 'ambient bed' };
const PLURAL = { sfx: 'effects', sting: 'death stings', voice: 'voices', footstep: 'footstep kinds', loop: 'loops', heartbeat: 'heartbeat', ambient: 'ambient beds' };
const ORDER = ['sfx', 'sting', 'voice', 'footstep', 'loop', 'heartbeat', 'ambient'];

(() => {
  const ids = s => s.kind + ':' + s.name;
  const $ = id => document.getElementById(id);
  const paramText = p => p.near !== undefined ? 'title drone · nearness ' + p.near + ' (0 far off, 1 at you)' : ['wind ' + (p.wind === undefined ? 1 : p.wind), p.rain ? 'rain ' + p.rain : null, 'drone ' + (p.drone === undefined ? 1 : p.drone) + (p.drone === 0 ? '' : ' @ ' + (p.droneFreq || 52) + ' Hz'), 'wind filter ' + (p.windFreq || 380) + ' Hz'].filter(Boolean).join(' · ');
  const covers = (s, night) => s.n === 'all' || (Array.isArray(s.n) && s.n.includes(night));
  // nights as text: 'all nights', 'unused', or runs ('1–12', '2, 6')
  function runs(n) {   // three or more nights in a row as one [from, to]; the rest one by one
    const out = [];
    for (let i = 0; i < n.length;) {
      let j = i; while (j + 1 < n.length && n[j + 1] === n[j] + 1) j++;
      if (j - i >= 2) out.push([n[i], n[j]]); else for (let k = i; k <= j; k++) out.push([n[k]]);
      i = j + 1;
    }
    return out;
  }
  const nightsText = s => s.n === 'all' ? 'all nights' : s.n === 'unused' ? 'unused' : runs(s.n).map(r => r.length > 1 ? r[0] + '–' + r[1] : String(r[0])).join(', ');

  // ---- comments, kept in this browser ----
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem('soundsAuditNotes') || '{}') || {}; } catch (e) { notes = {}; }
  const saveNotes = () => { try { localStorage.setItem('soundsAuditNotes', JSON.stringify(notes)); } catch (e) {} };
  // ---- adjustments (lab/soundtweak.js), kept in this browser too ----
  let tweaks = {};
  try { tweaks = JSON.parse(localStorage.getItem('soundsAuditTweaks2') || '{}') || {}; } catch (e) { tweaks = {}; }
  const saveTweaks = () => { try { localStorage.setItem('soundsAuditTweaks2', JSON.stringify(tweaks)); } catch (e) {} };
  const tw = s => Object.assign({}, TUNE.DEF, tweaks[ids(s)]);
  // the four, as their sliders run: pitch in semitones, speed as a power of two (shown as x), tone in octaves, volume in dB
  const ADJ = [
    { k: 'pitch', l: 'P', title: 'Pitch, semitones', min: -12, max: 12, step: 0.5, to: v => v, from: v => v, show: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' st' },
    { k: 'speed', l: 'S', title: 'Speed (2x: twice as fast, half as long)', min: -1, max: 1, step: 0.05, to: v => +Math.pow(2, v).toFixed(3), from: v => Math.log2(v), show: v => '×' + v.toFixed(2) },
    { k: 'tone', l: 'T', title: 'Tone: filters brighter (+) or duller (−), octaves', min: -2, max: 2, step: 0.1, to: v => v, from: v => v, show: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(1) + ' oct' },
    { k: 'vol', l: 'V', title: 'Volume, dB', min: -18, max: 12, step: 1, to: v => v, from: v => v, show: v => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v) + ' dB' },
  ];
  const tweakText = t => ADJ.filter(a => t[a.k] !== TUNE.DEF[a.k]).map(a => a.k + ' ' + a.show(t[a.k])).join(', ');

  // ---- audio: started on the first click (a browser will not start sound before one) ----
  const start = () => { AUDIO.init(); AUDIO.resume(); };
  document.addEventListener('pointerdown', start, { once: true });
  let vol = 0.8, muted = false;
  try { const v = JSON.parse(localStorage.getItem('soundsAuditVol') || 'null'); if (v) { vol = clamp(+v.vol, 0, 1); muted = !!v.muted; } } catch (e) {}
  const applyVol = () => {
    AUDIO.setVolume('effects', vol); AUDIO.setVolume('ambient', vol); AUDIO.setMuted(muted);   // (the page's own listening level: both of the game's volumes, there being no main one)
    $('vol').value = vol; $('volOut').textContent = Math.round(vol * 100) + '%';
    $('mute').setAttribute('aria-pressed', String(muted)); $('mute').textContent = muted ? 'Unmute' : 'Mute';
    try { localStorage.setItem('soundsAuditVol', JSON.stringify({ vol, muted })); } catch (e) {}
  };
  $('vol').addEventListener('input', ev => { vol = +ev.target.value; applyVol(); });
  $('mute').onclick = () => { muted = !muted; applyVol(); };
  applyVol();

  // what is held on: one ambient bed and one loop at a time, as in the game
  const on = { ambient: null, loop: null };
  const timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, ms));
  const STEP_GAP = { walker: 620, crawler: 170, smiler: 300, runner: 260, climber: 480, tall: 1100, shoes: 380, shoesRun: 230 };
  function play(s, restart) {
    start();
    const t = tw(s), T = fn => () => TUNE.run(t, fn), gap = ms => ms / t.speed;
    if (restart) {   // (a held sound, nudged while it plays: start it again as it now is)
      if (s.kind === 'loop' && on.loop === s) { AUDIO.stopLoop(); TUNE.run(t, () => AUDIO.setLoop(s.name, 0.45, 0)); }
      if (s.kind === 'ambient' && on.ambient === s) { AUDIO.stopAmbient(); TUNE.run(t, () => AUDIO.startAmbient(s.p)); }
      return;
    }
    if (s.kind === 'sfx' || s.kind === 'sting') {
      TUNE.run(t, () => AUDIO.sfx(s.name, 0));
      if (s.name === 'start') setOn('loop', SOUNDS.find(x => x.kind === 'loop' && x.name === 'engine'));   // it starts the engine loop
    } else if (s.kind === 'voice') TUNE.run(t, () => AUDIO.voice(s.name, 0.6, 0));
    else if (s.kind === 'footstep') { const g = gap(STEP_GAP[s.name] || 400); for (let i = 0; i < 5; i++) later(i * g, T(() => AUDIO.footstep(s.name, 0.35 + i * 0.07, i % 2 ? 0.15 : -0.15))); }
    else if (s.kind === 'heartbeat') {   // the ramp as it closes in: from far (slow, faint) to at you (fast, loud)
      let u = 0;
      for (let i = 0; i <= 10; i++) { const prox = 0.1 + i * 0.09; later(gap(u * 1000), T(() => AUDIO.heartbeat(0.04 + prox * 0.5, prox > 0.7))); u += lerp(1.35, 0.32, Math.pow(prox, 1.5)); }
    } else if (s.kind === 'loop') {
      if (on.loop === s) { AUDIO.stopLoop(); setOn('loop', null); } else { if (on.loop) AUDIO.stopLoop(); TUNE.run(t, () => AUDIO.setLoop(s.name, 0.45, 0)); setOn('loop', s); }
    } else if (s.kind === 'ambient') {
      if (on.ambient === s) { AUDIO.stopAmbient(); setOn('ambient', null); } else { TUNE.run(t, () => AUDIO.startAmbient(s.p)); setOn('ambient', s); }
    }
    const tr = rows.get(ids(s)); if (tr) { tr.classList.remove('flash'); void tr.offsetWidth; tr.classList.add('flash'); }
  }
  function setOn(which, s) {
    const was = on[which]; on[which] = s;
    for (const x of [was, s]) { if (!x) continue; const tr = rows.get(ids(x)); if (!tr) continue; const b = tr.querySelector('.play'), live = on[which] === x; tr.classList.toggle('live', live); b.textContent = live ? '■' : '▶'; b.setAttribute('aria-label', (live ? 'Stop ' : 'Play ') + label(x)); }
  }
  $('stop').onclick = () => { timers.splice(0).forEach(clearTimeout); AUDIO.stopLoop(); AUDIO.stopAmbient(); setOn('loop', null); setOn('ambient', null); };
  const label = s => (s.kind === 'ambient' ? 'ambient bed, ' + s.name : s.name + ' (' + KINDS[s.kind] + ')');

  // ---- the table ----
  const body = $('rows'), rows = new Map();
  const nightChips = s => {
    if (s.n === 'all') return '<span class="chip all" title="Every night: generic code">all nights</span>';
    if (s.n === 'unused') return '<span class="chip unused" title="Defined in js/audio.js, never played">unused</span>';
    return runs(s.n).map(r => r.length > 1 ? '<span class="chip wide" title="Nights ' + r[0] + ' to ' + r[1] + '">' + r[0] + '–' + r[1] + '</span>' : '<span class="chip" title="' + r[0] + ' · ' + NIGHTS[r[0] - 1] + '">' + r[0] + '</span>').join('');
  };
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const sorted = SOUNDS.slice().sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind));
  for (const s of sorted) {
    const tr = document.createElement('tr'), id = ids(s), toggles = s.kind === 'loop' || s.kind === 'ambient';
    tr.className = 'k-' + s.kind + (s.n === 'unused' ? ' is-unused' : '');
    tr.innerHTML =
      '<td class="c-play"><button class="play' + (toggles ? ' toggle' : '') + '" aria-label="Play ' + esc(label(s)) + '">▶</button></td>' +
      '<td class="c-name"><code>' + esc(s.name) + '</code><span class="kind">' + esc(KINDS[s.kind]) + (toggles ? ' · toggles' : '') + '</span></td>' +
      '<td class="c-desc"><span class="d">' + esc(s.d) + '</span>' + (s.p ? '<span class="params">' + esc(paramText(s.p)) + '</span>' : '') + '<span class="src">' + esc(s.src) + '</span></td>' +
      '<td class="c-nights"><div class="chips">' + nightChips(s) + '</div></td>' +
      '<td class="c-adj"><div class="adj">' + ADJ.map(a => '<span class="al" title="' + a.title + '">' + a.l + '</span><input type="range" data-k="' + a.k + '" min="' + a.min + '" max="' + a.max + '" step="' + a.step + '" aria-label="' + esc(a.title + ', ' + s.name) + '"><output></output>').join('') + '<button type="button" class="reset" title="Back to as the game has it">reset</button></div></td>' +
      '<td class="c-note"><textarea rows="1" aria-label="Comment on ' + esc(label(s)) + '" placeholder="Comment…"></textarea></td>';
    tr.querySelector('.play').onclick = () => play(s);
    const sliders = [...tr.querySelectorAll('.adj input')], outs = [...tr.querySelectorAll('.adj output')];
    const showAdj = () => {
      const t = tw(s);
      ADJ.forEach((a, i) => { sliders[i].value = a.from(t[a.k]); outs[i].textContent = a.show(t[a.k]); outs[i].classList.toggle('on', t[a.k] !== TUNE.DEF[a.k]); });
      tr.classList.toggle('tweaked', !TUNE.isDefault(t));
    };
    const setAdj = (k, v) => { const t = tw(s); t[k] = v; if (TUNE.isDefault(t)) delete tweaks[id]; else tweaks[id] = t; saveTweaks(); showAdj(); count(); };
    sliders.forEach((el, i) => {
      el.addEventListener('input', () => { setAdj(ADJ[i].k, ADJ[i].to(+el.value)); play(s, true); });   // (a held sound follows at once)
      el.addEventListener('change', () => { if (!toggles) play(s); });                                     // (a one-off plays on release)
      el.addEventListener('dblclick', () => { setAdj(ADJ[i].k, TUNE.DEF[ADJ[i].k]); play(s, true); });
    });
    tr.querySelector('.reset').onclick = () => { delete tweaks[id]; saveTweaks(); showAdj(); count(); play(s, true); };
    showAdj();
    const ta = tr.querySelector('textarea');
    ta.value = notes[id] || '';
    const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(32, ta.scrollHeight + 2) + 'px'; };
    ta.addEventListener('input', () => { if (ta.value.trim()) notes[id] = ta.value; else delete notes[id]; saveNotes(); tr.classList.toggle('noted', !!ta.value.trim()); fit(); count(); });
    tr.classList.toggle('noted', !!ta.value.trim());
    body.appendChild(tr); rows.set(id, tr);
    s.tr = tr; s.fit = fit;
    s.hay = (s.name + ' ' + KINDS[s.kind] + ' ' + s.d + ' ' + s.src + ' ' + nightsText(s) + (s.p ? ' ' + paramText(s.p) : '')).toLowerCase();
  }
  requestAnimationFrame(() => sorted.forEach(s => s.fit()));

  // ---- filters ----
  const strip = $('nightStrip');
  const nightBtns = [['', 'All'], ...NIGHTS.map((t, i) => [String(i + 1), String(i + 1), t]), ['unused', 'Unused', 'Defined but never played']];
  for (const [v, txt, title] of nightBtns) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.n = v; b.textContent = txt; b.setAttribute('aria-pressed', String(v === ''));
    b.title = title ? (/^\d/.test(txt) ? 'Night ' + txt + ': ' + title : title) : 'Every night';
    b.onclick = () => { filt.night = v; for (const x of strip.children) x.setAttribute('aria-pressed', String(x === b)); apply(); };
    strip.appendChild(b);
  }
  const kindSel = $('kind');
  for (const k of ORDER) { const o = document.createElement('option'); o.value = k; o.textContent = PLURAL[k] + ' (' + SOUNDS.filter(s => s.kind === k).length + ')'; kindSel.appendChild(o); }
  const filt = { q: '', kind: '', night: '', noted: false };
  $('q').addEventListener('input', ev => { filt.q = ev.target.value.trim().toLowerCase(); apply(); });
  kindSel.addEventListener('change', () => { filt.kind = kindSel.value; apply(); });
  $('noted').addEventListener('change', ev => { filt.noted = ev.target.checked; apply(); });
  function apply() {
    let shown = 0;
    for (const s of sorted) {
      const nt = notes[ids(s)] || '';
      const ok = (!filt.kind || s.kind === filt.kind) &&
        (!filt.night || (filt.night === 'unused' ? s.n === 'unused' : covers(s, +filt.night))) &&
        (!filt.noted || nt.trim() || tweaks[ids(s)]) &&
        (!filt.q || filt.q.split(/\s+/).every(w => s.hay.includes(w) || nt.toLowerCase().includes(w)));
      s.tr.hidden = !ok; if (ok) shown++;
    }
    $('empty').hidden = shown > 0;
    count(shown);
  }
  function count(shown) {
    if (shown === undefined) shown = sorted.filter(s => !s.tr.hidden).length;
    const noted = Object.keys(notes).filter(k => (notes[k] || '').trim()).length, changed = Object.keys(tweaks).length;
    const n = filt.night && filt.night !== 'unused' ? ' · night ' + filt.night + ', ' + NIGHTS[+filt.night - 1] : '';
    $('count').textContent = shown + ' of ' + SOUNDS.length + ' shown' + n + ' · ' + noted + ' commented · ' + changed + ' adjusted';
  }
  apply();

  // ---- export ----
  const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2000); };
  const byKind = () => ORDER.map(k => SOUNDS.filter(s => s.kind === k).length + ' ' + PLURAL[k]).join(', ');
  const line = s => {
    const nt = (notes[ids(s)] || '').trim().replace(/\s*\n+\s*/g, ' / ');
    const ad = tweaks[ids(s)] ? tweakText(tw(s)) : '';
    return '- ' + s.name + ' [' + KINDS[s.kind] + '] | ' + nightsText(s) + ' | ' + s.d + (s.p ? ' (' + paramText(s.p) + ')' : '') + (ad ? '\n    ADJUST: ' + ad : '') + (nt ? '\n    COMMENT: ' + nt : '');
  };
  function exportText(onlyNoted) {
    const marked = s => (notes[ids(s)] || '').trim() || tweaks[ids(s)];
    const list = sorted.filter(s => !onlyNoted || marked(s));
    const noted = sorted.filter(s => (notes[ids(s)] || '').trim()).length, changed = sorted.filter(s => tweaks[ids(s)]).length;
    const head = 'Sounds audit: ' + SOUNDS.length + ' sounds (' + byKind() + '); ' + noted + ' with comments, ' + changed + ' adjusted.' + (onlyNoted ? ' Only those follow.' : '') +
      '\nADJUST is how the sound was nudged in the lab (pitch in semitones: oscillators, noise and filters together; speed: x faster, all its timings; tone: its filters alone, octaves; volume in dB).' +
      '\nEach line: name [kind] | nights | what it sounds like and means. Played by js/audio.js (sfx / sting by AUDIO.sfx(name), voice, footstep, loop, heartbeat, ambient bed = AUDIO.startAmbient(params)).';
    return head + '\n\n' + list.map(line).join('\n');
  }
  function copy(onlyNoted) {
    if (onlyNoted && !Object.keys(notes).some(k => (notes[k] || '').trim()) && !Object.keys(tweaks).length) { toast('No comments or changes yet.'); return; }
    const text = exportText(onlyNoted), out = $('copyOut');
    const fallback = () => { out.value = text; out.classList.add('show'); out.style.height = Math.min(420, 60 + text.split('\n').length * 18) + 'px'; out.scrollIntoView({ block: 'nearest' }); out.focus(); out.select(); toast('Select all and copy the text below'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { out.value = text; toast((onlyNoted ? 'Comments' : 'The whole table') + ' copied. Paste it into the chat.'); }, fallback);
    else fallback();
  }
  $('copyAll').onclick = () => copy(false);
  $('copyNoted').onclick = () => copy(true);

  // captions: the game's own caption line, shown as each sound plays
  setInterval(() => CAPTIONS.update(), 200);
  window.SOUNDS_AUDIT = { SOUNDS, play, exportText };   // (for the lab's own checks)
})();
