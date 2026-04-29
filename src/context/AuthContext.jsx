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
  updateUserDashboardField,
} from "../firebaseUserData";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

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
  }, []);

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
    await signOut(auth);
  }, []);

  const updateDashboardData = useCallback(async (key, value) => {
    if (!auth.currentUser) return;

    setDashboardData((current) => ({ ...current, [key]: value }));

    await updateUserDashboardField(auth.currentUser.uid, key, value);
  }, []);

  const clearDashboardData = useCallback(async (prefix = "") => {
    if (!auth.currentUser) return;

    const keysToDelete = Object.keys(dashboardData).filter((key) => key.startsWith(prefix));
    const nextDashboardData = Object.fromEntries(
      Object.entries(dashboardData).filter(([key]) => !keysToDelete.includes(key))
    );

    setDashboardData(nextDashboardData);

    await deleteUserDashboardFields(auth.currentUser.uid, keysToDelete);
  }, [dashboardData]);

  const value = useMemo(
    () => ({
      authReady,
      currentUser,
      profile,
      dashboardData,
      loginUser,
      loginWithGoogle,
      logoutUser,
      registerUser,
      updateDashboardData,
      clearDashboardData,
    }),
    [authReady, currentUser, profile, dashboardData, loginUser, loginWithGoogle, logoutUser, registerUser, updateDashboardData, clearDashboardData]
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
