import {
  buildSettlementCityFull,
  formatNpOrderAddressLine,
  formatNpSalesDriveShippingAddress,
  getNovaBranchNumber,
  novaWarehouseHintFromDivisionName,
} from '@/lib/novaDivision';

/** Область без «обл.» / «область» — як у прикладі SalesDrive (`area`: «Вінницька»). */
function normalizeOblastLabel(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/\s+обл\.?$/iu, '')
    .replace(/\s+область$/iu, '')
    .trim();
}

/** Район без «р-н» / «район» — як у прикладі (`region`: «Гайсинський»). */
function normalizeRayonLabel(s) {
  if (typeof s !== 'string') return '';
  return s
    .replace(/\s+р-н\.?$/iu, '')
    .replace(/\s+район$/iu, '')
    .trim();
}

/** Розбиває повне імʼя на імʼя та прізвище (решта слів — прізвище / по батькові). */
export function splitFullNameForCrm(fullName) {
  const t = typeof fullName === 'string' ? fullName.trim() : '';
  if (!t || t === 'Не вказано') return {};
  const parts = t.split(/\s+/u).filter(Boolean);
  if (parts.length === 1) return { fName: parts[0] };
  if (parts.length === 2) return { fName: parts[0], lName: parts[1] };
  /* «Петро Іванович Шевчук»: імʼя, по батькові, прізвище (решта якщо є — у прізвище) */
  return { fName: parts[0], mName: parts[1], lName: parts.slice(2).join(' ') };
}

function str(v) {
  return typeof v === 'string' ? v.trim() : '';
}

function stringish(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  if (typeof v === 'string') return v.trim();
  return '';
}

function numFinite(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v.trim());
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}



/**
 * Спосіб доставки замовлення: у вашому інстансі в .env задається `id_9` як рядок —
 * handler його так і очікує; як передають лише число, у заявці може ставитись помилковий id (напр. 88).
 * Підтримуються також чисті числа та коерція 86/88 → 9.
 *
 * Приоритет: SALESDRIVE_HANDLER_SHIPPING_METHOD_ID → SALESDRIVE_SHIPPING_METHOD_ID.
 */
function resolveSalesDriveShippingMethodForSite() {
  const rawEnv =
    (typeof process.env.SALESDRIVE_HANDLER_SHIPPING_METHOD_ID === 'string' &&
      process.env.SALESDRIVE_HANDLER_SHIPPING_METHOD_ID.trim()) ||
    (typeof process.env.SALESDRIVE_SHIPPING_METHOD_ID === 'string' &&
      process.env.SALESDRIVE_SHIPPING_METHOD_ID.trim());

  if (rawEnv && rawEnv.trim()) {
    const t = rawEnv.trim();
    if (/^id[_-]\d+$/iu.test(t)) return t.toLowerCase();
    const n = numFinite(t);
    if (n !== undefined) {
      const k = Math.floor(n);
      if (k === 86 || k === 88) return 9;
      return k;
    }
  }

  return 9;
}

/** Поля novaposhta — строго з документації SalesDrive (handler JSON). Інші ключі не відправляємо. */
const NOVAPOSHTA_HANDLER_KEYS = new Set([
  'ServiceType',
  'payer',
  'area',
  'region',
  'city',
  'cityNameFormat',
  'WarehouseNumber',
  'Street',
  'BuildingNumber',
  'Flat',
  'ttn',
]);

