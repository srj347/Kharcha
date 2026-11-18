import type { TransactionRow } from '@/db/types';
import { dayKey, formatDayLabel, formatTime } from '@/shared/utils/date';

export type HistoryItem =
  | { type: 'header'; key: string; label: string; totalPaise: number }
  | { type: 'row'; key: string; row: TransactionRow; meta: string; first: boolean; last: boolean };

// Rows arrive newest first. Inserts one header per local day, with the full
// day total (from `totals`, which covers rows not loaded yet).
export function buildHistoryItems(rows: TransactionRow[], totals: Record<string, number>, now: number): HistoryItem[] {
  const items: HistoryItem[] = [];
  let currentDay: string | null = null;

  rows.forEach((row, index) => {
    const day = dayKey(row.occurredAt);
    const first = day !== currentDay;
    if (first) {
      items.push({ type: 'header', key: `h-${day}`, label: formatDayLabel(day, now), totalPaise: totals[day] ?? 0 });
      currentDay = day;
    }
    const next = rows[index + 1];
    const last = !next || dayKey(next.occurredAt) !== day;
    items.push({ type: 'row', key: row.id, row, meta: `${row.categoryName} · ${formatTime(row.occurredAt)}`, first, last });
  });

  return items;
}

export function uniqueDayKeys(rows: TransactionRow[]): string[] {
  return [...new Set(rows.map((row) => dayKey(row.occurredAt)))];
}
