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

export function useLocalStorage(key, initialValue, version = 1) {
  const versionedKey = `${key}__v${version}`;
  const { authReady, currentUser, dashboardData, updateDashboardData } = useAuth();
  const initialValueRef = useRef(resolveInitialValue(initialValue));
  const [state, setState] = useState(() => initialValueRef.current);
  const isHydratedRef = useRef(false);
  const lastSyncedRef = useRef(serialize(initialValueRef.current));

  useEffect(() => {
    if (!authReady) return;

    const fallbackValue = initialValueRef.current;
    const nextState =
      currentUser && Object.prototype.hasOwnProperty.call(dashboardData, versionedKey)
        ? dashboardData[versionedKey]
        : fallbackValue;

    setState(nextState);
    lastSyncedRef.current = serialize(nextState);
    isHydratedRef.current = true;
  }, [authReady, currentUser, dashboardData, versionedKey]);

  useEffect(() => {
    if (!authReady || !currentUser || !isHydratedRef.current) return;

    const serializedState = serialize(state);
    if (serializedState === lastSyncedRef.current) return;

    lastSyncedRef.current = serializedState;
    void updateDashboardData(versionedKey, state);
  }, [authReady, currentUser, state, updateDashboardData, versionedKey]);

  return [state, setState];
}
