import React from 'react';
import styles from './styles.module.scss';
import Link from 'next/link';

const OrderSuccessModal = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>🎉 Вітаємо з замовленням!</h2>
        <p>Наш менеджер зателефонує вам найближчим часом для підтвердження доставки.</p>
        <Link href={'/'}>
          <button onClick={onClose} className={styles.okBtn}>
            Закрити
          </button>
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccessModal;
