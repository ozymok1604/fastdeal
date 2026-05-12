'use client';
import Link from 'next/link';
import { Phone, TiktokLogo, Clock } from '@phosphor-icons/react';
import styles from './styles.module.scss';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>
        {/* Бренд/опис */}
        <div className={styles.col}>
          <div className={styles.brand}>FastDeal</div>
          <p className={styles.tagline}>Тактичне взуття. Доставка по Україні.</p>
          <div className={styles.footerLinks}>
            <Link className={styles.footerNav} href="/dostavka-oplata">
              Доставка та оплата
            </Link>
            <Link className={styles.footerNav} href="/povernennya-ta-obmin">
              Повернення та обмін
            </Link>
          </div>
        </div>

        {/* Контакти */}
        <div className={styles.col}>
          <div className={styles.blockTitle}>Контакти</div>
          <a className={styles.link} href="tel:+380998073556">
            <Phone size={18} weight="bold" />
            <span>+38 (099) 807-35-56</span>
          </a>

          <Link
            className={styles.link}
            href="https://www.tiktok.com/@fastdeal.ua"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok FastDeal @fastdeal.ua"
          >
            <TiktokLogo size={18} weight="bold" />
            <span>@fastdeal.ua</span>
          </Link>
        </div>

        {/* Години роботи */}
        <div className={styles.col}>
          <div className={styles.blockTitle}>Години роботи</div>
          <div className={styles.row}>
            <Clock size={18} weight="bold" />
            <div>
              <div>Пн–Пт: 09:00 – 19:00</div>
              <div>Сб–Нд: 10:00 – 17:00</div>
            </div>
          </div>
        </div>
      </div>

      {/* лінія + копірайт */}
      <div className={styles.bottom}>
        <span>© {year} FastDeal. Усі права захищено.</span>
      </div>
    </footer>
  );
}
