import { test, expect } from '@playwright/test';

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
  await page.route('**/tutu-backend/api/esittelijat*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          esittelijaOid: '1.2.246.562.24.999999999998',
          etunimi: 'Kari',
          sukunimi: 'Karibia',
        },
        {
          esittelijaOid: '1.2.246.562.24.999999999999',
          etunimi: 'Janne',
          sukunimi: 'Jamaika',
        },
      ]),
    });
  });
  await page.route(
    '**/tutu-backend/api/hakemus/1.2.246.562.10.00000000001',
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hakemusOid: '1.2.246.562.10.00000000001',
          hakijanEtunimet: 'Heikki Hemuli',
          hakijanSukunimi: 'Heittotähti',
          hakijanHetu: '121280-123A',
          asiatunnus: 'OPH-111-2025',
          kirjausPvm: '2025-05-14T10:59:47.597',
          esittelyPvm: '2025-05-28T10:59:47.597',
          paatosPvm: '2025-05-28T10:59:47.597',
          esittelijaOid: '1.2.246.562.24.999999999999',
        }),
      });
    },
  );
});

test('Hakemusotsikko latautuu', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  // odotetaan että hakemuslista on ladattu
  await expect(page.getByTestId('hakemus-detail-layout')).toBeVisible();
  // expect(await hakemusRow.count()).toBe(3);
});
