/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ListCustomersController } from './list-customers.controller';
import { ListCustomersService } from '../services/list-customers.service';
import { Customer } from '../entities/customer.entity';

describe('ListCustomersController', () => {
  let controller: ListCustomersController;
  let service: ListCustomersService;

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

  const mockListCustomersService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListCustomersController],
      providers: [
        {
          provide: ListCustomersService,
          useValue: mockListCustomersService,
        },
      ],
    }).compile();

    controller = module.get<ListCustomersController>(ListCustomersController);
    service = module.get<ListCustomersService>(ListCustomersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should return list of customers', async () => {
      const customers = [mockCustomer];
      mockListCustomersService.handle.mockResolvedValue(customers);

      const result = await controller.handle();

      expect(result).toEqual(customers);
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith();
    });

    it('should return empty array when no customers exist', async () => {
      mockListCustomersService.handle.mockResolvedValue([]);

      const result = await controller.handle();

      expect(result).toEqual([]);
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection failed');
      mockListCustomersService.handle.mockRejectedValue(error);

      await expect(controller.handle()).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
