'use strict';
// A static site with plain script files: every module is a global, so they are declared here rather than imported.
const globals = {
  window: 'readonly', document: 'readonly', Event: 'readonly', location: 'readonly', localStorage: 'readonly', performance: 'readonly', requestAnimationFrame: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', console: 'readonly', URLSearchParams: 'readonly', DOMMatrix: 'readonly', AudioContext: 'readonly', navigator: 'readonly',
  TAU: 'readonly', DEG: 'readonly', clamp: 'readonly', lerp: 'readonly', smoothstep: 'readonly', easeOut: 'readonly', easeIn: 'readonly', wrapPi: 'readonly', mixc: 'readonly', scalec: 'readonly', rgba: 'readonly', mulberry32: 'readonly', rotY: 'readonly',
  P_poly: 'readonly', P_limb: 'readonly', P_ell: 'readonly', P_rect: 'readonly', P_line: 'readonly', headTiltJerk: 'readonly', heartShape: 'readonly', smallKey: 'readonly', fingers: 'readonly', strands: 'readonly',
  AUDIO: 'readonly', LIGHT: 'readonly', WEATHER: 'readonly', R: 'readonly', APPROACH: 'readonly', Seq: 'readonly', SAVE: 'readonly', MENU: 'readonly', STORY: 'readonly', CAPTIONS: 'readonly',
  CREATURES: 'readonly', ICONS: 'readonly', SC: 'readonly', LEVELS: 'readonly', G: 'readonly', UI: 'readonly', DIFFICULTIES: 'readonly', DIR_NAMES: 'readonly', PITCH_DOWN: 'readonly', AFTERMATHS: 'readonly',
  mkItem: 'readonly', mkTarget: 'readonly', mkContainer: 'readonly', mkRecipe: 'readonly', iconSprite: 'readonly', spotKey: 'readonly', spotLocal: 'readonly', pickSpot: 'readonly', newItem: 'readonly', combine: 'readonly', useTarget: 'readonly', dropActive: 'readonly', win: 'readonly', die: 'readonly', worldLight: 'readonly', validateContent: 'readonly', buildLevel: 'readonly', buildLevelDef: 'readonly', ensureAudio: 'readonly', showOverlay: 'readonly', hideOverlay: 'readonly', setMuted: 'readonly', setDifficulty: 'readonly', startLevel: 'readonly', restartLevel: 'readonly', resumeGame: 'readonly', pauseGame: 'readonly', showTitle: 'readonly', proceedFromSurvived: 'readonly', proceed: 'readonly', activeUse: 'readonly', updateHover: 'readonly', setState: 'readonly', escapeHtml: 'readonly', startMorning: 'readonly', throwItem: 'readonly', pointInPoly: 'readonly',
};
// the lab (lab/js) is ES modules importing three; its browser globals are the usual ones
const labGlobals = { window: 'readonly', document: 'readonly', location: 'readonly', localStorage: 'readonly', performance: 'readonly', requestAnimationFrame: 'readonly', setTimeout: 'readonly', console: 'readonly', URLSearchParams: 'readonly', URL: 'readonly', Blob: 'readonly', Promise: 'readonly', Uint8Array: 'readonly', Uint16Array: 'readonly', Float32Array: 'readonly', Float64Array: 'readonly', WeakMap: 'readonly', Map: 'readonly', Set: 'readonly', Number: 'readonly', String: 'readonly', Object: 'readonly', Array: 'readonly', Math: 'readonly', JSON: 'readonly', Date: 'readonly', Error: 'readonly', Infinity: 'readonly', isNaN: 'readonly', parseFloat: 'readonly', parseInt: 'readonly', navigator: 'readonly' };
// lab2d (the ink lab) is classic scripts like the game, over the game's globals and its own
const lab2dGlobals = Object.assign({}, globals, { DOMMatrix: 'readonly', DOMParser: 'readonly', Path2D: 'readonly', fetch: 'readonly', Blob: 'readonly', URL: 'readonly', Promise: 'readonly', Map: 'readonly', Set: 'readonly', Float64Array: 'readonly', Uint8Array: 'readonly', Number: 'readonly', Object: 'readonly', Array: 'readonly', String: 'readonly', Math: 'readonly', JSON: 'readonly', Error: 'readonly', isNaN: 'readonly', parseFloat: 'readonly', parseInt: 'readonly',
  hashf: 'readonly', P_hatch: 'readonly', P_hatchEll: 'readonly', tornEdge: 'readonly', P_tatter: 'readonly', P_ragged: 'readonly', P_drip: 'readonly', P_flame: 'readonly', P_halo: 'readonly', P_ribs: 'readonly', P_wildHair: 'readonly', P_stripes: 'readonly', P_brush: 'readonly',
  PASSES: 'readonly', POST2D: 'readonly', HANDS: 'readonly', SVGSPRITE: 'readonly', SCENES: 'readonly', PANEL: 'readonly', LAB2: 'readonly', RECORD: 'readonly', RIG: 'readonly', EDITED_CREATURES: 'readonly' });
module.exports = [
  { ignores: ['node_modules/**', 'test/shots/**', 'lab/vendor/**'] },
  {
    files: ['lab2d/js/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals: lab2dGlobals },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }], 'no-redeclare': 'off', 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    files: ['lab/js/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'module', globals: labGlobals },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }], 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    files: ['lab2d/tools/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { require: 'readonly', module: 'writable', process: 'readonly', __dirname: 'readonly', console: 'readonly', JSON: 'readonly', Array: 'readonly', Promise: 'readonly', Date: 'readonly', window: 'readonly', LAB2: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    files: ['lab/tools/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { require: 'readonly', module: 'writable', process: 'readonly', __dirname: 'readonly', console: 'readonly', JSON: 'readonly', Array: 'readonly' } },
    rules: { 'no-undef': 'error', 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    files: ['js/**/*.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'script', globals },
    rules: { 'no-undef': 'error', 'no-unused-vars': ['warn', { vars: 'local', args: 'none', caughtErrors: 'none', varsIgnorePattern: '^_' }], 'no-redeclare': 'off', 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
  {
    files: ['test/**/*.js', 'eslint.config.js'],
    languageOptions: { ecmaVersion: 2022, sourceType: 'commonjs', globals: { require: 'readonly', module: 'writable', process: 'readonly', __dirname: 'readonly', console: 'readonly', setTimeout: 'readonly', Date: 'readonly', JSON: 'readonly', Math: 'readonly', Set: 'readonly', Map: 'readonly', Promise: 'readonly' } },
    rules: { 'no-undef': 'off', 'no-unused-vars': 'off', 'no-empty': ['error', { allowEmptyCatch: true }] },
  },
];
