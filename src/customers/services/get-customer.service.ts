import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Injectable()
export class GetCustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
  ) {}

  async handle(id: string): Promise<Customer> {
    await this.auditService.logSystemAction('customers.get_by_id', {
      customerId: id,
    });

    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    return customer;
  }
}
