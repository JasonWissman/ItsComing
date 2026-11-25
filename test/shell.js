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

  // The names under the things held: each whole, its descenders and all (the text's own box, not only its line's), and a
  // few pixels clear of the bottom edge, at every text size: three things held on a night, and the Void's many (smaller
  // slots, the held thing's name only), on a desktop at three sizes and on two phones held sideways (the lower left there)
  console.log('== the names under the things held: whole, clear of the bottom edge ==');
  for (const view of ['desktop', 'small desktop', 'phone', 'small phone']) {
    const rows = [];
    for (const lv of [3, 13]) {
      const { ctx, page } = await open(view === 'small desktop' ? 'desktop' : view, '?level=' + lv + '&go&seed=1');
      if (view === 'small desktop') { await page.setViewportSize({ width: 1024, height: 600 }); await page.waitForTimeout(150); }
      for (const [name, ts] of SIZES) {
        rows.push(Object.assign({ lv, name }, await page.evaluate(ts => {
          MENU.applySetting('textSize', ts); const L = G.L; L.creature.hold = L.creature.dist;
          const want = L.def.id === 'void' ? 9 : 3;
          for (const it of L.items) { if (G.inv.length >= want) break; if (!G.inv.includes(it)) { it.taken = true; G.inv.push(it); } }
          G.active = G.inv.length - 1; G.invSig = ''; G.step(0.016, 2);
          const labs = [...document.querySelectorAll('#inventory .slot .label')].filter(e => getComputedStyle(e).display !== 'none' && e.textContent);
          let gap = 99, left = 99;
          for (const e of labs) { const g = document.createRange(); g.selectNodeContents(e); const r = g.getBoundingClientRect(), b = e.getBoundingClientRect(); gap = Math.min(gap, innerHeight - Math.max(r.bottom, b.bottom)); left = Math.min(left, r.left); }
          return { n: labs.length, gap: +gap.toFixed(1), left: +left.toFixed(1), many: document.getElementById('inventory').classList.contains('many') };
        }, ts)));
      }
      if (lv === 3) await shot(page, 'inventory-' + view.replace(/ /g, '-'));
      await ctx.close();
    }
    check(rows.every(r => r.n >= 1 && r.gap >= 4 && r.gap <= 14 && r.left >= 0) && rows.some(r => r.many) && rows.some(r => r.n === 3),
      view + ': every name under a thing held is whole and 4 to 14 pixels above the bottom edge, at every text size, the Void\'s many too (' + JSON.stringify(rows.map(r => [r.lv, r.name, r.n, r.gap])) + ')');
  }

  // The results after the ending. They always open on This run, its times coming in one after another, then its stamp.
  // A run that found secret scenes it did not have also has two tabs, This run and Secret scenes: about 1.2 s after This
  // run is all in, the results slide over to Secret scenes by themselves, where those found before are checked from the
  // start and the run's own are checked off one after another (the count going up with them); all thirteen: a stamp, in
  // the middle under the count. A tab chosen meanwhile, and they stay where they are put. A run that found none: the
  // results as ever, no tabs. With reduced motion it is all there at once, and it goes over without the slide
  console.log('== the results: This run, then the secret scenes this run found ==');
  const results = async (page, eggs, fresh, motion) => page.evaluate(([eggs, fresh, motion]) => {
    SAVE.data.settings.reducedMotion = SAVE.data.settings.reducedFlash = !motion;
    SAVE.data.eggs = {}; for (const l of LEVELS) if (eggs === 'all' || eggs.includes(l.id)) SAVE.data.eggs[l.id] = true;
    SAVE.data.runEggs = fresh.slice(); SAVE.persist();
    G.lastRun = { t: 398.4, nights: [31, 28, 40, 22, 35, 30, 27, 33, 41, 29, 36, 25, 21.4], best: true };
    STORY.theme(true); setState('end'); MENU.show('ending'); MENU.act('done');
  }, [eggs, fresh, motion]);
  const rlook = page => page.evaluate(() => {
    const b = document.querySelector('#overlay .results'), tabs = [...b.querySelectorAll('[role=tab]')], e = [...b.querySelectorAll('.egg')], st = b.querySelector('.estamp'), last = b.querySelector('.rlast'), cs = st && getComputedStyle(st);
    const sr = st && st.getBoundingClientRect(), cr = b.querySelector('.ecnt') && b.querySelector('.ecnt').getBoundingClientRect(), br = b.getBoundingClientRect();
    return { tabs: tabs.map(t => t.textContent + (t.getAttribute('aria-selected') === 'true' ? '*' : '')).join('|'), found: e.filter(x => x.classList.contains('found')).map(x => x.querySelector('.ename').textContent).join('|'), fresh: e.filter(x => x.classList.contains('fresh')).length, ticked: e.filter(x => x.classList.contains('tick')).length,
      count: (b.querySelector('.ecnt') || {}).firstChild ? b.querySelector('.ecount').textContent : null, stamp: st ? st.textContent + ':' + (st.classList.contains('in') ? cs.opacity : 'out') : null, stampLook: st ? [cs.borderTopStyle, cs.borderTopColor, cs.textTransform, cs.transform !== 'none'].join() : null,
      // (the stamp under the count, in the middle of the dialog)
      under: st && st.classList.contains('in') ? Math.abs(sr.left + sr.width / 2 - (br.left + br.width / 2)) <= 2 && sr.top >= cr.bottom - 6 : null,
      way: last.classList.contains('in'), cards: b.querySelectorAll('.rcard.in').length, run: !!b.querySelector('.rrun.in'), scroll: b.scrollHeight - b.clientHeight, wide: b.scrollWidth - b.clientWidth, fits: b.getBoundingClientRect().bottom <= innerHeight && b.getBoundingClientRect().top >= 0, focus: document.activeElement && (document.activeElement.dataset.act || document.activeElement.id), kind: MENU.kind };
  });
  // as it goes: when This run is all in (its way out with it), when it goes over to Secret scenes (and whether This run
  // slid off and Secret scenes slid in), and then what is checked, the count, how many have been checked off as they
  // were watched, and the taps heard: each change, as it comes
  const watch = (page, ms) => page.evaluate(ms => new Promise(done => {
    const seq = [], t0 = performance.now(), o = { seq, slid: [], taps0: -1 };
    const iv = setInterval(() => {
      const b = document.querySelector('#overlay .results'), t = performance.now() - t0, eggsOn = b.querySelector('#tab-eggs').getAttribute('aria-selected') === 'true';
      if (!o.allIn && b.querySelector('.rrun.in') && b.querySelector('.rlast.in') && b.querySelectorAll('.rcard.in').length === 13) o.allIn = t;
      for (const c of ['slideout', 'slidein']) if (b.querySelector('.tabpanel.' + c) && !o.slid.includes(c)) o.slid.push(c);
      if (eggsOn && !o.over) { o.over = t; o.taps0 = window.__taps; }
      if (o.over) { const k = [...b.querySelectorAll('.egg.found .ename')].map(e => e.textContent).join('|') + ' ' + b.querySelector('.ecount').textContent + ' ' + b.querySelectorAll('.egg.tick').length; if (seq[seq.length - 1] !== k) seq.push(k); }
      if (t > ms) { clearInterval(iv); o.taps = window.__taps - o.taps0; done(o); }
    }, 20);
  }), ms);
  for (const view of ['desktop', 'phone']) {
    const tag = view.replace(/ /g, '-');
    const { ctx, page } = await open(view, '?level=13&go&seed=1');
    await page.evaluate(() => { window.__taps = 0; const f = AUDIO.sfx; AUDIO.sfx = (n, ...a) => { if (n === 'tap') window.__taps++; return f(n, ...a); }; });
    // two new ones of five found
    await results(page, ['road', 'graveyard', 'booth', 'quarry', 'barn'], ['graveyard', 'barn'], true);
    const r0 = await rlook(page);
    await page.waitForFunction(() => document.querySelectorAll('#overlay .rcard.in').length === 6, null, { timeout: 8000 }).catch(() => {});
    await shot(page, 'results-run-' + tag);
    const w = await watch(page, 10500), r2 = await rlook(page);
    await shot(page, 'results-secrets-' + tag);
    check(r0.kind === 'results' && r0.tabs === 'This run*|Secret scenes' && r0.cards === 0 && !r0.way && r0.found === 'Hit and run|Staring contest|Its an emergency' && r0.fresh === 2 && r0.count === '3' && r0.stamp === null,
      view + ': a run that found two secret scenes it did not have: two tabs, and the results open on This run, its times still to come in; on Secret scenes those found before are checked and the run\'s two not yet (' + JSON.stringify(r0) + ')');
    const gap = w.over - w.allIn;
    check(w.allIn > 3000 && gap > 1300 && gap < 1900 && w.slid.join() === 'slideout,slidein' && w.seq.join(' > ') === 'Hit and run|Staring contest|Its an emergency 3 0 > Hit and run|Sugar rush|Staring contest|Its an emergency 4 1 > Hit and run|Sugar rush|Staring contest|Its an emergency|Power overload 5 2' && w.taps === 2 && r2.tabs === 'This run|Secret scenes*' && r2.way && r2.focus === 'finish' && r2.scroll <= 0 && r2.wide <= 0 && r2.fits,
      view + ': This run comes all in first; about 1.2 s after (and the slide) it goes over to Secret scenes by itself, This run sliding off and Secret scenes in, where they are checked off one after the other, in the nights\' order, the count going up with them, a tap for each; Finish game focused; it all fits, no sideways scroll (' + JSON.stringify({ allIn: Math.round(w.allIn), gap: Math.round(gap), slid: w.slid, seq: w.seq, taps: w.taps, focus: r2.focus, scroll: r2.scroll, wide: r2.wide }) + ')');
    // a tab chosen while This run is still coming in: its times all in at once, the secret scenes checked off now, and
    // no going over by itself after (This run chosen again, it stays there)
    await results(page, ['road', 'graveyard', 'barn'], ['road', 'graveyard', 'barn'], true);
    await page.waitForTimeout(900); await page.click('#tab-eggs'); await page.waitForTimeout(120); const h0 = await rlook(page);
    await page.waitForFunction(() => document.querySelector('#overlay .ecount').textContent === '3', null, { timeout: 5000 }).catch(() => {});
    await page.click('#tab-run'); await page.waitForTimeout(3200); const h1 = await rlook(page);
    check(h0.tabs === 'This run|Secret scenes*' && h0.cards === 13 && h0.run && h0.count === '0' && h1.tabs === 'This run*|Secret scenes' && h1.count === '3' && h1.way,
      view + ': Secret scenes chosen while This run is still coming in: its times are all there at once and the secret scenes are checked off; This run chosen again, it stays there (' + JSON.stringify([h0.tabs, h0.cards, h0.count, h1.tabs, h1.count]) + ')');
    // This run chosen in the pause after it is all in (though it is on it): it stays on This run, the secret scenes not checked off
    await results(page, ['road', 'graveyard', 'barn'], ['graveyard', 'barn'], true);
    await page.evaluate(() => MENU.hurry()); await page.waitForTimeout(500);
    await page.click('#tab-run');
    const p0 = await rlook(page); await page.waitForTimeout(2600); const p1 = await rlook(page);
    check(p0.tabs === 'This run*|Secret scenes' && p1.tabs === 'This run*|Secret scenes' && p1.cards === 13 && p1.ticked === 0,
      view + ': This run chosen by the player in the pause after it is all in (the tab it is on): it stays there, no going over by itself (' + JSON.stringify([p0.tabs, p1.tabs, p1.ticked, p1.count]) + ')');
    // the last ones: all thirteen, and a stamp says so, as Best run is stamped, in the middle under the count
    await results(page, 'all', ['bedroom', 'void'], true);
    await page.evaluate(() => MENU.hurry());
    await page.waitForFunction(() => document.querySelector('#tab-eggs').getAttribute('aria-selected') === 'true', null, { timeout: 4000 }).catch(() => {});
    const a0 = await rlook(page); await page.waitForTimeout(450); await shot(page, 'results-switch-' + tag);
    await page.waitForFunction(() => document.querySelector('#overlay .estamp.in'), null, { timeout: 5000 }).catch(() => {}); await page.waitForTimeout(700); const a1 = await rlook(page);
    const best = await page.evaluate(() => { const s = document.querySelector('#overlay .rrun .stamp'), c = getComputedStyle(s); return s.textContent + '/' + [c.borderTopStyle, c.borderTopColor, c.textTransform, c.transform !== 'none'].join(); });
    await shot(page, 'results-secrets-all-' + tag);
    check(a0.count === '11' && a0.stamp === 'All secrets found:out' && a1.count === '13' && a1.stamp === 'All secrets found:1' && a1.under && best === 'Best run/' + a1.stampLook && a1.scroll <= 0 && a1.wide <= 0 && a1.fits && a1.way,
      view + ': the run\'s two make it all thirteen: when the last is checked off a stamp, All secrets found, in Best run\'s own style, in the middle under the count (' + JSON.stringify([a0.count, a0.stamp, a1.count, a1.stamp, a1.under, a1.stampLook, best, a1.scroll, a1.wide]) + ')');
    // reduced motion: all there at once, nothing animated, over without the slide; no new ones: no tabs at all
    await results(page, ['road', 'graveyard'], ['graveyard'], false);
    await page.waitForTimeout(150); const q0 = await rlook(page); const qw = await watch(page, 1700); const q1 = await rlook(page);
    await results(page, ['road', 'graveyard'], [], true);
    await page.waitForTimeout(150); const n0 = await page.evaluate(() => ({ tabs: document.querySelectorAll('#overlay [role=tab]').length, eggs: document.querySelectorAll('#overlay .egg').length, cards: document.querySelectorAll('#overlay .rcard').length, kicker: !!document.querySelector('#overlay .results .kicker') }));
    check(q0.tabs === 'This run*|Secret scenes' && q0.cards === 13 && q0.way && q1.tabs === 'This run|Secret scenes*' && qw.over > 700 && qw.over < 1400 && !qw.slid.length && q1.count === '2' && q1.ticked === 0 && q1.found === 'Hit and run|Sugar rush' && n0.tabs === 0 && n0.eggs === 0 && n0.cards === 13 && n0.kicker,
      view + ': with reduced motion This run is all there at once, then it goes over without a slide and the secret scenes are checked from the start; a run that found none has the results as ever, with no tabs (' + JSON.stringify([q0.tabs, Math.round(qw.over), qw.slid, q1.count, q1.ticked, n0]) + ')');
    await ctx.close();
  }
  // No sideways scroll in the results or in Scores, either tab, at any size of page or text, and nothing of them (a
  // stamp, tilted, or coming down from bigger) out past their card
  console.log('== the results and Scores: no sideways scroll ==');
  const PAGES = { 'desktop 1280': { viewport: { width: 1280, height: 720 } }, 'desktop 1024': { viewport: { width: 1024, height: 600 } }, phone: VIEWS.phone, 'small phone': VIEWS['small phone'], 'phone upright': { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } };
  for (const view of Object.keys(PAGES)) {
    const ctx = await browser.newContext(PAGES[view]), page = await ctx.newPage();
    page.on('pageerror', e => errors.push('PAGEERROR (' + view + ') ' + e.message));
    await page.goto(T.INDEX + '?level=13&go&seed=1'); await page.waitForTimeout(500);
    const rows = [];
    for (const [name, ts] of SIZES) {
      rows.push(Object.assign({ name }, await page.evaluate(ts => {
        MENU.applySetting('textSize', ts);
        const out = [], m = (where, box, scrollOnly) => {
          const r = box.getBoundingClientRect();
          const sticks = [...box.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 0 && getComputedStyle(e).display !== 'none' && (q.right > r.right + 0.5 || q.left < r.left - 0.5); }).map(e => e.className);
          for (const e of [box, UI.overlay, document.documentElement]) if (e.scrollWidth > e.clientWidth) out.push(where + ':' + (e.id || e.className || e.tagName) + ' ' + (e.scrollWidth - e.clientWidth));
          if (sticks.length && !scrollOnly) out.push(where + ' out: ' + sticks.slice(0, 3).join());
        };
        // the results with the Best run stamp, both tabs, and All secrets found stamped (and as it comes down from bigger)
        SAVE.data.settings.reducedMotion = false;
        SAVE.data.eggs = {}; for (const l of LEVELS) SAVE.data.eggs[l.id] = true; SAVE.data.runEggs = ['bedroom', 'void'];
        G.lastRun = { t: 398.4, nights: [31, 28, 40, 22, 35, 30, 27, 33, 41, 29, 36, 25, 21.4], best: true };
        STORY.theme(true); setState('end'); MENU.show('ending'); MENU.act('done'); MENU.hurry();
        const res = document.querySelector('#overlay > .results');
        m('results, This run', res);
        document.querySelector('#tab-eggs').click(); MENU.hurry();
        // (the two stamps at the start of their coming down, twice their size, tilted: clipped at the card's sides, no scroll)
        const sts = [[res.querySelector('.estamp'), -4], [res.querySelector('.rrun .stamp'), -9]]; for (const [st, a] of sts) { st.style.animation = 'none'; st.style.transform = 'rotate(' + a + 'deg) scale(1.9)'; }
        m('results, the stamps coming down', res, true); document.querySelector('#tab-run').click(); m('results, the stamps coming down on This run', res, true); document.querySelector('#tab-eggs').click();
        for (const [st] of sts) st.style.animation = st.style.transform = '';
        m('results, Secret scenes', res);
        SAVE.data.bestRun = { nightmare: { t: 398.4, nights: G.lastRun.nights } };
        setState('title'); MENU.show('nights', { from: 'title' }); const p = document.querySelector('#overlay > .panel');
        m('Scores, Best run', p); document.querySelector('#tab-eggs').click(); m('Scores, Secret scenes', p);
        showTitle(); return { out };
      }, ts)));
    }
    check(rows.every(r => !r.out.length), view + ': no sideways scroll in the results or Scores, on either tab, and nothing out past their card, at every text size (' + JSON.stringify(rows.filter(r => r.out.length)) + ')');
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
      G.run = null; SAVE.data.firstEnding = 'ending'; startLevel(12, false); G.lastRun = { t: 1, nights: [], best: false }; foundEgg(); finishEnding(); o.ending = SAVE.data.runEggs.join();
      G.lastRun = null; startLevel(4, false); foundEgg(); o.outside = SAVE.data.runEggs.join();
      const d = JSON.parse(localStorage.getItem('itscoming.v2')); d.runEggs = ['graveyard', 'graveyard', 'nosuch', 7, 'quarry', 'void']; localStorage.setItem('itscoming.v2', JSON.stringify(d)); SAVE.load(); o.loaded = SAVE.data.runEggs.join();
      delete d.runEggs; localStorage.setItem('itscoming.v2', JSON.stringify(d)); SAVE.load(); o.none = JSON.stringify(SAVE.data.runEggs);
      SAVE.data.runEggs = ['void']; beginRun(); o.rebegun = SAVE.data.runEggs.length + '/' + JSON.parse(localStorage.getItem('itscoming.v2')).runEggs.length;
      showTitle(); return o;
    });
    check(r.begun === 0 && r.first === true && r.again === false && r.inRun === 'graveyard' && r.saved === 'graveyard' && r.ending === 'graveyard,void' && r.outside === 'graveyard,void' && r.loaded === 'graveyard,void' && r.none === '[]' && r.rebegun === '0/0',
      'the run\'s own secret scenes: those first found in it (and in its last night\'s ending), once each, kept in the save; not one found outside a run; a save\'s list tidied as it loads; a new run begins with none (' + JSON.stringify(r) + ')');
    // the Void's two endings, its own and its easter egg's: the first come to is the player's own and finds nothing (the
    // game is finished all the same); the other, come to after it, finds the easter egg, its note said as it comes, in
    // either order; the same one again finds nothing. A save from before keeps the egg it found, and one that finished the
    // game without it came to the ending of its own first
    const two = await page.evaluate(() => {
      const end = egg => { startLevel(12, false); if (egg) foundEgg(); const f = G.L.eggEnding; finishEnding(); const el = document.getElementById('secret'), o = [!!f, SAVE.data.firstEnding, !!SAVE.data.eggs.void, MENU.kind, G.state, !!SAVE.data.complete.nightmare, el.classList.contains('show') ? el.querySelector('.st').textContent : ''].join(); secretHide(); showTitle(); return o; };
      const o = {};
      for (const [k, order] of [['realFirst', [false, false, true, true]], ['eggFirst', [true, true, false]]]) { SAVE.reset(); o[k] = order.map(end); o[k + 'Saved'] = JSON.parse(localStorage.getItem('itscoming.v2')).firstEnding + '/' + !!JSON.parse(localStorage.getItem('itscoming.v2')).eggs.void; }
      const old = x => { localStorage.setItem('itscoming.v2', JSON.stringify(Object.assign({ v: 4, unlocked: { nightmare: 13 }, settings: {}, warned: true }, x))); SAVE.load(); return SAVE.data.firstEnding + '/' + !!SAVE.data.eggs.void; };
      o.old = [old({ complete: { nightmare: true }, eggs: { void: true, road: true } }), old({ complete: { nightmare: true }, eggs: { road: true } }), old({ complete: {}, eggs: {} }), old({ complete: { nightmare: true }, eggs: {}, firstEnding: 'egg' }), old({ complete: {}, eggs: {}, firstEnding: 'nonsense' })];
      SAVE.reset(); return o;
    });
    // (each: the easter egg's ending or not, the first ending kept, the egg found, the screen, the game finished, the note)
    const T2 = ',ending,end,true,';
    check(two.realFirst.join(' | ') === ['false,ending,false' + T2, 'false,ending,false' + T2, 'true,ending,true' + T2 + 'Flip the script', 'true,ending,true' + T2].join(' | ') && two.realFirstSaved === 'ending/true' &&
      two.eggFirst.join(' | ') === ['true,egg,false' + T2, 'true,egg,false' + T2, 'false,egg,true' + T2 + 'Flip the script'].join(' | ') && two.eggFirstSaved === 'egg/true' &&
      two.old.join(' ') === 'ending/true ending/false /false egg/false /false',
      'the Void\'s two endings: the first come to finishes the game and finds nothing; the other after it finds Flip the script and says so, in either order; again, nothing; old saves keep what they found, a finished one its own ending first (' + JSON.stringify(two) + ')');

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
  // The credit under the title: the whole line one underlined control, which opens the developer's note (a dialog as the
  // others are: role dialog, modal, named by its heading), the author's words exactly as written, its two links and the
  // two buttons out to a new tab, Back under them. The note scrolls inside its panel, never past the page nor sideways,
  // its links and Back always in view, at the smallest and the largest text on a narrow window, a phone held sideways
  // and a desktop. Esc closes it with the focus back on the credit, and neither the click nor the closing brings the
  // thing a step nearer. By the keys (Enter, Space, the arrows to scroll it) and by a pad (A opens, up and down scroll,
  // left and right go round, B closes) the same
  console.log('== the credit: the developer\'s note ==');
  const NOTE_WANT = "Developer's note: If you can believe it, this game does have a purpose to it, inspired by real experiences in my life. I've had powerful experiences with scary dreams like these, in which I was being pursued by mysterious beings. After several nights of such dreams, in a final dream I will actually confront the creature head-on, only to find it transform into a direct representation of something that had been weighing on me in real life: a friend I hadn't texted back, a responsibility I was neglecting, a commitment I had made, etc. I could only run, hide, or avoid these things for so long before they caught up to me, and my dreams were literally manifesting those as creatures. Needless to say, they woke me up (literally) to the need to face those things head-on. Experiences like this have made me fascinated with the power of dreams, and the importance of listening when our own mind is trying to tell us something. If you'd like to support this project as well as other free games and apps I'm working on, please feel free to support me with a coffee! And if you'd like to see what else I have in the works, you can visit my main site at jasonwissman.com Cheers! -J";
  const NOTE_VIEWS = { 'narrow window': { viewport: { width: 390, height: 844 } }, phone: VIEWS.phone, desktop: { viewport: { width: 1280, height: 800 } } };
  for (const view of Object.keys(NOTE_VIEWS)) {
    const rows = [];
    for (const [name, ts] of [SIZES[0], SIZES[2]]) {
      const ctx = await browser.newContext(NOTE_VIEWS[view]);
      await ctx.addInitScript(saved({}, ts));
      const page = await ctx.newPage();
      page.on('pageerror', e => errors.push('PAGEERROR (' + view + ') ' + e.message));
      await page.goto(T.INDEX); await page.waitForTimeout(500);
      const credit = await page.evaluate(() => { const b = document.querySelector('#overlay .credit .creditbtn'), c = getComputedStyle(b); return { tag: b.tagName, text: b.textContent, under: c.textDecorationLine === 'underline', fs: parseFloat(c.fontSize), link: !!document.querySelector('#overlay .credit a') }; });
      const step0 = await page.evaluate(() => TITLE.step);
      await page.click('#overlay .credit .creditbtn'); await page.waitForTimeout(250);
      const r = await page.evaluate(() => {
        const p = document.querySelector('#overlay > .panel.notep'), b = p && p.querySelector('.notebody'), pr = p.getBoundingClientRect(), h = document.getElementById(p.getAttribute('aria-labelledby'));
        const foot = [...p.querySelectorAll('.notefoot .mbtn')], inP = e => { const x = e.getBoundingClientRect(); return x.top >= pr.top - 0.5 && x.bottom <= pr.bottom + 0.5 && x.left >= pr.left - 0.5 && x.right <= pr.right + 0.5; };
        return { kind: MENU.kind, step: TITLE.step, dialog: p.getAttribute('role') === 'dialog' && p.getAttribute('aria-modal') === 'true' && !!h && h.textContent === "Developer's note:" && b.contains(h),
          text: [...b.children].map(e => e.textContent).join(' ').replace(/\s+/g, ' ').trim(), kids: [...b.children].map(e => e.tagName).join(), pfs: parseFloat(getComputedStyle(b.querySelector('p')).fontSize),
          links: [...p.querySelectorAll('a')].map(a => [a.textContent, a.getAttribute('href'), a.target, a.rel].join(' ')), foot: foot.map(e => e.textContent).join('|'),
          sideways: document.documentElement.scrollWidth - innerWidth, bodyX: b.scrollWidth - b.clientWidth, inView: pr.top >= 0 && pr.bottom <= innerHeight + 0.5 && pr.left >= 0 && pr.right <= innerWidth + 0.5, footIn: foot.every(inP), more: b.scrollHeight - b.clientHeight, focus: document.activeElement.textContent };
      });
      if (r.more > 1) { await page.keyboard.press('ArrowDown'); await page.waitForTimeout(450); r.down = await page.evaluate(() => document.querySelector('.notebody').scrollTop > 0); } else r.down = true;
      await shot(page, 'note-' + name.toLowerCase() + '-' + view.replace(/ /g, '-'));
      await page.keyboard.press('Escape'); await page.waitForTimeout(250);
      r.back = await page.evaluate(() => MENU.kind === 'title' && document.activeElement.classList.contains('creditbtn') && G.state === 'title');
      r.step1 = await page.evaluate(() => TITLE.step);
      rows.push(Object.assign({ name, credit, step0 }, r));
      await ctx.close();
    }
    const want = ["support me with a coffee https://ko-fi.com/jasonwissman _blank noopener", "jasonwissman.com https://jasonwissman.com _blank noopener", "See my other projects https://jasonwissman.com _blank noopener", "Support me with a coffee https://ko-fi.com/jasonwissman _blank noopener"].join('|');
    check(rows.every(r => r.credit.tag === 'BUTTON' && r.credit.text === 'created by jason wissman' && r.credit.under && !r.credit.link && r.kind === 'note' && r.dialog && r.text === NOTE_WANT && r.links.join('|') === want && r.foot === 'See my other projects|Support me with a coffee|Back' && r.focus === 'Back'),
      view + ': the whole credit is one underlined button; it opens the developer\'s note, a dialog named by its heading, the author\'s words exactly, its links and the two buttons to a new tab, Back focused (' + JSON.stringify(rows.map(r => ({ name: r.name, credit: r.credit, kind: r.kind, dialog: r.dialog, textOK: r.text === NOTE_WANT, links: r.links, foot: r.foot, focus: r.focus }))) + ')');
    check(rows.every(r => r.sideways <= 0 && r.bodyX <= 0 && r.inView && r.footIn && r.down) && rows[0].pfs < rows[1].pfs && rows[0].credit.fs < rows[1].credit.fs,
      view + ': the note scrolls inside its panel (the arrows scroll it), the panel in the page and nothing sideways, its links and Back in view, its words and the credit bigger with the text size (' + JSON.stringify(rows.map(r => ({ name: r.name, sideways: r.sideways, bodyX: r.bodyX, inView: r.inView, footIn: r.footIn, more: r.more, down: r.down, pfs: r.pfs, cfs: r.credit.fs }))) + ')');
    check(rows.every(r => r.back && r.step === r.step0 && r.step1 === r.step0),
      view + ': Esc closes it, the focus back on the credit, and the thing out there no nearer for it (' + JSON.stringify(rows.map(r => ({ back: r.back, steps: [r.step0, r.step, r.step1] }))) + ')');
  }
  {
    const { ctx, page } = await open('desktop', '', saved({}, 1.4));
    await page.evaluate(() => { const s = TITLE.step; window._noteStep = s; });
    // the keys: Tab round to it from Begin (Begin, Scores, How to play, Settings, the credit), Enter opens it; Esc; Space opens it
    await page.evaluate(() => document.querySelector('#overlay button[data-act="begin"]').focus());
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    const k = { tab: await page.evaluate(() => document.activeElement.classList.contains('creditbtn')) };
    await page.keyboard.press('Enter'); await page.waitForTimeout(200);
    k.enter = await page.evaluate(() => MENU.kind === 'note');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    await page.keyboard.press(' '); await page.waitForTimeout(200);
    k.space = await page.evaluate(() => MENU.kind === 'note');
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    // a pad: A on the credit opens it; down scrolls the note (on a short page, where there is more of it); left and right
    // go round its links and Back; B closes it, the focus back on the credit
    await page.setViewportSize({ width: 1280, height: 560 }); await page.waitForTimeout(200);
    await page.evaluate(() => { window._pad = { connected: true, axes: [0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false })) }; navigator.getGamepads = () => [window._pad]; document.querySelector('#overlay .creditbtn').focus(); });
    const press = async (i, ms) => { await page.evaluate(i => { window._pad.buttons[i].pressed = true; }, i); await page.waitForTimeout(80); await page.evaluate(i => { window._pad.buttons[i].pressed = false; }, i); await page.waitForTimeout(ms || 120); };
    await press(0, 250);
    k.padA = await page.evaluate(() => MENU.kind === 'note' && document.activeElement.textContent === 'Back');
    await press(13, 450);
    k.padDown = await page.evaluate(() => document.querySelector('.notebody').scrollTop > 0);
    await press(14);
    k.padLeft = await page.evaluate(() => document.activeElement.textContent === 'Support me with a coffee');
    await press(15);
    k.padRight = await page.evaluate(() => document.activeElement.textContent === 'Back');
    await press(1, 250);
    k.padB = await page.evaluate(() => MENU.kind === 'title' && document.activeElement.classList.contains('creditbtn') && TITLE.step === window._noteStep);
    // a click on the credit, or on anything in the note, is not a click on the dark of the title (which brings it nearer)
    await page.evaluate(() => { navigator.getGamepads = () => []; });
    await page.click('#overlay .creditbtn'); await page.waitForTimeout(200);
    await page.click('#overlay .notebody p'); await page.waitForTimeout(150);
    await page.click('#overlay .notebody h1'); await page.waitForTimeout(150);
    k.clicks = await page.evaluate(() => MENU.kind === 'note' && TITLE.step === window._noteStep);
    await page.click('#overlay button[data-act="back"]'); await page.waitForTimeout(200);
    k.backBtn = await page.evaluate(() => MENU.kind === 'title' && document.activeElement.classList.contains('creditbtn') && TITLE.step === window._noteStep);
    await page.mouse.click(640, 120); await page.waitForTimeout(200);
    k.darkStill = await page.evaluate(() => TITLE.step === window._noteStep + 1);
    await shot(page, 'note-credit-focused');
    check(Object.values(k).every(Boolean), 'the credit by the keys (Tab to it, Enter or Space opens the note, Esc closes it) and by a pad (A opens, down scrolls, left and right go round, B closes, the focus back on the credit); clicks on the credit and in the note do not bring the thing nearer, Back neither, a click on the dark still does (' + JSON.stringify(k) + ')');
    await ctx.close();
  }

  check(!errors.length, 'no page errors in any of it (' + errors.join('; ') + ')');
}

module.exports = { run };
if (require.main === module) {
  (async () => {
    const { browser, errors } = await T.launch();
    await run(browser, T.check);
    await T.finish(browser, errors, 'shell');
  })();
}
