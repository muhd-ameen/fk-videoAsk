import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Send, CheckCircle, Mail, Video, Clock, User, X, Lightbulb } from 'lucide-react'
import { VideoRecorder } from './VideoRecorder'
import { supabase } from '../lib/supabase'
import { Interview, InterviewQuestion, QuestionResponse } from '../types'
import { validateFormData } from '../utils/validation'
import { sanitizeFileName, validateFileUpload } from '../utils/security'

export const CandidateView: React.FC = () => {
  const { uniqueUrl } = useParams<{ uniqueUrl: string }>()
  const [interview, setInterview] = useState<Interview | null>(null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [showTipDialog, setShowTipDialog] = useState(false)
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [currentVideoBlob, setCurrentVideoBlob] = useState<Blob | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadInterview = async () => {
      if (!uniqueUrl) return

      try {
        // Load interview
        const { data: interviewData, error: interviewError } = await supabase
          .from('interviews')
          .select('*')
          .eq('unique_url', uniqueUrl)
          .single()

        if (interviewError) throw interviewError

        // Load questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('interview_questions')
          .select('*')
          .eq('interview_id', interviewData.id)
          .order('order_index', { ascending: true })

        if (questionsError) throw questionsError

        setInterview(interviewData)
        setQuestions(questionsData || [])
        setResponses(new Array(questionsData?.length || 0).fill(null))
      } catch (error) {
        console.error('Error loading interview:', error)
        setError('Interview not found')
      } finally {
        setLoading(false)
      }
    }

    loadInterview()
  }, [uniqueUrl])

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const { isValid, errors } = validateFormData({ firstName, lastName, email })
    
    if (!isValid) {
      setValidationErrors(errors)
      return
    }
    
    setValidationErrors({})
    if (firstName.trim() && lastName.trim() && email.trim()) {
      setShowTipDialog(true)
    }
  }

  const handleVideoReady = (blob: Blob) => {
    setCurrentVideoBlob(blob)
  }

  const handleRecordingStateChange = (recording: boolean) => {
    setIsRecording(recording)
  }

  const handleStartInterview = () => {
    setShowTipDialog(false)
    setEmailSubmitted(true)
  }

  const saveCurrentResponse = async () => {
    if (!currentVideoBlob || !questions[currentQuestionIndex]) return

    try {
      // Upload video
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9@.-]/g, '_')
      const sanitizedFileName = sanitizeFileName(`${currentQuestionIndex}_${Date.now()}.webm`)
      const fileName = `responses/${interview!.id}/${sanitizedEmail}/${sanitizedFileName}`
      
      // Validate video file
      const videoFile = new File([currentVideoBlob], sanitizedFileName, { type: 'video/webm' })
      const fileValidation = validateFileUpload(videoFile)
      if (!fileValidation.isValid) {
        alert(`Video validation failed: ${fileValidation.errors.join(', ')}`)
        return null
      }
      
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(fileName, currentVideoBlob)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('videos')
        .getPublicUrl(fileName)

      // Save response
      const newResponse: QuestionResponse = {
        question_id: questions[currentQuestionIndex].id,
        video_url: publicUrl,
        answered_at: new Date().toISOString()
      }

      const newResponses = [...responses]
      newResponses[currentQuestionIndex] = newResponse
      setResponses(newResponses)
      
      return newResponse
    } catch (error) {
      console.error('Error saving response:', error)
      alert('Failed to save response. Please try again.')
      return null
    }
  }

  const handleNext = async () => {
    if (currentVideoBlob) {
      const savedResponse = await saveCurrentResponse()
      if (!savedResponse) return
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentVideoBlob(null)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setCurrentVideoBlob(null)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      const finalResponses = [...responses]
      
      // Save current response if there's a video
      if (currentVideoBlob) {
        const savedResponse = await saveCurrentResponse()
        if (!savedResponse) {
          setSubmitting(false)
          return
        }
        // Update the final responses array with the saved response
        finalResponses[currentQuestionIndex] = savedResponse
      }

      // Check if all questions are answered
      if (finalResponses.some((r) => !r)) {
        alert('Please answer all questions before submitting.')
        setSubmitting(false)
        return
      }


      const { error } = await supabase
        .from('interview_responses')
        .insert({
          interview_id: interview!.id,
          first_name: firstName,
          last_name: lastName,
          candidate_email: email,
          responses: finalResponses,
          completed_at: new Date().toISOString()
        })

      if (error) throw error
      
      setSubmitted(true)
    } catch (error) {
      console.error('Error submitting responses:', error)
      alert('Failed to submit responses. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading interview...</p>
        </div>
      </div>
    )
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img 
              src="/logo.png" 
              alt="fk videoask logo" 
              className="w-full h-full object-contain opacity-50"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Interview Not Found</h1>
          <p className="text-gray-600">The video interview you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Interview Completed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for completing the video interview. Your responses have been submitted successfully.
          </p>
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-blue-800 font-medium">What's next?</p>
            <p className="text-blue-600 text-sm mt-1">The recruiter will review your responses and get back to you soon.</p>
          </div>
        </div>
      </div>
    )
  }

  // Tip Dialog Component
  if (showTipDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center relative">
            <button
              onClick={() => setShowTipDialog(false)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Lightbulb className="text-white" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Quick Tips</h2>
            <p className="text-blue-100">Get ready for your best interview performance</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🧑‍💻</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Choose a Quiet, Well-Lit Space</h3>
                  <p className="text-gray-600">Select a distraction-free area with natural or good lighting. Sit near a window or use a lamp to ensure you're clearly visible.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎧</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ensure Reliable Technology</h3>
                  <p className="text-gray-600">Check that your camera and microphone are working. Use a strong Wi-Fi connection and keep your device charged. Close unnecessary apps to prevent interruptions.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🔇</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Minimize Background Noise</h3>
                  <p className="text-gray-600">Find a silent environment. Inform others around you to avoid disturbances and consider using noise-canceling headphones if needed.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="text-2xl">👩‍💼</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Present Yourself Naturally</h3>
                  <p className="text-gray-600">Dress appropriately and maintain a relaxed posture. Be yourself and focus on speaking clearly and confidently.</p>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowTipDialog(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartInterview}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Let's Start
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!emailSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="fk videoask logo" 
                className="w-full h-full object-contain filter brightness-0 invert"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">{interview.title}</h1>
            {interview.description && (
              <p className="text-blue-100">{interview.description}</p>
            )}
          </div>
          
          <div className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Welcome to your interview</h2>
              <p className="text-gray-600">Please provide your details to get started</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-3">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your first name"
                  />
                  {validationErrors.firstName && (
                    <p className="text-red-600 text-sm mt-1" role="alert">
                      {validationErrors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-3">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your last name"
                  />
                  {validationErrors.lastName && (
                    <p className="text-red-600 text-sm mt-1" role="alert">
                      {validationErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-3">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email address"
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-600 text-sm mt-1" role="alert">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Interview
              </button>
            </form>

            <div className="mt-6 bg-gray-50 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock size={16} />
                <span>{questions.length} questions • Estimated time: {questions.length * 2} minutes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{interview.title}</h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                <User size={16} />
                <span>{firstName} {lastName} ({email})</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Question Side */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Video className="text-blue-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Interview Question</h2>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">{currentQuestion.question_text}</h3>
            </div>
            
            <video 
              src={currentQuestion.video_url} 
              controls 
              className="w-full rounded-xl bg-gray-900 shadow-lg"
            />
          </div>

          {/* Answer Side */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <User className="text-purple-600" size={20} />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Your Response</h2>
              </div>
              <p className="text-gray-600">Record your answer to this question (max 1 minute)</p>
            </div>

            <VideoRecorder 
              maxDuration={60}
              onVideoReady={handleVideoReady}
              onRecordingStateChange={handleRecordingStateChange}
              showPreview={true}
              key={currentQuestionIndex} // Force re-render for each question
            />

            {responses[currentQuestionIndex] && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium">✓ Response recorded for this question</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0 || isRecording}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft size={20} />
            <span>Previous</span>
          </button>

          <div className="flex space-x-4">
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={isRecording}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors"
              >
                <span>Next Question</span>
                <ChevronRight size={20} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || isRecording}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 text-white px-8 py-3 rounded-xl flex items-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none font-semibold"
              >
                <Send size={20} />
                <span>{submitting ? 'Submitting...' : 'Submit Interview'}</span>
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}