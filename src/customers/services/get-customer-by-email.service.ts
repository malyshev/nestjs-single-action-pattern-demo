import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { CustomerEmailNotFoundException } from '../exceptions/customer-email-not-found.exception';

@Injectable()
export class GetCustomerByEmailService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
  ) {}

  async handle(email: string): Promise<Customer> {
    await this.auditService.logSystemAction('customers.get_by_email', {
      email,
    });

    const customer = await this.customersRepository.findOne({
      where: { email },
    });

    if (!customer) {
      throw new CustomerEmailNotFoundException(email);
    }

    return customer;
  }
}
