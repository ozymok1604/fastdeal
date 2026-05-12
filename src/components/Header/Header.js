'use client';

import { TiktokLogoIcon, PhoneCallIcon } from '@phosphor-icons/react';
import styles from './styles.module.scss';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  

  return (
    <div className={`${styles.header}${scrolled ? ` ${styles.headerScrolled}` : ''}`}>
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

     
      <div className={styles.row}>
        <Link
          className={styles.link}
          href="https://www.tiktok.com/@fastdeal.ua"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="TikTok FastDeal"
        >
          <TiktokLogoIcon color="white" size={30} />
        </Link>
        <a href="tel:+380998073556">
          <PhoneCallIcon color="white" size={30} />
        </a>
      </div>
    </div>
  );
};

export { Header };
