'use client'

import { useState } from 'react'
import { TaskStatus, TaskPriority } from '@/types'
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

interface TaskFiltersProps {
  filters: {
    page: number
    per_page: number
    status: string
    priority: string
    search: string
    sort_by: string
    sort_order: string
  }
  onFiltersChange: (filters: any) => void
}

export function TaskFilters({ filters, onFiltersChange }: TaskFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    })
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <FunnelIcon className="h-4 w-4" />
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="input-field pl-10"
          />
        </div>

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="input-field"
            >
              <option value="">All Statuses</option>
              <option value={TaskStatus.TODO}>To Do</option>
              <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
              <option value={TaskStatus.COMPLETED}>Completed</option>
              <option value={TaskStatus.CANCELLED}>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="input-field"
            >
              <option value="">All Priorities</option>
              <option value={TaskPriority.LOW}>Low</option>
              <option value={TaskPriority.MEDIUM}>Medium</option>
              <option value={TaskPriority.HIGH}>High</option>
              <option value={TaskPriority.URGENT}>Urgent</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sort_by}
                onChange={(e) => handleFilterChange('sort_by', e.target.value)}
                className="input-field"
              >
                <option value="created_at">Created Date</option>
                <option value="updated_at">Updated Date</option>
                <option value="due_date">Due Date</option>
                <option value="title">Title</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort Order
              </label>
              <select
                value={filters.sort_order}
                onChange={(e) => handleFilterChange('sort_order', e.target.value)}
                className="input-field"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}

        {/* Clear Filters */}
        <div className="flex justify-end">
          <button
            onClick={() => onFiltersChange({
              page: 1,
              per_page: 10,
              status: '',
              priority: '',
              search: '',
              sort_by: 'created_at',
              sort_order: 'desc',
            })}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear all filters
          </button>
        </div>
      </div>
    </div>
  )
}
