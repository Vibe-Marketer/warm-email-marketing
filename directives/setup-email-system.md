# Setup Email System
<!-- DOE-VERSION: 2026.01.06 -->

## Goal
Get Listmonk email marketing running on your Alienware PC with remote access via Cloudflare Tunnel.

## Trigger Phrases
- "Set up the email system"
- "Install listmonk"
- "Start the email marketing setup"

## Prerequisites
- Docker Desktop installed on Alienware (you have this)
- Cloudflare account with callvaultai.com (you have this)
- Resend account (you have this)

---

## Step 1: Create Cloudflare Tunnel (2 minutes)

1. Go to: https://one.dash.cloudflare.com/
2. Click **Networks** → **Tunnels** in the left sidebar
3. Click **Create a tunnel**
4. Choose **Cloudflared** → Click **Next**
5. Name it: `listmonk-email`
6. Click **Save tunnel**
7. **COPY THE TUNNEL TOKEN** (starts with `eyJ...`) - you'll need this!
8. Click **Next**
9. Add a public hostname:
   - Subdomain: `email`
   - Domain: `callvaultai.com`
   - Service Type: `HTTP`
   - URL: `listmonk:9000`
10. Click **Save tunnel**

**Result:** You now have `email.callvaultai.com` ready to connect to your PC.

---

## Step 2: Update .env with Tunnel Token

Add your tunnel token to the .env file:

```
CLOUDFLARE_TUNNEL_TOKEN=eyJ...your_token_here...
```

---

## Step 3: Start Listmonk on Your PC

On your Alienware PC, open a terminal/PowerShell in this project folder and run:

```bash
docker-compose up -d
```

**What this does:**
- Starts the database
- Starts Listmonk (your email dashboard)
- Starts the Cloudflare tunnel (remote access)

---

## Step 4: Access Your Dashboard

1. Wait ~30 seconds for everything to start
2. Go to: https://email.callvaultai.com
3. Login with:
   - Username: `admin`
   - Password: `EmailAdmin2026!`

**If it doesn't work:**
- Make sure Docker Desktop is running
- Check Docker Desktop logs for errors
- Try `docker-compose logs` in terminal

---

## Step 5: Configure Email Sending (Resend)

1. In Listmonk, go to **Settings** → **SMTP**
2. Add a new SMTP server:
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Auth protocol:** `LOGIN`
   - **Username:** `resend`
   - **Password:** Your Resend API key
   - **TLS:** `SSL/TLS`
3. Click **Save**
4. Click **Test** to verify it works

---

## Step 6: Add Your Domain to Resend

1. Go to: https://resend.com/domains
2. Click **Add Domain**
3. Add: `mail.callvaultai.com` (for sending emails)
4. Add the DNS records they give you to Cloudflare
5. Wait for verification (usually 5-10 minutes)

---

## You're Done!

Your email marketing system is now running. You can:
- Access it from anywhere at `email.callvaultai.com`
- Import your contacts
- Create and send campaigns
- Set up automated sequences

## Useful Commands

```bash
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart
docker-compose restart
```

## Output
- Dashboard URL: https://email.callvaultai.com
- Admin login: admin / EmailAdmin2026!
- Email sending via: Resend SMTP
