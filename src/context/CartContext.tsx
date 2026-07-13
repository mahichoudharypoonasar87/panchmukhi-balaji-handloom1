"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import {
  subscribeToCart,
  addToCart as addToCartFirestore,
  updateCartItem,
  removeFromCart as removeFromCartFirestore,
  clearCart,
  applyCoupon as applyCouponFirestore,
} from "@/lib/firebase/firestore";
import { Cart, CartItem } from "@/types";
import toast from "react-hot-toast";

interface CartContextType {
  cart: Cart | null;
  cartCount: number;
  loading: boolean;
  addToCart: (item: Omit<CartItem, "id">) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  cart: null,
  cartCount: 0,
  loading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  applyCoupon: async () => {},
  isInCart: () => false,
});

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setCart(null);
      return;
    }

    const unsubscribe = subscribeToCart(user.uid, (cartData) => {
      setCart(cartData);
    });

    return () => unsubscribe();
  }, [user]);

  const addToCart = useCallback(
    async (item: Omit<CartItem, "id">) => {
      if (!user) {
        toast.error("Please login to add items to cart");
        return;
      }
      setLoading(true);
      try {
        await addToCartFirestore(user.uid, item);
        toast.success("Added to cart!");
      } catch (error) {
        toast.error("Failed to add to cart");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!user) return;
      try {
        await updateCartItem(user.uid, itemId, quantity);
      } catch (error) {
        toast.error("Failed to update quantity");
        console.error(error);
      }
    },
    [user]
  );

  const removeFromCart = useCallback(
    async (itemId: string) => {
      if (!user) return;
      try {
        await removeFromCartFirestore(user.uid, itemId);
        toast.success("Removed from cart");
      } catch (error) {
        toast.error("Failed to remove item");
        console.error(error);
      }
    },
    [user]
  );

  const handleClearCart = useCallback(async () => {
    if (!user) return;
    try {
      await clearCart(user.uid);
    } catch (error) {
      console.error(error);
    }
  }, [user]);

  const applyCoupon = useCallback(
    async (code: string) => {
      if (!user) return;
      setLoading(true);
      try {
        const result = await applyCouponFirestore(user.uid, code);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error("Failed to apply coupon");
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  const isInCart = useCallback(
    (productId: string) => {
      return cart?.items.some((item) => item.productId === productId) || false;
    },
    [cart]
  );

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart: handleClearCart,
        applyCoupon,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
};
