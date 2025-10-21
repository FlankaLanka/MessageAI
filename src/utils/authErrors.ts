// Authentication error handling utilities

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  canRetry: boolean;
  action?: string;
}

export class AuthErrorHandler {
  // Map Firebase auth error codes to user-friendly messages
  private static errorMap: Record<string, Omit<AuthError, 'code'>> = {
    'auth/invalid-credential': {
      message: 'Invalid email or password',
      userFriendlyMessage: 'The email or password you entered is incorrect. Please check your credentials and try again.',
      canRetry: true,
      action: 'Check your email and password'
    },
    'auth/user-not-found': {
      message: 'User not found',
      userFriendlyMessage: 'No account found with this email address. Please create a new account or check your email.',
      canRetry: false,
      action: 'Create a new account'
    },
    'auth/wrong-password': {
      message: 'Wrong password',
      userFriendlyMessage: 'The password you entered is incorrect. Please try again.',
      canRetry: true,
      action: 'Try again with the correct password'
    },
    'auth/invalid-email': {
      message: 'Invalid email',
      userFriendlyMessage: 'The email address you entered is not valid. Please check the format and try again.',
      canRetry: true,
      action: 'Check your email format'
    },
    'auth/user-disabled': {
      message: 'User account disabled',
      userFriendlyMessage: 'This account has been disabled. Please contact support for assistance.',
      canRetry: false,
      action: 'Contact support'
    },
    'auth/too-many-requests': {
      message: 'Too many requests',
      userFriendlyMessage: 'Too many failed sign-in attempts. Please wait a few minutes before trying again.',
      canRetry: true,
      action: 'Wait and try again'
    },
    'auth/network-request-failed': {
      message: 'Network error',
      userFriendlyMessage: 'Unable to connect to the server. Please check your internet connection and try again.',
      canRetry: true,
      action: 'Check your internet connection'
    },
    'auth/operation-not-allowed': {
      message: 'Operation not allowed',
      userFriendlyMessage: 'This sign-in method is not enabled. Please contact support.',
      canRetry: false,
      action: 'Contact support'
    },
    'auth/weak-password': {
      message: 'Weak password',
      userFriendlyMessage: 'The password is too weak. Please choose a stronger password with at least 6 characters.',
      canRetry: true,
      action: 'Choose a stronger password'
    },
    'auth/email-already-in-use': {
      message: 'Email already in use',
      userFriendlyMessage: 'An account with this email already exists. Please sign in instead or use a different email.',
      canRetry: false,
      action: 'Sign in or use different email'
    },
    'auth/requires-recent-login': {
      message: 'Recent login required',
      userFriendlyMessage: 'For security reasons, please sign in again before performing this action.',
      canRetry: true,
      action: 'Sign in again'
    }
  };

  // Get user-friendly error information
  static getErrorInfo(error: any): AuthError {
    const errorCode = error?.code || 'unknown';
    const defaultError = {
      message: error?.message || 'An unknown error occurred',
      userFriendlyMessage: 'Something went wrong. Please try again.',
      canRetry: true,
      action: 'Try again'
    };

    const errorInfo = this.errorMap[errorCode] || defaultError;

    return {
      code: errorCode,
      ...errorInfo
    };
  }

  // Check if error is network-related
  static isNetworkError(error: any): boolean {
    const networkErrorCodes = [
      'auth/network-request-failed',
      'auth/timeout',
      'auth/too-many-requests'
    ];
    return networkErrorCodes.includes(error?.code);
  }

  // Check if error is credential-related
  static isCredentialError(error: any): boolean {
    const credentialErrorCodes = [
      'auth/invalid-credential',
      'auth/wrong-password',
      'auth/user-not-found'
    ];
    return credentialErrorCodes.includes(error?.code);
  }

  // Get retry suggestion
  static getRetrySuggestion(error: any): string {
    const errorInfo = this.getErrorInfo(error);
    
    if (errorInfo.canRetry) {
      return errorInfo.action || 'Please try again';
    }
    
    return errorInfo.action || 'Please contact support';
  }
}
