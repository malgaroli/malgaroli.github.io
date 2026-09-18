# Updating the DigiMind Lab website

A quick guide for the lab. **No coding, no installing, no terminal.** If you can
edit a Google Doc, you can do this. Everything happens in your web browser on
GitHub.

---

## 3 rules

1. **You edit files on GitHub**, in the browser.
2. **Every change ends with the green "Commit changes" button.** That's just a
   fancy word for *Save*.
3. **Wait ~2 minutes, refresh the website.** Your change is live. Nothing can be
   permanently broken — every old version is saved and can be restored.

---

## I want to…

| I want to… | Open this file |
| :--- | :--- |
| Add a news item on the homepage | `content/_index.md` |
| Add / edit a team member | `content/people/<name>/index.md` |
| Edit a research-area description | `content/research/<area>/index.md` |
| Add a new research area | copy a folder in `content/research/` — see below |
| Change the volunteer / contact info | `content/researchers/_index.md` |
| Edit the participant studies | `content/participants/_index.md` |
| Add or tag a publication | see **[PUBLICATIONS.md](PUBLICATIONS.md)** |
| Approve the weekly new-papers update | see **[PUBLICATIONS.md](PUBLICATIONS.md)** |

---

## The only steps you ever need

1. On GitHub, click the file you want to change (use the table above).
2. Click the **pencil icon** (✏️) at the top right.
3. Make your edit.
4. Scroll down, click the green **Commit changes**.
5. Wait ~2 minutes, refresh the site.

That's it. Same five steps every time.

> If you see **"Create a pull request"** instead of a commit button, you don't
> have direct access yet — choose *"Create a new branch and start a pull
> request,"* and someone will approve it.

---

## Add a news item

1. Open `content/_index.md`.
2. In the top section (between the `---` lines), find `news:`.
3. Add a **new block at the top** of the list, matching the spacing exactly:

   ```yaml
   - date: "2026"
     text: 'Your one sentence. Use [words](https://link) for links and *text* for italics.'
   ```

4. Commit. Newest on top. Keep the 2-space indent, and wrap the text in
   'single quotes'. Avoid dashes in the text; use commas or a full stop.

The homepage shows the newest 7 items; the full list is at `/news/`
automatically. Nothing ever needs deleting.

---

## Add or edit a team member

Each person has a folder in `content/people/`. The easiest way to add someone is
to copy an existing person's folder.

1. Copy everything in `content/people/julia/index.md`.
2. Make a new file named `content/people/anna/index.md` (lowercase first name).
   On GitHub: *Add file → Create new file*, then type `anna/index.md` — the
   slash makes the folder for you.
3. Paste, then change the name, role, and bio. Leave the rest alone.
4. Upload a square photo named `featured.jpg` to the same folder.
5. Commit.

**Want their papers to appear automatically?** Add their ORCID — see
**[PUBLICATIONS.md](PUBLICATIONS.md)**.

To remove someone, delete their folder. Their past papers stay on the site.

---

## Edit a research-area description

1. Open `content/research/<area>/index.md` (e.g. `.../llms/index.md`).
2. Edit the paragraph **below** the `---` line.
3. **Don't touch the `pub_filter:` line** — that's what pulls the right papers
   onto the page by itself.
4. Commit.

The current areas are `nlp`, `llms`, `human-ai`, `computational`, `digital`.

---

## Add a new research area

Each area is one folder in `content/research/`. The website, the publication
tags, and the weekly paper robot all read the folder — nothing else to edit.

1. Copy an existing area's `index.md` (e.g. `content/research/digital/index.md`).
2. Create `content/research/<short-name>/index.md` (lowercase, hyphens, no
   spaces — this becomes the web address).
3. Change the top section:
   - `title:` — the heading visitors see.
   - `weight:` — position on the Research page. **Higher number = shown first.**
   - `pub_filter:` — the tag for this area. Use the same short name as the folder.
   - `pub_label:` — short name for the coloured tag (optional).
   - `pub_keywords:` — words the robot looks for in paper titles to suggest this
     tag (optional; you can always tag papers by hand).
4. Write the description below the `---` line.
5. Add a card image: either upload a photo named `featured.jpg` (any size;
   it's cropped square) or copy one of the existing `featured.svg`
   illustrations and recolour it. Keep only one `featured.*` file per folder.
6. Commit. Papers tagged with the new `pub_filter` appear on the page
   automatically — see **[PUBLICATIONS.md](PUBLICATIONS.md)** to tag them.

Optional: to give the new tag its own colour, ask MM to add one line to
`assets/scss/_custom.scss` (search for `pub-tag-`). Untinted tags still work.

To retire an area, delete its folder. Its papers keep their tag (it just stops
showing) until you re-tag them.

---

## The "Get involved" pages

Visitors who click **Contact** or **Get Involved** land on a page that asks if
they're a **participant** or a **researcher/volunteer**.

- **Volunteers & collaborators:** `content/researchers/_index.md`. The volunteer
  button points to a REDCap form — paste the form's link where it says
  `REDCAP_FORM_URL`.
- **Study participants:** `content/participants/_index.md`.

---

## Publications take care of themselves

A robot checks every lab member's publication record once a week and proposes
any new papers for you to approve. You don't add most papers by hand.

**This has its own short guide → [PUBLICATIONS.md](PUBLICATIONS.md).**

---

## Please don't touch

These run the site behind the scenes. If you think one needs changing, ask MM.

- `themes/`, `layouts/`, `assets/` — the design and templates
- `config.toml` — site-wide settings
- `scripts/`, `.github/` — the automation
- `lab-logo-set/` — the logo master files; `static/img/` — the copies the site
  actually uses (header mark, favicons, social-sharing image)

---

## One-time GitHub setup (tech person only)

Do this once after creating the repository, then forget about it:

1. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
2. **Settings → Actions → General → Workflow permissions:** choose *Read and
   write permissions* and tick *Allow GitHub Actions to create and approve pull
   requests* (needed for the weekly publication robot).
3. The default branch must be **`main`** (the deploy workflow watches it).
4. Push. The **Actions** tab shows "Deploy site to GitHub Pages" going green;
   the site address is under Settings → Pages.

To preview locally: install [Hugo](https://gohugo.io) (extended) and run
`hugo server` in this folder.

---

## If the site looks broken

- **Most common cause:** a typo in the **top section** of a file (the part
  between the two `---` lines). Open the file you last edited and check it.
- **Undo anything:** on the file's page, click **History**, open an earlier
  version, and copy its contents back in.
- **Still building?** Changes take 1–2 minutes. The **Actions** tab on GitHub
  shows a green check when the site has finished updating (red = something
  broke; click it to see what).

---

## 10-second glossary

- **Commit** = Save.
- **Pull request (PR)** = a suggested change waiting for a yes/no.
- **Merge** = saying yes to a pull request.

When in doubt: edit, commit, look at the site. If it looks wrong, edit again.