/** Витягує лише допустимі ключі й опускає порожні рядки. */
function pickNovaposhtaHandlerFields(o) {
  if (!o || typeof o !== 'object' || Array.isArray(o)) return undefined;
  /** @type {Record<string, unknown>} */
  const out = {};
  for (const k of NOVAPOSHTA_HANDLER_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(o, k)) continue;
    const v = o[k];
    if (v === undefined || v === '') continue;
    out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * @param {Record<string, unknown> | undefined} o
 */
function sanitizeNovaposhtaOverride(o) {
  return pickNovaposhtaHandlerFields(o);
}

/** Текст у коментар замовлення. */
function shippingMethodCommentLabel() {
  return 'Нова Пошта';
}

/**
 * @param {Record<string, unknown>} line
 * @param {{ id: string, title: string, price: number }} defaults
 */
function normalizeProductLine(line, defaults) {
  const id =
    stringish(line.id) ||
    process.env.SALESDRIVE_PRODUCT_ID?.trim() ||
    defaults.id ||
    '1';
  const name = str(line.name) || defaults.title;
  const cost =
    numFinite(line.costPerItem) ??
    numFinite(line.price) ??
    (Number.isFinite(defaults.price) ? defaults.price : 0);
  const amountRaw = numFinite(line.amount);
  const amount =
    amountRaw != null && amountRaw >= 1 ? Math.floor(amountRaw) : 1;
  /** @type {Record<string, unknown>} */
  const out = {
    id,
    name,
    costPerItem: cost ?? 0,
    amount,
  };
  const desc = str(line.description) || process.env.SALESDRIVE_PRODUCT_DESCRIPTION?.trim();
  if (desc) out.description = desc;
  const discount =
    str(line.discount) || process.env.SALESDRIVE_PRODUCT_DISCOUNT?.trim();
  if (discount) out.discount = discount;
  const sku = str(line.sku) || process.env.SALESDRIVE_PRODUCT_SKU?.trim();
  if (sku) out.sku = sku;
  const commission =
    str(line.commission) || process.env.SALESDRIVE_PRODUCT_COMMISSION?.trim();
  if (commission) out.commission = commission;
  return out;
}

/**
 * @param {unknown} arr
 * @param {{ id: string, title: string, price: number }} defaults
 */
function buildProducts(arr, defaults) {
  const max = 50;
  if (Array.isArray(arr) && arr.length > 0) {
    const slice = arr.slice(0, max).filter((x) => x && typeof x === 'object');
    return slice.map((p) =>
      normalizeProductLine(
        /** @type {Record<string, unknown>} */ (p),
        defaults
      )
    );
  }
  return [normalizeProductLine({}, defaults)];
}

function isNpWarehouseRefCandidate(ref) {
  if (typeof ref !== 'string' || ref.trim().length === 0) return false;
  /** Ref складання НП або інший ключ — лише перевірка UUID. */
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu.test(
    ref.trim()
  );
}

function settlementRefFromDivision(division) {
  const s = division?.settlement;
  if (!s || typeof s !== 'object') return undefined;

  const externalId =
    typeof s.externalId === 'string'
      ? s.externalId.trim()
      : typeof s.external_id === 'string'
        ? s.external_id.trim()
        : '';
  if (isNpWarehouseRefCandidate(externalId)) return externalId;

  if (s.id == null) return undefined;
  const id = String(s.id).trim();
  return isNpWarehouseRefCandidate(id) ? id : undefined;
}

/** Ref відділення НП для `WarehouseNumber` (номер або Ref опису або UUID). */
function divisionWarehouseBranchRef(division) {
  if (!division || typeof division !== 'object') return undefined;
  const candidates = [
    division.externalId,
    division.external_id,
    division.ref,
    division.warehouseRef,
    division.branchRef,
    division.warehouseId,
    division.warehouse_uuid,
    division.globalId,
    division.guid,
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && isNpWarehouseRefCandidate(c)) return c.trim();
  }
  if (division.id != null) {
    const sid = String(division.id).trim();
    if (isNpWarehouseRefCandidate(sid)) return sid;
  }
  return undefined;
}

/**
 * Тільки поля з документації handler:
 * novaposhta[ServiceType,payer,area,region,city,cityNameFormat,WarehouseNumber,Street,BuildingNumber,Flat,ttn]
 */
