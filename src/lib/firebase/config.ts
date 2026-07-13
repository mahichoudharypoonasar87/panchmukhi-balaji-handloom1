import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import type { Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase app (this is safe — does NOT validate the API key)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore & Storage initialize safely (no API key validation at init time)
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — lazy initialization
//
// Firebase 11 validates the API key when getAuth(app) is called, and throws
// `auth/invalid-api-key` if the key is a placeholder (e.g. during Vercel's
// build-time static generation when env vars haven't been injected yet, or
// when running with demo keys locally).
//
// Solution: defer getAuth() until it is actually needed at runtime.
// All server-side code paths (sitemap, ISR pages) never call auth directly,
// so this is safe.
// ─────────────────────────────────────────────────────────────────────────────
let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    // Dynamic require so this code path is never executed at module-import time
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase/auth") as { getAuth: (app: typeof app) => Auth };
    _auth = getAuth(app);
  }
  return _auth;
}

/**
 * `auth` — same lazy getter exposed as a named export for backward compat.
 *
 * Usage in client components / server action contexts:
 *   import { auth } from "@/lib/firebase/config"
 *   onAuthStateChanged(auth, ...)   // works because the Proxy defers the call
 */
export const auth = new Proxy({} as Auth, {
  get(_target, prop: string | symbol) {
    return (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[prop];
  },
  set(_target, prop: string | symbol, value: unknown) {
    (getFirebaseAuth() as unknown as Record<string | symbol, unknown>)[prop] = value;
    return true;
  },
});

// Analytics — browser only, fully lazy
export const getAnalyticsInstance = async () => {
  if (typeof window === "undefined") return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (await isSupported()) return getAnalytics(app);
  } catch {
    // Analytics not supported in this environment
  }
  return null;
};

export default app;
