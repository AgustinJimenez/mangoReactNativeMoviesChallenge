import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 400;

export const useDebouncedValue = <T>(value: T, delayMs: number = DEFAULT_DELAY_MS): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debouncedValue;
};
