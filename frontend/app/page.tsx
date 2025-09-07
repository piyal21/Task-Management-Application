'use client'

import { useAuth } from '@/hooks/useAuth'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { TaskDashboard } from '@/components/tasks/TaskDashboard'
import { useState } from 'react'

export default function Home() {
  const { user, isLoading } = useAuth()
  const [showRegister, setShowRegister] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Task Management App
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {showRegister ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {showRegister ? (
              <RegisterForm onSwitchToLogin={() => setShowRegister(false)} />
            ) : (
              <LoginForm onSwitchToRegister={() => setShowRegister(true)} />
            )}
          </div>
        </div>
      </div>
    )
  }

  return <TaskDashboard />
}
