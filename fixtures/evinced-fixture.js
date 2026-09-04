const { test: base, expect } = require('@playwright/test');
const { EvincedSDK } = require('@evinced/js-playwright-sdk');
const path = require('path');
const fs = require('fs');

/**
 * Scalable Evinced Playwright Test Fixture
 * 
 * In an enterprise environment with hundreds or thousands of tests:
 * 1. ZERO BOILERPLATE: Developers write regular Playwright tests without manual SDK setup.
 * 2. AUTOMATIC LIFECYCLE: evStart() is called before the test, evStop() is called after.
 * 3. ARTIFACT ATTACHMENT: Evinced HTML reports are automatically generated and attached to the Playwright report.
 * 4. QUALITY GATES: Enforces configurable accessibility threshold policies (e.g., fail on Critical/Serious issues).
 */
exports.test = base.extend({
  // Option to toggle continuous accessibility scanning per test or describe block
  evincedAutoScan: [true, { option: true }],

  // Severity failure thresholds: Set to null to allow all, or integer maximum allowable count
  evincedThresholds: [{
    critical: 0,
    serious: 0,
    moderate: null,
    minor: null
  }, { option: true }],

  // The evincedService fixture provides access to the SDK instance if needed
  evinced: async ({ page, evincedAutoScan, evincedThresholds }, use, testInfo) => {
    const evincedService = new EvincedSDK(page);
    const reportsDir = path.resolve(process.cwd(), 'reports', 'scale-suite');

    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    // disable screenshots for performance reasons, we don't need them on EVERY test
    const scanConfig = {
      scan: {
        screenshots: { enabled: false }
      },
    };

    if (evincedAutoScan) {
      console.log(`[Evinced Fixture] Auto-starting continuous scan for: "${testInfo.title}"`);
      await evincedService.evStart(scanConfig);
    }

    // Pass the SDK instance to the test body
    await use(evincedService);

    if (evincedAutoScan) {
      console.log(`[Evinced Fixture] Auto-stopping continuous scan for: "${testInfo.title}"`);
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

      // Evaluate Quality Gates / Thresholds
      if (evincedThresholds && issues && issues.length > 0) {
        const counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
        for (const issue of issues) {
          const sev = (issue.severity?.name || '').toLowerCase();
          if (counts[sev] !== undefined) counts[sev]++;
        }

        console.log(`[Evinced Fixture] Test "${testInfo.title}" A11y Violations:`, counts);

        // Quality gate assertions — actively fail the test if accessibility violations exist
        expect(
          issues,
          `❌ [Quality Gate] Test "${testInfo.title}" failed with ${issues.length} accessibility violations (${counts.critical} Critical, ${counts.serious} Serious). Review report: ${reportPath}`
        ).toHaveLength(0);
      }
    }
  }
});

exports.expect = expect;
