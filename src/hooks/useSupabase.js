import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

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

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      let cachedValue = null;

      try {
        const rawCachedValue = localStorage.getItem(storageKey);
        cachedValue = rawCachedValue ? JSON.parse(rawCachedValue) : null;
      } catch {
        cachedValue = null;
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

      // Prefer local cached data when present because remote writes are
      // currently blocked by RLS and older remote rows can overwrite new input.
      if (cachedValue != null) {
        setState(cachedValue);
      } else if (data?.data != null) {
        setState(data.data);
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.data));
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
    } catch {}

    const { error } = await supabase.from(tableName).insert({ data: nextValue });

    if (error) {
      console.warn(`Supabase save failed for ${tableName}; using local cache instead.`, error.message);
    }
  }

  return [state, setAndSave];
}
