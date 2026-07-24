import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { CreateOrFindCustomerUseCase } from '../../application/use-cases/create-or-find-customer.use-case';
import { GetCustomerByIdUseCase } from '../../application/use-cases/create-or-find-customer.use-case';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@ApiTags('customers')
@Controller('customers')
export class CustomersController {
  constructor(
    private readonly createOrFindCustomerUseCase: CreateOrFindCustomerUseCase,
    private readonly getCustomerByIdUseCase: GetCustomerByIdUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create or find customer by email' })
  @ApiResponse({ status: 201, type: CustomerResponseDto, description: 'Customer created or retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid customer data provided' })
  async createOrFindCustomer(@Body() createCustomerDto: CreateCustomerDto): Promise<CustomerResponseDto> {
    const result = await this.createOrFindCustomerUseCase.execute(createCustomerDto);
    if (result.isFailure) {
      throw result.getError();
    }
    const customer = result.getValue();
    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: true });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by ID' })
  @ApiResponse({ status: 200, type: CustomerResponseDto, description: 'Customer retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Customer not found' })
  async getCustomerById(@Param('id') id: string): Promise<CustomerResponseDto> {
    const result = await this.getCustomerByIdUseCase.execute(id);
    if (result.isFailure) {
      throw result.getError();
    }
    const customer = result.getValue();
    return plainToInstance(CustomerResponseDto, customer, { excludeExtraneousValues: true });
  }
}
