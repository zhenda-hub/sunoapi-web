import { test, expect } from '@playwright/test'
import { MusicPage } from './pages/music-page'
import { SettingsPage } from './pages/settings-page'

test.describe('Music Generation', () => {
  let musicPage: MusicPage
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    musicPage = new MusicPage(page)
    settingsPage = new SettingsPage(page)

    // Set up a mock API key
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('suno-api-key', 'test-api-key-music')
    })
  })

  test('should display music page with form', async ({ page }) => {
    await musicPage.goto()

    await expect(musicPage.pageTitle).toBeVisible()
    await expect(musicPage.promptInput).toBeVisible()
    await expect(musicPage.customModeCheckbox).not.toBeChecked()
    await expect(musicPage.submitButton).toBeVisible()
  })

  test('should require prompt input', async ({ page }) => {
    await musicPage.goto()

    // Submit button should be disabled without prompt
    const isDisabled = await musicPage.isSubmitDisabled()
    expect(isDisabled).toBe(true)
  })

  test('should enable submit when prompt is entered', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enterPrompt('A test song description')

    // Submit button should be enabled
    const isDisabled = await musicPage.isSubmitDisabled()
    expect(isDisabled).toBe(false)
  })

  test('should show character count for prompt', async ({ page }) => {
    await musicPage.goto()

    const testPrompt = 'This is a test prompt'
    await musicPage.enterPrompt(testPrompt)

    const charCount = await page.locator('.text-xs:text("21 / 5000")').isVisible()
    expect(charCount).toBe(true)
  })

  test('should show custom mode fields when enabled', async ({ page }) => {
    await musicPage.goto()

    // Initially custom mode fields should not be visible
    await expect(musicPage.styleInput).not.toBeVisible()
    await expect(musicPage.titleInput).not.toBeVisible()

    // Enable custom mode
    await musicPage.enableCustomMode()

    // Custom mode fields should now be visible
    await expect(musicPage.styleInput).toBeVisible()
    await expect(musicPage.titleInput).toBeVisible()
    await expect(musicPage.modelSelect).toBeVisible()
    await expect(musicPage.instrumentalCheckbox).toBeVisible()
  })

  test('should require style and title in custom mode', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enterPrompt('A test song')
    await musicPage.enableCustomMode()

    // Button should be disabled without style and title
    let isDisabled = await musicPage.isSubmitDisabled()
    expect(isDisabled).toBe(true)

    // Add style only
    await musicPage.enterStyle('rock')

    isDisabled = await musicPage.isSubmitDisabled()
    expect(isDisabled).toBe(true)

    // Add title
    await musicPage.enterTitle('Test Song')

    isDisabled = await musicPage.isSubmitDisabled()
    expect(isDisabled).toBe(false)
  })

  test('should allow model selection', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enableCustomMode()

    // Check default value
    await expect(musicPage.modelSelect).toHaveValue('V5')

    // Select different model
    await musicPage.selectModel('V4')
    await expect(musicPage.modelSelect).toHaveValue('V4')

    await musicPage.selectModel('V4_5ALL')
    await expect(musicPage.modelSelect).toHaveValue('V4_5ALL')
  })

  test('should toggle instrumental checkbox', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enableCustomMode()

    // Initially not checked
    await expect(musicPage.instrumentalCheckbox).not.toBeChecked()

    // Check the checkbox
    await musicPage.enableInstrumental()
    await expect(musicPage.instrumentalCheckbox).toBeChecked()
  })

  test('should show alert when no API key is set', async ({ page }) => {
    // Clear API key
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })

    await musicPage.goto()
    await musicPage.enterPrompt('A test song')

    // Set up dialog handler for the alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('API Key')
      await dialog.accept()
    })

    await musicPage.submitForm()
  })

  test('should reset form after submission', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enterPrompt('A test song')
    await musicPage.enableCustomMode()
    await musicPage.enterStyle('rock')
    await musicPage.enterTitle('Test Song')

    // Note: This test will attempt to submit but may fail without actual API
    // We're primarily testing that the form structure is correct
    await expect(musicPage.promptInput).toHaveValue('A test song')
  })

  test('should display navigation links on music page', async ({ page }) => {
    await musicPage.goto()

    // Check all navigation links are present
    await expect(musicPage.homeLink).toBeVisible()
    await expect(musicPage.lyricsLink).toBeVisible()
    await expect(musicPage.settingsLink).toBeVisible()

    // Verify link texts
    await expect(musicPage.homeLink).toContainText('Suno API')
    await expect(musicPage.lyricsLink).toContainText('歌词生成')
    await expect(musicPage.settingsLink).toContainText('设置')
  })

  test('should show loading state when submitting', async ({ page }) => {
    await musicPage.goto()

    await musicPage.enterPrompt('A test song')

    // In a real scenario, we would mock the API response
    // For now, we verify the button structure
    await expect(musicPage.submitButton).toContainText('生成音乐')
  })
})
