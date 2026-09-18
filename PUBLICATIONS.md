# Papers on the website

A robot checks everyone's ORCID every Monday and proposes new papers. You just
approve them.

## Monday: approve new papers (2 minutes)

1. On GitHub, open **Pull requests**.
2. Open **"Weekly ORCID publication sync"**. No pull request means no new papers.
3. Click **Files changed** and skim the new entries.
4. Looks right? **Merge pull request → Confirm merge.**
5. A paper does not belong? Close the pull request and tell MM.

## Change a paper's research area

Every paper has tags that decide which research page it appears on:
`nlp`, `llms`, `human-ai`, `computational`, `digital`.

Open `content/publications/_index.md`, find the paper, and edit its list:

```yaml
  categories:
  - llms
  - digital
```

## Add a paper by hand

In the same file, copy an existing entry, paste it anywhere under
`publications:`, and change the fields:

```yaml
- id: lastname2026-short-title
  title: The paper title
  authors:
  - Last, F. M.
  - Malgaroli, M.
  year: 2026
  venue: Journal Name
  doi: 10.1234/example
  url: https://doi.org/10.1234/example
  type: journal        # or preprint
  categories:
  - llms
```

The page sorts by year on its own.

## New team member's papers

Add to their `content/people/<name>/index.md`:

```yaml
orcid: 0000-0000-0000-0000
joined: 2026
```

Only papers from that year on are added. Technical details are in
[MAINTAINERS.md](MAINTAINERS.md).
