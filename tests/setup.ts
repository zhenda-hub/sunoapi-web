import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'
import { config } from '@vue/test-utils'

// Global Vue Test Utils config
config.global.stubs = {
  teleport: true
}

// Mock API
vi.mock('@/api/suno-api', () => ({
  sunoApi: {
    generateMusic: vi.fn(),
    generateLyrics: vi.fn(),
    getTaskStatus: vi.fn(),
    getCredits: vi.fn()
  }
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn()
}

global.localStorage = localStorageMock as Storage

// Mock navigator.clipboard
const clipboardMock = {
  writeText: vi.fn().mockResolvedValue(undefined),
  readText: vi.fn()
}

global.navigator = {
  ...global.navigator,
  clipboard: clipboardMock as unknown as Clipboard
}

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
}

global.IntersectionObserver = MockIntersectionObserver as any
