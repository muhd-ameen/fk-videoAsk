import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock environment variables for tests
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(),
        })),
        order: vi.fn(),
      })),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'mock-url' } })),
      })),
    },
  },
}))

// Mock MediaRecorder for video recording tests
global.MediaRecorder = class MockMediaRecorder extends EventTarget implements MediaRecorder {
  state = 'inactive'
  stream: MediaStream
  mimeType = 'video/webm'
  videoBitsPerSecond = 0
  audioBitsPerSecond = 0
  ondataavailable: ((this: MediaRecorder, ev: BlobEvent) => void) | null = null
  onerror: ((this: MediaRecorder, ev: MediaRecorderErrorEvent) => void) | null = null
  onpause: ((this: MediaRecorder, ev: Event) => void) | null = null
  onresume: ((this: MediaRecorder, ev: Event) => void) | null = null
  onstart: ((this: MediaRecorder, ev: Event) => void) | null = null
  onstop: ((this: MediaRecorder, ev: Event) => void) | null = null
  
  constructor(stream: MediaStream) {
    super()
    this.stream = stream
  }
  
  start() {
    this.state = 'recording'
    setTimeout(() => {
      this.dispatchEvent(new Event('dataavailable'))
    }, 100)
  }
  
  stop() {
    this.state = 'inactive'
    setTimeout(() => {
      this.dispatchEvent(new Event('stop'))
    }, 100)
  }
  
  pause() {
    this.state = 'paused'
  }
  
  resume() {
    this.state = 'recording'
  }
  
  requestData() {
    // Mock implementation
  }
  
  static isTypeSupported() {
    return true
  }
}

// Mock getUserMedia
Object.defineProperty(navigator, 'mediaDevices', {
  writable: true,
  value: {
    getUserMedia: vi.fn(() => Promise.resolve({
      getTracks: () => [{ stop: vi.fn() }],
    })),
  },
})

// Mock clipboard API
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  value: {
    writeText: vi.fn(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url')
global.URL.revokeObjectURL = vi.fn()