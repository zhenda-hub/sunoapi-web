import { ref, onUnmounted } from 'vue'
import { sunoApi } from '@/api/suno-api'
import type { TaskStatus, AudioData, LyricsData } from '@/api/types'

interface PollingResult {
  status: TaskStatus
  result?: AudioData[] | LyricsData
  error?: string
}

export function useTaskPolling() {
  const isPolling = ref(false)
  let pollingTimer: ReturnType<typeof setInterval> | null = null

  const startPolling = (taskId: string, onUpdate: (result: PollingResult) => void) => {
    if (isPolling.value) return

    isPolling.value = true
    const pollInterval = Number(import.meta.env.VITE_POLL_INTERVAL) || 3000

    const poll = async () => {
      try {
        const response = await sunoApi.getTaskStatus(taskId)

        // Debug logging
        console.log('[TaskPolling] API Response:', response)

        // Response is already validated by sunoApi.getTaskStatus
        // Just check if we have a valid status
        if (!response?.status) {
          console.error('[TaskPolling] Invalid response structure:', response)
          stopPolling()
          onUpdate({
            status: 'failed',
            error: `API 响应缺少状态信息。响应数据: ${JSON.stringify(response)}`
          })
          return
        }

        if (response.status === 'SUCCESS') {
          stopPolling()
          onUpdate({
            status: 'success',
            result: response.response?.data
          })
        } else if (response.status === 'FAILED') {
          stopPolling()
          onUpdate({
            status: 'failed',
            error: response.errorMessage || '生成失败'
          })
        }
        // If still PENDING, continue polling
      } catch (error) {
        stopPolling()
        onUpdate({
          status: 'failed',
          error: error instanceof Error ? error.message : '未知错误'
        })
      }
    }

    // Initial poll
    poll()

    // Set up interval
    pollingTimer = setInterval(poll, pollInterval)
  }

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer)
      pollingTimer = null
    }
    isPolling.value = false
  }

  // Cleanup on unmount
  onUnmounted(() => {
    stopPolling()
  })

  return {
    isPolling,
    startPolling,
    stopPolling
  }
}
