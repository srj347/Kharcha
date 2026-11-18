import { SymbolView, type SFSymbol } from 'expo-symbols';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

import { colors } from '@/shared/styles/tokens';

import { styles } from './list-row.styles';

interface ListRowProps {
  label: string;
  value?: string;
  symbol?: SFSymbol;
  leading?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  first?: boolean;
  last?: boolean;
  chevron?: boolean;
}

// A grouped-list row in the iOS Settings style.
export function ListRow({ label, value, symbol, leading, onPress, destructive = false, first = false, last = false, chevron = true }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.row, first && styles.first, last && styles.last, pressed && styles.pressed]}>
      {!first ? <View style={styles.divider} /> : null}
      {leading ?? (symbol ? <SymbolView name={symbol} size={18} tintColor={destructive ? colors.danger : colors.accent} /> : null)}
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {onPress && chevron ? <SymbolView name="chevron.right" size={13} weight="semibold" tintColor={colors.textMuted} /> : null}
    </Pressable>
  );
}
