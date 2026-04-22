# Technical Documentation: Simple Pitch Counter

**Last updated:** 2026-04-21

---

## Architecture Overview

Simple Pitch Counter is a native iOS application built on a **hybrid architecture**: a thin UIKit shell wrapping a full-featured single-page web application rendered inside a `WKWebView`.

```
┌──────────────────────────────────────────────────┐
│  iOS Native Layer (UIKit / Swift)                │
│  ┌────────────────────────────────────────────┐  │
│  │  AppDelegate.swift                         │  │
│  │  - Window creation                         │  │
│  │  - Root view controller assignment         │  │
│  └────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────┐  │
│  │  ViewController.swift                      │  │
│  │  - WKWebView setup & configuration         │  │
│  │  - WKNavigationDelegate (link routing)     │  │
│  │  - WKUIDelegate (alert/confirm/prompt)     │  │
│  │  - WKScriptMessageHandler (haptic bridge)  │  │
│  │  - Orientation lock (portrait)             │  │
│  └────────────────────────────────────────────┘  │
│                        │                         │
│                   WKWebView                      │
│                        │                         │
│  ┌────────────────────────────────────────────┐  │
│  │  index.html (Web Application Layer)        │  │
│  │  ┌──────────┐ ┌──────────┐ ┌───────────┐  │  │
│  │  │   CSS    │ │   HTML   │ │JavaScript │  │  │
│  │  │  Styles  │ │  Screens │ │   Logic   │  │  │
│  │  └──────────┘ └──────────┘ └───────────┘  │  │
│  │           localStorage (persistence)       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

### Why This Architecture?

1. **Rapid iteration** — UI changes ship by editing one HTML file, no Xcode rebuild cycle for styling/logic changes
2. **Single-file deployment** — the entire app UI is `index.html`, bundled into the iOS app
3. **Offline-first** — no server dependencies; `localStorage` handles all persistence
4. **Future portability** — the same `index.html` can run as a progressive web app in a browser

---

## Project Structure

```
simple-pitch-counter/
├── app/                            # iOS application
│   ├── index.html                  # Complete web app (HTML + CSS + JS)
│   ├── AppDelegate.swift           # UIKit app lifecycle
│   ├── ViewController.swift        # WKWebView config + native bridges
│   ├── Assets.xcassets/            # App icon, accent color
│   ├── Little League Pitch Counter.xcodeproj/
│   └── Little-League-Pitch-Counter-Info.plist
├── website/                        # Marketing site (simplepitchcounter.com)
├── docs/                           # Documentation
│   ├── technical/                  # This file — architecture & dev docs
│   ├── user-guide/                 # End-user documentation
│   ├── product/                    # PRD, personas, competitive analysis
│   ├── process/                    # Deployment, workflows, onboarding
│   ├── portfolio/                  # Case study
│   └── stories/                    # User stories
├── scripts/                        # Build/deploy automation
├── .github/                        # GitHub Actions workflows
├── CHANGELOG.md                    # Version history
├── CONTRIBUTING.md                 # Contributor guidelines
└── README.md                       # Project overview
```

---

## Native Layer

### AppDelegate.swift

Minimal `@main` entry point. Creates a `UIWindow` and sets `ViewController` as the root:

```swift
@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(_:didFinishLaunchingWithOptions:) -> Bool {
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = ViewController()
        window?.makeKeyAndVisible()
        return true
    }
}
```

No `SceneDelegate` — uses the legacy single-window model for simplicity.

### ViewController.swift

The core native controller. Responsibilities:

| Concern | Implementation |
|---------|---------------|
| WebView setup | `WKWebView` with persistent `WKWebsiteDataStore.default()` for localStorage survival across launches |
| JavaScript support | `WKWebpagePreferences.allowsContentJavaScript = true` |
| Link routing | `WKNavigationDelegate` — file URLs load in-app; `http`/`https` open Safari; `mailto` opens Mail |
| Native dialogs | `WKUIDelegate` — maps `window.alert()`, `confirm()`, `prompt()` to `UIAlertController` |
| Haptic feedback | `WKScriptMessageHandler` — bridges JS `haptic()` calls to `UIImpactFeedbackGenerator` |
| Orientation | Locked to portrait via `supportedInterfaceOrientations` |
| Scroll behavior | `scrollView.bounces = false` — removes rubber-band for native feel |

### Haptic Feedback Bridge

The native-to-web haptic bridge uses `WKScriptMessageHandler`:

**Swift side** — registers a message handler and dispatches to pre-warmed generators:

```swift
config.userContentController.add(self, name: "haptic")
```

Supported haptic types: `light`, `medium`, `heavy`, `success`, `warning`, `error`, `selection`.

**JavaScript side** — a thin wrapper that fails silently outside WKWebView:

```javascript
function haptic(type) {
  try { window.webkit?.messageHandlers?.haptic?.postMessage(type || 'medium'); } catch(e) {}
}
```

**Haptic mapping by interaction:**

| Action | Haptic Type | Rationale |
|--------|-------------|-----------|
| Pitch tap | `light` (escalates to `warning`/`error` near limit) | Frequent action; should be subtle but confirm registration |
| Next batter | `medium` | Marks a meaningful game event |
| Undo | `light` | Corrective action; subtle confirmation |
| Score +/- | `selection` | Small tick feedback for adjustments |
| Pitcher/catcher change | `selection` | Selection confirmation |
| End half inning | `success` | Major game milestone |

---

## Web Application Layer (index.html)

The entire UI lives in a single `index.html` file, structured as:

### CSS (lines 9-205)

- **CSS custom properties** on `:root` for theming (`--bg`, `--text`, `--border`, `--radius`)
- **Component classes** — `.btn`, `.card`, `.alert`, `.modal-overlay`, `.scoreboard`, `.hero`, etc.
- **SF Symbol-style SVG icons** — all icons are inline SVGs using `currentColor` for automatic color inheritance
- **View Transition API** — `::view-transition-old`/`::view-transition-new` pseudo-elements for screen navigation animations
- **Micro-animations** — `count-pop`, `count-down`, `score-bump` keyframes for number changes
- **Safe area support** — `env(safe-area-inset-top)` for notch/Dynamic Island

### HTML Screens (lines 200-440)

Seven screen divs, toggled via `.active` class:

| Screen ID | Purpose |
|-----------|---------|
| `screen-setup` | New game form — date, teams, config, opening pitcher/catcher |
| `screen-game` | Live game — scoreboard, pitch counting, pitcher/catcher management |
| `screen-summary` | Post-game data entry — home runs, last-batter pitches, umpire notes |
| `screen-export` | Generated summary text with copy/email actions |
| `screen-history` | Game list with swipe-to-delete, resume, and stats access |
| `screen-config` | League configuration presets and field list management |
| `screen-about` | App info, version, links (website, privacy, feedback, support) |

### JavaScript Logic (lines 441-1614)

#### State Management

All app state lives in a single `state` object persisted to `localStorage`:

```javascript
let state = {
  currentGame: null,    // Active game object (null when no game in progress)
  games: [],            // Completed/paused game history
  configs: [],          // League configuration presets
  activeConfigId: null, // Currently selected config
  fields: []            // Saved field name list
};
```

- **Storage key:** `edhll_v9` (versioned for migration support)
- **Migration:** Reads from `edhll_v8` on first load if no v9 data exists
- **Auto-save:** `pagehide` event saves current game to `games[]` so it appears as LIVE/resumable

#### Game Object Structure

```javascript
{
  id: 1711234567890,      // Timestamp-based ID
  date: "3/23/2026",      // Display date
  time: "5:30 PM",        // Game time
  field: "Field 3",       // Field name
  homeTeam: "Eagles",     // Team names
  awayTeam: "Hawks",
  inning: 3,              // Current inning
  isTop: true,            // Top/bottom of inning
  homeScore: 4,           // Scores
  awayScore: 2,
  home: {                 // Home roster
    pitchers: [{ name, num, pitches, currentBatterPitches, innings, history, batterBreaks, lastBatterPitches, done }],
    catchers: [{ name, num, innings }]
  },
  away: { ... },          // Away roster (same structure)
  homeActivePIdx: 0,      // Active pitcher/catcher indices
  awayActivePIdx: 0,
  homeActiveCIdx: 0,
  awayActiveCIdx: null,
  globalUndo: [],         // Undo stack (max 60 entries)
  configId: "default"     // Which config was used for this game
}
```

#### Undo System

The undo stack stores typed actions:

- `{ type: 'pitch', side, pIdx }` — decrements pitch and batter counts
- `{ type: 'nextBatter', side, pIdx, prevBatterPitches }` — restores previous batter pitch count
- `{ type: 'scoreAdj', side, prev }` — restores previous score value

Stack is capped at 60 entries. Cleared on manual pitch count edit (since edits make prior undos unreliable).

#### Configuration System

Each config preset defines:

```javascript
{
  id: "cfg_123",
  name: "Minors 9/10",
  pitchMax: 75,              // Maximum pitches per game
  catcherInnMax: 4,          // Catcher inning limit
  thresholds: [              // Pitch → rest-day mapping
    { pitches: 20, days: 0 },
    { pitches: 40, days: 1 },
    { pitches: 65, days: 2 },
    { pitches: 75, days: 3 }
  ],
  catcherThresholds: [       // Catcher restrictions
    { innings: 4, note: "Cannot pitch remainder of day" }
  ],
  isDefault: true
}
```

#### Screen Transitions

Uses the View Transition API (Safari 18+) with graceful fallback:

```javascript
function showScreen(n) {
  const go = () => { /* DOM toggle + screen-specific init */ };
  if (document.startViewTransition) {
    document.startViewTransition(go);
  } else {
    go();
  }
}
```

---

## Data Flow

```
User taps "Pitch" button
        │
        ▼
  addPitch()
        │
        ├─ Increment pitcher.pitches and pitcher.currentBatterPitches
        ├─ Push to undo stack
        ├─ saveState() → localStorage.setItem('edhll_v9', ...)
        ├─ renderPitcherSection() → update DOM (hero count, alerts, batter count)
        ├─ animateCount('pop') → CSS scale animation on hero number
        └─ haptic('light') → WKScriptMessageHandler → UIImpactFeedbackGenerator
