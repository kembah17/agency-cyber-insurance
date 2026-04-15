#!/usr/bin/env python3
"""digest_generator.py \u2013 Generate daily outreach digest reports in Markdown.

Collects statistics from every data file in the outreach system and produces
a human-readable digest with action items, performance metrics, and pipeline
summary.
"""
from __future__ import annotations

import argparse
import fcntl
import json
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = OUTREACH_DIR / "data"
REPORTS_DIR = OUTREACH_DIR / "reports"

QUEUE_PATH = DATA_DIR / "queue.json"
SENT_LOG_PATH = DATA_DIR / "sent_log.json"
SENT_ARCHIVE_PATH = DATA_DIR / "sent_archive.json"
PROSPECTS_PATH = DATA_DIR / "prospects.json"
COMMUNITY_DRAFTS_PATH = DATA_DIR / "community_drafts.json"

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


def parse_iso(dt_str: str) -> datetime:
    """Parse an ISO datetime string, tolerating several common formats."""
    if not dt_str:
        return datetime.min.replace(tzinfo=timezone.utc)
    try:
        # Python 3.11+ fromisoformat handles timezone offsets
        return datetime.fromisoformat(dt_str)
    except (ValueError, TypeError):
        try:
            return datetime.strptime(dt_str, "%Y-%m-%dT%H:%M:%S.%f%z")
        except (ValueError, TypeError):
            return datetime.min.replace(tzinfo=timezone.utc)


