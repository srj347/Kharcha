import { listCategories } from '@/db/categories.repo';
import { recentNoteExamples } from '@/db/transactions.repo';

import { decideExtraction, fallbackOutcome } from './decide';
import type { CategoryHint, ExtractFn, ExtractionOutcome } from './extraction.types';

const HISTORY_EXAMPLES = 20;

export function categoryHints(): CategoryHint[] {
  return listCategories().map(({ id, name, description, keywords }) => ({ id, name, description, keywords }));
}

// One sentence in, one decision out. Any model failure becomes the confirm
// card with the sentence as the note, so the user never loses what they said.
export async function runExtraction(sentence: string, extract: ExtractFn): Promise<ExtractionOutcome> {
  const hints = categoryHints();
  try {
    const model = await extract(sentence, hints, recentNoteExamples(HISTORY_EXAMPLES));
    return decideExtraction(sentence, model, hints);
  } catch (error: unknown) {
    console.warn('[extract] model failed, falling back to the confirm card', error);
    return fallbackOutcome(sentence);
  }
}
