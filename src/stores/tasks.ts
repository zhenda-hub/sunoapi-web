import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Task, TaskType, TaskStatus } from '@/api/types'

export const useTasksStore = defineStore('tasks', () => {
  // State
  const tasks = ref<Task[]>([])

  // Actions
  function addTask(task: Omit<Task, 'createdAt'>) {
    const newTask: Task = {
      ...task,
      createdAt: new Date()
    }
    tasks.value.unshift(newTask)
    return newTask
  }

  function updateTask(id: string, updates: Partial<Task>) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value[index] = { ...tasks.value[index], ...updates }
    }
  }

  function removeTask(id: string) {
    const index = tasks.value.findIndex(t => t.id === id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
  }

  function getTask(id: string): Task | undefined {
    return tasks.value.find(t => t.id === id)
  }

  function getTasksByType(type: TaskType): Task[] {
    return tasks.value.filter(t => t.type === type)
  }

  function getTasksByStatus(status: TaskStatus): Task[] {
    return tasks.value.filter(t => t.status === status)
  }

  function clearAll() {
    tasks.value = []
  }

  return {
    tasks,
    addTask,
    updateTask,
    removeTask,
    getTask,
    getTasksByType,
    getTasksByStatus,
    clearAll
  }
})
