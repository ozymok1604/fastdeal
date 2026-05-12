/**
 * Шляхи до фото: `public/images/{productId}/{colorId}/{n}.{ext}`
 * @param {string} productId
 * @param {string} colorId
 * @param {{ n: number, ext: string }[]} media
 */
export function mediaUrls(productId, colorId, media) {
  return media.map((m) => `/images/${productId}/${colorId}/${m.n}.${m.ext}`);
}

/** Олива: 1.jpeg + 2–8 .jpg */
const oliveMedia1to8 = [
  { n: 1, ext: 'jpeg' },
  { n: 2, ext: 'jpg' },
  { n: 3, ext: 'jpg' },
  { n: 4, ext: 'jpg' },
  { n: 5, ext: 'jpg' },
  { n: 6, ext: 'jpg' },
  { n: 7, ext: 'jpg' },
  { n: 8, ext: 'jpg' },
];

/** Койот / чорний: 1.jpeg + 2–5 .jpg */
const coyoteBlackMedia1to5 = [
  { n: 1, ext: 'jpeg' },
  { n: 2, ext: 'jpg' },
  { n: 3, ext: 'jpg' },
  { n: 4, ext: 'jpg' },
  { n: 5, ext: 'jpg' },
];

const shadowAMediaByColor = {
  olive: oliveMedia1to8,
  coyote: coyoteBlackMedia1to5,
  black: coyoteBlackMedia1to5,
};

const falconAMediaByColor = {
  olive: oliveMedia1to8.map((m) => ({ ...m })),
  coyote: coyoteBlackMedia1to5.map((m) => ({ ...m })),
  black: coyoteBlackMedia1to5.map((m) => ({ ...m })),
};

const shadowAHighlights = [
  '3D сітка (+5/+20°C)',
  'Сезон: весна/літо',
  'Розмір: 40-46.',
];

/** Спільний блок характеристик (без рядка про вагу) */
const specDetailsBase = `Матеріал: Натуральна шкіра, в комбінації з вставками 3D сітки.

Підкладка: дихаюча сітка (чудова вентиляція).

Підошва: Трекінгова підошва (виконана з термогуми).

Сезон:  весна/літо.

Колір: чорний/олива/койот.

Виробник: Харків.

Розміри: 40-46 (повномірні).`;

const specDetailsShadow = `${specDetailsBase}

Вага пари - 700грам.`;

const descriptionBase = `Кросівки, що не підведуть вас як в звичайну погоду, так і в більш суворих умовах. Шкіряне покриття зі сіткою робить використання особливо комфортним, так як нога не пріє. Виріб рівномірно розподіляє навантаження по стопі, зменшує тиск на зв'язки під час ходьби. Швидка шнурівка гарантує надійну фіксацію вашої стопи.`;

const advantagesShadow = [
  'система швидкої шнурівки;',
  "посилена п'ята / антивандальний посилений носок;",
  'чудово вентилюють завдяки 3D сітці;',
  'підошва EVA, з гарним протектором.',
];

const advantagesFalcon = [
  'система швидкої шнурівки;',
  "посилена п'ята / антивандальний посилений носок;",
  'чудово вентилюють завдяки 3D сітці;',
  'підошва Power-гума, з гарним протектором.',
];

const advantagesCrazy = [
  'система швидкої шнурівки;',
  "посилена п'ята / антивандальний посилений носок;",
  'чудово вентилюють завдяки 3D сітці;',
  'підошва Мувер-9-гума, з гарним протектором.',
];

export const products = [
  {
    id: 'tactic-shadow-a',
    name: 'Тактичні кросівки Shadow-A',
    price: 1980,
    compareAtMore: 500,
    highlights: shadowAHighlights,
    mediaByColor: shadowAMediaByColor,
    colors: [
      { id: 'olive', label: 'Олива' },
      { id: 'coyote', label: 'Койот' },
      { id: 'black', label: 'Чорні' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    specDetails: specDetailsShadow,
    description: descriptionBase,
    advantages: advantagesShadow,
  },
  {
    id: 'tactic-falcon-a',
    name: 'Тактичні кросівки Falcon-A',
    price: 2100,
    compareAtMore: 500,
    highlights: shadowAHighlights,
    mediaByColor: falconAMediaByColor,
    colors: [
      { id: 'olive', label: 'Олива' },
      { id: 'coyote', label: 'Койот' },
      { id: 'black', label: 'Чорні' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    specDetails: specDetailsBase,
    description: descriptionBase,
    advantagesIntro: 'З переваг варто відмітити:',
    advantages: advantagesFalcon,
  },
  {
    id: 'tactic-crazy-a',
    name: 'Тактичні кросівки Crazy-A',
    price: 2100,
    compareAtMore: 500,
    highlights: shadowAHighlights,
    mediaByColor: shadowAMediaByColor,
    colors: [
      { id: 'olive', label: 'Олива' },
      { id: 'coyote', label: 'Койот' },
      { id: 'black', label: 'Чорні' },
    ],
    sizes: [40, 41, 42, 43, 44, 45, 46],
    specDetails: specDetailsBase,
    description: descriptionBase,
    advantagesIntro: 'З переваг варто відмітити:',
    advantages: advantagesCrazy,
  },
];
