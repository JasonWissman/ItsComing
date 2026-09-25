// The Mirror Maze: box and key, box on the pedestal, wind it, and it walks to the tune. Hard mends the
// spring and pulls the dust sheets first; on Nightmare the spring runs down part way (the bell rope shows
// itself then) and the box is rewound as needed.
const rewind = ['waitUntil', "G.L.won ? true : ((!G.L.s.playing && G.L.s.placed) ? (useTarget(G.L.targets.find(t => t.id === 'pedestal')), false) : false)", 60000];
const wind = [['use', 'pedestal'], ['expect', 'G.L.s.placed', 'box placed'], ['clickUntil', 'pedestal', 'G.L.s.playing', 250, 10]];
const finish = [rewind, ['expect', 'G.L.won', 'it came to the music box']];
const runDown = [['waitUntil', 'G.L.won || !G.L.s.playing', 15000], ['expect', "G.L.won || !G.L.targets.find(t => t.id === 'rope').hidden", 'the spring ran down and the bell rope showed itself']];
module.exports = {
  normal: [['pickup', 'boxkey'], ['pickup', 'musicbox']].concat(wind, finish),
  hard: [['use', 'sheetN'], ['use', 'sheetE'], ['expect', 'G.L.s.mirrors.every(m => m.live)', 'sheets pulled'], ['pickup', 'boxkey'], ['pickup', 'brokenbox'], ['pickup', 'spring'], ['combine', 'brokenbox', 'spring'], ['expect', "G.inv.some(i => i.id === 'musicbox')", 'box mended']].concat(wind, finish),
  nightmare: [['expect', "G.L.targets.find(t => t.id === 'rope').hidden", 'no bell rope yet'], ['use', 'sheetN'], ['use', 'sheetE'], ['pickup', 'boxkey'], ['pickup', 'brokenbox'], ['pickup', 'spring'], ['combine', 'brokenbox', 'spring'], ['expect', "G.inv.some(i => i.id === 'musicbox')", 'box mended']].concat(wind, runDown, finish),
};
