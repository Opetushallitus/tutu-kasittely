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

test('Hakemusotsikko displays correct data', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustiedot',
  );

  const hakija = await page.getByTestId('hakemusotsikko-hakija');
  await expect(hakija).toHaveText('Heittotähti, Heikki Hemuli - 121280-123A');

  const asiatunnus = await page.getByTestId('hakemusotsikko-asiatunnus');
  await expect(asiatunnus).toHaveText('OPH-111-2025');

  const kirjausPvm = await page.getByTestId('hakemusotsikko-kirjauspvm');
  await expect(kirjausPvm).toContainText('14.05.2025');

  const esittelyPvm = await page.getByTestId('hakemusotsikko-esittelypvm');
  await expect(esittelyPvm).toContainText('28.05.2025');

  const paatosPvm = await page.getByTestId(
    'hakemusotsikko-lopullinenpaatospvm',
  );
  await expect(paatosPvm).toContainText('28.05.2025');

  const esittelija = await page.getByTestId('hakemusotsikko-esittelija');
  await expect(esittelija).toContainText('Janne Jamaika');
});
