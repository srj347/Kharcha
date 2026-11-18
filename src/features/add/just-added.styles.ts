import { StyleSheet } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  heading: {
    fontSize: fontSizes.small,
    fontWeight: '600',
    letterSpacing: 0.4,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  card: {
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    backgroundColor: colors.border,
  },
  empty: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
});
