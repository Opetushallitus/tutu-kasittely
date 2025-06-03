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

test('Hakemuslistaus latautuu', async ({ page }) => {
  await page.goto('/tutu-frontend');

  await expect(page.locator('h1')).toBeVisible();

  // varmistaa että spinneristä on siirrytty eteenpäin ennen seuraavaa expectiä

  // odotetaan että hakemuslista on ladattu
  await expect(page.getByTestId('hakemus-list')).toBeVisible();
  const hakemusRow = page.getByTestId('hakemus-row');

  expect(await hakemusRow.count()).toBe(3);
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

test('Hakemuslistan esittelija-dropdown saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  await page.goto('/tutu-frontend?esittelija=1.2.246.562.24.999999999999');

  const esittelija = page.getByTestId('esittelija').locator('input');

  const omatButton = page.getByTestId('nayta-omat');

  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');

  await expect(omatButton).not.toHaveClass(/Mui-selected/);
});

test('Hakemuslistan filtteri saa oikeat arvot local storagesta', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'tutu-query-string',
      'tilat=kasittelyssa,kasitelty&hakemuskoskee=1&esittelija=1.2.246.562.24.999999999999',
    );
  });

  await page.goto('/');

  const kasittelytila = page.getByTestId('kasittelytila').locator('input');

  const hakemusKoskee = page.getByTestId('hakemus-koskee').locator('input');

  const esittelija = page.getByTestId('esittelija').locator('input');

  await expect(kasittelytila).toHaveValue('kasittelyssa,kasitelty');

  await expect(hakemusKoskee).toHaveValue('1');

  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');
});

test('Hakemuslistan järjestysparametrit saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend?hakemuslista.sort=hakemuslista.asiatunnus:desc',
  );

  const jarjestyskentta = page.getByTestId(
    'sortlabel--hakemuslista.asiatunnus',
  );

  await expect(jarjestyskentta).toHaveAttribute('data-active');
  await expect(jarjestyskentta).toHaveAttribute('data-direction', 'desc');

  const epajarjestystestit = ['hakemuslista.hakijannimi'].map(
    async (fieldKey) => {
      const epajarjestyskentta = page.getByTestId(`sortlabel--${fieldKey}`);

      await expect(epajarjestyskentta).not.toHaveAttribute(
        'data-active',
        'false',
      );
    },
  );

  await Promise.all(epajarjestystestit);
});

test('Hakemuslistan järjestysparametrit saa oikeat arvot local storagesta', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'tutu-query-string',
      'hakemuslista.sort=hakemuslista.kasittelyvaihe:asc',
    );
  });

  await page.goto('/');

  const jarjestyskentta = page.getByTestId(
    'sortlabel--hakemuslista.kasittelyvaihe',
  );

  await expect(jarjestyskentta).toHaveAttribute('data-active');
  await expect(jarjestyskentta).toHaveAttribute('data-direction', 'asc');

  const epajarjestystestit = ['hakemuslista.hakijannimi'].map(
    async (fieldKey) => {
      const epajarjestyskentta = page.getByTestId(`sortlabel--${fieldKey}`);

      await expect(epajarjestyskentta).not.toHaveAttribute('data-active');
    },
  );

  await Promise.all(epajarjestystestit);
});
