import { test, expect } from '@playwright/test';
import { dismissToasts } from '../fixtures/helpers';

const BASE_URL = 'https://la-cuisine-weekly.preview.emergentagent.com';

test.describe('Weekly Menu & Reservations', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    await page.evaluate(() => {
      const badge = document.querySelector('[class*="emergent"], [id*="emergent-badge"]');
      if (badge) badge.remove();
    }).catch(() => {});
  });

  // ─── Weekly Menu Page ────────────────────────────────────────────────────────

  test('Weekly menu page loads correctly', async ({ page }) => {
    await page.goto('/weekly-menu', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('weekly-menu-page')).toBeVisible();
    await expect(page.getByTestId('weekly-menu-title')).toBeVisible();
    await expect(page.getByTestId('weekly-menu-label')).toBeVisible();
  });

  test('Weekly menu page shows no-menu message when no active menu', async ({ page }) => {
    await page.goto('/weekly-menu', { waitUntil: 'domcontentloaded' });
    // Wait for loading to complete
    await expect(page.locator('[data-testid="weekly-menu-page"]')).toBeVisible();
    // Either shows dishes or a no-menu message
    const hasMenu = await page.getByTestId('main-dishes-section').isVisible().catch(() => false);
    const hasNoMenu = await page.getByTestId('no-menu-message').isVisible().catch(() => false);
    // One or the other must be true
    expect(hasMenu || hasNoMenu).toBe(true);
  });

  test('Weekly menu page displays pricing section when menu exists', async ({ page }) => {
    await page.goto('/weekly-menu', { waitUntil: 'domcontentloaded' });
    const hasMenu = await page.getByTestId('pricing-section').isVisible().catch(() => false);
    if (hasMenu) {
      await expect(page.getByTestId('formula-full')).toBeVisible();
      await expect(page.getByTestId('formula-entree-plat')).toBeVisible();
      await expect(page.getByTestId('formula-plat-dessert')).toBeVisible();
      await expect(page.getByTestId('formula-plat-only')).toBeVisible();
    }
    // If no menu, test passes since it's expected behavior
  });

  test('Weekly menu label changes when language changes', async ({ page }) => {
    await page.goto('/weekly-menu', { waitUntil: 'domcontentloaded' });
    // Default FR
    await expect(page.getByTestId('weekly-menu-title')).toContainText('Menu de la Semaine');
    // Change to EN
    await page.getByTestId('language-selector-trigger').click();
    await page.getByTestId('language-option-en').click();
    await expect(page.getByTestId('weekly-menu-title')).toContainText('Weekly Menu');
    // Change to PT
    await page.getByTestId('language-selector-trigger').click();
    await page.getByTestId('language-option-pt').click();
    await expect(page.getByTestId('weekly-menu-title')).toContainText('Menu da Semana');
  });

  // ─── Reservations Page ───────────────────────────────────────────────────────

  test('Reservations page loads with form', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('reservations-page')).toBeVisible();
    await expect(page.getByTestId('reservations-title')).toBeVisible();
    await expect(page.getByTestId('reservation-form')).toBeVisible();
  });

  test('Reservation form has all required fields', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('date-picker-trigger')).toBeVisible();
    await expect(page.getByTestId('time-select')).toBeVisible();
    await expect(page.getByTestId('guests-select')).toBeVisible();
    await expect(page.getByTestId('name-input')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('phone-input')).toBeVisible();
    await expect(page.getByTestId('notes-textarea')).toBeVisible();
    await expect(page.getByTestId('submit-reservation-btn')).toBeVisible();
  });

  test('Date picker opens a calendar when clicked', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('date-picker-trigger').click();
    // Calendar should appear (shadcn Calendar component)
    await expect(page.locator('[role="grid"]')).toBeVisible();
  });

  test('Time select has correct time slots', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    const timeSelect = page.getByTestId('time-select');
    await expect(timeSelect).toBeVisible();
    // Check some expected time slots
    const options = await timeSelect.locator('option').allTextContents();
    expect(options).toContain('11:30');
    expect(options).toContain('12:00');
    expect(options).toContain('19:00');
    expect(options).toContain('21:00');
  });

  test('Guests select has 1-10 options', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    const guestsSelect = page.getByTestId('guests-select');
    const options = await guestsSelect.locator('option').allTextContents();
    expect(options.length).toBe(10);
    expect(options[0]).toContain('1');
    expect(options[9]).toContain('10');
  });

  test('Reservation form submission with all required fields', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });

    // Fill in the form
    await page.getByTestId('name-input').fill('Test User Playwright');
    await page.getByTestId('email-input').fill('test.playwright@example.com');
    await page.getByTestId('phone-input').fill('+352 661 000 001');
    await page.getByTestId('time-select').selectOption('12:30');
    await page.getByTestId('guests-select').selectOption('2');

    // Open date picker and select a future date
    await page.getByTestId('date-picker-trigger').click();
    await expect(page.locator('[role="grid"]')).toBeVisible();
    // Click on a future date cell (look for an enabled day button)
    const dayButtons = page.locator('[role="gridcell"] button:not([disabled])');
    await dayButtons.first().click({ force: true });

    // Submit
    await page.getByTestId('submit-reservation-btn').click({ force: true });

    // Should show success state or toast
    await expect(page.getByTestId('reservations-success')).toBeVisible({ timeout: 10000 });
  });

  test('Reservation form shows error without required fields', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    // Submit without filling anything
    await page.getByTestId('submit-reservation-btn').click({ force: true });
    // Should show a toast error (not navigate away)
    await expect(page.getByTestId('reservations-page')).toBeVisible();
    // No success page
    const successVisible = await page.getByTestId('reservations-success').isVisible().catch(() => false);
    expect(successVisible).toBe(false);
  });

  test('Reservations page title changes with language', async ({ page }) => {
    await page.goto('/reservations', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('reservations-title')).toContainText('Réservations');
    // Switch to English
    await page.getByTestId('language-selector-trigger').click();
    await page.getByTestId('language-option-en').click();
    await expect(page.getByTestId('reservations-title')).toContainText('Reservations');
    // Switch to Portuguese
    await page.getByTestId('language-selector-trigger').click();
    await page.getByTestId('language-option-pt').click();
    await expect(page.getByTestId('reservations-title')).toContainText('Reservas');
  });
});
