import { test, expect } from '@playwright/test';

async function submitPlan(page, {
  project = 'Dog-shaped robot with hidden wheels',
  behavior = 'Hear “left” or “right” and move briefly in that direction, then stop',
  location = 'Bangalore, India',
  budget = '₹3,000–₹5,000',
} = {}) {
  await page.getByLabel('What animal-like robot has been finalised?').fill(project);
  await page.getByLabel('What should it do?').fill(behavior);
  await page.getByLabel('Where will you buy parts?').fill(location);
  await page.getByLabel('What is the budget range?').fill(budget);
  await page.getByRole('button', { name: 'Create my parts plan' }).click();
  await expect(page.locator('#plan')).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.goto('http://127.0.0.1:4173/');
});

test('FORM-01 Default Bangalore location', async ({ page }) => {
  await expect(page.getByLabel('Where will you buy parts?')).toHaveValue('Bangalore, India');
  await expect(page.locator('.location-notice')).toHaveCount(0);
});

test('FORM-02 Required-field validation', async ({ page }) => {
  await page.getByRole('button', { name: 'Create my parts plan' }).click();
  await expect(page.getByRole('alert')).toContainText('Complete all four answers');
  await expect(page.locator('#plan')).toHaveCount(0);
});

test('FORM-03 Reset clears form, plan, and choices', async ({ page }) => {
  await submitPlan(page);
  await page.getByRole('button', { name: 'I need all parts' }).click();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByLabel('What animal-like robot has been finalised?')).toHaveValue('');
  await expect(page.getByLabel('What should it do?')).toHaveValue('');
  await expect(page.getByLabel('Where will you buy parts?')).toHaveValue('Bangalore, India');
  await expect(page.getByLabel('What is the budget range?')).toHaveValue('');
  await expect(page.locator('#plan')).toHaveCount(0);
});

test('LOC-02 Other city warns but still lists parts', async ({ page }) => {
  await page.getByLabel('Where will you buy parts?').fill('Mumbai, India');
  await expect(page.locator('.location-notice')).toContainText('still be created');
  await submitPlan(page, { location: 'Mumbai, India' });
  await expect(page.locator('.part-card')).toHaveCount(14);
  await expect(page.locator('.store-section')).toHaveCount(0);
});

test('RECIPE-01 Dog voice-direction request is an exact recipe match', async ({ page }) => {
  await submitPlan(page);
  await expect(page.locator('.recipe-match')).toContainText('Exact recipe match');
  await expect(page.locator('.recipe-match')).toContainText('ANIMALOID-DOG-2WD-VOICE-V1');
  await expect(page.locator('.part-card')).toHaveCount(14);
  await expect(page.locator('.partial-plan')).toHaveCount(0);
});

test('RECIPE-02 Short distance wording does not add an obstacle sensor', async ({ page }) => {
  await submitPlan(page, { behavior: 'Hear left or right and move a short distance in that direction' });
  await expect(page.locator('.part-card')).toHaveCount(14);
  await expect(page.getByRole('heading', { name: 'HC-05 Bluetooth Module' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'HC-SR04 Ultrasonic Sensor' })).toHaveCount(0);
});

test('RECIPE-03 Extra dog behaviour produces a partial recipe match', async ({ page }) => {
  await submitPlan(page, { behavior: 'Hear left or right and also avoid obstacles' });
  await expect(page.locator('.recipe-match')).toContainText('Partial recipe match');
  await expect(page.locator('.partial-plan')).toContainText('Obstacle avoidance');
  await expect(page.locator('.part-card')).toHaveCount(14);
  await expect(page.getByRole('heading', { name: 'HC-SR04 Ultrasonic Sensor' })).toHaveCount(0);
});

test('UNKNOWN-01 Unknown behaviours produce partial plan', async ({ page }) => {
  await submitPlan(page, { behavior: 'Recognise faces and send GPS location' });
  await expect(page.getByRole('heading', { name: 'Your partial starting plan' })).toBeVisible();
  await expect(page.locator('.partial-plan')).toContainText('Face recognition');
  await expect(page.locator('.partial-plan')).toContainText('GPS location');
  await expect(page.locator('.partial-plan')).toContainText('Do not buy parts');
});

