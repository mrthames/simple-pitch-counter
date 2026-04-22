# Development & Deployment Pipeline

This project follows a structured development pipeline for all changes — from feature branches through QA to production deployment.

---

## Development Workflow

### Branching Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. All deploys come from here. |
| `feature/*` | New features (e.g., `feature/advanced-mode-stats`) |
| `fix/*` | Bug fixes (e.g., `fix/outs-reset-bug`) |
| `docs/*` | Documentation-only changes |

### Change Process

```
1. Create feature branch from main
2. Make changes, commit with descriptive messages
3. Push branch, open Pull Request
4. E2E tests run automatically (GitHub Actions)
5. Review PR, verify tests pass
6. Merge to main
7. Deploy (see below)
```

### Commit Messages

Follow conventional style:
- `Add <feature>` — new functionality
- `Fix <bug>` — bug fix
- `Update <thing>` — enhancement to existing feature
- `Remove <thing>` — removal

---

## Quality Assurance

### Automated E2E Tests

134 Playwright tests run on every push and PR to `main` via GitHub Actions (`test.yml`).

**Test suites:**

| File | Tests | Coverage |
|------|-------|----------|
| `core-game-flow.spec.ts` | 20 | Game lifecycle, scoring, outs (both modes), undo, persistence |
| `advanced-mode.spec.ts` | 21 | Pitch types, B/S/F counting, walks, strikeouts, BIP, auto-outs |
| `thresholds-alerts.spec.ts` | 18 | Rest labels, limit alerts, catcher innings, mercy rule, at-bat warnings |
| `pitcher-catcher.spec.ts` | 11 | Mid-game changes, count preservation, stats, half-inning switching |
| `summary-export.spec.ts` | 19 | Summary screen, export text, umpire data, pitch breakdowns |
| `shareable-stats.spec.ts` | 18 | Share features, swipe-to-dismiss, image card exports, K/BB/BIP boxes |
| `history-config.spec.ts` | 19 | History cards, persistence, setup screen, mode toggle, umpire clearing |
| `about-screen.spec.ts` | 8 | About screen, app info, links, back navigation |

**Run locally:**
```bash
npm test                 # Headless (CI mode)
npm run test:headed      # With browser visible
npm run test:ui          # Interactive Playwright UI
```

### Pre-Merge Checklist

- [ ] All E2E tests pass
- [ ] Manual testing on device for UI changes
- [ ] No regressions in existing features
- [ ] CHANGELOG.md updated (for user-facing changes)

---

## Versioning

### Marketing Version (`CFBundleShortVersionString`)

Set manually in Xcode project (`MARKETING_VERSION`). Current: **2.2**

Bump schedule:
- **Patch** (2.0 → 2.1): bug fixes, small improvements
- **Minor** (2.1 → 2.2): new features
- **Major** (2.x → 3.0): defined by product owner

### Build Number (`CFBundleVersion`)

**Automated.** Set at build time by an Xcode build phase script:

```bash
git rev-list --count HEAD
```

Every git commit increments the build number. No manual action needed.

---

## iOS Deployment (TestFlight / App Store)

### Deploy Steps

1. Merge feature branch to `main`
2. On Mac: **Xcode → Integrate → Pull** (or `git pull` in Terminal)
3. **Xcode → Product → Archive**
   - Build number auto-set from git commit count
   - No encryption compliance prompt (`ITSAppUsesNonExemptEncryption = false`)
4. **Xcode → Window → Organizer → Distribute App**
5. Build appears in TestFlight within minutes

### Before App Store Release

1. Update `MARKETING_VERSION` if needed
2. Update `CHANGELOG.md`
3. Test on a real device
4. Create GitHub Release: `gh release create v2.x.x --notes "..."`

---

## Website Deployment (simplepitchcounter.com)

Hosted on Synology NAS. Deploy via local SCP from Mac (NAS is on local network only — not reachable from GitHub Actions).

### Deploy Steps

Deploy website files via SCP to the NAS web root. Connection details (host, port, SSH key path) are kept outside the repo.

```bash
scp -O -P <port> website/index.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/
scp -O -P <port> website/privacy.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/
scp -O -P <port> website/contact.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/
```

### NAS-Only Files (Not in Git)

| File | Purpose |
|------|---------|
| `contact.php` | Contact form mailer (AWS WorkMail SMTP credentials) |
| `feedback.php` | Feedback form → GitHub Issues (GitHub PAT) |
| `phpmailer/` | PHPMailer library |

---

## Troubleshooting

### E2E tests fail locally
- Ensure `npm ci` has been run
- Ensure Playwright browsers are installed: `npx playwright install chromium`

### Xcode build fails with "multiple commands produce"
- Non-app files (V1/, design HTMLs) must be excluded via `PBXFileSystemSynchronizedBuildFileExceptionSet` in the Xcode project

### Website deploy fails
- Verify SSH connectivity to the NAS (check DSM → Control Panel → Terminal & SNMP for SSH status)

### iOS signing error
- Xcode → Signing & Capabilities → ensure automatic signing with Apple Developer account
