# AI Model Selection Rationale

## Decision: Use Claude (Anthropic) via Claude Code CLI

**Date:** March 2026
**Context:** Selecting an AI coding assistant for building and maintaining Simple Pitch Counter

---

## Options Evaluated

### Claude Code (Anthropic) — Selected
- **Model:** Claude Opus 4.6 via Claude Code CLI
- **Interface:** Terminal-based, runs locally, reads/writes files directly
- **Strengths:** Strong at multi-file reasoning, understands project context across files, good at following complex domain rules (threshold logic, league bylaws), reliable code generation for web technologies
- **Weaknesses:** No visual UI preview, context window limits on very large files

### GitHub Copilot
- **Interface:** IDE-integrated (VS Code, Xcode)
- **Strengths:** Fast inline completions, good for boilerplate, integrated into the editor
- **Weaknesses:** Limited context window for cross-file reasoning, autocomplete paradigm doesn't suit PM artifact creation, less effective at understanding domain rules from documentation

### ChatGPT (OpenAI)
- **Interface:** Web-based chat
- **Strengths:** General knowledge, good at drafting docs, widely understood
- **Weaknesses:** No direct file access, copy-paste workflow for code, can't run commands or manage git, no project persistence between sessions

## Why Claude Code

### 1. Full project context
Claude Code operates in the project directory and can read any file. When fixing the rest-day calculation bug, it could read the existing `restInfo()` function, compare it to the broken `renderHistory()` function, and produce a fix that matched the established pattern. A chat-based tool would require pasting both functions manually.

### 2. End-to-end workflow
From a single session, Claude Code can: read league bylaws (PDFs), understand the domain rules, write code, create git commits, push to GitHub, create issues, set up project boards, and draft PM documents. The alternative is context-switching between 4-5 tools.

### 3. PM artifact generation
This project requires both code and business documents. Claude Code handles both in the same session — writing a PRD that references the actual codebase, creating GitHub Issues with correct labels, drafting stakeholder updates that cite real sprint data.

### 4. Persistence across sessions
The memory system lets Claude Code retain project context (league rules, architectural decisions, user preferences) across conversations. This means each session doesn't start from zero.

## Trade-offs Accepted

- **No visual preview:** Can't see the app render in real-time. Mitigation: test on device after changes.
- **Large file challenge:** The app's index.html is ~100KB / 36K tokens. Reading the whole file at once isn't always possible. Mitigation: read specific sections, use grep to find relevant code.
- **Cost:** Claude Code usage has API costs. Mitigation: use efficiently — clear prompts, batch related work.

## When to use other tools

- **Copilot:** For quick inline edits when working in Xcode on Swift files
- **ChatGPT:** For quick one-off questions not related to this project
- **Manual coding:** For small CSS tweaks where it's faster to just type it
