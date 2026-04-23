# Simple Pitch Counter — Change Log

All changes to `index.html` are documented here. Add this file to the project so Claude can reference it across chat threads.

---

## [2026-04-23] V2.3 — Quality-of-life features and native review prompts

**Files:** `index.html`, `ViewController.swift`, `MainActivity.kt`, `build.gradle.kts`, `project.pbxproj`

### New features
- **In-game name editing** — edit a pitcher or catcher's name and number mid-game from the Change picker via a pencil icon, without interrupting the game
- **Called Strike & Ball button mapping** — Advanced mode adds "Called Strike" and "Ball" as physical button options, letting coaches track specific pitch types hands-free like a traditional umpire dial
- **In-app review prompts** — automatically prompts users to rate the app after games 3, 10, and 25 using native StoreKit (iOS) and Google Play In-App Review API (Android)
- **Rate This App link** — added to the About screen for manual review access

### Improvements
- **Pitcher card layout** — game summary pitcher cards now show K/BB totals on a separate line in Advanced mode for better readability
- **Umpire feedback wording** — "Plate issues?" and "Base issues?" renamed to "Feedback?" with updated placeholder text
- **Export content** — game summary export now includes innings count, end time range, and updated feedback wording
- **History card start time** — game cards in history now show the start time alongside the date
- **Instant navigation** — removed View Transitions API fade effect for instant screen changes

### Testing & versioning
- Added 23 new E2E tests (`v2-features.spec.ts`) covering all v2.3 features
- Added version sync test (`version-sync.spec.ts`) enforcing version consistency across Android, iOS, and app UI (134 → 159 total tests)
- Version bumped to 2.3 across all three locations

---

## [2026-04-23] Android beta polish and website improvements

**Files:** `index.html`, `MainActivity.kt`, `website/index.html`, `website/android-beta.html`, `website/privacy.html`, `website/contact.html`, `website/feedback.html`, `marketing/beta-tester-email.html`, `docs/process/deployment.md`

### Android fixes
- **Status bar overlap** — inject native status bar height as `--top-inset` CSS variable directly from Kotlin, bypassing CSS `max()` for compatibility with older WebViews
- **Navigation bar overlap** — inject native nav bar height as `--bottom-inset` CSS variable so Start Game button and all bottom content clear the system nav bar
- **Header padding** — introduce `--header-pad` variable (20px on iOS, 8px on Android) to tighten gap between status bar and content on Android devices
- **Status bar text color** — add pre-API-30 fallback using `SYSTEM_UI_FLAG_LIGHT_STATUS_BAR` so status bar text switches to white on the dark game header on older devices
- **Adaptive icons** — replace legacy PNG launcher icons with adaptive icon (foreground + background layers) supporting circle, squircle, and rounded square launcher shapes

### Website improvements
- **Hamburger navigation** — added full-screen overlay menu to all 5 pages for mobile navigation
- **Clean URLs** — switched to directory-based URLs (e.g., `/android-beta/` instead of `/android-beta.html`) using Nginx subdirectory pattern
- **OG meta tags** — added Open Graph images (1200×630) and meta tags to all pages for link preview support; added `og:image:width`, `og:image:height`, and `twitter:image` for iMessage compatibility
- **Android beta page** — linked from homepage badge, form submits to PHP backend
- **Bottom whitespace** — fixed excess padding on mobile for homepage and beta page

### Email system
- **Confirmation emails** — all three PHP form handlers (contact, feedback, android-beta) now send branded HTML confirmation emails to submitters using table-based layout compatible with Gmail
- **Beta tester email template** — created Gmail-compatible onboarding email with setup steps, Play Store screenshot, and CTA button; updated to reflect improved Play Store listing (removed warning cards)

### Documentation
- Added Android deployment procedures to `docs/process/deployment.md`
- Added clean URL deployment pattern (dual-location SCP)

---

## [2026-04-19] Simple mode outs, mercy rule, UI refinements

**Files:** `index.html`, `ViewController.swift`, `website/index.html`

### Simple mode outs tracking
- **Outs in header** — out dots now display next to the inning pill in the dark header for both Simple and Advanced modes, with fielding team label shown below
- **+ Out button** — simple mode has an `+ Out` action alongside Undo and Next Batter, using link-style secondary buttons matching Advanced mode
- **3-out end-of-half** — accumulating 3 outs in simple mode triggers the same end-of-half confirmation modal as Advanced mode

