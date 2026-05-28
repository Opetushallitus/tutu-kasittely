import { expect, Page, Route } from '@playwright/test';

import { expectRequestData } from '@/playwright/helpers/testUtils';
import { translate } from '@/playwright/helpers/translate';
import { MOCK_KATEGORIAT, MOCK_TEKSTIPOHJA } from '@/playwright/mocks';
import { PaatospohjaKategoria } from '@/src/lib/types/paatosteksti';
import { ViestipohjaKategoria } from '@/src/lib/types/viesti';

export const clickPohjaOrKategoria = async (page: Page, teksti: string) => {
  const pohjaOrKategoria = page.getByText(teksti).first();
  await pohjaOrKategoria.hover();
  await pohjaOrKategoria.locator('//following-sibling::button').click();
};

const expectToast = async (
  page: Page,
  textTranslationKey: string,
  severity: string,
) => {
  const toastText = await translate(page, textTranslationKey);
  const toast = page.getByTestId('toast-alert');
  await expect(toast).toBeVisible();
  await expect(toast).toHaveAttribute('data-severity', severity);
  await expect(toast.getByTestId('toast-message')).toHaveText(toastText);
};

export const expectSuccessToast = async (
  page: Page,
  textTranslationKey: string,
) => {
  await expectToast(page, textTranslationKey, 'success');
};

export const expectErrorToast = async (
  page: Page,
  textTranslationKey: string,
) => {
  await expectToast(page, textTranslationKey, 'error');
};

export const getTekstipohjaNimiLocator = async (page: Page) => {
  const nimiLabel = await translate(page, 'tekstipohjat.nimi');
  return page.getByLabel(nimiLabel);
};

export const expectTekstipohjaNimi = async (page: Page, nimi: string) => {
  const nimiInput = await getTekstipohjaNimiLocator(page);
  await expect(nimiInput).toHaveValue(nimi);
};

export const saveAndExpectNewTekstipohja = async (
  page: Page,
  saveUrl: string,
  englishIncluded: boolean,
) => {
  const fiEditor = page.getByTestId('editor-content-editable').nth(0);
  await fiEditor.click();
  await page.keyboard.type('FI sisältö');

  await page.getByTestId('hakemuslista-tab--sv').click();
  const svEditor = page.getByTestId('editor-content-editable').nth(1);
  await svEditor.click();
  await page.keyboard.type('SV sisältö');

  if (englishIncluded) {
    await page.getByTestId('hakemuslista-tab--en').click();
    const enEditor = page.getByTestId('editor-content-editable').nth(2);
    await enEditor.click();
    await page.keyboard.type('EN sisältö');
  }

  await page.getByTestId('hakemuslista-tab--fi').click();
  await expect(fiEditor).toContainText('FI sisältö');

  const baseSisalto = {
    fi: expect.stringContaining('FI sisältö'),
    sv: expect.stringContaining('SV sisältö'),
  };

  const expectedSisalto = englishIncluded
    ? { ...baseSisalto, en: expect.stringContaining('EN sisältö') }
    : baseSisalto;

  await expectRequestData(
    page,
    saveUrl,
    (await getTekstipohjaNimiLocator(page)).fill('Uusi nimi'),
    {
      nimi: 'Uusi nimi',
      sisalto: expectedSisalto,
    },
  );
};

export const expectDelete = async (
  page: Page,
  poistatekstiTranslationKey: string,
  deleteUrl: string,
) => {
  const poistaText = await translate(page, poistatekstiTranslationKey);
  await page.getByRole('button', { name: poistaText }).click();
  await expect(page.getByTestId('modal-component')).toBeVisible();
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(deleteUrl) && req.method() === 'DELETE',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  expect(request.method()).toBe('DELETE');
};

export const confirmDelete = async (
  page: Page,
  buttonTextTranslationKey: string,
) => {
  const poistaText = await translate(page, buttonTextTranslationKey);
  await page.getByRole('button', { name: poistaText }).click();
  await expect(page.getByTestId('modal-component')).toBeVisible();
  await page.getByTestId('modal-confirm-button').click();
};

export const mockRemoteVirhe = async (page: Page, url: string) => {
  await page.route(url, async (route: Route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Virhe' }),
    });
  });
};

export const mockDeleteVirhe = async (page: Page, url: string) => {
  await page.route(url, async (route: Route) => {
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
        body: JSON.stringify({ ...MOCK_TEKSTIPOHJA, id: '1' }),
      });
    }
  });
};

export const expectKategoriaAndPohjaList = async (page: Page) => {
  await expect(page.getByText('1. Testi kategoria 1')).toBeVisible();
  await expect(page.getByText('2. Testi kategoria 2')).toBeVisible();
  await expect(page.getByText('3. Testi kategoria 3')).toBeVisible();
  await expect(page.getByText('Tekstipohja 1')).toBeVisible();
  await expect(page.getByText('Tekstipohja 2')).toBeVisible();
  await expect(page.getByText('Tekstipohja 3')).toBeVisible();
  await expect(page.getByText('Tekstipohja 4')).toBeVisible();
  await expect(page.getByText('Tekstipohja 5')).toBeVisible();
  await expect(page.getByText('Tekstipohja 6')).toBeVisible();
};

export const syotaKategoriaNimiModaliin = async (
  page: Page,
  modalHeaderTranslationKey: string,
  nimi: string,
  vanhaNimi?: string,
) => {
  await expect(page.getByTestId('modal-component')).toBeVisible();
  const otsikkoText = await translate(page, modalHeaderTranslationKey);
  await expect(
    page.locator('h1').filter({ hasText: otsikkoText }),
  ).toBeVisible();

  const nimiLabel = await translate(page, 'tekstipohjat.kategoriat.nimi');
  const nimiInput = await page.getByLabel(nimiLabel);
  if (vanhaNimi) await expect(nimiInput).toHaveValue(vanhaNimi);
  await nimiInput.fill(nimi);
};

export const avaaKategoriaModalAndSyotaNimi = async (
  page: Page,
  nimi: string,
) => {
  const lisaaKategoriaText = await translate(
    page,
    'tekstipohjat.kategoriat.lisaa',
  );
  await page.getByRole('button', { name: lisaaKategoriaText }).click();

  await syotaKategoriaNimiModaliin(page, 'tekstipohjat.kategoriat.lisaa', nimi);
};

export const clickOkInKategoriaModalAndExpectPut = async (
  page: Page,
  url: string,
  expectedData: ViestipohjaKategoria | PaatospohjaKategoria,
) => {
  const [request] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes(url) && req.method() === 'PUT',
    ),
    page.getByTestId('modal-confirm-button').click(),
  ]);

  await expect(request.postDataJSON()).toMatchObject(expectedData);
};

export const mockKategorianTallennusvirhe = async (page: Page, url: string) => {
  await page.route(url, async (route: Route) => {
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
  });
};
