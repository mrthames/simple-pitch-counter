# Simple Pitch Counter — Change Log

All changes to `index.html` are documented here. Add this file to the project so Claude can reference it across chat threads.

---

## [2026-05-03] V2.48 — Homepage hero line break

**Files:** `website/index.html`

### Polish
- **Forced line break in hero headline** — `Track every pitch. Every game.` was wrapping inconsistently depending on viewport width; replaced the space between sentences with `<br>` so "Every game." always sits below "Track every pitch.", regardless of device size

### Versioning
- Version bumped to 2.48 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.47 — OG image refresh: real screenshots, balanced layout

**Files:** `marketing/og-image.html`, `marketing/finals/og-image-1200x630.png`, `website/images/og-image-1200x630.png`

### Branding
- **OG image phones now show real screenshots** — replaced broken `finals/01-advanced-mode-screen.png` and `finals/02-simple-mode-screen.png` paths with `screen-04-advanced.png` and `screen-02-simple.png` (which actually exist in `marketing/`). Front phone shows simple mode (the priority feature for new users), back phone shows advanced.
- **Phones nudged left** — `.phones { right: 10px → 80px }` so the device cluster sits more comfortably away from the right edge

### Versioning
- Version bumped to 2.47 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.46 — Website logo update + restored OG image

**Files:** `website/*.html`, `website/favicon.png`, `website/apple-touch-icon.png`, `website/images/og-image-1200x630.png`, `scripts/generate-icons.mjs`, `marketing/finals/og-image-1200x630.png`

### Branding
- **Website favicon and Apple Touch icon** — replaced the old generic baseball SVG and the "P on navy" Apple Touch icon with the new blue-S mark, generated from the same source PNG used for iOS/Android
- **Nav logo across all 12 site pages** — swapped the CSS-pseudo-element baseball next to "Simple Pitch Counter" for an `<img>` tag pointing at the new favicon, so every page header reflects the actual brand mark
- **Open Graph image restored** — `website/images/og-image-1200x630.png` was referenced by `index.html` but missing from the repo, breaking link previews on iMessage / Slack / Twitter / Facebook. Re-rendered from the existing `marketing/og-image.html` template (which already pulls from the iOS app icon, so it picks up the new blue S automatically) and copied into the website's images folder. Android-beta OG image refreshed too.

### Tooling
- `scripts/generate-icons.mjs` extended to also output `website/favicon.png` (32×32) and `website/apple-touch-icon.png` (180×180). One source PNG → all 19 platform/web asset files.
- Removed `website/favicon.svg` and `website/favicon.ico` (replaced by PNG; modern browsers prefer the PNG-icon link tag)

### Versioning
- Version bumped to 2.46 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.45 — Blue S app icon, plus iOS dark-mode variant

**Files:** `marketing/logo/`, `scripts/generate-icons.mjs`, `app/Assets.xcassets/AppIcon.appiconset/`, `android/app/src/main/res/mipmap-*/`, `build.gradle.kts`, `project.pbxproj`

### Branding
- **Light icon updated** — primary mark switched from red S to **blue S** (matches the in-app dark-header navy `#0b1c3a`). Same baseball motif, opaque white background.
- **iOS dark-mode icon added** — red S on dark grey, swapped automatically when iOS appearance is set to dark
- Source assets in `marketing/logo/` updated to the new blue-S light + red-S dark PNGs (4267×4267); old red-S light source removed
- Android does not have a system-level dark icon, so the blue-S variant is used everywhere on Android

### Tooling
- `scripts/generate-icons.mjs` now reads from two source PNGs and writes both iOS variants (`icon_1024x1024.png` and `icon_1024x1024_dark.png`) plus a Contents.json that registers the dark appearance
- Added `*.psd` to `.gitignore`

### Versioning
- Version bumped to 2.45 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.44 — New app icon

**Files:** `marketing/logo/`, `scripts/generate-icons.mjs`, `app/Assets.xcassets/AppIcon.appiconset/`, `android/app/src/main/res/mipmap-*/`, `build.gradle.kts`, `project.pbxproj`

### Branding
- **New app icon** — red "S" + baseball mark replaces the old icon across iOS and Android. Source assets stored in `marketing/logo/`. iOS universal icon at 1024×1024; Android adaptive foreground + legacy + round at all five density buckets (mdpi → xxxhdpi).
- Adaptive icon background color updated to match the in-app dark theme (`#0b1c3a`)
- Removed iOS dark/tinted icon variants (only universal icon remains)

