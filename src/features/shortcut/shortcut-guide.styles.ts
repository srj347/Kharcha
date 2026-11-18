import { StyleSheet } from 'react-native';

import { colors, fontSizes, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    gap: spacing.md,
    paddingBottom: 60,
  },
  lead: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: 24,
    color: colors.text,
  },
  label: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xs,
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  card: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
  },
  step: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  stepDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: fontSizes.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  stepText: {
    flex: 1,
    fontSize: fontSizes.body,
    lineHeight: 21,
    color: colors.text,
  },
  note: {
    paddingHorizontal: spacing.xs,
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  button: {
    marginTop: spacing.xl,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.onAccent,
  },
});
