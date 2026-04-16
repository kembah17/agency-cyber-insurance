#!/usr/bin/env python3
"""email_drafter.py — Draft personalised outreach emails from templates.

Reads prospect records from data/prospects.json, selects the best email
template from outreach/email-templates.md, personalises placeholders, and
queues the drafts in data/queue.json for human approval before sending.

Usage:
    python email_drafter.py                # draft up to config batch_size
    python email_drafter.py --limit 5      # draft up to 5 emails
    python email_drafter.py --dry-run      # preview without saving
"""
from __future__ import annotations

import argparse
import fcntl
import json
import re
import sys
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR: Path = Path(__file__).resolve().parent.parent
DATA_DIR: Path = OUTREACH_DIR / "data"
PROSPECTS_PATH: Path = DATA_DIR / "prospects.json"
QUEUE_PATH: Path = DATA_DIR / "queue.json"
TEMPLATES_PATH: Path = OUTREACH_DIR / "email-templates.md"
CONFIG_PATH: Path = OUTREACH_DIR / "config.json"

# ---------------------------------------------------------------------------
# Template section mapping
# ---------------------------------------------------------------------------
# Maps the numbered heading in email-templates.md to an internal key.
# The heading text is matched case-insensitively.
SECTION_KEY_MAP: dict[str, str] = {
    "1": "guest_post_agency",
    "2": "guest_post_cybersecurity",
    "3": "guest_post_insurance",
    "4": "resource_page",
    "5": "directory_listing",
    "6": "broken_link",
    "7": "expert_quote",
    "8": "community_intro",
}

