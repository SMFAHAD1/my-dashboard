import { useEffect, useRef, useState } from "react";

function getStorageKey(key, version) {
  return version ? `${key}__v${version}` : key;
}

export function useLocalStorage(key, initialValue, version = null) {
  const storageKey = getStorageKey(key, version);
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState(() => {
    try {
      const storedValue = localStorage.getItem(storageKey);
      return storedValue !== null ? JSON.parse(storedValue) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore storage failures and keep state in memory.
    }
  }, [state, storageKey]);

  return [state, setState];
}
