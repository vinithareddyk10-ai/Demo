import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's provided Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyC0JGuH9-jUs0J0dCCv4a25Vmrzx46FlM8",
  authDomain: "fir-3482b.firebaseapp.com",
  projectId: "fir-3482b",
  storageBucket: "fir-3482b.firebasestorage.app",
  messagingSenderId: "258959801747",
  appId: "1:258959801747:web:f193218d891068d178fc66",
  measurementId: "G-N4HNRTSRB4"
};

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);

// Safe Analytics initialization
export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      try {
        analytics = getAnalytics(app);
      } catch (e) {
        console.warn("Firebase Analytics could not be initialized:", e);
      }
    }
  }).catch(() => {
    // Analytics not supported in this environment
  });
}
