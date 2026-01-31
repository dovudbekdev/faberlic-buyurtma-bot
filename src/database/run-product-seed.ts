import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../app.module';
import { Product } from '../modules/product/entities/product.entity';
import { ProductService } from '../modules/product/product.service';
import { PRODUCT_SEED_DATA } from './seeds/data/product.seed.data';

async function runProductSeed(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  const productRepo = app.get<Repository<Product>>(getRepositoryToken(Product));
  const productService = app.get(ProductService);

  try {
    const existingCount = await productRepo.count();
    if (existingCount > 0) {
      await productRepo.clear();
      console.log(`Mavjud ${existingCount} ta mahsulot tozalandi.`);
    }

    for (const item of PRODUCT_SEED_DATA) {
      await productService.create({
        name: item.name,
        price: item.price,
        description: item.description,
        images: item.images ?? [],
        quantity: item.quantity,
      });
    }

    console.log(
      `Seed muvaffaqiyatli: ${PRODUCT_SEED_DATA.length} ta mahsulot qo'shildi.`,
    );
  } finally {
    let closeError: unknown;
    try {
      await app.close();
    } catch (err: unknown) {
      // ApplicationContext da grammY bot launch qilinmagan bo'ladi;
      const message = err instanceof Error ? err.message : String(err);
      if (!message?.includes('Bot is not running')) closeError = err;
    }
    if (closeError) throw closeError;
  }
}

runProductSeed().catch((err) => {
  console.error('Seed xatolik:', err);
  process.exit(1);
});
