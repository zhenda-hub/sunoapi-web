import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import TaskCard from '@/components/TaskCard.vue'
import { useTasksStore } from '@/stores/tasks'
import type { AudioData, LyricsData } from '@/api/types'

// Mock AudioPlayer component
vi.mock('@/components/AudioPlayer.vue', () => ({
  default: {
    name: 'AudioPlayer',
    template: '<div data-testid="audio-player">{{ title }}</div>',
    props: ['src', 'title']
  }
}))

describe('TaskCard Component', () => {
  let tasksStore: ReturnType<typeof useTasksStore>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    tasksStore = useTasksStore()
    vi.clearAllMocks()
  })

  const mountTaskCard = (taskId: string) => {
    return mount(TaskCard, {
      props: { taskId },
      global: {
        plugins: [pinia]
      }
    })
  }

  describe('Null Safety - Bug Fix Verification', () => {
    it('should not crash when task does not exist', () => {
      // Mount with a non-existent task ID
      const wrapper = mountTaskCard('non-existent-id')

      // Should render a message instead of crashing
      expect(wrapper.text()).toContain('任务不存在或已被删除')
      expect(wrapper.find('.border-gray-400').exists()).toBe(true)
    })

    it('should not crash when task is undefined', () => {
      // Add a task then remove it
      const task = tasksStore.addTask({
        id: 'temp-task',
        type: 'music',
        status: 'pending',
        prompt: 'Temporary'
      })

      tasksStore.removeTask('temp-task')

      // Mount component for removed task
      const wrapper = mountTaskCard('temp-task')

      // Should show "not found" message
      expect(wrapper.text()).toContain('任务不存在或已被删除')
    })

    it('should not throw error accessing properties of non-existent task', () => {
      // This is the core bug fix test
      // Before the fix, accessing task.status would crash
      const wrapper = mountTaskCard('ghost-id')

      // The component should handle this gracefully
      expect(wrapper.exists()).toBe(true)
      expect(() => wrapper.html()).not.toThrow()
    })
  })

  describe('Pending State', () => {
    it('should show loading spinner for pending task', () => {
      tasksStore.addTask({
        id: 'pending-task',
        type: 'music',
        status: 'pending',
        prompt: 'Generate a pop song'
      })

      const wrapper = mountTaskCard('pending-task')

      // Should show loading state
      expect(wrapper.text()).toContain('正在生成中')
      expect(wrapper.find('.animate-spin').exists()).toBe(true)

      // Should have yellow border for pending
      expect(wrapper.find('.border-yellow-400').exists()).toBe(true)
    })

    it('should display task prompt', () => {
      tasksStore.addTask({
        id: 'pending-task',
        type: 'music',
        status: 'pending',
        prompt: 'Create a happy electronic song'
      })

      const wrapper = mountTaskCard('pending-task')

      expect(wrapper.text()).toContain('Create a happy electronic song')
    })

    it('should display type badge', () => {
      tasksStore.addTask({
        id: 'music-task',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      const wrapper = mountTaskCard('music-task')

      // Should show "音乐" badge
      expect(wrapper.text()).toContain('音乐')
    })

    it('should display lyrics type badge correctly', () => {
      tasksStore.addTask({
        id: 'lyrics-task',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Write a song about coding'
      })

      const wrapper = mountTaskCard('lyrics-task')

      // Should show "歌词" badge
      expect(wrapper.text()).toContain('歌词')
    })
  })

  describe('Success State - Music', () => {
    it('should display audio player for successful music generation', () => {
      tasksStore.addTask({
        id: 'success-music',
        type: 'music',
        status: 'pending',
        prompt: 'Test song'
      })

      const audioResult: AudioData[] = [{
        id: 'audio-1',
        audio_url: 'https://example.com/song.mp3',
        title: 'My Generated Song',
        duration: 210,
        tags: 'pop, electronic, upbeat'
      }]

      tasksStore.updateTask('success-music', {
        status: 'success',
        result: audioResult
      })

      const wrapper = mountTaskCard('success-music')

      // Should show audio player
      expect(wrapper.find('[data-testid="audio-player"]').exists()).toBe(true)
      expect(wrapper.text()).toContain('My Generated Song')

      // Should show tags
      expect(wrapper.text()).toContain('标签')
      expect(wrapper.text()).toContain('pop, electronic, upbeat')

      // Should have green border for success
      expect(wrapper.find('.border-green-400').exists()).toBe(true)
    })

    it('should handle multiple audio results', () => {
      tasksStore.addTask({
        id: 'multi-audio',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      const audioResults: AudioData[] = [
        {
          id: 'audio-1',
          audio_url: 'https://example.com/song1.mp3',
          title: 'Version 1',
          duration: 180
        },
        {
          id: 'audio-2',
          audio_url: 'https://example.com/song2.mp3',
          title: 'Version 2',
          duration: 200
        }
      ]

      tasksStore.updateTask('multi-audio', {
        status: 'success',
        result: audioResults
      })

      const wrapper = mountTaskCard('multi-audio')

      // Should show both audio players
      const audioPlayers = wrapper.findAll('[data-testid="audio-player"]')
      expect(audioPlayers).toHaveLength(2)
    })
  })

  describe('Success State - Lyrics', () => {
    it('should display lyrics for successful lyrics generation', () => {
      tasksStore.addTask({
        id: 'success-lyrics',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Write a song about Vue'
      })

      const lyricsResult: LyricsData = {
        id: 'lyrics-1',
        text: 'Verse 1:\nVue is amazing\n\nChorus:\nComposition API is the way\nReactive and clean every day'
      }

      tasksStore.updateTask('success-lyrics', {
        status: 'success',
        result: lyricsResult
      })

      const wrapper = mountTaskCard('success-lyrics')

      // Should show lyrics text
      expect(wrapper.text()).toContain('Vue is amazing')
      expect(wrapper.text()).toContain('Composition API is the way')

      // Should have copy button
      expect(wrapper.text()).toContain('复制歌词')
    })

    it('should copy lyrics when copy button is clicked', async () => {
      tasksStore.addTask({
        id: 'copy-test',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Test'
      })

      const lyricsResult: LyricsData = {
        id: 'lyrics-1',
        text: 'These are test lyrics'
      }

      tasksStore.updateTask('copy-test', {
        status: 'success',
        result: lyricsResult
      })

      const wrapper = mountTaskCard('copy-test')

      // Find and click copy button
      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      // Should call clipboard API
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('These are test lyrics')

      // Button text should change
      expect(wrapper.text()).toContain('已复制')
    })

    it('should reset copy state after timeout', async () => {
      vi.useFakeTimers()

      tasksStore.addTask({
        id: 'copy-reset',
        type: 'lyrics',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('copy-reset', {
        status: 'success',
        result: {
          id: 'lyrics-1',
          text: 'Test lyrics'
        }
      })

      const wrapper = mountTaskCard('copy-reset')

      const copyButton = wrapper.find('button')
      await copyButton.trigger('click')

      expect(wrapper.text()).toContain('已复制')

      // Fast forward past the 2 second timeout
      vi.advanceTimersByTime(2500)

      // Re-render to see the updated state
      await wrapper.vm.$nextTick()

      // Text should be back to "复制歌词"
      expect(wrapper.text()).toContain('复制歌词')

      vi.useRealTimers()
    })
  })

  describe('Failed State', () => {
    it('should display error message', () => {
      tasksStore.addTask({
        id: 'failed-task',
        type: 'music',
        status: 'pending',
        prompt: 'Invalid prompt'
      })

      tasksStore.updateTask('failed-task', {
        status: 'failed',
        error: 'Generation failed: Invalid prompt format'
      })

      const wrapper = mountTaskCard('failed-task')

      // Should show error message
      expect(wrapper.text()).toContain('Generation failed: Invalid prompt format')

      // Should have red border for failed
      expect(wrapper.find('.border-red-400').exists()).toBe(true)
    })

    it('should show default error message when no error provided', () => {
      tasksStore.addTask({
        id: 'failed-no-msg',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('failed-no-msg', { status: 'failed' })

      const wrapper = mountTaskCard('failed-no-msg')

      // Should show default message
      expect(wrapper.text()).toContain('生成失败，请重试')
    })

    it('should show retry button on failed state', () => {
      tasksStore.addTask({
        id: 'retry-test',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('retry-test', {
        status: 'failed',
        error: 'Network error'
      })

      const wrapper = mountTaskCard('retry-test')

      // Should show retry button
      const retryButton = wrapper.find('button')
      expect(retryButton.text()).toContain('重试')
    })

    it('should emit retry event when retry button is clicked', async () => {
      tasksStore.addTask({
        id: 'retry-emit',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('retry-emit', {
        status: 'failed',
        error: 'Timeout'
      })

      const wrapper = mountTaskCard('retry-emit')

      const retryButton = wrapper.find('button')
      await retryButton.trigger('click')

      // Should emit retry event
      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')?.length).toBe(1)
    })

    it('should not show retry button for non-failed states', () => {
      tasksStore.addTask({
        id: 'pending-no-retry',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      const wrapper = mountTaskCard('pending-no-retry')

      // Should not show retry button for pending
      expect(wrapper.text()).not.toContain('重试')
    })
  })

  describe('Created Time Display', () => {
    it('should display formatted creation time', () => {
      const now = new Date()
      tasksStore.addTask({
        id: 'time-test',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      // Manually set createdAt to a known time
      const task = tasksStore.getTask('time-test')
      if (task) {
        task.createdAt = new Date('2024-01-15T14:30:00')
      }

      const wrapper = mountTaskCard('time-test')

      // Should display time (format may vary by locale)
      expect(wrapper.text()).toMatch(/\d{1,2}:\d{2}/)
    })
  })

  describe('Border Color by Status', () => {
    it('should have yellow border for pending', () => {
      tasksStore.addTask({
        id: 'border-pending',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      const wrapper = mountTaskCard('border-pending')
      expect(wrapper.find('.border-yellow-400').exists()).toBe(true)
    })

    it('should have green border for success', () => {
      tasksStore.addTask({
        id: 'border-success',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('border-success', {
        status: 'success',
        result: []
      })

      const wrapper = mountTaskCard('border-success')
      expect(wrapper.find('.border-green-400').exists()).toBe(true)
    })

    it('should have red border for failed', () => {
      tasksStore.addTask({
        id: 'border-failed',
        type: 'music',
        status: 'pending',
        prompt: 'Test'
      })

      tasksStore.updateTask('border-failed', {
        status: 'failed'
      })

      const wrapper = mountTaskCard('border-failed')
      expect(wrapper.find('.border-red-400').exists()).toBe(true)
    })
  })
})
