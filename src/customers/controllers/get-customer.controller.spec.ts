/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { GetCustomerController } from './get-customer.controller';
import { GetCustomerService } from '../services/get-customer.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { Customer } from '../entities/customer.entity';

describe('GetCustomerController', () => {
  let controller: GetCustomerController;
  let service: GetCustomerService;

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

  const mockGetCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetCustomerController],
      providers: [
        {
          provide: GetCustomerService,
          useValue: mockGetCustomerService,
        },
      ],
    }).compile();

    controller = module.get<GetCustomerController>(GetCustomerController);
    service = module.get<GetCustomerService>(GetCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should return customer when found', async () => {
      mockGetCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1');

      expect(result).toEqual(mockCustomer);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockGetCustomerService.handle.mockRejectedValue(notFoundError);

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

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockGetCustomerService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty customer ID', async () => {
      const notFoundError = new CustomerNotFoundException('');
      mockGetCustomerService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
