import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MailingService } from '../../mailing/mailing.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { CustomerAlreadyActiveException } from '../exceptions/customer-already-active.exception';

@Injectable()
export class ActivateCustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
    private mailingService: MailingService,
    private notificationsService: NotificationsService,
  ) {}

  async handle(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });

    if (!customer) {
      throw new CustomerNotFoundException(id);
    }

    if (customer.isActive) {
      throw new CustomerAlreadyActiveException(id);
    }

    customer.isActive = true;
    const savedCustomer = await this.customersRepository.save(customer);

    // Cross-cutting concerns - handled gracefully
    await this.handleCrossCuttingConcerns(savedCustomer);

    return savedCustomer;
  }

  private async handleCrossCuttingConcerns(customer: Customer): Promise<void> {
    await Promise.allSettled([
      this.auditService.logSystemAction('customers.activate', {
        customerId: customer.id,
      }),
      this.analyticsService.trackUserActivation(customer.id),
      this.mailingService.sendUserActivated(customer.id, customer.email),
      this.notificationsService.sendAccountActivatedNotification(customer.id),
    ]);
  }
}
