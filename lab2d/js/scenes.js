'use strict';
// ---------- three sets, built with the game's own scenery builders (SC.*) through a minimal level object ----------
// corridor: the hallway of doors from the reference, lit by a torch cone from the eye, the fog close.
// field: the back door of night 1's farmhouse, the field and the fence beyond it, mist.
// stage: a dark floor and nothing else, for the line-up.
const SCENES = (() => {
  function level(pal, eyeH) {
    const L = { props: [], items: [], targets: [], lanes: [], lights: [], clouds: null, eyeH: eyeH || 1.65, pal: Object.assign({ id: 'lab' }, pal), rand: mulberry32(7), facing: 0, s: {} };
    L.pt = (x, y, z) => [x, y, z];
    L.at = (deg, dist, y) => [Math.sin(deg * DEG) * dist, y, Math.cos(deg * DEG) * dist];
    L.addAperture = () => {};
    L.tier = n => n;
    return L;
  }
  const builders = {
    corridor() {
      const L = level({ skyTop: [12, 12, 14], fog: [16, 15, 17], ground: [44, 42, 44], fogDist: 16 });
      const wall = [78, 74, 72], wallD = [54, 50, 50], door = [60, 56, 54], panel = [46, 42, 42], frame = [92, 86, 80], trim = [36, 32, 32];
      const W = 1.6, H = 2.9, len = 42;
      SC.floorQ(L, -W, -3, W, len, 0, [50, 48, 50], { tex: 'planks', texScale: 1.6 });
      SC.quad(L, [-W, H, -3], [W, H, -3], [W, H, len], [-W, H, len], [30, 28, 30]);
      SC.wallV(L, -W, -3, -W, len, 0, H, wall); SC.wallV(L, W, -3, W, len, 0, H, wall);
      // a skirting and a picture rail, the long lines that give the hall its depth
      for (const x of [-W, W]) { SC.wallV(L, x * 0.995, -3, x * 0.995, len, 0, 0.14, trim); SC.wallV(L, x * 0.995, -3, x * 0.995, len, 2.2, 2.26, trim); }
      // doors every few metres on both sides, set into frames, two sunk panels each; every other one ajar
      for (let z = 2; z < len - 2; z += 3.4) for (const s of [-1, 1]) {
        const x = s * W, inset = s * 0.01;
        SC.box(L, s > 0 ? x - 0.12 : x, s > 0 ? x : x + 0.12, 0, 2.25, z - 0.55, z + 0.55, frame);
        SC.wallV(L, x - inset * 8, z - 0.45, x - inset * 8, z + 0.45, 0.02, 2.12, door);
        for (const [y0, y1] of [[0.25, 0.95], [1.2, 1.95]]) SC.wallV(L, x - inset * 9, z - 0.32, x - inset * 9, z + 0.32, y0, y1, panel);
        SC.wallV(L, x - inset * 10, z + 0.33, x - inset * 10, z + 0.37, 0.98, 1.08, frame);   // the handle
      }
      // the far end: a wall with one more door, shut
      SC.wallV(L, -W, len, W, len, 0, H, wallD);
      SC.box(L, -0.7, 0.7, 0, 2.2, len - 0.1, len, frame); SC.wallV(L, -0.55, len - 0.11, 0.55, len - 0.11, 0, 2.1, door);
      // the torch: a cone from the eye, the only light; its edge is what the post pass's circle follows
      L.lights.push({ x: 0, y: 1.62, z: 0.1, r: 14, i: 0.55, color: [225, 215, 195], cone: { x: 0, y: -0.08, z: 1, cos: Math.cos(26 * DEG) } });
      L.weather = { kind: 'motes', density: 0.6 };
      return L;
    },
    field() {
      const L = level({ skyTop: [6, 8, 18], fog: [46, 52, 68], ground: [36, 46, 32], fogDist: 105 });
      const wood = [50, 40, 33], woodD = [38, 30, 25], frame = [96, 76, 52], floor = [46, 37, 30], tex = { tex: 'planks', texScale: 1.4 };
      SC.stars(L, 3, 170, 0.8); SC.clouds(L, 4, 5, [34, 38, 54], 0.4); SC.moon(L, 24, 13, 8, [228, 222, 200]);
      const rng = mulberry32(11);
      for (let i = 0; i < 32; i++) { const x = (rng() * 2 - 1) * 120, z = 60 + rng() * 70; SC.tree(L, x, z, 7 + rng() * 7, 'bare', (rng() * 1e6) | 0); }
      for (let i = 0; i < 7; i++) { const x = (rng() * 2 - 1) * 60, z = 24 + rng() * 26; if (Math.abs(x) > 6) SC.tree(L, x, z, 5 + rng() * 5, rng() < 0.5 ? 'bare' : 'round', (rng() * 1e6) | 0); }
      SC.fenceLine(L, -45, 17, 45, 17, 2.7, 1.15, [44, 40, 34]);
      SC.groundDots(L, 5, 220, 6, 60, 110, [28, 36, 24], 0.22);
      SC.floorQ(L, -2.8, -2.4, 2.8, 2.6, 0.006, floor, { tex: 'planks', texScale: 1.2 });
      SC.quad(L, [-2.8, 2.7, -2.4], [2.8, 2.7, -2.4], [2.8, 2.7, 2.6], [-2.8, 2.7, 2.6], [30, 24, 20]);
      SC.doorway(L, { z: 2.6, w: 1.6, h: 2.12, wallH: 2.7, left: -7, right: 7, color: wood, opts: tex });
      SC.doorway(L, { deg: 180, z: 2.4, w: 1.4, h: 2.12, wallH: 2.7, left: -7, right: 7, color: woodD, opts: tex });
      SC.wallV(L, -2.8, -2.4, -2.8, 2.6, 0, 2.7, woodD, tex); SC.wallV(L, 2.8, -2.4, 2.8, 2.6, 0, 2.7, woodD, tex);
      for (const [z, w] of [[2.55, 0.8], [-2.35, 0.7]]) { SC.wallV(L, -w - 0.12, z, -w, z, 0, 2.2, frame); SC.wallV(L, w, z, w + 0.12, z, 0, 2.2, frame); SC.wallV(L, -w - 0.12, z, w + 0.12, z, 2.1, 2.22, frame); }
      SC.box(L, -1.1, 1.1, 0, 0.16, 2.6, 3.3, [74, 70, 64]);
      SC.box(L, 1.5, 2.6, 0.72, 0.78, -0.55, 0.45, [74, 56, 42]);
      for (const [x, z] of [[1.55, -0.5], [2.55, -0.5], [1.55, 0.4], [2.55, 0.4]]) SC.box(L, x - 0.04, x + 0.04, 0, 0.72, z - 0.04, z + 0.04, [62, 46, 34]);
      L.lights.push({ x: 0, y: 1.6, z: -0.2, r: 4.5, i: 0.35, color: [140, 160, 220] });
      L.weather = { kind: 'mist', density: 0.7, wind: 0.3 };
      return L;
    },
    stage() {
      const L = level({ skyTop: [8, 8, 12], fog: [30, 30, 36], ground: [34, 32, 34], fogDist: 60 });
      SC.stars(L, 3, 120, 0.5);
      SC.groundDots(L, 9, 160, 3, 50, 150, [26, 25, 27], 0.3);
      L.lights.push({ x: 0, y: 2.2, z: 2.5, r: 9, i: 0.3, color: [220, 215, 200] });
      return L;
    },
  };
  function build(name) { const L = (builders[name] || builders.stage)(); L.name = name; return L; }
  return { build, names: Object.keys(builders) };
})();
