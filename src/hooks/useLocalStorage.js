import { useState, useEffect } from 'react';

/**
 * Drop-in replacement for useState that persists data in localStorage.
 * Data survives navigation, page refresh, and browser restart.
 *
 * @param {string} key       - Base key name (e.g. 'dashboard-plans')
 * @param {*}      initialValue - Default value if nothing stored yet
 * @param {number} version   - Bump this (1→2) when you change the data shape
 */
export function useLocalStorage(key, initialValue, version = 1) {
  const versionedKey = `${key}__v${version}`;

  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(versionedKey);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(versionedKey, JSON.stringify(state));
    } catch (e) {
      console.warn('localStorage write failed:', e);
    }
  }, [versionedKey, state]);

  return [state, setState];
}
