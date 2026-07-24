import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateDeliveryUseCase, GetDeliveryByIdUseCase } from '../../application/use-cases/create-delivery.use-case';
import { CreateDeliveryDto } from './dto/create-delivery.dto';
import { DeliveryResponseDto } from './dto/delivery-response.dto';

@ApiTags('deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(
    private readonly createDeliveryUseCase: CreateDeliveryUseCase,
    private readonly getDeliveryByIdUseCase: GetDeliveryByIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new delivery record' })
  @ApiResponse({ status: 201, type: DeliveryResponseDto, description: 'Delivery created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid delivery data provided' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async createDelivery(@Body() createDeliveryDto: CreateDeliveryDto): Promise<DeliveryResponseDto> {
    const result = await this.createDeliveryUseCase.execute(createDeliveryDto);
    if (result.isFailure) {
      throw result.getError();
    }
    const delivery = result.getValue();
    return plainToInstance(DeliveryResponseDto, delivery, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get delivery by ID' })
  @ApiResponse({ status: 200, type: DeliveryResponseDto, description: 'Delivery retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getDeliveryById(@Param('id') id: string): Promise<DeliveryResponseDto> {
    const result = await this.getDeliveryByIdUseCase.execute(id);
    if (result.isFailure) {
      throw result.getError();
    }
    const delivery = result.getValue();
    return plainToInstance(DeliveryResponseDto, delivery, { excludeExtraneousValues: true });
  }
}
