import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
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

// Initialize Firebase app (safe — does NOT validate the API key on init)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firestore & Storage — safe to initialize at module level
export const db = getFirestore(app);
export const storage = getStorage(app);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH — lazy initialization
//
// Firebase 11 validates the API key inside getAuth(app) immediately, and throws
// `auth/invalid-api-key` if the key is invalid/placeholder (e.g. during
// Vercel's build-time static generation before real env vars are injected).
//
// Fix: never call getAuth() at module-import time. Defer it to the first
// runtime call (browser or server request), where real credentials exist.
// ─────────────────────────────────────────────────────────────────────────────
let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    // Use require() so this import is NOT executed at module load time.
    // `FirebaseApp` is used as the param type to avoid the self-referencing
    // `typeof app` that caused "referenced directly in its own type" TS error.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getAuth } = require("firebase/auth") as {
      getAuth: (app: FirebaseApp) => Auth;
    };
    _auth = getAuth(app);
  }
  return _auth;
}

/**
 * `auth` — lazy Proxy for backward-compatible `import { auth } from "./config"`.
 *
 * The Proxy defers all property access to getFirebaseAuth() which is only
 * called at runtime (never at build time), so it never crashes during `next build`.
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
    // Not supported in this environment
  }
  return null;
};

export default app;