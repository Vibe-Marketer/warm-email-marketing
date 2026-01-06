# First-Time Setup Guide
## Interactive setup for new users

Welcome! This guide will walk you through setting up your Agentic Workflows environment step by step.

---

## Before You Start

You'll need:
- [ ] An AI coding tool (Claude Code, Cursor, or similar)
- [ ] Python 3.8+ installed
- [ ] At least one AI API key (Anthropic recommended)

---

## Step 1: Create Your Environment File

Copy the example environment file:

```bash
cp .env.example .env
```

Now open `.env` in your editor and fill in your API keys.

### Required: AI API Key

You need at least ONE of these:

```bash
# Option A: Anthropic (Recommended)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Option B: OpenAI
OPENAI_API_KEY=sk-your-key-here
```

**Where to get keys:**
- Anthropic: https://console.anthropic.com/settings/keys
- OpenAI: https://platform.openai.com/api-keys

### Optional: Additional Services

Add these later as your workflows need them:

```bash
# Web scraping
APIFY_API_TOKEN=...

# Image generation
REPLICATE_API_TOKEN=...

# Any other service your workflows will use
YOUR_SERVICE_API_KEY=...
```

---

## Step 2: Verify Your Setup

Run this command to make sure everything is configured correctly:

```bash
python execution/sync_agent_files.py --check
```

You should see:
```
All files are in sync
```

---

## Step 3: Open in Your AI Tool

### For Claude Code:
```bash
claude
```
Or open this folder in VS Code with Claude Code extension.

### For Cursor:
Open this folder in Cursor. It will read `AGENTS.md` automatically.

### For Other Tools:
Point your AI tool at the `AGENTS.md` file in the project root.

---

## Step 4: Test It Works

Say this to your AI tool:

```
"What workflows exist in this project?"
```

Expected response: The AI should tell you about the template files and the agent instructions maintenance workflow.

---

## Step 5: Build Your First Workflow

Now try:

```
"I want to build a workflow that [describe what you want]"
```

The AI will:
1. Research approaches for your task
2. Present you with options
3. Build the solution you choose
4. Save it as a reusable workflow

---

## You're Ready!

Your environment is now set up. Here's what you can do:

| Say This | What Happens |
|----------|--------------|
| "Build a workflow that..." | AI researches, builds, and saves a new workflow |
| "Run [workflow name]" | AI finds and executes an existing workflow |
| "What workflows do I have?" | AI lists all your saved workflows |
| "Improve the framework" | AI proposes improvements to how it operates |

---

## Quick Reference

### File Structure
```
your-project/
├── AGENTS.md           # AI reads this for instructions
├── CLAUDE.md           # Same (for Claude Code)
├── GEMINI.md           # Same (for Gemini)
├── directives/         # Your workflows go here
├── execution/          # Your scripts go here
├── .env                # Your API keys (never commit!)
└── .tmp/               # Temporary files
```

### Key Commands
```bash
# Check if agent files are synced
python execution/sync_agent_files.py --check

# Sync agent files after editing one
python execution/sync_agent_files.py --sync
```

---

## Troubleshooting

### "API key not found"
Make sure your `.env` file exists and has at least one valid API key.

### "Files not in sync"
Run: `python execution/sync_agent_files.py --sync`

### "AI doesn't know about my workflows"
Make sure you're in the project directory when running your AI tool.

### Need more help?
Check `QUICKSTART.md` for a condensed guide, or `ARCHITECTURE.md` for the full technical reference.

---

## Next Steps

1. **Build something!** Start with a simple workflow to get familiar
2. **Read `directives/_TEMPLATE.md`** to see the workflow structure
3. **Check `ARCHITECTURE.md`** when you want to understand the full system

Happy building!
