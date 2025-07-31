import React, { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const Toast: React.FC<ToastProps> = React.memo(({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white'
      case 'error':
        return 'bg-red-600 text-white'
      case 'info':
        return 'bg-blue-600 text-white'
      default:
        return 'bg-green-600 text-white'
    }
  }

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <X size={20} />
      case 'info':
        return <CheckCircle size={20} />
      default:
        return <CheckCircle size={20} />
    }
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className={`${getToastStyles()} px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 min-w-[300px]`}>
        <span aria-hidden="true">{getIcon()}</span>
        <span className="font-medium flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Close notification"
          type="button"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
})

Toast.displayName = 'Toast'