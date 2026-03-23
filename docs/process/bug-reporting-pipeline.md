# Bug Reporting & Feedback Pipeline

How user feedback flows from submission to shipped fix.

---

## The Full Flow

```
User submits feedback at simplepitchcounter.com/feedback
  → feedback.php creates a GitHub Issue (labeled, structured)
  → Auto-triage workflow adds "needs-triage" label + checklist comment
  → PM triages weekly: assign priority, milestone, project board
  → Developer creates fix branch: fix/short-name
  → Push triggers PR preview deployment (GitHub Pages)
  → PM QAs the preview
  → Merge to main → auto-deploys to production (NAS)
  → Issue auto-closes via "Closes #XX" in PR
```

---

## 1. Feedback Intake

### Website Feedback Form

**URL:** simplepitchcounter.com/feedback

Users choose Bug Report or Feature Request. The form collects structured data:

**Bug reports:**
- Short summary (required)
- Steps to reproduce
- Expected vs. actual behavior
- Device and iOS version
- Severity (critical / high / medium / low)

**Feature requests:**
- Short summary (required)
- Problem it solves
- Suggested solution

**Backend:** `feedback.php` on the NAS receives the form data and calls the GitHub API to create an Issue with:
- Formatted markdown body with all fields
- Labels: `type: bug` or `type: feature`, `source: feedback-form`, `status: needs-triage`
- Rate limiting: 5 submissions per hour per IP

### Other Intake Channels

- **Contact form** (simplepitchcounter.com/contact) — general inquiries, manually converted to issues if actionable
- **App Store reviews** — monitored in App Store Connect, manually converted to issues
- **Direct email** (hello@simplepitchcounter.com) — manually converted to issues

---

## 2. Auto-Triage

When any new issue is created (from the feedback form or manually), a GitHub Action (`.github/workflows/auto-triage.yml`) automatically:

1. Adds the `status: needs-triage` label
2. Posts a triage checklist comment:
   - [ ] Reviewed and understood the issue
   - [ ] Priority assigned (P0-P3)
   - [ ] Milestone assigned
   - [ ] Added to project board
3. Flags critical/high severity issues for immediate attention

---

## 3. Weekly Triage

Every Monday, review all `status: needs-triage` issues:

1. **Read** the issue and any user context
2. **Classify** — is this a real bug, a feature request, a duplicate, or not actionable?
3. **Prioritize** using the RICE framework:
   - **P0:** App crash or data loss — fix immediately
   - **P1:** Major feature broken — fix this sprint
   - **P2:** Important but not urgent — schedule for next sprint
   - **P3:** Nice to have — backlog
4. **Label** — set priority, area (app/website), and remove `needs-triage`
5. **Assign milestone** — current sprint, next sprint, or backlog
6. **Add to project board** — move to the appropriate column

---

## 4. Fix Workflow

### Branch

```
git checkout -b fix/short-description
```

### Commit

Reference the issue number:
```
git commit -m "Fix undo button at-bat counter (#3)"
```

### Pull Request

- Title references the issue: `Fix: undo button doesn't decrement (#3)`
- Body includes `Closes #XX` to auto-close the issue on merge
- PR triggers preview deployment if website files changed

### QA

- **Website changes:** Review the GitHub Pages preview URL (auto-posted as a PR comment)
- **App changes:** Test on a real device via Xcode
- Run through the [Responsible AI Checklist](../ai/responsible-ai-checklist.md) for any AI-assisted code

### Merge & Deploy

- Merge to main
- Website changes auto-deploy to NAS via GitHub Action
- App changes: run `./scripts/deploy-ios.sh` on the Mac
- Issue auto-closes

---

## 5. Post-Ship

1. Remove the `needs-triage` label if still present
2. Update sprint review docs with what shipped
3. If the fix came from user feedback, consider emailing the submitter (if they left an email)
4. Monitor for regression bugs

---

## Pipeline Diagram

```
                    ┌─────────────────────┐
                    │  User Feedback Form  │
                    │  /feedback           │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  feedback.php        │
                    │  Creates GitHub Issue│
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Auto-Triage Action  │
                    │  Labels + Checklist  │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Weekly Triage       │
                    │  Priority + Sprint   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Fix Branch + PR     │
                    │  Preview Deploy      │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  QA Preview          │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Merge to Main       │
                    │  Auto-deploy to NAS  │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Issue Closed        │
                    │  Sprint Review       │
                    └─────────────────────┘
```

---

## Security Notes

- `feedback.php` contains a GitHub token and is **not tracked in git**
- Rate limiting prevents abuse (5 submissions/hour/IP)
- All user input is sanitized with `strip_tags()` and length-limited
- CORS restricted to simplepitchcounter.com
- The GitHub token uses a fine-grained PAT with only `issues:write` scope
