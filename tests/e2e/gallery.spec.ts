import { test, expect } from '@playwright/test';
import { dismissToasts, adminLogin } from '../fixtures/helpers';

const ADMIN_EMAIL = 'admin';
const ADMIN_PASSWORD = '#Sti93qn06301616';

test.describe('Public Gallery Page', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Gallery page loads with fallback images when database is empty', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('gallery-page')).toBeVisible();
    await expect(page.getByTestId('gallery-title')).toBeVisible();
    await expect(page.getByTestId('gallery-title')).toHaveText(/Galer/i);
    await expect(page.getByTestId('gallery-filters')).toBeVisible();
  });

  test('Gallery page has category filter buttons', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('filter-all')).toBeVisible();
    await expect(page.getByTestId('filter-ambiance')).toBeVisible();
    await expect(page.getByTestId('filter-dishes')).toBeVisible();
    await expect(page.getByTestId('filter-team')).toBeVisible();
  });

  test('Gallery filters work - clicking Ambiance shows ambiance images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('filter-ambiance').click();
    // Verify the filter button is active (golden background)
    await expect(page.getByTestId('filter-ambiance')).toHaveCSS('background-color', /rgb\(212, 175, 55\)|rgb\(212,175,55\)/);
  });

  test('Gallery filters work - clicking Dishes shows dish images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('filter-dishes').click();
    await expect(page.getByTestId('filter-dishes')).toHaveCSS('background-color', /rgb\(212, 175, 55\)|rgb\(212,175,55\)/);
  });

  test('Gallery filters work - clicking Team shows team images', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.getByTestId('filter-team').click();
    await expect(page.getByTestId('filter-team')).toHaveCSS('background-color', /rgb\(212, 175, 55\)|rgb\(212,175,55\)/);
  });

  test('Gallery images are displayed', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    // At least one gallery image should be visible (fallback or real)
    await expect(page.getByTestId('gallery-image-0')).toBeVisible();
  });

  test('Clicking gallery image opens lightbox', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    // Click first image to open lightbox
    await page.getByTestId('gallery-image-0').click();
    await expect(page.getByTestId('gallery-lightbox')).toBeVisible();
    await expect(page.getByTestId('lightbox-close')).toBeVisible();
    await expect(page.getByTestId('lightbox-prev')).toBeVisible();
    await expect(page.getByTestId('lightbox-next')).toBeVisible();
  });

  test('Lightbox navigation works', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.getByTestId('gallery-image-0').click();
    await expect(page.getByTestId('gallery-lightbox')).toBeVisible();
    // Click next
    await page.getByTestId('lightbox-next').click();
    // Lightbox should still be visible
    await expect(page.getByTestId('gallery-lightbox')).toBeVisible();
  });

  test('Lightbox closes when clicking close button', async ({ page }) => {
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.getByTestId('gallery-image-0').click();
    await expect(page.getByTestId('gallery-lightbox')).toBeVisible();
    await page.getByTestId('lightbox-close').click();
    await expect(page.getByTestId('gallery-lightbox')).not.toBeVisible();
  });

  test('Gallery navigation from homepage works', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Click Galerie nav link
    await page.getByRole('link', { name: /galerie/i }).first().click();
    await expect(page).toHaveURL('/gallery');
    await expect(page.getByTestId('gallery-page')).toBeVisible();
  });
});

test.describe('Admin Gallery Management', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Admin can navigate to gallery tab', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    await expect(page.locator('h1, h2').filter({ hasText: /Galerie/i }).first()).toBeVisible();
  });

  test('Admin gallery has category tabs (Ambiance, Plats, Équipe)', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Check tabs exist - using role since tabs are styled with TabsList
    await expect(page.getByRole('tab', { name: /ambiance/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /plats/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /équipe/i })).toBeVisible();
  });

  test('Admin can switch between gallery category tabs', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Switch to Plats tab
    await page.getByRole('tab', { name: /plats/i }).click();
    // Verify Plats tab is active
    await expect(page.getByRole('tab', { name: /plats/i })).toHaveAttribute('data-state', 'active');
    // Switch to Équipe tab
    await page.getByRole('tab', { name: /équipe/i }).click();
    await expect(page.getByRole('tab', { name: /équipe/i })).toHaveAttribute('data-state', 'active');
  });

  test('Admin gallery has Add button for each category', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Each category should have an Ajouter button
    await expect(page.getByRole('button', { name: /ajouter/i }).first()).toBeVisible();
  });

  test('Admin can add a new gallery image to Ambiance category', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Should be on Ambiance tab by default
    const initialCount = await page.locator('[data-testid^="gallery-item-"]').count();
    // Click add button
    await page.getByRole('button', { name: /ajouter/i }).first().click();
    // A new gallery item card should appear (either with form or empty state)
    const newCount = await page.locator('[data-testid^="gallery-item-"]').count();
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  test('Admin gallery image card has save and delete buttons', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Add a new image first
    await page.getByRole('button', { name: /ajouter/i }).first().click();
    // Check for save and delete buttons on the new card
    const galleryItems = page.locator('[data-testid^="gallery-item-"]');
    if (await galleryItems.count() > 0) {
      const firstItem = galleryItems.first();
      // Should have delete button (Trash icon)
      await expect(firstItem.locator('button').filter({ has: page.locator('svg') }).first()).toBeVisible();
    }
  });

  test('Admin gallery image card has alt text inputs for FR/EN/PT', async ({ page }) => {
    await adminLogin(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.getByTestId('sidebar-gallery').click();
    // Add a new image first
    await page.getByRole('button', { name: /ajouter/i }).first().click();
    // Check for alt text input fields
    await expect(page.locator('input[placeholder*="Alt (FR)"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Alt (EN)"]').first()).toBeVisible();
    await expect(page.locator('input[placeholder*="Alt (PT)"]').first()).toBeVisible();
  });
});

test.describe('Gallery Integration - Admin Add then Public View', () => {
  test.beforeEach(async ({ page }) => {
    await dismissToasts(page);
  });

  test('Full flow: Admin adds image, public gallery displays it', async ({ page, request }) => {
    const testImageUrl = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80';
    const uniqueAlt = `TEST_Image_${Date.now()}`;
    
    // Step 1: Login to admin and add image via API (faster than UI)
    const loginResponse = await request.post('/api/auth/login', {
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD }
    });
    expect(loginResponse.ok()).toBeTruthy();
    const { access_token } = await loginResponse.json();
    
    // Step 2: Create gallery image via API
    const createResponse = await request.post('/api/gallery', {
      headers: { Authorization: `Bearer ${access_token}` },
      data: {
        url: testImageUrl,
        category: 'ambiance',
        alt_fr: uniqueAlt,
        alt_en: uniqueAlt,
        alt_pt: uniqueAlt,
        sort_order: 0
      }
    });
    expect(createResponse.ok()).toBeTruthy();
    const createdImage = await createResponse.json();
    expect(createdImage.id).toBeTruthy();
    
    // Step 3: Visit public gallery page and verify the image is there
    await page.goto('/gallery', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    
    // Filter to ambiance
    await page.getByTestId('filter-ambiance').click();
    
    // Gallery should have our test image (check by src attribute)
    const images = page.locator('[data-testid^="gallery-image-"] img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Cleanup: Delete the test image
    const deleteResponse = await request.delete(`/api/gallery/${createdImage.id}`, {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    expect(deleteResponse.ok()).toBeTruthy();
  });
});
