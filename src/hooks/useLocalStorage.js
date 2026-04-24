import { useEffect, useRef, useState } from "react";

function getStorageKey(key, version) {
  return version ? `${key}__v${version}` : key;
}

function resolveInitialValue(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

function readStoredValue(storageKey, fallbackValue) {
  if (typeof window === "undefined") {
    return fallbackValue;
  }

  try {
    const storedValue = window.localStorage.getItem(storageKey);
    return storedValue !== null ? JSON.parse(storedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function useLocalStorage(key, initialValue, version = null) {
  const storageKey = getStorageKey(key, version);
  const initialValueRef = useRef(resolveInitialValue(initialValue));
  const [state, setState] = useState(() => {
    return readStoredValue(storageKey, initialValueRef.current);
  });

  useEffect(() => {
    setState(readStoredValue(storageKey, initialValueRef.current));
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore storage failures and keep state in memory.
    }
  }, [state, storageKey]);

  return [state, setState];
}
