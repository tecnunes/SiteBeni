import { test, expect } from '@playwright/test';
import { dismissToasts } from '../fixtures/helpers';

const BASE_URL = 'https://beni-photo-editor.preview.emergentagent.com';

// Default admin credentials (seeded at startup)
const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = '#Sti93qn06301616';

test.describe('Admin Authentication & Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  // ─── Admin Login Page ────────────────────────────────────────────────────────

  test('Admin login page loads correctly', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
    await expect(page.getByTestId('admin-login-form')).toBeVisible();
    await expect(page.getByTestId('email-input')).toBeVisible();
    await expect(page.getByTestId('password-input')).toBeVisible();
    await expect(page.getByTestId('submit-btn')).toBeVisible();
    await expect(page.getByTestId('back-to-home')).toBeVisible();
  });

  test('Admin login page back to home link works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('back-to-home').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('Password visibility toggle works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    const passwordInput = page.getByTestId('password-input');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    // Click toggle
    await page.getByTestId('toggle-password-visibility').click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    // Click again to hide
    await page.getByTestId('toggle-password-visibility').click();
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('Admin login with valid credentials works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
  });

  test('Admin login with wrong password shows error', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('submit-btn').click();
    // Should stay on login page, not navigate to dashboard
    await expect(page).not.toHaveURL(/\/admin\/dashboard/);
    await expect(page.getByTestId('admin-login-page')).toBeVisible();
  });

  test('Protected route redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin/dashboard', { waitUntil: 'domcontentloaded' });
    // Should be redirected to admin login
    await expect(page).toHaveURL(/\/admin\/login/);
  });

  // ─── Admin Dashboard ─────────────────────────────────────────────────────────

  test('Admin dashboard loads with sidebar navigation', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);
    
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    // The sidebar should have navigation items
    await expect(page.getByTestId('sidebar-weekly')).toBeVisible();
    await expect(page.getByTestId('sidebar-cardapio')).toBeVisible();
    await expect(page.getByTestId('sidebar-gallery')).toBeVisible();
    await expect(page.getByTestId('sidebar-reservations')).toBeVisible();
  });

  test('Admin dashboard switches to reservations tab', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.getByTestId('sidebar-reservations').click();
    // Check title changed - Réservations section is visible
    await expect(page.locator('h1, header').filter({ hasText: /Réservations/i }).first()).toBeVisible();
  });

  test('Admin dashboard switches to gallery tab', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/);

    await page.getByTestId('sidebar-gallery').click();
    // Check gallery section is visible
    await expect(page.locator('h1, header').filter({ hasText: /Galerie/i }).first()).toBeVisible();
  });
});
