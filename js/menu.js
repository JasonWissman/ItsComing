'use strict';
// ---------- menus: title, pause, death, survived, nights, settings. Real buttons, keyboard navigable ----------
const MENU = (() => {
  let current = null;
  const fmtTime = t => t === null || t === undefined ? '—' : (Math.round(t) + ' s');
  // a whole run is long: minutes and seconds
  // the Nights cards (and the results' after the ending) in two columns: the first half (1 to 6) down the left, the rest
  // (7 to 13) down the right; one column on a phone
  const col = i => (i < Math.floor(LEVELS.length / 2) ? ' c1' : ' c2');
  const fmtRun = t => { const s = Math.round(t); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function btn(act, label, arg, cls) { return '<button type="button" class="mbtn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (arg !== undefined ? ' data-arg="' + arg + '"' : '') + '>' + label + '</button>'; }
  function html(kind, d) {
    d = d || {};
    const S = SAVE.data.settings;
    switch (kind) {
      case 'title': {
        // the title itself: the name and the way in, and nothing else over what is out there (how to play is a dialog).
        // There is one way in, Begin: every game is all the nights in a row from the first. Nights (how they have gone,
        // to look at, not to pick from) only once one has been survived
        return '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
          '<div class="mrow">' + btn('begin', 'Begin', undefined, 'primary') + (G.unlocked > 0 ? btn('nights', 'Nights') : '') + btn('howto', 'How to play') + btn('settings', 'Settings', 'title') + '</div>' +
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
            card(zoomG + say('hold'), 'Zoom in') +
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
        // one narrow column of buttons all of a width; R, M and Esc do the same from the keyboard
        return '<h1>Paused</h1><div class="mcol even">' + btn('resume', 'Resume') + btn('restart', 'Restart') + btn('settings', 'Settings', 'pause') + btn('mute', G.muted ? 'Unmute' : 'Mute') + btn('title', 'Quit') + '</div>' + (touchUI() ? '' : '<p class="fine">Esc resumes</p>');
      case 'dead':
        return '<h1 class="red">It got you</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try again') + btn('title', 'Quit') + '</div>';
      case 'ending':   // the last screen of the last night, over the morning room
        return '<h1 class="big">You have faced your demons.</h1><div class="mrow">' + btn('done', 'The End', undefined, 'primary') + '</div>';
      case 'results': {
        // after the ending: the nights as on the Nights screen, each card's time coming in one after another (reveal), then
        // the full run, then the way out. Only this run's own times (game.js: G.lastRun), no bests: how it went this time.
        // (No run, only when the last night was reached by ?level=: then dashes)
        const R0 = G.lastRun;
        let cards = '';
        for (let i = 0; i < LEVELS.length; i++) {
          const mine = R0 && R0.nights[i];
          cards += '<div class="ncard rcard' + col(i) + '"><span class="nname">' + (i + 1) + '. ' + LEVELS[i].title + '</span><span class="nbest">' + (mine ? fmtTime(mine.t) : '&mdash;') + '</span></div>';
        }
        const run = '<div class="rlabel">This run</div><div class="rtime' + (R0 ? '' : ' none') + '">' + (R0 ? fmtRun(R0.t) : '&mdash;') + '</div>';
        return '<div class="results"><div class="kicker">Morning</div><h1>Every night survived</h1><div class="nights" style="--rows: ' + Math.ceil(LEVELS.length / 2) + '">' + cards + '</div>' +
          '<div class="runcard rrun">' + run + '</div><div class="mrow rlast">' + btn('finish', 'Finish game', undefined, 'primary') + '</div></div>';
      }
      case 'survived':
        // on to the next night, or, quietly and further down, out to the title
        return '<div class="kicker">' + d.title + '</div><h1>You survived</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('next', 'Next night') + '</div>' +
          '<button type="button" class="tbtn" data-act="title">Quit</button>';
      case 'nights': {
        // how the nights have gone, to look at: a card for each night with its best time inside it, in two columns (one
        // on a phone); a night not reached yet is a blank card. Not buttons: no night is picked from here (every game is
        // all of them from the first). Under them, the best full run: night 1 to the end of the last night (game.js: the run)
        const diff = G.diff(), unlocked = G.unlocked, b0 = id => ((SAVE.data.best[id] || {})[diff.id]) || null;
        let cards = '';
        for (let i = 0; i < LEVELS.length; i++) {
          const def = LEVELS[i];
          if (i <= unlocked) {
            const e = b0(def.id), best = e && e.wins ? '<span class="nbest"><small>best</small>' + fmtTime(e.time) + '</span>' : '';
            cards += '<div class="ncard shown' + col(i) + '"><span class="nname">' + (i + 1) + '. ' + def.title + '</span>' + best + '</div>';
          } else cards += '<div class="ncard locked' + col(i) + '">' + (i + 1) + '. &hellip;</div>';
        }
        const run = SAVE.data.bestRun[diff.id];
        const runCard = '<div class="runcard"><div class="rlabel">Best full run</div>' + (run !== undefined && run !== null
          ? '<div class="rtime">' + fmtRun(run) + '</div>'
          : '<div class="rtime none">&mdash;</div><div class="rhint">Survive all ' + LEVELS.length + ' nights in one go. Retries are allowed; the clock keeps running.</div>') + '</div>';
        const complete = SAVE.data.complete && SAVE.data.complete[diff.id] ? '<p class="fine">Every night survived.</p>' : '';
        return '<h1>Nights</h1><div class="nights" style="--rows: ' + Math.ceil(LEVELS.length / 2) + '">' + cards + '</div>' + runCard + complete + '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + '</div>';
      }
      case 'settings': {
        const chk = (k, label) => '<label class="opt"><input type="checkbox" data-set="' + k + '"' + (S[k] ? ' checked' : '') + '> ' + label + '</label>';
        const rng = (k, label) => '<label class="opt"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" data-set="' + k + '" value="' + S[k] + '"></label>';
        return '<h1>Settings</h1><div class="settings">' +
          rng('master', 'Volume') + rng('effects', 'Effects') + rng('ambient', 'Ambience') + chk('muted', 'Mute') +
          chk('reducedFlash', 'Reduce flashing (softer red pulse, dimmer flashes)') + chk('reducedMotion', 'Reduce motion (no jitter or sway)') + chk('captions', 'Captions for sounds') + (touchUI() ? chk('swipeReverse', 'Reverse swipes (swipe left to turn left)') : '') + chk('textures', 'Surface detail: boards and stone (off is faster)') +
          '<label class="opt"><span>Text size</span><input type="range" min="0.85" max="1.4" step="0.05" data-set="textSize" value="' + S.textSize + '"></label>' +
          '</div><div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('reset', 'Erase progress', undefined, 'danger') + '</div>';
      }
      default: return '';
    }
  }
  // over the title, its sub-screens open as dialogs: a panel over the middle of the view, over what is coming (TITLE),
  // which comes on behind it while it is open
  const DIALOGS = ['nights', 'settings', 'howto'];
  // every button and control in the menus answers with a soft tap (AUDIO 'tap': quiet, and no caption: it is the
  // click of the thing you pressed, nothing to be told about)
  const tap = () => { ensureAudio(); AUDIO.sfx('tap'); };
  function show(kind, data) {
    stopReveal();
    current = { kind, data: data || {} };
    const ov = UI.overlay;
    const dlg = DIALOGS.includes(kind) && (current.data.from || 'title') === 'title' && G.state === 'title';
    // erasing progress asks first, in a small dialog of its own over Settings
    const confirm = kind === 'settings' && current.data.confirmReset ? '<div class="confirm"><div class="cpanel" role="alertdialog" aria-modal="true" aria-label="Erase all progress?"><h2>Erase all progress?</h2><p>Every night reached and every best time will be gone.</p><div class="mrow">' + btn('keep', 'Cancel') + btn('erase', 'Erase', undefined, 'danger') + '</div></div></div>' : '';
    showOverlay((dlg ? '<div class="panel ' + kind + 'p" role="dialog" aria-modal="true">' + html(kind, current.data) + '</div>' : html(kind, current.data)) + confirm);
    ov.classList.toggle('dlg', dlg);
    ov.classList.toggle('titlelow', kind === 'title' && TITLE.on);
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tap(); act(b.dataset.act, b.dataset.arg); }));
    ov.querySelectorAll('[data-set]').forEach(inp => {
      const stop = e => e.stopPropagation();
      inp.addEventListener('click', stop); inp.parentElement.addEventListener('click', stop);
      inp.addEventListener('input', () => { const v = inp.type === 'checkbox' ? inp.checked : parseFloat(inp.value); applySetting(inp.dataset.set, v); });
      inp.addEventListener('change', tap);   // (a slider once it is let go, at the volume it now has)
    });
    const box = ov.querySelector('.confirm');
    if (box) box.addEventListener('click', e => { e.stopPropagation(); if (e.target === box) act('keep'); });   // a click off the little dialog backs out of it
    const first = (box || ov).querySelector('button[data-act]');
    if (first && kind !== 'title' && kind !== 'results') first.focus();
    if (kind === 'results') reveal(false);
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
    SAVE.setSetting(k, v);
    if (k === 'muted') setMuted(v);
    else if (k === 'master' || k === 'effects' || k === 'ambient') AUDIO.setVolume(k, v);
    else if (k === 'textSize') document.documentElement.style.setProperty('--text-scale', v);
    else if (k === 'textures') R.detail = !!v;
  }
  function applyAll() {
    const S = SAVE.data.settings;
    AUDIO.setVolume('master', S.master); AUDIO.setVolume('effects', S.effects); AUDIO.setVolume('ambient', S.ambient);
    document.documentElement.style.setProperty('--text-scale', S.textSize);
    R.detail = S.textures !== false;
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
      case 'restart': restartLevel(); break;
      case 'retry': startLevel(G.levelIndex, false); break;
      case 'next': proceedFromSurvived(); break;
      case 'title': showTitle(); break;
      case 'reset': show('settings', Object.assign({}, current.data, { confirmReset: true })); break;
      case 'keep': show('settings', Object.assign({}, current.data, { confirmReset: false })); break;
      case 'erase': SAVE.reset(); G.run = null; setMuted(false); applyAll(); showTitle(); break;
      case 'mute': toggleMute(); break;   // the button's own label follows (setMuted)
      case 'back': {
        const from = arg || 'title';
        if (from === 'title' && G.state === 'title') { show('title'); TITLE.advance(); }   // closing a dialog over the title: it came on while it was open
        else if (from === 'title') showTitle();
        else if (from === 'pause') show('pause');
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
    const btns = [...(UI.overlay.querySelector('.confirm') || UI.overlay).querySelectorAll('button[data-act], input[data-set]')]; // sliders and checkboxes are in the ring too; a dialog over them keeps it to its own
    if (!btns.length) return false;
    const idx = btns.indexOf(document.activeElement);
    const f = document.activeElement; // the control keeps the keys it uses: Space ticks a box, left and right move a slider
    if (f && f.tagName === 'INPUT' && (k === ' ' || (f.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight')))) return false;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd' || k === 'Tab' && !e.shiftKey) { e.preventDefault(); btns[(idx + 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a' || k === 'Tab' && e.shiftKey) { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'Escape' && current.kind === 'settings' && current.data.confirmReset) { act('keep'); return true; }
    if (k === 'Escape' && (current.kind === 'nights' || current.kind === 'settings' || current.kind === 'howto')) { act('back', current.data.from); return true; }
    if (k === 'Enter' && idx >= 0) return true;   // the focused button handles it
    return false;
  }
  return { show, act, onKey, hurry, applySetting, applyAll, get kind() { return current ? current.kind : null; }, clear() { stopReveal(); current = null; } };
})();
