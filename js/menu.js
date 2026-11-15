'use strict';
// ---------- menus: title, pause, death, survived, nights, settings. Real buttons, keyboard navigable ----------
const MENU = (() => {
  let current = null;
  const fmtTime = t => t === null || t === undefined ? '—' : (Math.round(t) + ' s');
  // a whole run is long: minutes and seconds
  const fmtRun = t => { const s = Math.round(t); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
  function btn(act, label, arg, cls) { return '<button type="button" class="mbtn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (arg !== undefined ? ' data-arg="' + arg + '"' : '') + '>' + label + '</button>'; }
  function html(kind, d) {
    d = d || {};
    const S = SAVE.data.settings;
    switch (kind) {
      case 'title': {
        const unlocked = G.unlocked;
        // the title itself: the name and the way in, and nothing else over what is out there (how to play is a dialog).
        // Nights only once there is more than the first to pick
        return '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
          '<div class="mrow">' + btn('begin', 'Begin') + (unlocked > 0 && unlocked < LEVELS.length ? btn('continue', 'Continue &middot; night ' + (unlocked + 1)) : '') + (unlocked > 0 ? btn('nights', 'Nights') : '') + btn('howto', 'How to play') + btn('settings', 'Settings', 'title') + '</div>' +
          '<p class="fine">Headphones recommended for spatial audio</p>';
      }
      case 'howto': {
        // the controls as four cards, each the keys you press drawn large over what they do: a keycap for each key, the
        // arrows and WASD as they sit on a keyboard, a mouse with its left button lit for a click
        const k = (t, cls) => '<kbd class="key' + (t.length > 2 ? ' wide' : '') + (cls ? ' ' + cls : '') + '">' + t + '</kbd>';
        const cluster = (u, l, d, r) => '<span class="kcluster">' + k(u, 'ku') + k(l, 'kl') + k(d, 'kd') + k(r, 'kr') + '</span>';
        const click = '<kbd class="key mouse" aria-label="click"><svg viewBox="0 0 24 34" aria-hidden="true"><rect x="2" y="2" width="20" height="30" rx="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2v12M2.6 14h18.8" stroke="currentColor" stroke-width="2"/><path d="M12 3.2V13H3.4V12a8.6 8.6 0 0 1 8.6-8.8z" fill="#b3161e"/></svg></kbd>';
        const or = '<span class="kplus">or</span>';
        const card = (keys, what) => '<div class="hcard"><div class="hkeys">' + keys + '</div><div class="hwhat">' + what + '</div></div>';
        return '<h1>How to play</h1><p class="intro">Something is coming straight at you from a long way off. Every time you look away and look back, it is closer.<br>You have to look away to find what will keep it out.</p>' +
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
        return '<h1>Paused</h1><div class="mcol even">' + btn('resume', 'Resume') + btn('restart', 'Restart') + btn('nights', 'Nights') + btn('settings', 'Settings', 'pause') + btn('mute', G.muted ? 'Unmute' : 'Mute') + btn('title', 'Quit') + '</div><p class="fine">Esc resumes</p>';
      case 'dead':
        return '<h1 class="red">It got you</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try that night again') + btn('nights', 'Nights') + btn('title', 'Back to the title') + '</div>' + '<p class="fine">seed ' + G.runSeed + '</p>';
      case 'ending':   // the last screen of the last night, over the morning room
        return '<h1 class="big">You have faced your demons.</h1><div class="mrow">' + btn('again', 'Play again') + '</div>';
      case 'survived':
        // on to the next night, or, quietly and further down, out to the title
        return '<div class="kicker">' + d.title + '</div><h1>You survived</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('next', 'Next night') + '</div>' +
          '<button type="button" class="tbtn" data-act="title">Quit</button>';
      case 'nights': {
        // a card for each night with its best time inside it, in two columns (one on a phone); a night not reached yet is
        // a blank card. Under them, the best full run: night 1 to the end of the last night in one go (game.js: the run)
        const diff = G.diff(), unlocked = G.unlocked, b0 = id => ((SAVE.data.best[id] || {})[diff.id]) || null;
        let cards = '';
        for (let i = 0; i < LEVELS.length; i++) {
          const def = LEVELS[i];
          if (i <= unlocked) {
            const e = b0(def.id), best = e && e.wins ? '<span class="nbest"><small>best</small>' + fmtTime(e.time) + '</span>' : '';
            cards += '<button type="button" class="mbtn ncard" data-act="night" data-arg="' + i + '"><span class="nname">' + (i + 1) + '. ' + def.title + '</span>' + best + '</button>';
          } else cards += '<div class="ncard locked">' + (i + 1) + '. &hellip;</div>';
        }
        const run = SAVE.data.bestRun[diff.id];
        const runCard = '<div class="runcard"><div class="rlabel">Best full run</div>' + (run !== undefined && run !== null
          ? '<div class="rtime">' + fmtRun(run) + '</div><div class="rhint">Night 1 to the end of night ' + LEVELS.length + ', in one go</div>'
          : '<div class="rtime none">&mdash;</div><div class="rhint">Survive all ' + LEVELS.length + ' nights in one go, starting from night 1. Retries are allowed; the clock keeps running.</div>') + '</div>';
        const complete = SAVE.data.complete && SAVE.data.complete[diff.id] ? '<p class="fine">Every night survived.</p>' : '';
        return '<h1>Nights</h1><div class="nights" style="--rows: ' + Math.ceil(LEVELS.length / 2) + '">' + cards + '</div>' + runCard + complete + '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + '</div>';
      }
      case 'settings': {
        const chk = (k, label) => '<label class="opt"><input type="checkbox" data-set="' + k + '"' + (S[k] ? ' checked' : '') + '> ' + label + '</label>';
        const rng = (k, label) => '<label class="opt"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" data-set="' + k + '" value="' + S[k] + '"></label>';
        return '<h1>Settings</h1><div class="settings">' +
          rng('master', 'Volume') + rng('effects', 'Effects') + rng('ambient', 'Ambience') + chk('muted', 'Mute') +
          chk('reducedFlash', 'Reduce flashing (softer red pulse, dimmer flashes)') + chk('reducedMotion', 'Reduce motion (no jitter or sway)') + chk('captions', 'Captions for sounds') + chk('touchLeft', 'Touch controls on the left') + chk('textures', 'Surface detail: boards and stone (off is faster)') +
          '<label class="opt"><span>Text size</span><input type="range" min="0.85" max="1.4" step="0.05" data-set="textSize" value="' + S.textSize + '"></label>' +
          '</div><div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('reset', 'Erase progress', undefined, 'danger') + '</div>';
      }
      default: return '';
    }
  }
  // over the title, its sub-screens open as dialogs: a panel over the middle of the view, over what is coming (TITLE),
  // which comes on behind it while it is open
  const DIALOGS = ['nights', 'settings', 'howto'];
  function show(kind, data) {
    current = { kind, data: data || {} };
    const ov = UI.overlay;
    const dlg = DIALOGS.includes(kind) && (current.data.from || 'title') === 'title' && G.state === 'title';
    // erasing progress asks first, in a small dialog of its own over Settings
    const confirm = kind === 'settings' && current.data.confirmReset ? '<div class="confirm"><div class="cpanel" role="alertdialog" aria-modal="true" aria-label="Erase all progress?"><h2>Erase all progress?</h2><p>Every night reached and every best time will be gone.</p><div class="mrow">' + btn('keep', 'Cancel') + btn('erase', 'Erase', undefined, 'danger') + '</div></div></div>' : '';
    showOverlay((dlg ? '<div class="panel ' + kind + 'p" role="dialog" aria-modal="true">' + html(kind, current.data) + '</div>' : html(kind, current.data)) + confirm);
    ov.classList.toggle('dlg', dlg);
    ov.classList.toggle('titlelow', kind === 'title' && TITLE.on);
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ensureAudio(); act(b.dataset.act, b.dataset.arg); }));
    ov.querySelectorAll('[data-set]').forEach(inp => {
      const stop = e => e.stopPropagation();
      inp.addEventListener('click', stop); inp.parentElement.addEventListener('click', stop);
      inp.addEventListener('input', () => { const v = inp.type === 'checkbox' ? inp.checked : parseFloat(inp.value); applySetting(inp.dataset.set, v); });
    });
    const box = ov.querySelector('.confirm');
    if (box) box.addEventListener('click', e => { e.stopPropagation(); if (e.target === box) act('keep'); });   // a click off the little dialog backs out of it
    const first = (box || ov).querySelector('button[data-act]');
    if (first && kind !== 'title') first.focus();
  }
  function applySetting(k, v) {
    SAVE.setSetting(k, v);
    if (k === 'muted') setMuted(v);
    else if (k === 'master' || k === 'effects' || k === 'ambient') AUDIO.setVolume(k, v);
    else if (k === 'textSize') document.documentElement.style.setProperty('--text-scale', v);
    else if (k === 'touchLeft') document.documentElement.toggleAttribute('data-touch-left', !!v);
    else if (k === 'textures') R.detail = !!v;
  }
  function applyAll() {
    const S = SAVE.data.settings;
    AUDIO.setVolume('master', S.master); AUDIO.setVolume('effects', S.effects); AUDIO.setVolume('ambient', S.ambient);
    document.documentElement.style.setProperty('--text-scale', S.textSize);
    document.documentElement.toggleAttribute('data-touch-left', !!S.touchLeft);
    R.detail = S.textures !== false;
  }
  function act(a, arg) {
    switch (a) {
      case 'begin': beginRun(); startLevel(0, true); break;
      case 'again': if (G.seed === null) G.runSeed = Date.now() % 1000000; beginRun(); startLevel(0, true); break;   // a new run: new layouts, unless the seed is fixed
      case 'continue': startLevel(G.unlocked, true); break;
      case 'nights': show('nights', { from: current && (current.kind === 'pause' ? 'pause' : current.kind === 'dead' ? 'dead' : current.kind === 'survived' ? 'survived' : 'title') }); break;
      case 'settings': show('settings', { from: arg || 'title' }); break;
      case 'howto': show('howto', { from: 'title' }); break;
      case 'resume': resumeGame(); break;
      case 'restart': restartLevel(); break;
      case 'retry': startLevel(G.levelIndex, false); break;
      case 'next': proceedFromSurvived(); break;
      case 'night': { const i = parseInt(arg, 10); if (i === 0) beginRun(); startLevel(i, true); break; }   // night 1 from the list begins a run; any other night breaks one, unless it is the one the run is on
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
        else if (from === 'dead') show('dead', G.deathScreen);
        else if (from === 'survived') show('survived', G.survivedScreen);
        else showTitle();
        break;
      }
      default: break;
    }
  }
  // arrow keys move between the buttons of the open menu; Esc backs out of a sub-screen
  function onKey(e) {
    if (!current) return false;
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
  return { show, act, onKey, applySetting, applyAll, get kind() { return current ? current.kind : null; }, clear() { current = null; } };
})();
