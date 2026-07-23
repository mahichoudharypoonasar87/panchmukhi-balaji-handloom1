"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile, createUserProfile } from "@/lib/firebase/auth";
import { UserProfile } from "@/types";
import { onAuthStateChanged } from "firebase/auth";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  isAdmin: false,
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (firebaseUser: User) => {
    try {
      let profile = await getUserProfile(firebaseUser.uid);
      if (!profile) {
        // A signed-in Firebase user with no Firestore profile yet — this
        // is the normal state right after a first-time Google redirect
        // sign-in completes (there's no earlier point to hook profile
        // creation into, since control never returns to the button click
        // handler). Create it now so the app never gets stuck with a
        // logged-in user but no profile.
        await createUserProfile(firebaseUser, {});
        profile = await getUserProfile(firebaseUser.uid);
      }
      setUserProfile(profile);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = userProfile?.isAdmin || false;

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, isAdmin, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
