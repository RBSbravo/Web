// Rate limiting utilities for frontend applications
export class RateLimitHandler {
  constructor() {
    this.rateLimitInfo = null;
    this.retryTimers = new Map();
  }

  // Handle rate limit error from API response
  handleRateLimitError(error) {
    // Check for rate limit in multiple ways (like desktop app)
    const isRateLimited = error.response?.status === 429 || 
                         error.message?.includes('429') || 
                         error.message?.includes('Too many requests') ||
                         error.message?.includes('rate limit');
    
    if (isRateLimited) {
      const rateLimitData = {
        error: error.response?.data?.error || error.message || 'Too many requests',
        retryAfter: error.response?.data?.retryAfter || '15 minutes',
        limit: error.response?.headers?.['ratelimit-limit'] || null,
        remaining: error.response?.headers?.['ratelimit-remaining'] || null,
        reset: error.response?.headers?.['ratelimit-reset'] || null
      };

      this.rateLimitInfo = rateLimitData;
      
      // Calculate retry time
      const retryTime = this.calculateRetryTime(rateLimitData);
      
      return {
        isRateLimited: true,
        message: rateLimitData.error,
        retryAfter: rateLimitData.retryAfter,
        retryTime: retryTime,
        limit: rateLimitData.limit,
        remaining: rateLimitData.remaining,
        reset: rateLimitData.reset,
        rateLimitData: rateLimitData // Include the full rate limit data
      };
    }
    
    return { isRateLimited: false };
  }

  // Calculate retry time in milliseconds
  calculateRetryTime(rateLimitData) {
    if (!rateLimitData) {
      return 15 * 60 * 1000; // Default 15 minutes
    }
    
    if (rateLimitData.reset) {
      const resetTime = parseInt(rateLimitData.reset) * 1000;
      const currentTime = Date.now();
      return Math.max(0, resetTime - currentTime);
    }
    
    // Fallback to parsing retryAfter text (like desktop app)
    if (rateLimitData.retryAfter) {
      const retryText = rateLimitData.retryAfter.toLowerCase();
      if (retryText.includes('minute')) {
        const minutes = parseInt(retryText.match(/\d+/)?.[0] || '15');
        return minutes * 60 * 1000;
      } else if (retryText.includes('hour')) {
        const hours = parseInt(retryText.match(/\d+/)?.[0] || '1');
        return hours * 60 * 60 * 1000;
      }
    }
    
    return 15 * 60 * 1000; // Default 15 minutes
  }

  // Format retry time for display
  formatRetryTime(retryTime) {
    const minutes = Math.ceil(retryTime / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  }

  // Get user-friendly error message
  getUserFriendlyMessage(rateLimitData) {
    if (!rateLimitData || !rateLimitData.error) {
      return 'Too many requests. Please try again later.';
    }
    
    const retryTime = this.calculateRetryTime(rateLimitData);
    const formattedTime = this.formatRetryTime(retryTime);
    
    const errorMessage = rateLimitData.error.toLowerCase();
    
    // Check for authentication/login errors (like desktop app)
    if (errorMessage.includes('authentication') || errorMessage.includes('login')) {
      return `Too many login attempts. Please try again in ${formattedTime}.`;
    } else if (errorMessage.includes('registration') || errorMessage.includes('register')) {
      return `Too many registration attempts. Please try again in ${formattedTime}.`;
    } else if (errorMessage.includes('password reset')) {
      return `Too many password reset attempts. Please try again in ${formattedTime}.`;
    }
    
    return `Too many requests. Please try again in ${formattedTime}.`;
  }

  // Check if we can retry a request
  canRetry(endpoint) {
    const retryTime = this.retryTimers.get(endpoint);
    if (!retryTime) return true;
    
    return Date.now() >= retryTime;
  }

  // Set retry timer for an endpoint
  setRetryTimer(endpoint, retryTime) {
    this.retryTimers.set(endpoint, Date.now() + retryTime);
  }

  // Clear retry timer
  clearRetryTimer(endpoint) {
    this.retryTimers.delete(endpoint);
  }

  // Get remaining time for retry
  getRemainingRetryTime(endpoint) {
    const retryTime = this.retryTimers.get(endpoint);
    if (!retryTime) return 0;
    
    return Math.max(0, retryTime - Date.now());
  }

  // Reset all rate limit info
  reset() {
    this.rateLimitInfo = null;
    this.retryTimers.clear();
  }
}

// Create singleton instance
export const rateLimitHandler = new RateLimitHandler();

// Helper function to handle API errors with rate limiting
export const handleApiError = (error) => {
  console.log('handleApiError called with:', error);
  
  const rateLimitResult = rateLimitHandler.handleRateLimitError(error);
  
  if (rateLimitResult.isRateLimited) {
    return {
      type: 'rate_limit',
      message: rateLimitHandler.getUserFriendlyMessage(rateLimitResult),
      retryAfter: rateLimitResult.retryAfter,
      retryTime: rateLimitResult.retryTime,
      limit: rateLimitResult.limit,
      remaining: rateLimitResult.remaining,
      rateLimitData: rateLimitResult.rateLimitData
    };
  }
  
  // Handle other errors
  if (error.response?.status === 401) {
    return {
      type: 'unauthorized',
      message: 'Invalid credentials. Please check your email and password.'
    };
  }
  
  if (error.response?.status === 400) {
    return {
      type: 'validation',
      message: error.response.data?.error || error.response.data?.message || 'Invalid input. Please check your data.'
    };
  }
  
  if (error.response?.status >= 500) {
    return {
      type: 'server_error',
      message: 'Server error. Please try again later.'
    };
  }
  
  // Handle network errors
  if (!error.response) {
    return {
      type: 'network_error',
      message: 'Network error. Please check your connection and try again.'
    };
  }
  
  // Handle other HTTP errors
  if (error.response?.data?.error) {
    return {
      type: 'api_error',
      message: error.response.data.error
    };
  }
  
  if (error.response?.data?.message) {
    return {
      type: 'api_error',
      message: error.response.data.message
    };
  }
  
  return {
    type: 'unknown',
    message: error.message || 'An unexpected error occurred.'
  };
};

// Helper function to create retry delay
export const createRetryDelay = (attemptNumber) => {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attemptNumber), 30000);
};

// Helper function to check if error is retryable
export const isRetryableError = (error) => {
  const status = error.response?.status;
  return status >= 500 || status === 429 || !status; // Server errors, rate limits, network errors
};

export default rateLimitHandler;
