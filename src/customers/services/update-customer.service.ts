import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request.interface';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Injectable()
export class UpdateCustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
  ) {}

  async handle(
    id: string,
    updateCustomerRequest: UpdateCustomerRequest,
  ): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    const updatedFields = Object.keys(updateCustomerRequest);
    const mergedCustomer = this.customersRepository.merge(
      customer,
      updateCustomerRequest,
    );
    const savedCustomer = await this.customersRepository.save(mergedCustomer);

    // Cross-cutting concerns - handled gracefully
    await this.handleCrossCuttingConcerns(savedCustomer, updatedFields);

    return savedCustomer;
  }

  private async handleCrossCuttingConcerns(
    customer: Customer,
    updatedFields: string[],
  ): Promise<void> {
    await Promise.allSettled([
      this.auditService.logUserAction('customers.update', customer.id, {
        updatedFields,
      }),
      this.analyticsService.trackUserProfileUpdate(customer.id, updatedFields),
    ]);
  }
}
