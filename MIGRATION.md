# Quarto migration notes

The active website is built from `_quarto.yml` and the root-level `.qmd` pages.
Run `quarto render` from the project root; output is written to `docs/`.

The historical notes are native Quarto pages under `posts/`:

- `_archive/distill-posts/` contains the retired R Markdown and Distill sources.
  Quarto excludes this underscore-prefixed archive from rendering.
- `scripts/migrate-legacy-posts.mjs` extracts the already-rendered article bodies
  from that archive into Quarto source pages. It does not rerun old R code.
- Quarto renders those pages with the same navigation, typography, and layout as
  the rest of the site while preserving their established `/posts/.../` URLs.

The `_legacy/` directory is retained only as a temporary migration snapshot and
is not used by the build.

Run `node scripts/check-internal-links.mjs docs` after rendering to verify local
links and resources.
