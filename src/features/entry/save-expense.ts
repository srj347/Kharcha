import * as Haptics from 'expo-haptics';

import { addTransaction, deleteTransaction, type NewTransaction } from '@/db/transactions.repo';
import type { TransactionRow } from '@/db/types';
import { showToast } from '@/shared/toast/toast.store';
import { formatINR } from '@/shared/utils/money';

export function describeSaved(row: Pick<TransactionRow, 'amountPaise' | 'categoryName' | 'note'>): string {
  const parts = [formatINR(row.amountPaise), row.categoryName];
  if (row.note) parts.push(row.note);
  return parts.join(' · ');
}

// Saves an expense, confirms it with a haptic and an Undo toast. Used by the
// keypad sheet, the confirm card and voice auto-save.
export function saveExpense(input: NewTransaction): TransactionRow {
  const saved = addTransaction(input);
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  showToast({
    message: `Saved ${describeSaved(saved)}`,
    actionLabel: 'Undo',
    onAction: () => deleteTransaction(saved.id),
  });
  return saved;
}
