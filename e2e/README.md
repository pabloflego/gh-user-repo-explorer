# End-to-End Tests with Playwright

This project uses [Playwright](https://playwright.dev/) for end-to-end testing with a mock GitHub API adapter for predictable, fast tests.

## Architecture

E2E tests run against the real GitHub API to ensure full integration testing.

## Running E2E Tests

### Prerequisites

Make sure Playwright browsers are installed:

```bash
pnpm exec playwright install
```

### Test Commands

```bash
# Run all E2E tests with mock API (headless)
pnpm test:e2e

# Run E2E tests with UI mode (recommended for development)
pnpm test:e2e:ui

# Run E2E tests in headed mode (see browser)
pnpm test:e2e:headed

# Debug E2E tests step by step
pnpm test:e2e:debug
```

All test commands run against the real GitHub API.

## Mock Data

The `InMemoryGithubApi` provides consistent test data:

**Users:**
- `octocat` - 8 repositories
- `torvalds` - 100 repositories (for pagination testing)
- `testuser` - 0 repositories (for empty state testing)

**Features:**
- Simulated network delays (100-200ms)
- Paginated repository responses (30 per page)
- Proper Link header simulation
- Realistic GitHub data structure

## Test Structure

Tests are located in the `/e2e` directory:

- `app.spec.ts` - Main application flow tests (search, display, navigation, accessibility)
- `pagination.spec.ts` - Pagination feature tests (load more, count display)

## What's Tested

### Core Functionality
- ✅ Initial page load and empty state
- ✅ User search functionality
- ✅ User expansion to show repositories
- ✅ Repository list display
- ✅ Repository collapse/expand
- ✅ External links to GitHub

### Pagination
- ✅ Load More button functionality
- ✅ Repository count display
- ✅ Pagination reset when changing users
- ✅ Hide Load More when no more pages

### Accessibility
- ✅ Form labels and ARIA attributes
- ✅ Keyboard navigation
- ✅ Screen reader announcements
- ✅ Focus management

### UX
- ✅ Loading states
- ✅ Error handling
- ✅ Clear search functionality
- ✅ Responsive interactions

## Configuration

Playwright configuration is in `playwright.config.ts`:

- **Test directory**: `./e2e`
- **Base URL**: `http://localhost:3000`
- **Browsers tested**: Chromium, Firefox, WebKit
- **Auto-start dev server**: Yes (using `pnpm dev`)

## Writing New Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.getByPlaceholder('Enter username').fill('octocat');
    
    // Act
    await page.getByRole('button', { name: /search/i }).click();
    
    // Assert
    await expect(page.getByText('octocat')).toBeVisible();
  });
});
```

## Best Practices

1. **Use accessible selectors**: Prefer `getByRole`, `getByLabel`, `getByPlaceholder` over CSS selectors
2. **Wait for elements**: Use `await expect(element).toBeVisible()` instead of arbitrary timeouts
3. **Test real user flows**: Simulate actual user behavior
4. **Keep tests independent**: Each test should work in isolation
5. **Use meaningful descriptions**: Test names should clearly describe what's being tested

## Debugging

### View Test Report

After running tests, view the HTML report:

```bash
pnpm exec playwright show-report
```

### Debug Failed Tests

Use debug mode to step through tests:

```bash
pnpm test:e2e:debug
```

### Visual Debugging with UI Mode

The UI mode provides the best debugging experience:

```bash
pnpm test:e2e:ui
```

This opens an interactive UI where you can:
- Watch tests run in real-time
- Time-travel through test steps
- Inspect DOM at each step
- Edit and re-run tests

## CI/CD Integration

The tests are configured to run optimally in CI environments:

- Runs with 2 retries for flaky tests
- Uses single worker for consistency
- Generates HTML report for artifacts
- Captures traces on first retry

To run in CI mode:

```bash
CI=true pnpm test:e2e
```

## Troubleshooting

### Tests timing out

If tests timeout, increase the timeout in the test:

```typescript
test('slow test', async ({ page }) => {
  test.setTimeout(60000); // 60 seconds
  // ... test code
});
```

### Flaky tests

Use `waitFor` with conditions instead of fixed timeouts:

```typescript
// ❌ Bad
await page.waitForTimeout(5000);

// ✅ Good
await page.waitForSelector('selector', { timeout: 10000 });
await expect(page.getByText('text')).toBeVisible();
```

### Can't find elements

Check if the element is:
1. Actually rendered (inspect in browser)
2. Using the correct selector
3. Inside a shadow DOM or iframe
4. Hidden by CSS

Use `page.pause()` or `--debug` mode to inspect the page state.
