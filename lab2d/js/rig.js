'use strict';
// ---------- the rig: an edited SVG back into a creature, its parts turning about their joints ----------
// The exported file's top-level groups come back as parts. Their names give them roles (head, armL, armR,
// legL, legR, body; anything else is still), the magenta dot in each is the joint, and the #bounds rectangle
// gives the scale. Parts may be nested (a hand inside an arm). The creature's behaviour (pace, modes, height)
// comes from the code creature of the same name; only the drawing is replaced.
const RIG = (() => {
  const ROLES = [[/^head/, 'head'], [/^(arm|hand)l/, 'armL'], [/^(arm|hand)r/, 'armR'], [/^(leg|foot)l/, 'legL'], [/^(leg|foot)r/, 'legR'], [/^(body|torso)/, 'body']];
  const norm = id => (id || '').toLowerCase().replace(/_x[0-9a-f]{2}_/g, '').replace(/[^a-z0-9]/g, '');
  const roleOf = id => { const n = norm(id); for (const [re, role] of ROLES) if (re.test(n)) return role; return n.replace(/pivot$/, '') ? 'still' : 'still'; };
  const isPivot = el => el.nodeName.toLowerCase() === 'circle' && (/pivot/i.test(el.getAttribute('id') || '') || /#ff00ff|magenta/i.test(el.getAttribute('fill') || ''));
  function parseRig(text) {
    const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
    const root = doc.documentElement;
    if (!root || root.nodeName.toLowerCase() !== 'svg') throw new Error('not an SVG');
    const vb = SVGSPRITE.viewBoxOf(root);
    let bounds = null;
    const br = root.querySelector('#bounds') || Array.from(root.getElementsByTagName('rect')).find(r => /bounds/i.test(r.getAttribute('id') || ''));
    if (br) bounds = { x: parseFloat(br.getAttribute('x') || 0), y: parseFloat(br.getAttribute('y') || 0), w: parseFloat(br.getAttribute('width') || 0), h: parseFloat(br.getAttribute('height') || 0) };
    if (!bounds || !(bounds.h > 0)) bounds = { x: vb[0], y: vb[1], w: vb[2], h: vb[3] };
    const isPart = el => el.nodeName.toLowerCase() === 'g' && (el.getAttribute('id') || '').trim() !== '';
    function partOf(el) {
      const id = el.getAttribute('id');
      const pivotEl = Array.from(el.children).find(isPivot);
      const pivot = pivotEl ? [parseFloat(pivotEl.getAttribute('cx') || 0), parseFloat(pivotEl.getAttribute('cy') || 0)] : null;
      const children = Array.from(el.children).filter(isPart);
      const paths = SVGSPRITE.parseNode(el, vb, e => e !== el && (isPivot(e) || isPart(e) || (e.getAttribute('id') || '') === 'bounds'));
      return { id, role: roleOf(id), pivot, paths, children: children.map(partOf) };
    }
    // the parts are the named groups; anything loose at the top level is the body
    const top = Array.from(root.children).filter(isPart);
    const parts = top.map(partOf);
    const loose = SVGSPRITE.parseNode(root, vb, e => e !== root && (isPart(e) || isPivot(e) || (e.getAttribute('id') || '') === 'bounds' || e.nodeName.toLowerCase() === 'defs'));
    if (loose.length) parts.unshift({ id: 'body', role: 'body', pivot: null, paths: loose, children: [] });
    const count = parts.reduce(function sum(n, p) { return n + p.paths.length + p.children.reduce(sum, 0); }, 0);
    return { parts, bounds, height: parseFloat(root.getAttribute('data-height')) || null, width: parseFloat(root.getAttribute('data-width')) || null, creature: root.getAttribute('data-creature') || null, count };
  }
  // what a role does with the creature's state, in metres and radians, about the joint
  function motion(role, c) {
    const g = c.gait, t = c.t, near = clamp(1 - c.dist / 22, 0, 1), lunge = c.lunge || 0, raise = smoothstep(Math.max(near, lunge));
    switch (role) {
      case 'head': return { rot: headTiltJerk(t, 2.7, 0.2) * (1 - lunge), dx: 0, dy: 0 };
      case 'armL': return { rot: Math.sin(g) * 0.12 * (1 - raise) + raise * 1.3, dx: 0, dy: 0 };
      case 'armR': return { rot: -Math.sin(g) * 0.12 * (1 - raise) - raise * 1.3, dx: 0, dy: 0 };
      case 'legL': { const lift = c.moving ? Math.max(0, Math.sin(g + Math.PI)) : 0; return { rot: -lift * 0.12, dx: 0, dy: lift * 0.12 }; }
      case 'legR': { const lift = c.moving ? Math.max(0, Math.sin(g)) : 0; return { rot: lift * 0.12, dx: 0, dy: lift * 0.12 }; }
      default: return null;
    }
  }
  function makeCreature(rig, baseId, name) {
    const base = CREATURES[baseId] || CREATURES[rig.creature] || null;
    const h = rig.height || (base && base.h) || 2, w = rig.width || (base && base.w) || h * 0.6;
    const k = h / rig.bounds.h, cx = rig.bounds.x + rig.bounds.w / 2, bottom = rig.bounds.y + rig.bounds.h;
    const toM = p => [(p[0] - cx) * k, (bottom - p[1]) * k];
    function drawPart(ctx, part, c, P, cache) {
      const mo = motion(part.role, c);
      ctx.save();
      if (mo && part.pivot) { const pv = toM(part.pivot); ctx.translate(pv[0] + mo.dx, pv[1] + mo.dy); ctx.rotate(mo.rot); ctx.translate(-pv[0], -pv[1]); }
      ctx.save(); ctx.scale(k, -k); ctx.translate(-cx, -bottom); ctx.save();
      SVGSPRITE.drawPaths(ctx, part.paths, col => { const key = col[0] + ',' + col[1] + ',' + col[2]; let v = cache.get(key); if (!v) { const sat = Math.max(col[0], col[1], col[2]) - Math.min(col[0], col[1], col[2]); v = (sat > 70 && P.spot ? P.spot : P.col)(col); cache.set(key, v); } return v; }, 1);
      ctx.restore(); ctx.restore();
      for (const ch of part.children) drawPart(ctx, ch, c, P, cache);
      ctx.restore();
    }
    const entry = {
      name: name || ((base ? base.name : rig.creature || 'the edit') + ' (edited)'), h, w, faceY: base ? base.faceY * (h / base.h) : h * 0.85,
      stepRate: base ? base.stepRate : 1, catchDist: base ? base.catchDist : 1.4, sound: null, lab: true, edited: true, rig,
      timeScale: base ? base.timeScale : undefined, death: base ? base.death : undefined, seenFrac: base ? base.seenFrac : undefined,
      init(c) { if (base) base.init(c); },
      speedMult(c, dt, seen) { return base ? base.speedMult(c, dt, seen) : 1; },
      lateral: base && base.lateral ? c => base.lateral(c) : undefined,
      draw(ctx, c, P) {
        const bob = c.moving ? Math.abs(Math.sin(c.gait)) * 0.03 : 0;
        ctx.save(); ctx.translate(0, bob);
        const cache = new Map();
        for (const part of rig.parts) drawPart(ctx, part, c, P, cache);
        ctx.restore();
      },
    };
    return entry;
  }
  // registered from a generated file (lab2d/js/creatures/edited/<id>.js): the text is parsed when first read
  const pending = {};
  function register(id, text) { pending[id] = text; }
  function installAll() {
    for (const id in pending) {
      try { const rig = parseRig(pending[id]); CREATURES[id + '-edited'] = makeCreature(rig, id); } catch (e) { console.error('edited creature ' + id + ': ' + e.message); }
      delete pending[id];
    }
  }
  const hasParts = text => /<g[^>]*\bid="/.test(text) && /pivot/i.test(text);
  return { parseRig, makeCreature, motion, register, installAll, hasParts, roleOf };
})();
