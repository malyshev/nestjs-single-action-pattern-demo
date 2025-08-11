import {
  Controller,
  Patch,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ConfirmCustomerEmailService } from '../services/confirm-customer-email.service';
import { Customer } from '../entities/customer.entity';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Controller('customers')
export class ConfirmCustomerEmailController {
  constructor(
    private readonly confirmCustomerEmailService: ConfirmCustomerEmailService,
  ) {}

  @Patch(':id/confirm-email')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('id') id: string): Promise<Customer> {
    try {
      return await this.confirmCustomerEmailService.handle(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
