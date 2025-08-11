import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { GetCustomerService } from '../services/get-customer.service';
import { Customer } from '../entities/customer.entity';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Controller('customers')
export class GetCustomerController {
  constructor(private readonly getCustomerService: GetCustomerService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<Customer> {
    try {
      return await this.getCustomerService.handle(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
