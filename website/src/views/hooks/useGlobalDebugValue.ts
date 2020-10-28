import { useState, useDebugValue } from 'react';

import { DEBUG_HOOK_NAMES } from 'types/vendor/window.d';

export default function useGlobalDebugValue<T>(name: DEBUG_HOOK_NAMES, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);

  useDebugValue(name);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)[name] = setValue;

  return value;
}
