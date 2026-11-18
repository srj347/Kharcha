import { StyleSheet } from 'react-native';

import { colors, fontSizes, MIN_TOUCH_SIZE, radii, spacing } from '@/shared/styles/tokens';

const MIC_SIZE = 92;
const RING_SIZE = 128;

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xxl,
    paddingHorizontal: spacing.xxl,
  },
  micArea: {
    width: RING_SIZE,
    height: RING_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: colors.accentSoft,
  },
  mic: {
    width: MIC_SIZE,
    height: MIC_SIZE,
    borderRadius: MIC_SIZE / 2,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIdle: {
    backgroundColor: colors.accentSoft,
  },
  textBlock: {
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 120,
  },
  pill: {
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.listening,
  },
  pillText: {
    fontSize: fontSizes.caption,
    fontWeight: '500',
    color: colors.text,
  },
  statusPill: {
    height: 28,
    lineHeight: 28,
    fontSize: fontSizes.caption,
    fontWeight: '500',
    color: colors.textMuted,
  },
  transcript: {
    fontSize: 26,
    lineHeight: 33,
    fontWeight: '500',
    letterSpacing: -0.3,
    color: colors.text,
    textAlign: 'center',
  },
  placeholder: {
    fontSize: fontSizes.bodyLarge,
    lineHeight: 24,
    fontWeight: '400',
    color: colors.textMuted,
  },
  hint: {
    fontSize: fontSizes.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  problem: {
    fontSize: fontSizes.body,
    color: colors.text,
    textAlign: 'center',
  },
  linkButton: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
  },
  linkText: {
    fontSize: fontSizes.body,
    fontWeight: '600',
    color: colors.accent,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    height: MIN_TOUCH_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionText: {
    fontSize: fontSizes.body,
    fontWeight: '500',
    color: colors.text,
  },
});
