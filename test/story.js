'use strict';
// The thread through the nights: the lamp is somewhere on every night before the last; the clock ticks for the
// first ten seconds of each; and no text before the bedroom (the last two nights) uses the words that would give it away.
const T = require('./lib');
const { check } = T;
(async () => {
  const { browser, page, errors } = await T.launch();
  await T.open(page, 'level=1&go');
  const n = await page.evaluate(() => LEVELS.length);
  const words = /\b(dream|dreams|dreamt|dreaming|sleep|sleeping|asleep|wake|woke|waking|awake|bed|bedroom|pillow|blanket)\b/i;
  for (let i = 0; i < n; i++) {
    const info = await page.evaluate(i => {
      const def = LEVELS[i], T = def.text || {};
      const words = [T.intro, T.hint, T.objective, T.win, T.fragment].concat(Object.values(T.death || {})).join(' | ');
      G.inv = []; G.difficulty = 1;
      const L = buildLevel(i);
      // the lamp is a sprite drawn by STORY.lamp: it is tagged by its draw function's source
      const lamps = L.props.filter(p => p.kind === 'sprite' && p.draw && /shadeD/.test(p.draw.toString())).length;
      if (L.onEnd) L.onEnd();
      return { id: def.id, words, lamps, ending: !!def.ending };
    }, i);
    if (i < n - 2) check(!words.test(info.words), 'night ' + (i + 1) + ' (' + info.id + '): its text never says the quiet part' + (words.test(info.words) ? ' (found: ' + info.words.match(words)[0] + ')' : ''));
    if (!info.ending) check(info.lamps >= 1, 'night ' + (i + 1) + ' (' + info.id + '): the lamp is somewhere in the room');
  }
  // the clock ticks for the first ten seconds of a night, then stops
  await page.goto(T.INDEX + '?level=3&go&seed=1&nofr'); await page.waitForTimeout(200);
  const ticks = await page.evaluate(() => {
    ensureAudio();
    let n = 0; const orig = AUDIO.sfx; AUDIO.sfx = (name, pan) => { if (name === 'tick') n++; return orig(name, pan); };
    for (let k = 0; k < 300; k++) G.step(0.05);
    const early = n; for (let k = 0; k < 200; k++) G.step(0.05);
    AUDIO.sfx = orig;
    return { early, late: n - early };
  });
  check(ticks.early >= 8 && ticks.early <= 11 && ticks.late === 0, 'the clock ticks about ten times in the first ten seconds and then stops (' + ticks.early + ' then ' + ticks.late + ')');
  await T.finish(browser, errors, 'story');
})();
