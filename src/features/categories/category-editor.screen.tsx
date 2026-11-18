import * as Haptics from 'expo-haptics';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { archiveCategory, CategoryNameTakenError, createCategory, getCategory, updateCategory } from '@/db/categories.repo';
import { CATEGORY_TINTS, type CategoryTint } from '@/db/types';
import { CategoryIcon } from '@/shared/components/category-icon.component';
import { HeaderButton } from '@/shared/components/header-button.component';
import { CATEGORY_SYMBOLS } from '@/shared/constants/category-icons';
import { colors, tintColors } from '@/shared/styles/tokens';

import { styles } from './category-editor.styles';

const DEFAULT_ICON = 'square.grid.2x2';

export function CategoryEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [existing] = useState(() => (id ? getCategory(id) : null));
  const [name, setName] = useState(existing?.name ?? '');
  const [icon, setIcon] = useState(existing?.icon ?? DEFAULT_ICON);
  const [tint, setTint] = useState<CategoryTint>(existing?.tint ?? 'green');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [keywords, setKeywords] = useState(existing?.keywords ?? '');
  const canSave = name.trim().length > 0;

  function save() {
    if (!canSave) return;
    const input = { name, icon, tint, description, keywords };
    try {
      if (existing) updateCategory(existing.id, input);
      else createCategory(input);
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error: unknown) {
      const message = error instanceof CategoryNameTakenError ? error.message : 'The category could not be saved.';
      Alert.alert('Cannot save', message);
    }
  }

  function confirmArchive() {
    if (!existing) return;
    Alert.alert(`Remove ${existing.name}?`, 'Past expenses keep this category. It will not show in pickers or be used by the AI.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          try {
            archiveCategory(existing.id);
            router.back();
          } catch (error: unknown) {
            Alert.alert('Cannot remove', error instanceof Error ? error.message : 'Try again.');
          }
        },
      },
    ]);
  }

  function SaveButton() {
    return <HeaderButton label="Save" onPress={save} disabled={!canSave} />;
  }

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: existing ? 'Edit category' : 'New category', headerRight: SaveButton }} />

      <View style={styles.preview}>
        <CategoryIcon icon={icon} tint={tint} />
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor={colors.textMuted}
          style={styles.nameInput}
          maxLength={24}
          autoFocus={!existing}
          accessibilityLabel="Category name"
        />
      </View>

      <Text style={styles.label}>COLOUR</Text>
      <View style={styles.tints}>
        {CATEGORY_TINTS.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="radio"
            accessibilityLabel={value}
            accessibilityState={{ selected: value === tint }}
            onPress={() => setTint(value)}
            style={[styles.tint, { backgroundColor: tintColors[value].foreground }, value === tint && styles.tintSelected]}>
            {value === tint ? <SymbolView name="checkmark" size={14} weight="bold" tintColor={colors.onAccent} /> : null}
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>ICON</Text>
      <View style={styles.icons}>
        {CATEGORY_SYMBOLS.map((symbol) => {
          const selected = symbol === icon;
          return (
            <Pressable
              key={symbol}
              accessibilityRole="radio"
              accessibilityLabel={symbol.replace(/\./g, ' ')}
              accessibilityState={{ selected }}
              onPress={() => setIcon(symbol)}
              style={[styles.iconCell, selected && { backgroundColor: tintColors[tint].background, borderColor: tintColors[tint].foreground }]}>
              <SymbolView name={symbol} size={20} tintColor={selected ? tintColors[tint].foreground : colors.textMuted} />
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>HELP THE AI CHOOSE IT</Text>
      <View style={styles.field}>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="What it covers, e.g. vet visits and pet food"
          placeholderTextColor={colors.textMuted}
          style={styles.fieldInput}
          maxLength={120}
          accessibilityLabel="Description"
        />
        <View style={styles.fieldDivider} />
        <TextInput
          value={keywords}
          onChangeText={setKeywords}
          placeholder="Words, comma separated, e.g. supertails, vet"
          placeholderTextColor={colors.textMuted}
          style={styles.fieldInput}
          autoCapitalize="none"
          maxLength={300}
          accessibilityLabel="Keywords"
        />
      </View>

      {existing ? (
        <Pressable accessibilityRole="button" onPress={confirmArchive} style={styles.removeButton}>
          <Text style={styles.removeText}>Remove category</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
}
