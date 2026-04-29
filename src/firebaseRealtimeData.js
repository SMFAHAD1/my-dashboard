import { onValue, ref, remove, set, update } from "firebase/database";
import { realtimeDb } from "../firebase";

function normalizePath(path) {
  return String(path || "").replace(/^\/+|\/+$/g, "");
}

export function listenToRealtimeData(path, callback, onError) {
  const dbRef = ref(realtimeDb, normalizePath(path));

  return onValue(
    dbRef,
    (snapshot) => {
      callback(snapshot.val());
    },
    onError
  );
}

export async function setRealtimeData(path, data) {
  await set(ref(realtimeDb, normalizePath(path)), data);
}

export async function updateRealtimeData(path, data) {
  await update(ref(realtimeDb, normalizePath(path)), data);
}

export async function removeRealtimeData(path) {
  await remove(ref(realtimeDb, normalizePath(path)));
}
