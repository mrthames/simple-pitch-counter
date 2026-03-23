# AI Risk Register

Risks specific to using AI in the development and maintenance of Simple Pitch Counter.

---

| # | Risk | Category | Likelihood | Impact | Severity | Mitigation | Status |
|---|------|----------|-----------|--------|----------|------------|--------|
| 1 | AI generates incorrect pitch count logic | Accuracy | Medium | Critical | High | All threshold/rest-day logic validated against EDHLL bylaws with worked examples. Manual testing with known scenarios before each release. | Active |
| 2 | AI introduces subtle bugs when editing the large index.html | Code quality | Medium | High | High | Read specific sections before editing, not the whole file. Review diffs carefully. Test on device after every change. | Active |
| 3 | AI-generated PM artifacts look obviously AI-written | Credibility | High | Medium | Medium | Use AI drafts as starting points only. Rewrite in own voice. Add personal anecdotes and domain-specific opinions that AI wouldn't have. | Active |
| 4 | Over-reliance on AI — loss of understanding of own codebase | Knowledge | Low | Medium | Low | Regularly read code manually. Understand every change before committing. Don't accept code you can't explain. | Monitoring |
| 5 | AI suggests insecure patterns (XSS, injection) | Security | Low | High | Medium | The app has no server-side code (except contact.php). All data is client-side localStorage. Review any code that handles user input or generates HTML. | Active |
| 6 | Context window limits cause AI to miss dependencies | Code quality | Medium | Medium | Medium | Keep related code near each other in the file. When asking for changes, reference the relevant functions explicitly. | Active |
| 7 | AI leaks sensitive data into commits | Privacy | Low | High | Medium | .gitignore excludes contact.php (SMTP credentials). Review all staged files before committing. Never paste API keys into prompts without awareness. | Active |
| 8 | Prompt injection via user-submitted data | Security | Very Low | Low | Very Low | The app doesn't send user data to an AI. No AI is in the runtime path. This risk only applies if we add AI features to the app itself. | Not applicable (current) |
| 9 | AI hallucinations about league rules | Accuracy | Medium | High | High | Always reference the source PDF bylaws, never rely on AI's "knowledge" of Little League rules. Verify every rule claim against the addendum documents. | Active |
| 10 | Vendor lock-in to a specific AI provider | Business | Low | Low | Low | The app has no runtime AI dependency. AI is a development tool only. Could switch providers without any code changes. | Monitoring |

---

## Review Cadence

This register is reviewed quarterly or when adding new AI-powered features to the product.

**Last reviewed:** March 2026
**Next review:** June 2026
