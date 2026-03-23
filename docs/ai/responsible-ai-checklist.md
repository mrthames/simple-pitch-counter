# Responsible AI Checklist

Pre-ship checklist for any feature or artifact that involved AI assistance.

---

## Code Changes

- [ ] **I understand the change.** I can explain what the code does without referencing the AI conversation.
- [ ] **I tested it.** Changes were tested on a real device or in a browser, not just reviewed in diff.
- [ ] **Edge cases covered.** Domain-specific edge cases (threshold crossings, multi-pitcher games, same-day doubleheaders) were tested, not just the happy path.
- [ ] **No hardcoded assumptions.** The fix works for all league configs, not just the one that triggered the bug.
- [ ] **No sensitive data committed.** Reviewed staged files for credentials, API keys, or personal information.
- [ ] **Security check.** Any code handling user input or generating HTML was reviewed for injection vulnerabilities.

## PM Artifacts (docs, templates, reports)

- [ ] **Rewritten in my voice.** The document doesn't read like a generic AI template. It reflects my opinions, decisions, and domain knowledge.
- [ ] **Factually accurate.** Any claims about league rules, app behavior, or metrics are verified against primary sources.
- [ ] **No fabricated data.** Mock data is clearly labeled as mock. Real metrics come from real sources.
- [ ] **Appropriate attribution.** If the project showcases AI-assisted development, the process is documented honestly (see docs/ai/).

## Before Each Release

- [ ] **Changelog updated.** CHANGELOG.md reflects what actually changed, written for a human reader.
- [ ] **Threshold logic validated.** Run through the standard test scenarios:
  - Pitcher at 19, throws to 23 mid-batter → rest = 0 days
  - Pitcher at 34, throws to 38 mid-batter → rest = 1 day
  - Pitcher at 49, throws to 54 mid-batter → rest = 2 days
  - Pitcher at 0 → rest = 0 days
- [ ] **Game summary matches league form.** Generated summary compared against the official EDHLL Game Summary PDF.
- [ ] **Privacy policy still accurate.** If new data collection or third-party services were added, privacy.html needs updating.

---

**Principle:** AI is a tool for building, not a replacement for thinking. Every output gets the same scrutiny it would get if a junior engineer wrote it — review it, test it, own it.
