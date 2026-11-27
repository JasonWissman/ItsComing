'use strict';
// Notebook Lab (lab/journal.html): night 9's notebook, written and drawn by js/levels/night09.js itself.
// The night keeps its notebook inside its own closure, so the lab gets at it the one way the night offers: it runs the
// night's build(L) with a bare L (L.s, L.rand), which writes the notebook into L.s (pages, keyPage, numberText, others)
// and draws its pages into canvases (document.createElement('canvas'): the back of a page, the cover out and in, each
// page in order, then a spare copy of the page with the number) and the number in blood (an <img> of an SVG, drawn onto
// its page once loaded), and then stops at the street, which needs the rest of the game. The lab watches
// document.createElement while it runs to keep those canvases. To learn which pages the notebook can hold and how often,
// it runs the same build many times with stand-in canvases that draw nothing.
(() => {
  const $ = id => document.getElementById(id);
  const DEF = LEVELS.find(d => d.id === 'booth') || LEVELS[0];
  const NIGHT_INDEX = 8;    // night 9 is LEVELS[8] in the game, which the night's generator seed is made from
  const SAMPLES = 1500;     // notebooks written to learn what it can hold

  // ---- running the night's build ----
  const ctxStub = new Proxy({}, { get: (t, k) => (k in t ? t[k] : k === 'measureText' ? () => ({ width: 12 }) : () => ctxStub), set: (t, k, v) => { t[k] = v; return true; } });
  const stubOf = tag => (tag === 'canvas' ? { tagName: 'CANVAS', width: 0, height: 0, getContext: () => ctxStub } : { tagName: String(tag).toUpperCase(), style: {} });
  function write(rand, real) {
    const L = { s: {}, rand }, made = [], orig = document.createElement;
    document.createElement = function (tag, o) { const e = real ? orig.call(document, tag, o) : stubOf(tag); made.push(e); return e; };
    let err = null;
    try { DEF.build(L); } catch (e) { err = e; } finally { document.createElement = orig; }
    const s = L.s;
    if (!s.pages) throw err || new Error('night 9 wrote no notebook');
    const cv = made.filter(e => e.tagName === 'CANVAS'), n = s.pages.length;
    const drawn = cv.length >= 3 + n;   // the back, the cover out and in, then the pages in order
    return { s, pages: s.pages, keyPage: s.keyPage, numberText: s.numberText, others: s.others || [],
      back: drawn ? cv[0] : null, out: drawn ? cv[1] : null, inside: drawn ? cv[2] : null, canvases: drawn ? cv.slice(3, 3 + n) : [] };
  }
  // as the game seeds it (js/game.js buildLevelDef): from the run seed, the night and the count of nights built so far
  // this session; the lane is drawn first (pickLane: night 9 has two streets), then the night's build
  const genSeed = (run, attempt) => (run * 7919 + NIGHT_INDEX * 131 + attempt * 17) >>> 0;
  const gameRand = (run, attempt) => { const r = mulberry32(genSeed(run, attempt)); r(); return r; };
  // the blood is drawn in once its image loads: wait for it (or give up after a while: the plain red hand stays)
  const bloodIn = nb => new Promise(res => { const t0 = performance.now(); const tick = () => (nb.s.bloodDrawn || performance.now() - t0 > 4000 ? res() : setTimeout(tick, 40)); tick(); });
  const copyOf = src => { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; };

  // ---- the pages, as kinds: every ordinary number is {n}, the one to ring {k} ----
  const NUM = /555-01\d\d/g, HAS_NUM = /555-01\d\d/;
  const norm = (lines, isKey) => lines.map(l => (isKey ? l.replace(NUM, '{k}') : l.replace(NUM, '{n}')));
  const plain = l => (/^[#~!%]/.test(l) ? l.slice(1) : l);
  const slug = t => t.toLowerCase().replace(/\{[nk]\}/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
  // the pages with no heading, named here by their first line (any other is called by its first line)
  const UNHEADED = [['Danny:', 'Names and numbers', 'names'], ['saw it again', 'The thing by the lamps', 'lamps'], ['pay the gas', 'Things to do', 'todo'], ['milk', 'Shopping list', 'shop']];
  function kindOf(lines, isKey) {
    const L = norm(lines, isKey), head = L.find(l => l[0] === '#');
    const named = !isKey && !head && UNHEADED.find(u => L[0].startsWith(u[0]));
    const title = isKey ? 'The number to ring' : head ? plain(head) : named ? named[1] : plain(L[0]).replace(/\{n\}/g, '…');
    return { sig: L.join('\n'), lines: L, title, id: isKey ? 'number' : named ? named[2] : slug(title), isKey };
  }

  // ---- what it can hold: many notebooks, each page counted by kind ----
  const pool = new Map(), slots = new Map();
  let lengths = new Set();
  for (let i = 1; i <= SAMPLES; i++) {
    const nb = write(mulberry32((i * 2654435761) >>> 0), false);
    lengths.add(nb.pages.length);
    slots.set(nb.keyPage, (slots.get(nb.keyPage) || 0) + 1);
    nb.pages.forEach((p, j) => {
      const k = kindOf(p, j === nb.keyPage);
      let e = pool.get(k.sig);
      if (!e) { e = Object.assign(k, { count: 0, where: new Map(), seed: (i * 2654435761) >>> 0, at: j }); pool.set(k.sig, e); }
      e.count++; e.where.set(j, (e.where.get(j) || 0) + 1);
    });
  }
  // the same id twice (two pages with the same heading) gets a number
  const seen = {};
  for (const e of pool.values()) { seen[e.id] = (seen[e.id] || 0) + 1; if (seen[e.id] > 1) e.id += '-' + seen[e.id]; }
  const kinds = [...pool.values()].sort((a, b) => (b.isKey - a.isKey) || (b.count - a.count) || a.title.localeCompare(b.title));
  const pct = c => { const p = 100 * c / SAMPLES; return p > 99.95 ? 'always' : p < 0.05 ? 'never' : (p < 10 ? p.toFixed(1) : Math.round(p)) + '%'; };
  const nPages = [...lengths].join(' or ');

  // ---- how it is put together (from the night's code, and what the samples show) ----
  const always = kinds.filter(k => !k.isKey && k.count === SAMPLES), some = kinds.filter(k => !k.isKey && k.count < SAMPLES);
  const keySlots = [...slots.keys()].sort((a, b) => a - b).map(j => j + 1);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const HOW = [
    ['What it is', '<p>A small reporter\'s pad with its spiral along the top, lying shut on the shelf under the pay phone. Click it and the hand lifts the cover back over the spiral to stand against the backboard; each click after turns the next page back the same way, and a click on the last page shuts it. It is read where it lies, zoomed in (Shift, Z or Space). Each page is drawn once into a 560 x 740 canvas and laid on the pad in perspective.</p>'],
    ['Which pages, in what order', '<ul><li>' + nPages + ' pages behind a red-brown cloth cover (bare grey board inside).</li>' +
      '<li>Always in it: ' + always.map(k => '<b>' + esc(k.title) + '</b>').join(', ') + ', and the page with the number.</li>' +
      '<li>Then one of the dated pages with someone\'s number on it (dentist, night bus, yoga, doctor), and three more drawn from the other numbered pages and the plain ones (' + some.length + ' to choose from in all), so there are always a few ordinary numbers to mistake for the one.</li>' +
      '<li>Those six are shuffled; the page with the number is then put in among them, never on the first two nor further back than page ' + keySlots[keySlots.length - 1] + ': page ' + keySlots.slice(0, -1).join(', ') + (keySlots.length > 1 ? ' or ' : '') + keySlots[keySlots.length - 1] + ', each about as often (' + keySlots.map(p => Math.round(100 * slots.get(p - 1) / SAMPLES) + '%').join(', ') + ' of ' + SAMPLES + ' notebooks).</li>' +
      '<li>Chosen per night, per attempt: the night\'s generator is seeded from the run seed, the night and how many nights have been built this session, so a retry is a new notebook. Set the run seed and attempt above to see one.</li></ul>'],
    ['The numbers', '<ul><li>All of them <code>555-01xx</code>, every one different on the page and between pages. The one to ring is drawn first.</li>' +
      '<li>It is alone on its page, scrawled large on a rising slant as if with a fingertip in blood: an SVG drawn with each figure leaning and sized differently, a dark rim, a skipping second pass, a wet sheen, blood soaked into the paper, a smear wiped under it, drips running down and spots flicked off. Until that image loads, the same figures in a plain red italic.</li>' +
      '<li>Every other number belongs to someone ordinary and is not in service; the phone says so.</li></ul>'],
    ['The hand', '<ul><li>Blue-black ink (<code>#22305c</code>) in an italic handwriting face, 33 px, on blue rules 66 px apart, right of a red margin, under the perforation and nine holes for the spiral. The edges are browned.</li>' +
      '<li>Each line a little off the level and the margin, each word a little off the line; a line too long for the page runs on to the next rule, indented.</li>' +
      '<li>Marks in the text: <span class="mk">#</span> a heading, underlined; <span class="mk">~</span> crossed out (and a little fainter); <span class="mk">!</span> underlined twice; <span class="mk">%</span> the number in blood. The page number is in small Georgia italic at the foot, bottom right.</li></ul>'],
  ];
  $('how').innerHTML = HOW.map(([h, b]) => '<section><h3>' + h + '</h3>' + b + '</section>').join('');

  // ---- comments ----
  let notes = {};
  try { notes = JSON.parse(localStorage.getItem('notebookLabNotes') || '{}') || {}; } catch (e) { notes = {}; }
  const saveNotes = () => { try { localStorage.setItem('notebookLabNotes', JSON.stringify(notes)); } catch (e) {} };

  const lineHTML = l => {
    const m = l[0], t = esc(plain(l)).replace(/\{n\}/g, '<span class="n">555-01··</span>').replace(/\{k\}/g, '555-01··');
    return '<li class="' + ({ '#': 'h', '~': 's', '!': 'e', '%': 'k' }[m] || '') + '">' + t + '</li>';
  };
  // the cover and the backs of the pages: drawn the same every time
  const FIXED = [
    { id: 'cover', title: 'The cover', d: 'Worn red-brown cloth over board, a dark border, scuffs, a cream label with a blue line on it, and the holes for the spiral.', canvas: 'out' },
    { id: 'inside-cover', title: 'Inside the cover', d: 'Bare grey board with its grain, seen once the cover is turned back.', canvas: 'inside' },
    { id: 'page-back', title: 'The back of a page', d: 'A little darker paper with the rules but no margin, seen as each page stands turned back against the board.', canvas: 'back' },
  ];
  const cards = $('cards'), cardCanvas = new Map();
  const addCard = (id, title, chips, inner) => {
    const el = document.createElement('article'); el.className = 'card'; el.id = 'pg-' + id;
    const cv = document.createElement('canvas'); cv.width = 560; cv.height = 740; cv.setAttribute('aria-label', title + ', as drawn in the game');
    const body = document.createElement('div'); body.className = 'body';
    body.innerHTML = '<div class="who">' + esc(title) + '</div><div class="meta">' + chips + '</div>' + inner;
    const ta = document.createElement('textarea'); ta.placeholder = 'Comment on this page…'; ta.setAttribute('aria-label', 'Comment: ' + title);
    ta.value = notes[id] || '';
    const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.max(34, ta.scrollHeight + 2) + 'px'; };
    ta.addEventListener('input', () => { if (ta.value.trim()) notes[id] = ta.value; else delete notes[id]; saveNotes(); el.classList.toggle('noted', !!ta.value.trim()); fit(); });
    el.classList.toggle('noted', !!ta.value.trim());
    body.appendChild(ta); el.append(cv, body); cards.appendChild(el); cardCanvas.set(id, cv);
    requestAnimationFrame(fit);
  };
  for (const k of kinds) {
    const where = [...k.where.keys()].sort((a, b) => a - b).map(j => j + 1);
    const chips = (k.isKey ? '<span class="chip key">the number</span>' : '') + '<span class="chip' + (k.count === SAMPLES ? ' always' : '') + '">' + (k.count === SAMPLES ? 'always in it' : 'in ' + pct(k.count) + ' of notebooks') + '</span>' +
      '<span class="chip">page ' + (where.length > 3 ? where[0] + '–' + where[where.length - 1] : where.join(', ')) + '</span><span class="chip">id ' + k.id + '</span>';
    addCard(k.id, k.title, chips, '<ul class="lines">' + k.lines.map(lineHTML).join('') + '</ul>');
  }
  for (const f of FIXED) addCard(f.id, f.title, '<span class="chip always">always</span><span class="chip">id ' + f.id + '</span>', '<p class="note-d">' + esc(f.d) + '</p>');
  $('poolNote').textContent = kinds.length + ' pages and the cover, from ' + SAMPLES + ' notebooks written by the night';

  // each card's page drawn by the game: from a notebook that has it (the cover and backs from the first)
  const paint = (cv, src) => { if (cv && src) cv.getContext('2d').drawImage(src, 0, 0, cv.width, cv.height); };
  (async () => {
    const bySeed = new Map();
    for (const k of kinds) { if (!bySeed.has(k.seed)) bySeed.set(k.seed, []); bySeed.get(k.seed).push(k); }
    let first = true;
    for (const [seed, ks] of bySeed) {
      const nb = write(mulberry32(seed), true);
      if (!nb.canvases.length) continue;
      if (ks.some(k => k.isKey)) await bloodIn(nb);
      for (const k of ks) paint(cardCanvas.get(k.id), nb.canvases[k.at]);
      if (first) { first = false; for (const f of FIXED) paint(cardCanvas.get(f.id), nb[f.canvas]); }
    }
  })();

  // ---- one run's notebook ----
  let current = null;
  const strip = $('strip');
  async function show() {
    const run = Math.max(0, Math.floor(+$('runSeed').value || 0)), att = Math.max(1, Math.floor(+$('attempt').value || 1));
    try { localStorage.setItem('notebookLabSeed', JSON.stringify({ run, att })); } catch (e) {}
    let nb;
    try { nb = write(gameRand(run, att), true); $('err').hidden = true; } catch (e) { $('err').hidden = false; $('err').textContent = 'The night would not write its notebook: ' + e; return; }
    current = { run, att, nb };
    $('gen').textContent = 'run seed ' + run + ', attempt ' + att + ' · generator seed ' + genSeed(run, att) + ' · the number ' + nb.numberText + ' on page ' + (nb.keyPage + 1) + ' of ' + nb.pages.length;
    strip.innerHTML = '';
    const leaf = (src, cap, cls) => {
      const f = document.createElement('figure'); f.className = 'leaf' + (cls ? ' ' + cls : '');
      const c = src ? copyOf(src) : document.createElement('canvas');
      f.append(c); const fc = document.createElement('figcaption'); fc.innerHTML = cap; f.append(fc); strip.appendChild(f); return c;
    };
    leaf(nb.out, '<b>cover</b>');
    const keyCanvas = [];
    nb.pages.forEach((p, j) => {
      const isKey = j === nb.keyPage, k = kindOf(p, isKey);
      const c = leaf(nb.canvases[j], '<b>' + (j + 1) + ' · ' + esc(k.title) + '</b><br>' + (isKey ? esc(nb.numberText) : esc(p.filter(l => HAS_NUM.test(l)).map(l => l.match(NUM).join(', ')).join(', ') || 'no number')), isKey ? 'key' : '');
      if (isKey) keyCanvas.push([c, nb.canvases[j]]);
    });
    await bloodIn(nb);
    if (current && current.nb === nb) for (const [c, src] of keyCanvas) c.getContext('2d').drawImage(src, 0, 0);
  }
  try { const v = JSON.parse(localStorage.getItem('notebookLabSeed') || 'null'); if (v) { $('runSeed').value = v.run; $('attempt').value = v.att; } } catch (e) {}
  $('runSeed').addEventListener('change', show); $('attempt').addEventListener('change', show);
  $('reroll').onclick = () => { $('runSeed').value = Math.floor(Math.random() * 1000000); show(); };
  show();

  // ---- export ----
  const toast = msg => { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2200); };
  const one = l => l.replace(/\s*\n+\s*/g, ' / ');
  function exportText(onlyNoted) {
    const items = kinds.map(k => ({ id: k.id, title: k.title, how: k.isKey ? 'the number, alone on its page in blood' : k.count === SAMPLES ? 'always in it' : 'in ' + pct(k.count) + ' of notebooks', text: k.lines.join(' / ') }))
      .concat(FIXED.map(f => ({ id: f.id, title: f.title, how: 'always', text: f.d })));
    const noted = items.filter(i => (notes[i.id] || '').trim());
    const list = onlyNoted ? noted : items;
    const head = 'Night 9 notebook (js/levels/night09.js: writeNotebook, writePage, bloodSVG): ' + nPages + ' pages; ' + kinds.length + ' kinds of page and the cover; ' + noted.length + ' with comments.' + (onlyNoted ? ' Only those follow.' : '') +
      '\nMarks in the text: # heading (underlined), ~ crossed out, ! underlined twice, % the number in blood; {n} an ordinary 555-01xx number, {k} the one to ring.' +
      (current ? '\nSeen with run seed ' + current.run + ', attempt ' + current.att + ': ' + current.nb.pages.map((p, j) => (j + 1) + ' ' + kindOf(p, j === current.nb.keyPage).id).join(', ') + ' (the number ' + current.nb.numberText + ').' : '');
    return head + '\n\n' + list.map(i => '- [' + i.id + '] ' + i.title + ' (' + i.how + ')\n    TEXT: ' + i.text + ((notes[i.id] || '').trim() ? '\n    COMMENT: ' + one(notes[i.id].trim()) : '')).join('\n');
  }
  function copy(onlyNoted) {
    if (onlyNoted && !Object.keys(notes).some(k => (notes[k] || '').trim())) { toast('No comments yet.'); return; }
    const text = exportText(onlyNoted), out = $('copyOut');
    const fallback = () => { out.value = text; out.classList.add('show'); out.style.height = Math.min(420, 60 + text.split('\n').length * 18) + 'px'; out.scrollIntoView({ block: 'nearest' }); out.focus(); out.select(); toast('Select all and copy the text below'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => { out.value = text; toast((onlyNoted ? 'Comments' : 'Every page and its comment') + ' copied. Paste it into the chat.'); }, fallback);
    else fallback();
  }
  $('copyAll').onclick = () => copy(false);
  $('copyNoted').onclick = () => copy(true);
  window.NOTEBOOK_LAB = { kinds, exportText, write };   // (for the lab's own checks)
})();
