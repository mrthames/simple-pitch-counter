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

### Marketing Version

Set manually. Current: **2.2**. Kept in sync between iOS (`MARKETING_VERSION` in Xcode) and Android (`versionName` in `build.gradle.kts`).

Bump schedule:
- **Patch** (2.0 → 2.1): bug fixes, small improvements
- **Minor** (2.1 → 2.2): new features
- **Major** (2.x → 3.0): defined by product owner

### Build Number / Version Code

**Automated.** Both platforms derive the build number from git commit count at build time:

```bash
git rev-list --count HEAD
```

- **iOS:** Xcode build phase script sets `CFBundleVersion`
- **Android:** Gradle `providers.exec` sets `versionCode`

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

## Android Deployment (Google Play)

### Deploy Steps

1. Merge feature branch to `main`
2. Open Android Studio, pull latest from main
3. **Build → Clean Project** (forces Gradle to re-read git commit count for versionCode)
4. **Build → Generate Signed Bundle**
   - Module: `SimplePitchCounter.app`
   - Key store path: `android/upload-keystore.jks`
   - Key alias: `upload`
   - Check "Remember passwords" to save for future builds
5. Go to **Google Play Console → Testing → Closed testing → Closed Beta**
6. **Create new release** → upload AAB from `android/app/build/outputs/bundle/release/app-release.aab`
7. Release name: `2.x (build N)` where N = versionCode shown in the console
8. Add release notes → **Review release** → **Start rollout**

> **Important:** Always Clean Project before generating a signed bundle. Gradle caches the versionCode and will reject the upload if it matches a previously uploaded version code.

### Signing

- **Upload keystore:** `android/upload-keystore.jks` (gitignored, stored locally)
- **Keystore config:** `android/keystore.properties` (gitignored, contains passwords)
- Google Play App Signing re-signs the app with Google's own key for distribution

### Release Tracks

| Track | Status | Purpose |
|-------|--------|---------|
| Internal testing | Available | Up to 100 testers, no review, available in minutes |
| Closed testing (Closed Beta) | **Active** | Invite-only testers, requires review |
| Production | Locked | Requires 12 opted-in testers on closed testing for 14 days |

---

## Website Deployment (simplepitchcounter.com)

Hosted on Synology NAS via Nginx (Web Station). Deploy via local SCP (NAS is on local network only — not reachable from GitHub Actions).

### Deploy Steps

Deploy website files via SCP to the NAS web root. Connection details (host, port, SSH key path) are kept outside the repo.

Each page must be deployed to **two locations** for clean URL support:

```bash
# Root location (backward compatibility)
scp -O -P <port> website/index.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/

# Subpage — both root .html and directory index.html
scp -O -P <port> website/android-beta.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/android-beta.html
scp -O -P <port> website/android-beta.html <user>@<nas-host>:/volume1/Websites/simplepitchcounter.com/android-beta/index.html
```

Repeat the two-location pattern for `privacy`, `contact`, and `feedback` pages.

### Clean URLs

Pages are served via directory-based URLs (e.g., `simplepitchcounter.com/android-beta/` instead of `android-beta.html`). Nginx serves `index.html` from subdirectories automatically. All internal links use extensionless paths (e.g., `href="privacy"` not `href="privacy.html"`).

### NAS-Only Files (Not in Git)

| File | Purpose |
|------|---------|
| `android-beta.php` | Android beta signup form mailer (AWS WorkMail SMTP credentials) |
| `contact.php` | Contact form mailer (AWS WorkMail SMTP credentials) |
| `feedback.php` | Feedback form → GitHub Issues (GitHub PAT) |
| `phpmailer/` | PHPMailer library |

These files contain credentials and are deployed directly via SCP — never committed to git.

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

### Android version code already used
- Gradle caches the versionCode from `git rev-list --count HEAD`. Run **Build → Clean Project** then rebuild the signed bundle. The new commit count will be picked up.

### Android AAB timestamp looks stale
- Gradle may report "UP-TO-DATE" for tasks if sources haven't changed since last build. Run **Build → Clean Project** first to force a full rebuild.
