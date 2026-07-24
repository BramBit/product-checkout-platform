import { Module } from '@nestjs/common';
import { PRODUCT_REPOSITORY_PORT } from './domain/ports/product-repository.port';
import { PostgresProductRepository } from './infrastructure/persistence/postgres-product.repository';
import { ListProductsUseCase } from './application/use-cases/list-products.use-case';
import { GetProductByIdUseCase } from './application/use-cases/get-product-by-id.use-case';
import { CatalogController } from './infrastructure/http/catalog.controller';

@Module({
  controllers: [CatalogController],
  providers: [
    {
      provide: PRODUCT_REPOSITORY_PORT,
      useClass: PostgresProductRepository,
    },
    ListProductsUseCase,
    GetProductByIdUseCase,
  ],
  exports: [
    PRODUCT_REPOSITORY_PORT,
    ListProductsUseCase,
    GetProductByIdUseCase,
  ],
})
export class CatalogModule {}
