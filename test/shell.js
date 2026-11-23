'use strict';
// The shell round its nights: the Scores' two tabs (a secret scene's box where its night's box is), the captions' line (a
// speaker, the top left corner, over nothing of the HUD; no caption for the clock's tick), the results after the ending
// when the run found secret scenes (their tab, the new ones checked off, the stamp when that is all of them), the things
// that are named without a count, the words that follow the text size (the warning's, the prologue's), and a night's card.
// On a desktop and on a phone held sideways.
// Run on its own (node test/shell.js) or from test/features.js, which hands it its browser and its check.
const path = require('path');
const fs = require('fs');
const T = require('./lib');
const VIEWS = { desktop: { viewport: { width: 1280, height: 760 } }, phone: { viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true }, 'small phone': { viewport: { width: 667, height: 375 }, hasTouch: true, isMobile: true }, 'narrow window': { viewport: { width: 600, height: 800 } } };
const SIZES = [['Smaller', 1], ['Normal', 1.4], ['Bigger', 1.8]];
const TITLES = 13;

async function run(browser, check) {
  const shot = (page, n) => { fs.mkdirSync(T.SHOTS, { recursive: true }); return page.screenshot({ path: path.join(T.SHOTS, n + '.png') }); };
  const errors = [];
  const open = async (view, q, init) => {
    const ctx = await browser.newContext(VIEWS[view]);
    if (init) await ctx.addInitScript(init);
    const page = await ctx.newPage();
    page.on('pageerror', e => errors.push('PAGEERROR (' + view + ') ' + e.message));
    await page.goto(T.INDEX + (q || '')); await page.waitForTimeout(500);
    return { ctx, page };
  };
  // a save with a best run and some secret scenes found, at a text size
  const saved = (eggs, ts) => 'localStorage.setItem("itscoming.v2", JSON.stringify({ v: 4, unlocked: { nightmare: 13 }, complete: { nightmare: true }, bestRun: { nightmare: { t: 412, nights: [31, 28, 40, 22, 35, 30, 27, 33, 41, 29, 36, 25, 35] } }, settings: { textSize: ' + ts + ' }, warned: true, eggs: ' + JSON.stringify(eggs) + ' }))';

  // Scores: the Secret scenes' thirteen boxes are the Best run's, box for box: the same place, the same size, the same
  // order, at every size of page and of text, so the two are matched by where they are
  console.log('== Scores: a secret scene\'s box is where its night\'s is ==');
  for (const view of Object.keys(VIEWS)) {
    const rows = [];
    for (const [name, ts] of SIZES) {
      const { ctx, page } = await open(view, '', saved({ road: true, graveyard: true, booth: true, bedroom: true }, ts));
      await page.evaluate(() => MENU.show('nights', { from: 'title' })); await page.waitForTimeout(200);
      // (each box against the two panels' own place, so a dialog that scrolls on a narrow page is measured the same scrolled or not)
      const boxes = () => page.evaluate(() => { const o = document.querySelector('#overlay .tabstack').getBoundingClientRect(); return [...document.querySelectorAll('#overlay .tabpanel:not([hidden]) .ncard')].map(e => { const r = e.getBoundingClientRect(); return [r.left - o.left, r.top - o.top, r.width, r.height]; }); });
      const a = await boxes();
      await page.click('#tab-eggs'); await page.waitForTimeout(150);
      const b = await boxes();
      const look = await page.evaluate(() => { const p = document.querySelector('#panel-eggs'), e = [...p.querySelectorAll('.egg')]; return { names: e.map(x => x.querySelector('.ename').textContent).join('|'), found: e.filter(x => x.classList.contains('found')).length, count: p.querySelector('.eggcount').textContent, marks: e.every(x => { const m = x.querySelector('.emark').getBoundingClientRect(), n = x.querySelector('.ename').getBoundingClientRect(), r = x.getBoundingClientRect(); return m.width >= 10 && m.right <= n.left && m.top >= r.top && m.bottom <= r.bottom; }), want: LEVELS.map(l => eggTitle(l.id)).join('|') }; });
      const off = a.length === TITLES && b.length === TITLES ? Math.max(...a.map((r, i) => Math.max(...r.map((x, k) => Math.abs(x - b[i][k]))))) : -1;
      rows.push({ name, n: [a.length, b.length], off: +off.toFixed(2), order: look.names === look.want, found: look.found, count: look.count, marks: look.marks });
      if (ts === 1.4) { await shot(page, 'scores-eggs-' + view.replace(/ /g, '-')); await page.click('#tab-run'); await page.waitForTimeout(100); await shot(page, 'scores-run-' + view.replace(/ /g, '-')); }
      await ctx.close();
    }
    check(rows.every(r => r.off >= 0 && r.off < 0.6 && r.order && r.found === 4 && r.count === '4 of 13 found' && r.marks),
      view + ': the thirteen secret scenes in the nights\' order, each box exactly where its night\'s box is and its size (within half a pixel), at every text size; its check box inside it, before its title (' + JSON.stringify(rows) + ')');
  }

  // Captions: a speaker before the line, in the top left corner under the sound line (a phone: under the menu button).
  // Every line there is, with a side marker, is on one line (two on a narrow page), whole, and over nothing of the HUD,
  // with six things held, a line of words up under the compass and the zoom on; the clock's tick has no caption
  console.log('== captions: a speaker, the top left corner, over nothing ==');
  for (const view of ['desktop', 'phone', 'small phone']) {
    const { ctx, page } = await open(view, '?level=3&go&seed=1');
    const rows = [];
    for (const [name, ts] of SIZES) {
      rows.push(Object.assign({ name }, await page.evaluate(ts => {
        MENU.applySetting('captions', true); MENU.applySetting('textSize', ts);
        const L = G.L; G.L.creature.hold = G.L.creature.dist;
        while (G.inv.length < 6) { const it = L.items[G.inv.length % L.items.length]; it.taken = true; G.inv.push(it); }
        G.invSig = ''; G.cam.zoomHeld = true; G.cam.zoom = 2.6; G.step(0.016, 2);
        G.toast('No room to put it down here.', 60);
        const el = document.getElementById('caption'), tx = el.querySelector('.ctx'), apart = (a, b) => a.right <= b.left + 0.5 || b.right <= a.left + 0.5 || a.bottom <= b.top + 0.5 || b.bottom <= a.top + 0.5;
        const others = ['mute', 'menuBtn', 'fsBtn', 'zoomBtn', 'compass', 'pitch', 'zoom', 'toast', 'inventory', 'tooltip', 'objective'].map(id => [id, document.getElementById(id)])
          .filter(([, e]) => e && getComputedStyle(e).display !== 'none').map(([id, e]) => [id, e.getBoundingClientRect()]).filter(([, q]) => q.width > 0 && q.height > 0);
        const o = { n: 0, cut: [], over: [], out: [], tall: 0, wide: 0, small: 99, seen: others.map(([id]) => id).join(), slots: document.querySelectorAll('#inventory .slot').length };
        for (const t of CAPTIONS.all()) for (const pan of [-1, 1]) {
          CAPTIONS.show(t, pan, 1); o.n++;
          const r = el.getBoundingClientRect(), fs = parseFloat(getComputedStyle(el).fontSize);
          if (tx.scrollWidth > tx.clientWidth + 1 || !el.classList.contains('show')) o.cut.push(t);
          if (!(r.left >= 0 && r.top >= 0 && r.right < innerWidth / 2 && r.bottom < innerHeight * 0.32)) o.out.push(t);
          for (const [id, q] of others) if (!apart(r, q)) o.over.push(id + ':' + t);
          o.tall = Math.max(o.tall, Math.round(r.height / (fs * 1.25))); o.wide = Math.max(o.wide, Math.round(r.right)); o.small = Math.min(o.small, fs);
        }
        const ic = el.querySelector('svg'), ir = ic.getBoundingClientRect(), wr = tx.getBoundingClientRect();
        return Object.assign(o, { icon: ic.getAttribute('aria-hidden') === 'true' && ir.width >= 9 && ir.right <= wr.left && Math.abs((ir.top + ir.bottom) / 2 - (wr.top + wr.bottom) / 2) < 4, pe: getComputedStyle(el).pointerEvents, small: +o.small.toFixed(1), toastUp: document.getElementById('toast').classList.contains('show') });
      }, ts)));
      if (ts === 1.4) { await page.evaluate(() => CAPTIONS.show('something pounds on the door', 1, 1)); await page.waitForTimeout(350); await shot(page, 'caption-' + view.replace(/ /g, '-')); }
    }
    const lines = view === 'small phone' ? 2 : 1;
    check(rows.every(r => r.n > 250 && !r.cut.length && !r.over.length && !r.out.length && r.tall <= lines && r.icon && r.pe === 'none' && r.small >= 10 && r.slots === 6 && r.toastUp && /toast/.test(r.seen) && /inventory/.test(r.seen) && /compass/.test(r.seen) && /zoom/.test(r.seen)),
      view + ': every caption, marked left or right, is whole (set smaller, never cut), on ' + lines + ' line' + (lines > 1 ? 's at most' : '') + ' in the top left corner, a speaker before it, over none of the corner controls, the compass and what is under it, the line of words, the things held or the zoom button, at every text size (' + JSON.stringify(rows.map(r => [r.name, r.n, r.cut.length, r.over.slice(0, 3), r.out.slice(0, 2), r.tall, r.wide, r.small, r.seen])) + ')');
    if (view === 'desktop') {
      await page.waitForTimeout(1700);
      const tick = await page.evaluate(() => { ensureAudio(); const el = document.getElementById('caption'); CAPTIONS.show('a bell', 0, 1); const a = el.textContent; AUDIO.sfx('tick', 0.5, true); AUDIO.sfx('tick', 0.5); const b = el.textContent; AUDIO.sfx('bang', -0.9); return { a, b, c: el.textContent, all: CAPTIONS.all().some(t => /clock|tick/i.test(t)) }; });
      check(tick.a === 'a bell' && tick.b === 'a bell' && tick.c === '◀ something hits the boards' && !tick.all, 'the clock\'s tick has no caption (nothing replaces the line that is up); a sound that tells something still has its line, its side marked (' + JSON.stringify(tick) + ')');
    }
    await ctx.close();
  }

  // The results after the ending. A run that found secret scenes it did not have: two tabs, This run and Secret scenes,
  // open on the secret scenes; those found before are checked from the start, the run's own are checked off one after
  // another (the count going up with them), then the way out; all thirteen: a stamp. The times come in when their tab is
  // opened. A run that found none: the results as ever, no tabs. With reduced motion it is all there at once
  console.log('== the results: the secret scenes this run found ==');
  const results = async (page, eggs, fresh, motion) => page.evaluate(([eggs, fresh, motion]) => {
    SAVE.data.settings.reducedMotion = SAVE.data.settings.reducedFlash = !motion;
    SAVE.data.eggs = {}; for (const l of LEVELS) if (eggs === 'all' || eggs.includes(l.id)) SAVE.data.eggs[l.id] = true;
    SAVE.data.runEggs = fresh.slice(); SAVE.persist();
    G.lastRun = { t: 398.4, nights: [31, 28, 40, 22, 35, 30, 27, 33, 41, 29, 36, 25, 21.4], best: true };
    STORY.theme(true); setState('end'); MENU.show('ending'); MENU.act('done');
  }, [eggs, fresh, motion]);
  const rlook = page => page.evaluate(() => {
    const b = document.querySelector('#overlay .results'), tabs = [...b.querySelectorAll('[role=tab]')], e = [...b.querySelectorAll('.egg')], st = b.querySelector('.estamp'), last = b.querySelector('.rlast'), cs = st && getComputedStyle(st);
    return { tabs: tabs.map(t => t.textContent + (t.getAttribute('aria-selected') === 'true' ? '*' : '')).join('|'), found: e.filter(x => x.classList.contains('found')).map(x => x.querySelector('.ename').textContent).join('|'), fresh: e.filter(x => x.classList.contains('fresh')).length, ticked: e.filter(x => x.classList.contains('tick')).length,
      count: (b.querySelector('.ecnt') || {}).firstChild ? b.querySelector('.ecount').textContent : null, stamp: st ? st.textContent + ':' + (st.classList.contains('in') ? cs.opacity : 'out') : null, stampLook: st ? [cs.borderTopStyle, cs.borderTopColor, cs.textTransform, cs.transform !== 'none'].join() : null,
      way: last.classList.contains('in'), cards: b.querySelectorAll('.rcard.in').length, run: !!b.querySelector('.rrun.in'), scroll: b.scrollHeight - b.clientHeight, fits: b.getBoundingClientRect().bottom <= innerHeight && b.getBoundingClientRect().top >= 0, focus: document.activeElement && (document.activeElement.dataset.act || document.activeElement.id), kind: MENU.kind };
  });
  // what is checked, the count, how many have been checked off as they were watched, and whether the way out is in: each change, as it comes
  const watch = (page, ms) => page.evaluate(ms => new Promise(done => {
    const seq = [], t0 = performance.now();
    const iv = setInterval(() => {
      const b = document.querySelector('#overlay .results'), k = [...b.querySelectorAll('.egg.found .ename')].map(e => e.textContent).join('|') + ' ' + b.querySelector('.ecount').textContent + ' ' + b.querySelectorAll('.egg.tick').length + ' ' + (b.querySelector('.rlast').classList.contains('in') ? 'way' : '');
      if (seq[seq.length - 1] !== k) seq.push(k);
      if (performance.now() - t0 > ms) { clearInterval(iv); done(seq); }
    }, 20);
  }), ms);
  for (const view of ['desktop', 'phone']) {
    const tag = view.replace(/ /g, '-');
    const { ctx, page } = await open(view, '?level=13&go&seed=1');
    await page.evaluate(() => { window.__taps = 0; const f = AUDIO.sfx; AUDIO.sfx = (n, ...a) => { if (n === 'tap') window.__taps++; return f(n, ...a); }; });
    // two new ones of five found
    await results(page, ['road', 'graveyard', 'booth', 'quarry', 'barn'], ['graveyard', 'barn'], true);
    const r0 = await rlook(page), seq = await watch(page, 3000);
    const r2 = await rlook(page), taps = await page.evaluate(() => window.__taps);
    await shot(page, 'results-secrets-' + tag);
    check(r0.kind === 'results' && r0.tabs === 'This run|Secret scenes*' && r0.found === 'Hit and run|Staring contest|Its an emergency' && r0.fresh === 2 && r0.count === '3' && !r0.way && r0.stamp === null,
      view + ': a run that found two secret scenes it did not have: the results have two tabs and open on Secret scenes, those found before checked, the run\'s two not yet, 3 of 13 (' + JSON.stringify(r0) + ')');
    check(seq.join(' > ') === 'Hit and run|Staring contest|Its an emergency 3 0  > Hit and run|Sugar rush|Staring contest|Its an emergency 4 1  > Hit and run|Sugar rush|Staring contest|Its an emergency|Power overload 5 2  > Hit and run|Sugar rush|Staring contest|Its an emergency|Power overload 5 2 way' && r2.way && r2.focus === 'finish' && taps === 2 && r2.scroll <= 0 && r2.fits,
      view + ': they are checked off one after the other, in the nights\' order, the count going up with them, a tap for each; then Finish game, focused; it all fits the page (' + JSON.stringify([seq, r2.focus, taps, r2.scroll]) + ')');
    // the times: not come in until their tab is opened, then as ever; back on the secret scenes nothing starts again
    const t0 = await rlook(page);
    await page.click('#tab-run'); await page.waitForTimeout(1400); const t1 = await rlook(page);
    await page.mouse.click(8, innerHeightOf(view) - 8); await page.waitForTimeout(150); const t2 = await rlook(page);
    await shot(page, 'results-run-' + tag);
    await page.click('#tab-eggs'); await page.waitForTimeout(200); const t3 = await rlook(page);
    check(t0.cards === 0 && !t0.run && t1.tabs === 'This run*|Secret scenes' && t1.cards > 0 && t1.cards < 13 && t2.cards === 13 && t2.run && t2.way && t2.scroll <= 0 && t3.tabs === 'This run|Secret scenes*' && t3.found === r2.found && t3.count === '5',
      view + ': This run\'s times come in when its tab is first opened (a click hurries them), and it fits; back on Secret scenes they are as they were left (' + JSON.stringify([t0.cards, t1.cards, t2.cards, t2.run, t2.scroll, t3.count]) + ')');
    // a tab chosen while they are still being checked off: all checked at once, and the times start
    await results(page, ['road', 'graveyard', 'barn'], ['road', 'graveyard', 'barn'], true);
    await page.waitForFunction(() => document.querySelector('#overlay .ecount').textContent === '1', null, { timeout: 5000 }); const h0 = await rlook(page);
    await page.click('#tab-run'); await page.waitForTimeout(120); const h1 = await rlook(page);
    check(h0.count === '1' && h1.count === '3' && h1.way && h1.cards === 0 && !h1.run && h1.tabs === 'This run*|Secret scenes', view + ': the other tab chosen while they are being checked off: the rest are checked at once, and the times begin to come in (' + JSON.stringify([h0.count, h1.count, h1.way]) + ')');
    // the last ones: all thirteen, and a stamp says so, as Best run is stamped
    await results(page, 'all', ['bedroom', 'void'], true);
    const a0 = await rlook(page), aseq = await watch(page, 3600), a1 = await rlook(page);
    const best = await page.evaluate(() => { const s = document.querySelector('#overlay .rrun .stamp'), c = getComputedStyle(s); return s.textContent + '/' + [c.borderTopStyle, c.borderTopColor, c.textTransform, c.transform !== 'none'].join(); });
    await shot(page, 'results-secrets-all-' + tag);
    check(a0.count === '11' && a0.stamp === 'All secrets found:out' && aseq.length === 4 && / 13 2 way$/.test(aseq[3]) && a1.count === '13' && a1.stamp === 'All secrets found:1' && best === 'Best run/' + a1.stampLook && a1.scroll <= 0 && a1.fits && a1.way,
      view + ': the run\'s two make it all thirteen: when the last is checked off a stamp, All secrets found, in Best run\'s own style (' + JSON.stringify([a0.count, a0.stamp, a1.count, a1.stamp, a1.stampLook, best, a1.scroll]) + ')');
    // reduced motion: all there at once, nothing animated; no new ones: no tabs at all
    await results(page, ['road', 'graveyard'], ['graveyard'], false);
    await page.waitForTimeout(150); const q0 = await rlook(page);
    await results(page, ['road', 'graveyard'], [], true);
    await page.waitForTimeout(150); const n0 = await page.evaluate(() => ({ tabs: document.querySelectorAll('#overlay [role=tab]').length, eggs: document.querySelectorAll('#overlay .egg').length, cards: document.querySelectorAll('#overlay .rcard').length, kicker: !!document.querySelector('#overlay .results .kicker') }));
    check(q0.count === '2' && q0.ticked === 0 && q0.way && q0.found === 'Hit and run|Sugar rush' && n0.tabs === 0 && n0.eggs === 0 && n0.cards === 13 && n0.kicker,
      view + ': with reduced motion they are checked from the start, nothing moving; a run that found none has the results as ever, with no tabs (' + JSON.stringify([q0.count, q0.ticked, q0.way, n0]) + ')');
    await ctx.close();
  }
  {
    // which are the run's own: those first found between Begin and the results (the last night's ending too), kept in the
    // save; a run begun empties the list; one found outside a run is not on it; a save's list is tidied as it loads
    const { ctx, page } = await open('desktop', '');
    const r = await page.evaluate(() => {
      const o = {};
      SAVE.reset(); SAVE.egg('field'); beginRun(); o.begun = SAVE.data.runEggs.length;
      startLevel(0, false); G.run = { t: 0, night: 2, from: 0, nights: [] }; startLevel(2, false);
      o.first = foundEgg(); o.again = foundEgg(); o.inRun = SAVE.data.runEggs.join(); o.saved = JSON.parse(localStorage.getItem('itscoming.v2')).runEggs.join();
      G.run = null; G.lastRun = { t: 1, nights: [], best: false }; startLevel(12, false); G.lastRun = { t: 1, nights: [], best: false }; foundEgg(); o.ending = SAVE.data.runEggs.join();
      G.lastRun = null; startLevel(4, false); foundEgg(); o.outside = SAVE.data.runEggs.join();
      const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.runEggs = ['graveyard', 'graveyard', 'nosuch', 7, 'quarry', 'void']; localStorage.setItem('itscoming.v2', JSON.stringify(d)); SAVE.load(); o.loaded = SAVE.data.runEggs.join();
      delete d.runEggs; localStorage.setItem('itscoming.v2', JSON.stringify(d)); SAVE.load(); o.none = JSON.stringify(SAVE.data.runEggs);
      SAVE.data.runEggs = ['void']; beginRun(); o.rebegun = SAVE.data.runEggs.length + '/' + JSON.parse(localStorage.getItem('itscoming.v2')).runEggs.length;
      showTitle(); return o;
    });
    check(r.begun === 0 && r.first === true && r.again === false && r.inRun === 'graveyard' && r.saved === 'graveyard' && r.ending === 'graveyard,void' && r.outside === 'graveyard,void' && r.loaded === 'graveyard,void' && r.none === '[]' && r.rebegun === '0/0',
      'the run\'s own secret scenes: those first found in it (and in its last night\'s ending), once each, kept in the save; not one found outside a run; a save\'s list tidied as it loads; a new run begins with none (' + JSON.stringify(r) + ')');
    // things named without a count: the graveyard's bags of salt and sugar (two uses each, and no ×2); the arrows keep theirs
    const lab = await page.evaluate(() => {
      const names = () => { G.invSig = ''; G.step(0.016, 1); return [...document.querySelectorAll('#inventory .slot .label')].map(e => e.textContent).join('|'); };
      const tip = id => { const it = G.L.items.find(i => i.id === id); G.hover = null; return it.name + usesMark(it); };
      startLevel(2, false); const L = G.L; for (const id of ['salt', 'sugar']) { const it = L.items.find(i => i.id === id); it.taken = true; G.inv.push(it); }
      const o = { uses: G.inv.map(i => i.uses).join(), yard: names(), tips: tip('salt') + '|' + tip('sugar') };
      startLevel(4, false); const ar = G.L.items[0]; ar.uses = 3; ar.taken = true; G.inv.push(ar); o.other = names(); o.otherUses = ar.uses;
      showTitle(); return o;
    });
    check(lab.uses === '2,2' && lab.yard === 'Salt|Sugar' && lab.tips === 'Salt|Sugar' && lab.otherUses > 1 && lab.other.endsWith(' ×' + lab.otherUses),
      'the graveyard\'s salt and sugar, two uses each, are named with no count, held and under the pointer; a thing counted out elsewhere keeps its count (' + JSON.stringify(lab) + ')');
    // a night's card: its prompt, short
    const card = await page.evaluate(() => { startLevel(0, true); const p = document.querySelector('#overlay .prompt').textContent; showTitle(); return p; });
    check(card === 'Click or enter when ready', 'a night\'s card says: ' + card);
    await ctx.close();
  }

  // The words that are not in a menu follow the text size too: the warning before a new game, the prologue's two lines,
  // the turn-it-sideways screen. Each is bigger at Bigger than at Normal than at Smaller, and the warning still fits
  console.log('== the warning, the prologue and the turn-it-sideways screen follow the text size ==');
  for (const view of ['desktop', 'phone']) {
    const rows = [];
    for (const [name, ts] of SIZES) {
      const { ctx, page } = await open(view, '', saved({}, ts) + '; window.DISCLAIMER_TEST = "force"; window.PROLOGUE_TEST = true;');
      await page.evaluate(() => newGame()); await page.waitForTimeout(800);
      const w = await page.evaluate(() => { const d = document.getElementById('disclaimer'), p = d.querySelector('p'), c = d.querySelector('.dcard').getBoundingClientRect(), b = d.querySelector('.daccept').getBoundingClientRect(); return { fs: parseFloat(getComputedStyle(p).fontSize), scroll: d.scrollHeight - d.clientHeight, fits: c.top >= 0 && c.bottom <= innerHeight && c.left >= 0 && c.right <= innerWidth && b.bottom <= c.bottom, rot: [...document.querySelectorAll('#rotate h2, #rotate p')].map(e => parseFloat(getComputedStyle(e).fontSize)) }; });
      if (ts !== 1.4) await shot(page, 'warning-' + name.toLowerCase() + '-' + view);
      await page.waitForTimeout(450); await page.click('#disclaimer .daccept'); await page.waitForTimeout(1300);
      w.pro = await page.evaluate(() => { const p = document.querySelector('#prologue p'); return p ? parseFloat(getComputedStyle(p).fontSize) : 0; });
      rows.push(Object.assign({ name }, w));
      await ctx.close();
    }
    const up = k => rows[0][k] < rows[1][k] && rows[1][k] < rows[2][k];
    check(up('fs') && up('pro') && rows[0].rot[0] < rows[1].rot[0] && rows[1].rot[1] < rows[2].rot[1] && rows.every(r => r.scroll <= 0 && r.fits) && (view !== 'desktop' || Math.abs(rows[1].fs - 21) < 0.6),
      view + ': the warning\'s words, the prologue\'s and the turn-it-sideways screen\'s are each bigger with the text size (the warning 21px at Normal on a desktop, as it was), and the warning fits the page at all three (' + JSON.stringify(rows) + ')');
  }
  check(!errors.length, 'no page errors in any of it (' + errors.join('; ') + ')');
}
const innerHeightOf = view => VIEWS[view].viewport.height;

module.exports = { run };
if (require.main === module) {
  (async () => {
    const { browser, errors } = await T.launch();
    await run(browser, T.check);
    await T.finish(browser, errors, 'shell');
  })();
}
