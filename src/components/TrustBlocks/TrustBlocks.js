'use client';
import {
  TruckIcon,
  ArrowCounterClockwiseIcon,
  WalletIcon,
  IdentificationCardIcon,
} from '@phosphor-icons/react';
import styles from './styles.module.scss';

const items = [
  {
    icon: <TruckIcon size={28} weight="duotone" />,
    title: 'Варіанти доставки',
    lines: ['Нова Пошта на відділення', 'Адресна доставка курʼєром'],
  },
  {
    icon: <ArrowCounterClockwiseIcon size={28} weight="duotone" />,
    title: 'Повернення товару',
    lines: ['протягом 14 днів'],
  },
  {
    icon: <WalletIcon size={28} weight="duotone" />,
    title: 'Варіанти оплати',
    lines: ['При отриманні', 'Передоплата онлайн'],
  },
  {
    icon: <IdentificationCardIcon size={28} weight="duotone" />,
    title: 'Гарантія на товар',
    lines: ['Гарантія 1 рік'],
  },
];

export default function TrustBlocks() {
  return (
    <section className={styles.wrap} aria-labelledby="trust-title">
      <ul className={styles.list}>
        {items.map((it, i) => (
          <li key={i} className={styles.item}>
            <div className={styles.icon}>{it.icon}</div>
            <div className={styles.text}>
              <div className={styles.title}>{it.title}</div>
              {it.lines.map((l, j) => (
                <div key={j} className={styles.line}>
                  {l}
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
