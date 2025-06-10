import { expect, test } from '@playwright/test';
import { mockRoute } from '@/playwright/mocks';

test.beforeEach(mockRoute);

test('Sivupalkki näkyvissä oletussivulla', async ({ page }) => {
  await page.goto(
    'tutu-frontend/hakemus/1.2.246.562.11.00000000001/perustiedot',
  );

  await expect(page.getByTestId('hakemus-sidebar')).toBeVisible();
});
