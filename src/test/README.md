# Testing Guide

This directory contains test utilities and configurations for the fk videoask project.

## Test Structure

```
src/test/
├── setup.ts           # Test environment setup and mocks
├── utils/
│   └── testUtils.tsx  # Custom render functions and test utilities
└── README.md          # This file
```

## Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Component Tests

```typescript
import { render, screen } from '../test/utils/testUtils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### Hook Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '../useMyHook'

describe('useMyHook', () => {
  it('should work correctly', () => {
    const { result } = renderHook(() => useMyHook())
    
    act(() => {
      result.current.doSomething()
    })
    
    expect(result.current.state).toBe('expected')
  })
})
```

## Test Utilities

### Custom Render
Use the custom render function that includes all necessary providers:

```typescript
import { render } from '../test/utils/testUtils'
```

### Mock Data
Use the provided mock data for consistent testing:

```typescript
import { mockUser, mockInterview, mockQuestion } from '../test/utils/testUtils'
```

### Mock Blob Creation
For testing file uploads:

```typescript
import { createMockBlob } from '../test/utils/testUtils'

const videoBlob = createMockBlob('video/webm')
```

## Mocked APIs

The following APIs are automatically mocked in tests:

- **Supabase**: All database and auth operations
- **MediaRecorder**: Video recording functionality
- **getUserMedia**: Camera/microphone access
- **Clipboard API**: Copy to clipboard functionality
- **URL.createObjectURL**: Blob URL creation

## Best Practices

1. **Test user behavior**, not implementation details
2. **Use semantic queries** (getByRole, getByLabelText)
3. **Test accessibility** with proper ARIA attributes
4. **Mock external dependencies** but keep business logic real
5. **Write descriptive test names** that explain the expected behavior
6. **Group related tests** with describe blocks
7. **Clean up after tests** (mocks are auto-cleared between tests)

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

Focus on testing critical paths and user interactions rather than achieving 100% coverage.