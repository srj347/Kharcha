import { router } from 'expo-router';
import { Text, View } from 'react-native';

import { listTransactions } from '@/db/transactions.repo';
import { useDbQuery } from '@/db/use-db-query.hook';
import { TransactionRowItem } from '@/shared/components/transaction-row.component';
import { useNow } from '@/shared/hooks/use-now.hook';
import { dayKey, formatDayLabel, formatTime } from '@/shared/utils/date';

import { styles } from './just-added.styles';

const JUST_ADDED_COUNT = 3;
const RECENT_MS = 2 * 60 * 1000;

function describeWhen(occurredAt: number, createdAt: number, now: number): string {
  if (now - createdAt < RECENT_MS) return 'just now';
  const key = dayKey(occurredAt);
  return key === dayKey(now) ? formatTime(occurredAt) : formatDayLabel(key, now);
}

function openEntry(id: string) {
  router.push({ pathname: '/entry', params: { id } });
}

export function JustAdded() {
  const rows = useDbQuery(() => listTransactions({ limit: JUST_ADDED_COUNT }), 'just-added');
  const now = useNow();

  if (rows.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Your expenses will show here.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading} accessibilityRole="header">
        JUST ADDED
      </Text>
      <View style={styles.card}>
        {rows.map((row, index) => (
          <View key={row.id}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <TransactionRowItem
              row={row}
              meta={`${row.categoryName} · ${describeWhen(row.occurredAt, row.createdAt, now)}`}
              onPress={openEntry}
            />
          </View>
        ))}
      </View>
    </View>
  );
}
