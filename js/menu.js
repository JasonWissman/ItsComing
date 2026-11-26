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
  // the nights' easter eggs ("secret scenes", to the player), one for each night: its short title (game.js eggTitle, by
  // the night's id), and whether it has been found (the save's eggs: game.js foundEgg)
  const eggList = () => LEVELS.map((l, i) => ({ i, id: l.id, name: eggTitle(l.id), found: !!SAVE.data.eggs[l.id] }));
  // Scores is there to open (on the title, and in the pause menu alike) only once a whole game has been finished: there
  // is a best run. Easter eggs found before that are kept in the save all the same, and are in its Secret scenes tab when
  // it is there to open; they do not bring the button by themselves
  const scoresOpen = () => !!SAVE.data.bestRun[G.diff().id];
  // the Scores' second tab, Secret scenes: thirteen boxes in the nights' order, each with nothing in it but its title
  // (no night's name or number, nor what it was: the titles are a list to guess from). The title is there found or not;
  // one found has a check drawn in its box and is bright, one not found yet an empty box and is dimmed (each says which,
  // read aloud). Under them, how many have been found. The boxes are the nights' own (runCards: the same grid, the same
  // card, .nights and .ncard, so the same place and size at every size of screen and text): flipping between the two
  // tabs, a night's box and its secret's are in the one spot.
  // fresh (the results after the ending): the ids of those first found in the run just finished. They start as not found
  // and are checked off one after another as the tab is watched (reveal); if they make it all of them, a stamp says so
  function eggsHtml(eggs, fresh) {
    let rows = '';
    const isNew = x => !!fresh && x.found && fresh.includes(x.id), n = eggs.filter(x => x.found).length;
    for (const x of eggs) {
      rows += '<div class="ncard egg ' + (x.found && !isNew(x) ? 'found' : 'unknown') + (isNew(x) ? ' fresh' : '') + col(x.i) + '" role="listitem" aria-label="' + escapeHtml(x.name) + (x.found ? ', found' : ', not found') + (isNew(x) ? ' in this run' : '') + '"><span class="emark" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3 8.6l3.4 3.4L13 4.4"/></svg></span><span class="nname ename" aria-hidden="true">' + escapeHtml(x.name) + '</span></div>';
    }
    const all = !!fresh && fresh.length > 0 && n === eggs.length;
    return '<div class="nights eggs" role="list" aria-label="Secret scenes" style="--rows: ' + Math.ceil(LEVELS.length / 2) + '">' + rows + '</div>' +
      '<p class="eggcount"><span class="ecnt"><span class="ecount">' + (n - eggs.filter(isNew).length) + '</span> of ' + eggs.length + ' found</span>' + (all ? '<span class="stamp estamp">All secrets found</span>' : '') + '</p>';
  }
  // two tabs over their two panels (role tablist, tab, tabpanel: pickTab), the one chosen shown: [[key, label, html], ...]
  function tabsHtml(name, tabs, on) {
    const tab = ([k, label]) => '<button type="button" role="tab" id="tab-' + k + '" data-tab="' + k + '" aria-controls="panel-' + k + '" aria-selected="' + (k === on) + '" tabindex="' + (k === on ? 0 : -1) + '">' + label + '</button>';
    const panel = ([k, , inner]) => '<div class="tabpanel" role="tabpanel" id="panel-' + k + '" aria-labelledby="tab-' + k + '"' + (k === on ? '' : ' hidden') + '>' + inner + '</div>';
    return '<div class="tabs" role="tablist" aria-label="' + name + '">' + tabs.map(tab).join('') + '</div><div class="tabstack">' + tabs.map(panel).join('') + '</div>';
  }
  function btn(act, label, arg, cls) { return '<button type="button" class="mbtn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (arg !== undefined ? ' data-arg="' + arg + '"' : '') + '>' + label + '</button>'; }
  function html(kind, d) {
    d = d || {};
    switch (kind) {
      case 'title': {
        // the title itself: the name and the way in, and nothing else over what is out there (how to play is a dialog).
        // There is one way in, Begin: every game is all the nights in a row from the first. Scores (the best run and the
        // easter eggs found, to look at, not to pick from) only once a whole run has been finished (scoresOpen)
        return '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
          '<div class="mrow">' + btn('begin', 'Begin', undefined, 'primary') + (scoresOpen() ? btn('nights', 'Scores') : '') + btn('howto', 'How to play') + btn('settings', 'Settings', 'title') + '</div>' +
          '<p class="fine credit"><button type="button" class="creditbtn" data-act="note" aria-haspopup="dialog">created by jason wissman</button></p>';
      }
      case 'note': {
        // the credit's dialog: the developer's note (its words the author's own, as written: NOTE), scrolling inside the
        // panel when it is taller than it, and under it, always in view, the two links out and Back
        const out = (href, label) => '<a class="mbtn mlink" href="' + href + '" target="_blank" rel="noopener">' + label + '</a>';
        return '<div class="notebody" tabindex="0" role="region" aria-labelledby="noteH"><h1 id="noteH">Note from Jason:</h1>' + NOTE.map(p => '<p>' + p + '</p>').join('') + '</div>' +
          '<div class="mrow notefoot"><div class="notelinks">' + out(KOFI, 'Support me with a coffee') + out(SITE, 'See my other projects') + '</div>' + btn('back', 'Back', 'title') + '</div>';
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
          card(k('Esc') + or + k('P'), 'Pause') +
          '</div>' +
          '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + '</div>';
      }
      case 'pause':
        // one narrow column of buttons all of a width: Resume, Controls (How to play, as on the title), Settings, Scores
        // (once the title has it: scoresOpen) and a quiet Quit, which asks first (show: confirmQuit) and is the only way
        // out to the title. R (restart) and M (mute) still work from the keyboard; Esc or P resumes
        return '<h1>Paused</h1><div class="mcol even">' + btn('resume', 'Resume') + btn('controls', 'Controls') + btn('settings', 'Settings', 'pause') + (scoresOpen() ? btn('nights', 'Scores', 'pause') : '') + btn('quit', 'Quit', undefined, 'quiet') + '</div>' + (touchUI() ? '' : '<p class="fine">Esc or P resumes</p>');
      case 'dead':   // (no way out to the title from here but the pause menu's Quit: Esc, B, or the menu button on a phone)
        return '<h1 class="red">' + (d.title || 'It got you') + '</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try again') + '</div>';
      case 'ending':   // the last screen of the last night, over the morning room
        return '<h1 class="big">You have faced your demons.</h1><div class="mrow">' + btn('done', 'The End', undefined, 'primary') + '</div>';
      case 'results': {
        // after the ending: the nights as on the Scores screen, each card's time coming in one after another (reveal), then
        // the whole run with its stars, then the way out. This run's own times (game.js: G.lastRun), adding up to its
        // whole time; the Best run stamp beside that only when it is a new best (and so the one on the Scores screen now).
        // (No run, only when the last night was reached by ?level=: then dashes)
        // If the run found easter eggs it did not have before (the save's runEggs: game.js foundEgg), two tabs, as Scores
        // has: This run (all of the above) and Secret scenes. It opens on This run all the same, its times coming in as
        // ever; a moment after they are all in it slides over to the secret scenes, where the new ones are checked off
        // one after another (eggsHtml fresh; reveal), with a stamp, All secrets found, if that is all of them now
        const R0 = G.lastRun;
        const run = R0 ? runTime(R0, 'This run', R0.best) : '<div class="rlabel">This run</div><div class="rline"><div class="rtime none">&mdash;</div></div>';
        const body = runCards(R0, 'rcard') + '<div class="runcard rrun">' + run + '</div>';
        const fresh = R0 ? SAVE.data.runEggs.filter(id => SAVE.data.eggs[id]) : [];
        return '<div class="results"><div class="kicker">Morning</div><h1>Every night survived</h1>' +
          (fresh.length ? tabsHtml('Results', [['run', 'This run', body], ['eggs', 'Secret scenes', eggsHtml(eggList(), fresh)]], 'run') : body) +
          '<div class="mrow rlast">' + btn('finish', 'Finish game', undefined, 'primary') + '</div></div>';
      }
      case 'survived':
        // on to the next night (and no other way from here: the pause menu has Quit)
        return '<div class="kicker">' + d.title + '</div><h1>You survived</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('next', 'Next night') + '</div>';
      case 'nights': {   // (the Scores dialog)
        // the best full run, to look at: a card for each night with its share of that run's time, in two columns (one on
        // a phone; not buttons: no night is picked from here), and under them the run's whole time and stars. No run
        // yet: only a word on what one is. And at the bottom, by Back, Erase progress (it asks first: show; not when
        // Scores is opened from the pause menu, a game under way).
        // Once an easter egg has been found, two tabs: Best run (that) and Secret scenes (eggsHtml); both panels are in
        // the page, the one not chosen hidden (pickTab). It opens on Best run, or on the eggs while there is no run yet
        const best = SAVE.data.bestRun[G.diff().id], from = d.from || 'title';
        const body = best
          ? runCards(best, 'shown') + '<div class="runcard">' + runTime(best, 'Best run', false) + '</div>'
          : '<div class="runcard empty"><div class="rlabel">Best run</div><div class="rline"><div class="rtime none">&mdash;</div></div><div class="rhint">No full run yet. Survive all ' + LEVELS.length + ' nights in one go: retries are allowed, but the clock keeps running.</div></div>';
        const foot = '<div class="mrow">' + btn('back', 'Back', from) + (from === 'pause' ? '' : btn('reset', 'Erase progress', undefined, 'danger')) + '</div>';
        const eggs = eggList();
        if (!eggs.some(x => x.found)) return '<h1>Scores</h1>' + body + foot;
        return '<h1>Scores</h1>' + tabsHtml('Scores', [['run', 'Best run', body], ['eggs', 'Secret scenes', eggsHtml(eggs)]], d.tab || (best ? 'run' : 'eggs')) + foot;
      }
      case 'settings': {
        if (d.sub === 'volume') return volumeHtml();
        if (d.sub === 'brightness') return brightnessHtml();
        // Volume and Brightness, each a Calibrate button (a dialog of its own: volumeHtml, brightnessHtml: the effects and
        // the ambience volumes are in Volume's; Brightness's has nothing to set, only the creature to set the device by); Display, windowed or full screen (displayRow); the text size, a row of
        // choices (seg); then the on/off settings, each a switch (a checkbox with the role of a switch, drawn as one: .sw).
        // At the foot Set to default (every setting back as it began, nothing else) and, to its right, Done (data-act
        // 'back': it, Esc and a pad's B go back to what opened Settings). From the warning before a new game (d.from
        // 'warning': game.js) the same
        const sw = (k, label) => '<label class="opt"><span class="olabel">' + label + '</span><span class="swwrap"><input type="checkbox" role="switch" class="swi" data-set="' + k + '"' + (switchOn(k) ? ' checked' : '') + '><span class="sw" aria-hidden="true"></span></span></label>';
        const cal = (act, label) => '<div class="opt"><span class="olabel">' + label + '</span><button type="button" class="calbtn" data-act="' + act + '" aria-label="Calibrate ' + label.toLowerCase() + '">Calibrate</button></div>';
        return '<h1>Settings</h1><div class="settings"><div class="sgrp">' +
          cal('calvol', 'Volume') + cal('calbright', 'Brightness') + displayRow() + seg('textSize', 'Text size', SAVE.TEXT_SIZES) +
          '</div><div class="sgrp">' +
          sw('muted', 'Mute') + sw('reduceMotionFlash', 'Reduce motion and flashing effects') + sw('captions', 'Captions for sounds') + (touchUI() ? sw('swipeReverse', 'Reverse swipes') : '') + sw('reduceTextures', 'Reduce surface textures') +
          '</div></div><div class="mrow">' + btn('defaults', 'Set to default') + btn('back', 'Done', d.from || 'title', 'primary') + '</div>';
      }
      default: return '';
    }
  }
  // over the title, its sub-screens open as dialogs: a panel over the middle of the view, over what is coming (TITLE),
  // which comes on behind it while it is open
  // (and from the pause menu, Controls and Settings open as the same dialogs, over the night paused behind them)
  const DIALOGS = ['nights', 'settings', 'howto', 'note'];
  // the developer's note, opened by the credit under the title (its words as the author wrote them; the two links in it
  // open in a new tab, as the two buttons under it do)
  const SITE = 'https://jasonwissman.com', KOFI = 'https://ko-fi.com/jasonwissman';
  const ext = (href, label) => '<a href="' + href + '" target="_blank" rel="noopener">' + label + '</a>';
  const NOTE = [
    'This game is inspired by a real experience I had, where I was pursued by mysterious creatures in my dreams multiple nights in a row. One night, I gained enough lucidity to turn and face the creatures in the dream, and when I did they transformed into representations of things I\'d been avoiding in my real, waking life: a friend I hadn\'t texted back, a responsibility I was avoiding, a commitment I\'d neglected.',
    'Those dreams woke me up (literally) to the need to face things head-on, and left me fascinated with the way our subconscious communicates with us through dreams.',
    'If you\'d like to support this project and other free games and apps I\'m working on, you can ' + ext(KOFI, 'support me with a coffee') + ', or see what else I\'m making at ' + ext(SITE, 'jasonwissman.com') + '.',
    'Hope you enjoy!',
  ];
  // the note's text, scrolled by the arrows (and a pad's up and down) while there is more of it that way: dir -1 up, 1
  // down. True if it moved
  function noteScroll(root, dir) {
    const b = root.querySelector('.notebody'); if (!b) return false;
    const max = b.scrollHeight - b.clientHeight;
    if (max <= 1 || (dir < 0 ? b.scrollTop <= 0 : b.scrollTop >= max - 1)) return false;
    b.scrollBy({ top: dir * Math.max(48, b.clientHeight * 0.6), behavior: SAVE.data.settings.reducedMotion ? 'auto' : 'smooth' });
    return true;
  }
  const QUIT_TEXT = 'Are you sure you want to quit? Your progress will be lost.';   // (the pause menu's Quit asks: show)
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
  // the Scores' tabs, and the results' (role tablist, tab, tabpanel): a click or a tap on one chooses it; with the focus on the chosen one
  // (the only one of them in the round the keys go: ring) left and right, and a pad's d-pad, go along them choosing as they
  // go (Home and End: the first and the last). The panel of the one chosen is shown, the other's hidden. True if it changed
  const isTab = f => !!(f && f.getAttribute && f.getAttribute('role') === 'tab');
  function pickTab(root, k, auto) {   // (auto: the results going over to their secret scenes by themselves, not the player)
    let changed = false;
    for (const t of root.querySelectorAll('[role="tab"]')) {
      const on = t.dataset.tab === k, p = document.getElementById(t.getAttribute('aria-controls'));
      if (on && t.getAttribute('aria-selected') !== 'true') changed = true;
      t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
      if (p) p.hidden = !on;
    }
    if (changed && current && current.kind === 'nights') current.data.tab = k;
    if (current && current.kind === 'results' && !auto) { if (changed) resultsTab(k); else stopAuto(true); }   // (the one it is on chosen again: it stays there all the same)
    return changed;
  }
  function tabStep(o, dir) {
    const list = o.closest('[role="tablist"]'), all = [...list.querySelectorAll('[role="tab"]')], n = all[Math.max(0, Math.min(all.length - 1, all.indexOf(o) + dir))];
    if (n !== o && pickTab(list.parentElement, n.dataset.tab)) tap();
    n.focus();
  }
  // Volume's Calibrate: the game's two volumes, each in a section of its own with its slider and the two ends of what it
  // plays. Sound effects: the quietest sound (the heartbeat's first beat, as faint as it first comes, seven times from
  // the left ear over to the right) and the loudest (the sting itself, once, in the middle): AUDIO.calibrate. Ambience:
  // the quietest bed in the game and the loudest, a few seconds of each. Each of the four is a button with a play mark at
  // its left, which is a stop mark while its sound plays (PLAY_ICON; .playing, aria-pressed): pressed then, it stops.
  // With captions for sounds on, each is captioned as the game captions it; the quietest (which the game plays under
  // everything, with no caption of its own) as "footsteps" for as long as it plays (CAPTIONS.cal).
  // These buttons make no tap of their own (the menus' click would be over the very sound being judged). While the
  // dialog is open whatever ambience was playing is faded out (AUDIO.hush: settled), so these are heard in clean
  // space. Done (Esc, a pad's B) is Settings again
  const CALS = { calquiet: 'quiet', calloud: 'loud', ambquiet: 'ambientQuiet', ambloud: 'ambientLoud' };
  const PLAY_ICON = '<span class="calico" aria-hidden="true"><svg class="icoplay" viewBox="0 0 16 16"><path d="M4.2 2.2v11.6L13.6 8z"/></svg><svg class="icostop" viewBox="0 0 16 16"><rect x="3.2" y="3.2" width="9.6" height="9.6" rx="1.2"/></svg></span>';
  function volumeHtml() {
    const play = (act, label) => '<button type="button" class="mbtn calplay" data-act="' + act + '" aria-pressed="false">' + PLAY_ICON + '<span class="callabel">' + label + '</span></button>';
    const sec = (id, title, k, plays) => '<section class="calsec" aria-labelledby="cs-' + id + '"><h2 id="cs-' + id + '">' + title + '</h2><div class="calvol">' + rng(k, 'Volume', 0, 1, title + ' volume') + '</div><div class="calplays">' + plays + '</div></section>';
    return '<h1>Volume</h1><p class="caltext">Adjust your device volume and/or the sliders below until you can hear each of these comfortably.</p>' +
      '<p class="calmute"' + (SAVE.data.settings.muted ? '' : ' hidden') + '>Sound is muted: turn Mute off (M) to hear these.</p>' +
      '<div class="calsecs">' +
      sec('fx', 'Sound effects', 'effects', play('calquiet', 'Quietest sound in the game') + play('calloud', 'Loudest sound in the game')) +
      sec('amb', 'Ambience', 'ambient', play('ambquiet', 'Quietest ambience in the game') + play('ambloud', 'Loudest ambience in the game')) +
      '</div><div class="mrow">' + btn('caldone', 'Done', 'calvol', 'primary') + '</div>';
  }
  // Brightness's Calibrate: the thing on the title, the shape of it alone in The Void's dark (TITLE.shape, drawn by
  // drawShape): the black of the void, and the demon's robe as it is there with no light on it. It is the device's own
  // brightness that is set by it: the game has none of its own (a slider there was washed the scenes out, or lost what
  // is in their dark). Done is Settings again
  function brightnessHtml() {
    return '<h1>Brightness</h1><p class="caltext">Increase your device brightness until you can barely perceive the outline of this creature.</p>' +
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
  // a play button pressed: its sound plays from the start, its mark a stop mark until it is over (what was still sounding
  // of another, of either section, faded out at once: one at a time); pressed while its own sound plays, that stops
  function calPlay(a, root) {
    ensureAudio();
    const b = root.querySelector('button[data-act="' + a + '"]'); if (!b) return;
    const idle = x => { x.classList.remove('playing'); x.setAttribute('aria-pressed', 'false'); };
    const was = b.classList.contains('playing');
    root.querySelectorAll('button.calplay').forEach(idle);
    const note = root.querySelector('.calmute'); if (note) note.hidden = !SAVE.data.settings.muted;
    CAPTIONS.calOver();
    if (was) { AUDIO.calStop(); return; }
    b.classList.add('playing'); b.setAttribute('aria-pressed', 'true');
    const steps = a === 'calquiet';
    if (!AUDIO.calibrate(CALS[a], i => { if (i < 0) { CAPTIONS.calOver(); if (b.isConnected) idle(b); } else if (steps) CAPTIONS.cal(AUDIO.CAL.pans[i]); })) idle(b);
  }
  // the calibration's sound stopped, and its caption with it
  function calOff() { AUDIO.calStop(); if (typeof CAPTIONS !== 'undefined') CAPTIONS.calOver(); }
  // after Settings (or one of its dialogs) is put in a screen: the shape drawn; in the volume's dialog the ambience
  // faded out of the way, out of it back in, and the calibration's sound stopped
  function settled(root, d) {
    const vol = !!(d && d.sub === 'volume');
    if (!vol) calOff();
    AUDIO.hush(vol);
    const cv = root.querySelector('canvas.calshape'); if (cv) drawShape(cv);
  }
  // what to focus in Settings or one of its dialogs: what opened it (back from a dialog), else in Settings Done, in the
  // volume's dialog the first play button, in the brightness's Done
  function settingsFocus(root, d) {
    return (d.focus && root.querySelector('button[data-act="' + d.focus + '"]')) || root.querySelector(d.sub === 'volume' ? 'button[data-act="calquiet"]' : d.sub ? 'button[data-act="caldone"]' : 'button[data-act="back"]');
  }
  // Esc (or a pad's B) in one of Settings' dialogs: Settings again, as Done. True if it was one
  function subBack(root) { const b = root.querySelector('button[data-act="caldone"]'); if (!b) return false; b.click(); return true; }
  // the one switch for reduced motion and reduced flashing: both flags the game reads go with it (save.js keeps them alike)
  const switchOn = k => { const S = SAVE.data.settings; return k === 'reduceMotionFlash' ? !!(S.reducedMotion || S.reducedFlash) : !!S[k]; };
  // every button and control in the menus answers with a soft tap (AUDIO 'tap': quiet, and no caption: it is the
  // click of the thing you pressed, nothing to be told about); all but the volume dialog's four play buttons (CALS),
  // pressed to play or to stop: what they play is to be heard on its own
  const tap = () => { ensureAudio(); AUDIO.sfx('tap'); };
  const tapFor = a => { if (!CALS[a]) tap(); };
  function show(kind, data) {
    stopReveal(); stopAuto();
    current = { kind, data: data || {} };
    const ov = UI.overlay;
    const from = current.data.from || 'title';
    const dlg = DIALOGS.includes(kind) && ((from === 'title' && G.state === 'title') || from === 'pause');
    // erasing progress asks first, in a small dialog of its own over Scores; and so does quitting, over the pause menu
    // (Cancel first, so it has the focus; Esc, B or a click off it is Cancel)
    const confirm = kind === 'nights' && current.data.confirmReset ? '<div class="confirm"><div class="cpanel" role="alertdialog" aria-modal="true" aria-label="Erase all progress?"><h2>Erase all progress?</h2><p>Every night reached, your best run and the easter eggs found will be gone.</p><div class="mrow">' + btn('keep', 'Cancel') + btn('erase', 'Erase', undefined, 'danger') + '</div></div></div>'
      : kind === 'pause' && current.data.confirmQuit ? '<div class="confirm"><div class="cpanel" role="alertdialog" aria-modal="true" aria-describedby="quitText"><p class="cask" id="quitText">' + QUIT_TEXT + '</p><div class="mrow">' + btn('stay', 'Cancel') + btn('title', 'Quit', undefined, 'danger') + '</div></div></div>' : '';
    const sub = kind === 'settings' && current.data.sub ? ' calp cal-' + current.data.sub : '';   // (Settings' calibration dialogs, in the same panel)
    showOverlay((dlg ? '<div class="panel ' + kind + 'p' + sub + '" role="dialog" aria-modal="true"' + (kind === 'note' ? ' aria-labelledby="noteH"' : '') + '>' + html(kind, current.data) + '</div>' : html(kind, current.data)) + confirm);
    ov.classList.toggle('dlg', dlg);
    ov.classList.toggle('titlelow', kind === 'title' && TITLE.on);
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); tapFor(b.dataset.act); act(b.dataset.act, b.dataset.arg); }));
    ov.querySelectorAll('a[href]').forEach(l => l.addEventListener('click', e => { e.stopPropagation(); tap(); }));   // (a link out: a new tab; the title behind is not clicked)
    ov.querySelectorAll('[role="tab"]').forEach(t => t.addEventListener('click', e => { e.stopPropagation(); if (pickTab(ov, t.dataset.tab)) tap(); }));
    wire(ov);
    if (kind === 'note') {   // more of the note below what shows: its last lines fade out (.more), until it is scrolled to its end
      const nb = ov.querySelector('.notebody'), more = () => nb.classList.toggle('more', nb.scrollHeight - nb.clientHeight - nb.scrollTop > 2);
      if (nb) { nb.addEventListener('scroll', more, { passive: true }); more(); requestAnimationFrame(more); }
    }
    if (kind === 'results') toDark(ov);
    if (kind === 'settings') settled(ov, current.data); else { calOff(); AUDIO.hush(false); }
    ov.querySelectorAll('.stars').forEach(s => s.addEventListener('click', e => { e.stopPropagation(); starTip(s); }));
    const box = ov.querySelector('.confirm');
    if (box) box.addEventListener('click', e => { e.stopPropagation(); if (e.target === box) act(kind === 'pause' ? 'stay' : 'keep'); });   // a click off the little dialog backs out of it
    // focus: the first button, or (back from a sub-screen) the button that opened it
    const first = kind === 'settings' ? settingsFocus(ov, current.data) : (!box && current.data.focus && ov.querySelector('button[data-act="' + current.data.focus + '"]')) || (box || ov).querySelector('button[data-act]');
    if (first && (kind !== 'title' || current.data.focus) && kind !== 'results') first.focus();   // (the title: only back to the credit from its note)
    if (kind === 'results') reveal(false);
  }
  // the results are in the dark theme, as the Scores dialog is (the morning's light one is the last screen's only, The
  // End): from it, the pale veil over the morning room eases to the dark one as their card fades in, rather than the
  // whole screen going from light to dark at once
  function toDark(ov) {
    if (document.documentElement.getAttribute('data-theme') !== 'day') return;
    const fade = [ov, UI.mute, UI.fsBtn].filter(Boolean);
    fade.forEach(e => { e.style.transition = 'opacity .5s, background-color 1s ease-in-out, color 1s ease-in-out, border-color 1s ease-in-out'; });
    STORY.theme(false);
    setTimeout(() => fade.forEach(e => { e.style.transition = ''; }), 1100);
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
  // Settings in a box of the caller's own, over everything (the warning before a new game: game.js). Its Done calls back();
  // its Calibrate buttons put their dialogs in the same box, and their Done puts Settings back. The keys and a pad go
  // through navKey and the caller (Esc and B through subBack first)
  function settingsInto(root, back, d) {
    d = Object.assign({ from: 'warning' }, d || {});
    root.innerHTML = html('settings', d);
    root.classList.toggle('calp', !!d.sub); root.classList.toggle('cal-volume', d.sub === 'volume');
    const go = d2 => settingsInto(root, back, d2);
    root.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const a = b.dataset.act;
      tapFor(a);
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
  function ring(root) { return [...root.querySelectorAll('button[data-act], a[href], .notebody, input[data-set], .seg [role="radio"][aria-checked="true"], [role="tab"][aria-selected="true"]')]; }
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
    if (isTab(f) && root.contains(f)) {   // the Scores' tabs: left and right go along them (the one with the focus is the one chosen)
      if (k === 'ArrowLeft' || k === 'ArrowRight' || k === 'Home' || k === 'End') { e.preventDefault(); tabStep(f, k === 'ArrowLeft' ? -1 : k === 'ArrowRight' ? 1 : k === 'Home' ? -99 : 99); return true; }
      if (k === 'Enter' || k === ' ') { e.preventDefault(); return true; }
    }
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd' || k === 'Tab' && !e.shiftKey) { e.preventDefault(); btns[(idx + 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a' || k === 'Tab' && e.shiftKey) { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus(); return true; }
    return false;
  }
  // a pad's d-pad on a focused slider, row of choices or tab: left and right move it, as the arrow keys do
  function padSlide(f, dir) {
    if (current && current.kind === 'note') {   // (the note: up and down scroll it, left and right go round its links and Back)
      const all = ring(UI.overlay), i = all.indexOf(f); if (!all.length) return false;
      all[(i + (dir === 1 ? -1 : 1) + all.length) % all.length].focus(); return true;
    }
    if (isRadio(f)) { segStep(f, dir === 1 ? -1 : 1); return true; }
    if (isTab(f)) { tabStep(f, dir === 1 ? -1 : 1); return true; }
    if (!(f && f.tagName === 'INPUT' && f.type === 'range')) return false;
    if (dir === 1) f.stepDown(); else f.stepUp();
    f.dispatchEvent(new Event('input'));
    return true;
  }
  // the results after the ending: each night's card takes its time one after another, then the full run, then the way
  // out. A click or a key hurries it to the end; with reduced motion it is all there at once.
  // With its two tabs (the run found easter eggs: html) This run is watched first all the same; AUTO_EGGS ms after it is
  // all in (hurried or not) it slides over to the secret scenes by itself (autoEggs; with reduced motion it only
  // changes), and they are watched (what: 'eggs'): each of the run's new ones is checked off in turn, the count under
  // them going up with it, then the stamp if that is all of them. A tab chosen meanwhile (resultsTab) and it stays where
  // it is put: whatever was still coming in on the other is all there at once, and what has not yet come in on the one
  // chosen comes in now
  const AUTO_EGGS = 1200;
  let timers = [], revealing = false, revealWhat = 'run', autoT = 0, autoOff = false;
  function stopReveal() { timers.forEach(clearTimeout); timers = []; revealing = false; }
  function stopAuto(off) { clearTimeout(autoT); autoT = 0; autoOff = !!off; if (UI.overlay) UI.overlay.querySelectorAll('.slideout').forEach(p => p.classList.remove('slideout')); }
  function autoEggs() {
    autoT = 0;
    const box = UI.overlay.querySelector('.results'), runP = box && box.querySelector('#panel-run'), eggs = box && box.querySelector('#panel-eggs');
    if (!eggs || !eggs.hidden || autoOff) return;
    const go = () => { if (autoOff || !box.isConnected) return; pickTab(box, 'eggs', true); if (!SAVE.data.settings.reducedMotion) eggs.classList.add('slidein'); reveal(false, 'eggs'); };
    if (SAVE.data.settings.reducedMotion) { go(); return; }
    runP.classList.add('slideout');   // (This run goes off to the left, then Secret scenes comes in from the right)
    autoT = setTimeout(() => { autoT = 0; runP.classList.remove('slideout'); go(); }, 260);
  }
  function reveal(now, what) {
    stopReveal();
    const box = UI.overlay.querySelector('.results'); if (!box) return;
    const eggs = box.querySelector('#panel-eggs'), runP = box.querySelector('#panel-run') || box;
    what = revealWhat = what || (eggs && !eggs.hidden ? 'eggs' : 'run');
    const cards = [...box.querySelectorAll('.rcard')], run = box.querySelector('.rrun'), last = box.querySelector('.rlast');
    const still = now || SAVE.data.settings.reducedMotion, at = (ms, fn) => timers.push(setTimeout(fn, ms));
    const quiet = p => (SAVE.data.settings.reducedMotion ? box : p).classList.add('still');   // (hurried: only what was coming in; reduced motion: nothing moves at all)
    // (the way out takes the focus as it comes, unless a tab has it: the keys are going along them)
    const done = () => { revealing = false; const was = last.classList.contains('in'); last.classList.add('in'); const b = last.querySelector('button'); if (b && !was && !isTab(document.activeElement)) b.focus({ preventScroll: true }); };
    if (what === 'eggs') {
      const fresh = [...eggs.querySelectorAll('.egg.fresh.unknown')], count = eggs.querySelector('.ecount'), stamp = eggs.querySelector('.estamp');
      const check = e => { e.classList.remove('unknown'); e.classList.add('found'); if (count) count.textContent = eggs.querySelectorAll('.egg.found').length; };
      const end = () => { if (stamp) stamp.classList.add('in'); done(); };
      if (still) { quiet(eggs); fresh.forEach(check); end(); return; }
      revealing = true;
      const GAP = 520, t0 = 800;
      fresh.forEach((e, i) => at(t0 + i * GAP, () => { check(e); e.classList.add('tick'); AUDIO.sfx('tap'); }));
      at(t0 + fresh.length * GAP + 250, () => { if (stamp) AUDIO.sfx('win'); end(); });
      return;
    }
    // (all in, the stamp too: then, a moment on, over to the secret scenes, if there are new ones still to be watched)
    const over = () => { done(); if (eggs && eggs.hidden && eggs.querySelector('.egg.fresh.unknown') && !autoOff && !autoT) autoT = setTimeout(autoEggs, AUTO_EGGS); };
    if (still) { quiet(runP); cards.forEach(c => c.classList.add('in')); run.classList.add('in'); over(); return; }
    revealing = true;
    const GAP = 230, t0 = 700;
    cards.forEach((c, i) => at(t0 + i * GAP, () => { c.classList.add('in'); AUDIO.sfx('tap'); }));
    const t1 = t0 + cards.length * GAP + 450;
    at(t1, () => { run.classList.add('in'); AUDIO.sfx('win'); });
    at(t1 + 1600, over);   // (the stamp comes down 1.1 s after the time, over .45 s)
  }
  function hurry() { if (revealing) reveal(true, revealWhat); }
  // a tab of the results chosen by the player: it stays there (no going over by itself any more); what was coming in on
  // the other is all there, and what has not yet come in on this one comes in now
  function resultsTab(k) {
    stopAuto(true); hurry();
    const box = UI.overlay.querySelector('.results'), run = box && box.querySelector('.rrun'), eggs = box && box.querySelector('#panel-eggs');
    if (k === 'run' && run && !run.classList.contains('in')) reveal(false, 'run');
    else if (k === 'eggs' && eggs && eggs.querySelector('.egg.fresh.unknown')) reveal(false, 'eggs');
  }
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
      case 'finish': G.lastRun = null; if (G.seed === null) G.runSeed = Date.now() % 1000000; finishHome(); break;   // home, slowly (game.js); the next run new layouts, unless the seed is fixed
      case 'nights': show('nights', { from: arg || 'title' }); break;   // from the title, or the pause menu (its Back goes where it came from)
      case 'settings': show('settings', { from: arg || 'title' }); break;
      // Settings' calibration dialogs, in its place in the same panel; Done is Settings again, focus on what opened it
      case 'calvol': case 'calbright': show('settings', { from: current.data.from, sub: a === 'calvol' ? 'volume' : 'brightness' }); break;
      case 'caldone': show('settings', { from: current.data.from, focus: arg }); break;
      case 'calquiet': case 'calloud': case 'ambquiet': case 'ambloud': calPlay(a, UI.overlay); break;
      case 'howto': show('howto', { from: 'title' }); break;
      case 'note': show('note', { from: 'title' }); break;   // the credit under the title: the developer's note
      case 'resume': resumeGame(); break;
      case 'controls': show('howto', { from: 'pause' }); break;   // the pause menu's Controls: How to play, as on the title
      case 'retry': startLevel(G.levelIndex, false); break;
      case 'next': proceedFromSurvived(); break;
      // out to the title: only ever from the pause menu's Quit, which asks first (quit: the little dialog; stay: its
      // Cancel, the pause menu again with Quit focused; title: its Quit)
      case 'quit': show('pause', { confirmQuit: true }); break;
      case 'stay': show('pause', { focus: 'quit' }); break;
      case 'title': showTitle(); break;
      case 'defaults': toDefaults(UI.overlay); break;
      case 'reset': show('nights', Object.assign({}, current.data, { confirmReset: true })); break;
      case 'keep': show('nights', Object.assign({}, current.data, { confirmReset: false, focus: 'reset' })); break;
      case 'erase': SAVE.reset(); G.run = null; setMuted(false); applyAll(); showTitle(); break;
      case 'back': {
        const from = arg || 'title', was = current && current.kind;
        if (from === 'title' && G.state === 'title' && was === 'note') show('title', { focus: 'note' });   // (the note is not the game's: the title as it was, the focus back on the credit)
        else if (from === 'title' && G.state === 'title') { show('title'); TITLE.advance(); }   // closing a dialog over the title: it came on while it was open
        else if (from === 'title') showTitle();
        else if (from === 'pause') show('pause', { focus: was === 'howto' ? 'controls' : was === 'nights' ? 'nights' : 'settings' });   // focus back on what opened it
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
    if (current.kind === 'note' && root === UI.overlay) {   // the note: up and down (and Page Up, Page Down) scroll it while there is more that way
      const d = k === 'ArrowUp' || k === 'w' || k === 'PageUp' ? -1 : k === 'ArrowDown' || k === 's' || k === 'PageDown' ? 1 : 0;
      if (d && noteScroll(root, d)) { if (e.preventDefault) e.preventDefault(); return true; }
      if (k === ' ' && document.activeElement && document.activeElement.classList.contains('notebody')) { if (noteScroll(root, e.shiftKey ? -1 : 1)) return true; }
    }
    // Space presses the credit, and the note's links and Back, as Enter does (the page keeps Space from them: game.js)
    const fa = document.activeElement;
    if (k === ' ' && fa && root.contains(fa) && (fa.classList.contains('creditbtn') || (current.kind === 'note' && (fa.tagName === 'BUTTON' || fa.tagName === 'A')))) { if (!e.repeat) fa.click(); return true; }
    if (navKey(e, root)) return true;
    const idx = ring(root).indexOf(document.activeElement);
    if (k === 'Escape' && current.kind === 'nights' && current.data.confirmReset) { act('keep'); return true; }
    if (k === 'Escape' && current.kind === 'pause' && current.data.confirmQuit) { act('stay'); return true; }
    if (k === 'Escape' && current.kind === 'settings' && current.data.sub) { act('caldone', current.data.sub === 'volume' ? 'calvol' : 'calbright'); return true; }
    if (k === 'Escape' && (current.kind === 'nights' || current.kind === 'settings' || current.kind === 'howto' || current.kind === 'note')) { act('back', current.data.from); return true; }
    if (k === 'Enter' && idx >= 0) return true;   // the focused button handles it
    if (root !== UI.overlay) return true;   // a little dialog asking: no key goes past it (not Enter with nothing focused, to resume behind it)
    return false;
  }
  return { show, act, onKey, hurry, applySetting, applyAll, settingsInto, subBack, navKey, padSlide, scoresOpen, QUIT_TEXT, get confirming() { return !!(current && (current.data.confirmReset || current.data.confirmQuit)); }, get sub() { return current && current.kind === 'settings' ? current.data.sub || null : null; }, get kind() { return current ? current.kind : null; }, clear() { stopReveal(); stopAuto(); current = null; AUDIO.hush(false); } };
})();
