import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

export function useSupabase(tableName, initialValue) {
  const storageKey = `dashboard-cache:${tableName}`;
  const metaKey = `dashboard-cache-meta:${tableName}`;
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState(() => {
    try {
      const cachedValue = localStorage.getItem(storageKey);
      return cachedValue ? JSON.parse(cachedValue) : initialValueRef.current;
    } catch {
      return initialValueRef.current;
    }
  });

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      let cachedValue = null;
      let hasDirtyLocalState = false;

      try {
        const rawCachedValue = localStorage.getItem(storageKey);
        cachedValue = rawCachedValue ? JSON.parse(rawCachedValue) : null;
      } catch {
        cachedValue = null;
      }

      try {
        const rawMeta = localStorage.getItem(metaKey);
        const meta = rawMeta ? JSON.parse(rawMeta) : null;
        hasDirtyLocalState = Boolean(meta?.dirty);
      } catch {
        hasDirtyLocalState = false;
      }

      if (cachedValue != null && isMounted) {
        setState(cachedValue);
      }

      const { data } = await supabase
        .from(tableName)
        .select("data")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      // Never overwrite local unsynced data with remote rows.
      if (cachedValue != null && hasDirtyLocalState) {
        setState(cachedValue);
      } else if (cachedValue != null) {
        setState(cachedValue);
      } else if (data?.data != null) {
        setState(data.data);
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.data));
          localStorage.setItem(metaKey, JSON.stringify({ dirty: false }));
        } catch {}
      } else {
        setState(initialValueRef.current);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [storageKey, tableName]);

  async function setAndSave(valueOrUpdater) {
    let nextValue;

    setState((prev) => {
      nextValue = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
      return nextValue;
    });

    try {
      localStorage.setItem(storageKey, JSON.stringify(nextValue));
      localStorage.setItem(metaKey, JSON.stringify({ dirty: true }));
    } catch {}

    const { error } = await supabase.from(tableName).insert({ data: nextValue });

    if (error) {
      console.warn(`Supabase save failed for ${tableName}; using local cache instead.`, error.message);
      return;
    }

    try {
      localStorage.setItem(metaKey, JSON.stringify({ dirty: false }));
    } catch {}
  }

  function clearLocalCache() {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(metaKey);
    } catch {}
    setState(initialValueRef.current);
  }

  return [state, setAndSave, clearLocalCache];
}
