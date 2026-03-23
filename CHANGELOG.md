# Simple Pitch Counter — Change Log

All changes to `index.html` are documented here. Add this file to the project so Claude can reference it across chat threads.

---

## [2026-03-21] Bug Fix — History card missing over-limit pitchers

**File:** `index.html`
**Function:** `renderHistory()`

**Problem:** Pitchers whose pitch count exceeded the highest configured threshold (e.g. 54 pitches when max threshold is 50) were not appearing in the "Rest days required" section on history cards. The inline threshold loop used `break` on the first match, so pitchers above all thresholds never matched, `days` stayed `0`, and they were filtered out.

**Fix:** Replaced the inline loop with logic that explicitly handles the over-limit case — if a pitcher's count exceeds all thresholds, the highest `days` value from the config is used (minimum 2). This matches how the View Stats modal (`restInfo()`) already handled it correctly.

**Before:**
```js
const thr = (cfg?.thresholds || DEFAULT_THRESHOLDS).slice().sort((a, b) => a.pitches - b.pitches);
let days = 0;
for (const t of thr) { if (p.pitches <= t.pitches) { days = t.days; break; } }
if (days < 1) return null;
```

**After:**
```js
const ri = (() => {
  const cfg = state.configs.find(c => c.id === g.configId);
  const thresholds = (cfg?.thresholds || DEFAULT_THRESHOLDS).slice().sort((a, b) => a.pitches - b.pitches);
  for (const thr of thresholds) { if (p.pitches <= thr.pitches) return { days: thr.days }; }
  const maxDays = Math.max(...thresholds.map(t => t.days), 2);
  return { days: maxDays };
})();
if (ri.days < 1) return null;
```

---

## [2026-03-21] UI — White top bar on game screen

**File:** `index.html`
**Element:** `.game-top-bar` (CSS)

Changed the inning banner / hamburger top bar background from `#ebebe5` (grey) to `#ffffff` (white) with a `1.5px solid rgba(0,0,0,0.28)` border to match the card style.

---

## [2026-03-21] UI — Compact inline scoreboard

**File:** `index.html`
**Elements:** `.scoreboard` and related CSS classes; scoreboard HTML in `#screen-game`

Replaced the two-column stacked scoreboard (team name → big score → +/− buttons below) with a compact single-row layout:

- Both teams sit on one row inside a single card, separated by a `–` divider
- Each team: `−` button · team name (above) + score (below) · `+` button
- Score font reduced from 32px → 28px
- Removed `.sb-score-btns`; replaced with `.sb-adj-btn`, `.sb-team-inner`, `.sb-divider`
- Grid changed from `1fr 1fr` to `1fr auto 1fr`

---

## [2026-03-21] Feature — Edit pitcher and catcher name/number in-game

**File:** `index.html`
**Functions:** `editPitcher(i)`, `saveEditPitcher(i)`, `editCatcher(i)`, `saveEditCatcher(i)`; updated `renderPitcherSection()` and `renderCatcherSection()`

Added a pencil (✏) icon button to each player row in the Change Pitcher and Change Catcher list views. Tapping the icon opens a modal to edit that player's name and jersey number without closing the list or switching players. `event.stopPropagation()` prevents the row's select action from firing when the edit button is tapped.

---
