'use client'

import { User } from '@/types'
import { LogoutIcon, UserIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  user: User | null
  onLogout: () => void
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold text-gray-900">
              Task Management
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-primary-600" />
                </div>
              )}
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogoutIcon className="h-5 w-5" />
              <span className="hidden sm:block">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
