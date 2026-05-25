/** Знижка на кожну пару за загальною кількістю пар у кошику */
export const VOLUME_DISCOUNT_FROM_3 = 150;
export const VOLUME_DISCOUNT_FROM_5 = 250;
export const VOLUME_DISCOUNT_MIN_PAIRS_3 = 3;
export const VOLUME_DISCOUNT_MIN_PAIRS_5 = 5;

/**
 * @param {number} totalPairs
 * @returns {number}
 */
export function discountPerPair(totalPairs) {
  if (totalPairs >= VOLUME_DISCOUNT_MIN_PAIRS_5) return VOLUME_DISCOUNT_FROM_5;
  if (totalPairs >= VOLUME_DISCOUNT_MIN_PAIRS_3) return VOLUME_DISCOUNT_FROM_3;
  return 0;
}

/**
 * @param {number} basePrice
 * @param {number} totalPairs
 */
export function unitPriceAfterVolumeDiscount(basePrice, totalPairs) {
  const d = discountPerPair(totalPairs);
  return Math.max(0, basePrice - d);
}

/**
 * @param {{ price: number, quantity: number }[]} items
 */
export function calcVolumeCartTotals(items) {
  const totalPairs = items.reduce((sum, x) => sum + x.quantity, 0);
  const perPair = discountPerPair(totalPairs);
  const subtotal = items.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const discountTotal = perPair * totalPairs;
  const total = Math.max(0, subtotal - discountTotal);
  return { totalPairs, discountPerPair: perPair, subtotal, discountTotal, total };
}

/** Скільки пар не вистачає до наступного порогу знижки */
export function pairsUntilNextDiscount(totalPairs) {
  if (totalPairs >= VOLUME_DISCOUNT_MIN_PAIRS_5) return 0;
  if (totalPairs >= VOLUME_DISCOUNT_MIN_PAIRS_3) {
    return VOLUME_DISCOUNT_MIN_PAIRS_5 - totalPairs;
  }
  return VOLUME_DISCOUNT_MIN_PAIRS_3 - totalPairs;
}
