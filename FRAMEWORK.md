# Directive-Orchestration-Execution (DOE) Framework
## Version 2.0.0

> A repeatable architecture for building AI-assisted workflows that separates human intent from deterministic execution.

---

## Why This Exists

LLMs are probabilistic. Business logic is deterministic. When you force an LLM to do everything—research, decide, execute, validate—errors compound. 90% accuracy per step = 59% success over 5 steps.

This framework fixes that mismatch by:
1. Storing proven approaches in **Directives** (what to do)
2. Using the LLM for **Orchestration** (decision-making and routing)
3. Pushing complexity into **Execution** scripts (deterministic code)

---

## Directory Structure

```
project-root/
├── AGENTS.md                    # Master instructions (also CLAUDE.md, GEMINI.md)
├── directives/
│   ├── _TEMPLATE.md             # Directive template (copy for new directives)
│   ├── workflow_name.md         # Individual workflow directives
│   └── ...
├── execution/
│   ├── _TEMPLATE.py             # Script template (copy for new scripts)
│   ├── script_name.py           # Individual execution scripts
│   └── ...
├── pipelines/
│   └── PIPELINES.md             # Multi-workflow compositions
├── learnings/
│   └── workflow_name.md         # Failed approaches and why
├── .tmp/                        # Intermediate files (gitignored)
├── .env                         # API keys and secrets (gitignored)
├── credentials.json             # OAuth credentials (gitignored)
└── token.json                   # OAuth tokens (gitignored)
```

---

## Self-Healing Agent Instructions

The framework itself improves over time. The agent instruction files contain a self-improvement protocol.

### The Three Files

The framework maintains three identical agent instruction files:

| File | Purpose | Compatibility |
|------|---------|---------------|
| `AGENTS.md` | Source of truth | Generic, Cursor, others |
| `CLAUDE.md` | Mirror | Claude Code |
| `GEMINI.md` | Mirror | Google Gemini |

**Why three files?** Different AI tools look for different filenames. Having all three ensures the instructions load regardless of which tool you use.

**Source of truth:** `AGENTS.md` is always the canonical version. Edits go there first, then sync to others.

### Synchronization

```bash
# Check sync status
python execution/sync_agent_files.py --check

# Sync all files from AGENTS.md
python execution/sync_agent_files.py --sync

# Sync with backups (recommended)
python execution/sync_agent_files.py --sync --backup

# Show differences
python execution/sync_agent_files.py --diff
```

### Self-Improvement Loop

The agent is expected to improve its own instructions when it learns something universal:

1. **Identify** — What behavior should change framework-wide?
2. **Draft** — Write the specific edit
3. **Approve** — Show user, get explicit confirmation (REQUIRED)
4. **Apply** — Edit AGENTS.md
5. **Sync** — Run sync script to update CLAUDE.md and GEMINI.md
6. **Version** — Bump DOE-VERSION if significant change

**Critical:** The agent cannot modify its own instructions without user approval. This prevents runaway self-modification.

### What Gets Improved

| Learning Type | Destination |
|---------------|-------------|
| Error patterns | Error Classification section |
| Routing logic | Operating Protocol section |
| Escalation rules | Escalation Thresholds section |
| Workflow patterns | Creating New Workflows section |
| Command patterns | Commands Reference section |
| Principles | Remember section |

### Quick Learning Addition

For small learnings that don't need full edits:

```bash
python execution/sync_agent_files.py --add-learning "Always validate JSON before parsing"
```

This appends to the Remember section and syncs all files automatically.

---

## Version Control

### Framework Version
This framework follows semantic versioning: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes to directive/script structure
- **MINOR**: New capabilities, backward compatible
- **PATCH**: Bug fixes, clarifications

Current version: **2.0.0**

### Directive-Script Versioning
Every directive and its corresponding script(s) share a version tag:

```markdown
<!-- directives/my_workflow.md -->
<!-- DOE-VERSION: 2025.12.17-a -->
```

```python
# execution/my_workflow.py
DOE_VERSION = "2025.12.17-a"
```

**Version format:** `YYYY.MM.DD-suffix`
- Date of last sync between directive and script
- Suffix (a, b, c...) for multiple updates same day

**The agent MUST check version alignment before execution.** Mismatches indicate drift and require review.

---

## Core Principles

### 1. Check Directives First
Before doing anything, check `directives/` for an existing workflow. Only build new if none exists.

### 2. Check Tools Before Writing Code
Before writing a script, check `execution/` per the directive. Only create new scripts if none exist.

### 3. Crystallize After Success
After successfully building a new workflow through conversation, immediately create:
- A directive in `directives/`
- Script(s) in `execution/`
- Entry in `learnings/` if alternatives were tested

### 4. Self-Anneal When Things Break
1. Read error message and stack trace
2. Classify error type (see Error Classification)
3. Fix based on classification
4. Update directive with learnings
5. Bump version tag

### 5. Never Discard Working Knowledge
Directives are living documents. Update them—don't abandon them. If a directive becomes obsolete, mark it deprecated rather than deleting.

---

## Error Classification

When something fails, classify before acting:

### Configuration Errors (fix once, no retry)
- Missing API key → Add to `.env`
- Missing credentials → Run auth flow
- Wrong file path → Correct path in directive
- **Action:** Fix config, no directive update needed

### Transient Errors (retry with backoff)
- Rate limiting → Wait and retry (1s, 2s, 4s, 8s, max 60s)
- Network timeout → Retry up to 3x
- Service temporarily unavailable → Retry after 60s
- **Action:** Retry, no directive update unless pattern persists

