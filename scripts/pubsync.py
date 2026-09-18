#!/usr/bin/env python3
"""
pubsync.py — keep content/publications/_index.md up to date, automatically.

Two jobs, both safe to re-run (idempotent):

  --backfill   Re-tag every existing publication with research-area
               categories, using a keyword classifier. Only ADDS tags
               (never removes a tag you set by hand). No network needed.
               The categories and their keywords come from the research
               pages themselves (content/research/*/index.md — see
               `pub_filter`, `pub_label`, `pub_keywords`, `weight`).

  --sync       Do the backfill AND pull any new papers from each team
               member's ORCID record (filtered to their time in the lab),
               look up clean metadata from Crossref, and append them.
               This is what the weekly GitHub Action runs; it then opens a
               pull request for a human to review before anything goes live.

The page layout groups publications by type and year on its own, so the
order entries sit in this file does not matter — new ones are appended.

Run from anywhere:  python scripts/pubsync.py --sync
Dependencies:       pip install -r scripts/requirements.txt
"""

from __future__ import annotations

import argparse
import re
import sys
import time
from pathlib import Path

try:
    import yaml
except ImportError:
    sys.exit("Missing dependency: pip install -r scripts/requirements.txt")

# requests is only needed for --sync (network). --backfill works without it.
try:
    import requests
except ImportError:
    requests = None

ROOT = Path(__file__).resolve().parent.parent
PUB_FILE = ROOT / "content" / "publications" / "_index.md"
PEOPLE_DIR = ROOT / "content" / "people"

# Crossref asks for a contact email in the User-Agent (politeness, not auth).
# Edit this to a real lab address whenever convenient.
CONTACT_EMAIL = "digimind-lab@nyulangone.org"

# ── Research topics (read from the site content, not hardcoded) ─────────────
# Every content/research/<slug>/index.md whose YAML front matter sets
# `pub_filter:` is a topic. That file also carries the tag's display label
# (`pub_label`), its order (`weight`, higher first — same as the /research/
# listing) and the keyword list the classifier uses (`pub_keywords`). So adding
# a research area is one new folder; this script and the templates follow.
RESEARCH_DIR = ROOT / "content" / "research"
RESEARCH_FM_RE = re.compile(r"^---\s*\n(.*?)\n---\s*(?:\n|$)", re.DOTALL)


def load_research_topics() -> list[dict]:
    """Discover topics from content/research/*/index.md, weight-desc order."""
    topics = []
    for idx in sorted(RESEARCH_DIR.glob("*/index.md")):
        text = idx.read_text(encoding="utf-8")
        m = RESEARCH_FM_RE.match(text)
        if not m:
            continue
        try:
            fm = yaml.safe_load(m.group(1)) or {}
        except yaml.YAMLError as exc:
            print(f"  ! skipping {idx.relative_to(ROOT)} (front matter YAML error: {exc})")
            continue
        slug = fm.get("pub_filter")
        if not slug or fm.get("draft"):
            continue
        kws = fm.get("pub_keywords") or []
        if isinstance(kws, str):
            kws = [kws]
        topics.append({
            "slug": str(slug).strip(),
            "label": fm.get("pub_label") or fm.get("title") or str(slug),
            "weight": int(fm.get("weight") or 0),
            "keywords": [str(k).strip().lower() for k in kws if str(k).strip()],
        })
    if not topics:
        sys.exit("No research topics found (need content/research/*/index.md "
                 "with a `pub_filter:` line).")
    topics.sort(key=lambda t: (-t["weight"], t["slug"]))
    return topics


TOPICS = load_research_topics()
CATEGORY_ORDER = [t["slug"] for t in TOPICS]            # canonical tag order
KEYWORDS = {t["slug"]: t["keywords"] for t in TOPICS}   # slug -> lowercase substrings
# Lower-cased substrings matched against "<title> <venue>". The weekly PR shows
# every suggested tag, so a human gets the final say.


