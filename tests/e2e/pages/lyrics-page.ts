import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base-page'

export class LyricsPage extends BasePage {
  readonly pageTitle: Locator
  readonly promptInput: Locator
  readonly submitButton: Locator
  readonly tasksSection: Locator
  readonly homeLink: Locator
  readonly musicLink: Locator
  readonly settingsLink: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.locator('h1:text("生成歌词")')
    this.promptInput = page.locator('textarea[placeholder*="描述你想要的歌词内容"]')
    this.submitButton = page.locator('button:has-text("生成歌词"), button:has-text("生成中...")')
    this.tasksSection = page.locator('text="生成记录"')
    this.homeLink = page.locator('a[href="/"]')
    this.musicLink = page.locator('a[href="/music"]')
    this.settingsLink = page.locator('a[href="/settings"]')
  }

  async goto() {
    await super.goto('/lyrics')
  }

  async enterPrompt(prompt: string) {
    await this.promptInput.fill(prompt)
  }

  async submitForm() {
    await this.submitButton.click()
  }

  async waitForTasksSection(timeout: number = 5000) {
    await this.tasksSection.waitFor({ state: 'visible', timeout })
  }

  async navigateToHome() {
    await this.homeLink.click()
  }

  async navigateToMusic() {
    await this.musicLink.click()
  }

  async navigateToSettings() {
    await this.settingsLink.click()
  }
}
