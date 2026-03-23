# Prompt Engineering Decision Log

Documenting how prompts and AI interactions were refined during development.

---

## Entry 1: Bug Fix — History Card Missing Over-Limit Pitchers

**Date:** March 21, 2026
**Task:** Fix renderHistory() to show pitchers who exceeded all configured thresholds

### Initial prompt approach
Described the bug directly: "The history card doesn't show pitchers who threw more than 50 pitches." This led to a fix that handled the specific case but didn't generalize.

### What went wrong
The AI fixed the 50-pitch case by hardcoding a check for the max threshold value. When tested with a Minors 9/10 config (max 85), the fix didn't apply because it was looking for 50 specifically.

### Refined prompt
Described the logic pattern instead of the specific case: "When a pitcher's count exceeds ALL thresholds in the config, the loop never matches and days stays at 0. The fix should use the highest days value from whatever thresholds exist." Also included the existing working code from restInfo() as a reference implementation.

### Lesson
Describe the pattern, not the instance. Providing a reference implementation from another part of the codebase gave the AI the right mental model.

---

## Entry 2: Game Summary Generation

**Date:** March 2026
**Task:** Generate game summary matching the EDHLL form format

### Initial prompt approach
Asked: "Add a game summary feature that emails the game results." Got a generic sports summary that didn't match the league's specific format.

### Refined prompt
Attached the actual PDF form (Scorekeeper MINORS8_GameSummary.pdf) and asked: "Generate a summary that matches this exact form. The fields are: [listed them]. The format should be ready to paste into an email." This produced an accurate match.

### Lesson
When the output needs to match an external spec, provide the spec directly rather than describing it from memory. The AI can work from the source of truth more accurately than from a paraphrased version.

---

## Entry 3: Threshold Logic — Finish the Batter Rule

**Date:** March 2026
**Task:** Implement the "finish the batter" pitch count recording rule

### Challenge
This rule is counterintuitive: a pitcher throws 23 pitches but gets recorded as 20 for rest-day purposes. Most descriptions of this rule confuse even experienced coaches.

### Prompt approach
Provided the exact bylaw text from the EDHLL rules, including the worked example: "Pitcher has 19 pitches. New batter comes to plate, he pitches one and reaches threshold of 20, ball not put in play. Pitcher pitches three more balls ending at 23 and then is replaced. His days rest and pitch count would be recorded as 20 with 0 calendar days rest."

### What worked
Quoting the primary source (bylaws) with the official example eliminated ambiguity. The AI implemented it correctly on the first pass because the spec was unambiguous.

### Lesson
For domain-specific rules, the primary source document beats any summary or interpretation. Feed the actual rule text, not your understanding of it.

---

## General Principles Learned

1. **Show, don't tell** — providing reference implementations from the existing codebase produces more consistent results than describing the desired behavior abstractly
2. **Attach the spec** — when output needs to match an external format, provide the original document
3. **Describe patterns, not instances** — "handle the case where X exceeds all items in Y" is better than "handle when X > 50"
4. **Include edge cases in the prompt** — the AI won't think of domain-specific edge cases (like the finish-the-batter rule) unless you mention them
5. **Iterate on the prompt before iterating on the code** — spending 5 minutes refining the prompt saves more time than debugging an implementation based on a vague prompt
