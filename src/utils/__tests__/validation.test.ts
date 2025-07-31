import { describe, it, expect } from 'vitest'
import { 
  isValidEmail, 
  isValidPassword, 
  isValidTitle, 
  isValidVideoFile,
  sanitizeInput,
  validateFormData
} from '../validation'

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
      expect(isValidEmail('')).toBe(false)
    })

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com'
      expect(isValidEmail(longEmail)).toBe(false)
    })
  })

  describe('isValidPassword', () => {
    it('should validate strong passwords', () => {
      const result = isValidPassword('StrongPass123!')
      expect(result.isValid).toBe(true)
    })

    it('should reject weak passwords', () => {
      const result = isValidPassword('weak')
      expect(result.isValid).toBe(false)
      expect(result.feedback).toBeDefined()
    })

    it('should reject short passwords', () => {
      const result = isValidPassword('12345')
      expect(result.isValid).toBe(false)
    })
  })

  describe('isValidTitle', () => {
    it('should validate proper titles', () => {
      expect(isValidTitle('Valid Title')).toBe(true)
      expect(isValidTitle('A')).toBe(true)
    })

    it('should reject empty or whitespace-only titles', () => {
      expect(isValidTitle('')).toBe(false)
      expect(isValidTitle('   ')).toBe(false)
    })

    it('should reject titles that are too long', () => {
      const longTitle = 'a'.repeat(201)
      expect(isValidTitle(longTitle)).toBe(false)
    })
  })

  describe('isValidVideoFile', () => {
    it('should validate correct video files', () => {
      const file = new File(['video data'], 'test.mp4', { type: 'video/mp4' })
      const result = isValidVideoFile(file)
      expect(result.isValid).toBe(true)
    })

    it('should reject files that are too large', () => {
      const largeFile = new File(['x'.repeat(101 * 1024 * 1024)], 'large.mp4', { type: 'video/mp4' })
      const result = isValidVideoFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('too large')
    })

    it('should reject unsupported file types', () => {
      const file = new File(['data'], 'test.txt', { type: 'text/plain' })
      const result = isValidVideoFile(file)
      expect(result.isValid).toBe(false)
      expect(result.error).toContain('format')
    })
  })

  describe('sanitizeInput', () => {
    it('should remove potentially dangerous HTML', () => {
      expect(sanitizeInput('<script>alert("xss")</script>')).toBe('alert("xss")')
      expect(sanitizeInput('<img src="x" onerror="alert(1)">')).toBe('')
    })

    it('should preserve safe text', () => {
      expect(sanitizeInput('Hello World!')).toBe('Hello World!')
      expect(sanitizeInput('Test & Company')).toBe('Test & Company')
    })
  })

  describe('validateFormData', () => {
    it('should validate and sanitize form data', () => {
      const data = {
        email: 'test@example.com',
        title: 'Valid Title',
        description: 'Valid description'
      }
      
      const result = validateFormData(data)
      expect(result.isValid).toBe(true)
      expect(result.errors).toEqual({})
      expect(result.sanitized).toBeDefined()
    })

    it('should return errors for invalid data', () => {
      const data = {
        email: 'invalid-email',
        title: '',
        password: '123'
      }
      
      const result = validateFormData(data)
      expect(result.isValid).toBe(false)
      expect(Object.keys(result.errors).length).toBeGreaterThan(0)
    })
  })
})