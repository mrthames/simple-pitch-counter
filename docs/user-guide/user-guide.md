# Simple Pitch Counter: User Guide

**Version:** 2.2
**Last updated:** 2026-04-21

---

## Getting Started

Simple Pitch Counter is designed for youth baseball and softball scorekeepers. It tracks pitch counts, enforces league rest-day rules, and generates post-game summary reports — all from your iPhone.

### First Launch

When you open the app for the first time, you'll see the **Game History** screen with a prompt to start a new game. Before your first game, we recommend setting up a configuration that matches your league's rules.

---

## Configuration

Access configuration from the setup screen when creating a new game.

### Pitch & Catcher Presets

A preset defines the rules for a specific league division. The app ships with a default "Default Minors 7-10" preset.

To create a new preset, tap **+ New configuration** and fill in:

| Field | Description | Example |
|-------|-------------|---------|
| Name | A label for this config | "Majors 11-12" |
| Max pitches | Maximum pitches allowed per game | 85 |
| Catcher inn. max | Maximum innings a catcher can catch | 4 |

### Rest Thresholds

Define how many rest days a pitcher needs based on their pitch count:

| Pitches | Days Rest | Meaning |
|---------|-----------|---------|
| 20 | 0 | 1-20 pitches: no rest required |
| 35 | 1 | 21-35 pitches: 1 day of rest |
| 50 | 2 | 36-50 pitches: 2 days of rest |

### Field List

Save frequently used field names (e.g., "Field 3", "Main Diamond"). These appear as options when creating a new game.

---

## Starting a New Game

1. Tap **+ New Game** from the history screen
2. **Tracking Mode** — choose Simple or Advanced (see below)
3. **Configuration** — confirm or change the league preset
4. **Game Info** — date, time, and field
5. **Teams** — home and away team names
6. **Pitchers & Catchers** — starting pitcher and catcher for each team (at minimum, one pitcher required)
7. Tap **Start Game**

### Tracking Modes

| Mode | Best For | What It Tracks |
|------|----------|----------------|
| **Simple** | Quick counting | Total pitches per pitcher, at-bat count |
| **Advanced** | Full game tracking | Ball, Called K, Swing K, Foul, Ball in Play — with automatic walk/strikeout detection and out tracking |

---

## During a Game — Simple Mode

### Scoreboard Header

The dark header shows:
- **Inning pill** — current half and inning (e.g., "TOP 3")
- **Team scores** — tap +/− to adjust
- **End half** button — advance to the next half inning
- **Menu** (☰) — access quick stats, game summary, button mapping, close, or end game

### Pitch Counting

- **+ Pitch** — tap for each pitch thrown
- **Next batter ›** — tap when a batter's at-bat ends (resets at-bat counter, keeps total)
- **Undo** — reverses the last action (up to 100 steps)

### Pitch Count Display

- Large center number shows total pitches for the active pitcher
- "This at-bat" counter shows pitches to the current batter
- Color changes as the pitcher approaches thresholds (green → amber → red)

---

## During a Game — Advanced Mode

Advanced mode adds per-pitch type tracking with automatic game state management.

### Pitch Type Buttons

| Button | Meaning | Effect |
|--------|---------|--------|
| **B** (blue) | Ball | Adds a ball. 4 balls = walk (auto-resets count) |
| **K̲** (red) | Called Strike | Adds a strike. 3 strikes = strikeout |
| **K** (dark red) | Swinging Strike | Adds a strike. 3 strikes = strikeout |
| **F** (orange) | Foul | Adds a strike if under 2 strikes. At 2 strikes, adds a pitch but no strike |
| **⊙** (green) | Ball in Play | Opens the BIP modal (see below) |

### Ball-Strike Count

Displayed as colored dots above the pitch buttons. Resets automatically on walks, strikeouts, and BIP results.

### At-Bat Sequence

Colored chips show the sequence of pitches in the current at-bat (e.g., B, K̲, F, B, K).

### Ball in Play (BIP) Modal

When you tap ⊙, a bottom sheet appears:
- **Safe** — batter reached base. Count resets, no out added.
- **Out** — batter is out. Count resets, out added.

### Outs and Auto-Advance

Three out dots appear in the header. When the third out is recorded (via strikeout or BIP out), the half inning ends automatically — outs reset and the inning advances.

### Result Flashes

Full-screen animated overlays briefly appear for:
- **Strikeout** (K) — after 3 strikes
- **Walk** (BB) — after 4 balls
- **Out** / **Safe** — after BIP result
- **Side Retired** — after 3 outs

### Pitcher Stats

Tap **Stats ›** next to the pitcher name to see a detailed breakdown:
- K, BB, BIP totals
- Per-pitch-type counts with percentage bars

---

## Pitcher Management

### Changing Pitchers

1. Tap **Change** next to the pitcher name
2. Select an existing pitcher or add a new one
3. The previous pitcher's stats are preserved — you can switch back anytime

### Pitch Count Alerts

