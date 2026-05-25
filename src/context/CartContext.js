'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartLineKey } from '@/lib/cartLineKey';
import { calcVolumeCartTotals } from '@/lib/volumeDiscount';

const STORAGE_KEY = 'tactic-cart-v1';

/** @typedef {{
 *   lineKey: string,
 *   productId: string,
 *   productName: string,
 *   colorId: string,
 *   colorLabel: string,
 *   size: number,
 *   sizeLabel: string,
 *   price: number,
 *   salesdriveProductId?: string,
 *   quantity: number,
 * }} CartLine
 */

function loadStored() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x) =>
        x &&
        typeof x === 'object' &&
        typeof x.lineKey === 'string' &&
        typeof x.productId === 'string' &&
        typeof x.quantity === 'number' &&
        x.quantity >= 1
    );
  } catch {
    return [];
  }
}

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(/** @type {CartLine[]} */ ([]));
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    setItems(loadStored());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore quota */
    }
  }, [items, hydrated]);

  /** @param {Omit<CartLine, 'lineKey' | 'quantity'>} item */
  const addItem = useCallback((item) => {
    const key = cartLineKey(item.productId, item.colorId, item.size);
    setItems((prev) => {
      const idx = prev.findIndex((x) => x.lineKey === key);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { ...item, lineKey: key, quantity: 1 }];
    });
  }, []);

  const removeLine = useCallback((lineKey) => {
    setItems((prev) => prev.filter((x) => x.lineKey !== lineKey));
  }, []);

  const setQuantity = useCallback((lineKey, quantity) => {
    const q = Math.floor(Number(quantity));
    if (!Number.isFinite(q) || q < 1) {
      setItems((prev) => prev.filter((x) => x.lineKey !== lineKey));
      return;
    }
    setItems((prev) =>
      prev.map((x) => (x.lineKey === lineKey ? { ...x, quantity: Math.min(q, 99) } : x))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const openCheckout = useCallback(() => {
    setDrawerOpen(false);
    setCheckoutOpen(true);
  }, []);

  const closeCheckout = useCallback(() => setCheckoutOpen(false), []);

  const totalCount = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items]
  );

  const volumeTotals = useMemo(() => calcVolumeCartTotals(items), [items]);

  /** Сума без знижки (для сумісності) */
  const subtotalPrice = volumeTotals.subtotal;
  /** Сума до оплати з урахуванням знижки від кількості пар */
  const totalPrice = volumeTotals.total;

  const value = useMemo(
    () => ({
      items,
      hydrated,
      totalCount,
      subtotalPrice,
      totalPrice,
      volumeTotals,
      addItem,
      removeLine,
      setQuantity,
      clearCart,
      drawerOpen,
      checkoutOpen,
      openDrawer,
      closeDrawer,
      openCheckout,
      closeCheckout,
    }),
    [
      items,
      hydrated,
      totalCount,
      subtotalPrice,
      totalPrice,
      volumeTotals,
      addItem,
      removeLine,
      setQuantity,
      clearCart,
      drawerOpen,
      checkoutOpen,
      openDrawer,
      closeDrawer,
      openCheckout,
      closeCheckout,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
