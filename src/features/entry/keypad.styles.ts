import { StyleSheet } from 'react-native';

import { colors, fonts, radii, spacing } from '@/shared/styles/tokens';

export const KEY_HEIGHT = 54;

export const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  key: {
    flex: 1,
    height: KEY_HEIGHT,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: colors.surfaceMuted,
  },
  keyText: {
    fontFamily: fonts.amountMedium,
    fontSize: 24,
    color: colors.text,
  },
});
