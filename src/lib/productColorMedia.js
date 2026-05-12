import fs from 'node:fs';
import path from 'node:path';

/** Дозволені сегменти шляху (без `..` та слешів) */
const SAFE_SEGMENT = /^[a-z0-9-]+$/i;

/**
 * Чи виглядає файл як растрове зображення (за розширенням, не хардкод per-product).
 * HEIC/SVG тощо свідомо не вмикаю — у браузері часто не відмалюються через next/image.
 */
function isRasterImageFilename(name) {
  return /\.(avif|bmp|gif|jpe?g|png|tiff?|webp)$/i.test(name);
}

/**
 * Повертає публічні URL `/images/...` для усіх зображень у `public/images/{productId}/{colorId}/`.
 * Сортування «природнє»: 1, 2, …, 9, 10.
 * @param {string} productId
 * @param {string} colorId
 * @returns {string[]}
 */
export function listProductColorImageUrls(productId, colorId) {
  if (!SAFE_SEGMENT.test(productId) || !SAFE_SEGMENT.test(colorId)) {
    return [];
  }

  const dir = path.join(process.cwd(), 'public', 'images', productId, colorId);

  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const names = entries
    .filter((e) => e.isFile() && isRasterImageFilename(e.name))
    .map((e) => e.name);

  const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  names.sort((a, b) => collator.compare(a, b));

  return names.map(
    (filename) =>
      `/images/${productId}/${colorId}/${encodeURIComponent(filename)}`
  );
}
