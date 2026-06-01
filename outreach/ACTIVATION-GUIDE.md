# Outreach System Activation Guide

> **Purpose:** Step-by-step checklist to launch the backlink outreach system
> **Estimated Setup Time:** 4 weeks from start to active outreach
> **Last Updated:** June 1, 2026

---

## Prerequisites (Do These First)

1. Sign up for Brevo free account (300 emails/day) at https://www.brevo.com
2. Configure SMTP credentials in `outreach/config.json`
3. Set up sender email (hello@agencycyberinsurance.com) with SPF/DKIM records
4. Create Reddit account and begin karma building (4 weeks minimum before any links)
5. Optimize LinkedIn profile for agency owner persona
6. Create Quora profile with cyber insurance expertise positioning
7. Sign up for HARO/Connectively, Qwoted, and Source of Sources

---

## Week 1: Foundation

- [ ] Configure Brevo API key in `outreach/config.json`
- [ ] Run `python scripts/email_sender.py validate` to verify SMTP setup
- [ ] Start Reddit karma building (5 helpful comments/day across r/digitalmarketing, r/cybersecurity, r/smallbusiness, r/MSP, r/sysadmin — NO links)
- [ ] Publish 2 LinkedIn posts (no links, pure value — use templates from `ready-to-post/linkedin-posts.md`)
- [ ] Answer 3 Quora questions (no links, pure value — use templates from `ready-to-post/quora-answers.md`)
- [ ] Set up HARO/Connectively alerts for: cyber insurance, agency risk, data breach, small business insurance
- [ ] Submit site to 3 general directories (BOTW, Jasmine Directory, AVIVA Directory)

---

## Week 2: Soft Launch

- [ ] Run `python scripts/prospect_scanner.py` to find first 20 link prospects
- [ ] Review and approve first batch of outreach emails in `outreach/data/queue.json`
- [ ] Continue Reddit engagement (still no links — building trust and karma)
- [ ] Publish 2 more LinkedIn posts (can reference data points, still no direct links)
- [ ] Answer 3 more Quora questions (establish expertise pattern)
- [ ] Respond to any relevant HARO queries (cite Price Index data)
- [ ] Submit Recommendation Engine to Product Hunt (schedule for Tuesday 12:01 AM PT)

---

## Week 3: Active Outreach

- [ ] Send first batch of approved outreach emails (10 max — use templates from `email-templates.md`)
- [ ] Send 5 Data Citation Pitches for the Price Index (Template 9)
- [ ] Send 5 Niche Resource Pitches for new articles (Template 10)
- [ ] Submit to 5 relevant resource pages and directories
- [ ] First Reddit post with natural link (only if karma > 500)
- [ ] LinkedIn post referencing Price Index data with link to full page
- [ ] Quora answer referencing site (only if profile is established with 5+ answers)
- [ ] Pitch first guest post (Topic 1 or Topic 6 from `guest-post-pitches.md`)

---

## Week 4: Scale & Systematize

- [ ] Run full daily pipeline: `python scripts/run_daily.py`
- [ ] Review digest reports in `outreach/reports/`
- [ ] Follow up on Week 3 outreach (use follow-up templates)
- [ ] Continue community engagement across all platforms (Reddit, LinkedIn, Quora)
- [ ] Pitch second guest post (different publication type than Week 3)
- [ ] Send 5 more Data Citation Pitches to new prospects
- [ ] Evaluate first results and adjust targeting

---

## Ongoing (Monthly Cadence)

- [ ] Run daily pipeline 5 days/week (`python scripts/run_daily.py`)
- [ ] Send 20–30 outreach emails per week (mix of templates)
- [ ] 2–3 guest post pitches per month (rotate topics from `guest-post-pitches.md`)
- [ ] 8–10 community posts/comments per week across Reddit, LinkedIn, Quora
- [ ] Respond to all relevant HARO/Connectively queries within 24 hours
- [ ] Monthly digest review and strategy adjustment
- [ ] Update Price Index data quarterly (Q1, Q2, Q3, Q4)
- [ ] Refresh `linkable-assets.md` ratings quarterly
- [ ] Track all links in `outreach/tracking.md`

---

## Key Metrics to Track

