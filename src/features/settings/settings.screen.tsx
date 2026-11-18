import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { listCategories } from '@/db/categories.repo';
import { countTransactions } from '@/db/transactions.repo';
import { useDbQuery } from '@/db/use-db-query.hook';
import { ListRow } from '@/shared/components/list-row.component';

import { exportCsv } from './export-csv';
import { styles } from './settings.styles';

function openCategories() {
  router.push('/settings/categories');
}

function openShortcutGuide() {
  router.push('/settings/shortcut');
}

export function SettingsScreen() {
  const counts = useDbQuery(() => ({ categories: listCategories().length, expenses: countTransactions() }), 'settings-counts');
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportCsv();
    } catch (error: unknown) {
      console.warn('[export] failed', error);
      Alert.alert('Export failed', 'The CSV file could not be created. Try again.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.group}>
        <ListRow first symbol="square.grid.2x2" label="Categories" value={String(counts.categories)} onPress={openCategories} />
        <ListRow last symbol="hand.tap" label="Shortcut & Back Tap" onPress={openShortcutGuide} />
      </View>

      <Text style={styles.sectionTitle}>YOUR DATA</Text>
      <View style={styles.group}>
        <ListRow
          first
          last
          symbol="square.and.arrow.up"
          label={exporting ? 'Exporting…' : 'Export as CSV'}
          value={`${counts.expenses} expenses`}
          onPress={handleExport}
          chevron={false}
        />
      </View>
      <Text style={styles.footnote}>
        Kharcha keeps your expenses only on this iPhone. They are included in your iPhone’s iCloud backup. Voice and AI run on the device.
      </Text>

      <Text style={styles.version}>Kharcha {Constants.expoConfig?.version ?? ''}</Text>
    </ScrollView>
  );
}
