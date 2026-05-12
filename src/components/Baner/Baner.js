import Image from 'next/image';
import styles from './styles.module.scss';

import { useIsWeb } from '@/hooks/useIsWeb';
const Baner = () => {
  const isWeb = useIsWeb();
  return (
    <div>
      <img className={styles.baner} src={isWeb ? '/baner.jpg' : '/baner_mobile.jpg'} />
    </div>
  );
};

export { Baner };
