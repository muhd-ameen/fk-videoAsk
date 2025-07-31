import { ERROR_MESSAGES } from './constants'

/**
 * Custom error types for better error handling
 */
export class NetworkError extends Error {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = ERROR_MESSAGES.INVALID_CREDENTIALS) {
    super(message)
    this.name = 'AuthenticationError'
  }
}

export class VideoRecordingError extends Error {
  constructor(message: string = ERROR_MESSAGES.RECORDING_FAILED) {
    super(message)
    this.name = 'VideoRecordingError'
  }
}

export class UploadError extends Error {
  constructor(message: string = ERROR_MESSAGES.UPLOAD_FAILED) {
    super(message)
    this.name = 'UploadError'
  }
}

/**
 * Handles and categorizes different types of errors
 */
export const handleError = (error: unknown): string => {
  console.error('Error occurred:', error)

  if (error instanceof NetworkError) {
    return error.message
  }

  if (error instanceof ValidationError) {
    return error.message
  }

  if (error instanceof AuthenticationError) {
    return error.message
  }

  if (error instanceof VideoRecordingError) {
    return error.message
  }

  if (error instanceof UploadError) {
    return error.message
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'message' in error) {
    const supabaseError = error as { message: string; code?: string }
    
    switch (supabaseError.code) {
      case 'PGRST116':
        return ERROR_MESSAGES.INTERVIEW_NOT_FOUND
      case '23505':
        return 'This item already exists.'
      case '42501':
        return ERROR_MESSAGES.PERMISSION_DENIED
      default:
        return supabaseError.message || ERROR_MESSAGES.UNEXPECTED_ERROR
    }
  }

  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  return ERROR_MESSAGES.UNEXPECTED_ERROR
}

/**
 * Logs errors for monitoring (can be extended with external services)
 */
export const logError = (error: unknown, context?: Record<string, unknown>): void => {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href
  }

  console.error('Error logged:', errorInfo)

  // TODO: Send to external monitoring service (Sentry, LogRocket, etc.)
  // Example: Sentry.captureException(error, { extra: context })
}

/**
 * Retry mechanism for failed operations
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error
      
      if (attempt === maxAttempts) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError
}

/**
 * Timeout wrapper for promises
 */
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(ERROR_MESSAGES.REQUEST_TIMEOUT)), timeoutMs)
    )
  ])
}