#!/usr/bin/env python3
"""prospect_scanner.py — Scan for new backlink outreach opportunities.

Searches the web for guest-post openings, resource pages, HARO-style
platforms, and broken-link targets relevant to the AgencyCyberInsurance.com
niche.  Results are deduplicated against existing prospects and the
tracking.md contact list, scored, and persisted to data/prospects.json.

Usage:
    python prospect_scanner.py            # run all scan types
    python prospect_scanner.py --type haro # run a single scan type
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
from urllib.parse import quote_plus, urljoin, urlparse

# ---------------------------------------------------------------------------
# Dependency bootstrap
# ---------------------------------------------------------------------------
try:
    import requests
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "requests"])
    import requests

try:
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "beautifulsoup4"])
    from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
OUTREACH_DIR: Path = Path(__file__).resolve().parent.parent
DATA_DIR: Path = OUTREACH_DIR / "data"
PROSPECTS_PATH: Path = DATA_DIR / "prospects.json"
TRACKING_PATH: Path = OUTREACH_DIR / "tracking.md"
CONFIG_PATH: Path = OUTREACH_DIR / "config.json"

# ---------------------------------------------------------------------------
# Search queries
# ---------------------------------------------------------------------------
SEARCH_QUERIES: dict[str, list[str]] = {
    "haro": [
        "site:featured.com cyber insurance",
        "site:qwoted.com cybersecurity",
        "site:sourceofsources.com insurance",
        "journalist request cyber insurance 2026",
    ],
    "guest_post": [
        '"write for us" cyber insurance',
        '"guest post" cybersecurity agency',
        '"contribute" insurance technology blog',
        '"submit article" digital agency security',
    ],
    "resource_page": [
        '"cyber insurance resources" list',
        '"cybersecurity tools" resource page',
        '"digital agency" resources links insurance',
        'intitle:"resources" cyber liability insurance',
    ],
    "broken_link": [
        "cyber insurance comparison guide",
        "best cyber insurance providers list",
        "digital agency cybersecurity checklist",
    ],
}

# Prospect-type weights used by the scorer
TYPE_WEIGHTS: dict[str, int] = {
    "guest_post": 8,
    "resource_page": 6,
    "broken_link": 7,
    "haro": 9,
    "directory": 4,
    "community": 5,
}

# Relevance keywords that earn bonus points
RELEVANCE_KEYWORDS: list[str] = [
    "cyber insurance",
    "cyber liability",
    "cybersecurity",
    "digital agency",
    "insurance",
    "data breach",
    "risk management",
    "infosec",
    "security",
]

# User-Agent rotation pool
USER_AGENTS: list[str] = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
    "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0",
]

OWN_DOMAIN = "agencycyberinsurance.com"


# ---------------------------------------------------------------------------
# Dataclass
# ---------------------------------------------------------------------------
@dataclass
class Prospect:
    """A single backlink outreach prospect."""

    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    discovered: str = field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat()
    )
    name: str = ""
    email: str = ""
    site: str = ""
    site_name: str = ""
    type: str = ""
    da_estimate: int = 0
    relevance_score: int = 0
    notes: str = ""
    source_query: str = ""
    status: str = "new"

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
def load_config() -> dict:
    """Load outreach/config.json and return as dict."""
    with open(CONFIG_PATH) as f:
        return json.load(f)


# ---------------------------------------------------------------------------
# Existing data helpers
# ---------------------------------------------------------------------------
def load_existing_prospects() -> list[dict]:
    """Load the current prospects list from data/prospects.json.

    Returns an empty list when the file does not exist or is empty.
    """
    if not PROSPECTS_PATH.exists() or PROSPECTS_PATH.stat().st_size == 0:
        return []
    try:
        with open(PROSPECTS_PATH) as f:
            data = json.load(f)
        if isinstance(data, list):
            return data
        return []
    except (json.JSONDecodeError, OSError):
        return []


def load_tracking_contacts() -> set[str]:
    """Parse outreach/tracking.md and extract already-contacted emails and site domains.

    The tracking file contains Markdown tables with a *Contact* column that
    holds email addresses (e.g. ``blog@hubspot.com``) or placeholders like
    ``[find contact]``.  We extract every value that looks like a real email
    address **or** a domain from the *Target* column so we can skip them
    during deduplication.
    """
    contacts: set[str] = set()
    if not TRACKING_PATH.exists():
        return contacts

    try:
        text = TRACKING_PATH.read_text(encoding="utf-8")
    except OSError:
        return contacts

    # Regex for email addresses anywhere in the file
    email_pattern = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
    for match in email_pattern.finditer(text):
        contacts.add(match.group(0).lower().strip())

    # Also extract domains from the Target column (first data column after |#|)
    # Table rows look like: | 1 | HubSpot Blog | 93 | blog@hubspot.com | ...
    table_row_pattern = re.compile(
        r"^\|\s*\d+\s*\|\s*([^|]+?)\s*\|", re.MULTILINE
    )
    for match in table_row_pattern.finditer(text):
        target_name = match.group(1).strip()
        # Derive a likely domain from the target name
        slug = target_name.lower().replace(" ", "").replace("'", "")
        contacts.add(slug)  # e.g. "hubspotblog"

    return contacts


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------
def _get_session() -> requests.Session:
    """Return a requests.Session with a random User-Agent."""
    session = requests.Session()
    session.headers.update(
        {
            "User-Agent": random.choice(USER_AGENTS),
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate",
        }
    )
    return session


def _random_delay(low: float = 2.0, high: float = 5.0) -> None:
    """Sleep for a random interval to avoid rate-limiting."""
    time.sleep(random.uniform(low, high))


def _fetch_page(url: str, session: requests.Session | None = None, timeout: int = 15) -> str | None:
    """Fetch a URL and return the response text, or None on failure."""
    sess = session or _get_session()
    try:
        resp = sess.get(url, timeout=timeout, allow_redirects=True)
        resp.raise_for_status()
        return resp.text
    except requests.RequestException as exc:
        print(f"  [WARN] Failed to fetch {url}: {exc}")
        return None


def _google_search(query: str, session: requests.Session, num_results: int = 10) -> list[dict[str, str]]:
    """Perform a Google search and return a list of {url, title, snippet} dicts.

    Uses the standard Google search HTML page.  If Google blocks the
    request (HTTP 429 / CAPTCHA), an empty list is returned with a
    warning printed.
    """
    encoded = quote_plus(query)
    search_url = f"https://www.google.com/search?q={encoded}&num={num_results}&hl=en"
    html = _fetch_page(search_url, session=session, timeout=20)
    if html is None:
        return []

    # Detect CAPTCHA / block
    if "detected unusual traffic" in html.lower() or "captcha" in html.lower():
        print(f"  [WARN] Google CAPTCHA detected for query: {query}")
        return []

    soup = BeautifulSoup(html, "html.parser")
    results: list[dict[str, str]] = []

    # Google wraps organic results in <div class="g"> or similar containers
    for g_div in soup.select("div.g, div.tF2Cxc, div.yuRUbf"):
        link_tag = g_div.find("a", href=True)
        if not link_tag:
            continue
        href = link_tag["href"]
        if not href.startswith("http"):
            continue
        # Skip Google's own pages
        parsed = urlparse(href)
        if "google.com" in parsed.netloc:
            continue
        # Skip our own domain
        if OWN_DOMAIN in parsed.netloc:
            continue

        title_tag = g_div.find("h3")
        title = title_tag.get_text(strip=True) if title_tag else parsed.netloc

        snippet_tag = g_div.find("div", class_=re.compile(r"VwiC3b|IsZvec|s3v9rd"))
        snippet = snippet_tag.get_text(strip=True) if snippet_tag else ""

        results.append({"url": href, "title": title, "snippet": snippet})

    # Fallback: extract all <a> with href starting with http from the page
    if not results:
        seen: set[str] = set()
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            if not href.startswith("http"):
                continue
            parsed = urlparse(href)
            if "google.com" in parsed.netloc or OWN_DOMAIN in parsed.netloc:
                continue
            domain = parsed.netloc
            if domain in seen:
                continue
            seen.add(domain)
            results.append(
                {"url": href, "title": a_tag.get_text(strip=True) or domain, "snippet": ""}
            )
            if len(results) >= num_results:
                break

    return results


def _extract_domain(url: str) -> str:
    """Return the bare domain from a URL (no www prefix)."""
    try:
        netloc = urlparse(url).netloc.lower()
        if netloc.startswith("www."):
            netloc = netloc[4:]
        return netloc
    except Exception:
        return ""


def _extract_site_name(url: str, title: str = "") -> str:
    """Derive a human-friendly site name from a URL or page title."""
    if title:
        # Strip common suffixes
        for sep in (" | ", " - ", " — ", " – ", " :: "):
            if sep in title:
                parts = title.split(sep)
                return parts[-1].strip() if len(parts[-1].strip()) > 2 else parts[0].strip()
        return title[:80]
    domain = _extract_domain(url)
    return domain.split(".")[0].capitalize() if domain else "Unknown"


def _extract_email_from_page(html: str) -> str:
    """Try to find a contact email address in an HTML page."""
    if not html:
        return ""
    pattern = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
    matches = pattern.findall(html)
    # Filter out common non-contact addresses
    skip = {"example.com", "sentry.io", "schema.org", "w3.org", "wix.com", "wordpress.org"}
    for m in matches:
        domain = m.split("@")[1].lower()
        if domain not in skip and not domain.endswith(".png") and not domain.endswith(".jpg"):
            return m.lower()
    return ""


def _estimate_da(domain: str) -> int:
    """Return a rough Domain Authority estimate based on known domains.

    Without an API we use a static lookup for well-known sites and
    default to 30 for unknowns.
    """
    known: dict[str, int] = {
        "hubspot.com": 93, "searchenginejournal.com": 92,
        "contentmarketinginstitute.com": 89, "moz.com": 91,
        "socialmediaexaminer.com": 93, "wordstream.com": 88,
        "agencyanalytics.com": 72, "spp.co": 55,
        "darkreading.com": 88, "infosecurity-magazine.com": 78,
        "securityboulevard.com": 72, "scmagazine.com": 80,
        "cyberdefensemagazine.com": 65, "heimdalsecurity.com": 68,
        "insurancejournal.com": 75, "riskandinsurance.com": 65,
        "insurancethoughtleadership.com": 55, "propertycasualty360.com": 70,
        "businessinsurance.com": 72, "entrepreneur.com": 92,
        "featured.com": 60, "qwoted.com": 55,
        "producthunt.com": 90, "g2.com": 88, "capterra.com": 85,
        "reddit.com": 97, "linkedin.com": 98,
        "nist.gov": 94, "cisa.gov": 90, "sba.gov": 88, "ftc.gov": 92,
    }
    domain = domain.lower().lstrip("www.")
    if domain in known:
        return known[domain]
    # TLD-based heuristic
    if domain.endswith(".gov") or domain.endswith(".edu"):
        return 70
    return 30


# ---------------------------------------------------------------------------
# Scan functions
# ---------------------------------------------------------------------------
def scan_haro_alternatives(session: requests.Session) -> list[dict]:
    """Search for journalist-request platforms relevant to our niche.

    Targets: Featured.com, Qwoted, Source of Sources, Terkel.
    """
    print("\n[SCAN] HARO / journalist-request platforms...")
    prospects: list[dict] = []

    for query in SEARCH_QUERIES["haro"]:
        print(f"  Searching: {query}")
        results = _google_search(query, session)
        _random_delay()

        for r in results:
            domain = _extract_domain(r["url"])
            prospect = Prospect(
                name=_extract_site_name(r["url"], r["title"]),
                site=r["url"],
                site_name=r["title"] or domain,
                type="haro",
                da_estimate=_estimate_da(domain),
                notes=f"Found via HARO scan. Snippet: {r['snippet'][:200]}",
                source_query=query,
            )
            # Try to grab an email from the page
            page_html = _fetch_page(r["url"], session=session, timeout=10)
            if page_html:
                prospect.email = _extract_email_from_page(page_html)
            _random_delay(1.0, 2.5)
            prospects.append(prospect.to_dict())

    print(f"  Found {len(prospects)} HARO prospects")
    return prospects


def scan_guest_post_opportunities(session: requests.Session) -> list[dict]:
    """Search for 'write for us' and guest-post pages in our niche."""
    print("\n[SCAN] Guest post opportunities...")
    prospects: list[dict] = []

    for query in SEARCH_QUERIES["guest_post"]:
        print(f"  Searching: {query}")
        results = _google_search(query, session)
        _random_delay()

        for r in results:
            domain = _extract_domain(r["url"])
            prospect = Prospect(
                name=_extract_site_name(r["url"], r["title"]),
                site=r["url"],
                site_name=r["title"] or domain,
                type="guest_post",
                da_estimate=_estimate_da(domain),
                notes=f"Guest-post opportunity. Snippet: {r['snippet'][:200]}",
                source_query=query,
            )
            page_html = _fetch_page(r["url"], session=session, timeout=10)
            if page_html:
                prospect.email = _extract_email_from_page(page_html)
            _random_delay(1.0, 2.5)
            prospects.append(prospect.to_dict())

    print(f"  Found {len(prospects)} guest-post prospects")
    return prospects


def scan_resource_pages(session: requests.Session) -> list[dict]:
    """Search for resource / link pages that could include our content."""
    print("\n[SCAN] Resource pages...")
    prospects: list[dict] = []

    for query in SEARCH_QUERIES["resource_page"]:
        print(f"  Searching: {query}")
        results = _google_search(query, session)
        _random_delay()

        for r in results:
            domain = _extract_domain(r["url"])
            prospect = Prospect(
                name=_extract_site_name(r["url"], r["title"]),
                site=r["url"],
                site_name=r["title"] or domain,
                type="resource_page",
                da_estimate=_estimate_da(domain),
                notes=f"Resource page candidate. Snippet: {r['snippet'][:200]}",
                source_query=query,
            )
            page_html = _fetch_page(r["url"], session=session, timeout=10)
            if page_html:
                prospect.email = _extract_email_from_page(page_html)
                # Also store the resource page URL for the email template
                prospect.notes += f" | resource_url={r['url']}"
            _random_delay(1.0, 2.5)
            prospects.append(prospect.to_dict())

    print(f"  Found {len(prospects)} resource-page prospects")
    return prospects


def scan_broken_links(session: requests.Session) -> list[dict]:
    """Search for competitor / niche pages and check for broken outbound links."""
    print("\n[SCAN] Broken link opportunities...")
    prospects: list[dict] = []

    for query in SEARCH_QUERIES["broken_link"]:
        print(f"  Searching: {query}")
        results = _google_search(query, session)
        _random_delay()

        for r in results:
            domain = _extract_domain(r["url"])
            page_html = _fetch_page(r["url"], session=session, timeout=12)
            if not page_html:
                continue

            soup = BeautifulSoup(page_html, "html.parser")
            broken_urls: list[str] = []

            # Check outbound links on the page
            for a_tag in soup.find_all("a", href=True):
                href = a_tag["href"]
                # Only check absolute HTTP links
                if not href.startswith("http"):
                    continue
                link_domain = _extract_domain(href)
                # Skip same-domain links and our own domain
                if link_domain == domain or link_domain == OWN_DOMAIN:
                    continue
                # Skip common always-up domains
                skip_domains = {
                    "google.com", "facebook.com", "twitter.com", "linkedin.com",
                    "youtube.com", "github.com", "wikipedia.org", "amazon.com",
                }
                if link_domain in skip_domains:
                    continue

                # HEAD request to check if the link is broken
                try:
                    head_resp = session.head(href, timeout=8, allow_redirects=True)
                    if head_resp.status_code >= 400:
                        broken_urls.append(href)
                except requests.RequestException:
                    broken_urls.append(href)

                # Limit checks per page to avoid slowness
                if len(broken_urls) >= 3:
                    break
                _random_delay(0.5, 1.5)

            if broken_urls:
                contact_email = _extract_email_from_page(page_html)
                for broken_url in broken_urls:
                    prospect = Prospect(
                        name=_extract_site_name(r["url"], r["title"]),
                        email=contact_email,
                        site=r["url"],
                        site_name=r["title"] or domain,
                        type="broken_link",
                        da_estimate=_estimate_da(domain),
                        notes=f"Broken link found: {broken_url} on page {r['url']}",
                        source_query=query,
                    )
                    prospects.append(prospect.to_dict())

            _random_delay(1.5, 3.0)

    print(f"  Found {len(prospects)} broken-link prospects")
    return prospects


# ---------------------------------------------------------------------------
# Deduplication & scoring
# ---------------------------------------------------------------------------
def deduplicate(
    prospects: list[dict],
    existing_prospects: list[dict],
    tracking_contacts: set[str],
) -> list[dict]:
    """Remove prospects whose email or site domain already exists.

    Checks against:
    - existing_prospects (data/prospects.json)
    - tracking_contacts  (parsed from tracking.md)
    """
    # Build sets of known emails and domains
    known_emails: set[str] = set(tracking_contacts)  # already lowered
    known_domains: set[str] = set()

    for p in existing_prospects:
        if p.get("email"):
            known_emails.add(p["email"].lower().strip())
        if p.get("site"):
            known_domains.add(_extract_domain(p["site"]))

    # Also add domains derived from tracking contacts
    for c in tracking_contacts:
        if "@" in c:
            known_domains.add(c.split("@")[1].lower())

    unique: list[dict] = []
    seen_domains: set[str] = set()

    for p in prospects:
        email = (p.get("email") or "").lower().strip()
        domain = _extract_domain(p.get("site", ""))

        # Skip if email is already known
        if email and email in known_emails:
            continue
        # Skip if domain is already known
        if domain and domain in known_domains:
            continue
        # Skip duplicates within this batch
        if domain and domain in seen_domains:
            continue

        seen_domains.add(domain)
        if email:
            known_emails.add(email)
        unique.append(p)

    removed = len(prospects) - len(unique)
    if removed:
        print(f"  [DEDUP] Removed {removed} duplicate/known prospects")
    return unique


def score_prospect(prospect: dict) -> int:
    """Score a prospect from 1-10 based on type, DA, and relevance.

    Scoring formula:
    - Base score from prospect type weight (scaled to 1-10)
    - DA bonus: +1 if DA >= 50, +2 if DA >= 70
    - Relevance keyword bonus: +1 for each keyword found in
      notes/site_name/site (max +3)
    - Final score clamped to 1-10
    """
    ptype = prospect.get("type", "")
    base = TYPE_WEIGHTS.get(ptype, 5)

    # DA bonus
    da = prospect.get("da_estimate", 0)
    da_bonus = 0
    if da >= 70:
        da_bonus = 2
    elif da >= 50:
        da_bonus = 1

    # Relevance keyword bonus
    text_blob = " ".join(
        [
            prospect.get("notes", ""),
            prospect.get("site_name", ""),
            prospect.get("site", ""),
        ]
    ).lower()
    kw_hits = sum(1 for kw in RELEVANCE_KEYWORDS if kw in text_blob)
    kw_bonus = min(kw_hits, 3)

    score = base + da_bonus + kw_bonus
    return max(1, min(10, score))


# ---------------------------------------------------------------------------
# Persistence (with file locking)
# ---------------------------------------------------------------------------
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


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------
def main(scan_types: list[str] | None = None) -> None:
    """Run all (or selected) scans, deduplicate, score, and save."""
    config = load_config()
    daily_limit: int = config.get("outreach", {}).get("daily_scan_limit", 20)

    print("=" * 60)
    print("  PROSPECT SCANNER — AgencyCyberInsurance.com")
    print(f"  {datetime.now(timezone.utc).isoformat()}")
    print(f"  Daily limit: {daily_limit}")
    print("=" * 60)

    # Load existing data
    existing = load_existing_prospects()
    tracking = load_tracking_contacts()
    print(f"\nExisting prospects: {len(existing)}")
    print(f"Tracking contacts:  {len(tracking)}")

    session = _get_session()
    all_prospects: list[dict] = []

    # Determine which scans to run
    available_scans: dict[str, Any] = {
        "haro": scan_haro_alternatives,
        "guest_post": scan_guest_post_opportunities,
        "resource_page": scan_resource_pages,
        "broken_link": scan_broken_links,
    }

    types_to_run = scan_types if scan_types else list(available_scans.keys())

    for scan_type in types_to_run:
        if scan_type not in available_scans:
            print(f"  [WARN] Unknown scan type: {scan_type}, skipping")
            continue
        try:
            results = available_scans[scan_type](session)
            all_prospects.extend(results)
        except Exception as exc:
            print(f"  [ERROR] Scan '{scan_type}' failed: {exc}")
            continue

    if not all_prospects:
        print("\n[DONE] No new prospects found.")
        return

    # Deduplicate
    print(f"\nRaw prospects collected: {len(all_prospects)}")
    unique = deduplicate(all_prospects, existing, tracking)

    if not unique:
        print("[DONE] All prospects were duplicates. Nothing new to save.")
        return

    # Score and sort
    for p in unique:
        p["relevance_score"] = score_prospect(p)
    unique.sort(key=lambda p: p["relevance_score"], reverse=True)

    # Trim to daily limit
    to_save = unique[:daily_limit]
    print(f"\nAfter dedup & limit: {len(to_save)} prospects to save")

    # Print summary
    print("\n--- Top Prospects ---")
    for i, p in enumerate(to_save[:10], 1):
        print(
            f"  {i:2d}. [{p['relevance_score']:2d}/10] {p['type']:<15s} "
            f"DA:{p['da_estimate']:<3d} {_extract_domain(p['site'])}"
        )

    # Append to existing prospects (don't overwrite)
    combined = existing + to_save
    _save_json_locked(PROSPECTS_PATH, combined)
    print(f"\n[SAVED] {len(to_save)} new prospects → {PROSPECTS_PATH}")
    print(f"         Total prospects in file: {len(combined)}")
    print("\n[DONE] Scan complete.")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Scan for backlink outreach prospects"
    )
    parser.add_argument(
        "--type",
        choices=["haro", "guest_post", "resource_page", "broken_link"],
        nargs="+",
        default=None,
        help="Run only specific scan types (default: all)",
    )
    args = parser.parse_args()
    main(scan_types=args.type)
