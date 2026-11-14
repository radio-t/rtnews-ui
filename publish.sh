#!/bin/sh
# copies the build into the directory nginx serves. every file lands by rename from a staging dir on
# the same filesystem and index.html goes last, so nginx never reads a partly written file. old and
# new bundles can still mix for a request that spans the switch.
set -eu

src=/srv/webapp
dst=/target
stage="$dst/.publish"
list=/tmp/publish.list

rm -rf "$stage"
mkdir -p "$stage"
cp -a "$src/." "$stage/"
cd "$stage"

find . -mindepth 1 -type d > "$list"
while IFS= read -r d; do mkdir -p "$dst/$d"; done < "$list"

find . -type f ! -path ./index.html > "$list"
while IFS= read -r f; do mv -f "$f" "$dst/$f"; done < "$list"

mv -f index.html "$dst/index.html"
cd /
rm -rf "$stage"
