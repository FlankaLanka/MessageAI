// Retry utility for handling network and temporary errors

export interface RetryOptions {
  maxAttempts?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export class RetryHandler {
  private static defaultOptions: Required<RetryOptions> = {
    maxAttempts: 3,
    baseDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffMultiplier: 2
  };

  // Retry a function with exponential backoff
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> {
    const opts = { ...this.defaultOptions, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on the last attempt
        if (attempt === opts.maxAttempts) {
          throw lastError;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          opts.baseDelay * Math.pow(opts.backoffMultiplier, attempt - 1),
          opts.maxDelay
        );

        await this.delay(delay);
      }
    }

    throw lastError!;
  }

  // Simple delay function
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Check if an error is retryable
  static isRetryableError(error: any): boolean {
    const retryableCodes = [
      'auth/network-request-failed',
      'auth/timeout',
      'auth/too-many-requests'
    ];
    
    return retryableCodes.includes(error?.code) || 
           error?.message?.includes('network') ||
           error?.message?.includes('timeout');
  }
}
