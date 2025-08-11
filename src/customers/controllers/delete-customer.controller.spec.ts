/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { DeleteCustomerController } from './delete-customer.controller';
import { DeleteCustomerService } from '../services/delete-customer.service';
import { CustomerNotFoundException } from '../exceptions/customer-not-found.exception';

describe('DeleteCustomerController', () => {
  let controller: DeleteCustomerController;
  let service: DeleteCustomerService;

  const mockDeleteCustomerService = {
    handle: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeleteCustomerController],
      providers: [
        {
          provide: DeleteCustomerService,
          useValue: mockDeleteCustomerService,
        },
      ],
    }).compile();

    controller = module.get<DeleteCustomerController>(DeleteCustomerController);
    service = module.get<DeleteCustomerService>(DeleteCustomerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should delete customer successfully', async () => {
      mockDeleteCustomerService.handle.mockResolvedValue(undefined);

      const result = await controller.handle('1');

      expect(result).toBeUndefined();
      expect(service.handle).toHaveBeenCalledTimes(1);
      expect(service.handle).toHaveBeenCalledWith('1');
    });

    it('should throw HttpException when customer not found', async () => {
      const notFoundError = new CustomerNotFoundException('1');
      mockDeleteCustomerService.handle.mockRejectedValue(notFoundError);

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
      mockDeleteCustomerService.handle.mockRejectedValue(unexpectedError);

      await expect(controller.handle('1')).rejects.toThrow(
        'Database connection failed',
      );
      expect(service.handle).toHaveBeenCalledTimes(1);
    });

    it('should handle empty customer ID', async () => {
      const notFoundError = new CustomerNotFoundException('');
      mockDeleteCustomerService.handle.mockRejectedValue(notFoundError);

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
      mockDeleteCustomerService.handle.mockRejectedValue(permissionError);

      await expect(controller.handle('1')).rejects.toThrow('Permission denied');
      expect(service.handle).toHaveBeenCalledTimes(1);
    });
  });
});
