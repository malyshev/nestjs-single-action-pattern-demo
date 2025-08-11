import {
  Controller,
  Patch,
  Param,
  Body,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { UpdateCustomerService } from '../services/update-customer.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request.interface';
import { Customer } from '../entities/customer.entity';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Controller('customers')
export class UpdateCustomerController {
  constructor(private readonly updateCustomerService: UpdateCustomerService) {}

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async handle(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    try {
      // Convert DTO to interface for service layer
      const updateCustomerRequest: UpdateCustomerRequest = updateCustomerDto;
      return await this.updateCustomerService.handle(id, updateCustomerRequest);
    } catch (error) {
      if (error instanceof CustomerNotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw error;
    }
  }
}
