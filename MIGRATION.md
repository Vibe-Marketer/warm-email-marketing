# Migrating Existing Projects
## Bring any project into alignment with the framework

---

## Quick Assessment

**Do you have existing directives and execution scripts?**
- **Yes** → Follow "Existing DOE Project" below
- **No, just random scripts** → Follow "Non-DOE Project" below
- **No, starting fresh** → Use `QUICKSTART.md` instead

---

## Existing DOE Project (has directives/ and execution/)

You already have the structure. You're adding the self-improvement layer.

### Step 1: Backup

```bash
cp -r your-project your-project-backup
cd your-project
```

### Step 2: Add Core Files

```bash
# Download the framework (or copy from wherever you have it)
# Then copy these files:

cp path/to/framework/AGENTS.md ./
cp path/to/framework/CLAUDE.md ./
cp path/to/framework/GEMINI.md ./
cp path/to/framework/execution/sync_agent_files.py ./execution/
cp path/to/framework/.gitignore ./  # or merge with existing
```

### Step 3: Merge Your Existing AGENTS.md (if you have one)

If you have custom instructions in an existing AGENTS.md or CLAUDE.md:

1. Open the new AGENTS.md
2. Find sections where you want your custom rules
3. Add your rules to the appropriate sections
4. Save

Then sync:
```bash
python execution/sync_agent_files.py --sync
```

### Step 4: Add Version Tags to Existing Directives

For each file in `directives/`:

**Add this as line 2:**
```markdown
<!-- DOE-VERSION: 2025.12.17 -->
```

### Step 5: Add Version Tags to Existing Scripts

For each file in `execution/`:

**Add this near the top:**
```python
DOE_VERSION = "2025.12.17"
```

### Step 6: Verify

```bash
python execution/sync_agent_files.py --check
```

**Done.** Your project now self-improves.

---

### Optional Additions

**Want cost tracking?**
```bash
cp path/to/framework/execution/doe_utils.py ./execution/
```

**Want templates for new workflows?**
```bash
cp path/to/framework/directives/_TEMPLATE.md ./directives/
cp path/to/framework/execution/_TEMPLATE.py ./execution/
```

**Want to track failed approaches?**
```bash
mkdir -p learnings
cp path/to/framework/learnings/_TEMPLATE.md ./learnings/
```

**Want to document workflow chains?**
```bash
mkdir -p pipelines
cp path/to/framework/pipelines/PIPELINES.md ./pipelines/
```

---

## Non-DOE Project (just scripts, no structure)

You have scripts but no directives folder. You're adding structure.

### Step 1: Create the Structure

```bash
cd your-project

# Create directories
mkdir -p directives
mkdir -p execution
mkdir -p .tmp

# Move your scripts
mv *.py execution/      # Adjust as needed
```

### Step 2: Add Framework Files

```bash
cp path/to/framework/AGENTS.md ./
cp path/to/framework/CLAUDE.md ./
cp path/to/framework/GEMINI.md ./
cp path/to/framework/execution/sync_agent_files.py ./execution/
cp path/to/framework/.gitignore ./
cp path/to/framework/.env.example ./.env
```

### Step 3: Create Directives for Your Scripts

For each script you have, create a directive. Start minimal:

**directives/my_workflow.md:**
```markdown
# My Workflow
<!-- DOE-VERSION: 2025.12.17 -->

## Goal
[One sentence: what does this do?]

## Trigger Phrases
**Matches:**
- "run my workflow"
- "[other ways you'd ask for this]"

## Quick Start
```bash
python execution/my_script.py [args]
```

## What It Does
1. [Step one]
2. [Step two]
3. [Step three]
```

### Step 4: Add Version Tags to Scripts

For each script in `execution/`:

```python
DOE_VERSION = "2025.12.17"
```

### Step 5: Set Up Environment

```bash
# Edit .env with your API keys
nano .env
```

### Step 6: Verify

```bash
python execution/sync_agent_files.py --check
```

**Done.** Your scripts are now part of a self-improving framework.

---

## Checklist

### Minimum (gets you running)

- [ ] AGENTS.md, CLAUDE.md, GEMINI.md in place
- [ ] sync_agent_files.py in execution/
- [ ] At least one directive in directives/
- [ ] Version tags on directives and scripts
- [ ] .env with your API keys

### Full (all features)

- [ ] All the above
- [ ] doe_utils.py for cost tracking
- [ ] _TEMPLATE.md and _TEMPLATE.py for new workflows
- [ ] pipelines/ for workflow chains
- [ ] learnings/ for failed approaches
- [ ] All directives have Trigger Phrases section
- [ ] All directives have Validation section

---

## Troubleshooting

### "Agent files out of sync"
```bash
python execution/sync_agent_files.py --sync
```

### "Version mismatch warning"
Either:
- The directive was updated but not the script (or vice versa)
- Just align the version tags to today's date

### "Can't find my workflow"
Check that your directive has a Trigger Phrases section that matches how you're asking for it.

### "Scripts aren't in execution/"
The AI looks in `execution/` for scripts. Move them there or update the directive paths.

