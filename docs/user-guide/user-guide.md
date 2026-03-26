# Simple Pitch Counter: User Guide

**Version:** 1.x
**Last updated:** 2026-03-26

---

## Getting Started

Simple Pitch Counter is designed for youth baseball and softball scorekeepers. It tracks pitch counts, enforces league rest-day rules, and generates post-game summary reports — all from your iPhone.

### First Launch

When you open the app for the first time, you'll see the **Game History** screen. Since no games have been played yet, it will prompt you to:

1. Check your **Configuration** (tap the menu button in the top right)
2. Start a **New Game**

Before your first game, we recommend setting up a configuration that matches your league's rules.

---

## Configuration

Tap the **menu button** (three-line icon) on the history screen, then tap **Configuration**.

### Pitch & Catcher Presets

A preset defines the rules for a specific league division. The app ships with a default "Default Minors 7-10" preset.

To create a new preset, tap **+ New configuration** and fill in:

| Field | Description | Example |
|-------|-------------|---------|
| Name | A label for this config | "Majors 11-12" |
| Max pitches | Maximum pitches allowed per game | 85 |
| Catcher inn. max | Maximum innings a catcher can catch before being ineligible to pitch | 4 |

### Pitcher Rest Thresholds

These define how many rest days a pitcher needs based on their pitch count. Add rows for each threshold your league requires:

| Pitches | Days Rest | Meaning |
|---------|-----------|---------|
| 20 | 0 | 1-20 pitches: no rest required |
| 35 | 1 | 21-35 pitches: 1 day of rest |
| 50 | 2 | 36-50 pitches: 2 days of rest |

### Catcher Inning Thresholds

Define when a catcher becomes ineligible to pitch:

| Innings | Restriction |
|---------|-------------|
| 4 | Cannot pitch remainder of day |

### Field List

You can save field names you use frequently (e.g., "Field 3", "Main Diamond"). These will appear as a dropdown when creating a new game, saving you from typing them each time.

### Setting a Default

Tap **Set default** next to any configuration to make it the automatically selected config for new games. You can still change the config on a per-game basis during game setup.

---

## Starting a New Game

1. Tap **+ New game** from the history screen
2. **Configuration** — confirm or change the league preset for this game
3. **Game info** — set the date, game time, and field name
4. **Teams** — enter home and away team names
5. **Opening pitcher & catcher** — enter the starting pitcher and catcher for each team (at minimum, one pitcher is required)
6. Tap **Start game**

---

## During a Game

The game screen shows everything you need at a glance:

### Top Bar

- **Inning indicator** — shows "Top of Inning 1", "Bottom of Inning 3", etc., along with which team is fielding/batting
- **End half** button — advances to the next half inning
- **Menu** button — access quick stats, game summary, close game, or end game

### Scoreboard

The scoreboard at the top shows both teams' scores. Tap **+** or **-** to adjust either team's score. Score changes can be undone.

### Pitch Counting

The main area shows:

- **Current batter pitch count** — how many pitches the active pitcher has thrown to the current batter
- **Total pitch count** — the large number in the center showing the pitcher's total pitches
- **Rest requirement** — color-coded text showing how many rest days the pitcher currently needs
- **Max pitches remaining** — how many pitches until the league limit

#### Adding Pitches

Tap the blue **+ Pitch** button each time a pitch is thrown. The count updates immediately with a visual pop animation and haptic feedback on your device.

#### Next Batter

When a batter's at-bat ends, tap the green **Next batter** button. This:
- Records the pitches thrown to that batter
- Resets the "pitches this at-bat" counter to 0
- Does NOT change the total pitch count

#### Undo

Made a mistake? Tap **Undo** to reverse the last action. The undo history tracks up to 60 actions, including pitches, next batter, and score adjustments.

#### Edit Pitch Count

If you need to manually correct the pitch count (e.g., you lost track), tap the **Edit** button next to the large pitch count number. You can set both the total count and current batter count. Note: editing clears the undo history for that pitcher.

### Alerts

The app displays color-coded alerts as pitchers approach and cross thresholds:

| Color | Meaning |
|-------|---------|
| Blue (info) | Approaching a threshold — be aware |
| Yellow (warning) | At or near a rest-day threshold |
| Red (danger) | Over the pitch limit or cannot catch today |
| Dark red (critical) | Batter pitch count unusually high — verify count |

