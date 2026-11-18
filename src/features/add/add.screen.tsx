import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { SymbolView } from 'expo-symbols';
import { AppState, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { listCategories } from '@/db/categories.repo';
import { dayTotal } from '@/db/transactions.repo';
import { TransactionSource } from '@/db/types';
import { useDbQuery } from '@/db/use-db-query.hook';
import { saveExpense } from '@/features/entry/save-expense';
import { extractWithAppleModel, getModelAvailability, prewarmModel } from '@/features/extract/apple-extractor';
import { ExtractionDecision } from '@/features/extract/extraction.types';
import { runExtraction } from '@/features/extract/run-extraction';
import { withSimulatorStandIn } from '@/features/extract/simulator-stand-in';
import { useVoiceCapture } from '@/features/voice/use-voice-capture.hook';
import { VoicePanel } from '@/features/voice/voice-panel.component';
import { useNow } from '@/shared/hooks/use-now.hook';
import { colors } from '@/shared/styles/tokens';
import { dayKey } from '@/shared/utils/date';
import { formatINR } from '@/shared/utils/money';

import { styles } from './add.styles';
import { DevSentenceInput } from './dev-sentence-input.component';
import { JustAdded } from './just-added.component';

const extract = withSimulatorStandIn(extractWithAppleModel);
const NOT_AN_EXPENSE_HINT = 'That did not sound like an expense. Try again.';

function openKeypad() {
  router.push('/entry');
}

// Shown when Apple's on-device model cannot be used. Voice still works, but
// every expense waits on the confirm card.
function modelHintFor(availability: string): string {
  if (availability === 'appleIntelligenceNotEnabled') {
    return 'Turn on Apple Intelligence (Settings › Apple Intelligence & Siri) so Kharcha can read your expenses. Until then, you confirm each one.';
  }
  if (availability === 'modelNotReady') {
    return 'Apple Intelligence is still getting ready. Until then, you confirm each expense.';
  }
  return 'The on-device AI is not available on this iPhone, so you confirm each expense.';
}

function openSettings() {
  router.push('/settings');
}

function useAppIsActive(): boolean {
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setActive(state === 'active'));
    return () => subscription.remove();
  }, []);
  return active;
}

export function AddScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ src?: string }>();
  const isFocused = useIsFocused();
  const appActive = useAppIsActive();
  const today = dayKey(useNow());
  const todayTotal = useDbQuery(() => dayTotal(today), `today-${today}`);
  const categories = useDbQuery(() => listCategories(), 'add-categories');
  const [hint, setHint] = useState<string | null>(null);
  const [modelHint, setModelHint] = useState<string | null>(null);
  // Set by a shortcut launch (kharcha://record) and used for the next expense only.
  const shortcutLaunch = useRef(false);

  useEffect(() => {
    if (params.src === 'shortcut') {
      shortcutLaunch.current = true;
      router.setParams({ src: undefined });
    }
  }, [params.src]);

  useEffect(() => {
    void prewarmModel();
    void getModelAvailability().then((availability) => {
      if (availability !== 'available') {
        console.warn('[extract] Apple model not available:', availability);
        setModelHint(modelHintFor(availability));
      }
    });
  }, []);

  async function handleSentence(sentence: string) {
    setHint(null);
    const outcome = await runExtraction(sentence, extract);
    const { draft } = outcome;
    const source = shortcutLaunch.current ? TransactionSource.Shortcut : TransactionSource.Voice;
    if (outcome.decision !== ExtractionDecision.Ignore) shortcutLaunch.current = false;
    if (outcome.decision === ExtractionDecision.AutoSave && draft.amountPaise !== null && draft.categoryId !== null) {
      saveExpense({ amountPaise: draft.amountPaise, categoryId: draft.categoryId, note: draft.note, source, rawText: draft.rawText });
    } else if (outcome.decision === ExtractionDecision.Ignore) {
      setHint(NOT_AN_EXPENSE_HINT);
    } else {
      router.push({
        pathname: '/entry',
        params: {
          amountPaise: draft.amountPaise === null ? undefined : String(draft.amountPaise),
          categoryId: draft.categoryId ?? undefined,
          note: draft.note,
          rawText: draft.rawText,
          source,
        },
      });
    }
  }

  const voice = useVoiceCapture({ active: isFocused && appActive, categories, onSentence: handleSentence });

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLabel}>Today</Text>
          <Text style={styles.headerValue}>{formatINR(todayTotal)} spent</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={openSettings} style={styles.iconButton}>
          <SymbolView name="gearshape" size={18} tintColor={colors.text} />
        </Pressable>
      </View>

      <View style={styles.center}>
        <VoicePanel
          status={voice.status}
          transcript={voice.transcript}
          problem={voice.problem}
          hint={hint}
          onPause={voice.pause}
          onListen={voice.listen}
          onType={openKeypad}
        />
        {modelHint ? <Text style={styles.modelHint}>{modelHint}</Text> : null}
        {__DEV__ ? <DevSentenceInput onSubmit={handleSentence} /> : null}
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + 72 }]}>
        <JustAdded />
      </View>
    </View>
  );
}