def classify(title: str, venue: str = "") -> list[str]:
    """Return research-area slugs whose keywords appear in title/venue."""
    hay = f"{title or ''} {venue or ''}".lower()
    hits = [slug for slug, words in KEYWORDS.items()
            if any(w in hay for w in words)]
    return [c for c in CATEGORY_ORDER if c in hits]


def merge_cats(existing, classified) -> list[str]:
    """Union of hand-set and classified tags, in canonical order.

    Slugs that no longer match a research page are kept (appended, sorted)
    rather than silently dropped, so removing a topic folder never erases
    hand-set tags — they just stop rendering with a label until re-tagged.
    """
    have = set(existing or []) | set(classified or [])
    ordered = [c for c in CATEGORY_ORDER if c in have]
    return ordered + sorted(have - set(CATEGORY_ORDER))


# ── publications/_index.md surgery ───────────────────────────────────────────
FM_RE = re.compile(r"^---\n(.*?\n)---\n(.*)$", re.DOTALL)
CATS_RE = re.compile(r"(?m)^  categories:.*(?:\n  - .*)*")


def render_categories(cats: list[str]) -> str:
    if not cats:
        return "  categories: []"
    return "  categories:\n" + "\n".join(f"  - {c}" for c in cats)


def split_file(text: str):
    m = FM_RE.match(text)
    if not m:
        sys.exit("Could not parse front matter in publications/_index.md")
    return m.group(1), m.group(2)  # frontmatter, body


def split_pubs(frontmatter: str):
    parts = re.split(r"(?m)^publications:\n", frontmatter, maxsplit=1)
    if len(parts) != 2:
        sys.exit("Could not find the 'publications:' list.")
    head = parts[0] + "publications:\n"
    entries = re.split(r"(?m)(?=^- id:)", parts[1])
    return head, [e for e in entries if e.strip()]


def retag_entry(chunk: str) -> str:
    """Add classifier tags to one entry's YAML chunk, preserving formatting."""
    try:
        data = yaml.safe_load(chunk)
        pub = data[0] if isinstance(data, list) else data
    except Exception as exc:  # noqa: BLE001
        print(f"  ! skipped one entry (YAML parse error: {exc})")
        return chunk
    if not isinstance(pub, dict):
        return chunk
    new_cats = merge_cats(pub.get("categories"), classify(pub.get("title", ""),
                                                          pub.get("venue", "")))
    block = render_categories(new_cats)
    if CATS_RE.search(chunk):
        return CATS_RE.sub(lambda _m: block, chunk, count=1)
    # No categories key present — append one (keep trailing newline tidy).
    return chunk.rstrip("\n") + "\n" + block + "\n"


def load_file():
    text = PUB_FILE.read_text(encoding="utf-8")
    frontmatter, body = split_file(text)
    head, entries = split_pubs(frontmatter)
    return text, head, entries, body


def assemble(head, entries, body) -> str:
    frontmatter = head + "".join(entries)
    return f"---\n{frontmatter}---\n{body}"


def existing_dois(entries) -> set[str]:
    dois = set()
    for e in entries:
        m = re.search(r"(?m)^  doi:\s*(.+)$", e)
        if m:
            dois.add(m.group(1).strip().lower().rstrip(")"))
    return dois


def norm_title(title: str) -> str:
    """Lower-case letters+digits only, with '(preprint)' suffixes dropped, so
    the same paper on arXiv / medRxiv / SSRN and in a journal compares equal."""
    t = re.sub(r"\(\s*preprint\s*\)", "", (title or "").lower())
    return re.sub(r"[^a-z0-9]+", "", t)


def existing_titles(entries) -> set[str]:
    titles = set()
    for e in entries:
        try:
            data = yaml.safe_load(e)
            pub = data[0] if isinstance(data, list) else data
            titles.add(norm_title(pub.get("title", "")))
        except Exception:  # noqa: BLE001
            m = re.search(r"(?m)^  title:\s*(.+)$", e)
            if m:
                titles.add(norm_title(m.group(1).strip("'\"")))
    return titles