### Tooling
- New `scripts/generate-icons.mjs` regenerates every iOS/Android icon asset from a single source PNG. Run with `node scripts/generate-icons.mjs` whenever the logo changes.

### Versioning
- Version bumped to 2.44 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.43 — HBP counts as walk; HBP added to pitcher list export

**Files:** `app/index.html`, `android/app/src/main/assets/index.html`, `build.gradle.kts`, `project.pbxproj`, `tests/v2-features.spec.ts`
**Issues:** #141, #142

### Bug fixes
- **HBP now increments BB hero count** (#141) — recording a hit-by-pitch now bumps both the pitcher's `bbs` (walks) and `hbps` counters so the BB (Walks) hero in the stats overlay reflects the runner reaching base. HBP remains tracked separately as its own stat line.

### Improvements
- **Pitcher-list export image now shows K · BB · HBP per pitcher** (#142) — the shared multi-pitcher card rendered via `renderPitcherListCardToCanvas` now surfaces the K/BB/HBP line below team/IP/last-batter info. Individual stats card already included HBP from V2.42.

### Testing & versioning
- Updated existing HBP-vs-walks test to assert BB increments (was: BB stays 0)
- Added 3 tests: BB hero shows 1 after HBP, pitcher-list canvas renders, and stats card statLineHtml includes HBP
- Version bumped to 2.43 across iOS, Android, and the in-app About page

---

## [2026-05-03] V2.42 — Hit By Pitch and game clock UX fixes

**Files:** `app/index.html`, `android/app/src/main/assets/index.html`, `build.gradle.kts`, `project.pbxproj`, `tests/v2-features.spec.ts`
**Issues:** #136, #137, #138, #139

### New features
- **Hit By Pitch (HBP) button** (#136) — new `+ HBP` action button next to `+ Out` in both simple and advanced game modes. Records as a ball on the pitch breakdown, advances to next batter (walk semantics for inning logic), and tracks HBP as its own pitcher stat alongside K/BB. HBP appears in the live stats line and on the share/export card.
- **Pause confirmation modal** (#139) — tapping a running game clock now shows a confirmation modal ("Pause game clock?") before stopping it. Starting and resuming a paused clock remain single-tap (no modal).

### Bug fixes
- **Hamburger menu now closes after toggling game clock** (#137) — fixed event-bubbling bug where `.menu-btn` parent re-toggled the menu open after the child item handler closed it. The menu-btn handlers now ignore clicks bubbled up from `.hbg-item` children.
- **Game clock rolls over to hours past 60 min** (#138) — `fmtClock()` now switches from `MM:SS` to `H:MM:SS` once elapsed time reaches 1 hour. Affects the live game-header clock, history-card live chip, and any other consumer of `fmtClock`.

### Testing & versioning
- Added 22 E2E tests covering HBP behavior, hamburger close, hour formatting, and pause modal flow
- Updated existing pause test to handle the new confirmation modal
- Version bumped to 2.42 across iOS (`MARKETING_VERSION`), Android (`versionName`), and the in-app About page

---

## [2026-04-26] V2.41 — Pitch acronym labels, game clock, batch bug fixes, and marketing refresh

**Files:** `index.html`, `ViewController.swift`, `build.gradle.kts`, `project.pbxproj`, `website/index.html`, `marketing/screenshots.html`, `marketing/capture.mjs`
**Issues:** #94–#103, #105–#111, #112–#118, #119–#127

### New features
- **Game clock** — live elapsed time clock starts when a game begins, visible during gameplay and on history cards; toggleable from the hamburger menu; auto-stops when the game ends; persists across app reloads
- **Text acronym pitch labels** — pitch breakdown bars across all views (live stats, game summary, summary overlay, history detail) now use clear text labels (B, CS, SS, F, BIP) instead of SVG icons
- **Pitch breakdown legend** — advanced mode stats views show a legend: "B = Ball · CS = Called Strike · SS = Swing Strike · F = Foul · BIP = Ball in Play" on live stats, summary overlay, and history detail
- **Inline stat descriptions** — stat rows (P, IP, BF, K/BB, P/IP, P/BF) include inline descriptions explaining each metric
- **Removed redundant K/BB rows** — strikeouts and walks removed from stat rows since they already appear as hero boxes

### Bug fixes (issues #94–#127)
- Fixed pitch buttons not highlighting on tap
- Fixed stats overlay not scrolling on smaller screens
- Fixed undo sometimes skipping the previous pitch type
- Fixed catcher inning count not updating after pitcher change
- Fixed summary export missing pitcher rest day info
- Fixed game setup not saving field selection
- Fixed mercy rule modal appearing at wrong threshold
- Fixed at-bat count resetting incorrectly on undo
- Fixed button mapping not reloading on game resume
- Fixed history card badges wrapping team names
- Fixed shareable stats card pitch breakdown showing SVG markup instead of text
- Unified button mapping options across simple and advanced modes

### Website updates
- Updated hero and button mapping phone mockups to match V2.41 app design (inning scoreboard, inline Stats link, catcher section)
- Added SVG baseball favicon to all 12 pages
- Removed old favicon.ico fallback

### Marketing
- Updated marketing slides from 7 to 8 (added league configuration, replaced live scoreboard with advanced game mode)
- All 8 slides now include composited simulator screenshots inside phone frames
- Created seed data script (`app/seed-screenshots.js`) for generating realistic simulator screenshots

### Testing & versioning
- Added 48 new E2E tests (183 → 231 total)
- v2-features spec grew from 47 to 95 tests covering batch fixes, game clock, and acronym labels
- Version bumped to 2.41 (build 129) across iOS, Android, and app UI

---

## [2026-04-25] V2.4 — Scoreboard improvements and game logic

**Files:** `index.html`, `.gitignore`
**Issues:** #87, #88, #89, #90, #91, #92

### New features
- **Inning scoreboard** — live inning-by-inning scoreboard in the game header showing team abbreviations, per-inning runs, and R total column
- **Editable inning cells** — tap past inning cells to correct scores; team totals recalculate automatically with undo support
- **9-inning auto end-game** — prompts to end the game after 9 innings when the score is not tied; "Continue playing" allows extra innings when tied
- **Inning scoreboard in history** — game history cards show the full inning-by-inning scoreboard instead of basic score pill
- **Inning scoreboard on share card** — pitcher list share/export image includes the inning scoreboard below the score line

### Improvements
- **Scoreboard alignment** — team name labels now vertically align with number rows via explicit height/flex rules
- **Stats link position** — moved "Stats ›" from the pitcher name row to next to the "PITCHER" section label for better discoverability in both modes
- **Android asset tracking** — `android/app/src/main/assets/index.html` is now tracked in git instead of gitignored, ensuring `git pull` delivers the latest app to Android Studio builds

### Testing
- Added 9 new E2E tests for scoreboard improvements (159 → 183 total tests, but see V2.4a below)

---

## [2026-04-23] V2.4a — Bug fixes, pitcher stats list, and inning scoreboard

**Files:** `index.html`, `ViewController.swift`, `build.gradle.kts`, `project.pbxproj`
**Issues:** #79, #80, #81, #82, #83, #84, #85

### New features
- **Pitcher stats list** — "Stats ›" now opens a pitcher list first with pitch counts and rest info; tap any pitcher to drill into individual stats with back navigation
- **Inning scoreboard** — live inning-by-inning scoreboard added to the game view with team abbreviations and R total column

### Improvements
- **Button mapping per mode** — simple mode shows only Pitch/Undo/Next Batter options; advanced mode shows Called Strike/Ball/Undo/Next Batter/Out (no generic "Pitch")
- **Alert messages** — removed redundant pitch count from approaching/over/can't-catch alerts since the count is already visible in the header
- **Summary dividers** — shortened export dividers to fit on an iPhone screen without line wrapping
- **Umpire name capitalization** — auto-capitalizes first letter after spaces in umpire name fields on both setup and summary screens
- **Pitcher card layout** — advanced mode pitcher cards in game summary show K/BB totals on a separate line
- **Umpire feedback wording** — "Plate issues?" and "Base issues?" renamed to "Feedback?" with updated placeholders
- **Volume button reliability** — iOS volume button capture hardened with UISlider recovery mechanism

### Testing & versioning
- Added 15 new E2E tests for issues #79-#85 (134 → 159 total tests, then 24 more added for existing features = 183 total)
- Version bumped to 2.4 across iOS, Android, and app UI

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
