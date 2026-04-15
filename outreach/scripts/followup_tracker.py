#!/usr/bin/env python3
"""followup_tracker.py - Manage follow-up email sequences.

Scans sent_log.json for emails due for follow-up based on
configured intervals, generates follow-up emails, and queues
them for approval/sending.

Usage:
    python followup_tracker.py check              # Show due follow-ups
    python followup_tracker.py queue              # Queue all due follow-ups
    python followup_tracker.py responded <email>  # Mark prospect as responded
    python followup_tracker.py cold <email>       # Mark as cold/no-response
    python followup_tracker.py active             # List active sequences
"""
from __future__ import annotations

import argparse
import fcntl
import json
import sys
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Optional

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR = Path(__file__).resolve().parent.parent
CONFIG_PATH = OUTREACH_DIR / "config.json"
QUEUE_PATH = OUTREACH_DIR / "data" / "queue.json"
SENT_LOG_PATH = OUTREACH_DIR / "data" / "sent_log.json"

# ---------------------------------------------------------------------------
# Shared utilities
# ---------------------------------------------------------------------------

def load_json(path: Path) -> list:
    """Load a JSON array from *path*, returning [] if missing or empty."""
    if not path.exists():
        return []
    with open(path) as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            return []
    return data if isinstance(data, list) else []


