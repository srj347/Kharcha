import { StyleSheet } from 'react-native';

import { colors, fontSizes, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.sm,
  },
  group: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  footnote: {
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.caption,
    lineHeight: 18,
    color: colors.textMuted,
  },
  version: {
    marginTop: spacing.xxxl,
    textAlign: 'center',
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
});
