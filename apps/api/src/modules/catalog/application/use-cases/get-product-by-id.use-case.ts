import { Inject, Injectable } from '@nestjs/common';
import { Result } from '../../../../shared/kernel/result';
import { ProductNotFoundError } from '../../../../shared/kernel/domain-errors';
import { Product } from '../../domain/entities/product.entity';
import { type ProductRepositoryPort, PRODUCT_REPOSITORY_PORT } from '../../domain/ports/product-repository.port';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY_PORT)
    private readonly productRepository: ProductRepositoryPort,
  ) {}

  async execute(id: string): Promise<Result<Product, ProductNotFoundError>> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      return Result.fail(new ProductNotFoundError(`Product with id ${id} not found`));
    }
    return Result.ok(product);
  }
}
