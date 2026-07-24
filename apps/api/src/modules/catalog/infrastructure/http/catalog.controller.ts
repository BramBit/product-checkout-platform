import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { ListProductsUseCase } from '../../application/use-cases/list-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/get-product-by-id.use-case';
import { ProductResponseDto } from './dto/product-response.dto';

@ApiTags('products')
@Controller('products')
export class CatalogController {
  constructor(
    private readonly listProductsUseCase: ListProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all available products' })
  @ApiResponse({ status: 200, type: [ProductResponseDto], description: 'List of products retrieved successfully' })
  async listProducts(): Promise<ProductResponseDto[]> {
    const result = await this.listProductsUseCase.execute();
    const products = result.getValue();
    return plainToInstance(ProductResponseDto, products, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, type: ProductResponseDto, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string): Promise<ProductResponseDto> {
    const result = await this.getProductByIdUseCase.execute(id);
    if (result.isFailure) {
      throw result.getError();
    }
    const product = result.getValue();
    return plainToInstance(ProductResponseDto, product, { excludeExtraneousValues: true });
  }
}
