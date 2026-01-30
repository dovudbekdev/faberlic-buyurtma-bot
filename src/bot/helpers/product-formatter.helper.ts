import { Product } from 'src/modules/product/entities/product.entity';

export function formatProductList(products: Product[]): string {
  return products
    .map((product, index) => `${index + 1}. ${product.name}`)
    .join('\n');
}

export function formatProductDetail(product: Product): string {
  const lines: string[] = [
    `📦 ${product.name}`,
    `💰 Narxi: ${Number(product.price).toLocaleString()} so'm`,
  ];
  if (product.description?.trim()) {
    lines.push(`\n${product.description}`);
  }
  return lines.join('\n');
}
