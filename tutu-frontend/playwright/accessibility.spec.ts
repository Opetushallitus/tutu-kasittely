import { Page, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockRoute } from '@/playwright/mocks';

const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
};

test.beforeEach(mockRoute);

test('Saavutettavuus ok', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Tutkintojen tunnustaminen');
  await expectPageAccessibilityOk(page);
});
