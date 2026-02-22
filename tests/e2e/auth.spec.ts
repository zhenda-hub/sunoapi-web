import { test, expect } from '@playwright/test'
import { SettingsPage } from './pages/settings-page'
import { HomePage } from './pages/home-page'

test.describe('Authentication', () => {
  let settingsPage: SettingsPage
  let homePage: HomePage

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.clear()
    })

    settingsPage = new SettingsPage(page)
    homePage = new HomePage(page)
  })

  test('should display settings page with API key input', async ({ page }) => {
    await settingsPage.goto()

    await expect(settingsPage.pageTitle).toBeVisible()
    await expect(settingsPage.apiKeyInput).toBeVisible()
    await expect(settingsPage.saveButton).toBeVisible()
    await expect(settingsPage.clearButton).not.toBeVisible()
  })

  test('should save API key and show success status', async ({ page }) => {
    const testApiKey = 'test-api-key-12345'

    await settingsPage.goto()
    await settingsPage.enterApiKey(testApiKey)
    await settingsPage.saveApiKey()

    // Verify the API key is saved
    await expect(page.locator('p:has-text("API Key 已设置")')).toBeVisible()
    await expect(settingsPage.clearButton).toBeVisible()

    // Verify localStorage contains the API key
    const storedKey = await page.evaluate(() => {
      return localStorage.getItem('suno-api-key')
    })
    expect(storedKey).toBe(testApiKey)
  })

  test('should show masked API key after saving', async ({ page }) => {
    const testApiKey = 'sk-test-very-long-api-key-123456789'

    await settingsPage.goto()
    await settingsPage.enterApiKey(testApiKey)
    await settingsPage.saveApiKey()

    // Should show masked key (first 4 and last 4 characters visible)
    const maskedKey = await page.locator('p:text=/当前 Key:/').textContent()
    expect(maskedKey).toContain('sk-t')
    expect(maskedKey).toContain('6789')
    expect(maskedKey).toContain('*')
  })

  test('should clear API key', async ({ page }) => {
    await settingsPage.goto()
    await settingsPage.enterApiKey('test-api-key')
    await settingsPage.saveApiKey()

    // Verify key is saved
    await expect(page.locator('p:has-text("API Key 已设置")')).toBeVisible()

    // Clear the key
    await settingsPage.clearApiKey()

    // Verify key is cleared
    await expect(page.locator('p:has-text("未设置 API Key")')).toBeVisible()

    const storedKey = await page.evaluate(() => {
      return localStorage.getItem('suno-api-key')
    })
    expect(storedKey).toBeNull()
  })

  test('should show credits section after API key is set', async ({ page }) => {
    await settingsPage.goto()
    await settingsPage.enterApiKey('test-api-key')
    await settingsPage.saveApiKey()

    // Credits section should be visible
    await expect(settingsPage.creditsSection).toBeVisible()

    // Note: In a real test with a mocked API, we would verify the credits value
    // For now, we just check that the section is visible
    const creditsText = await settingsPage.page.locator('text=加载中...').isVisible()
    expect(creditsText).toBe(true)
  })

  test('should persist API key across page reloads', async ({ page }) => {
    const testApiKey = 'persistent-api-key-123'

    await settingsPage.goto()
    await settingsPage.enterApiKey(testApiKey)
    await settingsPage.saveApiKey()

    // Reload the page
    await page.reload()

    // API key status should still show as set
    await expect(page.locator('p:has-text("API Key 已设置")')).toBeVisible()

    // Verify localStorage still has the key
    const storedKey = await page.evaluate(() => {
      return localStorage.getItem('suno-api-key')
    })
    expect(storedKey).toBe(testApiKey)
  })

  test('should show authentication status on home page', async ({ page }) => {
    // Initially not authenticated
    await homePage.goto()
    await expect(homePage.startUsingButton).toBeVisible()

    // Set API key
    await settingsPage.goto()
    await settingsPage.enterApiKey('test-api-key')
    await settingsPage.saveApiKey()

    // Navigate back to home
    await homePage.goto()

    // Start using button should not be visible when authenticated
    await expect(homePage.startUsingButton).not.toBeVisible()

    // Credits display should be visible
    await expect(homePage.creditsDisplay).toBeVisible()
  })

  test('should disable save button when input is empty', async ({ page }) => {
    await settingsPage.goto()

    // Button should be disabled initially
    await expect(settingsPage.saveButton).toBeDisabled()

    // Button should be enabled when input has text
    await settingsPage.enterApiKey('test-key')
    await expect(settingsPage.saveButton).toBeEnabled()
  })
})
