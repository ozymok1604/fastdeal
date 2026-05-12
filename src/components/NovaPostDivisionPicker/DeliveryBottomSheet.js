import React, { useEffect, useState } from 'react';
import styles from './styles.module.scss';
import NovaPostSearch from './NovaPostSearch';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import emailjs from 'emailjs-com';
import OrderSuccessModal from '../OrderSuccessModal/OrderSuccessModal';
import { formatUaPhoneInternational, isValidUaMobilePhone } from '@/lib/phoneUa';

const DeliveryBottomSheet = ({ onSubmit, product }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [selectedDivision, setSelectedDivision] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);

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

  const handleSubmit = async () => {
    setPhoneError('');
    if (!name || !phone || !selectedDivision) {
      alert('Будь ласка, заповніть усі поля');
      return;
    }

    if (!isValidUaMobilePhone(phone)) {
      setPhoneError(PHONE_ERR);
      return;
    }

    const phoneFormatted = formatUaPhoneInternational(phone);

    const orderData = {
      name,
      phone: phoneFormatted,
      product: `${product?.name ?? 'Товар'} — ${
        product?.price?.toLocaleString('uk-UA') ?? ''
      } грн`,
      division: selectedDivision.name,
      address: selectedDivision.displayAddress,
    };

    try {
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
        <div className={styles.sheetOverlay} onClick={() => setOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.header}>
              <h3>Дані для доставки</h3>
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>
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

              <label>Ім’я та прізвище:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ваше ім’я та прізвище"
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

              <button className={styles.submitBtn} onClick={handleSubmit}>
                Підтвердити доставку
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeliveryBottomSheet;
