<template>
  <div v-if="task" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4" :class="borderClass">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-2">
        <span class="text-xs px-2 py-1 rounded-full" :class="typeBadgeClass">{{ typeLabel }}</span>
        <span class="text-xs text-gray-500">{{ createdAt }}</span>
      </div>
      <button
        v-if="task.status === 'failed'"
        @click="$emit('retry')"
        class="text-sm text-primary-500 hover:text-primary-600"
      >
        重试
      </button>
    </div>

    <!-- Prompt -->
    <p class="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-2">{{ task.prompt }}</p>

    <!-- Pending State -->
    <div v-if="task.status === 'pending'" class="flex items-center gap-2 text-gray-500">
      <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span>正在生成中...</span>
    </div>

    <!-- Success State - Music -->
    <div v-else-if="task.status === 'success' && task.type === 'music'" class="space-y-3">
      <AudioPlayer
        v-for="audio in task.result as AudioData[]"
        :key="audio.id"
        :src="audio.audio_url"
        :title="audio.title"
      />
      <div v-if="(task.result as AudioData[])[0]?.tags" class="text-xs text-gray-500">
        标签: {{ (task.result as AudioData[])[0].tags }}
      </div>
    </div>

    <!-- Success State - Lyrics -->
    <div v-else-if="task.status === 'success' && task.type === 'lyrics'" class="bg-gray-50 dark:bg-gray-900 rounded p-3">
      <pre class="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">{{ (task.result as LyricsData).text }}</pre>
      <button
        @click="copyLyrics"
        class="mt-2 text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        {{ copied ? '已复制' : '复制歌词' }}
      </button>
    </div>

    <!-- Failed State -->
    <div v-else-if="task.status === 'failed'" class="text-red-500 text-sm">
      {{ task.error || '生成失败，请重试' }}
    </div>
  </div>
  <div v-else class="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md p-4 border-l-4 border-gray-400">
    <p class="text-sm text-gray-500 dark:text-gray-400">任务不存在或已被删除</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import AudioPlayer from './AudioPlayer.vue'
import type { AudioData, LyricsData } from '@/api/types'

interface Props {
  taskId: string
}

const props = defineProps<Props>()
defineEmits<{
  retry: []
}>()

const tasksStore = useTasksStore()
const task = computed(() => tasksStore.getTask(props.taskId))
const copied = ref(false)

const borderClass = computed(() => {
  if (!task.value) return 'border-gray-400'
  switch (task.value.status) {
    case 'pending': return 'border-yellow-400'
    case 'success': return 'border-green-400'
    case 'failed': return 'border-red-400'
  }
})

const typeBadgeClass = computed(() => {
  if (!task.value) return 'bg-gray-100 text-gray-700'
  return task.value.type === 'music'
    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
    : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
})

const typeLabel = computed(() => {
  if (!task.value) return '未知'
  return task.value.type === 'music' ? '音乐' : '歌词'
})

const createdAt = computed(() => {
  if (!task.value) return ''
  const date = new Date(task.value.createdAt)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
})

function copyLyrics() {
  if (!task.value?.result) return
  const text = (task.value.result as LyricsData).text
  navigator.clipboard.writeText(text)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}
</script>
