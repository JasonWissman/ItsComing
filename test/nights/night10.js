// The Mirror Maze: box and key, box on the pedestal, wind it, and it walks to the tune. Hard mends the
// spring and pulls the dust sheets first; on Nightmare the spring runs down and is rewound as needed.
const rewind = ['waitUntil', "G.L.won ? true : ((!G.L.s.playing && G.L.s.placed) ? (useTarget(G.L.targets.find(t => t.id === 'pedestal')), false) : false)", 60000];
const wind = [['use', 'pedestal'], ['expect', 'G.L.s.placed', 'box placed'], ['clickUntil', 'pedestal', 'G.L.s.playing', 250, 10], rewind, ['expect', 'G.L.won', 'it came to the music box']];
module.exports = {
  normal: [['pickup', 'boxkey'], ['pickup', 'musicbox']].concat(wind),
  hard: [['use', 'sheetN'], ['use', 'sheetE'], ['expect', 'G.L.s.mirrors.every(m => m.live)', 'sheets pulled'], ['pickup', 'boxkey'], ['pickup', 'brokenbox'], ['pickup', 'spring'], ['combine', 'brokenbox', 'spring'], ['expect', "G.inv.some(i => i.id === 'musicbox')", 'box mended']].concat(wind),
  nightmare: [['use', 'sheetN'], ['use', 'sheetE'], ['pickup', 'boxkey'], ['pickup', 'brokenbox'], ['pickup', 'spring'], ['combine', 'brokenbox', 'spring'], ['expect', "G.inv.some(i => i.id === 'musicbox')", 'box mended']].concat(wind),
};
