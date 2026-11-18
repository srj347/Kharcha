import { router, Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { listCategories } from '@/db/categories.repo';
import { useDbQuery } from '@/db/use-db-query.hook';
import { CategoryIcon } from '@/shared/components/category-icon.component';
import { HeaderButton } from '@/shared/components/header-button.component';
import { ListRow } from '@/shared/components/list-row.component';

import { styles } from './categories.styles';

function openEditor(id?: string) {
  router.push(id ? { pathname: '/settings/category', params: { id } } : '/settings/category');
}

function openNewCategory() {
  openEditor();
}

function AddButton() {
  return <HeaderButton label="Add" accessibilityLabel="Add category" onPress={openNewCategory} />;
}

export function CategoriesScreen() {
  const categories = useDbQuery(() => listCategories(), 'categories-list');

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <Stack.Screen options={{ headerRight: AddButton }} />
      <View>
        {categories.map((category, index) => (
          <ListRow
            key={category.id}
            first={index === 0}
            last={index === categories.length - 1}
            leading={<CategoryIcon icon={category.icon} tint={category.tint} size="small" />}
            label={category.name}
            onPress={() => openEditor(category.id)}
          />
        ))}
      </View>
      <Text style={styles.footnote}>
        The AI picks from these categories. Add words that belong to a category, like shop names, so it chooses better.
      </Text>
    </ScrollView>
  );
}
