#!/usr/bin/env python3
"""queue_manager.py - CLI interface for managing the outreach approval queue.

Provides commands to list, inspect, approve, reject, and send queued
outreach emails.  Works with data/queue.json and delegates actual
sending to email_sender.send_approved().

Usage:
    python queue_manager.py list
    python queue_manager.py show <id>
    python queue_manager.py approve <id|all>
    python queue_manager.py reject <id> [--reason "..."]
    python queue_manager.py send
    python queue_manager.py stats
    python queue_manager.py clear-sent
"""
from __future__ import annotations

import argparse
import fcntl
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR = Path(__file__).resolve().parent.parent
QUEUE_PATH = OUTREACH_DIR / "data" / "queue.json"
SENT_LOG_PATH = OUTREACH_DIR / "data" / "sent_log.json"
SENT_ARCHIVE_PATH = OUTREACH_DIR / "data" / "sent_archive.json"
CONFIG_PATH = OUTREACH_DIR / "config.json"

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

# ---------------------------------------------------------------------------
# Terminal colours (graceful degradation)
# ---------------------------------------------------------------------------

def _supports_color() -> bool:
    """Return True when stdout is a colour-capable terminal."""
    import os
    if os.environ.get("NO_COLOR"):
        return False
    if not hasattr(sys.stdout, "isatty"):
        return False
    return sys.stdout.isatty()


_COLOR = _supports_color()


def _c(code: str, text: str) -> str:
    """Wrap *text* in ANSI colour *code* if the terminal supports it."""
    if not _COLOR:
        return text
    return f"\033[{code}m{text}\033[0m"


def _status_color(status: str) -> str:
    """Return colour-coded status string."""
    colours = {
        "pending":  "33",   # yellow
        "approved": "36",   # cyan
        "sent":     "32",   # green
        "failed":   "31",   # red
        "rejected": "35",   # magenta
    }
    code = colours.get(status, "0")
    return _c(code, status.upper())

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _find_item(queue: list, item_id: str) -> dict | None:
    """Find a queue item by full or partial UUID."""
    # Exact match first
    for item in queue:
        if item.get("id") == item_id:
            return item
    # Partial prefix match
    matches = [item for item in queue if item.get("id", "").startswith(item_id)]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        print(f"Ambiguous ID prefix '{item_id}' — matches {len(matches)} items:")
        for m in matches:
            print(f"  {m['id']}")
        return None
    return None

# ---------------------------------------------------------------------------
# Commands
# ---------------------------------------------------------------------------

def cmd_list(args: argparse.Namespace) -> None:
    """Show all queue items grouped by status."""
    queue = load_json(QUEUE_PATH)
    if not queue:
        print("Queue is empty.")
        return

    # Group by status, ordered: pending → approved → sent → failed → rejected
    order = ["pending", "approved", "sent", "failed", "rejected"]
    grouped: dict[str, list] = {s: [] for s in order}
    for item in queue:
        status = item.get("status", "pending")
        grouped.setdefault(status, []).append(item)

    total = 0
    for status in order:
        items = grouped.get(status, [])
        if not items:
            continue
        print(f"\n{'─' * 60}")
        print(f" {_status_color(status)} ({len(items)})")
        print(f"{'─' * 60}")
        for idx, item in enumerate(items, 1):
            prospect = item.get("prospect", {})
            email_data = item.get("email", {})
            ptype = prospect.get("type", "unknown")
            to_email = prospect.get("email", "?")
            subject = email_data.get("subject", "(no subject)")
            short_id = item.get("id", "?")[:12]
            fu = item.get("followup_number", 0)
            fu_tag = f" [FU#{fu}]" if fu > 0 else ""
            print(f"  [{short_id}] {_status_color(item.get('status', 'pending'))} "
                  f"[{ptype}]{fu_tag} → {to_email} — \"{subject}\"")
            total += 1

    # Also show any statuses not in the standard order
    for status, items in grouped.items():
        if status not in order and items:
            print(f"\n{'─' * 60}")
            print(f" {status.upper()} ({len(items)})")
            print(f"{'─' * 60}")
            for item in items:
                prospect = item.get("prospect", {})
                email_data = item.get("email", {})
                short_id = item.get("id", "?")[:12]
                print(f"  [{short_id}] {status} → {prospect.get('email', '?')} — "
                      f"\"{email_data.get('subject', '')}\"")
                total += 1

    print(f"\nTotal: {total} items in queue")


