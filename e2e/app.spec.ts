import { test, expect } from '@playwright/test';

test.describe('GitHub User Repo Explorer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the initial empty state', async ({ page }) => {
    await expect(page.getByText('Enter a GitHub username to get started')).toBeVisible();
    await expect(page.getByPlaceholder('Enter username')).toBeVisible();
    await expect(page.getByRole('button', { name: /search/i })).toBeVisible();
  });

  test('should search for a user and display results', async ({ page }) => {
    // Enter a username
    await page.getByPlaceholder('Enter username').fill('octocat');
    
    // Wait for debounce and automatic search
    await page.waitForTimeout(400);
    
    // Should show user in results
    await expect(page.getByRole('button', { name: 'Expand repositories for octocat' })).toBeVisible();
    await expect(page.getByText(/showing users for/i)).toBeVisible();
  });

  test('should expand user and display repositories', async ({ page }) => {
    // Search for user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    // Click on user to expand
    const userButton = page.getByRole('button', { name: /repositories for octocat/i });
    await userButton.click();
    
    // Wait for repositories to load
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // Should show repositories
    const repoLinks = page.locator('a[href*="github.com/octocat"]');
    await expect(repoLinks.first()).toBeVisible();
    
    // Should show repository count
    await expect(page.getByText(/showing \d+ repositor/i)).toBeVisible();
  });

  test('should collapse repositories when clicking user again', async ({ page }) => {
    // Search and expand user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    const userButton = page.getByRole('button', { name: /repositories for octocat/i });
    await userButton.click();
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // Click again to collapse
    await userButton.click();
    
    // Repositories should be hidden
    await expect(page.locator('a[href*="github.com/octocat"]').first()).not.toBeVisible();
  });

  test('should have accessible form elements', async ({ page }) => {
    // Check for accessible input
    const input = page.getByPlaceholder('Enter username');
    await expect(input).toHaveAttribute('aria-label', 'GitHub username');
    
    // Check for accessible button
    const button = page.getByRole('button', { name: /search for github user/i });
    await expect(button).toBeVisible();
    
    // Check for label (even if visually hidden)
    const label = page.locator('label[for="github-username-search"]');
    await expect(label).toHaveCount(1);
  });

  test('should navigate repository links in new tab', async ({ page, context }) => {
    // Search and expand user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    await page.getByRole('button', { name: /repositories for octocat/i }).click();
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // Check first repository link attributes
    const firstRepoLink = page.locator('a[href*="github.com/octocat"]').first();
    await expect(firstRepoLink).toHaveAttribute('target', '_blank');
    await expect(firstRepoLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Focus on input
    await page.getByPlaceholder('Enter username').focus();
    
    // Type username
    await page.keyboard.type('octocat');
    await page.waitForTimeout(400);
    
    // Tab to search button and press enter
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    
    // Should show results
    await expect(page.getByRole('button', { name: 'Expand repositories for octocat' })).toBeVisible();
  });

  test('should show loading state while fetching data', async ({ page }) => {
    // Slow down network to see loading state
    await page.route('**/api/users**', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });
    
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.getByRole('button', { name: /search/i }).click();
    
    // Should show loading spinner
    await expect(page.locator('.animate-spin')).toBeVisible();
  });

  test('should clear results when search is cleared', async ({ page }) => {
    // Search for user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    // Verify results appear
    await expect(page.getByRole('button', { name: 'Expand repositories for octocat' })).toBeVisible();
    
    // Clear the input
    await page.getByPlaceholder('Enter username').clear();
    await page.getByRole('button', { name: /search/i }).click();
    
    // Results should be cleared
    await expect(page.getByText('octocat')).not.toBeVisible();
    await expect(page.getByText('Enter a GitHub username to get started')).toBeVisible();
  });
});
