<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Prompt -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        歌词描述 <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="prompt"
        rows="4"
        maxlength="5000"
        placeholder="描述你想要的歌词内容，例如：一首关于克服挑战和找到内在力量的歌曲"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      ></textarea>
      <div class="text-xs text-gray-500 mt-1">{{ prompt.length }} / 5000</div>
    </div>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading"
      class="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ isLoading ? '生成中...' : '生成歌词' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { sunoApi } from '@/api/suno-api'
import { useTasksStore } from '@/stores/tasks'
import { useTaskPolling } from '@/composables/useTaskPolling'

const emit = defineEmits<{
  submitted: [taskId: string]
}>()

const { hasValidApiKey } = useAuth()
const tasksStore = useTasksStore()
const { startPolling } = useTaskPolling()

const isLoading = ref(false)
const prompt = ref('')

async function handleSubmit() {
  if (!hasValidApiKey()) {
    alert('请先设置 API Key')
    return
  }

  if (!prompt.value.trim()) return

  isLoading.value = true

  try {
    const taskId = await sunoApi.generateLyrics({
      prompt: prompt.value,
      callBackUrl: window.location.origin + '/callback'
    })

    // Add to tasks store
    tasksStore.addTask({
      id: taskId,
      type: 'lyrics',
      status: 'pending',
      prompt: prompt.value
    })

    // Start polling
    startPolling(taskId, (result) => {
      tasksStore.updateTask(taskId, {
        status: result.status,
        result: result.result,
        error: result.error
      })
    })

    // Reset form
    prompt.value = ''

    emit('submitted', taskId)
  } catch (error) {
    alert(error instanceof Error ? error.message : '生成失败')
  } finally {
    isLoading.value = false
  }
}
</script>
