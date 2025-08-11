/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ConfirmCustomerEmailController } from './confirm-customer-email.controller';
import { ConfirmCustomerEmailService } from '../services/confirm-customer-email.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { Customer } from '../entities/customer.entity';

describe('ConfirmCustomerEmailController', () => {
  let controller: ConfirmCustomerEmailController;
  let service: ConfirmCustomerEmailService;

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

  const mockConfirmCustomerEmailService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConfirmCustomerEmailController],
      providers: [
        {
          provide: ConfirmCustomerEmailService,
          useValue: mockConfirmCustomerEmailService,
        },
      ],
    }).compile();

    controller = module.get<ConfirmCustomerEmailController>(
      ConfirmCustomerEmailController,
    );
    service = module.get<ConfirmCustomerEmailService>(
      ConfirmCustomerEmailService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should confirm email and return customer', async () => {
      mockConfirmCustomerEmailService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1');

      expect(result).toEqual(mockCustomer);
      expect(result.emailConfirmed).toBe(true);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockConfirmCustomerEmailService.handle.mockRejectedValue(notFoundError);

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
      mockConfirmCustomerEmailService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty customer ID', async () => {
      const notFoundError = new CustomerNotFoundException('');
      mockConfirmCustomerEmailService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('');
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should handle already confirmed email', async () => {
      const alreadyConfirmedCustomer: Customer = {
        ...mockCustomer,
        emailConfirmed: true,
      };

      mockConfirmCustomerEmailService.handle.mockResolvedValue(
        alreadyConfirmedCustomer,
      );

      const result = await controller.handle('1');

      expect(result).toEqual(alreadyConfirmedCustomer);
      expect(result.emailConfirmed).toBe(true);
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle service permission errors', async () => {
      const permissionError = new Error('Permission denied');
      mockConfirmCustomerEmailService.handle.mockRejectedValue(permissionError);

      await expect(controller.handle('1')).rejects.toThrow('Permission denied');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
