import { Prisma } from "@prisma/client";

// ============================================
// DATABASE ERROR HANDLING UTILITIES
// ============================================

/**
 * Type guard to check if an error is a Prisma error
 *
 * This helps TypeScript understand error types and enables
 * proper error code checking.
 *
 * @param error - Unknown error to check
 * @returns True if error is a known Prisma error
 */
export function isPrismaError(
  error: unknown,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Handles Prisma-specific errors with user-friendly messages
 *
 * Converts cryptic Prisma error codes into readable messages.
 * Common codes:
 * - P2002: Duplicate entry (unique constraint violation)
 * - P2025: Record not found
 * - P2003: Foreign key constraint failed
 *
 * @param error - Prisma error to handle
 * @param context - Operation context for error message
 * @returns Error with friendly message
 */
export function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  context: string,
): Error {
  switch (error.code) {
    case "P2002":
      return new Error(`${context}: Duplicate entry found`);
    case "P2025":
      return new Error(`${context}: Record not found`);
    case "P2003":
      return new Error(`${context}: Foreign key constraint failed`);
    default:
      return new Error(`${context}: Database error (${error.code})`);
  }
}

/**
 * Centralized error handler for database operations
 *
 * This function never returns - it always throws an error.
 * It logs the error and converts it to a user-friendly format.
 *
 * @param error - Error that occurred
 * @param operation - Description of the operation that failed
 * @throws Always throws an error with friendly message
 */
export function handleDatabaseError(error: unknown, operation: string): never {
  console.error(`Failed to ${operation}:`, error);

  if (isPrismaError(error)) {
    throw handlePrismaError(error, `Failed to ${operation}`);
  }

  const message =
    error instanceof Error ? error.message : "Unknown database error";
  throw new Error(`Failed to ${operation}: ${message}`);
}

/**
 * Wrapper for database operations with automatic error handling
 *
 * Use this wrapper around all database operations for consistent
 * error handling. It automatically catches and formats errors.
 *
 * Example:
 * ```ts
 * return wrapDatabaseOperation(async () => {
 *   return await prisma.user.findUnique({ where: { id } });
 * }, "fetch user");
 * ```
 *
 * @param operation - Async function containing database operation
 * @param operationName - Description for error messages
 * @returns Result of the operation
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error, operationName);
  }
}
