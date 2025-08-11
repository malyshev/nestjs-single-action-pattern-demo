/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { SearchCustomersController } from './search-customers.controller';
import { SearchCustomersService } from '../services/search-customers.service';
import { InvalidSearchQueryException } from '../exceptions/invalid-search-query.exception';
import { Customer } from '../entities/customer.entity';

describe('SearchCustomersController', () => {
  let controller: SearchCustomersController;
  let service: SearchCustomersService;

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

  const mockSearchCustomersService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchCustomersController],
      providers: [
        {
          provide: SearchCustomersService,
          useValue: mockSearchCustomersService,
        },
      ],
    }).compile();

    controller = module.get<SearchCustomersController>(
      SearchCustomersController,
    );
    service = module.get<SearchCustomersService>(SearchCustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should return search results', async () => {
      const customers = [mockCustomer];
      mockSearchCustomersService.handle.mockResolvedValue(customers);

      const result = await controller.handle('john');

      expect(result).toEqual(customers);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('john');
    });

    it('should return empty array when no results found', async () => {
      mockSearchCustomersService.handle.mockResolvedValue([]);

      const result = await controller.handle('nonexistent');

      expect(result).toEqual([]);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('nonexistent');
    });

    it('should throw HttpException when search query is invalid', async () => {
      const invalidQueryError = new InvalidSearchQueryException('a');
      mockSearchCustomersService.handle.mockRejectedValue(invalidQueryError);

      try {
        await controller.handle('a');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Search query 'a' is invalid. Query must be at least 2 characters long.",
        );
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('a');
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockSearchCustomersService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('john')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty search query', async () => {
      const invalidQueryError = new InvalidSearchQueryException('');
      mockSearchCustomersService.handle.mockRejectedValue(invalidQueryError);

      try {
        await controller.handle('');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Search query '' is invalid. Query must be at least 2 characters long.",
        );
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should handle single character query', async () => {
      const invalidQueryError = new InvalidSearchQueryException('j');
      mockSearchCustomersService.handle.mockRejectedValue(invalidQueryError);

      try {
        await controller.handle('j');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Search query 'j' is invalid. Query must be at least 2 characters long.",
        );
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should handle multiple search results', async () => {
      const multipleCustomers = [
        mockCustomer,
        {
          ...mockCustomer,
          id: '2',
          firstName: 'Jane',
          email: 'jane@example.com',
        },
        {
          ...mockCustomer,
          id: '3',
          firstName: 'Jack',
          email: 'jack@example.com',
        },
      ];
      mockSearchCustomersService.handle.mockResolvedValue(multipleCustomers);

      const result = await controller.handle('john');

      expect(result).toEqual(multipleCustomers);
      expect(result).toHaveLength(3);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('john');
    });

    it('should handle service permission errors', async () => {
      const permissionError = new Error('Permission denied');
      mockSearchCustomersService.handle.mockRejectedValue(permissionError);

      await expect(controller.handle('john')).rejects.toThrow(
        'Permission denied',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
