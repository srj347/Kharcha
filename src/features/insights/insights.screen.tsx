import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { monthCategoryTotals, monthTotals } from '@/db/transactions.repo';
import { useDbQuery } from '@/db/use-db-query.hook';
import { CategoryIcon } from '@/shared/components/category-icon.component';
import { useNow } from '@/shared/hooks/use-now.hook';
import { colors } from '@/shared/styles/tokens';
import { formatMonthLabel, formatShortMonth, monthKey, monthKeysEndingAt, shiftMonthKey } from '@/shared/utils/date';
import { formatINR } from '@/shared/utils/money';

import { toCategoryBars, toMonthBars } from './insights-math';
import { styles } from './insights.styles';

const TREND_MONTHS = 6;
const TAB_BAR_SPACE = 96;

function loadMonth(key: string) {
  const months = monthTotals(monthKeysEndingAt(key, TREND_MONTHS));
  return {
    categories: toCategoryBars(monthCategoryTotals(key)),
    trend: toMonthBars(months),
    total: months[months.length - 1]?.totalPaise ?? 0,
    previous: months[months.length - 2]?.totalPaise ?? 0,
  };
}

export function InsightsScreen() {
  const insets = useSafeAreaInsets();
  const currentMonth = monthKey(useNow());
  const [selected, setSelected] = useState<string | null>(null);
  const month = selected ?? currentMonth;
  const data = useDbQuery(() => loadMonth(month), `insights-${month}`);
  const isCurrent = month === currentMonth;
  const previousLabel = formatMonthLabel(shiftMonthKey(month, -1)).split(' ')[0];

  function go(delta: number) {
    void Haptics.selectionAsync();
    const next = shiftMonthKey(month, delta);
    setSelected(next > currentMonth ? currentMonth : next);
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + TAB_BAR_SPACE }]}>
      <View style={styles.monthRow}>
        <Pressable accessibilityRole="button" accessibilityLabel="Previous month" onPress={() => go(-1)} style={styles.monthButton}>
          <SymbolView name="chevron.left" size={16} weight="semibold" tintColor={colors.text} />
        </Pressable>
        <Text style={styles.monthLabel} accessibilityRole="header">
          {formatMonthLabel(month)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Next month"
          accessibilityState={{ disabled: isCurrent }}
          disabled={isCurrent}
          onPress={() => go(1)}
          style={[styles.monthButton, isCurrent && styles.monthButtonDisabled]}>
          <SymbolView name="chevron.right" size={16} weight="semibold" tintColor={colors.text} />
        </Pressable>
      </View>

      <View style={styles.totalBlock}>
        <Text style={styles.total} adjustsFontSizeToFit numberOfLines={1}>
          {formatINR(data.total)}
        </Text>
        <Text style={styles.totalCaption}>
          {isCurrent ? 'so far · ' : ''}
          {previousLabel} was {formatINR(data.previous)}
        </Text>
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        BY CATEGORY
      </Text>
      <View style={styles.card}>
        {data.categories.length === 0 ? (
          <Text style={styles.emptyText}>No expenses in {formatMonthLabel(month)}.</Text>
        ) : (
          data.categories.map((bar) => (
            <View
              key={bar.categoryId}
              style={styles.categoryRow}
              accessible
              accessibilityLabel={`${bar.name}, ${formatINR(bar.totalPaise)}, ${bar.percent} percent`}>
              <CategoryIcon icon={bar.icon} tint={bar.tint} size="small" />
              <View style={styles.categoryBody}>
                <View style={styles.categoryLine}>
                  <Text style={styles.categoryName}>{bar.name}</Text>
                  <Text style={styles.categoryAmount}>
                    <Text style={styles.categoryPercent}>{bar.percent}%  </Text>
                    {formatINR(bar.totalPaise)}
                  </Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.fill, { width: `${Math.max(bar.fraction * 100, 2)}%` }]} />
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        LAST 6 MONTHS
      </Text>
      <View style={[styles.card, styles.trendCard]}>
        {data.trend.map((bar) => {
          const active = bar.monthKey === month;
          return (
            <Pressable
              key={bar.monthKey}
              accessibilityRole="button"
              accessibilityLabel={`${formatMonthLabel(bar.monthKey)}, ${formatINR(bar.totalPaise)}`}
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(bar.monthKey)}
              style={styles.trendColumn}>
              <View style={styles.trendBarArea}>
                <View style={[styles.trendBar, active && styles.trendBarActive, { height: `${Math.max(bar.fraction * 100, 3)}%` }]} />
              </View>
              <Text style={[styles.trendLabel, active && styles.trendLabelActive]}>{formatShortMonth(bar.monthKey)}</Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
