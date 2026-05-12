import { expect, Route, test } from '@playwright/test';

import { translate } from '@/playwright/helpers/translate';
import {
  MOCK_KATEGORIAT,
  mockInit,
  mockUser,
  mockViestipohjaKategoriat,
  mockViestipohjaLista,
} from '@/playwright/mocks';

// Claude Codea käytetty testipohjan generoimiseen

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockUser(page);
  await mockViestipohjaKategoriat(page);
  await mockViestipohjaLista(page);
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');
});

test('Kategorialista näkyy oikein', async ({ page }) => {
  await expect(page.getByText('1. Testi kategoria 1')).toBeVisible();
  await expect(page.getByText('2. Testi kategoria 2')).toBeVisible();
  await expect(page.getByText('3. Testi kategoria 3')).toBeVisible();
  await expect(page.getByText('Viestipohja 1')).toBeVisible();
  await expect(page.getByText('Viestipohja 2')).toBeVisible();
  await expect(page.getByText('Viestipohja 3')).toBeVisible();
  await expect(page.getByText('Viestipohja 4')).toBeVisible();
  await expect(page.getByText('Viestipohja 5')).toBeVisible();
  await expect(page.getByText('Viestipohja 6')).toBeVisible();
});

test('Uuden kategorian luominen onnistuu', async ({ page }) => {
  const lisaaKategoriaText = await translate(
    page,
    'tekstipohjat.viestipohjat.kategoriat.lisaa',
  );
  await page.getByRole('button', { name: lisaaKategoriaText }).click();

  await expect(page.getByTestId('modal-component')).toBeVisible();
  const otsikkoText = await translate(page, 'tekstipohjat.kategoriat.lisaa');
  await expect(
    page.locator('h1').filter({ hasText: otsikkoText }),
  ).toBeVisible();

  const nimiLabel = await translate(page, 'tekstipohjat.kategoriat.nimi');
  await page.getByLabel(nimiLabel).fill('Uusi kategoria');

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/viestipohja/kategoria') && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  expect(request.postDataJSON()).toMatchObject({ nimi: 'Uusi kategoria' });

  const successText = await translate(
    page,
    'viestipohjat.kategoriat.tallennusOnnistui',
  );
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'success');
  await expect(toast.getByTestId('toast-message')).toHaveText(successText);
});

test('Uuden kategorian luominen epäonnistuu', async ({ page }) => {
  await page.route(
    '**/tutu-backend/api/viestipohja/kategoria',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Tallennus epäonnistui' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_KATEGORIAT),
        });
      }
    },
  );

  const lisaaKategoriaText = await translate(
    page,
    'tekstipohjat.viestipohjat.kategoriat.lisaa',
  );
  await page.getByRole('button', { name: lisaaKategoriaText }).click();

  const nimiLabel = await translate(page, 'tekstipohjat.kategoriat.nimi');
  await page.getByLabel(nimiLabel).fill('Uusi kategoria');
  await page.getByTestId('modal-confirm-button').click();

  const toastText = await translate(
    page,
    'virhe.viestipohjaKategoriatTallennus',
  );
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'error');
  await expect(toast.getByTestId('toast-message')).toHaveText(toastText);
});

test('Olemassaolevan kategorian muokkaus onnistuu', async ({ page }) => {
  await page.getByText('1. Testi kategoria 1').click();

  await expect(page.getByTestId('modal-component')).toBeVisible();
  const muokkaaOtsikkoText = await translate(
    page,
    'tekstipohjat.kategoriat.muokkaa',
  );
  await expect(page.getByText(muokkaaOtsikkoText)).toBeVisible();

  const nimiLabel = await translate(page, 'tekstipohjat.kategoriat.nimi');
  const nimiInput = page.getByLabel(nimiLabel);
  await expect(nimiInput).toHaveValue('Testi kategoria 1');

  await nimiInput.fill('Muokattu kategoria');

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/viestipohja/kategoria') && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  expect(request.postDataJSON()).toMatchObject({
    id: '1',
    nimi: 'Muokattu kategoria',
  });

  const successText = await translate(
    page,
    'viestipohjat.kategoriat.tallennusOnnistui',
  );
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'success');
  await expect(toast.getByTestId('toast-message')).toHaveText(successText);
});

test('Olemassaolevan kategorian muokkaus epäonnistuu', async ({ page }) => {
  await page.route(
    '**/tutu-backend/api/viestipohja/kategoria',
    async (route: Route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Tallennus epäonnistui' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_KATEGORIAT),
        });
      }
    },
  );

  await page.getByText('1. Testi kategoria 1').click();

  const nimiLabel = await translate(page, 'tekstipohjat.kategoriat.nimi');
  await page.getByLabel(nimiLabel).fill('Muokattu kategoria');
  await page.getByTestId('modal-confirm-button').click();

  const toastText = await translate(
    page,
    'virhe.viestipohjaKategoriatTallennus',
  );
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'error');
  await expect(toast.getByTestId('toast-message')).toHaveText(toastText);
});

test('Viestipohjien latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await page.route('**/tutu-backend/api/viestipohja', async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Latausvirhe' }),
    });
  });
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');

  const toastText = await translate(page, 'virhe.viestipohjatLataus');
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'error');
  await expect(toast.getByTestId('toast-message')).toHaveText(toastText);
});

test('Kategorioiden latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await page.route(
    '**/tutu-backend/api/viestipohja/kategoria',
    async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Latausvirhe' }),
      });
    },
  );
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');

  const toastText = await translate(page, 'virhe.viestipohjaKategoriatLataus');
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', 'error');
  await expect(toast.getByTestId('toast-message')).toHaveText(toastText);
});

test('Modaalin peruutus sulkee modaalin', async ({ page }) => {
  const lisaaKategoriaText = await translate(
    page,
    'tekstipohjat.viestipohjat.kategoriat.lisaa',
  );
  await page.getByRole('button', { name: lisaaKategoriaText }).click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await page.getByTestId('modal-peruuta-button').click();
  await expect(page.getByTestId('modal-component')).toBeHidden();
});
