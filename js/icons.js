'use strict';
// ---------- item icons. Each draws inside a unit box: x in [-0.5,0.5], y in [0,1], +y up ----------
// a heart: the music box's keyhole plate, and the bow of its own key
function heartShape(ctx, x, y, s, col, hole) {
  P_ell(ctx, x - s * 0.5, y + s * 0.25, s * 0.52, s * 0.5, col); P_ell(ctx, x + s * 0.5, y + s * 0.25, s * 0.52, s * 0.5, col);
  P_poly(ctx, [[x - s * 1.0, y + s * 0.15], [x + s * 1.0, y + s * 0.15], [x, y - s * 0.95]], col);
  if (hole) P_ell(ctx, x, y + s * 0.1, s * 0.25, s * 0.25, hole);
}
// a small key, pointing down, told apart from the others only by the shape of its bow
function smallKey(ctx, P, bow, rgb) {
  const m = P.col(rgb), d = P.col(scalec(rgb, 0.55));
  P_line(ctx, 0, 0.62, 0, 0.12, 0.09, m);
  P_rect(ctx, 0, 0.1, 0.16, 0.07, m); P_rect(ctx, 0, 0.22, 0.11, 0.06, m);
  if (bow === 'heart') heartShape(ctx, 0, 0.76, 0.2, m, d);
  else if (bow === 'square') { P_rect(ctx, -0.17, 0.62, 0.34, 0.3, m); P_rect(ctx, -0.08, 0.7, 0.16, 0.14, d); }
  else if (bow === 'clover') { for (const [x, y] of [[-0.1, 0.76], [0.1, 0.76], [0, 0.92]]) P_ell(ctx, x, y, 0.1, 0.1, m); P_ell(ctx, 0, 0.8, 0.04, 0.04, d); }
  else { P_ell(ctx, 0, 0.78, 0.18, 0.18, m); P_ell(ctx, 0, 0.78, 0.08, 0.08, d); }
}
const ICONS = {
  // a claw hammer: a wooden handle with a dark grip, a steel head with its striking face on one side and the split claw
  // curling back on the other
  hammer(ctx, P) {
    const wood = P.col([122, 88, 52]), woodL = P.col([156, 118, 74]), grip = P.col([58, 42, 30]), ridge = P.col([40, 30, 22]);
    const steel = P.col([88, 88, 96]), steelL = P.col([132, 132, 142]), steelD = P.col([58, 58, 66]), split = P.col([22, 22, 26]);
    ctx.save(); ctx.rotate(-0.55);
    P_poly(ctx, [[-0.055, 0.0], [0.055, 0.0], [0.045, 0.78], [-0.045, 0.78]], wood);
    P_line(ctx, 0.022, 0.25, 0.016, 0.72, 0.018, woodL);
    P_poly(ctx, [[-0.06, 0.0], [0.06, 0.0], [0.058, 0.22], [-0.058, 0.22]], grip);
    for (const y of [0.07, 0.145]) P_line(ctx, -0.05, y, 0.05, y, 0.012, ridge);
    P_poly(ctx, [[-0.08, 0.95], [-0.22, 0.94], [-0.34, 0.88], [-0.43, 0.76], [-0.35, 0.77], [-0.23, 0.81], [-0.08, 0.76]], steelD);
    P_line(ctx, -0.1, 0.86, -0.37, 0.8, 0.022, split);
    P_rect(ctx, -0.09, 0.72, 0.29, 0.23, steel);
    P_rect(ctx, 0.18, 0.69, 0.15, 0.29, steelL);
    P_line(ctx, -0.07, 0.93, 0.17, 0.93, 0.02, steelL);
    ctx.restore();
  },
  planks(ctx, P) {
    for (let i = 0; i < 3; i++) {
      const c = i % 2 ? [124, 94, 58] : [104, 76, 46], grain = P.col([78, 56, 32]), hole = P.col([44, 32, 20]);
      ctx.save(); ctx.translate(0, 0.14 + i * 0.3); ctx.rotate((i - 1) * 0.07);
      P_rect(ctx, -0.48, -0.1, 0.96, 0.2, P.col(c));
      P_rect(ctx, -0.48, -0.1, 0.96, 0.035, P.col(scalec(c, 0.68)));                  // its shadowed lower edge
      P_rect(ctx, -0.48, 0.072, 0.96, 0.028, P.col(mixc(c, [214, 184, 134], 0.28)));  // its lit upper edge
      P_line(ctx, -0.4, 0.02, 0.4, 0.0, 0.012, grain);
      P_line(ctx, -0.3, -0.04, 0.35, -0.03, 0.008, grain);
      for (const x of [-0.42, 0.42]) P_ell(ctx, x, 0.0, 0.017, 0.017, hole);          // old nail holes at its ends
      ctx.restore();
    }
  },
  keys(ctx, P) {
    const m = P.col([180, 170, 124]), d = P.col([112, 102, 70]), l = P.col([226, 216, 172]);
    ctx.strokeStyle = m; ctx.lineWidth = 0.06; ctx.beginPath(); ctx.arc(0, 0.76, 0.17, 0, TAU); ctx.stroke();
    for (const [dx, rot] of [[-0.1, 0.25], [0.12, -0.2]]) {
      ctx.save(); ctx.translate(dx, 0.58); ctx.rotate(rot);
      P_rect(ctx, -0.035, -0.52, 0.07, 0.44, m);
      for (const [y, w] of [[-0.52, 0.15], [-0.43, 0.1], [-0.35, 0.13]]) P_rect(ctx, 0.03, y, w - 0.03, 0.06, m);
      P_line(ctx, -0.012, -0.14, -0.012, -0.48, 0.014, l);
      P_ell(ctx, 0, 0, 0.115, 0.115, m); P_ell(ctx, 0, 0, 0.045, 0.045, d);
      ctx.restore();
    }
  },
  salt(ctx, P) {
    const paper = P.col([214, 208, 190]), blue = P.col([50, 70, 130]), dark = P.col([140, 130, 110]);
    ctx.fillStyle = paper; ctx.beginPath();
    ctx.moveTo(-0.32, 0.02); ctx.lineTo(0.32, 0.02); ctx.lineTo(0.3, 0.72); ctx.quadraticCurveTo(0.22, 0.9, 0.0, 0.92);
    ctx.quadraticCurveTo(-0.22, 0.9, -0.3, 0.72); ctx.closePath(); ctx.fill();
    P_rect(ctx, -0.3, 0.3, 0.6, 0.18, blue);
    P_line(ctx, -0.26, 0.6, 0.26, 0.6, 0.02, dark);
    P_ell(ctx, 0, 0.39, 0.1, 0.06, paper);
    P_ell(ctx, 0.26, 0.06, 0.16, 0.05, P.col([236, 234, 228]));
  },
  matches(ctx, P) {
    const box = P.col([120, 38, 30]), tan = P.col([200, 176, 130]), stick = P.col([196, 170, 120]), head = P.col([150, 30, 30]);
    ctx.save(); ctx.rotate(0.15);
    P_rect(ctx, -0.36, 0.12, 0.72, 0.42, box);
    P_rect(ctx, -0.36, 0.12, 0.72, 0.12, tan);
    P_line(ctx, -0.3, 0.42, 0.3, 0.42, 0.03, P.col([70, 20, 18]));
    for (let i = 0; i < 3; i++) {
      P_line(ctx, 0.05 + i * 0.09, 0.5, 0.18 + i * 0.09, 0.86, 0.03, stick);
      P_ell(ctx, 0.19 + i * 0.09, 0.88, 0.03, 0.035, head);
    }
    ctx.restore();
  },
  // a hurricane lantern: a glass globe in a wire guard, on a tin fount, under a cap and a bail handle; lit, the globe glows
  lantern(ctx, P) {
    const lit = P.lit === true;   // the renderer also passes light intensity as P.lit for sprites; only a true flag means the flame is lit
    const metal = P.col([46, 44, 46]), metalL = P.col([92, 88, 84]);
    const glass = lit ? P.raw([236, 200, 132]) : P.col([122, 118, 104]), glassL = lit ? P.raw([255, 238, 196]) : P.col([170, 166, 150]);
    ctx.strokeStyle = metal; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.ellipse(0, 0.74, 0.2, 0.24, 0, 0, Math.PI); ctx.stroke();
    ctx.fillStyle = glass; ctx.beginPath(); ctx.moveTo(-0.13, 0.16); ctx.bezierCurveTo(-0.31, 0.27, -0.31, 0.57, -0.12, 0.68);
    ctx.lineTo(0.12, 0.68); ctx.bezierCurveTo(0.31, 0.57, 0.31, 0.27, 0.13, 0.16); ctx.closePath(); ctx.fill();
    P_line(ctx, -0.16, 0.3, -0.16, 0.52, 0.03, glassL);
    P_rect(ctx, -0.025, 0.17, 0.05, 0.12, metalL);                                   // the burner and its wick
    if (lit) {
      const g = ctx.createRadialGradient(0, 0.44, 0.02, 0, 0.44, 0.5);
      g.addColorStop(0, 'rgba(255,220,140,0.9)'); g.addColorStop(1, 'rgba(255,180,80,0)');
      ctx.fillStyle = g; ctx.fillRect(-0.5, -0.06, 1, 1);
      P_ell(ctx, 0, 0.37 + Math.sin(P.t * 23) * 0.008, 0.035, 0.075 + Math.sin(P.t * 17) * 0.012, P.raw([255, 246, 210]));
    }
    for (const s of [-1, 1]) P_limb(ctx, [[s * 0.13, 0.17], [s * 0.255, 0.42], [s * 0.12, 0.67]], 0.022, metal);   // the wire guard
    P_line(ctx, -0.25, 0.42, 0.25, 0.42, 0.022, metal);
    P_rect(ctx, -0.25, 0.03, 0.5, 0.14, metal); P_rect(ctx, -0.25, 0.14, 0.5, 0.03, metalL);   // the fount
    P_poly(ctx, [[-0.17, 0.67], [0.17, 0.67], [0.09, 0.79], [-0.09, 0.79]], metal);              // the cap
    P_rect(ctx, -0.05, 0.78, 0.1, 0.07, metal);
  },
  // a length of chain sagging between its ends: links seen flat and edge-on by turns
  chain(ctx, P) {
    const m = P.col([108, 106, 100]), d = P.col([60, 58, 56]), l = P.col([160, 158, 152]);
    const n = 9;
    for (let i = 0; i < n; i++) {
      const u = i / (n - 1), x = -0.42 + u * 0.84, y = 0.56 - Math.sin(u * Math.PI) * 0.3;
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.atan2(-Math.cos(u * Math.PI) * 0.3 * Math.PI, 0.84));
      if (i % 2) { P_rect(ctx, -0.08, -0.02, 0.16, 0.04, d); P_rect(ctx, -0.07, 0.0, 0.14, 0.014, m); }
      else {
        ctx.lineWidth = 0.045; ctx.strokeStyle = m; ctx.beginPath(); ctx.ellipse(0, 0, 0.085, 0.052, 0, 0, TAU); ctx.stroke();
        ctx.lineWidth = 0.014; ctx.strokeStyle = l; ctx.beginPath(); ctx.ellipse(0, 0, 0.085, 0.052, 0, Math.PI * 0.55, Math.PI * 0.95); ctx.stroke();
      }
      ctx.restore();
    }
  },
  padlock(ctx, P) {
    const brass = P.col([162, 136, 64]), brassL = P.col([204, 178, 104]), brassD = P.col([110, 90, 40]), dark = P.col([36, 30, 18]);
    const steel = P.col([132, 132, 130]), steelL = P.col([184, 184, 182]);
    ctx.strokeStyle = steel; ctx.lineWidth = 0.085; ctx.beginPath(); ctx.moveTo(-0.2, 0.55); ctx.lineTo(-0.2, 0.64); ctx.arc(0, 0.64, 0.2, Math.PI, 0, true); ctx.lineTo(0.2, 0.55); ctx.stroke();
    ctx.strokeStyle = steelL; ctx.lineWidth = 0.022; ctx.beginPath(); ctx.arc(0, 0.64, 0.2, Math.PI * 0.95, Math.PI * 0.62, true); ctx.stroke();
    P_rect(ctx, -0.3, 0.08, 0.6, 0.5, brass);
    P_rect(ctx, -0.3, 0.08, 0.6, 0.07, brassD); P_rect(ctx, -0.3, 0.53, 0.6, 0.05, brassL); P_rect(ctx, 0.24, 0.15, 0.06, 0.38, brassD);
    P_ell(ctx, 0, 0.38, 0.055, 0.055, dark); P_poly(ctx, [[-0.028, 0.37], [0.028, 0.37], [0.045, 0.21], [-0.045, 0.21]], dark);
  },
  // a double-barrelled shotgun, side on: the barrels with the light along them, the fore-end, the action with its trigger
  // guard, and the stock ending in a dark butt plate
  shotgun(ctx, P) {
    const steel = P.col([76, 78, 86]), steelL = P.col([132, 134, 146]), steelD = P.col([38, 38, 44]);
    const wood = P.col([122, 80, 46]), woodL = P.col([160, 114, 68]), woodD = P.col([74, 48, 28]);
    ctx.save(); ctx.translate(0, 0.45); ctx.rotate(0.06);
    P_rect(ctx, -0.5, 0.0, 0.66, 0.1, steel);
    P_line(ctx, -0.49, 0.05, 0.15, 0.05, 0.01, steelD);
    P_line(ctx, -0.49, 0.09, 0.15, 0.09, 0.014, steelL);
    P_poly(ctx, [[-0.3, 0.0], [-0.04, 0.0], [-0.06, -0.07], [-0.28, -0.07]], wood);
    P_line(ctx, -0.28, -0.012, -0.06, -0.012, 0.012, woodL);
    ctx.strokeStyle = steelD; ctx.lineWidth = 0.02; ctx.beginPath(); ctx.ellipse(0.19, -0.075, 0.055, 0.045, 0, Math.PI, TAU); ctx.stroke();
    P_line(ctx, 0.19, -0.06, 0.175, -0.1, 0.016, steelD);
    P_rect(ctx, 0.12, -0.065, 0.13, 0.175, steelD);
    P_poly(ctx, [[0.23, 0.1], [0.31, 0.075], [0.5, 0.025], [0.5, -0.17], [0.42, -0.17], [0.31, -0.075], [0.23, -0.055]], wood);
    P_line(ctx, 0.3, 0.06, 0.47, 0.018, 0.016, woodL);
    P_rect(ctx, 0.47, -0.17, 0.035, 0.195, woodD);
    ctx.restore();
  },
  // a box of shotgun shells, three standing up in it
  shells(ctx, P) {
    const card = P.col([124, 94, 60]), cardD = P.col([86, 62, 38]), label = P.col([194, 176, 134]);
    const red = P.col([170, 34, 32]), redD = P.col([112, 22, 22]), brass = P.col([184, 152, 78]);
    for (let i = 0; i < 3; i++) {
      const x = -0.2 + i * 0.2;
      P_rect(ctx, x - 0.065, 0.36, 0.13, 0.44, red); P_rect(ctx, x + 0.025, 0.36, 0.04, 0.44, redD);
      P_line(ctx, x - 0.04, 0.775, x + 0.04, 0.775, 0.016, redD);
      P_rect(ctx, x - 0.065, 0.42, 0.13, 0.1, brass);
    }
    P_rect(ctx, -0.33, 0.05, 0.66, 0.42, card); P_rect(ctx, -0.33, 0.4, 0.66, 0.07, cardD);
    P_rect(ctx, -0.2, 0.14, 0.4, 0.15, label); P_rect(ctx, -0.12, 0.19, 0.24, 0.05, red);
  },
  bottle(ctx, P) {
    const g = P.col([40, 70, 40]), hl = P.col([120, 160, 110]);
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-0.22, 0.02); ctx.lineTo(0.22, 0.02); ctx.lineTo(0.22, 0.55); ctx.lineTo(0.08, 0.72); ctx.lineTo(0.08, 0.96); ctx.lineTo(-0.08, 0.96); ctx.lineTo(-0.08, 0.72); ctx.lineTo(-0.22, 0.55); ctx.closePath(); ctx.fill();
    P_line(ctx, -0.13, 0.1, -0.13, 0.5, 0.03, hl);
  },
  // a coil of rope: loops lying one over another, the twist showing on the top one, and the loose end trailing off
  rope(ctx, P) {
    const r = P.col([156, 134, 92]), d = P.col([98, 82, 54]), l = P.col([196, 176, 132]);
    const loops = [[-0.01, 0.3, 0.36], [0.01, 0.37, 0.34], [-0.01, 0.44, 0.36], [0.01, 0.51, 0.33]];
    for (const [x, y, rx] of loops) {
      ctx.lineWidth = 0.075; ctx.strokeStyle = d; ctx.beginPath(); ctx.ellipse(x, y - 0.014, rx, 0.17, 0, 0, TAU); ctx.stroke();
      ctx.lineWidth = 0.058; ctx.strokeStyle = r; ctx.beginPath(); ctx.ellipse(x, y, rx, 0.17, 0, 0, TAU); ctx.stroke();
    }
    const [tx, ty, trx] = loops[loops.length - 1];
    for (let k = 0; k < 11; k++) {
      const a = Math.PI + (k + 0.5) / 11 * Math.PI, px = tx + Math.cos(a) * trx, py = ty + Math.sin(a) * 0.17;
      P_line(ctx, px - 0.014, py - 0.022, px + 0.014, py + 0.022, 0.012, d);
    }
    P_line(ctx, tx - trx * 0.6, ty + 0.15, tx + trx * 0.5, ty + 0.155, 0.012, l);
    P_limb(ctx, [[0.3, 0.26], [0.4, 0.16], [0.38, 0.06], [0.28, 0.03]], 0.058, r);
  },
  // a winch handle: an iron crank with a wooden grip, and the square socket that fits the winch
  handle(ctx, P) {
    const iron = P.col([74, 74, 82]), ironL = P.col([120, 120, 130]), grip = P.col([118, 84, 52]), gripL = P.col([158, 118, 78]);
    P_line(ctx, -0.35, 0.2, -0.35, 0.55, 0.09, iron);
    P_line(ctx, -0.35, 0.55, 0.15, 0.55, 0.08, iron);
    P_line(ctx, 0.15, 0.55, 0.15, 0.85, 0.08, iron);
    P_line(ctx, -0.33, 0.572, 0.13, 0.572, 0.018, ironL);
    P_line(ctx, 0.17, 0.85, 0.42, 0.85, 0.13, grip);
    P_line(ctx, 0.2, 0.88, 0.4, 0.88, 0.026, gripL);
    P_rect(ctx, -0.45, 0.06, 0.2, 0.17, iron); P_rect(ctx, -0.39, 0.1, 0.08, 0.09, P.col([28, 28, 32]));
  },
  // the bar beam: a long squared timber, its top face catching the light and its sawn end showing the rings
  beam(ctx, P) {
    const side = P.col([108, 80, 48]), top = P.col([140, 108, 68]), end = P.col([156, 124, 82]), d = P.col([70, 50, 30]);
    ctx.save(); ctx.rotate(-0.08);
    P_poly(ctx, [[-0.5, 0.48], [0.4, 0.48], [0.47, 0.56], [-0.43, 0.56]], top);
    P_rect(ctx, -0.5, 0.26, 0.9, 0.22, side);
    P_rect(ctx, -0.5, 0.26, 0.9, 0.03, d);
    P_poly(ctx, [[0.4, 0.26], [0.47, 0.34], [0.47, 0.56], [0.4, 0.48]], end);
    P_ell(ctx, 0.435, 0.41, 0.014, 0.05, d);
    P_line(ctx, -0.42, 0.39, 0.32, 0.38, 0.012, d); P_line(ctx, -0.2, 0.32, 0.36, 0.33, 0.008, d); P_line(ctx, -0.46, 0.52, 0.3, 0.52, 0.008, d);
    ctx.restore();
  },
  // a pair of iron brackets: the hooks a door bar drops into
  brackets(ctx, P) {
    const st = P.col([96, 96, 104]), d = P.col([52, 52, 58]);
    for (const x of [-0.26, 0.14]) { P_rect(ctx, x, 0.2, 0.1, 0.55, st); P_rect(ctx, x, 0.2, 0.26, 0.1, st); P_rect(ctx, x + 0.16, 0.2, 0.1, 0.24, st); P_ell(ctx, x + 0.05, 0.62, 0.025, 0.025, d); P_ell(ctx, x + 0.05, 0.4, 0.025, 0.025, d); }
  },
  // a pawl pin: a steel pin on a short chain
  pin(ctx, P) {
    const st = P.col([150, 150, 156]), d = P.col([80, 80, 86]);
    P_rect(ctx, -0.07, 0.25, 0.14, 0.5, st); P_rect(ctx, -0.14, 0.72, 0.28, 0.1, st); P_rect(ctx, -0.07, 0.25, 0.05, 0.5, d);
    ctx.strokeStyle = d; ctx.lineWidth = 0.025;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0.18 + i * 0.07, 0.78 - i * 0.12, 0.045, 0.03, 0.6, 0, TAU); ctx.stroke(); }
  },
  oar(ctx, P) {
    const w = P.col([120, 96, 62]), d = P.col([80, 60, 36]);
    ctx.save(); ctx.rotate(0.5);
    P_line(ctx, 0, 0.05, 0, 0.7, 0.06, w);
    ctx.fillStyle = d; ctx.beginPath(); ctx.ellipse(0, 0.82, 0.1, 0.18, 0, 0, TAU); ctx.fill();
    ctx.restore();
  },
  // fuses: a good one, a blown one (dark glass), and a coil of wire
  fuse(ctx, P) {
    const brass = P.col([170, 140, 70]), glass = P.col([180, 190, 170]), wire = P.col([90, 90, 96]);
    P_rect(ctx, -0.32, 0.36, 0.64, 0.24, glass); P_rect(ctx, -0.42, 0.33, 0.14, 0.3, brass); P_rect(ctx, 0.28, 0.33, 0.14, 0.3, brass);
    P_line(ctx, -0.26, 0.48, 0.26, 0.48, 0.02, wire);
  },
  fusebody(ctx, P) {
    const brass = P.col([150, 124, 64]), glass = P.col([70, 60, 56]), wire = P.col([90, 90, 96]);
    P_rect(ctx, -0.32, 0.36, 0.64, 0.24, glass); P_rect(ctx, -0.42, 0.33, 0.14, 0.3, brass); P_rect(ctx, 0.28, 0.33, 0.14, 0.3, brass);
    P_line(ctx, -0.26, 0.48, -0.08, 0.5, 0.02, wire); P_line(ctx, 0.05, 0.44, 0.26, 0.48, 0.02, wire);
    P_ell(ctx, -0.02, 0.48, 0.06, 0.05, P.col([30, 24, 22]));
  },
  wire(ctx, P) {
    const c = P.col([160, 110, 60]);
    ctx.strokeStyle = c; ctx.lineWidth = 0.035;
    for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.ellipse(0, 0.42 + i * 0.02, 0.28 - i * 0.03, 0.16 - i * 0.02, 0, 0, TAU); ctx.stroke(); }
    P_line(ctx, 0.2, 0.5, 0.42, 0.78, 0.035, c);
  },
  // a box of nails: an open carton with nails standing in it, heads up, and two spilled in front
  nails(ctx, P) {
    const box = P.col([132, 108, 74]), boxD = P.col([88, 70, 48]), inside = P.col([42, 34, 26]), label = P.col([200, 188, 156]);
    const nail = P.col([170, 170, 178]), head = P.col([208, 208, 214]);
    P_poly(ctx, [[-0.36, 0.47], [0.36, 0.47], [0.31, 0.58], [-0.31, 0.58]], inside);
    for (const [x, a] of [[-0.22, 0.14], [-0.11, -0.06], [0.0, 0.07], [0.11, -0.12], [0.22, 0.05]]) {
      const tx = x + Math.sin(a) * 0.3, ty = 0.46 + Math.cos(a) * 0.3;
      P_line(ctx, x, 0.42, tx, ty, 0.028, nail); P_ell(ctx, tx, ty, 0.05, 0.02, head, -a);
    }
    P_rect(ctx, -0.36, 0.08, 0.72, 0.4, box); P_rect(ctx, -0.36, 0.08, 0.72, 0.05, boxD); P_rect(ctx, -0.36, 0.43, 0.72, 0.05, boxD);
    P_rect(ctx, -0.17, 0.19, 0.34, 0.14, label); P_line(ctx, -0.11, 0.26, 0.11, 0.26, 0.02, boxD);
    P_line(ctx, 0.14, 0.05, 0.4, 0.025, 0.026, nail); P_ell(ctx, 0.41, 0.025, 0.018, 0.045, head);
    P_line(ctx, -0.44, 0.06, -0.2, 0.085, 0.026, nail); P_ell(ctx, -0.45, 0.06, 0.018, 0.045, head);
  },
  // an oil can with a long spout
  oilcan(ctx, P) {
    const tin = P.col([120, 118, 110]), tinD = P.col([76, 74, 68]), oil = P.col([60, 44, 20]);
    P_rect(ctx, -0.3, 0.05, 0.5, 0.42, tin); P_rect(ctx, -0.3, 0.05, 0.5, 0.06, tinD); P_rect(ctx, -0.3, 0.42, 0.5, 0.05, tinD);
    P_line(ctx, 0.15, 0.4, 0.44, 0.86, 0.045, tin); P_ell(ctx, 0.44, 0.88, 0.025, 0.02, oil);
    P_line(ctx, -0.34, 0.5, -0.12, 0.5, 0.05, tinD); P_ell(ctx, -0.12, 0.3, 0.08, 0.05, tinD);
  },
  // a music box: a small lacquered case with a crank and a dancer under the lid; a broken one gapes open
  musicbox(ctx, P) {
    const lac = P.col([90, 30, 40]), lacD = P.col([50, 16, 24]), brass = P.col([180, 150, 80]), pale = P.col([230, 220, 210]);
    P_rect(ctx, -0.34, 0.08, 0.68, 0.38, lac); P_rect(ctx, -0.34, 0.42, 0.68, 0.05, lacD);
    P_poly(ctx, [[-0.34, 0.47], [0.34, 0.47], [0.3, 0.72], [-0.3, 0.72]], lacD);
    P_ell(ctx, 0, 0.78, 0.045, 0.08, pale); P_ell(ctx, 0, 0.9, 0.03, 0.03, pale);
    P_line(ctx, 0.36, 0.25, 0.48, 0.25, 0.04, brass); P_line(ctx, 0.48, 0.25, 0.48, 0.36, 0.04, brass);
    heartShape(ctx, 0, 0.25, 0.075, brass, P.col([30, 12, 16]));
  },
  // the Mirror Maze's keys: only the heart fits the box
  boxkey(ctx, P) { smallKey(ctx, P, 'heart', [204, 170, 92]); },
  keyRound(ctx, P) { smallKey(ctx, P, 'round', [176, 168, 146]); },
  keySquare(ctx, P) { smallKey(ctx, P, 'square', [184, 156, 104]); },
  keyClover(ctx, P) { smallKey(ctx, P, 'clover', [156, 134, 88]); },
  keyIron(ctx, P) { smallKey(ctx, P, 'round', [96, 94, 98]); },
  brokenbox(ctx, P) {
    const lac = P.col([90, 30, 40]), lacD = P.col([50, 16, 24]), brass = P.col([180, 150, 80]), dark = P.col([20, 12, 14]);
    P_rect(ctx, -0.34, 0.08, 0.68, 0.38, lac); P_rect(ctx, -0.3, 0.14, 0.6, 0.28, dark);
    P_poly(ctx, [[-0.34, 0.46], [-0.1, 0.46], [-0.2, 0.9], [-0.44, 0.9]], lacD);
    P_line(ctx, 0.36, 0.25, 0.48, 0.25, 0.04, brass);
    P_line(ctx, -0.05, 0.2, 0.2, 0.34, 0.02, brass);
    heartShape(ctx, 0.2, 0.2, 0.06, brass, dark);
  },
  spring(ctx, P) {
    const st = P.col([150, 150, 156]);
    ctx.strokeStyle = st; ctx.lineWidth = 0.035; ctx.beginPath();
    for (let i = 0; i < 40; i++) { const u = i / 39, a = u * TAU * 4; const x = Math.cos(a) * 0.18, y = 0.15 + u * 0.6 + Math.sin(a) * 0.05; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
  },
  // a wrench, a water pail and a feed sack: heavy things for the barn
  wrench(ctx, P) {
    const st = P.col([130, 130, 138]), stD = P.col([80, 80, 88]);
    ctx.save(); ctx.rotate(-0.7);
    P_line(ctx, 0, 0.1, 0, 0.7, 0.09, st); P_line(ctx, 0, 0.1, 0, 0.7, 0.03, stD);
    P_ell(ctx, 0, 0.78, 0.16, 0.14, st); P_rect(ctx, -0.06, 0.74, 0.12, 0.18, P.col([40, 40, 46]));
    ctx.restore();
  },
  pail(ctx, P) {
    const tin = P.col([110, 112, 118]), tinD = P.col([70, 72, 78]), water = P.col([60, 90, 120]);
    P_poly(ctx, [[-0.3, 0.05], [0.3, 0.05], [0.36, 0.6], [-0.36, 0.6]], tin); P_rect(ctx, -0.36, 0.58, 0.72, 0.05, tinD);
    P_ell(ctx, 0, 0.6, 0.33, 0.07, water);
    ctx.strokeStyle = tinD; ctx.lineWidth = 0.035; ctx.beginPath(); ctx.arc(0, 0.62, 0.34, Math.PI, 0, false); ctx.stroke();
  },
  sack(ctx, P) {
    const cloth = P.col([150, 128, 92]), clothD = P.col([104, 86, 60]);
    ctx.fillStyle = cloth; ctx.beginPath(); ctx.moveTo(-0.3, 0.05); ctx.quadraticCurveTo(-0.42, 0.5, -0.2, 0.78); ctx.lineTo(0.2, 0.78); ctx.quadraticCurveTo(0.42, 0.5, 0.3, 0.05); ctx.closePath(); ctx.fill();
    P_line(ctx, -0.22, 0.78, 0.22, 0.78, 0.05, clothD); P_line(ctx, -0.1, 0.9, 0.1, 0.9, 0.06, clothD);
    P_line(ctx, -0.15, 0.3, 0.15, 0.3, 0.012, clothD); P_line(ctx, -0.12, 0.45, 0.12, 0.45, 0.012, clothD);
  },
  // a light bulb
  bulb(ctx, P) {
    const glass = P.col([214, 212, 200]), brass = P.col([150, 130, 70]), fil = P.col([120, 110, 90]);
    P_ell(ctx, 0, 0.62, 0.26, 0.3, glass); P_poly(ctx, [[-0.16, 0.4], [0.16, 0.4], [0.12, 0.2], [-0.12, 0.2]], glass);
    P_rect(ctx, -0.12, 0.05, 0.24, 0.16, brass); P_line(ctx, -0.12, 0.1, 0.12, 0.1, 0.015, P.col([90, 76, 40])); P_line(ctx, -0.12, 0.16, 0.12, 0.16, 0.015, P.col([90, 76, 40]));
    P_line(ctx, -0.06, 0.45, 0, 0.7, 0.012, fil); P_line(ctx, 0, 0.7, 0.06, 0.45, 0.012, fil);
  }
};