function buildNovaposhtaBlock(division) {
  if (!division || typeof division !== 'object') return undefined;
  if (!division.id && !division.name) return undefined;

  const warehouseRef = divisionWarehouseBranchRef(division);
  const settlementUuid = settlementRefFromDivision(division);
  const branchNum = getNovaBranchNumber(division);

  const ref =
    division.id != null && String(division.id).trim().length > 0
      ? String(division.id).trim()
      : undefined;
  const divisionUuid = ref && isNpWarehouseRefCandidate(ref) ? ref : undefined;

  const s = division.settlement;
  const regionName = typeof s?.regionName === 'string' ? s.regionName.trim() : '';
  const parentRegionName =
    typeof s?.parentRegionName === 'string' ? s.parentRegionName.trim() : '';

  let areaSd;
  let rayonSd;
  if (parentRegionName && regionName) {
    areaSd = normalizeOblastLabel(parentRegionName);
    rayonSd = normalizeRayonLabel(regionName);
  } else if (regionName) {
    areaSd = normalizeOblastLabel(regionName);
  }

  const cityFull = buildSettlementCityFull(s);
  const rawCityLabel = typeof s?.name === 'string' ? s.name.trim() : '';
  const cityShortLabel = rawCityLabel.replace(/^city\s+/iu, '').trim();

  const ttnRaw = typeof division.ttn === 'string' ? division.ttn.trim() : '';

  /** @type {Record<string, unknown>} */
  const np = {
    ServiceType: 'Warehouse',
    payer: 'sender',
  };
  if (ttnRaw) np.ttn = ttnRaw;

  /** Новий адрес: Ref населеного пункту + номер відділення (WarehouseNumber як рядок). */
  if (settlementUuid != null && branchNum != null) {
    np.city = settlementUuid;
    np.WarehouseNumber = String(branchNum);
    return pickNovaposhtaHandlerFields(np);
  }

  /** Лише Ref відділення з довідника НП. */
  const whUuid = warehouseRef ?? divisionUuid;
  if (whUuid != null) {
    np.WarehouseNumber = whUuid;
    return pickNovaposhtaHandlerFields(np);
  }

  const warehouseNumberFallback =
    ref != null ? ref : branchNum != null ? String(branchNum) : undefined;

  if (cityShortLabel && warehouseNumberFallback) {
    np.cityNameFormat = 'short';
    np.city = cityShortLabel;
    np.WarehouseNumber = warehouseNumberFallback;
    if (areaSd) np.area = areaSd;
    if (rayonSd) np.region = rayonSd;
    return pickNovaposhtaHandlerFields(np);
  }

  if (ref) {
    np.WarehouseNumber = ref;
    return pickNovaposhtaHandlerFields(np);
  }

  if (cityFull != null && branchNum != null) {
    np.cityNameFormat = 'full';
    np.city = cityFull;
    np.WarehouseNumber = String(branchNum);
    return pickNovaposhtaHandlerFields(np);
  }

  if (cityFull != null && ref) {
    np.cityNameFormat = 'full';
    np.city = cityFull;
    np.WarehouseNumber = ref;
    return pickNovaposhtaHandlerFields(np);
  }

  const whHint = novaWarehouseHintFromDivisionName(
    typeof division.name === 'string' ? division.name : ''
  );
  if (whHint) {
    np.cityNameFormat = 'full';
    if (cityFull) np.city = cityFull;
    np.WarehouseNumber = whHint;
    return pickNovaposhtaHandlerFields(np);
  }

  if (typeof division.name === 'string' && division.name.trim()) {
    np.cityNameFormat = 'full';
    if (cityFull) np.city = cityFull;
    np.WarehouseNumber = division.name.trim();
    return pickNovaposhtaHandlerFields(np);
  }

  return undefined;
}

/**
 * Створює замовлення в SalesDrive через публічний handler API.
 * Тіло відповідає повній схемі handler (контакт, товари, доставка, УТМ, опційні перевізники).
 * @returns {Promise<{ ok: boolean, skipped?: boolean, reason?: string, message?: string, raw?: unknown }>}
 */
