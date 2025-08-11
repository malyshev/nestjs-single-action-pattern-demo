/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCustomerController } from './create-customer.controller';
import { CreateCustomerService } from '../services/create-customer.service';
import { CreateCustomerDto } from '../dto/create-customer.dto';
import { CustomerEmailAlreadyExistsException } from '../exceptions/customer-email-already-exists.exception';
import { Customer } from '../entities/customer.entity';

describe('CreateCustomerController', () => {
  let controller: CreateCustomerController;
  let service: CreateCustomerService;

  const mockCreateCustomerDto: CreateCustomerDto = {
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

  const mockCreateCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CreateCustomerController],
      providers: [
        {
          provide: CreateCustomerService,
          useValue: mockCreateCustomerService,
        },
      ],
    }).compile();

    controller = module.get<CreateCustomerController>(CreateCustomerController);
    service = module.get<CreateCustomerService>(CreateCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should create and return customer', async () => {
      mockCreateCustomerService.handle.mockResolvedValue(mockCustomer);

      const result = await controller.handle(mockCreateCustomerDto);

      expect(result).toEqual(mockCustomer);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith(mockCreateCustomerDto);
    });

    it('should throw HttpException when email already exists', async () => {
      const emailExistsError = new CustomerEmailAlreadyExistsException(
        'test@example.com',
      );
      mockCreateCustomerService.handle.mockRejectedValue(emailExistsError);

      try {
        await controller.handle(mockCreateCustomerDto);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(
          "Customer with email 'test@example.com' already exists",
        );
        expect(error.status).toBe(HttpStatus.CONFLICT);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should throw HttpException for unexpected errors', async () => {
      const unexpectedError = new Error('Database connection failed');
      mockCreateCustomerService.handle.mockRejectedValue(unexpectedError);

      try {
        await controller.handle(mockCreateCustomerDto);
        fail('Should have thrown an exception');
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe('Failed to create customer');
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle customer without phone number', async () => {
      const dtoWithoutPhone: CreateCustomerDto = {
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const customerWithoutPhone: Customer = {
        ...mockCustomer,
        phoneNumber: null as any,
      };

      mockCreateCustomerService.handle.mockResolvedValue(customerWithoutPhone);

      const result = await controller.handle(dtoWithoutPhone);

      expect(result).toEqual(customerWithoutPhone);
      expect(service.handle).toHaveBeenCalledWith(dtoWithoutPhone);
    });

    it('should handle service validation errors', async () => {
      const validationError = new Error('Validation failed');
      mockCreateCustomerService.handle.mockRejectedValue(validationError);

      await expect(controller.handle(mockCreateCustomerDto)).rejects.toThrow(
        HttpException,
      );
      await expect(
        controller.handle(mockCreateCustomerDto),
      ).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });
});
