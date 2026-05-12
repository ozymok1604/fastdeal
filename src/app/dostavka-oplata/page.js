import { Header } from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.scss';

export const metadata = {
  title: 'Доставка та оплата | tactic',
  description:
    'Умови доставки Новою Поштою, оплата післяплатою або на карту, графік відправлень по Україні.',
};

export default function DostavkaOplataPage() {
  return (
    <div className={styles.wrap}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Доставка / оплата</h1>
        <p className={styles.subtitle}>Умови відправлення та розрахунку</p>

        <p className={styles.notice}>
          Графік відправлень та доставки посилок діє по всій території України, окрім тимчасово
          окупованих територій Автономної Республіки Крим та тимчасово окупованих територій Донецької
          і Луганської областей.
        </p>

        <section className={styles.section} aria-labelledby="delivery-methods">
          <h2 id="delivery-methods" className={styles.sectionTitle}>
            Способи доставки
          </h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>Доставка «Нова Пошта»</li>
          </ul>
          <figure className={styles.figure}>
            <div className={styles.chartWrap}>
              <img
                src="/delivery.png"
                alt="Швидкість доставки між обласними центрами «відділення—відділення» для відправлень до 30 кг, понеділок—субота"
                className={styles.chart}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption className={styles.chartCaption}>
              Орієнтовні терміни доставки «Нової Пошти» між обласними центрами (таблиця з сайту
              перевізника).
            </figcaption>
          </figure>
        </section>

        <section className={styles.section} aria-labelledby="payment-methods">
          <h2 id="payment-methods" className={styles.sectionTitle}>
            Способи оплати
          </h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>Післяплата «Нова Пошта»</li>
            <li className={styles.listItem}>
              Вартість доставки оцінюється тарифами «Нової Пошти» (від 80 грн)
            </li>
            <li className={styles.listItem}>Безготівковий розрахунок (на карту банку)</li>
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="how-order">
          <h2 id="how-order" className={styles.sectionTitle}>
            Як замовити?
          </h2>
          <ol className={styles.steps}>
            <li className={styles.step}>Зробіть замовлення через сайт або в телефонному режимі.</li>
            <li className={styles.step}>Все, очікуйте доставку.</li>
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="when-ship">
          <h2 id="when-ship" className={styles.sectionTitle}>
            Коли відбувається відправка замовлення?
          </h2>
          <p className={styles.text}>
            Відправка товару здійснюється компаніями «Нова Пошта» протягом 1–2 днів після
            оформлення замовлення, але ми завжди намагаємося зробити відправку швидше: 90% товару
            відправляється в той самий день, коли замовлення було оформлено на сайті.
          </p>
          <p className={styles.text}>
            Після відправлення замовлення вам надійде SMS з номером ТТН для відстеження посилки.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="delivery-cost">
          <h2 id="delivery-cost" className={styles.sectionTitle}>
            Яка вартість доставки?
          </h2>
          <p className={styles.text}>
            При оплаті накладним платежем при отриманні з покупця стягується додатково комісія —
            20 грн та 2% від суми замовлення. Вартість доставки визначається «Новою Поштою» за їхніми
            тарифами. Оплата на карту банку зазвичай вигідніша, бо не потрібно сплачувати цю
            комісію «Нової Пошти».
          </p>
          <div className={styles.hint}>
            <strong>Тарифи «Нової Пошти».</strong> Вартість доставки однієї пари взуття — від 80 грн.
            Оплата доставки за рахунок одержувача.
          </div>
          <p className={`${styles.text} ${styles.textSpaced}`}>
            Замовлення з двох і більше одиниць можуть бути відправлені різними посилками.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
