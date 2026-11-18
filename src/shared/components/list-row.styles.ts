import { StyleSheet } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  row: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
  },
  first: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  last: {
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  pressed: {
    backgroundColor: colors.surfaceMuted,
  },
  divider: {
    position: 'absolute',
    top: 0,
    left: 48,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  label: {
    flex: 1,
    fontSize: fontSizes.bodyLarge,
    color: colors.text,
  },
  destructive: {
    color: colors.danger,
  },
  value: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
});