def _week_start() -> datetime:
    """Return Monday 00:00 UTC of the current week."""
    now = datetime.now(timezone.utc)
    monday = now - timedelta(days=now.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


# ---------------------------------------------------------------------------
# Statistics gathering
# ---------------------------------------------------------------------------

def gather_stats() -> dict[str, Any]:
    """Collect statistics from all data files."""
    queue = load_json(QUEUE_PATH)
    sent_log = load_json(SENT_LOG_PATH)
    sent_archive = load_json(SENT_ARCHIVE_PATH)
    prospects = load_json(PROSPECTS_PATH)
    community = load_json(COMMUNITY_DRAFTS_PATH)

    # --- Queue stats ---
    queue_by_status: dict[str, int] = {}
    for item in queue:
        status = item.get("status", "unknown")
        queue_by_status[status] = queue_by_status.get(status, 0) + 1

    # --- Sent log stats ---
    all_sent = sent_log + sent_archive
    week_start = _week_start()
    sent_this_week = [
        s for s in all_sent
        if parse_iso(s.get("sent_at", "")) >= week_start
    ]
    sent_by_status: dict[str, int] = {}
    for item in all_sent:
        status = item.get("status", "unknown")
        sent_by_status[status] = sent_by_status.get(status, 0) + 1

    # --- Prospect stats ---
    prospect_by_status: dict[str, int] = {}
    for p in prospects:
        status = p.get("status", "new")
        prospect_by_status[status] = prospect_by_status.get(status, 0) + 1

    # --- Community stats ---
    community_by_platform: dict[str, int] = {}
    community_by_status: dict[str, int] = {}
    for c in community:
        platform = c.get("platform", "unknown")
        community_by_platform[platform] = community_by_platform.get(platform, 0) + 1
        status = c.get("status", "unknown")
        community_by_status[status] = community_by_status.get(status, 0) + 1

    return {
        "queue": {
            "total": len(queue),
            "by_status": queue_by_status,
        },
        "sent": {
            "total": len(all_sent),
            "this_week": len(sent_this_week),
            "by_status": sent_by_status,
        },
        "prospects": {
            "total": len(prospects),
            "by_status": prospect_by_status,
        },
        "community": {
            "total": len(community),
            "by_platform": community_by_platform,
            "by_status": community_by_status,
        },
    }


# ---------------------------------------------------------------------------
# Pending actions
# ---------------------------------------------------------------------------

def pending_actions() -> dict[str, list]:
    """List items needing human attention."""
    queue = load_json(QUEUE_PATH)
    community = load_json(COMMUNITY_DRAFTS_PATH)

    # Pending approvals
    pending_approvals = [
        item for item in queue if item.get("status") == "pending"
    ]

    # Due follow-ups (import from followup_tracker)
    due_followups: list[dict] = []
    try:
        sys.path.insert(0, str(OUTREACH_DIR / "scripts"))
        from followup_tracker import check_due_followups
        due_followups = check_due_followups()
    except ImportError as exc:
        print(f"  \u26a0 Could not import followup_tracker: {exc}")
    except Exception as exc:
        print(f"  \u26a0 Error checking follow-ups: {exc}")

    # Community drafts ready for posting
    ready_drafts = [
        c for c in community if c.get("status") == "draft"
    ]

    return {
        "pending_approvals": pending_approvals,
        "due_followups": due_followups,
        "ready_drafts": ready_drafts,
    }


# ---------------------------------------------------------------------------
# Weekly performance
# ---------------------------------------------------------------------------

def calculate_weekly_performance() -> dict[str, Any]:
    """Calculate this week's outreach metrics."""
    sent_log = load_json(SENT_LOG_PATH)
    sent_archive = load_json(SENT_ARCHIVE_PATH)
    prospects = load_json(PROSPECTS_PATH)

    all_sent = sent_log + sent_archive
    week_start = _week_start()

    sent_this_week = [
        s for s in all_sent
        if parse_iso(s.get("sent_at", "")) >= week_start
    ]

    total_sent = len(all_sent)
    responded = sum(1 for s in all_sent if s.get("status") == "responded")
    bounced = sum(1 for s in all_sent if s.get("status") == "bounced")

    response_rate = (responded / total_sent * 100) if total_sent > 0 else 0.0
    bounce_rate = (bounced / total_sent * 100) if total_sent > 0 else 0.0

    # New prospects this week
    new_this_week = [
        p for p in prospects
        if parse_iso(p.get("found_date", p.get("created", ""))) >= week_start
    ]

    return {
        "emails_sent_this_week": len(sent_this_week),
        "total_sent_all_time": total_sent,
        "responded": responded,
        "bounced": bounced,
        "response_rate": round(response_rate, 1),
        "bounce_rate": round(bounce_rate, 1),
        "new_prospects_this_week": len(new_this_week),
    }


# ---------------------------------------------------------------------------
# Digest generator
# ---------------------------------------------------------------------------

def generate_digest(target_date: str | None = None) -> str:
    """Create the full markdown digest report."""
    date_str = target_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

    print("  Gathering statistics\u2026")
    stats = gather_stats()

    print("  Checking pending actions\u2026")
    actions = pending_actions()

    print("  Calculating weekly performance\u2026")
    perf = calculate_weekly_performance()

    # --- Build markdown ---
    lines: list[str] = []
    lines.append(f"# Daily Outreach Digest \u2014 {date_str}")
    lines.append("")

    # Quick Stats
    q = stats["queue"]["by_status"]
    lines.append("## \U0001f4ca Quick Stats")
    lines.append(f"- Pending approval: {q.get('pending', 0)} emails")
    lines.append(f"- Approved (ready to send): {q.get('approved', 0)} emails")
    lines.append(f"- Sent this week: {stats['sent']['this_week']} emails")
    lines.append(f"- Follow-ups due: {len(actions['due_followups'])}")
    lines.append(f"- Community drafts ready: {len(actions['ready_drafts'])}")
    lines.append("")

    # Action Required
    lines.append("## \u2705 Action Required")

    # Pending approvals
    lines.append("### Emails Pending Approval")
    if actions["pending_approvals"]:
        for i, item in enumerate(actions["pending_approvals"], 1):
            prospect = item.get("prospect", {})
            email_data = item.get("email", {})
            ptype = prospect.get("type", "outreach").replace("_", " ").title()
            addr = prospect.get("email", "unknown")
            subj = email_data.get("subject", "(no subject)")
            lines.append(f"{i}. [{ptype}] \u2192 {addr} \u2014 \"{subj}\"")
    else:
        lines.append("None \u2014 all caught up! \U0001f389")
    lines.append("")

    # Follow-ups due
    lines.append("### Follow-ups Due Today")
    if actions["due_followups"]:
        for i, item in enumerate(actions["due_followups"], 1):
            email = item.get("prospect_email", "unknown")
            fu_num = item.get("followup_number", 0) + 1
            sent_at = item.get("sent_at", "")
            if sent_at:
                try:
                    days_ago = (datetime.now(timezone.utc) - parse_iso(sent_at)).days
                    age_str = f"sent {days_ago} days ago"
                except Exception:
                    age_str = "sent date unknown"
            else:
                age_str = "sent date unknown"
            lines.append(f"{i}. [Follow-up #{fu_num}] \u2192 {email} \u2014 {age_str}, no response")
    else:
        lines.append("None due today")
    lines.append("")

    # Community posts
    lines.append("### Community Posts Ready")
    if actions["ready_drafts"]:
        for i, draft in enumerate(actions["ready_drafts"], 1):
            platform = draft.get("platform", "unknown")
            if platform == "reddit":
                sub = draft.get("subreddit", "")
                title = draft.get("thread_title", draft.get("topic", ""))
                lines.append(f"{i}. [Reddit] r/{sub} \u2014 \"{title[:60]}\"")
            elif platform == "linkedin":
                topic = draft.get("topic", "")
                lines.append(f"{i}. [LinkedIn] \u2014 \"{topic[:60]}\"")
            else:
                lines.append(f"{i}. [{platform}] \u2014 \"{draft.get('topic', '')[:60]}\"")
    else:
        lines.append("None ready")
    lines.append("")

    # Weekly Performance
    lines.append("## \U0001f4c8 This Week's Performance")
    lines.append(f"- Emails sent: {perf['emails_sent_this_week']}")
    lines.append("- Open rate: N/A (Brevo tracking)")
    lines.append(f"- Responses received: {perf['responded']} (manual update)")
    lines.append("- Links acquired: N/A (manual update)")
    lines.append(f"- New prospects found: {perf['new_prospects_this_week']}")
    lines.append(f"- Bounce rate: {perf['bounce_rate']}%")
    lines.append("")

    # Pipeline Summary
    lines.append("## \U0001f4cb Pipeline Summary")
    lines.append(f"- Total prospects in database: {stats['prospects']['total']}")

    # Active = sent items that are not bounced/responded/cold
    sent_log = load_json(SENT_LOG_PATH)
    active_sequences = sum(
        1 for s in sent_log if s.get("status") == "sent"
    )
    completed = sum(
        1 for s in sent_log if s.get("status") in ("responded", "cold")
    )
    total_sequences = active_sequences + completed
    success_rate = (
        (sum(1 for s in sent_log if s.get("status") == "responded") / total_sequences * 100)
        if total_sequences > 0 else 0.0
    )
    lines.append(f"- Active outreach sequences: {active_sequences}")
    lines.append(f"- Completed sequences: {completed}")
    lines.append(f"- Success rate: {round(success_rate, 1)}%")
    lines.append("")

    return "\n".join(lines)


# ---------------------------------------------------------------------------
# Save / email digest
# ---------------------------------------------------------------------------

def save_digest(report: str, target_date: str | None = None) -> Path:
    """Save digest to reports/digest_YYYY-MM-DD.md. Return the path."""
    date_str = target_date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORTS_DIR / f"digest_{date_str}.md"
    path.write_text(report, encoding="utf-8")
    print(f"  Digest saved to {path}")
    return path


def email_digest(report: str, config: dict) -> bool:
    """Optionally email the digest to the sender address.

    Returns True if sent, False if skipped.
    """
    brevo = config.get("brevo", {})
    api_key = brevo.get("api_key", "")
    if not api_key or api_key == "YOUR_BREVO_API_KEY":
        print("  \u26a0 Brevo not configured \u2014 skipping email digest.")
        return False

    try:
        sys.path.insert(0, str(OUTREACH_DIR / "scripts"))
        from email_sender import send_email, load_config as load_sender_config

        sender_config = load_sender_config()
        sender_email = brevo.get("sender_email", "")
        sender_name = brevo.get("sender_name", "Outreach System")
        date_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")

        success = send_email(
            config=sender_config,
            to_email=sender_email,
            to_name=sender_name,
            subject=f"Daily Outreach Digest \u2014 {date_str}",
            body=report,
        )
        if success:
            print(f"  \u2709 Digest emailed to {sender_email}")
            return True
        else:
            print("  \u26a0 Failed to send digest email.")
            return False
    except ImportError as exc:
        print(f"  \u26a0 Could not import email_sender: {exc}")
        return False
    except Exception as exc:
        print(f"  \u26a0 Error emailing digest: {exc}")
        return False


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate daily outreach digest report.",
    )
    parser.add_argument(
        "--email", action="store_true",
        help="Also email the digest to the configured sender address",
    )
    parser.add_argument(
        "--stdout", action="store_true",
        help="Print digest to stdout instead of saving to file",
    )
    parser.add_argument(
        "--date", type=str, default=None,
        help="Generate digest for a specific date (YYYY-MM-DD). Default: today.",
    )
    args = parser.parse_args()

    print("=" * 60)
    print("Daily Digest Generator")
    print("=" * 60)

    target_date = args.date or datetime.now(timezone.utc).strftime("%Y-%m-%d")
    print(f"\n  Generating digest for {target_date}\u2026")

    report = generate_digest(target_date=target_date)

    if args.stdout:
        print("\n" + report)
    else:
        save_digest(report, target_date=target_date)

    if args.email:
        config = load_config()
        email_digest(report, config)

    print("\n" + "=" * 60)
    print("Digest generation complete.")
    print("=" * 60)


if __name__ == "__main__":
    main()
