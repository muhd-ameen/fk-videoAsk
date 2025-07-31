import React, { useState } from 'react'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { RateLimiter } from '../utils/security'
import { validateFormData } from '../utils/validation'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onToggleMode: () => void
}

export const AuthForm: React.FC<AuthFormProps> = React.memo(({ mode, onToggleMode }) => {
  // Rate limiting for auth attempts
  const rateLimiter = new RateLimiter()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Rate limiting check
    const clientId = `auth_${email || 'anonymous'}`
    if (!rateLimiter.isAllowed(clientId, 5, 300000)) { // 5 attempts per 5 minutes
      const remainingTime = Math.ceil(rateLimiter.getRemainingTime(clientId) / 1000 / 60)
      setError(`Too many attempts. Please try again in ${remainingTime} minutes.`)
      return
    }
    
    // Validate and sanitize form data
    const { isValid, errors, sanitized } = validateFormData({ email, password })
    
    if (!isValid) {
      setValidationErrors(errors)
      setError('Please fix the validation errors below')
      return
    }
    
    setLoading(true)
    setError(null)
    setValidationErrors({})

    try {
      const { error } = mode === 'login' 
        ? await signIn(sanitized.email, sanitized.password)
        : await signUp(sanitized.email, sanitized.password)

      if (error) {
        setError(error.message)
      } else if (mode === 'signup') {
        setError('Check your email for verification link')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="fk videoask logo" 
              className="w-full h-full object-contain"
            />
          </div>
            <h1 className="text-3xl font-bold text-gray-900">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
          </div>
          <p className="text-gray-600 mt-3 text-lg">
            {mode === 'login' 
              ? 'Sign in to your recruiter account' 
              : 'Sign up as a recruiter to get started'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-describedby={error || validationErrors.email ? "auth-error email-error" : undefined}
              aria-invalid={error || validationErrors.email ? "true" : "false"}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          {validationErrors.email && (
            <p id="email-error" className="text-red-600 text-sm mt-1" role="alert">
              {validationErrors.email}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} aria-hidden="true" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-describedby={error || validationErrors.password ? "auth-error password-error" : undefined}
              aria-invalid={error || validationErrors.password ? "true" : "false"}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {validationErrors.password && (
            <p id="password-error" className="text-red-600 text-sm mt-1" role="alert">
              {validationErrors.password}
            </p>
          )}
        </div>

        {error && (
          <div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl"
            role="alert"
            id="auth-error"
            aria-live="polite"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          aria-describedby={loading ? "loading-status" : undefined}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
        >
          <span id="loading-status">
            {loading ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
          </span>
        </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={onToggleMode}
              type="button"
              className="text-blue-600 hover:text-purple-600 font-semibold transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
    </>
  )
})

AuthForm.displayName = 'AuthForm'