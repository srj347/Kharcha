import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.background,
  },
  container: {
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  headerButton: {
    minWidth: 64,
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
  },
  closeButton: {
    alignItems: 'flex-end',
    paddingRight: spacing.xs,
  },
  title: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  deleteText: {
    fontSize: fontSizes.body,
    color: colors.danger,
    paddingLeft: spacing.xs,
  },
  heard: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xxl,
    textAlign: 'center',
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  currency: {
    fontFamily: fonts.amountMedium,
    fontSize: 28,
    color: colors.textMuted,
    marginTop: 12,
  },
  amount: {
    fontFamily: fonts.amount,
    fontSize: fontSizes.amountLarge,
    letterSpacing: -2,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  amountEmpty: {
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.md,
  },
  noteInput: {
    flex: 1,
    height: MIN_TOUCH_SIZE,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  datePill: {
    height: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
  },
  dateText: {
    fontSize: fontSizes.body,
    color: colors.text,
  },
  chips: {
    marginTop: spacing.md,
  },
  keypad: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  saveButton: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.xl,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.4,
  },
  saveText: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.onAccent,
  },
});
