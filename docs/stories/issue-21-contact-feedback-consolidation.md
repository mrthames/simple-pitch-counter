# User Stories — Issue #21: Contact & Feedback Form Consolidation

**Source:** [Issue #21](https://github.com/mrthames/simple-pitch-counter/issues/21) (internal feedback, medium severity)
**Reporter:** Justin Thames
**Sprint:** Sprint 1: Foundation
**Epic:** Website UX

---

## Problem Statement

The website currently has two overlapping pages — Contact (`/contact`) and Feedback (`/feedback`) — that both handle bug reports and feature requests. This creates confusion about where to submit what. Additionally, the Feedback link is inconsistently shown in the navigation across pages, and form field alignment needs improvement.

---

## Story 1: Consolidate contact and feedback into a single page

**As a** website visitor,
**I want** a single, clear page to submit bugs, feature requests, or general inquiries,
**so that** I don't have to guess which form to use.

### Acceptance Criteria
- [ ] The `/contact` page is removed
- [ ] The `/feedback` page becomes the single entry point for all communication
- [ ] The feedback form adds a "General inquiry" type option alongside Bug Report and Feature Request
- [ ] General inquiry submissions send an email (existing contact.php behavior) instead of creating a GitHub Issue
- [ ] Bug report and feature request submissions continue to create GitHub Issues (existing feedback.php behavior)
- [ ] All existing links to `/contact` redirect or point to `/feedback`

### Technical Notes
- `contact.html` is removed from the repo and deploy workflow
- `contact.php` remains on the NAS for email sending, called by the general inquiry path
- `feedback.php` continues handling bug/feature → GitHub Issues
- Update `deploy-website.yml` to remove `contact.html` from the tar file list

### Size: M

---

## Story 2: Add feedback link to navigation on all pages

**As a** website visitor on any page,
**I want** to see the Feedback link in the navigation bar,
**so that** I can easily submit feedback from anywhere on the site.

### Acceptance Criteria
- [ ] The Feedback nav link appears on all pages: `index.html`, `privacy.html`, and `feedback.html`
- [ ] The Feedback link replaces the Contact link in the nav (since contact is being consolidated)
- [ ] Nav link order: Features | Privacy | Feedback
- [ ] On `index.html`, nav also includes "How it works" (existing anchor link)
- [ ] Feedback link uses the gold highlight color (`#e8a030`) consistently across all pages
- [ ] Footer links updated to match: Home | Privacy Policy | Feedback

### Technical Notes
- Currently `index.html` and `feedback.html` have the Feedback link; `contact.html` and `privacy.html` do not
- Update nav in: `index.html`, `privacy.html`, `feedback.html`
- Update footer links in all pages

### Size: S

---

## Story 3: Fix form field alignment on the feedback page

**As a** user filling out the feedback form,
**I want** the form fields to be visually aligned and consistent,
**so that** the form feels polished and easy to use.

### Acceptance Criteria
- [ ] All form fields (inputs, selects, textareas) have consistent left alignment
- [ ] Field labels are evenly spaced above their inputs
- [ ] The bug-specific and feature-specific field groups align with the shared fields above them
- [ ] Form looks correct on both desktop (two-column layout) and mobile (single-column)
- [ ] Verified on Chrome, Safari, and Firefox

### Technical Notes
- Inspect current CSS for `.form-group`, `.form-row`, and the type-toggle section
- Likely a padding/margin inconsistency between conditional field groups

### Size: S

---

## Story 4: Add in-app link to website feedback form

**As an** app user,
**I want** a way to submit feedback directly from within the app,
**so that** I can report bugs or request features without having to find the website.

### Acceptance Criteria
- [ ] A "Send Feedback" option appears in the app's menu/settings area accessible from the Game History page
- [ ] Tapping it opens `https://simplepitchcounter.com/feedback` in an in-app Safari browser (SFSafariViewController)
- [ ] The link works when the device has an internet connection
- [ ] If offline, the user sees a brief message that feedback requires an internet connection

### Technical Notes
- Use `SFSafariViewController` (not `UIApplication.shared.open`) so the user stays in the app
- Add to the existing settings/menu view that's accessible from Game History
- No changes to the feedback form itself — it's already mobile-responsive

### Size: S

---

## Story Map

```
                    Issue #21
                        │
        ┌───────────────┼───────────────┬──────────────┐
        ▼               ▼               ▼              ▼
   Story 1          Story 2         Story 3        Story 4
   Consolidate      Nav link on     Fix field      In-app
   contact +        all pages       alignment      feedback
   feedback                                        link
   [Website]        [Website]       [Website]      [iOS App]
   Size: M          Size: S         Size: S        Size: S
```

---

## Suggested Priority & Sequencing

| Order | Story | Rationale |
|-------|-------|-----------|
| 1 | Story 2 — Nav consistency | Quick win, no page removal needed, unblocks testing |
| 2 | Story 3 — Field alignment | Quick CSS fix, polish before consolidation |
| 3 | Story 1 — Consolidate pages | Largest change, depends on nav being correct first |
| 4 | Story 4 — In-app link | Independent iOS work, can be done in parallel or deferred |

---

## Definition of Done

- [ ] Code reviewed via PR
- [ ] PR preview verified on GitHub Pages (Stories 1-3)
- [ ] Tested on mobile and desktop browsers
- [ ] Deployed to production (NAS for website, App Store for Story 4)
- [ ] Issue #21 closed via `Closes #21` in the final PR
