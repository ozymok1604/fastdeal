/** Унікальний ключ позиції: модель + колір + розмір */
export function cartLineKey(productId, colorId, size) {
  return `${productId}:${colorId}:${size}`;
}
