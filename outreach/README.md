# Backlink Outreach Automation System

Automated backlink outreach pipeline for **AgencyCyberInsurance.com**. Scans for
link-building prospects, drafts personalised emails from templates, manages an
approval queue, sends via Brevo SMTP, tracks follow-ups, drafts community
engagement content, and generates daily digest reports.

Designed for a single operator running the pipeline daily with human-in-the-loop
approval before any email leaves the system.

---

## Prerequisites

| Requirement | Details |
|---|---|
| **Python** | 3.10+ |
| **Brevo account** | Free tier: 300 emails/day ([brevo.com](https://brevo.com)) |
| **pip packages** | `requests`, `beautifulsoup4` |
| **OS** | Linux (uses `fcntl` for file locking) |

---

## Setup

### 1. Install dependencies

```bash
pip install requests beautifulsoup4
```

### 2. Configure Brevo

Edit `config.json` and replace the placeholder API key:

```json
{
  "brevo": {
    "api_key": "xkeysib-YOUR-REAL-KEY-HERE",
    "smtp_server": "smtp-relay.brevo.com",
    "smtp_port": 587,
    "sender_email": "hello@agencycyberinsurance.com",
    "sender_name": "AgencyCyberInsurance.com"
  }
}
```

> **Where to find your key:** Brevo dashboard → Settings → SMTP & API → SMTP Keys

### 3. Verify configuration

```bash
python scripts/email_sender.py validate
```

This checks SMTP connectivity without sending anything.

---

## Daily Workflow

The recommended daily workflow takes about 5 minutes of human time:

```
1. Run pipeline    ──→  2. Review digest  ──→  3. Approve emails  ──→  4. Send
```

### 1. Run the daily pipeline

```bash
python scripts/run_daily.py --full
```

This executes steps 1–5 automatically:
- Scans for new prospects
- Drafts personalised emails
- Queues due follow-ups
- Drafts community content (Mondays only; use `--community` to override)
- Generates the daily digest report

### 2. Review the digest

```bash
cat reports/digest_$(date -u +%Y-%m-%d).md
```

The digest shows pending approvals, due follow-ups, community drafts ready,
weekly performance metrics, and pipeline summary.

### 3. Review and approve pending emails

```bash
# List all pending emails
python scripts/queue_manager.py list

# Show full details of a specific email
python scripts/queue_manager.py show <id>

# Approve all pending emails
python scripts/queue_manager.py approve all

# Or approve individually
python scripts/queue_manager.py approve <id>

# Reject an email with reason
python scripts/queue_manager.py reject <id> --reason "Not relevant"
```

### 4. Send approved emails

```bash
python scripts/queue_manager.py send
```

### 5. Post community content (manual)

Review drafts in `data/community_drafts.json` and post manually to Reddit /
LinkedIn. The drafts are designed to be helpful first, promotional second.

---

## CLI Reference

### prospect_scanner.py

Scans the web for link-building opportunities.

```bash
# Run all scan types
python scripts/prospect_scanner.py

# Run specific scan type(s)
python scripts/prospect_scanner.py --type guest_post
python scripts/prospect_scanner.py --type resource_page broken_link
```

**Scan types:** `guest_post`, `resource_page`, `broken_link`, `haro`

---

### email_drafter.py

Drafts personalised emails for prospects with `status=new`.

```bash
# Draft emails (uses config batch_size)
python scripts/email_drafter.py

# Limit number of drafts
python scripts/email_drafter.py --limit 5

# Preview without saving
python scripts/email_drafter.py --dry-run
```

---

### queue_manager.py

Manage the email approval queue.

```bash
# List pending emails
python scripts/queue_manager.py list

# Show full email details
python scripts/queue_manager.py show <id>

# Approve one or all
python scripts/queue_manager.py approve <id>
python scripts/queue_manager.py approve all

# Reject with optional reason
python scripts/queue_manager.py reject <id>
python scripts/queue_manager.py reject <id> --reason "Duplicate"

# Send all approved emails
python scripts/queue_manager.py send

# Show queue statistics
python scripts/queue_manager.py stats

# Archive sent items
python scripts/queue_manager.py clear-sent
```

---

### email_sender.py

Sends emails via Brevo SMTP.

```bash
# Send all approved queue items
python scripts/email_sender.py send

# Send a test email to yourself
python scripts/email_sender.py test

# Mark an email as bounced
python scripts/email_sender.py bounce <email-address>

# Validate SMTP configuration
python scripts/email_sender.py validate
```

---

### followup_tracker.py

Manage follow-up sequences.

```bash
# Check for due follow-ups
python scripts/followup_tracker.py check

# Queue due follow-ups (generates emails and adds to queue)
python scripts/followup_tracker.py queue

# Mark a prospect as responded
python scripts/followup_tracker.py responded <email-address>

# Mark a prospect as cold (no more follow-ups)
python scripts/followup_tracker.py cold <email-address>

# List all active outreach sequences
python scripts/followup_tracker.py active
```

---

### community_drafter.py

Draft community engagement content for Reddit and LinkedIn.

```bash
# Draft both Reddit comments and LinkedIn posts (default: 5 total)
python scripts/community_drafter.py

# Reddit only
python scripts/community_drafter.py --reddit-only

# LinkedIn only
python scripts/community_drafter.py --linkedin-only

# Set max drafts
python scripts/community_drafter.py --limit 10

# Preview without saving
python scripts/community_drafter.py --dry-run
```

---

### digest_generator.py

Generate daily digest reports.

```bash
# Generate and save today's digest
python scripts/digest_generator.py

# Print to stdout instead of saving
python scripts/digest_generator.py --stdout

# Also email the digest
python scripts/digest_generator.py --email

# Generate for a specific date
python scripts/digest_generator.py --date 2026-04-15
```

---

### run_daily.py

Orchestrate the full daily pipeline.

```bash
# Full pipeline (steps 1-5)
python scripts/run_daily.py --full

# Just scan for prospects
python scripts/run_daily.py --scan-only

# Just generate digest
python scripts/run_daily.py --digest-only

# Full pipeline + send approved emails
python scripts/run_daily.py --full --send

# Include community drafts (regardless of day)
python scripts/run_daily.py --full --community

# Preview mode
python scripts/run_daily.py --full --dry-run

# Detailed output
python scripts/run_daily.py --full --verbose
```

---

## Configuration Options

All configuration lives in `config.json`:

```json
{
  "brevo": {
    "api_key": "YOUR_BREVO_API_KEY",     // Brevo SMTP API key
    "smtp_server": "smtp-relay.brevo.com", // SMTP server hostname
    "smtp_port": 587,                      // SMTP port (587 = STARTTLS)
    "sender_email": "hello@example.com",   // From address
    "sender_name": "Your Name"             // From display name
  },
  "site": {
    "name": "AgencyCyberInsurance.com",    // Site display name
    "url": "https://agencycyberinsurance.com", // Site URL for templates
    "niche": "cyber liability insurance..."    // Niche description
  },
  "outreach": {
    "daily_scan_limit": 20,    // Max prospects to scan per run
    "followup_days": [5, 12, 21], // Days after send to follow up
    "max_followups": 3,        // Maximum follow-up emails per prospect
    "cooldown_days_after_reject": 90, // Days before re-contacting rejected
    "batch_size": 10           // Default email drafting batch size
  },
  "approval": {
    "mode": "approve_all",     // Approval mode (approve_all | manual)
    "digest_format": "markdown" // Digest output format
  }
}
```

---

## Data Files

All data files live in `data/` and use JSON format with file-locking for
concurrency safety.

| File | Purpose |
|---|---|
| `data/prospects.json` | All discovered prospects with metadata, scores, and status |
| `data/queue.json` | Email approval queue (pending → approved → sent) |
| `data/sent_log.json` | Log of all sent emails with delivery status |
| `data/sent_archive.json` | Archived sent items (moved from sent_log) |
| `data/community_drafts.json` | Reddit/LinkedIn content drafts for manual posting |

### Prospect statuses
`new` → `drafted` → (in queue) → `contacted` → `responded` | `cold`

### Queue item statuses
`pending` → `approved` → `sent` | `failed` | `rejected`

### Sent log statuses
`sent` → `responded` | `bounced` | `cold`

---

## Architecture

```
                    ┌─────────────────────┐
                    │  prospect_scanner   │  ← Finds new link opportunities
                    └─────────┬───────────┘
                              │ prospects.json
                              ▼
                    ┌─────────────────────┐
                    │   email_drafter     │  ← Drafts personalised emails
                    └─────────┬───────────┘
                              │ queue.json
                              ▼
                    ┌─────────────────────┐
                    │   queue_manager     │  ← Human approval gate
                    └─────────┬───────────┘
                              │ approved items
                              ▼
                    ┌─────────────────────┐
                    │   email_sender      │  ← Sends via Brevo SMTP
                    └─────────┬───────────┘
                              │ sent_log.json
                              ▼
                    ┌─────────────────────┐
                    │  followup_tracker   │  ← Manages follow-up sequences
                    └─────────┬───────────┘
                              │ follow-up emails → queue.json
                              ▼
  ┌─────────────────────┐   ┌─────────────────────┐
  │ community_drafter   │   │  digest_generator   │  ← Reads all data files
  └─────────────────────┘   └─────────────────────┘
  community_drafts.json      reports/digest_*.md

                    ┌─────────────────────┐
                    │    run_daily.py     │  ← Orchestrates all of the above
                    └─────────────────────┘
```

### Data flow

1. **prospect_scanner** discovers opportunities → saves to `prospects.json`
2. **email_drafter** picks `status=new` prospects → drafts emails → adds to `queue.json`
3. **queue_manager** lets you review/approve/reject queue items
4. **email_sender** sends `status=approved` items → logs to `sent_log.json`
5. **followup_tracker** checks sent items → generates follow-ups → adds to `queue.json`
6. **community_drafter** scans Reddit/generates LinkedIn topics → saves to `community_drafts.json`
7. **digest_generator** reads all data files → produces `reports/digest_YYYY-MM-DD.md`
8. **run_daily.py** orchestrates steps 1–7 in sequence

---

## Reports

Daily digests are saved to `reports/digest_YYYY-MM-DD.md` and include:

- **Quick Stats** — pending, approved, sent, follow-ups due, community drafts
- **Action Required** — emails needing approval, follow-ups due, posts ready
- **Weekly Performance** — emails sent, response rate, bounce rate, new prospects
- **Pipeline Summary** — total prospects, active sequences, success rate

---

## Troubleshooting

### "SMTP authentication failed"

- Verify your Brevo API key in `config.json`
- Ensure the key is an **SMTP key** (not a REST API key)
- Run `python scripts/email_sender.py validate` to test connectivity

### "No new prospects found"

- Google may be rate-limiting searches. Wait 30 minutes and retry.
- Check your internet connection
- Try a specific scan type: `python scripts/prospect_scanner.py --type resource_page`

### "Reddit rate-limited"

- The scanner uses 2-second delays between requests
- Reddit allows ~60 requests/minute for unauthenticated access
- If blocked, the scanner logs a warning and continues with other subreddits
- Wait 10 minutes and retry

### "ModuleNotFoundError: No module named 'requests'"

```bash
pip install requests beautifulsoup4
```

### Queue is empty after drafting

- Check that `data/prospects.json` has items with `status=new`
- Run `python scripts/email_drafter.py --dry-run` to see what would be drafted
- Verify templates exist in `email-templates.md`

### Emails stuck in "pending" status

- Approve them: `python scripts/queue_manager.py approve all`
- Or review individually: `python scripts/queue_manager.py list`

### File locking errors

- Ensure no other process is writing to the same JSON file
- The system uses `fcntl.LOCK_EX` with atomic rename for safety
- If a `.tmp` file is left behind, delete it manually

### Follow-ups not being generated

- Check `config.json` → `outreach.followup_days` (default: [5, 12, 21])
- Verify sent items have `status=sent` in `data/sent_log.json`
- Run `python scripts/followup_tracker.py check` to see what's due

### Digest shows all zeros

- Normal for a fresh install — run the pipeline first
- Check that data files exist in `data/`

---

## Reference Documents

| File | Purpose |
|---|---|
| `email-templates.md` | 8 email templates with A/B subject lines and follow-ups |
| `guest-post-pitches.md` | 10 ready-to-pitch guest post topics with outlines |
| `journalist-profiles.md` | HARO/Featured/Qwoted platform profiles |
| `community-playbook.md` | Reddit, LinkedIn, Indie Hackers engagement strategies |
| `tracking.md` | 55+ pre-loaded targets with pipeline tracking |
| `linkable-assets.md` | Asset audit and 5 new asset recommendations |

---

## Campaign Targets

| Metric | Target |
|---|---|
| New backlinks/month | 5 |
| Response rate | 30% |
| Acceptance rate | 15% |
| Publication rate | 10% |
| Referring domains by Q4 | 30 |
| Domain Rating by Q4 | 30+ |

---

*Built for the AgencyCyberInsurance.com niche affiliate site project.*
