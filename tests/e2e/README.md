# E2E Tests

This directory contains end-to-end tests for the Suno API Web application using Playwright.

## Prerequisites

### System Dependencies (Linux/WSL)

If you're running on Linux or WSL, you may need to install additional system libraries for Chromium:

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y \
  libnspr4 \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libxkbcommon0 \
  libxcomposite1 \
  libxdamage1 \
  libxfixes3 \
  libxrandr2 \
  libgbm1 \
  libasound2
```

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI mode (interactive)
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Run specific test file
npm run test:e2e -- auth.spec.ts

# Run tests in headed mode (see browser)
npm run test:e2e -- --headed
```

## Test Structure

```
tests/e2e/
├── fixtures/          # Test data and fixtures
├── pages/            # Page Object Model classes
│   ├── base-page.ts  # Base page with common methods
│   ├── home-page.ts  # Home page object
│   ├── settings-page.ts # Settings page object
│   ├── music-page.ts # Music generation page object
│   └── lyrics-page.ts # Lyrics generation page object
├── auth.spec.ts      # Authentication tests
├── navigation.spec.ts # Page navigation tests
├── music.spec.ts     # Music generation tests
└── lyrics.spec.ts    # Lyrics generation tests
```

## Page Object Model

The tests use the Page Object Model pattern for better maintainability:

- **BasePage**: Common page methods (goto, click, fill, etc.)
- **HomePage**: Home page locators and actions
- **SettingsPage**: Settings/API key page locators and actions
- **MusicPage**: Music generation page locators and actions
- **LyricsPage**: Lyrics generation page locators and actions

## Test Coverage

### Authentication Tests (`auth.spec.ts`)
- Display settings page
- Save and clear API key
- Show masked API key
- Show credits section
- Persist API key across page reloads
- Show authentication status on home page

### Navigation Tests (`navigation.spec.ts`)
- Navigate between all pages
- Handle direct URL navigation
- Preserve state across navigation

### Music Generation Tests (`music.spec.ts`)
- Display music page with form
- Require prompt input
- Enable/disable submit button
- Show character count
- Custom mode fields
- Model selection
- Instrumental checkbox
- Alert when no API key

### Lyrics Generation Tests (`lyrics.spec.ts`)
- Display lyrics page with form
- Accept lyrics prompt input
- Show character count
- Handle multiline input
- Enforce character limit
- Alert when no API key

## Debugging

### View Test Reports

After running tests, view the HTML report:

```bash
npx playwright show-report
```

### Debug Mode

Run tests in debug mode with Playwright Inspector:

```bash
npm run test:e2e:debug
```

### Trace Viewer

View traces for failed tests (when `trace: 'on-first-retry'` is enabled):

```bash
npx playwright show-trace trace.zip
```

## Continuous Integration

The tests are configured to work with CI/CD pipelines:

- In CI, tests run with a single worker
- Failed tests are retried twice
- Existing dev server is reused when available
- HTML reports are generated for viewing

## Writing New Tests

When adding new tests:

1. Use the Page Object Model pattern
2. Add locators to the appropriate page object
3. Add actions to the page object class
4. Write tests in `.spec.ts` files
5. Group related tests with `test.describe()`
6. Use `test.beforeEach()` for common setup

Example:

```typescript
import { test, expect } from '@playwright/test'
import { HomePage } from './pages/home-page'

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await expect(homePage.title).toBeVisible()
  })
})
```
