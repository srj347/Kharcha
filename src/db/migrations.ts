import { createId } from '@/shared/utils/id';

import { DEFAULT_CATEGORIES } from './default-categories';
import type { SqlAdapter } from './sql-adapter';

type Migration = (adapter: SqlAdapter) => void;

// Append new migrations to the end. Never edit one that has shipped.
const MIGRATIONS: Migration[] = [
  function createInitialSchema(adapter) {
    adapter.exec(`
      CREATE TABLE categories (
        id          TEXT PRIMARY KEY NOT NULL,
        name        TEXT NOT NULL,
        icon        TEXT NOT NULL,
        tint        TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        keywords    TEXT NOT NULL DEFAULT '',
        sort_order  INTEGER NOT NULL,
        archived    INTEGER NOT NULL DEFAULT 0,
        created_at  INTEGER NOT NULL
      );
      CREATE UNIQUE INDEX idx_categories_active_name
        ON categories (name COLLATE NOCASE) WHERE archived = 0;

      CREATE TABLE transactions (
        id           TEXT PRIMARY KEY NOT NULL,
        amount_paise INTEGER NOT NULL CHECK (amount_paise > 0),
        category_id  TEXT NOT NULL REFERENCES categories (id),
        note         TEXT NOT NULL DEFAULT '',
        source       TEXT NOT NULL CHECK (source IN ('manual', 'voice', 'shortcut')),
        raw_text     TEXT,
        occurred_at  INTEGER NOT NULL,
        created_at   INTEGER NOT NULL,
        updated_at   INTEGER NOT NULL
      );
      CREATE INDEX idx_transactions_occurred ON transactions (occurred_at DESC);
      CREATE INDEX idx_transactions_category ON transactions (category_id, occurred_at);
    `);

    const now = Date.now();
    DEFAULT_CATEGORIES.forEach((category, index) => {
      adapter.run(
        `INSERT INTO categories (id, name, icon, tint, description, keywords, sort_order, archived, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [createId(), category.name, category.icon, category.tint, category.description, category.keywords, index, now],
      );
    });
  },
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export function migrate(adapter: SqlAdapter): void {
  const row = adapter.get<{ user_version: number }>('PRAGMA user_version');
  const from = row?.user_version ?? 0;

  for (let version = from; version < MIGRATIONS.length; version += 1) {
    const migration = MIGRATIONS[version];
    adapter.transaction(() => {
      migration(adapter);
      // PRAGMA does not accept bound parameters; `version` is a trusted integer.
      adapter.exec(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
