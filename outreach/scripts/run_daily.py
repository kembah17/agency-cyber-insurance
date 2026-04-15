#!/usr/bin/env python3
"""run_daily.py \u2013 Orchestrate the full daily outreach pipeline.

Imports and calls functions from the other outreach scripts in sequence:
1. Prospect scanning
2. Email drafting
3. Follow-up queuing
4. Community content drafting (Monday or --community)
5. Digest generation

Each step is wrapped in its own try/except so a single failure never
blocks the rest of the pipeline.
"""
from __future__ import annotations

import argparse
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR = Path(__file__).resolve().parent.parent
SCRIPTS_DIR = OUTREACH_DIR / "scripts"

# Ensure the scripts directory is on sys.path so sibling imports work.
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _banner(step_num: int, description: str) -> None:
    """Print a step header."""
    print(f"\n{'=' * 60}")
    print(f"Step {step_num}: {description}")
    print(f"{'=' * 60}")


def _elapsed(start: float) -> str:
    """Return a human-readable elapsed time string."""
    secs = time.time() - start
    if secs < 60:
        return f"{secs:.1f}s"
    mins = int(secs // 60)
    remaining = secs - mins * 60
    return f"{mins}m {remaining:.1f}s"


def utcnow_str() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%d")


# ---------------------------------------------------------------------------
# Pipeline steps
# ---------------------------------------------------------------------------

def step_scan_prospects(verbose: bool = False, dry_run: bool = False) -> int:
    """Step 1: Run prospect scanner to find new opportunities."""
    _banner(1, "Prospect Scanning")
    t0 = time.time()
    count = 0
    try:
        import prospect_scanner  # type: ignore[import-untyped]
        if dry_run:
            print("  [DRY RUN] Would scan for new prospects.")
        else:
            prospect_scanner.main()
            # Count new prospects (rough: read file and count 'new' status)
            from prospect_scanner import load_existing_prospects
            prospects = load_existing_prospects()
            count = sum(1 for p in prospects if p.get("status") == "new")
            if verbose:
                print(f"  Total prospects with status=new: {count}")
    except Exception as exc:
        print(f"  \u274c Error in prospect scanning: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return count


def step_draft_emails(verbose: bool = False, dry_run: bool = False) -> int:
    """Step 2: Draft emails for top prospects."""
    _banner(2, "Email Drafting")
    t0 = time.time()
    count = 0
    try:
        import email_drafter  # type: ignore[import-untyped]
        if dry_run:
            print("  [DRY RUN] Would draft emails for new prospects.")
        else:
            count = email_drafter.batch_draft()
            if verbose:
                print(f"  Emails drafted: {count}")
    except Exception as exc:
        print(f"  \u274c Error in email drafting: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return count


def step_queue_followups(verbose: bool = False, dry_run: bool = False) -> int:
    """Step 3: Check for due follow-ups and queue them."""
    _banner(3, "Follow-up Queuing")
    t0 = time.time()
    count = 0
    try:
        import followup_tracker  # type: ignore[import-untyped]
        if dry_run:
            due = followup_tracker.check_due_followups()
            print(f"  [DRY RUN] Would queue {len(due)} follow-ups.")
            count = len(due)
        else:
            count = followup_tracker.queue_followups()
            if verbose:
                print(f"  Follow-ups queued: {count}")
    except Exception as exc:
        print(f"  \u274c Error in follow-up queuing: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return count


def step_community_drafts(
    verbose: bool = False,
    dry_run: bool = False,
    limit: int = 5,
) -> int:
    """Step 4: Draft community engagement content."""
    _banner(4, "Community Content Drafting")
    t0 = time.time()
    count = 0
    try:
        import community_drafter  # type: ignore[import-untyped]

        if dry_run:
            print("  [DRY RUN] Would draft community content.")
            print(f"  Scanning Reddit for threads\u2026")
            threads = community_drafter.scan_reddit_threads()
            topics = community_drafter.scan_linkedin_topics()
            count = min(limit, len(threads) + len(topics))
            print(f"  Would create ~{count} drafts.")
        else:
            # Build a minimal argparse Namespace to reuse main() logic
            # Instead, call the component functions directly for control.
            print("  Scanning Reddit\u2026")
            threads = community_drafter.scan_reddit_threads()
            print("  Generating LinkedIn topics\u2026")
            topics = community_drafter.scan_linkedin_topics()

            drafts: list[dict] = []
            reddit_limit = max(1, limit // 2)
            linkedin_limit = max(1, limit - reddit_limit)

            for thread in threads[:reddit_limit]:
                draft = community_drafter.draft_reddit_comment(thread)
                drafts.append(draft)

            for topic in topics[:linkedin_limit]:
                draft = community_drafter.draft_linkedin_post(topic)
                drafts.append(draft)

            if drafts:
                community_drafter.save_drafts(drafts)
            count = len(drafts)
            if verbose:
                print(f"  Community drafts created: {count}")
    except Exception as exc:
        print(f"  \u274c Error in community drafting: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return count


def step_generate_digest(
    verbose: bool = False,
    dry_run: bool = False,
    email_digest: bool = False,
) -> str:
    """Step 5: Generate and save the daily digest report."""
    _banner(5, "Digest Generation")
    t0 = time.time()
    digest_path = ""
    try:
        import digest_generator  # type: ignore[import-untyped]

        date_str = utcnow_str()
        if dry_run:
            print(f"  [DRY RUN] Would generate digest for {date_str}.")
            digest_path = f"reports/digest_{date_str}.md"
        else:
            report = digest_generator.generate_digest(target_date=date_str)
            path = digest_generator.save_digest(report, target_date=date_str)
            digest_path = str(path.relative_to(OUTREACH_DIR))
            if verbose:
                print(f"  Digest saved: {digest_path}")

            if email_digest:
                config = digest_generator.load_config()
                digest_generator.email_digest(report, config)
    except Exception as exc:
        print(f"  \u274c Error in digest generation: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return digest_path


def step_send_approved(verbose: bool = False, dry_run: bool = False) -> dict:
    """Optional: Send all approved emails."""
    _banner(6, "Sending Approved Emails")
    t0 = time.time()
    result: dict[str, int] = {"sent": 0, "failed": 0, "skipped": 0}
    try:
        import email_sender  # type: ignore[import-untyped]
        if dry_run:
            # Count approved items
            import json
            queue_path = OUTREACH_DIR / "data" / "queue.json"
            if queue_path.exists():
                with open(queue_path) as f:
                    queue = json.load(f)
                approved = sum(1 for q in queue if q.get("status") == "approved")
                print(f"  [DRY RUN] Would send {approved} approved emails.")
            else:
                print("  [DRY RUN] No queue file found.")
        else:
            result = email_sender.send_approved()
            if verbose:
                print(f"  Results: {result}")
    except Exception as exc:
        print(f"  \u274c Error sending emails: {exc}")
    print(f"  \u23f1 Completed in {_elapsed(t0)}")
    return result


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    parser = argparse.ArgumentParser(
        description="Run the daily outreach pipeline.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=(
            "Examples:\n"
            "  python scripts/run_daily.py --full          # full pipeline\n"
            "  python scripts/run_daily.py --scan-only     # just scan prospects\n"
            "  python scripts/run_daily.py --digest-only   # just generate digest\n"
            "  python scripts/run_daily.py --full --send   # full pipeline + send\n"
            "  python scripts/run_daily.py --full --dry-run # preview without changes\n"
        ),
    )
    parser.add_argument(
        "--scan-only", action="store_true",
        help="Just scan for prospects, don't draft or send",
    )
    parser.add_argument(
        "--digest-only", action="store_true",
        help="Just generate the daily digest",
    )
    parser.add_argument(
        "--send", action="store_true",
        help="Send all approved emails after pipeline",
    )
    parser.add_argument(
        "--full", action="store_true",
        help="Run the complete pipeline (steps 1-5)",
    )
    parser.add_argument(
        "--community", action="store_true",
        help="Include community drafts regardless of day of week",
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Show what would happen without making changes",
    )
    parser.add_argument(
        "--verbose", action="store_true",
        help="Detailed output for each step",
    )
    args = parser.parse_args()

    # Default to --full if no mode specified
    if not (args.scan_only or args.digest_only or args.full or args.send):
        args.full = True

    date_str = utcnow_str()
    pipeline_start = time.time()

    print("=" * 60)
    print(f"Daily Outreach Pipeline \u2014 {date_str}")
    if args.dry_run:
        print("\u26a0  DRY RUN MODE \u2014 no changes will be made")
    print("=" * 60)

    # Track results for summary
    prospects_found = 0
    emails_drafted = 0
    followups_queued = 0
    community_count = 0
    digest_path = ""
    send_result: dict[str, int] = {}
    community_skipped = False

    # --- Step 1: Prospect scanning ---
    if args.full or args.scan_only:
        prospects_found = step_scan_prospects(
            verbose=args.verbose, dry_run=args.dry_run,
        )

    # --- Step 2: Email drafting ---
    if args.full and not args.scan_only:
        emails_drafted = step_draft_emails(
            verbose=args.verbose, dry_run=args.dry_run,
        )

    # --- Step 3: Follow-up queuing ---
    if args.full and not args.scan_only:
        followups_queued = step_queue_followups(
            verbose=args.verbose, dry_run=args.dry_run,
        )

    # --- Step 4: Community drafts (Monday or --community) ---
    if args.full and not args.scan_only:
        today_weekday = datetime.now(timezone.utc).weekday()  # 0=Monday
        if args.community or today_weekday == 0:
            community_count = step_community_drafts(
                verbose=args.verbose, dry_run=args.dry_run,
            )
        else:
            community_skipped = True
            if args.verbose:
                print(f"\n{'=' * 60}")
                print("Step 4: Community Content Drafting")
                print(f"{'=' * 60}")
                print("  \u23ed Skipped (not Monday; use --community to override)")

    # --- Step 5: Digest generation ---
    if args.full or args.digest_only:
        digest_path = step_generate_digest(
            verbose=args.verbose, dry_run=args.dry_run,
        )

    # --- Optional Step 6: Send approved ---
    if args.send:
        send_result = step_send_approved(
            verbose=args.verbose, dry_run=args.dry_run,
        )

    # --- Final summary ---
    total_time = _elapsed(pipeline_start)
    print(f"\n{'=' * 60}")
    print(f"Daily Pipeline Summary \u2014 {date_str}")
    print(f"{'=' * 60}")

    if args.full or args.scan_only:
        print(f"\u2705 Prospects scanned: {prospects_found} new found")
    if args.full and not args.scan_only:
        print(f"\u2705 Emails drafted: {emails_drafted} added to queue")
        print(f"\u2705 Follow-ups queued: {followups_queued} due")
        if community_skipped:
            print(f"\u23ed\ufe0f  Community drafts: Skipped (not Monday)")
        else:
            print(f"\u2705 Community drafts: {community_count} created")
    if args.full or args.digest_only:
        print(f"\u2705 Digest saved: {digest_path}")
    if args.send:
        sent = send_result.get("sent", 0)
        failed = send_result.get("failed", 0)
        print(f"\u2705 Emails sent: {sent} sent, {failed} failed")

    print(f"\n\u23f1 Total pipeline time: {total_time}")
    print("\nNext steps:")
    print("  \u2192 Review pending emails: python scripts/queue_manager.py list")
    print("  \u2192 Approve and send: python scripts/queue_manager.py approve all")
    print("  \u2192 Send approved: python scripts/queue_manager.py send")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
