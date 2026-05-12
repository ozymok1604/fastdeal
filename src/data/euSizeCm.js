/**
 * Внутрішня довжина (устілка), см — для підписів на кнопках і в кошику.
 * Значення збігаються з типовою сіткою EU (як на референсі).
 */
const EU_TO_INNER_CM = {
  36: '23',
  37: '23.5',
  38: '24',
  39: '24.5',
  40: '26.5',
  41: '27',
  42: '27.5',
  43: '28',
  44: '29',
  45: '30',
  46: '30.5',
  47: '31',
};

/** @param {number|string} eu */
export function innerLengthCmForEu(eu) {
  const n = Number(eu);
  if (Number.isNaN(n)) return null;
  return EU_TO_INNER_CM[n] ?? null;
}

/** Кнопка: `40-26.5см` */
export function formatSizeChipEu(eu) {
  const cm = innerLengthCmForEu(eu);
  if (cm == null) return String(eu);
  return `${eu}-${cm}см`;
}

/** Довший підпис: `EU 40 (26.5 см)` */
export function formatEuSizeWithCm(eu) {
  const cm = innerLengthCmForEu(eu);
  if (cm == null) return `EU ${eu}`;
  return `EU ${eu} (${cm} см)`;
}
