import axios from 'axios'
import { AuthTokens, LoginFormData, RegisterFormData, Task, TaskFormData, TaskListResponse, TaskStats, User } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          })

          const { access_token, refresh_token: new_refresh_token } = response.data
          localStorage.setItem('access_token', access_token)
          localStorage.setItem('refresh_token', new_refresh_token)

          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${access_token}`
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: async (data: LoginFormData): Promise<AuthTokens> => {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterFormData): Promise<AuthTokens> => {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  getGoogleAuthUrl: async (): Promise<{ url: string }> => {
    const response = await api.get('/auth/google')
    return response.data
  },

  getGithubAuthUrl: async (): Promise<{ url: string }> => {
    const response = await api.get('/auth/github')
    return response.data
  },
}

// User API
export const userAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me')
    return response.data
  },

  updateUser: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/users/me', data)
    return response.data
  },

  deleteUser: async (): Promise<void> => {
    await api.delete('/users/me')
  },
}

// Task API
export const taskAPI = {
  getTasks: async (params?: {
    page?: number
    per_page?: number
    status?: string
    priority?: string
    search?: string
    sort_by?: string
    sort_order?: string
  }): Promise<TaskListResponse> => {
    const response = await api.get('/tasks', { params })
    return response.data
  },

  getTask: async (id: number): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`)
    return response.data
  },

  createTask: async (data: TaskFormData): Promise<Task> => {
    const response = await api.post('/tasks', data)
    return response.data
  },

  updateTask: async (id: number, data: Partial<TaskFormData>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data
  },

  deleteTask: async (id: number): Promise<void> => {
    await api.delete(`/tasks/${id}`)
  },

  completeTask: async (id: number): Promise<Task> => {
    const response = await api.patch(`/tasks/${id}/complete`)
    return response.data
  },

  getTaskStats: async (): Promise<TaskStats> => {
    const response = await api.get('/tasks/stats/summary')
    return response.data
  },
}

export default api
