/**
 * =============================================================================
 * SYNC ERROR HANDLER - User-Friendly Error Messages
 * =============================================================================
 * 
 * Provides user-friendly error messages for sync operations
 */

export enum SyncErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  PERMISSION_ERROR = 'PERMISSION_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface SyncError {
  type: SyncErrorType;
  message: string;
  userMessage: string;
  retryable: boolean;
  originalError?: any;
}

/**
 * Convert technical error to user-friendly message
 */
export function formatSyncError(error: any): SyncError {
  const errorMessage = error?.message || String(error) || 'Unknown error';
  const errorCode = error?.code || error?.status || '';

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('ENOTFOUND') ||
    errorCode === 'NETWORK_ERROR'
  ) {
    return {
      type: SyncErrorType.NETWORK_ERROR,
      message: errorMessage,
      userMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      retryable: true,
      originalError: error,
    };
  }

  // Authentication errors
  if (
    errorMessage.includes('auth') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401') ||
    errorMessage.includes('session') ||
    errorMessage.includes('token') ||
    errorCode === 'PGRST301' ||
    errorCode === '401'
  ) {
    return {
      type: SyncErrorType.AUTHENTICATION_ERROR,
      message: errorMessage,
      userMessage: 'Your session has expired. Please sign in again to continue syncing.',
      retryable: false,
      originalError: error,
    };
  }

  // Permission errors
  if (
    errorMessage.includes('permission') ||
    errorMessage.includes('forbidden') ||
    errorMessage.includes('403') ||
    errorCode === 'PGRST301' ||
    errorCode === '403'
  ) {
    return {
      type: SyncErrorType.PERMISSION_ERROR,
      message: errorMessage,
      userMessage: 'You don\'t have permission to perform this action. Please check your subscription status.',
      retryable: false,
      originalError: error,
    };
  }

  // Conflict errors
  if (
    errorMessage.includes('conflict') ||
    errorMessage.includes('version') ||
    errorMessage.includes('409') ||
    errorCode === '409'
  ) {
    return {
      type: SyncErrorType.CONFLICT_ERROR,
      message: errorMessage,
      userMessage: 'There was a conflict while syncing. Your changes have been saved locally and will be synced automatically.',
      retryable: true,
      originalError: error,
    };
  }

  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('constraint') ||
    errorCode === '23505' || // PostgreSQL unique violation
    errorCode === '23503' || // PostgreSQL foreign key violation
    errorCode === 'PGRST204'
  ) {
    return {
      type: SyncErrorType.VALIDATION_ERROR,
      message: errorMessage,
      userMessage: 'Some data couldn\'t be synced due to validation errors. Please check your data and try again.',
      retryable: false,
      originalError: error,
    };
  }

  // Database errors
  if (
    errorMessage.includes('database') ||
    errorMessage.includes('SQLite') ||
    errorMessage.includes('table') ||
    errorMessage.includes('column') ||
    errorMessage.includes('constraint')
  ) {
    return {
      type: SyncErrorType.DATABASE_ERROR,
      message: errorMessage,
      userMessage: 'A database error occurred. Your data is safe locally. Please try again or contact support if the issue persists.',
      retryable: true,
      originalError: error,
    };
  }

  // Server errors (5xx)
  if (
    errorMessage.includes('500') ||
    errorMessage.includes('502') ||
    errorMessage.includes('503') ||
    errorMessage.includes('504') ||
    errorCode === '500' ||
    errorCode === '502' ||
    errorCode === '503' ||
    errorCode === '504'
  ) {
    return {
      type: SyncErrorType.SERVER_ERROR,
      message: errorMessage,
      userMessage: 'The server is temporarily unavailable. Your changes are saved locally and will be synced automatically when the server is back online.',
      retryable: true,
      originalError: error,
    };
  }

  // Default/Unknown error
  return {
    type: SyncErrorType.UNKNOWN_ERROR,
    message: errorMessage,
    userMessage: 'An unexpected error occurred during sync. Your changes are saved locally and will be synced automatically.',
    retryable: true,
    originalError: error,
  };
}

/**
 * Get error icon/emoji based on error type
 */
export function getErrorIcon(type: SyncErrorType): string {
  switch (type) {
    case SyncErrorType.NETWORK_ERROR:
      return '📡';
    case SyncErrorType.AUTHENTICATION_ERROR:
      return '🔐';
    case SyncErrorType.PERMISSION_ERROR:
      return '🚫';
    case SyncErrorType.CONFLICT_ERROR:
      return '⚠️';
    case SyncErrorType.VALIDATION_ERROR:
      return '❌';
    case SyncErrorType.SERVER_ERROR:
      return '🔧';
    case SyncErrorType.DATABASE_ERROR:
      return '💾';
    default:
      return '❓';
  }
}

/**
 * Check if error should trigger automatic retry
 */
export function shouldAutoRetry(error: SyncError, attemptCount: number, maxAttempts: number = 3): boolean {
  if (attemptCount >= maxAttempts) {
    return false;
  }

  if (!error.retryable) {
    return false;
  }

  // Don't auto-retry auth/permission errors
  if (
    error.type === SyncErrorType.AUTHENTICATION_ERROR ||
    error.type === SyncErrorType.PERMISSION_ERROR ||
    error.type === SyncErrorType.VALIDATION_ERROR
  ) {
    return false;
  }

  return true;
}

