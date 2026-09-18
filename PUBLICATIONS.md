# How publications work

Papers get onto the website two ways:

1. **Automatically** — a robot reads each lab member's **ORCID** record every
   Monday and proposes any new papers.
2. **By hand** — for the occasional paper the robot misses.

You mostly just **approve** what the robot finds. Here's how.

---

## Every Monday: approve the new papers (~2 minutes)

1. On GitHub, open the **Pull requests** tab.
2. Click **"Weekly ORCID publication sync."** (No pull request? Then there were
   no new papers this week — nothing to do.)
3. Click **Files changed** and skim the new papers and their colored tags.
4. If it looks right: **Merge pull request → Confirm merge.** The site updates
   in a couple of minutes.
5. If a paper is wrong or shouldn't be there: leave a comment for MM, or just
   close the pull request without merging.

The robot **never deletes** anything. Worst case it adds a duplicate or a typo,
which you can fix by hand (below).

It already skips peer-review reports, publisher "(Preprint)" stubs, and papers
whose title is already on the site under another DOI. If it keeps proposing a
paper that does not belong (for example a team member's work from before the
lab), add that DOI under `ignore_dois:` at the top of
`content/publications/_index.md` and it will never come back.

---

## The colored tags (research areas)

Every paper can be tagged with one or more research areas. The tags are
color-coded and decide which **Research Interests** page a paper shows up on.
There is one tag per folder in `content/research/`:

| Tag | Shown as | Research page |
| :--- | :--- | :--- |
| `nlp` | NLP & Language Markers | Language Markers & NLP for Mental Health Monitoring |
| `llms` | Language Models | Large Language Models for Mental Health Interventions |
| `human-ai` | Human–AI | AI–Human Interaction |
| `computational` | Computational | Computational Psychopathology (includes the former *Heterogeneity* papers) |
| `digital` | Digital Health | Digital Mental Health |

The robot guesses the tags for new papers by looking for the words listed
under `pub_keywords:` in each area's `index.md`. **You can change any of
them.** If a new research area is added (see the README), its tag exists
automatically.

**To re-tag a paper:**

1. Open `content/publications/_index.md`.
2. Search for the paper (by title or author).
3. Find its `categories:` line and edit the list:

   ```yaml
   categories:
   - llms
   - digital
   ```

   Valid tags are the ones in the table above (the `pub_filter` names in
   `content/research/*/index.md`). Empty means no tags: `categories: []`.
4. Commit.

---

## Add or fix a paper by hand

1. Open `content/publications/_index.md`.
2. Below `publications:` is a long list. Copy an entry that looks similar.
3. Paste it anywhere in the list and edit the fields:

   ```yaml
   - id: lastname2026-a-few-title-words
     title: The exact paper title.
     authors:
     - Last, F. M.
     - Malgaroli, M.
     year: 2026
     venue: Journal Name
     doi: 10.1234/example
     url: https://doi.org/10.1234/example
     type: journal        # or "preprint" for arXiv / OSF / bioRxiv
     categories:
     - llms
   ```

4. The `id:` must be unique (surname + year + a few title words works).
5. Commit. The page sorts papers by year on its own — order in the file doesn't
   matter.

To **delete or fix** a paper, find its block (from `- id:` down to the next
`- id:`) and edit or remove it. Commit.

---

## When someone joins or leaves the lab

For a new member's papers to sync automatically, add their **ORCID iD** to their
profile (`content/people/<name>/index.md`):

```yaml
orcid:  0000-0000-0000-0000
joined: 2025      # year they joined — only papers from this year on are added
left:             # fill in the year they leave; blank while they're here
```

- No ORCID? It's free at <https://orcid.org/register>.
- The PI keeps `orcid:` only (no `joined`/`left`), so all their papers count.

---

<details>
<summary><b>For the tech person — one-time setup (everyone else can ignore)</b></summary>

The automation lives in `scripts/pubsync.py` and two GitHub Actions:

- `.github/workflows/sync-publications.yml` — runs Mondays 06:00 UTC, pulls from
  ORCID + Crossref, auto-tags, and opens the review PR.
- `.github/workflows/deploy.yml` — builds the site and publishes to GitHub Pages.

Three settings make it work:

1. **Settings → Pages → Source = GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions →** enable *"Allow
   GitHub Actions to create and approve pull requests."*
3. Default branch is **`main`** (the deploy workflow watches `main`).

The research areas, their tag labels, order and keyword lists are read from
`content/research/*/index.md` (`pub_filter`, `pub_label`, `weight`,
`pub_keywords`) — there is nothing to configure in the script when an area is
added or removed.

Re-tag everything manually anytime: `python scripts/pubsync.py --backfill`.
Run a sync immediately: Actions tab → *Weekly publication sync* → *Run workflow*.
</details>
