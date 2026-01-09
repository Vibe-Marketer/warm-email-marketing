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

The existing `tunnel-config.yml` and `tunnel-credentials.json` are specific to the original installation and will NOT work for your setup.

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

[Rest of the detailed setup guide from SETUP.md content created earlier]
