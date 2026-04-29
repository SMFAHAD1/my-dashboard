import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

function resolveInitialValue(initialValue) {
  return typeof initialValue === "function" ? initialValue() : initialValue;
}

function serialize(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return "";
  }
}

export function useFirestoreState(key, initialValue, version = 1) {
  const versionedKey = `${key}__v${version}`;
  const { authReady, currentUser, dashboardData, updateDashboardData } = useAuth();
  const initialValueRef = useRef(resolveInitialValue(initialValue));
  const [state, setState] = useState(() => initialValueRef.current);
  const isHydratedRef = useRef(false);
  const lastSyncedRef = useRef(serialize(initialValueRef.current));
  const storedValue = dashboardData[versionedKey];
  const hasStoredValue = Object.prototype.hasOwnProperty.call(dashboardData, versionedKey);

  useEffect(() => {
    if (!authReady) return;

    const fallbackValue = initialValueRef.current;
    const nextState = currentUser && hasStoredValue ? storedValue : fallbackValue;

    setState(nextState);
    lastSyncedRef.current = serialize(nextState);
    isHydratedRef.current = true;
  }, [authReady, currentUser, hasStoredValue, storedValue]);

  useEffect(() => {
    if (!authReady || !currentUser || !isHydratedRef.current) return;

    const serializedState = serialize(state);
    if (serializedState === lastSyncedRef.current) return;

    lastSyncedRef.current = serializedState;
    void updateDashboardData(versionedKey, state);
  }, [authReady, currentUser, state, updateDashboardData, versionedKey]);

  return [state, setState];
}

export const useLocalStorage = useFirestoreState;
