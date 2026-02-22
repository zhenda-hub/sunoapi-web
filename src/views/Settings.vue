<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-sm">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <router-link to="/" class="text-xl font-bold text-primary-500">
          Suno API
        </router-link>
        <nav class="flex items-center gap-4">
          <router-link to="/music" class="text-gray-600 dark:text-gray-300 hover:text-primary-500">
            音乐生成
          </router-link>
          <router-link to="/lyrics" class="text-gray-600 dark:text-gray-300 hover:text-primary-500">
            歌词生成
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">设置</h1>

        <!-- API Key Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">API Key</h2>

          <div class="space-y-4">
            <div v-if="isAuthenticated" class="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p class="text-green-700 dark:text-green-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                API Key 已设置
              </p>
              <p class="text-sm text-green-600 dark:text-green-400 mt-1">
                当前 Key: {{ maskedApiKey }}
              </p>
            </div>

            <div v-else class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p class="text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
                未设置 API Key
              </p>
              <p class="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                请从 Suno API 获取您的 API Key
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入 API Key
              </label>
              <input
                v-model="inputKey"
                type="password"
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
                class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
            </div>

            <div class="flex gap-3">
              <button
                @click="saveApiKey"
                :disabled="!inputKey.trim()"
                class="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
              >
                保存 API Key
              </button>
              <button
                v-if="isAuthenticated"
                @click="clearApiKey"
                class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
              >
                清除
              </button>
            </div>
            <div v-if="saveMessage" class="mt-2 text-sm text-green-600 dark:text-green-400">
              {{ saveMessage }}
            </div>
          </div>
        </div>

        <!-- Credits Section -->
        <div v-if="isAuthenticated" class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-900 dark:text-white">剩余积分</h2>
              <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                您的账户剩余可用积分
              </p>
            </div>
            <div class="text-right">
              <div v-if="creditsLoading" class="text-gray-500">加载中...</div>
              <div v-else-if="credits === -1" class="text-3xl font-bold text-gray-400">不可用</div>
              <div v-else class="text-3xl font-bold text-primary-500">{{ credits }}</div>
            </div>
          </div>
          <button
            @click="refreshCredits"
            :disabled="creditsLoading"
            class="mt-4 w-full py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4" :class="{ 'animate-spin': creditsLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>

        <!-- Info Section -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mt-6">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">关于 API Key</h2>
          <div class="prose prose-sm dark:prose-invert text-gray-600 dark:text-gray-400">
            <ul class="space-y-2">
              <li>API Key 仅存储在您的浏览器本地，不会上传到任何服务器</li>
              <li>当前使用 <strong>AceDataCloud</strong> API 服务</li>
              <li>获取 API Key 请访问 <a href="https://platform.acedata.cloud/services/suno" target="_blank" class="text-primary-500 hover:underline">platform.acedata.cloud</a></li>
              <li>新用户注册可获得免费试用额度</li>
              <li>API Key 用于调用 Suno API 服务，每次生成会消耗相应积分</li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useCredits } from '@/composables/useCredits'

const { apiKey, isAuthenticated, login, logout } = useAuth()
const { credits, isLoading: creditsLoading, fetchCredits } = useCredits()

const inputKey = ref('')
const saveMessage = ref('')

const maskedApiKey = computed(() => {
  if (!apiKey.value) return ''
  if (apiKey.value.length <= 10) return '*'.repeat(apiKey.value.length)
  return apiKey.value.slice(0, 4) + '*'.repeat(apiKey.value.length - 8) + apiKey.value.slice(-4)
})

function saveApiKey() {
  console.log('[Settings] saveApiKey called, inputKey:', inputKey.value ? '***' + inputKey.value.slice(-4) : 'empty')
  if (inputKey.value.trim()) {
    const success = login(inputKey.value)
    console.log('[Settings] login result:', success)
    console.log('[Settings] isAuthenticated after login:', isAuthenticated.value)

    if (success) {
      saveMessage.value = 'API Key 已保存'
      inputKey.value = ''
      fetchCredits()
      setTimeout(() => { saveMessage.value = '' }, 3000)
    }
  } else {
    console.log('[Settings] inputKey is empty, not saving')
  }
}

function clearApiKey() {
  logout()
}

function refreshCredits() {
  fetchCredits(true)
}

onMounted(() => {
  if (isAuthenticated.value) {
    fetchCredits()
  }
})
</script>
