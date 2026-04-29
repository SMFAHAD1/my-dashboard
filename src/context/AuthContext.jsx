import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase";

const AuthContext = createContext(null);

function emptyDashboardData(value) {
  return value && typeof value === "object" ? value : {};
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthReady(false);
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setDashboardData({});
        setAuthReady(true);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.exists() ? snap.data() : {};
        setProfile(data);
        setDashboardData(emptyDashboardData(data.dashboardData));
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfile(null);
        setDashboardData({});
      } finally {
        setAuthReady(true);
      }
    });

    return unsubscribe;
  }, []);

  async function registerUser(name, email, password, contactNumber) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const trimmedName = name.trim();
    const trimmedContact = contactNumber.trim();

    if (trimmedName) {
      await updateProfile(user, { displayName: trimmedName });
    }

    const nextProfile = {
      name: trimmedName,
      email,
      contactNumber: trimmedContact,
      createdAt: new Date().toISOString(),
      dashboardData: {},
    };

    await setDoc(doc(db, "users", user.uid), nextProfile, { merge: true });
    setProfile(nextProfile);
    setDashboardData({});
    return user;
  }

  async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async function logoutUser() {
    await signOut(auth);
  }

  async function updateDashboardData(key, value) {
    if (!auth.currentUser) return;

    setDashboardData((current) => ({ ...current, [key]: value }));

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        dashboardData: {
          [key]: value,
        },
      },
      { merge: true }
    );
  }

  async function clearDashboardData(prefix = "") {
    if (!auth.currentUser) return;

    const nextDashboardData = Object.fromEntries(
      Object.entries(dashboardData).filter(([key]) => !key.startsWith(prefix))
    );

    setDashboardData(nextDashboardData);

    await setDoc(
      doc(db, "users", auth.currentUser.uid),
      {
        dashboardData: nextDashboardData,
      },
      { merge: true }
    );
  }

  const value = useMemo(
    () => ({
      authReady,
      currentUser,
      profile,
      dashboardData,
      loginUser,
      logoutUser,
      registerUser,
      updateDashboardData,
      clearDashboardData,
    }),
    [authReady, currentUser, profile, dashboardData]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
