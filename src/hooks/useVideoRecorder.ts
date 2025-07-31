import { useState, useRef, useCallback } from 'react'
import { VideoRecordingError, logError } from '../utils/errorHandler'
import { APP_CONFIG } from '../utils/constants'

export const useVideoRecorder = (maxDuration: number = 120) => {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = useCallback(async () => {
    try {
      // Check if browser supports required APIs
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new VideoRecordingError('Your browser does not support video recording')
      }

      if (!MediaRecorder.isTypeSupported('video/webm')) {
        throw new VideoRecordingError('Your browser does not support the required video format')
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }, 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      
      streamRef.current = stream
      
      // Use the best available codec
      const options = { mimeType: 'video/webm;codecs=vp9' }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm;codecs=vp8'
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = 'video/webm'
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorderRef.current.onerror = (event) => {
        console.error('MediaRecorder error:', event)
        logError(new VideoRecordingError('Recording failed'), { event })
        stopRecording()
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        
        // Validate file size
        if (blob.size > APP_CONFIG.MAX_FILE_SIZE) {
          logError(new VideoRecordingError('Recording too large'), { size: blob.size })
          alert('Recording is too large. Please try a shorter recording.')
          return
        }
        
        setVideoBlob(blob)
        setVideoUrl(URL.createObjectURL(blob))
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
        
        // Clear preview
        if (previewRef.current) {
          previewRef.current.srcObject = null
        }
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Set up preview after setting recording state
      setTimeout(() => {
        if (previewRef.current && streamRef.current) {
          previewRef.current.srcObject = stream
          previewRef.current.play().catch(error => {
            console.warn('Could not auto-play preview:', error)
          })
        }
      }, 100)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1
          if (newTime >= maxDuration) {
            stopRecording()
          }
          return newTime
        })
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      
      // Log the error for monitoring
      logError(error, { context: 'startRecording' })
      
      // Provide user-friendly error messages
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw new VideoRecordingError('Camera and microphone access was denied. Please allow access and try again.')
          case 'NotFoundError':
            throw new VideoRecordingError('No camera or microphone found. Please connect a device and try again.')
          case 'NotReadableError':
            throw new VideoRecordingError('Camera or microphone is already in use by another application.')
          case 'OverconstrainedError':
            throw new VideoRecordingError('Camera settings are not supported. Please try again.')
          default:
            throw new VideoRecordingError('Could not access camera and microphone. Please check your device settings.')
        }
      }
      
      throw error instanceof VideoRecordingError ? error : new VideoRecordingError()
    }
  }, [maxDuration])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const resetRecording = useCallback(() => {
    try {
      // Clean up any existing resources
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl)
      }
      
    setVideoBlob(null)
    setVideoUrl(null)
    setRecordingTime(0)
    setIsRecording(false)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    
    if (previewRef.current) {
      previewRef.current.srcObject = null
    }
    } catch (error) {
      logError(error, { context: 'resetRecording' })
    }
  }, [videoUrl])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRecording,
    recordingTime: formatTime(recordingTime),
    videoBlob,
    videoUrl,
    previewRef,
    startRecording,
    stopRecording,
    resetRecording,
  }
}