def cmd_show(args: argparse.Namespace) -> None:
    """Show full details of a single queue item."""
    queue = load_json(QUEUE_PATH)
    item = _find_item(queue, args.id)
    if item is None:
        print(f"Item '{args.id}' not found in queue.")
        sys.exit(1)

    prospect = item.get("prospect", {})
    email_data = item.get("email", {})
    border = "═" * 64

    print(f"\n╔{border}╗")
    print(f"║ {'QUEUE ITEM DETAILS':^62} ║")
    print(f"╠{border}╣")
    print(f"║ {'ID:':<16} {item.get('id', '?'):<46} ║")
    print(f"║ {'Status:':<16} {_status_color(item.get('status', '?')):<55} ║" if _COLOR
          else f"║ {'Status:':<16} {item.get('status', '?').upper():<46} ║")
    print(f"║ {'Created:':<16} {item.get('created', '?'):<46} ║")
    print(f"║ {'Followup #:':<16} {item.get('followup_number', 0):<46} ║")
    print(f"║ {'Sent at:':<16} {item.get('sent_at') or 'Not yet':<46} ║")
    if item.get("reject_reason"):
        print(f"║ {'Reject reason:':<16} {item['reject_reason']:<46} ║")
    print(f"╠{border}╣")
    print(f"║ {'PROSPECT':^62} ║")
    print(f"╠{border}╣")
    print(f"║ {'Name:':<16} {prospect.get('name', '?'):<46} ║")
    print(f"║ {'Email:':<16} {prospect.get('email', '?'):<46} ║")
    print(f"║ {'Site:':<16} {prospect.get('site', '?'):<46} ║")
    print(f"║ {'Site name:':<16} {prospect.get('site_name', '?'):<46} ║")
    print(f"║ {'Type:':<16} {prospect.get('type', '?'):<46} ║")
    print(f"║ {'DA estimate:':<16} {str(prospect.get('da_estimate', 0)):<46} ║")
    print(f"╠{border}╣")
    print(f"║ {'EMAIL':^62} ║")
    print(f"╠{border}╣")
    print(f"║ {'Subject:':<16} {email_data.get('subject', '?'):<46} ║")
    print(f"║ {'Template:':<16} {email_data.get('template_used', '?'):<46} ║")
    print(f"╚{border}╝")
    print(f"\n{'─' * 66}")
    print("BODY:")
    print(f"{'─' * 66}")
    print(email_data.get("body", "(empty)"))
    print(f"{'─' * 66}")


def cmd_approve(args: argparse.Namespace) -> None:
    """Approve one item or all pending items."""
    queue = load_json(QUEUE_PATH)

    if args.id.lower() == "all":
        pending = [item for item in queue if item.get("status") == "pending"]
        if not pending:
            print("No pending items to approve.")
            return
        print(f"Approving {len(pending)} pending items...")
        for item in pending:
            item["status"] = "approved"
        save_json(QUEUE_PATH, queue)
        print(f"Done — {len(pending)} items approved.")
        return

    item = _find_item(queue, args.id)
    if item is None:
        print(f"Item '{args.id}' not found in queue.")
        sys.exit(1)

    if item.get("status") != "pending":
        print(f"Item is '{item.get('status')}', not 'pending'. "
              f"Only pending items can be approved.")
        sys.exit(1)

    item["status"] = "approved"
    save_json(QUEUE_PATH, queue)
    prospect = item.get("prospect", {})
    print(f"Approved: {prospect.get('email', '?')} — "
          f"\"{item.get('email', {}).get('subject', '')}\"")


def cmd_reject(args: argparse.Namespace) -> None:
    """Reject a queue item with optional reason."""
    queue = load_json(QUEUE_PATH)
    item = _find_item(queue, args.id)
    if item is None:
        print(f"Item '{args.id}' not found in queue.")
        sys.exit(1)

    if item.get("status") not in ("pending", "approved"):
        print(f"Item is '{item.get('status')}' — can only reject pending/approved items.")
        sys.exit(1)

    item["status"] = "rejected"
    item["reject_reason"] = args.reason or None
    save_json(QUEUE_PATH, queue)
    prospect = item.get("prospect", {})
    reason_msg = f" (reason: {args.reason})" if args.reason else ""
    print(f"Rejected: {prospect.get('email', '?')}{reason_msg}")


def cmd_send(args: argparse.Namespace) -> None:
    """Send all approved emails via email_sender module."""
    # Import email_sender from the same directory
    scripts_dir = Path(__file__).resolve().parent
    if str(scripts_dir) not in sys.path:
        sys.path.insert(0, str(scripts_dir))

    try:
        import email_sender
    except ImportError as exc:
        print(f"ERROR: Cannot import email_sender: {exc}")
        print(f"Ensure email_sender.py is in {scripts_dir}")
        sys.exit(1)

    stats = email_sender.send_approved()
    print(f"\nSend complete: {stats}")


