export class CustomerAlreadyInactiveException extends Error {
  constructor(customerId: string) {
    super(`Customer with ID '${customerId}' is already inactive`);
    this.name = 'CustomerAlreadyInactiveException';
  }
}
