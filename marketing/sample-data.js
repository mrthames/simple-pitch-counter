// Sample data for App Store screenshots
// Usage: Open Safari Web Inspector on the Simulator,
//        paste this into the Console, then reload the app.
//
// Layout:
//   currentGame = Advanced mode live game (Braves vs Giants, Top 4th)
//   games[0]    = Completed: Braves 8 vs Cardinals 5 (Advanced, 4/16)
//   games[1]    = Completed: Phillies 7 vs Braves 9 (Simple, 4/13)
//   games[2]    = Completed: Braves 3 vs Dodgers 2 (Advanced, 4/10)
//   games[3]    = LIVE: Cubs 3 vs Braves 5 (Simple, 4/8) — scrolled off

const sampleState = {
  currentGame: {
    id: 1713550800000,
    date: "4/19/2026",
    time: "10:00 AM",
    field: "Riverside Park",
    homeTeam: "Braves",
    awayTeam: "Giants",
    mode: "advanced",
    inning: 4, isTop: true,
    homeScore: 6, awayScore: 4,
    balls: 1, strikes: 2, outs: 1,
    atBatLog: ["B","CS","SS"],
    halfInningRuns: 0,
    home: {
      pitchers: [
        {
          name: "Sam T.", num: "5",
          pitches: 38, innings: ["1T","2T","3T"],
          history: [
            "CS","B","SS","BIP",
            "B","B","CS","SS","SS",
            "CS","F","B","BIP",
            "B","CS","F","F","SS",
            "B","B","B","B",
            "CS","SS","BIP",
            "B","CS","BIP",
            "CS","F","B","CS","F","BIP",
            "B","CS","SS"
          ],
          batterBreaks: [4,9,13,18,22,25,28,35],
          currentBatterPitches: 3,
          done: false, lastBatterPitches: 0,
          pitchTypes: { B: 13, CS: 9, SS: 6, F: 4, BIP: 6 },
          ks: 3, bbs: 2, bips: 6
        }
      ],
      catchers: [{ name: "Ryan M.", num: "12", innings: ["1T","2T","3T"] }]
    },
    away: {
      pitchers: [
        {
          name: "Jake R.", num: "11",
          pitches: 42, innings: ["1B","2B","3B"],
          history: [
            "B","CS","F","SS",
            "CS","B","BIP",
            "B","B","B","B",
            "CS","SS","CS",
            "B","F","F","BIP",
            "CS","F","B","BIP",
            "B","CS","F","F","SS",
            "CS","B","BIP",
            "B","B","CS","SS","SS",
            "B","CS","F","BIP",
            "CS","SS"
          ],
          batterBreaks: [4,7,11,14,19,22,28,31,36,40],
          currentBatterPitches: 2,
          done: false, lastBatterPitches: 0,
          pitchTypes: { B: 13, CS: 10, SS: 6, F: 7, BIP: 6 },
          ks: 3, bbs: 1, bips: 6
        }
      ],
      catchers: [{ name: "Tyler K.", num: "8", innings: ["1B","2B","3B"] }]
    },
    homeActivePIdx: 0, homeActiveCIdx: 0,
    awayActivePIdx: 0, awayActiveCIdx: 0,
    pSelectOpen: false, cSelectOpen: false,
    snapshots: [],
    hrHome: "Cole B. (2nd)", hrAway: "",
    umpPlateName: "D. Johnson", umpPlateIssue: "No", umpPlateComments: "",
    umpBaseName: "M. Williams", umpBaseIssue: "No", umpBaseComments: "",
    configId: "default"
  },
  games: [
    // ── Completed: Braves 8, Cardinals 5 (Advanced, 4/16) ──
    {
      id: 1713291600000,
      date: "4/16/2026",
      time: "6:00 PM",
      field: "Memorial Field",
      homeTeam: "Braves",
      awayTeam: "Cardinals",
      mode: "advanced",
      inning: 6, isTop: false,
      homeScore: 8, awayScore: 5,
      balls: 0, strikes: 0, outs: 3,
      atBatLog: [],
      halfInningRuns: 0,
      endedAt: 1713304200000,
      home: {
        pitchers: [
          {
            name: "Sam T.", num: "5",
            pitches: 47, innings: ["1T","2T","3T","4T"],
            history: [
              "B","CS","F","SS",
              "CS","B","BIP",
              "B","B","B","B",
              "CS","F","SS","CS",
              "B","F","BIP",
              "CS","B","BIP",
              "B","CS","F","F","SS",
              "CS","B","BIP",
              "B","B","CS","SS","SS",
              "B","CS","F","BIP",
              "CS","B","F","SS",
              "B","CS","BIP",
              "B","B","CS"
            ],
            batterBreaks: [4,7,11,15,18,21,27,30,36,40,44,47],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 3,
            pitchTypes: { B: 16, CS: 12, SS: 6, F: 6, BIP: 7 },
            ks: 4, bbs: 2, bips: 7
          },
          {
            name: "Eli W.", num: "22",
            pitches: 18, innings: ["5T","6T"],
            history: [
              "CS","B","SS",
              "B","F","BIP",
              "CS","B","B","B","B",
              "CS","F","SS","CS",
              "B","CS","BIP"
            ],
            batterBreaks: [3,6,11,15,18],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 3,
            pitchTypes: { B: 6, CS: 5, SS: 2, F: 2, BIP: 3 },
            ks: 2, bbs: 1, bips: 3
          }
        ],
        catchers: [{ name: "Ryan M.", num: "12", innings: ["1T","2T","3T","4T","5T","6T"] }]
      },
      away: {
        pitchers: [
          {
            name: "Noah L.", num: "3",
            pitches: 49, innings: ["1B","2B","3B","4B"],
            history: Array(49).fill("CS"),
            batterBreaks: [5,10,15,20,25,30,36,41,46,49],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 3,
            pitchTypes: { B: 16, CS: 12, SS: 8, F: 5, BIP: 8 },
            ks: 4, bbs: 3, bips: 8
          },
          {
            name: "Max C.", num: "7",
            pitches: 21, innings: ["5B","6B"],
            history: Array(21).fill("CS"),
            batterBreaks: [4,9,14,18,21],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 3,
            pitchTypes: { B: 7, CS: 5, SS: 4, F: 2, BIP: 3 },
            ks: 2, bbs: 1, bips: 3
          }
        ],
        catchers: [{ name: "Ben S.", num: "14", innings: ["1B","2B","3B","4B","5B","6B"] }]
      },
      homeActivePIdx: 1, homeActiveCIdx: 0,
      awayActivePIdx: 1, awayActiveCIdx: 0,
      pSelectOpen: false, cSelectOpen: false,
      snapshots: [],
      hrHome: "Cole B. (3rd)", hrAway: "Noah L. (5th)",
      umpPlateName: "R. Garcia", umpPlateIssue: "No", umpPlateComments: "",
      umpBaseName: "T. Smith", umpBaseIssue: "No", umpBaseComments: "",
      configId: "default"
    },
    // ── Completed: Phillies 7, Braves 9 (Simple, 4/13) ──
    {
      id: 1713032400000,
      date: "4/13/2026",
      time: "11:00 AM",
      field: "Oakwood Diamond",
      homeTeam: "Phillies",
      awayTeam: "Braves",
      mode: "simple",
      inning: 6, isTop: false,
      homeScore: 7, awayScore: 9,
      balls: 0, strikes: 0, outs: 3,
      atBatLog: [],
      halfInningRuns: 0,
      endedAt: 1713045000000,
      home: {
        pitchers: [
          {
            name: "Drew P.", num: "18",
            pitches: 44, innings: ["1T","2T","3T","4T"],
            history: [],
            batterBreaks: [6,11,16,21,27,32,38,44],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 6,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          },
          {
            name: "Liam H.", num: "9",
            pitches: 22, innings: ["5T","6T"],
            history: [],
            batterBreaks: [5,9,14,18,22],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 4,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          }
        ],
        catchers: [{ name: "Aiden K.", num: "6", innings: ["1T","2T","3T","4T","5T","6T"] }]
      },
      away: {
        pitchers: [
          {
            name: "Eli W.", num: "22",
            pitches: 35, innings: ["1B","2B","3B"],
            history: [],
            batterBreaks: [4,9,14,19,24,29,35],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 6,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          },
          {
            name: "Sam T.", num: "5",
            pitches: 28, innings: ["4B","5B","6B"],
            history: [],
            batterBreaks: [5,10,15,20,24,28],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 4,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          }
        ],
        catchers: [{ name: "Ryan M.", num: "12", innings: ["1B","2B","3B","4B","5B","6B"] }]
      },
      homeActivePIdx: 1, homeActiveCIdx: 0,
      awayActivePIdx: 1, awayActiveCIdx: 0,
      pSelectOpen: false, cSelectOpen: false,
      snapshots: [],
      hrHome: "", hrAway: "Cole B. (1st)",
      umpPlateName: "K. Brown", umpPlateIssue: "No", umpPlateComments: "",
      umpBaseName: "S. Martinez", umpBaseIssue: "No", umpBaseComments: "",
      configId: "default"
    },
    // ── Completed: Braves 3, Dodgers 2 (Advanced, 4/10) ──
    {
      id: 1712773200000,
      date: "4/10/2026",
      time: "5:30 PM",
      field: "Riverside Park",
      homeTeam: "Braves",
      awayTeam: "Dodgers",
      mode: "advanced",
      inning: 6, isTop: false,
      homeScore: 3, awayScore: 2,
      balls: 0, strikes: 0, outs: 3,
      atBatLog: [],
      halfInningRuns: 0,
      endedAt: 1712785800000,
      home: {
        pitchers: [
          {
            name: "Cole B.", num: "1",
            pitches: 48, innings: ["1T","2T","3T","4T","5T"],
            history: [
              "CS","B","SS","BIP",
              "B","CS","F","SS",
              "CS","B","BIP",
              "B","B","B","B",
              "CS","SS","CS",
              "B","F","BIP",
              "CS","B","BIP",
              "B","CS","F","F","SS",
              "CS","B","BIP",
              "B","B","CS","SS","SS",
              "B","CS","F","BIP",
              "CS","B","F","SS",
              "B","CS","BIP"
            ],
            batterBreaks: [4,8,11,15,18,21,24,30,33,39,43,47,48],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 1,
            pitchTypes: { B: 16, CS: 13, SS: 7, F: 5, BIP: 7 },
            ks: 5, bbs: 2, bips: 7
          },
          {
            name: "Sam T.", num: "5",
            pitches: 12, innings: ["6T"],
            history: [
              "CS","B","SS",
              "B","F","BIP",
              "CS","B","B","B","B",
              "CS"
            ],
            batterBreaks: [3,6,11],
            currentBatterPitches: 1,
            done: true, lastBatterPitches: 1,
            pitchTypes: { B: 5, CS: 3, SS: 1, F: 1, BIP: 2 },
            ks: 1, bbs: 1, bips: 2
          }
        ],
        catchers: [{ name: "Ryan M.", num: "12", innings: ["1T","2T","3T","4T","5T","6T"] }]
      },
      away: {
        pitchers: [
          {
            name: "Lucas M.", num: "15",
            pitches: 50, innings: ["1B","2B","3B","4B","5B","6B"],
            history: Array(50).fill("B"),
            batterBreaks: [5,9,14,19,24,29,33,38,43,47,50],
            currentBatterPitches: 0,
            done: true, lastBatterPitches: 3,
            pitchTypes: { B: 16, CS: 12, SS: 8, F: 6, BIP: 8 },
            ks: 5, bbs: 3, bips: 8
          }
        ],
        catchers: [{ name: "Owen R.", num: "4", innings: ["1B","2B","3B","4B","5B","6B"] }]
      },
      homeActivePIdx: 1, homeActiveCIdx: 0,
      awayActivePIdx: 0, awayActiveCIdx: 0,
      pSelectOpen: false, cSelectOpen: false,
      snapshots: [],
      hrHome: "", hrAway: "",
      umpPlateName: "D. Johnson", umpPlateIssue: "No", umpPlateComments: "",
      umpBaseName: "R. Garcia", umpBaseIssue: "No", umpBaseComments: "",
      configId: "default"
    },
    // ── LIVE: Cubs 3, Braves 5 (Simple, 4/8) — at bottom, scrolled off ──
    {
      id: 1712600400000,
      date: "4/8/2026",
      time: "4:00 PM",
      field: "Lincoln Fields",
      homeTeam: "Braves",
      awayTeam: "Cubs",
      mode: "simple",
      inning: 3, isTop: false,
      homeScore: 5, awayScore: 3,
      balls: 0, strikes: 0, outs: 1,
      atBatLog: [],
      halfInningRuns: 2,
      home: {
        pitchers: [
          {
            name: "Cole B.", num: "1",
            pitches: 28, innings: ["1T","2T","3T"],
            history: [],
            batterBreaks: [4,9,13,18,22,28],
            currentBatterPitches: 0,
            done: false, lastBatterPitches: 0,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          }
        ],
        catchers: [{ name: "Ryan M.", num: "12", innings: ["1T","2T","3T"] }]
      },
      away: {
        pitchers: [
          {
            name: "Ethan D.", num: "10",
            pitches: 32, innings: ["1B","2B"],
            history: [],
            batterBreaks: [5,10,15,19,24,29,32],
            currentBatterPitches: 3,
            done: false, lastBatterPitches: 0,
            pitchTypes: { B: 0, CS: 0, SS: 0, F: 0, BIP: 0 },
            ks: 0, bbs: 0, bips: 0
          }
        ],
        catchers: [{ name: "Jack W.", num: "21", innings: ["1B","2B"] }]
      },
      homeActivePIdx: 0, homeActiveCIdx: 0,
      awayActivePIdx: 0, awayActiveCIdx: 0,
      pSelectOpen: false, cSelectOpen: false,
      snapshots: [],
      hrHome: "", hrAway: "",
      umpPlateName: "T. Smith", umpPlateIssue: "No", umpPlateComments: "",
      umpBaseName: "K. Brown", umpBaseIssue: "No", umpBaseComments: "",
      configId: "default"
    }
  ],
  configs: [
    {
      id: "default",
      name: "Minors 9/10",
      pitchMax: 50,
      catcherInnMax: 4,
      mercyRuns: 5,
      isDefault: true,
      thresholds: [
        { pitches: 20, days: 0 },
        { pitches: 35, days: 1 },
        { pitches: 50, days: 2 }
      ]
    },
    {
      id: "majors",
      name: "Majors 11/12",
      pitchMax: 85,
      catcherInnMax: 4,
      mercyRuns: 0,
      isDefault: false,
      thresholds: [
        { pitches: 20, days: 0 },
        { pitches: 35, days: 1 },
        { pitches: 50, days: 2 },
        { pitches: 65, days: 3 },
        { pitches: 85, days: 4 }
      ]
    }
  ],
  activeConfigId: "default",
  fields: ["Riverside Park", "Memorial Field", "Oakwood Diamond", "Lincoln Fields"]
};

localStorage.setItem('spc_v1', JSON.stringify(sampleState));
console.log('✅ Sample data loaded. Reload the app to see it.');
console.log('');
console.log('Current game: Braves 6 vs Giants 4, Top 4th (Advanced)');
console.log('History:');
console.log('  1. Braves 8 vs Cardinals 5 — completed (Advanced, 4/16)');
console.log('  2. Phillies 7 vs Braves 9 — completed (Simple, 4/13)');
console.log('  3. Braves 3 vs Dodgers 2 — completed (Advanced, 4/10)');
console.log('  4. Cubs 3 vs Braves 5 — LIVE (Simple, 4/8) — scrolled off');
console.log('');
console.log('Configs: Minors 9/10 (50 max, mercy 5), Majors 11/12 (85 max, no mercy)');
console.log('Fields: Riverside Park, Memorial Field, Oakwood Diamond, Lincoln Fields');
