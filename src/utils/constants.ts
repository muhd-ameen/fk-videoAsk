// Application Constants
export const APP_CONFIG = {
  // Video Recording Limits
  MAX_QUESTION_DURATION: 120, // 2 minutes in seconds
  MAX_RESPONSE_DURATION: 60,  // 1 minute in seconds
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB in bytes
  
  // Supported Video Formats
  SUPPORTED_VIDEO_FORMATS: ['video/webm', 'video/mp4'],
  SUPPORTED_FILE_EXTENSIONS: ['.webm', '.mp4'],
  
  // UI Configuration
  TOAST_DURATION: 3000, // 3 seconds
  MODAL_ANIMATION_DURATION: 300, // 300ms
  
  // API Configuration
  REQUEST_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Validation Rules
  MIN_PASSWORD_LENGTH: 6,
  MAX_TITLE_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_EMAIL_LENGTH: 254,
  
  // Storage Configuration
  STORAGE_BUCKET: 'videos',
  
  // URL Generation
  UNIQUE_URL_LENGTH: 30,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  REQUEST_TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
  
  // Authentication Errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  WEAK_PASSWORD: 'Password must be at least 6 characters long.',
  
  // Video Recording Errors
  CAMERA_ACCESS_DENIED: 'Camera and microphone access is required for video recording.',
  RECORDING_FAILED: 'Video recording failed. Please try again.',
  UPLOAD_FAILED: 'Video upload failed. Please check your connection and try again.',
  FILE_TOO_LARGE: 'Video file is too large. Maximum size is 100MB.',
  UNSUPPORTED_FORMAT: 'Unsupported video format. Please use WebM or MP4.',
  
  // Form Validation Errors
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  TITLE_TOO_LONG: 'Title must be less than 200 characters.',
  DESCRIPTION_TOO_LONG: 'Description must be less than 1000 characters.',
  
  // Interview Errors
  INTERVIEW_NOT_FOUND: 'Interview not found or has been removed.',
  INTERVIEW_CREATION_FAILED: 'Failed to create interview. Please try again.',
  RESPONSE_SUBMISSION_FAILED: 'Failed to submit response. Please try again.',
  
  // Generic Errors
  UNEXPECTED_ERROR: 'An unexpected error occurred. Please try again.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  INTERVIEW_CREATED: 'Interview created successfully!',
  INTERVIEW_UPDATED: 'Interview updated successfully!',
  INTERVIEW_DELETED: 'Interview deleted successfully!',
  RESPONSE_SUBMITTED: 'Response submitted successfully!',
  LINK_COPIED: 'Interview link copied to clipboard!',
  PROFILE_UPDATED: 'Profile updated successfully!',
} as const

// Application Routes
export const ROUTES = {
  HOME: '/',
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  INTERVIEW: '/interview/:uniqueUrl',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'videoask_user_preferences',
  DRAFT_INTERVIEW: 'videoask_draft_interview',
  LAST_VISIT: 'videoask_last_visit',
} as const