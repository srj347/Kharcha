import * as Haptics from 'expo-haptics';
import { Pressable, ScrollView, Text } from 'react-native';

import type { Category } from '@/db/types';
import { CategoryIcon } from '@/shared/components/category-icon.component';

import { styles } from './category-chips.styles';

interface CategoryChipsProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  function select(id: string) {
    void Haptics.selectionAsync();
    onSelect(id);
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentInsetAdjustmentBehavior="never"
      automaticallyAdjustContentInsets={false}
      style={styles.scroller}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled">
      {categories.map((category) => {
        const selected = category.id === selectedId;
        return (
          <Pressable
            key={category.id}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            accessibilityLabel={category.name}
            onPress={() => select(category.id)}
            style={[styles.chip, selected && styles.chipSelected]}>
            <CategoryIcon icon={category.icon} tint={category.tint} size="small" />
            <Text style={[styles.label, selected && styles.labelSelected]}>{category.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
