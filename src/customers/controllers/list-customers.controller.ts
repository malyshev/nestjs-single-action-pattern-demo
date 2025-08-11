import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ListCustomersService } from '../services/list-customers.service';
import { Customer } from '../entities/customer.entity';

@Controller('customers')
export class ListCustomersController {
  constructor(private readonly listCustomersService: ListCustomersService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async handle(): Promise<Customer[]> {
    return this.listCustomersService.handle();
  }
}
