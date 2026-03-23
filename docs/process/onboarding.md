# Engineer Onboarding Guide

Welcome to Simple Pitch Counter. This doc gets you up to speed on the project, the codebase, and how we work.

---

## What is this project?

A pitch counting app for youth baseball. Coaches and scorekeepers use it during games to track how many pitches each kid throws. League rules require rest days based on pitch count thresholds, and a game summary report must be submitted after every game. The app handles both.

**Live app:** iOS App Store — "Simple Pitch Counter"
**Website:** simplepitchcounter.com
**Repo:** github.com/mrthames/simple-pitch-counter

## Architecture (it's simple)

The entire app is a single HTML file (`app/index.html`) loaded inside a native iOS WKWebView wrapper. There's no build step, no framework, no bundler.

```
app/
├── index.html           ← ALL app logic: HTML + CSS + JS in one file
├── AppDelegate.swift    ← Creates the window
├── ViewController.swift ← Configures WKWebView, handles navigation
└── Assets.xcassets/     ← App icon

website/
├── index.html           ← Marketing landing page
├── privacy.html         ← Privacy policy (required by App Store)
├── contact.html         ← Contact form
└── contact.php          ← SMTP backend (not in git — contains credentials)
```

### Why one HTML file?

The app runs inside a WKWebView with no server. Everything has to be self-contained in the bundle. One file means one thing to load, no path resolution issues, no build step that could break. It's ~100KB and loads instantly.

### Data storage

All data lives in `localStorage` inside the WKWebView. This persists between app launches (Apple's `WKWebsiteDataStore.default()` handles this). There is no backend, no API, no cloud sync.

Key localStorage keys to know:
- Game state, pitcher data, configs, and history are all stored as JSON blobs
- Clearing Safari data or deleting the app wipes everything

## How to make changes

### iOS app (index.html)

1. Open the Xcode project on your Mac
2. Edit `app/index.html` directly
3. Run on the simulator or a connected iPhone
4. The WKWebView loads the bundled file — changes show immediately on rebuild

### Website

1. Edit files in `website/`
2. Deploy by copying to the Synology NAS web root via SFTP or File Station
3. The website is static HTML + one PHP file for the contact form

## Domain knowledge you'll need

### Pitch count thresholds

The core concept: leagues define thresholds (e.g., 20, 35, 50 pitches). When a pitcher crosses a threshold, they need a certain number of rest days before pitching again. The thresholds and rest days vary by league and age group.

### The "finish the batter" rule

If a pitcher crosses a threshold while pitching to a batter, they can finish that batter. The tricky part: rest days are recorded based on the threshold they crossed, not their final pitch count. Example: a pitcher at 19 pitches starts a new batter, throws pitch 20 (crossing the threshold), then throws 3 more to finish the at-bat (total: 23). Rest days = 0 (based on threshold 20), not 1 (which would be the 21-35 bracket for their actual count of 23).

This is the single most confusing rule in youth baseball pitching, and it's the core logic the app needs to get right.

### Game summary

After every game, the scorekeeper must send a report including: date, teams, scores, each pitcher's actual pitch count, pitches thrown to their last batter, homeruns, and umpire notes. This goes to the player agent and league president within 2 hours.

## How we work

Read `docs/process/pm-engineering-workflow.md` for the full process. Short version:
- Issues and backlog live on GitHub
- 2-week sprints
- Branch per issue, reference issue number in commits
- PRs link to issues with `Closes #XX`

## Your first task

Pick up any issue labeled `P2: medium` or `P3: low` with size `XS` or `S`. Read the acceptance criteria, create a branch, make the change, and open a PR. That's the full loop.
