# Simple Pitch Counter — Product Vision

**One-liner:** A pitch counting app built for the person sitting behind the backstop, not the person sitting at a desk.

---

## The Problem

Every youth baseball game requires someone to count pitches. League rules tie pitch counts to mandatory rest days — get it wrong and a kid either pitches when they shouldn't, or sits out a game they didn't need to miss. The person doing this counting is usually a parent volunteer with a paper scoresheet, a phone calculator, and a laminated chart of rest-day thresholds.

It's a bad setup for accurate data.

## What We Built

Simple Pitch Counter replaces the paper-and-calculator workflow with a single-purpose iOS app that:

- Counts pitches with one tap
- Knows the league's threshold rules and alerts the scorekeeper in real time
- Handles the "finish the batter" edge case correctly (most people get this wrong on paper)
- Generates the exact report format the league requires and lets you email it before you leave the parking lot

## Who It's For

Volunteer scorekeepers, coaches, and team parents at Little League and youth softball programs. These are not power users — they want something that works immediately, doesn't require an account, and doesn't need cell service at the field.

## What Makes It Different

Most pitch counter apps are glorified tally counters. They count up. That's it. Simple Pitch Counter is opinionated about the workflow:

- It understands rest-day thresholds, not just totals
- It tracks pitches to the current batter separately (required for threshold rules)
- It tracks catcher innings and flags pitcher/catcher eligibility conflicts
- It generates the specific post-game report format leagues actually require
- It works offline — completely. No account, no cloud, no ads.

## Where It's Going

**Near-term:** Polish the core experience, add pre-built configs for more league formats, improve game history and season-level stats.

**Medium-term:** Make the app available as a web app at simplepitchcounter.com so Android users and desktop scorekeepers can use it without the App Store.

**Long-term:** Explore lightweight team features — share a game summary link, let a coach check pitch counts from their phone while the scorekeeper tracks.

## Business Model

Free. No ads, no subscription, no in-app purchases. This is a utility that should be free for the same reason the league provides the scorebook for free — it's infrastructure for running a game correctly.
