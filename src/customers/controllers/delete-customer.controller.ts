import {
  Controller,
  Delete,
  Param,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { DeleteCustomerService } from '../services/delete-customer.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Controller('customers')
export class DeleteCustomerController {
  constructor(private readonly deleteCustomerService: DeleteCustomerService) {}

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handle(@Param('id') id: string): Promise<void> {
    try {
      await this.deleteCustomerService.handle(id);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
