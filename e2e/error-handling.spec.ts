import { test, expect } from '@playwright/test';

test.describe('Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  // Network mocking tests - these simulate error conditions
  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call and simulate error
    await page.route('**/api/users**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Search for user
    await page.getByPlaceholder('Enter username').fill('testuser');
    await page.getByRole('button', { name: /search/i }).click();

    // Should display error message
    await expect(page.getByText(/error|failed/i)).toBeVisible();
  });

  test('should handle repository fetch errors', async ({ page }) => {
    // Allow user search but fail repository fetch
    await page.route('**/api/users/*/repos**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch repositories' }),
      });
    });

    // Search for user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);

    // Click to expand repositories
    await page.getByRole('button', { name: /repositories for octocat/i }).click();

    // Should show error for repositories
    await expect(page.getByText(/failed.*repositor/i)).toBeVisible();
  });

  test('should handle network timeouts', async ({ page }) => {
    // Simulate slow/timeout network
    await page.route('**/api/users**', async route => {
      await new Promise(resolve => setTimeout(resolve, 60000)); // Very long delay
      await route.abort('timedout');
    });

    // Search for user
    await page.getByPlaceholder('Enter username').fill('testuser');
    await page.getByRole('button', { name: /search/i }).click();

    // Should show loading spinner
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should handle empty search results', async ({ page }) => {
    // Search for a user that doesn't exist on GitHub

    // Search for user
    await page.getByPlaceholder('Enter username').fill('nonexistentuser123456789');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForTimeout(500);

    // Should show "no users found" or similar
    await expect(page.getByText(/no users found/i)).toBeVisible();
  });

  test('should validate whitespace-only input', async ({ page }) => {
    // Enter only whitespace
    await page.getByPlaceholder('Enter username').fill('   ');
    await page.getByRole('button', { name: /search/i }).click();

    // Should not make API call (stays on empty state)
    await expect(page.getByText('Enter a GitHub username to get started')).toBeVisible();
  });

  test('should recover from error when retrying', async ({ page }) => {
    let attemptCount = 0;

    // First attempt fails, second succeeds
    await page.route('**/api/users**', route => {
      attemptCount++;
      if (attemptCount === 1) {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Server error' }),
        });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            items: [{ id: 1, login: 'octocat', avatar_url: '', public_repos: 10 }],
          }),
        });
      }
    });

    // First search - should fail
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.getByRole('button', { name: /search/i }).click();
    await expect(page.getByText(/error|failed/i)).toBeVisible();

    // Clear and retry - should succeed
    await page.getByPlaceholder('Enter username').clear();
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.getByRole('button', { name: /search/i }).click();
    await page.waitForTimeout(500);

    await expect(page.getByRole('button', { name: 'Expand repositories for octocat' })).toBeVisible();
  });
});
