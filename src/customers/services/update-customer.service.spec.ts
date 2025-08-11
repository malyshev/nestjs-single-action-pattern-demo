/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCustomerService } from './update-customer.service';
import { Customer } from '../entities/customer.entity';
import { UpdateCustomerRequest } from '../interfaces/update-customer-request.interface';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

describe('UpdateCustomerService', () => {
  let service: UpdateCustomerService;
  let customerRepository: Repository<Customer>;
  let auditService: AuditService;
  let analyticsService: AnalyticsService;

  const mockUpdateCustomerRequest: UpdateCustomerRequest = {
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
  };

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

  const mockUpdatedCustomer: Customer = {
    ...mockCustomer,
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
  };

  const mockCustomerRepository = {
    findOne: jest.fn(),
    merge: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditService = {
    logUserAction: jest.fn(),
  };

  const mockAnalyticsService = {
    trackUserProfileUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCustomerService,
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

    service = module.get<UpdateCustomerService>(UpdateCustomerService);
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
    it('should update customer successfully', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.merge.mockReturnValue(mockUpdatedCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockUpdatedCustomer);
      mockAuditService.logUserAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserProfileUpdate.mockResolvedValue(undefined);

      const result = await service.handle('1', mockUpdateCustomerRequest);

      expect(result).toEqual(mockUpdatedCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        mockUpdateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockUpdatedCustomer);
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'customers.update',
        '1',
        {
          updatedFields: ['firstName', 'lastName', 'phoneNumber'],
        },
      );
      expect(analyticsService.trackUserProfileUpdate).toHaveBeenCalledWith(
        '1',
        ['firstName', 'lastName', 'phoneNumber'],
      );
    });

    it('should throw CustomerNotFoundException when customer not found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);

      await expect(
        service.handle('1', mockUpdateCustomerRequest),
      ).rejects.toThrow(CustomerNotFoundException);
      await expect(
        service.handle('1', mockUpdateCustomerRequest),
      ).rejects.toThrow("Customer with ID '1' not found");
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
      expect(auditService.logUserAction).not.toHaveBeenCalled();
      expect(analyticsService.trackUserProfileUpdate).not.toHaveBeenCalled();
    });

    it('should handle partial updates', async () => {
      const partialRequest: UpdateCustomerRequest = {
        firstName: 'Jane',
      };

      const partiallyUpdatedCustomer: Customer = {
        ...mockCustomer,
        firstName: 'Jane',
      };

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.merge.mockReturnValue(partiallyUpdatedCustomer);
      mockCustomerRepository.save.mockResolvedValue(partiallyUpdatedCustomer);
      mockAuditService.logUserAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserProfileUpdate.mockResolvedValue(undefined);

      const result = await service.handle('1', partialRequest);

      expect(result).toEqual(partiallyUpdatedCustomer);
      expect(result.firstName).toBe('Jane');
      expect(result.lastName).toBe('Doe'); // unchanged
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        partialRequest,
      );
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'customers.update',
        '1',
        {
          updatedFields: ['firstName'],
        },
      );
      expect(analyticsService.trackUserProfileUpdate).toHaveBeenCalledWith(
        '1',
        ['firstName'],
      );
    });

    it('should handle empty update request', async () => {
      const emptyRequest: UpdateCustomerRequest = {};

      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.merge.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockAuditService.logUserAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserProfileUpdate.mockResolvedValue(undefined);

      const result = await service.handle('1', emptyRequest);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        emptyRequest,
      );
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'customers.update',
        '1',
        {
          updatedFields: [],
        },
      );
      expect(analyticsService.trackUserProfileUpdate).toHaveBeenCalledWith(
        '1',
        [],
      );
    });

    it('should handle database errors during find', async () => {
      const dbError = new Error('Database connection failed');
      mockCustomerRepository.findOne.mockRejectedValue(dbError);

      await expect(
        service.handle('1', mockUpdateCustomerRequest),
      ).rejects.toThrow('Database connection failed');
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });

    it('should handle database errors during save', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.merge.mockReturnValue(mockUpdatedCustomer);
      mockCustomerRepository.save.mockRejectedValue(
        new Error('Database save failed'),
      );

      await expect(
        service.handle('1', mockUpdateCustomerRequest),
      ).rejects.toThrow('Database save failed');
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        mockUpdateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockUpdatedCustomer);
      expect(auditService.logUserAction).not.toHaveBeenCalled();
      expect(analyticsService.trackUserProfileUpdate).not.toHaveBeenCalled();
    });

    it('should handle cross-cutting concerns failures gracefully', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.merge.mockReturnValue(mockUpdatedCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockUpdatedCustomer);
      mockAuditService.logUserAction.mockRejectedValue(
        new Error('Audit service down'),
      );
      mockAnalyticsService.trackUserProfileUpdate.mockRejectedValue(
        new Error('Analytics service down'),
      );

      const result = await service.handle('1', mockUpdateCustomerRequest);

      expect(result).toEqual(mockUpdatedCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.merge).toHaveBeenCalledWith(
        mockCustomer,
        mockUpdateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockUpdatedCustomer);
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'customers.update',
        '1',
        {
          updatedFields: ['firstName', 'lastName', 'phoneNumber'],
        },
      );
      expect(analyticsService.trackUserProfileUpdate).toHaveBeenCalledWith(
        '1',
        ['firstName', 'lastName', 'phoneNumber'],
      );
    });

    it('should handle empty customer ID', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockAuditService.logUserAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserProfileUpdate.mockResolvedValue(undefined);

      await expect(
        service.handle('', mockUpdateCustomerRequest),
      ).rejects.toThrow(CustomerNotFoundException);
      await expect(
        service.handle('', mockUpdateCustomerRequest),
      ).rejects.toThrow("Customer with ID '' not found");
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '' },
      });
      expect(customerRepository.merge).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });
  });
});
