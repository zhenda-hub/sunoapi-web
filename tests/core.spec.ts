import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import type { Task } from '@/api/types'

describe('Core Flow Integration Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('API Key Management', () => {
    it('should set and store API key', () => {
      const authStore = useAuthStore()

      authStore.setApiKey('test-api-key')

      expect(authStore.apiKey).toBe('test-api-key')
      expect(authStore.isAuthenticated).toBe(true)
      expect(localStorage.setItem).toHaveBeenCalledWith('suno_api_key', 'test-api-key')
    })

    it('should load API key from localStorage on initialization', () => {
      vi.mocked(localStorage.getItem).mockReturnValue('stored-api-key')

      const authStore = useAuthStore()
      authStore.initFromStorage()

      expect(authStore.apiKey).toBe('stored-api-key')
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should clear API key', () => {
      const authStore = useAuthStore()
      authStore.setApiKey('test-key')

      authStore.clearApiKey()

      expect(authStore.apiKey).toBe('')
      expect(authStore.isAuthenticated).toBe(false)
      expect(localStorage.removeItem).toHaveBeenCalledWith('suno_api_key')
    })
  })

  describe('Task Management', () => {
    it('should add a new task', () => {
      const tasksStore = useTasksStore()

      const task = tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      expect(task.id).toBe('task-1')
      expect(task.status).toBe('pending')
      expect(tasksStore.tasks).toHaveLength(1)
    })

    it('should update task status', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      tasksStore.updateTask('task-1', { status: 'success' })

      const task = tasksStore.getTask('task-1')
      expect(task?.status).toBe('success')
    })

    it('should handle updateTask for non-existent task gracefully', () => {
      const tasksStore = useTasksStore()

      // Should not throw error
      expect(() => {
        tasksStore.updateTask('non-existent', { status: 'success' })
      }).not.toThrow()

      expect(tasksStore.tasks).toHaveLength(0)
    })

    it('should return undefined for non-existent task', () => {
      const tasksStore = useTasksStore()

      const task = tasksStore.getTask('non-existent')

      expect(task).toBeUndefined()
    })

    it('should remove task', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      tasksStore.removeTask('task-1')

      expect(tasksStore.tasks).toHaveLength(0)
      expect(tasksStore.getTask('task-1')).toBeUndefined()
    })

    it('should filter tasks by type', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Music task'
      })

      tasksStore.addTask({
        id: 'task-2',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Lyrics task'
      })

      const musicTasks = tasksStore.getTasksByType('music')
      const lyricsTasks = tasksStore.getTasksByType('lyrics')

      expect(musicTasks).toHaveLength(1)
      expect(lyricsTasks).toHaveLength(1)
      expect(musicTasks[0].id).toBe('task-1')
      expect(lyricsTasks[0].id).toBe('task-2')
    })

    it('should filter tasks by status', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Pending task'
      })

      tasksStore.addTask({
        id: 'task-2',
        type: 'music',
        status: 'success',
        prompt: 'Success task'
      })

      const pendingTasks = tasksStore.getTasksByStatus('pending')
      const successTasks = tasksStore.getTasksByStatus('success')

      expect(pendingTasks).toHaveLength(1)
      expect(successTasks).toHaveLength(1)
      expect(pendingTasks[0].id).toBe('task-1')
      expect(successTasks[0].id).toBe('task-2')
    })
  })

  describe('Task Creation with Results', () => {
    it('should handle task with music result', () => {
      const tasksStore = useTasksStore()

      const task = tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      tasksStore.updateTask('task-1', {
        status: 'success',
        result: [
          {
            id: 'audio-1',
            audio_url: 'https://example.com/audio.mp3',
            title: 'Test Song',
            duration: 180,
            tags: 'pop, electronic'
          }
        ]
      })

      const updatedTask = tasksStore.getTask('task-1')
      expect(updatedTask?.status).toBe('success')
      expect(updatedTask?.result).toHaveLength(1)
      expect((updatedTask?.result as any)[0].title).toBe('Test Song')
    })

    it('should handle task with lyrics result', () => {
      const tasksStore = useTasksStore()

      const task = tasksStore.addTask({
        id: 'task-1',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Write lyrics about AI'
      })

      const lyricsData = {
        id: 'lyrics-1',
        text: 'Verse 1:\nAI is amazing\nChorus:\nAI generates music'
      }

      tasksStore.updateTask('task-1', {
        status: 'success',
        result: lyricsData
      })

      const updatedTask = tasksStore.getTask('task-1')
      expect(updatedTask?.status).toBe('success')
      expect((updatedTask?.result as any).text).toContain('AI is amazing')
    })
  })

  describe('Task Error Handling', () => {
    it('should handle failed task with error message', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      tasksStore.updateTask('task-1', {
        status: 'failed',
        error: 'Generation failed: Invalid prompt'
      })

      const task = tasksStore.getTask('task-1')
      expect(task?.status).toBe('failed')
      expect(task?.error).toBe('Generation failed: Invalid prompt')
    })

    it('should handle failed task without error message', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      tasksStore.updateTask('task-1', { status: 'failed' })

      const task = tasksStore.getTask('task-1')
      expect(task?.status).toBe('failed')
      expect(task?.error).toBeUndefined()
    })
  })

  describe('Store Clear Operations', () => {
    it('should clear all tasks', () => {
      const tasksStore = useTasksStore()

      tasksStore.addTask({
        id: 'task-1',
        type: 'music',
        status: 'pending',
        prompt: 'Test 1'
      })

      tasksStore.addTask({
        id: 'task-2',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Test 2'
      })

      expect(tasksStore.tasks).toHaveLength(2)

      tasksStore.clearAll()

      expect(tasksStore.tasks).toHaveLength(0)
    })
  })

  describe('Null Safety - TaskCard Requirements', () => {
    it('should handle getTask returning undefined safely', () => {
      const tasksStore = useTasksStore()

      const task = tasksStore.getTask('non-existent-id')

      // This is the key test for the bug fix
      // getTask should return undefined, not throw
      expect(task).toBeUndefined()

      // Accessing properties should be handled by template v-if
      // But we verify the store behavior is correct
      expect(tasksStore.tasks).toHaveLength(0)
    })

    it('should not crash when updating properties on undefined task', () => {
      const tasksStore = useTasksStore()

      // This should not throw
      expect(() => {
        tasksStore.updateTask('ghost-task', { status: 'success' })
      }).not.toThrow()
    })
  })
})
