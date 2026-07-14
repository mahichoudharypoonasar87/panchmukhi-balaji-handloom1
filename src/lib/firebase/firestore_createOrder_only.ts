// ─────────────────────────────────────────────────────────────────────────────
// REPLACE ONLY the createOrder function in your existing
// src/lib/firebase/firestore.ts
//
// Find the existing createOrder function and replace the whole thing with this.
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc, collection, setDoc, updateDoc, getDocs,
  query, where, limit, serverTimestamp, increment
} from "firebase/firestore";
import { db } from "./config";
import { Order } from "@/types";

/**
 * Removes undefined values from an object recursively.
 * Firestore throws: "Unsupported field value: undefined"
 * This sanitizer replaces undefined with null and removes undefined keys.
 */
function sanitize(obj: unknown): unknown {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitize);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (v !== undefined) {
      result[k] = sanitize(v);
    }
  }
  return result;
}

export const createOrder = async (
  orderData: Omit<Order, "id" | "createdAt" | "updatedAt">
): Promise<string> => {
  // Sanitize — removes all undefined values that Firestore rejects
  const clean = sanitize(orderData) as typeof orderData;

  const orderRef = doc(collection(db, "orders"));

  await setDoc(orderRef, {
    ...clean,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Update user order stats — best effort (non-blocking)
  try {
    await updateDoc(doc(db, "users", orderData.userId), {
      orderCount: increment(1),
      totalSpent: increment(orderData.total ?? 0),
      updatedAt: serverTimestamp(),
    });
  } catch (e) {
    console.warn("User stats update skipped:", e);
  }

  // Update coupon usage — best effort (non-blocking)
  if (orderData.couponCode) {
    try {
      const snap = await getDocs(
        query(
          collection(db, "coupons"),
          where("code", "==", orderData.couponCode),
          limit(1)
        )
      );
      if (!snap.empty) {
        await updateDoc(snap.docs[0].ref, { usageCount: increment(1) });
      }
    } catch (e) {
      console.warn("Coupon usage update skipped:", e);
    }
  }

  return orderRef.id;
};
