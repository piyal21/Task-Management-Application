'use client'

import { Task, TaskStatus, TaskPriority } from '@/types'
import { format } from 'date-fns'
import { 
  PencilIcon, 
  TrashIcon, 
  CheckIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: number) => void
  onComplete: (taskId: number) => void
}

export function TaskCard({ task, onEdit, onDelete, onComplete }: TaskCardProps) {
  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return 'bg-red-100 text-red-800'
      case TaskPriority.HIGH:
        return 'bg-orange-100 text-orange-800'
      case TaskPriority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800'
      case TaskPriority.LOW:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'bg-green-100 text-green-800'
      case TaskStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800'
      case TaskStatus.CANCELLED:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getPriorityIcon = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.URGENT:
        return <ExclamationTriangleIcon className="h-4 w-4" />
      case TaskPriority.HIGH:
        return <ExclamationTriangleIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== TaskStatus.COMPLETED

  return (
    <div className={`task-card ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {task.title}
            </h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
              {getPriorityIcon(task.priority)}
              <span className="ml-1">{task.priority}</span>
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Created {format(new Date(task.created_at), 'MMM d, yyyy')}
            </div>
            {task.due_date && (
              <div className={`flex items-center ${isOverdue ? 'text-red-600' : ''}`}>
                <CalendarIcon className="h-4 w-4 mr-1" />
                Due {format(new Date(task.due_date), 'MMM d, yyyy')}
              </div>
            )}
            {task.completed_at && (
              <div className="flex items-center text-green-600">
                <CheckIcon className="h-4 w-4 mr-1" />
                Completed {format(new Date(task.completed_at), 'MMM d, yyyy')}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {task.status !== TaskStatus.COMPLETED && (
            <button
              onClick={() => onComplete(task.id)}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
              title="Mark as completed"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          )}
          
          <button
            onClick={() => onEdit(task)}
            className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Edit task"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete task"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
