import * as Device from 'expo-device';

// DEVELOPMENT ONLY. In the iOS simulator, microphone input goes through the
// Mac. Without microphone access for Simulator on the Mac, CoreAudio
// deadlocks and iOS kills the app ("Initialize: RPC timeout. Apparently
// deadlocked"). So voice input is off in the simulator by default; use the DEV
// sentence field instead. After allowing Simulator in macOS Settings › Privacy
// & Security › Microphone, set this to true to try real speech.
const SIMULATOR_VOICE_INPUT = false;

export const voiceInputBlockedInSimulator = !Device.isDevice && !SIMULATOR_VOICE_INPUT;
