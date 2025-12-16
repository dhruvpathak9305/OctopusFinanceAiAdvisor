/**
 * =============================================================================
 * RETRY MANAGER - Exponential Backoff Retry Logic
 * =============================================================================
 * 
 * Manages retry logic for failed sync operations with exponential backoff
 */

import { formatSyncError, SyncError, shouldAutoRetry } from './syncErrorHandler';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number; // milliseconds
  maxDelay?: number; // milliseconds
  backoffMultiplier?: number;
  jitter?: boolean; // Add random jitter to prevent thundering herd
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2,
  jitter: true,
};

/**
 * Calculate delay for next retry attempt
 */
function calculateDelay(attempt: number, options: Required<RetryOptions>): number {
  // Exponential backoff: delay = initialDelay * (multiplier ^ (attempt - 1))
  const exponentialDelay = options.initialDelay * Math.pow(options.backoffMultiplier, attempt - 1);
  
  // Cap at max delay
  const delay = Math.min(exponentialDelay, options.maxDelay);
  
  // Add jitter (±20%) to prevent synchronized retries
  if (options.jitter) {
    const jitterAmount = delay * 0.2 * (Math.random() * 2 - 1); // Random between -20% and +20%
    return Math.max(0, delay + jitterAmount);
  }
  
  return delay;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const syncError = formatSyncError(error);

      // Check if we should retry
      if (!shouldAutoRetry(syncError, attempt, opts.maxAttempts)) {
        throw error;
      }

      // Don't wait after last attempt
      if (attempt < opts.maxAttempts) {
        const delay = calculateDelay(attempt, opts);
        console.log(`Retry attempt ${attempt}/${opts.maxAttempts} after ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

/**
 * Schedule a retry for a failed sync job
 */
export async function scheduleRetry(
  jobId: number,
  delay: number,
  onRetry: () => Promise<void>
): Promise<void> {
  setTimeout(async () => {
    try {
      await onRetry();
    } catch (error) {
      console.error(`Retry failed for job ${jobId}:`, error);
      // Could schedule another retry here if needed
    }
  }, delay);
}

/**
 * Get retry delay for a specific attempt
 */
export function getRetryDelay(attempt: number, options: RetryOptions = {}): number {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  return calculateDelay(attempt, opts);
}

