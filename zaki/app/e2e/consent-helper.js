// Test helper: record a family consent in the app's saved data (so other checks can run).
// The consent must carry the CURRENT consent version (src/lib/consentText.ts), otherwise the
// app asks the family to agree again.
const fs = require('fs');
const path = require('path');

const CONSENT_VERSION = (fs.readFileSync(path.join(__dirname, '..', 'src', 'lib', 'consentText.ts'), 'utf8').match(/CONSENT_VERSION\s*=\s*'([^']+)'/) || [])[1];
if (!CONSENT_VERSION) throw new Error('CONSENT_VERSION not found in src/lib/consentText.ts');
module.exports.CONSENT_VERSION = CONSENT_VERSION;

/** Writes a test consent straight into saved state (the page must already be on the app). */
module.exports.writeTestConsent = async function writeTestConsent(page) {
  await page.evaluate((version) => {
    const k = 'zaki:v1:state';
    const s = JSON.parse(localStorage.getItem(k));
    s.consent = { version, at: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), mode: 'two-guardians', guardians: [{ firstName: 'Test', relationship: 'parent' }, { firstName: 'Test2', relationship: 'parent' }] };
    localStorage.setItem(k, JSON.stringify(s));
  }, CONSENT_VERSION);
};

module.exports.giveTestConsent = async function giveTestConsent(page, base) {
  await page.getByTestId('profile-Maya').locator('visible=true').first().waitFor({ timeout: 15000 });
  await module.exports.writeTestConsent(page);
  await page.goto(base);
  await page.getByTestId('profile-Maya').locator('visible=true').first().waitFor({ timeout: 15000 });
};
