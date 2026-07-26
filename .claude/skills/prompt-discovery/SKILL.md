---
name: prompt-discovery
description: >
  Force the agent to ask clarifying questions before starting work. The agent surfaces its own
  assumptions, the user disambiguates, and only then does it proceed. Use when someone says
  "reverse prompt", "ask me questions first", "what questions do you have", "clarify before
  starting", "surface assumptions", "don't start until you ask me", "what do you need to know",
  "ask before building", "before you start what do you need", "وش تحتاج تعرف",
  "اسألني قبل لا تبدأ", "لا تبدأ بدون ما تسأل", "أبي أسئلة أول". Also triggers on any request to
  pause and gather requirements before implementation, or when the user hands you a complex task
  and explicitly wants you to interrogate it first.
---

# Reverse Prompting

**Goal:** Before touching any implementation, ask the user exactly 5 clarifying questions — the kind of questions where changing the answer would significantly change your approach. Do not proceed until the user answers. Surface your assumptions, let the user clarify, then proceed with high-quality context.

**Why this works:** The most expensive agent mistakes come from silent assumptions — building the wrong thing confidently because it assumed REST instead of GraphQL, or assumed creating a new file instead of modifying an existing one. Reverse Prompting makes those assumptions visible and correctable before they cost time.

**Important:** All questions asked to the user MUST be in Arabic.

## Execution

### Step 1 — Receive the task

Read the user's task description. **Do not start implementing.** Instead, analyze what you need to know to do the job correctly.

### Step 2 — Inspect the project (optional)

If the project includes prior decisions or experience files, read them first:

- Check `active/experience/` for relevant past decisions
- Check `CLAUDE.md` or `DECISIONS.md` for conventions
- Check existing code to auto-answer some questions

This step reduces unnecessary questions.

### Step 3 — Generate your 5 questions

Think about the assumptions you would normally make silently if you started immediately. Turn those assumptions into questions. Order them by impact — ask the questions where the answer would significantly change the implementation.

**Question categories:**
- **Scope** — What's in vs out?
- **Technical choices** — Tools/patterns?
- **Edge cases** — What happens when things fail?
- **Performance** — What scale are we targeting?
- **Integration** — What systems are involved?
- **UX** — What does the user see?
- **Existing patterns** — Follow or improve?

### Question format

Each question must:

1. State your default assumption
2. Ask the question (in Arabic)
3. Explain why it matters
