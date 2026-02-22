import type { Page, Locator } from '@playwright/test'
import { BasePage } from './base-page'

export class SettingsPage extends BasePage {
  readonly pageTitle: Locator
  readonly apiKeyInput: Locator
  readonly saveButton: Locator
  readonly clearButton: Locator
  readonly apiKeyStatus: Locator
  readonly creditsSection: Locator
  readonly creditsValue: Locator
  readonly refreshButton: Locator

  constructor(page: Page) {
    super(page)
    this.pageTitle = page.locator('h1:text("设置")')
    this.apiKeyInput = page.locator('input[type="password"]')
    this.saveButton = page.locator('button:has-text("保存 API Key")')
    this.clearButton = page.locator('button:has-text("清除")')
    this.apiKeyStatus = page.locator('p:has-text("API Key 已设置"), p:has-text("未设置 API Key")')
    this.creditsSection = page.locator('text="剩余积分"')
    this.creditsValue = page.locator('.text-3xl')
    this.refreshButton = page.locator('button:has-text("刷新")')
  }

  async goto() {
    await super.goto('/settings')
  }

  async enterApiKey(apiKey: string) {
    await this.apiKeyInput.fill(apiKey)
  }

  async saveApiKey() {
    await this.saveButton.click()
  }

  async clearApiKey() {
    await this.clearButton.click()
  }

  async getCreditsValue(): Promise<string> {
    await this.creditsValue.waitFor({ state: 'visible', timeout: 5000 })
    return await this.creditsValue.textContent() || ''
  }

  async refreshCredits() {
    await this.refreshButton.click()
  }

  isApiKeySet(): Promise<boolean> {
    return this.page.locator('p:has-text("API Key 已设置")').isVisible()
  }

  isCreditsSectionVisible(): Promise<boolean> {
    return this.creditsSection.isVisible()
  }
}
