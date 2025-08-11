import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

@Injectable()
export class ConfirmCustomerEmailService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
    private notificationsService: NotificationsService,
  ) {}

  async handle(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    customer.emailConfirmed = true;
    const savedCustomer = await this.customersRepository.save(customer);

    // Cross-cutting concerns - handled gracefully
    await this.handleCrossCuttingConcerns(savedCustomer);

    return savedCustomer;
  }

  private async handleCrossCuttingConcerns(customer: Customer): Promise<void> {
    await Promise.allSettled([
      this.auditService.logUserAction('customers.confirm_email', customer.id),
      this.analyticsService.trackEmailConfirmation(customer.id),
      this.notificationsService.sendEmailConfirmedNotification(customer.id),
    ]);
  }
}
