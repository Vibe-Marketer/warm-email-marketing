# Email Marketing System Setup Guide

Complete step-by-step guide to get your Listmonk email marketing system up and running from scratch.

## Overview

This guide covers:
1. Docker configuration and startup
2. Creating your admin account
3. Configuring email delivery via Resend
4. Setting up DNS records for deliverability
5. Testing email sends
6. Importing your contact lists

**Time Required:** 60-90 minutes total

---

## Prerequisites

Before starting, ensure you have:

- [ ] Windows PC with Docker Desktop installed and running
- [ ] Cloudflare account with domain managed there
- [ ] Resend account created (free tier is fine to start)
- [ ] Git installed (to clone this repository)
- [ ] Basic familiarity with command line

---

## Important Note for Fresh Installs

**If you're setting up this repository from scratch** (cloning for the first time), follow these steps to avoid Docker configuration issues:

1. Start with fresh configuration files (use `.env.example` as template)
2. Create YOUR OWN Cloudflare tunnel (don't reuse existing tunnel credentials)
3. Update ALL configuration files with your own values before running `docker-compose up`

The existing `tunnel-config.yml` in this repo is an example. You MUST create your own tunnel and credentials.

See detailed instructions below.

---

## Quick Reference

For those who have already done this once and just need a reminder:

```bash
# 1. Create your tunnel in Cloudflare dashboard
# 2. Update config files with YOUR tunnel ID and credentials
# 3. Start containers
docker-compose up -d

# 4. Access setup wizard
# https://email.yourdomain.com/admin

# 5. Configure SMTP with your Resend API key
# 6. Add DNS records (SPF, DKIM, DMARC)
# 7. Test send
```

For first-time setup, follow the detailed guide below.

---

## Part 1: Initial Docker Setup (15 minutes)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/warm-email-marketing.git
cd warm-email-marketing
```

### Step 2: Create Environment File

```bash
copy .env.example .env
```

Open `.env` in a text editor. You'll update the tunnel token in the next steps.

### Step 3: Create Cloudflare Tunnel

1. Go to https://one.dash.cloudflare.com/
2. Navigate to **Networks → Tunnels**
3. Click **Create a tunnel**
4. Name it: `listmonk-email` (or your preference)
5. Click **Save tunnel**
6. **Copy the tunnel token** (long string starting with `eyJ...`)
7. **Copy the tunnel ID** (UUID format like `4cc009b4-d2bc-4332-9318-dadfddbc5fd7`)

### Step 4: Configure Public Hostname

Still in the Cloudflare tunnel setup:

1. Under **Public Hostnames**, click **Add a public hostname**
2. **Subdomain:** `email` (or your choice)
3. **Domain:** Select your domain from dropdown
4. **Service Type:** `HTTP`
5. **URL:** `localhost:9000`
6. Click **Save hostname**

Your URL will be `https://email.yourdomain.com`

### Step 5: Download Tunnel Credentials

1. In the tunnel details page, find the **credentials file** download link
2. Download the JSON file
3. Save it as `tunnel-credentials.json` in your project root directory

### Step 6: Update Configuration Files

**Update `.env` file:**
```env
CLOUDFLARE_TUNNEL_TOKEN=<paste your tunnel token here>
```

**Update `tunnel-config.yml`:**
```yaml
tunnel: <paste your tunnel ID here>
credentials-file: /etc/cloudflared/credentials.json
ingress:
  - hostname: email.yourdomain.com  # Replace with your actual domain
    service: http://host.docker.internal:9000
  - service: http_status:404
```

**Update `docker-compose.yml`:**

Find the `cloudflared` service section and verify it references your `tunnel-config.yml` file correctly.

### Step 7: Start Docker Containers

```bash
docker-compose up -d
```

This will:
- Pull required Docker images (first time only, ~5 minutes)
- Start PostgreSQL database
- Start Listmonk application
- Start Cloudflare tunnel

### Step 8: Verify Containers Are Running

```bash
docker ps
```

You should see three containers with "Up" status:
- `listmonk-db` (PostgreSQL)
- `listmonk-app` (Listmonk)
- `cloudflared-tunnel` (Cloudflare tunnel)

### Step 9: Check Logs for Any Errors

```bash
docker logs listmonk-app
docker logs cloudflared-tunnel
```

Look for:
- Listmonk: "Listmonk is now running..."
- Cloudflare: "Registered tunnel connection"

---

## Part 2: Create Admin Account (5 minutes)

### Step 1: Access Setup Wizard

Open your browser and go to:
```
https://email.yourdomain.com/admin
```

You should see the **Listmonk Setup Wizard** (NOT a login page).

**Troubleshooting:**
- If you see a login page instead, check docker logs: `docker logs listmonk-app`
- If you see connection error, verify tunnel status in Cloudflare dashboard
- If you see 502 error, wait 30 seconds and refresh (containers may still be starting)

### Step 2: Create Your Admin Account

Fill out the setup form:

- **Email:** Your email address (you'll use this to log in)
- **Username:** Your preferred username
- **Password:** Strong password (save this somewhere safe!)
- **Confirm Password:** Same password

Click **Continue** or **Setup**

### Step 3: Initial Login

You'll be automatically logged in after setup. You should now see the empty Listmonk dashboard.

---

## Part 3: Configure Email Sending with Resend (20 minutes)

### Step 1: Get Your Resend API Key

1. Log in to https://resend.com/
2. Go to **API Keys** in the left sidebar
3. Click **Create API Key**
4. Name it: `Listmonk SMTP`
5. Permissions: Select **Sending access**
6. Click **Add**
7. **Copy the API key** (starts with `re_` - you won't see it again!)

### Step 2: Configure SMTP in Listmonk

In your Listmonk dashboard:

1. Click **Settings** (gear icon) in left sidebar
2. Click **SMTP** tab
3. Click **Add new SMTP server**
4. Fill in the following:

**SMTP Configuration:**
```
Host: smtp.resend.com
Port: 465
Auth Protocol: LOGIN
Username: resend
Password: <paste your Resend API key>
HELO hostname: mail.yourdomain.com
Max connections: 10
Max message retries: 2
Idle timeout: 15s
Wait timeout: 5s
TLS: SSL/TLS
Skip TLS verification: NO (unchecked)
```

5. Click **Save**

### Step 3: Test SMTP Connection

Look for a **Test** button next to your SMTP server configuration. Click it.

You should see: **"SMTP connection test successful"**

**If test fails:**
- Double-check your Resend API key (no extra spaces)
- Try port 587 with STARTTLS instead
- Check `docker logs listmonk-app` for detailed error

---

## Part 4: Set Up Sending Domain with DNS Records (30 minutes)

### Step 1: Add Domain to Resend

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter: `mail.yourdomain.com`
4. Click **Add**

Resend will now show you the DNS records you need to add.

### Step 2: Add DNS Records in Cloudflare

Go to https://dash.cloudflare.com/ and select your domain.

Click **DNS** in the left sidebar.

**Add SPF Record:**
```
Type: TXT
Name: mail
Content: v=spf1 include:_spf.resend.com ~all
TTL: Auto
Proxy: DNS only (gray cloud)
```

**Add DKIM Record:**

Resend will provide this in format like:
```
Type: TXT
Name: resend._domainkey.mail
Content: <long string provided by Resend>
TTL: Auto
Proxy: DNS only (gray cloud)
```

**Add DMARC Record:**
```
Type: TXT
Name: _dmarc.mail
Content: v=DMARC1; p=none; rua=mailto:youremail@yourdomain.com
TTL: Auto
Proxy: DNS only (gray cloud)
```

Replace `youremail@yourdomain.com` with your actual email where you want DMARC reports sent.

### Step 3: Wait for DNS Propagation

DNS changes can take 5-30 minutes to propagate.

**Check propagation status:**

In Resend dashboard, the domain status will change from "Pending" to "Verified" once DNS records are detected.

You can also manually check:
```bash
nslookup -type=TXT mail.yourdomain.com
nslookup -type=TXT resend._domainkey.mail.yourdomain.com
```

---

## Part 5: Send Test Email (10 minutes)

### Step 1: Create Test Subscriber

In Listmonk:

1. Click **Subscribers** in sidebar
2. Click **Add subscriber**
3. Enter your own email address
4. Status: **Enabled**
5. Click **Save**

### Step 2: Create Test List

1. Click **Lists** in sidebar
2. Click **New list**
3. Name: `Test`
4. Type: **Public**
5. Click **Save**

### Step 3: Add Subscriber to List

1. Go back to **Subscribers**
2. Click on your test subscriber
3. Under **Lists**, check the box next to `Test`
4. Click **Save**

### Step 4: Create Test Campaign

1. Click **Campaigns** in sidebar
2. Click **New campaign**
3. Fill in:
   - **Name:** `Test Send`
   - **Subject:** `Test Email from Listmonk`
   - **From email:** `noreply@mail.yourdomain.com`
   - **Lists:** Select `Test`
4. In the email editor, write simple text:
   ```
   This is a test email to verify deliverability.

   If you're reading this, everything is working!
   ```
5. Click **Continue**
6. Review and click **Start campaign**

### Step 5: Verify Delivery

1. Check your inbox for the test email (should arrive within 1-2 minutes)
2. **Check spam folder** if not in inbox
3. Open the email and verify it displays correctly

**Check Email Headers:**

In Gmail: Open email → Click three dots → Show original

Look for:
- `SPF: PASS`
- `DKIM: PASS`
- `DMARC: PASS`

If email went to spam or headers show FAIL, double-check your DNS records in Cloudflare.

---

## Part 6: Import Contact Lists (20 minutes)

### Step 1: Prepare Your CSV Files

Your contact lists should be in CSV format with at minimum these columns:
- `email` (required)
- `name` (optional but recommended)

Example CSV:
```csv
email,name
john@example.com,John Doe
jane@example.com,Jane Smith
```

### Step 2: Create Your Lists

In Listmonk:

1. Click **Lists** in sidebar
2. Create two new lists:

**Warm List:**
- Name: `Warm Contacts`
- Type: **Public**
- Description: `Recent engaged contacts (~500-1,000)`

**Dormant List:**
- Name: `Dormant Contacts`
- Type: **Public**
- Description: `Contacts needing re-engagement (~10,000-20,000)`

### Step 3: Import Warm List

1. Go to **Subscribers**
2. Click **Import**
3. Choose your warm contacts CSV file
4. Map columns:
   - CSV `email` column → Listmonk `Email`
   - CSV `name` column → Listmonk `Name`
5. Choose **Lists to subscribe to:** Select `Warm Contacts`
6. **Mode:** Choose `Subscribe` (will mark as subscribed)
7. **Overwrite existing:** Check if you want to update existing contacts
8. Click **Upload**

Wait for import to complete. You'll see progress and final count.

### Step 4: Import Dormant List

Repeat the same process with your dormant contacts CSV:

1. **Subscribers → Import**
2. Choose dormant contacts CSV
3. Map columns
4. Select `Dormant Contacts` list
5. Upload

### Step 5: Verify Imports

1. Go to **Lists**
2. Check that each list shows correct subscriber count
3. Click into each list to spot-check a few contacts

---

## Part 7: Send Your First Real Campaign (Optional)

Once you've verified test delivery works, you can send your first real campaign:

### Step 1: Create Campaign

1. **Campaigns → New campaign**
2. Choose your list (start with Warm Contacts for first send)
3. Write your subject line
4. Compose your email
5. Set From email: `yourname@mail.yourdomain.com`

### Step 2: Review Settings

Double-check:
- Correct list selected
- Subject line is clear
- From email uses your verified domain
- Email content is ready

### Step 3: Send or Schedule

Choose:
- **Send Now** - Sends immediately
- **Schedule** - Pick date/time for future send

### Step 4: Monitor Progress

After sending:
1. Go to **Campaigns**
2. Watch the campaign status
3. View analytics (opens, clicks) after 24-48 hours

---

## Troubleshooting

### Docker Containers Not Starting

```bash
# Check Docker Desktop is running
docker --version

# View detailed logs
docker-compose logs

# Restart containers
docker-compose down
docker-compose up -d
```

### Cannot Access email.yourdomain.com

1. Verify tunnel is connected:
   ```bash
   docker logs cloudflared-tunnel
   ```
   Look for: "Registered tunnel connection"

2. Check Cloudflare tunnel status in dashboard (should show "Healthy")

3. Test DNS resolution:
   ```bash
   nslookup email.yourdomain.com
   ```

### Emails Going to Spam

Common causes:
- DNS records not fully propagated (wait longer)
- DKIM/SPF/DMARC not configured correctly (double-check in Cloudflare)
- New domain needs warming (send to engaged contacts first)
- Content triggers spam filters (avoid spam trigger words)

**Solutions:**
1. Verify all three DNS records show PASS in email headers
2. Start with small sends to your warm list
3. Avoid spam trigger words ("FREE", "Click here", excessive caps)
4. Include plain text version along with HTML

### Admin Password Reset

If you forget your password:

```bash
# Connect to database container
docker exec -it listmonk-db psql -U listmonk -d listmonk

# Reset password to 'newpassword'
UPDATE users SET password = crypt('newpassword', gen_salt('bf')) WHERE email = 'youremail@example.com';

# Exit
\q
```

Then log in with the new password and change it to something secure.

---

## Backup and Maintenance

### Regular Backups

**Database Backup:**
```bash
docker exec listmonk-db pg_dump -U listmonk listmonk > backup_$(date +%Y%m%d).sql
```

**Restore from Backup:**
```bash
docker exec -i listmonk-db psql -U listmonk listmonk < backup_20260109.sql
```

### Update Listmonk

To update to a newer version:

1. Edit `docker-compose.yml` and change Listmonk version
2. Restart containers:
   ```bash
   docker-compose down
   docker-compose pull
   docker-compose up -d
   ```

### Monitor Disk Space

Listmonk stores data in Docker volumes. Check space:

```bash
docker system df
```

Clean up old images if needed:
```bash
docker system prune
```

---

## Next Steps

Now that your system is running:

1. **Familiarize yourself** with Listmonk's interface
2. **Create email templates** for your common sends
3. **Set up automated sequences** (drip campaigns)
4. **Monitor engagement** and clean your lists regularly
5. **Scale gradually** - start with warm contacts, then expand

---

## Resources

- **Listmonk Documentation:** https://listmonk.app/docs
- **Resend Documentation:** https://resend.com/docs
- **Cloudflare Tunnel Docs:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **Email Deliverability Guide:** https://www.sparkpost.com/resources/email-deliverability/

---

## Support

For issues specific to this setup:
1. Check `docker logs` for the relevant container
2. Review Cloudflare tunnel status
3. Verify DNS records in Cloudflare
4. Check Resend domain verification status

For Listmonk-specific questions:
- GitHub Issues: https://github.com/knadh/listmonk/issues
- Listmonk Forum: https://github.com/knadh/listmonk/discussions

---

**Congratulations!** Your email marketing system is now ready to use. You have full control over your data, excellent deliverability through Resend, and a cost-effective solution that scales with your needs.
