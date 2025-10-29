import { Prisma } from "@prisma/client";

// ============================================
// DATABASE ERROR HANDLING UTILITIES
// ============================================

/**
 * Type guard to check if error is a Prisma error
 */
export function isPrismaError(
  error: unknown
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

/**
 * Handles Prisma-specific errors with appropriate messages
 */
export function handlePrismaError(
  error: Prisma.PrismaClientKnownRequestError,
  context: string
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
 * Wrapper for database operations that automatically handles errors
 */
export async function wrapDatabaseOperation<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error, operationName);
  }
}
