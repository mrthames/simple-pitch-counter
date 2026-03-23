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
