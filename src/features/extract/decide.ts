import { MAX_AMOUNT_PAISE, rupeesToPaise } from '@/shared/utils/money';

import {
  ExtractionDecision,
  type CategoryHint,
  type ExtractionOutcome,
  type ModelExtraction,
} from './extraction.types';

const MAX_NOTE_LENGTH = 60;

// A guard against a model that invents an amount: the sentence itself must
// contain a digit or a number word.
const NUMBER_WORDS =
  /\b(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|lakh|lakhs|crore|half|k)\b/i;

export function sentenceHasNumber(sentence: string): boolean {
  return /\d/.test(sentence) || NUMBER_WORDS.test(sentence);
}

function cleanNote(note: string): string {
  return note.replace(/\s+/g, ' ').trim().slice(0, MAX_NOTE_LENGTH);
}

// Turns the model's answer into a draft and decides what the app does next.
// Only a fully clear answer is saved without a tap.
export function decideExtraction(sentence: string, model: ModelExtraction, categories: CategoryHint[]): ExtractionOutcome {
  const category = categories.find((item) => item.name.toLowerCase() === model.category.trim().toLowerCase()) ?? null;
  const paise = Number.isFinite(model.amountRupees) ? rupeesToPaise(model.amountRupees) : 0;
  const amountPaise = paise > 0 && paise <= MAX_AMOUNT_PAISE ? paise : null;

  const draft = {
    amountPaise,
    categoryId: category?.id ?? null,
    note: cleanNote(model.note),
    rawText: sentence.trim(),
  };

  if (!model.isExpense) {
    return { decision: ExtractionDecision.Ignore, draft };
  }

  const clear =
    amountPaise !== null &&
    category !== null &&
    !model.amountUnsure &&
    !model.categoryUnsure &&
    sentenceHasNumber(sentence);

  return { decision: clear ? ExtractionDecision.AutoSave : ExtractionDecision.Confirm, draft };
}

// When the model is not available, the transcript still becomes a draft the
// user can finish on the confirm card.
export function fallbackOutcome(sentence: string): ExtractionOutcome {
  return {
    decision: ExtractionDecision.Confirm,
    draft: { amountPaise: null, categoryId: null, note: cleanNote(sentence), rawText: sentence.trim() },
  };
}
