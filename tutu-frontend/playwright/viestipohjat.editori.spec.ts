import { expect, Route, test } from '@playwright/test';

import { expectRequestData } from '@/playwright/helpers/testUtils';
import { translate } from '@/playwright/helpers/translate';
import {
  MOCK_VIESTIPOHJA,
  mockInit,
  mockUser,
  mockViestipohja,
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

test('Olemassaolevan viestipohjaan lataus onnistuu', async ({ page }) => {
  await mockViestipohja(page, '1', { ...MOCK_VIESTIPOHJA, id: '1' });
  await page.getByText('Viestipohja 1').first().click();

  const nimiLabel = await translate(page, 'viestipohjat.nimi');
  await expect(page.getByLabel(nimiLabel)).toHaveValue(MOCK_VIESTIPOHJA.nimi);
});

test('Viestipohjaan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await page.route(
    '**/tutu-backend/api/viestipohja/1',
    async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Latausvirhe' }),
      });
    },
  );

  await page.getByText('Viestipohja 1').first().click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});

test('Viestipohjaan muokkaus lähettää PUT-kutsun backendille', async ({
  page,
}) => {
  await mockViestipohja(page, '1', { ...MOCK_VIESTIPOHJA, id: '1' });
  await page.getByText('Viestipohja 1').first().click();

  const nimiLabel = await translate(page, 'viestipohjat.nimi');
  const nimiInput = page.getByLabel(nimiLabel);
  await expect(nimiInput).toHaveValue(MOCK_VIESTIPOHJA.nimi);

  await expectRequestData(
    page,
    '/api/viestipohja',
    nimiInput.fill('Uusi nimi'),
    {
      nimi: 'Uusi nimi',
    },
  );
});

test('Viestipohjaan tallennuksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestipohja(page, '1', { ...MOCK_VIESTIPOHJA, id: '1' });
  await page.getByText('Viestipohja 1').first().click();

  const nimiLabel = await translate(page, 'viestipohjat.nimi');
  const nimiInput = page.getByLabel(nimiLabel);
  await expect(nimiInput).toHaveValue(MOCK_VIESTIPOHJA.nimi);

  await page.route('**/tutu-backend/api/viestipohja', async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Tallennusvirhe' }),
    });
  });

  await nimiInput.fill('Uusi nimi');
  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});

test('Viestipohjaan poisto onnistuu', async ({ page }) => {
  await mockViestipohja(page, '1', { ...MOCK_VIESTIPOHJA, id: '1' });
  await page.getByText('Viestipohja 1').first().click();

  const nimiLabel = await translate(page, 'viestipohjat.nimi');
  await expect(page.getByLabel(nimiLabel)).toHaveValue(MOCK_VIESTIPOHJA.nimi);

  const poistaText = await translate(page, 'viestipohjat.poista');
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/tutu-backend/api/viestipohja/') &&
        req.method() === 'DELETE',
    ),
    page.getByRole('button', { name: poistaText }).click(),
  ]);

  expect(request.method()).toBe('DELETE');
  const valitseText = await translate(page, 'tekstipohjat.valitseViestipohja');
  await expect(page.getByText(valitseText)).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'success',
  );
});

test('Viestipohjaan poiston epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockViestipohja(page, '1', { ...MOCK_VIESTIPOHJA, id: '1' });
  await page.route(
    '**/tutu-backend/api/viestipohja/1',
    async (route: Route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Poistovirhe' }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ ...MOCK_VIESTIPOHJA, id: '1' }),
        });
      }
    },
  );
  await page.getByText('Viestipohja 1').first().click();

  const nimiLabel = await translate(page, 'viestipohjat.nimi');
  await expect(page.getByLabel(nimiLabel)).toHaveValue(MOCK_VIESTIPOHJA.nimi);

  const poistaText = await translate(page, 'viestipohjat.poista');
  await page.getByRole('button', { name: poistaText }).click();

  await expect(page.getByTestId('toast-alert')).toBeVisible();
  await expect(page.getByTestId('toast-alert')).toHaveAttribute(
    'data-severity',
    'error',
  );
});
