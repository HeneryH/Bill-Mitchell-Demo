import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Helper to safely get env vars
const getEnvVar = (key: string) => {
  try {
    // @ts-ignore
    return import.meta.env?.[key];
  } catch (e) {
    return undefined;
  }
};

const apiKey = getEnvVar('VITE_FIREBASE_API_KEY');

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
  // If api key is missing, we throw to trigger the catch block which enables offline mode
  if (!apiKey) {
    console.warn("VITE_FIREBASE_API_KEY not found. Defaulting to Offline Demo Mode.");
    throw new Error("Missing Firebase API Key");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  // Graceful fallback to offline mode object
  // garageService.ts handles the empty db object safely
  db = {} as Firestore;
}

export { db };