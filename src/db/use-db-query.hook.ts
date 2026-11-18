import { useEffect, useEffectEvent, useState } from 'react';

import { subscribeDataVersion } from './data-version';

interface QueryState<T> {
  key: string;
  value: T;
}

// Runs a synchronous repository query and re-runs it after every database
// write. The result lives in state, so the React Compiler cannot serve a
// stale cached value. `key` must change when the query's inputs change.
export function useDbQuery<T>(query: () => T, key: string): T {
  const [state, setState] = useState<QueryState<T>>(() => ({ key, value: query() }));

  const refresh = useEffectEvent(() => {
    setState({ key, value: query() });
  });

  useEffect(() => subscribeDataVersion(refresh), []);

  // Inputs changed: re-run during render (React's "adjust state on prop change").
  if (state.key !== key) {
    const next = { key, value: query() };
    setState(next);
    return next.value;
  }
  return state.value;
}
