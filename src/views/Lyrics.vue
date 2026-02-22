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
          <router-link to="/settings" class="text-gray-600 dark:text-gray-300 hover:text-primary-500">
            设置
          </router-link>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-2xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">生成歌词</h1>

        <!-- Form -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <LyricsForm @submitted="onSubmitted" />
        </div>

        <!-- Active Tasks -->
        <div v-if="lyricsTasks.length > 0" class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">生成记录</h2>
          <TaskCard
            v-for="task in lyricsTasks"
            :key="task.id"
            :task-id="task.id"
            @retry="onRetry(task)"
          />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useTasksStore } from '@/stores/tasks'
import LyricsForm from '@/components/LyricsForm.vue'
import TaskCard from '@/components/TaskCard.vue'
import type { Task } from '@/api/types'

const tasksStore = useTasksStore()

const lyricsTasks = computed(() => tasksStore.getTasksByType('lyrics'))

function onSubmitted(_taskId: string) {
  // Scroll to tasks
  setTimeout(() => {
    const tasksSection = document.querySelector('[class*="space-y-4"]')
    tasksSection?.scrollIntoView({ behavior: 'smooth' })
  }, 100)
}

function onRetry(task: Task) {
  console.log('Retry task:', task.id)
}
</script>
