import { UpdateCustomerRequest } from '../interfaces/update-customer-request.interface';

export class UpdateCustomerDto implements UpdateCustomerRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isActive?: boolean;
}
