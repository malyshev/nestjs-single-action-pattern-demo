export interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
