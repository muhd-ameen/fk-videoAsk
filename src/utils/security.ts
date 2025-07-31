/**
 * Security utilities for input sanitization and validation
 */

// XSS Prevention
export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

// SQL Injection Prevention (for display purposes)
export const sanitizeSql = (input: string): string => {
  return input
    .replace(/['";\\]/g, '') // Remove SQL special characters
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments
    .trim()
}

// File name sanitization
export const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .substring(0, 255) // Limit length
}

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// Rate limiting helper
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map()

  isAllowed(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= maxAttempts) {
      return false
    }

    record.count++
    return true
  }

  getRemainingTime(key: string): number {
    const record = this.attempts.get(key)
    if (!record) return 0
    return Math.max(0, record.resetTime - Date.now())
  }
}

// Content Security Policy helpers
export const CSP_DIRECTIVES = {
  defaultSrc: ["'self'"],
  scriptSrc: ["'self'", "'unsafe-inline'"], // Vite needs unsafe-inline in dev
  styleSrc: ["'self'", "'unsafe-inline'"],
  imgSrc: ["'self'", "data:", "https:"],
  mediaSrc: ["'self'", "blob:", "https:"],
  connectSrc: ["'self'", "https:"],
  fontSrc: ["'self'", "https:"],
  objectSrc: ["'none'"],
  baseUri: ["'self'"],
  formAction: ["'self'"],
  frameAncestors: ["'none'"],
  upgradeInsecureRequests: []
}

// Generate CSP header value
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_DIRECTIVES)
    .map(([directive, sources]) => {
      const kebabCase = directive.replace(/([A-Z])/g, '-$1').toLowerCase()
      return `${kebabCase} ${sources.join(' ')}`
    })
    .join('; ')
}

// Secure random string generation
export const generateSecureToken = (length: number = 32): string => {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Password strength validation
export const validatePasswordStrength = (password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} => {
  const feedback: string[] = []
  let score = 0

  if (password.length >= 8) score += 1
  else feedback.push('Use at least 8 characters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('Include lowercase letters')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('Include uppercase letters')

  if (/\d/.test(password)) score += 1
  else feedback.push('Include numbers')

  if (/[^a-zA-Z\d]/.test(password)) score += 1
  else feedback.push('Include special characters')

  if (password.length >= 12) score += 1

  return {
    isValid: score >= 3,
    score,
    feedback
  }
}

// File upload security validation
export const validateFileUpload = (file: File): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ['video/webm', 'video/mp4']
  const allowedExtensions = ['.webm', '.mp4']

  // Check file size
  if (file.size > maxSize) {
    errors.push('File size exceeds 100MB limit')
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type. Only WebM and MP4 are allowed')
  }

  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedExtensions.includes(extension)) {
    errors.push('Invalid file extension')
  }

  // Check for suspicious file names
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    errors.push('Invalid file name')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}