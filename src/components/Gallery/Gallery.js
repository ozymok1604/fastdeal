'use client';
import { useEffect, useMemo, useState, useRef } from 'react';

import styles from './styles.module.scss';
import Image from 'next/image';

const Gallery = ({ images, alt = 'Кросівки' }) => {
  const list = useMemo(() => (Array.isArray(images) && images.length > 0 ? images : []), [images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState('next');
  const startX = useRef(0);
  const imageWrapRef = useRef(null);
  const gestureStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    setSelectedIndex(0);
  }, [list]);

  /** Блокуємо горизонтальний жест для браузера (назад у історії на телефоні), коли свайпають галерею */
  useEffect(() => {
    const el = imageWrapRef.current;
    if (!el) return;

    const onTouchStart = (e) => {
      gestureStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const onTouchMove = (e) => {
      const t = e.touches[0];
      const dx = t.clientX - gestureStart.current.x;
      const dy = t.clientY - gestureStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 12) {
        e.preventDefault();
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, [list]);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX.current - endX;
    if (Math.abs(diff) < 50 || animating || list.length === 0) return;
    handleChange(diff > 0 ? 'next' : 'prev');
  };

  const handleChange = (dir) => {
    if (list.length === 0) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setSelectedIndex((prev) =>
        dir === 'next' ? (prev + 1) % list.length : (prev - 1 + list.length) % list.length
      );
      setAnimating(false);
    }, 250);
  };

  const goToIndex = (index) => {
    if (animating || index === selectedIndex) return;
    setDirection(index > selectedIndex ? 'next' : 'prev');
    setAnimating(true);
    setTimeout(() => {
      setSelectedIndex(index);
      setAnimating(false);
    }, 250);
  };

  if (list.length === 0) {
    return null;
  }

  const showDots = list.length > 1;

  return (
    <div className={styles.gallery}>
      <div
        ref={imageWrapRef}
        className={`${styles.imageWrap} ${animating ? styles.fadeOut : styles.fadeIn}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          key={`${list[selectedIndex]}-${selectedIndex}`}
          src={list[selectedIndex]}
          alt={alt}
          fill
          priority={selectedIndex === 0}
          fetchPriority={selectedIndex === 0 ? 'high' : 'low'}
          sizes="(max-width: 480px) 100vw, min(480px, 90vw)"
          quality={selectedIndex === 0 ? 82 : 75}
          className={`${styles.image} ${
            direction === 'next' ? styles.slideLeft : styles.slideRight
          }`}
        />
      </div>

      {showDots && (
        <div className={styles.dotsRow} role="tablist" aria-label="Галерея фото">
          {list.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              aria-selected={selectedIndex === index}
              aria-label={`Фото ${index + 1} з ${list.length}`}
              className={selectedIndex === index ? styles.dotActive : styles.dot}
              onClick={() => goToIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { Gallery };
