# Evinced Playwright JS Automation SDK — Enterprise Accessibility Testing Solution

This repository contains an automated accessibility testing solution built with the **Evinced Playwright JS Automation SDK** targeting the [a11y-audits.com](https://a11y-audits.com/) demo application.

It demonstrates:
1. **JFrog Artifactory Authentication** for restricted Evinced package distribution.
2. **Two Core Evinced Analysis Modes**:
   - **Snapshot / Single-Run Mode (`evAnalyze`)**: Static verification on initial navigation.
   - **Continuous Mode (`evStart` & `evStop`)**: Real-time DOM mutation monitoring across complex multi-state interactive flows.
3. **Rich HTML Reports with Embedded Screenshots**: Visual context for rapid issue remediation.
4. **Enterprise Scalability Architecture**: Custom Playwright test fixture providing zero-boilerplate automated scanning and quality gating across thousands of tests.
5. **Continuous Integration (CI/CD)**: GitHub Actions workflow running on every commit.

---

## 📁 Project Structure

```
├── .github/
│   └── workflows/
│       └── playwright-evinced.yml   # CI/CD pipeline triggered on every commit
├── fixtures/
│   └── evinced-fixture.js           # Scalable Playwright custom fixture with automated lifecycle
├── reports/                         # Destination folder for generated Evinced HTML reports
├── tests/
│   ├── home-navigation.spec.js      # Test 1: Homepage navigation + evAnalyze() snapshot
│   ├── cart-flow.spec.js            # Test 2: Multi-state shopping flow + continuous evStart/evStop
│   └── scale-example.spec.js        # Test 3: Scalability demonstration using custom fixture
├── .env                             # Evinced Service ID & API Key credentials
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore file (excluding dependencies, reports, secrets)
├── .npmrc                           # JFrog Artifactory registry configuration & token placeholder
├── evConfig.json                    # Unified Evinced SDK configuration (screenshots enabled)
├── global-setup.js                  # One-time SDK authentication via setCredentials()
├── package.json                     # NPM scripts and dependencies
├── playwright.config.js             # Playwright runner configuration
└── README.md                        # Documentation and presentation walkthrough
```

---

## 🔑 1. Setup & JFrog Authentication

The Evinced SDK is distributed through Evinced's private JFrog Artifactory registry.

### Step 1: Add Your JFrog Auth Token to `.npmrc`

Open [.npmrc](file:///Users/annabelsegall/Documents/Antigravity/Evinced/.npmrc) at the root of the project:

```ini
@evinced:registry=https://evinced.jfrog.io/artifactory/api/npm/restricted-npm/
//evinced.jfrog.io/artifactory/api/npm/restricted-npm/:_authToken=<YOUR_JFROG_AUTH_TOKEN>
//evinced.jfrog.io/artifactory/api/npm/restricted-npm/:always-auth=true
```

Replace `<YOUR_JFROG_AUTH_TOKEN>` with your JFrog JSON Web Token.

### Step 2: Install Dependencies

With Node.js (v18+) and npm available, run:

```bash
npm install
```

> **Local Node.js Note**: A standalone Node.js runtime is pre-installed in `.tools/node/bin`. If you don't have Node in your global PATH, run:
> ```bash
> export PATH="$(pwd)/.tools/node/bin:$PATH"
> npm install
> ```

### Step 3: Evinced Credentials Configuration

The SDK credentials provided in the assignment are pre-configured in [.env](file:///Users/annabelsegall/Documents/Antigravity/Evinced/.env):

```env
EVINCED_SERVICE_ID=MYSERVICEID
EVINCED_API_KEY=MYAPIKEY
BASE_URL=https://a11y-audits.com
```

Before tests execute, `global-setup.js` authenticates the engine using `setCredentials()`:

```javascript
const { setCredentials } = require('@evinced/js-playwright-sdk');

await setCredentials({
  serviceId: process.env.EVINCED_SERVICE_ID,
  secret: process.env.EVINCED_API_KEY,
});
```

---

## 🧪 2. How the Test Scripts Work

### Test 1: Simple Navigation to Home Page (`tests/home-navigation.spec.js`)
* **Mode**: **Single-Run / Snapshot Mode (`evAnalyze`)**
* **Rationale**: When verifying a static landing view or isolated component, `evAnalyze()` performs an immediate accessibility audit of the DOM at that specific point in time.
* **Flow**:
  1. Navigates to `https://a11y-audits.com/`.
  2. Asserts title and header visibility.
  3. Executes `evincedService.evAnalyze({ scan: { screenshots: { enabled: true } } })`.
  4. Exports findings to `reports/home-navigation-report.html` via `evSaveFile()`.
  5. Logs severity metrics to the console.

### Test 2: Complex Interactive Shopping Flow (`tests/cart-flow.spec.js`)
* **Mode**: **Continuous Mode (`evStart` & `evStop`)**
* **Rationale**: Real-world web applications dynamically render UI states, flyout menus, modals, and toasts that do not exist on initial page load. Continuous mode hooks into the browser's mutation observer, analyzing accessibility across every interaction and DOM modification.
* **Flow**:
  1. Calls `evincedService.evStart()` with screenshots enabled.
  2. **State 1 (Landing)**: Loads home page.
  3. **State 2 (Catalog)**: Browses and selects a product card.
  4. **State 3 (Product Detail)**: Validates pricing, variants, and activates "Add to cart".
  5. **State 4 (Cart Drawer)**: Validates the dynamic cart drawer popup, verifying line items and checkout CTA.
  6. Calls `const issues = await evincedService.evStop()`.
  7. Exports the consolidated multi-state HTML report with visual screenshots to `reports/cart-flow-report.html`.

---

## 📸 3. HTML Reports with Screenshots

Visual context is essential for developers and design teams to identify and remediate accessibility issues quickly.

Screenshots can be enabled at two levels:
1. **Global Configuration ([evConfig.json](file:///Users/annabelsegall/Documents/Antigravity/Evinced/evConfig.json))**:
   ```json
   {
     "scan": {
       "screenshots": {
         "enabled": true
       }
     },
     "report": {
       "format": "html"
     },
   }
   ```
2. **Per-Command Scan Configuration**:
   ```javascript
   await evincedService.evStart({
     scan: { screenshots: { enabled: true } },
   });
   ```

### Output Reports
- `reports/home-navigation-report.html`: Accessibility scan of the homepage.
- `reports/cart-flow-report.html`: Comprehensive scan of the interactive shopping flow.
- `reports/scale-suite/*.html`: Automatically generated reports for individual test runs.

Each HTML report contains:
- Summary dashboard by issue type and WCAG conformance level (A, AA, AAA).
- Component highlighting with captured visual screenshots of failing elements.
- Exact CSS selectors, DOM snippets, and actionable remediation guidance.

---

## 🚀 Scaling

Integrating accessibility across hundreds or thousands of tests in large engineering organizations cannot rely on developers manually importing the SDK, copying `evStart()` / `evStop()` blocks, or managing file exports.

To solve this, we leverage the **Official Evinced AI Skills** bundled inside `@evinced/js-playwright-sdk` along with an automated test fixture architecture so engineers and AI coding assistants can scale tests without worrying about the specifics of the Evinced SDK.

---

### 🧠 1. Official Evinced AI Skills (`AGENTS.md`)

As documented in the official [Evinced Playwright JS SDK Documentation](https://developer.evinced.com/sdks-for-web-apps/playwright-js-sdk#ai-skills), the `@evinced/js-playwright-sdk` package ships with built-in AI agent skills.

This repository activates them directly in [AGENTS.md](file:///Users/annabelsegall/Documents/Antigravity/Evinced/AGENTS.md), allowing AI coding assistants to use the SDK without needing to know the specific API calls, configuration options, or file export patterns.

### ⚡ 2. The Golden Rule for Developers: Zero Boilerplate Fixture

With AI Skills activated, developers (and AI assistants) only need to follow one simple convention: **import `test` and `expect` from `../fixtures/evinced-fixture` instead of `@playwright/test`**:

```javascript
// ✅ ZERO BOILERPLATE — Developers write standard Playwright:
const { test, expect } = require('../fixtures/evinced-fixture');

test('Search products and checkout', async ({ page }) => {
  await page.goto('/');
  await page.locator('input[type="search"]').fill('headphones');
  await page.keyboard.press('Enter');
  await expect(page.locator('.product-grid')).toBeVisible();

  // - Evinced continuous scanning is started automatically before the test.
  // - All DOM mutations across user clicks and modals are audited.
  // - An HTML report is saved to reports/scale-suite/.
  // - The report is attached directly to Playwright CI artifacts.
  // - The quality gate fails the test if accessibility defects are discovered.
});
```

---

### 🏛️ 3. 4 Ideas for Evinced at Scale

#### 1. Custom Playwright Test Fixture (`fixtures/evinced-fixture.js`)
Instead of duplicating SDK orchestration code across test suites:
- Hooks into Playwright's test lifecycle (`beforeEach` and `afterEach`).
- Automatically starts `evStart()`.
- Collects all issues via `evStop()` and automatically writes unique reports to `reports/scale-suite/<test_name>.html`.
- Attaches reports to Playwright's native test runner output (`testInfo.attach`).

#### 2. Automated Quality Gates & Threshold Policies
The fixture enforces organizational compliance policies:
- **Default Policy**: Strict zero-tolerance (`expect(issues).toHaveLength(0)`).
- **Configurable Overrides**: Teams can customize thresholds per suite (e.g. allow minor issues while blocking critical):
  ```javascript
  test.use({
    evincedThresholds: { critical: 0, serious: 0, moderate: 2, minor: null }
  });
  ```
- **Non-UI Bypass**: Easily disable auto-scanning for purely backend or API checks via `test.use({ evincedAutoScan: false })`.

#### 3. Centralized Governance (`evConfig.json`)
Manage rules and exclusions globally rather than per test:
- Suppress third-party widgets (chatbots, cookie banners, payment iframes) via `"scan": { "iframes": false }`.
- Enable visual screenshots globally for all reports via `"scan": { "screenshots": { "enabled": true } }`.

#### 4. Automated CI/CD Pipeline (`.github/workflows/playwright-evinced.yml`)
- Executes the full accessibility test suite on every git commit.
- Runs headless Playwright Chromium.
- Uploads all Evinced HTML reports and screenshots as downloadable GitHub workflow artifacts.

---

## 💻 5. Running Tests

| Command | Description |
| :--- | :--- |
| `npm test` | Run the complete Playwright accessibility suite |
| `npm run test:home` | Run Test 1: Snapshot Homepage Navigation (`evAnalyze`) |
| `npm run test:flow` | Run Test 2: Continuous Interactive Shopping Flow (`evStart`/`evStop`) |
| `npm run test:scale` | Run Test 3: Fixture-based Scalable Enterprise Tests |
| `npm run test:headed` | Run tests in headed browser mode |
| `npm run open-report` | Open all generated HTML reports (core + scale suite) in browser |

---

## 🔄 6. GitHub Actions CI Configuration

The workflow [.github/workflows/playwright-evinced.yml](file:///Users/annabelsegall/Documents/Antigravity/Evinced/.github/workflows/playwright-evinced.yml) runs on every `push` and `pull_request`:

1. Checks out repository.
2. Injects `EVINCED_JFROG_AUTH_TOKEN` into `.npmrc`.
3. Installs dependencies and Playwright Chromium browser binaries.
4. Executes tests using `EVINCED_SERVICE_ID` and `EVINCED_API_KEY`.
5. Archives all HTML reports and screenshots as downloadable artifacts.

### Repository Secrets Setup in GitHub:
Add the following under **Settings > Secrets and variables > Actions**:
- `EVINCED_JFROG_AUTH_TOKEN`: Your JFrog Artifactory JSON Web Token.
- `EVINCED_SERVICE_ID`: `MYSERVICEID`
- `EVINCED_API_KEY`: `MYAPIKEY`
