#!/bin/sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname "$0")" && pwd)
project_dir=$(dirname "$script_dir")
output_dir="$project_dir/docs"

cp "$project_dir/.nojekyll" "$output_dir/.nojekyll"

sitemap="$output_dir/sitemap.xml"

if [ -f "$sitemap" ]; then
  sed 's#<loc>https://juandodyk.github.io/index.html</loc>#<loc>https://juandodyk.github.io/</loc>#' \
    "$sitemap" > "$output_dir/.sitemap-home.xml"
  mv "$output_dir/.sitemap-home.xml" "$sitemap"

  grep -Eo 'files/[^)]*\.pdf' "$project_dir/research.qmd" | sort -u |
    while IFS= read -r pdf_path; do
      pdf_url="https://juandodyk.github.io/$pdf_path"
      if ! grep -Fq "<loc>$pdf_url</loc>" "$sitemap"; then
        sed "s#</urlset>#  <url>\n    <loc>$pdf_url</loc>\n  </url>\n</urlset>#" \
          "$sitemap" > "$output_dir/.sitemap-paper.xml"
        mv "$output_dir/.sitemap-paper.xml" "$sitemap"
      fi
    done
fi

find "$output_dir" -type f -name '*.html' -exec sed -i '' 's#href="\./index\.html"#href="/"#g' {} +
