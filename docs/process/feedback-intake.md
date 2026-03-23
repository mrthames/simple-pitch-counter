# Feedback & Bug Intake Process

How user feedback and bug reports enter the system and become actionable work.

---

## Intake Channels

| Channel | Type | Lands in |
|---------|------|----------|
| GitHub Issues (bug template) | Bug reports | GitHub Issues, auto-labeled `status: needs-triage` |
| GitHub Issues (feature template) | Feature requests | GitHub Issues, auto-labeled `status: needs-triage` |
| simplepitchcounter.com/contact | General feedback | Email inbox → manually filed as issue if actionable |
| App Store reviews | Mixed | Checked weekly → filed as issue if actionable |
| Direct email/text | Mixed | Filed as issue if actionable |

## Triage Process

**Who:** Product manager (Justin)
**When:** Weekly on Mondays
**Time:** ~30 minutes

### Steps

1. **Pull up all `status: needs-triage` issues**
   ```
   gh issue list --label "status: needs-triage"
   ```

2. **For each issue, evaluate:**
   - Is it a duplicate? → Close with link to existing issue
   - Is it clear enough to act on? → If not, comment asking for details
   - Is it a bug or a feature request? → Verify correct template/labels

3. **Assign labels:**
   - Priority: P0 (critical) through P3 (low)
   - Area: app, website
   - Type: bug, feature, improvement

4. **For feature requests, add RICE score:**
   - Reach: how many users does this affect? (1-5)
   - Impact: how much does it help them? (1-5)
   - Confidence: how sure are we about the above? (1-5)
   - Effort: t-shirt size (XS, S, M, L, XL)
   - Score = (Reach × Impact × Confidence) / Effort-weight

5. **Remove `status: needs-triage` label**

6. **Add to project board** if not already there

## Escalation

- **P0 (critical):** Act immediately. Don't wait for Monday triage.
- **P1 (high):** Pull into current sprint if capacity allows, otherwise next sprint.
- **P2/P3:** Backlog. Pick up based on RICE score and sprint capacity.

## Closing the Loop

When an issue is resolved and shipped:
1. Close the issue with a link to the PR/commit
2. If the reporter left contact info, reply with a brief note that the fix/feature shipped
3. If it came from an App Store review, respond in App Store Connect
