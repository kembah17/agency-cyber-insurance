#!/usr/bin/env python3
"""community_drafter.py – Draft community engagement content for manual posting.

Scans Reddit for relevant threads and generates LinkedIn thought-leadership
posts.  All drafts are saved to data/community_drafts.json for human review
before posting.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import random
import re
import sys
import time
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = OUTREACH_DIR / "data"
DRAFTS_PATH = DATA_DIR / "community_drafts.json"
PLAYBOOK_PATH = OUTREACH_DIR / "community-playbook.md"

# ---------------------------------------------------------------------------
# Shared I/O helpers
# ---------------------------------------------------------------------------

def load_json(path: Path) -> list:
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


def save_json(path: Path, data: list) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        json.dump(data, f, indent=2, default=str)
        f.flush()
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
    tmp.rename(path)


def load_config() -> dict:
    config_path = OUTREACH_DIR / "config.json"
    with open(config_path) as f:
        return json.load(f)


def utcnow() -> str:
    return datetime.now(timezone.utc).isoformat()


# ---------------------------------------------------------------------------
# Playbook parser
# ---------------------------------------------------------------------------

TARGET_SUBREDDITS = [
    "cybersecurity",
    "smallbusiness",
    "insurance",
    "digitalmarketing",
    "msp",
]

SEARCH_QUERIES = [
    "cyber insurance",
    "agency data breach",
    "cybersecurity small business",
    "digital agency security",
]

REDDIT_UA = "AgencyCyberInsurance/1.0 (outreach research)"


def load_community_playbook() -> dict:
    """Parse outreach/community-playbook.md and return structured dict."""
    result: dict[str, Any] = {
        "subreddits": [],
        "linkedin_topics": [],
        "rules": [],
        "voice_guidelines": {},
    }

    if not PLAYBOOK_PATH.exists():
        print(f"WARNING: Playbook not found at {PLAYBOOK_PATH}")
        result["subreddits"] = TARGET_SUBREDDITS
        return result

    text = PLAYBOOK_PATH.read_text(encoding="utf-8")

    # --- Extract subreddits ---------------------------------------------------
    subreddit_pattern = re.compile(r"###\s+r/(\w+)", re.IGNORECASE)
    found_subs = subreddit_pattern.findall(text)
    result["subreddits"] = list(dict.fromkeys(found_subs)) or TARGET_SUBREDDITS

    # --- Extract LinkedIn topics from "## 2. LinkedIn Strategy" section --------
    linkedin_section = re.search(
        r"## 2\.\s*LinkedIn Strategy(.*?)(?=\n## \d|\Z)",
        text,
        re.DOTALL,
    )
    if linkedin_section:
        topics: list[str] = []
        for line in linkedin_section.group(1).splitlines():
            stripped = line.strip()
            if stripped.startswith(("- ", "* ", "1.", "2.", "3.")):
                clean = re.sub(r"^[-*\d.]+\s*", "", stripped).strip()
                if len(clean) > 15:
                    topics.append(clean)
        result["linkedin_topics"] = topics[:20]

    # --- Extract universal rules from "## 4. Universal Rules" -----------------
    rules_section = re.search(
        r"## 4\.\s*Universal Rules(.*?)(?=\n## \d|\Z)",
        text,
        re.DOTALL,
    )
    if rules_section:
        rules: list[str] = []
        for line in rules_section.group(1).splitlines():
            stripped = line.strip()
            # Parse bullet points
            if stripped.startswith(("- ", "* ")):
                clean = re.sub(r"^[-*]\s*", "", stripped).strip()
                if clean:
                    rules.append(clean)
            # Parse bold standalone lines
            elif stripped.startswith("**") and stripped.endswith("**"):
                clean = stripped.strip("*").strip()
                if clean:
                    rules.append(clean)
            # Parse markdown table rows (skip header and separator rows)
            elif stripped.startswith("|") and not stripped.startswith("|--"):
                cells = [c.strip() for c in stripped.split("|") if c.strip()]
                if len(cells) >= 2:
                    # Skip header rows
                    if cells[0] in ("❌ Don't", "Platform", "Tone"):
                        continue
                    rules.append(f"{cells[0]} → {cells[1]}")
        result["rules"] = rules

    # --- Extract voice guidelines from "### Voice Guidelines" -----------------
    voice_section = re.search(
        r"### Voice Guidelines by Platform(.*?)(?=\n## \d|\n### |\Z)",
        text,
        re.DOTALL,
    )
    if voice_section:
        current_platform = ""
        for line in voice_section.group(1).splitlines():
            stripped = line.strip()
            # Handle bold platform headers
            bold = re.match(r"\*\*(.+?)\*\*", stripped)
            if bold:
                current_platform = bold.group(1).lower().strip(":")
                result["voice_guidelines"][current_platform] = []
            elif current_platform and stripped.startswith(("- ", "* ")):
                clean = re.sub(r"^[-*]\s*", "", stripped).strip()
                if clean:
                    result["voice_guidelines"][current_platform].append(clean)
            # Handle markdown table rows
            elif stripped.startswith("|") and not stripped.startswith("|--"):
                cells = [c.strip() for c in stripped.split("|") if c.strip()]
                if len(cells) >= 4 and cells[0] not in ("Platform",):
                    platform_key = cells[0].lower().strip()
                    result["voice_guidelines"][platform_key] = [
                        f"Tone: {cells[1]}",
                        f"Formality: {cells[2]}",
                        f"Data Density: {cells[3]}",
                    ]
                    if len(cells) >= 5:
                        result["voice_guidelines"][platform_key].append(
                            f"Link Tolerance: {cells[4]}"
                        )


    return result


# ---------------------------------------------------------------------------
# Reddit scanner
# ---------------------------------------------------------------------------

def scan_reddit_threads() -> list[dict]:
    """Search Reddit for relevant threads using the public JSON API."""
    session = requests.Session()
    session.headers.update({"User-Agent": REDDIT_UA})

    threads: list[dict] = []
    seen_urls: set[str] = set()

    for subreddit in TARGET_SUBREDDITS:
        for query in SEARCH_QUERIES:
            url = (
                f"https://www.reddit.com/r/{subreddit}/search.json"
                f"?q={requests.utils.quote(query)}&sort=new&t=week&limit=5"
            )
            try:
                resp = session.get(url, timeout=15)
                if resp.status_code == 429:
                    print(f"  ⚠ Rate-limited on r/{subreddit}, sleeping 10s…")
                    time.sleep(10)
                    resp = session.get(url, timeout=15)
                if resp.status_code != 200:
                    print(f"  ⚠ r/{subreddit} search returned {resp.status_code}")
                    continue

                data = resp.json()
                children = data.get("data", {}).get("children", [])
                for child in children:
                    post = child.get("data", {})
                    permalink = f"https://www.reddit.com{post.get('permalink', '')}"
                    if permalink in seen_urls:
                        continue
                    seen_urls.add(permalink)
                    threads.append({
                        "subreddit": subreddit,
                        "title": post.get("title", ""),
                        "url": permalink,
                        "score": post.get("score", 0),
                        "num_comments": post.get("num_comments", 0),
                        "created_utc": post.get("created_utc", 0),
                        "query_matched": query,
                    })
            except requests.RequestException as exc:
                print(f"  ⚠ Error scanning r/{subreddit} for '{query}': {exc}")

            # Respect Reddit rate limits
            time.sleep(2)

    # Sort by score descending
    threads.sort(key=lambda t: t.get("score", 0), reverse=True)
    print(f"  Found {len(threads)} Reddit threads across {len(TARGET_SUBREDDITS)} subreddits")
    return threads


# ---------------------------------------------------------------------------
# LinkedIn topic generator
# ---------------------------------------------------------------------------

_LINKEDIN_EVERGREEN = [
    {
        "topic": "Why your agency needs cyber insurance in 2026",
        "angle": "Cost-benefit analysis with real claim data",
        "suggested_format": "numbered list post",
        "hashtags": ["#CyberInsurance", "#AgencyLife", "#RiskManagement", "#DigitalAgency"],
    },
    {
        "topic": "The hidden cost of a client data breach for agencies",
        "angle": "Walk through a real breach scenario with dollar amounts",
        "suggested_format": "story post with hook",
        "hashtags": ["#DataBreach", "#AgencyOwner", "#CyberSecurity", "#ClientTrust"],
    },
    {
        "topic": "MFA alone cut our insurance premium by 15%",
        "angle": "Practical security controls that save money",
        "suggested_format": "personal experience post",
        "hashtags": ["#MFA", "#CyberInsurance", "#SecurityControls", "#AgencyTips"],
    },
    {
        "topic": "5 security controls every digital agency should implement",
        "angle": "Actionable checklist with insurance implications",
        "suggested_format": "carousel / numbered list",
        "hashtags": ["#CyberSecurity", "#DigitalAgency", "#InfoSec", "#AgencyGrowth"],
    },
    {
        "topic": "What happens when your agency gets breached (real scenarios)",
        "angle": "Three anonymized case studies with outcomes",
        "suggested_format": "long-form story post",
        "hashtags": ["#DataBreach", "#CyberInsurance", "#AgencyOwner", "#LessonsLearned"],
    },
    {
        "topic": "Cyber insurance application tips for agency owners",
        "angle": "What underwriters actually look for",
        "suggested_format": "tips / how-to post",
        "hashtags": ["#CyberInsurance", "#Underwriting", "#AgencyTips", "#RiskManagement"],
    },
    {
        "topic": "Funds transfer fraud: the #1 cyber claim for agencies",
        "angle": "BEC/wire fraud statistics and prevention",
        "suggested_format": "stat-driven post with CTA",
        "hashtags": ["#BEC", "#WireFraud", "#CyberClaims", "#AgencySecurity"],
    },
    {
        "topic": "How to read your cyber insurance policy (without a lawyer)",
        "angle": "Plain-English guide to key policy sections",
        "suggested_format": "educational thread / document post",
        "hashtags": ["#CyberInsurance", "#PolicyReview", "#AgencyOwner", "#InsuranceTips"],
    },
    {
        "topic": "The true cost of cyber insurance for small agencies (2026 data)",
        "angle": "Premium ranges by agency size with benchmarks",
        "suggested_format": "data post with visual",
        "hashtags": ["#CyberInsurance", "#SmallBusiness", "#AgencyCosts", "#InsuranceData"],
    },
    {
        "topic": "Why your clients are starting to require cyber insurance from you",
        "angle": "Contractual requirements trend and how to prepare",
        "suggested_format": "trend analysis post",
        "hashtags": ["#CyberInsurance", "#ClientContracts", "#AgencyCompliance", "#B2B"],
    },
]


def scan_linkedin_topics() -> list[dict]:
    """Generate LinkedIn topic suggestions (no public API available)."""
    topics: list[dict] = []
    # Shuffle to vary daily output
    pool = list(_LINKEDIN_EVERGREEN)
    random.shuffle(pool)
    for item in pool:
        topics.append({
            "platform": "linkedin",
            "topic": item["topic"],
            "angle": item["angle"],
            "suggested_format": item["suggested_format"],
            "hashtags": item["hashtags"],
        })
    print(f"  Generated {len(topics)} LinkedIn topic suggestions")
    return topics


# ---------------------------------------------------------------------------
# Draft generators
# ---------------------------------------------------------------------------

_REDDIT_COMMENT_TEMPLATES = [
    # Template 0 – general helpful answer
    (
        "Agency owner here — went through this exact situation last year.\n\n"
        "{insight_paragraph}\n\n"
        "The key takeaway from our experience: {key_takeaway}\n\n"
        "{closing_line}"
    ),
    # Template 1 – data-driven response
    (
        "Good question. Here are some numbers that might help:\n\n"
        "{insight_paragraph}\n\n"
        "From what I've seen, {key_takeaway}\n\n"
        "{closing_line}"
    ),
    # Template 2 – personal experience
    (
        "We dealt with something similar at our agency. Here's what we learned:\n\n"
        "{insight_paragraph}\n\n"
        "Bottom line: {key_takeaway}\n\n"
        "{closing_line}"
    ),
]

_INSIGHT_PARAGRAPHS = [
    (
        "Cyber insurance for agencies typically runs $1,500–$4,000/year depending on "
        "revenue and number of client accounts you manage. The biggest factor in "
        "pricing is your security posture — MFA on everything, endpoint detection, "
        "and a documented incident response plan can cut premiums by 15–25%.\n\n"
        "What surprised me most: funds transfer fraud (business email compromise) "
        "accounts for 29–39% of all cyber claims. Way more common than ransomware "
        "for service businesses like agencies."
    ),
    (
        "After researching this extensively, here's what matters most for agencies:\n\n"
        "1. **First-party coverage** — pays for your own breach costs (forensics, "
        "notification, business interruption)\n"
        "2. **Third-party liability** — covers lawsuits from clients whose data you "
        "exposed\n"
        "3. **Social engineering / funds transfer** — covers BEC scams where someone "
        "tricks your team into wiring money\n\n"
        "Most agencies skip #3 and it's literally the most common claim type."
    ),
    (
        "The landscape has changed a lot in the past two years. Carriers now require "
        "MFA as a baseline — no MFA means automatic denial at most insurers. They "
        "also check for:\n\n"
        "- Endpoint detection and response (EDR)\n"
        "- Regular backups (tested, not just configured)\n"
        "- Employee security training\n"
        "- Privileged access management\n\n"
        "The good news: implementing these controls both protects you AND lowers "
        "your premium."
    ),
    (
        "Digital agencies have a unique risk profile because we handle client "
        "credentials, ad accounts, analytics access, and sometimes payment info. "
        "A single compromised password manager vault could expose dozens of client "
        "accounts simultaneously.\n\n"
        "We calculated our worst-case exposure at roughly $50K per client account "
        "compromise (notification costs + legal + lost business). With 20+ clients, "
        "that's $1M+ in potential liability — which is exactly why we carry cyber "
        "coverage."
    ),
]

_KEY_TAKEAWAYS = [
    "the security controls that protect your clients also determine whether you can even get insured — and at what price.",
    "bundling cyber liability with E&O (professional liability) saves 15–25% and covers the two biggest risks agencies face.",
    "most agencies are underinsured because they don't realize how much client data they actually handle.",
    "the ROI on cyber insurance is straightforward — $2,500/year vs. $50K+ for a single incident.",
    "start with the security controls first, then shop for insurance. You'll get better coverage at lower rates.",
]

_CLOSING_LINES_WITH_MENTION = [
    "I put together a detailed breakdown of costs and coverage options at agencycyberinsurance.com if you want to dig deeper.",
    "We documented our whole research process at agencycyberinsurance.com — might save you some time.",
    "Happy to answer more questions. I also wrote up a comprehensive guide at agencycyberinsurance.com covering the major carriers.",
]

_CLOSING_LINES_NO_MENTION = [
    "Happy to answer any follow-up questions — this is something I've spent way too much time researching.",
    "Let me know if you have specific questions about coverage types or carriers. Been through the whole evaluation process.",
    "Hope that helps. Feel free to DM if you want to compare notes on specific carriers.",
]


def draft_reddit_comment(thread: dict) -> dict:
    """Draft a helpful Reddit comment for a given thread."""
    template = random.choice(_REDDIT_COMMENT_TEMPLATES)
    insight = random.choice(_INSIGHT_PARAGRAPHS)
    takeaway = random.choice(_KEY_TAKEAWAYS)

    # ~30% chance of mentioning the site (to stay under spam thresholds)
    mention_site = random.random() < 0.30
    if mention_site:
        closing = random.choice(_CLOSING_LINES_WITH_MENTION)
    else:
        closing = random.choice(_CLOSING_LINES_NO_MENTION)

    draft_text = template.format(
        insight_paragraph=insight,
        key_takeaway=takeaway,
        closing_line=closing,
    )

    return {
        "platform": "reddit",
        "thread_url": thread.get("url", ""),
        "thread_title": thread.get("title", ""),
        "subreddit": thread.get("subreddit", ""),
        "draft_text": draft_text,
        "site_mention": mention_site,
    }


_LINKEDIN_HOOKS = [
    "Most agency owners don't think about this until it's too late:",
    "I spent 6 months researching this so you don't have to.",
    "Here's a number that should worry every agency owner:",
    "Unpopular opinion: your agency's biggest risk isn't losing clients.",
    "A question I get asked every week:",
    "This one change saved us 15% on our insurance premium:",
    "3 things I wish I knew before buying cyber insurance:",
    "Your clients are about to start requiring this from you:",
]

_LINKEDIN_CLOSINGS = [
    "What security controls has your agency implemented? I'd love to compare notes.",
    "Have you looked into cyber insurance for your agency? What's holding you back?",
    "Agree or disagree? Drop your take in the comments.",
    "What's the biggest security concern at your agency right now?",
    "If you found this useful, share it with an agency owner who needs to see it.",
    "What questions do you have about cyber insurance? I'll answer every one.",
]

_LINKEDIN_INSIGHTS = [
    [
        "Cyber insurance for digital agencies costs $1,500–$4,000/year.",
        "Funds transfer fraud (BEC) is 29–39% of all cyber claims — more common than ransomware.",
        "MFA implementation alone can reduce premiums by 15–25%.",
        "The average data breach costs $4.45M (IBM 2023) — even a fraction of that can sink a small agency.",
        "Most carriers now require MFA as a baseline for coverage.",
    ],
    [
        "A single compromised client account can cost $50K+ in liability.",
        "Enterprise clients increasingly require $1M+ cyber coverage in contracts.",
        "Bundling cyber + E&O saves 15–25% on premiums.",
        "Only 17% of small businesses have cyber insurance (CNBC 2023).",
        "The #1 reason agencies get denied coverage: no MFA.",
    ],
    [
        "Employee security training reduces phishing success rates by 75%.",
        "Agencies managing 20+ client accounts face $1M+ in aggregate exposure.",
        "Incident response plans are now required by most cyber insurers.",
        "The cyber insurance market grew 25% in 2024 — carriers are competing for good risks.",
        "SOC 2 compliance is becoming table stakes for agencies serving enterprise clients.",
    ],
]


def draft_linkedin_post(topic: dict) -> dict:
    """Draft a LinkedIn thought-leadership post for a given topic."""
    hook = random.choice(_LINKEDIN_HOOKS)
    insights = random.choice(_LINKEDIN_INSIGHTS)
    random.shuffle(insights)
    selected_insights = insights[:random.randint(3, 5)]
    closing = random.choice(_LINKEDIN_CLOSINGS)
    hashtags = topic.get("hashtags", ["#CyberInsurance", "#AgencyLife"])

    body_points = "\n".join(f"→ {point}" for point in selected_insights)

    draft_text = (
        f"{hook}\n\n"
        f"{topic['topic']}\n\n"
        f"Here's what the data shows:\n\n"
        f"{body_points}\n\n"
        f"At agencycyberinsurance.com, we've broken down the full landscape — "
        f"costs, carriers, coverage types, and the security controls that actually "
        f"move the needle on premiums.\n\n"
        f"{closing}\n\n"
        f"{' '.join(hashtags)}"
    )

    engagement_levels = ["low", "medium", "high"]
    weights = [0.2, 0.5, 0.3]
    estimated = random.choices(engagement_levels, weights=weights, k=1)[0]

    return {
        "platform": "linkedin",
        "topic": topic["topic"],
        "draft_text": draft_text,
        "hashtags": hashtags,
        "estimated_engagement": estimated,
    }


# ---------------------------------------------------------------------------
# Save drafts
# ---------------------------------------------------------------------------

def save_drafts(drafts: list[dict]) -> None:
    """Save community drafts to data/community_drafts.json."""
    existing = load_json(DRAFTS_PATH)

    for draft in drafts:
        entry = {
            "id": str(uuid.uuid4()),
            "created": utcnow(),
            "platform": draft.get("platform", "unknown"),
            "status": "draft",
            "thread_url": draft.get("thread_url"),
            "thread_title": draft.get("thread_title"),
            "subreddit": draft.get("subreddit"),
            "topic": draft.get("topic", ""),
            "draft_text": draft.get("draft_text", ""),
            "hashtags": draft.get("hashtags", []),
            "site_mention": draft.get("site_mention", False),
            "posted_at": None,
        }
        existing.append(entry)

    save_json(DRAFTS_PATH, existing)
    print(f"  Saved {len(drafts)} drafts to {DRAFTS_PATH}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Draft community engagement content for Reddit and LinkedIn.",
    )
    parser.add_argument(
        "--reddit-only", action="store_true",
        help="Only scan Reddit and draft comments",
    )
    parser.add_argument(
        "--linkedin-only", action="store_true",
        help="Only draft LinkedIn posts",
    )
    parser.add_argument(
        "--limit", type=int, default=5,
        help="Maximum number of drafts to create (default: 5)",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Show what would be drafted without saving",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("Community Content Drafter")
    print("=" * 60)

    # Load playbook for context
    print("\n📖 Loading community playbook…")
    playbook = load_community_playbook()
    print(f"  Subreddits: {', '.join(playbook['subreddits'])}")
    print(f"  Rules loaded: {len(playbook['rules'])}")

    drafts: list[dict] = []

    # --- Reddit ---
    if not args.linkedin_only:
        print("\n🔍 Scanning Reddit for relevant threads…")
        threads = scan_reddit_threads()
        if threads:
            reddit_limit = args.limit if args.reddit_only else max(1, args.limit // 2)
            for thread in threads[:reddit_limit]:
                print(f"  📝 Drafting comment for: r/{thread['subreddit']} — {thread['title'][:60]}…")
                draft = draft_reddit_comment(thread)
                drafts.append(draft)
        else:
            print("  No threads found (Reddit may be rate-limiting).")

    # --- LinkedIn ---
    if not args.reddit_only:
        print("\n💼 Generating LinkedIn post topics…")
        topics = scan_linkedin_topics()
        if topics:
            linkedin_limit = args.limit if args.linkedin_only else max(1, args.limit - len(drafts))
            for topic in topics[:linkedin_limit]:
                print(f"  📝 Drafting LinkedIn post: {topic['topic'][:60]}…")
                draft = draft_linkedin_post(topic)
                drafts.append(draft)

    # --- Summary ---
    print(f"\n{'=' * 60}")
    print(f"Drafts created: {len(drafts)}")
    reddit_count = sum(1 for d in drafts if d.get("platform") == "reddit")
    linkedin_count = sum(1 for d in drafts if d.get("platform") == "linkedin")
    print(f"  Reddit comments: {reddit_count}")
    print(f"  LinkedIn posts:  {linkedin_count}")

    if args.dry_run:
        print("\n🏃 DRY RUN — not saving. Preview:")
        for i, draft in enumerate(drafts, 1):
            platform = draft.get("platform", "?")
            label = draft.get("thread_title") or draft.get("topic", "")
            print(f"\n--- Draft {i} [{platform}] ---")
            print(f"Topic: {label[:80]}")
            print(draft.get("draft_text", "")[:300] + "…")
    else:
        if drafts:
            save_drafts(drafts)
        else:
            print("  No drafts to save.")

    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
