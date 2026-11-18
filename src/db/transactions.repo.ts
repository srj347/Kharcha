import { createId } from '@/shared/utils/id';
import { MAX_AMOUNT_PAISE } from '@/shared/utils/money';

import { bumpDataVersion } from './data-version';
import { db, type SqlValue } from './sql-adapter';
import {
  CATEGORY_TINTS,
  TransactionSource,
  type CategoryTint,
  type CategoryTotal,
  type MonthTotal,
  type TransactionRow,
} from './types';

// One bucketing rule for every screen: SQLite local time.
const DAY_EXPR = "strftime('%Y-%m-%d', t.occurred_at / 1000, 'unixepoch', 'localtime')";
const MONTH_EXPR = "strftime('%Y-%m', t.occurred_at / 1000, 'unixepoch', 'localtime')";

const SELECT_ROW = `
  SELECT t.id, t.amount_paise AS amountPaise, t.category_id AS categoryId, t.note, t.source,
         t.raw_text AS rawText, t.occurred_at AS occurredAt, t.created_at AS createdAt,
         t.updated_at AS updatedAt,
         c.name AS categoryName, c.icon AS categoryIcon, c.tint AS categoryTint
  FROM transactions t
  JOIN categories c ON c.id = t.category_id`;

interface RowRecord extends Omit<TransactionRow, 'categoryTint' | 'source'> {
  categoryTint: string;
  source: string;
}

function toTint(value: string): CategoryTint {
  return (CATEGORY_TINTS as readonly string[]).includes(value) ? (value as CategoryTint) : 'slate';
}

function toSource(value: string): TransactionSource {
  return (Object.values(TransactionSource) as string[]).includes(value)
    ? (value as TransactionSource)
    : TransactionSource.Manual;
}

function toRow(record: RowRecord): TransactionRow {
  return { ...record, categoryTint: toTint(record.categoryTint), source: toSource(record.source) };
}

function assertAmount(amountPaise: number): void {
  if (!Number.isInteger(amountPaise) || amountPaise <= 0 || amountPaise > MAX_AMOUNT_PAISE) {
    throw new Error(`Invalid amount: ${amountPaise}`);
  }
}

function assertCategory(categoryId: string): void {
  const found = db().get<{ id: string }>('SELECT id FROM categories WHERE id = ?', [categoryId]);
  if (!found) {
    throw new Error(`Unknown category: ${categoryId}`);
  }
}

export interface NewTransaction {
  amountPaise: number;
  categoryId: string;
  note: string;
  source: TransactionSource;
  rawText?: string | null;
  occurredAt?: number;
}

