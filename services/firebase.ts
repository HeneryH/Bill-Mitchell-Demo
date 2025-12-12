import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Safely retrieve the environment object or default to empty object to avoid crashes
// This prevents 'Cannot read properties of undefined (reading 'VITE_FIREBASE_API_KEY')'
const env = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: "gen-lang-client-0663082497.firebaseapp.com",
  projectId: "gen-lang-client-0663082497",
  storageBucket: "gen-lang-client-0663082497.firebasestorage.app",
  messagingSenderId: "388682888874",
  appId: "1:388682888874:web:70617efbb339c3d9a402d3",
  measurementId: "G-WSHW9Y2DJQ"
};

let db: Firestore;

try {
  // Ensure API key exists before initializing to prevent crashes.
  // If missing, we intentionally fail so GarageService switches to Offline Demo Mode.
  if (!firebaseConfig.apiKey) {
    throw new Error("VITE_FIREBASE_API_KEY is not defined");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase config missing or invalid. App will run in Offline Demo Mode.");
  // Return a dummy object. Usage in GarageService (e.g., collection(db, ...)) will throw,
  // which is caught by GarageService to enable offline mode.
  db = {} as Firestore;
}

export { db };