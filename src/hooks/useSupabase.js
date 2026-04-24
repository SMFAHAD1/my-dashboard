import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useSupabase(tableName, initialValue) {
  const [state, setState] = useState(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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
        setState(initialValue);
      }

      setLoading(false);
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [initialValue, tableName]);

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