def cmd_stats(args: argparse.Namespace) -> None:
    """Show queue and sent-log statistics."""
    queue = load_json(QUEUE_PATH)
    sent_log = load_json(SENT_LOG_PATH)
    archive = load_json(SENT_ARCHIVE_PATH)

    # Queue stats
    q_counts: dict[str, int] = {}
    for item in queue:
        status = item.get("status", "unknown")
        q_counts[status] = q_counts.get(status, 0) + 1

    # Sent log stats
    sl_counts: dict[str, int] = {}
    for entry in sent_log:
        status = entry.get("status", "unknown")
        sl_counts[status] = sl_counts.get(status, 0) + 1

    border = "═" * 50
    print(f"\n╔{border}╗")
    print(f"║ {'OUTREACH STATISTICS':^48} ║")
    print(f"╠{border}╣")
    print(f"║ {'QUEUE (queue.json)':^48} ║")
    print(f"╠{border}╣")
    print(f"║  {'Total items:':<30} {len(queue):>16} ║")
    for status in ["pending", "approved", "sent", "failed", "rejected"]:
        count = q_counts.get(status, 0)
        if count > 0:
            label = f"  {status.capitalize()}:"
            print(f"║  {label:<30} {count:>16} ║")
    print(f"╠{border}╣")
    print(f"║ {'SENT LOG (sent_log.json)':^48} ║")
    print(f"╠{border}╣")
    print(f"║  {'Total entries:':<30} {len(sent_log):>16} ║")
    for status in ["sent", "bounced", "responded", "cold"]:
        count = sl_counts.get(status, 0)
        if count > 0:
            label = f"  {status.capitalize()}:"
            print(f"║  {label:<30} {count:>16} ║")
    print(f"╠{border}╣")
    print(f"║ {'ARCHIVE (sent_archive.json)':^48} ║")
    print(f"╠{border}╣")
    print(f"║  {'Archived items:':<30} {len(archive):>16} ║")
    print(f"╠{border}╣")
    print(f"║ {'TOTALS':^48} ║")
    print(f"╠{border}╣")
    total_sent = sl_counts.get("sent", 0) + sl_counts.get("bounced", 0) + \
                 sl_counts.get("responded", 0) + sl_counts.get("cold", 0)
    response_rate = (sl_counts.get("responded", 0) / total_sent * 100) if total_sent else 0
    bounce_rate = (sl_counts.get("bounced", 0) / total_sent * 100) if total_sent else 0
    print(f"║  {'Total emails sent:':<30} {total_sent:>16} ║")
    print(f"║  {'Response rate:':<30} {f'{response_rate:.1f}%':>16} ║")
    print(f"║  {'Bounce rate:':<30} {f'{bounce_rate:.1f}%':>16} ║")
    print(f"╚{border}╝")


def cmd_clear_sent(args: argparse.Namespace) -> None:
    """Move all sent items from queue.json to sent_archive.json."""
    queue = load_json(QUEUE_PATH)
    sent_items = [item for item in queue if item.get("status") == "sent"]

    if not sent_items:
        print("No sent items in queue to archive.")
        return

    # Load existing archive and append
    archive = load_json(SENT_ARCHIVE_PATH)
    archive.extend(sent_items)
    save_json(SENT_ARCHIVE_PATH, archive)

    # Remove sent items from queue
    remaining = [item for item in queue if item.get("status") != "sent"]
    save_json(QUEUE_PATH, remaining)

    print(f"Archived {len(sent_items)} sent items.")
    print(f"Queue: {len(remaining)} items remaining.")
    print(f"Archive: {len(archive)} total items.")

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Manage the outreach email approval queue.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    # list
    sub.add_parser("list", help="Show all queued emails grouped by status")

    # show
    show_p = sub.add_parser("show", help="Show full details of a queue item")
    show_p.add_argument("id", help="Queue item ID (full or prefix)")

    # approve
    approve_p = sub.add_parser("approve", help="Approve a pending item (or 'all')")
    approve_p.add_argument("id", help="Queue item ID or 'all'")

    # reject
    reject_p = sub.add_parser("reject", help="Reject a pending/approved item")
    reject_p.add_argument("id", help="Queue item ID")
    reject_p.add_argument("--reason", "-r", default=None,
                          help="Reason for rejection")

    # send
    sub.add_parser("send", help="Send all approved emails")

    # stats
    sub.add_parser("stats", help="Show queue and sending statistics")

    # clear-sent
    sub.add_parser("clear-sent", help="Archive sent items from queue")

    args = parser.parse_args()
    commands = {
        "list": cmd_list,
        "show": cmd_show,
        "approve": cmd_approve,
        "reject": cmd_reject,
        "send": cmd_send,
        "stats": cmd_stats,
        "clear-sent": cmd_clear_sent,
    }
    fn = commands.get(args.command)
    if fn:
        fn(args)
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
