import React, { useState } from 'react'
import { Save, Plus, Trash2, Video, FileText } from 'lucide-react'
import { VideoRecorder } from './VideoRecorder'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { validateFormData } from '../utils/validation'
import { sanitizeFileName, validateFileUpload } from '../utils/security'

interface Question {
  id: string
  question_text: string
  videoBlob: Blob | null
  videoUrl: string | null
}

interface InterviewFormProps {
  onInterviewCreated: () => void
}

export const InterviewForm: React.FC<InterviewFormProps> = React.memo(({ onInterviewCreated }) => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', question_text: '', videoBlob: null, videoUrl: null }
  ])
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const { user } = useAuth()

  const generateUniqueUrl = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      question_text: '',
      videoBlob: null,
      videoUrl: null
    }
    setQuestions([...questions, newQuestion])
  }

  const removeQuestion = (id: string) => {
    if (questions.length > 1) {
      setQuestions(questions.filter(q => q.id !== id))
    }
  }

  const updateQuestion = (id: string, field: keyof Question, value: string | Blob | null) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const formData = {
      title,
      description,
      questions: questions.map(q => ({ question_text: q.question_text }))
    }
    
    const { isValid, errors, sanitized } = validateFormData(formData)
    
    // Additional validation for questions and videos
    const questionErrors: Record<string, string> = {}
    questions.forEach((question, index) => {
      if (!question.question_text.trim()) {
        questionErrors[`question_${index}_text`] = 'Question text is required'
      }
      if (!question.videoBlob) {
        questionErrors[`question_${index}_video`] = 'Question video is required'
      } else {
        // Validate video file
        const videoFile = new File([question.videoBlob], `question_${index}.webm`, { type: 'video/webm' })
        const fileValidation = validateFileUpload(videoFile)
        if (!fileValidation.isValid) {
          questionErrors[`question_${index}_video`] = fileValidation.errors.join(', ')
        }
      }
    })
    
    if (!isValid || Object.keys(questionErrors).length > 0) {
      setValidationErrors({ ...errors, ...questionErrors })
      return
    }
    
    if (!user) {
      alert('You must be logged in to create an interview')
      return
    }
    
    setValidationErrors({})
    setUploading(true)
    
    try {
      // Create interview record
      const uniqueUrl = generateUniqueUrl()
      const { data: interviewData, error: interviewError } = await supabase
        .from('interviews')
        .insert({
          title: sanitized.title,
          description: sanitized.description || null,
          unique_url: uniqueUrl,
          recruiter_id: user.id,
        })
        .select()
        .single()

      if (interviewError) throw interviewError

      // Upload videos and create question records
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i]
        
        // Upload video
        const sanitizedFileName = sanitizeFileName(`question_${i + 1}_${Date.now()}.webm`)
        const fileName = `interviews/${interviewData.id}/${sanitizedFileName}`
        
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(fileName, question.videoBlob!)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('videos')
          .getPublicUrl(fileName)

        // Create question record
        const { error: questionError } = await supabase
          .from('interview_questions')
          .insert({
            interview_id: interviewData.id,
            question_text: sanitized.questions[i].question_text,
            video_url: publicUrl,
            order_index: i,
          })

        if (questionError) throw questionError
      }

      // Reset form
      setTitle('')
      setDescription('')
      setQuestions([{ id: '1', question_text: '', videoBlob: null, videoUrl: null }])
      onInterviewCreated()
      
    } catch (error) {
      console.error('Error creating interview:', error)
      alert('Failed to create interview. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <section 
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden"
      aria-labelledby="interview-form-title"
    >
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <h2 id="interview-form-title" className="text-2xl font-bold text-white flex items-center space-x-3">
          <Video size={28} aria-hidden="true" />
          <span>Create New Interview</span>
        </h2>
        <p className="text-blue-100 mt-2">Set up your video interview with multiple questions</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8" noValidate>
        {/* Interview Details */}
        <div className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-3">
              Interview Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              aria-describedby="title-help"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="e.g., Frontend Developer Interview"
            />
            {validationErrors.title && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.title}
              </p>
            )}
            <p id="title-help" className="text-sm text-gray-500 mt-1">
              Give your interview a clear, descriptive title
            </p>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
              Description (Optional)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={1000}
              aria-describedby="description-help"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Brief description of the interview..."
            />
            {validationErrors.description && (
              <p className="text-red-600 text-sm mt-1" role="alert">
                {validationErrors.description}
              </p>
            )}
            <p id="description-help" className="text-sm text-gray-500 mt-1">
              Optional: Provide context about the role or interview process
            </p>
          </div>
        </div>

        {/* Questions */}
        <fieldset className="space-y-6">
          <legend className="sr-only">Interview Questions</legend>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <FileText size={20} aria-hidden="true" />
              <span>Interview Questions</span>
            </h3>
            <button
              type="button"
              onClick={addQuestion}
              aria-label="Add new question"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Plus size={16} aria-hidden="true" />
              <span>Add Question</span>
            </button>
          </div>

          {questions.map((question, index) => (
            <div 
              key={question.id} 
              className="bg-gray-50 rounded-xl p-6 border border-gray-200"
              role="group"
              aria-labelledby={`question-${question.id}-title`}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 id={`question-${question.id}-title`} className="font-semibold text-gray-900">
                  Question {index + 1}
                </h4>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(question.id)}
                    aria-label={`Remove question ${index + 1}`}
                    className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label 
                    htmlFor={`question-text-${question.id}`}
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Question Text *
                  </label>
                  <input
                    id={`question-text-${question.id}`}
                    type="text"
                    value={question.question_text}
                    onChange={(e) => updateQuestion(question.id, 'question_text', e.target.value)}
                    required
                    maxLength={500}
                    aria-describedby={`question-text-${question.id}-help`}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your question..."
                  />
                  {validationErrors[`question_${index}_text`] && (
                    <p className="text-red-600 text-sm mt-1" role="alert">
                      {validationErrors[`question_${index}_text`]}
                    </p>
                  )}
                  <p id={`question-text-${question.id}-help`} className="text-sm text-gray-500 mt-1">
                    Write a clear question for candidates to answer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Record Question Video *
                  </label>
                  <VideoRecorder
                    maxDuration={120}
                    onVideoReady={(blob) => updateQuestion(question.id, 'videoBlob', blob)}
                    showPreview={true}
                  />
                  {validationErrors[`question_${index}_video`] && (
                    <p className="text-red-600 text-sm mt-1" role="alert">
                      {validationErrors[`question_${index}_video`]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </fieldset>

        <button
          type="submit"
          disabled={uploading || !title || questions.some(q => !q.question_text || !q.videoBlob)}
          aria-describedby={uploading ? "submit-status" : undefined}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
        >
          <Save size={20} aria-hidden="true" />
          <span id="submit-status">
            {uploading ? 'Creating Interview...' : 'Create Interview'}
          </span>
        </button>
      </form>
    </section>
  )
})

InterviewForm.displayName = 'InterviewForm'