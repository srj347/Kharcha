import type { CategoryHint, NoteExample } from './extraction.types';

const MAX_KEYWORDS_PER_CATEGORY = 12;

// Fixed examples that teach Indian amount words and the note style. They use
// only default category names; examples for unknown names are dropped.
const FIXED_EXAMPLES: { sentence: string; json: string; needs: string[] }[] = [
  { sentence: 'spent 500 on swiggy', needs: ['Food'], json: '{"note":"Swiggy","amountRupees":500,"amountUnsure":false,"category":"Food","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'uber back home 240', needs: ['Travel'], json: '{"note":"Uber Home","amountRupees":240,"amountUnsure":false,"category":"Travel","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'paid 2k for electricity bill', needs: ['Bills'], json: '{"note":"Electricity Bill","amountRupees":2000,"amountUnsure":false,"category":"Bills","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'one and a half lakh for the bike', needs: ['Shopping'], json: '{"note":"Bike","amountRupees":150000,"amountUnsure":false,"category":"Shopping","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'five hundred rupees groceries from blinkit', needs: ['Groceries'], json: '{"note":"Blinkit","amountRupees":500,"amountUnsure":false,"category":"Groceries","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'chai 20', needs: ['Food'], json: '{"note":"Chai","amountRupees":20,"amountUnsure":false,"category":"Food","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'rs 1,299 myntra shoes', needs: ['Shopping'], json: '{"note":"Myntra Shoes","amountRupees":1299,"amountUnsure":false,"category":"Shopping","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'bought medicines', needs: ['Health'], json: '{"note":"Medicines","amountRupees":0,"amountUnsure":true,"category":"Health","categoryUnsure":false,"isExpense":true}' },
  { sentence: 'gave 300 to ramesh', needs: ['Other'], json: '{"note":"Ramesh","amountRupees":300,"amountUnsure":false,"category":"Other","categoryUnsure":true,"isExpense":true}' },
  { sentence: 'hey are you coming tonight', needs: ['Other'], json: '{"note":"","amountRupees":0,"amountUnsure":true,"category":"Other","categoryUnsure":true,"isExpense":false}' },
];

function describeCategory(category: CategoryHint): string {
  const keywords = category.keywords
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean)
    .slice(0, MAX_KEYWORDS_PER_CATEGORY);
  const description = category.description ? `: ${category.description}` : '';
  const examples = keywords.length > 0 ? ` (for example ${keywords.join(', ')})` : '';
  return `- ${category.name}${description}${examples}`;
}

export function buildInstructions(categories: CategoryHint[], history: NoteExample[]): string {
  const names = new Set(categories.map((category) => category.name));
  const examples = FIXED_EXAMPLES.filter((example) => example.needs.every((name) => names.has(name)));
  const userHistory = history.filter((item) => names.has(item.categoryName));

  const sections = [
    'You turn one short sentence, spoken by a user in India, into one expense record.',
    'Rules:',
    '- Amounts are Indian rupees. "k" means thousand. "lakh" means 100000. "crore" means 10000000. Read number words as numbers.',
    '- amountRupees is the amount spent, as a number. Use 0 and set amountUnsure to true when no amount is said.',
    '- category must be exactly one name from the category list.',
    "- Prefer the user's own past entries, then the category descriptions and examples.",
    '- note names the merchant, person or item in 1 to 4 words, in Title Case. Leave out the amount and words like spent, paid, bought, for, on.',
    '- Set categoryUnsure to true when no category clearly fits.',
    '- A merchant, item or person followed by a number (like "blinkit 650" or "chai 20") is an expense of that amount.',
    '- Set isExpense to false only when the sentence is not about spending money at all.',
    '',
    'Categories:',
    ...categories.map(describeCategory),
  ];

  if (userHistory.length > 0) {
    sections.push('', "The user's past entries (note → category):", ...userHistory.map((item) => `- ${item.note} → ${item.categoryName}`));
  }

  if (examples.length > 0) {
    sections.push('', 'Examples:', ...examples.map((example) => `Sentence: "${example.sentence}"\nRecord: ${example.json}`));
  }

  return sections.join('\n');
}

export function buildPrompt(sentence: string): string {
  return `Sentence: "${sentence.trim()}"\nRecord:`;
}
