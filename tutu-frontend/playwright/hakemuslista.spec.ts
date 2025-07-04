import { test, expect } from '@playwright/test';
import {
  mockBasicForLista,
  mockEsittelijat,
  mockSuccessfullLists,
  mockUser,
} from '@/playwright/mocks';

test.beforeEach(mockBasicForLista);

test('Hakemuslistaus latautuu', async ({ page }) => {
  await mockSuccessfullLists({ page });
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
  await mockSuccessfullLists({ page });
  await page.goto('/tutu-frontend?haku=testihakusana&nayta=omat');

  const hakukentta = page.getByTestId('hakukentta').locator('input');

  const omatButton = page.getByTestId('nayta-omat');

  await expect(hakukentta).toHaveValue('testihakusana');

  await expect(omatButton).toHaveClass(/Mui-selected/);
});

test('Hakemuslistan esittelija-dropdown saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  await mockSuccessfullLists({ page });
  await page.goto('/tutu-frontend?esittelija=1.2.246.562.24.999999999999');

  const esittelija = page.getByTestId('esittelija').locator('input');

  const omatButton = page.getByTestId('nayta-omat');

  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');

  await expect(omatButton).not.toHaveClass(/Mui-selected/);
});

test('Hakemuslistan filtteri saa oikeat arvot local storagesta', async ({
  page,
}) => {
  await mockSuccessfullLists({ page });
  await page.addInitScript(() => {
    localStorage.setItem(
      'tutu-query-string',
      'vaihe=AlkukasittelyKesken,OdottaaVahvistusta,LoppukasittelyValmis&hakemuskoskee=1&esittelija=1.2.246.562.24.999999999999',
    );
  });

  await page.goto('/');

  const kasittelyvaihe = page.getByTestId('kasittelyvaihe').locator('input');

  const hakemusKoskee = page.getByTestId('hakemus-koskee').locator('input');

  const esittelija = page.getByTestId('esittelija').locator('input');

  await expect(kasittelyvaihe).toHaveValue(
    'AlkukasittelyKesken,OdottaaVahvistusta,LoppukasittelyValmis',
  );

  await expect(hakemusKoskee).toHaveValue('1');

  await expect(esittelija).toHaveValue('1.2.246.562.24.999999999999');
});

test('Hakemuslistan järjestysparametrit saa oikeat arvot query-parametreista', async ({
  page,
}) => {
  await mockSuccessfullLists({ page });
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
  await mockSuccessfullLists({ page });
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

test('Hakemuslistan lataus epäonnistuu', async ({ page }) => {
  mockUser(page);
  mockEsittelijat(page);
  page.route('**/tutu-backend/api/hakemuslista*', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        origin: 'hakemuspalvelu',
        message: 'virheilmoitus',
      }),
    });
  });

  await page.goto('/tutu-frontend');

  await expect(page.getByTestId('hakemus-list')).not.toBeVisible();

  // tarkistetaan että virheviesti näkyy
  await expect(page.getByTestId('toast-message')).toBeVisible();
});
