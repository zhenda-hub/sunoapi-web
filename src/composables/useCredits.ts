import { ref } from 'vue'
import { sunoApi } from '@/api/suno-api'
import { useAuth } from './useAuth'

export function useCredits() {
  const credits = ref<number | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastFetch = ref<number | null>(null)

  const fetchCredits = async (force = false) => {
    // Cache for 5 minutes
    if (!force && lastFetch.value && Date.now() - lastFetch.value < 300000) {
      return credits.value
    }

    const { isAuthenticated } = useAuth()
    if (!isAuthenticated.value) {
      return null
    }

    isLoading.value = true
    error.value = null

    try {
      const result = await sunoApi.getCredits()
      credits.value = result
      lastFetch.value = Date.now()
      return result
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取积分失败'
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    credits,
    isLoading,
    error,
    fetchCredits
  }
}
