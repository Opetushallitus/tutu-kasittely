import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';

test.beforeEach(mockBasicForHakemus);

test('Asiakirjapyyntöjen lisäys ja poisto', async ({ page }) => {
  let callCount = 0;

  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  const hakemus = getHakemus();

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(hakemus),
      });
      return;
    }

    if (route.request().method() === 'PUT') {
      callCount++;
      if (callCount == 1) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...hakemus,
            asiakirja: {
              ...hakemus.asiakirja,
              pyydettavatAsiakirjat: [
                { id: 'test-id', asiakirjanTyyppi: 'nimenmuutos' },
              ],
            },
          }),
        });
      } else if (callCount == 2) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...hakemus,
            asiakirja: { ...hakemus.asiakirja, pyydettavatAsiakirjat: [] },
          }),
        });
      } else {
        await route.continue();
      }
    } else {
      await route.continue();
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(
    page.getByTestId('pyydettavat-asiakirjat-otsikko'),
  ).toBeVisible();

  await expect(page.getByTestId('pyyda-asiakirja-button')).toBeVisible();
  await page.getByTestId('pyyda-asiakirja-button').click();

  const pyydaSelect = page.getByTestId('pyyda-asiakirja-select').first();
  await expect(pyydaSelect).toBeVisible();
  await pyydaSelect.click();

  const menuItems = page.locator('[role="option"]');
  await menuItems.last().click();

  await expect(pyydaSelect).toHaveText('Nimenmuutoksen todistava asiakirja');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await page.getByRole('button', { name: 'Tallenna' }).click();

  await expect(
    page.getByRole('button', { name: 'Tallenna' }),
  ).not.toBeVisible();

  await page.getByTestId('poista-asiakirja-button-0').click();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();

  await page.getByTestId('pyyda-asiakirja-button').click();
  await page.getByTestId('poista-asiakirja-button-undefined').click();

  await expect(page.getByTestId('pyyda-asiakirja-select')).not.toBeVisible();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await page.getByRole('button', { name: 'Tallenna' }).click();
});
