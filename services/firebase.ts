import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Safely access the environment variable.
// We use optional chaining (?) to prevent runtime crashes if 'env' is undefined on import.meta.
// This ensures that if the build environment doesn't populate env, we simply fall back to offline mode instead of crashing.
const apiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "gen-lang-client-0663082497.firebaseapp.com",
  projectId: "gen-lang-client-0663082497",
  storageBucket: "gen-lang-client-0663082497.firebasestorage.app",
  messagingSenderId: "388682888874",
  appId: "1:388682888874:web:70617efbb339c3d9a402d3",
  measurementId: "G-WSHW9Y2DJQ"
};

let db: Firestore;

try {
  // If api key is empty or undefined, throw to trigger offline mode
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key is missing");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Offline Mode Active: Firebase API Key missing or invalid.");
  db = {} as Firestore;
}

export { db };