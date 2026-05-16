import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import NovaPostSearch from './NovaPostSearch';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import emailjs from 'emailjs-com';
import OrderSuccessModal from '../OrderSuccessModal/OrderSuccessModal';
import { formatUaPhoneInternational, isValidUaMobilePhone } from '@/lib/phoneUa';
import { formatNpOrderAddressLine, formatNpSalesDriveShippingAddress } from '@/lib/novaDivision';

const DeliveryBottomSheet = ({ onSubmit, product }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const PHONE_ERR =
    'Вкажіть коректний мобільний номер України (наприклад, 099 807 35 56 або +380998073556).';

  const validatePhoneOnBlur = () => {
    const v = phone.trim();
    if (!v) {
      setPhoneError('');
      return;
    }
    setPhoneError(isValidUaMobilePhone(phone) ? '' : PHONE_ERR);
  };

  useEffect(() => {
    if (!open) return;
    setPhoneError('');
  }, [open]);

  useEffect(() => {
    if (!open) setSubmitting(false);
  }, [open]);

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

    const npAddressLine =
      formatNpSalesDriveShippingAddress(selectedDivision) ??
      formatNpOrderAddressLine(selectedDivision) ??
      '—';

    const orderData = {
      name: name.trim() || 'Не вказано',
      phone: phoneFormatted,
      product: `${product?.name ?? 'Товар'} — ${
        product?.price?.toLocaleString('uk-UA') ?? ''
      } грн`,
      division: selectedDivision?.name ?? 'Не вказано',
      address: npAddressLine,
    };

    try {
      const priceUah =
        typeof product?.price === 'number' ? product.price : Number(product?.price) || 0;
      const productTitle = product?.name ?? 'Товар';

      /** @type {Record<string, unknown>} */
      const crmBody = {
        phone: phoneFormatted,
        name: orderData.name,
        productTitle,
        priceUah,
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
      };

      const sdId = typeof product?.salesdriveProductId === 'string' && product.salesdriveProductId.trim();
      if (sdId) {
        crmBody.products = [
          {
            id: sdId,
            name: productTitle,
            costPerItem: priceUah,
            amount: 1,
          },
        ];
      }

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
        alert(
          crmJson?.message ??
            'Не вдалося створити замовлення в CRM (SalesDrive). Спробуйте ще раз або звʼяжіться з підтримкою.'
        );
        return;
      }

      // ✉️ Надсилаємо через EmailJS
      await emailjs.send(
        'service_mzq9m1s', // твій Service ID
        'template_f096jre', // твій Template ID
        orderData,
        'J7bT_g0gjGqjDdPKA' // твій Public key
      );

      setSuccessOpen(true); // ✅ відкриваємо модалку
      setOpen(false);

      onSubmit({
        ...orderData,
        division: selectedDivision,
      });
    } catch (err) {
      console.error('Email send error:', err);
      alert('❌ Не вдалося надіслати замовлення.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <OrderSuccessModal open={successOpen} onClose={() => setSuccessOpen(false)} />
      <button onClick={() => setOpen(true)} className={styles.buyButton} type="button">
        <ShoppingCartIcon size={22} weight="bold" />
        <span>Замовити</span>
      </button>

      {open && (
        <div className={styles.sheetOverlay} onClick={() => !submitting && setOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Дані для доставки</h3>
              <button
                type="button"
                className={styles.closeBtn}
                disabled={submitting}
                onClick={() => !submitting && setOpen(false)}
                aria-busy={submitting}
              >
                ✕
              </button>
            </div>

            <div className={styles.form}>
              {product && (
                <div className={styles.productInfo}>
                  <p>
                    <b>Товар:</b> {product.name}
                  </p>
                  <p>
                    <b>Ціна:</b> {product.price?.toLocaleString('uk-UA')} грн
                  </p>
                  {product.sizeLabel && (
                    <p>
                      <b>Розмір:</b> {product.sizeLabel}
                    </p>
                  )}
                </div>
              )}

              <label htmlFor="delivery-name">Імʼя та прізвище:</label>
              <input
                id="delivery-name"
                type="text"
                name="deliveryName"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Наприклад, Іван Петренко"
              />

              <label htmlFor="delivery-phone">Номер телефону:</label>
              <input
                id="delivery-phone"
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
                className={phoneError ? styles.inputError : undefined}
                aria-invalid={phoneError ? 'true' : 'false'}
                aria-describedby={phoneError ? 'delivery-phone-error' : undefined}
              />
              {phoneError ? (
                <p id="delivery-phone-error" className={styles.fieldError} role="alert">
                  {phoneError}
                </p>
              ) : null}

              <NovaPostSearch
                apiKey="ce73f85659e09209ee485640b87c8008"
                onSelectDivision={(division) => setSelectedDivision(division)}
              />

              <button
                type="button"
                className={styles.submitBtn}
                onClick={handleSubmit}
                disabled={submitting}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <span className={styles.submitSpinner} aria-hidden />
                    <span>Відправляємо…</span>
                  </>
                ) : (
                  'Підтвердити доставку'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryBottomSheet;
