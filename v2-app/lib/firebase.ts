import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID 
};

let app: any = null;
let auth: any = null;
let db: any = null;
let storage: any = null;
let analytics: any = null;

if (process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
    } catch (error) {
      console.warn("Analytics initialization failed:", error);
    }
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn("Firebase configuration not found. Using mock implementations for development.");

  // Mock implementations
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: Function) => {
      callback(null);
      return () => {};
    }
  };

  db = {
    collection: (path: string) => ({
      get: async () => ({ docs: [] }),
      onSnapshot: (callback: Function) => {
        callback({ forEach: () => {}, docs: [] });
        return () => {};
      }
    }),
    doc: (path: string) => ({
      get: async () => ({ exists: false, data: () => ({}) })
    })
  };

  storage = {
    ref: () => ({
      put: async () => {},
      getDownloadURL: async () => ''
    })
  };

  analytics = null;
}

export { app, analytics, auth, db, storage };