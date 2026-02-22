import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiError } from './types'

class ApiClient {
  private client: AxiosInstance
  private apiKey: string = ''

  constructor() {
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.sunoapi.org/api/v1',
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    // Request interceptor - add Authorization header
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.apiKey) {
          config.headers.Authorization = `Bearer ${this.apiKey}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const { status, data } = error.response
          throw new ApiError(status, (data as any)?.msg || '请求失败', data)
        } else if (error.request) {
          throw new ApiError(0, '网络错误，请检查连接')
        } else {
          throw new ApiError(0, error.message || '未知错误')
        }
      }
    )
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey
  }

  getApiKey(): string {
    return this.apiKey
  }

  clearApiKey(): void {
    this.apiKey = ''
  }

  get instance(): AxiosInstance {
    return this.client
  }
}

export const apiClient = new ApiClient()
