'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { TaskList } from './TaskList'
import { TaskForm } from './TaskForm'
import { TaskStats } from './TaskStats'
import { Header } from './Header'
import { TaskStats as TaskStatsType } from '@/types'

export function TaskDashboard() {
  const { user, logout } = useAuth()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [stats, setStats] = useState<TaskStatsType | null>(null)

  const handleTaskCreated = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  const handleTaskUpdated = () => {
    setEditingTask(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Task Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your tasks efficiently</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="space-y-6">
              <TaskStats stats={stats} />
              
              <div className="card p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn-primary w-full mb-3"
                >
                  Add New Task
                </button>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="btn-secondary w-full"
                >
                  Import Tasks
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <TaskList 
              onEditTask={setEditingTask}
              onStatsUpdate={setStats}
            />
          </div>
        </div>
      </div>

      {(showTaskForm || editingTask) && (
        <TaskForm
          task={editingTask}
          onClose={() => {
            setShowTaskForm(false)
            setEditingTask(null)
          }}
          onSuccess={editingTask ? handleTaskUpdated : handleTaskCreated}
        />
      )}
    </div>
  )
}
