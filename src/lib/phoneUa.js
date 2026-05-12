/** Дійсні коди операторів після +380 (перші дві цифри національного номера) */
const UA_MOBILE_PREFIXES = new Set([
  '39',
  '50',
  '63',
  '66',
  '67',
  '68',
  '73',
  '75',
  '77',
  '91',
  '92',
  '93',
  '94',
  '95',
  '96',
  '97',
  '98',
  '99',
]);

/**
 * Нормалізує введення до 12 цифр 380XXXXXXXXX або null.
 * Підтримує +380…, 380…, 0XX… (10 цифр), інколи 9 цифр без ведучого 0.
 * @param {string} input
 * @returns {string | null}
 */
export function normalizeUaPhoneDigits(input) {
  let s = String(input ?? '')
    .trim()
    .replace(/[\s\u00A0\-().]/g, '');
  if (s.startsWith('+')) s = s.slice(1);
  const digits = s.replace(/\D/g, '');

  if (digits.length === 12 && digits.startsWith('380')) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith('0')) {
    return `38${digits}`;
  }
  if (digits.length === 9 && /^[3-9]\d{8}$/.test(digits)) {
    return `380${digits}`;
  }
  return null;
}

/**
 * Чи це валідний український мобільний (після нормалізації — перевірка коду оператора).
 * @param {string} input
 */
export function isValidUaMobilePhone(input) {
  const d = normalizeUaPhoneDigits(input);
  if (!d || d.length !== 12 || !d.startsWith('380')) return false;
  const operator = d.slice(3, 5);
  return UA_MOBILE_PREFIXES.has(operator);
}

/**
 * Для відображення / листів: +380671234567
 * @param {string} input
 */
export function formatUaPhoneInternational(input) {
  const d = normalizeUaPhoneDigits(input);
  if (!d) return '';
  return `+${d}`;
}
