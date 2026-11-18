import { SymbolView } from 'expo-symbols';
import { View } from 'react-native';

import type { CategoryTint } from '@/db/types';
import { toCategorySymbol } from '@/shared/constants/category-icons';
import { tintColors } from '@/shared/styles/tokens';

import { styles } from './category-icon.styles';

interface CategoryIconProps {
  icon: string;
  tint: CategoryTint;
  size?: 'small' | 'regular';
}

const TILE_SIZE = { small: 28, regular: 40 } as const;
const SYMBOL_SIZE = { small: 15, regular: 19 } as const;

export function CategoryIcon({ icon, tint, size = 'regular' }: CategoryIconProps) {
  const palette = tintColors[tint];
  const tile = TILE_SIZE[size];
  return (
    <View
      accessible={false}
      style={[styles.tile, { width: tile, height: tile, borderRadius: tile * 0.3, backgroundColor: palette.background }]}>
      <SymbolView name={toCategorySymbol(icon)} size={SYMBOL_SIZE[size]} tintColor={palette.foreground} />
    </View>
  );
}
