import { useEffect, useState } from "react";

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
    localStorage.setItem(versionedKey, JSON.stringify(state));
  }, [state, versionedKey]);

  return [state, setState];
}
