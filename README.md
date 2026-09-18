# Editing the DigiMind Lab website

Website: <https://digimindlab.ai>
Files: <https://github.com/malgaroli/malgaroli.github.io> (ask MM for access)

You edit files in your browser on GitHub. No installing, no code.

## How to edit any file

1. Click the file on GitHub.
2. Click the pencil icon (top right).
3. Make the change.
4. Click the green **Commit changes** button. That means *Save*.
5. Wait 2 minutes and refresh the website.

Nothing can break for good: every old version is kept under **History**.

## What do you want to do?

| Task | File |
| :--- | :--- |
| Add news | `content/_index.md` |
| Add or edit a team member | `content/people/<name>/index.md` |
| Edit a research area text | `content/research/<area>/index.md` |
| Approve or add papers | see [PUBLICATIONS.md](PUBLICATIONS.md) |

Anything else (design, new research areas, domain, automation): ask MM, or see
[MAINTAINERS.md](MAINTAINERS.md).

## Add news

Open `content/_index.md`. Under `news:` add a new block **at the top**:

```yaml
  - date: "October 2026"
    text: 'One sentence. Links look like [this](https://example.org).'
```

Keep the text inside single quotes. The homepage shows the newest 7; older
items move to the News page by themselves.

## Add a team member

1. Open an existing person, for example `content/people/julia/index.md`, and
   copy all of it.
2. Create `content/people/<firstname>/index.md` (lowercase). On GitHub:
   **Add file → Create new file**, type the path, paste, edit name, role and bio.
3. Upload a photo called `featured.jpg` into the same folder.
4. Commit.

To remove someone, delete their folder.

## Edit a research area text

Open `content/research/<area>/index.md`. Change the short summary next to
`excerpt:` or the long text below the `---` line. Leave the other lines alone.

## If something looks wrong

Open the file you changed, click **History**, open the previous version and
copy it back. Or ask MM.
