import { StyleSheet } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  scroller: {
    height: 44,
    flexGrow: 0,
  },
  row: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  chip: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingLeft: spacing.sm,
    paddingRight: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  label: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  labelSelected: {
    fontWeight: '600',
  },
});
