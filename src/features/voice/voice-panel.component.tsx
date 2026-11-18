import { SymbolView } from 'expo-symbols';
import { useEffect } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/styles/tokens';

import { VoiceStatus } from './use-voice-capture.hook';
import { styles } from './voice-panel.styles';

const PULSE_MS = 1600;

interface VoicePanelProps {
  status: VoiceStatus;
  transcript: string;
  problem: string | null;
  hint: string | null;
  onPause: () => void;
  onListen: () => void;
  onType: () => void;
}

function openSettings() {
  void Linking.openSettings();
}

export function VoicePanel({ status, transcript, problem, hint, onPause, onListen, onType }: VoicePanelProps) {
  const reduceMotion = useReducedMotion();
  const pulse = useSharedValue(0);
  const listening = status === VoiceStatus.Listening;

  useEffect(() => {
    if (listening && !reduceMotion) {
      pulse.value = 0;
      pulse.value = withRepeat(withTiming(1, { duration: PULSE_MS, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      cancelAnimation(pulse);
      pulse.value = 0;
    }
  }, [listening, reduceMotion, pulse]);

  const ringStyle = useAnimatedStyle(() => ({
    opacity: listening ? 0.9 * (1 - pulse.value) : 0,
    transform: [{ scale: 0.9 + pulse.value * 0.35 }],
  }));

  const micLabel = listening ? 'Listening' : 'Tap to talk';

  return (
    <View style={styles.container}>
      <View style={styles.micArea}>
        <Animated.View style={[styles.ring, ringStyle]} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={listening ? 'Listening. Say an expense.' : 'Start listening'}
          disabled={listening || status === VoiceStatus.Processing}
          onPress={onListen}
          style={[styles.mic, !listening && styles.micIdle]}>
          {status === VoiceStatus.Processing ? (
            <ActivityIndicator color={colors.onAccent} />
          ) : (
            <SymbolView name={listening ? 'waveform' : 'mic.fill'} size={34} tintColor={listening ? colors.onAccent : colors.accent} />
          )}
        </Pressable>
      </View>

      {status === VoiceStatus.Unavailable ? (
        <View style={styles.textBlock}>
          <Text style={styles.problem}>{problem}</Text>
          <Pressable accessibilityRole="button" onPress={openSettings} style={styles.linkButton}>
            <Text style={styles.linkText}>Open Settings</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.textBlock}>
          {status === VoiceStatus.Processing ? (
            <Text style={styles.statusPill}>Reading…</Text>
          ) : (
            <View style={styles.pill} accessibilityLiveRegion="polite">
              {listening ? <View style={styles.dot} /> : null}
              <Text style={styles.pillText}>{status === VoiceStatus.Paused ? 'Paused' : micLabel}</Text>
            </View>
          )}
          <Text style={[styles.transcript, !transcript && styles.placeholder]} numberOfLines={3}>
            {transcript || (listening ? 'Say it like “500 on Swiggy”' : 'Tap the mic and say an expense')}
          </Text>
          {hint && !transcript ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      )}

      <View style={styles.actions}>
        {listening ? (
          <Pressable accessibilityRole="button" onPress={onPause} style={styles.actionButton}>
            <SymbolView name="pause.fill" size={14} tintColor={colors.text} />
            <Text style={styles.actionText}>Pause</Text>
          </Pressable>
        ) : null}
        <Pressable accessibilityRole="button" onPress={onType} style={styles.actionButton}>
          <SymbolView name="keyboard" size={16} tintColor={colors.text} />
          <Text style={styles.actionText}>Type instead</Text>
        </Pressable>
      </View>
    </View>
  );
}
