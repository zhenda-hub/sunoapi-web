import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/api/client'

export const useAuthStore = defineStore('auth', () => {
  // State
  const apiKey = ref('')
  const isAuthenticated = computed(() => apiKey.value.length > 0)

  // Actions
  function setApiKey(key: string) {
    apiKey.value = key
    apiClient.setApiKey(key)
    localStorage.setItem('suno_api_key', key)
  }

  function clearApiKey() {
    apiKey.value = ''
    apiClient.clearApiKey()
    localStorage.removeItem('suno_api_key')
  }

  function initFromStorage() {
    const key = localStorage.getItem('suno_api_key')
    if (key) {
      apiKey.value = key
      apiClient.setApiKey(key)
    }
  }

  return {
    apiKey,
    isAuthenticated,
    setApiKey,
    clearApiKey,
    initFromStorage
  }
})
