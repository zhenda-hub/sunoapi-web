// Request Types
export interface GenerateMusicRequest {
  prompt: string
  customMode?: boolean
  style?: string
  title?: string
  instrumental?: boolean
  model?: 'V4' | 'V4_5' | 'V4_5PLUS' | 'V4_5ALL' | 'V5'
  uploadUrl?: string
  defaultParamFlag?: boolean
  continueAt?: number
  callBackUrl?: string
}

export interface GenerateLyricsRequest {
  prompt: string
  callBackUrl?: string
}

// Response Types
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

export interface GenerateMusicResponse {
  taskId: string
}

export interface GenerateLyricsResponse {
  taskId: string
}

export interface TaskStatusResponse {
  taskId: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  response?: TaskSuccessResponse
  errorMessage?: string
}

export interface TaskSuccessResponse {
  data: AudioData[]
}

export interface AudioData {
  id: string
  audio_url: string
  title: string
  tags?: string
  duration: number
  image_url?: string
  video_url?: string
  vocal_removal_info?: {
    instrumental_url: string
    vocal_url: string
  }
}

export interface LyricsData {
  id: string
  text: string
}

export interface CreditsResponse {
  credits?: number
  credits_left?: number
  remaining_credits?: number
  limit?: number
}

// Task Types
export type TaskType = 'music' | 'lyrics'
export type TaskStatus = 'pending' | 'success' | 'failed'

export interface Task {
  id: string
  type: TaskType
  status: TaskStatus
  prompt: string
  result?: AudioData[] | LyricsData
  error?: string
  createdAt: Date
}

// API Error
export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
