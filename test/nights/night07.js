// The Lighthouse: fuse into the box, wind the clockwork; on the harder tiers make the fuse first and pull the brake on time.
const normal = [['pickup', 'fuse'], ['use', 'fusebox', 2, 300], ['expect', 'G.L.s.power', 'lamp powered'], ['clickUntil', 'winder', 'G.L.s.turning', 250, 12]];
const hard = [['use', 'locker'], ['pickup', 'wire'], ['pickup', 'fusebody'], ['combine', 'fusebody', 'wire'], ['expect', "G.inv.some(i => i.id === 'fuse')", 'made a fuse'], ['use', 'fusebox', 2, 300], ['expect', 'G.L.s.power', 'lamp powered'], ['clickUntil', 'winder', 'G.L.s.turning', 250, 12], ['face', 4, false], ['waitUntil', 'G.L.s.beamOnLane()', 25000], ['click', 'brake'], ['expect', 'G.L.won', 'brake locked the beam on it and the night is won']];
module.exports = { normal, hard, nightmare: hard };
