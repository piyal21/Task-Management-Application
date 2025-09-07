'use client'

import { TaskStats as TaskStatsType } from '@/types'
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  ChartBarIcon 
} from '@heroicons/react/24/outline'

interface TaskStatsProps {
  stats: TaskStatsType | null
}

export function TaskStats({ stats }: TaskStatsProps) {
  if (!stats) {
    return (
      <div className="card p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{stats.total_tasks}</div>
            <div className="text-sm text-gray-500">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completion_rate}%</div>
            <div className="text-sm text-gray-500">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Status Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-sm text-gray-700">To Do</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.status_stats.todo || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-gray-700">In Progress</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.status_stats.in_progress || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-sm text-gray-700">Completed</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.status_stats.completed || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <ChartBarIcon className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm text-gray-700">Cancelled</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.status_stats.cancelled || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Breakdown</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Low</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.priority_stats.low || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Medium</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.priority_stats.medium || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">High</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.priority_stats.high || 0}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-700">Urgent</span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {stats.priority_stats.urgent || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
