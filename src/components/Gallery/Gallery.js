'use client';
import { useEffect, useLayoutEffect, useMemo, useState, useRef, useCallback } from 'react';

import styles from './styles.module.scss';
import Image from 'next/image';

/** Відступ між кадрами (px): сусідні фото далі за край екрана, поки не потягнеш */
const SLIDE_GAP_PX = 36;

const Gallery = ({ images, alt = 'Кросівки' }) => {
  const list = useMemo(() => (Array.isArray(images) && images.length > 0 ? images : []), [images]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const viewportRef = useRef(null);
  const gestureStart = useRef({ x: 0, y: 0 });
  const dragStartX = useRef(0);
  const dragPointerId = useRef(null);
  /** Реф для pointermove — стейт isDragging оновлюється асинхронно після pointerdown */
  const draggingRef = useRef(false);
  /** Останній зміщення під час drag — для коректного snap у pointerup без відставання стейту */
  const dragOffsetRef = useRef(0);

  const [viewportW, setViewportW] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
    dragOffsetRef.current = 0;
    setDragOffset(0);
  }, [list]);

  /** Блокуємо горизонтальний жест браузера (назад у історії), коли свайпають галерею */
  useEffect(() => {
    const el = viewportRef.current;
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

  /** Ширина видимої зони слайда + gap для кроку каруселі */
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setViewportW(el.clientWidth);
    });
    ro.observe(el);
    setViewportW(el.clientWidth);
    return () => ro.disconnect();
  }, [list]);

  const slideStepPx = viewportW > 0 ? viewportW + SLIDE_GAP_PX : 0;

  const clampDrag = useCallback((index, rawDx, stepPx, n) => {
    if (stepPx <= 0 || n <= 1) return 0;
    const base = -index * stepPx;
    const translate = base + rawDx;
    const minT = -(n - 1) * stepPx;
    const maxT = 0;
    const clamped = Math.max(minT, Math.min(maxT, translate));
    return clamped - base;
  }, []);

  const handlePointerDown = (e) => {
    if (list.length <= 1) return;
    if (e.button !== undefined && e.button !== 0) return;
    dragPointerId.current = e.pointerId;
    dragStartX.current = e.clientX;
    draggingRef.current = true;
    dragOffsetRef.current = 0;
    setIsDragging(true);
    setDragOffset(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const handlePointerMove = (e) => {
    if (!draggingRef.current || dragPointerId.current !== e.pointerId || list.length <= 1) return;
    const w = viewportRef.current?.clientWidth ?? 0;
    const step = w > 0 ? w + SLIDE_GAP_PX : 0;
    const dx = e.clientX - dragStartX.current;
    const clamped = clampDrag(selectedIndex, dx, step, list.length);
    dragOffsetRef.current = clamped;
    setDragOffset(clamped);
  };

  const handlePointerUp = (e) => {
    if (dragPointerId.current !== e.pointerId) return;
    dragPointerId.current = null;
    draggingRef.current = false;

    const w = viewportRef.current?.clientWidth ?? 0;
    const n = list.length;
    const threshold = w > 0 ? Math.max(48, w * 0.2) : 48;
    const off = dragOffsetRef.current;

    if (w > 0 && n > 1) {
      if (off < -threshold && selectedIndex < n - 1) {
        setSelectedIndex((i) => i + 1);
      } else if (off > threshold && selectedIndex > 0) {
        setSelectedIndex((i) => i - 1);
      }
    }

    dragOffsetRef.current = 0;
    setDragOffset(0);
    setIsDragging(false);
    try {
      if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      /* ignore */
    }
  };

  const goToIndex = (index) => {
    if (index === selectedIndex) return;
    setSelectedIndex(index);
    dragOffsetRef.current = 0;
    setDragOffset(0);
  };

  if (list.length === 0) {
    return null;
  }

  const showDots = list.length > 1;
  const n = list.length;

  const trackTransform =
    n > 1 && slideStepPx > 0
      ? `translateX(${-(selectedIndex * slideStepPx) + dragOffset}px)`
      : 'translateX(0)';

  return (
    <div className={styles.gallery}>
      <div className={styles.imageWrap}>
        <div
          ref={viewportRef}
          className={styles.carouselViewport}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onLostPointerCapture={() => {
            dragPointerId.current = null;
            draggingRef.current = false;
            dragOffsetRef.current = 0;
            setIsDragging(false);
            setDragOffset(0);
          }}
        >
          <div
            className={`${styles.track} ${!isDragging ? styles.trackSnap : ''}`}
            style={{
              gap: SLIDE_GAP_PX,
              transform: trackTransform,
            }}
          >
          {list.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={styles.slide}
              style={
                viewportW > 0
                  ? { flex: `0 0 ${viewportW}px`, width: viewportW }
                  : { flex: '0 0 100%', minWidth: 0 }
              }
              aria-hidden={selectedIndex !== index}
            >
              <Image
                src={src}
                alt={index === selectedIndex ? alt : ''}
                fill
                priority={index === 0}
                fetchPriority={index === selectedIndex ? 'high' : 'low'}
                sizes="(max-width: 480px) 100vw, min(480px, 90vw)"
                quality={index === 0 ? 82 : 75}
                loading={index <= 2 ? 'eager' : 'lazy'}
                draggable={false}
                className={styles.slideImage}
              />
            </div>
          ))}
          </div>
        </div>
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
