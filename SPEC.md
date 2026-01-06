# Warm Email Marketing System - Project Specification
<!-- VERSION: 2026.01.06 -->

## Overview

Build a custom email marketing system that lets you communicate with your entire contact list without paying hundreds of dollars monthly to bloated platforms.

**Core Philosophy:** Tell it what to do → Click → Done.

---

## The Problem

- Need to regularly email contacts (nurture, value, stay top-of-mind)
- Hate GoHighLevel and similar platforms - too bloated, too expensive ($300-500/month)
- Don't want to manage deliverability yourself
- Don't want to pay for features you don't need
- Everything should be as close to "one click" as possible

---

## Your Contact Lists

### Warm List (~500-1,000 people)
- Recently engaged contacts
- Already opted in, know who you are
- Top of mind, active relationship

### Dormant List (~10,000-20,000+ people)
- Opted in at some point
- Know who you are (not cold contacts)
- Haven't heard from you in a while
- Need to be warmed back up with valuable content
- Goal: Re-engage and get them back to active

---

## What Success Looks Like

### Must Have
1. **Send broadcasts easily** - Pick who gets the email, hit send, done
2. **Automated sequences** - Set up drip campaigns that run on autopilot
3. **Emails actually land in inboxes** - Not spam folder
4. **Automatic list maintenance** - Engaged people emailed more, unengaged less (no manual work)
5. **Subdomain protection** - Protect main domain reputation
6. **No technical management** - It just works

### Nice to Have
- Some form of analytics (opens, clicks)
- Segmentation capabilities
- Ability to dig deeper when you want to

### Experience Goals
- Conversational: "Tell it what to do and it does it"
- Clean and minimal interface
- Option to dig deeper if desired, but not required

---

## Final Solution Stack

### Your Home PC (Alienware - already running 24/7)
- 128GB RAM, 4TB storage, RTX 3090
- Massively overpowered for this (Listmonk uses ~57MB RAM)
- No hosting costs - you already own it

### Docker Desktop (Free)
- Runs Listmonk in a container
- Nice visual interface to manage it
- Start/stop with clicks, view logs easily

### Cloudflare Tunnel (Free)
- Access your system from anywhere (phone, laptop, travel)
- No router configuration needed
- Automatic SSL certificates
- Nice URL like email.yourdomain.com

### Listmonk (Free - Open Source)
- Email marketing platform
- Handles lists, campaigns, analytics, templates
- Modern, clean interface
- Can handle millions of subscribers

### Resend (~$50-90/month)
- Actually sends your emails
- Excellent deliverability (lands in inboxes)
- Handles all the hard email delivery stuff

---

## How It All Connects

```
You (anywhere)
    ↓
Cloudflare (handles security, SSL, routing)
    ↓
Cloudflare Tunnel
    ↓
Your Home PC running Docker Desktop
    ↓
Listmonk (you write emails, manage lists)
    ↓
Resend (sends the actual emails)
    ↓
Your contacts' inboxes
```

---

## Monthly Cost Breakdown

| Item | Cost |
|------|------|
| Your PC | Already running |
| Docker Desktop | Free |
| Cloudflare Tunnel | Free |
| Listmonk | Free |
| Resend (for ~80K emails/month) | ~$50-90/month |
| **Total** | **~$50-90/month** |

**Savings vs GoHighLevel:** ~$200-400/month

---

## Features

### Phase 1: Foundation
1. Email system up and running on your PC
2. Import your existing contacts
3. Send your first broadcast
4. Access from anywhere via Cloudflare Tunnel

### Phase 2: Automation
1. Drip sequences (welcome series, re-engagement)
2. Automatic list hygiene (bounce handling, engagement scoring)
3. Scheduled sends

### Phase 3: Intelligence
1. Conversational commands
2. Smart segmentation
3. Engagement-based sending frequency
4. Performance insights

---

## What You'll Be Able to Do

### Broadcasts
- Write an email
- Pick who gets it (everyone, engaged only, specific segment)
- Hit send (or schedule for later)
- See who opened, clicked

### Automated Sequences
- Create a series of emails
- Set timing between each one
- Let it run automatically
- People entering your list get the sequence automatically

### List Management
- Import contacts from spreadsheets
- Automatic handling of bounces and unsubscribes
- Engagement tracking (who's active, who's gone cold)
- Automatic cleanup of bad addresses

### Re-Engagement
- Special sequences for dormant contacts
- Gradually warm them back up
- Automatically move engaged people to active list
- Respectfully remove truly unresponsive contacts

---

## Domains & Sending

### Subdomain Strategy
Your main domain (yourdomain.com) stays protected. Emails go out from subdomains like:
- mail.yourdomain.com (for marketing emails)
- updates.yourdomain.com (optional, for different types)

This protects your main domain reputation if anything goes wrong.

### Deliverability
- Proper authentication setup (so email providers trust you)
- Gradual warmup for new sending domains
- Best practices baked in automatically
- Resend handles the hard parts

---

## When Your PC is Off

Since this runs on your home PC:

| Scenario | What Happens |
|----------|--------------|
| **Sending broadcasts** | Works when you're at your PC (which is when you'd send anyway) |
| **Automated sequences** | Emails queue up, send when PC is back on |
| **Receiving replies** | Go to your inbox - works regardless of PC status |
| **Analytics** | Minor edge cases, usually not an issue |

**Bottom line:** For your use case, this is fine. You're not running 24/7 infrastructure - you're running a tool that works when you work.

---

## Timeline Goals

**Day 1-2:**
- Docker Desktop installed
- Listmonk running locally
- Basic configuration done

**Day 3-4:**
- Cloudflare Tunnel set up
- Access from anywhere working
- Resend connected

**Day 5-7:**
- Import your warm list
- Send first test email
- Verify deliverability

**Week 2+:**
- Full broadcast capability
- Start building automations
- Refinements based on feedback

---

## Your Input Needed

As we build, I'll need from you:
1. **Your domain(s)** - Which domain(s) to set up sending from
2. **Cloudflare account** - Free, I'll guide you through it
3. **Resend account** - I'll guide you through creating one
4. **Contact list exports** - Spreadsheets/CSVs of your contacts
5. **Feedback** - Try things and tell me what feels right or wrong

---

## Reference Links

- [Listmonk](https://listmonk.app/) - The open source platform we're using
- [Resend](https://resend.com/) - Email delivery service
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - Container management
- [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/) - Secure access from anywhere

---

## Questions?

This is your project. If anything here doesn't match what you want, just say so and we'll adjust. The goal is to build exactly what serves you, nothing more, nothing less.
