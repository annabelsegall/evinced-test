const { test, expect } = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');
const path = require('path');

/**
 * Test Complex Interactive Flow with Validations
 * 
 * Mode: Continuous Mode (evStart / evStop)
 * Report: Exports an aggregated HTML report with visual screenshots to reports/cart-flow-report.html
 */
test.describe('Interactive Shopping & Cart Flow Accessibility', () => {
  let evincedService;

  test.beforeEach(async ({ page }, testInfo) => {
    evincedService = new EvincedSDK(page);
    evincedService.testRunInfo.addLabel({
      testName: testInfo.title,
      testFile: testInfo.file,
      environment: 'Test'
    })
  });

  test.afterEach(async () => {
    // =========================================================================
    // STEP 7: STOP SCANNING & GENERATE HTML REPORT
    // =========================================================================
    console.log('Stopping Evinced continuous scanning (evStop)...');
    // In Playwright, tests only fail if an expect throws an error.
    // evStop() returns the issues array rather than throwing directly
    // The test will pass, but a11y issues will be flagged in the report
    const issues = await evincedService.evStop();

    const reportsDir = path.resolve(process.cwd(), 'reports');
    const reportPath = path.join(reportsDir, 'cart-flow-report.html');
    console.log(`Generating HTML report at: ${reportPath}`);
    await evincedService.evSaveFile(issues, 'html', reportPath);
    console.log(`✅ Evinced Multi-State Flow HTML report generated: ${reportPath}`);
    console.log(`Total Accessibility Issues Found Across Flow: ${issues ? issues.length : 0}. Review HTML report: ${reportPath}`);
  });

  test('Complete purchase flow: browse catalog, view product, add to cart, validate cart state', async ({ page }) => {
    // =========================================================================
    // STEP 1: START CONTINUOUS SCANNING
    // =========================================================================
    console.log('Starting Evinced continuous scanning (evStart)...');
    await evincedService.evStart();
    // =========================================================================
    // STEP 2: NAVIGATE TO HOME PAGE
    // =========================================================================
    console.log('State 1: Loading home page...');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Love & Minter/i);

    // =========================================================================
    // STEP 3: NAVIGATE TO CATALOG PAGE
    // =========================================================================

    console.log('Clicking catalog link...');
    const catalogLink = page.locator('a:has-text("Catalog")').first();
    await expect(catalogLink).toBeVisible();
    await expect(catalogLink).toBeEnabled();
    await catalogLink.click();

    // Validate navigation to catalog page
    await page.waitForURL(/\/collections\//, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();

    // =========================================================================
    // STEP 4: SELECT A PRODUCT FROM THE STORE
    // =========================================================================
    console.log('State 2: Selecting product from catalog...');
    // Target a product card link, use the first link
    const productLink = page.locator('a[href*="/products/"]').first();
    await expect(productLink).toBeVisible();
    await productLink.click();

    // Validate navigation to product detail page
    await page.waitForURL(/\/products\//, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1').first()).toBeVisible();

    // Validate price visibility
    const priceElement = page.locator('.price, [class*="price"]').first();
    await expect(priceElement).toBeVisible();

    // =========================================================================
    // STEP 5: ADD ITEM TO SHOPPING CART
    // =========================================================================
    console.log('State 3: Adding item to cart...');
    // Look for the "Add to cart" submit button
    const addToCartButton = page.locator('button:has-text("Add to cart")').first();
    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    await addToCartButton.click();

    // =========================================================================
    // STEP 6: VALIDATE DYNAMIC CART DRAWER / CART STATE
    // =========================================================================
    console.log('State 4: Validating cart state & drawer...');

    // Check cart popup shows up
    const cartContainer = page.locator('cart-notification-drawer').first();
    await expect(cartContainer).toBeVisible();

    // Validate checkout link is available
    const checkoutLink = page.locator('a[href*="checkout"]').first();
    await expect(checkoutLink).toBeVisible();
    console.log('Checkout action is visible and validated.');
  });
});