export async function createSalesDriveShopOrder(payload) {
  const apiKey = process.env.SALESDRIVE_API_KEY;
  const baseUrl = process.env.SALESDRIVE_BASE_URL?.trim().replace(/\/$/, '');
  const defaultProductId = process.env.SALESDRIVE_PRODUCT_ID?.trim();

  if (!apiKey || !baseUrl) {
    return { ok: true, skipped: true, reason: 'not_configured' };
  }

  const {
    phone,
    name,
    productTitle,
    priceUah,
    division,
    shipping_address: shippingFromClient,
    products: productsIn,
    fName: fNameIn,
    lName: lNameIn,
    mName: mNameIn,
    email: emailIn,
    company: companyIn,
    dateOfBirth: dobIn,
    payment_method: paymentIn,
    comment: commentIn,
    externalId: extIn,
    sajat: sajtLegacyIn,
    sajt: sajtIn,
    con_comment: conCommentIn,
    con_telegram: conTelegramIn,
    stockId: stockIdIn,
    commission: commissionIn,
    costPrice: costPriceIn,
    shipping_costs: shippingCostsIn,
    organizationId: orgIdIn,
    salesdrive_manager: managerIn,
    utmSourceFull,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    utmPage,
    novaposhta: novaposhtaOverride,
    ukrposhta: ukrposhtaIn,
    meest: meestIn,
    rozetka_delivery: rozetkaIn,
  } = payload;

  const paymentMethod =
    (typeof paymentIn === 'string' && paymentIn.trim()) ||
    process.env.SALESDRIVE_PAYMENT_METHOD?.trim() ||
    'Післяплата';
  const shippingMethod = resolveSalesDriveShippingMethodForSite();
  const shippingMethodComment = shippingMethodCommentLabel();

  const title =
    typeof productTitle === 'string' && productTitle.trim()
      ? productTitle.trim()
      : 'Замовлення з сайту';
  const price =
    typeof priceUah === 'number' && Number.isFinite(priceUah) ? priceUah : 0;

  const products = buildProducts(productsIn, {
    id: defaultProductId || '1',
    title,
    price,
  });

  const shipping_address = (() => {
    const sdLine = formatNpSalesDriveShippingAddress(division);
    if (sdLine) return sdLine;
    const fromClient =
      typeof shippingFromClient === 'string' ? shippingFromClient.trim() : '';
    if (fromClient) return fromClient;
    const formatted = formatNpOrderAddressLine(division);
    if (formatted) return formatted;
    if (division?.displayAddress?.trim()) return division.displayAddress.trim();
    if (division?.name?.trim()) return division.name.trim();
    return '—';
  })();

  const commentLines = [
    `Товар: ${title}`,
    `Оплата: ${paymentMethod}`,
    `Доставка: ${shippingMethodComment}`,
  ];
  if (name && name.trim() && name.trim() !== 'Не вказано') {
    commentLines.push(`Контакт: ${name.trim()}`);
  }
  if (!division?.name && !division?.id) {
    commentLines.push('Відділення НП: не обрано — уточнити у клієнта');
  }

  const branchNote = getNovaBranchNumber(division);
  if (branchNote != null) {
    commentLines.push(`Відділення НП: №${branchNote}`);
  }

  const autoName = splitFullNameForCrm(
    typeof name === 'string' ? name : ''
  );
  const fName = str(fNameIn) || autoName.fName;
  const lName = str(lNameIn) || autoName.lName;
  const mName = str(mNameIn) || autoName.mName;

  /** @type {Record<string, unknown>} */
  const body = {
    getResultData: 1,
    phone,
    products,
    payment_method: paymentMethod,
    shipping_method: shippingMethod,
    shipping_address,
    comment:
      typeof commentIn === 'string' && commentIn.trim()
        ? commentIn.trim()
        : commentLines.join('\n'),
  };

  if (fName) body.fName = fName;
  if (lName) body.lName = lName;
  if (mName) body.mName = mName;

  const email = str(emailIn) || process.env.SALESDRIVE_EMAIL?.trim();
  if (email) body.email = email;

  const company = str(companyIn) || process.env.SALESDRIVE_COMPANY?.trim();
  if (company) body.company = company;

  const dateOfBirth = str(dobIn) || process.env.SALESDRIVE_DATE_OF_BIRTH?.trim();
  if (dateOfBirth) body.dateOfBirth = dateOfBirth;

  const externalId =
    str(extIn) || process.env.SALESDRIVE_EXTERNAL_ID?.trim();
  if (externalId) body.externalId = externalId;

  const sajatRaw =
    str(sajtIn) || str(sajtLegacyIn) || process.env.SALESDRIVE_SITE?.trim();
  if (sajatRaw) body.sajt = sajatRaw;

  const con_comment = str(conCommentIn);
  if (con_comment) body.con_comment = con_comment;

  const con_telegram = str(conTelegramIn);
  if (con_telegram) body.con_telegram = con_telegram;

  const setNum = (key, val, envKey) => {
    const n = numFinite(val) ?? numFinite(process.env[envKey]);
    if (n !== undefined) body[key] = n;
  };

  setNum('stockId', stockIdIn, 'SALESDRIVE_STOCK_ID');
  setNum('commission', commissionIn, 'SALESDRIVE_COMMISSION');
  setNum('costPrice', costPriceIn, 'SALESDRIVE_COST_PRICE');
  setNum('shipping_costs', shippingCostsIn, 'SALESDRIVE_SHIPPING_COSTS');
  setNum(
    'organizationId',
    orgIdIn,
    'SALESDRIVE_ORGANIZATION_ID'
  );
  const mgrVal = managerIn ?? process.env.SALESDRIVE_MANAGER?.trim();
  const mgrNum = numFinite(mgrVal);
  if (mgrNum !== undefined) body.salesdrive_manager = Math.floor(mgrNum);

  const utmPairs = [
    ['utmSourceFull', utmSourceFull],
    ['utmSource', utmSource],
    ['utmMedium', utmMedium],
    ['utmCampaign', utmCampaign],
    ['utmContent', utmContent],
    ['utmTerm', utmTerm],
    ['utmPage', utmPage],
  ];
  for (const [k, v] of utmPairs) {
    const u = typeof v === 'string' ? v.trim() : '';
    if (u) body[k] = u;
  }

  const novaposhta = buildNovaposhtaBlock(division);
  /** @type {Record<string, unknown>} */
  const mergedNp = {
    ...(novaposhta ?? {}),
    ...(sanitizeNovaposhtaOverride(novaposhtaOverride) ?? {}),
  };
  mergedNp.ServiceType = mergedNp.ServiceType || 'Warehouse';
  const payerRaw =
    typeof mergedNp.payer === 'string' ? mergedNp.payer.trim().toLowerCase() : 'sender';
  mergedNp.payer = payerRaw === 'recipient' ? 'recipient' : 'sender';

  const npFinal = pickNovaposhtaHandlerFields(mergedNp);
  if (npFinal && Object.keys(npFinal).length > 0) {
    body.novaposhta = npFinal;
  }

  if (ukrposhtaIn && typeof ukrposhtaIn === 'object' && !Array.isArray(ukrposhtaIn)) {
    body.ukrposhta = ukrposhtaIn;
  }
  if (meestIn && typeof meestIn === 'object' && !Array.isArray(meestIn)) {
    body.meest = meestIn;
  }
  if (
    rozetkaIn &&
    typeof rozetkaIn === 'object' &&
    !Array.isArray(rozetkaIn)
  ) {
    body.rozetka_delivery = rozetkaIn;
  }

  /*
   * Поле має бути останнім: у SalesDrive під час обробки блоку доставки значення інколи
   * перезаписується — дубль після всіх merge.
   */
  body.shipping_method = resolveSalesDriveShippingMethodForSite();

  const url = `${baseUrl}/handler/`;
  const outboundBody = JSON.stringify(body);
  console.log('[SalesDrive/send] POST', url);
  console.log('[SalesDrive/send] shipping_method:', body.shipping_method, '| type:', typeof body.shipping_method);
  console.log('[SalesDrive/send] payment_method:', body.payment_method);
  console.log('[SalesDrive/send] body JSON:', outboundBody);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: outboundBody,
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : 'Network error',
    };
  }

  let raw;
  try {
    raw = await res.json();
  } catch {
    raw = null;
  }

  if (!res.ok) {
    const msg =
      (raw && typeof raw === 'object' && typeof raw.message === 'string' && raw.message) ||
      `SalesDrive HTTP ${res.status}`;
    return { ok: false, message: msg, raw };
  }

  const success =
    raw &&
    typeof raw === 'object' &&
    (raw.success === true ||
      raw.status === 'success' ||
      (raw.data && typeof raw.data === 'object' && 'orderId' in raw.data));

  if (!success) {
    const msg =
      (raw && typeof raw === 'object' && typeof raw.message === 'string' && raw.message) ||
      'SalesDrive: невідома відповідь';
    return { ok: false, message: msg, raw };
  }

  try {
    console.log('[SalesDrive/response]', JSON.stringify(raw));
  } catch {
    console.log('[SalesDrive/response]', raw);
  }

  return { ok: true, raw };
}
