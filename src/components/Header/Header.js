'use client';

import {
  TiktokLogoIcon,
  PhoneCallIcon,
  ShoppingCartSimpleIcon,
  TelegramLogoIcon,
} from '@phosphor-icons/react';
import styles from './styles.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';

const Header = () => {
  const { totalCount, openDrawer } = useCart();

  return (
    <div className={styles.header}>
      <Link href="/" className={styles.logoLink} aria-label="На головну">
        <Image
          src="/logo.png"
          alt=""
          width={240}
          height={80}
          className={styles.logo}
          priority
          sizes="(max-width: 480px) 120px, 140px"
        />
      </Link>

     
      <div className={styles.actions}>
        <div className={styles.socialGroup}>
          <Link
            className={styles.iconAction}
            href="https://t.me/fast_deal_military"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram Fast Deal"
          >
            <TelegramLogoIcon color="white" size={24} weight="fill" aria-hidden />
          </Link>
          <Link
            className={styles.iconAction}
            href="https://www.tiktok.com/@fastdeal.ua"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok FastDeal"
          >
            <TiktokLogoIcon color="white" size={24} aria-hidden />
          </Link>
          <a className={styles.iconAction} href="tel:+380998073556" aria-label="Зателефонувати">
            <PhoneCallIcon color="white" size={24} aria-hidden />
          </a>
        </div>
        <span className={styles.actionsDivider} aria-hidden />
        <button
          type="button"
          className={`${styles.iconAction} ${styles.cartAction}`}
          onClick={openDrawer}
          aria-label={totalCount > 0 ? `Кошик, ${totalCount} поз.` : 'Кошик'}
        >
          <ShoppingCartSimpleIcon color="white" size={24} weight="bold" aria-hidden />
          {totalCount > 0 ? (
            <span className={styles.cartBadge}>{totalCount > 99 ? '99+' : totalCount}</span>
          ) : null}
        </button>
      </div>
    </div>
  );
};

export { Header };
