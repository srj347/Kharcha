/**
 * @jest-environment node
 */
// Runs with TZ=Asia/Kolkata (see the "test" npm script).
import {
  archiveCategory,
  CategoryNameTakenError,
  createCategory,
  listCategories,
  listCategoriesByUse,
  updateCategory,
} from './categories.repo';
import { getDataVersion } from './data-version';
import { migrate, SCHEMA_VERSION } from './migrations';
import { openMemoryDatabase } from './testing/memory-db';
import {
  addTransaction,
  dayTotal,
  dayTotals,
  deleteTransaction,
  getTransaction,
  listTransactions,
  monthCategoryTotals,
  monthTotals,
  recentNoteExamples,
  updateTransaction,
} from './transactions.repo';
import { TransactionSource, type Category } from './types';

const JUST_AFTER_IST_MIDNIGHT = Date.UTC(2026, 9, 31, 18, 45); // 1 Nov 00:15 IST
const JUST_BEFORE_IST_MIDNIGHT = Date.UTC(2026, 9, 31, 18, 15); // 31 Oct 23:45 IST

function categoryNamed(name: string): Category {
  const found = listCategories().find((category) => category.name === name);
  if (!found) throw new Error(`No category ${name}`);
  return found;
}

function add(amountPaise: number, categoryName: string, note: string, occurredAt: number) {
  return addTransaction({
    amountPaise,
    categoryId: categoryNamed(categoryName).id,
    note,
    source: TransactionSource.Manual,
    occurredAt,
  });
}

beforeEach(() => {
  openMemoryDatabase();
});

describe('migrations', () => {
  it('seeds eight default categories in order', () => {
    expect(listCategories().map((category) => category.name)).toEqual([
      'Food', 'Groceries', 'Travel', 'Shopping', 'Bills', 'Fun', 'Health', 'Other',
    ]);
  });

  it('is safe to run twice', () => {
    const adapter = openMemoryDatabase();
    migrate(adapter);
    expect(listCategories()).toHaveLength(8);
    expect(adapter.get<{ user_version: number }>('PRAGMA user_version')?.user_version).toBe(SCHEMA_VERSION);
  });
});

describe('transactions', () => {
  it('saves and reads back a transaction with its category', () => {
    const saved = add(50000, 'Food', '  Swiggy ', JUST_AFTER_IST_MIDNIGHT);
    const read = getTransaction(saved.id);
    expect(read).toMatchObject({ amountPaise: 50000, note: 'Swiggy', categoryName: 'Food', categoryIcon: 'fork.knife', categoryTint: 'green' });
  });

  it('bumps the data version on every write', () => {
    const before = getDataVersion();
    const saved = add(100, 'Food', 'Chai', Date.now());
    deleteTransaction(saved.id);
    expect(getDataVersion()).toBe(before + 2);
  });

  it('rejects bad amounts and unknown categories', () => {
    const food = categoryNamed('Food').id;
    expect(() => addTransaction({ amountPaise: 0, categoryId: food, note: '', source: TransactionSource.Manual })).toThrow();
    expect(() => addTransaction({ amountPaise: 12.5, categoryId: food, note: '', source: TransactionSource.Manual })).toThrow();
    expect(() => addTransaction({ amountPaise: 100, categoryId: 'nope', note: '', source: TransactionSource.Manual })).toThrow();
  });

  it('updates and deletes', () => {
    const saved = add(50000, 'Food', 'Swiggy', JUST_AFTER_IST_MIDNIGHT);
    updateTransaction(saved.id, { amountPaise: 45000, categoryId: categoryNamed('Fun').id, note: 'Movie', occurredAt: saved.occurredAt });
    expect(getTransaction(saved.id)).toMatchObject({ amountPaise: 45000, categoryName: 'Fun', note: 'Movie' });
    deleteTransaction(saved.id);
    expect(getTransaction(saved.id)).toBeNull();
  });

  it('lists newest first and searches note and category', () => {
    add(100, 'Food', 'Chai', 1_000);
    add(200, 'Travel', 'Uber 50% off', 2_000);
    add(300, 'Food', 'Swiggy', 3_000);
    expect(listTransactions({ limit: 10 }).map((row) => row.note)).toEqual(['Swiggy', 'Uber 50% off', 'Chai']);
    expect(listTransactions({ limit: 10, search: 'food' }).map((row) => row.note)).toEqual(['Swiggy', 'Chai']);
    expect(listTransactions({ limit: 10, search: '50%' }).map((row) => row.note)).toEqual(['Uber 50% off']);
    expect(listTransactions({ limit: 1, offset: 1 }).map((row) => row.note)).toEqual(['Uber 50% off']);
  });
});

