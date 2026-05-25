'use client';

import Link from 'next/link';
import { MinusIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react';
import { useCart } from '@/context/CartContext';
import { unitPriceAfterVolumeDiscount } from '@/lib/volumeDiscount';
import styles from './styles.module.scss';

export default function CartDrawer() {
  const {
    items,
    totalCount,
    subtotalPrice,
    totalPrice,
    volumeTotals,
    drawerOpen,
    closeDrawer,
    openCheckout,
    removeLine,
    setQuantity,
  } = useCart();

  if (!drawerOpen) return null;

  return (
    <div className={styles.overlay} onClick={closeDrawer} role="presentation">
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label="Кошик"
      >
        <div className={styles.drawerHead}>
          <h2 className={styles.drawerTitle}>
            Кошик
            {totalCount > 0 ? <span className={styles.countBadge}>{totalCount}</span> : null}
          </h2>
          <button type="button" className={styles.closeBtn} onClick={closeDrawer} aria-label="Закрити">
            <XIcon size={22} weight="bold" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <p>Кошик порожній</p>
            <p className={styles.emptyHint}>Оберіть модель, колір і розмір — і додайте кросівки сюди.</p>
            <Link href="/" className={styles.catalogLink} onClick={closeDrawer}>
              До каталогу
            </Link>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((line) => {
                const unit = unitPriceAfterVolumeDiscount(line.price, totalCount);
                const lineTotal = unit * line.quantity;
                const hasDiscount = volumeTotals.discountPerPair > 0;
                return (
                <li key={line.lineKey} className={styles.line}>
                  <div className={styles.lineMain}>
                    <p className={styles.lineName}>{line.productName}</p>
                    <p className={styles.lineMeta}>
                      {line.colorLabel} · {line.sizeLabel}
                    </p>
                    <p className={styles.linePrice}>
                      {hasDiscount && unit < line.price ? (
                        <>
                          <span className={styles.linePriceOld}>
                            {(line.price * line.quantity).toLocaleString('uk-UA')} грн
                          </span>{' '}
                        </>
                      ) : null}
                      {lineTotal.toLocaleString('uk-UA')} грн
                    </p>
                  </div>
                  <div className={styles.lineActions}>
                    <div className={styles.qty}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label="Менше"
                        onClick={() => setQuantity(line.lineKey, line.quantity - 1)}
                      >
                        <MinusIcon size={16} weight="bold" />
                      </button>
                      <span className={styles.qtyVal}>{line.quantity}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        aria-label="Більше"
                        onClick={() => setQuantity(line.lineKey, line.quantity + 1)}
                      >
                        <PlusIcon size={16} weight="bold" />
                      </button>
                    </div>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      aria-label="Видалити"
                      onClick={() => removeLine(line.lineKey)}
                    >
                      <TrashIcon size={18} />
                    </button>
                  </div>
                </li>
              );
              })}
            </ul>

            <div className={styles.footer}>
              {volumeTotals.discountTotal > 0 ? (
                <>
                  <div className={styles.totalRowMuted}>
                    <span>Підсумок</span>
                    <span>{subtotalPrice.toLocaleString('uk-UA')} грн</span>
                  </div>
                  <div className={styles.totalRowDiscount}>
                    <span>
                      Знижка (−{volumeTotals.discountPerPair} грн/пара)
                    </span>
                    <span>−{volumeTotals.discountTotal.toLocaleString('uk-UA')} грн</span>
                  </div>
                </>
              ) : null}
              <div className={styles.totalRow}>
                <span>Разом</span>
                <strong>{totalPrice.toLocaleString('uk-UA')} грн</strong>
              </div>
              <button type="button" className={styles.checkoutBtn} onClick={openCheckout}>
                Оформити замовлення
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
