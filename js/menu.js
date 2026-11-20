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
  const STARS_AT = [180, 360];   // (seconds: under the first three stars, under the second two)
  const starCount = total => (total < STARS_AT[0] ? 3 : total < STARS_AT[1] ? 2 : 1);
  // what each takes, told on the stars: a tooltip (its title) on a hover, read out with them (aria-describedby), and on a
  // touch screen shown by a tap on them (starTip)
  const STARS_TIP = ['3 stars: under ' + STARS_AT[0] / 60 + ' minutes', '2 stars: under ' + STARS_AT[1] / 60 + ' minutes', '1 star: any finish'];
  let tipN = 0;
  // drawn: three five-pointed stars, those earned filled, the rest only outlined; read out as one ("2 of 3 stars")
  const STAR = 'M12 2.6l2.75 6.05 6.6.72-4.93 4.45 1.38 6.5L12 17.02 6.2 20.32l1.38-6.5L2.65 9.37l6.6-.72z';
  function starsHtml(n) {
    let o = '';
    for (let i = 0; i < 3; i++) o += '<svg class="star' + (i < n ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + STAR + '"/></svg>';
    const id = 'startip' + (++tipN);
    return '<span class="stars" role="img" aria-label="' + n + ' of 3 stars" title="' + STARS_TIP.join('&#10;') + '" aria-describedby="' + id + '">' + o + '<span class="startip" id="' + id + '">' + STARS_TIP.map(t => '<span>' + t + '</span>').join(' ') + '</span></span>';
  }
  // a tap (or a click) on the stars: what each takes, shown under them for a few seconds (again: hidden)
  function starTip(s) {
    clearTimeout(s._tip);
    const on = s.classList.toggle('tip');
    if (on) s._tip = setTimeout(() => s.classList.remove('tip'), 5000);
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
        return '<h1 class="red">' + (d.title || 'It got you') + '</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try again') + btn('title', 'Quit', undefined, 'quiet') + '</div>';
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
        if (d.sub === 'volume') return volumeHtml();
        if (d.sub === 'brightness') return brightnessHtml();
        // Volume and Brightness, each a Calibrate button (a dialog of its own: volumeHtml, brightnessHtml: the effects and
        // the ambience volumes are in Volume's); Display, windowed or full screen (displayRow); the text size, a row of
        // choices (seg); then the on/off settings, each a switch (a checkbox with the role of a switch, drawn as one: .sw).
        // Beside Back, Set to default: every setting back as it began (nothing else). From the warning before a new game
        // (d.from 'warning': game.js) the same
        const sw = (k, label) => '<label class="opt"><span class="olabel">' + label + '</span><span class="swwrap"><input type="checkbox" role="switch" class="swi" data-set="' + k + '"' + (switchOn(k) ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span></span></label>';
        const cal = (act, label) => '<div class="opt"><span class="olabel">' + label + '</span><button type="button" class="calbtn" data-act="' + act + '" aria-label="Calibrate ' + label.toLowerCase() + '">Calibrate</button></div>';
        return '<h1>Settings</h1><div class="settings"><div class="sgrp">' +
          cal('calvol', 'Volume') + cal('calbright', 'Brightness') + displayRow() + seg('textSize', 'Text size', SAVE.TEXT_SIZES) +
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
  // a slider, its value as a percentage at its right (following it as it moves); name: what it is read out as, when its
  // label alone does not say
  const rng = (k, label, min, max, name) => { const v = SAVE.data.settings[k]; return '<label class="opt"><span class="olabel">' + label + '</span><span class="rngwrap"><input type="range" min="' + min + '" max="' + max + '" step="0.05" data-set="' + k + '" value="' + v + '" aria-valuetext="' + pct(v) + '"' + (name ? ' aria-label="' + name + '"' : '') + '><output class="pct" aria-hidden="true">' + pct(v) + '</output></span></label>'; };
  // a row of choices, one of them chosen (choices: [[label, value], ...]; chosen: the value chosen, else the setting's):
  // a radio group, its buttons side by side. The arrows (left and right; a pad's d-pad too) go along it choosing as they
  // go, Enter, Space and A choose the one with the focus, a click or a tap chooses; only the chosen one is in the round
  // the other keys go (ring)
  function seg(k, label, choices, chosen) {
    const on = chosen !== undefined ? chosen : SAVE.nearest(choices, SAVE.data.settings[k]);
    return '<div class="opt optseg"><span class="olabel">' + label + '</span><span class="seg" role="radiogroup" aria-label="' + label + '" data-set="' + k + '">' +
      choices.map(([t, v]) => '<button type="button" role="radio" data-v="' + v + '" aria-checked="' + (v === on) + '" tabindex="' + (v === on ? 0 : -1) + '">' + t + '</button>').join('') + '</span></div>';
  }
  // the choice in a row made: the setting applied and saved, the buttons following
  function segPick(o) {
    const g = o.closest('.seg'); if (!g || o.getAttribute('aria-checked') === 'true') return false;
    segShow(g, parseFloat(o.dataset.v));
    applySetting(g.dataset.set, parseFloat(o.dataset.v));
    return true;
  }
  // a row of choices showing v chosen
  function segShow(g, v) { for (const b of g.querySelectorAll('[role="radio"]')) { const on = parseFloat(b.dataset.v) === v; b.setAttribute('aria-checked', on); b.tabIndex = on ? 0 : -1; } }
  // Display: Windowed or Fullscreen, as the full screen button in the corner (#fsBtn: game.js toggleFullscreen) has it.
  // Not a setting: it is what the page is now, and follows it however it changes (that button, F, Esc out of full
  // screen: fullscreenchange). Where the page cannot go full screen (Safari on an iPhone, the Fullscreen API not there for
  // a page) no choice, only how to: add it to the Home Screen (the manifest has it open full screen from there); nothing
  // elsewhere, or once it is open from the Home Screen already
  const DISPLAY = [['Windowed', 0], ['Fullscreen', 1]];
  const fsOn = () => (typeof fullscreenEl === 'function' && fullscreenEl() ? 1 : 0);
  const fsAble = () => typeof fullscreenAble === 'function' && fullscreenAble();
  const iOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const standalone = () => !!(navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone), (display-mode: fullscreen)').matches));
  function displayRow() {
    if (fsAble()) return seg('display', 'Display', DISPLAY, fsOn());
    if (iOS() && !standalone()) return '<div class="opt optnote"><span class="olabel">Display</span><span class="onote">On iPhone, add this page to your Home Screen to play full screen.</span></div>';
    return '';
  }
  function displaySync() { document.querySelectorAll('.seg[data-set="display"]').forEach(g => segShow(g, fsOn())); }
  for (const ev of ['fullscreenchange', 'webkitfullscreenchange']) document.addEventListener(ev, displaySync);
  // along a row by dir (-1, 1), choosing (it stops at either end)
  function segStep(o, dir) {
    const all = [...o.closest('.seg').querySelectorAll('[role="radio"]')], n = all[Math.max(0, Math.min(all.length - 1, all.indexOf(o) + dir))];
    if (n !== o) { segPick(n); tap(); }
    n.focus();
  }
  const isRadio = f => !!(f && f.getAttribute && f.getAttribute('role') === 'radio' && f.closest('.seg'));
  // Volume's Calibrate: the game's two volumes, each in a section of its own with its slider and the two ends of what it
  // plays. Sound effects: the quietest sound (the heartbeat's first beat, as faint as it first comes) and the loudest (the
  // sting's crash), each seven times from the left ear over to the right (AUDIO.calibrate), seven marks under each
  // lighting with them. Ambience: the quietest bed in the game and the loudest, a few seconds of each, a bar under it
  // filling as it plays. While it is open whatever ambience was playing is faded out (AUDIO.hush: settled), so these are
  // heard in clean space. Done (Esc, a pad's B) is Settings again
  const CALS = { calquiet: 'quiet', calloud: 'loud', ambquiet: 'ambientQuiet', ambloud: 'ambientLoud' };
  function volumeHtml() {
    const QUIET = 'Increase volume until you can hear this comfortably', LOUD = 'Decrease volume until you can hear this comfortably';
    const play = (act, label, note) => '<div class="calcol"><button type="button" class="mbtn calplay" data-act="' + act + '">' + label +
      (act.startsWith('amb') ? '<span class="calbar" aria-hidden="true"><i></i></span>' : '<span class="caldots" aria-hidden="true">' + '<i></i>'.repeat(AUDIO.CAL.pans.length) + '</span>') + '</button><p class="calnote">' + note + '</p></div>';
    const sec = (id, title, k, plays) => '<section class="calsec" aria-labelledby="cs-' + id + '"><h2 id="cs-' + id + '">' + title + '</h2><div class="calvol">' + rng(k, 'Volume', 0, 1, title + ' volume') + '</div><div class="calplays">' + plays + '</div></section>';
    return '<h1>Volume</h1><p class="caltext">Adjust your device volume and/or the sliders below until you can hear each of these comfortably.</p>' +
      '<p class="calmute"' + (SAVE.data.settings.muted ? '' : ' hidden') + '>Sound is muted: turn Mute off (M) to hear these.</p>' +
      '<div class="calsecs">' +
      sec('fx', 'Sound effects', 'effects', play('calquiet', 'Play the quietest sound in the game', QUIET) + play('calloud', 'Play the loudest sound in the game', LOUD)) +
      sec('amb', 'Ambience', 'ambient', play('ambquiet', 'Play the quietest ambience in the game', QUIET) + play('ambloud', 'Play the loudest ambience in the game', LOUD)) +
      '</div><div class="mrow">' + btn('caldone', 'Done', 'calvol', 'primary') + '</div>';
  }
  // Brightness's Calibrate: the thing on the title, the shape of it alone in The Void's dark (TITLE.shape, drawn by
  // drawShape): the black of the void, and the demon's robe as it is there with no light on it. Done is Settings again
  function brightnessHtml() {
    return '<h1>Brightness</h1><p class="caltext">Increase your device brightness until you can barely see the outline of this creature</p>' +
      '<canvas class="calshape" role="img" aria-label="A dark figure, very faintly, on black"></canvas>' +
      '<div class="mrow">' + btn('caldone', 'Done', 'calbright', 'primary') + '</div>';
  }
  const VOID_BLACK = '#000', ROBE_DARK = 'rgb(12,10,15)';   // (js/levels/night13.js VOID_PAL's sky and fog; js/creatures/demon.js: its robe, robeC, unlit)
  function drawShape(cv) {
    const dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.fillStyle = VOID_BLACK; g.fillRect(0, 0, w, h);
    const ppm = Math.min(h * 0.88 / TITLE.SHAPE_H, w * 0.9 / TITLE.SHAPE_W);
    TITLE.shape(g, w / 2, h / 2 + TITLE.SHAPE_H * ppm / 2, ppm, ROBE_DARK);
  }
  window.addEventListener('resize', () => document.querySelectorAll('canvas.calshape').forEach(drawShape));
  // a play button pressed: it plays from the start (what was still sounding of the last, of either section, faded out at
  // once: one at a time)
  function calPlay(a, root) {
    ensureAudio();
    const b = root.querySelector('button[data-act="' + a + '"]'); if (!b) return;
    const idle = x => { x.classList.remove('playing'); x.querySelectorAll('.caldots i').forEach(i => i.classList.remove('on')); const bar = x.querySelector('.calbar i'); if (bar) { bar.style.transition = 'none'; bar.style.width = '0'; } };
    root.querySelectorAll('button.calplay').forEach(idle);
    const note = root.querySelector('.calmute'); if (note) note.hidden = !SAVE.data.settings.muted;
    b.classList.add('playing');
    const bar = b.querySelector('.calbar i');
    AUDIO.calibrate(CALS[a], i => {
      if (!b.isConnected) return;
      if (i < 0) { idle(b); return; }
      if (bar) { void bar.offsetWidth; bar.style.transition = 'width ' + AUDIO.CAL.bed.len + 's linear'; bar.style.width = '100%'; return; }
      b.querySelectorAll('.caldots i').forEach((x, j) => x.classList.toggle('on', j === i));
    });
  }
  // after Settings (or one of its dialogs) is put in a screen: the shape drawn; in the volume's dialog the ambience
  // faded out of the way, out of it back in, and the calibration's sound stopped
  function settled(root, d) {
    const vol = !!(d && d.sub === 'volume');
    if (!vol) AUDIO.calStop();
    AUDIO.hush(vol);
    const cv = root.querySelector('canvas.calshape'); if (cv) drawShape(cv);
  }
  // what to focus in Settings or one of its dialogs: what opened it (back from a dialog), else in Settings Back, in the
  // volume's dialog the first play button, in the brightness's Done
  function settingsFocus(root, d) {
    return (d.focus && root.querySelector('button[data-act="' + d.focus + '"]')) || root.querySelector(d.sub === 'volume' ? 'button[data-act="calquiet"]' : d.sub ? 'button[data-act="caldone"]' : 'button[data-act="back"]');
  }
  // Esc (or a pad's B) in one of Settings' dialogs: Settings again, as Done. True if it was one
  function subBack(root) { const b = root.querySelector('button[data-act="caldone"]'); if (!b) return false; b.click(); return true; }
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
    const sub = kind === 'settings' && current.data.sub ? ' calp cal-' + current.data.sub : '';   // (Settings' calibration dialogs, in the same panel)
    showOverlay((dlg ? '<div class="panel ' + kind + 'p' + sub + '" role="dialog" aria-modal="true">' + html(kind, current.data) + '</div>' : html(kind, current.data)) + confirm);
    ov.classList.toggle('dlg', dlg);
    ov.classList.toggle('titlelow', kind === 'title' && TITLE.on);
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tap(); act(b.dataset.act, b.dataset.arg); }));
    wire(ov);
    if (kind === 'settings') settled(ov, current.data); else { AUDIO.calStop(); AUDIO.hush(false); }
    ov.querySelectorAll('.stars').forEach(s => s.addEventListener('click', e => { e.stopPropagation(); starTip(s); }));
    const box = ov.querySelector('.confirm');
    if (box) box.addEventListener('click', e => { e.stopPropagation(); if (e.target === box) act('keep'); });   // a click off the little dialog backs out of it
    // focus: the first button, or (back from a sub-screen) the button that opened it
    const first = kind === 'settings' ? settingsFocus(ov, current.data) : (!box && current.data.focus && ov.querySelector('button[data-act="' + current.data.focus + '"]')) || (box || ov).querySelector('button[data-act]');
    if (first && kind !== 'title' && kind !== 'results') first.focus();
    if (kind === 'results') reveal(false);
  }
  // the settings' controls in a screen (the menus' overlay, or the warning's card): each applied and saved as it changes,
  // a slider's percentage following it, a row of choices its chosen one
  function wire(root) {
    const stop = e => e.stopPropagation();
    root.querySelectorAll('input[data-set]').forEach(inp => {
      inp.addEventListener('click', stop); inp.closest('label').addEventListener('click', stop);
      const out = inp.type === 'range' && inp.parentElement.querySelector('.pct');
      inp.addEventListener('input', () => {
        const v = inp.type === 'checkbox' ? inp.checked : parseFloat(inp.value);
        if (out) { out.textContent = pct(v); inp.setAttribute('aria-valuetext', pct(v)); }
        applySetting(inp.dataset.set, v);
      });
      inp.addEventListener('change', tap);   // (a slider once it is let go, at the volume it now has)
    });
    root.querySelectorAll('.seg [role="radio"]').forEach(o => o.addEventListener('click', e => { e.stopPropagation(); if (segPick(o)) tap(); }));
  }
  // Settings in a box of the caller's own, over everything (the warning before a new game: game.js). Its Back calls back();
  // its Calibrate buttons put their dialogs in the same box, and their Done puts Settings back. The keys and a pad go
  // through navKey and the caller (Esc and B through subBack first)
  function settingsInto(root, back, d) {
    d = Object.assign({ from: 'warning' }, d || {});
    root.innerHTML = html('settings', d);
    root.classList.toggle('calp', !!d.sub); root.classList.toggle('cal-volume', d.sub === 'volume');
    const go = d2 => settingsInto(root, back, d2);
    root.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation(); tap();
      const a = b.dataset.act;
      if (a === 'back') back();
      else if (a === 'defaults') toDefaults(root);
      else if (a === 'calvol' || a === 'calbright') go({ sub: a === 'calvol' ? 'volume' : 'brightness' });
      else if (a === 'caldone') go({ focus: b.dataset.arg });
      else if (CALS[a]) calPlay(a, root);
    }));
    wire(root);
    settled(root, d);
    const first = settingsFocus(root, d); if (first) first.focus();
  }
  // the keys in a screen of buttons and settings: arrows (and WASD, Tab) move round them; Space and Enter flip a focused
  // switch, left and right move a focused slider or go along a focused row of choices. True if the key was taken
  function ring(root) { return [...root.querySelectorAll('button[data-act], input[data-set], .seg [role="radio"][aria-checked="true"]')]; }
  function navKey(e, root) {
    const k = e.key, btns = ring(root);
    if (!btns.length) return false;
    const idx = btns.indexOf(document.activeElement);
    const f = document.activeElement; // the control keeps the keys it uses: Space flips a switch, left and right move a slider
    if (f && f.tagName === 'INPUT' && (k === ' ' || (f.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End')))) return false;
    if (k === 'Enter' && f && f.tagName === 'INPUT' && f.type === 'checkbox' && idx >= 0) { if (!e.repeat) f.click(); return true; }   // Enter flips a switch too
    if (isRadio(f) && root.contains(f)) {   // a row of choices: left and right go along it, Enter and Space choose
      if (k === 'ArrowLeft' || k === 'ArrowRight') { e.preventDefault(); segStep(f, k === 'ArrowLeft' ? -1 : 1); return true; }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); if (!e.repeat) f.click(); return true; }
    }
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd' || k === 'Tab' && !e.shiftKey) { e.preventDefault(); btns[(idx + 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a' || k === 'Tab' && e.shiftKey) { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus(); return true; }
    return false;
  }
  // a pad's d-pad on a focused slider or row of choices: left and right move it, as the arrow keys do
  function padSlide(f, dir) {
    if (isRadio(f)) { segStep(f, dir === 1 ? -1 : 1); return true; }
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
  // the text size: every size in the menus and the HUD is its own times --text-scale; and its name on the page
  // (data-textsize: smaller, normal, bigger), for the few layouts that change with it rather than only grow
  function textSize(v) {
    const de = document.documentElement, i = SAVE.TEXT_SIZES.findIndex(([, x]) => x === v);
    de.style.setProperty('--text-scale', v);
    de.dataset.textsize = i < 0 ? 'normal' : SAVE.TEXT_SIZES[i][0].toLowerCase();
  }
  function applySetting(k, v) {
    // reduced motion and reduced flashing are one switch: it sets both flags (each still read where it was)
    if (k === 'reduceMotionFlash') { SAVE.setSetting('reducedMotion', !!v); SAVE.setSetting('reducedFlash', !!v); return; }
    // Display is not saved: it is the page in or out of full screen, as the corner button does it. If that does not
    // happen (refused: no gesture behind it), the row goes back to what the page is
    if (k === 'display') { if (!!v !== !!fsOn()) toggleFullscreen(); setTimeout(displaySync, 700); return; }
    SAVE.setSetting(k, v);
    if (k === 'muted') setMuted(v);
    else if (k === 'effects' || k === 'ambient') AUDIO.setVolume(k, v);
    else if (k === 'textSize') textSize(v);
    else if (k === 'reduceTextures') R.detail = !v;
  }
  // Set to default: every setting as it began, applied at once, and the controls on screen moved to match (the focus
  // stays on the button)
  function toDefaults(root) {
    const S = SAVE.defaults();
    setMuted(!!S.muted); applyAll();
    root.querySelectorAll('input[data-set]').forEach(inp => {
      if (inp.type === 'checkbox') { inp.checked = switchOn(inp.dataset.set); return; }
      const v = S[inp.dataset.set]; inp.value = v; inp.setAttribute('aria-valuetext', pct(v));
      const out = inp.parentElement.querySelector('.pct'); if (out) out.textContent = pct(v);
    });
    root.querySelectorAll('.seg[data-set]').forEach(g => {
      if (!(g.dataset.set in S)) return;   // (Display: not a setting, left as the page is)
      segShow(g, SAVE.nearest([...g.querySelectorAll('[role="radio"]')].map(o => [o.textContent, parseFloat(o.dataset.v)]), S[g.dataset.set]));
    });
  }
  function applyAll() {
    const S = SAVE.data.settings;
    AUDIO.setVolume('effects', S.effects); AUDIO.setVolume('ambient', S.ambient);
    textSize(S.textSize);
    R.detail = !S.reduceTextures;
  }
  function act(a, arg) {
    switch (a) {
      case 'begin': newGame(); break;
      case 'done': show('results'); break;   // the ending's "The End": how the nights went this time
      case 'finish': G.lastRun = null; if (G.seed === null) G.runSeed = Date.now() % 1000000; showTitle(); break;   // home; the next run new layouts, unless the seed is fixed
      case 'nights': show('nights', { from: 'title' }); break;   // only from the title (and its Back goes there)
      case 'settings': show('settings', { from: arg || 'title' }); break;
      // Settings' calibration dialogs, in its place in the same panel; Done is Settings again, focus on what opened it
      case 'calvol': case 'calbright': show('settings', { from: current.data.from, sub: a === 'calvol' ? 'volume' : 'brightness' }); break;
      case 'caldone': show('settings', { from: current.data.from, focus: arg }); break;
      case 'calquiet': case 'calloud': case 'ambquiet': case 'ambloud': calPlay(a, UI.overlay); break;
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
    if (k === 'Escape' && current.kind === 'settings' && current.data.sub) { act('caldone', current.data.sub === 'volume' ? 'calvol' : 'calbright'); return true; }
    if (k === 'Escape' && (current.kind === 'nights' || current.kind === 'settings' || current.kind === 'howto')) { act('back', current.data.from); return true; }
    if (k === 'Enter' && idx >= 0) return true;   // the focused button handles it
    return false;
  }
  return { show, act, onKey, hurry, applySetting, applyAll, settingsInto, subBack, navKey, padSlide, get sub() { return current && current.kind === 'settings' ? current.data.sub || null : null; }, get kind() { return current ? current.kind : null; }, clear() { stopReveal(); current = null; AUDIO.hush(false); } };
})();
