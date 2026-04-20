# Simple Pitch Counter

A pitch counter app for youth baseball and softball coaches, built for the dugout.

This is also a portfolio project by **Justin Thames** demonstrating AI-native product development — from concept and product requirements through design, development, testing, and App Store release, built end-to-end with AI as a core collaborator.

**App Store:** [Simple Pitch Counter on iOS](https://apps.apple.com/us/app/simple-pitch-counter/id6760922314)
**Website:** [simplepitchcounter.com](https://simplepitchcounter.com)

## What it does

Simple Pitch Counter tracks pitch counts and catcher innings during live games, enforces league rest-day rules, and generates post-game summary reports — all from your iPhone.

### Key features

- **Two tracking modes** — Simple mode (tap-to-count) for basic pitch counting, or Advanced mode with per-pitch type tracking (Ball, Called K, Swing K, Foul, Ball in Play)
- **Out tracking in both modes** — out dots display in the header next to the inning pill; Simple mode has a dedicated `+ Out` button; 3 outs triggers an end-of-half confirmation modal
- **Mercy rule auto-prompt** — when runs scored in a half inning reach the configured mercy limit, a modal prompts to end the half or continue playing; tracks runs from either team
- **Advanced pitch tracking** — tracks balls, strikes, and outs automatically; records pitch-by-pitch sequences per at-bat with visual chips; auto-advances count on walks, strikeouts, and balls in play
- **Ball in play outcomes** — when a ball is put in play, a bottom sheet prompts for Safe/Out with automatic out tracking and side-retired detection
- **Live pitcher stats** — dark-themed bottom sheet showing K, BB, BIP totals and a full pitch type breakdown with percentage bars
- **Configurable league rules** — set pitch limits, rest-day thresholds, and catcher inning rules per division (e.g., Minors 8, Minors 9/10, Majors)
- **Threshold awareness** — alerts when a pitcher approaches or crosses a rest-day threshold, with support for the "finish the batter" rule
- **Catcher/pitcher eligibility** — flags when a catcher has caught 4+ innings (can't pitch) or a pitcher has thrown 41+ pitches (can't catch)
- **Physical button support** — map iPhone volume buttons and Action Button to pitch counting, undo, or next batter actions with configurable button mapping
- **Game summaries** — generates a formatted summary with pitcher data, scores, homeruns, pitch type breakdowns, and umpire notes, ready to email
- **Dark scoreboard header** — persistent dark-themed header with live score, inning/half indicator, and out tracking dots
- **Score and inning tracking** — built-in scoreboard with inning management
- **Swipe-to-delete history** — swipe game cards left to reveal delete action; history cards show mode badge (Simple/Advanced) and live game indicator
- **Game history** — review past games, pitcher rest requirements, and stats
- **Result flash animations** — full-screen animated overlays for strikeouts, walks, outs, safe calls, and side retired
- **Data export/import** — export all game data as JSON (via Share Sheet on iOS) and import backups from the history menu
- **Pitch dot visualization** — dots below the hero count alternate shading per batter to show at-bat boundaries at a glance
- **Fully offline** — no account, no internet, no ads. All data stays on your device via localStorage

### Game summary output

The app generates summaries matching the EDHLL Game Summary form:

- Date, game time, field name
- Division
- Home/away team names and scores
- Each pitcher: name, actual pitch count (incl. last batter), pitches thrown to last batter
- Pitch type breakdowns per pitcher (Advanced mode): B, K̲, K, F, BIP counts with K/BB/BIP totals
- Homeruns (over-the-fence)
- Umpire summary (plate/base umpire, issues, comments)

## Project structure

```
simple-pitch-counter/
├── app/                    # iOS app
│   ├── index.html          # All app UI, CSS, and JavaScript (V2)
│   ├── AppDelegate.swift   # Native iOS shell — window setup
│   ├── ViewController.swift # WKWebView config, haptics, and volume button capture
│   ├── V1/                 # Archived V1 app files
│   └── Assets.xcassets/    # App icons and colors
├── tests/                  # Playwright E2E tests
│   ├── helpers.ts          # Shared test utilities (startGame, addPitches, etc.)
│   ├── core-game-flow.spec.ts      # Game lifecycle, scoring, outs, undo
│   ├── advanced-mode.spec.ts       # Pitch types, BSO count, BIP, auto-advance
│   ├── thresholds-alerts.spec.ts   # Rest days, pitch limits, mercy rule
│   ├── pitcher-catcher.spec.ts     # Roster management, mid-game switches
│   ├── summary-export.spec.ts      # Game summary, report generation, export
│   └── history-config.spec.ts      # History cards, config presets, setup flow
├── .github/workflows/      # CI/CD
│   └── test.yml            # Runs Playwright tests on push/PR to main
├── website/                # simplepitchcounter.com
│   ├── index.html          # Landing page with interactive phone mockup
│   ├── privacy.html        # Privacy policy
│   ├── contact.html        # Contact form
│   ├── feedback.html       # Feedback form
│   └── contact.php         # PHP backend (not tracked — contains credentials)
├── marketing/              # App Store screenshot assets
│   ├── screenshots.html    # Screenshot background templates (7 slides)
│   ├── capture.mjs         # Playwright script to render slide PNGs
│   └── sample-data.js      # Realistic sample data for simulator screenshots
├── docs/                   # Product and portfolio documentation
├── playwright.config.ts    # Playwright test configuration
├── CHANGELOG.md            # App change history
└── README.md
```

## Testing

The project has **91 Playwright E2E tests** covering all app functionality:

| Spec file | Tests | Coverage |
|-----------|-------|----------|
| `core-game-flow` | 20 | Game lifecycle, scoring, outs (both modes), undo, persistence |
| `advanced-mode` | 21 | Pitch types, BSO count, BIP modal, auto-advance, non-pitch outs |
| `thresholds-alerts` | 17 | Rest days, pitch limits, mercy rule modal, at-bat warnings |
| `pitcher-catcher` | 10 | Roster management, mid-game switches, inning tracking |
| `summary-export` | 11 | Game summary, umpire data, report generation, export |
| `history-config` | 12 | History cards, config presets, setup flow, umpire clearing |

```bash
npm test              # Run all tests (headless)
npm run test:headed   # Run with visible browser
npm run test:ui       # Open Playwright UI
```

Tests run automatically on every push and pull request to `main` via GitHub Actions (`test.yml`). The CI pipeline uses Node 20 and Chromium, and uploads test reports as artifacts (14-day retention).

## Architecture

### iOS app (`app/`)

The app is a native iOS shell wrapping a single-page web application:

- **AppDelegate.swift** — creates the window and sets `ViewController` as root
- **ViewController.swift** — configures a `WKWebView` constrained to the safe area, with persistent localStorage, portrait lock, native JS alert/confirm/prompt handling, external link handling, haptic feedback bridge (JS → native via `WKScriptMessageHandler`), dynamic status bar styling (light on game screen, dark elsewhere), and volume button capture for physical button mapping
- **index.html** — the entire app in one file: HTML structure, CSS styling, and JavaScript logic. Uses localStorage for all data persistence. Features a dark scoreboard header, two game modes (Simple/Advanced), pitch type tracking, out tracking, mercy rule enforcement, and iOS-native visual language

### Website (`website/`)

A static marketing site hosted on a Synology NAS via Web Station:

- Landing page with interactive phone mockup showing the Advanced mode UI
- App Store download link and feature highlights
- Privacy policy (required by App Store)
- Contact and feedback forms with PHP/SMTP backend
- Deployed at simplepitchcounter.com

## Deployment

### iOS app

Built and submitted via Xcode on macOS. The `app/index.html` is bundled into the iOS app and loaded by the WKWebView. Build numbers auto-increment from git commit count.

1. Push changes to `main`, confirm CI tests pass
2. On Mac: Xcode → Integrate → Pull
3. Xcode → Product → Archive → Distribute to App Store Connect
4. Build appears in TestFlight automatically

### Website

Hosted on a self-hosted Synology NAS via Web Station. Deployed via SCP over the local network after any content or mockup changes.

**Note:** `contact.php` contains SMTP credentials and is excluded from git via `.gitignore`. Connection details (host, port, SSH key) are kept outside the repo.

## Future plans

- Make the web app accessible directly from simplepitchcounter.com (browser-based version)
- Android support