| Alert | Meaning |
|-------|---------|
| Rest required (amber) | Pitcher has crossed a rest threshold |
| Approaching limit (amber) | Within 5 pitches of the max |
| Over limit (red) | Exceeded the maximum pitch count |
| At-bat pitch count (blue) | 6+ pitches in a single at-bat — verify count |

---

## Catcher Management

### Catcher Inning Tracking

The catcher section shows:
- Current inning count with visual pips
- Innings remaining before reaching the limit
- Warning at the last allowed inning
- Alert when the limit is reached

### Pitcher/Catcher Eligibility

If the active pitcher has thrown 41+ pitches, the catcher section warns that the pitcher is ineligible to catch for the remainder of the day.

### Changing Catchers

Tap **Change** in the catcher section to select or add a new catcher.

---

## Physical Button Mapping

On supported iPhones, you can map physical buttons to app actions.

### Setup

1. From the game screen, tap ☰ → **Button mapping**
2. Assign each button:

| Button | Options |
|--------|---------|
| Volume Up | Pitch, Undo, Next Batter, None |
| Volume Down | Pitch, Undo, Next Batter, None |
| Action Button (iPhone 15 Pro+) | Pitch, Undo, Next Batter, None |

### Default Mapping

- **Volume Up** → + Pitch
- **Volume Down** → Undo
- **Action Button** → Next Batter

Mappings persist across games.

---

## Half Innings

Tap **End half ›** in the header to advance. A confirmation dialog appears showing the current half/inning.

In Advanced mode, half innings also end automatically when 3 outs are recorded.

The half-inning transition:
- Records the current pitcher's innings
- Records the current catcher's innings
- Switches the active pitcher/catcher to the other team's roster
- Resets ball-strike count and outs

---

## Game Summary & Export

### Generating the Summary

1. Tap ☰ → **Game summary**
2. Fill in optional fields:
   - **Home runs** — player names for each team
   - **Umpire notes** — plate/base umpire names and any issues
3. Tap **Generate Report**

### Export Format

The report includes:
- Date, time, field, final score
- Each pitcher's total pitches, innings, last-batter count, and rest requirement
- Catcher innings
- Home runs and umpire notes
- Pitch type breakdown (Advanced mode only)

### Sharing

- **Copy to clipboard** — paste into text, email, or league app
- **Email** — opens email with the summary pre-filled
- **Share** — generates a formatted text report; on iOS, opens the native Share Sheet

---

## Shareable Stats Cards

Stats drawers throughout the app include a **Share** button that generates a dark-themed image card (PNG) you can save or send.

### Where to Share From

| Location | What's shared | How to access |
|----------|--------------|---------------|
| Live game pitcher stats | Individual pitcher card | Tap **Stats ›** next to pitcher name → **Share** |
| Quick stats (mid-game) | All pitchers summary | ☰ → **Quick stats** → **Share** |
| Game summary pitcher stats | Individual pitcher card | ☰ → **Game summary** → tap pitcher stats button → **Share** |
| History stats | All pitchers summary | History card → **Stats** → **Share** |
| History individual pitcher | Individual pitcher card | History card → **Stats** → tap pitcher name → **Share pitcher stats** |

### What's Included

Each image card shows:
- Pitcher name, team, date, and inning count
- **K / BB / BIP** hero number boxes
- Stat lines (pitches, batters, last batter count, rest days)
- Pitch type breakdown with percentages (Advanced mode)
- App branding

### Swipe to Dismiss

All stats drawers support **swipe down to dismiss** — drag the sheet downward to close it. A small swipe snaps back; a larger swipe closes the drawer.

---

## Game History

The history screen shows all games, newest first. Each card displays:
- Team names, date, mode badge (Simple/Advanced)
- Score
- Rest days required for each pitcher

### Actions

- **View stats** — pitcher/catcher stats for any game
- **Summary** — generate the export text for any game
- **Swipe left** → **Delete** — remove a game (with confirmation)

### Close vs. End

- **Close** (from ☰ menu) — saves as a live game, can be resumed later
- **End game** — finalizes the game permanently

---

## Tips for Game Day

1. **Set up before the game** — create the game entry with teams and pitchers while you're relaxed
2. **Trust the alerts** — the app warns you before a pitcher crosses a threshold
3. **Use "Next batter" consistently** — critical for accurate last-batter tracking in the report
4. **Generate the summary before leaving** — the league typically requires the report within 2 hours
5. **Close, don't end** — if you need to step away, use Close to resume later
6. **Use physical buttons** — map volume buttons to pitch/undo for eyes-free counting

---

## About This App

Access from the history screen: tap the ☰ menu → **About this app**.

The About screen shows:
- App name and current version
- Links to the website, privacy policy, and feedback form
- A **Buy Me a Coffee** link to support ongoing development

---

## Privacy

Simple Pitch Counter is fully offline. No data leaves your device.

- No account required
- No internet connection needed
- No analytics or tracking
- All data stored locally on your iPhone
- Uninstalling the app deletes all data

For the full privacy policy, visit [simplepitchcounter.com/privacy](https://simplepitchcounter.com/privacy.html).
