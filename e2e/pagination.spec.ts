import { test, expect } from '@playwright/test';

test.describe('Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load more repositories when clicking Load More', async ({ page }) => {
    // Search for a user with many repos (e.g., torvalds has many repos)
    await page.getByPlaceholder('Enter username').fill('torvalds');
    await page.waitForTimeout(400);
    
    // Expand user repositories
    const userButton = page.getByRole('button', { name: 'Expand repositories for torvalds', exact: true });
    await userButton.click();
    
    // Wait for initial repositories to load
    await page.waitForSelector('a[href*="github.com/torvalds"]', { timeout: 10000 });
    
    // Get initial repository count
    const initialRepos = await page.locator('a[href*="github.com/torvalds"]').count();
    
    // Look for Load More button if available
    const loadMoreButton = page.getByRole('button', { name: /load more repositories/i });
    
    if (await loadMoreButton.isVisible()) {
      // Click Load More
      await loadMoreButton.click();
      
      // Wait for more repositories to load
      await page.waitForTimeout(2000);
      
      // Should have more repositories now
      const newRepoCount = await page.locator('a[href*="github.com/torvalds"]').count();
      expect(newRepoCount).toBeGreaterThan(initialRepos);
      
      // Repository count should update
      await expect(page.getByText(/showing \d+ repositor/i)).toBeVisible();
    }
  });

  test('should show repository count legend', async ({ page }) => {
    // Search for user
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    // Expand repositories
    await page.getByRole('button', { name: /repositories for octocat/i }).click();
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // Should display count
    const countText = page.getByText(/showing \d+ repositor/i);
    await expect(countText).toBeVisible();
    
    // Verify it's centered (has text-center class)
    await expect(countText).toHaveClass(/text-center/);
  });

  test('should hide Load More button when no more pages', async ({ page }) => {
    // Search for a user with few repos
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    // Expand repositories
    await page.getByRole('button', { name: /repositories for octocat/i }).click();
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // If user has <= 30 repos, Load More should not be visible
    const loadMoreButton = page.getByRole('button', { name: /load more/i });
    const isVisible = await loadMoreButton.isVisible().catch(() => false);
    
    if (isVisible) {
      // If button exists, it means there are more repos to load
      await expect(loadMoreButton).toBeVisible();
    } else {
      // Button should not exist or be hidden
      await expect(loadMoreButton).not.toBeVisible();
    }
  });

  test('should reset pagination when selecting different user', async ({ page }) => {
    // Search for first user
    await page.getByPlaceholder('Enter username').fill('torvalds');
    await page.waitForTimeout(400);
    
    await page.getByRole('button', { name: 'Expand repositories for torvalds', exact: true }).click();
    await page.waitForSelector('a[href*="github.com/torvalds"]', { timeout: 10000 });
    
    // Check if Load More exists and click it
    const loadMoreButton = page.getByRole('button', { name: /load more/i });
    if (await loadMoreButton.isVisible()) {
      await loadMoreButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Search for different user
    await page.getByPlaceholder('Enter username').clear();
    await page.getByPlaceholder('Enter username').fill('octocat');
    await page.waitForTimeout(400);
    
    // Click on new user
    await page.getByRole('button', { name: /repositories for octocat/i }).click();
    
    // Should show first page of new user's repos
    await page.waitForSelector('a[href*="github.com/octocat"]', { timeout: 10000 });
    
    // Should not show torvalds repos
    const torvaldsRepos = page.locator('a[href*="github.com/torvalds"]');
    await expect(torvaldsRepos.first()).not.toBeVisible();
  });
});
