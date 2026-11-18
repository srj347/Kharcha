// Runs with TZ=Asia/Kolkata (see the "test" npm script).
import { TransactionSource, type TransactionRow } from '@/db/types';

import { buildCsv } from './csv';

function row(overrides: Partial<TransactionRow>): TransactionRow {
  return {
    id: 'x',
    amountPaise: 50000,
    categoryId: 'food',
    note: 'Swiggy',
    source: TransactionSource.Voice,
    rawText: 'spent 500 on swiggy',
    occurredAt: new Date(2026, 10, 18, 13, 15).getTime(),
    createdAt: 0,
    updatedAt: 0,
    categoryName: 'Food',
    categoryIcon: 'fork.knife',
    categoryTint: 'green',
    ...overrides,
  };
}

describe('buildCsv', () => {
  it('writes a header and one line per expense, oldest first', () => {
    const csv = buildCsv([
      row({ id: 'b', occurredAt: new Date(2026, 10, 18, 13, 15).getTime() }),
      row({ id: 'a', amountPaise: 4050, note: 'Chai', rawText: null, source: TransactionSource.Manual, occurredAt: new Date(2026, 10, 17, 9, 5).getTime() }),
    ]);
    expect(csv.split('\n')).toEqual([
      'Date,Time,Amount (INR),Category,Note,Source,Heard',
      '2026-11-17,9:05 am,40.50,Food,Chai,manual,',
      '2026-11-18,1:15 pm,500.00,Food,Swiggy,voice,spent 500 on swiggy',
      '',
    ]);
  });

  it('quotes commas and quotes, and blocks formulas', () => {
    const csv = buildCsv([row({ note: 'Lunch, "team"', rawText: '=HYPERLINK("x")' })]);
    expect(csv.split('\n')[1]).toBe(`2026-11-18,1:15 pm,500.00,Food,"Lunch, ""team""",voice,"'=HYPERLINK(""x"")"`);
  });
});
