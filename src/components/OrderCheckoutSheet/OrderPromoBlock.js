'use client';

import { useEffect, useMemo, useState } from 'react';
import styles from './styles.module.scss';
import {
  VOLUME_DISCOUNT_FROM_3,
  VOLUME_DISCOUNT_FROM_5,
} from '@/lib/volumeDiscount';

const STORAGE_KEY = 'tactic-promo-timer-end';
const DURATION_MS = (7 * 60 + 23) * 60 * 1000;

function getOrCreateEndTime() {
  if (typeof window === 'undefined') return Date.now() + DURATION_MS;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? Number(raw) : NaN;
    if (Number.isFinite(parsed) && parsed > Date.now()) return parsed;
  } catch {
    /* ignore */
  }
  const end = Date.now() + DURATION_MS;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(end));
  } catch {
    /* ignore */
  }
  return end;
}

function formatRemaining(ms) {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const parts = [];
  if (h > 0) parts.push(`${h} год`);
  if (h > 0 || m > 0) parts.push(`${m} хв`);
  parts.push(`${s} с`);
  return parts.join(' ');
}

function formatTierPrice(items, discount) {
  const prices = [...new Set(items.map((x) => Math.max(0, x.price - discount)))].sort(
    (a, b) => a - b
  );
  if (prices.length === 0) return '—';
  if (prices.length === 1) {
    return `${prices[0].toLocaleString('uk-UA')} грн/пара`;
  }
  return `${prices[0].toLocaleString('uk-UA')}–${prices[prices.length - 1].toLocaleString('uk-UA')} грн/пара`;
}

/**
 * @param {{ items: { price: number }[], active?: boolean }} props
 */
export default function OrderPromoBlock({ items, active = true }) {
  const [endTime] = useState(() => getOrCreateEndTime());
  const [remaining, setRemaining] = useState(() => Math.max(0, endTime - Date.now()));

  const price3 = useMemo(
    () => formatTierPrice(items, VOLUME_DISCOUNT_FROM_3),
    [items]
  );
  const price5 = useMemo(
    () => formatTierPrice(items, VOLUME_DISCOUNT_FROM_5),
    [items]
  );

  useEffect(() => {
    if (!active) return;
    const tick = () => setRemaining(Math.max(0, endTime - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [active, endTime]);

  if (!active || items.length === 0) return null;

  return (
    <div className={styles.promoBlock} role="region" aria-label="Акція">
      <p className={styles.promoTimerLine} role="timer" aria-live="polite">
        Акція дійсна ще <strong>{formatRemaining(remaining)}</strong>
      </p>
      <p className={styles.promoLead}>Заберіть кращу ціну, поки діє акція:</p>
      <p className={styles.promoLine}>
        від 3 пар — {price3}
      </p>
      <p className={styles.promoLine}>
        від 5 пар — {price5}
      </p>
    </div>
  );
}
