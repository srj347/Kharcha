import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dayTotals, listTransactions } from '@/db/transactions.repo';
import { useDbQuery } from '@/db/use-db-query.hook';
import { TransactionRowItem } from '@/shared/components/transaction-row.component';
import { useNow } from '@/shared/hooks/use-now.hook';
import { colors } from '@/shared/styles/tokens';
import { formatINR } from '@/shared/utils/money';

import { buildHistoryItems, uniqueDayKeys, type HistoryItem } from './history-items';
import { styles } from './history.styles';

const PAGE_SIZE = 60;
const TAB_BAR_SPACE = 96;

function openEntry(id: string) {
  router.push({ pathname: '/entry', params: { id } });
}

function loadPage(search: string, limit: number) {
  const rows = listTransactions({ search, limit });
  return { rows, totals: dayTotals(uniqueDayKeys(rows)) };
}

function renderItem({ item }: { item: HistoryItem }) {
  if (item.type === 'header') {
    return (
      <View style={styles.header}>
        <Text style={styles.headerLabel} accessibilityRole="header">
          {item.label.toUpperCase()}
        </Text>
        <Text style={styles.headerTotal}>{formatINR(item.totalPaise)}</Text>
      </View>
    );
  }
  return (
    <View style={[styles.rowWrap, item.first && styles.rowFirst, item.last && styles.rowLast]}>
      {!item.first ? <View style={styles.divider} /> : null}
      <TransactionRowItem row={item.row} meta={item.meta} onPress={openEntry} />
    </View>
  );
}

function itemType(item: HistoryItem) {
  return item.type;
}

function itemKey(item: HistoryItem) {
  return item.key;
}

export function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const now = useNow();
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const page = useDbQuery(() => loadPage(search, limit), `history-${search}-${limit}`);
  const items = buildHistoryItems(page.rows, page.totals, now);
  const hasMore = page.rows.length === limit;

  function changeSearch(text: string) {
    setSearch(text);
    setLimit(PAGE_SIZE);
  }

  function loadMore() {
    if (hasMore) setLimit((value) => value + PAGE_SIZE);
  }

  const empty = (
    <View style={styles.empty}>
      <SymbolView name={search ? 'magnifyingglass' : 'tray'} size={28} tintColor={colors.textMuted} />
      <Text style={styles.emptyTitle}>{search ? 'No matches' : 'No expenses yet'}</Text>
      <Text style={styles.emptyText}>{search ? 'Try a note or a category name.' : 'Say or type an expense on the Add tab.'}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.top}>
        <Text style={styles.title} accessibilityRole="header">
          History
        </Text>
        <View style={styles.search}>
          <SymbolView name="magnifyingglass" size={16} tintColor={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={changeSearch}
            placeholder="Search notes or categories"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search expenses"
          />
        </View>
      </View>
      <FlashList
        data={items}
        renderItem={renderItem}
        keyExtractor={itemKey}
        getItemType={itemType}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        keyboardDismissMode="on-drag"
        ListEmptyComponent={empty}
        contentContainerStyle={{ ...styles.listContent, paddingBottom: insets.bottom + TAB_BAR_SPACE }}
      />
    </View>
  );
}
