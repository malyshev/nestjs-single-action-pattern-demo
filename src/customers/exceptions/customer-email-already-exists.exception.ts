export class CustomerEmailAlreadyExistsException extends Error {
  constructor(email: string) {
    super(`Customer with email '${email}' already exists`);
    this.name = 'CustomerEmailAlreadyExistsException';
  }
}
