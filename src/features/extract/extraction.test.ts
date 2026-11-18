/**
 * @jest-environment node
 */
import { listCategories } from '@/db/categories.repo';
import { openMemoryDatabase } from '@/db/testing/memory-db';
import { addTransaction } from '@/db/transactions.repo';
import { TransactionSource } from '@/db/types';

import { decideExtraction, sentenceHasNumber } from './decide';
import { ExtractionDecision, type ExtractFn, type ModelExtraction } from './extraction.types';
import { buildInstructions, buildPrompt } from './prompt';
import { runExtraction } from './run-extraction';

function model(overrides: Partial<ModelExtraction> = {}): ModelExtraction {
  return { isExpense: true, amountRupees: 500, category: 'Food', note: 'Swiggy', amountUnsure: false, categoryUnsure: false, ...overrides };
}

const hints = [
  { id: 'food', name: 'Food', description: 'restaurants', keywords: 'swiggy,zomato' },
  { id: 'travel', name: 'Travel', description: 'cabs', keywords: 'uber' },
];

describe('decideExtraction', () => {
  it('auto-saves a clear answer', () => {
    const outcome = decideExtraction('spent 500 on swiggy', model(), hints);
    expect(outcome).toEqual({
      decision: ExtractionDecision.AutoSave,
      draft: { amountPaise: 50000, categoryId: 'food', note: 'Swiggy', rawText: 'spent 500 on swiggy' },
    });
  });

  it('matches the category name without case', () => {
    expect(decideExtraction('uber 240', model({ category: 'travel' }), hints).draft.categoryId).toBe('travel');
  });

  it('asks when the model is unsure of the amount or category', () => {
    expect(decideExtraction('bought medicines', model({ amountUnsure: true }), hints).decision).toBe(ExtractionDecision.Confirm);
    expect(decideExtraction('gave 300 to ramesh', model({ categoryUnsure: true }), hints).decision).toBe(ExtractionDecision.Confirm);
  });

  it('asks when the sentence has no number, even if the model invents one', () => {
    const outcome = decideExtraction('bought medicines', model({ amountRupees: 200 }), hints);
    expect(outcome.decision).toBe(ExtractionDecision.Confirm);
    expect(outcome.draft.amountPaise).toBe(20000);
  });

  it('asks when the amount is zero or the category is unknown', () => {
    expect(decideExtraction('spent 0', model({ amountRupees: 0 }), hints).decision).toBe(ExtractionDecision.Confirm);
    expect(decideExtraction('spent 500', model({ category: 'Pets' }), hints)).toMatchObject({
      decision: ExtractionDecision.Confirm,
      draft: { categoryId: null },
    });
  });

  it('ignores sentences that are not expenses', () => {
    expect(decideExtraction('are you coming tonight', model({ isExpense: false }), hints).decision).toBe(ExtractionDecision.Ignore);
  });

  it('keeps paise and trims long notes', () => {
    const outcome = decideExtraction('chai 12.5', model({ amountRupees: 12.5, note: `  ${'x'.repeat(80)} ` }), hints);
    expect(outcome.draft.amountPaise).toBe(1250);
    expect(outcome.draft.note).toHaveLength(60);
  });
});

describe('sentenceHasNumber', () => {
  it.each(['spent 500', 'five hundred on lunch', '2k on shoes', 'one and a half lakh', 'rs 1,299'])('finds a number in %p', (text) => {
    expect(sentenceHasNumber(text)).toBe(true);
  });

  it.each(['bought medicines', 'swiggy order', 'kick off'])('finds no number in %p', (text) => {
    expect(sentenceHasNumber(text)).toBe(false);
  });
});

describe('prompt', () => {
  it('lists every category with its description and keywords', () => {
    const text = buildInstructions(hints, []);
    expect(text).toContain('- Food: restaurants (for example swiggy, zomato)');
    expect(text).toContain('- Travel: cabs (for example uber)');
  });

  it('adds user history only for categories that still exist', () => {
    const text = buildInstructions(hints, [
      { note: 'Rapido', categoryName: 'Travel' },
      { note: 'Vet', categoryName: 'Pets' },
    ]);
    expect(text).toContain('- Rapido → Travel');
    expect(text).not.toContain('Vet');
  });

  it('keeps only examples whose categories exist', () => {
    const text = buildInstructions(hints, []);
    expect(text).toContain('spent 500 on swiggy');
    expect(text).not.toContain('electricity bill');
  });

  it('wraps the sentence', () => {
    expect(buildPrompt('  chai 20 ')).toBe('Sentence: "chai 20"\nRecord:');
  });
});

describe('runExtraction', () => {
  beforeEach(() => {
    openMemoryDatabase();
  });

  it('passes real categories and user history to the model', async () => {
    const food = listCategories().find((category) => category.name === 'Food');
    addTransaction({ amountPaise: 100, categoryId: food?.id ?? '', note: 'Swiggy', source: TransactionSource.Manual });
    const extract = jest.fn<ReturnType<ExtractFn>, Parameters<ExtractFn>>().mockResolvedValue(model());

    const outcome = await runExtraction('spent 500 on swiggy', extract);

    const [, passedHints, passedExamples] = extract.mock.calls[0];
    expect(passedHints.map((hint) => hint.name)).toContain('Groceries');
    expect(passedExamples).toEqual([{ note: 'Swiggy', categoryName: 'Food' }]);
    expect(outcome.decision).toBe(ExtractionDecision.AutoSave);
    expect(outcome.draft.categoryId).toBe(food?.id);
  });

  it('falls back to the confirm card when the model fails', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const outcome = await runExtraction('spent 500 on swiggy', () => Promise.reject(new Error('Generation error')));
    expect(outcome).toEqual({
      decision: ExtractionDecision.Confirm,
      draft: { amountPaise: null, categoryId: null, note: 'spent 500 on swiggy', rawText: 'spent 500 on swiggy' },
    });
    warn.mockRestore();
  });
});
