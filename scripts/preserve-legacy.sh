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
fi
