import emailjs from 'emailjs-com';
import { formatNpOrderAddressLine, formatNpSalesDriveShippingAddress } from '@/lib/novaDivision';
import { unitPriceAfterVolumeDiscount } from '@/lib/volumeDiscount';

/**
 * @param {{
 *   items: import('@/context/CartContext').CartLine[],
 *   name: string,
 *   phone: string,
 *   selectedDivision: Record<string, unknown> | null,
 *   totalCount: number,
 *   totalPrice: number,
 *   volumeTotals: ReturnType<typeof import('@/lib/volumeDiscount').calcVolumeCartTotals>,
 *   subtotalPrice: number,
 * }} params
 */
export async function submitShopOrder({
  items,
  name,
  phone,
  selectedDivision,
  totalCount,
  totalPrice,
  volumeTotals,
  subtotalPrice,
}) {
  const npAddressLine =
    formatNpSalesDriveShippingAddress(selectedDivision) ??
    formatNpOrderAddressLine(selectedDivision) ??
    '—';

  const productLines = items.map((x) => {
    const unit = unitPriceAfterVolumeDiscount(x.price, totalCount);
    return `${x.productName}, ${x.colorLabel}, ${x.sizeLabel} × ${x.quantity} — ${(unit * x.quantity).toLocaleString('uk-UA')} грн`;
  });
  if (volumeTotals.discountTotal > 0) {
    productLines.push(
      `Знижка (${totalCount} пар, −${volumeTotals.discountPerPair} грн/пара): −${volumeTotals.discountTotal.toLocaleString('uk-UA')} грн`
    );
    productLines.push(`Разом: ${totalPrice.toLocaleString('uk-UA')} грн`);
  }

  const orderData = {
    name: name.trim() || 'Не вказано',
    phone,
    product: productLines.join('\n'),
    division: selectedDivision?.name ?? 'Не вказано',
    address: npAddressLine,
  };

  const productTitle =
    items.length === 1 && items[0].quantity === 1
      ? `${items[0].productName}, ${items[0].colorLabel}, ${items[0].sizeLabel}`
      : items.length === 1
        ? `${items[0].productName}, ${items[0].colorLabel}, ${items[0].sizeLabel} × ${items[0].quantity}`
        : `Замовлення з сайту (${items.length} поз.)`;

  /** @type {{ id: string, name: string, costPerItem: number, amount: number }[]} */
  const sdProducts = [];
  for (const line of items) {
    const title = `${line.productName}, ${line.colorLabel}, ${line.sizeLabel}`;
    const costPerItem = unitPriceAfterVolumeDiscount(line.price, totalCount);
    if (line.salesdriveProductId) {
      sdProducts.push({
        id: line.salesdriveProductId,
        name: title,
        costPerItem,
        amount: line.quantity,
      });
    } else {
      for (let i = 0; i < line.quantity; i++) {
        sdProducts.push({
          id: '1',
          name: title,
          costPerItem,
          amount: 1,
        });
      }
    }
  }

  /** @type {Record<string, unknown>} */
  const crmBody = {
    phone,
    name: orderData.name,
    productTitle,
    priceUah: totalPrice,
    sajt:
      typeof window !== 'undefined' && window.location?.hostname
        ? window.location.hostname
        : undefined,
    shipping_address: orderData.address,
    division: selectedDivision
      ? {
          id: selectedDivision.id,
          name: selectedDivision.name,
          displayAddress: selectedDivision.displayAddress,
          branchNumber: selectedDivision.branchNumber,
          number: selectedDivision.number,
          divisionNumber: selectedDivision.divisionNumber,
          divisionCategory: selectedDivision.divisionCategory,
          externalId: selectedDivision.externalId,
          ref: selectedDivision.ref,
          settlement: selectedDivision.settlement,
        }
      : null,
    products: sdProducts.slice(0, 50),
  };

  const crmRes = await fetch('/api/order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(crmBody),
  });

  let crmJson = null;
  try {
    crmJson = await crmRes.json();
  } catch {
    /* ignore */
  }

  if (!crmRes.ok) {
    return {
      ok: false,
      message:
        crmJson?.message ??
        'Не вдалося створити замовлення в CRM (SalesDrive). Спробуйте ще раз або звʼяжіться з підтримкою.',
    };
  }

  await emailjs.send('service_mzq9m1s', 'template_f096jre', orderData, 'J7bT_g0gjGqjDdPKA');

  return { ok: true, orderData };
}
