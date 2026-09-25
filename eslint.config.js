'use strict';
// A static site with plain script files: every module is a global, so they are declared here rather than imported.
const globals = {
  window: 'readonly', document: 'readonly', location: 'readonly', localStorage: 'readonly', performance: 'readonly', requestAnimationFrame: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly', console: 'readonly', URLSearchParams: 'readonly', DOMMatrix: 'readonly', AudioContext: 'readonly', navigator: 'readonly',
  TAU: 'readonly', DEG: 'readonly', clamp: 'readonly', lerp: 'readonly', smoothstep: 'readonly', easeOut: 'readonly', easeIn: 'readonly', wrapPi: 'readonly', mixc: 'readonly', scalec: 'readonly', rgba: 'readonly', mulberry32: 'readonly', rotY: 'readonly',
  P_poly: 'readonly', P_limb: 'readonly', P_ell: 'readonly', P_rect: 'readonly', P_line: 'readonly', headTiltJerk: 'readonly', fingers: 'readonly', strands: 'readonly',
  AUDIO: 'readonly', TEX: 'readonly', LIGHT: 'readonly', WEATHER: 'readonly', R: 'readonly', APPROACH: 'readonly', Seq: 'readonly', SAVE: 'readonly', MENU: 'readonly', HANDS: 'readonly', STORY: 'readonly', CAPTIONS: 'readonly',
  CREATURES: 'readonly', ICONS: 'readonly', SC: 'readonly', LEVELS: 'readonly', G: 'readonly', UI: 'readonly', DIFFICULTIES: 'readonly', DIR_NAMES: 'readonly', PITCH_DOWN: 'readonly', AFTERMATHS: 'readonly',
  mkItem: 'readonly', mkTarget: 'readonly', mkContainer: 'readonly', mkRecipe: 'readonly', iconSprite: 'readonly', spotKey: 'readonly', spotLocal: 'readonly', pickSpot: 'readonly', newItem: 'readonly', combine: 'readonly', useTarget: 'readonly', dropActive: 'readonly', win: 'readonly', die: 'readonly', worldLight: 'readonly', validateContent: 'readonly', buildLevel: 'readonly', buildLevelDef: 'readonly', ensureAudio: 'readonly', showOverlay: 'readonly', hideOverlay: 'readonly', setMuted: 'readonly', setDifficulty: 'readonly', startLevel: 'readonly', restartLevel: 'readonly', resumeGame: 'readonly', pauseGame: 'readonly', showTitle: 'readonly', proceedFromSurvived: 'readonly', proceed: 'readonly', activeUse: 'readonly', updateHover: 'readonly', setState: 'readonly', escapeHtml: 'readonly', startMorning: 'readonly', throwItem: 'readonly', pointInPoly: 'readonly',
};
module.exports = [
  { ignores: ['node_modules/**', 'test/shots/**'] },
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
