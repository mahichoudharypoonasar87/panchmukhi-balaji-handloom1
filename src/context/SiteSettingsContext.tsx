"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { doc, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SiteSettings } from "@/types";

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  loading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType>({
  settings: null,
  loading: true,
});

export const SiteSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, "settings", "site"),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            id: snap.id,
            ...data,
            updatedAt:
              data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(),
          } as SiteSettings);
        } else {
          setSettings(null);
        }
        setLoading(false);
      },
      () => {
        setSettings(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  return (
    <SiteSettingsContext.Provider value={{ settings, loading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
};

export const useSiteSettings = () => {
  const context = useContext(SiteSettingsContext);
  if (!context) {
    throw new Error("useSiteSettings must be used within SiteSettingsProvider");
  }
  return context;
};
