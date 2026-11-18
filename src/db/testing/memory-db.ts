// Test-only: an in-memory SQLite database behind the same SqlAdapter interface
// the app uses. Never import this from app code.
import Database from 'better-sqlite3';

import { migrate } from '../migrations';
import { setDb, type SqlAdapter } from '../sql-adapter';

export function openMemoryDatabase(): SqlAdapter {
  const database = new Database(':memory:');
  database.pragma('foreign_keys = ON');

  const adapter: SqlAdapter = {
    all: <T,>(sql: string, params: (string | number | null)[] = []) => database.prepare(sql).all(...params) as T[],
    get: <T,>(sql: string, params: (string | number | null)[] = []) =>
      (database.prepare(sql).get(...params) as T | undefined) ?? null,
    run: (sql, params = []) => {
      database.prepare(sql).run(...params);
    },
    exec: (sql) => {
      database.exec(sql);
    },
    transaction: (work) => {
      database.transaction(work)();
    },
  };

  migrate(adapter);
  setDb(adapter);
  return adapter;
}
