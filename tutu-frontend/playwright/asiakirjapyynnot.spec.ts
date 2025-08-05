import { expect, test } from '@playwright/test';
import {
  mockHakemus,
  mockInit,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { getHakemus } from '@/playwright/fixtures/hakemus1';

test('Asiakirjapyyntöjen dropdown näkyy sivulla ja saa oikean arvon valitessa', async ({
  page,
}) => {
  const testOrigin = 'https://127.0.0.1:33123';
  let callCount = 0;
  const corsHeaders = {
    'Access-Control-Allow-Origin': testOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-TOKEN',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };

  mockInit(page);
  await mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);

  const hakemus = getHakemus();

  await page.route('**/tutu-backend/api/hakemus/*', async (route) => {
    callCount++;
    if (callCount == 1) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          ...hakemus,
          pyydettavatAsiakirjat: [],
        }),
      });
    } else if (callCount == 2) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          ...hakemus,
          pyydettavatAsiakirjat: [
            { id: 'test-id', asiakirjanTyyppi: 'nimenmuutos' },
          ],
        }),
      });
    } else if (callCount == 3) {
      await route.fulfill({
        status: 200,
        headers: corsHeaders,
        contentType: 'application/json',
        body: JSON.stringify({
          ...hakemus,
          pyydettavatAsiakirjat: [],
        }),
      });
    } else {
      await route.continue();
    }
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(page.locator('h2').last()).toHaveText('Pyydettävät asiakirjat');

  await expect(page.getByTestId('pyyda-asiakirja-button')).toBeVisible();
  await page.getByTestId('pyyda-asiakirja-button').click();

  const pyydaSelect = page.getByTestId('pyyda-asiakirja-select').first();
  await expect(pyydaSelect).toBeVisible();
  await pyydaSelect.click();

  const menuItems = page.locator('[role="option"]');
  await menuItems.last().click();

  await expect(pyydaSelect).toHaveText('Nimenmuutoksen todistava asiakirja');

  await page.getByTestId('poista-asiakirja-button').first().click();
  await expect(page.getByTestId('pyyda-asiakirja-select')).toBeVisible();
  await page.getByTestId('poista-asiakirja-button').click();
  await expect(page.getByTestId('pyyda-asiakirja-select')).not.toBeVisible();
});
