import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Injectable()
export class DeleteCustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
  ) {}

  async handle(id: string): Promise<void> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    await this.auditService.logSystemAction('customers.delete', {
      customerId: id,
    });

    await this.customersRepository.delete(id);
  }
}
