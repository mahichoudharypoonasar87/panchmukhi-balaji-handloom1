import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  onAuthStateChanged,
  User,
  UserCredential,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, getFirebaseAuth } from "./config";
import { UserProfile } from "@/types";

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// =============================================
// REGISTER
// =============================================
export const registerWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);

  await createUserProfile(credential.user, { displayName });

  return credential;
};

// =============================================
// LOGIN
// =============================================
export const loginWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  await updateLastLogin(credential.user.uid);
  return credential;
};

// =============================================
// GOOGLE LOGIN
// =============================================
/**
 * FIX: uses getFirebaseAuth() directly instead of the lazy `auth` Proxy
 * export. The Proxy exists purely to defer calling getAuth(app) until
 * runtime (see config.ts) and forwards property reads to the real Auth
 * instance — fine for simple calls, but signInWithRedirect/getRedirectResult
 * are unusually stateful (persistence keys, pending-redirect tracking tied
 * to the specific Auth instance). Calling a method via the Proxy can bind
 * `this` to the Proxy instead of the real object for this kind of flow.
 * getFirebaseAuth() returns the actual singleton directly — same instance,
 * no indirection risk. Safe regardless of whether this was the root cause.
 */
export const loginWithGoogle = async (): Promise<void> => {
  await signInWithRedirect(getFirebaseAuth(), googleProvider);
};

/**
 * Call once, on app load, to pick up the result of a Google redirect
 * sign-in. Resolves to null on a normal page load with no pending
 * redirect — only throws for a genuinely failed sign-in attempt.
 */
export const getGoogleRedirectResult = async (): Promise<UserCredential | null> => {
  return getRedirectResult(getFirebaseAuth());
};

// =============================================
// LOGOUT
// =============================================
export const logout = async (): Promise<void> => {
  await signOut(auth);
};

// =============================================
// FORGOT PASSWORD
// =============================================
export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// =============================================
// RESEND VERIFICATION
// =============================================
export const resendVerification = async (): Promise<void> => {
  if (auth.currentUser) {
    await sendEmailVerification(auth.currentUser);
  }
};

// =============================================
// CREATE USER PROFILE
// =============================================
export const createUserProfile = async (
  user: User,
  additionalData: Partial<UserProfile>
): Promise<void> => {
  const userProfile: Omit<UserProfile, "uid"> = {
    email: user.email || "",
    displayName: user.displayName || additionalData.displayName || "",
    photoURL: user.photoURL || "",
    phone: "",
    isEmailVerified: user.emailVerified,
    addresses: [],
    wishlist: [],
    orderCount: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
    ...additionalData,
    isAdmin: false,
  };

  await setDoc(
    doc(db, "users", user.uid),
    {
      ...userProfile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    },
    { merge: true }
  );
};

// =============================================
// GET USER PROFILE
// =============================================
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const docRef = doc(db, "users", uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      uid,
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      lastLoginAt: data.lastLoginAt?.toDate(),
    } as UserProfile;
  }

  return null;
};

// =============================================
// UPDATE USER PROFILE
// =============================================
export const updateUserProfile = async (
  uid: string,
  data: Partial<UserProfile>
): Promise<void> => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });

  if (auth.currentUser && (data.displayName || data.photoURL)) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }
};

// =============================================
// UPDATE LAST LOGIN
// =============================================
const updateLastLogin = async (uid: string): Promise<void> => {
  const docRef = doc(db, "users", uid);
  await updateDoc(docRef, {
    lastLoginAt: serverTimestamp(),
  }).catch(() => {
    // User document might not exist yet
  });
};

// =============================================
// AUTH STATE OBSERVER
// =============================================
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
