import { deleteField, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function saveUserData(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

export async function getUserData(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) {
    return snap.data();
  }
  return null;
}

export async function updateUserDashboardField(uid, key, value) {
  try {
    await updateDoc(doc(db, "users", uid), {
      [`dashboardData.${key}`]: value,
    });
  } catch {
    await saveUserData(uid, {
      dashboardData: {
        [key]: value,
      },
    });
  }
}

export async function saveUserDashboardData(uid, dashboardData) {
  await saveUserData(uid, { dashboardData });
}

export async function updateUserDashboardFields(uid, updates) {
  const payload = Object.fromEntries(
    Object.entries(updates).map(([key, value]) => [`dashboardData.${key}`, value])
  );

  try {
    await updateDoc(doc(db, "users", uid), payload);
  } catch {
    await saveUserData(uid, {
      dashboardData: updates,
    });
  }
}

export async function deleteUserDashboardFields(uid, keys) {
  if (!keys.length) return;

  const payload = Object.fromEntries(
    keys.map((key) => [`dashboardData.${key}`, deleteField()])
  );

  await updateDoc(doc(db, "users", uid), payload);
}
