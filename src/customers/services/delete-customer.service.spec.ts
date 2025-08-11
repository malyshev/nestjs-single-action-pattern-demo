/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteCustomerService } from './delete-customer.service';
import { Customer } from '../entities/customer.entity';
import { AuditService } from '../../audit/audit.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

describe('DeleteCustomerService', () => {
  let service: DeleteCustomerService;
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
    delete: jest.fn(),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCustomerService,
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

    service = module.get<DeleteCustomerService>(DeleteCustomerService);
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
    it('should delete customer successfully', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.delete.mockResolvedValue({ affected: 1 });
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      const result = await service.handle('1');

      expect(result).toBeUndefined();
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.delete).toHaveBeenCalledWith('1');
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.delete',
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
      expect(customerRepository.delete).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).not.toHaveBeenCalled();
    });

    it('should handle database errors during find', async () => {
      const dbError = new Error('Database connection failed');
      mockCustomerRepository.findOne.mockRejectedValue(dbError);

      await expect(service.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.delete).not.toHaveBeenCalled();
    });

    it('should handle database errors during delete', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.delete.mockRejectedValue(
        new Error('Database delete failed'),
      );
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      await expect(service.handle('1')).rejects.toThrow(
        'Database delete failed',
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.delete).toHaveBeenCalledWith('1');
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.delete',
        {
          customerId: '1',
        },
      );
    });

    it('should handle audit service failure', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(mockCustomer);
      mockCustomerRepository.delete.mockResolvedValue({ affected: 1 });
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );

      await expect(service.handle('1')).rejects.toThrow('Audit service down');
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.delete).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.delete',
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
      expect(customerRepository.delete).not.toHaveBeenCalled();
      expect(auditService.logSystemAction).not.toHaveBeenCalled();
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
      mockCustomerRepository.delete.mockResolvedValue({ affected: 1 });
      mockAuditService.logSystemAction.mockResolvedValue(undefined);

      const result = await service.handle('1');

      expect(result).toBeUndefined();
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(customerRepository.delete).toHaveBeenCalledWith('1');
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.delete',
        {
          customerId: '1',
        },
      );
    });
  });
});
