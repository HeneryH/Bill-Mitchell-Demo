import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration for Project: gen-lang-client-0663082497
const firebaseConfig = {
  apiKey: "AIzaSyBwXvmf37dYGfYCgecIOtBTvAHkKNwO2x4",
  authDomain: "gen-lang-client-0663082497.firebaseapp.com",
  projectId: "gen-lang-client-0663082497",
  storageBucket: "gen-lang-client-0663082497.firebasestorage.app",
  messagingSenderId: "388682888874",
  appId: "1:388682888874:web:70617efbb339c3d9a402d3",
  measurementId: "G-WSHW9Y2DJQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);