### Logic Errors (update script + directive)
- Wrong output format → Fix script, update directive's Output section
- Missing edge case → Add handling, update directive's Edge Cases
- Incorrect assumptions → Fix logic, document in Learnings
- **Action:** Fix, update directive, bump version

### External Errors (escalate to human)
- API deprecated → Notify human, document in Learnings
- Service permanently changed → Requires human decision
- Cost threshold exceeded → Pause and confirm
- **Action:** Stop, notify, await human input

---

## Escalation Thresholds

The agent MUST pause and request human input when:

1. **Retry limit reached:** 3 consecutive failures of same error
2. **Cost threshold:** Any single action costing >$1.00 USD
3. **Batch cost:** Cumulative run cost exceeds $10.00 USD
4. **Destructive actions:** Deleting files, overwriting data, sending external communications
5. **No directive match:** Query doesn't map to any existing directive
6. **Version mismatch:** Directive and script versions don't align

---

## Routing Logic

When a user request comes in:

```
1. Parse request for keywords and intent
2. Check each directive's Trigger Phrases section
3. If single match → Execute that directive
4. If multiple matches → Present options to user
5. If no match → Ask if user wants to build new workflow
6. If directive found but version mismatch → Warn user, await confirmation
```

### Trigger Phrase Matching
- Exact phrase match takes priority
- Keyword overlap as fallback
- "Does NOT Apply To" section excludes false positives

---

## Validation Protocol

Every execution must validate success. Each directive specifies validation criteria.

### Standard Validations
- [ ] Output file exists at specified path
- [ ] Output file size > 0 bytes
- [ ] No error messages in execution log
- [ ] Script exit code = 0

### Workflow-Specific Validations
Defined in each directive's Validation section.

### Post-Validation Actions
- **Pass:** Log success, report to user
- **Fail:** Classify error, act per Error Classification

---

## Cost Tracking

Every script that incurs API costs must log them:

```python
from doe_utils import log_cost

log_cost(
    workflow="workflow_name",
    costs={
        "openai": 0.00,
        "anthropic": 0.15,
        "service_name": 0.00
    }
)
```

Logs append to `.tmp/cost_log.jsonl` for aggregation.

---

## Creating New Workflows

When building a new workflow from scratch:

### Phase 1: Research
1. User describes problem
2. Agent searches for existing solutions (APIs, libraries, approaches)
3. Agent presents 3+ options with tradeoffs
4. User selects approach OR agent tests in parallel

### Phase 2: Build
1. Agent implements selected approach
2. Test with real data
3. Iterate until working

### Phase 3: Crystallize
1. Create directive from `directives/_TEMPLATE.md`
2. Create script(s) from `execution/_TEMPLATE.py`
3. Document failed approaches in `learnings/`
4. If multi-step, add to `pipelines/PIPELINES.md`

### Phase 4: Validate
1. Run full workflow from directive (not from memory)
2. Confirm all validation criteria pass
3. Confirm cost tracking works
4. Version tag both directive and script

---

## File Conventions

### Naming
- Directives: `snake_case.md` (e.g., `daily_report_generator.md`)
- Scripts: `snake_case.py` (e.g., `daily_report_generator.py`)
- Match names where possible for easy mapping

### Paths
- Always use relative paths from project root
- Scripts reference: `execution/script_name.py`
- Directives reference: `directives/workflow_name.md`

### Intermediate Files
- All temp files go in `.tmp/`
- Subdirectories by date: `.tmp/workflow_name/20251217/`
- Never commit `.tmp/` contents

### Deliverables
- Cloud services (Google Sheets, etc.) for user-facing outputs
- Local files only for processing

---

## Rollback Protocol

When a fix breaks something that was working:

1. **Identify last known good state**
   - Check directive changelog for previous version
   - Check git history if available

2. **Revert changes**
   - Restore previous script version
   - Restore previous directive version

3. **Document failure**
   - Add to `learnings/` why the "fix" failed
   - Note the version that was rolled back

4. **Re-attempt with different approach**
   - Do not retry same fix
   - Research alternatives first

---

## Migration Guide

### From Existing DOE Setup
1. Copy this FRAMEWORK.md to project root
2. Copy templates to `directives/_TEMPLATE.md` and `execution/_TEMPLATE.py`
3. Add version tags to existing directive/script pairs
4. Create `pipelines/PIPELINES.md` for multi-step workflows
5. Create `learnings/` folder, populate from memory
6. Update existing AGENTS.md to reference this framework

### For New Projects
1. Clone or download this template
2. Run through `SETUP.md` to configure your environment
3. Begin building workflows

---

## Quick Reference

| I want to... | Do this |
|--------------|---------|
| Run existing workflow | Check `directives/`, find matching trigger phrase, execute |
| Build new workflow | Research 3+ approaches, test, crystallize to directive + script |
| Fix a broken workflow | Classify error, act per classification, update directive |
| Add to existing workflow | Update directive, update script, bump version |
| Deprecate a workflow | Add `DEPRECATED` to directive title, note replacement |
| Track costs | Check `.tmp/cost_log.jsonl` or run cost report |
| Understand past decisions | Check `learnings/` folder |
| Chain workflows | Check `pipelines/PIPELINES.md` |

---

## Changelog

### 2.0.0 (2025-12-17)
- Initial release of refined framework
- Added version control protocol
- Added error classification system
- Added escalation thresholds
- Added routing logic specification
- Added validation protocol
- Added cost tracking standard
- Added rollback protocol
- Added crystallization process
- Added learnings capture
- Added pipeline documentation

