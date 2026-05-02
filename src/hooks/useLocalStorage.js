import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { auth, db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";

function sanitizeSegment(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]/g, "-");
}

function sanitizeForFirestore(value) {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeForFirestore);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, sanitizeForFirestore(item)])
    );
  }

  return value;
}

function areEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useLocalStorage(key, initialValue, version = 1) {
  const initialValueRef = useRef(initialValue);
  const collectionName = useMemo(
    () => sanitizeSegment(`${key}__v${version}`),
    [key, version]
  );
  const [state, setState] = useState(initialValueRef.current);
  const stateRef = useRef(initialValueRef.current);
  const writeQueueRef = useRef(Promise.resolve());

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setState(initialValueRef.current);
      return undefined;
    }

    const collectionRef = collection(db, "users", user.uid, collectionName);

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const nextState = snapshot.docs
        .map((snapshotDoc) => {
          const data = snapshotDoc.data();
          return {
            ...data,
            id: data.id ?? snapshotDoc.id,
          };
        })
        .sort((a, b) => (a.__order ?? 0) - (b.__order ?? 0))
        .map(({ __order, ...item }) => item);

      stateRef.current = nextState;
      setState(nextState);
    });

    return unsubscribe;
  }, [collectionName]);

  const persistState = useCallback(
    async (nextState) => {
      const user = auth.currentUser;
      if (!user) return;

      const previousState = stateRef.current;
      const previousMap = new Map(
        previousState.map((item) => [String(item.id), item])
      );
      const nextMap = new Map(
        nextState.map((item, index) => [
          String(item.id),
          { ...item, __order: index },
        ])
      );

      const batch = writeBatch(db);

      for (const [id, item] of nextMap) {
        const previousItem = previousMap.get(id);
        const { __order, ...itemWithoutOrder } = item;
        const comparableItem = sanitizeForFirestore(itemWithoutOrder);

        if (!previousItem || !areEqual(previousItem, itemWithoutOrder)) {
          batch.set(
            doc(db, "users", user.uid, collectionName, id),
            {
              ...comparableItem,
              id: item.id,
              __order,
            },
            { merge: true }
          );
        } else {
          const previousIndex = previousState.findIndex(
            (entry) => String(entry.id) === id
          );

          if (previousIndex !== __order) {
            batch.set(
              doc(db, "users", user.uid, collectionName, id),
              { __order },
              { merge: true }
            );
          }
        }
      }

      for (const [id] of previousMap) {
        if (!nextMap.has(id)) {
          batch.delete(doc(db, "users", user.uid, collectionName, id));
        }
      }

      await batch.commit();
    },
    [collectionName]
  );

  const setFirestoreState = useCallback(
    (value) => {
      const currentState = stateRef.current;
      const nextState =
        typeof value === "function" ? value(currentState) : value;

      stateRef.current = nextState;
      setState(nextState);

      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(() => persistState(nextState));
    },
    [persistState]
  );

  return [state, setFirestoreState];
}
