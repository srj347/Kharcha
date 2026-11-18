import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { listTransactions } from '@/db/transactions.repo';
import { dayKey } from '@/shared/utils/date';

import { buildCsv } from './csv';

const EXPORT_LIMIT = 1_000_000;

// Writes every expense to a CSV file and opens the iOS share sheet
// (Save to Files, AirDrop, Mail…). Returns the number of rows exported.
export async function exportCsv(): Promise<number> {
  const rows = listTransactions({ limit: EXPORT_LIMIT });
  const file = new File(Paths.cache, `kharcha-${dayKey(Date.now())}.csv`);
  file.create({ overwrite: true });
  await file.write(buildCsv(rows));
  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: 'Export expenses',
  });
  return rows.length;
}
