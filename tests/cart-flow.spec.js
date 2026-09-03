const { test, expect } = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');
const path = require('path');
const fs = require('fs');

/**
 * Test 2: Complex Interactive Flow with Validations
 * 
 * Mode: Continuous Mode (evStart / evStop)
 * Purpose: Analyzes DOM mutations and accessibility issues dynamically across multiple page states:
 *          1. Homepage browsing
 *          2. Product detail page navigation
 *          3. Adding an item to the shopping cart
 *          4. Validating the dynamic cart popover/drawer state
 * Report: Exports an aggregated HTML report with visual screenshots to reports/cart-flow-report.html
 */
test.describe('Evinced A11y Suite - Interactive Shopping & Cart Flow', () => {
  let evincedService;

  test.beforeEach(async ({ page }) => {
    evincedService = new EvincedSDK(page);
  });

  test('Complete purchase flow: browse catalog, view product, add to cart, validate cart state', async ({ page }) => {
    const scanConfig = {
      scan: {
        screenshots: {
          enabled: true,
        },
      },
    };

    // Ensure reports directory exists
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // =========================================================================
    // STEP 1: START CONTINUOUS SCANNING
    // =========================================================================
    console.log('Starting Evinced continuous scanning (evStart)...');
    await evincedService.evStart(scanConfig);

    try {
      // =========================================================================
      // STEP 2: NAVIGATE TO HOME PAGE
      // =========================================================================
      console.log('State 1: Loading home page...');
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(/Love & Minter/i);

      // =========================================================================
      // STEP 2: NAVIGATE TO CATALOG PAGE
      // =========================================================================

      const catalogLink = page.locator('a:has-text("Catalog")').first();
      await expect(catalogLink).toBeVisible();
      await expect(catalogLink).toBeEnabled();
      await expect(catalogLink).toBeVisible({ timeout: 15000 });

      await catalogLink.click();

      // =========================================================================
      // STEP 3: SELECT A PRODUCT FROM THE STORE
      // =========================================================================
      console.log('State 2: Selecting product from catalog...');
      // Target a product card link
      const productLink = page.locator('a[href*="/products/"]').first();
      await expect(productLink).toBeVisible({ timeout: 15000 });

      const productTitle = (await productLink.innerText()).trim() || 'Product';
      console.log(`Navigating to product: "${productTitle}"`);
      await productLink.click();

      // Validate navigation to product detail page
      await page.waitForURL(/\/products\//, { timeout: 15000 });
      await expect(page.locator('h1').first()).toBeVisible();

      // Validate price visibility
      const priceElement = page.locator('.price, [class*="price"]').first();
      await expect(priceElement).toBeVisible();

      // =========================================================================
      // STEP 4: ADD ITEM TO SHOPPING CART
      // =========================================================================
      console.log('State 3: Adding item to cart...');
      // Look for the "Add to cart" submit button
      const addToCartButton = page.locator('button:has-text("Add to cart"), form[action*="/cart/add"] button[type="submit"]').first();
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toBeEnabled();

      await addToCartButton.click();

      // =========================================================================
      // STEP 5: VALIDATE DYNAMIC CART DRAWER / CART STATE
      // =========================================================================
      console.log('State 4: Validating cart state & drawer...');

      // The store uses a cart popover/drawer or navigates to /cart
      const cartContainer = page.locator('cart-drawer, [id*="cart"], .cart-drawer, form[action*="/cart"]').first();
      await expect(cartContainer).toBeAttached({ timeout: 10000 });

      // Allow DOM mutations from animations and cart updates to settle for scanner
      await page.waitForTimeout(1500);

      // Validate checkout or view cart button is available
      const checkoutBtn = page.locator('button:has-text("Check out"), a[href*="/checkout"], [name="checkout"]').first();
      if (await checkoutBtn.isVisible()) {
        console.log('Checkout action is visible and validated.');
      }

    } finally {
      // =========================================================================
      // STEP 6: STOP SCANNING & GENERATE HTML REPORT
      // =========================================================================
      console.log('Stopping Evinced continuous scanning (evStop)...');
      const issues = await evincedService.evStop();

      const reportPath = path.join(reportsDir, 'cart-flow-report.html');
      await evincedService.evSaveFile(issues, 'html', reportPath);
      console.log(`✅ Evinced Multi-State Flow HTML report generated: ${reportPath}`);

      // =========================================================================
      // STEP 7: LOG DETECTED ACCESSIBILITY VIOLATIONS
      // =========================================================================
      console.log(`Total Accessibility Issues Found Across Flow: ${issues ? issues.length : 0}`);
      if (issues && issues.length > 0) {
        const severityMap = issues.reduce((acc, issue) => {
          const sev = issue.severity?.name || issue.type?.name || 'Unspecified';
          acc[sev] = (acc[sev] || 0) + 1;
          return acc;
        }, {});
        console.log('Severity Breakdown:', JSON.stringify(severityMap, null, 2));
      }
      // =========================================================================
      // STEP 8: ACCESSIBILITY QUALITY GATE ASSERTIONS
      // =========================================================================
      // In Playwright, tests only fail if an assertion (expect) throws an error.
      // Evinced's evStop() returns the issues array rather than throwing directly,
      // allowing teams to assert based on their compliance policy.

      const criticalOrSerious = issues ? issues.filter(i => {
        const sev = (i.severity?.name || i.severityName || '').toLowerCase();
        return sev === 'critical' || sev === 'serious';
      }) : [];

      // Enforce Zero Accessibility Violations across the flow:
      expect(
        issues,
        `❌ Cart flow accessibility scan failed with ${issues.length} violations (${criticalOrSerious.length} Critical/Serious). Review HTML report: ${reportPath}`
      ).toHaveLength(0);
    }
  });
});
