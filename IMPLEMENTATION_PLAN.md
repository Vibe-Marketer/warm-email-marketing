# Implementation Plan for AI Agents
## Listmonk Email Marketing System Setup

**Purpose:** This document provides a step-by-step implementation plan that an AI agent can follow to set up the Listmonk email marketing system from scratch.

**Target Audience:** AI coding assistants (Claude, GPT, Gemini, etc.)

**Time Estimate:** 60-90 minutes for full setup

---

## Prerequisites Verification

Before beginning, verify the user has:

- [ ] Windows PC with Docker Desktop installed and running
- [ ] Cloudflare account with login access
- [ ] Domain managed in Cloudflare DNS
- [ ] Resend account created (free tier acceptable)
- [ ] Git installed for cloning repository
- [ ] Terminal/command line access

**Agent Action:** Ask user to confirm all prerequisites are met before proceeding.

---

## Phase 1: Repository Setup (5 minutes)

### Step 1.1: Clone Repository

```bash
git clone <repository-url>
cd warm-email-marketing
```

**Verification:** Confirm you're in the project directory with `ls` or `dir`.

### Step 1.2: Create Environment File

```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

**Verification:** File `.env` should now exist in project root.

---

## Phase 2: Cloudflare Tunnel Setup (15 minutes)

### Step 2.1: Guide User to Create Tunnel

**Agent Instruction:** Provide these exact instructions to the user:

```
1. Open browser and go to: https://one.dash.cloudflare.com/
2. Log in to your Cloudflare account
3. Navigate to: Networks → Tunnels
4. Click: "Create a tunnel"
5. Name your tunnel: "listmonk-email" (or your preference)
6. Click: "Save tunnel"
```

**Agent Action:** Wait for user confirmation that tunnel is created.

### Step 2.2: Collect Tunnel Information

**Agent Instruction:** Ask user to provide:

1. **Tunnel Token** - Long string starting with `eyJ...`
   - Found in tunnel setup page after creation
   - Will be used in `.env` file

2. **Tunnel ID** - UUID format like `4cc009b4-d2bc-4332-9318-dadfddbc5fd7`
   - Visible in tunnel details page
   - Will be used in `tunnel-config.yml`

**Agent Action:** Store these values temporarily (don't write to files yet).

### Step 2.3: Configure Public Hostname

**Agent Instruction:** Guide user through this:

```
1. In the tunnel setup page, find "Public Hostnames" section
2. Click: "Add a public hostname"
3. Fill in:
   - Subdomain: "email" (or user's preference)
   - Domain: [select your domain from dropdown]
   - Service Type: HTTP
   - URL: localhost:9000
4. Click: "Save hostname"
```

**Agent Action:** Confirm with user what their full URL will be (e.g., `email.yourdomain.com`). Store this value.

### Step 2.4: Download Tunnel Credentials

**Agent Instruction:** Guide user:

```
1. In the tunnel details page, look for credentials file download
2. Click to download the JSON file
3. Save it as "tunnel-credentials.json" in the project root directory
```

**Agent Action:** Verify file exists: `ls tunnel-credentials.json` or ask user to confirm.

---

## Phase 3: Configuration File Updates (10 minutes)

### Step 3.1: Update .env File

**Agent Action:** Use the Edit or Write tool to update `.env`:

```env
CLOUDFLARE_TUNNEL_TOKEN=<paste user's tunnel token here>
```

Replace `REPLACE_WITH_YOUR_TUNNEL_TOKEN` with the actual token from Step 2.2.

**Verification:** Read the file back and confirm token is present and starts with `eyJ`.

### Step 3.2: Update tunnel-config.yml

**Agent Action:** Use the Edit tool to update `tunnel-config.yml`:

Replace:
- `REPLACE_WITH_YOUR_TUNNEL_ID` → User's tunnel ID from Step 2.2
- `REPLACE_WITH_YOUR_DOMAIN_COM` → User's domain from Step 2.3

Example result:
```yaml
tunnel: 4cc009b4-d2bc-4332-9318-dadfddbc5fd7
credentials-file: /etc/cloudflared/credentials.json
ingress:
  - hostname: email.yourdomain.com
    service: http://listmonk:9000
  - service: http_status:404
```

**Verification:** Read file back and confirm:
- No `REPLACE_` placeholders remain
- Hostname matches user's domain
- Tunnel ID is valid UUID format

---

## Phase 4: Docker Container Startup (10 minutes)

### Step 4.1: Start Docker Desktop

**Agent Action:** Ask user to confirm Docker Desktop is running.

**Verification Command:**
```bash
docker --version
```

Should return version info. If not, instruct user to start Docker Desktop and wait for it to be ready.

### Step 4.2: Start Containers

**Agent Action:** Run command:

```bash
docker-compose up -d
```

**Expected Output:**
- Creating network...
- Creating volume...
- Pulling images (first time only, ~5 minutes)
- Starting containers

**Agent Action:** Monitor output for errors. If any occur, troubleshoot before proceeding.

### Step 4.3: Verify Containers Running

**Agent Action:** Run command:

```bash
docker ps
```

**Expected Result:** Three containers with "Up" status:
- `listmonk-db`
- `listmonk-app`
- `cloudflared-tunnel`

**If containers are not running:**

```bash
# Check logs
docker logs listmonk-app
docker logs cloudflared-tunnel
docker logs listmonk-db
```

Common issues:
- Missing tunnel credentials → verify file exists
- Invalid tunnel token → check `.env` file
- Port conflict → check if port 9000 is available

### Step 4.4: Check Tunnel Connection

**Agent Action:** Run command:

```bash
docker logs cloudflared-tunnel
```

**Expected Output:** Look for line containing:
```
Registered tunnel connection
```

**Agent Action:** Confirm tunnel is connected before proceeding.

### Step 4.5: Test External Access

**Agent Action:** Instruct user to:

```
Open browser and navigate to: https://email.yourdomain.com/admin
```

**Expected Result:** Listmonk setup wizard page appears.

**If 502 Bad Gateway:**
- Wait 30-60 seconds for containers to fully initialize
- Refresh page
- Check `docker logs listmonk-app` for startup completion

**If connection timeout:**
- Verify tunnel is connected (Step 4.4)
- Check Cloudflare tunnel dashboard shows "Healthy" status
- Verify DNS is resolving: `nslookup email.yourdomain.com`

---

## Phase 5: Admin Account Creation (5 minutes)

### Step 5.1: Access Setup Wizard

**Agent Action:** Confirm user sees setup wizard at `https://email.yourdomain.com/admin`.

**If user sees login page instead of setup wizard:**
- This indicates admin already exists
- Use password reset procedure (see Troubleshooting section)

### Step 5.2: Create Admin Account

**Agent Instruction:** Guide user to fill out form:

```
Email: [user's email address]
Username: [user's choice]
Password: [strong password - user should save this]
Confirm Password: [same password]
```

**Agent Action:** Instruct user to click "Continue" or "Setup" button.

### Step 5.3: Verify Login

**Expected Result:** User is automatically logged in and sees empty Listmonk dashboard.

**Agent Action:** Confirm with user they see the dashboard with sidebar menu containing:
- Dashboard
- Lists
- Subscribers
- Campaigns
- Settings

---

## Phase 6: SMTP Configuration with Resend (20 minutes)

### Step 6.1: Get Resend API Key

**Agent Instruction:** Guide user:

```
1. Go to: https://resend.com/
2. Log in to your account
3. Navigate to: API Keys (left sidebar)
4. Click: "Create API Key"
5. Name: "Listmonk SMTP"
6. Permissions: Select "Sending access"
7. Click: "Add"
8. COPY THE API KEY (starts with re_) - you won't see it again
```

**Agent Action:** Ask user to provide the API key (temporarily store it, don't save to repository).

### Step 6.2: Configure SMTP in Listmonk

**Agent Instruction:** Guide user through Listmonk UI:

```
1. In Listmonk dashboard, click "Settings" (gear icon) in left sidebar
2. Click "SMTP" tab
3. Click "Add new SMTP server"
4. Fill in the following exact values:
```

**SMTP Configuration:**
```
Host: smtp.resend.com
Port: 465
Auth Protocol: LOGIN
Username: resend
Password: <paste the Resend API key>
HELO hostname: mail.yourdomain.com
Max connections: 10
Max message retries: 2
Idle timeout: 15s
Wait timeout: 5s
TLS: SSL/TLS
Skip TLS verification: NO (leave unchecked)
```

**Agent Action:**
- Replace `mail.yourdomain.com` with user's actual domain
- Replace password with user's Resend API key

```
5. Click "Save"
6. Click "Test" button next to the SMTP server
```

**Expected Result:** "SMTP connection test successful" message.

**If test fails:**
- Verify API key is correct (no extra spaces)
- Try port 587 with STARTTLS instead
- Check `docker logs listmonk-app` for detailed error
- Verify Resend account is active

---

## Phase 7: DNS Records Setup (30 minutes)

### Step 7.1: Add Domain to Resend

**Agent Instruction:** Guide user:

```
1. In Resend dashboard, go to: Domains
2. Click: "Add Domain"
3. Enter: mail.yourdomain.com
4. Click: "Add"
```

**Expected Result:** Resend shows DNS records that need to be added.

**Agent Action:** Ask user to keep this page open - they'll need the DNS record values.

### Step 7.2: Add SPF Record in Cloudflare

**Agent Instruction:**

```
1. Go to: https://dash.cloudflare.com/
2. Select your domain
3. Click: DNS (left sidebar)
4. Click: "Add record"
5. Fill in:
   Type: TXT
   Name: mail
   Content: v=spf1 include:_spf.resend.com ~all
   TTL: Auto
   Proxy status: DNS only (gray cloud, not orange)
6. Click: "Save"
```

**Agent Action:** Confirm with user that SPF record is added.

### Step 7.3: Add DKIM Record in Cloudflare

**Agent Instruction:**

```
1. In Resend domain page, copy the DKIM record details
2. In Cloudflare DNS, click: "Add record"
3. Fill in:
   Type: TXT
   Name: resend._domainkey.mail
   Content: <paste the long string from Resend>
   TTL: Auto
   Proxy status: DNS only (gray cloud)
4. Click: "Save"
```

**Agent Action:** Verify with user that DKIM record is added correctly.

### Step 7.4: Add DMARC Record in Cloudflare

**Agent Instruction:**

```
1. In Cloudflare DNS, click: "Add record"
2. Fill in:
   Type: TXT
   Name: _dmarc.mail
   Content: v=DMARC1; p=none; rua=mailto:youremail@yourdomain.com
   TTL: Auto
   Proxy status: DNS only (gray cloud)
3. Replace youremail@yourdomain.com with actual email for reports
4. Click: "Save"
```

**Agent Action:** Confirm DMARC record is added.

### Step 7.5: Wait for DNS Propagation

**Agent Action:** Inform user:

```
DNS changes can take 5-30 minutes to propagate globally.
We'll check verification status in a few minutes.
```

**Verification Command (optional):**
```bash
nslookup -type=TXT mail.yourdomain.com
nslookup -type=TXT resend._domainkey.mail.yourdomain.com
```

**Agent Action:** Wait 5-10 minutes, then check Resend dashboard.

### Step 7.6: Verify Domain in Resend

**Agent Instruction:**

```
1. Go back to Resend dashboard → Domains
2. Look at mail.yourdomain.com status
3. If it says "Verified" with green checkmark - you're good
4. If still "Pending" - wait another 5-10 minutes and refresh
```

**Agent Action:** Don't proceed to testing until domain shows "Verified".

---

## Phase 8: Test Email Sending (10 minutes)

### Step 8.1: Create Test Subscriber

**Agent Instruction:**

```
1. In Listmonk, click "Subscribers" (left sidebar)
2. Click "Add subscriber"
3. Fill in:
   Email: <user's email address>
   Name: Test User
   Status: Enabled
4. Click "Save"
```

### Step 8.2: Create Test List

**Agent Instruction:**

```
1. Click "Lists" (left sidebar)
2. Click "New list"
3. Fill in:
   Name: Test
   Type: Public
4. Click "Save"
```

### Step 8.3: Add Subscriber to List

**Agent Instruction:**

```
1. Go back to "Subscribers"
2. Click on the test subscriber you just created
3. Under "Lists" section, check the box next to "Test"
4. Click "Save"
```

### Step 8.4: Create and Send Test Campaign

**Agent Instruction:**

```
1. Click "Campaigns" (left sidebar)
2. Click "New campaign"
3. Fill in:
   Name: Test Send
   Subject: Test Email from Listmonk
   From email: hello@mail.yourdomain.com (or user's preference)
   Lists: Select "Test"
4. In email editor, type simple message:
   "This is a test email to verify deliverability. If you're reading this, everything is working!"
5. Click "Continue"
6. Review settings
7. Click "Start campaign"
```

**Agent Action:** Replace `mail.yourdomain.com` with user's actual domain.

### Step 8.5: Verify Delivery

**Agent Instruction:**

```
1. Check your email inbox (the address you used for test subscriber)
2. Email should arrive within 1-2 minutes
3. If not in inbox, check Spam/Promotions folder
4. Open the email and verify it displays correctly
```

**Agent Action:** Ask user to confirm they received the email.

**If email doesn't arrive:**
- Check Listmonk campaign status (should show "Finished")
- Check `docker logs listmonk-app` for SMTP errors
- Verify Resend domain is still showing "Verified"
- Check Resend dashboard for any sending errors

### Step 8.6: Verify Email Headers (Optional but Recommended)

**Agent Instruction:**

```
In Gmail:
1. Open the test email
2. Click three dots (more options)
3. Click "Show original"
4. Look for these lines:
   SPF: PASS
   DKIM: PASS
   DMARC: PASS
```

**Agent Action:** If all three show PASS, deliverability is correctly configured.

**If any show FAIL:**
- Re-check DNS records in Cloudflare
- Wait for DNS propagation (can take up to 48 hours in rare cases)
- Verify records match exactly what Resend provided

---

## Phase 9: Contact Import (20 minutes)

### Step 9.1: Verify CSV Format

**Agent Action:** Ask user if they have contact lists ready.

**Expected Format:**
```csv
email,name
john@example.com,John Doe
jane@example.com,Jane Smith
```

**Agent Instruction:** If user's CSV has different column names:
- First column should be email addresses
- Additional columns can be name, first_name, last_name, etc.
- Headers are required

### Step 9.2: Create Contact Lists

**Agent Instruction:**

```
1. In Listmonk, click "Lists"
2. Click "New list"
3. Create first list:
   Name: Warm Contacts
   Type: Public
   Description: Recent engaged contacts
4. Click "Save"
5. Click "New list" again
6. Create second list:
   Name: Dormant Contacts
   Type: Public
   Description: Contacts needing re-engagement
7. Click "Save"
```

### Step 9.3: Import Warm Contacts

**Agent Instruction:**

```
1. Click "Subscribers" → "Import"
2. Choose your warm contacts CSV file
3. Map columns:
   - CSV "email" → Listmonk "Email"
   - CSV "name" → Listmonk "Name"
4. Lists to subscribe to: Select "Warm Contacts"
5. Mode: Subscribe
6. Overwrite existing: Check if you want to update existing contacts
7. Click "Upload"
8. Wait for import to complete
```

**Agent Action:** Monitor import progress. Note the final count.

### Step 9.4: Import Dormant Contacts

**Agent Instruction:** Repeat Step 9.3 with dormant contacts CSV, selecting "Dormant Contacts" list.

### Step 9.5: Verify Imports

**Agent Instruction:**

```
1. Go to "Lists"
2. Verify "Warm Contacts" shows correct subscriber count
3. Verify "Dormant Contacts" shows correct subscriber count
4. Click into each list to spot-check a few contacts
```

**Agent Action:** Confirm with user that import counts match their expectations.

---

## Phase 10: System Ready (5 minutes)

### Step 10.1: Final Verification Checklist

**Agent Action:** Verify with user:

- [ ] Docker containers are running
- [ ] Listmonk is accessible via URL
- [ ] Admin account is created and working
- [ ] SMTP is configured and tested
- [ ] DNS records are verified
- [ ] Test email was delivered successfully
- [ ] Contact lists are imported

### Step 10.2: Next Steps Guidance

**Agent Instruction:** Inform user they can now:

1. **Send their first real campaign**
   - Choose warm contacts for first send
   - Write email content
   - Schedule or send immediately

2. **Create email templates**
   - Settings → Templates
   - Build reusable templates for common emails

3. **Set up automated sequences** (future enhancement)
   - Drip campaigns for onboarding
   - Re-engagement sequences for dormant contacts

4. **Monitor analytics**
   - Campaign performance
   - Open rates, click rates
   - Subscriber engagement

### Step 10.3: Save Configuration Documentation

**Agent Action:** Create a summary document for the user with their specific settings:

```markdown
# Your Listmonk Configuration

## Access
- URL: https://email.yourdomain.com/admin
- Admin Email: <user's email>
- Admin Username: <user's username>

## Email Sending
- Sending Domain: mail.yourdomain.com
- SMTP: Resend (smtp.resend.com:465)
- From Email: hello@mail.yourdomain.com

## Lists
- Warm Contacts: X subscribers
- Dormant Contacts: Y subscribers

## Backup Reminder
Run this monthly to backup your database:
docker exec listmonk-db pg_dump -U listmonk listmonk > backup_$(date +%Y%m%d).sql
```

**Agent Action:** Save this as `YOUR_CONFIGURATION.md` in the project root.

---

## Troubleshooting Guide for AI Agents

### Issue: Docker containers won't start

**Diagnostic Steps:**
1. Check Docker is running: `docker --version`
2. Check logs: `docker-compose logs`
3. Look for specific error messages

**Common Causes:**
- Port 9000 already in use → Change port in docker-compose.yml
- Invalid tunnel token → Verify .env file
- Missing tunnel-credentials.json → User must download from Cloudflare

### Issue: Cannot access https://email.yourdomain.com

**Diagnostic Steps:**
1. Check tunnel logs: `docker logs cloudflared-tunnel`
2. Look for "Registered tunnel connection"
3. Check Cloudflare dashboard shows tunnel as "Healthy"
4. Test DNS: `nslookup email.yourdomain.com`

**Common Causes:**
- Tunnel not connected → Check credentials file
- DNS not propagated → Wait 5-10 minutes
- Wrong hostname in tunnel-config.yml → Verify domain matches

### Issue: SMTP test fails

**Diagnostic Steps:**
1. Verify Resend API key is correct
2. Check logs: `docker logs listmonk-app`
3. Try alternate port (587 with STARTTLS)

**Common Causes:**
- Invalid API key → User needs to create new one
- Network firewall blocking port 465 → Try port 587
- Resend account not active → User needs to verify email

### Issue: Emails going to spam

**Diagnostic Steps:**
1. Check email headers for SPF, DKIM, DMARC status
2. Verify all DNS records in Cloudflare
3. Confirm domain is "Verified" in Resend

**Common Causes:**
- DNS records not propagated → Wait up to 48 hours
- DKIM record incorrect → Copy exact value from Resend
- New domain needs warming → Send to engaged contacts first

### Issue: Admin password forgotten

**Solution:**
```bash
# Connect to database
docker exec -it listmonk-db psql -U listmonk -d listmonk

# Reset password
UPDATE users SET password = crypt('newpassword', gen_salt('bf')) WHERE email = 'user@example.com';

# Exit
\q
```

---

## Success Criteria

**System is successfully set up when:**

1. ✅ All three Docker containers are running without errors
2. ✅ Listmonk is accessible via public URL
3. ✅ Admin can log in to dashboard
4. ✅ SMTP connection test shows "Success"
5. ✅ Resend domain shows "Verified"
6. ✅ Test email delivers to inbox (not spam)
7. ✅ Email headers show SPF/DKIM/DMARC all PASS
8. ✅ Contact lists are imported with correct counts
9. ✅ User can create and send a campaign

**Agent Action:** Confirm all criteria are met before marking setup as complete.

---

## Post-Setup Recommendations

### Immediate (Do Now)

1. **Test sending to warm list**
   - Start with small segment (50-100 contacts)
   - Verify deliverability before sending to full list

2. **Set up monitoring**
   - Check Docker containers daily: `docker ps`
   - Monitor Resend usage and limits

3. **Create backup schedule**
   - Set calendar reminder for monthly backups
   - Store backups securely off-site

### Short-term (This Week)

1. **Create email templates**
   - Design consistent branding
   - Build 2-3 common email formats

2. **Plan first campaigns**
   - Warm list: Value-add content
   - Dormant list: Re-engagement sequence

3. **Set up analytics tracking**
   - UTM parameters for links
   - Goal tracking in analytics platform

### Long-term (This Month)

1. **Build automated sequences**
   - Welcome series for new subscribers
   - Nurture campaigns for engagement

2. **Implement list hygiene**
   - Regular cleaning of bounced emails
   - Engagement-based segmentation

3. **Scale gradually**
   - Increase sending volume slowly
   - Monitor deliverability metrics

---

## Agent Completion Checklist

Before ending the session, ensure:

- [ ] All configuration files have been updated with user's actual values
- [ ] No `REPLACE_` placeholders remain in any file
- [ ] Docker containers are running successfully
- [ ] Test email was delivered and verified
- [ ] User knows how to access the system
- [ ] User has their login credentials saved
- [ ] Backup procedure has been explained
- [ ] User knows where to find documentation (SETUP.md, README.md)
- [ ] Configuration summary document created
- [ ] User confirms they can access admin dashboard

**Final Agent Message to User:**

"Your Listmonk email marketing system is now fully operational! You can access it at https://email.yourdomain.com/admin anytime. I've created a configuration summary in YOUR_CONFIGURATION.md for your reference. You're ready to start sending campaigns to your contacts. Would you like help creating your first campaign, or do you have any questions about the system?"

---

**End of Implementation Plan**

**Version:** 2026.01.09
**For:** AI Coding Assistants
**Maintained by:** Repository owners
