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
  await mockTekstipohjaKategoriat(page, 'paatospohja');
  await mockTekstipohjaLista(page, 'paatospohja');
  await page.goto('/tutu-frontend/tekstipohjat/paatospohjat');
});

test('Olemassaolevan paatospohjan lataus onnistuu', async ({ page }) => {
  await mockTekstipohja(page, 'paatospohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);
});

test('Paatospohjan latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/paatospohja/1');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectErrorToast(page, 'virhe.paatospohjaLataus');
});

test('Paatospohjan muokkaus lähettää PUT-kutsun backendille', async ({
  page,
}) => {
  await mockTekstipohja(page, 'paatospohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await saveAndExpectNewTekstipohja(page, '/api/paatospohja', false);

  await expectSuccessToast(
    page,
    'tekstipohjat.paatospohjat.paatospohjaTallennus.success',
  );
});

test('Paatospohjan tallennuksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockTekstipohja(page, 'paatospohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await mockRemoteVirhe(page, '**/tutu-backend/api/paatospohja');

  await (await getTekstipohjaNimiLocator(page)).fill('Uusi nimi');
  await clickSaveButton(page);

  await expectErrorToast(page, 'virhe.paatospohjaTallennus');
});

test('Paatospohjan poisto onnistuu', async ({ page }) => {
  await mockTekstipohja(page, 'paatospohja');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await expectDelete(
    page,
    'tekstipohjat.paatospohjat.poista',
    '/tutu-backend/api/paatospohja',
  );

  const valitseText = await translate(page, 'tekstipohjat.valitsePaatospohja');
  await expect(page.getByText(valitseText)).toBeVisible();

  await expectSuccessToast(
    page,
    'tekstipohjat.paatospohjat.paatospohjaPoisto.success',
  );
});

test('Paatospohjan poiston epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockTekstipohja(page, 'paatospohja');
  await mockDeleteVirhe(page, '**/tutu-backend/api/paatospohja/1');
  await clickPohjaOrKategoria(page, 'Tekstipohja 1');

  await expectTekstipohjaNimi(page, MOCK_TEKSTIPOHJA.nimi);

  await confirmDelete(page, 'tekstipohjat.paatospohjat.poista');

  await expectErrorToast(page, 'virhe.paatospohjaPoisto');
});
