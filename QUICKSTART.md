# New Project Quickstart
## Get running in 5 minutes

---

## Step 1: Copy the Framework

```bash
# Clone or download, then rename
git clone <repo-url> your-project-name
# Or unzip if downloaded as zip
cd your-project-name
```

---

## Step 2: Set Up Your Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit with your API keys
nano .env   # or open in any editor
```

**Minimum required:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

Add other keys as your workflows need them.

---

## Step 3: Verify Agent Files Are Synced

```bash
python execution/sync_agent_files.py --check
```

Should show:
```
✅ All files are in sync
```

---

## Step 4: Start Building

Open the project in Claude Code (or your AI tool of choice).

**Say:**
```
"I want to build a workflow that [describes what you want]"
```

**The AI will:**
1. Research approaches
2. Present options
3. Build your choice
4. Save it as a directive + script

---

## Step 5: Run Your Workflow

Next time, just say:
```
"Run [workflow name]"
```

The AI finds the directive and executes it.

---

## That's It

You now have:
- ✅ A project that saves every workflow you build
- ✅ An AI that gets smarter over time
- ✅ Deterministic scripts that don't make random mistakes

---

## What's in the Box

**Required (already set up):**
```
AGENTS.md      → AI reads this
CLAUDE.md      → Same thing (for Claude Code)
GEMINI.md      → Same thing (for Gemini)
directives/    → Your workflows will go here
execution/     → Your scripts will go here
.tmp/          → Temp files (ignored by git)
```

**Optional (add when needed):**
```
pipelines/     → If you chain workflows together
learnings/     → If you want to track failed approaches
```

---

## Common First Commands

| You Say | What Happens |
|---------|--------------|
| "Build a workflow that..." | AI researches, builds, saves |
| "Run [workflow]" | AI finds directive, executes |
| "What workflows do I have?" | AI lists directives |
| "Improve the framework" | AI proposes update to AGENTS.md |
| "What have I spent?" | AI reads cost log (if tracking enabled) |

---

## Tips

1. **Be specific** — "Scrape pricing from competitor.com daily" beats "scrape stuff"

2. **Let it research** — Don't prescribe solutions. Let the AI find 3+ approaches first.

3. **Test with real data** — The AI will ask. Have a real example ready.

4. **Crystallize immediately** — After something works, make sure it saves the directive.

5. **Improve the framework** — When you notice a pattern, tell the AI to add it to AGENTS.md.

---

## Next Steps

- **Read `ARCHITECTURE.md`** — Understand the full structure
- **Check `directives/_TEMPLATE.md`** — See what a complete directive looks like
- **Check `execution/_TEMPLATE.py`** — See what a complete script looks like

Or just start building. The framework teaches itself.
