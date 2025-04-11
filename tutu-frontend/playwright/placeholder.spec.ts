import { test, expect } from '@playwright/test';

test('Dev server on päällä', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toBeVisible();
});
