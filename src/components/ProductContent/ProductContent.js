'use client';
import { Gallery } from '@/components/Gallery/Gallery';
import { Sizes } from '@/components/Sizes/Sizes';
import { Colors } from '@/components/Colors/Colors';
import { products, mediaUrls } from '@/data/products';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import { Header } from '@/components/Header/Header';
import { ProductDetails } from '@/components/ProductDetails/ProductDetails';
import Footer from '@/components/Footer/Footer';

/** За замовчуванням — койот, якщо є в асортименті товару; інакше перший колір (наприклад лише олива). */
function defaultSelectedColorId(colors) {
  if (!colors?.length) return 'coyote';
  return colors.some((c) => c.id === 'coyote') ? 'coyote' : colors[0].id;
}

function ProductView({ productData }) {
  const [size, setSize] = useState(productData.sizes[0]);
  const [color, setColor] = useState(() => defaultSelectedColorId(productData.colors));
  /** Повний список з API; null = ще не прийшов — показуємо синхронний fallback з даних товару */
  const [scannedGalleryUrls, setScannedGalleryUrls] = useState(null);

  const colorLabel = productData.colors.find((c) => c.id === color)?.label ?? color;

  const fallbackGalleryUrls = useMemo(() => {
    const slots = productData.mediaByColor?.[color];
    return slots?.length ? mediaUrls(productData.id, color, slots) : [];
  }, [productData.id, color, productData.mediaByColor]);

  const galleryImages =
    scannedGalleryUrls && scannedGalleryUrls.length > 0 ? scannedGalleryUrls : fallbackGalleryUrls;

  useEffect(() => {
    setScannedGalleryUrls(null);

    let cancelled = false;
    const url = `/api/product-media/${encodeURIComponent(productData.id)}/${encodeURIComponent(color)}`;

    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (cancelled) return;
        if (Array.isArray(data.urls) && data.urls.length > 0) {
          setScannedGalleryUrls(data.urls);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [productData.id, color, productData]);

  return (
    <>
      <Header />
      <div className={styles.page}>
        <Gallery images={galleryImages} alt={productData.name} />
        <Colors colors={productData.colors} color={color} setColor={setColor} />
        <Sizes sizes={productData.sizes} setSize={setSize} size={size} />
        <ProductDetails
          productId={productData.id}
          name={productData.name}
          price={productData.price}
          compareAtMore={productData.compareAtMore}
          colorLabel={colorLabel}
          colorId={color}
          size={size}
          specDetails={productData.specDetails}
          description={productData.description}
          advantages={productData.advantages}
          advantagesIntro={productData.advantagesIntro}
        />
      </div>
      <Footer />
    </>
  );
}

export default function ProductContent() {
  const sp = useSearchParams();
  const id = sp.get('id');
  const productData = products.find((it) => it.id === id);

  if (!productData) {
    return (
      <>
        <Header />
        <div className={styles.page}>
          <p>Товар не знайдено</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <Suspense>
      <ProductView key={productData.id} productData={productData} />
    </Suspense>
  );
}
