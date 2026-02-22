import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base-page'

export class MusicPage extends BasePage {
  readonly pageTitle: Locator
  readonly promptInput: Locator
  readonly customModeCheckbox: Locator
  readonly styleInput: Locator
  readonly titleInput: Locator
  readonly modelSelect: Locator
  readonly instrumentalCheckbox: Locator
  readonly submitButton: Locator
  readonly tasksSection: Locator
  readonly homeLink: Locator
  readonly lyricsLink: Locator
  readonly settingsLink: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.locator('h1:text("生成音乐")')
    this.promptInput = page.locator('textarea[placeholder*="描述你想要的音乐"]')
    this.customModeCheckbox = page.locator('#customMode')
    this.styleInput = page.locator('input[placeholder*="电子、爵士、摇滚"]')
    this.titleInput = page.locator('input[placeholder*="给你的歌曲起个名字"]')
    this.modelSelect = page.locator('select')
    this.instrumentalCheckbox = page.locator('#instrumental')
    this.submitButton = page.locator('button:has-text("生成音乐"), button:has-text("生成中...")')
    this.tasksSection = page.locator('text="生成记录"')
    this.homeLink = page.locator('a[href="/"]')
    this.lyricsLink = page.locator('a[href="/lyrics"]')
    this.settingsLink = page.locator('a[href="/settings"]')
  }

  async goto() {
    await super.goto('/music')
  }

  async enterPrompt(prompt: string) {
    await this.promptInput.fill(prompt)
  }

  async enableCustomMode() {
    await this.customModeCheckbox.check()
  }

  async enterStyle(style: string) {
    await this.styleInput.fill(style)
  }

  async enterTitle(title: string) {
    await this.titleInput.fill(title)
  }

  async selectModel(model: string) {
    await this.modelSelect.selectOption(model)
  }

  async enableInstrumental() {
    await this.instrumentalCheckbox.check()
  }

  async submitForm() {
    await this.submitButton.click()
  }

  async waitForTasksSection(timeout: number = 5000) {
    await this.tasksSection.waitFor({ state: 'visible', timeout })
  }

  isSubmitDisabled(): Promise<boolean> {
    return this.submitButton.isDisabled()
  }

  async navigateToHome() {
    await this.homeLink.click()
  }

  async navigateToLyrics() {
    await this.lyricsLink.click()
  }

  async navigateToSettings() {
    await this.settingsLink.click()
  }
}
