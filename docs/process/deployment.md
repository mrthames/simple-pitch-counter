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
4. `contact.php` is not tracked in git, so it's never overwritten (credentials — managed separately on the NAS)
5. Verifies the deployment by listing the remote directory

### Manual trigger

You can also trigger a deploy manually from GitHub → Actions → "Deploy Website to NAS" → Run workflow.

### Setup (one-time, already completed)

1. Generated an ED25519 SSH key pair (`~/.ssh/spc_deploy` on the Mac)
2. Added the public key to `~/.ssh/authorized_keys` on the NAS
3. Enabled `PubkeyAuthentication` in `/etc/ssh/sshd_config` on the NAS
4. Set correct permissions: `~` = 755, `~/.ssh` = 700, `authorized_keys` = 600
5. Added three GitHub Actions secrets:
   - `NAS_SSH_KEY` — the private key
   - `NAS_HOST` — `nas.thameshome.com`
   - `NAS_USER` — `justin`

### Important: contact.php

The contact form backend (`contact.php`) contains SMTP credentials and is **not tracked in git**. It lives only on the NAS. The rsync `--exclude='contact.php'` flag ensures it's never overwritten during deployment. If you need to update it, edit it directly on the NAS.

---

## iOS App → App Store (semi-automated)

The iOS build requires Xcode on the Mac. A deploy script handles the build-to-upload pipeline.

### Quick deploy

From your Mac, in the repo directory:

```bash
cd ~/Documents/simple-pitch-counter
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

- **SSH connection refused:** Check that port 22 is forwarded to the NAS and SSH is enabled in DSM → Control Panel → Terminal & SNMP
- **Permission denied:** Verify the deploy key is in `~/.ssh/authorized_keys` on the NAS and file permissions are correct
- **rsync not found:** Synology DSM includes rsync by default, but verify with `ssh justin@nas.thameshome.com which rsync`

### iOS build fails

- **Signing error:** Open the project in Xcode, go to Signing & Capabilities, and ensure automatic signing is enabled with your Apple Developer account
- **Missing ExportOptions.plist:** Archive once manually in Xcode (Product → Archive → Distribute → Export) to generate the plist, then copy it to `scripts/ExportOptions.plist`
- **altool upload fails:** Use Xcode Organizer or Transporter.app as a fallback
