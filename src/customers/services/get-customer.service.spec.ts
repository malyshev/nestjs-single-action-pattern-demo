/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetCustomerService } from './get-customer.service';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

describe('GetCustomerService', () => {
  let service: GetCustomerService;
  let customerRepository: Repository<Customer>;
  let auditService: AuditService;

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
    findOne: jest.fn(),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCustomerService,
        {
          provide: getRepositoryToken(Customer),
          useValue: mockCustomerRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<GetCustomerService>(GetCustomerService);
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('should return customer when found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      const result = await service.handle('1');

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.get_by_id',
        {
          customerId: '1',
        },
      );
    });

    it('should throw CustomerNotFoundException when customer not found', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      await expect(service.handle('1')).rejects.toThrow(
        CustomerNotFoundException,
      );
      await expect(service.handle('1')).rejects.toThrow(
        "Customer with ID '1' not found",
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.get_by_id',
        {
          customerId: '1',
        },
      );
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockCustomerRepository.findOne.mockRejectedValue(dbError);

      await expect(service.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle audit service failure', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );

      await expect(service.handle('1')).rejects.toThrow('Audit service down');
      expect(customerRepository.findOne).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.get_by_id',
        {
          customerId: '1',
        },
      );
    });

    it('should handle empty customer ID', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      await expect(service.handle('')).rejects.toThrow(
        CustomerNotFoundException,
      );
      await expect(service.handle('')).rejects.toThrow(
        "Customer with ID '' not found",
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '' },
      });
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.get_by_id',
        {
          customerId: '',
        },
      );
    });

    it('should handle customer with all fields populated', async () => {
      const fullCustomer: Customer = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        emailConfirmed: true,
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      };

      mockCustomerRepository.findOne.mockResolvedValue(fullCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      const result = await service.handle('1');

      expect(result).toEqual(fullCustomer);
      expect(result.id).toBe('1');
      expect(result.email).toBe('test@example.com');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.phoneNumber).toBe('+1234567890');
      expect(result.emailConfirmed).toBe(true);
      expect(result.isActive).toBe(true);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle customer with minimal fields', async () => {
      const minimalCustomer: Customer = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: null as any,
        emailConfirmed: false,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCustomerRepository.findOne.mockResolvedValue(minimalCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      const result = await service.handle('1');

      expect(result).toEqual(minimalCustomer);
      expect(result.phoneNumber).toBeNull();
      expect(result.emailConfirmed).toBe(false);
      expect(result.isActive).toBe(false);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
