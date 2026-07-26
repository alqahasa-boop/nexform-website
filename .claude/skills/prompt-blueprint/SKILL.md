---
name: prompt-blueprint
description: >
  Write a structured 4-part contract (GOAL, CONSTRAINTS, FORMAT, FAILURE) that defines exactly
  what "done" means before any code is written. Treats the spec as an engineering contract, not
  a suggestion. Use this skill whenever someone says "prompt contract", "write a contract",
  "define success criteria", "failure conditions", "spec this out", "what does done look like",
  "define the contract", "structured spec", "goal constraints format failure", "define done",
  "contract for this task", "before we start define success", or /prompt-contracts. Also triggers
  on "I want to be really precise about what I need", "let's define exactly what done means",
  "what are the failure conditions", "make me a spec", "write the acceptance criteria",
  "define the requirements formally", or any request to formally specify success AND failure
  before building something. Arabic triggers: "حدد معايير النجاح", "أبي contract",
  "وش شكل النجاح والفشل", "حدد الشروط قبل لا نبدأ". Also use when someone pastes a contract
  with GOAL/CONSTRAINTS/FORMAT/FAILURE sections and asks to validate or implement it. If someone
  is about to start a complex build and wants rigorous scope definition — even if they don't use
  the word "contract" — this skill activates.
argument-hint: [task description or paste an existing contract]
---

# Prompt Contracts

A prompt contract is a 4-part specification you write before implementation: **GOAL** (quantifiable success), **CONSTRAINTS** (hard limits), **FORMAT** (exact output shape), **FAILURE** (explicit conditions that mean "not done").

Agents hallucinate and over-engineer when success is undefined. They silently cut corners when failure is undefined. A prompt contract front-loads all the reasoning about scope and edge cases so that implementation has zero ambiguity about what "done" means. The FAILURE clause is the key innovation — it prevents shortcuts the agent would otherwise rationalize as acceptable.

## Execution

### Step 1: Receive the task

Read the user's request. Determine whether they've already provided a contract or need help writing one.

- **If the user provides a contract:** Parse it into the 4 sections (GOAL, CONSTRAINTS, FORMAT, FAILURE) and proceed to validation (Step 3).
- **If the user provides a plain task:** Help them convert it into a contract (Step 2).

### Step 2: Generate the contract

Convert the user's plain task description into a structured contract. Use what you know from the codebase, the task description, and reasonable defaults. Check `tools/` and `workflows/` for existing resources that might inform the constraints.

Present the draft contract to the user for approval before proceeding. Do not implement anything until the contract is approved.

#### Contract template

```
## Contract

GOAL: [What does success look like? Include a measurable metric.]

CONSTRAINTS:
- [Hard limit 1 — technology, scope, or resource constraint]
- [Hard limit 2]
- [Hard limit 3]

FORMAT:
- [Exact output shape — files, structure, what's included]
- [File naming and organization]
- [What to include — types, tests, docs]

FAILURE (any of these = not done):
- [Specific failure condition 1]
- [Specific failure condition 2]
- [Edge case that must be handled]
- [Quality bar that must be met]
```

#### Writing good GOAL statements

The goal needs a number. Without a number, it's a wish, not a spec.

- "Handles 50K req/sec" not "handles high traffic"
- "Returns results in <200ms p95" not "is fast"
- "User can filter by date, status, and assignee" not "add filtering"
- "Processes 1M rows in under 30 seconds" not "is efficient"

Define the user-visible outcome, not the implementation detail.

#### Writing good CONSTRAINTS

Only hard limits — things that are NOT negotiable. If something is a preference rather than a requirement, it doesn't belong here.

- **Technology:** "no external dependencies", "must use existing Prisma ORM"
- **Scope:** "under 200 lines", "single file", "no new database tables"
- **Compatibility:** "must work with Node 18+", "backwards compatible with v2 API"
- **Resources:** "no paid API calls", "must run on 512MB RAM"

#### Writing good FORMAT specifications

Be exact about what the output looks like. The agent should be able to verify FORMAT compliance mechanically.

- "Single file: `rate_limiter.py`" not "a Python file"
- "Type hints on all public methods, 5+ pytest tests" not "well-tested"
- "No comments explaining obvious code, no README" — exclusions matter too

#### Writing good FAILURE clauses

This is the most important section. Think about how the task could "technically work" but actually be wrong. The failure clause prevents the agent from declaring victory prematurely.

Ask yourself: "What are the ways this could be done badly?"

- **Missing edge case:** "No test for empty input"
- **Performance miss:** "Latency exceeds 1ms on synthetic load"
- **Silent failure:** "Swallows errors without logging"
- **Incomplete:** "Doesn't handle the concurrent access case"
- **Over-engineered:** "Adds abstraction layers not required by GOAL"
- **Wrong output:** "Returns 500 on invalid input instead of 400"

Every FAILURE condition should be something you can check mechanically — not "code isn't clean" but "function exceeds 50 lines" or "no input validation on query params."

### Step 3: Validate the contract

Before implementing, verify the contract is sound:

1. **Complete** — all 4 sections filled out
2. **Consistent** — CONSTRAINTS don't contradict GOAL
3. **Testable** — every FAILURE condition can be verified
4. **Scoped** — GOAL is achievable within the CONSTRAINTS

If anything is ambiguous or contradictory, ask the user to clarify before proceeding. Do not guess.

### Step 4: Implement against the contract

Build the solution. Treat each section as a hard requirement:

- **GOAL** → what you're optimizing for
- **CONSTRAINTS** → boundaries you cannot cross
- **FORMAT** → exact output structure
- **FAILURE** → conditions you must prevent

### Step 5: Self-verify against FAILURE conditions

```
## Contract Verification

- [ ] FAILURE 1 → VERIFIED
- [ ] FAILURE 2 → VERIFIED
- [ ] FAILURE 3 → VERIFIED
- [ ] GOAL met
- [ ] CONSTRAINTS respected
- [ ] FORMAT matches
```

### Step 6: Deliver with contract status

**All pass:**
Contract status: ALL PASS

**If failed:**
Contract status: 1 FAILURE

## When to use

- Infrastructure
- APIs
- Complex builds
- High-quality tasks

## When NOT to use

- Quick prototypes
- Trivial fixes
