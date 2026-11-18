import * as Device from 'expo-device';

import type { ExtractFn, ModelExtraction } from './extraction.types';

// DEVELOPMENT ONLY. The iOS simulator cannot run Apple's on-device model
// (it fails with "promptTemplateNotFound"). So that the auto-save flow can be
// tested in the simulator, this stand-in answers the sentences of the eval set
// (tools/eval/phrases.json) with their expected results. It is never used on a
// real iPhone or in a release build, and only after the real model has failed.

interface EvalPhrase {
  sentence: string;
  amount?: number | null;
  category?: string[];
  expense?: boolean;
}

const NUMBER_OR_FILLER = /^(\d[\d,.]*k?|rs|rupees|spent|paid|on|for|from|at|to|the|bought)$/i;

function noteFrom(sentence: string): string {
  return sentence
    .split(/\s+/)
    .filter((word) => !NUMBER_OR_FILLER.test(word))
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function lookup(sentence: string): ModelExtraction | null {
  const phrases: EvalPhrase[] = require('../../../tools/eval/phrases.json');
  const found = phrases.find((phrase) => phrase.sentence === sentence.trim().toLowerCase());
  if (!found) return null;
  if (found.expense === false) {
    return { note: '', amountRupees: 0, amountUnsure: true, category: 'Other', categoryUnsure: true, isExpense: false };
  }
  return {
    note: noteFrom(found.sentence),
    amountRupees: found.amount ?? 0,
    amountUnsure: found.amount === null || found.amount === undefined,
    category: found.category?.[0] ?? 'Other',
    categoryUnsure: false,
    isExpense: true,
  };
}

export function withSimulatorStandIn(real: ExtractFn): ExtractFn {
  if (!__DEV__ || Device.isDevice) return real;
  return async (sentence, categories, examples) => {
    try {
      return await real(sentence, categories, examples);
    } catch (error: unknown) {
      const answer = lookup(sentence);
      if (!answer) throw error;
      console.warn('[extract] simulator stand-in answered (the real model cannot run in the simulator)');
      return answer;
    }
  };
}
