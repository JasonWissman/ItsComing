'use strict';
// Every sound the game asks for exists in the synthesiser (js/audio.js), and every sound that carries information
// (a lane's cue, which on Nightmare is the only warning of a switch, now always footsteps; a death sting; a footstep; a voice) has a caption
// in js/captions.js. A mistyped name would otherwise fail silently: no sound, no caption, no error.
// Static: it reads the sources and needs no browser.
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const files = ['js', 'js/creatures', 'js/levels'].flatMap(d => fs.readdirSync(path.join(root, d)).filter(f => f.endsWith('.js')).map(f => d + '/' + f));
const src = Object.fromEntries(files.map(f => [f, fs.readFileSync(path.join(root, f), 'utf8')]));
const audio = src['js/audio.js'], captions = src['js/captions.js'];
// each kind of name is looked up in the function that plays it, so a footstep name used as an effect still fails
const body = name => { const a = audio.indexOf('  function ' + name + '('); if (a < 0) return ''; const b = audio.indexOf('\n  function ', a + 1); const c = audio.indexOf('\n  return {', a + 1); return audio.slice(a, Math.min(b < 0 ? Infinity : b, c < 0 ? Infinity : c)); };
const names = (s, re) => new Set([...s.matchAll(re)].map(m => m[1]));
const synth = { sfx: names(body('sfx'), /case '([A-Za-z]+)'/g), step: names(body('footstep'), /case '([A-Za-z]+)'/g), voice: names(body('voice'), /case '([A-Za-z]+)'/g), loop: names(body('setLoop'), /kind === '([A-Za-z]+)'/g) };
synth.cue = synth.sfx; synth.sting = synth.sfx;
const table = name => { const m = captions.match(new RegExp('const ' + name + ' = \\{([\\s\\S]*?)\\};')); return new Set(m ? [...m[1].matchAll(/([A-Za-z]+):\s*'/g)].map(x => x[1]) : []); };
const SFX = table('SFX'), STEPS = table('STEPS'), VOICES = table('VOICES');
let failures = 0, checks = 0;
const check = (ok, msg) => { checks++; if (!ok) { failures++; console.log('  FAIL: ' + msg); } };
const used = { sfx: new Map(), cue: new Map(), sting: new Map(), step: new Map(), voice: new Map(), loop: new Map() };
const note = (kind, name, file) => { if (!used[kind].has(name)) used[kind].set(name, file); };
const scan = (file, re, kind) => { for (const m of src[file].matchAll(re)) note(kind, m[1], file); };
for (const f of files) {
  if (f === 'js/audio.js' || f === 'js/captions.js') continue;
  scan(f, /AUDIO\.sfx\('([A-Za-z]+)'/g, 'sfx');
  scan(f, /AUDIO\.sfx\([^;)]*\|\| '([A-Za-z]+)'\)/g, 'sfx');
  scan(f, /\bsfx: '([A-Za-z]+)'/g, 'sfx');
  scan(f, /\bsfx: [^,}'\n]*\|\| '([A-Za-z]+)'/g, 'sfx');
  scan(f, /\bcue: '([A-Za-z]+)'/g, 'cue');
  scan(f, /\bsting: '([A-Za-z]+)'/g, 'sting');
  scan(f, /\bsound: '([A-Za-z]+)'/g, 'step');
  scan(f, /AUDIO\.footstep\('([A-Za-z]+)'/g, 'step');
  scan(f, /voice: \{ kind: '([A-Za-z]+)'/g, 'voice');
  scan(f, /AUDIO\.voice\('([A-Za-z]+)'/g, 'voice');
  scan(f, /setLoop\('([A-Za-z]+)'/g, 'loop');
  scan(f, /setLoop\([^;]*\? '([A-Za-z]+)'/g, 'loop');
}
check(synth.sfx.size > 40 && synth.step.size >= 5 && synth.voice.size >= 5 && synth.loop.size >= 2 && SFX.size > 40, 'the synth and caption tables were found (' + synth.sfx.size + ' effects, ' + synth.step.size + ' footsteps, ' + synth.voice.size + ' voices, ' + synth.loop.size + ' loops, ' + SFX.size + ' captions)');
for (const [kind, list] of Object.entries(used)) for (const [name, file] of list) check(synth[kind].has(name), kind + " '" + name + "' (" + file + ') is not a ' + kind + ' in js/audio.js');
// a lane's cue is never the sound the night names for it: game.js laneCues makes every one the thing's own footsteps
// ('footstep:kind', which AUDIO.sfx plays as a few of its steps that way), and a footstep is captioned
check(/function laneCues\(L\)[\s\S]*?ln\.cue = 'footstep:' \+ kind/.test(src['js/game.js']) && /laneCues\(L\);/.test(src['js/game.js']), 'every lane cue is made the thing\'s footsteps, in one place (game.js laneCues, called as a night is built)');
check(/name\.startsWith\('footstep:'\) \? cueSteps\(/.test(audio) && /function cueSteps\(kind, pan, soft\)[\s\S]*?footstep\(kind,/.test(audio), "AUDIO.sfx plays a 'footstep:kind' cue as that thing's footsteps");
for (const f of files.filter(f => f.startsWith('js/levels/'))) {
  const m = src[f].match(/creatures: \[\{ type: '([a-z]+)'/), cr = m && src['js/creatures/' + m[1] + '.js'], snd = cr && (cr.match(/\bsound: '([A-Za-z]+)'/) || [])[1];
  if (/\bcue: '/.test(src[f]) && m) check(STEPS.has(snd || 'walker'), f + ": its lane cues are the " + m[1] + "'s footsteps ('" + (snd || 'walker') + "'), and they have a caption");
}
// the hinge: one steady, gently rising note, no wobble (no oscillator under 20 Hz on its pitch) and nothing else over it
{ const a = audio.indexOf("case 'hinge':"), h = audio.slice(a, audio.indexOf('break;', a));
  check(a > 0 && (h.match(/createOscillator/g) || []).length === 1 && !/tone\(|noise\(/.test(h) && /setValueAtTime\(470[\s\S]*linearRampToValueAtTime\(545/.test(h), 'the hinge is one oscillator rising 470 to 545 Hz, no wobble, nothing else'); }
for (const [name, file] of used.sting) check(SFX.has(name), "death sting '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.step) check(STEPS.has(name), "footstep '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.voice) check(VOICES.has(name), "voice '" + name + "' (" + file + ') has no caption');
// the menus' tap (and the item switch, ui) is only the click of what you pressed: no caption for it
check(synth.sfx.has('tap') && used.sfx.has('tap') && !SFX.has('tap') && !SFX.has('ui'), "the menus' tap is an effect the game plays, and neither it nor ui has a caption");
// the Sounds Audit lab (lab/sounds.js) is an index written by hand: every effect the synth has needs its row there, and
// the title's drone (an ambient bed with near: in its params) its rows too
const lab = fs.readFileSync(path.join(root, 'lab/sounds.js'), 'utf8');
const labRows = names(lab, /\{ kind: '(?:sfx|sting)', name: '([A-Za-z]+)'/g);
for (const name of synth.sfx) check(labRows.has(name), "effect '" + name + "' has no row in the Sounds Audit (lab/sounds.js)");
check(/kind: 'ambient', name: 'title[^\n]*near: 0/.test(lab) && /kind: 'ambient', name: 'title[^\n]*near: 1/.test(lab) && audio.includes('function titleDrone('), "the title's drone is in js/audio.js, and in the Sounds Audit far and close");
// the volume calibration's loudest sound (Settings, Volume, Calibrate, Sound effects): the sting itself, the very effect a
// death plays ('sting', with its tune), once, in the middle (not panned); no sound of the calibration's own for it any
// more (stingCalibrate, the sting's crash alone, is gone: its case, its tune, its caption, its row in the Sounds Audit).
// Its quietest: the heartbeat's first beat (its lub), tuned as the heartbeat, as loud as game.js first plays the
// heartbeat; seven of it, twice left, three across, twice right, in about two seconds
{
  const caseOf = n => { const a = audio.indexOf("case '" + n + "':"); return a < 0 ? '' : audio.slice(a, audio.indexOf('break;', a)); };
  const sting = caseOf('sting');
  const crash = ['noise(1.4, { freq: 2500, vol: 1.0, attack: 0.002', 'tone(40, 1.5, { vol: 0.7, endFreq: 25'];
  check(crash.every(p => sting.includes(p)) && sting.includes("tone(400, 1.2, { vol: 0.5, type: 'sawtooth', endFreq: 40") && /for \(let i = 0; i < 6; i\+\+\) tone\(1200 \+ Math\.random\(\) \* 2000, 0\.12, \{ vol: 0\.2, type: 'square'/.test(sting), "the sting is still its noise burst, falling saw and deep drop, with its glitter (six square blips) over them");
  const tunes = src['js/soundtune.js'], tuneOf = n => (tunes.match(new RegExp("\\n  '" + n + "': (\\{[^}]*\\})")) || [])[1];
  const everywhere = Object.values(src).join('\n') + lab + fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  check(!synth.sfx.has('stingCalibrate') && !SFX.has('stingCalibrate') && !labRows.has('stingCalibrate') && !tuneOf('stingCalibrate') && !/stingCalibrate/.test(everywhere), 'stingCalibrate is gone: no case in js/audio.js, no tune, no caption, no row in the Sounds Audit, no word of it anywhere');
  check(!/function swell\(/.test(audio), 'the reversed saw (swell) is gone with the climb it made');
  check(!!tuneOf('sting') && SFX.has('sting') && labRows.has('sting') && /name: 'sting',[^\n]*the loudest sound in the game[^\n]*once, in the middle/.test(lab), "the sting has its tune (" + tuneOf('sting') + "), its caption, and its row in the Sounds Audit says it is the calibration's loudest sound too");
  const calib = audio.slice(audio.indexOf('  function calibrate(which, onBeat)'), audio.indexOf('  function calStop()'));
  check(/if \(which === 'loud'\) \{[^}]*c\.pans\.push\(0\);\s*into\(\(\) => tuned\('sting', \(\) => sfx\('sting'\)\)\);[^}]*end\(CAL\.len\.loud\);\s*return true;\s*\}/.test(calib) && (calib.match(/sfx\('sting'\)/g) || []).length === 1 && !/sfx\('sting', /.test(calib),
    "the calibration's loudest sound is the effect 'sting' itself, tuned as 'sting', played once and not panned (pan 0), through the calibration's own way in to the effects volume");
  check(/tuned\('heartbeat', \(\) => tone\(54, 0\.13, \{ vol: CAL\.heart, endFreq: 36, pan \}\)\)/.test(audio) && /function heartbeat\(vol, fast\) \{\s*tone\(54, 0\.13, \{ vol: vol, endFreq: 36 \}\);/.test(audio),
    "the calibration plays the heartbeat's lub as the heartbeat plays it (tuned as 'heartbeat'), panned");
  check(/pans: \[-1, -1, -0\.5, 0, 0\.5, 1, 1\], gap: 0\.3, heart: 0\.04 \+ 0\.02 \* 0\.5/.test(audio) && /AUDIO\.heartbeat\(0\.04 \+ prox \* 0\.5, prox > 0\.7\)/.test(src['js/game.js']) && /!G\.muted && prox > 0\.02\)/.test(src['js/game.js']),
    'seven of the quietest, 0.3 s apart (all seven in 1.8 s): twice left, left of centre, centre, right of centre, twice right; the lub as loud as the game first plays the heartbeat (0.04 + prox * 0.5 from prox 0.02)');
  // the four play buttons make no click of their own (js/menu.js: tapFor), pressed to play or to stop
  const menu = src['js/menu.js'];
  check(/const tapFor = a => \{ if \(!CALS\[a\]\) tap\(\); \};/.test(menu) && /tapFor\(b\.dataset\.act\); act\(b\.dataset\.act, b\.dataset\.arg\);/.test(menu) && /const a = b\.dataset\.act;\s*tapFor\(a\);/.test(menu) && !/function calPlay[\s\S]*?\n  \}/.exec(menu)[0].includes("sfx('tap')") && !/function calPlay[\s\S]*?\n  \}/.exec(menu)[0].includes('tap()'),
    "the volume dialog's four play buttons are pressed without the menus' tap (in the menus' overlay and in the warning's card alike)");
  // the ambience's two ends: night 8's bed with its main off, and night 9's rain, as the nights have them
  const bedOf = k => (audio.match(new RegExp(k + ': (\\{ tune: [^}]*\\})')) || [])[1];
  const n7 = (src['js/levels/night09.js'].match(/ambient: (\{ tune: 'ambient:9'[^}]*\})/) || [])[1], n8 = (src['js/levels/night08.js'].match(/ambient: (\{ tune: 'ambient:8'[^}]*\})/) || [])[1];
  const obj = t => t && Function('return ' + t)();
  const q = obj(bedOf('ambientQuiet')), l = obj(bedOf('ambientLoud')), e8 = obj(n8), e7 = obj(n7);
  check(q && e8 && JSON.stringify(q) === JSON.stringify(Object.assign({}, e8, { drone: 0.12, tune: 'ambient:8off' })) && /startAmbient\(Object\.assign\(\{\}, L\.def\.ambient, \{ drone: 0\.12, tune: 'ambient:8off' \}\)\)/.test(src['js/levels/night08.js']),
    "the quietest ambience is night 8's bed once its main is off, as night08.js plays it (" + JSON.stringify(q) + ')');
  check(l && e7 && JSON.stringify(l) === JSON.stringify(e7), "the loudest ambience is night 9's rain (the loudest bed by measure), as night09.js has it (" + JSON.stringify(l) + ')');
}
// every sound goes through the effects volume or the ambience volume, and nothing else: no main volume left; only the
// buses (and the calibration's own two ways in, kept at those volumes) join the master gain; nothing outside js/audio.js
// makes a sound node of its own; an effect goes out through chain() (or straight to bus.effects), a bed to bus.ambient.
// (test/settings.js renders every one of them with each volume at nothing)
{
  const joins = [...audio.matchAll(/([\w.]+)\.connect\(master\)/g)].map(m => m[1]).sort().join();
  check(joins === 'bus.ambient,bus.cal,bus.calAmb,bus.effects', 'only the two buses and the calibration\'s two ways in join the master gain (' + joins + ')');
  check(/const volume = \{ effects: 1, ambient: 1 \};/.test(audio) && !/volume\.master|setVolume\('master'/.test(audio) && /master\.gain\.value = muted \? 0\.0001 : MASTER;/.test(audio), 'two volumes, effects and ambience; no main volume (the master gain fixed, Mute aside)');
  const direct = [...audio.matchAll(/\.connect\((bus\.\w+)\)/g)].map(m => m[1]);
  check(direct.every(d => ['bus.effects', 'bus.ambient', 'bus.cal', 'bus.calAmb'].includes(d)) && /dest = out \|\| bus\.effects/.test(audio) && /const b = bed\(p \|\| \{\}, bus\.ambient\)/.test(audio), 'effects go to the effects bus (chain), beds to the ambience bus (' + [...new Set(direct)].join() + ')');
  const others = files.filter(f => f !== 'js/audio.js' && f !== 'js/soundtune.js' && /create(Oscillator|Gain|BufferSource|BiquadFilter|StereoPanner)\(|new (window\.)?AudioContext/.test(src[f]));
  check(!others.length, 'no other script makes sound of its own (' + others.join() + ')');
  for (const [f, t] of [['js/menu.js', src['js/menu.js']], ['lab/sounds.js', lab]]) check(!/\bmaster\b/.test(t.replace(/\/\/[^\n]*/g, '')), f + ': no main volume left in its code');
  check(/settings: \{ muted: false, effects: 1, ambient: 1, /.test(src['js/save.js']) && /delete S\.master;/.test(src['js/save.js']), 'js/save.js: a new save has the two volumes and no main one, and an old save\'s main volume is folded into them and dropped');
}
// the clock's tick at the start of a night: 14 semitones up on the -48.5 it was
check(/\n  'tick': \{ pitch: -34\.5 \},/.test(src['js/soundtune.js']), 'the tick is tuned 14 semitones higher than it was (-48.5 + 14 = -34.5)');
console.log('  ' + Object.entries(used).map(([k, v]) => v.size + ' ' + k).join(', ') + ' names checked');
console.log(failures ? ('\n' + failures + ' FAILURES in sounds') : ('\nALL CHECKS PASSED in sounds (' + checks + ' checks)'));
process.exit(failures ? 1 : 0);
