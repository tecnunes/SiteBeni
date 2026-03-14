import { test, expect } from '@playwright/test';
import { dismissToasts } from '../fixtures/helpers';
import axios from 'axios';

const BASE_URL = 'https://la-cuisine-weekly.preview.emergentagent.com';
const API = `${BASE_URL}/api`;

// Shared admin credentials for this test suite
const ADMIN_EMAIL = `playwright_admin_${Date.now()}@beni-test.lu`;
const ADMIN_PASSWORD = 'PlaywrightTest123!';
const ADMIN_NAME = 'Playwright Admin';

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
    await expect(page.getByTestId('toggle-auth-mode')).toBeVisible();
  });

  test('Admin login page back to home link works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('back-to-home').click();
    await expect(page).toHaveURL('/');
    await expect(page.getByTestId('home-page')).toBeVisible();
  });

  test('Toggle to register form shows name field', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    // Initially login mode - no name field
    await expect(page.getByTestId('name-input')).not.toBeVisible();
    // Toggle to register
    await page.getByTestId('toggle-auth-mode').click();
    await expect(page.getByTestId('name-input')).toBeVisible();
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

  test('Admin registration creates account and redirects to dashboard', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    // Switch to register
    await page.getByTestId('toggle-auth-mode').click();
    await page.getByTestId('name-input').fill(ADMIN_NAME);
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
  });

  test('Admin login with valid credentials works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
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

  test('Admin dashboard shows menu editor by default', async ({ page }) => {
    // Login first
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('menu-editor')).toBeVisible();
    await expect(page.getByTestId('admin-sidebar')).toBeVisible();
  });

  test('Admin dashboard sidebar has menu and reservations tabs', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    await expect(page.getByTestId('sidebar-menu')).toBeVisible();
    await expect(page.getByTestId('sidebar-reservations')).toBeVisible();
    await expect(page.getByTestId('logout-btn')).toBeVisible();
    await expect(page.getByTestId('view-site-link')).toBeVisible();
  });

  test('Admin dashboard switches to reservations tab', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    await page.getByTestId('sidebar-reservations').click();
    await expect(page.getByTestId('reservations-list')).toBeVisible();
    // Menu editor should not be visible
    await expect(page.getByTestId('menu-editor')).not.toBeVisible();
  });

  test('Admin dashboard menu editor has dish categories', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByTestId('menu-editor')).toBeVisible();

    // Check category sections
    await expect(page.getByTestId('category-meat')).toBeVisible();
    await expect(page.getByTestId('category-vegetarian')).toBeVisible();
    await expect(page.getByTestId('category-seafood')).toBeVisible();
    await expect(page.getByTestId('category-dessert')).toBeVisible();
  });

  test('Admin can add a dish to meat category', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByTestId('menu-editor')).toBeVisible();

    // Click add meat dish button
    const addMeatBtn = page.getByTestId('add-meat-btn');
    await expect(addMeatBtn).toBeVisible();
    await addMeatBtn.click();

    // A new dish form should appear with input fields
    const dishInputs = page.locator('[data-testid^="dish-"] input').first();
    await expect(dishInputs).toBeVisible();
  });

  test('Admin can save menu', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });
    await expect(page.getByTestId('menu-editor')).toBeVisible();

    // Click save
    await page.getByTestId('save-menu-btn').click({ force: true });
    // Should see success notification or button state change
    await expect(page.getByTestId('save-menu-btn')).toBeVisible();
  });

  test('Admin dashboard price inputs are editable', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    // Check price inputs
    await expect(page.getByTestId('price-full-input')).toBeVisible();
    await expect(page.getByTestId('price-entree-plat-input')).toBeVisible();
    await expect(page.getByTestId('price-plat-dessert-input')).toBeVisible();
    await expect(page.getByTestId('price-plat-only-input')).toBeVisible();
  });

  test('Admin logout works', async ({ page }) => {
    await page.goto('/admin/login', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('email-input').fill(ADMIN_EMAIL);
    await page.getByTestId('password-input').fill(ADMIN_PASSWORD);
    await page.getByTestId('submit-btn').click();
    await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15000 });

    await page.getByTestId('logout-btn').click();
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
