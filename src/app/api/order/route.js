import { createSalesDriveShopOrder } from '@/lib/salesdriveOrder';

function badRequest(message) {
  return Response.json({ ok: false, message }, { status: 400 });
}

/** @returns {Record<string, unknown> | undefined} */
function asPlainRecord(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return undefined;
  return /** @type {Record<string, unknown>} */ (v);
}

function str(parsed, key) {
  const v = parsed[key];
  return typeof v === 'string' ? v.trim() : '';
}

/**
 * Поля другого порядку з тіла POST — передаємо в SalesDrive лише звичайний JSON-об'єкт.
 * @param {Record<string, unknown>} parsed
 */
function buildSalesdrivePayload(parsed) {
  /** @type {Record<string, unknown>} */
  const out = {};

  const copyStrKeys = [
    'fName',
    'lName',
    'mName',
    'email',
    'company',
    'dateOfBirth',
    'comment',
    'externalId',
    'sajat',
    'sajt',
    'con_comment',
    'con_telegram',
    'utmSourceFull',
    'utmSource',
    'utmMedium',
    'utmCampaign',
    'utmContent',
    'utmTerm',
    'utmPage',
  ];
  for (const k of copyStrKeys) {
    const s = str(parsed, k);
    if (s) out[k] = s;
  }

  for (const pmKey of ['payment_method']) {
    if (!(pmKey in parsed)) continue;
    const raw = parsed[pmKey];
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      out[pmKey] = raw;
      continue;
    }
    if (typeof raw === 'string') {
      const s = raw.trim();
      if (s) out[pmKey] = s;
    }
  }

  const numKeys = ['stockId', 'commission', 'costPrice', 'shipping_costs', 'organizationId'];
  for (const k of numKeys) {
    if (!(k in parsed)) continue;
    const raw = parsed[k];
    let n =
      typeof raw === 'number' && Number.isFinite(raw)
        ? raw
        : typeof raw === 'string' && raw.trim()
          ? Number(raw.trim())
          : NaN;
    if (!Number.isFinite(n)) continue;
    out[k] = n;
  }

  if ('salesdrive_manager' in parsed) {
    const raw = parsed.salesdrive_manager;
    let n =
      typeof raw === 'number' && Number.isFinite(raw)
        ? raw
        : typeof raw === 'string' && raw.trim()
          ? Number(raw.trim())
          : NaN;
    if (Number.isFinite(n)) out.salesdrive_manager = Math.floor(n);
  }

  const npOv = asPlainRecord(parsed.novaposhta);
  if (npOv) out.novaposhta = npOv;

  const ukr = asPlainRecord(parsed.ukrposhta);
  if (ukr) out.ukrposhta = ukr;

  const meest = asPlainRecord(parsed.meest);
  if (meest) out.meest = meest;

  const rz = asPlainRecord(parsed.rozetka_delivery);
  if (rz) out.rozetka_delivery = rz;

  if (parsed.products !== undefined) {
    if (!Array.isArray(parsed.products))
      throw new Error('products_not_array');
    out.products = parsed.products;
  }

  return out;
}

export async function POST(request) {
  let parsed;
  try {
    parsed = await request.json();
  } catch {
    return badRequest('Некоректний JSON');
  }

  const phone = typeof parsed.phone === 'string' ? parsed.phone.trim() : '';
  if (!phone) {
    return badRequest('Обовʼязково поле phone');
  }

  const name = typeof parsed.name === 'string' ? parsed.name.trim() : '';
  const productTitle =
    typeof parsed.productTitle === 'string' ? parsed.productTitle.trim() : 'Замовлення з сайту';
  const priceUah =
    typeof parsed.priceUah === 'number'
      ? parsed.priceUah
      : typeof parsed.priceUah === 'string'
        ? Number(parsed.priceUah)
        : 0;

  let division = null;
  if (parsed.division && typeof parsed.division === 'object') {
    const d = parsed.division;
    let settlement = null;
    if (d.settlement && typeof d.settlement === 'object') {
      const st = d.settlement;
      settlement = {
        ...st,
        id: st.id != null ? String(st.id).trim() || undefined : undefined,
        name: typeof st.name === 'string' ? st.name : undefined,
        regionName:
          typeof st.regionName === 'string'
            ? st.regionName
            : typeof st.region?.name === 'string'
              ? st.region.name
              : undefined,
        parentRegionName:
          typeof st.parentRegionName === 'string'
            ? st.parentRegionName
            : typeof st.region?.parent?.name === 'string'
              ? st.region.parent.name
              : undefined,
        externalId:
          typeof st.externalId === 'string'
            ? st.externalId.trim() || undefined
            : typeof st.external_id === 'string'
              ? st.external_id.trim() || undefined
              : undefined,
      };
    }
    const numOrUndef = (v) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string' && /^\d+$/.test(v.trim())) return parseInt(v.trim(), 10);
      return undefined;
    };
    /** Номер пункту НП: «2» як число або рядок типу «7161/1» (ППВ) — не відкидати. */
    const npWarehouseNumber = (v) => {
      if (typeof v === 'number' && Number.isFinite(v)) return v;
      if (typeof v === 'string') {
        const t = v.trim();
        if (!t) return undefined;
        if (/^\d+$/.test(t)) return parseInt(t, 10);
        return t;
      }
      return undefined;
    };
    division = {
      id: d.id != null ? String(d.id).trim() || undefined : undefined,
      name: typeof d.name === 'string' ? d.name : undefined,
      displayAddress: typeof d.displayAddress === 'string' ? d.displayAddress : undefined,
      externalId:
        typeof d.externalId === 'string'
          ? d.externalId.trim() || undefined
          : typeof d.external_id === 'string'
            ? d.external_id.trim() || undefined
            : undefined,
      ref: typeof d.ref === 'string' ? d.ref.trim() || undefined : undefined,
      divisionCategory:
        typeof d.divisionCategory === 'string' ? d.divisionCategory.trim() || undefined : undefined,
      branchNumber: numOrUndef(d.branchNumber),
      number: npWarehouseNumber(d.number),
      divisionNumber: numOrUndef(d.divisionNumber),
      settlement,
    };
  }

  const shippingAddress = (() => {
    const raw =
      typeof parsed.shipping_address === 'string' ? parsed.shipping_address.trim() : '';
    if (raw) return raw;
    if (parsed.division && typeof parsed.division === 'object') {
      const d = parsed.division;
      if (typeof d.displayAddress === 'string' && d.displayAddress.trim()) return d.displayAddress.trim();
      if (typeof d.name === 'string' && d.name.trim()) return d.name.trim();
    }
    return '';
  })();

  let extra;
  try {
    extra = buildSalesdrivePayload(parsed);
  } catch (e) {
    if (e instanceof Error && e.message === 'products_not_array') {
      return badRequest('Поле products має бути масивом');
    }
    throw e;
  }

  const result = await createSalesDriveShopOrder({
    phone,
    name,
    productTitle,
    priceUah: Number.isFinite(priceUah) ? priceUah : 0,
    division,
    shipping_address: shippingAddress,
    ...extra,
  });

  if (!result.ok) {
    console.error('[order] SalesDrive:', result.message, result.raw);
    return Response.json(
      { ok: false, message: result.message || 'Помилка SalesDrive' },
      { status: 502 }
    );
  }

  return Response.json({ ok: true, skipped: !!result.skipped, reason: result.reason });
}
