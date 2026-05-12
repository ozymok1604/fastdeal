import { Suspense } from 'react';
import ProductContent from '@/components/ProductContent/ProductContent';

export default function ProductPage() {
  return (
    <Suspense fallback={<>Loading...</>}>
      <ProductContent />
    </Suspense>
  );
}
