import styles from './styles.module.scss';

/** Фон обраної кнопки + колір підпису для читабельності */
const COLOR_SWATCH = {
  olive: { fill: '#65663b', label: '#ffffff' },
  coyote: { fill: '#b59e4c', label: '#1a1a1a' },
  black: { fill: '#0a0a0a', label: '#ffffff' },
};

const Colors = ({ colors, color, setColor }) => {
  return (
    <div>
      <div className={styles.label}>Колір:</div>
      <div className={styles.row}>
        {colors.map((c) => {
          const active = color === c.id;
          const swatch = COLOR_SWATCH[c.id];
          const swatchStyle =
            active && swatch
              ? {
                  backgroundColor: swatch.fill,
                  borderColor: swatch.fill,
                  color: swatch.label,
                }
              : undefined;

          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setColor(c.id)}
              className={active ? styles.selected : styles.chip}
              style={swatchStyle}
            >
              {c.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export { Colors };
