# Project Handover Document - TEMPLATE
<!-- VERSION: 2026.01.09 -->
<!-- PURPOSE: Template for new Listmonk email marketing system setups -->
<!-- INSTRUCTIONS: Copy this file to HANDOVER.md and update status sections as you complete each phase -->

---

## 📋 HOW TO USE THIS TEMPLATE

**This is a TEMPLATE document for setting up a new Listmonk email marketing system.**

As you complete each phase of setup:
1. Update the "Current Phase" section
2. Check off completed items with ✅
3. Update credentials as they're created
4. Document any issues encountered

---

## CURRENT PHASE: [UPDATE THIS]

**Choose one:**
- 🟡 **Phase 1:** Initial Setup (Docker, Tunnel, Database)
- 🟡 **Phase 2:** Admin Account Creation
- 🟡 **Phase 3:** SMTP Configuration with Resend
- 🟡 **Phase 4:** DNS Records Setup
- 🟡 **Phase 5:** Test Email
- ✅ **COMPLETE:** System fully operational

**Update this section with your actual status and what needs to happen next.**

---

## 🚨 CRITICAL: HOW THIS SYSTEM WORKS GOING FORWARD

### Once Setup is Complete - No More Docker Commands Needed!

**IMPORTANT:** After initial setup is done, the system runs automatically. Here's what you need to understand:

### Normal Usage (99% of the time) - AFTER SETUP:

**From ANY Computer/Device:**
- ✅ Open browser → https://email.YOUR-DOMAIN.com/admin
- ✅ Login and use Listmonk
- ✅ Create campaigns, import lists, send emails
- ✅ Everything works remotely via Cloudflare Tunnel

**You do NOT need to:**
- ❌ Run Docker commands (except rare troubleshooting)
- ❌ SSH or remote desktop to the host PC
- ❌ Touch the host PC at all
- ❌ Be physically near the PC

### The System Runs 24/7 Automatically:
- Docker containers start automatically when PC boots
- Cloudflare Tunnel stays connected 24/7
- Database persists all data
- You just use the web interface from anywhere

---

### When Docker Commands ARE Needed:

**Only 3 scenarios require accessing the host PC directly:**

1. **System isn't responding at all**
   - Website won't load at all
   - Need to check if Docker containers are running

2. **After PC restart/power outage**
   - Docker Desktop should auto-start containers
   - If not, may need to run `docker-compose up -d`

3. **Major system changes**
   - Updating Listmonk version
   - Changing configuration
   - Database backup/restore

**In these cases:**

**Option A: If you're physically at the host PC:**
```bash
# Open Command Prompt or PowerShell on the PC
cd [PROJECT_DIRECTORY]
docker ps  # Check if containers are running
docker-compose up -d  # Start containers if needed
```

**Option B: If you're remote:**
- Remote Desktop into the host PC
- Then follow Option A commands above

**DO NOT try to troubleshoot Docker from a different computer** - Docker commands only work on the PC where Docker is installed.

---

### How to Know If You Need Docker Access:

**Use the web interface first! Ask yourself:**

1. Can I access https://email.YOUR-DOMAIN.com/admin?
   - **YES** → Everything is fine, use it normally (no Docker needed)
   - **NO** → THEN check if Docker is running

2. Can I login to Listmonk?
   - **YES** → System is working, use it normally
   - **NO but website loads** → Password issue, not a Docker issue

3. Can I send emails?
   - **YES** → Everything working, no Docker needed
   - **NO but Listmonk works** → SMTP configuration issue, fix in Listmonk settings (not Docker)

**Rule of Thumb:** If the website loads at all, Docker is working. Don't touch it.

---

### For Future AI Agents Helping This User:

**Before suggesting any Docker commands, ALWAYS verify:**

1. ✅ Is the user on the host PC where Docker is installed?
   - If NO → Tell them to use the web interface OR remote desktop in

