import { useRef, type ComponentRef } from 'react';
import { TextInput } from 'react-native';

import { colors } from '@/shared/styles/tokens';

import { styles } from './dev-sentence-input.styles';

interface DevSentenceInputProps {
  onSubmit: (sentence: string) => Promise<void>;
}

// DEVELOPMENT ONLY (rendered behind __DEV__). Sends a typed sentence through
// the same path as a spoken one, because the simulator has no voice input.
// Uncontrolled, so fast simulator typing does not drop characters.
export function DevSentenceInput({ onSubmit }: DevSentenceInputProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const text = useRef('');

  function submit() {
    const sentence = text.current.trim();
    if (!sentence) return;
    text.current = '';
    input.current?.clear();
    void onSubmit(sentence);
  }

  return (
    <TextInput
      ref={input}
      onChangeText={(value) => {
        text.current = value;
      }}
      onSubmitEditing={submit}
      placeholder="DEV: type a spoken sentence"
      placeholderTextColor={colors.textMuted}
      returnKeyType="send"
      autoCapitalize="none"
      autoCorrect={false}
      accessibilityLabel="Developer sentence input"
      style={styles.input}
    />
  );
}
