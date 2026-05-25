import styles from './styles.module.scss';
import { discountPerPair, pairsUntilNextDiscount } from '@/lib/volumeDiscount';

/**
 * @param {{ variant?: 'banner' | 'card' | 'inline', totalPairs?: number }} props
 */
export default function VolumeDiscountNote({ variant = 'card', totalPairs = 0 }) {
  const perPair = discountPerPair(totalPairs);
  const untilNext = pairsUntilNextDiscount(totalPairs);

  return (
    <div
      className={
        variant === 'banner'
          ? styles.banner
          : variant === 'inline'
            ? styles.inline
            : styles.card
      }
      role="note"
    >
      <p className={styles.title}>Знижка від кількості пар</p>
      <ul className={styles.rules}>
        <li>
          <strong>від 3 пар</strong> — <strong>−150 грн</strong> на кожну пару
        </li>
        <li>
          <strong>від 5 пар</strong> — <strong>−250 грн</strong> на кожну пару
        </li>
      </ul>
      {totalPairs > 0 && perPair > 0 ? (
        <p className={styles.active}>
          Застосовано: −{perPair.toLocaleString('uk-UA')} грн/пара (
          {totalPairs} {totalPairs === 1 ? 'пара' : totalPairs < 5 ? 'пари' : 'пар'})
        </p>
      ) : null}
      {totalPairs > 0 && untilNext > 0 ? (
        <p className={styles.hint}>
          Ще {untilNext}{' '}
          {untilNext === 1 ? 'пара' : untilNext < 5 ? 'пари' : 'пар'} — і знижка{' '}
          {totalPairs >= 3 ? '−250' : '−150'} грн на кожну
        </p>
      ) : null}
    </div>
  );
}
