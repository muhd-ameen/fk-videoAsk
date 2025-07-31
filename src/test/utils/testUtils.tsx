import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ErrorBoundary } from '../../components/ErrorBoundary'

// Test data mocks
export const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockInterview = {
  id: 'test-interview-id',
  title: 'Test Interview',
  description: 'Test Description',
  unique_url: 'test-unique-url',
  recruiter_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
}

export const mockQuestion = {
  id: 'test-question-id',
  interview_id: 'test-interview-id',
  question_text: 'Test Question',
  video_url: 'https://example.com/video.mp4',
  order_index: 0,
  created_at: '2024-01-01T00:00:00Z',
}

export const createMockBlob = (type = 'video/webm') => {
  return new Blob(['mock video data'], { type })
}

// Provider wrapper for tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </ErrorBoundary>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }

// Re-export everything from React Testing Library
export * from '@testing-library/react'