2. ✅ Have they tried the web interface at their Listmonk URL?
   - If NO → Direct them there FIRST

3. ✅ Is this actually a Docker issue or a usage/configuration issue?
   - **Docker issues** = website completely unreachable, containers not running
   - **Configuration issues** = website loads but something doesn't work (fix in UI)

4. ✅ Are containers actually not running?
   - Have them check: Can they access the website?
   - If YES → Containers are fine, don't touch Docker

**Default Response Template:**

> "Your Listmonk system runs automatically via Docker on your host PC. You can access it from anywhere at https://email.YOUR-DOMAIN.com/admin.
>
> Can you access that URL right now?
> - If YES: Great! The system is working. What do you need help with in Listmonk?
> - If NO: Are you on your host PC or can you remote desktop to it? We'll need to check if Docker is running."

---

## PROJECT OVERVIEW

### What You're Building
A self-hosted email marketing system that allows you to:
- Send broadcast emails to large contact lists
- Set up automated drip sequences
- Track opens/clicks
- Maintain list hygiene automatically
- Access from anywhere via web browser
- Send emails with professional deliverability

### Why This Approach
- Self-hosting saves ~$200-400/month vs. commercial platforms (GoHighLevel, etc.)
- Full control over your data and system
- Use existing hardware you already own (saves hosting costs)
- Professional email delivery via Resend

### Tech Stack
| Component | Purpose | Cost |
|-----------|---------|------|
| Your PC | Hosting (already owned) | $0 |
| Docker Desktop | Container runtime | $0 |
| Listmonk | Email marketing platform | $0 (open source) |
| PostgreSQL | Database | $0 |
| Cloudflare Tunnel | Remote access from anywhere | $0 |
| Resend | Email delivery | ~$50-90/month |
| **TOTAL** | | **~$50-90/month** |

---

## SETUP PROGRESS CHECKLIST

### Phase 1: Infrastructure Setup
- [ ] Docker Desktop installed on host PC
- [ ] Project directory created
- [ ] docker-compose.yml created
- [ ] PostgreSQL container running
- [ ] Listmonk container running
- [ ] Cloudflare Tunnel created
- [ ] Public hostname configured (email.YOUR-DOMAIN.com)
- [ ] Tunnel container running
- [ ] Website accessible at https://email.YOUR-DOMAIN.com

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

### Phase 2: Admin Account Setup
- [ ] Admin setup wizard appears at /admin
- [ ] Admin account created via web interface
- [ ] Login credentials saved securely
- [ ] Can successfully login to Listmonk
- [ ] Admin account persists after container restart
- [ ] API user created (if needed for automation)

**Current Admin Credentials:** [TO BE FILLED IN]
- Username: _______________
- Password: _______________
- Email: _______________

**API Credentials:** [TO BE FILLED IN]
- API User: _______________
- API Key: _______________

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

### Phase 3: Email Configuration (Resend)
- [ ] Resend account created
- [ ] Domain added to Resend (mail.YOUR-DOMAIN.com)
- [ ] Domain verified in Resend
- [ ] DNS records obtained from Resend
- [ ] SMTP configuration added to Listmonk
- [ ] SMTP test connection successful

**Resend Details:** [TO BE FILLED IN]
- API Key: _______________
- Domain: mail._______________
- Domain ID: _______________

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

### Phase 4: DNS Records (Cloudflare)
- [ ] SPF record added
- [ ] DKIM record added
- [ ] MX record added (if needed)
- [ ] Records propagated (5-30 minutes)
- [ ] Domain shows "Verified" in Resend

**DNS Records:** [TO BE DOCUMENTED]

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

### Phase 5: Test Email
- [ ] Test list created in Listmonk
- [ ] Test subscriber added
- [ ] Test campaign created
- [ ] Test campaign sent successfully
- [ ] Email received in inbox
- [ ] Email did NOT go to spam

