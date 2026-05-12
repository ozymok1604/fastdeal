import styles from './styles.module.scss';
import { formatSizeChipEu } from '@/data/euSizeCm';

const Sizes = ({ sizes, size, setSize }) => {
  return (
    <div>
      <div className={styles.label}>Розмір (EU):</div>
      <div className={styles.sizesRow}>
        {sizes.map((it) => (
          <button
            key={it}
            type="button"
            onClick={() => setSize(it)}
            className={Number(size) === Number(it) ? styles.selectedSize : styles.size}
          >
            {formatSizeChipEu(it)}
          </button>
        ))}
      </div>
    </div>
  );
};

export { Sizes };
