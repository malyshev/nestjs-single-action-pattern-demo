export class InvalidSearchQueryException extends Error {
  constructor(query: string) {
    super(
      `Search query '${query}' is invalid. Query must be at least 2 characters long.`,
    );
    this.name = 'InvalidSearchQueryException';
  }
}