**Test Results:** [TO BE FILLED IN]
- Test sent to: _______________
- Inbox or Spam? _______________
- Date/Time: _______________

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

### Phase 6: Production Ready
- [ ] Contact lists prepared (CSV format)
- [ ] Warm list ready to import (~500-1000 contacts)
- [ ] Dormant list ready to import (~10,000+ contacts)
- [ ] First real campaign drafted
- [ ] Backup procedures documented
- [ ] System running smoothly

**Status:** 🔴 Not Started | 🟡 In Progress | ✅ Complete

---

## SYSTEM ACCESS DETAILS

### Public Access
**URL:** https://email.YOUR-DOMAIN.com/admin

**Admin Login:**
- Username: `[FILL IN AFTER CREATION]`
- Password: `[FILL IN AFTER CREATION]`
- Email: `[FILL IN AFTER CREATION]`

**API Access** (if created):
- API User: `[FILL IN AFTER CREATION]`
- API Key: `[FILL IN AFTER CREATION]`

---

### Cloudflare Tunnel
**Tunnel Details:**
- Tunnel ID: `[FILL IN]`
- Tunnel Name: `[FILL IN]`
- Account ID: `[FILL IN]`
- Public Hostname: `email.YOUR-DOMAIN.com`

---

### Database (Internal Access Only)
**PostgreSQL:**
- Host: `db` (Docker internal network)
- Port: 5432
- User: `listmonk`
- Password: `[SET IN docker-compose.yml]`
- Database: `listmonk`

---

### Resend Configuration
**Domain:**
- Sending Domain: `mail.YOUR-DOMAIN.com`
- API Key: `[FILL IN]`
- Domain Status: [ ] Pending | [ ] Verified

**SMTP Settings for Listmonk:**
```
Host: smtp.resend.com
Port: 465
Auth Protocol: login
Username: resend
Password: [YOUR_RESEND_API_KEY]
TLS: SSL/TLS
From Email: hello@mail.YOUR-DOMAIN.com
```

---

## DOCKER CONFIGURATION

### docker-compose.yml (Reference)

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: listmonk-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: listmonk
      POSTGRES_PASSWORD: [CHANGE_ME]
      POSTGRES_DB: listmonk
    volumes:
      - listmonk-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U listmonk"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Listmonk Application
  listmonk:
    image: listmonk/listmonk:latest
    container_name: listmonk-app
    restart: unless-stopped
    ports:
      - "9000:9000"
    depends_on:
      db:
        condition: service_healthy
    environment:
      LISTMONK_db__host: db
      LISTMONK_db__port: 5432
      LISTMONK_db__user: listmonk
      LISTMONK_db__password: [CHANGE_ME]
      LISTMONK_db__database: listmonk
      LISTMONK_db__ssl_mode: disable
      LISTMONK_app__address: "0.0.0.0:9000"
    # IMPORTANT: Do NOT include --install flag here
    # It will wipe database on every restart

  # Cloudflare Tunnel
  cloudflared:
    image: cloudflare/cloudflared:latest
    container_name: cloudflared-tunnel
    restart: unless-stopped
    command: tunnel --config /etc/cloudflared/config.yml run
    volumes:
      - ./tunnel-config.yml:/etc/cloudflared/config.yml:ro
      - ./tunnel-credentials.json:/etc/cloudflared/credentials.json:ro
    depends_on:
      - listmonk

volumes:
  listmonk-data:
    name: listmonk-postgres-data
```

### tunnel-config.yml (Reference)

```yaml
tunnel: [YOUR_TUNNEL_ID]
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: email.YOUR-DOMAIN.com
    service: http://listmonk:9000
  - service: http_status:404
```

**CRITICAL:** Use `http://listmonk:9000` (Docker service name), NOT `host.docker.internal`

---

## COMMON ISSUES & SOLUTIONS

### Issue 1: Admin Account Doesn't Persist
**Problem:** Login works, but after container restart, can't login anymore

