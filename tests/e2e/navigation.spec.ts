import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home-page'
import { MusicPage } from './pages/music-page'
import { LyricsPage } from './pages/lyrics-page'
import { SettingsPage } from './pages/settings-page'

test.describe('Navigation', () => {
  let homePage: HomePage
  let musicPage: MusicPage
  let lyricsPage: LyricsPage
  let settingsPage: SettingsPage

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page)
    musicPage = new MusicPage(page)
    lyricsPage = new LyricsPage(page)
    settingsPage = new SettingsPage(page)
  })

  test('should navigate to home page', async ({ page }) => {
    await homePage.goto()
    await expect(homePage.title).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('should navigate to music page from home', async ({ page }) => {
    await homePage.goto()
    await homePage.navigateToMusic()

    await expect(musicPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/music')
  })

  test('should navigate to lyrics page from home', async ({ page }) => {
    await homePage.goto()
    await homePage.navigateToLyrics()

    await expect(lyricsPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/lyrics')
  })

  test('should navigate to settings page from home', async ({ page }) => {
    await homePage.goto()
    await homePage.navigateToSettings()

    await expect(settingsPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/settings')
  })

  test('should navigate between music and lyrics pages', async ({ page }) => {
    await musicPage.goto()

    // Navigate to lyrics
    await musicPage.navigateToLyrics()
    await expect(lyricsPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/lyrics')

    // Navigate back to music
    await lyricsPage.navigateToMusic()
    await expect(musicPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/music')
  })

  test('should navigate from music to settings', async ({ page }) => {
    await musicPage.goto()
    await musicPage.navigateToSettings()

    await expect(settingsPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/settings')
  })

  test('should navigate from lyrics to settings', async ({ page }) => {
    await lyricsPage.goto()
    await lyricsPage.navigateToSettings()

    await expect(settingsPage.pageTitle).toBeVisible()
    await expect(page).toHaveURL('/settings')
  })

  test('should navigate from settings to home', async ({ page }) => {
    await settingsPage.goto()

    await settingsPage.navigateToHome()
    await expect(homePage.title).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('should navigate from music to home', async ({ page }) => {
    await musicPage.goto()
    await musicPage.navigateToHome()

    await expect(homePage.title).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('should navigate from lyrics to home', async ({ page }) => {
    await lyricsPage.goto()
    await lyricsPage.navigateToHome()

    await expect(homePage.title).toBeVisible()
    await expect(page).toHaveURL('/')
  })

  test('should handle direct URL navigation', async ({ page }) => {
    // Navigate directly to music page
    await page.goto('/music')
    await expect(musicPage.pageTitle).toBeVisible()

    // Navigate directly to lyrics page
    await page.goto('/lyrics')
    await expect(lyricsPage.pageTitle).toBeVisible()

    // Navigate directly to settings page
    await page.goto('/settings')
    await expect(settingsPage.pageTitle).toBeVisible()

    // Navigate directly to home page
    await page.goto('/')
    await expect(homePage.title).toBeVisible()
  })

  test('should preserve navigation state across pages', async ({ page }) => {
    await homePage.goto()

    // Set API key to test auth state preservation
    await page.evaluate(() => {
      localStorage.setItem('suno-api-key', 'test-key')
    })

    // Navigate through multiple pages
    await homePage.navigateToMusic()
    await expect(page).toHaveURL('/music')

    await musicPage.navigateToLyrics()
    await expect(page).toHaveURL('/lyrics')

    // Check that auth state is preserved
    const storedKey = await page.evaluate(() => {
      return localStorage.getItem('suno-api-key')
    })
    expect(storedKey).toBe('test-key')
  })
})
