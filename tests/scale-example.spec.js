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

  test('Book a consultation', async ({ page, evinced }) => {
    // 1. Navigate to home
    await page.goto('/');
    await expect(page).toHaveTitle(/Love & Minter/i);

    // 2. Book consultation button
    const bookConsultationButton = page.locator('button[id*="open-modal"]').first();
    await bookConsultationButton.click();

    // Check popup shows up
    const consultDialog = page.locator('dialog').first();
    await expect(consultDialog).toBeVisible();

    // Validate next button is available
    const nextButton = page.locator('button[id*="next-to-step-2"]').first();
    await expect(nextButton).toBeVisible();
  });

  test('Browse collections navigation flow', async ({ page, evinced }) => {
    await page.goto('/');

    // find catalog link
    const catalogLink = page.locator('a:has-text("Catalog")').first();
    await expect(catalogLink).toBeVisible();
    await expect(catalogLink).toBeEnabled();
    await catalogLink.click();

    // Validate navigation to catalog page
    await page.waitForURL(/\/collections\//, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();
  });
});
