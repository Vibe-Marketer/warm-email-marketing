# SPEC: Listmonk Setup Completion & First Campaign Send

## What
Complete the initial setup of the live Listmonk system at `https://email.callvaultai.com` and get it ready to send the first campaign. This involves creating the admin account, configuring Resend SMTP for email delivery, setting up domain authentication (SPF, DKIM, DMARC), verifying deliverability with test sends, and importing the user's contact lists. The end state is a fully operational email marketing system where the user can click "send" and emails land in inboxes.

**Current state:** Docker containers running, setup wizard showing at `/admin`, awaiting first admin account creation.

**Target state:** User can compose a broadcast, select their warm list, click send, and emails arrive in recipient inboxes (not spam).

## Why
The infrastructure is live but not yet usable. This spec bridges the gap between "system is running" and "user can send their first campaign." Without completing these steps, the system is just infrastructure with no practical value.

## User Experience

### Phase 1: Setup Wizard (Guided)
User opens `https://email.callvaultai.com/admin` and sees the Listmonk setup wizard. The agent guides them through:

1. **Creating their admin account**
   - User fills out form with their email, chosen username, and password
   - System initializes and logs them in
   - User sees empty Listmonk dashboard

2. **Configuring email delivery**
   - Agent provides exact SMTP settings for Resend
   - User pastes their Resend API key
   - System tests connection and confirms it works
   - User sees "SMTP configured successfully" message

3. **Setting up the sending domain**
   - Agent guides to Resend dashboard to add `mail.callvaultai.com`
   - Resend provides DNS records (SPF, DKIM, DMARC)
   - Agent either configures DNS automatically OR provides exact copy-paste instructions
   - User waits for domain verification (5-30 minutes)
   - Domain shows "Verified" in Resend

4. **Sending test email**
   - Agent creates a test subscriber with user's email
   - Agent creates simple test campaign
   - User clicks "Send"
   - Email arrives in user's inbox (not spam)
   - User confirms they received it

### Phase 2: Contact Import (Semi-Automated)
Once delivery is confirmed working:

1. **Upload warm list**
   - User provides CSV file (~500-1,000 contacts)
   - Agent imports via Listmonk UI or script
   - System creates "Warm List" with all contacts
   - User sees contact count in dashboard

2. **Upload dormant list**
   - User provides CSV file (~10-20k contacts)
   - Agent imports via Listmonk UI or script
   - System creates "Dormant List" with all contacts
   - User sees both lists in dashboard

### Phase 3: First Real Campaign (Hands-On Demo)
User is now ready to send:

1. Agent opens campaign creation
2. User writes their email content
3. User selects "Warm List" as target
4. User clicks "Send" (or "Schedule")
5. Listmonk processes and sends via Resend
6. User can view analytics (opens, clicks) in dashboard

**Throughout:** Agent presents information in plain language ("where your contacts are stored" not "database"), demos working features, and never shows broken things.

## Scope

### Applies to:
- Listmonk instance at `https://email.callvaultai.com`
- Docker containers: `listmonk-app`, `listmonk-db`, `cloudflared-tunnel`
- Domain: `mail.callvaultai.com` (for sending)
- DNS records in Cloudflare for `callvaultai.com`
- Resend account configuration
- Contact import for two lists: warm (~500-1k) and dormant (~10-20k)

### Does NOT apply to:
- Creating automated sequences (Phase 2 - future work)
- Building custom conversational interface (Phase 3 - future work)
- Advanced segmentation or engagement tracking (Phase 2+ - future work)
- Mobile optimization (not a priority)
- Any changes to domain `email.callvaultai.com` (tunnel endpoint - already configured)

## Decisions Made

### 1. Agent creates admin account WITH user (not for them)
**What:** Agent guides user to create their own admin credentials via the setup wizard
**Why:** Security best practice - user chooses their own password. Agent never knows credentials. Listmonk v6 requires this approach (deprecated env-based admin setup).

### 2. Use port 465 with SSL/TLS for Resend SMTP
**What:** Primary configuration uses `smtp.resend.com:465` with SSL/TLS encryption
**Why:** Most reliable connection method. Fallback to port 587 with STARTTLS only if 465 fails. Port 465 has better firewall compatibility.

### 3. Single sending domain: mail.callvaultai.com
**What:** All emails send from `mail.callvaultai.com` subdomain
**Why:** Keeps spec simple. User can add more subdomains later if needed. Protects main domain reputation. Easy to explain.

### 4. Manual DNS configuration (copy-paste instructions)
**What:** Agent provides exact DNS records to add, user pastes into Cloudflare UI
**Why:** User is comfortable with UIs. Cloudflare API token doesn't have tunnel permissions, so user is already using UI. Consistent experience. Less risky than automated DNS changes.

**Alternative considered:** Automated DNS via Cloudflare API
**Why not:** Requires user to create new API token with DNS edit permissions. Adds complexity and potential for automation errors affecting live domain. Manual is safer and user is already comfortable with Cloudflare UI.

