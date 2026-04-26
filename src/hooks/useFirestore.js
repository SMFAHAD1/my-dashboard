import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

/**
 * Drop-in replacement for useLocalStorage that persists data in Firebase Firestore.
 * Data syncs across all devices (laptop, mobile, etc.) in real time.
 *
 * @param {string} key          - Key name (e.g. 'dashboard-plans')
 * @param {*}      initialValue - Default value if nothing stored yet
 */
export function useFirestore(key, initialValue) {
  const [state, setState] = useState(initialValue);
  const [loaded, setLoaded] = useState(false);

  // Load from Firestore on mount
  useEffect(() => {
    async function load() {
      try {
        const ref = doc(db, 'dashboard', key);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setState(snap.data().value);
        }
      } catch (e) {
        console.warn('Firestore read failed:', e);
      } finally {
        setLoaded(true);
      }
    }
    load();
  }, [key]);

  // Save to Firestore on every change (only after first load)
  useEffect(() => {
    if (!loaded) return;
    async function save() {
      try {
        const ref = doc(db, 'dashboard', key);
        await setDoc(ref, { value: state });
      } catch (e) {
        console.warn('Firestore write failed:', e);
      }
    }
    save();
  }, [state, loaded, key]);

  return [state, setState];
}
