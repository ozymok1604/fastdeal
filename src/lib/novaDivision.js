/** Виділяє номер відділення з назви типу «Відділення №15». */
export function novaWarehouseHintFromDivisionName(name) {
  const m = typeof name === 'string' ? name.match(/№\s*(\d+)/u) : null;
  return m ? m[1] : undefined;
}

/**
 * Номер відділення Нової Пошти: із полів API, інакше з назви (№N).
 * @param {Record<string, unknown> | null | undefined} division
 * @returns {number | undefined}
 */
export function getNovaBranchNumber(division) {
  if (!division || typeof division !== 'object') return undefined;
  const candidates = [
    division.branchNumber,
    division.number,
    division.divisionNumber,
    division.branchNo,
  ];
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c;
    if (typeof c === 'string' && /^\d+$/.test(c.trim())) return parseInt(c.trim(), 10);
  }
  const fromName = novaWarehouseHintFromDivisionName(
    typeof division.name === 'string' ? division.name : ''
  );
  if (fromName) return parseInt(fromName, 10);
  return undefined;
}

/**
 * Місто у форматі для novaposhta[city] (cityNameFormat=full): «Місто (Область)».
 * @param {{ name?: string, regionName?: string } | null | undefined} settlement
 */
export function buildSettlementCityFull(settlement) {
  if (!settlement?.name?.trim()) return undefined;
  const name = settlement.name.trim();
  const r = settlement.regionName?.trim();
  if (r) return `${name} (${r})`;
  return name;
}

/**
 * Рядок для листа / клієнта: «відділення №9, вул. …».
 * @param {Record<string, unknown> | null | undefined} division
 */
export function formatNpOrderAddressLine(division) {
  if (!division) return undefined;
  const n = getNovaBranchNumber(division);
  const branchLabel = n != null ? `відділення №${n}` : null;
  const addr = typeof division.displayAddress === 'string' ? division.displayAddress.trim() : '';
  if (branchLabel && addr) return `${branchLabel}, ${addr}`;
  if (branchLabel) return branchLabel;
  if (addr) return addr;
  return typeof division.name === 'string' ? division.name.trim() || undefined : undefined;
}

function looksLikeOblastLabel(s) {
  if (typeof s !== 'string' || !s.trim()) return false;
  return /\s*(обл\.?|область)\s*$/iu.test(s.trim()) || /\boblast\b/iu.test(s);
}

/** Район для дужок у `shipping_address` (не помилково додаємо «р-н» до назви області). */
function formatRayonParenPart(regionName, parentRegionName) {
  const r = typeof regionName === 'string' ? regionName.trim() : '';
  if (!r) return '';
  if (looksLikeOblastLabel(r) && !parentRegionName?.trim()) return '';
  return /\s*(р-н|район)\s*$/iu.test(r)
    ? r
    : `${r.replace(/\s+р-н\.?$/iu, '').replace(/\s+район$/iu, '').trim()} р-н`;
}

function formatOblastParenPart(name) {
  const p = typeof name === 'string' ? name.trim() : '';
  if (!p) return '';
  if (/\s*(обл\.?|область)\s*$/iu.test(p) || /\boblast\b/iu.test(p)) return p;
  return `${p.replace(/\s+обл\.?$/iu, '').replace(/\s+область$/iu, '').replace(/\boblast\b/iu, '').trim()} обл.`;
}

/**
 * Людинозчитний рядок для SalesDrive («смт Місто (Район р-н, Область обл.), відділення №N»),
 * синхронно з їхнім handler-прикладом для доставки у відділення НП.
 * @param {Record<string, unknown> | null | undefined} division
 */
export function formatNpSalesDriveShippingAddress(division) {
  if (!division || typeof division !== 'object') return undefined;
  const s = division.settlement;
  const regionName = typeof s?.regionName === 'string' ? s.regionName.trim() : '';
  const parentRegionName =
    typeof s?.parentRegionName === 'string' ? s.parentRegionName.trim() : '';

  const n = getNovaBranchNumber(division);
  const branchSuffix = n != null ? `, відділення №${n}` : '';

  const typeRaw =
    typeof s?.settlementType === 'string'
      ? s.settlementType.trim()
      : typeof s?.type === 'string'
        ? s.type.trim()
        : '';
  /** Технічні мітки API (англ.), не показуємо в адресі як префікс. */
  const typePrefix =
    typeRaw &&
    !/^(city|town|village|settlement|urban|metro|district|capital)$/iu.test(typeRaw.trim())
      ? `${typeRaw} `
      : '';

  let cityCore = typeof s?.name === 'string' ? s.name.trim() : '';
  cityCore = cityCore.replace(/^city\s+/iu, '').trim();

  if (!cityCore) {
    return formatNpOrderAddressLine(division);
  }

  const rayonPart = (() => {
    if (!regionName.trim() && parentRegionName.trim()) return '';
    if (
      regionName.trim() &&
      looksLikeOblastLabel(regionName) &&
      !parentRegionName.trim()
    ) {
      return '';
    }
    if (!regionName.trim()) return '';
    return formatRayonParenPart(regionName, parentRegionName || '');
  })();

  const oblastPart = (() => {
    if (parentRegionName.trim()) return formatOblastParenPart(parentRegionName);
    if (regionName.trim() && looksLikeOblastLabel(regionName))
      return formatOblastParenPart(regionName);
    return '';
  })();

  /** @type {string[]} */
  const inside = [];
  if (rayonPart) inside.push(rayonPart);
  if (oblastPart) inside.push(oblastPart);
  const locality = inside.length ? ` (${inside.join(', ')})` : '';
  return `${typePrefix}${cityCore}${locality}${branchSuffix}`;
}
