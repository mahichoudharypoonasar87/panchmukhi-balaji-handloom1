import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
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
 * FIX: switched from signInWithRedirect to signInWithPopup.
 *
 * The redirect flow sends the browser through
 * https://<authDomain>.firebaseapp.com/__/auth/handler and back to the
 * app. Because that handler lives on a different top-level domain than
 * the app itself (vercel.app vs firebaseapp.com), completing that round
 * trip depends on the browser preserving storage/cookies across the hop.
 * Modern mobile browsers increasingly restrict third-party storage by
 * default, which produces "The requested action is invalid" even when
 * the domain is correctly authorized in Firebase — and this affects real
 * visitors too, not just one device/browser. signInWithPopup keeps the
 * whole flow in a popup window and resolves synchronously in the same
 * tab, avoiding that cross-domain redirect entirely.
 */
export const loginWithGoogle = async (): Promise<UserCredential> => {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
};

/**
 * Kept for compatibility with GoogleRedirectHandler, which stays mounted
 * but is now a harmless no-op (resolves to null — there's no pending
 * redirect to pick up anymore).
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
