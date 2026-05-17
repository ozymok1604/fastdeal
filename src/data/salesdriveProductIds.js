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

/** Blaze-A (на сайті tactic-blaze) */
const blazeA = {
  black: {
    40: '3048609031',
    41: '3048611014',
    42: '3048611017',
    43: '3048611020',
    44: '3048611023',
    45: '3048611026',
    46: '3048611029',
  },
  coyote: {
    40: '3048611013',
    41: '3048611016',
    42: '3048611019',
    43: '3048611022',
    44: '3048611025',
    45: '3048611028',
    46: '3048611031',
  },
  olive: {
    40: '3048611012',
    41: '3048611015',
    42: '3048611018',
    43: '3048611021',
    44: '3048611024',
    45: '3048611027',
    46: '3048611030',
  },
};

/** Blaze-A2 лише олива (на сайті tactic-blaze-a22) */
const blazeA2 = {
  olive: {
    40: '3048613681',
    41: '3048614453',
    42: '3048614454',
    43: '3048614455',
    44: '3048614456',
    45: '3048614457',
    46: '3048614458',
  },
};

const coreA = {
  black: {
    40: '3007747795',
    41: '3048616528',
    42: '3048616531',
    43: '3048616534',
    44: '3048616537',
    45: '3048616540',
    46: '3048616543',
  },
  coyote: {
    40: '3048616527',
    41: '3048616530',
    42: '3048616533',
    43: '3048616536',
    44: '3048616539',
    45: '3048616542',
    46: '3048616545',
  },
  olive: {
    40: '3048616526',
    41: '3048616529',
    42: '3048616532',
    43: '3048616535',
    44: '3048616538',
    45: '3048616541',
    46: '3048616544',
  },
};

const BY_PRODUCT_SLUG = {
  'tactic-shadow-a': shadow,
  'tactic-crazy-a': crazy,
  'tactic-falcon-a': falcon,
  'tactic-blaze': blazeA,
  'tactic-blaze-a22': blazeA2,
  'tactic-core-a': coreA,
};

/**
 * @param {string} productSlug id товару з `@/data/products`
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
