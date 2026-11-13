'use strict';
// ---------- Creature Lab page: the grid of cards, the Tune dialog, notes ----------
(() => {
  // night order, and a stand-in for any creature whose poses file has not registered it
  const ORDER = [['walker', 1, 'The Road'], ['crawler', 2, 'The Car'], ['smiler', 3, 'The Graveyard'], ['watcher', 4, 'The Quarry'], ['runner', 5, 'The Clearing'],
    ['swimmer', 6, 'The Boathouse'], ['climber', 7, 'The Lighthouse'], ['customer', 8, 'The Diner'], ['signalman', 9, 'The Phone Booth'], ['other', 10, 'The Mirror Maze'],
    ['carrier', 11, 'The Farm'], ['tall', 12, 'The Bedroom'], ['demon', 13, 'The Void']];
  for (const [type, night, stage] of ORDER) {
    if (!CREATURES[type] || LAB.list.some(e => e.type === type)) continue;
    LAB.creature(type, { night, stage, anims: [{ name: 'Standing', dur: 4 }, { name: 'Walking', walk: 1.2, dur: 4 }, { name: 'Lunge', dist: 2, dur: 1.2, tick(c, k) { c.lunge = k; } }] });
  }
  const rank = t => { const i = ORDER.findIndex(o => o[0] === t); return i < 0 ? 99 : i; };
  LAB.list.sort((a, b) => rank(a.type) - rank(b.type));
  const o = LAB.opts;
  o.trueH = Math.max(...LAB.list.map(e => Math.max(CREATURES[e.type].h, (e.fit && e.fit.h) || 0))) * 1.05;

  // notes: { type: { animName: text } }, kept in this browser
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem('creatureLabNotes') || '{}') || {}; } catch (e) { notes = {}; }
  const saveNotes = () => { try { localStorage.setItem('creatureLabNotes', JSON.stringify(notes)); } catch (e) {} };
  const noteOf = (type, name) => (notes[type] && notes[type][name]) || '';
  const label = e => 'Night ' + e.night + ' · ' + e.stage;
  const cname = e => CREATURES[e.type].name.replace(/^the /, 'The ');

  const grid = document.getElementById('grid'), cards = [];
  for (const e of LAB.list) {
    const el = document.createElement('article'); el.className = 'card';
    el.innerHTML = '<div class="head"><span class="who"></span><span class="night"></span></div><canvas tabindex="0"></canvas>' +
      '<div class="foot"><button class="prev" aria-label="Previous animation">‹</button><div class="anim-name"><b></b><span></span></div><button class="next" aria-label="Next animation">›</button></div>' +
      '<div class="tools"><button class="tuneB">Tune</button><button class="restart">Restart</button></div>';
    el.querySelector('.who').textContent = cname(e);
    el.querySelector('.night').textContent = label(e);
    const cv = el.querySelector('canvas');
    cv.setAttribute('aria-label', cname(e) + '. Click for the next animation.');
    const card = new LAB.Card(e, cv, c => {
      const a = c.anim();
      el.querySelector('.anim-name b').textContent = a.name;
      el.querySelector('.anim-name b').className = noteOf(e.type, a.name) ? 'has-note' : '';
      el.querySelector('.anim-name span').textContent = (c.i + 1) + ' / ' + e.anims.length;
    });
    cv.addEventListener('click', ev => card.go(ev.shiftKey ? -1 : 1));
    cv.addEventListener('contextmenu', ev => { ev.preventDefault(); card.go(-1); });
    cv.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') { ev.preventDefault(); card.go(1); } else if (ev.key === 'ArrowLeft') { ev.preventDefault(); card.go(-1); } });
    el.querySelector('.prev').onclick = () => card.go(-1);
    el.querySelector('.next').onclick = () => card.go(1);
    el.querySelector('.restart').onclick = () => card.reset();
    el.querySelector('.tuneB').onclick = () => openTune(card);
    grid.appendChild(el);
    cards.push(card);
    card.el = el;
  }

  // ---- global controls ----
  const playB = document.getElementById('play');
  const setPlaying = p => { o.playing = p; playB.textContent = p ? 'Pause' : 'Play'; playB.setAttribute('aria-pressed', String(p)); bPlay.textContent = p ? 'Pause' : 'Play'; };
  playB.onclick = () => setPlaying(!o.playing);
  document.getElementById('speed').onchange = ev => { o.speed = +ev.target.value; };
  const scFit = document.getElementById('scFit'), scTrue = document.getElementById('scTrue');
  scFit.onclick = () => { o.scale = 'fit'; scFit.setAttribute('aria-pressed', 'true'); scTrue.setAttribute('aria-pressed', 'false'); };
  scTrue.onclick = () => { o.scale = 'true'; scTrue.setAttribute('aria-pressed', 'true'); scFit.setAttribute('aria-pressed', 'false'); };
  for (const b of document.querySelectorAll('[data-bg]')) b.onclick = () => { o.bg = b.dataset.bg; for (const x of document.querySelectorAll('[data-bg]')) x.setAttribute('aria-pressed', String(x === b)); };

  const toast = msg => { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 1800); };
  document.getElementById('copy').onclick = () => {
    const lines = [];
    for (const e of LAB.list) {
      const n = notes[e.type]; if (!n) continue;
      const own = e.anims.filter(a => (n[a.name] || '').trim());
      if (!own.length) continue;
      lines.push(cname(e) + ' (' + label(e) + ')');
      for (const a of own) lines.push('  - ' + a.name + ': ' + n[a.name].trim().replace(/\n+/g, ' / '));
    }
    const text = lines.length ? 'Creature lab notes:\n' + lines.join('\n') : '';
    if (!text) { toast('No notes yet. Open Tune on a creature to write some.'); return; }
    const out = document.getElementById('copyOut');
    const fallback = () => { out.value = text; out.classList.add('show'); out.style.height = Math.min(400, 40 + lines.length * 20) + 'px'; out.focus(); out.select(); toast('Select all and copy the notes below'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast('Notes copied. Paste them into the chat.'), fallback);
    else fallback();
  };

  // ---- the Tune dialog: one card, large ----
  const dlg = document.getElementById('tune'), big = document.getElementById('big');
  const scrub = document.getElementById('scrub'), dist = document.getElementById('dist'), lit = document.getElementById('lit'), fog = document.getElementById('fog');
  const bPlay = document.getElementById('bPlay'), note = document.getElementById('note');
  let tune = null;   // { card (a Card on the big canvas), src (the grid card) }
  const tuneOpts = { lit: null, fog: 0, dist: null, grid: false };
  function openTune(src) {
    const card = new LAB.Card(src.entry, big, () => syncTune());
    card.i = src.i; card.reset();
    tune = { card, src };
    tuneOpts.lit = null; tuneOpts.dist = null; tuneOpts.fog = 0; fog.value = 0;
    document.getElementById('tuneTitle').textContent = cname(src.entry);
    document.getElementById('tuneNight').textContent = label(src.entry);
    syncTune();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
  }
  function syncTune() {
    if (!tune) return;
    const card = tune.card, e = card.entry, a = card.anim();
    const list = document.getElementById('animList'); list.innerHTML = '';
    e.anims.forEach((an, i) => {
      const b = document.createElement('button');
      b.innerHTML = '<span></span><em></em>'; b.firstChild.textContent = an.name; b.lastChild.textContent = noteOf(e.type, an.name) ? 'note' : '';
      b.setAttribute('aria-current', String(i === card.i));
      b.onclick = () => { card.i = i; tuneOpts.dist = null; tuneOpts.lit = null; card.reset(); };
      list.appendChild(b);
    });
    document.getElementById('what').textContent = a.note || '';
    note.value = noteOf(e.type, a.name);
    const d = card.c ? card.c.dist : 10;
    dist.value = d; document.getElementById('distOut').textContent = d.toFixed(1) + ' m';
    const l = tuneOpts.lit !== null ? tuneOpts.lit : (a.lit !== undefined ? a.lit : (e.lit || 0));
    lit.value = l; document.getElementById('litOut').textContent = Math.round(l * 100) + '%';
    document.getElementById('fogOut').textContent = Math.round(tuneOpts.fog * 100) + '%';
  }
  note.addEventListener('input', () => {
    if (!tune) return;
    const e = tune.card.entry, a = tune.card.anim();
    (notes[e.type] = notes[e.type] || {})[a.name] = note.value;
    if (!note.value.trim()) delete notes[e.type][a.name];
    saveNotes();
    const b = document.querySelector('#animList [aria-current="true"] em'); if (b) b.textContent = note.value.trim() ? 'note' : '';
    if (tune.src.i === tune.card.i) tune.src.onChange(tune.src);
  });
  const closeTune = () => { if (tune) { tune.src.onChange(tune.src); } tune = null; if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  document.getElementById('close').onclick = closeTune;
  dlg.addEventListener('close', () => { tune = null; for (const c of cards) c.onChange(c); });
  big.addEventListener('click', ev => { if (tune) { tuneOpts.dist = null; tuneOpts.lit = null; tune.card.go(ev.shiftKey ? -1 : 1); } });
  bPlay.onclick = () => setPlaying(!o.playing);
  document.getElementById('bRestart').onclick = () => { if (tune) { tune.card.reset(); applyTuneDist(); } };
  const stepBy = n => { if (!tune) return; setPlaying(false); const c = tune.card, T = clamp(c.T + n / 60, 0, c.dur() - 1e-4); c.seek(T); applyTuneDist(); };
  document.getElementById('bBack').onclick = () => stepBy(-1);
  document.getElementById('bFwd').onclick = () => stepBy(1);
  scrub.addEventListener('input', () => { if (!tune) return; setPlaying(false); const c = tune.card; c.seek(+scrub.value * (c.dur() - 1e-4)); applyTuneDist(); });
  // a distance set by hand holds through the loop (an animation that walks it in sets its own until you move this)
  function applyTuneDist() { if (tune && tuneOpts.dist !== null && tune.card.c) tune.card.c.dist = tuneOpts.dist; }
  dist.addEventListener('input', () => { tuneOpts.dist = +dist.value; applyTuneDist(); document.getElementById('distOut').textContent = (+dist.value).toFixed(1) + ' m'; });
  lit.addEventListener('input', () => { tuneOpts.lit = +lit.value; document.getElementById('litOut').textContent = Math.round(+lit.value * 100) + '%'; });
  fog.addEventListener('input', () => { tuneOpts.fog = +fog.value; document.getElementById('fogOut').textContent = Math.round(+fog.value * 100) + '%'; });
  document.getElementById('grid1').addEventListener('change', ev => { tuneOpts.grid = ev.target.checked; });

  // ---- the clock ----
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000) * o.speed; last = now;
    const drawO = { bg: o.bg, scale: o.scale, trueH: o.trueH, fog: 0, lit: null };
    if (tune) {
      const c = tune.card;
      if (o.playing) { c.step(dt); applyTuneDist(); }
      c.draw(Object.assign({}, drawO, { lit: tuneOpts.lit, fog: tuneOpts.fog, grid: tuneOpts.grid }));
      scrub.value = c.T / c.dur(); document.getElementById('scrubOut').textContent = c.T.toFixed(2) + ' s';
      if (tuneOpts.dist === null && c.c) { dist.value = c.c.dist; document.getElementById('distOut').textContent = c.c.dist.toFixed(1) + ' m'; }
    } else {
      for (const c of cards) {
        const r = c.canvas.getBoundingClientRect();
        if (r.bottom < -50 || r.top > innerHeight + 50) continue;   // off screen: leave it be
        if (o.playing) c.step(dt);
        c.draw(drawO);
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
