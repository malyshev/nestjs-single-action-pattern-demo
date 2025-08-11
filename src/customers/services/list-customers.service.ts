import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';

@Injectable()
export class ListCustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
  ) {}

  async handle(): Promise<Customer[]> {
    await this.auditService.logSystemAction('customers.list_all');
    await this.analyticsService.trackUserSearch('all_customers');

    return this.customersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
