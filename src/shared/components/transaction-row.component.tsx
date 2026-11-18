import { Pressable, Text, View } from 'react-native';

import type { TransactionRow } from '@/db/types';
import { formatINR } from '@/shared/utils/money';

import { CategoryIcon } from './category-icon.component';
import { styles } from './transaction-row.styles';

interface TransactionRowItemProps {
  row: TransactionRow;
  meta: string;
  onPress: (id: string) => void;
}

export function TransactionRowItem({ row, meta, onPress }: TransactionRowItemProps) {
  const title = row.note || row.categoryName;
  const amount = formatINR(row.amountPaise);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${amount}, ${meta}`}
      accessibilityHint="Opens the expense to edit"
      onPress={() => onPress(row.id)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <CategoryIcon icon={row.categoryIcon} tint={row.categoryTint} />
      <View style={styles.text}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {meta}
        </Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </Pressable>
  );
}