# Keywords used to pick the right guest-post sub-template
GUEST_POST_KEYWORDS: dict[str, list[str]] = {
    "guest_post_cybersecurity": [
        "security", "cybersecurity", "infosec", "cyber defense",
        "dark reading", "sc magazine", "heimdal", "securityboulevard",
        "infosecurity", "ciso", "sysadmin", "hacker",
    ],
    "guest_post_insurance": [
        "insurance", "risk", "underwriting", "carrier", "broker",
        "propertycasualty", "compliance", "actuary", "claims",
        "insurancejournal", "businessinsurance",
    ],
    # Fallback — agency / marketing / general
    "guest_post_agency": [
        "agency", "marketing", "seo", "ppc", "hubspot", "moz",
        "wordstream", "content", "social media", "digital",
        "clutch", "designrush", "spp",
    ],
}


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def load_config() -> dict:
    """Load outreach/config.json and return as dict."""
    with open(CONFIG_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Template parser
# ---------------------------------------------------------------------------
def load_templates() -> dict[str, dict[str, Any]]:
    """Parse outreach/email-templates.md into a structured dict.

    Returns a dict keyed by template slug (e.g. ``guest_post_agency``)
    with values::

        {
            'subjects':         ['Subject A', 'Subject B'],
            'body':             'Hi [EDITOR FIRST NAME], ...',
            'followup_subject': 'Re: [Original Subject Line]',
            'followup_body':    'Hi [EDITOR FIRST NAME], ...',
        }

    Parsing strategy:
    1. Split the file on ``## <number>.`` headings.
    2. Within each section extract:
       - Subject lines after **A:** and **B …:** markers.
       - Code blocks (between ``` fences) — first is the main body,
         second (if present) is the follow-up body.
       - Follow-up subject from the line after "Follow-up Email".
    """
    if not TEMPLATES_PATH.exists():
        print(f"[ERROR] Templates file not found: {TEMPLATES_PATH}")
        return {}

    raw = TEMPLATES_PATH.read_text(encoding="utf-8")
    templates: dict[str, dict[str, Any]] = {}

    # Split on ## <digit>. headings  (e.g. "## 1. Guest Post Pitch — Agency Blog")
    section_pattern = re.compile(r"^## (\d+)\.", re.MULTILINE)
    splits = list(section_pattern.finditer(raw))

    for idx, match in enumerate(splits):
        section_num = match.group(1)
        key = SECTION_KEY_MAP.get(section_num)
        if key is None:
            continue

        # Slice the section text
        start = match.end()
        end = splits[idx + 1].start() if idx + 1 < len(splits) else len(raw)
        section_text = raw[start:end]

        # --- Extract subject lines ---
        subjects: list[str] = []
        # Pattern: **A:** <text>  or  **B (A/B variant):** <text>  or  **A (A/B variant):** <text>
        subj_pattern = re.compile(
            r"\*\*[AB](?:\s*\([^)]*\))?:\*\*\s*(.+)", re.IGNORECASE
        )
        for subj_match in subj_pattern.finditer(section_text):
            subj = subj_match.group(1).strip()
            if subj:
                subjects.append(subj)

        # --- Extract code blocks ---
        code_blocks: list[str] = []
        code_pattern = re.compile(r"```\s*\n(.*?)```", re.DOTALL)
        for cb_match in code_pattern.finditer(section_text):
            block = cb_match.group(1).strip()
            if block:
                code_blocks.append(block)

        body = code_blocks[0] if len(code_blocks) >= 1 else ""
        followup_body = code_blocks[1] if len(code_blocks) >= 2 else ""

        # --- Extract follow-up subject ---
        followup_subject = ""
        fu_subj_pattern = re.compile(
            r"follow[- ]?up email.*?\n.*?\*\*subject:\*\*\s*(.+)",
            re.IGNORECASE,
        )
        fu_match = fu_subj_pattern.search(section_text)
        if fu_match:
            followup_subject = fu_match.group(1).strip()
        elif followup_body:
            # Default follow-up subject
            followup_subject = "Re: [Original Subject Line]"

        templates[key] = {
            "subjects": subjects,
            "body": body,
            "followup_subject": followup_subject,
            "followup_body": followup_body,
        }

    print(f"[TEMPLATES] Loaded {len(templates)} templates: {', '.join(templates.keys())}")
    return templates


# ---------------------------------------------------------------------------
# Template selection
# ---------------------------------------------------------------------------
def select_template(prospect: dict, templates: dict[str, dict]) -> str:
    """Choose the best template key for a given prospect.

    Mapping logic:
    - guest_post  → pick from guest_post_agency / _cybersecurity / _insurance
                     based on keyword matching against prospect site & site_name
    - resource_page → resource_page
    - broken_link   → broken_link
    - haro          → expert_quote
    - directory     → directory_listing
    - community     → community_intro
    """
    ptype = prospect.get("type", "").lower()

    # Direct mappings
    direct_map: dict[str, str] = {
        "resource_page": "resource_page",
        "broken_link": "broken_link",
        "haro": "expert_quote",
        "directory": "directory_listing",
        "community": "community_intro",
    }

    if ptype in direct_map:
        key = direct_map[ptype]
        return key if key in templates else next(iter(templates), "guest_post_agency")

    # Guest-post: score each sub-template by keyword hits
    if ptype == "guest_post":
        text_blob = " ".join(
            [
                prospect.get("site", ""),
                prospect.get("site_name", ""),
                prospect.get("notes", ""),
                prospect.get("name", ""),
            ]
        ).lower()

        best_key = "guest_post_agency"
        best_score = 0

        for tpl_key, keywords in GUEST_POST_KEYWORDS.items():
            score = sum(1 for kw in keywords if kw in text_blob)
            if score > best_score:
                best_score = score
                best_key = tpl_key

        return best_key if best_key in templates else "guest_post_agency"

    # Fallback
    return "guest_post_agency"


# ---------------------------------------------------------------------------
# Personalisation
# ---------------------------------------------------------------------------
def personalize(
    template_body: str,
    template_subject: str,
    prospect: dict,
    config: dict,
) -> tuple[str, str]:
    """Replace template placeholders with prospect and config values.

    Supported placeholders:
        [EDITOR FIRST NAME]   → prospect name first word or 'there'
        [PUBLICATION NAME]    → prospect site_name
        [DIRECTORY NAME]      → prospect site_name
        [NAME]                → prospect name or 'there'
        [YOUR NAME]           → config site.sender_name or default
        [YOUR TITLE]          → 'Founder'
        [YOUR AGENCY NAME]    → config site.name
        [BROKEN URL]          → prospect broken_url (from notes)
        [DEAD URL]            → prospect broken_url (from notes)
        [THEIR ARTICLE TITLE] → prospect article_title or default
        [ARTICLE TITLE]       → prospect article_title or default
        [ARTICLE URL]         → prospect site
        [RESOURCE PAGE URL]   → prospect resource_url (from notes)
        [PAGE TITLE]          → prospect site_name
        [PAGE URL]            → prospect site
        [THEIR SITE NAME]     → prospect site_name
        [TOPIC]               → 'cyber insurance'
        [EMAIL]               → config brevo.sender_email
        [PHONE]               → ''

    Returns (personalised_subject, personalised_body).
    """
    # Derive first name
    raw_name = (prospect.get("name") or "").strip()
    first_name = raw_name.split()[0] if raw_name and raw_name != "Unknown" else "there"
    full_name = raw_name if raw_name and raw_name != "Unknown" else "there"

    site_name = prospect.get("site_name", "") or prospect.get("site", "")
    site_url = prospect.get("site", "")

    # Extract broken_url and resource_url from notes if embedded
    notes = prospect.get("notes", "")
    broken_url = prospect.get("broken_url", "")
    if not broken_url:
        bu_match = re.search(r"Broken link found:\s*(\S+)", notes)
        if bu_match:
            broken_url = bu_match.group(1)

    resource_url = prospect.get("resource_url", "")
    if not resource_url:
        ru_match = re.search(r"resource_url=(\S+)", notes)
        if ru_match:
            resource_url = ru_match.group(1)

    article_title = prospect.get("article_title", "your recent article")

    sender_name = (
        config.get("site", {}).get("sender_name")
        or config.get("brevo", {}).get("sender_name")
        or "The AgencyCyberInsurance Team"
    )
    agency_name = config.get("site", {}).get("name", "AgencyCyberInsurance.com")
    sender_email = config.get("brevo", {}).get("sender_email", "")

    # Build replacement map (case-insensitive matching via regex)
    replacements: dict[str, str] = {
        "[EDITOR FIRST NAME]": first_name,
        "[JOURNALIST FIRST NAME]": first_name,
        "[NAME]": full_name,
        "[NAME OR \"TEAM\"]": full_name if full_name != "there" else "Team",
        "[NAME OR \"Team\"]": full_name if full_name != "there" else "Team",
        "[PUBLICATION NAME]": site_name,
        "[DIRECTORY NAME]": site_name,
        "[YOUR NAME]": sender_name,
        "[YOUR TITLE]": "Founder",
        "[YOUR AGENCY NAME]": agency_name,
        "[BROKEN URL]": broken_url,
        "[DEAD URL]": broken_url,
        "[DESCRIPTION OF BROKEN LINK]": broken_url or "a linked resource",
        "[THEIR ARTICLE TITLE]": article_title,
        "[ARTICLE TITLE]": article_title,
        "[ARTICLE URL]": site_url,
        "[RESOURCE PAGE URL]": resource_url or site_url,
        "[PAGE TITLE]": site_name,
        "[PAGE URL]": site_url,
        "[THEIR SITE NAME]": site_name,
        "[TOPIC]": "cyber insurance",
        "[TOPIC OF BROKEN LINK]": "cyber insurance resources",
        "[SECTION NAME / \"third paragraph\" / \"resources section\"]": "resources section",
        "[RELEVANT PAGE TITLE]": "Cyber Insurance Guide for Digital Agencies",
        "[ONE-SENTENCE DESCRIPTION]": "A comprehensive guide covering costs, coverage, and provider comparisons for digital agencies",
        "[RELEVANT-URL]": "blog/cyber-insurance-guide-digital-agencies",
        "[BRIEF EXPLANATION OF HOW IT ADDRESSES THE SAME TOPIC]": (
            "cyber insurance costs, coverage details, and provider comparisons "
            "specifically for digital agencies"
        ),
        "[ANCHOR TEXT]": broken_url or "the linked resource",
        "[SPECIFIC SECTION YOU GENUINELY LIKED]": "the key findings",
        "[CHOSEN TOPIC]": "cyber insurance for digital agencies",
        "[TITLE OF THEIR RECENT RELEVANT ARTICLE]": article_title,
        "[404 / redirect to homepage / domain expired]": "404 error",
        "[EMAIL]": sender_email,
        "[PHONE]": "",
        "[NUMBER]": "hundreds of",
        "[X]": "4+",
        "[PLATFORM WHERE YOU CONNECTED]": "Featured.com",
        "[Original Subject Line]": template_subject,
    }

    def _apply(text: str) -> str:
        """Apply all placeholder replacements to *text*."""
        for placeholder, value in replacements.items():
            # Use case-insensitive replacement
            pattern = re.escape(placeholder)
            text = re.sub(pattern, value, text, flags=re.IGNORECASE)
        return text

    return _apply(template_subject), _apply(template_body)


# ---------------------------------------------------------------------------
# Draft creation
# ---------------------------------------------------------------------------
def draft_email(prospect: dict, config: dict, templates: dict[str, dict]) -> dict:
    """Create a complete queue item dict for a single prospect.

    Returns a dict conforming to the queue-item schema with
    ``status='pending'``.
    """
    template_key = select_template(prospect, templates)
    tpl = templates.get(template_key, {})

    if not tpl:
        print(f"  [WARN] No template found for key '{template_key}', using fallback")
        tpl = next(iter(templates.values()), {
            "subjects": ["Backlink Opportunity"],
            "body": "Hi there,\n\nI'd love to discuss a collaboration opportunity.\n\nBest,\n[YOUR NAME]",
            "followup_subject": "",
            "followup_body": "",
        })

    # Pick subject (alternate A/B based on uuid hash for determinism)
    subjects = tpl.get("subjects", ["Backlink Opportunity"])
    prospect_id = prospect.get("id", str(uuid.uuid4()))
    subj_index = hash(prospect_id) % len(subjects) if subjects else 0
    raw_subject = subjects[subj_index] if subjects else "Backlink Opportunity"
    raw_body = tpl.get("body", "")

    # Personalise
    subject, body = personalize(raw_body, raw_subject, prospect, config)
    # Follow-up personalisation

    now_utc = datetime.now(timezone.utc).isoformat()

    queue_item: dict[str, Any] = {
        "id": str(uuid.uuid4()),
        "created": now_utc,
        "status": "pending",
        "prospect": {
            "name": prospect.get("name", ""),
            "email": prospect.get("email", ""),
            "site": prospect.get("site", ""),
            "type": prospect.get("type", ""),
            "da_estimate": prospect.get("da_estimate", 0),
        },
        "email": {
            "subject": subject,
            "body": body,
            "template_used": template_key,
        },
        "followup_number": 0,
        "sent_at": None,
        "reject_reason": None,
    }

    return queue_item


# ---------------------------------------------------------------------------
# Queue persistence (with file locking)
# ---------------------------------------------------------------------------
def _load_json(path: Path) -> list[dict]:
    """Load a JSON array from *path*, returning [] if missing or empty."""
    if not path.exists() or path.stat().st_size == 0:
        return []
    try:
        with open(path) as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save_json_locked(path: Path, data: Any) -> None:
    """Atomically write JSON data to *path* with an exclusive file lock."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_suffix(".tmp")
    with open(tmp_path, "w") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        try:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
        finally:
            fcntl.flock(f.fileno(), fcntl.LOCK_UN)
    tmp_path.replace(path)


def add_to_queue(draft: dict) -> None:
    """Append a single draft to data/queue.json with file locking.

    Creates the file if it does not exist.
    """
    queue = _load_json(QUEUE_PATH)

    # Idempotency: skip if a queue item with the same prospect email+site
    # and template already exists in pending state
    prospect_email = draft.get("prospect", {}).get("email", "")
    prospect_site = draft.get("prospect", {}).get("site", "")
    template_used = draft.get("email", {}).get("template_used", "")

    for existing in queue:
        ep = existing.get("prospect", {})
        ee = existing.get("email", {})
        if (
            ep.get("email") == prospect_email
            and ep.get("site") == prospect_site
            and ee.get("template_used") == template_used
            and existing.get("status") in ("pending", "approved", "sent")
        ):
            print(f"  [SKIP] Duplicate queue item for {prospect_email or prospect_site}")
            return

    queue.append(draft)
    _save_json_locked(QUEUE_PATH, queue)


# ---------------------------------------------------------------------------
# Batch drafting
# ---------------------------------------------------------------------------
def batch_draft(limit: int | None = None, dry_run: bool = False) -> int:
    """Draft emails for prospects with status='new'.

    Args:
        limit:   Maximum number of drafts to create.  Falls back to
                 ``config.outreach.batch_size`` when *None*.
        dry_run: If *True*, print drafts but do not save anything.

    Returns:
        The number of drafts created.
    """
    config = load_config()
    templates = load_templates()

    if not templates:
        print("[ERROR] No templates loaded — cannot draft emails.")
        return 0

    # Determine batch size
    batch_size = limit if limit is not None else config.get("outreach", {}).get("batch_size", 10)

    # Load prospects
    prospects = _load_json(PROSPECTS_PATH)
    if not prospects:
        print("[INFO] No prospects found in data/prospects.json")
        return 0

    # Filter to status='new' and sort by relevance_score descending
    new_prospects = [
        p for p in prospects
        if p.get("status", "new") == "new"
    ]
    new_prospects.sort(key=lambda p: p.get("relevance_score", 0), reverse=True)

    if not new_prospects:
        print("[INFO] No prospects with status='new' found.")
        return 0

    to_draft = new_prospects[:batch_size]
    print(f"\n[DRAFT] Processing {len(to_draft)} of {len(new_prospects)} new prospects (batch_size={batch_size})")

    drafted_count = 0
    drafted_ids: set[str] = set()

    for i, prospect in enumerate(to_draft, 1):
        p_email = prospect.get("email", "(no email)")
        p_site = prospect.get("site", "(no site)")
        p_type = prospect.get("type", "unknown")
        p_score = prospect.get("relevance_score", 0)

        print(f"\n  [{i}/{len(to_draft)}] {p_type} | score={p_score} | {p_email or p_site}")

        # Skip prospects without email AND without site
        if not prospect.get("email") and not prospect.get("site"):
            print("    [SKIP] No email or site — cannot draft")
            continue

        try:
            queue_item = draft_email(prospect, config, templates)
        except Exception as exc:
            print(f"    [ERROR] Failed to draft: {exc}")
            continue

        template_used = queue_item["email"]["template_used"]
        subject = queue_item["email"]["subject"]
        print(f"    Template: {template_used}")
        print(f"    Subject:  {subject}")

        if dry_run:
            print(f"    Body preview: {queue_item['email']['body'][:120]}...")
            print("    [DRY RUN] Not saving.")
        else:
            add_to_queue(queue_item)
            drafted_ids.add(prospect.get("id", ""))

        drafted_count += 1

    # Mark drafted prospects as status='drafted' in prospects.json
    if not dry_run and drafted_ids:
        updated = False
        for p in prospects:
            if p.get("id") in drafted_ids:
                p["status"] = "drafted"
                updated = True
        if updated:
            _save_json_locked(PROSPECTS_PATH, prospects)
            print(f"\n[UPDATED] Marked {len(drafted_ids)} prospects as 'drafted' in prospects.json")

    return drafted_count


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
def main(limit: int | None = None, dry_run: bool = False) -> None:
    """Load config, run batch_draft, print summary."""
    print("=" * 60)
    print("  EMAIL DRAFTER — AgencyCyberInsurance.com")
    print(f"  {datetime.now(timezone.utc).isoformat()}")
    if dry_run:
        print("  MODE: DRY RUN (no files will be modified)")
    print("=" * 60)

    count = batch_draft(limit=limit, dry_run=dry_run)

    print("\n" + "=" * 60)
    print(f"  SUMMARY: {count} email(s) drafted")
    if not dry_run:
        print(f"  Queue file: {QUEUE_PATH}")
        queue = _load_json(QUEUE_PATH)
        pending = sum(1 for q in queue if q.get("status") == "pending")
        print(f"  Total pending in queue: {pending}")
    print("=" * 60)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Draft personalised outreach emails from templates"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum number of emails to draft (default: config batch_size)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        default=False,
        help="Preview drafts without saving to queue",
    )
    args = parser.parse_args()
    main(limit=args.limit, dry_run=args.dry_run)
