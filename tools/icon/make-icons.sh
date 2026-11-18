#!/bin/sh
# Regenerates assets/images/icon.png and splash-icon.png.
set -e
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/assets/images"
swift "$ROOT/tools/icon/make-icons.swift" "$OUT"
TMP="$(mktemp -d)"
sips -s format jpeg -s formatOptions 100 "$OUT/icon.png" --out "$TMP/icon.jpg" >/dev/null
sips -s format png "$TMP/icon.jpg" --out "$OUT/icon.png" >/dev/null
echo "icon alpha: $(sips -g hasAlpha "$OUT/icon.png" | tail -1)"
