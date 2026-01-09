# Warm Email Marketing System

A custom email marketing system using Listmonk (open source) + Resend (deliverability) that lets you send broadcasts and automated sequences while maintaining inbox delivery.

## What This Is

Self-hosted email marketing platform running on Docker that gives you:
- One-click broadcast sending
- Automated drip sequences
- Inbox delivery (not spam)
- Automatic list health management
- Your own data and complete control

**Cost:** ~$50-90/month (just Resend - everything else is free)

---

## ⚠️ IMPORTANT: Configuration Required

**Before running `docker-compose up`, you MUST update these files with YOUR values:**

- [ ] `.env` - Replace `REPLACE_WITH_YOUR_TUNNEL_TOKEN`
- [ ] `tunnel-config.yml` - Replace `REPLACE_WITH_YOUR_TUNNEL_ID` and `REPLACE_WITH_YOUR_DOMAIN_COM`
- [ ] `tunnel-credentials.json` - Download from Cloudflare (see step 5 below)

**The system will FAIL to start if you skip these steps.**

---

## Quick Start (New Setup)

### Prerequisites
- Windows PC with Docker Desktop installed
- Cloudflare account (free tier works)
- Resend account (free tier to start)
- Domain managed in Cloudflare

### Initial Setup

1. **Clone this repository**
   ```bash
   git clone <your-repo-url>
   cd warm-email-marketing
   ```

2. **Copy environment template**
   ```bash
   copy .env.example .env
   ```

3. **Create Cloudflare Tunnel**
   - Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
   - Navigate to Networks → Tunnels
   - Click "Create a tunnel"
   - Name it (e.g., "listmonk-email")
   - Save the tunnel token
   - Add public hostname: `email.yourdomain.com` → `http://localhost:9000`

4. **Update Configuration Files**

   **In `.env` file:**
   ```env
   CLOUDFLARE_TUNNEL_TOKEN=your_tunnel_token_here
   ```

   **In `tunnel-config.yml`:**
   ```yaml
   tunnel: your_tunnel_id_here
   credentials-file: /etc/cloudflared/credentials.json
   ingress:
     - hostname: email.yourdomain.com
       service: http://host.docker.internal:9000
     - service: http_status:404
   ```

5. **Download Tunnel Credentials**
   - In Cloudflare tunnel dashboard, download the credentials JSON file
   - Save it as `tunnel-credentials.json` in project root

6. **Update docker-compose.yml**
   - Replace `email.callvaultai.com` with your actual domain in the Cloudflare tunnel section

7. **Start the System**
   ```bash
   docker-compose up -d
   ```

8. **Wait for Containers to Start**
   ```bash
   docker ps
   ```
   All three containers should show "Up" status:
   - `listmonk-db`
   - `listmonk-app`
   - `cloudflared-tunnel`

9. **Access Setup Wizard**
   - Open `https://email.yourdomain.com/admin`
   - Create your admin account (username, email, password)

10. **Configure Email Sending** (See SETUP.md for detailed steps)
    - Add Resend SMTP configuration
    - Set up sending domain with SPF/DKIM/DMARC
    - Test email delivery

## Project Structure

```
warm-email-marketing/
├── .env                    # Environment variables (KEEP SECRET)
├── .env.example            # Template for new setups
├── docker-compose.yml      # Docker configuration
├── tunnel-config.yml       # Cloudflare tunnel routing
├── tunnel-credentials.json # Cloudflare tunnel auth (KEEP SECRET)
├── CLAUDE.md              # AI agent instructions
├── SPEC.md                # Project specification
├── HANDOVER.md            # Setup continuation guide
├── SETUP.md               # Detailed setup instructions
├── directives/            # Workflow documentation
├── execution/             # Python scripts for automation
└── README.md              # This file
```

## Important Files

- **`.env`** - Contains secrets (tunnel token). Never commit this file.
- **`tunnel-credentials.json`** - Cloudflare tunnel authentication. Never commit this file.
- **`docker-compose.yml`** - Main configuration for all services
- **`SETUP.md`** - Step-by-step setup guide for email configuration

## Access Your System

Once running:
- **Admin Panel:** `https://email.yourdomain.com/admin`
- **Public Pages:** `https://email.yourdomain.com` (for unsubscribe/preferences)

## Common Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker logs listmonk-app
docker logs cloudflared-tunnel

# Restart a specific service
docker-compose restart listmonk

# Check status
docker ps
```

## System Requirements

- **OS:** Windows 10/11 with WSL2
- **RAM:** 4GB minimum (system uses ~500MB)
- **Storage:** 10GB minimum for data
- **Docker Desktop:** Latest version
- **Network:** Stable internet connection

## Troubleshooting

### Containers won't start
```bash
# Check Docker is running
docker --version

# Check logs for errors
docker-compose logs

# Restart everything
docker-compose down
docker-compose up -d
```

### Can't access email.yourdomain.com
1. Check all containers are running: `docker ps`
2. Check tunnel logs: `docker logs cloudflared-tunnel`
3. Verify DNS: `nslookup email.yourdomain.com`
4. Check Cloudflare tunnel status in dashboard

### Admin login not working
- First time setup: Should see setup wizard, not login form
- After setup: Use credentials created in wizard
- If stuck: Check `docker logs listmonk-app` for errors

### Emails not sending
1. Verify SMTP configuration in Listmonk settings
2. Check Resend API key is correct
3. Verify domain is verified in Resend
4. Check DNS records (SPF, DKIM, DMARC)

## Tech Stack

- **Listmonk** - Email marketing platform (open source)
- **PostgreSQL** - Database (open source)
- **Cloudflare Tunnel** - Secure remote access (free)
- **Resend** - Email delivery API (~$50-90/month)
- **Docker** - Container runtime (free)

## Cost Breakdown

| Service | Monthly Cost |
|---------|--------------|
| Your PC | Already running |
| Docker Desktop | Free |
| Cloudflare Tunnel | Free |
| Listmonk (self-hosted) | Free |
| PostgreSQL (self-hosted) | Free |
| Resend (email delivery) | ~$50-90 |
| **Total** | **~$50-90** |

Compare to: GoHighLevel ($300-500/month)

## Security Notes

- **Never commit `.env` or `tunnel-credentials.json`** to git
- Keep your Resend API key secure
- Use strong admin password
- Regular backups recommended (see SETUP.md)

## Support & Documentation

- **Setup Guide:** [SETUP.md](SETUP.md)
- **Project Spec:** [SPEC.md](SPEC.md)
- **Handover Doc:** [HANDOVER.md](HANDOVER.md) (for continuing interrupted setup)
- **Listmonk Docs:** https://listmonk.app/docs
- **Resend Docs:** https://resend.com/docs

## License

This project configuration is open source. Individual components have their own licenses:
- Listmonk: AGPL-3.0
- PostgreSQL: PostgreSQL License
- Your data and content: You own it

## Contributing

This is a personal project template. Feel free to fork and adapt for your own use.
