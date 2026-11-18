#!/bin/sh
# Checks prompt accuracy on this Mac's on-device Apple model.
# Needs macOS 26+ with Apple Intelligence turned on.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../.." && pwd)"
OUT="$(mktemp -d)"

# Compile only the two pure modules the prompt needs.
npx --prefix "$ROOT" tsc "$ROOT/src/features/extract/prompt.ts" "$ROOT/src/db/default-categories.ts" \
  --outDir "$OUT/compiled" --rootDir "$ROOT/src" --module commonjs --target es2020 --skipLibCheck --ignoreConfig
node "$HERE/build-instructions.js" "$OUT/compiled" "$HERE/instructions.txt"

# Run through the Swift interpreter: a compiled binary is refused model access.
swift "$HERE/Eval.swift" "$HERE" 2>&1 | grep -v -e "warning:" -e "^ *[0-9]* |" -e "^ *|" -e "DeprecatedDeclaration"
