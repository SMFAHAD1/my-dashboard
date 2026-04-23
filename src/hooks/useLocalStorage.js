// src/hooks/useLocalStorage.js
// Drop-in replacement for useState that persists to localStorage.
// Usage:  const [value, setValue] = useLocalStorage("my-key", defaultValue);

import { useState, useEffect } from "react";

export function useLocalStorage(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      // localStorage full or unavailable — fail silently
    }
  }, [key, state]);

  return [state, setState];
}
