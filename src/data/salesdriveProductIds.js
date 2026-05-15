/**
 * Ід позицій товару у SalesDrive (за обраними на сайті product id + колір + розмір).
 * Ключ сайту — id з `@/data/products` (tactic-*), колір — `colors[].id` (olive | coyote | black).
 */

const shadow = {
  coyote: {
    40: 'auto_69e86e35bda4a',
    41: 'auto_69e86e4e4b936',
    42: 'auto_69e86e6dc253d',
    43: 'auto_69e86e87ef39b',
    44: 'auto_69e86ea23f04c',
    45: 'auto_69e86ec222659',
    46: 'auto_69e86ede6ff5a',
  },
  olive: {
    40: 'auto_69e86b169095a',
    41: 'auto_69e86b9523429',
    42: 'auto_69e86bd6e7184',
    43: 'auto_69e86bf668433',
    44: 'auto_69e86c14c588f',
    45: 'auto_69e86c3096250',
    46: 'auto_69e86c492ac4b',
  },
  black: {
    40: 'auto_69e5c44a7aa74',
    41: 'auto_69e5c4492661b',
    42: 'auto_69e5ceb97cfe0',
    43: 'auto_69e5cf060c3a6',
    44: 'auto_69e5cf479d16f',
    45: 'auto_69e5cf697e0eb',
    46: 'auto_69e5cf8aed11f',
  },
};

const crazy = {
  black: {
    40: '3007736836',
    41: '3008286078',
    42: '3008286081',
    43: '3008286084',
    44: '3008286087',
    45: '3008286090',
    46: '3008286093',
  },
  coyote: {
    40: '3008286077',
    41: '3008286080',
    42: '3008286083',
    43: '3008286086',
    44: '3008286089',
    45: '3008286092',
    46: '3008286095',
  },
  olive: {
    40: '3008286076',
    41: '3008286079',
    42: '3008286082',
    43: '3008286085',
    44: '3008286088',
    45: '3008286091',
    46: '3008286094',
  },
};

const falcon = {
  black: {
    40: '3007734116',
    41: '3012553433',
    42: '3012553436',
    43: '3012553439',
    44: '3012553442',
    45: '3012553445',
    46: '3012553448',
  },
  coyote: {
    40: '3012553432',
    41: '3012553435',
    42: '3012553438',
    43: '3012553441',
    44: '3012553444',
    45: '3012553447',
    46: '3012553450',
  },
  olive: {
    40: '3012553431',
    41: '3012553434',
    42: '3012553437',
    43: '3012553440',
    44: '3012553443',
    45: '3012553446',
    46: '3012553449',
  },
};

const BY_PRODUCT_SLUG = {
  'tactic-shadow-a': shadow,
  'tactic-crazy-a': crazy,
  'tactic-falcon-a': falcon,
};

/**
 * @param {string} productSlug tactic-shadow-a | tactic-crazy-a | tactic-falcon-a
 * @param {string} colorId olive | coyote | black
 * @param {number} size
 * @returns {string | undefined}
 */
export function getSalesdriveProductId(productSlug, colorId, size) {
  if (!productSlug || !colorId) return undefined;
  const n =
    typeof size === 'number' && Number.isFinite(size)
      ? size
      : typeof size === 'string'
        ? Number(size.trim())
        : NaN;
  if (!Number.isFinite(n)) return undefined;
  const tbl = BY_PRODUCT_SLUG[productSlug]?.[colorId];
  const id = tbl?.[Math.floor(n)];
  return typeof id === 'string' && id.trim() ? id.trim() : undefined;
}
