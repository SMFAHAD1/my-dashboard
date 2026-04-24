import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

export function useSupabase(tableName, initialValue) {
  const initialValueRef = useRef(initialValue);
  const [state, setState] = useState(initialValueRef.current);
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
      } else {
        setState(initialValueRef.current);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [tableName]);

  async function setAndSave(valueOrUpdater) {
    let nextValue;

    setState((prev) => {
      nextValue = typeof valueOrUpdater === "function" ? valueOrUpdater(prev) : valueOrUpdater;
      return nextValue;
    });

    await supabase.from(tableName).insert({ data: nextValue });
  }

  return [state, setAndSave, loading];
}
