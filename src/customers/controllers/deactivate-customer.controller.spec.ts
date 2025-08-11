/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeactivateCustomerController } from './deactivate-customer.controller';
import { DeactivateCustomerService } from '../services/deactivate-customer.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { CustomerAlreadyInactiveException } from '../exceptions/customer-already-inactive.exception';
import { Customer } from '../entities/customer.entity';

describe('DeactivateCustomerController', () => {
  let controller: DeactivateCustomerController;
  let service: DeactivateCustomerService;

  const mockCustomer: Customer = {
    id: '1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
    emailConfirmed: true,
    isActive: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockDeactivateCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeactivateCustomerController],
      providers: [
        {
          provide: DeactivateCustomerService,
          useValue: mockDeactivateCustomerService,
        },
      ],
    }).compile();

    controller = module.get<DeactivateCustomerController>(
      DeactivateCustomerController,
    );
    service = module.get<DeactivateCustomerService>(DeactivateCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should deactivate customer and return customer', async () => {
      mockDeactivateCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1');

      expect(result).toEqual(mockCustomer);
      expect(result.isActive).toBe(false);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockDeactivateCustomerService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('1');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '1' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer already inactive', async () => {
      const alreadyInactiveError = new CustomerAlreadyInactiveException('1');
      mockDeactivateCustomerService.handle.mockRejectedValue(
        alreadyInactiveError,
      );

      try {
        await controller.handle('1');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '1' is already inactive");
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockDeactivateCustomerService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty customer ID', async () => {
      const notFoundError = new CustomerNotFoundException('');
      mockDeactivateCustomerService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should handle service permission errors', async () => {
      const permissionError = new Error('Permission denied');
      mockDeactivateCustomerService.handle.mockRejectedValue(permissionError);

      await expect(controller.handle('1')).rejects.toThrow('Permission denied');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
