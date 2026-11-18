import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, spacing } from '@/shared/styles/tokens';

export const ROW_HEIGHT = 64;

export const styles = StyleSheet.create({
  row: {
    height: ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.text,
  },
  meta: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  amount: {
    fontFamily: fonts.amount,
    fontSize: fontSizes.bodyLarge,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
