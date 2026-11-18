// Builds the exact instructions text the app sends to the model, from the
// compiled app sources, for the default categories and no user history.
// Usage: node build-instructions.js <compiled dir> <output file>
const fs = require('fs');
const path = require('path');

const [, , compiledDir, outFile] = process.argv;
const { buildInstructions } = require(path.join(compiledDir, 'features/extract/prompt.js'));
const { DEFAULT_CATEGORIES } = require(path.join(compiledDir, 'db/default-categories.js'));

const hints = DEFAULT_CATEGORIES.map((category, index) => ({ id: String(index), ...category }));
fs.writeFileSync(outFile, buildInstructions(hints, []));
console.log('wrote', outFile);
