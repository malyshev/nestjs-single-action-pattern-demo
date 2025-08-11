/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ListCustomersService } from './list-customers.service';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';

describe('ListCustomersService', () => {
  let service: ListCustomersService;
  let customerRepository: Repository<Customer>;
  let auditService: AuditService;
  let analyticsService: AnalyticsService;

  const mockCustomer: Customer = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    emailConfirmed: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerRepository = {
    find: jest.fn(),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
  };

  const mockAnalyticsService = {
    trackUserSearch: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListCustomersService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<ListCustomersService>(ListCustomersService);
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    auditService = module.get<AuditService>(AuditService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('should return list of customers ordered by creation date', async () => {
      const customers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserSearch.mockResolvedValue(undefined);

      const result = await service.handle();

      expect(result).toEqual(customers);
      expect(customerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.list_all',
      );
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        'all_customers',
      );
    });

    it('should return empty array when no customers exist', async () => {
      mockCustomerRepository.find.mockResolvedValue([]);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserSearch.mockResolvedValue(undefined);

      const result = await service.handle();

      expect(result).toEqual([]);
      expect(customerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.list_all',
      );
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        'all_customers',
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCustomerRepository.find.mockRejectedValue(dbError);

      await expect(service.handle()).rejects.toThrow(
        'Database connection failed',
      );
      expect(customerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should handle audit service failure', async () => {
      const customers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );

      await expect(service.handle()).rejects.toThrow('Audit service down');
      expect(customerRepository.find).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.list_all',
      );
      expect(analyticsService.trackUserSearch).not.toHaveBeenCalled();
    });

    it('should handle analytics service failure', async () => {
      const customers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserSearch.mockRejectedValue(
        new Error('Analytics service down'),
      );

      await expect(service.handle()).rejects.toThrow('Analytics service down');
      expect(customerRepository.find).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.list_all',
      );
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        'all_customers',
      );
    });

    it('should handle multiple customers with proper ordering', async () => {
      const customers = [
        { ...mockCustomer, id: '1', createdAt: new Date('2023-01-01') },
        { ...mockCustomer, id: '2', createdAt: new Date('2023-01-02') },
        { ...mockCustomer, id: '3', createdAt: new Date('2023-01-03') },
      ];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserSearch.mockResolvedValue(undefined);

      const result = await service.handle();

      expect(result).toEqual(customers);
      expect(result).toHaveLength(3);
      expect(customerRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should handle both audit and analytics service failures', async () => {
      const customers = [mockCustomer];
      mockCustomerRepository.find.mockResolvedValue(customers);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );
      mockAnalyticsService.trackUserSearch.mockRejectedValue(
        new Error('Analytics service down'),
      );

      await expect(service.handle()).rejects.toThrow('Audit service down');
      expect(customerRepository.find).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.list_all',
      );
      expect(analyticsService.trackUserSearch).not.toHaveBeenCalled();
    });
  });
});
