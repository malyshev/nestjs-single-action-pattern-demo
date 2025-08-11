import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerRequest } from '../interfaces/create-customer-request.interface';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MailingService } from '../../mailing/mailing.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CustomerEmailAlreadyExistsException } from '../exceptions/customer-email-already-exists.exception';

@Injectable()
export class CreateCustomerService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
    private mailingService: MailingService,
    private notificationsService: NotificationsService,
  ) {}

  async handle(
    createCustomerRequest: CreateCustomerRequest,
  ): Promise<Customer> {
    // Check if customer with this email already exists
    const existingCustomer = await this.customersRepository.findOne({
      where: { email: createCustomerRequest.email },
    });

    if (existingCustomer) {
      throw new CustomerEmailAlreadyExistsException(
        createCustomerRequest.email,
      );
    }

    // Create customer
    const customer = this.customersRepository.create(createCustomerRequest);
    const savedCustomer = await this.customersRepository.save(customer);

    // Cross-cutting concerns - handled gracefully
    await this.handleCrossCuttingConcerns(savedCustomer);

    return savedCustomer;
  }

  private async handleCrossCuttingConcerns(customer: Customer): Promise<void> {
    // Extract method for complex cross-cutting concerns
    await Promise.allSettled([
      this.auditService.logSystemAction('customers.create', {
        customerId: customer.id,
        email: customer.email,
      }),
      this.analyticsService.trackUserRegistration(customer.id, {
        email: customer.email,
      }),
      this.mailingService.sendWelcomeEmail(
        customer.id,
        customer.email,
        customer.firstName,
      ),
      this.notificationsService.sendWelcomeNotification(
        customer.id,
        customer.firstName,
      ),
    ]);
  }
}
