'use strict';
// ---------- menus: title, pause, death, survived, nights, settings. Real buttons, keyboard navigable ----------
const MENU = (() => {
  let current = null;
  const fmtTime = t => t === null || t === undefined ? '—' : (Math.round(t) + ' s');
  function btn(act, label, arg, cls) { return '<button type="button" class="mbtn' + (cls ? ' ' + cls : '') + '" data-act="' + act + '"' + (arg !== undefined ? ' data-arg="' + arg + '"' : '') + '>' + label + '</button>'; }
  function html(kind, d) {
    d = d || {};
    const S = SAVE.data.settings;
    switch (kind) {
      case 'title': {
        const unlocked = G.unlocked;
        const diffs = '<div class="diffs">' + DIFFICULTIES.map((x, i) => '<button type="button" class="diff' + (i === G.difficulty ? ' sel' : '') + '" data-diff="' + i + '"><span class="key">' + (i + 1) + '</span>' + x.name + '<small>' + x.desc + '</small></button>').join('') + '</div>';
        return '<div class="kicker">A short horror game</div><h1 class="big">IT\'S COMING</h1>' +
          '<p class="intro">Something is coming straight at you from a long way off. Every time you look away and look back, it is closer.<br>You have to look away to find what will keep it out.</p>' +
          '<div class="controls"><div><b>← →</b> turn (8 directions)</div><div><b>↑ ↓</b> look ahead / look down</div><div><b>hold Shift</b> zoom in</div><div><b>click</b> pick up, place, use</div><div><b>R</b> restart the night</div><div><b>Esc</b> pause &nbsp; <b>M</b> mute</div></div>' +
          diffs +
          '<div class="mrow">' + btn('begin', 'Begin') + (unlocked > 0 && unlocked < LEVELS.length ? btn('continue', 'Continue &middot; night ' + (unlocked + 1)) : '') + btn('nights', 'Nights') + btn('settings', 'Settings', 'title') + '</div>' +
          '<p class="fine">Headphones recommended. Sound is synthesized in your browser.</p>';
      }
      case 'pause':
        return '<h1>Paused</h1><p class="intro">It is not.</p><div class="mcol">' + btn('resume', 'Resume') + btn('restart', 'Start the night over') + btn('nights', 'Nights') + btn('settings', 'Settings', 'pause') + btn('title', 'Back to the title') + '</div><p class="fine">Esc resumes</p>';
      case 'dead':
        return '<h1 class="red">It got you</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('retry', 'Try that night again') + btn('nights', 'Nights') + btn('title', 'Back to the title') + '</div>' + (G.debug || G.diff().tier >= 3 ? '<p class="fine">seed ' + G.runSeed + '</p>' : '');
      case 'survived':
        return '<div class="kicker">' + d.title + '</div><h1>You survived</h1><p class="intro">' + d.text + '</p><div class="mcol">' + btn('next', 'The next night') + btn('nights', 'Nights') + '</div>';
      case 'nights': {
        const diff = G.diff(), unlocked = G.unlocked;
        let rows = '';
        for (let i = 0; i < LEVELS.length; i++) {
          const def = LEVELS[i], b = (SAVE.data.best[def.id] || {});
          if (i <= unlocked) {
            const times = SAVE.DIFFS.map(k => b[k] && b[k].wins ? '<span class="bt"><small>' + k + '</small>' + fmtTime(b[k].time) + '</span>' : '').join('');
            rows += '<div class="nrow">' + btn('night', (i + 1) + '. ' + def.title, i, 'nbtn') + '<span class="times">' + times + '</span></div>';
          } else rows += '<div class="nrow locked"><span class="nlock">' + (i + 1) + '. &hellip;</span></div>';
        }
        const complete = SAVE.data.complete && SAVE.data.complete[diff.id] ? '<p class="fine">Every night survived on ' + diff.name + '.</p>' : '';
        return '<div class="kicker">Nights &middot; ' + diff.name + '</div><h1>Nights</h1><div class="nights">' + rows + '</div>' + complete + '<div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('fragments', 'Fragments', d.from || 'title') + '</div>';
      }
      case 'fragments': {
        // the odd sentence at the end of each survived night, collected; unread ones stay blank
        let rows = '';
        for (let i = 0; i < LEVELS.length; i++) {
          const def = LEVELS[i]; if (!(def.text && def.text.fragment)) continue; // the last night has no fragment: it has the morning
          const seen = SAVE.data.fragments.includes(def.id);
          rows += '<div class="frag' + (seen ? '' : ' unseen') + '"><span class="fn">' + (i + 1) + '.</span> ' + (seen ? '<em>' + def.text.fragment + '</em>' : '<span class="fdots">&hellip;</span>') + '</div>';
        }
        return '<div class="kicker">Fragments</div><h1>What was left in the morning</h1><div class="frags">' + rows + '</div><div class="mrow">' + btn('nights', 'Back') + '</div>';
      }
      case 'settings': {
        const chk = (k, label) => '<label class="opt"><input type="checkbox" data-set="' + k + '"' + (S[k] ? ' checked' : '') + '> ' + label + '</label>';
        const rng = (k, label) => '<label class="opt"><span>' + label + '</span><input type="range" min="0" max="1" step="0.05" data-set="' + k + '" value="' + S[k] + '"></label>';
        return '<h1>Settings</h1><div class="settings">' +
          rng('master', 'Volume') + rng('effects', 'Effects') + rng('ambient', 'Ambience') + chk('muted', 'Mute') +
          chk('reducedFlash', 'Reduce flashing (softer red pulse, dimmer flashes)') + chk('reducedMotion', 'Reduce motion (no jitter or sway)') + chk('captions', 'Captions for sounds') + chk('touchLeft', 'Touch controls on the left') + chk('textures', 'Surface detail: boards and stone (off is faster)') +
          '<label class="opt"><span>Text size</span><input type="range" min="0.85" max="1.4" step="0.05" data-set="textSize" value="' + S.textSize + '"></label>' +
          '</div><div class="mrow">' + btn('back', 'Back', d.from || 'title') + btn('reset', d.confirmReset ? 'Really erase all progress?' : 'Erase progress', undefined, 'danger') + '</div>';
      }
      default: return '';
    }
  }
  function show(kind, data) {
    current = { kind, data: data || {} };
    showOverlay(html(kind, current.data));
    const ov = UI.overlay;
    ov.querySelectorAll('button[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); ensureAudio(); act(b.dataset.act, b.dataset.arg); }));
    ov.querySelectorAll('[data-set]').forEach(inp => {
      const stop = e => e.stopPropagation();
      inp.addEventListener('click', stop); inp.parentElement.addEventListener('click', stop);
      inp.addEventListener('input', () => { const v = inp.type === 'checkbox' ? inp.checked : parseFloat(inp.value); applySetting(inp.dataset.set, v); });
    });
    const first = ov.querySelector('button[data-act]');
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
      case 'begin': startLevel(0, true); break;
      case 'continue': startLevel(G.unlocked, true); break;
      case 'nights': show('nights', { from: current && (current.kind === 'fragments' ? current.data.from : current.kind === 'pause' ? 'pause' : current.kind === 'dead' ? 'dead' : current.kind === 'survived' ? 'survived' : 'title') }); break;
      case 'settings': show('settings', { from: arg || 'title' }); break;
      case 'fragments': show('fragments', { from: arg || 'title' }); break;
      case 'resume': resumeGame(); break;
      case 'restart': restartLevel(); break;
      case 'retry': startLevel(G.levelIndex, false); break;
      case 'next': proceedFromSurvived(); break;
      case 'night': startLevel(parseInt(arg, 10), true); break;
      case 'title': showTitle(); break;
      case 'reset': if (current.data.confirmReset) { SAVE.reset(); G.difficulty = 1; setMuted(false); applyAll(); showTitle(); } else show('settings', Object.assign({}, current.data, { confirmReset: true })); break;
      case 'back': {
        const from = arg || 'title';
        if (from === 'title') showTitle();
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
    const btns = [...UI.overlay.querySelectorAll('button[data-act], button.diff, input[data-set]')]; // sliders and checkboxes are in the ring too
    if (!btns.length) return false;
    const idx = btns.indexOf(document.activeElement);
    const f = document.activeElement; // the control keeps the keys it uses: Space ticks a box, left and right move a slider
    if (f && f.tagName === 'INPUT' && (k === ' ' || (f.type === 'range' && (k === 'ArrowLeft' || k === 'ArrowRight')))) return false;
    if (k === 'ArrowDown' || k === 'ArrowRight' || k === 's' || k === 'd' || k === 'Tab' && !e.shiftKey) { e.preventDefault(); btns[(idx + 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'ArrowUp' || k === 'ArrowLeft' || k === 'w' || k === 'a' || k === 'Tab' && e.shiftKey) { e.preventDefault(); btns[(idx - 1 + btns.length) % btns.length].focus(); return true; }
    if (k === 'Escape' && current.kind === 'fragments') { act('nights'); return true; }
    if (k === 'Escape' && (current.kind === 'nights' || current.kind === 'settings')) { act('back', current.data.from); return true; }
    if (k === 'Enter' && idx >= 0) return true;   // the focused button handles it
    return false;
  }
  return { show, act, onKey, applySetting, applyAll, get kind() { return current ? current.kind : null; }, clear() { current = null; } };
})();