def save_json(path: Path, data: list) -> None:
    """Atomically write *data* as JSON with file locking."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w") as f:
        fcntl.flock(f.fileno(), fcntl.LOCK_EX)
        json.dump(data, f, indent=2, default=str)
        f.flush()
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)
    tmp.rename(path)


def load_config() -> dict:
    """Load outreach config.json."""
    if not CONFIG_PATH.exists():
        print(f"ERROR: Config file not found at {CONFIG_PATH}")
        sys.exit(1)
    with open(CONFIG_PATH) as f:
        return json.load(f)


def utcnow() -> str:
    """Return current UTC time as ISO-8601 string."""
    return datetime.now(timezone.utc).isoformat()


def parse_iso(dt_str: str) -> datetime:
    """Parse an ISO-8601 datetime string to a timezone-aware datetime."""
    # Handle various ISO formats
    dt_str = dt_str.strip()
    try:
        dt = datetime.fromisoformat(dt_str)
    except ValueError:
        # Fallback: try stripping microseconds or other quirks
        dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    # Ensure timezone-aware (assume UTC if naive)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def days_since(iso_str: str) -> float:
    """Return fractional days elapsed since the given ISO timestamp."""
    sent_dt = parse_iso(iso_str)
    now = datetime.now(timezone.utc)
    return (now - sent_dt).total_seconds() / 86400.0

# ---------------------------------------------------------------------------
# Terminal colours
# ---------------------------------------------------------------------------

def _supports_color() -> bool:
    import os
    if os.environ.get("NO_COLOR"):
        return False
    if not hasattr(sys.stdout, "isatty"):
        return False
    return sys.stdout.isatty()


_COLOR = _supports_color()


def _c(code: str, text: str) -> str:
    if not _COLOR:
        return text
    return f"\033[{code}m{text}\033[0m"

# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def check_due_followups() -> list[dict]:
    """Return sent_log entries that are due for a follow-up.

    An entry is due when:
    - status == 'sent' (not bounced, responded, or cold)
    - followup_number < max_followups
    - Days since sent_at >= the next threshold from followup_days
    - No pending/approved followup already in queue.json for this prospect
    """
    config = load_config()
    outreach_cfg = config.get("outreach", {})
    followup_days: list[int] = outreach_cfg.get("followup_days", [5, 12, 21])
    max_followups: int = outreach_cfg.get("max_followups", 3)

    sent_log = load_json(SENT_LOG_PATH)
    queue = load_json(QUEUE_PATH)

    # Build set of (prospect_email) that already have pending/approved followups
    pending_followups: set[str] = set()
    for item in queue:
        if item.get("status") in ("pending", "approved") and item.get("followup_number", 0) > 0:
            prospect = item.get("prospect", {})
            pending_followups.add(prospect.get("email", "").lower())

    # Group sent_log by prospect_email to find the latest entry per prospect
    # We need the most recent sent entry to determine current followup state
    prospect_latest: dict[str, dict] = {}
    for entry in sent_log:
        if entry.get("status") != "sent":
            continue
        email = entry.get("prospect_email", "").lower()
        if not email:
            continue
        existing = prospect_latest.get(email)
        if existing is None:
            prospect_latest[email] = entry
        else:
            # Keep the one with the highest followup_number
            if entry.get("followup_number", 0) > existing.get("followup_number", 0):
                prospect_latest[email] = entry
            elif entry.get("followup_number", 0) == existing.get("followup_number", 0):
                # Same followup number — keep the most recent sent_at
                if entry.get("sent_at", "") > existing.get("sent_at", ""):
                    prospect_latest[email] = entry

    # Also find the original (followup_number=0) entry for each prospect
    # to calculate days since the ORIGINAL send
    prospect_original: dict[str, dict] = {}
    for entry in sent_log:
        email = entry.get("prospect_email", "").lower()
        if not email:
            continue
        fu_num = entry.get("followup_number", 0)
        if fu_num == 0 and entry.get("sent_at"):
            existing = prospect_original.get(email)
            if existing is None or entry.get("sent_at", "") < existing.get("sent_at", ""):
                prospect_original[email] = entry

    due: list[dict] = []
    for email, latest in prospect_latest.items():
        # Skip if already has a pending followup in queue
        if email in pending_followups:
            continue

        current_fu = latest.get("followup_number", 0)
        next_fu = current_fu + 1

        # Check if we've hit the max
        if next_fu > max_followups:
            continue

        # Determine the day threshold for the next followup
        # followup_days[0] = days after original for FU#1
        # followup_days[1] = days after original for FU#2
        # followup_days[2] = days after original for FU#3
        if next_fu - 1 >= len(followup_days):
            continue
        day_threshold = followup_days[next_fu - 1]

        # Calculate days since the ORIGINAL email was sent
        original = prospect_original.get(email)
        if original is None:
            # No original found — use the latest entry's sent_at
            reference_date = latest.get("sent_at")
        else:
            reference_date = original.get("sent_at")

        if not reference_date:
            continue

        elapsed = days_since(reference_date)
        if elapsed >= day_threshold:
            # Annotate the entry with computed metadata for display
            entry_copy = dict(latest)
            entry_copy["_next_followup_number"] = next_fu
            entry_copy["_days_elapsed"] = round(elapsed, 1)
            entry_copy["_day_threshold"] = day_threshold
            entry_copy["_original_sent_at"] = reference_date
            due.append(entry_copy)

    return due


def generate_followup(original: dict, followup_number: int, config: dict) -> dict:
    """Create a follow-up queue item from a sent_log entry.

    Parameters
    ----------
    original : dict
        The sent_log entry (latest for this prospect).
    followup_number : int
        Which follow-up this is (1, 2, or 3).
    config : dict
        Full config.json contents.
    """
    site_cfg = config.get("site", {})
    site_name = site_cfg.get("name", "AgencyCyberInsurance.com")
    site_url = site_cfg.get("url", "https://agencycyberinsurance.com")
    niche = site_cfg.get("niche", "cyber liability insurance for digital agencies")

    prospect_name = original.get("prospect_name", "there")
    first_name = prospect_name.split()[0] if prospect_name and prospect_name != "there" else "there"
    original_subject = original.get("subject", "my previous email")

    # Strip any existing "Re: " prefixes to avoid stacking
    clean_subject = original_subject
    while clean_subject.lower().startswith("re: "):
        clean_subject = clean_subject[4:]
    subject = f"Re: {clean_subject}"

    # Generate body based on followup number
    if followup_number == 1:
        body = (
            f"Hi {first_name},\n\n"
            f"Just floating this back to the top of your inbox — I reached out "
            f"last week about a potential collaboration.\n\n"
            f"I know things get busy, so here's the quick version: I run "
            f"{site_name}, a resource hub focused on {niche}. I thought there "
            f"could be a great fit for your audience.\n\n"
            f"Would love to hear your thoughts when you get a moment. Even a "
            f"quick \"not interested\" helps me keep my outreach tidy!\n\n"
            f"Best,\n"
            f"The {site_name} Team\n"
            f"{site_url}"
        )
    elif followup_number == 2:
        body = (
            f"Hi {first_name},\n\n"
            f"I wanted to try one more time on this — I think there's genuine "
            f"value here for your readers.\n\n"
            f"Since my last email, we've published some new research on how "
            f"digital agencies are handling cyber liability risk in 2025. "
            f"The data shows some surprising gaps that your audience would "
            f"find really useful.\n\n"
            f"A few options that might work:\n"
            f"  • A guest article tailored to your editorial style\n"
            f"  • A data-driven infographic you could embed\n"
            f"  • Simply adding us as a resource on a relevant page\n\n"
            f"Happy to work with whatever format suits you best.\n\n"
            f"Cheers,\n"
            f"The {site_name} Team\n"
            f"{site_url}"
        )
    else:  # followup_number == 3
        body = (
            f"Hi {first_name},\n\n"
            f"Final follow-up from me — I promise this is the last one!\n\n"
            f"If a guest post isn't the right fit, I completely understand. "
            f"I'd also be happy to:\n\n"
            f"  • Provide an expert quote for any upcoming pieces on "
            f"cyber insurance or agency risk management\n"
            f"  • Share original data or statistics your writers could reference\n"
            f"  • Simply exchange links if you have relevant content\n\n"
            f"Either way, I appreciate you taking the time. If the timing "
            f"isn't right now, feel free to reach out whenever it is — "
            f"we're not going anywhere.\n\n"
            f"All the best,\n"
            f"The {site_name} Team\n"
            f"{site_url}"
        )

    queue_item = {
        "id": str(uuid.uuid4()),
        "created": utcnow(),
        "status": "pending",
        "prospect": {
            "name": original.get("prospect_name", ""),
            "email": original.get("prospect_email", ""),
            "site": original.get("prospect_site", ""),
            "site_name": "",  # Not available from sent_log
            "type": original.get("template_used", "guest_post"),
            "da_estimate": 0,
        },
        "email": {
            "subject": subject,
            "body": body,
            "template_used": f"followup_{followup_number}",
        },
        "followup_number": followup_number,
        "sent_at": None,
        "reject_reason": None,
    }
    return queue_item


def queue_followups() -> int:
    """Check for due follow-ups, generate emails, add to queue. Return count."""
    config = load_config()
    due = check_due_followups()

    if not due:
        print("No follow-ups are due at this time.")
        return 0

    queue = load_json(QUEUE_PATH)
    count = 0

    for entry in due:
        next_fu = entry.get("_next_followup_number", 1)
        item = generate_followup(entry, next_fu, config)
        queue.append(item)
        prospect_email = entry.get("prospect_email", "?")
        print(f"  Queued follow-up #{next_fu} for {prospect_email} "
              f"(days elapsed: {entry.get('_days_elapsed', '?')})")
        count += 1

    save_json(QUEUE_PATH, queue)
    print(f"\nQueued {count} follow-up(s) as pending.")
    return count


def mark_responded(prospect_email: str) -> bool:
    """Mark all sent_log entries for *prospect_email* as responded."""
    log = load_json(SENT_LOG_PATH)
    found = False
    now = utcnow()

    for entry in log:
        if entry.get("prospect_email", "").lower() == prospect_email.lower():
            if entry.get("status") == "sent":
                entry["status"] = "responded"
                entry["responded_at"] = now
                found = True

    if found:
        save_json(SENT_LOG_PATH, log)
        print(f"Marked {prospect_email} as responded.")

        # Also remove any pending/approved followups for this prospect from queue
        queue = load_json(QUEUE_PATH)
        original_len = len(queue)
        queue = [
            item for item in queue
            if not (
                item.get("prospect", {}).get("email", "").lower() == prospect_email.lower()
                and item.get("status") in ("pending", "approved")
                and item.get("followup_number", 0) > 0
            )
        ]
        removed = original_len - len(queue)
        if removed:
            save_json(QUEUE_PATH, queue)
            print(f"  Removed {removed} pending follow-up(s) from queue.")
    else:
        print(f"No sent entries found for {prospect_email}.")

    return found


def mark_no_response(prospect_email: str) -> bool:
    """Mark all sent entries for *prospect_email* as cold (no response after max followups)."""
    log = load_json(SENT_LOG_PATH)
    found = False

    for entry in log:
        if entry.get("prospect_email", "").lower() == prospect_email.lower():
            if entry.get("status") == "sent":
                entry["status"] = "cold"
                entry["notes"] = f"Marked cold {utcnow()}"
                found = True

    if found:
        save_json(SENT_LOG_PATH, log)
        print(f"Marked {prospect_email} as cold (no response).")

        # Remove pending followups from queue
        queue = load_json(QUEUE_PATH)
        original_len = len(queue)
        queue = [
            item for item in queue
            if not (
                item.get("prospect", {}).get("email", "").lower() == prospect_email.lower()
                and item.get("status") in ("pending", "approved")
                and item.get("followup_number", 0) > 0
            )
        ]
        removed = original_len - len(queue)
        if removed:
            save_json(QUEUE_PATH, queue)
            print(f"  Removed {removed} pending follow-up(s) from queue.")
    else:
        print(f"No sent entries found for {prospect_email}.")

    return found


def list_active() -> list[dict]:
    """Return all active follow-up sequences (sent, not responded/bounced/cold)."""
    sent_log = load_json(SENT_LOG_PATH)
    config = load_config()
    outreach_cfg = config.get("outreach", {})
    followup_days: list[int] = outreach_cfg.get("followup_days", [5, 12, 21])
    max_followups: int = outreach_cfg.get("max_followups", 3)

    # Group by prospect email
    sequences: dict[str, list[dict]] = {}
    for entry in sent_log:
        email = entry.get("prospect_email", "").lower()
        if not email:
            continue
        sequences.setdefault(email, []).append(entry)

    active: list[dict] = []
    for email, entries in sequences.items():
        # Check if any entry is still 'sent' (active)
        sent_entries = [e for e in entries if e.get("status") == "sent"]
        if not sent_entries:
            continue

        # Find the latest followup number
        max_fu = max(e.get("followup_number", 0) for e in entries)
        # Find the original send date
        originals = [e for e in entries if e.get("followup_number", 0) == 0]
        original_date = min(
            (e.get("sent_at", "") for e in originals),
            default=""
        ) if originals else ""

        latest_sent = max(
            (e for e in sent_entries),
            key=lambda e: e.get("sent_at", ""),
            default=None,
        )

        elapsed = days_since(original_date) if original_date else 0
        next_fu = max_fu + 1
        next_due = "—"
        if next_fu <= max_followups and next_fu - 1 < len(followup_days):
            threshold = followup_days[next_fu - 1]
            remaining = threshold - elapsed
            if remaining <= 0:
                next_due = _c("33", "NOW")
            else:
                next_due = f"in {remaining:.0f}d"

        active.append({
            "email": email,
            "name": latest_sent.get("prospect_name", "") if latest_sent else "",
            "site": latest_sent.get("prospect_site", "") if latest_sent else "",
            "followups_sent": max_fu,
            "max_followups": max_followups,
            "original_date": original_date,
            "days_elapsed": round(elapsed, 1),
            "next_due": next_due,
            "total_emails": len(entries),
        })

    return active

# ---------------------------------------------------------------------------
# Display helpers
# ---------------------------------------------------------------------------

def display_due(due: list[dict]) -> None:
    """Pretty-print the list of due follow-ups."""
    if not due:
        print("No follow-ups are due at this time.")
        return

    print(f"\n{'─' * 70}")
    print(f" {_c('33', 'DUE FOLLOW-UPS')} ({len(due)} total)")
    print(f"{'─' * 70}")

    for entry in due:
        email = entry.get("prospect_email", "?")
        name = entry.get("prospect_name", "")
        next_fu = entry.get("_next_followup_number", "?")
        elapsed = entry.get("_days_elapsed", "?")
        threshold = entry.get("_day_threshold", "?")
        original_sent = entry.get("_original_sent_at", "?")

        print(f"  {_c('36', email)} ({name})")
        print(f"    Follow-up #{next_fu} due (threshold: {threshold}d, elapsed: {elapsed}d)")
        print(f"    Original sent: {original_sent}")
        print()


def display_active(active: list[dict]) -> None:
    """Pretty-print active follow-up sequences."""
    if not active:
        print("No active follow-up sequences.")
        return

    print(f"\n{'─' * 74}")
    print(f" {_c('36', 'ACTIVE FOLLOW-UP SEQUENCES')} ({len(active)} prospects)")
    print(f"{'─' * 74}")
    print(f"  {'Email':<30} {'FU Sent':<10} {'Days':<8} {'Next Due':<12} {'Site'}")
    print(f"  {'─' * 30} {'─' * 10} {'─' * 8} {'─' * 12} {'─' * 12}")

    for seq in active:
        email = seq["email"][:29]
        fu_str = f"{seq['followups_sent']}/{seq['max_followups']}"
        days_str = f"{seq['days_elapsed']}d"
        site = seq.get("site", "")[:20]
        print(f"  {email:<30} {fu_str:<10} {days_str:<8} {seq['next_due']:<12} {site}")

    print()

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Manage follow-up email sequences.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("check", help="Show due follow-ups without queuing")
    sub.add_parser("queue", help="Queue all due follow-ups")

    resp_p = sub.add_parser("responded", help="Mark prospect as responded")
    resp_p.add_argument("email", help="Prospect email address")

    cold_p = sub.add_parser("cold", help="Mark prospect as cold/no-response")
    cold_p.add_argument("email", help="Prospect email address")

    sub.add_parser("active", help="List all active follow-up sequences")

    args = parser.parse_args()

    if args.command == "check":
        due = check_due_followups()
        display_due(due)
    elif args.command == "queue":
        queue_followups()
    elif args.command == "responded":
        mark_responded(args.email)
    elif args.command == "cold":
        mark_no_response(args.email)
    elif args.command == "active":
        active = list_active()
        display_active(active)


if __name__ == "__main__":
    main()
