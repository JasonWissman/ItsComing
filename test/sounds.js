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
const known = new Set([...audio.matchAll(/case '([A-Za-z]+)'/g), ...audio.matchAll(/kind === '([A-Za-z]+)'/g)].map(m => m[1]));
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
  scan(f, /\bcue: '([A-Za-z]+)'/g, 'cue');
  scan(f, /\bsting: '([A-Za-z]+)'/g, 'sting');
  scan(f, /\bsound: '([A-Za-z]+)'/g, 'step');
  scan(f, /AUDIO\.footstep\('([A-Za-z]+)'/g, 'step');
  scan(f, /voice: \{ kind: '([A-Za-z]+)'/g, 'voice');
  scan(f, /AUDIO\.voice\('([A-Za-z]+)'/g, 'voice');
  scan(f, /setLoop\('([A-Za-z]+)'/g, 'loop');
  scan(f, /setLoop\([^;]*\? '([A-Za-z]+)'/g, 'loop');
}
check(known.size > 40 && SFX.size > 40, 'the synth and caption tables were found (' + known.size + ' sounds, ' + SFX.size + ' sound captions)');
for (const [kind, names] of Object.entries(used)) for (const [name, file] of names) check(known.has(name), kind + " '" + name + "' (" + file + ') is not a sound in js/audio.js');
for (const [name, file] of used.cue) check(SFX.has(name), "lane cue '" + name + "' (" + file + ') has no caption; on Nightmare it is the only warning');
for (const [name, file] of used.sting) check(SFX.has(name), "death sting '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.step) check(STEPS.has(name), "footstep '" + name + "' (" + file + ') has no caption');
for (const [name, file] of used.voice) check(VOICES.has(name), "voice '" + name + "' (" + file + ') has no caption');
console.log('  ' + Object.entries(used).map(([k, v]) => v.size + ' ' + k).join(', ') + ' names checked');
console.log(failures ? ('\n' + failures + ' FAILURES in sounds') : ('\nALL CHECKS PASSED in sounds (' + checks + ' checks)'));
process.exit(failures ? 1 : 0);