### Mercy rule auto-prompt
- **Mercy modal** — when runs scored in a half inning reach the configured mercy limit, a confirmation modal prompts to end the half or continue playing
- **Either-team tracking** — mercy rule now tracks total runs by either team in the half inning (not just the batting team), preventing cases where scoring the fielding team didn't trigger the alert
- **`halfInningRuns` initialized** — game object now explicitly initializes `halfInningRuns: 0` at game creation

### UI fixes
- **Score button layout** — both teams now show `− score +` (minus left, plus right) instead of the previous mirrored layout
- **Pitch dot batter shading** — dots below the hero number alternate between darker and lighter gray per batter, making at-bat boundaries visible without separators; current batter's dots use the pitch count color
- **Alert spacing** — simple mode alerts area reserves a fixed `min-height` to prevent layout shift when warnings appear
- **Next batter button** — replaced broken big green button with link-style secondary buttons matching Advanced mode layout
- **Alerts position** — moved from below the hero card to below the pitcher section, matching Advanced mode placement

### Website updates
- Score buttons standardized (minus left, plus right for both teams)
- Fielding team label added below outs in mockup header
- `+ Out` added to secondary button row in mockup

### Test coverage
- Added 13 new E2E tests covering simple mode outs, mercy modal interactions, outs in header, fielding label, and umpire field clearing (78 → 91 total tests)

---

## [2026-04-19] V2 Redesign — Claude Design rebuild

**Files:** `index.html`, `ViewController.swift`

Complete UI/UX redesign built via Claude Design. V1 files archived to `app/V1/`.

### Visual overhaul
- **Dark scoreboard header** — persistent dark-themed header with large score display, inning pill (Top/Bot with color coding), and out-tracking dots for Advanced mode
- **iOS-native design language** — updated color palette using iOS system colors (`#1A6BFF` blue, `#34C759` green, `#FF3B30` red, `#FF9500` amber), SF-style rounded cards, and `#F2F2F7` system background
- **Status bar** — switched to light content (white text) to match the dark header
- **Hamburger menu** — replaced inline game controls with a dropdown menu (Quick stats, Game summary, Button mapping, Close, End game)

### New features
- **Advanced mode** — per-pitch type tracking with color-coded tap buttons for Ball (B), Called K (K̲), Swing K (K), Foul (F), and Ball in Play (⊙). Balls/strikes count and at-bat pitch sequence displayed with colored chips. Automatic walk/strikeout detection with result flash animations
- **Simple mode** — large hero pitch count with pitch dots visualization, at-bat counter, and single "+ Pitch" button
- **Game mode selection** — setup screen lets you choose Simple or Advanced before starting a game
- **Ball in play modal** — dark bottom sheet prompts Safe/Out after BIP; auto-detects third out and triggers side retired
- **Result flash overlays** — animated full-screen overlays for Strikeout, Walk, Out, Safe, and Side Retired events
- **Pitcher stats sheet** — dark bottom sheet with K/BB/BIP summary boxes and per-pitch-type breakdown bars with counts and percentages
- **Physical button mapping** — configurable mapping of iPhone volume buttons and Action Button (iPhone 15 Pro+) to pitch, undo, or next batter actions. Mapping persists in localStorage
- **Volume button capture** — `ViewController.swift` now uses AVAudioSession KVO to detect volume changes and dispatches them to JS via `window.onPhysicalButton()`. Hidden `MPVolumeView` suppresses system HUD. Includes debounce and auto-reset to 0.5
- **Button mapping UI** — in-game modal to configure physical button assignments with live preview hints on the game screen
- **Swipe-to-delete** — history cards support swipe-left gesture to reveal a delete button
- **Mode badges** — history cards show Simple/Advanced mode badge and LIVE indicator for active games
- **Pitch type breakdown in summaries** — game export includes per-pitcher pitch type counts and K/BB/BIP totals for Advanced mode games
- **View transitions** — uses `document.startViewTransition` API when available for smooth screen changes

### Architecture changes
- **ViewController.swift** — added `AVFoundation` and `MediaPlayer` imports; volume button observation via KVO; `MPVolumeView` extension for slider access; status bar style changed to `.lightContent`
- **Game state** — added `mode`, `balls`, `strikes`, `outs`, `atBatLog` fields; pitcher objects now include `pitchTypes`, `ks`, `bbs`, `bips` tracking
- **Button mapping state** — stored separately in `spc_btnmap` localStorage key

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
