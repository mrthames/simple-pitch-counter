# Product Requirements Document: Simple Pitch Counter

**Author:** Justin Thames
**Last updated:** 2026-03-23
**Status:** Draft

---

## Problem Statement

Youth baseball coaches, scorekeepers, and team parents are required to track pitch counts for every pitcher during every game. League rules mandate specific rest-day requirements based on pitch thresholds — and the scorekeeper must report this data to the league within two hours of game completion.

Today, most people track this on paper scoresheets or generic tally counter apps. The problems with both:

- Paper is error-prone, especially mid-game when you're also tracking score, innings, and batting order
- Generic counters don't know about rest-day thresholds, so the coach has to do mental math or check a chart
- Neither generates the post-game summary report the league requires
- When a pitcher crosses a threshold mid-batter (which happens constantly), the rules about how to record the count are non-obvious and frequently applied wrong

The result: incorrect pitch counts get reported, pitchers don't get proper rest, and coaches get calls from the player agent asking why the numbers don't add up.

## Target User

The primary user is the **scorekeeper** — usually a team parent volunteering at the game. They may or may not understand baseball rules well. They're sitting in a folding chair behind the backstop, often managing their own kids at the same time.

Secondary users:
- **Head coach / manager** — wants to know mid-game how close a pitcher is to a threshold so they can plan substitutions
- **Player agent / league admin** — receives the post-game report and needs it in a consistent format

## Product Vision

A single-purpose app that makes pitch count tracking effortless during a live game and generates a league-compliant summary when the game ends. It should feel like a tool that was built by someone who's actually sat in that folding chair.

## Goals

1. Accurately track pitch counts per pitcher with awareness of league-specific thresholds and rest requirements
2. Track pitches to the current batter separately (required for the "finish the batter" threshold rule)
3. Generate a post-game summary that matches the league's required format, ready to email
4. Support multiple league configurations (different divisions have different rules)
5. Work offline — fields don't have reliable cell service

## Non-Goals

- This is not a full scorebook. We don't track individual at-bat outcomes (single, walk, strikeout, etc.)
- No multi-user sync or cloud accounts. Data lives on the device.
- No live-streaming or real-time sharing of pitch counts to spectators
- Not an umpire tool — this is for the team side

## Key Features

### Pitch Counting (core)
- Tap to increment pitch count
- Track "pitches to current batter" separately from total
- Visual alerts at each rest-day threshold (e.g., crossing 20, 35, 50)
- "Finish the batter" logic: when a threshold is crossed mid-batter, the app records rest days at the threshold level, not the final pitch count
- Undo button for miscounts

### Pitcher Management
- Add/swap pitchers mid-game
- Flag when a pitcher reaches the league max
- Track catcher innings to enforce the catcher/pitcher eligibility rule (41+ pitches = can't catch; 4+ innings catching = can't pitch)

### Game Management
- Scoreboard with inning tracking
- Half-inning transitions
- Home/away team setup

### League Configurations
- Named configs with custom pitch limits and rest-day thresholds
- Pre-built defaults for common Little League divisions
- Configs persist across games

### Game Summaries
- Auto-generated summary matching league form: date, time, field, teams, scores, pitcher data, homeruns, umpire notes
- Email directly from the app via native share sheet
- Game history with past summaries accessible

### Data & Storage
- All data in localStorage — no account, no server
- Game history browsable and searchable
- CSV export for season-level analysis

## Success Metrics

| Metric | Target | How measured |
|--------|--------|-------------|
| Game completion rate | >90% of started games have a summary generated | App analytics (future) |
| Pitch count accuracy | Zero reports of incorrect rest-day calculations | User feedback / bug reports |
| Time to send summary | <2 min after game ends | User feedback |
| App Store rating | 4.5+ stars | App Store |
| Scorekeeper adoption | 3+ teams in home league using it | Direct observation |

## Constraints

- Must work on iPhone (primary). iPad and web are secondary.
- Must work fully offline — no features should degrade without connectivity
- Single developer (AI-assisted). Keep architecture simple — one HTML file, no build step.
- App Store review: no web-only apps, must provide native value. The WKWebView wrapper must feel native (no bounce scroll, proper status bar, portrait lock).

## Open Questions

- Should the app support tracking for both teams simultaneously, or only the user's team? (Currently supports both)
- Is there demand for a shared/synced pitch count between scorekeeper and coach on different devices?
- Should we add push notification reminders about pitcher rest eligibility before the next game?
