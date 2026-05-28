import { expect, test } from '@playwright/test';

import {
  clickPohjaOrKategoria,
  confirmDelete,
  expectDelete,
  expectErrorToast,
  expectSuccessToast,
  expectTekstipohjaNimi,
  getTekstipohjaNimiLocator,
  mockDeleteVirhe,
  mockRemoteVirhe,
  saveAndExpectNewTekstipohja,
} from '@/playwright/helpers/tekstipohjaTestUtils';
import { clickSaveButton } from '@/playwright/helpers/testUtils';
import { translate } from '@/playwright/helpers/translate';
import {
  MOCK_TEKSTIPOHJA,
  mockInit,
  mockUser,
  mockTekstipohja,
  mockTekstipohjaKategoriat,
  mockTekstipohjaLista,
} from '@/playwright/mocks';

// Claude Codea käytetty testipohjan generoimiseen

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockUser(page);
  await mockTekstipohjaKategoriat(page, 'viestipohja');
  await mockTekstipohjaLista(page, 'viestipohja');
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');
});

test('Olemassaolevan viestipohjan lataus onnistuu', async ({ page }) => {
  await mockTekstipohja(page, 'viestipohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);
});

test('Viestipohjan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/viestipohja/1');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectErrorToast(page, 'virhe.viestipohjaLataus');
});

test('Viestipohjan muokkaus lähettää PUT-kutsun backendille', async ({
  page,
}) => {
  await mockTekstipohja(page, 'viestipohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await saveAndExpectNewTekstipohja(page, '/api/viestipohja', true);

  await expectSuccessToast(
    page,
    'tekstipohjat.viestipohjat.viestipohjaTallennus.success',
  );
});

test('Viestipohjan tallennuksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockTekstipohja(page, 'viestipohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await mockRemoteVirhe(page, '**/tutu-backend/api/viestipohja');

  await (await getTekstipohjaNimiLocator(page)).fill('Uusi nimi');
  await clickSaveButton(page);

  await expectErrorToast(page, 'virhe.viestipohjaTallennus');
});

test('Viestipohjan poisto onnistuu', async ({ page }) => {
  await mockTekstipohja(page, 'viestipohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await expectDelete(
    page,
    'tekstipohjat.viestipohjat.poista',
    '/tutu-backend/api/viestipohja',
  );

  const valitseText = await translate(page, 'tekstipohjat.valitseViestipohja');
  await expect(page.getByText(valitseText)).toBeVisible();

  await expectSuccessToast(
    page,
    'tekstipohjat.viestipohjat.viestipohjaPoisto.success',
  );
});

test('Viestipohjan poiston epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockTekstipohja(page, 'viestipohja');
  await mockDeleteVirhe(page, '**/tutu-backend/api/viestipohja/1');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await confirmDelete(page, 'tekstipohjat.viestipohjat.poista');

  await expectErrorToast(page, 'virhe.viestipohjaPoisto');
});
