import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { GetCustomerByEmailService } from '../services/get-customer-by-email.service';
import { Customer } from '../entities/customer.entity';
import { CustomerEmailNotFoundException } from '../exceptions/customer-email-not-found.exception';

@Controller('customers')
export class GetCustomerByEmailController {
  constructor(
    private readonly getCustomerByEmailService: GetCustomerByEmailService,
  ) {}

  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async handle(@Param('email') email: string): Promise<Customer> {
    try {
      return await this.getCustomerByEmailService.handle(email);
    } catch (error) {
      if (error instanceof CustomerEmailNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
