import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD20k1TIvhHhFM1huo927VrJAe__RfcnUU",
  authDomain: "my-dashboard-7e60e.firebaseapp.com",
  projectId: "my-dashboard-7e60e",
  storageBucket: "my-dashboard-7e60e.firebasestorage.app",
  messagingSenderId: "185148003951",
  appId: "1:185148003951:web:78f8805b50a6c426ccdf9a",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