export function addTransaction(input: NewTransaction): TransactionRow {
  assertAmount(input.amountPaise);
  assertCategory(input.categoryId);
  const now = Date.now();
  const id = createId();
  db().run(
    `INSERT INTO transactions (id, amount_paise, category_id, note, source, raw_text, occurred_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.amountPaise,
      input.categoryId,
      input.note.trim(),
      input.source,
      input.rawText ?? null,
      input.occurredAt ?? now,
      now,
      now,
    ],
  );
  bumpDataVersion();
  const saved = getTransaction(id);
  if (!saved) {
    throw new Error('Transaction was not saved.');
  }
  return saved;
}

export interface TransactionChanges {
  amountPaise: number;
  categoryId: string;
  note: string;
  occurredAt: number;
}

export function updateTransaction(id: string, changes: TransactionChanges): void {
  assertAmount(changes.amountPaise);
  assertCategory(changes.categoryId);
  db().run(
    'UPDATE transactions SET amount_paise = ?, category_id = ?, note = ?, occurred_at = ?, updated_at = ? WHERE id = ?',
    [changes.amountPaise, changes.categoryId, changes.note.trim(), changes.occurredAt, Date.now(), id],
  );
  bumpDataVersion();
}

export function deleteTransaction(id: string): void {
  db().run('DELETE FROM transactions WHERE id = ?', [id]);
  bumpDataVersion();
}

export function getTransaction(id: string): TransactionRow | null {
  const record = db().get<RowRecord>(`${SELECT_ROW} WHERE t.id = ?`, [id]);
  return record ? toRow(record) : null;
}

function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (match) => `\\${match}`);
}

export function listTransactions(options: { search?: string; limit: number; offset?: number }): TransactionRow[] {
  const params: SqlValue[] = [];
  let where = '';
  const search = options.search?.trim();
  if (search) {
    const pattern = `%${escapeLike(search)}%`;
    where = "WHERE (t.note LIKE ? ESCAPE '\\' OR c.name LIKE ? ESCAPE '\\')";
    params.push(pattern, pattern);
  }
  params.push(options.limit, options.offset ?? 0);
  return db()
    .all<RowRecord>(`${SELECT_ROW} ${where} ORDER BY t.occurred_at DESC, t.created_at DESC LIMIT ? OFFSET ?`, params)
    .map(toRow);
}

// Total spent per local day, for the given day keys (YYYY-MM-DD).
export function dayTotals(dayKeys: string[]): Record<string, number> {
  if (dayKeys.length === 0) return {};
  const placeholders = dayKeys.map(() => '?').join(', ');
  const rows = db().all<{ day: string; total: number }>(
    `SELECT ${DAY_EXPR} AS day, SUM(t.amount_paise) AS total
     FROM transactions t WHERE ${DAY_EXPR} IN (${placeholders}) GROUP BY day`,
    dayKeys,
  );
  return Object.fromEntries(rows.map((row) => [row.day, row.total]));
}

export function dayTotal(dayKeyValue: string): number {
  return dayTotals([dayKeyValue])[dayKeyValue] ?? 0;
}

export function monthCategoryTotals(monthKeyValue: string): CategoryTotal[] {
  return db()
    .all<Omit<CategoryTotal, 'tint'> & { tint: string }>(
      `SELECT c.id AS categoryId, c.name, c.icon, c.tint, SUM(t.amount_paise) AS totalPaise
       FROM transactions t JOIN categories c ON c.id = t.category_id
       WHERE ${MONTH_EXPR} = ?
       GROUP BY c.id ORDER BY totalPaise DESC, c.sort_order`,
      [monthKeyValue],
    )
    .map((row) => ({ ...row, tint: toTint(row.tint) }));
}

// Totals for each requested month key, in the same order, zero when empty.
export function monthTotals(monthKeys: string[]): MonthTotal[] {
  if (monthKeys.length === 0) return [];
  const placeholders = monthKeys.map(() => '?').join(', ');
  const rows = db().all<{ month: string; total: number }>(
    `SELECT ${MONTH_EXPR} AS month, SUM(t.amount_paise) AS total
     FROM transactions t WHERE ${MONTH_EXPR} IN (${placeholders}) GROUP BY month`,
    monthKeys,
  );
  const byMonth = new Map(rows.map((row) => [row.month, row.total]));
  return monthKeys.map((key) => ({ monthKey: key, totalPaise: byMonth.get(key) ?? 0 }));
}

export interface NoteCategoryExample {
  note: string;
  categoryName: string;
}

// The user's most recent distinct notes and the category they used, newest
// first. The AI prompt uses these as examples of how this user categorises.
export function recentNoteExamples(limit: number): NoteCategoryExample[] {
  return db().all<NoteCategoryExample>(
    `SELECT note, categoryName FROM (
       SELECT t.note AS note, c.name AS categoryName, t.updated_at AS updatedAt, t.rowid AS rowOrder,
              ROW_NUMBER() OVER (PARTITION BY LOWER(t.note) ORDER BY t.updated_at DESC, t.rowid DESC) AS rank
       FROM transactions t JOIN categories c ON c.id = t.category_id
       WHERE t.note != '' AND c.archived = 0
     )
     WHERE rank = 1
     ORDER BY updatedAt DESC, rowOrder DESC
     LIMIT ?`,
    [limit],
  );
}

export function countTransactions(): number {
  return db().get<{ count: number }>('SELECT COUNT(*) AS count FROM transactions')?.count ?? 0;
}
