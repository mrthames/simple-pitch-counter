# Simple Pitch Counter — PM Portfolio

**Justin Thames** | [simplepitchcounter.com](https://simplepitchcounter.com) | [GitHub Repo](https://github.com/mrthames/simple-pitch-counter)

A real iOS app built for volunteer scorekeepers at youth baseball games. This project demonstrates end-to-end product management — from discovery through shipping — using AI-augmented workflows.

---

## Case Study

- [PM Process Case Study](case-study.md) — Full walkthrough from problem discovery to shipped product

## Product Artifacts

- [Product Requirements Document](../product/PRD.md) — Problem statement, target users, goals, requirements, and constraints
- [Product Vision One-Pager](../product/vision-one-pager.md) — Executive summary of what we built and why
- [User Personas](../product/personas.md) — Three personas based on real league roles
- [Competitive Analysis](../product/competitive-analysis.md) — Positioning against existing pitch counter apps and platforms

## Roadmap & Backlog

- [GitHub Project Board](https://github.com/mrthames/simple-pitch-counter/projects) — Prioritized backlog with RICE scores
- [GitHub Issues](https://github.com/mrthames/simple-pitch-counter/issues) — 15 issues across P1-P3, organized by area and type
- [GitHub Milestones](https://github.com/mrthames/simple-pitch-counter/milestones) — Sprint 1, Sprint 2, and Q3 2026 targets

## Stakeholder Communication

- [Sprint Review Template](../stakeholder/sprint-review-template.md) — Bi-weekly sprint reviews with demo notes and retrospectives
- [Monthly Stakeholder Update](../stakeholder/monthly-update-template.md) — Health indicators, shipped items, risks, and decisions needed
- [KPIs & Metrics](../stakeholder/kpis-and-metrics.md) — 7 KPIs tied to real user outcomes

## Decision Records

- [Go/No-Go: Web App (PWA)](../stakeholder/decision-go-no-go-web-app.md) — Trade-off analysis for cross-platform strategy
- [Live Coach View — Deferred](../product/feature-live-coach-view.md) — Full feature spec, architecture design, and deferral rationale ([#33](https://github.com/mrthames/simple-pitch-counter/issues/33))
- [Changelog](../../CHANGELOG.md) — Release history with technical context

## Process Documentation

- [PM ↔ Engineering Workflow](../process/pm-engineering-workflow.md) — How work moves from idea to shipped
- [Feedback Intake Process](../process/feedback-intake.md) — Triage, RICE scoring, and escalation rules
- [Onboarding Guide](../process/onboarding.md) — New contributor onboarding covering architecture and domain knowledge

## AI-Augmented Development

- [Model Selection Rationale](../ai/model-selection-rationale.md) — Why Claude Code, trade-offs accepted, when to use other tools
- [Prompt Engineering Log](../ai/prompt-engineering-log.md) — Three documented cases of prompt refinement with lessons learned
- [AI Risk Register](../ai/risk-register.md) — 10 identified risks with severity scores and active mitigations
- [Responsible AI Checklist](../ai/responsible-ai-checklist.md) — Pre-ship checklist for code and PM artifacts

## Live Product

- [iOS App Store](https://apps.apple.com/us/app/simple-pitch-counter/id6760922314) — Production app
- [simplepitchcounter.com](https://simplepitchcounter.com) — Marketing site and contact form
- [GitHub Releases](https://github.com/mrthames/simple-pitch-counter/releases) — Tagged releases with PM-written release notes

---

## Tools & Stack

| Layer | Tool |
|-------|------|
| App | HTML/CSS/JS in iOS WKWebView shell (Swift) |
| Website | Static HTML hosted on Synology NAS + Web Station |
| Project management | GitHub Issues + Projects (v2) |
| AI assistant | Claude Code CLI (Claude Opus 4.6) |
| Version control | Git + GitHub |
| CI/CD | GitHub Releases → manual App Store submission |
