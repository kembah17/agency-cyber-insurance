#!/usr/bin/env python3
"""email_sender.py - Send outreach emails via Brevo SMTP.

Handles sending approved queue items, test emails, bounce tracking,
and config validation. Uses smtplib with retry logic and exponential backoff.

Usage:
    python email_sender.py send       # Send all approved queue items
    python email_sender.py test       # Send test email to verify config
    python email_sender.py bounce <email>  # Mark email as bounced
    python email_sender.py validate   # Validate config without sending
"""
from __future__ import annotations

import argparse
import fcntl
import json
import smtplib
import sys
import time
import uuid
from dataclasses import dataclass, field, asdict
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr, make_msgid
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

# ---------------------------------------------------------------------------
# Config validation
# ---------------------------------------------------------------------------

def validate_config(config: dict) -> bool:
    """Return True if Brevo SMTP config is usable (not placeholder)."""
    brevo = config.get("brevo", {})
    api_key = brevo.get("api_key", "")
    if not api_key or api_key == "YOUR_BREVO_API_KEY":
        print("ERROR: Brevo API key is not configured.")
        print(f"  Edit {CONFIG_PATH} and set brevo.api_key to your real key.")
        return False
    required = ["smtp_server", "smtp_port", "sender_email", "sender_name"]
    for key in required:
        if not brevo.get(key):
            print(f"ERROR: Missing brevo.{key} in config.")
            return False
    print("OK: Brevo SMTP config looks valid.")
    return True

# ---------------------------------------------------------------------------
# Email creation
# ---------------------------------------------------------------------------

def create_message(
    to_email: str,
    to_name: str,
    subject: str,
    body: str,
    config: dict,
) -> MIMEMultipart:
    """Build a MIMEMultipart email ready for sending."""
    brevo = config["brevo"]
    msg = MIMEMultipart("alternative")
    msg["From"] = formataddr((brevo["sender_name"], brevo["sender_email"]))
    msg["To"] = formataddr((to_name, to_email))
    msg["Subject"] = subject
    msg["Reply-To"] = brevo["sender_email"]
    msg["X-Mailer"] = "AgencyCyberInsurance Outreach"
    msg["Message-ID"] = make_msgid(domain=brevo["sender_email"].split("@")[-1])
    msg.attach(MIMEText(body, "plain", "utf-8"))
    return msg

# ---------------------------------------------------------------------------
# Email sending with retry
# ---------------------------------------------------------------------------

def send_email(
    to_email: str,
    to_name: str,
    subject: str,
    body: str,
    config: dict,
    max_retries: int = 3,
) -> bool:
    """Send one email via Brevo SMTP. Returns True on success."""
    brevo = config["brevo"]
    msg = create_message(to_email, to_name, subject, body, config)

    backoff = 2  # seconds
    for attempt in range(1, max_retries + 1):
        try:
            with smtplib.SMTP(brevo["smtp_server"], brevo["smtp_port"], timeout=30) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(brevo["sender_email"], brevo["api_key"])
                server.send_message(msg)
            print(f"  SENT → {to_email} (attempt {attempt})")
            return True
        except smtplib.SMTPRecipientsRefused as exc:
            print(f"  REJECTED by server for {to_email}: {exc}")
            return False  # no point retrying
        except (smtplib.SMTPException, OSError) as exc:
            print(f"  RETRY {attempt}/{max_retries} for {to_email}: {exc}")
            if attempt < max_retries:
                time.sleep(backoff)
                backoff *= 2
    print(f"  FAILED → {to_email} after {max_retries} attempts")
    return False

# ---------------------------------------------------------------------------
# Sent-log helpers
# ---------------------------------------------------------------------------

def log_sent(queue_item: dict, config: dict) -> None:
    """Append a record to sent_log.json from a queue item."""
    prospect = queue_item.get("prospect", {})
    email_data = queue_item.get("email", {})
    entry = {
        "id": str(uuid.uuid4()),
        "prospect_email": prospect.get("email", ""),
        "prospect_name": prospect.get("name", ""),
        "prospect_site": prospect.get("site", ""),
        "subject": email_data.get("subject", ""),
        "body": email_data.get("body", ""),
        "template_used": email_data.get("template_used", ""),
        "followup_number": queue_item.get("followup_number", 0),
        "sent_at": queue_item.get("sent_at", utcnow()),
        "status": "sent",
        "responded_at": None,
        "notes": "",
    }
    log = load_json(SENT_LOG_PATH)
    log.append(entry)
    save_json(SENT_LOG_PATH, log)


