# Agentic Workflows Template
## Build Once, Run Forever

You describe what you want. The AI builds it. The workflow gets saved so you never rebuild it. The framework gets smarter over time.

---

## New Here? Start Here

**First time using this template?** Follow the step-by-step guide:

**[`SETUP.md`](SETUP.md)** - Interactive first-run setup (5 minutes)

---

## 30-Second Explanation

**Three layers:**
1. **Directives** — Plain English instructions (`directives/*.md`)
2. **Orchestration** — AI makes decisions
3. **Execution** — Python scripts do the work (`execution/*.py`)

**Why it works:** AI decides. Code executes. Errors don't compound. Workflows persist.

---

## Quick Start (New Project)

```bash
# 1. Clone or download, then enter
git clone <repo-url> my-project
# Or unzip if downloaded as zip
cd my-project

# 2. Set up environment
cp .env.example .env
# Edit .env with your API keys

# 3. Verify
python execution/sync_agent_files.py --check

# 4. Open in Claude Code (or your AI tool)
# Start building!
```

See `QUICKSTART.md` for details.

---

## Quick Start (Existing Project)

```bash
# 1. Copy core files
cp framework/AGENTS.md your-project/
cp framework/CLAUDE.md your-project/
cp framework/GEMINI.md your-project/
cp framework/execution/sync_agent_files.py your-project/execution/

# 2. Add version tags to existing directives
# <!-- DOE-VERSION: 2025.12.17 -->

# 3. Verify
cd your-project
python execution/sync_agent_files.py --check
```

See `MIGRATION.md` for details.

---

## What's Required

```
your-project/
├── AGENTS.md              # AI instructions (source of truth)
├── CLAUDE.md              # Mirror for Claude Code
├── GEMINI.md              # Mirror for Gemini
├── directives/            # Your workflows
├── execution/             # Your scripts
│   └── sync_agent_files.py
├── .tmp/                  # Temp files
└── .env                   # API keys
```

---

## What's Optional

```
├── pipelines/             # If workflows chain together
├── learnings/             # If you track failed approaches
├── doe_utils.py           # If you want cost tracking
├── _TEMPLATE.md           # Reference for new directives
├── _TEMPLATE.py           # Reference for new scripts
└── FRAMEWORK.md           # Deep documentation
```

---

## How It Works

**First time:**
```
You: "Build a workflow that scrapes competitor prices"
AI:  Researches 3+ approaches → Builds → Saves as directive + script
```

**Every time after:**
```
You: "Scrape competitor prices"
AI:  Finds directive → Runs script → Done
```

---

## Self-Improvement

The AI can propose improvements to how it operates:

1. AI learns something universal
2. AI drafts edit to AGENTS.md
3. AI shows you, waits for approval
4. After approval: applies edit, syncs to CLAUDE.md and GEMINI.md

**You're always in control.** No self-modification without your approval.

---

## Key Files

| File | What It Does |
|------|--------------|
| `AGENTS.md` | Instructions the AI reads |
| `sync_agent_files.py` | Keeps AGENTS/CLAUDE/GEMINI identical |
| `directives/_TEMPLATE.md` | Starting point for new workflows |
| `execution/_TEMPLATE.py` | Starting point for new scripts |

---

## Documentation

| Doc | When to Read |
|-----|--------------|
| `SETUP.md` | **First time?** Start here |
| `QUICKSTART.md` | Quick reference for setup |
| `MIGRATION.md` | Converting existing project |
| `ARCHITECTURE.md` | Understanding the full structure |
| `FRAMEWORK.md` | Deep reference (optional) |

---

## Credits

Based on Nick Saraev's DOE framework. Refined for clarity, self-improvement, and cross-tool compatibility.
