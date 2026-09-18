# Maintainer notes (technical)

Everyday editing is covered in [README.md](README.md) and
[PUBLICATIONS.md](PUBLICATIONS.md). This file is for whoever maintains the
site's structure. Site: Hugo (extended) with the vendored `hugo-apero` theme.

## Hosting

- Repository `malgaroli/malgaroli.github.io`, branch `main`.
- Deployed by `.github/workflows/deploy.yml` (GitHub Actions → GitHub Pages)
  on every push to `main`. Repository settings needed once: Pages source =
  GitHub Actions; Actions workflow permissions = Read and write, with "Allow
  GitHub Actions to create and approve pull requests".
- Domain `digimindlab.ai` (Namecheap). Lives in `static/CNAME` and in
  Settings → Pages → Custom domain, with Enforce HTTPS on. DNS at Namecheap:
  four A records for `@` to 185.199.108.153 / .109.153 / .110.153 / .111.153,
  one CNAME `www` → `malgaroli.github.io`. `malgaroli.github.io` redirects to
  the domain.
- Local preview: `hugo server` in the repo root (needs Hugo extended).

## Layout of the repo

| Path | What |
| :--- | :--- |
| `content/_index.md` | Homepage: intro (`description`), `hero_image`, `news`, `funders` |
| `content/research/<slug>/` | One research area per folder (see below) |
| `content/people/<name>/` | Team members; `orcid`/`joined`/`left` drive the sync |
| `content/publications/_index.md` | All papers as YAML; `ignore_dois` for the robot |
| `content/news/` | News archive page (reads the homepage `news` list) |
| `layouts/` | Project overrides: `index.html`, `_default/single.html`, `_default/news.html`, `partials/head.html` (favicons), `partials/meta.html`, `partials/footer.html` |
| `assets/scss/_custom.scss` | Palette (from `lab-logo-set/README.txt`), type sizes, header, tags |
| `static/img/` | Deployed logo, favicons, social card; `lab-logo-set/` holds the masters |
| `scripts/pubsync.py` | Weekly ORCID + Crossref sync and keyword tagger |

## Research areas are data-driven

A folder `content/research/<slug>/index.md` is a research area if its front
matter has `pub_filter: <slug>`. That page also carries:

- `weight` — order on `/research/` and of the tags (**higher first**);
- `pub_label` — short tag label (falls back to `title`);
- `pub_keywords` — lower-case phrases the robot matches against paper titles;
- `excerpt` — the 1–2 sentence card summary;
- `featured.svg` or `featured.jpg` — card image (one per folder).

`layouts/_default/single.html` builds the tag labels from these pages and
`scripts/pubsync.py` reads slugs, order and keywords from them, so adding or
removing an area is just adding or removing a folder. To give a new tag its own
colour add a `&.pub-tag-<slug>` line in `_custom.scss` (search `pub-tag-`);
otherwise it gets the neutral default.

## Publication sync

`.github/workflows/sync-publications.yml` runs Mondays 06:00 UTC:
`python scripts/pubsync.py --sync`, then opens a PR on branch `bot/pubsync`.
It skips peer-review records, publisher "(Preprint)" stubs, DOIs listed under
`ignore_dois:` in the publications front matter, and titles already present
under another DOI. It never deletes. `--backfill` re-tags without network.
Run on demand from the Actions tab.

## Conventions

- Commits are authored by Matteo only, no co-author trailers.
- No em dashes in site copy; keep descriptions free of filler adjectives.
- Base type is 18px (`html { font-size: 112.5% }`); everything else is in rem.
