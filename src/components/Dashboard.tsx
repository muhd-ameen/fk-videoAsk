import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Users, Calendar, Eye, Trash2, Video, Mail, Clock, Star, Play, X, Edit, Save } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import { Toast } from './Toast'
import { InterviewForm } from './InterviewForm'
import { Interview, InterviewResponse, InterviewQuestion } from '../types'

export const Dashboard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [responses, setResponses] = useState<InterviewResponse[]>([])
  const [selectedResponse, setSelectedResponse] = useState<InterviewResponse | null>(null)
  const [responseQuestions, setResponseQuestions] = useState<InterviewQuestion[]>([])
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [responseToReject, setResponseToReject] = useState<InterviewResponse | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)
  const [loading, setLoading] = useState(true)
  const [deletingInterview, setDeletingInterview] = useState<string | null>(null)
  const [rejectingResponse, setRejectingResponse] = useState<string | null>(null)
  const { user, signOut } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  const loadData = useCallback(async () => {
    if (!user) return

    try {
      console.log('Loading data for user:', user.id)
      
      // Load interviews
      const { data: interviewsData, error: interviewsError } = await supabase
        .from('interviews')
        .select('*')
        .eq('recruiter_id', user.id)
        .order('created_at', { ascending: false })

      if (interviewsError) {
        console.error('Error loading interviews:', interviewsError)
        throw interviewsError
      }
      
      console.log('Loaded interviews:', interviewsData?.length || 0)

      // Load responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('interview_responses')
        .select(`
          *,
          interviews!inner(recruiter_id)
        `)
        .eq('interviews.recruiter_id', user.id)
        .order('created_at', { ascending: false })

      if (responsesError) {
        console.error('Error loading responses:', responsesError)
        throw responsesError
      }
      
      console.log('Loaded responses:', responsesData?.length || 0)

      setInterviews(interviewsData || [])
      setResponses(responsesData || [])
    } catch (error) {
      console.error('Error loading data:', error)
      showToast('Failed to load data. Please refresh the page.', 'error')
    } finally {
      setLoading(false)
    }
  }, [user, showToast])

  useEffect(() => {
    loadData()
  }, [user, loadData])

  const handleInterviewCreated = () => {
    setShowInterviewForm(false)
    loadData()
  }

  const copyToClipboard = async (uniqueUrl: string) => {
    const fullUrl = `${window.location.origin}/interview/${uniqueUrl}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      showToast('Interview link copied to clipboard!', 'success')
    } catch (error) {
      console.error('Failed to copy URL:', error)
      showToast('Failed to copy link. Please try again.', 'error')
    }
  }

  const getResponsesForInterview = (interviewId: string) => {
    return responses.filter(response => response.interview_id === interviewId)
  }

  const handleViewResponse = async (response: InterviewResponse) => {
    try {
      // Load questions for this interview
      const { data: questionsData, error } = await supabase
        .from('interview_questions')
        .select('*')
        .eq('interview_id', response.interview_id)
        .order('order_index', { ascending: true })

      if (error) throw error

      setSelectedResponse(response)
      setResponseQuestions(questionsData || [])
      setShowResponseModal(true)
    } catch (error) {
      console.error('Error loading response details:', error)
      alert('Failed to load response details')
    }
  }

  const closeResponseModal = () => {
    setShowResponseModal(false)
    setSelectedResponse(null)
    setResponseQuestions([])
  }

  const handleDeleteInterview = async (interviewId: string) => {
    if (!confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
      return
    }

    setDeletingInterview(interviewId)
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewId)

      if (error) throw error
      loadData()
      showToast('Interview deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting interview:', error)
      showToast('Failed to delete interview. Please try again.', 'error')
    } finally {
      setDeletingInterview(null)
    }
  }

  const handleEditInterview = (interview: Interview) => {
    setEditingInterview(interview)
    setEditTitle(interview.title)
    setEditDescription(interview.description || '')
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editingInterview || !editTitle.trim()) {
      showToast('Please enter a valid title', 'error')
      return
    }

    setSavingEdit(true)
    try {
      const { error } = await supabase
        .from('interviews')
        .update({
          title: editTitle.trim(),
          description: editDescription.trim() || null
        })
        .eq('id', editingInterview.id)

      if (error) throw error

      setShowEditModal(false)
      setEditingInterview(null)
      loadData()
      showToast('Interview updated successfully', 'success')
    } catch (error) {
      console.error('Error updating interview:', error)
      showToast('Failed to update interview. Please try again.', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingInterview(null)
    setEditTitle('')
    setEditDescription('')
  }

  const handleRejectResponse = async (responseId: string) => {
    setRejectingResponse(responseId)
    try {
      console.log('Attempting to delete response:', responseId)
      console.log('Current user:', user?.id)
      
      // First, let's verify the response exists and belongs to this recruiter
      const { data: responseCheck, error: checkError } = await supabase
        .from('interview_responses')
        .select(`
          id,
          interview_id,
          interviews!inner(recruiter_id)
        `)
        .eq('id', responseId)
        .single()
      
      if (checkError) {
        console.error('Error checking response:', checkError)
        throw new Error('Failed to verify response ownership')
      }
      
      console.log('Response check result:', responseCheck)
      
      if (responseCheck.interviews.recruiter_id !== user?.id) {
        throw new Error('You do not have permission to delete this response')
      }
      
      const { error } = await supabase
        .from('interview_responses')
        .delete()
        .eq('id', responseId)

      if (error) {
        console.error('Delete error:', error)
        throw error
      }
      
      console.log('Response deleted successfully')
      
      // Reload data to ensure consistency
      await loadData()
      
      // Close the reject dialog
      setShowRejectDialog(false)
      setResponseToReject(null)
      
      showToast('Response rejected and deleted successfully', 'success')
    } catch (error) {
      console.error('Error rejecting response:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject response. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setRejectingResponse(null)
    }
  }

  const openRejectDialog = (response: InterviewResponse) => {
    setResponseToReject(response)
    setShowRejectDialog(true)
  }

  const closeRejectDialog = () => {
    setShowRejectDialog(false)
    setResponseToReject(null)
  }

  const confirmRejectResponse = () => {
    if (responseToReject) {
      handleRejectResponse(responseToReject.id)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <img 
                src="/logo.png" 
                alt="fk videoask logo" 
                className="w-14 h-14 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  fk videoask
                </h1>
                <p className="text-gray-500 text-sm">Interview Management Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-900">{user?.email}</p>
              </div>
              <button
                onClick={signOut}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Interviews</p>
                <p className="text-3xl font-bold text-gray-900">{interviews.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Responses</p>
                <p className="text-3xl font-bold text-gray-900">{responses.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <Mail className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">This Month</p>
                <p className="text-3xl font-bold text-gray-900">
                  {interviews.filter(i => new Date(i.created_at).getMonth() === new Date().getMonth()).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <Calendar className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowInterviewForm(!showInterviewForm)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl flex items-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus size={24} />
            <span className="font-semibold">Create New Interview</span>
          </button>
        </div>

        {/* Interview Form */}
        {showInterviewForm && (
          <div className="mb-8">
            <InterviewForm onInterviewCreated={handleInterviewCreated} />
          </div>
        )}

        {/* Interviews Grid */}
        <div className="space-y-6">
          {interviews.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Video className="text-gray-400" size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews yet</h3>
              <p className="text-gray-500 mb-6">Create your first video interview to get started</p>
              <button
                onClick={() => setShowInterviewForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-200"
              >
                Create Interview
              </button>
            </div>
          ) : (
            interviews.map((interview) => {
              const interviewResponses = getResponsesForInterview(interview.id)
              return (
                <div key={interview.id} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden hover:shadow-xl transition-all duration-200">
                  <div className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-2xl font-bold text-gray-900">{interview.title}</h3>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            Active
                          </div>
                        </div>
                        {interview.description && (
                          <p className="text-gray-600 mb-3">{interview.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>Created {new Date(interview.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users size={16} />
                            <span>{interviewResponses.length} responses</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          onClick={() => copyToClipboard(interview.unique_url)}
                          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
                        >
                          <Eye size={18} />
                          <span>Share Link</span>
                        </button>
                        <button
                          onClick={() => handleEditInterview(interview)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
                        >
                          <Edit size={18} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInterview(interview.id)}
                          disabled={deletingInterview === interview.id}
                          className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors shadow-md hover:shadow-lg"
                        >
                          <Trash2 size={18} />
                          <span>{deletingInterview === interview.id ? 'Deleting...' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Responses Section */}
                    {interviewResponses.length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                          <Star className="text-yellow-500" size={20} />
                          <span>Recent Responses ({interviewResponses.length})</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {interviewResponses.slice(0, 6).map((response) => (
                            <div key={response.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:bg-gray-100 transition-colors">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Mail size={16} className="text-blue-600" />
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {response.first_name} {response.last_name}
                                    </span>
                                    <span className="text-xs text-gray-500 truncate">{response.candidate_email}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-2 text-sm text-gray-500">
                                  <Clock size={14} />
                                  <span>{formatTime(response.created_at)}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between space-x-2">
                                <button
                                  onClick={() => handleViewResponse(response)}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors"
                                >
                                  <Play size={12} />
                                  <span>View</span>
                                </button>
                                <button
                                  onClick={() => openRejectDialog(response)}
                                  disabled={rejectingResponse === response.id}
                                  className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center space-x-1 transition-colors"
                                >
                                  <X size={12} />
                                  <span>{rejectingResponse === response.id ? 'Rejecting...' : 'Reject'}</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        {interviewResponses.length > 6 && (
                          <div className="mt-4 text-center">
                            <p className="text-gray-500 text-sm">
                              Showing 6 of {interviewResponses.length} responses
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>

      {/* Response Modal */}
      {showResponseModal && selectedResponse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Candidate Response</h2>
                  <p className="text-blue-100 mt-1">{selectedResponse.first_name} {selectedResponse.last_name}</p>
                  <p className="text-blue-100 text-sm">{selectedResponse.candidate_email}</p>
                </div>
                <button
                  onClick={closeResponseModal}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-8">
                {responseQuestions.map((question, index) => {
                  const response = selectedResponse.responses.find(r => r.question_id === question.id)
                  return (
                    <div key={question.id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Question {index + 1}: {question.question_text}
                        </h3>
                        <div className="text-sm text-gray-600">
                          <p>Recruiter's Question Video:</p>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Question Video */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Original Question</h4>
                            <video 
                              src={question.video_url} 
                              controls 
                              className="w-full rounded-lg bg-gray-900 shadow-md"
                            />
                          </div>
                          
                          {/* Response Video */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-3">Candidate's Answer</h4>
                            {response ? (
                              <div>
                                <video 
                                  src={response.video_url} 
                                  controls 
                                  className="w-full rounded-lg bg-gray-900 shadow-md"
                                  onError={() => console.error('Video load error for URL:', response.video_url)}
                                />
                              </div>
                            ) : (
                              <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <p className="text-gray-500">No response recorded</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {response && (
                          <div className="mt-4 bg-blue-50 rounded-lg p-3">
                            <p className="text-blue-800 text-sm">
                              <Clock size={14} className="inline mr-1" />
                              Answered on {new Date(response.answered_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="mt-8 bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Interview completed on {new Date(selectedResponse.completed_at || selectedResponse.created_at).toLocaleString()}</span>
                  <span>{selectedResponse.responses.length} of {responseQuestions.length} questions answered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Reject Confirmation Dialog */}
      {showRejectDialog && responseToReject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Dialog Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                  <X size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Reject Response</h2>
                  <p className="text-red-100 text-sm">This action cannot be undone</p>
                </div>
              </div>
            </div>

            {/* Dialog Content */}
            <div className="p-6">
              <div className="mb-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-100 p-2 rounded-lg">
                      <Mail size={16} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {responseToReject.first_name} {responseToReject.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{responseToReject.candidate_email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Submitted {formatTime(responseToReject.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <p className="text-gray-900 font-medium">
                    Are you sure you want to reject this candidate's response?
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• The response will be permanently deleted</li>
                    <li>• All video answers will be removed</li>
                    <li>• This action cannot be undone</li>
                  </ul>
                </div>
              </div>

              {/* Dialog Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={closeRejectDialog}
                  disabled={rejectingResponse === responseToReject.id}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejectResponse}
                  disabled={rejectingResponse === responseToReject.id}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-300 disabled:to-red-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  {rejectingResponse === responseToReject.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Rejecting...</span>
                    </>
                  ) : (
                    <>
                      <X size={16} />
                      <span>Reject Response</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Interview Modal */}
      {showEditModal && editingInterview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Edit Interview</h2>
                  <p className="text-blue-100 mt-1">Update your interview details</p>
                </div>
                <button
                  onClick={closeEditModal}
                  className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              <div className="space-y-6">
                <div>
                  <label htmlFor="editTitle" className="block text-sm font-semibold text-gray-700 mb-3">
                    Interview Title *
                  </label>
                  <input
                    id="editTitle"
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Frontend Developer Interview"
                  />
                </div>
                <div>
                  <label htmlFor="editDescription" className="block text-sm font-semibold text-gray-700 mb-3">
                    Description (Optional)
                  </label>
                  <textarea
                    id="editDescription"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Brief description of the interview..."
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <button
                  onClick={closeEditModal}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={savingEdit || !editTitle.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none flex items-center justify-center space-x-2"
                >
                  <Save size={18} />
                  <span>{savingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  )
}