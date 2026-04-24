import { useRef } from "react";
import { useLocalStorage } from "./useLocalStorage";

export function useSupabase(tableName, initialValue) {
  const storageKey = `dashboard-cache:${tableName}`;
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useLocalStorage(storageKey, initialValueRef.current);
  const stateRef = useRef(state);
  stateRef.current = state;

  function setAndSave(valueOrUpdater) {
    const nextValue = typeof valueOrUpdater === "function" ? valueOrUpdater(stateRef.current) : valueOrUpdater;
    setState(nextValue);
    stateRef.current = nextValue;
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
