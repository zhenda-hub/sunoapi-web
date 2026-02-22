import { apiClient } from './client'
import type {
  GenerateMusicRequest,
  GenerateLyricsRequest,
  ApiResponse,
  GenerateMusicResponse,
  GenerateLyricsResponse,
  TaskStatusResponse,
  CreditsResponse
} from './types'

// Get API provider from environment
const API_PROVIDER = import.meta.env.VITE_API_PROVIDER || 'default'

/**
 * AceDataCloud API Adapter
 * Handles the different response format from api.acedata.cloud
 */
class AceDataCloudAdapter {
  /**
   * Generate music using AceDataCloud API
   */
  async generateMusic(params: GenerateMusicRequest): Promise<string> {
    const response = await apiClient.instance.post<{
      success: boolean
      task_id: string
      data: any[]
    }>(
      '/suno/audios',
      {
        action: 'generate',
        prompt: params.prompt,
        model: params.model || 'chirp-v4-5',
        custom: params.customMode || false,
        title: params.title,
        style: params.style,
        instrumental: params.instrumental
      }
    )

    if (!response.data.success || !response.data.task_id) {
      throw new Error('生成失败')
    }

    return response.data.task_id
  }

  /**
   * Generate lyrics using AceDataCloud API
   */
  async generateLyrics(params: GenerateLyricsRequest): Promise<string> {
    const response = await apiClient.instance.post<{
      success: boolean
      task_id: string
      data: any[]
    }>(
      '/suno/audios',
      {
        action: 'generate',
        prompt: params.prompt,
        custom: true,
        instrumental: true  // Lyrics only generation
      }
    )

    if (!response.data.success || !response.data.task_id) {
      throw new Error('生成失败')
    }

    return response.data.task_id
  }

  /**
   * Query task status
   * Note: AceDataCloud returns results synchronously or via callback
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    // For AceDataCloud, we'll use the task status endpoint
    const response = await apiClient.instance.get<{
      success: boolean
      data: any[]
    }>(
      `/suno/audios/${taskId}`
    )

    if (!response.data.success) {
      throw new Error('查询失败')
    }

    const audio = response.data.data?.[0]
    if (!audio) {
      throw new Error('任务不存在')
    }

    // Map AceDataCloud state to our status
    const statusMap: Record<string, 'PENDING' | 'SUCCESS' | 'FAILED'> = {
      'pending': 'PENDING',
      'processing': 'PENDING',
      'succeeded': 'SUCCESS',
      'failed': 'FAILED'
    }

    return {
      taskId,
      status: statusMap[audio.state] || 'PENDING',
      response: audio.state === 'succeeded' ? { data: response.data.data } : undefined,
      errorMessage: audio.error_message
    }
  }

  /**
   * Get remaining credits
   * Note: AceDataCloud doesn't have a public credits endpoint
   */
  async getCredits(): Promise<number> {
    try {
      const response = await apiClient.instance.get<any>('/suno/credits')
      if (!response.data.success) {
        throw new Error('查询失败')
      }
      return response.data.data?.credits_left || 0
    } catch (error) {
      // Credits endpoint may not exist, return unknown silently
      return -1  // -1 means unknown
    }
  }
}

export class SunoApi {
  private adapter = new AceDataCloudAdapter()

  /**
   * Generate music from text prompt
   */
  async generateMusic(params: GenerateMusicRequest): Promise<string> {
    if (API_PROVIDER === 'acedata') {
      return this.adapter.generateMusic(params)
    }

    // Default API (sunoapi.org format)
    const response = await apiClient.instance.post<ApiResponse<GenerateMusicResponse>>(
      '/generate',
      params
    )

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || '生成失败')
    }

    return response.data.data.taskId
  }

  /**
   * Generate lyrics from text prompt
   */
  async generateLyrics(params: GenerateLyricsRequest): Promise<string> {
    if (API_PROVIDER === 'acedata') {
      return this.adapter.generateLyrics(params)
    }

    // Default API (sunoapi.org format)
    const response = await apiClient.instance.post<ApiResponse<GenerateLyricsResponse>>(
      '/lyrics',
      params
    )

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || '生成失败')
    }

    return response.data.data.taskId
  }

  /**
   * Query task status by taskId
   */
  async getTaskStatus(taskId: string): Promise<TaskStatusResponse> {
    if (API_PROVIDER === 'acedata') {
      return this.adapter.getTaskStatus(taskId)
    }

    // Default API (sunoapi.org format)
    try {
      const response = await apiClient.instance.get<ApiResponse<TaskStatusResponse>>(
        `/generate/record-info`,
        { params: { taskId } }
      )

      console.log('[SunoAPI] getTaskStatus response:', {
        status: response.status,
        code: response.data.code,
        msg: response.data.msg,
        data: response.data.data
      })

      if (response.data.code !== 200) {
        throw new Error(response.data.msg || '查询失败')
      }

      // Validate response data structure
      if (!response.data.data) {
        console.error('[SunoAPI] Response data is null:', response.data)
        throw new Error('API 返回数据为空')
      }

      return response.data.data
    } catch (error) {
      console.error('[SunoAPI] getTaskStatus error:', error)
      throw error
    }
  }

  /**
   * Get remaining credits
   */
  async getCredits(): Promise<number> {
    if (API_PROVIDER === 'acedata') {
      return this.adapter.getCredits()
    }

    // Default API (sunoapi.org format)
    const response = await apiClient.instance.get<any>('/get_limit')

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || '查询失败')
    }

    return response.data.data?.credits_left ||
           response.data.data?.remaining_credits ||
           response.data.data?.limit ||
           0
  }
}

export const sunoApi = new SunoApi()
