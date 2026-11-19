'use strict';
// ---------- menus: title, pause, death, survived, nights, settings. Real buttons, keyboard navigable ----------
const MENU = (() => {
  let current = null;
  const fmtTime = t => t === null || t === undefined ? '—' : (Math.round(t) + ' s');
  // a whole run is long: minutes and seconds
  // the Scores cards (and the results' after the ending) in two columns: the first half (1 to 6) down the left, the rest
  // (7 to 13) down the right; one column on a phone
  const col = i => (i < Math.floor(LEVELS.length / 2) ? ' c1' : ' c2');
  const fmtRun = t => { const s = Math.round(t); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  // a run's times as shown, in whole seconds: the whole run rounded, each night rounded but the last (The Void), which is
  // whatever makes the nights add up to the whole run exactly as shown (rounding each on its own would drift a second or
  // a few). The whole run is the run's own clock, which is the nights' times added up (game.js: the run).
  function shown(run) {
    const n = LEVELS.length, total = Math.round(run.t), nights = new Array(n).fill(null);
    if (!run.nights) return { total, nights };
    let rest = total;
    for (let i = 0; i < n - 1; i++) { const t = run.nights[i]; if (t !== null && t !== undefined) { nights[i] = Math.round(t); rest -= nights[i]; } }
    if (run.nights[n - 1] !== null && run.nights[n - 1] !== undefined) nights[n - 1] = rest;
    return { total, nights };
  }
  // the stars for a whole run, by its time as shown: under 3 minutes three, under 6 two, else one
  const starCount = total => (total < 180 ? 3 : total < 360 ? 2 : 1);
  // drawn: three five-pointed stars, those earned filled, the rest only outlined; read out as one ("2 of 3 stars")
  const STAR = 'M12 2.6l2.75 6.05 6.6.72-4.93 4.45 1.38 6.5L12 17.02 6.2 20.32l1.38-6.5L2.65 9.37l6.6-.72z';
  function starsHtml(n) {
    let o = '';
    for (let i = 0; i < 3; i++) o += '<svg class="star' + (i < n ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + STAR + '"/></svg>';
    return '<span class="stars" role="img" aria-label="' + n + ' of 3 stars">' + o + '</span>';
  }
  // a whole run's card: its label, the time (with the Best run stamp beside it, when it is one), its stars under it
  const runTime = (run, label, stamp) => {
    const v = shown(run);
    return '<div class="rlabel">' + label + '</div><div class="rline"><div class="rtime">' + fmtRun(v.total) + '</div>' + (stamp ? '<span class="stamp">Best run</span>' : '') + '</div>' + starsHtml(starCount(v.total));
  };
  // the thirteen cards of a run's breakdown, each night's time as shown (a dash for one it has none for)
  function runCards(run, cls) {
    const v = run ? shown(run) : null;
    let cards = '';
    for (let i = 0; i < LEVELS.length; i++) {
      const t = v ? v.nights[i] : null;
      cards += '<div class="ncard ' + cls + col(i) + '"><span class="nname">' + (i + 1) + '. ' + LEVELS[i].title + '</span><span class="nbest">' + (t === null ? '&mdash;' : fmtTime(t)) + '</span></div>';
    }
    return '<div class="nights" style="--rows: ' + Math.ceil(LEVELS.length / 2) + '">' + cards + '</div>';
  }
  function btn(act, label, arg, cls) { return '<button type="button" class="mbtn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (arg !== undefined ? ' data-arg="' + arg + '"' : '') + '>' + label + '</button>'; }
  function html(kind, d) {
    d = d || {};
    const S = SAVE.data.settings;
    switch (kind) {
      case 'title': {
        // the title itself: the name and the way in, and nothing else over what is out there (how to play is a dialog).
        // There is one way in, Begin: every game is all the nights in a row from the first. Scores (how the nights have gone,
        // to look at, not to pick from) only once one has been survived
        return '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
          '<div class="mrow">' + btn('begin', 'Begin', undefined, 'primary') + (G.unlocked > 0 ? btn('nights', 'Scores') : '') + btn('howto', 'How to play') + btn('settings', 'Settings', 'title') + '</div>' +
          '<p class="fine credit">created by <a href="https://jasonwissman.com" target="_blank" rel="noopener">jason wissman</a></p>';
      }
      case 'howto': {
        // the controls as four cards, each the keys you press drawn large over what they do: a keycap for each key, the
        // arrows and WASD as they sit on a keyboard, a mouse with its left button lit for a click
        const k = (t, cls) => '<kbd class="key' + (t.length > 2 ? ' wide' : '') + (cls ? ' ' + cls : '') + '">' + t + '</kbd>';
        const cluster = (u, l, d, r) => '<span class="kcluster">' + k(u, 'ku') + k(l, 'kl') + k(d, 'kd') + k(r, 'kr') + '</span>';
        const click = '<kbd class="key mouse" aria-label="click"><svg viewBox="0 0 24 34" aria-hidden="true"><rect x="2" y="2" width="20" height="30" rx="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v12M2.6 14h18.8" stroke="currentColor" stroke-width="2"/><path d="M12 3.2V13H3.4V12a8.6 8.6 0 0 1 8.6-8.8z" fill="#b3161e"/></svg></kbd>';
        const or = '<span class="kplus">or</span>';
        const card = (keys, what) => '<div class="hcard"><div class="hkeys">' + keys + '</div><div class="hwhat">' + what + '</div></div>';
        if (touchUI()) {
          // on a phone or a tablet: the same four, drawn as the gestures and the two buttons. A fingertip with the way it
          // goes (swipe: across to turn, up and down to look), the round zoom button as it is in the corner, a fingertip
          // with the ring of a tap, and the menu button
          const tip = '<circle cx="17" cy="17" r="5.5" fill="#b3161e"/>';
          const arr = d => '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>';
          const g = (svg, label) => '<kbd class="key gest" aria-label="' + label + '"><svg viewBox="0 0 34 34" aria-hidden="true">' + svg + '</svg></kbd>';
          const swipeX = g(tip + arr('M3 17h7M3 17l3.5-3.5M3 17l3.5 3.5M31 17h-7M31 17l-3.5-3.5M31 17l-3.5 3.5'), 'swipe left or right');
          const swipeY = g(tip + arr('M17 3v7M17 3l-3.5 3.5M17 3l3.5 3.5M17 31v-7M17 31l-3.5-3.5M17 31l3.5-3.5'), 'swipe up or down');
          const tapG = g(tip + '<circle cx="17" cy="17" r="10.5" fill="none" stroke="currentColor" stroke-width="1.6" opacity=".55"/><circle cx="17" cy="17" r="15" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".3"/>', 'tap');
          const zoomG = '<span class="kzoom" aria-label="the zoom button"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M14.6 14.6 20.5 20.5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M7 10h6M10 7v6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><span>zoom</span></span>';
          const menuG = '<span class="kmenu" aria-label="the menu button"><span></span></span>';
          const say = t => '<span class="kplus">' + t + '</span>';
          return '<h1>How to play</h1>' +
            '<div class="howcards">' +
            card(swipeX + swipeY + say('swipe'), 'Look around') +
            card(zoomG + say('tap'), 'Zoom in') +
            card(tapG + say('tap'), 'Interact') +
            card(menuG + say('top left'), 'Pause') +
            '</div>' +
            '<p class="fine">Hold where a thing must be held (pulling the covers up, drawing a bow): let go to loose.</p>' +
            '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + '</div>';
        }
        return '<h1>How to play</h1>' +
          '<div class="howcards">' +
          card(cluster('↑', '←', '↓', '→') + or + cluster('W', 'A', 'S', 'D'), 'Look around') +
          card(k('Shift') + or + k('Space'), 'Zoom in') +
          card(click, 'Interact') +
          card(k('Esc'), 'Pause') +
          '</div>' +
          '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + '</div>';
      }
      case 'pause':
        // one narrow column of buttons all of a width: Resume, Controls (How to play, as on the title), Settings, and a
        // quiet Quit. R (restart) and M (mute) still work from the keyboard; Esc resumes
        return '<h1>Paused</h1><div class="mcol even">' + btn('resume', 'Resume') + btn('controls', 'Controls') + btn('settings', 'Settings', 'pause') + btn('title', 'Quit', undefined, 'quiet') + '</div>' + (touchUI() ? '' : '<p class="fine">Esc resumes</p>');
      case 'dead':
        return '<h1 class="red">It got you</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try again') + btn('title', 'Quit', undefined, 'quiet') + '</div>';
      case 'ending':   // the last screen of the last night, over the morning room
        return '<h1 class="big">You have faced your demons.</h1><div class="mrow">' + btn('done', 'The End', undefined, 'primary') + '</div>';
      case 'results': {
        // after the ending: the nights as on the Scores screen, each card's time coming in one after another (reveal), then
        // the whole run with its stars, then the way out. This run's own times (game.js: G.lastRun), adding up to its
        // whole time; the Best run stamp beside that only when it is a new best (and so the one on the Scores screen now).
        // (No run, only when the last night was reached by ?level=: then dashes)
        const R0 = G.lastRun;
        const run = R0 ? runTime(R0, 'This run', R0.best) : '<div class="rlabel">This run</div><div class="rline"><div class="rtime none">&mdash;</div></div>';
        return '<div class="results"><div class="kicker">Morning</div><h1>Every night survived</h1>' + runCards(R0, 'rcard') +
          '<div class="runcard rrun">' + run + '</div><div class="mrow rlast">' + btn('finish', 'Finish game', undefined, 'primary') + '</div></div>';
      }
      case 'survived':
        // on to the next night, or, quietly and further down, out to the title
        return '<div class="kicker">' + d.title + '</div><h1>You survived</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('next', 'Next night') + '</div>' +
          '<button type="button" class="tbtn" data-act="title">Quit</button>';
      case 'nights': {   // (the Scores dialog)
        // the best full run, to look at: a card for each night with its share of that run's time, in two columns (one on
        // a phone; not buttons: no night is picked from here), and under them the run's whole time and stars. No run
        // yet: only a word on what one is. And at the bottom, by Back, Erase progress (it asks first: show)
        const best = SAVE.data.bestRun[G.diff().id];
        const body = best
          ? runCards(best, 'shown') + '<div class="runcard">' + runTime(best, 'Best run', false) + '</div>'
          : '<div class="runcard empty"><div class="rlabel">Best run</div><div class="rline"><div class="rtime none">&mdash;</div></div><div class="rhint">No full run yet. Survive all ' + LEVELS.length + ' nights in one go: retries are allowed, but the clock keeps running.</div></div>';
        return '<h1>Scores</h1>' + body + '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('reset', 'Erase progress', undefined, 'danger') + '</div>';
      }
      case 'settings': {
        // the sliders, each with its value as a percentage at its right (following it as it moves); then the on/off
        // settings, each a switch (a checkbox with the role of a switch, drawn as one: .sw). Beside Back, Set to default:
        // every setting back as it began (nothing else). From the warning before a new game (d.from 'warning': game.js) the same
        const sw = (k, label) => '<label class="opt"><span class="olabel">' + label + '</span><span class="swwrap"><input type="checkbox" role="switch" class="swi" data-set="' + k + '"' + (switchOn(k) ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span></span></label>';
        const rng = (k, label, min, max) => '<label class="opt"><span class="olabel">' + label + '</span><span class="rngwrap"><input type="range" min="' + min + '" max="' + max + '" step="0.05" data-set="' + k + '" value="' + S[k] + '" aria-valuetext="' + pct(S[k]) + '"><output class="pct" aria-hidden="true">' + pct(S[k]) + '</output></span></label>';
        return '<h1>Settings</h1><div class="settings"><div class="sgrp">' +
          rng('master', 'Volume', 0, 1) + rng('effects', 'Effects', 0, 1) + rng('ambient', 'Ambience', 0, 1) + rng('textSize', 'Text size', 0.85, 1.4) +
          '</div><div class="sgrp">' +
          sw('muted', 'Mute') + sw('reduceMotionFlash', 'Reduce motion and flashing effects') + sw('captions', 'Captions for sounds') + (touchUI() ? sw('swipeReverse', 'Reverse swipes') : '') + sw('reduceTextures', 'Reduce surface textures') +
          '</div></div><div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('defaults', 'Set to default') + '</div>';
      }
      default: return '';
    }
  }
  // over the title, its sub-screens open as dialogs: a panel over the middle of the view, over what is coming (TITLE),
  // which comes on behind it while it is open
  // (and from the pause menu, Controls and Settings open as the same dialogs, over the night paused behind them)
  const DIALOGS = ['nights', 'settings', 'howto'];
  const pct = v => Math.round(v * 100) + '%';
  // the one switch for reduced motion and reduced flashing: both flags the game reads go with it (save.js keeps them alike)
  const switchOn = k => { const S = SAVE.data.settings; return k === 'reduceMotionFlash' ? !!(S.reducedMotion || S.reducedFlash) : !!S[k]; };
  // every button and control in the menus answers with a soft tap (AUDIO 'tap': quiet, and no caption: it is the
  // click of the thing you pressed, nothing to be told about)
  const tap = () => { ensureAudio(); AUDIO.sfx('tap'); };
  function show(kind, data) {
    stopReveal();
    current = { kind, data: data || {} };
    const ov = UI.overlay;
    const from = current.data.from || 'title';
    const dlg = DIALOGS.includes(kind) && ((from === 'title' && G.state === 'title') || from === 'pause');
    // erasing progress asks first, in a small dialog of its own over Scores
    const confirm = kind === 'nights' && current.data.confirmReset ? '<div class="confirm"><div class="cpanel" role="alertdialog" aria-modal="true" aria-label="Erase all progress?"><h2>Erase all progress?</h2><p>Every night reached and your best run will be gone.</p><div class="mrow">' + btn('keep', 'Cancel') + btn('erase', 'Erase', undefined, 'danger') + '</div></div></div>' : '';
    showOverlay((dlg ? '<div class="panel ' + kind + 'p" role="dialog" aria-modal="true">' + html(kind, current.data) + '</div>' : html(kind, current.data)) + confirm);
    ov.classList.toggle('dlg', dlg);
    ov.classList.toggle('titlelow', kind === 'title' && TITLE.on);
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tap(); act(b.dataset.act, b.dataset.arg); }));
    wire(ov);
    const box = ov.querySelector('.confirm');
    if (box) box.addEventListener('click', e => { e.stopPropagation(); if (e.target === box) act('keep'); });   // a click off the little dialog backs out of it
    // focus: the first button, or (back from a sub-screen) the button that opened it
    const first = (!box && current.data.focus && ov.querySelector('button[data-act="' + current.data.focus + '"]')) || (box || ov).querySelector('button[data-act]');
    if (first && kind !== 'title' && kind !== 'results') first.focus();
    if (kind === 'results') reveal(false);
  }
  // the settings' controls in a screen (the menus' overlay, or the warning's card): each applied and saved as it changes,
  // a slider's percentage following it
  function wire(root) {
    root.querySelectorAll('[data-set]').forEach(inp => {
      const stop = e => e.stopPropagation();
      inp.addEventListener('click', stop); inp.closest('label').addEventListener('click', stop);
      const out = inp.type === 'range' && inp.parentElement.querySelector('.pct');
      inp.addEventListener('input', () => {
        const v = inp.type === 'checkbox' ? inp.checked : parseFloat(inp.value);
        if (out) { out.textContent = pct(v); inp.setAttribute('aria-valuetext', pct(v)); }
        applySetting(inp.dataset.set, v);
      });
      inp.addEventListener('change', tap);   // (a slider once it is let go, at the volume it now has)
    });
  }
  // Settings in a box of the caller's own, over everything (the warning before a new game: game.js). Its Back calls back();
  // the keys and a pad go through navKey and the caller
  function settingsInto(root, back) {
    root.innerHTML = html('settings', { from: 'warning' });
    root.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tap(); if (b.dataset.act === 'back') back(); else if (b.dataset.act === 'defaults') toDefaults(root); }));
    wire(root);
    const first = root.querySelector('button[data-act]'); if (first) first.focus();
  }
  // the keys in a screen of buttons and settings: arrows (and WASD, Tab) move round them; Space and Enter flip a focused
  // switch, left and right move a focused slider. True if the key was taken
  function ring(root) { return [...root.querySelectorAll('button[data-act], input[data-set]')]; }
  function navKey(e, root) {
    const k = e.key, btns = ring(root);
    if (!btns.length) return false;
    const idx = btns.indexOf(document.activeElement);
    const f = document.activeElement; // the control keeps the keys it uses: Space flips a switch, left and right move a slider
    if (f && f.tagName === 'INPUT' && (k === ' ' || (f.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End')))) return false;
    if (k === 'Enter' && f && f.tagName === 'INPUT' && f.type === 'checkbox' && idx >= 0) { if (!e.repeat) f.click(); return true; }   // Enter flips a switch too
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd' || k === 'Tab' && !e.shiftKey) { e.preventDefault(); btns[(idx + 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a' || k === 'Tab' && e.shiftKey) { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus(); return true; }
    return false;
  }
  // a pad's d-pad on a focused slider: left and right move it, as the arrow keys do
  function padSlide(f, dir) {
    if (!(f && f.tagName === 'INPUT' && f.type === 'range')) return false;
    if (dir === 1) f.stepDown(); else f.stepUp();
    f.dispatchEvent(new Event('input'));
    return true;
  }
  // the results after the ending: each night's card takes its time one after another, then the full run, then the way
  // out. A click or a key hurries it to the end; with reduced motion it is all there at once
  let timers = [], revealing = false;
  function stopReveal() { timers.forEach(clearTimeout); timers = []; revealing = false; }
  function reveal(now) {
    stopReveal();
    const box = UI.overlay.querySelector('.results'); if (!box) return;
    const cards = [...box.querySelectorAll('.rcard')], run = box.querySelector('.rrun'), last = box.querySelector('.rlast');
    const done = () => { revealing = false; last.classList.add('in'); const b = last.querySelector('button'); if (b) b.focus({ preventScroll: true }); };
    if (now || SAVE.data.settings.reducedMotion) { box.classList.add('still'); cards.forEach(c => c.classList.add('in')); run.classList.add('in'); done(); return; }
    revealing = true;
    const at = (ms, fn) => timers.push(setTimeout(fn, ms)), GAP = 230, t0 = 700;
    cards.forEach((c, i) => at(t0 + i * GAP, () => { c.classList.add('in'); AUDIO.sfx('tap'); }));
    const t1 = t0 + cards.length * GAP + 450;
    at(t1, () => { run.classList.add('in'); AUDIO.sfx('win'); });
    at(t1 + 1400, done);
  }
  function hurry() { if (revealing) reveal(true); }
  function applySetting(k, v) {
    // reduced motion and reduced flashing are one switch: it sets both flags (each still read where it was)
    if (k === 'reduceMotionFlash') { SAVE.setSetting('reducedMotion', !!v); SAVE.setSetting('reducedFlash', !!v); return; }
    SAVE.setSetting(k, v);
    if (k === 'muted') setMuted(v);
    else if (k === 'master' || k === 'effects' || k === 'ambient') AUDIO.setVolume(k, v);
    else if (k === 'textSize') document.documentElement.style.setProperty('--text-scale', v);
    else if (k === 'reduceTextures') R.detail = !v;
  }
  // Set to default: every setting as it began, applied at once, and the controls on screen moved to match (the focus
  // stays on the button)
  function toDefaults(root) {
    const S = SAVE.defaults();
    setMuted(!!S.muted); applyAll();
    root.querySelectorAll('[data-set]').forEach(inp => {
      if (inp.type === 'checkbox') { inp.checked = switchOn(inp.dataset.set); return; }
      const v = S[inp.dataset.set]; inp.value = v; inp.setAttribute('aria-valuetext', pct(v));
      const out = inp.parentElement.querySelector('.pct'); if (out) out.textContent = pct(v);
    });
  }
  function applyAll() {
    const S = SAVE.data.settings;
    AUDIO.setVolume('master', S.master); AUDIO.setVolume('effects', S.effects); AUDIO.setVolume('ambient', S.ambient);
    document.documentElement.style.setProperty('--text-scale', S.textSize);
    R.detail = !S.reduceTextures;
  }
  function act(a, arg) {
    switch (a) {
      case 'begin': newGame(); break;
      case 'done': show('results'); break;   // the ending's "The End": how the nights went this time
      case 'finish': G.lastRun = null; if (G.seed === null) G.runSeed = Date.now() % 1000000; showTitle(); break;   // home; the next run new layouts, unless the seed is fixed
      case 'nights': show('nights', { from: 'title' }); break;   // only from the title (and its Back goes there)
      case 'settings': show('settings', { from: arg || 'title' }); break;
      case 'howto': show('howto', { from: 'title' }); break;
      case 'resume': resumeGame(); break;
      case 'controls': show('howto', { from: 'pause' }); break;   // the pause menu's Controls: How to play, as on the title
      case 'retry': startLevel(G.levelIndex, false); break;
      case 'next': proceedFromSurvived(); break;
      case 'title': showTitle(); break;
      case 'defaults': toDefaults(UI.overlay); break;
      case 'reset': show('nights', Object.assign({}, current.data, { confirmReset: true })); break;
      case 'keep': show('nights', Object.assign({}, current.data, { confirmReset: false, focus: 'reset' })); break;
      case 'erase': SAVE.reset(); G.run = null; setMuted(false); applyAll(); showTitle(); break;
      case 'back': {
        const from = arg || 'title', was = current && current.kind;
        if (from === 'title' && G.state === 'title') { show('title'); TITLE.advance(); }   // closing a dialog over the title: it came on while it was open
        else if (from === 'title') showTitle();
        else if (from === 'pause') show('pause', { focus: was === 'howto' ? 'controls' : 'settings' });   // focus back on what opened it
        else showTitle();
        break;
      }
      default: break;
    }
  }
  // arrow keys move between the buttons of the open menu; Esc backs out of a sub-screen
  function onKey(e) {
    if (!current) return false;
    if (revealing && current.kind === 'results') { hurry(); return true; }
    const k = e.key;
    const root = UI.overlay.querySelector('.confirm') || UI.overlay;   // sliders and switches are in the ring too; a dialog over them keeps it to its own
    if (!ring(root).length) return false;
    if (navKey(e, root)) return true;
    const idx = ring(root).indexOf(document.activeElement);
    if (k === 'Escape' && current.kind === 'nights' && current.data.confirmReset) { act('keep'); return true; }
    if (k === 'Escape' && (current.kind === 'nights' || current.kind === 'settings' || current.kind === 'howto')) { act('back', current.data.from); return true; }
    if (k === 'Enter' && idx >= 0) return true;   // the focused button handles it
    return false;
  }
  return { show, act, onKey, hurry, applySetting, applyAll, settingsInto, navKey, padSlide, get kind() { return current ? current.kind : null; }, clear() { stopReveal(); current = null; } };
})();
