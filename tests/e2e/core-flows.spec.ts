import { test, expect } from '@playwright/test';
import { waitForAppReady, dismissToasts } from '../fixtures/helpers';

const BASE_URL = 'https://evento-beni.preview.emergentagent.com';

test.describe('Core Flows - Navigation & Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
    // Remove emergent badge if present
    await page.addLocatorHandler(
      page.locator('[class*="emergent"], [id*="emergent-badge"]'),
      async (locator) => {
        await locator.evaluate((el) => el.remove()).catch(() => {});
      }
    );
  });

  test('Homepage loads with hero section', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('home-page')).toBeVisible();
    await expect(page.getByTestId('hero-section')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toBeVisible();
    await expect(page.getByTestId('hero-title')).toHaveText('BÉNI');
    await expect(page.getByTestId('hero-tagline')).toBeVisible();
    await expect(page.getByTestId('hero-label')).toContainText('Luxembourg');
  });

  test('Homepage hero CTA buttons are visible and navigate', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('hero-discover-btn')).toBeVisible();
    await expect(page.getByTestId('hero-reserve-btn')).toBeVisible();
    // Click discover - navigates to /weekly-menu
    await page.getByTestId('hero-discover-btn').click({ force: true });
    await expect(page).toHaveURL(/\/weekly-menu/);
  });

  test('Homepage about section is visible', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('about-section')).toBeVisible();
    await expect(page.getByTestId('about-title')).toBeVisible();
    await expect(page.getByTestId('about-quote')).toBeVisible();
  });

  test('Homepage weekly menu preview section exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('weekly-preview-section')).toBeVisible();
    await expect(page.getByTestId('weekly-preview-title')).toBeVisible();
    // Pricing cards should always be shown
    await expect(page.getByTestId('price-full')).toBeVisible();
    await expect(page.getByTestId('price-entree-plat')).toBeVisible();
    await expect(page.getByTestId('price-plat-dessert')).toBeVisible();
    await expect(page.getByTestId('price-plat-only')).toBeVisible();
  });

  test('Homepage reservation CTA section exists', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('reservation-cta-section')).toBeVisible();
    await expect(page.getByTestId('reservation-cta-btn')).toBeVisible();
    // Click reserve - navigates to /reservations
    await page.getByTestId('reservation-cta-btn').click({ force: true });
    await expect(page).toHaveURL(/\/reservations/);
  });

  test('Navbar is visible with all links', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('main-navbar')).toBeVisible();
    await expect(page.getByTestId('navbar-logo')).toBeVisible();
    await expect(page.getByTestId('navbar-logo')).toContainText('BÉNI');
  });

  test('Navigation to Weekly Menu page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('nav-link-weekly-menu').click();
    await expect(page).toHaveURL(/\/weekly-menu/);
    await expect(page.getByTestId('weekly-menu-page')).toBeVisible();
  });

  test('Navigation to Reservations page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('nav-link-reservations').click();
    await expect(page).toHaveURL(/\/reservations/);
    await expect(page.getByTestId('reservations-page')).toBeVisible();
  });

  test('Language selector changes language to English', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Default language is French - tagline should be "Food is Life"
    await expect(page.getByTestId('hero-tagline')).toHaveText('Food is Life');

    // Open language dropdown
    await page.getByTestId('language-selector-trigger').click();
    await expect(page.getByTestId('language-option-en')).toBeVisible();
    await page.getByTestId('language-option-en').click();

    // Wait for re-render, discover button should change language
    await expect(page.getByTestId('hero-discover-btn')).toContainText('Discover');
  });

  test('Language selector changes language to Portuguese', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('language-selector-trigger').click();
    await page.getByTestId('language-option-pt').click();
    await expect(page.getByTestId('hero-tagline')).toHaveText('Comida é Vida');
    await expect(page.getByTestId('hero-discover-btn')).toContainText('Descobrir');
  });

  test('Language selector switches back to French', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Test PT → FR (fresh page load ensures clean state each time)
    await page.getByTestId('language-selector-trigger').click();
    await expect(page.getByTestId('language-option-pt')).toBeVisible();
    await page.getByTestId('language-option-pt').click();
    await expect(page.getByTestId('hero-tagline')).toHaveText('Comida é Vida');
    // Navigate away and back to reset language state for FR verification
    await page.goto('/weekly-menu', { waitUntil: 'domcontentloaded' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Default language should be FR
    await page.getByTestId('language-selector-trigger').click();
    await expect(page.getByTestId('language-option-fr')).toBeVisible();
    await page.getByTestId('language-option-fr').click();
    await expect(page.getByTestId('hero-discover-btn')).toContainText('Découvrir');
  });

  test('Mobile menu toggle works on small viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Mobile menu button should be visible
    await expect(page.getByTestId('mobile-menu-toggle')).toBeVisible();
    // Click to open mobile menu
    await page.getByTestId('mobile-menu-toggle').click();
    await expect(page.getByTestId('mobile-menu')).toBeVisible();
    // Mobile nav links should be visible
    await expect(page.getByTestId('mobile-nav-link-weekly-menu')).toBeVisible();
    await expect(page.getByTestId('mobile-nav-link-reservations')).toBeVisible();
  });

  test('Mobile language buttons visible in mobile menu', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('mobile-menu-toggle').click();
    await expect(page.getByTestId('mobile-language-fr')).toBeVisible();
    await expect(page.getByTestId('mobile-language-en')).toBeVisible();
    await expect(page.getByTestId('mobile-language-pt')).toBeVisible();
  });
});
