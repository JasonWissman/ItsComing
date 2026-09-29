'use strict';
// Every sound the game asks for exists in the synthesiser (js/audio.js), and every sound that carries information
// (a lane's cue, which on Nightmare is the only warning of a switch; a death sting; a footstep; a voice) has a caption
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
for (const [name, file] of used.cue) check(SFX.has(name), "lane cue '" + name + "' (" + file + ') has no caption; on Nightmare it is the only warning');
for (const [name, file] of used.sting) check(SFX.has(name), "death sting '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.step) check(STEPS.has(name), "footstep '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.voice) check(VOICES.has(name), "voice '" + name + "' (" + file + ') has no caption');
console.log('  ' + Object.entries(used).map(([k, v]) => v.size + ' ' + k).join(', ') + ' names checked');
console.log(failures ? ('\n' + failures + ' FAILURES in sounds') : ('\nALL CHECKS PASSED in sounds (' + checks + ' checks)'));
process.exit(failures ? 1 : 0);