// ---------- scenery builders: everything is pushed into L.props in the level's local frame ----------
const SC = {
  quad(L, a, b, c, d, color, opts) {
    const p = Object.assign({ kind: 'poly', pts: [L.pt(a[0], a[1], a[2]), L.pt(b[0], b[1], b[2]), L.pt(c[0], c[1], c[2]), L.pt(d[0], d[1], d[2])], color }, opts || {});
    L.props.push(p);
    if (p.tex) SC.detail(L, p, a, b, c, d);
  },
  // vertical quad from (x0,z0) to (x1,z1), y0..y1
  wallV(L, x0, z0, x1, z1, y0, y1, color, opts) { SC.quad(L, [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], color, opts); },
  // horizontal quad on the ground plane
  floorQ(L, x0, z0, x1, z1, y, color, opts) { SC.quad(L, [x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1], color, Object.assign({ layer: 0 }, opts || {})); },
  // a box with no bottom. Each face knows the box it belongs to and which way it faces, so the renderer can skip the
  // faces turned away from the eye (they could only ever be seen through the box, and drawn in the wrong order they
  // showed through it); seen from below its open bottom, every face is drawn as before.
  box(L, x0, x1, y0, y1, z0, z1, color, opts) {
    const side = scalec(color, 0.78), side2 = scalec(color, 0.66), top = scalec(color, 1.08);
    const o = L.pt(0, 0, 0), ux = L.pt(1, 0, 0), wz = L.pt(0, 0, 1), c = L.pt((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    const U = [ux[0] - o[0], ux[2] - o[2]], Wv = [wz[0] - o[0], wz[2] - o[2]];
    const box = { c, u: U, w: Wv, h: [Math.abs(x1 - x0) / 2, Math.abs(y1 - y0) / 2, Math.abs(z1 - z0) / 2], y0: Math.min(y0, y1) };
    const face = (n) => Object.assign({}, opts || {}, { bf: { box, n } });
    const sx = x1 >= x0 ? 1 : -1, sz = z1 >= z0 ? 1 : -1;
    SC.quad(L, [x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], side, face([-Wv[0] * sz, 0, -Wv[1] * sz]));
    SC.quad(L, [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], side, face([Wv[0] * sz, 0, Wv[1] * sz]));
    SC.quad(L, [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], side2, face([-U[0] * sx, 0, -U[1] * sx]));
    SC.quad(L, [x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], side2, face([U[0] * sx, 0, U[1] * sx]));
    SC.quad(L, [x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1], top, y1 >= y0 ? face([0, 1, 0]) : opts);
  },
  sprite(L, x, y, z, w, h, draw, opts) {
    const p = L.pt(x, y, z);
    const s = Object.assign({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w, h, draw }, opts || {});
    L.props.push(s); return s;
  },
  // trees: 'bare' (winter deciduous), 'fir', 'round'
  tree(L, x, z, h, kind, seed) {
    const rng = mulberry32(seed | 0);
    const w = kind === 'fir' ? h * 0.45 : h * 0.8;
    const branches = [];
    if (kind === 'bare') {
      for (let i = 0; i < 9; i++) {
        const y0 = 0.35 + rng() * 0.45, a = (rng() - 0.5) * 2.2, len = 0.18 + rng() * 0.3;
        branches.push([y0, a, len, (rng() - 0.5) * 1.5]);
      }
    }
    const blobs = [];
    if (kind === 'round') for (let i = 0; i < 6; i++) blobs.push([(rng() - 0.5) * 0.5, 0.55 + rng() * 0.35, 0.18 + rng() * 0.16]);
    const trunkC = [26, 22, 20], leafC = kind === 'fir' ? [14, 22, 18] : [20, 18, 18];
    return SC.sprite(L, x, 0, z, w, h, (ctx, P) => {
      ctx.scale(w, h);
      const tc = P.col(trunkC), lc = P.col(leafC);
      if (kind === 'fir') {
        P_rect(ctx, -0.04, 0, 0.08, 0.3, tc);
        for (let i = 0; i < 4; i++) { const y = 0.12 + i * 0.22, ww = 0.5 - i * 0.1; P_poly(ctx, [[-ww, y], [ww, y], [0, y + 0.42]], lc); }
      } else if (kind === 'bare') {
        P_line(ctx, 0, 0, 0.02, 0.75, 0.07, tc);
        for (const [y0, a, len, a2] of branches) {
          const x1 = Math.sin(a) * len, y1 = y0 + Math.cos(a) * len;
          P_line(ctx, 0.01, y0, x1, y1, 0.03, tc);
          P_line(ctx, x1, y1, x1 + Math.sin(a + a2) * len * 0.6, y1 + Math.cos(a + a2) * len * 0.6, 0.018, tc);
        }
        P_line(ctx, 0.02, 0.75, 0.05, 0.98, 0.03, tc);
      } else {
        P_line(ctx, 0, 0, 0, 0.5, 0.08, tc);
        for (const [bx, by, br] of blobs) P_ell(ctx, bx, by, br, br * 0.9, lc);
      }
    });
  },
  fenceLine(L, x0, z0, x1, z1, spacing, postH, color) {
    const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / spacing));
    const dx = (x1 - x0) / n, dz = (z1 - z0) / n;
    for (let i = 0; i <= n; i++) {
      const x = x0 + dx * i, z = z0 + dz * i;
      SC.sprite(L, x, 0, z, 0.14, postH, (ctx, P) => { ctx.scale(0.14, postH); P_rect(ctx, -0.5, 0, 1, 1, P.col(color)); });
    }
    // rails, split into segments so fog is right
    const seg = Math.max(1, Math.round(len / 12));
    for (let i = 0; i < seg; i++) {
      const a = i / seg, b = (i + 1) / seg;
      for (const yy of [postH * 0.45, postH * 0.85])
        SC.wallV(L, x0 + (x1 - x0) * a, z0 + (z1 - z0) * a, x0 + (x1 - x0) * b, z0 + (z1 - z0) * b, yy - 0.05, yy + 0.05, color);
    }
  },
  gravestone(L, x, z, seed) {
    const rng = mulberry32(seed | 0);
    const h = 0.7 + rng() * 0.7, w = 0.45 + rng() * 0.35, tilt = (rng() - 0.5) * 0.25, kind = rng() < 0.25 ? 'cross' : 'stone';
    const v = rng() * 24; const c = [82 + v, 82 + v, 78 + v];
    return SC.sprite(L, x, 0, z, w * 1.3, h, (ctx, P) => {
      ctx.rotate(tilt); ctx.scale(w, h);
      const col = P.col(c), dark = P.col(scalec(c, 0.6));
      if (kind === 'cross') { P_rect(ctx, -0.1, 0, 0.2, 1, col); P_rect(ctx, -0.5, 0.62, 1, 0.16, col); }
      else {
        ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(-0.5, 0); ctx.lineTo(0.5, 0); ctx.lineTo(0.5, 0.7); ctx.arc(0, 0.7, 0.5, 0, Math.PI, false); ctx.closePath(); ctx.fill();
        P_line(ctx, -0.25, 0.5, 0.25, 0.5, 0.02, dark); P_line(ctx, -0.2, 0.38, 0.2, 0.38, 0.02, dark);
      }
    });
  },
  boulder(L, x, z, size, seed) {
    const rng = mulberry32(seed | 0);
    const pts = []; const n = 7;
    for (let i = 0; i < n; i++) { const a = Math.PI * (i / (n - 1)); pts.push([Math.cos(a) * 0.5 * (0.8 + rng() * 0.3), Math.sin(a) * (0.5 + rng() * 0.5)]); }
    const v = rng() * 30; const c = [78 + v, 80 + v, 80 + v];
    return SC.sprite(L, x, 0, z, size * 1.2, size, (ctx, P) => { ctx.scale(size * 1.2, size); P_poly(ctx, pts, P.col(c)); });
  },
  road(L, x0, x1, z0, z1, color, segs, lit) {
    for (let i = 0; i < segs; i++) {
      const a = z0 + (z1 - z0) * Math.pow(i / segs, 1.6), b = z0 + (z1 - z0) * Math.pow((i + 1) / segs, 1.6);
      const k = lit ? lit((a + b) / 2) : 0;
      SC.floorQ(L, x0, a, x1, b, 0.01, mixc(color, [150, 140, 115], k * 0.8));
    }
  },
  groundDots(L, seed, n, minD, maxD, arcDeg, color, size) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const a = (rng() - 0.5) * arcDeg * DEG, d = minD + Math.pow(rng(), 1.5) * (maxD - minD);
      const x = Math.sin(a) * d, z = Math.cos(a) * d, s = size * (0.5 + rng());
      SC.floorQ(L, x - s, z - s * 0.4, x + s, z + s * 0.4, 0.008, color);
    }
  },
  moon(L, yawDeg, elevDeg, r, color) {
    const D = 700;
    const x = Math.sin(yawDeg * DEG) * D * Math.cos(elevDeg * DEG), z = Math.cos(yawDeg * DEG) * D * Math.cos(elevDeg * DEG), y = Math.sin(elevDeg * DEG) * D;
    const gw = r * 9;
    L.props.push({ kind: 'sprite', x, y, z, w: gw, h: gw, noFog: true, layer: 0, dist: D, draw: (ctx, P) => {
      const g = ctx.createRadialGradient(0, gw / 2, r * 0.9, 0, gw / 2, gw / 2);
      g.addColorStop(0, rgba(color, 0.32)); g.addColorStop(0.35, rgba(color, 0.08)); g.addColorStop(1, rgba(color, 0));
      ctx.fillStyle = g; ctx.fillRect(-gw / 2, 0, gw, gw);
      P_ell(ctx, 0, gw / 2, r, r, rgba(color));
      P_ell(ctx, -r * 0.3, gw / 2 + r * 0.2, r * 0.22, r * 0.18, rgba(scalec(color, 0.85)));
      P_ell(ctx, r * 0.25, gw / 2 - r * 0.3, r * 0.16, r * 0.14, rgba(scalec(color, 0.88)));
    } });
  },
  clouds(L, seed, n, color, alpha) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const yaw0 = rng() * TAU, el = (8 + rng() * 30) * DEG, D = 800, w = 120 + rng() * 260, h = w * (0.18 + rng() * 0.15), drift = (0.002 + rng() * 0.004) * (rng() < 0.5 ? -1 : 1);
      const a = alpha === undefined ? 0.35 : alpha;
      const blobs = []; for (let k = 0; k < 4; k++) blobs.push([(rng() - 0.5) * 0.7, rng() * 0.4, 0.25 + rng() * 0.3]);
      // drawn as one shape (its puffs filled together, so they do not darken where they overlap) with a flat underside,
      // over a slightly larger, fainter copy of itself for a soft edge: a cloud, not a row of dark discs
      const puffs = (ctx, g) => { ctx.beginPath(); for (const [bx, by, br] of blobs) { ctx.moveTo(bx + br * g, by); ctx.ellipse(bx, by, br * g, br * 0.9 * g, 0, 0, TAU); } };
      const c = { kind: 'sprite', x: 0, y: Math.sin(el) * D, z: 0, w, h, noFog: true, noLight: true, layer: 0, dist: D, yaw0, drift, draw: ctx => {
        ctx.scale(w, h);
        const k = a * (LIGHT.global > 0.01 ? 1.6 : 1);
        ctx.save(); ctx.beginPath(); ctx.rect(-1, 0.02, 2, 1.2); ctx.clip();
        puffs(ctx, 1.14); ctx.fillStyle = rgba(color, k * 0.42); ctx.fill();
        puffs(ctx, 1); ctx.fillStyle = rgba(color, k * 0.72); ctx.fill();
        ctx.restore();
      } };
      L.clouds = L.clouds || []; L.clouds.push(c);
    }
  },
  stars(L, seed, n, alpha) {
    const rng = mulberry32(seed | 0);
    for (let i = 0; i < n; i++) {
      const yaw = rng() * TAU, el = (4 + rng() * 70) * DEG, D = 900;
      const x = Math.sin(yaw) * D * Math.cos(el), z = Math.cos(yaw) * D * Math.cos(el), y = Math.sin(el) * D;
      const b = 0.35 + rng() * 0.65, s = 0.9 + rng() * 1.4;
      const ph = rng() * TAU, tw = 0.5 + rng() * 2;
      L.props.push({ kind: 'sprite', x, y, z, w: s, h: s, noFog: true, noLight: true, layer: 0, dist: D, draw: (ctx, P) => {
        ctx.fillStyle = 'rgba(220,225,255,' + (b * (alpha === undefined ? 1 : alpha) * (0.72 + 0.28 * Math.sin(P.t * tw + ph))) + ')';
        ctx.beginPath(); ctx.arc(0, s / 2, s / 2, 0, TAU); ctx.fill();
      } });
    }
  }
};

