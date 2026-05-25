'use client';

import { useEffect, useMemo, useState } from 'react';
import sheetStyles from '../NovaPostDivisionPicker/styles.module.scss';
import NovaPostSearch from '../NovaPostDivisionPicker/NovaPostSearch';
import OrderSuccessModal from '../OrderSuccessModal/OrderSuccessModal';
import OrderPromoBlock from './OrderPromoBlock';
import orderStyles from './styles.module.scss';
import { formatUaPhoneInternational, isValidUaMobilePhone } from '@/lib/phoneUa';
import { calcVolumeCartTotals } from '@/lib/volumeDiscount';
import { submitShopOrder } from '@/lib/submitShopOrder';

const PHONE_ERR =
  'Вкажіть коректний мобільний номер України (наприклад, 099 807 35 56 або +380998073556).';

/**
 * @param {{
 *   open: boolean,
 *   onClose: () => void,
 *   items: import('@/context/CartContext').CartLine[],
 *   onSuccess?: () => void,
 *   showContinueShopping?: boolean,
 * }} props
 */
export default function OrderCheckoutSheet({
  open,
  onClose,
  items,
  onSuccess,
  showContinueShopping = true,
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const totalCount = useMemo(
    () => items.reduce((sum, x) => sum + x.quantity, 0),
    [items]
  );
  const volumeTotals = useMemo(() => calcVolumeCartTotals(items), [items]);
  const totalPrice = volumeTotals.total;
  const subtotalPrice = volumeTotals.subtotal;

  useEffect(() => {
    if (!open) return;
    setPhoneError('');
  }, [open]);

  useEffect(() => {
    if (!open) setSubmitting(false);
  }, [open]);

  if (!open || items.length === 0) {
    return <OrderSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />;
  }

  const validatePhoneOnBlur = () => {
    const v = phone.trim();
    if (!v) {
      setPhoneError('');
      return;
    }
    setPhoneError(isValidUaMobilePhone(phone) ? '' : PHONE_ERR);
  };

  const handleContinue = () => {
    if (submitting) return;
    onClose();
  };

  const handleSubmit = async () => {
    setPhoneError('');
    if (!phone.trim()) {
      alert('Будь ласка, вкажіть номер телефону');
      return;
    }
    if (!isValidUaMobilePhone(phone)) {
      setPhoneError(PHONE_ERR);
      return;
    }
    if (submitting) return;

    setSubmitting(true);
    const phoneFormatted = formatUaPhoneInternational(phone);

    try {
      const result = await submitShopOrder({
        items,
        name,
        phone: phoneFormatted,
        selectedDivision,
        totalCount,
        totalPrice,
        volumeTotals,
        subtotalPrice,
      });

      if (!result.ok) {
        alert(result.message ?? 'Помилка оформлення');
        return;
      }

      setSuccessOpen(true);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Order error:', err);
      alert('❌ Не вдалося надіслати замовлення.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OrderSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
      <div
        className={sheetStyles.sheetOverlay}
        onClick={() => !submitting && onClose()}
      >
        <div className={sheetStyles.sheet} onClick={(e) => e.stopPropagation()}>
          <div className={sheetStyles.header}>
            <h3>Оформлення замовлення</h3>
            <button
              type="button"
              className={sheetStyles.closeBtn}
              disabled={submitting}
              onClick={() => !submitting && onClose()}
            >
              ✕
            </button>
          </div>

          <div className={`${sheetStyles.form} ${orderStyles.sheetScroll}`}>
            <OrderPromoBlock items={items} active />

            <div className={orderStyles.summaryBlock}>
              {items.map((x) => (
                <div key={x.lineKey}>
                  <b>{x.productName}</b>
                  <br />
                  {x.colorLabel}, {x.sizeLabel}
                  {x.quantity > 1 ? ` × ${x.quantity}` : ''}
                </div>
              ))}
              {volumeTotals.discountTotal > 0 ? (
                <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#64748b' }}>
                  Підсумок: {subtotalPrice.toLocaleString('uk-UA')} грн · Знижка: −
                  {volumeTotals.discountTotal.toLocaleString('uk-UA')} грн
                </p>
              ) : null}
              <p className={orderStyles.summaryPrice}>
                До оплати: {totalPrice.toLocaleString('uk-UA')} грн
              </p>
            </div>

            <label htmlFor="order-delivery-name">Імʼя та прізвище:</label>
            <input
              id="order-delivery-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Наприклад, Іван Петренко"
            />

            <label htmlFor="order-delivery-phone">Номер телефону:</label>
            <input
              id="order-delivery-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setPhoneError('');
              }}
              onBlur={validatePhoneOnBlur}
              placeholder="099 807 35 56 або +380998073556"
              className={phoneError ? sheetStyles.inputError : undefined}
            />
            {phoneError ? (
              <p className={sheetStyles.fieldError} role="alert">
                {phoneError}
              </p>
            ) : null}

            <NovaPostSearch
              apiKey="ce73f85659e09209ee485640b87c8008"
              onSelectDivision={(division) => setSelectedDivision(division)}
            />

            <button
              type="button"
              className={sheetStyles.submitBtn}
              onClick={handleSubmit}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <span className={sheetStyles.submitSpinner} aria-hidden />
                  <span>Відправляємо…</span>
                </>
              ) : (
                'Підтвердити замовлення'
              )}
            </button>

            {showContinueShopping ? (
              <button
                type="button"
                className={orderStyles.continueBtn}
                onClick={handleContinue}
                disabled={submitting}
              >
                Продовжити покупки
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
