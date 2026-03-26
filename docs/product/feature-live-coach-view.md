# Feature Spec: Live Coach View

**Author:** Justin Thames
**Last updated:** 2026-03-26
**Status:** Deferred
**Related issue:** [#33](https://github.com/mrthames/simple-pitch-counter/issues/33)
**Epic:** Platform Expansion
**Persona:** Mike — The Head Coach

---

## Problem Statement

During a live game, coaches need real-time pitch count information but can't easily access it. The scorekeeper (Lisa) is behind the backstop with the app, while the coach (Mike) is in the dugout or coaching third base. Today, Mike has to yell over to Lisa for a number — which is disruptive, unreliable, and sometimes impossible during an active play.

From Mike's persona:
> "I need to know two things: how many pitches is he at, and can he still pitch on Thursday."

The product vision acknowledges this as a long-term goal: "Explore lightweight team features — share a game summary link, let a coach check pitch counts from their phone while the scorekeeper tracks."

---

## Proposed Solution

A real-time, read-only view of the live game that coaches can access from their own device — either within the iOS app or via a web browser.

### User Flow: Scorekeeper (Lisa)

1. Lisa starts a game as usual
2. From the hamburger menu, she taps **"Go Live"**
3. The app generates a unique 6-character game code (e.g., `K7RM4X`)
4. A modal displays the code in large text, a QR code, and a share button
5. Lisa shares the code verbally or via text/AirDrop
6. A green "LIVE" indicator appears in the game header while sharing is active
7. The app pushes game state to the cloud on a debounced interval
8. When the game ends, the live session automatically closes

### User Flow: Coach (Mike)

**In-app:**
1. Mike opens Simple Pitch Counter on his iPhone
2. On the history screen, he taps **"Watch Live"**
3. He enters the 6-character code Lisa gave him
4. A read-only game view opens showing live data

**Web (no app needed):**
1. Mike scans the QR code with his phone camera
2. Safari opens `live.simplepitchcounter.com/live/K7RM4X`
3. The same read-only view renders in the browser

### Coach View Contents

| Section | Data shown |
|---------|------------|
| Header | Teams, score, current inning/half |
| Active pitcher | Name, total pitches, pitches to current batter, rest-day status |
| All pitchers | Grouped by team, total counts, rest days, done/active badges |
| Catchers | Innings caught, eligibility alerts |
| Alerts | Threshold warnings, catcher/pitcher restrictions |
| Staleness | "Last updated X seconds ago" with color coding (green < 30s, yellow < 2min, red > 2min) |

---

## Technical Architecture

### Infrastructure: Firebase Realtime Database

Firebase RTDB was selected as the best fit for these reasons:

| Requirement | Firebase RTDB |
|-------------|--------------|
| Free tier | 1 GB stored, 10 GB/month transfer, 100 concurrent connections |
| No-build integration | Single `<script>` tag, works in WKWebView |
| Offline support | Built-in client-side write queue |
| Security | Declarative JSON rules (read/write per path) |
| Real-time | Sub-second `.on('value')` listeners |
| Web hosting | Firebase Hosting free tier for the coach view page |

### Game Code Format

- **Characters:** `ABCDEFGHJKMNPQRSTUVWXYZ23456789` (28 chars, ambiguous characters excluded)
- **Length:** 6 characters
- **Code space:** 28^6 = ~481 million possible codes
- **Generation:** `crypto.getRandomValues()` for cryptographic randomness
- **Uniqueness:** Enforced server-side via Firebase transaction on `/codes/{CODE}`

### Data Model (Firebase RTDB)

```
/live/{GAME_CODE}/
  meta/
    homeTeam, awayTeam, field, date, time
    configId, createdBy (anonymous uid), createdAt, expiresAt
  state/
    inning, isTop, homeScore, awayScore
    homeActivePIdx, awayActivePIdx, homeActiveCIdx, awayActiveCIdx
  home/
    pitchers/
      0: { name, num, pitches, currentBatterPitches, innings, done, lastBatterPitches }
    catchers/
      0: { name, num, innings }
  away/
    (same structure)
  config/
    pitchMax, catcherInnMax, thresholds
  lastUpdated: (server timestamp)

/codes/{GAME_CODE}: true  (write-once index for uniqueness)
```

### Security Rules

```json
{
  "rules": {
    "live": {
      "$code": {
        ".read": true,
        ".write": "!data.exists() || data.child('meta/createdBy').val() === auth.uid"
      }
    },
    "codes": {
      "$code": {
        ".read": false,
        ".write": "!data.exists()"
      }
    }
  }
}
```

- **Authentication:** Firebase Anonymous Auth (no user-facing account creation)
- **Write access:** Only the original session creator (matched by anonymous `uid`)
- **Read access:** Anyone with the game code (intentional — coaches need frictionless access)

### Sync Strategy

| Trigger | Debounce | Rationale |
|---------|----------|-----------|
| `saveState()` (pitch, next batter, undo) | 5 seconds | Avoids flooding Firebase during rapid tapping |
| Pitcher change, half-inning, threshold crossing | Immediate | Coaches need these events in real time |
| Heartbeat (no changes) | 60 seconds | Keeps "last updated" fresh, signals session is alive |
| `pagehide` (app backgrounded) | Immediate | Best-effort final push before app suspends |

**Payload:** Full game snapshot (~2-4 KB JSON) per push. Not incremental diffs — simplicity over optimization at this data size.

**Offline behavior:** Firebase SDK queues writes when offline. When connectivity restores, queued writes flush automatically. Local `localStorage` is unaffected — the app continues to work normally regardless of sync state.

### Web Coach View

- Hosted on **Firebase Hosting** at `live.simplepitchcounter.com`
- Separate standalone HTML file (not the app's `index.html`)
- DNS: CNAME record for `live.simplepitchcounter.com` → Firebase Hosting
- Main marketing site stays on Synology NAS, unaffected

### QR Code Generation

- Library: `qrcode-generator` by Kazuhiko Arase (~4 KB minified)
- Inlined directly in `index.html` to preserve offline/no-build architecture
- Generates a `data:` URI rendered in an `<img>` tag

---

## Implementation Phases

### Phase 1: Firebase Foundation + Scorekeeper Push

- Create Firebase project, configure RTDB + Anonymous Auth
- Deploy security rules
- Add Firebase SDK to `app/index.html` (modular, via inline import)
- Implement game code generation and claiming
- Add `syncToFirebase()` debounced hook into `saveState()`
- Add "Go Live" / "Stop sharing" to hamburger menu
- Add QR code library and "Go Live" modal
- Test: verify data appears in Firebase console

### Phase 2: Web Coach View

- Create `live-viewer/index.html` (standalone page)
- Firebase SDK + RTDB listener on `/live/{CODE}/`
- Build read-only game display with all sections
- Add staleness indicator, error states
- Set up Firebase Hosting, deploy, configure DNS
- Style to match app visual language

### Phase 3: In-App Coach View

- Add `screen-live-view` to `app/index.html`
- Add "Watch Live" button to history screen
- Add code entry modal
- Reuse existing `pitchAlerts()`, `restInfo()`, alert rendering
- Firebase listener lifecycle (connect on join, disconnect on leave)

### Phase 4: Polish

- Persistent "LIVE" indicator in game header
- 60-second heartbeat timer
- "Reconnecting..." overlay for coach view
- Session expiration cleanup
- Native share sheet via `WKScriptMessageHandler`
- QR scanning (camera access in WKWebView — optional)

---

## Decision: Deferred

**Date:** 2026-03-26

### Why deferred

The app is free with a deliberate zero-cost operating model (from the vision doc: "Free. No ads, no subscription, no in-app purchases. This is a utility that should be free for the same reason the league provides the scorebook for free.").

Every real-time sync option evaluated introduces infrastructure cost that scales with usage:

| Option | Free limit | Cost at scale (1000 concurrent) |
|--------|------------|--------------------------------|
| Firebase RTDB (Spark) | 100 connections | Blaze plan: ~$1-5/month |
| Supabase | 200 connections | Pro plan: $25/month |
| Ably | 100 connections | $30+/month |
| WebRTC | Signaling server needed | Variable |

While Firebase's costs are modest, the principle matters: introducing a backend dependency for a free app creates an ongoing obligation. If the app grows (which is the goal), costs grow with it — and there's no revenue to offset them.

Local alternatives (Bluetooth, AirDrop) were evaluated and rejected: Bluetooth has range limitations (~30 feet), AirDrop is one-shot file transfer (not live streaming), and neither supports a web URL fallback.

### Revisit criteria

- **User demand:** 3+ feedback submissions or App Store reviews requesting live sharing
- **Scale justification:** App reaches 500+ monthly active users, making $1-5/month infrastructure cost proportionally trivial
- **Zero-cost breakthrough:** A viable peer-to-peer solution emerges that requires no server infrastructure (e.g., WebTransport matures, or a free-tier service offers unlimited connections)

---

## Files Affected (when implemented)

| File | Changes |
|------|---------|
| `app/index.html` | Firebase SDK, "Go Live" UI, sync logic, QR generation, in-app coach view screen |
| `app/ViewController.swift` | Native share sheet bridge, potentially camera access for QR scanning |
| `live-viewer/index.html` | New file — standalone web coach view |
| `firebase.json` | New file — Firebase Hosting config and rewrite rules |
| `database.rules.json` | New file — RTDB security rules |
