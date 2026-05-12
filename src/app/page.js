'use client';
import { Header } from '@/components/Header/Header';
import { SnowAnimation } from '@/components/SnowAnimation/SnowAnimation';
import styles from './page.module.scss';
import { ProductsList } from '@/components/ProductsList/ProductsList';
import Footer from '@/components/Footer/Footer';

export default function Home() {
  return (
    <div className={styles.page}>
       
      <Header />
      <ProductsList />
      <Footer />
    </div>
  );
}