```

---

## Build & Deployment

### Prerequisites

- **Xcode 16+** (Swift 5.0, iOS 16.2+ deployment target)
- **Apple Developer account** for App Store submission
- No external package dependencies (no CocoaPods, SPM, or Carthage)

### Building

1. Open `app/Little League Pitch Counter.xcodeproj` in Xcode
2. Select a physical device or simulator target
3. Build and run (Cmd+R)

The `index.html` is included in the Xcode project's bundle resources and loaded at runtime by `ViewController.swift`.

### App Store Submission

1. Archive the project (Product > Archive)
2. Upload to App Store Connect via Xcode Organizer
3. Configure metadata, screenshots, and submit for review

### Website

Hosted on Synology NAS via Web Station. Deploy by copying `website/` contents to the web root.

---

## Testing

### Automated E2E Tests

The project has **134 Playwright E2E tests** across 8 spec files, run on every push and PR to `main` via GitHub Actions (`test.yml`).

| Spec file | Tests | Coverage |
|-----------|-------|----------|
| `core-game-flow` | 20 | Game lifecycle, scoring, outs (both modes), undo, persistence |
| `advanced-mode` | 21 | Pitch types, BSO count, BIP modal, auto-advance, non-pitch outs |
| `thresholds-alerts` | 18 | Rest days, pitch limits, mercy rule modal, at-bat warnings |
| `pitcher-catcher` | 11 | Roster management, mid-game switches, inning tracking |
| `summary-export` | 19 | Game summary, umpire data, report generation, export |
| `shareable-stats` | 18 | Share features, swipe-to-dismiss, image card exports, K/BB/BIP boxes |
| `history-config` | 19 | History cards, config presets, setup flow, umpire clearing |
| `about-screen` | 8 | About screen, app info, links, back navigation |

```bash
npm test              # Run all tests (headless)
npm run test:headed   # Run with visible browser
npm run test:ui       # Open Playwright UI
```

Tests run in Chromium against the web app layer (`index.html`) served locally. Shared helpers (`tests/helpers.ts`) provide utilities for game setup, pitch throwing, and state management.

### Device Testing

- Test on physical device for haptic feedback (simulator has no Taptic Engine)
- Test on devices with and without Dynamic Island for safe area insets
- Test in portrait and upside-down portrait orientations

---

## Security & Privacy

- **No network requests** — the app is fully offline. No analytics, no telemetry, no API calls
- **No user accounts** — no authentication or personal data collection
- **Local storage only** — all data persists in WKWebView's localStorage, sandboxed by iOS
- **No sensitive data** — stores game scores, player first names, and pitch counts only
- **External links** — `mailto:` and `https://` links open in their respective native handlers, never inside the WKWebView
