import { CreateCustomerRequest } from '../interfaces/create-customer-request.interface';

export class CreateCustomerDto implements CreateCustomerRequest {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
}
