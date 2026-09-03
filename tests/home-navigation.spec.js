const { test, expect } = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');
const path = require('path');
const fs = require('fs');

/**
 * Test 1: Simple Navigation to Home Page
 * 
 * Mode: Single-Run / Snapshot Mode (evAnalyze)
 * Purpose: Evaluates accessibility of the initial landing state.
 * Report: Exports an HTML report with embedded screenshots to reports/home-navigation-report.html
 */
test.describe('Evinced A11y Suite - Home Page Navigation', () => {
  let evincedService;

  test.beforeEach(async ({ page }) => {
    // Initialize Evinced SDK bound to the current Playwright page
    evincedService = new EvincedSDK(page);
  });

  test('Navigate to home page and run single-run accessibility analysis (evAnalyze)', async ({ page }) => {
    // 1. Navigate to the demo store homepage
    console.log('Navigating to https://a11y-audits.com/...');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // 2. Perform functional assertions on the home page
    await expect(page).toHaveTitle(/Love & Minter/i);
    const header = page.locator('header').first();
    await expect(header).toBeVisible();

    // Ensure reports directory exists
    const reportsDir = path.resolve(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // 3. Execute Evinced Single-Run Accessibility Analysis
    console.log('Running Evinced evAnalyze() snapshot with screenshots...');
    const scanConfig = {
      scan: {
        screenshots: {
          enabled: true,
        },
      },
    };

    const issues = await evincedService.evAnalyze(scanConfig);

    // 4. Export the findings to an HTML report
    const reportPath = path.join(reportsDir, 'home-navigation-report.html');
    await evincedService.evSaveFile(issues, 'html', reportPath);
    console.log(`✅ Evinced HTML report generated: ${reportPath}`);

    // 5. Log issue statistics and assertions
    console.log(`Total Accessibility Issues Found on Home: ${issues ? issues.length : 0}`);
    if (issues && issues.length > 0) {
      const summary = issues.reduce((acc, issue) => {
        const severity = issue.severity?.name || issue.type?.name || 'Unknown';
        acc[severity] = (acc[severity] || 0) + 1;
        return acc;
      }, {});
      console.log('Issue breakdown by severity:', summary);
    }

    // 6. Accessibility Quality Gate Assertions
    // In Playwright, tests only fail if an assertion (expect) throws an error.
    // Evinced's evAnalyze() returns the issues array rather than throwing directly,
    // allowing teams to assert based on their compliance policy.

    const criticalOrSerious = issues ? issues.filter(i => {
      const sev = (i.severity?.name || i.severityName || '').toLowerCase();
      return sev === 'critical' || sev === 'serious';
    }) : [];

    // Enforce Zero Accessibility Violations:
    // This will fail the test because the demo store contains intentional accessibility defects.
    expect(
      issues,
      `❌ Accessibility scan failed with ${issues.length} violations (${criticalOrSerious.length} Critical/Serious). Review HTML report: ${reportPath}`
    ).toHaveLength(0);
  });
});
