import { products } from '@/data/products';
import styles from './style.module.scss';
import { ProductsListItem } from './ProductsListItem';
const ProductsList = () => {
  return (
    <div className={styles.list}>
      {products.map((data, index) => (
        <ProductsListItem key={data.id} data={data} listIndex={index} />
      ))}
    </div>
  );
};

export { ProductsList };
