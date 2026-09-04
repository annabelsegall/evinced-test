## Context

Before working on any accessibility testing task, always read:

`node_modules/@evinced/js-playwright-sdk/evinced-ai/entry.mdc`

The entry.mdc file contains:
- Integration rules for the Evinced Playwright JS SDK
- Skills for setup, test writing, configuration, reporting, and logging
- Links to detailed documentation for each task type

## When to use

When the user asks about accessibility testing, WCAG compliance, ARIA attributes, Evinced SDK usage, or accessibility reports or scans, read the entry point file listed under Context.

## Capabilities

- Set up the Evinced SDK in Playwright projects
- Write accessibility tests using `evAnalyze`, `evStart`, `evStop`
- Configure accessibility rules and scopes
- Generate HTML, JSON, SARIF, or CSV reports
- Configure the SDK — proxy, screenshots, iframes, and `evConfig.json`
- Enable and tune SDK logging and log levels
- Control SDK toggles — kill switch, analytics opt-out, and mock engine
- Integrate accessibility checks into CI/CD pipelines