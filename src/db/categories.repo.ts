import { createId } from '@/shared/utils/id';

import { bumpDataVersion } from './data-version';
import { db } from './sql-adapter';
import { CATEGORY_TINTS, type Category, type CategoryTint } from './types';

interface CategoryRecord {
  id: string;
  name: string;
  icon: string;
  tint: string;
  description: string;
  keywords: string;
  sortOrder: number;
  archived: number;
}

const SELECT_CATEGORY = `
  SELECT id, name, icon, tint, description, keywords, sort_order AS sortOrder, archived
  FROM categories`;

function toTint(value: string): CategoryTint {
  return (CATEGORY_TINTS as readonly string[]).includes(value) ? (value as CategoryTint) : 'slate';
}

function toCategory(record: CategoryRecord): Category {
  return { ...record, tint: toTint(record.tint), archived: record.archived === 1 };
}

export function listCategories(options: { includeArchived?: boolean } = {}): Category[] {
  const where = options.includeArchived ? '' : 'WHERE archived = 0';
  return db()
    .all<CategoryRecord>(`${SELECT_CATEGORY} ${where} ORDER BY sort_order, name`)
    .map(toCategory);
}

// Active categories, most used since `sinceMs` first, then in list order.
export function listCategoriesByUse(sinceMs: number): Category[] {
  return db()
    .all<CategoryRecord>(
      `SELECT c.id, c.name, c.icon, c.tint, c.description, c.keywords, c.sort_order AS sortOrder, c.archived
       FROM categories c
       LEFT JOIN transactions t ON t.category_id = c.id AND t.occurred_at >= ?
       WHERE c.archived = 0
       GROUP BY c.id
       ORDER BY COUNT(t.id) DESC, c.sort_order, c.name`,
      [sinceMs],
    )
    .map(toCategory);
}

export function getCategory(id: string): Category | null {
  const record = db().get<CategoryRecord>(`${SELECT_CATEGORY} WHERE id = ?`, [id]);
  return record ? toCategory(record) : null;
}

export interface CategoryInput {
  name: string;
  icon: string;
  tint: CategoryTint;
  description?: string;
  keywords?: string;
}

export class CategoryNameTakenError extends Error {
  constructor(name: string) {
    super(`A category named "${name}" already exists.`);
    this.name = 'CategoryNameTakenError';
  }
}

function assertNameFree(name: string, exceptId?: string): void {
  const clash = db().get<{ id: string }>(
    'SELECT id FROM categories WHERE archived = 0 AND name = ? COLLATE NOCASE AND id != ?',
    [name, exceptId ?? ''],
  );
  if (clash) {
    throw new CategoryNameTakenError(name);
  }
}

function cleanName(name: string): string {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (!trimmed) {
    throw new Error('Category name is empty.');
  }
  return trimmed;
}

export function createCategory(input: CategoryInput): Category {
  const name = cleanName(input.name);
  assertNameFree(name);
  const next = db().get<{ next: number }>('SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM categories');
  const id = createId();
  db().run(
    `INSERT INTO categories (id, name, icon, tint, description, keywords, sort_order, archived, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
    [id, name, input.icon, input.tint, input.description?.trim() ?? '', input.keywords?.trim() ?? '', next?.next ?? 0, Date.now()],
  );
  bumpDataVersion();
  const created = getCategory(id);
  if (!created) {
    throw new Error('Category was not saved.');
  }
  return created;
}

export function updateCategory(id: string, input: CategoryInput): void {
  const name = cleanName(input.name);
  assertNameFree(name, id);
  db().run(
    'UPDATE categories SET name = ?, icon = ?, tint = ?, description = ?, keywords = ? WHERE id = ?',
    [name, input.icon, input.tint, input.description?.trim() ?? '', input.keywords?.trim() ?? '', id],
  );
  bumpDataVersion();
}

// Archived categories keep their old transactions valid but leave pickers.
export function archiveCategory(id: string): void {
  const active = db().get<{ count: number }>('SELECT COUNT(*) AS count FROM categories WHERE archived = 0');
  if ((active?.count ?? 0) <= 1) {
    throw new Error('Keep at least one category.');
  }
  db().run('UPDATE categories SET archived = 1 WHERE id = ?', [id]);
  bumpDataVersion();
}
