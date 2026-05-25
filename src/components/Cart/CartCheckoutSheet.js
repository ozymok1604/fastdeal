'use client';

import { useCart } from '@/context/CartContext';
import OrderCheckoutSheet from '@/components/OrderCheckoutSheet/OrderCheckoutSheet';

export default function CartCheckoutSheet() {
  const { items, checkoutOpen, closeCheckout, clearCart } = useCart();

  return (
    <OrderCheckoutSheet
      open={checkoutOpen && items.length > 0}
      onClose={closeCheckout}
      items={items}
      onSuccess={clearCart}
      showContinueShopping
    />
  );
}
