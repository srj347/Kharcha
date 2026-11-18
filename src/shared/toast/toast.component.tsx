import { SymbolView } from 'expo-symbols';
import { useSyncExternalStore } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FullWindowOverlay } from 'react-native-screens';

import { colors } from '@/shared/styles/tokens';

import { getToast, hideToast, subscribeToast } from './toast.store';
import { styles, TOP_OFFSET } from './toast.styles';

export function ToastHost() {
  const toast = useSyncExternalStore(subscribeToast, getToast);
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  function handleAction() {
    toast?.onAction?.();
    hideToast();
  }

  // FullWindowOverlay draws above native views (sheets, tab bar). The toast
  // sits at the top: the iOS 26 tab bar area swallows touches at the bottom.
  return (
    <FullWindowOverlay>
    <Animated.View
      key={toast.id}
      entering={FadeInUp.duration(180)}
      exiting={FadeOutUp.duration(160)}
      pointerEvents="box-none"
      style={[styles.wrapper, { top: insets.top + TOP_OFFSET }]}>
      <View style={styles.toast} accessibilityLiveRegion="polite" accessibilityRole="alert">
        <View style={styles.check}>
          <SymbolView name="checkmark" size={14} weight="bold" tintColor={colors.onAccent} />
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {toast.message}
        </Text>
        {toast.actionLabel ? (
          <Pressable accessibilityRole="button" onPress={handleAction} hitSlop={8} style={styles.action}>
            <Text style={styles.actionText}>{toast.actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
    </FullWindowOverlay>
  );
}