### Changing Pitchers

1. Tap **Change pitcher** in the pitcher card
2. Select an existing pitcher from the list, or add a new one using the form at the bottom
3. The previous pitcher is marked as "Done" and their final batter count is recorded

### Changing Catchers

Works the same as pitchers. Tap **Change catcher** to swap or add a new catcher.

### Ending a Half Inning

Tap the **End half** button in the top bar. A confirmation dialog appears. This:
- Records the current pitcher's batter count
- Switches from top to bottom (or bottom to top, incrementing the inning)
- Updates catcher inning tracking

---

## Quick Stats

During a game, tap the **menu button** and select **Quick stats** to see a summary of all pitchers and catchers for both teams, including pitch counts, innings, and rest requirements.

---

## Game Summary

### Generating the Summary

1. From the game screen, tap the **menu button** > **Game summary** (or tap **End game** > **Go to summary**)
2. Fill in any additional information:
   - **Home runs** — enter player names for each team
   - **Last-batter pitches** — verify or correct the pitch count for each pitcher's last batter (highlighted in red if unusually high)
   - **Umpire summary** — plate umpire, base umpire, any issues, and comments
3. Tap **Generate summary**

### Sharing the Summary

The generated summary includes all game data in a formatted text block:
- Date, time, field
- Final score
- Each pitcher's total pitches and last-batter count
- Home runs
- Umpire notes

You can:
- **Copy to clipboard** — paste into a text message, email, or league app
- **Email** — opens your email app with the summary pre-filled in the body

---

## Closing and Resuming Games

### Close (Pause)

From the game screen menu, tap **Close**. The game is saved to history with a red **LIVE** badge. You can return to it later.

### Resume

From the history screen, tap **Resume** on any game with a LIVE badge. The game restores exactly where you left off.

### End Game

Tap **End game** from the menu. This finalizes the game and saves it to history. You're prompted to generate the summary first.

---

## Game History

The history screen shows all your games, newest first. Each card shows:

- Team names and date
- Final score and field
- **Rest days required** — a breakdown of which pitchers need rest and for how long

### Actions

- **Resume** — reopen a LIVE (paused) game
- **View stats** — see full pitcher/catcher stats for any completed game
- **Summary** — generate or view the text summary for any game

### Deleting Games

Swipe a game card to the left to reveal the **Delete** button. A confirmation dialog prevents accidental deletion.

### Export & Import

From the history screen menu:

- **Export games** — generates a CSV with all game data (pitchers, pitch counts, rest days). Copy or email it
- **Import games** — paste CSV data exported from another device. Duplicates (same date + teams) are automatically skipped

---

## Tips for Game Day

1. **Set up before the game** — create the game entry with teams, pitchers, and catchers while you're still relaxed
2. **Trust the alerts** — the app will warn you before a pitcher crosses a threshold so you can notify the coach in time
3. **Use "Next batter" consistently** — this is critical for accurate last-batter tracking, which is required in the post-game report
4. **Generate the summary before leaving the field** — the league typically requires the report within 2 hours
5. **Close, don't end** — if you need to step away mid-game, use Close instead of End Game. You can resume later
6. **Check rest days** — the history screen shows rest requirements for every pitcher, helping coaches plan for the next game

---

## Troubleshooting

### The pitch count seems wrong
Tap the **Edit** button next to the pitch count to manually correct it. This is useful if you miscounted or if someone else was tracking for a few batters.

### I forgot to tap "Next batter"
The total pitch count is still accurate. The batter count will be higher than expected, but you can correct the "last batter pitches" in the game summary before generating the report.

### The app shows an alert I don't understand
All alerts reference specific league rules. Yellow means a threshold is approaching, red means a limit has been reached. When in doubt, notify the coach.

### I accidentally ended the game
Games cannot be re-opened once ended, but you can still view stats and generate the summary from the history screen.

### Data didn't save
The app saves after every action (pitch, score change, etc.). If the app was force-quit during a save, data from the last action may be lost. The auto-save on app background ensures the game state is preserved when switching apps.

---

## Privacy

Simple Pitch Counter is fully offline. No data leaves your device — ever.

- No account required
- No internet connection needed
- No analytics or tracking
- All data stored locally on your iPhone
- Uninstalling the app deletes all data

For the full privacy policy, visit [simplepitchcounter.com/privacy](https://simplepitchcounter.com/privacy.html).
