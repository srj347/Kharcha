import { openDatabaseSync, type SQLiteBindValue } from 'expo-sqlite';

import { migrate } from './migrations';
import { setDb, type SqlAdapter, type SqlValue } from './sql-adapter';

const DATABASE_NAME = 'kharcha.db';

function bind(params: SqlValue[] | undefined): SQLiteBindValue[] {
  return params ?? [];
}

export function openAppDatabase(): void {
  const database = openDatabaseSync(DATABASE_NAME);
  database.execSync('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

  const adapter: SqlAdapter = {
    all: <T,>(sql: string, params?: SqlValue[]) => database.getAllSync<T>(sql, bind(params)),
    get: <T,>(sql: string, params?: SqlValue[]) => database.getFirstSync<T>(sql, bind(params)),
    run: (sql, params) => {
      database.runSync(sql, bind(params));
    },
    exec: (sql) => database.execSync(sql),
    transaction: (work) => database.withTransactionSync(work),
  };

  migrate(adapter);
  setDb(adapter);
}
