require('dotenv').config();
const { setCredentials } = require('@evinced/js-playwright-sdk');

/**
 * Playwright Global Setup
 * Authenticates the Evinced engine once prior to test suite execution.
 */
async function globalSetup(config) {
  const serviceId = process.env.EVINCED_SERVICE_ID;
  const secret = process.env.EVINCED_API_KEY;

  console.log('\n--- Initializing Evinced Playwright JS SDK ---');
  console.log(`Service ID: ${serviceId ? serviceId.slice(0, 8) + '...' : 'Not configured'}`);

  try {
    await setCredentials({
      serviceId,
      secret,
    });
    console.log('✅ Evinced SDK credentials authenticated successfully.\n');
  } catch (error) {
    console.error('❌ Failed to authenticate with Evinced SDK:', error.message);
    throw error;
  }
}

module.exports = globalSetup;
