import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

export function useAuth() {
  const authStore = useAuthStore()
  const { apiKey, isAuthenticated } = storeToRefs(authStore)

  const login = (key: string): boolean => {
    if (!key || key.trim().length === 0) {
      return false
    }
    authStore.setApiKey(key.trim())
    return true
  }

  const logout = () => {
    authStore.clearApiKey()
  }

  const hasValidApiKey = () => {
    return isAuthenticated.value
  }

  return {
    apiKey,
    isAuthenticated,
    login,
    logout,
    hasValidApiKey
  }
}
