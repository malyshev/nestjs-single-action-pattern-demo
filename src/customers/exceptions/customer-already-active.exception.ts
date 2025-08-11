export class CustomerAlreadyActiveException extends Error {
  constructor(customerId: string) {
    super(`Customer with ID '${customerId}' is already active`);
    this.name = 'CustomerAlreadyActiveException';
  }
}
