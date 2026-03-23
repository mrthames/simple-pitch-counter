# Go / No-Go Decision: Web App at simplepitchcounter.com

**Date:** March 2026
**Decision maker:** Justin Thames
**Status:** Go (conditional)

---

## Context

Simple Pitch Counter is currently iOS-only. Roughly half of youth baseball parents and coaches use Android. We've had multiple requests to make the app available on Android. Building a native Android app is a significant investment. The alternative: serve the existing web app (index.html) as a Progressive Web App at simplepitchcounter.com/app.

## Options Considered

### Option A: Build a native Android app
- **Pros:** Best performance, Play Store distribution, push notifications
- **Cons:** Separate codebase to maintain, 2-3 months of work, need to learn Android/Kotlin or use a cross-platform framework
- **Estimated effort:** 3 months

### Option B: Ship the web app as a PWA (recommended)
- **Pros:** Same codebase as iOS, works on any device, no app store review process, ships in weeks not months
- **Cons:** No push notifications (limited PWA support on iOS), slightly less "native" feel, can't be listed in Play Store without a wrapper
- **Estimated effort:** 2-3 weeks

### Option C: Do nothing
- **Pros:** No effort, focus stays on iOS
- **Cons:** Ignores half of potential users, limits growth

## Recommendation: Go with Option B

The app is already a single HTML file running in a WKWebView. The web version is essentially the same code served from a URL instead of bundled in an app. The effort is low and the reach is high.

### Conditions for Go
1. Offline support works reliably via service worker — the app must work at the field without signal
2. localStorage persistence is reliable across browser sessions
3. "Add to home screen" flow is tested on Chrome Android and Safari iOS
4. The website landing page clearly distinguishes "download the iOS app" from "use the web version"

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| localStorage cleared by browser | Medium | High — data loss | Add export/backup reminder after each game |
| PWA install flow confusing for non-technical users | Medium | Medium | Clear instructions on the website |
| Feature drift between iOS and web versions | Low (for now) | Medium | Same source file, deploy to both from one repo |

## Decision

**Go** — ship the web app as a PWA in Q3 2026 (Issue #5). Revisit native Android only if PWA adoption shows demand that the web version can't serve.

---

# Trade-off Document: Threshold Recording Logic

**Date:** March 2026
**Decision:** Record rest days based on the threshold crossed, not the actual final pitch count

## The Trade-off

When a pitcher crosses a rest-day threshold mid-batter (e.g., throws pitch #20 as the first pitch to a new batter, then throws 3 more to finish the at-bat ending at 23), the league rules say rest days are based on the threshold (20), not the actual count (23).

This creates a UX tension: the app shows "23 pitches" as the total but reports "0 rest days" — which looks wrong to anyone who doesn't know the threshold rule. A naive user would expect 23 pitches = 1 day rest (since 21-35 = 1 day).

## Options

### A: Show actual pitch count, calculate rest from threshold (chosen)
- Display: "23 pitches — 0 days rest (threshold: 20)"
- Pros: Accurate to what the league form requires, matches how the player agent records it
- Cons: Confusing on first encounter, requires explanation

### B: Show threshold count instead of actual
- Display: "20 pitches — 0 days rest"
- Pros: Numbers "make sense" together
- Cons: Incorrect — the league form asks for actual pitch count including last batter. Hiding the real number could cause disputes.

### C: Show both prominently
- Display: "23 pitches total (20 at threshold) — 0 days rest"
- Pros: Full transparency
- Cons: Cluttered, especially on a small phone screen mid-game

## Decision

**Option A** with contextual explanation. The game summary shows actual pitch count and pitches to last batter (matching the league form). The in-app rest-day display includes a parenthetical "(threshold: 20)" when the numbers would otherwise seem contradictory.

## Why

The league form is the source of truth. The app should match what the scorekeeper needs to report, not simplify it into something that's easier to read but technically wrong. The threshold note handles the confusion without hiding data.

This was validated by the EDHLL bylaws (Addendum 3, Section 15 Special Note) which explicitly describes this scenario and confirms rest is based on the threshold crossed, not the final count.
