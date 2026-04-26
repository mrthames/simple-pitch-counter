// =============================================================
// Simple Pitch Counter — Screenshot Seed Data
// Paste this entire script into the browser console to populate
// localStorage with realistic test data for App Store screenshots.
// =============================================================

(function () {
  'use strict';

  // ── Helpers ──

  let idCounter = Date.now();
  function nextId() { return idCounter++; }

  /** Pick a random item from an array */
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /**
   * Build an advanced-mode pitcher with a realistic history.
   * @param {string} name
   * @param {string} num       jersey number (string)
   * @param {number} totalPitches  target total pitches
   * @param {boolean[]} innings  which innings this pitcher was active
   * @param {number[][]} atBats  array of at-bat definitions, each is an
   *   array of pitch-type strings for that at-bat
   */
  function mkAdvancedPitcher(name, num, innings, atBats) {
    const history = [];
    const batterBreaks = [];
    const pitchTypes = { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 };
    let ks = 0, bbs = 0, bips = 0;

    for (const ab of atBats) {
      for (const p of ab) {
        history.push(p);
        pitchTypes[p]++;
      }
      batterBreaks.push(ab.length);

      // Determine outcome from last pitch
      const last = ab[ab.length - 1];
      if (last === 'BIP') bips++;
      // Check for strikeout: 3 strikes in the AB
      const strikes = ab.filter(p => p === 'CS' || p === 'SS').length;
      if (strikes >= 3) ks++;
      // Check for walk: 4 balls in the AB
      const balls = ab.filter(p => p === 'B').length;
      if (balls >= 4) bbs++;
    }

    return {
      name,
      num,
      pitches: history.length,
      innings,
      history,
      batterBreaks,
      currentBatterPitches: 0,
      done: true,
      lastBatterPitches: batterBreaks.length ? batterBreaks[batterBreaks.length - 1] : 0,
      pitchTypes,
      ks,
      bbs,
      bips,
    };
  }

  /**
   * Build a simple-mode pitcher (every pitch is "P", pitchTypes all zeros).
   */
  function mkSimplePitcher(name, num, totalPitches, innings, numAtBats) {
    const history = [];
    const batterBreaks = [];

    // Distribute pitches across at-bats
    let remaining = totalPitches;
    for (let i = 0; i < numAtBats; i++) {
      const isLast = i === numAtBats - 1;
      const avg = Math.round(remaining / (numAtBats - i));
      const count = isLast ? remaining : Math.min(Math.max(2, avg + Math.floor(Math.random() * 3) - 1), remaining);
      for (let j = 0; j < count; j++) history.push('P');
      batterBreaks.push(count);
      remaining -= count;
    }

    return {
      name,
      num,
      pitches: history.length,
      innings,
      history,
      batterBreaks,
      currentBatterPitches: 0,
      done: true,
      lastBatterPitches: batterBreaks.length ? batterBreaks[batterBreaks.length - 1] : 0,
      pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
      ks: 0,
      bbs: 0,
      bips: 0,
    };
  }

  // ── At-bat builders (advanced mode) ──
  // These produce realistic pitch sequences for various outcomes.

  /** Strikeout: ends with 3rd strike (CS or SS), possibly with balls/fouls mixed in */
  function abStrikeout() {
    const seq = [];
    let s = 0;
    const len = 3 + Math.floor(Math.random() * 4); // 3-6 pitches
    while (seq.length < len - 1 || s < 2) {
      if (s >= 2 && seq.length >= len - 1) break;
      const r = Math.random();
      if (r < 0.35) { seq.push('B'); }
      else if (r < 0.55) { seq.push('CS'); s++; if (s >= 3) { return seq; } }
      else if (r < 0.70) { seq.push('F'); if (s < 2) s++; }
      else { seq.push('SS'); s++; if (s >= 3) { return seq; } }
    }
    // Finish with a swinging or called strike
    seq.push(Math.random() < 0.5 ? 'SS' : 'CS');
    return seq;
  }

  /** Walk: ends with 4th ball */
  function abWalk() {
    const seq = [];
    let b = 0;
    const len = 4 + Math.floor(Math.random() * 3); // 4-6 pitches
    while (seq.length < len - 1 || b < 3) {
      if (b >= 3 && seq.length >= len - 1) break;
      const r = Math.random();
      if (r < 0.5) { seq.push('B'); b++; if (b >= 4) return seq; }
      else if (r < 0.7) { seq.push('CS'); }
      else if (r < 0.85) { seq.push('F'); }
      else { seq.push('SS'); }
    }
    seq.push('B');
    return seq;
  }

  /** Ball in play: ends with BIP, some pitches before */
  function abBIP() {
    const seq = [];
    const len = 1 + Math.floor(Math.random() * 5); // 1-5 pitches before BIP
    for (let i = 0; i < len; i++) {
      const r = Math.random();
      if (r < 0.35) seq.push('B');
      else if (r < 0.55) seq.push('CS');
      else if (r < 0.75) seq.push('F');
      else seq.push('SS');
    }
    seq.push('BIP');
    return seq;
  }

  /** Generic at-bat that may end in any outcome */
  function abGeneric() {
    const r = Math.random();
    if (r < 0.25) return abStrikeout();
    if (r < 0.40) return abWalk();
    return abBIP();
  }

  // ── Config ──

  const config = {
    id: 'default',
    name: 'Little League (Majors)',
    pitchMax: 85,
    catcherInnMax: 4,
    mercyRuns: 5,
    pitchCatchLim: 41,
    mercyGame: 0,
    maxInnings: 6,
    isDefault: true,
    thresholds: [
      { pitches: 20, days: 0 },
      { pitches: 35, days: 1 },
      { pitches: 50, days: 2 },
      { pitches: 65, days: 3 },
      { pitches: 85, days: 4 },
    ],
  };

  // ────────────────────────────────────────────────────────
  // GAME 1 — Completed Advanced: Mets @ Yankees (7-4 Yankees)
  // ────────────────────────────────────────────────────────

  // Away (Mets) pitchers — they are fielding when home (Yankees) bat
  // Lucas Rivera #14: ~35 pitches, innings 1-3
  const riveraABs = [
    // Inning 1 (bot): Yankees score 2
    abBIP(),                        // single
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
    abBIP(),                        // sac fly RBI
    abStrikeout(),                  // K
    // Inning 2 (bot): Yankees score 0
    abBIP(),                        // ground out
    abStrikeout(),                  // K
    abBIP(),                        // fly out
    // Inning 3 (bot): Yankees score 3
    abWalk(),                       // walk
    abBIP(),                        // double RBI
    abBIP(),                        // single RBI
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
  ];
  const lucasRivera = mkAdvancedPitcher('Lucas Rivera', '14',
    [true, true, true, false, false, false], riveraABs);

  // Dylan Orozco #22: ~28 pitches, innings 4-6
  const orozcoABs = [
    // Inning 4 (bot): Yankees score 1
    abBIP(),                        // ground out
    abWalk(),                       // walk
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
    // Inning 5 (bot): Yankees score 0
    abStrikeout(),                  // K
    abBIP(),                        // fly out
    abBIP(),                        // ground out
    // Inning 6 (bot): Yankees score 1
    abBIP(),                        // double
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
  ];
  const dylanOrozco = mkAdvancedPitcher('Dylan Orozco', '22',
    [false, false, false, true, true, true], orozcoABs);

  // Home (Yankees) pitchers — they are fielding when away (Mets) bat
  // Ethan Kim #7: ~42 pitches, innings 1-4
  const kimABs = [
    // Inning 1 (top): Mets score 0
    abStrikeout(),                  // K
    abBIP(),                        // ground out
    abBIP(),                        // fly out
    // Inning 2 (top): Mets score 1
    abBIP(),                        // single
    abBIP(),                        // double RBI
    abStrikeout(),                  // K
    abBIP(),                        // fly out
    // Inning 3 (top): Mets score 2
    abWalk(),                       // walk
    abBIP(),                        // single
    abBIP(),                        // single RBI
    abBIP(),                        // sac fly RBI
    abStrikeout(),                  // K
    // Inning 4 (top): Mets score 0
    abBIP(),                        // ground out
    abStrikeout(),                  // K
    abBIP(),                        // fly out
  ];
  const ethanKim = mkAdvancedPitcher('Ethan Kim', '7',
    [true, true, true, true, false, false], kimABs);

  // Caleb Nguyen #18: ~20 pitches, innings 5-6
  const nguyenABs = [
    // Inning 5 (top): Mets score 1
    abBIP(),                        // single
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
    abBIP(),                        // fly out
    // Inning 6 (top): Mets score 0
    abStrikeout(),                  // K
    abBIP(),                        // ground out
    abBIP(),                        // fly out
  ];
  const calebNguyen = mkAdvancedPitcher('Caleb Nguyen', '18',
    [false, false, false, false, true, true], nguyenABs);

  const yesterdayEvening = new Date();
  yesterdayEvening.setDate(yesterdayEvening.getDate() - 1);
  yesterdayEvening.setHours(19, 32, 0, 0);

  const game1 = {
    id: nextId(),
    date: '4/25/2026',
    time: '6:00 PM',
    field: 'Field 3',
    homeTeam: 'Yankees',
    awayTeam: 'Mets',
    mode: 'advanced',
    inning: 6,
    isTop: false,
    homeScore: 7,
    awayScore: 4,
    balls: 0,
    strikes: 0,
    outs: 3,
    atBatLog: [],
    halfInningRuns: 1,
    inningRuns: [
      { top: 0, bot: 2 },
      { top: 1, bot: 0 },
      { top: 2, bot: 3 },
      { top: 0, bot: 1 },
      { top: 1, bot: 0 },
      { top: 0, bot: 1 },
    ],
    home: {
      pitchers: [ethanKim, calebNguyen],
      catchers: [{ name: 'Marcus Davis', num: '5', innings: [true, true, true, true, true, true] }],
    },
    away: {
      pitchers: [lucasRivera, dylanOrozco],
      catchers: [{ name: 'Jayden Torres', num: '9', innings: [true, true, true, true, true, true] }],
    },
    homeActivePIdx: 1,
    awayActivePIdx: 1,
    homeActiveCIdx: 0,
    awayActiveCIdx: 0,
    pSelectOpen: false,
    cSelectOpen: false,
    snapshots: [],
    hrHome: '',
    hrAway: '',
    umpPlateName: 'Mike Henderson',
    umpPlateIssue: 'No',
    umpPlateComments: '',
    umpBaseName: 'Carlos Ruiz',
    umpBaseIssue: 'No',
    umpBaseComments: '',
    configId: 'default',
    endedAt: yesterdayEvening.toISOString(),
    clockEnabled: true,
    clockElapsed: 5412000, // ~90 min 12 sec
    clockRunning: false,
    clockStartedAt: null,
    division: 'Little League (Majors)',
  };

  // ────────────────────────────────────────────────────────
  // GAME 2 — Live Advanced: Red Sox @ Cubs (top 3, 1 out)
  //   Cubs (home) lead 3-2
  // ────────────────────────────────────────────────────────

  // Away (Red Sox) pitcher — fields when Cubs bat (bot halves)
  // "Noah Bennett" #15: pitched innings 1-2 for away side (fielding bot of 1 & 2)
  const bennettABs = [
    // Bot 1: Cubs score 2
    abBIP(),                        // single
    abBIP(),                        // double RBI
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
    abBIP(),                        // fly out
    // Bot 2: Cubs score 1
    abWalk(),                       // walk
    abBIP(),                        // single RBI
    abStrikeout(),                  // K
    abBIP(),                        // ground out DP
  ];
  const noahBennett = mkAdvancedPitcher('Noah Bennett', '15',
    [true, true], bennettABs);
  noahBennett.done = false;
  noahBennett.currentBatterPitches = 0;

  // Home (Cubs) pitcher — fields when Red Sox bat (top halves)
  // "Ryan Cooper" #11: pitched top of 1, top of 2, currently in top of 3
  // The current at-bat has 3 pitches: B, CS, B (tracked in game.atBatLog)
  const cooperABs = [
    // Top 1: Red Sox score 1
    abBIP(),                        // single
    abStrikeout(),                  // K
    abBIP(),                        // single RBI
    abBIP(),                        // ground out
    // Top 2: Red Sox score 1
    abBIP(),                        // double
    abBIP(),                        // sac fly RBI
    abStrikeout(),                  // K
    abBIP(),                        // fly out
  ];
  const ryanCooper = mkAdvancedPitcher('Ryan Cooper', '11',
    [true, true, true], cooperABs);
  // Add the 3 current at-bat pitches to his totals
  ryanCooper.history.push('B', 'CS', 'B');
  ryanCooper.pitches += 3;
  ryanCooper.pitchTypes.B += 2;
  ryanCooper.pitchTypes.CS += 1;
  ryanCooper.currentBatterPitches = 3;
  ryanCooper.done = false;

  const game2 = {
    id: nextId(),
    date: '4/26/2026',
    time: '4:00 PM',
    field: 'Field 1',
    homeTeam: 'Cubs',
    awayTeam: 'Red Sox',
    mode: 'advanced',
    inning: 3,
    isTop: true,
    homeScore: 3,
    awayScore: 2,
    balls: 2,
    strikes: 1,
    outs: 1,
    atBatLog: ['B', 'CS', 'B'],
    halfInningRuns: 0,
    inningRuns: [
      { top: 1, bot: 2 },
      { top: 1, bot: 1 },
    ],
    home: {
      pitchers: [ryanCooper],
      catchers: [{ name: 'Liam Morales', num: '12', innings: [true, true, true] }],
    },
    away: {
      pitchers: [noahBennett],
      catchers: [{ name: 'Jake Sullivan', num: '8', innings: [true, true, true] }],
    },
    homeActivePIdx: 0,
    awayActivePIdx: 0,
    homeActiveCIdx: 0,
    awayActiveCIdx: 0,
    pSelectOpen: false,
    cSelectOpen: false,
    snapshots: [],
    hrHome: '',
    hrAway: '',
    umpPlateName: 'David Park',
    umpPlateIssue: 'No',
    umpPlateComments: '',
    umpBaseName: 'Steve Martin',
    umpBaseIssue: 'No',
    umpBaseComments: '',
    configId: 'default',
    clockEnabled: true,
    clockElapsed: 0,
    clockRunning: true,
    clockStartedAt: Date.now() - 2400000, // 40 min ago
    division: 'Little League (Majors)',
  };

  // ────────────────────────────────────────────────────────
  // GAME 3 — Completed Simple: Cardinals @ Tigers (5-3 Tigers)
  // ────────────────────────────────────────────────────────

  // Away (Cardinals) pitcher — fields when Tigers bat
  const cardsPitcher = mkSimplePitcher('Aiden Brooks', '3', 52,
    [true, true, true, true, true, true], 18);

  // Home (Tigers) pitcher — fields when Cardinals bat
  const tigersPitcher = mkSimplePitcher('Mason Harper', '21', 48,
    [true, true, true, true, true, true], 17);

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  twoDaysAgo.setHours(19, 5, 0, 0);

  const game3 = {
    id: nextId(),
    date: '4/24/2026',
    time: '5:30 PM',
    field: 'Field 2',
    homeTeam: 'Tigers',
    awayTeam: 'Cardinals',
    mode: 'simple',
    inning: 6,
    isTop: false,
    homeScore: 5,
    awayScore: 3,
    balls: 0,
    strikes: 0,
    outs: 3,
    atBatLog: [],
    halfInningRuns: 0,
    inningRuns: [
      { top: 0, bot: 1 },
      { top: 1, bot: 2 },
      { top: 0, bot: 0 },
      { top: 2, bot: 1 },
      { top: 0, bot: 0 },
      { top: 0, bot: 1 },
    ],
    home: {
      pitchers: [tigersPitcher],
      catchers: [{ name: 'Tyler Reed', num: '10', innings: [true, true, true, true, true, true] }],
    },
    away: {
      pitchers: [cardsPitcher],
      catchers: [{ name: 'Brandon Cole', num: '6', innings: [true, true, true, true, true, true] }],
    },
    homeActivePIdx: 0,
    awayActivePIdx: 0,
    homeActiveCIdx: 0,
    awayActiveCIdx: 0,
    pSelectOpen: false,
    cSelectOpen: false,
    snapshots: [],
    hrHome: '',
    hrAway: '',
    umpPlateName: 'Tom Garcia',
    umpPlateIssue: 'No',
    umpPlateComments: '',
    umpBaseName: 'Jim Walker',
    umpBaseIssue: 'No',
    umpBaseComments: '',
    configId: 'default',
    endedAt: twoDaysAgo.toISOString(),
    clockEnabled: true,
    clockElapsed: 4860000, // ~81 min
    clockRunning: false,
    clockStartedAt: null,
    division: 'Little League (Majors)',
  };

  // ── Assemble state ──

  const state = {
    currentGame: game2,           // live game
    games: [game1, game3],        // completed games (newest first)
    configs: [config],
    activeConfigId: 'default',
    fields: ['Field 1', 'Field 2', 'Field 3'],
  };

  // ── Validation (console warnings) ──

  function validate(label, pitcher) {
    const h = pitcher.history.length;
    const p = pitcher.pitches;
    const pt = pitcher.pitchTypes;
    const ptSum = pt.B + pt.CS + pt.SS + pt.F + pt.BIP;
    const bbSum = pitcher.batterBreaks.reduce((a, b) => a + b, 0) + pitcher.currentBatterPitches;

    if (h !== p) console.warn(label + ': history.length (' + h + ') !== pitches (' + p + ')');
    if (ptSum !== p) console.warn(label + ': pitchTypes sum (' + ptSum + ') !== pitches (' + p + ')');
    if (bbSum !== p) console.warn(label + ': batterBreaks sum (' + bbSum + ') !== pitches (' + p + ')');
    if (pt.BIP !== pitcher.bips) console.warn(label + ': BIP mismatch');
  }

  // Validate advanced pitchers
  validate('G1 Lucas Rivera', lucasRivera);
  validate('G1 Dylan Orozco', dylanOrozco);
  validate('G1 Ethan Kim', ethanKim);
  validate('G1 Caleb Nguyen', calebNguyen);
  validate('G2 Ryan Cooper', ryanCooper);
  validate('G2 Noah Bennett', noahBennett);

  // Validate inningRuns sums
  function validateScore(label, game) {
    const topSum = game.inningRuns.reduce((a, r) => a + r.top, 0);
    const botSum = game.inningRuns.reduce((a, r) => a + r.bot, 0);
    if (topSum !== game.awayScore) console.warn(label + ': top runs sum (' + topSum + ') !== awayScore (' + game.awayScore + ')');
    if (botSum !== game.homeScore) console.warn(label + ': bot runs sum (' + botSum + ') !== homeScore (' + game.homeScore + ')');
  }

  validateScore('Game 1', game1);
  validateScore('Game 2', game2);
  validateScore('Game 3', game3);

  // ── Write to localStorage and reload ──

  localStorage.setItem('spc_btnmap_simple', JSON.stringify({ volUp: 'P', volDown: 'UNDO' }));
  localStorage.setItem('spc_btnmap_advanced', JSON.stringify({ volUp: 'B', volDown: 'UNDO' }));
  localStorage.setItem('spc_v1', JSON.stringify(state));

  console.log('Seed data written. Reloading...');
  console.log('  Game 1 (completed advanced): Mets @ Yankees, 4-7');
  console.log('  Game 2 (live advanced):      Red Sox @ Cubs, top 3, 2-1 count, 1 out');
  console.log('  Game 3 (completed simple):   Cardinals @ Tigers, 3-5');

  location.reload();
})();
