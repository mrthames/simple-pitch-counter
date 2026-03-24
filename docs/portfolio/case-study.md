# Case Study: Building Simple Pitch Counter — PM Process Start to Finish

**Author:** Justin Thames
**Date:** March 2026

---

## The Situation

I coach youth baseball in El Dorado Hills Little League (EDHLL). Every game, a parent volunteer sits behind the backstop counting pitches on a paper scoresheet. League rules tie those counts to mandatory rest days — get the number wrong and a kid either pitches when they shouldn't or sits out a game unnecessarily.

The existing tools were bad. Generic tally counter apps don't understand rest-day thresholds. Paper scoresheets get lost. And the league requires a formatted game summary emailed within two hours of the final out. I watched scorekeepers struggle with this at every game, and I'd struggled with it myself.

I decided to build the app that should exist.

## Discovery & Definition

### Understanding the Problem

I started where any PM should: with the users. The primary user isn't a coach — it's the scorekeeper, usually a parent who volunteered five minutes before the game started. They may not know the rules. They're managing their own kids. They need something that works immediately without a tutorial.

I identified three personas:
- **The Volunteer Scorekeeper** — needs simplicity and accuracy above all else
- **The Head Coach** — needs mid-game visibility into pitcher availability
- **The Player Agent** — needs consistent, league-compliant post-game reports

### Defining Requirements

I wrote a PRD anchored to the actual league bylaws — not a paraphrased version, the primary source PDFs. This matters because the rules are counterintuitive. For example, the "finish the batter" rule: if a pitcher crosses a threshold mid-at-bat, you record the count at the threshold, not the actual number thrown. Most coaches get this wrong on paper. Getting it wrong in software would be worse.

Key requirements:
- One-tap pitch counting with undo
- Real-time threshold alerts based on league-specific configs
- Per-batter pitch tracking (required for the finish-the-batter rule)
- Automatic rest-day calculation
- Post-game summary matching the league's exact form format
- Fully offline — cell service at youth baseball fields is unreliable
- No account required, no cloud dependency, no ads

## Prioritization & Planning

### Building the Backlog

I created 15 issues in GitHub, each scored using the RICE framework (Reach, Impact, Confidence, Effort). This wasn't arbitrary — I scored them based on how many games per week a feature affects and how painful the absence is during a live game.

Top priorities:
- **P1:** Pre-built league configs, undo button fix, game summary formatting, App Store link fix
- **P2:** CSV export, rest-day calendar, same-day doubleheaders, onboarding flow
- **P3:** Dark mode, haptic feedback, roster management

### Sprint Structure

I organized work into two-week sprints with clear goals:
- **Sprint 1 (Apr 7-18):** Core stability — fix the P1 bugs and add league configs
- **Sprint 2 (Apr 21-May 2):** Game day polish — improve the summary, add CSV export
- **Q3 2026:** Web app / PWA launch for cross-platform access

Each sprint follows a defined workflow: intake → triage → planning → build → review → ship → post-ship monitoring.

## Key Technical Decision: PWA vs. Native Android

Half of youth baseball parents use Android. Building a native Android app would take months and create a second codebase to maintain. The app is already a single HTML file running inside an iOS WKWebView — the same code could be served as a Progressive Web App at simplepitchcounter.com.

I wrote a go/no-go decision memo evaluating three options:
1. Native Android app (3 months, separate codebase)
2. PWA at simplepitchcounter.com (2-3 weeks, same code)
3. Do nothing

**Decision: Go with PWA**, conditional on offline reliability via service worker and verified localStorage persistence across browser sessions. This ships cross-platform access in weeks instead of months with near-zero marginal maintenance.

## Working with AI

This project was built with AI assistance (Claude Code CLI) — and I'm transparent about that because the *how* matters as much as the *what*.

### What AI Did Well
- **Cross-file reasoning:** When fixing a bug where the history card dropped pitchers who exceeded all thresholds, the AI could read the broken function, find the working implementation elsewhere in the codebase, and produce a fix matching the established pattern.
- **Artifact generation:** Drafting PRDs, sprint reviews, and decision memos from real project context — not generic templates.
- **Workflow automation:** Creating GitHub Issues, configuring project boards, managing milestones — all from the terminal.

### What AI Couldn't Do
- **Domain judgment:** The AI doesn't know that the finish-the-batter rule confuses experienced coaches. I had to provide the bylaw text and worked examples.
- **Prioritization decisions:** RICE scores require understanding which features matter during a live game. That comes from sitting in the folding chair, not from a prompt.
- **Voice:** Every document the AI drafted was rewritten to sound like me, not like a template.

### Lessons Learned
1. **Describe patterns, not instances** — "handle when a count exceeds all thresholds" produces better code than "handle when count > 50"
2. **Attach the spec** — feeding the actual league bylaws PDF produced correct implementations on the first pass
3. **Iterate on the prompt before iterating on the code** — 5 minutes refining the prompt saves more time than debugging a vague implementation

I documented these in a prompt engineering log and maintained an AI risk register with 10 identified risks and mitigations.

## Measuring Success

I defined 7 KPIs tied to real outcomes:
1. **Game completion rate** >90% (started games that produce a summary)
2. **Time to summary** <5 minutes after the final out
3. **Pitch count accuracy** — zero threshold/rest-day calculation errors
4. **Setup time** <60 seconds for returning users
5. **App Store rating** 4.5+ stars
6. **Weekly active games** — growth during season
7. **Bug resolution time** — P1 bugs fixed within 48 hours

These aren't vanity metrics. Every one maps to a real problem a scorekeeper faces at the field.

## What This Demonstrates

| PM Skill | How It Shows Up |
|----------|----------------|
| Product definition | PRD, vision one-pager, personas grounded in real users |
| Prioritization | RICE-scored backlog, sprint planning, P0-P3 triage |
| Stakeholder communication | Sprint reviews, monthly updates, decision memos |
| Technical decision-making | PWA go/no-go, architecture trade-offs, build vs. buy |
| Metrics & measurement | KPI framework tied to user outcomes, not vanity metrics |
| Process design | End-to-end workflow documentation, feedback intake, onboarding guide |
| AI fluency | Documented model selection, prompt engineering, risk management |
| Shipping | Real app in the iOS App Store, real website, real users |

---

*Simple Pitch Counter is available on the [iOS App Store](https://apps.apple.com/us/app/simple-pitch-counter/id6760922314) and at [simplepitchcounter.com](https://simplepitchcounter.com).*
