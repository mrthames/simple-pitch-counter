# Deployment Guide

Two deployment targets, two pipelines.

---

## Website → Synology NAS (automated)

Website files deploy automatically when changes to `website/` are pushed to `main`.

### How it works

A GitHub Action (`.github/workflows/deploy-website.yml`) runs on every push that touches `website/**`:

1. Checks out the repo
2. Connects to the NAS via SSH using a deploy key
3. Transfers `website/` files to `/volume1/Websites/simplepitchcounter.com/` via SSH+tar (Synology doesn't support rsync/scp over SSH by default)
4. `contact.php` and `feedback.php` are not tracked in git, so they're never overwritten (credentials — managed separately on the NAS)
5. Verifies the deployment by listing the remote directory

### Manual trigger

You can also trigger a deploy manually from GitHub → Actions → "Deploy Website to NAS" → Run workflow.

### Local SCP fallback

If the GitHub Action fails (e.g., NAS not reachable externally), deploy from any machine on the local network:

```bash
scp -O -P 2222 -i ~/.ssh/id_ed25519 website/index.html justin@192.168.1.234:/volume1/Websites/simplepitchcounter.com/
scp -O -P 2222 -i ~/.ssh/id_ed25519 website/privacy.html justin@192.168.1.234:/volume1/Websites/simplepitchcounter.com/
scp -O -P 2222 -i ~/.ssh/id_ed25519 website/contact.html justin@192.168.1.234:/volume1/Websites/simplepitchcounter.com/
scp -O -P 2222 -i ~/.ssh/id_ed25519 website/feedback.html justin@192.168.1.234:/volume1/Websites/simplepitchcounter.com/
```

Connection details: `justin@192.168.1.234:2222` with `~/.ssh/id_ed25519`.

### Setup (one-time, already completed)

1. Generated an ED25519 SSH key pair (`~/.ssh/spc_deploy` on the Mac)
2. Added the public key to `~/.ssh/authorized_keys` on the NAS
3. Enabled `PubkeyAuthentication` in `/etc/ssh/sshd_config` on the NAS
4. Set correct permissions: `~` = 755, `~/.ssh` = 700, `authorized_keys` = 600
5. Added four GitHub Actions secrets (values stored in GitHub, not in this repo):
   - `NAS_SSH_KEY` — the private deploy key
   - `NAS_HOST` — the NAS hostname
   - `NAS_USER` — the SSH username
   - `NAS_SSH_PORT` — the SSH port (2222)

### Important: NAS-only files

The following files contain credentials and are **not tracked in git**. They live only on the NAS at `/volume1/Websites/simplepitchcounter.com/` and are never overwritten by automated deploys:

| File | Purpose | Credentials |
|------|---------|-------------|
| `contact.php` | Contact form mailer | AWS WorkMail SMTP password |
| `feedback.php` | Feedback form → GitHub Issues | GitHub fine-grained PAT (issues: write) |
| `phpmailer/` | PHPMailer library (required by contact.php) | — |

To update credentials: edit the file locally (gitignored) and deploy manually:
```bash
scp -O -i ~/.ssh/spc_deploy -P $NAS_SSH_PORT website/contact.php website/feedback.php $NAS_USER@$NAS_HOST:/volume1/Websites/simplepitchcounter.com/
```
*(Connection details are stored as GitHub Actions secrets — see Setup below.)*

---

## iOS App → App Store (semi-automated)

The iOS build requires Xcode on the Mac. A deploy script handles the build-to-upload pipeline.

### Quick deploy

From your Mac, in the repo directory:

```bash
cd ~/Projects/Sub-Projects/simple-pitch-counter
./scripts/deploy-ios.sh
```

The script will:
1. `git pull` the latest code
2. Clean the previous build
3. Build and archive the Xcode project
4. Export the IPA
5. Attempt to upload to App Store Connect

### Manual deploy (via Xcode)

If the script fails or you prefer the GUI:

1. `git pull` in Terminal
2. Open `app/Little League Pitch Counter.xcodeproj`
3. Product → Archive
4. Window → Organizer → select the archive → Distribute App
5. Follow the App Store Connect prompts

### Before each App Store release

1. Bump the version/build number in Xcode (target → General → Identity)
2. Update `CHANGELOG.md`
3. Run through the [Responsible AI Checklist](../ai/responsible-ai-checklist.md)
4. Test on a real device
5. Create a GitHub Release tag: `git tag v1.x.x && git push --tags`

---

## Full Release Workflow

When shipping a new version:

```
1. Finish code changes on main
2. Test on device
3. Update CHANGELOG.md
4. Push to main
   → Website deploys automatically (if website/ changed)
5. On Mac: git pull
6. Run ./scripts/deploy-ios.sh (or archive via Xcode)
7. Submit for App Store review in App Store Connect
8. Create GitHub Release: gh release create v1.x.x --notes "..."
9. Update sprint review docs
```

---

## Troubleshooting

### Website deploy fails

- **SSH connection refused:** Check that SSH port forwarding is active and SSH is enabled in DSM → Control Panel → Terminal & SNMP
- **Permission denied:** Verify the deploy key is in `~/.ssh/authorized_keys` on the NAS and file permissions are correct (home=755, .ssh=700, authorized_keys=600)
- **Transfer fails:** The workflow uses SSH+tar. Verify the NAS user has write access to the web root directory.

### iOS build fails

- **Signing error:** Open the project in Xcode, go to Signing & Capabilities, and ensure automatic signing is enabled with your Apple Developer account
- **Missing ExportOptions.plist:** Archive once manually in Xcode (Product → Archive → Distribute → Export) to generate the plist, then copy it to `scripts/ExportOptions.plist`
- **altool upload fails:** Use Xcode Organizer or Transporter.app as a fallback
