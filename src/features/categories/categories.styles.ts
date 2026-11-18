import { StyleSheet } from 'react-native';

import { colors, fontSizes, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
  },
  footnote: {
    paddingHorizontal: spacing.lg,
    fontSize: fontSizes.caption,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