### 5. Import contacts via CSV upload (not API script)
**What:** Use Listmonk's built-in CSV import UI
**Why:** User can see the process happening, fix any data issues visually, and learn the interface they'll use ongoing. More transparent than scripted background import.

### 6. Test email uses user's own email address
**What:** First test subscriber is the user themselves
**Why:** Immediate, visible proof that delivery works. User can check inbox, spam folder, and email rendering. No risk of accidentally emailing real contacts during testing.

### 7. Warm list gets imported first (before dormant)
**What:** Import ~500-1k warm contacts, verify sending works, then import large dormant list
**Why:** Validates entire flow with manageable numbers. If something breaks, easier to diagnose with smaller dataset. Warm list is the priority anyway - user wants to email them first.

### 8. Agent does NOT create sample campaigns or templates proactively
**What:** Only create test campaign for delivery verification, then stop
**Why:** User wants to write their own content. Pre-made templates feel like bloat. User will create first real campaign when they're ready.

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Port 465 SMTP connection fails** | Try port 587 with STARTTLS. If both fail, check Resend API key validity and Docker network connectivity. |
| **DNS verification takes longer than 30 minutes** | Normal if Cloudflare propagation is slow. Wait up to 2 hours. Provide `dig` commands to check propagation manually. |
| **CSV import fails due to formatting** | Listmonk shows specific error (e.g., "missing email column"). Agent guides user to fix CSV headers or data format. Re-import. |
| **Test email lands in spam** | Check SPF/DKIM/DMARC records are correct. Verify domain is fully verified in Resend. Try sending from different "From Name" (sometimes triggers spam filters). Resend support can review. |
| **User's PC is restarted during setup** | Docker containers auto-restart (`restart: unless-stopped`). User just continues where they left off. Tunnel reconnects automatically. |
| **User has multiple CSV files for same list** | Import them sequentially into the same Listmonk list. Listmonk deduplicates by email address automatically. |
| **User doesn't have CSV, only contact data in another tool** | Agent guides export from that tool (e.g., GoHighLevel, HubSpot, Gmail) to CSV format first. |
| **Resend API key is invalid or expired** | SMTP test will fail immediately. User generates new API key from Resend dashboard and updates Listmonk settings. |
| **User wants to send to both lists at once** | Create a new segment "All Contacts" that combines both lists. Or send two separate campaigns (recommended for different messaging). |

## Implementation Checklist

### Pre-Flight Checks
- [ ] Verify Docker containers are running: `docker ps`
- [ ] Verify system is accessible: `curl https://email.callvaultai.com`
- [ ] Confirm setup wizard is showing (not login page)
- [ ] Confirm user has Resend account and can access API keys

### Phase 1: Core Setup
- [ ] Guide user through admin account creation in setup wizard
- [ ] Log in with new credentials to verify success
- [ ] Navigate to Settings → SMTP in Listmonk
- [ ] Add Resend SMTP server with exact configuration
- [ ] Test SMTP connection in Listmonk (must show success)
- [ ] Guide user to Resend dashboard
- [ ] Add domain `mail.callvaultai.com` in Resend
- [ ] Copy SPF record → Add to Cloudflare DNS for callvaultai.com
- [ ] Copy DKIM record → Add to Cloudflare DNS for callvaultai.com
- [ ] Create DMARC record → Add to Cloudflare DNS for callvaultai.com
- [ ] Wait for Resend verification (check every 5 minutes)
- [ ] Confirm domain shows "Verified" in Resend

