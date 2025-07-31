import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useToast } from '../useToast'

describe('useToast Hook', () => {
  it('should initialize with default state', () => {
    const { result } = renderHook(() => useToast())

    expect(result.current.toast.isVisible).toBe(false)
    expect(result.current.toast.message).toBe('')
    expect(result.current.toast.type).toBe('success')
  })

  it('should show toast with message', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Test message', 'success')
    })

    expect(result.current.toast.isVisible).toBe(true)
    expect(result.current.toast.message).toBe('Test message')
    expect(result.current.toast.type).toBe('success')
  })

  it('should show error toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Error message', 'error')
    })

    expect(result.current.toast.isVisible).toBe(true)
    expect(result.current.toast.message).toBe('Error message')
    expect(result.current.toast.type).toBe('error')
  })

  it('should hide toast', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Test message')
    })

    expect(result.current.toast.isVisible).toBe(true)

    act(() => {
      result.current.hideToast()
    })

    expect(result.current.toast.isVisible).toBe(false)
  })

  it('should default to success type', () => {
    const { result } = renderHook(() => useToast())

    act(() => {
      result.current.showToast('Default type message')
    })

    expect(result.current.toast.type).toBe('success')
  })
})