// ---- build in a rotated local frame (deg = 0 is the level's own forward) ----
SC.withYaw = function (L, deg, fn) {
  if (!deg) return fn();
  const orig = L.pt, r = deg * DEG;
  L.pt = (x, y, z) => { const q = rotY(x, z, r); return orig(q[0], y, q[1]); };
  try { return fn(); } finally { L.pt = orig; }
};
// ---- openings: build the wall pieces around a hole and return the aperture the lane logic needs ----
// a doorway in a wall at depth z facing the lane, opening w wide and h high, walls wallH high from x=left..right
SC.doorway = function (L, o) {
  const x = o.x || 0, w = o.w, y0 = o.y0 || 0, h = o.h, wallH = o.wallH || y0 + h + 0.5, left = o.left === undefined ? -7 : o.left, right = o.right === undefined ? 7 : o.right;
  SC.withYaw(L, o.deg || 0, () => {
    SC.wallV(L, left, o.z, x - w / 2, o.z, y0, wallH, o.color, o.opts);
    SC.wallV(L, x + w / 2, o.z, right, o.z, y0, wallH, o.color, o.opts);
    if (wallH > y0 + h) SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, y0 + h, wallH, o.color, o.opts);
    if (o.frame) { const f = o.frame, fw = f.w || 0.1; SC.wallV(L, x - w / 2 - fw, o.z - 0.05, x - w / 2, o.z - 0.05, y0, y0 + h + fw, f.color); SC.wallV(L, x + w / 2, o.z - 0.05, x + w / 2 + fw, o.z - 0.05, y0, y0 + h + fw, f.color); SC.wallV(L, x - w / 2 - fw, o.z - 0.05, x + w / 2 + fw, o.z - 0.05, y0 + h, y0 + h + fw, f.color); }
  });
  return { z: o.z, x0: x - w / 2, x1: x + w / 2, y0, y1: y0 + h };
};
// a window: wall with a hole from y0 to y1
SC.window = function (L, o) {
  const x = o.x || 0, w = o.w, wallH = o.wallH, left = o.left === undefined ? -7 : o.left, right = o.right === undefined ? 7 : o.right;
  SC.withYaw(L, o.deg || 0, () => {
    SC.wallV(L, left, o.z, x - w / 2, o.z, 0, wallH, o.color, o.opts);
    SC.wallV(L, x + w / 2, o.z, right, o.z, 0, wallH, o.color, o.opts);
    SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, 0, o.y0, o.color, o.opts);
    SC.wallV(L, x - w / 2, o.z, x + w / 2, o.z, o.y1, wallH, o.color, o.opts);
  });
  return { z: o.z, x0: x - w / 2, x1: x + w / 2, y0: o.y0, y1: o.y1 };
};
// a gap between two posts (no lintel): builds nothing, describes the opening
SC.gap = function (L, o) { return { z: o.z, x0: (o.x || 0) - o.w / 2, x1: (o.x || 0) + o.w / 2, y0: o.y0 || 0, y1: o.h || 99 }; };

