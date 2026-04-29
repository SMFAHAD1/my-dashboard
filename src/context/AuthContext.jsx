import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebase";
import {
  deleteUserDashboardFields,
  getUserData,
  saveUserData,
  updateUserDashboardFields,
} from "../firebaseUserData";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
const SAVE_DEBOUNCE_MS = 500;

function emptyDashboardData(value) {
  return value && typeof value === "object" ? value : {};
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const [authReady, setAuthReady] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [lastSavedAt, setLastSavedAt] = useState(null);

  const pendingUpdatesRef = useState(() => new Map())[0];
  const flushTimerRef = useState(() => ({ current: null }))[0];

  const clearPendingFlush = useCallback(() => {
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, [flushTimerRef]);

  const flushPendingUpdates = useCallback(async () => {
    clearPendingFlush();

    if (!auth.currentUser || pendingUpdatesRef.size === 0) return;

    const updates = Object.fromEntries(pendingUpdatesRef.entries());
    pendingUpdatesRef.clear();
    setIsSaving(true);
    setSaveError("");

    try {
      await updateUserDashboardFields(auth.currentUser.uid, updates);
      setLastSavedAt(new Date().toISOString());
    } catch (error) {
      Object.entries(updates).forEach(([key, value]) => {
        pendingUpdatesRef.set(key, value);
      });
      setSaveError(error?.message || "Failed to save dashboard changes.");
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [clearPendingFlush, pendingUpdatesRef]);

  const scheduleFlush = useCallback(() => {
    clearPendingFlush();
    flushTimerRef.current = setTimeout(() => {
      void flushPendingUpdates();
    }, SAVE_DEBOUNCE_MS);
  }, [clearPendingFlush, flushPendingUpdates, flushTimerRef]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      clearPendingFlush();
      pendingUpdatesRef.clear();
      setIsSaving(false);
      setSaveError("");
      setLastSavedAt(null);
      setCurrentUser(user);

      if (!user) {
        setProfile(null);
        setDashboardData({});
        setAuthReady(true);
        return;
      }

      try {
        const data = (await getUserData(user.uid)) || {};
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
  }, [clearPendingFlush, pendingUpdatesRef]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void flushPendingUpdates();
      }
    };

    window.addEventListener("beforeunload", handleVisibilityChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleVisibilityChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [flushPendingUpdates]);

  const registerUser = useCallback(async (name, email, password, contactNumber) => {
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

    await saveUserData(user.uid, nextProfile);
    setProfile(nextProfile);
    setDashboardData({});
    return user;
  }, []);

  const loginUser = useCallback(async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;
    const existingData = await getUserData(user.uid);

    if (!existingData) {
      const nextProfile = {
        name: user.displayName || "",
        email: user.email || "",
        contactNumber: "",
        createdAt: new Date().toISOString(),
        dashboardData: {},
      };

      await saveUserData(user.uid, nextProfile);
      setProfile(nextProfile);
      setDashboardData({});
    }

    return user;
  }, []);

  const logoutUser = useCallback(async () => {
    await flushPendingUpdates();
    await signOut(auth);
  }, [flushPendingUpdates]);

  const updateDashboardData = useCallback(async (key, value) => {
    if (!auth.currentUser) return;

    setDashboardData((current) => ({ ...current, [key]: value }));
    pendingUpdatesRef.set(key, value);
    scheduleFlush();
  }, [pendingUpdatesRef, scheduleFlush]);

  const clearDashboardData = useCallback(async (prefix = "") => {
    if (!auth.currentUser) return;

    const keysToDelete = Object.keys(dashboardData).filter((key) => key.startsWith(prefix));
    const nextDashboardData = Object.fromEntries(
      Object.entries(dashboardData).filter(([key]) => !keysToDelete.includes(key))
    );

    setDashboardData(nextDashboardData);
    keysToDelete.forEach((key) => pendingUpdatesRef.delete(key));

    await deleteUserDashboardFields(auth.currentUser.uid, keysToDelete);
    setLastSavedAt(new Date().toISOString());
  }, [dashboardData, pendingUpdatesRef]);

  const value = useMemo(
    () => ({
      authReady,
      currentUser,
      profile,
      dashboardData,
      isSaving,
      saveError,
      lastSavedAt,
      loginUser,
      loginWithGoogle,
      logoutUser,
      registerUser,
      updateDashboardData,
      clearDashboardData,
      flushPendingUpdates,
    }),
    [
      authReady,
      currentUser,
      profile,
      dashboardData,
      isSaving,
      saveError,
      lastSavedAt,
      loginUser,
      loginWithGoogle,
      logoutUser,
      registerUser,
      updateDashboardData,
      clearDashboardData,
      flushPendingUpdates,
    ]
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
