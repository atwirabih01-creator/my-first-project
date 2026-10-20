// Test helper: record a family consent in the app's saved data (so other checks can run).
module.exports.giveTestConsent = async function giveTestConsent(page, base) {
  await page.getByTestId('profile-Maya').locator('visible=true').first().waitFor({ timeout: 15000 });
  await page.evaluate(() => {
    const k = 'zaki:v1:state';
    const s = JSON.parse(localStorage.getItem(k));
    s.consent = { version: 'test', at: new Date().toISOString(), date: new Date().toISOString().slice(0, 10), mode: 'two-guardians', guardians: [{ firstName: 'Test', relationship: 'parent' }, { firstName: 'Test2', relationship: 'parent' }] };
    localStorage.setItem(k, JSON.stringify(s));
  });
  await page.goto(base);
  await page.getByTestId('profile-Maya').locator('visible=true').first().waitFor({ timeout: 15000 });
};
