/**
 * IdGeneratorService.js - Sortable ULID / Snowflake Monotonic ID Generator
 * Generates chronologically sortable IDs for Orders, Transactions, and Correlation IDs.
 */

class IdGeneratorServiceImpl {
  generateULID(prefix = 'CW') {
    const timestampHex = Date.now().toString(36).toUpperCase();
    const randomness = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `${prefix}-${timestampHex}-${randomness}`;
  }

  generateCorrelationId() {
    return this.generateULID('CID');
  }

  generateTransactionId() {
    return this.generateULID('TX');
  }
}

export const IdGeneratorService = new IdGeneratorServiceImpl();