def ignored_dois(head: str) -> set[str]:
    """DOIs listed under `ignore_dois:` in the page front matter."""
    m = re.search(r"(?ms)^ignore_dois:\n((?:- .*\n)*)", head)
    if not m:
        return set()
    out = set()
    for line in m.group(1).splitlines():
        val = line[2:].split("#", 1)[0].strip().lower()
        if val:
            out.add(val)
    return out


# Records that are not papers (peer-review reports, publisher "(Preprint)"
# stubs) or that duplicate a paper already on the site are skipped.
JUNK_TITLE_RE = re.compile(r"^\s*(review|decision|recommendation|referee report)\s*:", re.I)
JUNK_TYPES = {"peer-review", "component", "dataset", "other"}


def existing_ids(entries) -> set[str]:
    ids = set()
    for e in entries:
        m = re.match(r"- id:\s*(.+)", e)
        if m:
            ids.add(m.group(1).strip())
    return ids


# ── ORCID + Crossref ingestion ───────────────────────────────────────────────
def read_people_orcids() -> list[dict]:
    people = []
    if not PEOPLE_DIR.exists():
        return people
    for idx in PEOPLE_DIR.glob("*/index.md"):
        txt = idx.read_text(encoding="utf-8")

        def field(name):
            m = re.search(rf"(?m)^{name}:\s*([0-9X\-]+)", txt)
            return m.group(1).strip() if m else None

        orcid = field("orcid")
        if not orcid:
            continue
        joined = field("joined")
        left = field("left")
        people.append({
            "orcid": orcid,
            "joined": int(joined) if joined and joined.isdigit() else None,
            "left": int(left) if left and left.isdigit() else None,
            "who": idx.parent.name,
        })
    return people


def http_get(url, accept="application/json"):
    headers = {
        "Accept": accept,
        "User-Agent": f"DigiMind-pubsync/1.0 (mailto:{CONTACT_EMAIL})",
    }
    for attempt in range(3):
        try:
            r = requests.get(url, headers=headers, timeout=30)
            if r.status_code == 200:
                return r.json()
            if r.status_code == 404:
                return None
        except Exception as exc:  # noqa: BLE001
            print(f"  ! request failed ({exc}); retrying")
        time.sleep(2 * (attempt + 1))
    return None


def orcid_dois(orcid: str) -> list[str]:
    data = http_get(f"https://pub.orcid.org/v3.0/{orcid}/works")
    if not data:
        return []
    dois = []
    for group in data.get("group", []):
        for ws in group.get("work-summary", []):
            for eid in (ws.get("external-ids") or {}).get("external-id", []):
                if eid.get("external-id-type") == "doi":
                    val = (eid.get("external-id-value") or "").strip().lower()
                    if val:
                        dois.append(val)
                    break
    return list(dict.fromkeys(dois))


def crossref_meta(doi: str) -> dict | None:
    data = http_get(f"https://api.crossref.org/works/{doi}")
    if not data:
        return None
    m = data.get("message", {})
    title = (m.get("title") or [""])[0]
    if not title:
        return None
    authors = []
    for a in m.get("author", []) or []:
        fam = a.get("family", "")
        giv = a.get("given", "")
        initials = " ".join(f"{p[0]}." for p in giv.replace(".", " ").split() if p)
        authors.append(f"{fam}, {initials}".strip().rstrip(","))
    year = None
    for key in ("published-print", "published-online", "issued", "created"):
        dp = (m.get(key) or {}).get("date-parts") or [[None]]
        if dp and dp[0] and dp[0][0]:
            year = dp[0][0]
            break
    venue = (m.get("container-title") or [""])[0]
    cr_type = m.get("type", "")
    if cr_type in JUNK_TYPES or JUNK_TITLE_RE.match(title) or "(preprint)" in title.lower():
        return {"skip": f"{cr_type or 'record'}: {title[:60]}"}
    ptype = "preprint" if cr_type in ("posted-content", "preprint") else "journal"
    return {
        "title": title, "authors": authors, "year": year,
        "venue": venue, "doi": doi, "url": f"https://doi.org/{doi}",
        "type": ptype,
    }


