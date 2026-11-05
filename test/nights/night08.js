// The Diner: hold the shutter down, then open the breaker panel and flip the tripped switches back up (two of the three
// on Normal, all three on Nightmare). Both shutters on every tier; once its way in is shut it goes round to the pane
// under the OPEN sign. Nightmare needs the crank first, and carries a bent crank that the shutter refuses, which the harness tries first.
const rounded = ['expect', "G.L.s.route === 'walk' || G.L.s.route === 'sign'", 'its way in is shut: it goes round to the window under the sign'];
const breakers = [rounded, ['use', 'panel'], ['expect', 'G.L.s.panelOpen', 'panel open'], ['use', 'brkA'], ['use', 'brkB'], ['use', 'brkC'], ['expect', 'G.L.s.fixed && G.L.s.brk.every(b => b)', 'tripped switches up, lights fixed']];
const normal = [['hold', 'shutterN', 8000], ['expect', 'G.L.s.shutN', 'window shutter down'], ['hold', 'shutterD', 8000], ['expect', 'G.L.s.shutD', 'door shutter down']].concat(breakers);
const nightmare = [['pickup', 'bentcrank'], ['use', 'shutterN'], ['expect', "G.L.targets.find(t => t.id === 'shutterN').hold === 0", 'bent crank refused'],
  ['pickup', 'crank'], ['use', 'shutterN'], ['expect', "G.L.targets.find(t => t.id === 'shutterN').hold > 0", 'crank fitted to the window shutter'], ['hold', 'shutterN', 8000], ['use', 'shutterD'], ['hold', 'shutterD', 8000], ['expect', 'G.L.s.shutN && G.L.s.shutD', 'both shutters down']].concat(breakers);
module.exports = { normal, nightmare };
