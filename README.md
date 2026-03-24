# Simple Pitch Counter

A pitch counter app for youth baseball and softball coaches, built for the dugout.

**App Store:** [Simple Pitch Counter on iOS](https://apps.apple.com/us/app/simple-pitch-counter/id6760922314)
**Website:** [simplepitchcounter.com](https://simplepitchcounter.com)

## What it does

Simple Pitch Counter tracks pitch counts and catcher innings during live games, enforces league rest-day rules, and generates post-game summary reports — all from your iPhone.

### Key features

- **Real-time pitch tracking** — tap to count each pitch, track pitches per at-bat and per pitcher
- **Configurable league rules** — set pitch limits, rest-day thresholds, and catcher inning rules per division (e.g., Minors 8, Minors 9/10, Majors)
- **Threshold awareness** — alerts when a pitcher approaches or crosses a rest-day threshold, with support for the "finish the batter" rule
- **Catcher/pitcher eligibility** — flags when a catcher has caught 4+ innings (can't pitch) or a pitcher has thrown 41+ pitches (can't catch)
- **Game summaries** — generates a formatted summary with pitcher data, scores, homeruns, and umpire notes, ready to email to your league's player agent
- **Score and inning tracking** — built-in scoreboard with inning management
- **Game history** — review past games, pitcher rest requirements, and stats
- **Fully offline** — no account, no internet, no ads. All data stays on your device via localStorage

### Game summary output

The app generates summaries matching the EDHLL Game Summary form:

- Date, game time, field name
- Division
- Home/away team names and scores
- Each pitcher: name, actual pitch count (incl. last batter), pitches thrown to last batter
- Homeruns (over-the-fence)
- Umpire summary (plate/base umpire, issues, comments)

## Project structure

```
simple-pitch-counter/
├── app/                    # iOS app
│   ├── index.html          # All app UI, CSS, and JavaScript
│   ├── AppDelegate.swift   # Native iOS shell — window setup
│   ├── ViewController.swift # WKWebView configuration and navigation
│   └── Assets.xcassets/    # App icons and colors
├── website/                # simplepitchcounter.com
│   ├── index.html          # Landing page
│   ├── privacy.html        # Privacy policy
│   ├── contact.html        # Contact form
│   ├── contact.php         # PHP backend for contact form (not tracked in git — contains credentials)
│   └── phpmailer/          # PHPMailer library for SMTP
├── CHANGELOG.md            # App change history
└── README.md
```

## Architecture

### iOS app (`app/`)

The app is a native iOS shell wrapping a single-page web application:

- **AppDelegate.swift** — creates the window and sets `ViewController` as root
- **ViewController.swift** — configures a `WKWebView` with persistent localStorage, portrait lock, native JS alert/confirm/prompt handling, and opens external links in Safari
- **index.html** — the entire app in one file: HTML structure, CSS styling, and JavaScript logic. Uses localStorage for all data persistence

### Website (`website/`)

A static marketing site hosted on a Synology NAS via Web Station:

- Landing page with app features, how-it-works steps, and App Store download link
- Privacy policy (required by App Store)
- Contact form with PHP/SMTP backend
- Deployed at simplepitchcounter.com

## Deployment

### iOS app

Built and submitted via Xcode on macOS. The `app/index.html` is bundled into the iOS app and loaded by the WKWebView.

### Website

Hosted on Synology NAS using Web Station. Deploy by copying `website/` contents to the web root (e.g., `/web/simplepitchcounter/`). See the website's own setup notes for virtual host, HTTPS, and DNS configuration.

**Note:** `contact.php` contains SMTP credentials and is excluded from git via `.gitignore`. Keep a local copy on your NAS and manage credentials separately.

## Future plans

- Make the web app accessible directly from simplepitchcounter.com (browser-based version)
- Android support
