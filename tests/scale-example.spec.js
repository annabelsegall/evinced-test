const { test, expect } = require('../fixtures/evinced-fixture');

/**
 * Scalability Example: Zero-Boilerplate Test
 * 
 * Notice how clean this test is:
 * - The developer does NOT need to import EvincedSDK or configure anything manually.
 * - The fixture automatically activates evStart() before the test.
 * - The fixture automatically executes evStop() after the test.
 * - The fixture automatically exports the HTML report to reports/scale-suite/
 * - The fixture attaches the report to Playwright's test report for CI visibility.
 */
test.describe('Scalable Enterprise Tests with Evinced Fixture', () => {

  test('Search products and verify catalog accessibility', async ({ page, evinced }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page).toHaveTitle(/Love & Minter/i);

    // 2. Perform search interaction
    const searchButton = page.locator('a[href*="/search"], button[aria-label*="Search"], [class*="search"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      const searchInput = page.locator('input[type="search"], input[name="q"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('headphones');
        await searchInput.press('Enter');
        await page.waitForLoadState('domcontentloaded');
      }
    }

    // 3. Normal functional validation
    const mainContent = page.locator('main').first();
    await expect(mainContent).toBeVisible();

    // That's it! Evinced lifecycle, report export, and quality gates run automatically in the background.
  });

  test('Browse collections navigation flow', async ({ page, evinced }) => {
    await page.goto('/');

    // Browse through navigation links
    const navLinks = page.locator('header nav a, .header__inline-menu a');
    const count = await navLinks.count();

    if (count > 0) {
      const firstLink = navLinks.first();
      const href = await firstLink.getAttribute('href');
      if (href && !href.startsWith('http') && href !== '/') {
        await firstLink.click();
        await page.waitForLoadState('domcontentloaded');
        await expect(page.locator('main')).toBeVisible();
      }
    }
  });
});
