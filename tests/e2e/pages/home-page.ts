import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base-page'

export class HomePage extends BasePage {
  readonly title: Locator
  readonly musicLink: Locator
  readonly lyricsLink: Locator
  readonly settingsLink: Locator
  readonly creditsDisplay: Locator
  readonly startUsingButton: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.locator('h1:text("Suno API Web")')
    this.musicLink = page.locator('a[href="/music"]')
    this.lyricsLink = page.locator('a[href="/lyrics"]')
    this.settingsLink = page.locator('a[href="/settings"]')
    this.creditsDisplay = page.locator('text=/剩余积分/')
    this.startUsingButton = page.locator('a:has-text("开始使用")')
  }

  async goto() {
    await super.goto('/')
  }

  async navigateToMusic() {
    await this.musicLink.click()
  }

  async navigateToLyrics() {
    await this.lyricsLink.click()
  }

  async navigateToSettings() {
    await this.settingsLink.click()
  }

  async getCreditsText(): Promise<string> {
    return await this.creditsDisplay.textContent() || ''
  }

  isStartUsingButtonVisible(): Promise<boolean> {
    return this.startUsingButton.isVisible()
  }
}
