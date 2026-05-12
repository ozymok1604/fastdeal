import { listProductColorImageUrls } from '@/lib/productColorMedia';

export async function GET(_request, context) {
  const params = await context.params;
  const productId = params?.productId ?? '';
  const colorId = params?.colorId ?? '';
  const urls = listProductColorImageUrls(productId, colorId);
  return Response.json({ urls });
}
