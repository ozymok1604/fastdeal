import { Header } from '@/components/Header/Header';
import Footer from '@/components/Footer/Footer';
import styles from './page.module.scss';

export const metadata = {
  title: 'Повернення та обмін | tactic',
  description:
    'Строки та умови повернення взуття належної якості, відшкодування, перевірка при отриманні Новою Поштою.',
};

export default function PovernennyaTaObminPage() {
  return (
    <div className={styles.wrap}>
      <Header />
      <main className={styles.main}>
        <h1 className={styles.title}>Повернення та обмін</h1>
        <p className={styles.subtitle}>Умови згідно із законодавством України</p>

        <p className={styles.notice}>
          Компанія здійснює повернення та обмін товарів належної якості згідно із Законом України «Про
          захист прав споживачів».
        </p>

        <section className={styles.section} aria-labelledby="terms-period">
          <h2 id="terms-period" className={styles.sectionTitle}>
            Строки повернення і обміну
          </h2>
          <p className={styles.text}>
            Повернення та обмін товарів можливий протягом 14 днів після отримання товару покупцем.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="terms-quality">
          <h2 id="terms-quality" className={styles.sectionTitle}>
            Умови повернення для товарів належної якості
          </h2>
          <p className={styles.text}>
            До повернення / обміну приймаються товари належної якості зі збереженою упаковкою й
            цінниками, без слідів використання.
          </p>
          <p className={styles.alert}>
            Товар з розкритою блистерною упаковкою, ношений, з пошкодженими цінниками та / або
            відірваними етикетками до повернення не приймається.
          </p>
          <p className={styles.text}>
            Повернення товару здійснює служба доставки «Нова Пошта». Після отримання нами товару
            протягом 1–3 днів проводиться відправка товару на заміну або повернення грошових коштів
            на картковий рахунок покупця протягом 1–3 банківських днів.
          </p>
          <p className={styles.text}>
            Для уточнення адреси для відправлення повернення зв’яжіться з менеджером.
          </p>
          <p className={styles.text}>
            Товар неналежної якості може бути повернений у разі підтвердженого незалежною
            експертизою заводського браку.
          </p>
          <p className={styles.text}>
            Товари, які мають механічні пошкодження внаслідок недбайливого використання, не
            приймаються до повернення.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="receive-check">
          <h2 id="receive-check" className={styles.sectionTitle}>
            При отриманні посилки
          </h2>
          <ul className={styles.list}>
            <li className={styles.listItem}>Обов’язково перевіряйте товар при отриманні посилки.</li>
            <li className={styles.listItem}>
              Не покидайте відділення, доки не переконаєтеся, що товар відповідає вашому замовленню.
            </li>
          </ul>
          <div className={styles.hint}>
            <strong>Рекламації</strong> приймаються лише за наявності акта огляду в присутності
            співробітників компанії-перевізника.
          </div>
        </section>

        <section className={styles.section} aria-labelledby="law-refusal">
          <h2 id="law-refusal" className={styles.sectionTitle}>
            Відмова в обміні та поверненні
          </h2>
          <p className={styles.legalNote}>
            Згідно із Законом України «Про захист прав споживачів», компанія може відмовити
            споживачеві в обміні та поверненні товарів належної якості, якщо вони належать до
            категорій, зазначених у чинному Переліку непродовольчих товарів належної якості, що не
            підлягають поверненню та обміну.
          </p>
        </section>

        <section className={styles.section} aria-labelledby="refund">
          <h2 id="refund" className={styles.sectionTitle}>
            Відшкодування
          </h2>
          <p className={styles.text}>
            Після того як ви відправили нам товар, який вам не підійшов, відшкодування коштів
            здійснюється протягом 2–3 робочих днів на банківську карту.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
