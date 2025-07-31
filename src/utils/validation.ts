import { APP_CONFIG, ERROR_MESSAGES } from './constants'
import { sanitizeHtml, sanitizeSql, validatePasswordStrength } from './security'

/**
 * Validates environment variables on application startup
 * @throws Error if required environment variables are missing
 */
export const validateEnvironment = (): void => {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ]

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }

  // Validate URL format
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error('VITE_SUPABASE_URL must be a valid URL')
  }

  console.log('✅ Environment validation passed')
}

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= APP_CONFIG.MAX_EMAIL_LENGTH
}

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): { isValid: boolean; feedback?: string[] } => {
  const strength = validatePasswordStrength(password)
  return {
    isValid: password.length >= APP_CONFIG.MIN_PASSWORD_LENGTH && strength.isValid,
    feedback: strength.feedback
  }
}

/**
 * Validates interview title
 */
export const isValidTitle = (title: string): boolean => {
  return title.trim().length > 0 && title.length <= APP_CONFIG.MAX_TITLE_LENGTH
}

/**
 * Validates interview description
 */
export const isValidDescription = (description: string): boolean => {
  return description.length <= APP_CONFIG.MAX_DESCRIPTION_LENGTH
}

/**
 * Validates video file
 */
export const isValidVideoFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file size
  if (file.size > APP_CONFIG.MAX_FILE_SIZE) {
    return { isValid: false, error: ERROR_MESSAGES.FILE_TOO_LARGE }
  }

  // Check file type
  if (!APP_CONFIG.SUPPORTED_VIDEO_FORMATS.includes(file.type)) {
    return { isValid: false, error: ERROR_MESSAGES.UNSUPPORTED_FORMAT }
  }

  return { isValid: true }
}

/**
 * Sanitizes user input to prevent XSS
 */
export const sanitizeInput = (input: string): string => {
  return sanitizeHtml(input)
}

/**
 * Validates and sanitizes form data
 */
export const validateFormData = (data: Record<string, unknown>): { 
  isValid: boolean; 
  errors: Record<string, string>;
  sanitized: Record<string, unknown>;
} => {
  const errors: Record<string, string> = {}
  const sanitized: Record<string, unknown> = {}

  // Validate and sanitize each field
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value)
      
      // Field-specific validation
      switch (key) {
        case 'firstName':
        case 'lastName':
          if (!value.trim()) {
            errors[key] = ERROR_MESSAGES.REQUIRED_FIELD
          }
          break
        case 'email':
          if (!isValidEmail(value)) {
            errors[key] = ERROR_MESSAGES.INVALID_EMAIL
          }
          break
        case 'password':
          {const passwordValidation = isValidPassword(value)
          if (!passwordValidation.isValid) {
            errors[key] = passwordValidation.feedback?.join(', ') || ERROR_MESSAGES.WEAK_PASSWORD
          }}
          break
        case 'title':
          if (!isValidTitle(value)) {
            errors[key] = value.trim().length === 0 
              ? ERROR_MESSAGES.REQUIRED_FIELD 
              : ERROR_MESSAGES.TITLE_TOO_LONG
          }
          break
        case 'description':
          if (!isValidDescription(value)) {
            errors[key] = ERROR_MESSAGES.DESCRIPTION_TOO_LONG
          }
          break
      }
    } else {
      sanitized[key] = value
    }
    
    // Additional sanitization for text fields
    if (typeof value === 'string' && ['title', 'description', 'question_text'].includes(key)) {
      sanitized[key] = sanitizeSql(sanitized[key])
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized
  }
}