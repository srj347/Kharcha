import { ExpoSpeechRecognitionModule, TaskHintIOS, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { voiceInputBlockedInSimulator } from './simulator-voice';
import { contextualWords, nextListeningStep, TICK_MS, type ListeningClock } from './voice-timing';

const LANGUAGE = 'en-IN';

export enum VoiceStatus {
  Idle = 'idle', // not listening; "Tap to talk"
  Listening = 'listening',
  Processing = 'processing', // the model is reading the sentence
  Paused = 'paused', // the user paused; only a tap resumes
  Unavailable = 'unavailable', // no permission or no on-device recognition
}

interface UseVoiceCaptureOptions {
  // True while the Add tab is focused and the app is in the foreground.
  active: boolean;
  categories: { name: string; keywords: string }[];
  onSentence: (sentence: string) => Promise<void>;
}

export function useVoiceCapture({ active, categories, onSentence }: UseVoiceCaptureOptions) {
  const [status, setStatus] = useState<VoiceStatus>(VoiceStatus.Idle);
  const [transcript, setTranscript] = useState('');
  const [problem, setProblem] = useState<string | null>(null);
  const clock = useRef<ListeningClock | null>(null);
  // Listening starts by itself once per focus or foreground; after a timeout
  // or a pause, only a tap starts it again.
  const autoArmed = useRef(true);
  // The latest `active` value, read after awaits so a late start cannot begin
  // listening on a screen the user already left.
  const activeRef = useRef(false);

  async function start() {
    if (voiceInputBlockedInSimulator) {
      setProblem(__DEV__ ? 'Voice input is off in the simulator. Use the DEV field below.' : 'Voice input is off in the simulator. Use Type instead.');
      setStatus(VoiceStatus.Unavailable);
      return;
    }
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!activeRef.current) return;
      if (!permission.granted) {
        setProblem('Allow the microphone and speech recognition in Settings to add expenses by voice.');
        setStatus(VoiceStatus.Unavailable);
        return;
      }
      if (!ExpoSpeechRecognitionModule.supportsOnDeviceRecognition()) {
        setProblem('On-device speech recognition is not available on this iPhone.');
        setStatus(VoiceStatus.Unavailable);
        return;
      }
      setProblem(null);
      setTranscript('');
      clock.current = { startedAt: Date.now(), lastHeardAt: null, transcript: '' };
      setStatus(VoiceStatus.Listening);
      ExpoSpeechRecognitionModule.start({
        lang: LANGUAGE,
        interimResults: true,
        continuous: true,
        requiresOnDeviceRecognition: true,
        addsPunctuation: false,
        contextualStrings: contextualWords(categories),
        iosTaskHint: TaskHintIOS.dictation,
      });
    } catch (error: unknown) {
      console.warn('[voice] start failed', error);
      clock.current = null;
      setStatus(VoiceStatus.Idle);
    }
  }

  function stopRecognition() {
    clock.current = null;
    ExpoSpeechRecognitionModule.abort();
  }

  async function finish(sentence: string) {
    stopRecognition();
    setStatus(VoiceStatus.Processing);
    try {
      await onSentence(sentence);
    } finally {
      setTranscript('');
      setStatus(VoiceStatus.Idle);
    }
  }

  const tick = useEffectEvent(() => {
    const current = clock.current;
    if (!current || status !== VoiceStatus.Listening) return;
    const step = nextListeningStep(current, Date.now());
    if (step === 'finish') {
      void finish(current.transcript.trim());
    } else if (step === 'timeout') {
      autoArmed.current = false;
      stopRecognition();
      setTranscript('');
      setStatus(VoiceStatus.Idle);
    }
  });

  useEffect(() => {
    const timer = setInterval(tick, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useSpeechRecognitionEvent('result', (event) => {
    const text = event.results[0]?.transcript ?? '';
    if (!clock.current || !text) return;
    if (text !== clock.current.transcript) {
      clock.current = { ...clock.current, transcript: text, lastHeardAt: Date.now() };
      setTranscript(text);
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted') return; // we stopped it ourselves
    console.warn('[voice] recognition error', event.error, event.message);
    clock.current = null;
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
      setProblem('Speech recognition is not allowed or not supported. Check Settings › Kharcha.');
      setStatus(VoiceStatus.Unavailable);
    } else {
      autoArmed.current = false;
      setStatus(VoiceStatus.Idle);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    // iOS can end a session by itself. Keep whatever was heard.
    const current = clock.current;
    if (!current) return;
    if (current.transcript.trim()) {
      void finish(current.transcript.trim());
    } else {
      clock.current = null;
      setStatus(VoiceStatus.Idle);
    }
  });

  // Start on focus / foreground; stop as soon as the screen is left.
  const sync = useEffectEvent((isActive: boolean) => {
    const becameActive = isActive && !activeRef.current;
    activeRef.current = isActive;
    if (isActive) {
      // Back from the Settings app (permission maybe granted): try once more.
      if (becameActive && status === VoiceStatus.Unavailable && !voiceInputBlockedInSimulator) {
        void start();
        return;
      }
      if (autoArmed.current && status === VoiceStatus.Idle) void start();
    } else {
      autoArmed.current = true;
      if (status === VoiceStatus.Listening) {
        stopRecognition();
        setTranscript('');
        setStatus(VoiceStatus.Idle);
      }
    }
  });

  useEffect(() => {
    // Keeps the native recognizer in step with focus; resetting the UI state
    // when the screen is left is part of that synchronisation.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    sync(active);
  }, [active, status]);

  useEffect(() => () => ExpoSpeechRecognitionModule.abort(), []);

  function pause() {
    autoArmed.current = false;
    stopRecognition();
    setTranscript('');
    setStatus(VoiceStatus.Paused);
  }

  function listen() {
    if (status === VoiceStatus.Listening || status === VoiceStatus.Processing) return;
    void start();
  }

  // After each sentence the hook listens again by itself (the 8 s idle rule
  // then stops it), so the user can say several expenses in a row.
  return { status, transcript, problem, pause, listen };
}
