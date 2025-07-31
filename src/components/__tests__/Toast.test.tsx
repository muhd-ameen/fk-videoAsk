import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../../src/test/utils/testUtils'
import userEvent from '@testing-library/user-event'
import { Toast } from '../Toast'

describe('Toast Component', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render success toast', () => {
    render(
      <Toast
        message="Success message"
        type="success"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Success message')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('should render error toast', () => {
    render(
      <Toast
        message="Error message"
        type="error"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    expect(screen.getByText('Error message')).toBeInTheDocument()
  })

  it('should not render when not visible', () => {
    render(
      <Toast
        message="Hidden message"
        type="success"
        isVisible={false}
        onClose={mockOnClose}
      />
    )

    expect(screen.queryByText('Hidden message')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    
    render(
      <Toast
        message="Test message"
        type="success"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const closeButton = screen.getByLabelText('Close notification')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('should auto-close after duration', async () => {
    render(
      <Toast
        message="Auto close message"
        type="success"
        isVisible={true}
        onClose={mockOnClose}
        duration={100}
      />
    )

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    }, { timeout: 200 })
  })

  it('should have proper accessibility attributes', () => {
    render(
      <Toast
        message="Accessible message"
        type="success"
        isVisible={true}
        onClose={mockOnClose}
      />
    )

    const toast = screen.getByRole('alert')
    expect(toast).toHaveAttribute('aria-live', 'assertive')
    expect(toast).toHaveAttribute('aria-atomic', 'true')
  })
})