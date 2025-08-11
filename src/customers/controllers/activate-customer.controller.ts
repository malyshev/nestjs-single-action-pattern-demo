import {
  Controller,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ActivateCustomerService } from '../services/activate-customer.service';
import { Customer } from '../entities/customer.entity';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { CustomerAlreadyActiveException } from '../exceptions/customer-already-active.exception';

@Controller('customers')
export class ActivateCustomerController {
  constructor(
    private readonly activateCustomerService: ActivateCustomerService,
  ) {}

  @Patch(':id/activate')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<Customer> {
    try {
      return await this.activateCustomerService.handle(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      if (error instanceof CustomerAlreadyActiveException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
