import Link from 'next/link';
import styles from './style.module.scss';
import Image from 'next/image';
import { mediaUrls, defaultProductColorId } from '@/data/products';

const ProductsListItem = ({ data, listIndex = 0 }) => {
  const previewColor = defaultProductColorId(data.colors ?? []);
  const slots = data.mediaByColor?.[previewColor];
  const urls = slots?.length ? mediaUrls(data.id, previewColor, slots) : [];
  const fallbackExt = slots?.[0]?.ext ?? 'png';
  const mainImgUrl = urls[0] ?? `/images/${data.id}/${previewColor}/1.${fallbackExt}`;
  const thumbColors = (data.colors ?? [])
    .filter((c) => c.id !== previewColor)
    .slice(0, 2);

  /** Дві колонки — перші 4 картки у видимій зоні при завантаженні; решта lazy */
  const eagerMainImage = listIndex < 4;

  return (
    <Link href={`/product?id=${data.id}`}>
      <div className={styles.product}>
        <div className={styles.fastLacing} aria-hidden>
          <Image
            src="/fast_lacing.png"
            alt=""
            width={200}
            height={80}
            className={styles.fastLacingImg}
            sizes="(max-width: 640px) 96px, 108px"
            loading="lazy"
          />
        </div>
        <div className={styles.imageWrap}>
          <Image
            src={mainImgUrl}
            alt={data.name}
            fill
            priority={eagerMainImage}
            fetchPriority={eagerMainImage ? 'high' : 'low'}
            sizes="(max-width: 640px) calc(50vw - 20px), (max-width: 960px) 30vw, 300px"
            quality={eagerMainImage ? 80 : 72}
            className={styles.image}
          />
          {thumbColors.length > 0 && data.mediaByColor && (
            <div className={styles.colorThumbsRow}>
              {thumbColors.map((c) => {
                const colorSlots = data.mediaByColor?.[c.id];
                const thumb =
                  colorSlots?.length > 0 ? mediaUrls(data.id, c.id, colorSlots)[0] : null;
                if (!thumb) return null;
                return (
                  <div key={`thumb-${c.id}`} className={styles.colorThumbWrap} title={c.label}>
                    <Image
                      src={thumb}
                      alt={c.label}
                      width={44}
                      height={44}
                      className={styles.colorThumb}
                      sizes="44px"
                      loading="lazy"
                      fetchPriority="low"
                      quality={60}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div>
          <h4 className={styles.productName}>{data.name}</h4>
        </div>
        {(data.highlights?.length ?? 0) > 0 && (
          <div className={styles.highlights}>
            {data.highlights.map((line, i) => (
              <p key={i} className={styles.highlightLine}>
                {line}
              </p>
            ))}
          </div>
        )}
        <div className={styles.bottomBox}>
          <div className={styles.priceRow}>
            {typeof data.compareAtMore === 'number' && data.compareAtMore > 0 && (
              <p className={styles.oldPrice}>
                {(data.price + data.compareAtMore).toLocaleString('uk-UA')} грн
              </p>
            )}
            <p className={styles.price}>{data.price.toLocaleString('uk-UA')} грн</p>
          </div>

          <button className={styles.buyButton}>Купити</button>
        </div>
      </div>
    </Link>
  );
};

export { ProductsListItem };
