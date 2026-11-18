import { StyleSheet } from 'react-native';

import { colors, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  top: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  title: {
    fontSize: fontSizes.title,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: colors.text,
  },
  search: {
    height: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceMuted,
  },
  searchInput: {
    flex: 1,
    height: MIN_TOUCH_SIZE,
    fontSize: 16,
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  headerLabel: {
    fontSize: fontSizes.caption,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  headerTotal: {
    fontSize: fontSizes.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  rowWrap: {
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  rowFirst: {
    borderTopLeftRadius: radii.md,
    borderTopRightRadius: radii.md,
  },
  rowLast: {
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 68,
    backgroundColor: colors.border,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 80,
    paddingHorizontal: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSizes.bodyLarge,
    fontWeight: '600',
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
