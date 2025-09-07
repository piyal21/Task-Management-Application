'use client'

import { useState, useEffect } from 'react'
import { Task, TaskStatus, TaskPriority, TaskListResponse } from '@/types'
import { taskAPI } from '@/lib/api'
import { TaskCard } from './TaskCard'
import { TaskFilters } from './TaskFilters'
import toast from 'react-hot-toast'

interface TaskListProps {
  onEditTask: (task: Task) => void
  onStatsUpdate: (stats: any) => void
}

export function TaskList({ onEditTask, onStatsUpdate }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    status: '',
    priority: '',
    search: '',
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  })

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response: TaskListResponse = await taskAPI.getTasks(filters)
      setTasks(response.tasks)
      setPagination({
        total: response.total,
        total_pages: response.total_pages,
      })
      
      // Update stats
      const stats = await taskAPI.getTaskStats()
      onStatsUpdate(stats)
    } catch (error) {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const handleDeleteTask = async (taskId: number) => {
    try {
      await taskAPI.deleteTask(taskId)
      toast.success('Task deleted successfully')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    try {
      await taskAPI.completeTask(taskId)
      toast.success('Task completed!')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to complete task')
    }
  }

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }

  if (loading) {
    return (
      <div className="card p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <TaskFilters filters={filters} onFiltersChange={setFilters} />
      
      <div className="card p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">
            Tasks ({pagination.total})
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tasks found. Create your first task!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={handleDeleteTask}
                onComplete={handleCompleteTask}
              />
            ))}
          </div>
        )}

        {pagination.total_pages > 1 && (
          <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
              {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    page === filters.page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  )
}
