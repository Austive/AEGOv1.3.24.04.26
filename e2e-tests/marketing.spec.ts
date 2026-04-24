import { test, expect } from '@playwright/test';

test.describe('Aego Marketing Website', () => {
  test('should load the homepage and display hero content', async ({ page }) => {
    await page.goto('/');
    
    // Check if hero title is present
    await expect(page.getByRole('link', { name: 'AEGO', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    
    // Check marketing sections
    await expect(page.getByText('Features')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
  });

  test('should navigate to Partner With Us page', async ({ page }) => {
    await page.goto('/');
    
    // Click on partner with us link
    await page.getByRole('link', { name: 'Partner With Us' }).first().click();
    
    await expect(page).toHaveURL(/.*\/partner/);
    await expect(page.getByRole('heading', { name: 'Partner With Aego' })).toBeVisible();
  });

  test('should have a contact form on the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check for the new contact section we will add
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });
});
