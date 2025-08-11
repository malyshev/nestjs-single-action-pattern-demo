/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCustomerService } from './create-customer.service';
import { Customer } from '../entities/customer.entity';
import { CreateCustomerRequest } from '../interfaces/create-customer-request.interface';
import { AuditService } from '../../audit/audit.service';
import { AnalyticsService } from '../../analytics/analytics.service';
import { MailingService } from '../../mailing/mailing.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { CustomerEmailAlreadyExistsException } from '../exceptions/customer-email-already-exists.exception';

describe('CreateCustomerService', () => {
  let service: CreateCustomerService;
  let customerRepository: Repository<Customer>;
  let auditService: AuditService;
  let analyticsService: AnalyticsService;
  let mailingService: MailingService;
  let notificationsService: NotificationsService;

  const mockCreateCustomerRequest: CreateCustomerRequest = {
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
  };

  const mockCustomer: Customer = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    emailConfirmed: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCustomerRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
  };

  const mockAnalyticsService = {
    trackUserRegistration: jest.fn(),
  };

  const mockMailingService = {
    sendWelcomeEmail: jest.fn(),
  };

  const mockNotificationsService = {
    sendWelcomeNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerService,
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
        {
          provide: MailingService,
          useValue: mockMailingService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<CreateCustomerService>(CreateCustomerService);
    customerRepository = module.get<Repository<Customer>>(
      getRepositoryToken(Customer),
    );
    auditService = module.get<AuditService>(AuditService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);
    mailingService = module.get<MailingService>(MailingService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handle', () => {
    it('should create customer successfully', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserRegistration.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockResolvedValue(
        undefined,
      );

      const result = await service.handle(mockCreateCustomerRequest);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        mockCreateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.create',
        {
          customerId: '1',
          email: 'test@example.com',
        },
      );
      expect(analyticsService.trackUserRegistration).toHaveBeenCalledWith('1', {
        email: 'test@example.com',
      });
      expect(mailingService.sendWelcomeEmail).toHaveBeenCalledWith(
        '1',
        'test@example.com',
        'John',
      );
      expect(notificationsService.sendWelcomeNotification).toHaveBeenCalledWith(
        '1',
        'John',
      );
    });

    it('should throw CustomerEmailAlreadyExistsException when email already exists', async () => {
      const existingCustomer = { ...mockCustomer, id: '2' };
      mockCustomerRepository.findOne.mockResolvedValue(existingCustomer);

      await expect(service.handle(mockCreateCustomerRequest)).rejects.toThrow(
        CustomerEmailAlreadyExistsException,
      );
      await expect(service.handle(mockCreateCustomerRequest)).rejects.toThrow(
        "Customer with email 'test@example.com' already exists",
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(customerRepository.create).not.toHaveBeenCalled();
      expect(customerRepository.save).not.toHaveBeenCalled();
    });

    it('should handle customer without phone number', async () => {
      const requestWithoutPhone: CreateCustomerRequest = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const customerWithoutPhone: Customer = {
        ...mockCustomer,
        phoneNumber: null as any,
      };

      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(customerWithoutPhone);
      mockCustomerRepository.save.mockResolvedValue(customerWithoutPhone);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserRegistration.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockResolvedValue(
        undefined,
      );

      const result = await service.handle(requestWithoutPhone);

      expect(result).toEqual(customerWithoutPhone);
      expect(result.phoneNumber).toBeNull();
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        requestWithoutPhone,
      );
    });

    it('should handle database errors during save', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockRejectedValue(
        new Error('Database save failed'),
      );

      await expect(service.handle(mockCreateCustomerRequest)).rejects.toThrow(
        'Database save failed',
      );
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        mockCreateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle cross-cutting concerns failures gracefully', async () => {
      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );
      mockAnalyticsService.trackUserRegistration.mockRejectedValue(
        new Error('Analytics service down'),
      );
      mockMailingService.sendWelcomeEmail.mockRejectedValue(
        new Error('Mailing service down'),
      );
      mockNotificationsService.sendWelcomeNotification.mockRejectedValue(
        new Error('Notifications service down'),
      );

      const result = await service.handle(mockCreateCustomerRequest);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        mockCreateCustomerRequest,
      );
      expect(customerRepository.save).toHaveBeenCalledWith(mockCustomer);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'customers.create',
        {
          customerId: '1',
          email: 'test@example.com',
        },
      );
      expect(analyticsService.trackUserRegistration).toHaveBeenCalledWith('1', {
        email: 'test@example.com',
      });
      expect(mailingService.sendWelcomeEmail).toHaveBeenCalledWith(
        '1',
        'test@example.com',
        'John',
      );
      expect(notificationsService.sendWelcomeNotification).toHaveBeenCalledWith(
        '1',
        'John',
      );
    });

    it('should handle empty email', async () => {
      const requestWithEmptyEmail: CreateCustomerRequest = {
        email: '',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserRegistration.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockResolvedValue(
        undefined,
      );

      const result = await service.handle(requestWithEmptyEmail);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: '' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        requestWithEmptyEmail,
      );
    });

    it('should handle malformed email', async () => {
      const requestWithMalformedEmail: CreateCustomerRequest = {
        email: 'invalid-email',
        firstName: 'John',
        lastName: 'Doe',
      };

      mockCustomerRepository.findOne.mockResolvedValue(null);
      mockCustomerRepository.create.mockReturnValue(mockCustomer);
      mockCustomerRepository.save.mockResolvedValue(mockCustomer);
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserRegistration.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockResolvedValue(
        undefined,
      );

      const result = await service.handle(requestWithMalformedEmail);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'invalid-email' },
      });
      expect(customerRepository.create).toHaveBeenCalledWith(
        requestWithMalformedEmail,
      );
    });
  });
});