### Phase 2: Delivery Verification
- [ ] Create test subscriber in Listmonk (user's email)
- [ ] Create test list "Test" with that subscriber
- [ ] Create simple test campaign (subject: "Test Email", body: "This is a test")
- [ ] Set "From Email" to `noreply@mail.callvaultai.com` or user's preference
- [ ] Send test campaign
- [ ] Verify email arrives in user's inbox within 2 minutes
- [ ] Check email is NOT in spam folder
- [ ] Check email headers show proper SPF/DKIM pass

### Phase 3: Contact Import
- [ ] Request warm list CSV from user
- [ ] Create list "Warm List" in Listmonk
- [ ] Import CSV via Listmonk UI (Lists → Warm List → Import)
- [ ] Map CSV columns to Listmonk fields
- [ ] Verify import success (check count matches expected)
- [ ] Request dormant list CSV from user
- [ ] Create list "Dormant List" in Listmonk
- [ ] Import CSV via Listmonk UI
- [ ] Verify import success
- [ ] Show user dashboard with both lists populated

### Phase 4: First Campaign Demo
- [ ] Open Campaigns → New Campaign
- [ ] Show user how to write subject line
- [ ] Show user how to compose email body (rich text editor)
- [ ] Select "Warm List" as recipient list
- [ ] Set "From Email" as `user@mail.callvaultai.com` or user's preference
- [ ] Explain Send Now vs Schedule
- [ ] Let user decide: send immediately to warm list OR do another test first
- [ ] If sending: Monitor campaign progress in dashboard
- [ ] Show analytics after sends complete

### Post-Setup
- [ ] Create brief "Quick Reference" document for user
- [ ] Document: How to send a broadcast (3 steps)
- [ ] Document: How to view analytics
- [ ] Document: How to add new contacts
- [ ] Ask user: "What do you want to send first?"

## Technical Implementation Notes

### SMTP Configuration (Exact Settings)
```
Host: smtp.resend.com
Port: 465
Auth Protocol: LOGIN
Username: resend
Password: [User's Resend API key - starts with re_]
TLS: SSL/TLS
From Email: anything@mail.callvaultai.com
```

If port 465 fails, fallback:
```
Port: 587
TLS: STARTTLS
(all other settings same)
```

### DNS Records Format

**SPF Record:**
```
Type: TXT
Name: mail.callvaultai.com
Value: v=spf1 include:_spf.resend.com ~all
```

**DKIM Record:** (Resend provides exact values)
```
Type: TXT
Name: resend._domainkey.mail.callvaultai.com
Value: [Provided by Resend - long string]
```

**DMARC Record:**
```
Type: TXT
Name: _dmarc.mail.callvaultai.com
Value: v=DMARC1; p=none; rua=mailto:user@callvaultai.com
```

### CSV Import Requirements
Listmonk expects CSV with at minimum:
- `email` column (required)
- Optional: `name`, `first_name`, `last_name`, custom attributes

Example valid CSV:
```csv
email,name
john@example.com,John Doe
jane@example.com,Jane Smith
```

### Container Health Checks
Before each major step, verify:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```
All three containers should show "Up" and healthy.

If Listmonk shows "unhealthy", check logs:
```bash
docker logs listmonk-app --tail 50
```

### Access URLs (For Reference)
- **Admin panel:** https://email.callvaultai.com/admin
- **Public unsubscribe/preferences:** https://email.callvaultai.com
- **Resend dashboard:** https://resend.com/domains
- **Cloudflare DNS:** https://dash.cloudflare.com/[account]/callvaultai.com/dns

## Open Questions

None. All decisions have been made based on project requirements and user preferences.

If anything is unclear during implementation:
1. Make the simplest choice that serves the user's KISS principle
2. Proceed with implementation
3. Document the decision in TECHNICAL.md

## Priority

### Must Have (Blocking for any email sends)
- Admin account created
- SMTP configured and tested
- Domain verified with SPF/DKIM/DMARC
- Test email delivered successfully
- Warm list imported

### Should Have (High value, not blocking)
- Dormant list imported
- First real campaign sent
- User comfortable navigating Listmonk UI
- Quick reference documentation created

### Nice to Have (If time permits)
- Multiple test emails sent to verify consistency
- User has sent to a small segment of warm list as practice
- User understands analytics dashboard

## Success Criteria

**Setup Phase:**
- [ ] User can log into `https://email.callvaultai.com/admin` with their credentials
- [ ] SMTP test shows "Success" in Listmonk settings
- [ ] Domain `mail.callvaultai.com` shows "Verified" in Resend
- [ ] Test email arrives in user's inbox (not spam) within 2 minutes
- [ ] Email headers show `SPF: PASS` and `DKIM: PASS`

**Import Phase:**
- [ ] Warm list shows correct count (500-1,000 contacts) in Listmonk dashboard
- [ ] Dormant list shows correct count (10,000-20,000 contacts) in Listmonk dashboard
- [ ] No import errors or warnings

**Campaign Phase:**
- [ ] User can create a campaign without agent assistance
- [ ] User can select warm list as recipients
- [ ] User can click "Send" and campaign processes
- [ ] Sent emails appear in user's sent analytics
- [ ] User says "this works" or equivalent confirmation

**Overall Success:**
User says something like: "I can send an email to my list now" or "This is ready to use" or clicks send on first real campaign without issues.

## Handoff Notes for Implementation Agent

This spec is implementation-ready. You should be able to:

1. Read this spec
2. Check container status
3. Walk user through each phase sequentially
4. Use existing Listmonk UI (don't build anything custom)
5. Copy-paste configurations exactly as specified
6. Mark checklist items as you complete them
7. Stop when user successfully sends their first real campaign

**Communication approach:**
- Show, don't tell (demos over explanations)
- Plain language ("where your emails will send from" not "SMTP relay")
- Celebrate milestones ("Your email system is ready to use!" not "SMTP configuration complete")
- One step at a time - don't overwhelm
- If user says "just do it" to any manual step, provide exact copy-paste instructions

**When to ask user:**
- Which email address to use as "From Email"
- Whether to send first real campaign now or wait
- Which list to send to first (warm vs dormant)
- If they want to review email before sending

**Never ask user:**
- Technical implementation questions
- Which port to use for SMTP
- How to structure DNS records
- Database or Docker questions
- Where files should be located

Good luck! This is the final bridge to a working system.
