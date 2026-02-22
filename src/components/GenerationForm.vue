<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Prompt -->
    <div>
      <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        音乐描述 <span class="text-red-500">*</span>
      </label>
      <textarea
        v-model="form.prompt"
        rows="3"
        maxlength="5000"
        placeholder="描述你想要的音乐，例如：一首充满活力的电子舞曲，带有合成器主音"
        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        required
      ></textarea>
      <div class="text-xs text-gray-500 mt-1">{{ form.prompt.length }} / 5000</div>
    </div>

    <!-- Custom Mode Toggle -->
    <div class="flex items-center gap-2">
      <input
        id="customMode"
        v-model="form.customMode"
        type="checkbox"
        class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
      >
      <label for="customMode" class="text-sm text-gray-700 dark:text-gray-300">
        自定义模式 (高级选项)
      </label>
    </div>

    <!-- Custom Mode Fields -->
    <template v-if="form.customMode">
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          音乐风格 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.style"
          type="text"
          maxlength="1000"
          placeholder="例如：电子、爵士、摇滚、古典"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
        <div class="text-xs text-gray-500 mt-1">{{ form.style?.length ?? 0 }} / 1000</div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          歌曲标题 <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.title"
          type="text"
          maxlength="100"
          placeholder="给你的歌曲起个名字"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
        <div class="text-xs text-gray-500 mt-1">{{ form.title?.length ?? 0 }} / 100</div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          模型版本
        </label>
        <select
          v-model="form.model"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="V5">V5 - 最快速度，卓越表现力</option>
          <option value="V4_5ALL">V4.5-all - 更好歌曲结构</option>
          <option value="V4_5PLUS">V4.5-plus - 更丰富音色</option>
          <option value="V4_5">V4.5 - 高级功能</option>
          <option value="V4">V4 - 最佳音频质量</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <input
          id="instrumental"
          v-model="form.instrumental"
          type="checkbox"
          class="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
        >
        <label for="instrumental" class="text-sm text-gray-700 dark:text-gray-300">
          纯音乐 (无人声)
        </label>
      </div>
    </template>

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="isLoading || !isFormValid"
      class="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
    >
      <svg v-if="isLoading" class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      {{ isLoading ? '生成中...' : '生成音乐' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { sunoApi } from '@/api/suno-api'
import { useTasksStore } from '@/stores/tasks'
import { useTaskPolling } from '@/composables/useTaskPolling'
import type { GenerateMusicRequest } from '@/api/types'

const emit = defineEmits<{
  submitted: [taskId: string]
}>()

const { hasValidApiKey } = useAuth()
const tasksStore = useTasksStore()
const { startPolling } = useTaskPolling()

const isLoading = ref(false)
const form = ref<GenerateMusicRequest>({
  prompt: '',
  customMode: false,
  style: '',
  title: '',
  instrumental: false,
  model: 'V5'
})

const isFormValid = computed(() => {
  if (!form.value.prompt.trim()) return false
  if (form.value.customMode) {
    return (form.value.style?.trim() ?? '') !== '' && (form.value.title?.trim() ?? '') !== ''
  }
  return true
})

async function handleSubmit() {
  if (!hasValidApiKey()) {
    alert('请先设置 API Key')
    return
  }

  if (!isFormValid.value) return

  isLoading.value = true

  try {
    const params = { ...form.value }
    if (!params.customMode) {
      delete params.style
      delete params.title
      delete params.instrumental
    }
    // Add callBackUrl (using placeholder since we use polling)
    params.callBackUrl = window.location.origin + '/callback'

    const taskId = await sunoApi.generateMusic(params)

    // Add to tasks store
    tasksStore.addTask({
      id: taskId,
      type: 'music',
      status: 'pending',
      prompt: form.value.prompt
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
    form.value = {
      prompt: '',
      customMode: false,
      style: '',
      title: '',
      instrumental: false,
      model: 'V5'
    }

    emit('submitted', taskId)
  } catch (error) {
    alert(error instanceof Error ? error.message : '生成失败')
  } finally {
    isLoading.value = false
  }
}
</script>
