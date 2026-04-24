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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    async function loadData() {
      const { data } = await supabase
        .from(tableName)
        .select("data")
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!isMounted) return;

      if (data?.data != null) {
        setState(data.data);
        try {
          localStorage.setItem(storageKey, JSON.stringify(data.data));
        } catch {}
      } else {
        try {
          const cachedValue = localStorage.getItem(storageKey);
          setState(cachedValue ? JSON.parse(cachedValue) : initialValueRef.current);
        } catch {
          setState(initialValueRef.current);
        }
      }

      setLoading(false);
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

  return [state, setAndSave, loading];
}
