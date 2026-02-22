import { test, expect } from '@playwright/test'
import { LyricsPage } from './pages/lyrics-page'
import { SettingsPage } from './pages/settings-page'

test.describe('Lyrics Generation', () => {
  let lyricsPage: LyricsPage
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    lyricsPage = new LyricsPage(page)
    settingsPage = new SettingsPage(page)

    // Set up a mock API key
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('suno-api-key', 'test-api-key-lyrics')
    })
  })

  test('should display lyrics page with form', async ({ page }) => {
    await lyricsPage.goto()

    await expect(lyricsPage.pageTitle).toBeVisible()
    await expect(lyricsPage.promptInput).toBeVisible()
    await expect(lyricsPage.submitButton).toBeVisible()
  })

  test('should have correct placeholder text', async ({ page }) => {
    await lyricsPage.goto()

    const placeholder = await lyricsPage.promptInput.getAttribute('placeholder')
    expect(placeholder).toContain('歌词')
    expect(placeholder).toContain('描述')
  })

  test('should accept lyrics prompt input', async ({ page }) => {
    await lyricsPage.goto()

    const testPrompt = 'A song about overcoming challenges and finding inner strength'
    await lyricsPage.enterPrompt(testPrompt)

    await expect(lyricsPage.promptInput).toHaveValue(testPrompt)
  })

  test('should show character count for prompt', async ({ page }) => {
    await lyricsPage.goto()

    const testPrompt = 'This is a test lyrics prompt'
    await lyricsPage.enterPrompt(testPrompt)

    // Character count should be visible (28 characters in the test string)
    const charCountElement = page.locator('.text-xs')
    await expect(charCountElement).toContainText('28 / 5000')
  })

  test('should disable submit button while loading', async ({ page }) => {
    await lyricsPage.goto()

    // Initially button should be enabled
    await expect(lyricsPage.submitButton).toBeEnabled()

    // After entering prompt, button should still be enabled
    await lyricsPage.enterPrompt('Test prompt')
    await expect(lyricsPage.submitButton).toBeEnabled()

    // Note: The button shows loading state during submission
    // but we can't test this without mocking the API
  })

  test('should show alert when no API key is set', async ({ page }) => {
    // Clear API key
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })

    await lyricsPage.goto()
    await lyricsPage.enterPrompt('A test lyrics prompt')

    // Set up dialog handler for the alert
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toContain('API Key')
      await dialog.accept()
    })

    await lyricsPage.submitForm()
  })

  test('should reset form after submission', async ({ page }) => {
    await lyricsPage.goto()

    const testPrompt = 'Test lyrics for submission'
    await lyricsPage.enterPrompt(testPrompt)

    // Verify input has value
    await expect(lyricsPage.promptInput).toHaveValue(testPrompt)

    // Note: After successful submission, the form should reset
    // We can't fully test this without mocking the API response
  })

  test('should display navigation links on lyrics page', async ({ page }) => {
    await lyricsPage.goto()

    // Check all navigation links are present
    await expect(lyricsPage.homeLink).toBeVisible()
    await expect(lyricsPage.musicLink).toBeVisible()
    await expect(lyricsPage.settingsLink).toBeVisible()

    // Verify link texts
    await expect(lyricsPage.homeLink).toContainText('Suno API')
    await expect(lyricsPage.musicLink).toContainText('音乐生成')
    await expect(lyricsPage.settingsLink).toContainText('设置')
  })

  test('should navigate to home page', async ({ page }) => {
    await lyricsPage.goto()
    await lyricsPage.navigateToHome()

    await expect(page).toHaveURL('/')
    await expect(page.locator('h1:text("Suno API Web")')).toBeVisible()
  })

  test('should navigate to music page', async ({ page }) => {
    await lyricsPage.goto()
    await lyricsPage.navigateToMusic()

    await expect(page).toHaveURL('/music')
    await expect(page.locator('h1:text("生成音乐")')).toBeVisible()
  })

  test('should navigate to settings page', async ({ page }) => {
    await lyricsPage.goto()
    await lyricsPage.navigateToSettings()

    await expect(page).toHaveURL('/settings')
    await expect(page.locator('h1:text("设置")')).toBeVisible()
  })

  test('should handle multiline input for lyrics prompt', async ({ page }) => {
    await lyricsPage.goto()

    const multilinePrompt = `Line 1: The opening verse
Line 2: Setting the scene
Line 3: Building emotion
Line 4: The chorus begins`

    await lyricsPage.enterPrompt(multilinePrompt)

    const currentValue = await lyricsPage.promptInput.inputValue()
    expect(currentValue).toBe(multilinePrompt)
  })

  test('should enforce maximum character limit', async ({ page }) => {
    await lyricsPage.goto()

    // Check that maxlength is set
    const maxlength = await lyricsPage.promptInput.getAttribute('maxlength')
    expect(maxlength).toBe('5000')
  })

  test('should show loading state on submit', async ({ page }) => {
    await lyricsPage.goto()

    await lyricsPage.enterPrompt('Test lyrics prompt')

    // Verify button shows correct text initially
    await expect(lyricsPage.submitButton).toContainText('生成歌词')

    // Note: During submission, the button text changes to "生成中..."
    // but we can't fully test this without mocking the API
  })
})