**Cause:** `--install --yes` flag in docker-compose.yml wipes database

**Solution:**
- Remove any `command:` line that includes `--install` from Listmonk service
- Restart containers: `docker-compose restart`
- Recreate admin account via web interface

---

### Issue 2: Tunnel Can't Reach Listmonk
**Problem:** Website shows 502 Bad Gateway

**Cause:** Incorrect service URL in tunnel-config.yml

**Solution:**
- Use `http://listmonk:9000` (Docker service name)
- Do NOT use `host.docker.internal`
- Restart tunnel: `docker-compose restart cloudflared`

---

### Issue 3: Emails Not Sending
**Problem:** Campaign shows as "running" but emails don't send

**Possible Causes:**
1. SMTP not configured correctly
2. Resend domain not verified
3. DNS records not propagated

**Solutions:**
1. Check SMTP settings in Listmonk (Settings → SMTP)
2. Test connection in SMTP settings
3. Verify domain status in Resend dashboard
4. Check DNS records in Cloudflare

---

### Issue 4: Can't Access Website
**Problem:** https://email.YOUR-DOMAIN.com doesn't load

**Diagnosis:**
```bash
# On host PC:
docker ps  # Are all 3 containers running?
docker logs cloudflared-tunnel | tail -20  # Look for "Registered tunnel connection"
curl http://localhost:9000  # Is Listmonk responding locally?
```

**Solution:**
- If containers not running: `docker-compose up -d`
- If tunnel not connected: Check tunnel-config.yml and restart
- If Listmonk not responding: Check Listmonk logs

---

## NEXT STEPS AFTER SETUP IS COMPLETE

### Immediate (First Use):
1. **Import Warm List**
   - Lists → Create new list
   - Name: "Warm List"
   - Import CSV (columns: email, name)
   - Verify count

2. **Send First Campaign**
   - Campaigns → New Campaign
   - Select warm list
   - Write email
   - Send to small test group first

3. **Monitor Results**
   - Check open rates
   - Monitor bounces
   - Review unsubscribes

### Ongoing:
1. **Regular Backups** (weekly recommended)
   ```bash
   docker exec listmonk-db pg_dump -U listmonk listmonk > backup.sql
   ```

2. **Monitor System Health**
   - Check website accessibility
   - Monitor Docker containers
   - Review email sending logs

3. **Improve Deliverability**
   - Start with engaged contacts
   - Gradual send volume increase
   - Monitor inbox vs spam placement
   - Maintain good sender reputation

---

## EMAIL DELIVERABILITY BEST PRACTICES

### Starting Out:
- Send to warm list first (most engaged contacts)
- Start small (100-500 emails first batch)
- Monitor open rates and engagement
- Gradually increase volume over 2-3 weeks

### Content Tips:
- Avoid spam trigger words
- Include real value in every email
- Proper text/HTML ratio
- Always include unsubscribe link (automatic)
- Use recognizable sender name

### Improving Placement:
- High engagement = better deliverability
- Ask recipients to move from Promotions → Primary (Gmail)
- Request adding to contacts
- Consistent sending schedule
- Monitor bounce/unsubscribe rates

---

## RESOURCES & DOCUMENTATION

### Official Documentation:
- **Listmonk:** https://listmonk.app/docs
- **Listmonk API:** https://listmonk.app/docs/apis/apis
- **Resend:** https://resend.com/docs
- **Cloudflare Tunnels:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps

### Support:
- **Listmonk GitHub:** https://github.com/knadh/listmonk
- **Listmonk Discussions:** https://github.com/knadh/listmonk/discussions

---

## DOCUMENT END

**Remember:** Once setup is complete, you access everything via the web interface at https://email.YOUR-DOMAIN.com/admin from any device. Docker commands are only needed for rare troubleshooting or system maintenance.

**Status:** Update the sections above as you complete each phase.
