import { Page, expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
};

test.beforeEach(async ({ page }) => {
  await page.route('**/tutu-backend/api/csrf', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        parameterName: '_csrf',
        token:
          'Gbt6oz01mVW5QV7XQ-hz_5P6BKJ_qkPb0xhjx6ZiW8uYyAnhKotKklkFqjGUJz-0dMVHyqqZKZscnSL24SsBpMRQOvn-rTCF',
        headerName: 'X-CSRF-TOKEN',
      }),
    });
  });
  await page.route('**/tutu-backend/api/user', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: {
          userOid: '1.2.246.562.24.999999999999',
          authorities: [
            'ROLE_APP_TUTU_ESITTELIJA',
            'ROLE_APP_TUTU_ESITTELIJA_1.2.246.562.10.00000000001',
          ],
          asiointikieli: 'fi',
        },
      }),
    });
  });
  await page.route('**/tutu-backend/api/session', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        empty: false,
        traversableAgain: true,
      }),
    });
  });
  await page.route('**/tutu-backend/api/hakemuslista*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          hakija: 'Heikki Heittotähti',
          vaihe: 'Hakemus käsittelyssä',
          aika: '3 kk',
          hakemusOid: '1.2.246.562.10.00000000001',
          hakemusKoskee: '2',
          esittelijaOid: '1.2.246.562.24.999999999999',
          asiatunnus: 'OPH-001-1978',
        },
        {
          hakija: 'Kalle Katana',
          vaihe: 'Hakemus käsittelyssä',
          aika: '3 kk',
          hakemusOid: '1.2.246.562.10.00000000002',
          hakemusKoskee: '2',
          esittelijaOid: '1.2.246.562.24.999999999998',
          asiatunnus: 'OPH-123-2025',
        },
        {
          hakija: 'Simo Samurai',
          vaihe: 'Hakemus käsittelyssä',
          aika: '3 kk',
          hakemusOid: '1.2.246.562.10.00000000003',
          hakemusKoskee: '2',
          esittelijaOid: null,
          asiatunnus: 'OPH-123-2025',
        },
      ]),
    });
  });
});

test('Saavutettavuus ok', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('Tutkintojen tunnustaminen');
  await expectPageAccessibilityOk(page);
});
