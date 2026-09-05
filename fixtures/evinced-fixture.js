const { test: base, expect } = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');
const path = require('path');

/**
 * Scalable Evinced Playwright Test Fixture
 * 
 * Scalable for hundreds of tests:
 * 1. ZERO BOILERPLATE: Developers write regular Playwright tests without manual SDK setup.
 * 2. AUTOMATIC LIFECYCLE: evStart() is called before the test, evStop() is called after.
 * 3. ARTIFACT ATTACHMENT: Evinced HTML reports are automatically generated and attached to the Playwright report.
 * 4. QUALITY GATES: Fixture automatically fails if any a11y violations are discovered.
 */
exports.test = base.extend({

  // The evincedService fixture provides access to the SDK instance if needed
  evinced: async ({ page }, use, testInfo) => {
    const evincedService = new EvincedSDK(page);
    const reportsDir = path.resolve(process.cwd(), 'reports', 'scale-suite');

    // disable screenshots for performance reasons, we don't need them on EVERY test
    const scanConfig = {
      scan: {
        screenshots: { enabled: false }
      },
    };

    console.log(`[Evinced Fixture] Auto-starting continuous evinced scan for: "${testInfo.title}"`);
    await evincedService.evStart(scanConfig);
    evincedService.testRunInfo.addLabel({
      testName: testInfo.title,
      testFile: testInfo.file,
      environment: 'Test'
    })

    // Pass the SDK instance to the test body
    await use(evincedService);

    console.log(`[Evinced Fixture] Auto-stopping continuous evinced scan for: "${testInfo.title}"`);
    const issues = await evincedService.evStop();

    // Generate sanitized filename from test title
    const sanitizedTitle = testInfo.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const reportPath = path.join(reportsDir, `${sanitizedTitle}.html`);

    // Save HTML report with screenshots
    await evincedService.evSaveFile(issues, 'html', reportPath);

    // Attach report directly to Playwright's test results
    await testInfo.attach('Evinced Accessibility Report', {
      path: reportPath,
      contentType: 'text/html'
    });

    console.log(`[Evinced Fixture] Saved report to: ${reportPath}`);

    // Quality gate assertions — actively fail the test if accessibility violations exist
    expect(
      issues,
      `❌ [Evinced Fixture] Test "${testInfo.title}" failed with ${issues.length} accessibility violations. Review report: ${reportPath}`
    ).toHaveLength(0);
  }
});

exports.expect = expect;
