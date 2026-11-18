import { apple, type AppleModelAvailability } from '@react-native-ai/apple';

import { createExtractor } from './model-extractor';

const LOCALE = 'en-IN';

export async function getModelAvailability(): Promise<AppleModelAvailability> {
  try {
    const info = await apple.getModelInfo({ locale: LOCALE });
    return info.availability;
  } catch (error: unknown) {
    console.warn('[extract] getModelInfo failed', error);
    return 'unknown';
  }
}

export async function prewarmModel(): Promise<void> {
  try {
    await apple().prepare();
  } catch (error: unknown) {
    console.warn('[extract] prepare failed', error);
  }
}

export const extractWithAppleModel = createExtractor(() => apple());
