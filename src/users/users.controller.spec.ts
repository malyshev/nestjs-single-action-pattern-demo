/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuditService } from '../audit/audit.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let auditService: AuditService;
  let analyticsService: AnalyticsService;

  const mockRequest = {
    ip: '192.168.1.1',
    headers: { 'user-agent': 'Mozilla/5.0 (Test Browser)' },
    user: { id: 'test-user-id' },
  } as any;

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

  const mockUsersService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    confirmEmail: jest.fn(),
    deactivate: jest.fn(),
    activate: jest.fn(),
    searchUsers: jest.fn(),
  };

  const mockAuditService = {
    logSystemAction: jest.fn(),
    logUserAction: jest.fn(),
  };

  const mockAnalyticsService = {
    trackUserSearch: jest.fn(),
    trackUserRegistration: jest.fn(),
    trackEmailConfirmation: jest.fn(),
    trackUserDeactivation: jest.fn(),
    trackUserActivation: jest.fn(),
    trackUserProfileUpdate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: AnalyticsService, useValue: mockAnalyticsService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    auditService = module.get<AuditService>(AuditService);
    analyticsService = module.get<AnalyticsService>(AnalyticsService);

    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all users with proper logging and analytics', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockUsers);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        'all_users',
        'test-user-id',
      );
    });

    it('should handle empty users list', async () => {
      mockUsersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual([]);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.list_all_response',
        {
          count: 0,
        },
      );
    });

    it('should handle service throwing error', async () => {
      const error = new Error('Database connection failed');
      mockUsersService.findAll.mockRejectedValue(error);

      await expect(controller.findAll(mockRequest)).rejects.toThrow(
        'Database connection failed',
      );
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(1); // Only request logged
    });

    it('should handle missing user context in request', async () => {
      const requestWithoutUser = { ...mockRequest, user: undefined };
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(requestWithoutUser);

      expect(result).toEqual(mockUsers);
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        'all_users',
        undefined,
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users with valid query', async () => {
      const query = 'john';
      const mockUsers = [mockUser];
      mockUsersService.searchUsers.mockResolvedValue(mockUsers);

      const result = await controller.searchUsers(query, mockRequest);

      expect(result).toEqual(mockUsers);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
      expect(analyticsService.trackUserSearch).toHaveBeenCalledWith(
        query,
        'test-user-id',
      );
    });

    it('should throw error for query less than 2 characters', async () => {
      await expect(controller.searchUsers('a', mockRequest)).rejects.toThrow(
        new HttpException(
          'Search query must be at least 2 characters',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error for empty query', async () => {
      await expect(controller.searchUsers('', mockRequest)).rejects.toThrow(
        new HttpException(
          'Search query must be at least 2 characters',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw error for whitespace-only query', async () => {
      await expect(controller.searchUsers('   ', mockRequest)).rejects.toThrow(
        new HttpException(
          'Search query must be at least 2 characters',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should handle special characters in query', async () => {
      const query = 'john@doe.com';
      const mockUsers = [mockUser];
      mockUsersService.searchUsers.mockResolvedValue(mockUsers);

      const result = await controller.searchUsers(query, mockRequest);

      expect(result).toEqual(mockUsers);
      expect(usersService.searchUsers).toHaveBeenCalledWith(query);
    });

    it('should handle very long query', async () => {
      const longQuery = 'a'.repeat(1000);
      const mockUsers = [mockUser];
      mockUsersService.searchUsers.mockResolvedValue(mockUsers);

      const result = await controller.searchUsers(longQuery, mockRequest);

      expect(result).toEqual(mockUsers);
      expect(usersService.searchUsers).toHaveBeenCalledWith(longQuery);
    });

    it('should handle service returning empty results', async () => {
      const query = 'nonexistent';
      mockUsersService.searchUsers.mockResolvedValue([]);

      const result = await controller.searchUsers(query, mockRequest);

      expect(result).toEqual([]);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.search_response',
        {
          query,
          count: 0,
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return user by id with proper logging', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-123', mockRequest);

      expect(result).toEqual(mockUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('non-existent', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle invalid UUID format', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(
        controller.findOne('invalid-uuid', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle empty id parameter', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      await expect(controller.findOne('', mockRequest)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle service throwing error', async () => {
      const error = new Error('Database error');
      mockUsersService.findOne.mockRejectedValue(error);

      await expect(controller.findOne('user-123', mockRequest)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByEmail', () => {
    it('should return user by email with proper logging', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await controller.findByEmail(
        'test@example.com',
        mockRequest,
      );

      expect(result).toEqual(mockUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found by email', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        controller.findByEmail('nonexistent@example.com', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle invalid email format', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        controller.findByEmail('invalid-email', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle empty email parameter', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(controller.findByEmail('', mockRequest)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('create', () => {
    it('should create user with proper logging', async () => {
      const createUserDto: CreateUserDto = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto, mockRequest);

      expect(result).toEqual(createdUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should handle missing required fields', async () => {
      const invalidDto = { email: 'test@example.com' } as CreateUserDto;
      const error = new Error('Validation failed');
      mockUsersService.create.mockRejectedValue(error);

      await expect(controller.create(invalidDto, mockRequest)).rejects.toThrow(
        'Validation failed',
      );
    });

    it('should handle duplicate email error from service', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const error = new Error('Email already exists');
      mockUsersService.create.mockRejectedValue(error);

      await expect(
        controller.create(createUserDto, mockRequest),
      ).rejects.toThrow('Email already exists');
    });

    it('should handle very long email address', async () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const createUserDto: CreateUserDto = {
        email: longEmail,
        firstName: 'Jane',
        lastName: 'Smith',
      };
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto, mockRequest);

      expect(result).toEqual(createdUser);
    });

    it('should handle special characters in names', async () => {
      const createUserDto: CreateUserDto = {
        email: 'special@example.com',
        firstName: 'José María',
        lastName: "O'Connor-Smith",
      };
      const createdUser = { ...mockUser, ...createUserDto };
      mockUsersService.create.mockResolvedValue(createdUser);

      const result = await controller.create(createUserDto, mockRequest);

      expect(result).toEqual(createdUser);
    });
  });

  describe('update', () => {
    it('should update user with proper logging', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'Updated' };
      const updatedUser = { ...mockUser, ...updateUserDto };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        'user-123',
        updateUserDto,
        mockRequest,
      );

      expect(result).toEqual(updatedUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found', async () => {
      mockUsersService.update.mockResolvedValue(null);

      await expect(
        controller.update(
          'non-existent',
          { firstName: 'Updated' },
          mockRequest,
        ),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle empty update DTO', async () => {
      const emptyDto = {};
      const updatedUser = { ...mockUser };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update('user-123', emptyDto, mockRequest);

      expect(result).toEqual(updatedUser);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.update_request',
        {
          userId: 'user-123',
          updates: [],
          ip: '192.168.1.1',
        },
      );
    });

    it('should handle partial updates with null values', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        phoneNumber: undefined,
      };
      const updatedUser = {
        ...mockUser,
        firstName: 'Updated',
        phoneNumber: null,
      };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(
        'user-123',
        updateUserDto,
        mockRequest,
      );

      expect(result).toEqual(updatedUser);
    });

    it('should handle service throwing validation error', async () => {
      const updateUserDto: UpdateUserDto = { firstName: 'A'.repeat(1000) };
      const error = new Error('Name too long');
      mockUsersService.update.mockRejectedValue(error);

      await expect(
        controller.update('user-123', updateUserDto, mockRequest),
      ).rejects.toThrow('Name too long');
    });
  });

  describe('remove', () => {
    it('should delete user with proper logging', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      const result = await controller.remove('user-123', mockRequest);

      expect(result).toEqual({ message: 'User deleted successfully' });
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should handle service throwing error during deletion', async () => {
      const error = new Error('Cannot delete user with active orders');
      mockUsersService.delete.mockRejectedValue(error);

      await expect(controller.remove('user-123', mockRequest)).rejects.toThrow(
        'Cannot delete user with active orders',
      );
    });

    it('should handle non-existent user deletion gracefully', async () => {
      mockUsersService.delete.mockResolvedValue(undefined);

      const result = await controller.remove('non-existent', mockRequest);

      expect(result).toEqual({ message: 'User deleted successfully' });
    });
  });

  describe('confirmEmail', () => {
    it('should confirm email with proper logging', async () => {
      const confirmedUser = { ...mockUser, emailConfirmed: true };
      mockUsersService.confirmEmail.mockResolvedValue(confirmedUser);

      const result = await controller.confirmEmail('user-123', mockRequest);

      expect(result).toEqual(confirmedUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found for email confirmation', async () => {
      mockUsersService.confirmEmail.mockResolvedValue(null);

      await expect(
        controller.confirmEmail('non-existent', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle already confirmed email', async () => {
      const alreadyConfirmedUser = { ...mockUser, emailConfirmed: true };
      mockUsersService.confirmEmail.mockResolvedValue(alreadyConfirmedUser);

      const result = await controller.confirmEmail('user-123', mockRequest);

      expect(result).toEqual(alreadyConfirmedUser);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user with proper logging', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUsersService.deactivate.mockResolvedValue(deactivatedUser);

      const result = await controller.deactivate('user-123', mockRequest);

      expect(result).toEqual(deactivatedUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found for deactivation', async () => {
      mockUsersService.deactivate.mockResolvedValue(null);

      await expect(
        controller.deactivate('non-existent', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle already deactivated user', async () => {
      const alreadyDeactivatedUser = { ...mockUser, isActive: false };
      mockUsersService.deactivate.mockResolvedValue(alreadyDeactivatedUser);

      const result = await controller.deactivate('user-123', mockRequest);

      expect(result).toEqual(alreadyDeactivatedUser);
    });
  });

  describe('activate', () => {
    it('should activate user with proper logging', async () => {
      const activatedUser = { ...mockUser, isActive: true };
      mockUsersService.activate.mockResolvedValue(activatedUser);

      const result = await controller.activate('user-123', mockRequest);

      expect(result).toEqual(activatedUser);
      expect(auditService.logSystemAction).toHaveBeenCalledTimes(2);
    });

    it('should throw error when user not found for activation', async () => {
      mockUsersService.activate.mockResolvedValue(null);

      await expect(
        controller.activate('non-existent', mockRequest),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );
    });

    it('should handle already active user', async () => {
      const alreadyActiveUser = { ...mockUser, isActive: true };
      mockUsersService.activate.mockResolvedValue(alreadyActiveUser);

      const result = await controller.activate('user-123', mockRequest);

      expect(result).toEqual(alreadyActiveUser);
    });
  });

  describe('Edge Cases - Request Context', () => {
    it('should handle missing IP address in request', async () => {
      const requestWithoutIP = { ...mockRequest, ip: undefined };
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(requestWithoutIP);

      expect(result).toEqual(mockUsers);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.list_all_request',
        {
          ip: undefined,
          userAgent: 'Mozilla/5.0 (Test Browser)',
        },
      );
    });

    it('should handle missing user agent in request', async () => {
      const requestWithoutUserAgent = { ...mockRequest, headers: {} };
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll(requestWithoutUserAgent);

      expect(result).toEqual(mockUsers);
      expect(auditService.logSystemAction).toHaveBeenCalledWith(
        'users.list_all_request',
        {
          ip: '192.168.1.1',
          userAgent: undefined,
        },
      );
    });

    it('should handle completely empty request object', async () => {
      const emptyRequest = {};
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      // This test demonstrates that the controller doesn't handle malformed requests gracefully
      await expect(controller.findAll(emptyRequest as any)).rejects.toThrow(
        "Cannot read properties of undefined (reading 'user-agent')",
      );
    });
  });

  describe('Edge Cases - Service Failures', () => {
    it('should handle audit service failure gracefully', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );

      // This test demonstrates that audit failures break the entire request
      await expect(controller.findAll(mockRequest)).rejects.toThrow(
        'Audit service down',
      );
    });

    it('should handle analytics service failure gracefully', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);
      // Ensure audit service succeeds first
      mockAuditService.logSystemAction.mockResolvedValue(undefined);
      // Then make analytics service fail
      mockAnalyticsService.trackUserSearch.mockRejectedValue(
        new Error('Analytics service down'),
      );

      // This test demonstrates that analytics failures break the entire request
      await expect(controller.findAll(mockRequest)).rejects.toThrow(
        'Analytics service down',
      );
    });

    it('should handle multiple service failures', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);
      mockAuditService.logSystemAction.mockRejectedValue(
        new Error('Audit service down'),
      );
      mockAnalyticsService.trackUserSearch.mockRejectedValue(
        new Error('Analytics service down'),
      );

      // This test demonstrates that multiple service failures cascade
      await expect(controller.findAll(mockRequest)).rejects.toThrow(
        'Audit service down',
      );
    });
  });
});