def handle_bounce(email_address: str) -> None:
    """Mark all sent_log entries for *email_address* as bounced."""
    log = load_json(SENT_LOG_PATH)
    found = 0
    for entry in log:
        if entry.get("prospect_email", "").lower() == email_address.lower():
            if entry.get("status") == "sent":
                entry["status"] = "bounced"
                entry["notes"] = f"Bounced detected {utcnow()}"
                found += 1
    if found:
        save_json(SENT_LOG_PATH, log)
        print(f"Marked {found} sent_log entries as bounced for {email_address}.")
    else:
        print(f"No sent entries found for {email_address}.")

# ---------------------------------------------------------------------------
# Batch send
# ---------------------------------------------------------------------------

def send_approved() -> dict[str, int]:
    """Send all approved queue items. Returns {sent, failed, skipped}."""
    config = load_config()
    if not validate_config(config):
        return {"sent": 0, "failed": 0, "skipped": 0}

    queue = load_json(QUEUE_PATH)
    approved = [item for item in queue if item.get("status") == "approved"]

    if not approved:
        print("No approved emails in queue.")
        return {"sent": 0, "failed": 0, "skipped": 0}

    stats = {"sent": 0, "failed": 0, "skipped": 0}
    batch_size = config.get("outreach", {}).get("batch_size", 10)
    batch = approved[:batch_size]

    print(f"Sending {len(batch)} of {len(approved)} approved emails (batch_size={batch_size})...")

    for item in batch:
        prospect = item.get("prospect", {})
        email_data = item.get("email", {})
        to_email = prospect.get("email", "")
        to_name = prospect.get("name", "")
        subject = email_data.get("subject", "")
        body = email_data.get("body", "")

        if not to_email or not subject or not body:
            print(f"  SKIP: Missing email/subject/body for item {item.get('id', '?')}")
            item["status"] = "failed"
            item["reject_reason"] = "Missing required email fields"
            stats["skipped"] += 1
            continue

        success = send_email(to_email, to_name, subject, body, config)
        if success:
            item["status"] = "sent"
            item["sent_at"] = utcnow()
            log_sent(item, config)
            stats["sent"] += 1
        else:
            item["status"] = "failed"
            stats["failed"] += 1

        # Small delay between sends to avoid rate limits
        time.sleep(1)

    save_json(QUEUE_PATH, queue)
    print(f"\nResults: {stats['sent']} sent, {stats['failed']} failed, {stats['skipped']} skipped")
    return stats

# ---------------------------------------------------------------------------
# Test email
# ---------------------------------------------------------------------------

def send_test() -> bool:
    """Send a test email to the configured sender address."""
    config = load_config()
    if not validate_config(config):
        return False

    brevo = config["brevo"]
    to_email = brevo["sender_email"]
    subject = "[TEST] AgencyCyberInsurance Outreach - Config Verified"
    body = (
        "This is a test email from the AgencyCyberInsurance outreach system.\n\n"
        f"Sent at: {utcnow()}\n"
        f"SMTP Server: {brevo['smtp_server']}:{brevo['smtp_port']}\n\n"
        "If you received this, your Brevo SMTP configuration is working correctly."
    )
    print(f"Sending test email to {to_email}...")
    return send_email(to_email, brevo["sender_name"], subject, body, config)

# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Send outreach emails via Brevo SMTP.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    sub = parser.add_subparsers(dest="command", required=True)

    sub.add_parser("send", help="Send all approved queue items")
    sub.add_parser("test", help="Send test email to verify config")
    sub.add_parser("validate", help="Validate config without sending")

    bounce_p = sub.add_parser("bounce", help="Mark an email as bounced")
    bounce_p.add_argument("email", help="Email address that bounced")

    args = parser.parse_args()

    if args.command == "send":
        send_approved()
    elif args.command == "test":
        ok = send_test()
        sys.exit(0 if ok else 1)
    elif args.command == "validate":
        ok = validate_config(load_config())
        sys.exit(0 if ok else 1)
    elif args.command == "bounce":
        handle_bounce(args.email)


if __name__ == "__main__":
    main()
