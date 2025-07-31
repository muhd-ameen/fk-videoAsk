import React from 'react'
import { Play, Square, RotateCcw, Video } from 'lucide-react'
import { useVideoRecorder } from '../hooks/useVideoRecorder'

interface VideoRecorderProps {
  maxDuration?: number
  onVideoReady?: (blob: Blob) => void
  onRecordingStateChange?: (isRecording: boolean) => void
  className?: string
}

export const VideoRecorder: React.FC<VideoRecorderProps> = React.memo(({ 
  maxDuration = 120, 
  onVideoReady,
  onRecordingStateChange,
  className = "" 
}) => {
  const {
    isRecording,
    recordingTime,
    videoBlob,
    videoUrl,
    previewRef,
    startRecording,
    stopRecording,
    resetRecording,
  } = useVideoRecorder(maxDuration)

  const handleStartRecording = async () => {
    try {
      await startRecording()
      if (onRecordingStateChange) {
        onRecordingStateChange(true)
      }
    } catch (error) {
      console.error('Recording start failed:', error)
      alert('Could not access camera and microphone. Please check permissions.')
    }
  }

  const handleVideoReady = () => {
    if (videoBlob && onVideoReady) {
      onVideoReady(videoBlob)
    }
    if (onRecordingStateChange) {
      onRecordingStateChange(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`} role="region" aria-label="Video recording interface">
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl aspect-video flex items-center justify-center relative overflow-hidden shadow-lg"
        role="img"
        aria-label={videoUrl ? "Recorded video preview" : isRecording ? "Live video recording" : "Video recording area"}
      >
        {isRecording ? (
          <div className="absolute inset-0 bg-red-600 opacity-30 animate-pulse" />
        ) : null}
        
        {videoUrl ? (
          <video 
            src={videoUrl} 
            controls 
            className="w-full h-full object-cover rounded-xl"
            onLoadedData={handleVideoReady}
            aria-label="Recorded video playback"
          />
        ) : isRecording ? (
          <video 
            ref={previewRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-xl absolute inset-0"
            aria-label="Live video preview"
          />
        ) : (
          <div className="text-center text-white">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 inline-block">
              <Video size={48} />
            </div>
            <p className="text-lg font-medium">Ready to record</p>
            <p className="text-sm opacity-75">Click start to begin recording</p>
          </div>
        )}
        
        {isRecording && (
          <div 
            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-full font-mono text-sm font-bold shadow-lg flex items-center space-x-2"
            role="status"
            aria-live="polite"
            aria-label={`Recording in progress: ${recordingTime}`}
          >
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span>REC {recordingTime}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!isRecording && !videoUrl && (
          <button
            onClick={handleStartRecording}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 font-medium"
            aria-label="Start video recording"
            type="button"
          >
            <Play size={18} />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <button
            onClick={stopRecording}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            aria-label={`Stop recording (${recordingTime} elapsed)`}
            type="button"
          >
            <Square size={18} />
            <span>Stop Recording ({recordingTime})</span>
          </button>
        )}

        {videoUrl && (
          <button
            onClick={resetRecording}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
            aria-label="Record a new video"
            type="button"
          >
            <RotateCcw size={18} />
            <span>Record Again</span>
          </button>
        )}
      </div>

      {videoUrl && (
        <div className="text-center" role="status" aria-live="polite">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-medium">✓ Recording completed successfully!</p>
            <p className="text-green-600 text-sm mt-1">You can play the video above or record again if needed.</p>
          </div>
        </div>
      )}
    </div>
  )
})

VideoRecorder.displayName = 'VideoRecorder'