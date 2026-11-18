import { Redirect } from 'expo-router';

import { SHORTCUT_TARGET } from '@/features/shortcut/system-path';

// Fallback for kharcha://record when the system-path rewrite does not run.
export default function RecordRoute() {
  return <Redirect href={SHORTCUT_TARGET} />;
}
