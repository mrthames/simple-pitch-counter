# Contributing to Simple Pitch Counter

## How to report a bug

Use the [Bug Report template](https://github.com/mrthames/simple-pitch-counter/issues/new?template=bug_report.yml) on GitHub Issues. Include steps to reproduce, what you expected, and what actually happened. Screenshots or screen recordings help a lot.

## How to request a feature

Use the [Feature Request template](https://github.com/mrthames/simple-pitch-counter/issues/new?template=feature_request.yml). Describe the problem you're trying to solve, not just the solution you want. Context about your league or role (coach, scorekeeper, parent) helps with prioritization.

## How work gets done

### Idea to shipped

1. **Issue filed** — bugs or feature requests come in via GitHub Issues or the contact form on simplepitchcounter.com
2. **Triage** — new issues get the `status: needs-triage` label. They're reviewed for clarity, duplicates, and initial priority
3. **Prioritized** — issues are scored and assigned a priority label (P0–P3), area label, and added to the project board backlog
4. **Sprint planned** — P0/P1 items and selected P2 items are pulled into the current sprint
5. **Built** — work happens on a feature branch, linked to the issue
6. **Reviewed** — PR opened, linked to issue, code reviewed
7. **Shipped** — merged to main, tagged in a GitHub Release with release notes
8. **Communicated** — changelog updated, App Store release notes written

### Branch naming

- `fix/short-description` — bug fixes
- `feature/short-description` — new features
- `docs/short-description` — documentation changes

### Commit messages

Keep them short and descriptive. Reference the issue number:

```
Fix rest-day calculation for over-limit pitchers (#12)
```

## Project structure

```
app/          — iOS app (index.html + Swift wrapper)
website/      — simplepitchcounter.com
docs/         — PM artifacts (PRD, stakeholder updates, process docs)
```

## Questions?

Open an issue or reach out via the [contact form](https://simplepitchcounter.com/contact.html).
