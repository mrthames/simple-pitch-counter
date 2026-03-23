# Sprint Review — [Sprint Name]

**Sprint dates:** [start] – [end]
**Sprint goal:** [one-sentence goal]

---

## What shipped

| Issue | Description | Impact |
|-------|-------------|--------|
| #XX   | Short description | Who benefits and how |

## What didn't ship (and why)

| Issue | Reason | Plan |
|-------|--------|------|
| #XX   | Why it slipped | When it'll land |

## Key decisions made this sprint

- **[Decision]:** [What we decided and why. Link to decision doc if applicable.]

## Metrics snapshot

| Metric | Last sprint | This sprint | Trend |
|--------|-------------|-------------|-------|
| Open bugs | X | X | ↑/↓/→ |
| Issues closed | X | X | |
| App Store rating | X.X | X.X | |

## Demo notes

[Brief description of what was demonstrated, or link to recording]

## Next sprint preview

- Sprint goal: [one sentence]
- Key issues planned: #XX, #XX, #XX

---

## Sprint 1: Foundation — Review (Mock)

**Sprint dates:** April 7 – April 18, 2026
**Sprint goal:** Fix critical bugs and ship pre-built league configurations

### What shipped

| Issue | Description | Impact |
|-------|-------------|--------|
| #1  | Pre-built league configs for Minors 8, 9/10, Majors | New users can start tracking immediately without manual config setup |
| #3  | Fixed undo button not decrementing at-bat counter | Pitch-to-batter data now accurate after undo |
| #13 | Updated App Store link on website | Download button now works — was blocking conversions |
| #14 | Added privacy policy link in app settings | Removes App Store review risk |

### What didn't ship (and why)

| Issue | Reason | Plan |
|-------|--------|------|
| #9  | Same-day multi-game support | Scoped larger than expected — need to handle roster edge cases across games. Moved to Sprint 2 backlog for further grooming. |

### Key decisions made this sprint

- **Pre-built configs are read-only:** Users can clone them but not edit the defaults. This prevents accidental changes and lets us update them if league rules change. Trade-off: slightly more friction for leagues with minor variations.
- **Prioritized App Store link fix over dark mode:** The broken download link was actively losing users. Dark mode is a want, not a need.

### Metrics snapshot

| Metric | Before | After | Trend |
|--------|--------|-------|-------|
| Open bugs | 3 | 1 | ↓ |
| Issues closed | 0 | 4 | ↑ |
| App Store rating | 4.2 | 4.2 | → |

### Next sprint preview

- Sprint goal: Polish the game-day experience — better summaries, onboarding, and UX details
- Key issues planned: #7, #10, #11, #12

---

## Sprint 2: Game Day Polish — Review (Mock)

**Sprint dates:** April 21 – May 2, 2026
**Sprint goal:** Improve game summary quality and reduce first-use friction

### What shipped

| Issue | Description | Impact |
|-------|-------------|--------|
| #7  | Improved game summary email formatting | Summaries now scannable — player agents report faster processing |
| #10 | Pitcher substitution confirmation dialog | Prevents accidental pitcher swaps mid-game |
| #12 | First-time user onboarding flow | 3-screen walkthrough explains setup — expect fewer support emails |

### What didn't ship (and why)

| Issue | Reason | Plan |
|-------|--------|------|
| #11 | Game summary homeruns field | Partially done — UI is in place but export integration needs work. Will close in first week of next sprint. |

### Key decisions made this sprint

- **Onboarding is 3 screens, not 5:** Cut the league rules explanation screen and the "why offline matters" screen. Users don't read long onboarding. Get them to their first game fast.
- **HTML email vs plain text:** Went with structured plain text. HTML emails have rendering issues across mail clients and some league admins copy-paste the summary into spreadsheets — plain text is easier to parse.

### Metrics snapshot

| Metric | Sprint 1 | Sprint 2 | Trend |
|--------|----------|----------|-------|
| Open bugs | 1 | 1 | → |
| Issues closed | 4 | 3 | ↓ |
| Support emails | 5 | 2 | ↓ |
| App Store rating | 4.2 | 4.4 | ↑ |