| Metric | Week 4 Target | Month 3 Target | Month 6 Target |
|--------|--------------|----------------|----------------|
| Outreach emails sent | 30 | 150 | 400 |
| Response rate | 10% | 15% | 15% |
| Links acquired | 3–5 | 25–40 | 60–90 |
| Guest posts published | 1 | 4–6 | 10–15 |
| HARO mentions | 1–2 | 5–8 | 12–18 |
| Reddit karma | 500+ | 2,000+ | 5,000+ |
| LinkedIn connections | 50+ | 200+ | 500+ |
| Quora answers | 10+ | 30+ | 60+ |
| Domain Rating (Ahrefs) | 5–10 | 15–25 | 25–35 |

---

## Troubleshooting

### Email deliverability issues

- Verify SPF/DKIM records with `dig TXT agencycyberinsurance.com`
- Check Brevo dashboard for bounce rates (keep under 5%)
- If emails land in spam, reduce daily volume and warm up sender reputation
- Test deliverability with https://www.mail-tester.com before scaling
- Ensure "From" name is a real person, not a brand name (e.g., "Alex from AgencyCyberInsurance" not "AgencyCyberInsurance Team")

### Low response rates (<5%)

- Review subject lines — test new A/B variants
- Personalize more aggressively — reference specific recent articles by the recipient
- Check if you're targeting the right contacts (editors vs. writers vs. webmasters)
- Try different templates — Data Citation Pitch (Template 9) often outperforms generic resource pitches
- Verify you're sending during optimal hours (Tuesday–Thursday, 9–11 AM recipient's time zone)
- Reduce batch size and increase personalization depth

### Reddit account issues

- If shadowbanned, create new account and restart karma building
- Never post more than 1 link per week per subreddit
- Maintain 10:1 ratio of helpful comments to link shares
- Check shadowban status at https://www.reddit.com/appeals or r/ShadowBan
- Focus on subreddits where you can provide genuine expertise, not just link targets

### No HARO responses getting picked up

- Respond within 2 hours of query publication (speed matters)
- Lead with credentials and data, not your site
- Keep responses under 300 words with 2–3 specific data points
- Include a headshot and one-line bio
- Use Price Index data as your differentiator — journalists want original data, not opinions
- Track which query categories get the best pickup rate and focus there

### Guest post pitches not converting

- Verify you're pitching to the right editor (check masthead, not generic contact)
- Include 2–3 published writing samples in your pitch
- Offer exclusive data from the Price Index that the publication can't get elsewhere
- Follow up exactly once after 7 days — then move on to the next target
- If a publication rejects, wait 30 days before pitching a different topic

---

## File Reference

| File | Purpose |
|------|---------|
| `outreach/config.json` | SMTP and API configuration |
| `outreach/email-templates.md` | 10 email templates with A/B variants |
| `outreach/guest-post-pitches.md` | 12 ready-to-pitch topics with full outlines |
| `outreach/community-playbook.md` | Reddit, LinkedIn, Quora strategies |
| `outreach/linkable-assets.md` | Asset analysis and pitch strategies |
| `outreach/tracking.md` | Link tracking and pipeline management |
| `outreach/journalist-profiles.md` | HARO/Connectively platform guides |
| `outreach/ACTIVATION-GUIDE.md` | This file — activation checklist |
| `outreach/ready-to-post/` | Pre-written content for all platforms |
| `outreach/scripts/` | Automation scripts for daily pipeline |
| `outreach/reports/` | Auto-generated digest reports |
| `outreach/data/` | Prospect and queue data files |

---

## Quick-Start Summary

```
Week 1: Set up tools, start community engagement (zero links)
Week 2: Find prospects, continue community building (zero links)
Week 3: First outreach emails, first guest post pitch (first links)
Week 4: Full pipeline active, follow-ups, second guest post pitch
Ongoing: 20-30 emails/week, 2-3 guest posts/month, daily community engagement
```

The most important thing is **consistency over intensity**. Sending 10 well-personalized emails per week will outperform 50 generic emails. Building genuine community presence over 4 weeks will earn more links than any cold outreach campaign.

**Start with the Price Index as your lead asset** — it's the strongest differentiator and the easiest pitch. Every email, guest post, and HARO response should reference the data.

---

*Review and update this guide monthly. As you learn which channels and templates perform best, adjust the weekly cadence to focus on what's working.*
