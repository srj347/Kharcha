// A small synchronous SQL interface. The app uses expo-sqlite; unit tests use
// better-sqlite3 in memory. Both implement this interface, so the repository
// code under test is the same code that runs on the phone.

export type SqlValue = string | number | null;

export interface SqlAdapter {
  all<T>(sql: string, params?: SqlValue[]): T[];
  get<T>(sql: string, params?: SqlValue[]): T | null;
  run(sql: string, params?: SqlValue[]): void;
  exec(sql: string): void;
  transaction(work: () => void): void;
}

let current: SqlAdapter | null = null;

export function setDb(adapter: SqlAdapter): void {
  current = adapter;
}

export function db(): SqlAdapter {
  if (!current) {
    throw new Error('Database is not open. Call openAppDatabase() first.');
  }
  return current;
}
