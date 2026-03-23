# PM ↔ Engineering Workflow

How work moves from idea to shipped in the Simple Pitch Counter project.

---

## Intake

New work enters the system from three sources:

1. **User feedback** — contact form on simplepitchcounter.com, App Store reviews, direct emails
2. **Internal observation** — bugs found during personal use, ideas from coaching games
3. **League rule changes** — EDHLL bylaw updates that affect pitch count logic

All incoming items become **GitHub Issues** using the appropriate template (bug report or feature request). They're automatically labeled `status: needs-triage`.

## Triage (weekly)

Every Monday, review all `status: needs-triage` issues:

1. **Duplicate check** — is this already filed?
2. **Clarify** — if the issue is unclear, comment asking for details
3. **Label** — assign type (bug/feature/improvement), area (app/website), and priority (P0-P3)
4. **Score** — add RICE score to the issue description for features
5. **Assign milestone** — if it's clearly sprint-bound, assign it. Otherwise leave in backlog.

Remove the `needs-triage` label when done.

## Sprint Planning (bi-weekly)

At the start of each 2-week sprint:

1. Review the current milestone's issues
2. Pull in P0/P1 items first, then fill with highest-RICE P2 items
3. Set the sprint goal (one sentence describing what this sprint accomplishes)
4. Assign issues to the sprint on the project board
5. Break large issues into smaller tasks if needed

## Building

1. Create a feature branch: `feature/short-name` or `fix/short-name`
2. Reference the issue number in commits: `Fix undo button at-bat counter (#3)`
3. Keep changes small and focused — one issue per branch
4. Test on device before opening PR

## Review & Ship

1. Open a PR linking to the issue: `Closes #3`
2. Self-review the diff (this is a solo project, but the habit matters)
3. Merge to main
4. Tag a GitHub Release if shipping to App Store
5. Update CHANGELOG.md
6. Close the issue

## Post-Ship

1. Update sprint review doc with what shipped
2. Monitor for regression bugs
3. If the change affects the game summary format, verify it still matches the league form

---

## Cadence Summary

| Activity | Frequency | When |
|----------|-----------|------|
| Triage | Weekly | Monday |
| Sprint planning | Bi-weekly | Sprint start |
| Sprint review | Bi-weekly | Sprint end |
| Stakeholder update | Monthly | Last Friday of month |
| Roadmap review | Quarterly | Start of quarter |
