import { test } from '@playwright/test';

import {
  avaaKategoriaModalAndSyotaNimi,
  clickOkInKategoriaModalAndExpectPut,
  clickPohjaOrKategoria,
  expectErrorToast,
  expectKategoriaAndPohjaList,
  expectSuccessToast,
  mockKategorianTallennusvirhe,
  mockRemoteVirhe,
  syotaKategoriaNimiModaliin,
} from '@/playwright/helpers/tekstipohjaTestUtils';
import {
  mockInit,
  mockUser,
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

test('Kategorialista näkyy oikein', async ({ page }) => {
  await expectKategoriaAndPohjaList(page);
});

test('Uuden kategorian luominen onnistuu', async ({ page }) => {
  await avaaKategoriaModalAndSyotaNimi(page, 'Uusi kategoria');

  await clickOkInKategoriaModalAndExpectPut(page, '/paatospohja/kategoria', {
    nimi: 'Uusi kategoria',
  });

  await expectSuccessToast(
    page,
    'tekstipohjat.paatospohjat.kategoriat.tallennusOnnistui',
  );
});

test('Uuden kategorian luominen epäonnistuu', async ({ page }) => {
  await mockKategorianTallennusvirhe(
    page,
    '**/tutu-backend/api/paatospohja/kategoria',
  );

  await avaaKategoriaModalAndSyotaNimi(page, 'Uusi kategoria');
  await page.getByTestId('modal-confirm-button').click();

  await expectErrorToast(page, 'virhe.paatospohjaKategoriatTallennus');
});

test('Olemassaolevan kategorian muokkaus onnistuu', async ({ page }) => {
  clickPohjaOrKategoria(page, '1. Testi kategoria 1');
  await syotaKategoriaNimiModaliin(
    page,
    'tekstipohjat.kategoriat.muokkaa',
    'Muokattu kategoria',
    'Testi kategoria 1',
  );

  await clickOkInKategoriaModalAndExpectPut(page, '/paatospohja/kategoria', {
    id: '1',
    nimi: 'Muokattu kategoria',
  });

  await expectSuccessToast(
    page,
    'tekstipohjat.paatospohjat.kategoriat.tallennusOnnistui',
  );
});

test('Olemassaolevan kategorian muokkaus epäonnistuu', async ({ page }) => {
  await mockKategorianTallennusvirhe(
    page,
    '**/tutu-backend/api/paatospohja/kategoria',
  );

  clickPohjaOrKategoria(page, '1. Testi kategoria 1');
  await syotaKategoriaNimiModaliin(
    page,
    'tekstipohjat.kategoriat.muokkaa',
    'Muokattu kategoria',
    'Testi kategoria 1',
  );
  await page.getByTestId('modal-confirm-button').click();

  await expectErrorToast(page, 'virhe.paatospohjaKategoriatTallennus');
});

test('Paatospohjien latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/paatospohja');
  await page.goto('/tutu-frontend/tekstipohjat/paatospohjat');

  await expectErrorToast(page, 'virhe.paatospohjatLataus');
});

test('Kategorioiden latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/paatospohja/kategoria');
  await page.goto('/tutu-frontend/tekstipohjat/paatospohjat');

  await expectErrorToast(page, 'virhe.paatospohjaKategoriatLataus');
});
