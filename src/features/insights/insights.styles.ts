import { StyleSheet } from 'react-native';

import { colors, fonts, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

const TREND_HEIGHT = 120;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: MIN_TOUCH_SIZE / 2,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthButtonDisabled: {
    opacity: 0.35,
  },
  monthLabel: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  totalBlock: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  total: {
    fontFamily: fonts.amount,
    fontSize: 48,
    letterSpacing: -1.5,
    color: colors.text,
  },
  totalCaption: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
  sectionTitle: {
    marginTop: spacing.sm,
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
    paddingHorizontal: spacing.xs,
  },
  card: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  emptyText: {
    paddingVertical: spacing.lg,
    textAlign: 'center',
    fontSize: fontSizes.body,
    color: colors.textMuted,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: 10,
  },
  categoryBody: {
    flex: 1,
    gap: 6,
  },
  categoryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  categoryName: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.text,
  },
  categoryAmount: {
    fontFamily: fonts.amount,
    fontSize: fontSizes.body,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  categoryPercent: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  trendCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  trendColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  trendBarArea: {
    height: TREND_HEIGHT,
    width: '100%',
    justifyContent: 'flex-end',
  },
  trendBar: {
    width: '100%',
    borderRadius: 6,
    backgroundColor: colors.surfaceMuted,
  },
  trendBarActive: {
    backgroundColor: colors.accent,
  },
  trendLabel: {
    fontSize: fontSizes.small,
    color: colors.textMuted,
  },
  trendLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
});
