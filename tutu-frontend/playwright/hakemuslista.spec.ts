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
  await page.route('**/tutu-backend/api/hakemuslista', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          asiatunnus: '123456',
          hakija: 'Heikki Heittotähti',
          vaihe: 'Hakemus käsittelyssä',
          paatostyyppi: 'päätös',
          aika: '3 kk',
          hakemusOid: '1.2.246.562.10.00000000001',
          syykoodi: '2',
          esittelijaId: '1212-3333-DDDD-4444-5555-6666',
          esittelijaOid: '1.2.246.562.24.999999999999',
        },
        {
          hakija: 'Kalle Katana',
          vaihe: 'Hakemus käsittelyssä',
          paatostyyppi: 'päätös',
          aika: '3 kk',
          hakemusOid: '1.2.246.562.10.00000000002',
          syykoodi: '2',
          esittelijaId: '1212-3333-DDDD-4444-5555-6668',
          esittelijaOid: '1.2.246.562.24.999999999998',
        },
      ]),
    });
  });
});

test('Hakemuslistaus latautuu', async ({ page }) => {
  await page.goto('/tutu-frontend');

  await expect(page.locator('h1')).toBeVisible();

  // varmistaa että spinneristä on siirrytty eteenpäin ennen seuraavaa expectiä
  const hakemusRow = page.getByTestId('hakemus-row');

  // parempi testi kun haetaan oikeaa dataa
  expect(await hakemusRow.count()).toBeGreaterThan(0);
});

test('Hakemuslistan filtteri saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  await page.goto('/tutu-frontend?haku=testihakusana&nayta=omat');

  const hakukentta = page.getByTestId('hakukentta').locator('input');

  const omatButton = page.getByTestId('nayta-omat');

  await expect(hakukentta).toHaveValue('testihakusana');

  await expect(omatButton).toHaveClass(/Mui-selected/);
});

test('Hakemuslistan filtteri saa oikeat arvot local storagesta', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'tutu-query-string',
      'tilat=kasittelyssa,kasitelty&hakemuskoskee=kelpoisuus',
    );
  });

  await page.goto('/');

  const kasittelytila = page.getByTestId('kasittelytila').locator('input');

  const hakemusKoskee = page.getByTestId('hakemus-koskee').locator('input');

  await expect(kasittelytila).toHaveValue('kasittelyssa,kasitelty');

  await expect(hakemusKoskee).toHaveValue('kelpoisuus');
});
