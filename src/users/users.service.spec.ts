/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';
import { MailingService } from '../mailing/mailing.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AnalyticsService } from '../analytics/analytics.service';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: Repository<User>;
  let auditService: AuditService;
  let mailingService: MailingService;
  let notificationsService: NotificationsService;
  let analyticsService: AnalyticsService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    emailConfirmed: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn(),
    })),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
    logUserAction: jest.fn(),
  };

  const mockMailingService = {
    sendWelcomeEmail: jest.fn(),
    sendEmailConfirmation: jest.fn(),
    sendPasswordReset: jest.fn(),
    sendUserDeactivated: jest.fn(),
    sendUserActivated: jest.fn(),
  };

  const mockNotificationsService = {
    sendInAppNotification: jest.fn(),
    sendWelcomeNotification: jest.fn(),
    sendEmailConfirmedNotification: jest.fn(),
    sendAccountDeactivatedNotification: jest.fn(),
    sendAccountActivatedNotification: jest.fn(),
  };

  const mockAnalyticsService = {
    trackUserRegistration: jest.fn(),
    trackUserLogin: jest.fn(),
    trackEmailConfirmation: jest.fn(),
    trackUserDeactivation: jest.fn(),
    trackUserActivation: jest.fn(),
    trackUserSearch: jest.fn(),
    trackUserProfileUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: MailingService,
          useValue: mockMailingService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
        {
          provide: AnalyticsService,
          useValue: mockAnalyticsService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    auditService = module.get<AuditService>(AuditService);
    mailingService = module.get<MailingService>(MailingService);
    notificationsService =
      module.get<NotificationsService>(NotificationsService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users ordered by creation date', async () => {
      const mockUsers = [mockUser];
      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(userRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should handle empty users list', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it('should handle database error', async () => {
      const error = new Error('Database connection failed');
      mockUserRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne('non-existent');

      expect(result).toBeNull();
    });

    it('should handle database error', async () => {
      const error = new Error('Database error');
      mockUserRepository.findOne.mockRejectedValue(error);

      await expect(service.findOne('user-123')).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
    });

    it('should return null when user not found by email', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create user with all cross-cutting concerns', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phoneNumber: '+0987654321',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(userRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(userRepository.save).toHaveBeenCalledWith(createdUser);

      // Verify all cross-cutting concerns are called
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.create',
        {
          userId: createdUser.id,
          email: createdUser.email,
        },
      );
      expect(analyticsService.trackUserRegistration).toHaveBeenCalledWith(
        createdUser.id,
        {
          email: createdUser.email,
        },
      );
      expect(mailingService.sendWelcomeEmail).toHaveBeenCalledWith(
        createdUser.id,
        createdUser.email,
        createdUser.firstName,
      );
      expect(notificationsService.sendWelcomeNotification).toHaveBeenCalledWith(
        createdUser.id,
        createdUser.firstName,
      );
    });

    it('should handle database error during creation', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const error = new Error('Database constraint violation');
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database constraint violation',
      );
    });

    it('should handle partial user data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'minimal@example.com',
        firstName: 'Minimal',
        lastName: 'User',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user with audit and analytics tracking', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'Name',
      };
      const updatedUser = { ...mockUser, ...updateUserDto };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update('user-123', updateUserDto);

      expect(result).toEqual(updatedUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(userRepository.save).toHaveBeenCalledWith(updatedUser);

      // Verify cross-cutting concerns
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'users.update',
        'user-123',
        {
          updatedFields: ['firstName', 'lastName'],
        },
      );
      expect(analyticsService.trackUserProfileUpdate).toHaveBeenCalledWith(
        'user-123',
        ['firstName', 'lastName'],
      );
    });

    it('should return null when user not found', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent', updateUserDto);

      expect(result).toBeNull();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle empty update DTO', async () => {
      const emptyDto = {};
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.update('user-123', emptyDto);

      expect(result).toEqual(mockUser);
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'users.update',
        'user-123',
        {
          updatedFields: [],
        },
      );
    });

    it('should handle database error during update', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const error = new Error('Database error');
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.update('user-123', updateUserDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('delete', () => {
    it('should delete user with audit logging', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 1 });

      await service.delete('user-123');

      expect(userRepository.delete).toHaveBeenCalledWith('user-123');
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.delete',
        { userId: 'user-123' },
      );
    });

    it('should handle non-existent user deletion', async () => {
      mockUserRepository.delete.mockResolvedValue({ affected: 0 });

      await service.delete('non-existent');

      expect(userRepository.delete).toHaveBeenCalledWith('non-existent');
    });

    it('should handle database error during deletion', async () => {
      const error = new Error('Cannot delete user with active orders');
      mockUserRepository.delete.mockRejectedValue(error);

      await expect(service.delete('user-123')).rejects.toThrow(
        'Cannot delete user with active orders',
      );
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email with all cross-cutting concerns', async () => {
      const confirmedUser = { ...mockUser, emailConfirmed: true };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(confirmedUser);

      const result = await service.confirmEmail('user-123');

      expect(result).toEqual(confirmedUser);
      expect(userRepository.save).toHaveBeenCalledWith(confirmedUser);

      // Verify cross-cutting concerns
      expect(auditService.logUserAction).toHaveBeenCalledWith(
        'users.confirm_email',
        'user-123',
      );
      expect(analyticsService.trackEmailConfirmation).toHaveBeenCalledWith(
        'user-123',
      );
      expect(
        notificationsService.sendEmailConfirmedNotification,
      ).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.confirmEmail('non-existent');

      expect(result).toBeNull();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should handle already confirmed email', async () => {
      const alreadyConfirmedUser = { ...mockUser, emailConfirmed: true };
      mockUserRepository.findOne.mockResolvedValue(alreadyConfirmedUser);
      mockUserRepository.save.mockResolvedValue(alreadyConfirmedUser);

      const result = await service.confirmEmail('user-123');

      expect(result).toEqual(alreadyConfirmedUser);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user with all cross-cutting concerns', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(deactivatedUser);

      const result = await service.deactivate('user-123');

      expect(result).toEqual(deactivatedUser);
      expect(userRepository.save).toHaveBeenCalledWith(deactivatedUser);

      // Verify cross-cutting concerns
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.deactivate',
        { userId: 'user-123' },
      );
      expect(analyticsService.trackUserDeactivation).toHaveBeenCalledWith(
        'user-123',
      );
      expect(mailingService.sendUserDeactivated).toHaveBeenCalledWith(
        'user-123',
        mockUser.email,
      );
      expect(
        notificationsService.sendAccountDeactivatedNotification,
      ).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.deactivate('non-existent');

      expect(result).toBeNull();
    });

    it('should handle already deactivated user', async () => {
      const alreadyDeactivatedUser = { ...mockUser, isActive: false };
      mockUserRepository.findOne.mockResolvedValue(alreadyDeactivatedUser);
      mockUserRepository.save.mockResolvedValue(alreadyDeactivatedUser);

      const result = await service.deactivate('user-123');

      expect(result).toEqual(alreadyDeactivatedUser);
    });
  });

  describe('activate', () => {
    it('should activate user with all cross-cutting concerns', async () => {
      const activatedUser = { ...mockUser, isActive: true };
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue(activatedUser);

      const result = await service.activate('user-123');

      expect(result).toEqual(activatedUser);
      expect(userRepository.save).toHaveBeenCalledWith(activatedUser);

      // Verify cross-cutting concerns
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.activate',
        { userId: 'user-123' },
      );
      expect(analyticsService.trackUserActivation).toHaveBeenCalledWith(
        'user-123',
      );
      expect(mailingService.sendUserActivated).toHaveBeenCalledWith(
        'user-123',
        mockUser.email,
      );
      expect(
        notificationsService.sendAccountActivatedNotification,
      ).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await service.activate('non-existent');

      expect(result).toBeNull();
    });

    it('should handle already active user', async () => {
      const alreadyActiveUser = { ...mockUser, isActive: true };
      mockUserRepository.findOne.mockResolvedValue(alreadyActiveUser);
      mockUserRepository.save.mockResolvedValue(alreadyActiveUser);

      const result = await service.activate('user-123');

      expect(result).toEqual(alreadyActiveUser);
    });
  });

  describe('searchUsers', () => {
    it('should search users with audit and analytics tracking', async () => {
      const query = 'john';
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers(query);

      expect(result).toEqual(mockUsers);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.firstName LIKE :query OR user.lastName LIKE :query OR user.email LIKE :query',
        { query: `%${query}%` },
      );
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith(
        'user.createdAt',
        'DESC',
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();

      // Verify cross-cutting concerns
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.search',
        { query },
      );
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(query);
    });

    it('should handle empty search results', async () => {
      const query = 'nonexistent';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers(query);

      expect(result).toEqual([]);
    });

    it('should handle special characters in query', async () => {
      const query = 'john@doe.com';
      const mockUsers = [mockUser];
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockUsers),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.searchUsers(query);

      expect(result).toEqual(mockUsers);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'user.firstName LIKE :query OR user.lastName LIKE :query OR user.email LIKE :query',
        { query: `%${query}%` },
      );
    });
  });

  describe('Edge Cases - Cross-Cutting Concern Failures', () => {
    it('should handle audit service failure gracefully', async () => {
      const mockUsers = [mockUser];
      mockUserRepository.find.mockResolvedValue(mockUsers);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );

      await expect(service.findAll()).rejects.toThrow('Audit service down');
      // This demonstrates that cross-cutting concern failures break the entire operation
    });

    it('should handle mailing service failure gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      // Ensure audit succeeds first, then mailing fails
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockRejectedValue(
        new Error('Mail service down'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Mail service down',
      );
      // This demonstrates that cross-cutting concern failures break the entire operation
    });

    it('should handle notifications service failure gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      // Ensure audit and mailing succeed first, then notifications fails
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockRejectedValue(
        new Error('Notifications down'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Notifications down',
      );
      // This demonstrates that cross-cutting concern failures break the entire operation
    });

    it('should handle analytics service failure gracefully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      // Ensure audit, mailing, and notifications succeed first, then analytics fails
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockMailingService.sendWelcomeEmail.mockResolvedValue(undefined);
      mockNotificationsService.sendWelcomeNotification.mockResolvedValue(
        undefined,
      );
      mockAnalyticsService.trackUserRegistration.mockRejectedValue(
        new Error('Analytics down'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Analytics down',
      );
      // This demonstrates that cross-cutting concern failures break the entire operation
    });

    it('should handle multiple service failures', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      mockUserRepository.save.mockResolvedValue(createdUser);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit down'),
      );
      mockMailingService.sendWelcomeEmail.mockRejectedValue(
        new Error('Mail down'),
      );
      mockNotificationsService.sendWelcomeNotification.mockRejectedValue(
        new Error('Notifications down'),
      );
      mockAnalyticsService.trackUserRegistration.mockRejectedValue(
        new Error('Analytics down'),
      );

      await expect(service.create(createUserDto)).rejects.toThrow('Audit down');
      // This demonstrates that the first cross-cutting concern failure breaks the entire operation
    });
  });

  describe('Edge Cases - Database Operations', () => {
    it('should handle repository create failure', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const error = new Error('Repository create failed');
      mockUserRepository.create.mockImplementation(() => {
        throw error;
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Repository create failed',
      );
    });

    it('should handle repository save failure', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };

      mockUserRepository.create.mockReturnValue(createdUser);
      const error = new Error('Repository save failed');
      mockUserRepository.save.mockRejectedValue(error);

      await expect(service.create(createUserDto)).rejects.toThrow(
        'Repository save failed',
      );
    });

    it('should handle query builder failure', async () => {
      const query = 'test';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockRejectedValue(new Error('Query builder failed')),
      };
      mockUserRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      // Ensure audit and analytics succeed first, then query builder fails
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      mockAnalyticsService.trackUserSearch.mockResolvedValue(undefined);

      await expect(service.searchUsers(query)).rejects.toThrow(
        'Query builder failed',
      );
    });
  });
});
