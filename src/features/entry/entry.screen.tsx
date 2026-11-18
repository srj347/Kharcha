import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Keyboard, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listCategoriesByUse } from '@/db/categories.repo';
import { deleteTransaction, getTransaction, updateTransaction } from '@/db/transactions.repo';
import { TransactionSource, type TransactionRow } from '@/db/types';
import { useDbQuery } from '@/db/use-db-query.hook';
import { colors } from '@/shared/styles/tokens';
import { showToast } from '@/shared/toast/toast.store';
import { dayKey, formatDayLabel, withDay } from '@/shared/utils/date';
import { formatAmountInput } from '@/shared/utils/money';

import { CategoryChips } from './category-chips.component';
import { styles } from './entry.styles';
import { Keypad } from './keypad.component';
import { describeSaved, saveExpense } from './save-expense';
import { useEntryForm } from './use-entry-form.hook';

const USAGE_WINDOW_MS = 60 * 24 * 60 * 60 * 1000;
const DATE_CHOICES = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface EntryParams {
  [key: string]: string | undefined;
  id?: string; // edit an existing expense
  amountPaise?: string; // confirm a voice draft
  categoryId?: string;
  note?: string;
  rawText?: string;
  source?: string;
}

function toSource(value: string | undefined): TransactionSource {
  return value === TransactionSource.Voice || value === TransactionSource.Shortcut ? value : TransactionSource.Manual;
}

function pinFirst<T extends { id: string }>(items: T[], id: string | null): T[] {
  const pinned = items.find((item) => item.id === id);
  return pinned ? [pinned, ...items.filter((item) => item.id !== id)] : items;
}

function initialFrom(params: EntryParams, existing: TransactionRow | null, defaultCategoryId: string | null) {
  if (existing) {
    return { amountPaise: existing.amountPaise, categoryId: existing.categoryId, note: existing.note, occurredAt: existing.occurredAt };
  }
  const draftAmount = Number(params.amountPaise);
  return {
    amountPaise: Number.isInteger(draftAmount) && draftAmount > 0 ? draftAmount : null,
    categoryId: params.rawText ? (params.categoryId ?? null) : (params.categoryId ?? defaultCategoryId),
    note: params.note ?? '',
    occurredAt: Date.now(),
  };
}

export function EntryScreen() {
  const params = useLocalSearchParams<EntryParams>();
  const insets = useSafeAreaInsets();
  const categories = useDbQuery(() => listCategoriesByUse(Date.now() - USAGE_WINDOW_MS), 'entry-categories');
  const [existing] = useState(() => (params.id ? getTransaction(params.id) : null));
  const [initial] = useState(() => initialFrom(params, existing, categories[0]?.id ?? null));
  const form = useEntryForm(initial);
  // The category chosen when the sheet opened stays first, so it is visible.
  const orderedCategories = pinFirst(categories, initial.categoryId);

  const isConfirm = !existing && Boolean(params.rawText);
  const title = existing ? 'Edit expense' : isConfirm ? 'Check this expense' : 'New expense';

  function close() {
    router.back();
  }

  function save() {
    if (form.amountPaise === null || form.categoryId === null) return;
    if (existing) {
      updateTransaction(existing.id, {
        amountPaise: form.amountPaise,
        categoryId: form.categoryId,
        note: form.note,
        occurredAt: form.occurredAt,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const updated = getTransaction(existing.id);
      showToast({ message: updated ? `Updated ${describeSaved(updated)}` : 'Updated' });
    } else {
      saveExpense({
        amountPaise: form.amountPaise,
        categoryId: form.categoryId,
        note: form.note,
        source: toSource(params.source),
        rawText: params.rawText ?? null,
        occurredAt: form.occurredAt,
      });
    }
    close();
  }

  function confirmDelete() {
    if (!existing) return;
    Alert.alert('Delete this expense?', describeSaved(existing), [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTransaction(existing.id);
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          showToast({ message: 'Expense deleted' });
          close();
        },
      },
    ]);
  }

  function pressKey(key: string) {
    Keyboard.dismiss();
    form.pressKey(key);
  }

  function pickDay() {
    const now = Date.now();
    const keys = Array.from({ length: DATE_CHOICES }, (_, index) => dayKey(now - index * MS_PER_DAY));
    ActionSheetIOS.showActionSheetWithOptions(
      { title: 'When did you spend it?', options: [...keys.map((key) => formatDayLabel(key, now)), 'Cancel'], cancelButtonIndex: keys.length },
      (index) => {
        const key = keys[index];
        if (key) form.setOccurredAt(withDay(form.occurredAt, key));
      },
    );
  }

  // The sheet attaches to its first scroll view, so the whole form is that
  // scroll view; the category chips scroll inside it.
  return (
    <ScrollView
      bounces={false}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="never"
      style={styles.scroll}
      contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 12 }]}>
      <View style={styles.header}>
        {existing ? (
          <Pressable accessibilityRole="button" onPress={confirmDelete} hitSlop={8} style={styles.headerButton}>
            <Text style={styles.deleteText}>Delete</Text>
          </Pressable>
        ) : (
          <View style={styles.headerButton} />
        )}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={close} hitSlop={8} style={[styles.headerButton, styles.closeButton]}>
          <SymbolView name="xmark" size={14} weight="semibold" tintColor={colors.textMuted} />
        </Pressable>
      </View>

      {isConfirm ? (
        <Text style={styles.heard} numberOfLines={2}>
          “{params.rawText}”
        </Text>
      ) : null}

      <View style={styles.amountRow} accessible accessibilityLabel={`Amount ${form.amountText || 'zero'} rupees`}>
        <Text style={styles.currency}>₹</Text>
        <Text style={[styles.amount, !form.amountText && styles.amountEmpty]} adjustsFontSizeToFit numberOfLines={1}>
          {formatAmountInput(form.amountText)}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <TextInput
          value={form.note}
          onChangeText={form.setNote}
          placeholder="Add a note"
          placeholderTextColor={colors.textMuted}
          style={styles.noteInput}
          returnKeyType="done"
          maxLength={60}
          accessibilityLabel="Note"
        />
        <Pressable accessibilityRole="button" accessibilityLabel="Change date" onPress={pickDay} style={styles.datePill}>
          <SymbolView name="calendar" size={14} tintColor={colors.textMuted} />
          <Text style={styles.dateText}>{formatDayLabel(dayKey(form.occurredAt))}</Text>
        </Pressable>
      </View>

      <View style={styles.chips}>
        <CategoryChips categories={orderedCategories} selectedId={form.categoryId} onSelect={form.setCategoryId} />
      </View>

      <View style={styles.keypad}>
        <Keypad onKey={pressKey} />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !form.canSave }}
        disabled={!form.canSave}
        onPress={save}
        style={[styles.saveButton, !form.canSave && styles.saveButtonDisabled]}>
        <Text style={styles.saveText}>
          {form.categoryId === null && form.amountPaise !== null ? 'Pick a category' : existing ? 'Save changes' : 'Save'}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
