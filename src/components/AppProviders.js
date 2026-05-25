'use client';

import { CartProvider } from '@/context/CartContext';
import CartDrawer from '@/components/Cart/CartDrawer';
import CartCheckoutSheet from '@/components/Cart/CartCheckoutSheet';

export default function AppProviders({ children }) {
  return (
    <CartProvider>
      {children}
      <CartDrawer />
      <CartCheckoutSheet />
    </CartProvider>
  );
}
