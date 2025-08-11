import {
  Controller,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DeactivateCustomerService } from '../services/deactivate-customer.service';
import { Customer } from '../entities/customer.entity';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { CustomerAlreadyInactiveException } from '../exceptions/customer-already-inactive.exception';

@Controller('customers')
export class DeactivateCustomerController {
  constructor(
    private readonly deactivateCustomerService: DeactivateCustomerService,
  ) {}

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<Customer> {
    try {
      return await this.deactivateCustomerService.handle(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof CustomerAlreadyInactiveException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
