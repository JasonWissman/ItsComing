'use strict';
// Brings an edited export back in for good: `npm run lab2d:import -- path/to/grinner.svg [id]` writes
// lab2d/js/creatures/edited/<id>.js (the SVG text, registered with RIG) and lists it in the manifest, so the lab
// shows "<name> (edited)" next to the code version from then on. Dropping the file on the lab page does the
// same for one session; this makes it part of the repository.
const path = require('path');
const fs = require('fs');
const file = process.argv[2];
if (!file) { console.error('usage: node lab2d/tools/import-creature.js <edited.svg> [id]'); process.exit(2); }
const text = fs.readFileSync(file, 'utf8');
const m = /data-creature="([^"]+)"/.exec(text);
const id = (process.argv[3] || (m && m[1]) || path.basename(file, '.svg')).replace(/[^a-z0-9]+/gi, '-').toLowerCase();
if (!/<svg[\s>]/.test(text)) { console.error('not an SVG: ' + file); process.exit(1); }
const parts = (text.match(/<g[^>]*\bid="/g) || []).length;
const DIR = path.join(__dirname, '..', 'js', 'creatures', 'edited');
fs.mkdirSync(DIR, { recursive: true });
const js = "'use strict';\n// " + id + ": an edited export, brought in by lab2d/tools/import-creature.js (" + new Date().toISOString().slice(0, 10) + "). Generated: edit the .svg, not this.\nRIG.register(" + JSON.stringify(id) + ", " + JSON.stringify(text) + ");\n";
fs.writeFileSync(path.join(DIR, id + '.js'), js);
const manifestPath = path.join(DIR, 'manifest.js');
let manifest = fs.readFileSync(manifestPath, 'utf8');
const listM = /const EDITED_CREATURES = \[([^\]]*)\];/.exec(manifest);
const list = listM && listM[1].trim() ? listM[1].split(',').map(s => s.trim().replace(/^'|'$/g, '')).filter(Boolean) : [];
if (!list.includes(id)) list.push(id);
manifest = manifest.replace(/const EDITED_CREATURES = \[[^\]]*\];/, 'const EDITED_CREATURES = [' + list.map(s => "'" + s + "'").join(', ') + '];');
fs.writeFileSync(manifestPath, manifest);
console.log('imported ' + file + ' as "' + id + '" (' + parts + ' named groups) -> ' + path.relative(process.cwd(), path.join(DIR, id + '.js')) + '; the lab lists it as the edited version');
