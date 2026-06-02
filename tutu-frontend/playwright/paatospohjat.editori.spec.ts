import { expect, test } from '@playwright/test';

import {
  clickLisaapohja,
  clickPohjaOrKategoria,
  confirmDelete,
  expectDelete,
  expectErrorToast,
  expectRequiredDataMissing,
  expectSuccessToast,
  expectTekstipohjaNimi,
  fillSisalto,
  getTekstipohjaNimiLocator,
  mockDeleteVirhe,
  mockRemoteVirhe,
  saveAndExpectNewTekstipohja,
  valitseKategoria,
} from '@/playwright/helpers/tekstipohjaTestUtils';
import {
  clickSaveButton,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
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

test('Uuden paatospohjan luonti ei onnistu ilman pakollisia tietoja', async ({
  page,
}) => {
  const apiRequests: string[] = [];
  page.on('request', (request) => {
    if (['xhr', 'fetch'].includes(request.resourceType())) {
      apiRequests.push(request.url());
    }
  });

  await clickLisaapohja(page, 'paatospohjat');

  await fillSisalto(page, 0, 'FI sisältö');

  apiRequests.length = 0;
  await clickSaveButton(page);
  await expectRequiredDataMissing(page, 2);
  expect(apiRequests).toEqual([]);

  await valitseKategoria(page, 'Testi kategoria 1');
  await clickSaveButton(page);
  await expectRequiredDataMissing(page, 1);
  expect(apiRequests).toEqual([]);

  await expectRequestData(
    page,
    '/api/paatospohja',
    (await getTekstipohjaNimiLocator(page)).fill('Uusi nimi'),
    {
      nimi: 'Uusi nimi',
      sisalto: { fi: expect.stringContaining('FI sisältö') },
    },
  );
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
