# Technical Decisions
<!-- VERSION: 2026.01.06 -->
<!-- This file is for developers. User does not need to read this. -->

## Architecture Overview

```
Internet
    │
    ▼
Cloudflare (CDN, SSL, DDoS protection)
    │
    ▼
Cloudflare Tunnel (cloudflared daemon)
    │
    ▼
Home PC (Windows - Alienware)
    │
    ├─► Docker Desktop
    │       │
    │       ├─► Listmonk container
    │       │       └─► PostgreSQL (bundled)
    │       │
    │       └─► Cloudflared container (or standalone)
    │
    └─► Resend API (outbound email delivery)
```

## Technology Choices

### Platform: Listmonk
- **Version:** v5.1.0 (latest stable)
- **Why chosen:**
  - Open source (AGPLv3) - no vendor lock-in
  - Single binary/container - simple deployment
  - Go backend - extremely performant, low resource usage
  - PostgreSQL backend - reliable, bundled in Docker setup
  - REST API for custom integrations
  - Handles millions of subscribers
  - Active development (Sept 2025 release)
- **Resource usage:** ~57MB RAM in production with millions of records

### Email Delivery: Resend
- **Why chosen:**
  - User familiarity
  - Excellent deliverability
  - Developer-friendly API
  - React Email integration available
  - Transparent pricing
  - Modern infrastructure
- **Connection:** SMTP from Listmonk to Resend
  - Host: smtp.resend.com
  - Port: 465 (SSL) or 587 (TLS)
  - Auth: API key as password

### Hosting: User's Home PC
- **Specs:** 128GB RAM, 4TB storage, RTX 3090, Windows
- **Why chosen:**
  - Already running 24/7
  - Massively overpowered for workload
  - $0 additional cost
  - User preference for utilizing existing hardware
- **Considerations:**
  - Requires Cloudflare Tunnel for remote access
  - Downtime if PC restarts (acceptable for use case)

### Container Runtime: Docker Desktop
- **Why chosen:**
  - Native Windows support with GUI
  - Visual container management
  - Easy log viewing
  - User-friendly for non-developers
- **Alternative considered:** WSL2 + Docker Engine (more complex)

### Remote Access: Cloudflare Tunnel
- **Why chosen:**
  - Free tier sufficient
  - No port forwarding required
  - No static IP required
  - Automatic SSL
  - DDoS protection included
  - Works through most ISP restrictions
- **Implementation:** cloudflared daemon (can run as Windows service or Docker container)

## Database: PostgreSQL
- **Version:** Latest stable (bundled with Listmonk Docker image)
- **Why:** Required by Listmonk, well-suited for this workload
- **Persistence:** Docker volume mounted to host filesystem

## Network Architecture

### Cloudflare Tunnel Setup
1. User creates free Cloudflare account
2. Add domain to Cloudflare (nameserver change)
3. Install cloudflared on Windows
4. Create tunnel via dashboard or CLI
5. Configure public hostname → localhost:9000 (Listmonk)

### DNS Configuration
- Domain managed via Cloudflare DNS
- Tunnel creates CNAME automatically
- No A record needed (tunnel handles routing)

### Email Sending Flow
```
Listmonk → Resend SMTP API → Resend Infrastructure → Recipient Inbox
```

User's home IP never touches email delivery - Resend handles all outbound.

## Subdomain Strategy

### Recommended Setup
```
Primary domain: [user's domain].com (protected, never used for bulk)
Marketing emails: mail.[domain].com
Transactional (if needed): tx.[domain].com
Listmonk access: email.[domain].com (via Cloudflare Tunnel)
```

### DNS Records for Email (via Resend)
- SPF record (Resend provides)
- DKIM record (Resend provides)
- DMARC record (recommended)

## Cost Analysis

### Monthly Costs
| Item | Cost |
|------|------|
| Home PC | $0 (already running) |
| Docker Desktop | $0 (free for personal) |
| Cloudflare | $0 (free tier) |
| Listmonk | $0 (open source) |
| PostgreSQL | $0 (bundled) |
| Resend | ~$50-90 |
| **Total** | **~$50-90/month** |

### Resend Pricing (as of Jan 2026)
- Free: 3,000 emails/month
- Pro ($20/mo): 50,000 emails
- Scale ($90/mo): 100,000 emails
- Dedicated IP: +$30/month (recommended at scale)

### Expected Usage
- ~20,000 contacts
- ~4 emails/month average
- = ~80,000 emails/month
- **Estimated Resend cost: $90/month**

## Security Considerations

- API keys stored in `.env` file (not committed to git)
- Cloudflare Tunnel encrypts all traffic (no exposed ports)
- PostgreSQL only accessible locally (not exposed)
- Listmonk admin protected by username/password
- Docker provides isolation layer
- Windows firewall unchanged (no port forwarding)

## Backup Strategy

### What to Back Up
1. PostgreSQL database (contains all contacts, campaigns, analytics)
2. Listmonk config.toml (settings)
3. Docker volumes

### Backup Methods
- Docker volume backup via `docker cp` or volume driver
- PostgreSQL dump via `pg_dump` inside container
- Consider automated backup to cloud storage (future enhancement)

## Development & Maintenance

### Updating Listmonk
```bash
docker pull listmonk/listmonk:latest
docker-compose down
docker-compose up -d
```

### Viewing Logs
- Docker Desktop GUI: Click container → Logs tab
- CLI: `docker logs listmonk`

### Restarting Services
- Docker Desktop GUI: Right-click container → Restart
- CLI: `docker-compose restart`

## Future Enhancements

### Potential Additions
1. AI-powered send time optimization
2. Conversational campaign creation CLI
3. Automatic A/B testing
4. Integration with user's other systems
5. Automated backup to cloud storage

### If Scale Requires Migration
- Export data from Listmonk (built-in export)
- Stand up on Hetzner VPS (~$6.50/month)
- Import data
- Update Cloudflare Tunnel to point to VPS
- Zero changes to email sending (still Resend)

## Changelog

### 2026.01.06 v2
- Changed hosting from VPS to user's home PC
- Added Docker Desktop as container runtime
- Added Cloudflare Tunnel for remote access
- Removed Dokploy (not needed for local hosting)
- Updated cost analysis to $50-90/month

### 2026.01.06 v1
- Initial technical specification
- Listmonk + Resend architecture
