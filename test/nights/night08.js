// The Diner: hold the shutter down, then the breaker sequence (main off, reset the three, main on). Both shutters on every tier.
const breakers = [['use', 'panel'], ['expect', 'G.L.s.panelOpen', 'panel open'], ['use', 'main'], ['expect', '!G.L.s.mainOn', 'main off'], ['use', 'brkA'], ['use', 'brkB'], ['use', 'brkC'], ['use', 'main'], ['expect', 'G.L.s.fixed', 'breakers reset, lights fixed']];
const normal = [['hold', 'shutterN', 8000], ['expect', 'G.L.s.shutN', 'window shutter down'], ['hold', 'shutterD', 8000], ['expect', 'G.L.s.shutD', 'door shutter down']].concat(breakers);
const hard = [['pickup', 'crank'], ['use', 'shutterN'], ['expect', "G.L.targets.find(t => t.id === 'shutterN').hold > 0", 'crank fitted to the window shutter'], ['hold', 'shutterN', 8000], ['use', 'shutterD'], ['hold', 'shutterD', 8000], ['expect', 'G.L.s.shutN && G.L.s.shutD', 'both shutters down']].concat(breakers);
module.exports = { normal, hard, nightmare: hard };
