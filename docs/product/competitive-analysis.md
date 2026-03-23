# Competitive Analysis

**Date:** March 2026
**Reviewed by:** Justin Thames

---

## Landscape

The pitch counting app space is mostly populated by simple tally counters and a few full-featured scorekeeping apps. There's a gap in the middle: apps that understand pitching rules (thresholds, rest days, eligibility) without trying to be a complete scorebook.

## Competitors Reviewed

### 1. Pitch Counter (iOS) — by various indie developers

Multiple apps with this name exist on the App Store. Most popular has ~200 ratings.

**What it does:**
- Basic tap-to-count interface
- Some versions track multiple pitchers
- Reset button between pitchers

**Strengths:**
- Simple, fast to open and start counting
- Free / minimal ads

**Weaknesses:**
- No awareness of rest-day thresholds — it's a number that goes up, nothing more
- No "pitches to current batter" tracking
- No game summary or export
- No league configuration
- No catcher inning tracking
- User has to do all the rule interpretation themselves

**Verdict:** Solves the counting problem but not the compliance problem. A coach still needs the laminated chart.

---

### 2. GameChanger (iOS/Android/Web)

The dominant youth sports app. Backed by DICK'S Sporting Goods. Full game scoring platform.

**What it does:**
- Complete play-by-play scorekeeping
- Live game streaming to parents
- Team management (rosters, schedules)
- Stats, standings, box scores
- Pitch count tracking as part of the broader scoring

**Strengths:**
- Comprehensive — if you want a full digital scorebook, this is it
- Parent engagement features (live play-by-play feed)
- Large user base, well-known in youth baseball

**Weaknesses:**
- Overkill for a scorekeeper who just needs pitch counts. Learning curve is significant.
- Requires account creation and team setup before you can track a single pitch
- The pitch count feature is buried inside the broader scoring flow — you can't just open it and start counting
- Requires internet for many features
- The person scoring has to track every play (balls, strikes, hits, outs) — pitch count is a byproduct, not the focus
- Does not generate the specific league-format game summary that EDHLL (and many local leagues) require

**Verdict:** Great product, wrong tool for the job. It's like using Excel when you need a calculator. The scorekeeper who just needs pitch counts will be overwhelmed, and the output doesn't match what the league actually asks for.

---

### 3. Pitch Smart (MLB) — pitchsmart.org

MLB's official pitch count guidance tool. Web-based.

**What it does:**
- Provides age-based pitch count recommendations
- Rest-day calculator
- Educational content about arm safety

**Strengths:**
- Authoritative source (MLB/USA Baseball)
- Good reference material for understanding the rules
- Free

**Weaknesses:**
- Not a game-day tool — it's a reference site, not a counter
- Doesn't track live pitches during a game
- Doesn't account for local league rule variations (EDHLL thresholds differ from MLB recommendations)
- No game summary, no history, no export

**Verdict:** Useful as a rule reference, not as a tool you'd use during a game. Complementary, not competitive.

---

## Positioning Map

```
                    Understands pitching rules
                           ▲
                           │
                           │  ★ Simple Pitch Counter
                           │
          Simple ──────────┼────────── Full scorebook
                           │
          Pitch Counter    │          GameChanger
          (generic)        │
                           │
                           ▼
                    Just counts numbers
```

## Our Differentiation

| Capability | Generic counters | GameChanger | Simple Pitch Counter |
|-----------|-----------------|-------------|---------------------|
| Tap to count | Yes | Yes (buried) | Yes |
| Rest-day threshold alerts | No | Partial | Yes |
| Finish-the-batter logic | No | No | Yes |
| Pitches to current batter | No | Yes | Yes |
| Catcher/pitcher eligibility | No | Yes | Yes |
| League-format game summary | No | No | Yes |
| Works offline | Yes | Partial | Yes |
| Time to first pitch count | <5 sec | 10+ min setup | <30 sec |
| Account required | No | Yes | No |

## Key Takeaway

The opportunity is in the middle. Generic counters are too dumb. GameChanger is too heavy. Nobody has built a pitch counting app that actually understands the rules the scorekeeper is trying to follow — and outputs the specific report format their league requires.

That's the gap we fill.