test('UNKNOWN-02 Flying robot shows platform warning', async ({ page }) => {
  await submitPlan(page, { project: 'Flying bird robot', behavior: 'Fly to a window' });
  await expect(page.locator('.recipe-match')).toContainText('No dog recipe match');
  await expect(page.locator('.partial-plan')).toContainText('dog-shaped robot with hidden wheels');
  await expect(page.locator('.part-card')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Your partial starting plan' })).toBeVisible();
});

test('UNKNOWN-03 Thermal sensing does not substitute DHT11', async ({ page }) => {
  await submitPlan(page, { behavior: 'Find warm objects using object temperature' });
  await expect(page.locator('.partial-plan')).toContainText('thermal-camera options');
  await expect(page.getByRole('heading', { name: 'DHT11 Module' })).toHaveCount(0);
});

test('OWN-02 Need all selects all base parts and total', async ({ page }) => {
  await submitPlan(page);
  await page.getByRole('button', { name: 'I need all parts' }).click();
  await expect(page.locator('.need-list > li')).toHaveCount(14);
  await expect(page.locator('.budget-check')).toContainText('₹5,746');
});

test('OWN-03 Already have all gives truthful empty summary', async ({ page }) => {
  await submitPlan(page);
  const cards = page.locator('.part-card');
  for (let index = 0; index < await cards.count(); index += 1) {
    await cards.nth(index).getByLabel('Already have').check();
  }
  await expect(page.locator('.empty-summary')).toContainText('already have every listed part', { ignoreCase: true });
});

test('PRICE-01 Arduino shows verified V5 estimate details', async ({ page }) => {
  await submitPlan(page);
  const arduinoCard = page.locator('.part-card').filter({ has: page.getByRole('heading', { name: 'Arduino Uno R3' }) });
  await expect(arduinoCard.locator('.part-price-estimate')).toContainText('₹206');
  await expect(arduinoCard.locator('.part-price-estimate')).toContainText('₹161–₹267');
  await expect(arduinoCard.locator('.part-price-estimate')).toContainText('High confidence');
  await expect(arduinoCard.locator('.part-price-estimate')).toContainText('2026-08-30');
});

test('PRICE-03 Base total compares with budget', async ({ page }) => {
  await submitPlan(page);
  await page.getByRole('button', { name: 'I need all parts' }).click();
  await expect(page.locator('.budget-check')).toContainText('₹5,746');
  await expect(page.locator('.budget-check')).toContainText('₹746 above your budget limit');
});

test('BUY-01 Buying result includes explanations, guides, searches, and prerequisites', async ({ page }) => {
  await submitPlan(page);
  await page.getByRole('button', { name: 'I need all parts' }).click();
  await expect(page.locator('.recipe-reason')).toHaveCount(14);
  await expect(page.locator('.part-tutorial')).toHaveCount(14);
  await expect(page.locator('.buy-searches a').first()).toBeVisible();
  await expect(page.locator('.need-list-purpose')).toHaveCount(14);
  await expect(page.locator('.build-prerequisites')).toContainText('Phone with Bluetooth');
  await expect(page.locator('.build-prerequisites')).toContainText('Computer with a USB port');
  await expect(page.locator('.build-prerequisites')).toContainText('Dog-shaped outer body');
  await expect(page.locator('.build-prerequisites')).toContainText('Adult supervision');
});

test('CONCLUSION-01 Result closes with current-record guidance, not a validation claim', async ({ page }) => {
  await submitPlan(page);
  await expect(page.locator('.recipe-validation')).toHaveCount(0);
  await expect(page.locator('.recipe-match')).not.toContainText('Draft');
  await expect(page.locator('.record-conclusion')).toContainText('Based on our current records');
  await expect(page.locator('.record-conclusion')).toContainText('check the listed specifications with an adult');
});

test('MOBILE-01 Core flow fits 375px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await submitPlan(page);
  await page.getByRole('button', { name: 'I need all parts' }).click();
  await expect(page.locator('.budget-check')).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
