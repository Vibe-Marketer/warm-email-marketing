# Framework Architecture Overview
## Version 2.0.0

---

## The Core Idea (30 seconds)

You talk to an AI. It builds workflows. Those workflows get saved so you never rebuild them. The system gets smarter over time.

**Three layers:**
1. **Directives** — Instructions in plain English (what to do)
2. **Orchestration** — The AI makes decisions (routing, error handling)
3. **Execution** — Python scripts do the work (reliable, repeatable)

**Why it works:** AI decides. Code executes. Errors don't compound.

---

## Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR PROJECT                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │  AGENTS.md  │ =  │  CLAUDE.md  │ =  │  GEMINI.md  │         │
│  │  (source)   │    │  (mirror)   │    │  (mirror)   │         │
│  └──────┬──────┘    └─────────────┘    └─────────────┘         │
│         │                                                       │
│         │ AI reads these instructions                          │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    ORCHESTRATION                         │   │
│  │                     (The AI)                             │   │
│  │                                                          │   │
│  │   • Routes requests to correct directive                 │   │
│  │   • Calls scripts in order                               │   │
│  │   • Handles errors                                       │   │
│  │   • Proposes improvements (with your approval)           │   │
│  └──────────────────────┬──────────────────────────────────┘   │
│                         │                                       │
│         ┌───────────────┼───────────────┐                      │
│         ▼               ▼               ▼                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐               │
│  │ directives/ │ │ execution/  │ │   .tmp/     │               │
│  │             │ │             │ │             │               │
│  │ workflow.md │ │ script.py   │ │ temp files  │               │
│  │ workflow.md │ │ script.py   │ │             │               │
│  └─────────────┘ └─────────────┘ └─────────────┘               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    OPTIONAL                              │   │
│  │                                                          │   │
│  │   pipelines/    → Multi-workflow chains                  │   │
│  │   learnings/    → Failed approaches (prevents re-work)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Required Components

| Component | Purpose | You Need It Because |
|-----------|---------|---------------------|
| `AGENTS.md` | AI instructions | The AI reads this to know how to operate |
| `CLAUDE.md` | Mirror of AGENTS.md | Claude Code looks for this filename |
| `GEMINI.md` | Mirror of AGENTS.md | Gemini looks for this filename |
| `directives/` | Workflow SOPs | Where your saved workflows live |
| `execution/` | Python scripts | Where the actual code lives |
| `.tmp/` | Temp files | Processing artifacts (gitignored) |
| `.env` | API keys | Secrets storage (gitignored) |

---

## Optional Components

| Component | Purpose | Add It When |
|-----------|---------|-------------|
| `pipelines/` | Multi-workflow chains | You have workflows that feed into each other |
| `learnings/` | Failed approaches | You want to prevent re-trying dead ends |
| `FRAMEWORK.md` | Full documentation | You want deep reference material |
| `doe_utils.py` | Cost tracking | You want to monitor API spend |

**Start minimal. Add optional components when you need them.**

---

## File Structure (Minimal)

```
your-project/
├── AGENTS.md              # AI instructions (REQUIRED)
├── CLAUDE.md              # Mirror (REQUIRED)
├── GEMINI.md              # Mirror (REQUIRED)
├── directives/            # Your workflows (REQUIRED)
│   └── [workflow].md
├── execution/             # Your scripts (REQUIRED)
│   ├── sync_agent_files.py   # Keeps agent files aligned
│   └── [script].py
├── .tmp/                  # Temp files (REQUIRED, gitignored)
├── .env                   # API keys (REQUIRED, gitignored)
└── .gitignore             # (REQUIRED)
```

## File Structure (Full)

```
your-project/
├── AGENTS.md              # AI instructions (source of truth)
├── CLAUDE.md              # Mirror
├── GEMINI.md              # Mirror
├── FRAMEWORK.md           # Deep documentation
├── directives/
│   ├── _TEMPLATE.md       # For creating new workflows
│   └── [workflow].md
├── execution/
│   ├── _TEMPLATE.py       # For creating new scripts
│   ├── sync_agent_files.py
│   ├── doe_utils.py       # Cost tracking
│   └── [script].py
├── pipelines/
│   └── PIPELINES.md       # Multi-workflow documentation
├── learnings/
│   └── [workflow].md      # Failed approaches
├── .tmp/
├── .env
├── .env.example
└── .gitignore
```

---

## How It Works

### 1. You Make a Request
```
"Create a workflow that scrapes competitor pricing"
```

### 2. AI Checks for Existing Workflow
```
Checking directives/... no match found.
```

### 3. AI Researches & Builds
```
Researching approaches...
- Option A: Use Apify
- Option B: Use Playwright
- Option C: Use ScrapeGraph

Which approach? [A/B/C/test all]
```

### 4. AI Crystallizes the Workflow
```
✅ Created: directives/competitor_pricing.md
✅ Created: execution/scrape_pricing.py
```

### 5. Next Time, It Just Runs
```
"Scrape competitor pricing"
→ Found: directives/competitor_pricing.md
→ Running: execution/scrape_pricing.py
→ Done!
```

---

## The Self-Improvement Loop

```
    ┌─────────────────────────────────────┐
    │                                     │
    │   1. AI discovers something new     │
    │      (error pattern, better way)    │
    │                                     │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │                                     │
    │   2. AI proposes improvement        │
    │      (shows you the edit)           │
    │                                     │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │                                     │
    │   3. You approve or reject          │
    │      (YOU are always in control)    │
    │                                     │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │                                     │
    │   4. AI updates AGENTS.md           │
    │      + syncs CLAUDE.md, GEMINI.md   │
    │                                     │
    └─────────────────┬───────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │                                     │
    │   5. Framework is now smarter       │
    │      (applies to ALL workflows)     │
    │                                     │
    └─────────────────────────────────────┘
```

---

## Version Tags (Simple Rule)

Every directive has a version. Its script has the same version.

```markdown
<!-- Directive -->
<!-- DOE-VERSION: 2025.12.17 -->
```

```python
# Script
DOE_VERSION = "2025.12.17"
```

**If they don't match:** Something changed without the other updating. Review before running.

---

## That's It

The framework is:
1. **Directives** — Plain English instructions
2. **Scripts** — Deterministic code
3. **Agent files** — How the AI operates
4. **Self-improvement** — Gets smarter over time

Everything else is optional tooling to help at scale.
