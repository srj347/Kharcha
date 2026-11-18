import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

const REFRESH_MS = 30_000;

// The current time as state, refreshed every 30 s and when the app returns to
// the foreground. Keeps render pure (no Date.now() during render).
export function useNow(): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), REFRESH_MS);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);

  return now;
}
