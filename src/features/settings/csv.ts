import type { TransactionRow } from '@/db/types';
import { dayKey, formatTime } from '@/shared/utils/date';

const HEADER = ['Date', 'Time', 'Amount (INR)', 'Category', 'Note', 'Source', 'Heard'];

function escapeCell(value: string): string {
  // Quote cells with commas, quotes or line breaks; neutralise spreadsheet formulas.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function rupees(paise: number): string {
  return (paise / 100).toFixed(2);
}

// Oldest first, one row per expense, ready for Numbers, Excel or Sheets.
export function buildCsv(rows: TransactionRow[]): string {
  const lines = [HEADER.join(',')];
  [...rows]
    .sort((a, b) => a.occurredAt - b.occurredAt)
    .forEach((row) => {
      lines.push(
        [dayKey(row.occurredAt), formatTime(row.occurredAt), rupees(row.amountPaise), row.categoryName, row.note, row.source, row.rawText ?? '']
          .map(escapeCell)
          .join(','),
      );
    });
  return `${lines.join('\n')}\n`;
}