def make_id(meta: dict, used: set[str]) -> str:
    fam = (meta["authors"][0].split(",")[0] if meta["authors"] else "anon").lower()
    fam = re.sub(r"[^a-z]", "", fam) or "anon"
    words = re.sub(r"[^a-z0-9 ]", "", meta["title"].lower()).split()[:5]
    base = f"{fam}{meta.get('year','')}-" + "-".join(words)
    base = base[:60].rstrip("-")
    cand, n = base, 2
    while cand in used:
        cand = f"{base}-{n}"
        n += 1
    used.add(cand)
    return cand


def render_entry(meta: dict) -> str:
    entry = {
        "id": meta["id"],
        "title": meta["title"],
        "authors": meta["authors"] or [],
        "year": meta["year"],
        "venue": meta["venue"],
        "doi": meta["doi"],
        "url": meta["url"],
        "type": meta["type"],
        "categories": classify(meta["title"], meta["venue"]),
    }
    if not entry["categories"]:
        entry["categories"] = []
    dumped = yaml.safe_dump([entry], default_flow_style=False, sort_keys=False,
                            allow_unicode=True, width=10000)
    return dumped if dumped.endswith("\n") else dumped + "\n"


def sync(entries, head: str = "") -> list[str]:
    if requests is None:
        sys.exit("--sync needs 'requests': pip install -r scripts/requirements.txt")
    people = read_people_orcids()
    if not people:
        print("No team members have an 'orcid:' set — nothing to ingest.")
        return entries
    have_dois = existing_dois(entries)
    have_titles = existing_titles(entries)
    skip_dois = ignored_dois(head)
    used_ids = existing_ids(entries)
    added = 0
    for p in people:
        print(f"• ORCID {p['orcid']} ({p['who']})")
        for doi in orcid_dois(p["orcid"]):
            if doi in have_dois or doi.rstrip(")") in have_dois or doi in skip_dois:
                continue
            meta = crossref_meta(doi)
            if not meta:
                continue
            if meta.get("skip"):
                print(f"    - skipped {meta['skip']}")
                continue
            if not meta.get("year"):
                continue
            if norm_title(meta["title"]) in have_titles:
                print(f"    - already on the site under another DOI: {meta['title'][:60]}")
                continue
            yr = int(meta["year"])
            if p["joined"] and yr < p["joined"]:
                continue
            if p["left"] and yr > p["left"]:
                continue
            meta["id"] = make_id(meta, used_ids)
            entries.append(render_entry(meta))
            have_dois.add(doi)
            have_titles.add(norm_title(meta["title"]))
            added += 1
            print(f"    + {meta['id']} ({yr})")
    print(f"Added {added} new publication(s).")
    return entries


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    g = ap.add_mutually_exclusive_group(required=True)
    g.add_argument("--backfill", action="store_true",
                   help="Re-tag existing entries only (no network).")
    g.add_argument("--sync", action="store_true",
                   help="Backfill + pull new papers from ORCID/Crossref.")
    args = ap.parse_args()

    print("Research topics (from content/research/*/index.md):",
          ", ".join(CATEGORY_ORDER))
    _orig, head, entries, body = load_file()

    if args.sync:
        entries = sync(entries, head)

    entries = [retag_entry(e) for e in entries]

    out = assemble(head, entries, body)
    PUB_FILE.write_text(out, encoding="utf-8")
    print(f"Wrote {PUB_FILE.relative_to(ROOT)} ({len(entries)} entries).")


if __name__ == "__main__":
    main()
