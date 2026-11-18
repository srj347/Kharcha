import { generateText, Output, type LanguageModel } from 'ai';
import { z } from 'zod';

import type { ExtractFn, ModelExtraction } from './extraction.types';
import { buildInstructions, buildPrompt } from './prompt';

// Field order matters: guided generation fills fields in this order (the
// Apple provider sends it as "x-order"), so the model reads the note and the
// amount before it judges isExpense. With isExpense first, amount accuracy on
// the eval set was 74 %; in this order it is 100 % (docs/PLAN.md §11).
export function expenseSchema(categoryNames: [string, ...string[]]) {
  return z.object({
    note: z.string().describe('merchant, person or item in 1 to 4 words, Title Case'),
    amountRupees: z.number().describe('amount spent in Indian rupees, 0 when not said'),
    amountUnsure: z.boolean().describe('true when no amount was said clearly'),
    category: z.enum(categoryNames).describe('one category name from the list'),
    categoryUnsure: z.boolean().describe('true when no category clearly fits'),
    isExpense: z.boolean().describe('false only when the sentence is not about spending money'),
  });
}

// Builds an extractor for any AI SDK language model (Apple on device; a mock
// model in tests).
export function createExtractor(getModel: () => LanguageModel): ExtractFn {
  return async (sentence, categories, examples) => {
    const [first, ...rest] = categories.map((category) => category.name);
    if (first === undefined) {
      throw new Error('No categories to choose from.');
    }
    const result = await generateText({
      model: getModel(),
      system: buildInstructions(categories, examples),
      prompt: buildPrompt(sentence),
      output: Output.object({ schema: expenseSchema([first, ...rest]) }),
      temperature: 0,
    });
    const output: ModelExtraction = result.output;
    return output;
  };
}
