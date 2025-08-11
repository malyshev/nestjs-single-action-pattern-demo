/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { UpdateCustomerController } from './update-customer.controller';
import { UpdateCustomerService } from '../services/update-customer.service';
import { UpdateCustomerDto } from '../dto/update-customer.dto';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';
import { Customer } from '../entities/customer.entity';

describe('UpdateCustomerController', () => {
  let controller: UpdateCustomerController;
  let service: UpdateCustomerService;

  const mockUpdateCustomerDto: UpdateCustomerDto = {
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
  };

  const mockCustomer: Customer = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    phoneNumber: '+0987654321',
    emailConfirmed: true,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUpdateCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UpdateCustomerController],
      providers: [
        {
          provide: UpdateCustomerService,
          useValue: mockUpdateCustomerService,
        },
      ],
    }).compile();

    controller = module.get<UpdateCustomerController>(UpdateCustomerController);
    service = module.get<UpdateCustomerService>(UpdateCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should update and return customer', async () => {
      mockUpdateCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1', mockUpdateCustomerDto);

      expect(result).toEqual(mockCustomer);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1', mockUpdateCustomerDto);
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockUpdateCustomerService.handle.mockRejectedValue(notFoundError);

      try {
        await controller.handle('1', mockUpdateCustomerDto);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe("Customer with ID '1' not found");
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1', mockUpdateCustomerDto);
    });

    it('should re-throw unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockUpdateCustomerService.handle.mockRejectedValue(unexpectedError);

      await expect(
        controller.handle('1', mockUpdateCustomerDto),
      ).rejects.toThrow('Database connection failed');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle partial updates', async () => {
      const partialDto: UpdateCustomerDto = {
        firstName: 'Jane',
      };

      const updatedCustomer: Customer = {
        ...mockCustomer,
        firstName: 'Jane',
      };

      mockUpdateCustomerService.handle.mockResolvedValue(updatedCustomer);

      const result = await controller.handle('1', partialDto);

      expect(result).toEqual(updatedCustomer);
      expect(service.handle).toHaveBeenCalledWith('1', partialDto);
    });

    it('should handle empty update DTO', async () => {
      const emptyDto: UpdateCustomerDto = {};

      mockUpdateCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle('1', emptyDto);

      expect(result).toEqual(mockCustomer);
      expect(service.handle).toHaveBeenCalledWith('1', emptyDto);
    });

    it('should handle service validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockUpdateCustomerService.handle.mockRejectedValue(validationError);

      await expect(
        controller.handle('1', mockUpdateCustomerDto),
      ).rejects.toThrow('Validation failed');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
