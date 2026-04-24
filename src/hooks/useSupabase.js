import { useRef, useState } from "react";

export function useSupabase(tableName, initialValue) {
  const storageKey = `dashboard-cache:${tableName}`;
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState(() => {
    try {
      const cachedValue = localStorage.getItem(storageKey);
      return cachedValue ? JSON.parse(cachedValue) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  });
  const stateRef = useRef(state);
  stateRef.current = state;

  function setAndSave(valueOrUpdater) {
    const nextValue = typeof valueOrUpdater === "function" ? valueOrUpdater(stateRef.current) : valueOrUpdater;
    setState(nextValue);
    stateRef.current = nextValue;

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextValue));
    } catch {
      // Ignore storage failures and keep in-memory state.
    }
  }

  function clearLocalCache() {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage failures and still reset local state.
    }
    setState(initialValueRef.current);
    stateRef.current = initialValueRef.current;
  }

  return [state, setAndSave, clearLocalCache];
}
