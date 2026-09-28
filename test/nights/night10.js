// The Mirror Maze: find the odd mirror, put the box on the pedestal before it, fit its own key (the one with the heart)
// and wind it, and it comes in beside the box to the tune. Easy first tries a wrong pedestal (the tune plays for nobody
// and the box comes back); Nightmare first tries a wrong key. Hard and Nightmare pull the dust sheets and mend the spring;
// on Nightmare the spring runs down part way (the bell rope shows itself then) and the box is rewound as needed.
const byOdd = f => [3, 2, 1, 0].reduce((otherwise, k) => [['branch', 'G.L.s.odd === ' + k, f(k), otherwise]], []);
const ped = k => 'pedestal' + k;
const place = k => [['use', ped(k)], ['expect', 'G.L.s.placedAt === ' + k, 'box on pedestal ' + k]];
const fitKey = k => [['use', ped(k)], ['expect', 'G.L.s.keyIn', 'its own key fitted']];
const wind = k => [['clickUntil', ped(k), 'G.L.s.playing', 250, 10]];
const right = k => place(k).concat(fitKey(k), wind(k));
const wrong = k => {
  const w = (k + 1) % 4;
  return place(w).concat(fitKey(w), [['clickUntil', ped(w), 'G.L.s.placedAt < 0', 250, 10], ['expect', "!G.L.s.playing && G.inv.some(i => i.id === 'musicbox')", 'the wrong mirror: the tune played for nobody and the box came back']]);
};
const wrongKey = k => place(k).concat([['pickup', 'roundkey'], ['use', ped(k)], ['expect', '!G.L.s.keyIn', 'a key without the heart does not fit'], ['pickup', 'boxkey']], fitKey(k), wind(k));
const sheets = [0, 1, 2, 3].map(k => ['branch', "G.L.targets.some(t => t.id === 'sheet" + k + "')", [['use', 'sheet' + k]]]);
const mend = [['pickup', 'brokenbox'], ['pickup', 'spring'], ['combine', 'brokenbox', 'spring'], ['expect', "G.inv.some(i => i.id === 'musicbox')", 'box mended']];
const rewind = ['waitUntil', "G.L.won ? true : ((!G.L.s.playing && G.L.s.placedAt >= 0) ? (useTarget(G.L.targets.find(t => t.id === 'pedestal' + G.L.s.odd)), false) : false)", 60000];
const finish = [rewind, ['expect', 'G.L.won', 'it came to the music box']];
const runDown = [['waitUntil', 'G.L.won || !G.L.s.playing', 15000], ['expect', "G.L.won || !G.L.targets.find(t => t.id === 'rope').hidden", 'the spring ran down and the bell rope showed itself']];
module.exports = {
  easy: [['pickup', 'boxkey'], ['pickup', 'musicbox']].concat(byOdd(k => wrong(k).concat(right(k))), finish),
  normal: [['pickup', 'boxkey'], ['pickup', 'musicbox']].concat(byOdd(right), finish),
  hard: sheets.concat([['expect', 'G.L.s.mirrors.every(m => m.live)', 'sheets pulled'], ['pickup', 'boxkey']], mend, byOdd(right), finish),
  nightmare: [['expect', "G.L.targets.find(t => t.id === 'rope').hidden", 'no bell rope yet']].concat(sheets, mend, byOdd(wrongKey), runDown, finish),
};
