import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Safely attempt to read the environment variable.
// In Vite, import.meta.env is replaced at build time.
// We use a safe check to prevent runtime errors if env is undefined.
const env = (import.meta as any).env;
const apiKey = env ? env.VITE_FIREBASE_API_KEY : "";

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
  // If no API key is found (e.g. local dev without .env, or build without env vars),
  // we throw to trigger the catch block and enable Offline Demo Mode.
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key missing - switching to Offline Mode");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Initializing Offline Demo Mode (Firebase config incomplete or missing).");
  // Return a dummy object. Usage in GarageService (e.g., collection(db, ...)) will throw,
  // which is caught by GarageService to enable offline mode.
  db = {} as Firestore;
}

export { db };