#!/bin/sh
# Validate, rebuild the audio manifest + service worker, and zip the site for hosting.
set -e
cd "$(dirname "$0")/.."
for f in js/*.js js/*/*.js; do node --check "$f"; done
node tools/check_maps.mjs | tail -1
node tools/check_art.mjs | tail -1
node tools/build_manifest.mjs
node tools/build_sw.mjs
rm -f ../kanamon-site.zip
zip -qr ../kanamon-site.zip index.html manifest.webmanifest sw.js README.md css js icons audio $( [ -d img ] && echo img ) -x '*.DS_Store'
echo "wrote $(cd .. && pwd)/kanamon-site.zip ($(du -h ../kanamon-site.zip | cut -f1))"
