import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { InvalidSearchQueryException } from '../exceptions/invalid-search-query.exception';

@Injectable()
export class SearchCustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    private auditService: AuditService,
    private analyticsService: AnalyticsService,
  ) {}

  async handle(query: string): Promise<Customer[]> {
    if (!query || query.trim().length < 2) {
      throw new InvalidSearchQueryException(query);
    }

    // Cross-cutting concerns - handled gracefully
    await this.handleCrossCuttingConcerns(query);

    return this.customersRepository
      .createQueryBuilder('customer')
      .where(
        'customer.firstName LIKE :query OR customer.lastName LIKE :query OR customer.email LIKE :query',
        {
          query: `%${query}%`,
        },
      )
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }

  private async handleCrossCuttingConcerns(query: string): Promise<void> {
    await Promise.allSettled([
      this.auditService.logSystemAction('customers.search', { query }),
      this.analyticsService.trackUserSearch(query),
    ]);
  }
}
