'use client';
import Lottie from 'lottie-react';
import snowAnimation from '../../../public/snow_fall.json';
import styles from './styles.module.scss';
const SnowAnimation = () => {
  return (
    <div className={styles.snowWrapper}>
      <Lottie animationData={snowAnimation} loop autoplay />
    </div>
  );
};

export { SnowAnimation };