describe('local-time grouping', () => {
  beforeEach(() => {
    add(50000, 'Food', 'Swiggy', JUST_AFTER_IST_MIDNIGHT);
    add(18000, 'Travel', 'Uber', JUST_BEFORE_IST_MIDNIGHT);
    add(4000, 'Food', 'Chai', JUST_AFTER_IST_MIDNIGHT + 60_000);
  });

  it('splits days at IST midnight, not UTC midnight', () => {
    expect(dayTotals(['2026-10-31', '2026-11-01'])).toEqual({ '2026-10-31': 18000, '2026-11-01': 54000 });
    expect(dayTotal('2026-11-02')).toBe(0);
  });

  it('splits months at IST midnight', () => {
    expect(monthTotals(['2026-10', '2026-11', '2026-12'])).toEqual([
      { monthKey: '2026-10', totalPaise: 18000 },
      { monthKey: '2026-11', totalPaise: 54000 },
      { monthKey: '2026-12', totalPaise: 0 },
    ]);
  });

  it('totals a month by category, largest first', () => {
    add(10000, 'Bills', 'Airtel', JUST_AFTER_IST_MIDNIGHT + 120_000);
    expect(monthCategoryTotals('2026-11').map((row) => [row.name, row.totalPaise])).toEqual([
      ['Food', 54000],
      ['Bills', 10000],
    ]);
  });
});

describe('categories', () => {
  it('creates a category at the end and blocks duplicate names', () => {
    createCategory({ name: '  Pets ', icon: 'pawprint', tint: 'teal' });
    expect(listCategories().at(-1)?.name).toBe('Pets');
    expect(() => createCategory({ name: 'pets', icon: 'pawprint', tint: 'teal' })).toThrow(CategoryNameTakenError);
  });

  it('sorts by recent use, then list order', () => {
    add(100, 'Travel', 'Uber', 5_000);
    add(100, 'Travel', 'Ola', 6_000);
    add(100, 'Bills', 'Jio', 7_000);
    add(100, 'Food', 'Old chai', 1_000); // before the window
    const names = listCategoriesByUse(2_000).map((category) => category.name);
    expect(names.slice(0, 3)).toEqual(['Travel', 'Bills', 'Food']);
    expect(names).toHaveLength(8);
  });

  it('updates a category', () => {
    const fun = categoryNamed('Fun');
    updateCategory(fun.id, { name: 'Entertainment', icon: 'film', tint: 'rose' });
    expect(listCategories().find((category) => category.id === fun.id)?.name).toBe('Entertainment');
  });

  it('archives a category but keeps its transactions', () => {
    const saved = add(100, 'Fun', 'Movie', 1_000);
    archiveCategory(categoryNamed('Fun').id);
    expect(listCategories().some((category) => category.name === 'Fun')).toBe(false);
    expect(getTransaction(saved.id)?.categoryName).toBe('Fun');
    // A new category may reuse an archived name.
    expect(() => createCategory({ name: 'Fun', icon: 'ticket', tint: 'rose' })).not.toThrow();
  });
});

describe('recentNoteExamples', () => {
  it('returns each note once, with its latest category, newest first', () => {
    add(100, 'Food', 'Swiggy', 1_000);
    add(100, 'Travel', 'Rapido', 2_000);
    const latest = add(100, 'Food', 'swiggy', 3_000);
    updateTransaction(latest.id, { amountPaise: 100, categoryId: categoryNamed('Groceries').id, note: 'swiggy', occurredAt: 3_000 });
    expect(recentNoteExamples(10)).toEqual([
      { note: 'swiggy', categoryName: 'Groceries' },
      { note: 'Rapido', categoryName: 'Travel' },
    ]);
  });
});
