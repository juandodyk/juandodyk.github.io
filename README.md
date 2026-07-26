# Juan Dodyk’s website

This is a [Quarto](https://quarto.org/) website published with GitHub Pages. The editable source files live in the project root and in `posts/`; Quarto writes the finished website to `docs/`.

## The short version

From this directory:

```sh
quarto preview
```

opens a live local preview. Edit a source file, save it, and the preview will refresh.

When you are finished:

```sh
quarto render
node scripts/check-internal-links.mjs docs
```

Commit both the source changes and the regenerated `docs/` files. If GitHub Pages is still configured to publish from `main` and `/docs`, pushing to `main` publishes the update.

## What to edit

- `index.qmd`: homepage
- `research.qmd`: research page
- `teaching.qmd`: teaching page
- `notes.qmd`: notes index
- `posts/<date>-<slug>/index.qmd`: an individual note
- `theme.css`: typography, spacing, colors, and layout
- `_quarto.yml`: navigation and site-wide settings
- `files/`: PDFs, images, datasets, and other downloads

Do not edit files inside `docs/` directly. They are generated and will be overwritten the next time the site is rendered.

## Updating the CV

Replace `files/Juan_Dodyk_CV.pdf` with the new PDF, keeping the same filename, and render the site again.

The old path `files/cv.pdf` is a redirect directory containing a small `index.html`. Keep it in place: it sends people who find the obsolete Google result to the homepage, while its canonical and `noindex` tags help the obsolete result disappear from search. The custom `404.html` contains the same redirect as a fallback.

## Adding a note

Create a directory such as:

```text
posts/2026-07-26-example-title/
└── index.qmd
```

Use this basic structure:

```yaml
---
title: "Example title"
date: 2026-07-26
date-format: "MMMM D, YYYY"
---

Write the note here.
```

Then add the note to `notes.qmd` and run `quarto preview` or `quarto render`.

## Links

Use ordinary Markdown:

```markdown
[Research](research.qmd)
[An external source](https://example.com/)
```

Internal links stay in the current tab. External web links open in a new tab. The site-wide script in `_includes/link-behavior.html` also applies this rule to raw HTML links preserved in older posts.

## Historical Distill posts

The old Distill/R Markdown source is archived under `_archive/distill-posts/`. The active versions are Quarto pages in `posts/`.

Normally, edit the active `posts/.../index.qmd` file directly. Only run:

```sh
node scripts/migrate-legacy-posts.mjs
```

if you intentionally want to regenerate all migrated historical notes from the archive. That command overwrites their active Quarto files. Afterward, run `quarto render`.

## Publishing checklist

1. Run `quarto preview` and inspect the changed pages.
2. Run `quarto render`.
3. Run `node scripts/check-internal-links.mjs docs`.
4. Check `git status` and make sure there are no Dropbox “conflicted copy” files.
5. Commit the source files and `docs/`, then push to `main`.

Because this repository is stored in Dropbox, wait for Dropbox to finish syncing before a large render. Never commit files whose names contain `conflicted copy`.