// ---- per-frame (dynamic) variants: return the renderable instead of registering it ----
// Surface detail: boards, log courses, stone courses or blocks and tin bands, built once as real geometry over a quad, so it
// stays put however the view turns. The pieces share the quad's sort distance and are pushed straight after it, so the stable
// sort draws them over it, and the quad shows through the gaps as the seams (in its darker seam colour while detail is on).
// Pieces grow with distance from the eye so none gets much smaller than about a dozen pixels, and far faces get none.
SC.detail = function (L, base, a, b, c, d) {
  const K = {
    planks: { size: 0.2, gap: 0.016, seam: 0.5, jit: 0.24 },
    logs: { size: 0.3, gap: 0.03, seam: 0.4, jit: 0.16 },
    stone: { size: 0.3, gap: 0.028, seam: 0.55, jit: 0.24, block: 0.6 },
    tin: { size: 0.45, gap: 0.014, seam: 0.66, jit: 0.1 },
  }[base.tex];
  if (!K) return;
  const sc = base.texScale || 1;
  const mix = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  const at = (s, t) => mix(mix(a, b, s), mix(d, c, s), t);
  const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], v = [d[0] - a[0], d[1] - a[1], d[2] - a[2]];
  const U = Math.hypot(u[0], u[1], u[2]), V = Math.hypot(v[0], v[1], v[2]);
  if (U < 0.1 || V < 0.1) return;
  let dN = Infinity; // nearest point of the quad to the eye, which sits at the local origin
  for (let i = 0; i <= 6; i++) for (let j = 0; j <= 6; j++) { const q = at(i / 6, j / 6); dN = Math.min(dN, Math.hypot(q[0], q[1] - L.eyeH, q[2])); }
  if (dN > 60) return;
  const vertical = Math.abs(u[2] * v[0] - u[0] * v[2]) / (U * V) < 0.5;
  // boards run level on walls and along the longer side on floors; k is the across-the-boards axis, r the along axis
  const alongS = vertical ? Math.abs(v[1]) >= Math.abs(u[1]) : U >= V;
  const kLen = alongS ? V : U, rLen = alongS ? U : V, kUp = (alongS ? v[1] : u[1]) >= 0;
  const P = (r, k) => (alongS ? at(r, k) : at(k, r));
  const size = Math.max(K.size * sc, dN / 55);
  const n = Math.round(kLen / size);
  if (n < 2) return;
  const rng = mulberry32((Math.round(a[0] * 97) * 73856093 ^ Math.round(a[1] * 89) * 19349663 ^ Math.round(a[2] * 83) * 83492791 ^ Math.round(c[0] * 79 + c[2] * 71) * 2654435761) >>> 0);
  const dist = base.dist !== undefined ? base.dist : base.pts.reduce((s, w) => s + Math.hypot(w[0], w[2]), 0) / base.pts.length;
  const shade = (k) => scalec(base.color, k);
  // each piece knows the quad it lies on (of), so the renderer can keep it in step with that quad's place in the drawing
  // order (and turn it away with the quad when that is a box's face turned from the eye)
  const push = (r0, r1, k0, k1, col) => {
    const q = [P(r0, k0), P(r1, k0), P(r1, k1), P(r0, k1)];
    L.props.push({ kind: 'poly', pts: q.map(w => L.pt(w[0], w[1], w[2])), color: col, layer: base.layer, dist, detail: true, alpha: base.alpha, noFog: base.noFog, noLight: base.noLight, of: base, bf: base.bf });
  };
  base.seam = shade(K.seam);
  const gk = K.gap / kLen / 2;
  const blocks = base.tex === 'stone' && dN < 14 && vertical;
  const slabs = base.tex === 'stone' && dN < 14 && !vertical;
  for (let i = 0; i < n; i++) {
    const k0 = i / n + gk, k1 = (i + 1) / n - gk;
    const jit = () => 1 - K.jit / 2 + K.jit * rng();
    if (base.tex === 'logs') { // a log: its upper half catches the light, its lower half is in shadow
      const km = (k0 + k1) / 2, j = jit(), hi = kUp ? [km, k1] : [k0, km], lo = kUp ? [k0, km] : [km, k1];
      push(0, 1, lo[0], lo[1], shade(0.84 * j)); push(0, 1, hi[0], hi[1], shade(1.08 * j));
    } else if (blocks || slabs) { // stone: blocks along each course, staggered from course to course (slabs on floors)
      const unit = (slabs ? K.size * 1.8 : K.block) * sc, gr = K.gap / rLen / 2;
      let r = -rng() * unit / rLen;
      while (r < 1) { const len = unit * (0.7 + 0.6 * rng()) / rLen; const r0 = Math.max(0, r) + gr, r1 = Math.min(1, r + len) - gr; if (r1 - r0 > gr) push(r0, r1, k0, k1, shade(jit())); r += len; }
    } else push(0, 1, k0, k1, shade(jit()));
  }
};
SC.mkQuad = function (L, a, b, c, d, color, opts) {
  return Object.assign({ kind: 'poly', pts: [L.pt(a[0], a[1], a[2]), L.pt(b[0], b[1], b[2]), L.pt(c[0], c[1], c[2]), L.pt(d[0], d[1], d[2])], color }, opts || {});
};
SC.mkWallV = function (L, x0, z0, x1, z1, y0, y1, color, opts) { return SC.mkQuad(L, [x0, y0, z0], [x1, y0, z1], [x1, y1, z1], [x0, y1, z0], color, opts); };
SC.mkSprite = function (L, x, y, z, w, h, draw, opts) {
  const p = L.pt(x, y, z);
  return Object.assign({ kind: 'sprite', x: p[0], y: p[1], z: p[2], w, h, draw }, opts || {});
};
