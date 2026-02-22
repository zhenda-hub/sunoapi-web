import type { Page, Locator } from '@playwright/test'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path: string = '/') {
    await this.page.goto(path)
  }

  async click(locator: Locator | string) {
    if (typeof locator === 'string') {
      await this.page.locator(locator).click()
    } else {
      await locator.click()
    }
  }

  async fill(locator: Locator | string, value: string) {
    if (typeof locator === 'string') {
      await this.page.locator(locator).fill(value)
    } else {
      await locator.fill(value)
    }
  }

  async getText(locator: Locator | string): Promise<string> {
    if (typeof locator === 'string') {
      return await this.page.locator(locator).textContent() || ''
    }
    return await locator.textContent() || ''
  }

  async isVisible(locator: Locator | string): Promise<boolean> {
    if (typeof locator === 'string') {
      return await this.page.locator(locator).isVisible()
    }
    return await locator.isVisible()
  }

  async waitForSelector(locator: Locator | string, timeout: number = 5000) {
    if (typeof locator === 'string') {
      await this.page.waitForSelector(locator, { timeout })
    } else {
      await locator.waitFor({ state: 'visible', timeout })
    }
  }

  async waitForURL(url: string | RegExp, timeout: number = 5000) {
    await this.page.waitForURL(url, { timeout })
  }

  getLocator(selector: string): Locator {
    return this.page.locator(selector)
  }
}
