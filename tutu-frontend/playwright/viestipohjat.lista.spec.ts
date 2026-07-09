import { expect, test } from '@playwright/test';

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
  await mockTekstipohjaKategoriat(page, 'viestipohja');
  await mockTekstipohjaLista(page, 'viestipohja');
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');
});

test('Kategorialista näkyy oikein', async ({ page }) => {
  await expectKategoriaAndPohjaList(page);
});

test('Uuden kategorian luominen onnistuu', async ({ page }) => {
  await avaaKategoriaModalAndSyotaNimi(page, 'Uusi kategoria');

  await clickOkInKategoriaModalAndExpectPut(page, '/viestipohja/kategoria', {
    nimi: 'Uusi kategoria',
  });

  await expectSuccessToast(
    page,
    'tekstipohjat.viestipohjat.kategoriat.tallennusOnnistui',
  );
});

test('Uuden kategorian luominen epäonnistuu', async ({ page }) => {
  await mockKategorianTallennusvirhe(
    page,
    '**/tutu-backend/api/viestipohja/kategoria',
  );

  await avaaKategoriaModalAndSyotaNimi(page, 'Uusi kategoria');
  await page.getByTestId('modal-confirm-button').click();

  await expectErrorToast(page, 'virhe.viestipohjaKategoriatTallennus');
});

test('Olemassaolevan kategorian muokkaus onnistuu', async ({ page }) => {
  clickPohjaOrKategoria(page, '1. Testi kategoria 1');
  await syotaKategoriaNimiModaliin(
    page,
    'tekstipohjat.kategoriat.muokkaa',
    'Muokattu kategoria',
    'Testi kategoria 1',
  );

  await clickOkInKategoriaModalAndExpectPut(page, '/viestipohja/kategoria', {
    id: '1',
    nimi: 'Muokattu kategoria',
  });

  await expectSuccessToast(
    page,
    'tekstipohjat.viestipohjat.kategoriat.tallennusOnnistui',
  );
});

test('Olemassaolevan kategorian muokkaus epäonnistuu', async ({ page }) => {
  await mockKategorianTallennusvirhe(
    page,
    '**/tutu-backend/api/viestipohja/kategoria',
  );

  clickPohjaOrKategoria(page, '1. Testi kategoria 1');
  await syotaKategoriaNimiModaliin(
    page,
    'tekstipohjat.kategoriat.muokkaa',
    'Muokattu kategoria',
    'Testi kategoria 1',
  );
  await page.getByTestId('modal-confirm-button').click();

  await expectErrorToast(page, 'virhe.viestipohjaKategoriatTallennus');
});

test('Viestipohjien latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/viestipohja');
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');

  await expectErrorToast(page, 'virhe.viestipohjatLataus');
});

test('Kategorioiden latauksen epäonnistuessa näytetään virheteksti', async ({
  page,
}) => {
  await mockRemoteVirhe(page, '**/tutu-backend/api/viestipohja/kategoria');
  await page.goto('/tutu-frontend/tekstipohjat/viestipohjat');

  await expectErrorToast(page, 'virhe.viestipohjaKategoriatLataus');
});

test('Modaalin peruutus sulkee modaalin', async ({ page }) => {
  const lisaaKategoriaText = 'tekstipohjat.kategoriat.lisaa';
  await page.getByRole('button', { name: lisaaKategoriaText }).click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await page.getByTestId('modal-peruuta-button').click();
  await expect(page.getByTestId('modal-component')).toBeHidden();
});
