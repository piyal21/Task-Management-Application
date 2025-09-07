export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  is_verified: boolean
  avatar_url?: string
  provider: string
  created_at: string
  updated_at?: string
  last_login?: string
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
  completed_at?: string
  owner_id: number
  created_at: string
  updated_at?: string
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface TaskListResponse {
  tasks: Task[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface TaskStats {
  total_tasks: number
  completed_tasks: number
  pending_tasks: number
  completion_rate: number
  priority_stats: Record<string, number>
  status_stats: Record<string, number>
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  username: string
  password: string
  full_name?: string
}

export interface TaskFormData {
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date?: string
}
