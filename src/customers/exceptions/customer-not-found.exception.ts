export class CustomerNotFoundException extends Error {
  constructor(customerId: string) {
    super(`Customer with ID '${customerId}' not found`);
    this.name = 'CustomerNotFoundException';
  }
}
