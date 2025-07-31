import React, { useState } from 'react'
import { Video } from 'lucide-react'
import { AuthForm } from '../components/AuthForm'

export const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Video className="text-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">fk videoask</h1>
          <p className="text-gray-600 mt-2 text-lg">Professional Video Interview Platform</p>
        </div>
        <AuthForm 
          mode={authMode} 
          onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
        />
      </div>
    </div>
  )
}