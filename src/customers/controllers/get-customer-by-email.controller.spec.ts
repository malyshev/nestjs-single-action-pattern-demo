/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetCustomerByEmailController } from './get-customer-by-email.controller';
import { GetCustomerByEmailService } from '../services/get-customer-by-email.service';
import { CustomerEmailNotFoundException } from '../exceptions/customer-email-not-found.exception';
import { Customer } from '../entities/customer.entity';

describe('GetCustomerByEmailController', () => {
  let controller: GetCustomerByEmailController;
  let service: GetCustomerByEmailService;

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

  const mockGetCustomerByEmailService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetCustomerByEmailController],
      providers: [
        {
          provide: GetCustomerByEmailService,
          useValue: mockGetCustomerByEmailService,
        },
      ],
    }).compile();

    controller = module.get<GetCustomerByEmailController>(
      GetCustomerByEmailController,
    );
    service = module.get<GetCustomerByEmailService>(GetCustomerByEmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should return customer when found by email', async () => {
      mockGetCustomerByEmailService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('test@example.com');

      expect(result).toEqual(mockCustomer);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw HttpException when customer email not found', async () => {
      const notFoundError = new CustomerEmailNotFoundException(
        'nonexistent@example.com',
      );
      mockGetCustomerByEmailService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('nonexistent@example.com');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Customer with email 'nonexistent@example.com' not found",
        );
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('nonexistent@example.com');
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockGetCustomerByEmailService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('test@example.com')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty email', async () => {
      const notFoundError = new CustomerEmailNotFoundException('');
      mockGetCustomerByEmailService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with email '' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should handle malformed email', async () => {
      const notFoundError = new CustomerEmailNotFoundException('invalid-email');
      mockGetCustomerByEmailService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('invalid-email');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Customer with email 'invalid-email' not found",
        );
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
