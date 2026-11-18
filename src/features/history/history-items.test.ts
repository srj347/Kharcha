// Runs with TZ=Asia/Kolkata (see the "test" npm script).
import { TransactionSource, type TransactionRow } from '@/db/types';

import { buildHistoryItems, uniqueDayKeys } from './history-items';

function row(id: string, occurredAt: number): TransactionRow {
  return {
    id,
    amountPaise: 100,
    categoryId: 'food',
    note: id,
    source: TransactionSource.Manual,
    rawText: null,
    occurredAt,
    createdAt: occurredAt,
    updatedAt: occurredAt,
    categoryName: 'Food',
    categoryIcon: 'fork.knife',
    categoryTint: 'green',
  };
}

const NOW = new Date(2026, 10, 18, 13, 0).getTime();

describe('buildHistoryItems', () => {
  const rows = [
    row('a', new Date(2026, 10, 18, 12, 30).getTime()),
    row('b', new Date(2026, 10, 18, 9, 40).getTime()),
    row('c', new Date(2026, 10, 17, 21, 0).getTime()),
  ];

  it('adds one header per day with the day total', () => {
    const items = buildHistoryItems(rows, { '2026-11-18': 500, '2026-11-17': 300 }, NOW);
    expect(items.map((item) => (item.type === 'header' ? `${item.label}:${item.totalPaise}` : item.key))).toEqual([
      'Today:500', 'a', 'b', 'Yesterday:300', 'c',
    ]);
  });

  it('marks the first and last row of each day for rounded corners', () => {
    const items = buildHistoryItems(rows, {}, NOW).filter((item) => item.type === 'row');
    expect(items.map((item) => (item.type === 'row' ? [item.first, item.last] : null))).toEqual([
      [true, false],
      [false, true],
      [true, true],
    ]);
  });

  it('shows category and time as the meta line', () => {
    const items = buildHistoryItems(rows.slice(1, 2), {}, NOW);
    expect(items[1]).toMatchObject({ type: 'row', meta: 'Food · 9:40 am' });
  });

  it('lists unique day keys in order', () => {
    expect(uniqueDayKeys(rows)).toEqual(['2026-11-18', '2026-11-17']);
  });
});
