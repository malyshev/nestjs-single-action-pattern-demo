import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { SearchCustomersService } from '../services/search-customers.service';
import { Customer } from '../entities/customer.entity';
import { InvalidSearchQueryException } from '../exceptions/invalid-search-query.exception';

@Controller('customers')
export class SearchCustomersController {
  constructor(
    private readonly searchCustomersService: SearchCustomersService,
  ) {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async handle(@Query('q') query: string): Promise<Customer[]> {
    try {
      return await this.searchCustomersService.handle(query);
    } catch (error) {
      if (error instanceof InvalidSearchQueryException) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }
}
