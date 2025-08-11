/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ActivateCustomerController } from './activate-customer.controller';
import { ActivateCustomerService } from '../services/activate-customer.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { CustomerAlreadyActiveException } from '../exceptions/customer-already-active.exception';
import { Customer } from '../entities/customer.entity';

describe('ActivateCustomerController', () => {
  let controller: ActivateCustomerController;
  let service: ActivateCustomerService;

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

  const mockActivateCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivateCustomerController],
      providers: [
        {
          provide: ActivateCustomerService,
          useValue: mockActivateCustomerService,
        },
      ],
    }).compile();

    controller = module.get<ActivateCustomerController>(
      ActivateCustomerController,
    );
    service = module.get<ActivateCustomerService>(ActivateCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should activate customer and return customer', async () => {
      mockActivateCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1');

      expect(result).toEqual(mockCustomer);
      expect(result.isActive).toBe(true);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockActivateCustomerService.handle.mockRejectedValue(notFoundError);

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

    it('should throw HttpException when customer already active', async () => {
      const alreadyActiveError = new CustomerAlreadyActiveException('1');
      mockActivateCustomerService.handle.mockRejectedValue(alreadyActiveError);

      try {
        await controller.handle('1');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '1' is already active");
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockActivateCustomerService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty customer ID', async () => {
      const notFoundError = new CustomerNotFoundException('');
      mockActivateCustomerService.handle.mockRejectedValue(notFoundError);

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
      mockActivateCustomerService.handle.mockRejectedValue(permissionError);

      await expect(controller.handle('1')).rejects.toThrow('Permission denied');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
