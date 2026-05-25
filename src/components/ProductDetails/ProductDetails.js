'use client';
import styles from './styles.module.scss';
import TrustBlocks from '../TrustBlocks/TrustBlocks';
import VolumeDiscountNote from '../VolumeDiscountNote/VolumeDiscountNote';
import { formatEuSizeWithCm } from '@/data/euSizeCm';
import { getSalesdriveProductId } from '@/data/salesdriveProductIds';
import { ShoppingCartIcon } from '@phosphor-icons/react';
import { useCart } from '@/context/CartContext';

/** Розбиває `specDetails` по абзацах; рядки виду «Поле: значення» — жирно до двокрапки включно */
function SpecDetailsContent({ text, className }) {
  const blocks = text.trim().split(/\n\n+/);
  return (
    <div className={className}>
      {blocks.map((block, i) => {
        const trimmed = block.trim();
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx <= 0) {
          return (
            <p key={i} className={styles.detailPlainLine}>
              {trimmed}
            </p>
          );
        }
        const label = trimmed.slice(0, colonIdx + 1).trim();
        const value = trimmed.slice(colonIdx + 1).trim();
        return (
          <p key={i} className={styles.detailLabeledRow}>
            <span className={styles.detailLineLabel}>{label}</span>
            {value ? (
              <>
                {' '}
                <span className={styles.detailLineValue}>{value}</span>
              </>
            ) : null}
          </p>
        );
      })}
    </div>
  );
}

const ProductDetails = ({
  productId,
  name,
  price,
  compareAtMore,
  colorLabel,
  colorId,
  size,
  specDetails,
  description,
  advantages,
  advantagesIntro,
}) => {
  const { addItem, openCheckout } = useCart();
  const sizeLabel = formatEuSizeWithCm(size);
  const hasAdvantages = Array.isArray(advantages) && advantages.length > 0;
  const salesdriveProductId = getSalesdriveProductId(productId, colorId, size);

  const handleOrder = () => {
    addItem({
      productId,
      productName: name,
      colorId,
      colorLabel,
      size,
      sizeLabel,
      price,
      salesdriveProductId,
    });
    openCheckout();
  };

  return (
    <div>
      <h2 className={styles.name}>{name}</h2>
      <div className={styles.row}>
        <div className={styles.priceBlock}>
          {typeof compareAtMore === 'number' && compareAtMore > 0 && (
            <p className={styles.oldPrice}>
              {(price + compareAtMore).toLocaleString('uk-UA')} грн
            </p>
          )}
          <h3 className={styles.price}>{price.toLocaleString('uk-UA')} грн</h3>
        </div>

        <button
          type="button"
          className={styles.buyButton}
          onClick={handleOrder}
        >
          <ShoppingCartIcon size={22} weight="bold" aria-hidden />
          <span>Замовити</span>
        </button>
      </div>

      <VolumeDiscountNote variant="card" />

      <div className={styles.specs}>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Колір</span>
          <span className={styles.specValue}>{colorLabel}</span>
        </div>
        <div className={styles.specItem}>
          <span className={styles.specLabel}>Розмір</span>
          <span className={styles.specValue}>{sizeLabel}</span>
        </div>
      </div>

      {specDetails ? (
        <section className={styles.detailSection} aria-labelledby="product-details-heading">
          <h3 id="product-details-heading" className={styles.detailHeading}>
            Деталі
          </h3>
          <SpecDetailsContent text={specDetails} className={styles.specDetailsWrap} />
        </section>
      ) : null}

      {description ? (
        <section className={styles.detailSection} aria-labelledby="product-desc-heading">
          <h3 id="product-desc-heading" className={styles.detailHeading}>
            Опис
          </h3>
          <div className={styles.detailBodyProse}>{description}</div>
        </section>
      ) : null}

      {hasAdvantages ? (
        <section className={styles.detailSection} aria-labelledby="product-adv-heading">
          <h3 id="product-adv-heading" className={styles.detailHeading}>
            Переваги
          </h3>
          {advantagesIntro ? <p className={styles.advantagesIntro}>{advantagesIntro}</p> : null}
          <ul className={styles.advantagesList}>
            {advantages.map((line, i) => (
              <li key={i} className={styles.advantageItem}>
                {String(line).replace(/^-\s*/, '').trim()}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <TrustBlocks />
    </div>
  );
};

export { ProductDetails };
