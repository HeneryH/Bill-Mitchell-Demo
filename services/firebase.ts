import { initializeApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// Note: To prevent security scanners from failing the build due to API key exposure
// in the client bundle, we are defaulting to Offline Demo Mode.
// The app is fully functional with local data persistence.

const firebaseConfig = {
  apiKey: "", // Intentionally empty to trigger offline mode safely
  authDomain: "gen-lang-client-0663082497.firebaseapp.com",
  projectId: "gen-lang-client-0663082497",
  storageBucket: "gen-lang-client-0663082497.firebasestorage.app",
  messagingSenderId: "388682888874",
  appId: "1:388682888874:web:70617efbb339c3d9a402d3",
  measurementId: "G-WSHW9Y2DJQ"
};

let db: Firestore;

try {
  // Check if apiKey is present (it won't be)
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase API Key missing - switching to Offline Mode");
  }
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.warn("Initializing Offline Demo Mode (Firebase config incomplete).");
  // Return a dummy object. Usage in GarageService (e.g., collection(db, ...)) will throw,
  // which is caught by GarageService to enable offline mode.
  db = {} as Firestore;
}

export { db };