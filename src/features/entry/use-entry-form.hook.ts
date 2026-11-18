import { useState } from 'react';

import { applyKeypadKey, parseAmountInput, paiseToInputText } from '@/shared/utils/money';

export interface EntryFormInitial {
  amountPaise: number | null;
  categoryId: string | null;
  note: string;
  occurredAt: number;
}

export function useEntryForm(initial: EntryFormInitial) {
  const [amountText, setAmountText] = useState(initial.amountPaise ? paiseToInputText(initial.amountPaise) : '');
  const [categoryId, setCategoryId] = useState<string | null>(initial.categoryId);
  const [note, setNote] = useState(initial.note);
  const [occurredAt, setOccurredAt] = useState(initial.occurredAt);

  const amountPaise = parseAmountInput(amountText);
  const canSave = amountPaise !== null && categoryId !== null;

  function pressKey(key: string) {
    setAmountText((text) => applyKeypadKey(text, key));
  }

  return { amountText, amountPaise, categoryId, setCategoryId, note, setNote, occurredAt, setOccurredAt, pressKey, canSave };
}
