# KPIs & Metrics

## Core KPIs

### 1. Games Completed
**Definition:** Number of games where a summary was generated (not just started)
**Why it matters:** Measures real usage. A started game that's abandoned means something went wrong.
**Target:** Completion rate >90% of started games
**Measured by:** localStorage event tracking (future), user feedback (current)

### 2. Time to Summary
**Definition:** Elapsed time between game end and summary email sent
**Why it matters:** League requires summaries within 2 hours. If the app makes this easy, it should happen fast.
**Target:** <5 minutes after last out
**Measured by:** Timestamp comparison in game data (future)

### 3. Pitch Count Accuracy
**Definition:** Number of reported pitch count errors or rest-day miscalculations
**Why it matters:** The whole point of the app. If the math is wrong, the app is worse than paper.
**Target:** Zero threshold/rest-day calculation errors
**Measured by:** Bug reports, user feedback

### 4. Setup Time
**Definition:** Time from opening the app to recording the first pitch of a game
**Why it matters:** If setup takes too long, scorekeepers will revert to paper mid-game.
**Target:** <60 seconds for returning users, <3 minutes for first-time users
**Measured by:** User testing, analytics (future)

### 5. App Store Rating
**Definition:** Average star rating on the iOS App Store
**Why it matters:** Social proof for new users, signal for product quality
**Target:** 4.5+ stars
**Measured by:** App Store Connect

### 6. Weekly Active Games
**Definition:** Number of games tracked per week across all users
**Why it matters:** Leading indicator of adoption. Seasonal — expect peaks during spring/summer.
**Target:** Growth week-over-week during season
**Measured by:** Analytics (future — requires opt-in)

### 7. Bug Resolution Time
**Definition:** Average time from bug report filed to fix shipped
**Why it matters:** Shows responsiveness and product health
**Target:** P0/P1 <48 hours, P2 within current sprint, P3 within 2 sprints
**Measured by:** GitHub Issues timestamps

---

## Weekly Metrics Report Template

### Week of [date]

| Metric | This week | Last week | Trend | Notes |
|--------|-----------|-----------|-------|-------|
| Games completed | — | — | | |
| Open bugs (P0/P1) | X | X | ↑/↓/→ | |
| Open bugs (all) | X | X | | |
| Issues closed | X | X | | |
| New issues filed | X | X | | |
| App Store rating | X.X | X.X | | |
| App Store reviews (new) | X | X | | |
| Website visits | — | — | | Via server logs |
| Contact form submissions | X | X | | |

### Highlights
- [What went well]

### Concerns
- [What needs attention]

### Actions
- [What we're doing about the concerns]
