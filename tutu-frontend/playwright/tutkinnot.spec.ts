import { expect, test } from '@playwright/test';
import { mockBasicForHakemus, mockHakemus, mockUser } from '@/playwright/mocks';

test.beforeEach(mockBasicForHakemus);

test('Yhteistutkinto-checkbox näkyy', async ({ page }) => {
  mockUser(page);
  mockHakemus(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/tutkinnot',
  );
  await expect(page.getByTestId('yhteistutkinto-checkbox')).not.toBeChecked();
  await page.getByTestId('yhteistutkinto-checkbox').click();
  await expect(page.getByTestId('yhteistutkinto-checkbox')).toBeChecked();
});
