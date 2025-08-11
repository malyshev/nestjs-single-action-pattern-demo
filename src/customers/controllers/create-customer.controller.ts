import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { CreateCustomerService } from '../services/create-customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CreateCustomerRequest } from '../interfaces/create-customer-request.interface';
import { Customer } from '../entities/customer.entity';
import { CustomerEmailAlreadyExistsException } from '../exceptions/customer-email-already-exists.exception';

@Controller('customers')
export class CreateCustomerController {
  constructor(private readonly createCustomerService: CreateCustomerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async handle(
    @Body() createCustomerDto: CreateCustomerDto,
  ): Promise<Customer> {
    try {
      // Convert DTO to interface for service layer
      const createCustomerRequest: CreateCustomerRequest = createCustomerDto;
      return await this.createCustomerService.handle(createCustomerRequest);
    } catch (error) {
      if (error instanceof CustomerEmailAlreadyExistsException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw new HttpException(
        'Failed to create customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
