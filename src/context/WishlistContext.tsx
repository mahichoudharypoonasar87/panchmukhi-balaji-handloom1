"use client";

import {
  createContext,
  useContext,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  addToWishlist,
  removeFromWishlist,
} from "@/lib/firebase/firestore";
import toast from "react-hot-toast";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  toggleWishlist: async () => {},
  isInWishlist: () => false,
});

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user, userProfile, refreshProfile } = useAuth();

  const wishlist = userProfile?.wishlist || [];

  const toggleWishlist = useCallback(
    async (productId: string) => {
      if (!user) {
        toast.error("Please login to add to wishlist");
        return;
      }

      try {
        if (wishlist.includes(productId)) {
          await removeFromWishlist(user.uid, productId);
          toast.success("Removed from wishlist");
        } else {
          await addToWishlist(user.uid, productId);
          toast.success("Added to wishlist ❤️");
        }
        await refreshProfile();
      } catch (error) {
        toast.error("Failed to update wishlist");
        console.error(error);
      }
    },
    [user, wishlist, refreshProfile]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
};
