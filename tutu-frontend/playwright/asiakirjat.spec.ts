import { expect, Page, Route, test } from '@playwright/test';
import {
  mockUser,
  mockBasicForHakemus,
  mockLiitteet,
} from '@/playwright/mocks';
import { getHakemus } from './fixtures/hakemus1/index';

export const mockHakemus = (page: Page) => {
  return page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus();
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
};

test.beforeEach(async ({ page }) => {
  await mockBasicForHakemus({ page });
  mockUser(page);
  await mockHakemus(page);
  await mockLiitteet(page);
});

test('Asiakirjat näkyvät taulukossa', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  const asiakirjaId1 = '#asiakirja__c95d7c76-5a4c-4ce5-a173-5c848664e6ed';
  const asiakirjaId2 = '#asiakirja__7046e83e-b780-42c4-bbd5-a55b798050dd';
  const asiakirjaId3 = '#asiakirja__582be518-e3ea-4692-8a2c-8370b40213e5';
  const asiakirjaId4 = '#asiakirja__f0974a8c-ff0e-4702-b62c-58f69047e25f';
  const asiakirjaId5 = '#asiakirja__0443f1ca-6fd0-4919-812f-eaed4ae87933';

  const asiakirjarivit = page.locator('.asiakirja-row');

  await expect(asiakirjarivit).toHaveCount(5);

  const row1_otsake_check = expect(
    page.locator(`${asiakirjaId1} .asiakirja-row__otsake`),
  ).toContainText('Tutkinto 1: Tutkintotodistus');
  const row1_tiedostonimi_check = expect(
    page.locator(`${asiakirjaId1} .asiakirja-row__tiedostonimi`),
  ).toContainText('testiliite1.txt');
  const row1_saapumisaika_check = expect(
    page.locator(`${asiakirjaId1} .asiakirja-row__saapumisaika`),
  ).toContainText('19.05.2025 09:31');
  const row1_uusiliite_check = expect(
    page.locator(`${asiakirjaId1} .asiakirja-row__uusi-liite`),
  ).not.toBeAttached();
  const row1_tarkistuksentila_check = expect(
    page.locator(`${asiakirjaId1} .asiakirja-row__tarkistuksen-tila`),
  ).toContainText('Tarkistettu');

  const row2_otsake_check = expect(
    page.locator(`${asiakirjaId2} .asiakirja-row__otsake`),
  ).toContainText('Tutkinto 1: Opintosuoritusote');
  const row2_tiedostonimi_check = expect(
    page.locator(`${asiakirjaId2} .asiakirja-row__tiedostonimi`),
  ).toContainText('testiliite2.txt');
  const row2_saapumisaika_check = expect(
    page.locator(`${asiakirjaId2} .asiakirja-row__saapumisaika`),
  ).toContainText('19.05.2025 09:32');
  const row2_uusiliite_check = expect(
    page.locator(`${asiakirjaId2} .asiakirja-row__uusi-liite`),
  ).not.toBeAttached();
  const row2_tarkistuksentila_check = expect(
    page.locator(`${asiakirjaId2} .asiakirja-row__tarkistuksen-tila`),
  ).toContainText('Liite puuttuu');

  const row3_otsake_check = expect(
    page.locator(`${asiakirjaId3} .asiakirja-row__otsake`),
  ).toContainText('Tutkinto 1: Muu liite');
  const row3_tiedostonimi_check = expect(
    page.locator(`${asiakirjaId3} .asiakirja-row__tiedostonimi`),
  ).toContainText('testiliite3.txt');
  const row3_saapumisaika_check = expect(
    page.locator(`${asiakirjaId3} .asiakirja-row__saapumisaika`),
  ).toContainText('19.05.2025 09:33');
  const row3_uusiliite_check = expect(
    page.locator(`${asiakirjaId3} .asiakirja-row__uusi-liite`),
  ).toBeAttached();
  const row3_tarkistuksentila_check = expect(
    page.locator(`${asiakirjaId3} .asiakirja-row__tarkistuksen-tila`),
  ).toContainText('Tarkastamatta');

  const row4_otsake_check = expect(
    page.locator(`${asiakirjaId4} .asiakirja-row__otsake`),
  ).toContainText('Tutkinto 1: Lisäliite');
  const row4_tiedostonimi_check = expect(
    page.locator(`${asiakirjaId4} .asiakirja-row__tiedostonimi`),
  ).toContainText('testiliite4.txt');
  const row4_saapumisaika_check = expect(
    page.locator(`${asiakirjaId4} .asiakirja-row__saapumisaika`),
  ).toContainText('19.05.2025 09:34');
  const row4_uusiliite_check = expect(
    page.locator(`${asiakirjaId4} .asiakirja-row__uusi-liite`),
  ).not.toBeAttached();
  const row4_tarkistuksentila_check = expect(
    page.locator(`${asiakirjaId4} .asiakirja-row__tarkistuksen-tila`),
  ).toContainText('Puutteellinen liite');

  const row5_otsake_check = expect(
    page.locator(`${asiakirjaId5} .asiakirja-row__otsake`),
  ).toContainText('Ei: Liitä käännökset');
  const row5_tiedostonimi_check = expect(
    page.locator(`${asiakirjaId5} .asiakirja-row__tiedostonimi`),
  ).toContainText('testiliite5.txt');
  const row5_saapumisaika_check = expect(
    page.locator(`${asiakirjaId5} .asiakirja-row__saapumisaika`),
  ).toContainText('19.05.2025 09:35');
  const row5_uusiliite_check = expect(
    page.locator(`${asiakirjaId5} .asiakirja-row__uusi-liite`),
  ).not.toBeAttached();
  const row5_tarkistuksentila_check = expect(
    page.locator(`${asiakirjaId5} .asiakirja-row__tarkistuksen-tila`),
  ).toContainText('Myöhässä');

  await Promise.all([
    row1_otsake_check,
    row1_tiedostonimi_check,
    row1_saapumisaika_check,
    row1_uusiliite_check,
    row1_tarkistuksentila_check,

    row2_otsake_check,
    row2_tiedostonimi_check,
    row2_saapumisaika_check,
    row2_uusiliite_check,
    row2_tarkistuksentila_check,

    row3_otsake_check,
    row3_tiedostonimi_check,
    row3_saapumisaika_check,
    row3_uusiliite_check,
    row3_tarkistuksentila_check,

    row4_otsake_check,
    row4_tiedostonimi_check,
    row4_saapumisaika_check,
    row4_uusiliite_check,
    row4_tarkistuksentila_check,

    row5_otsake_check,
    row5_tiedostonimi_check,
    row5_saapumisaika_check,
    row5_uusiliite_check,
    row5_tarkistuksentila_check,
  ]);
});

test('Näytetään Viimeinen asiakirja hakijalta jos Kaikki selvitykset saatu chekattu', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );
  const kaikkiSelvitykset = page.getByTestId('kaikki-selvitykset-saatu');
  const viimeinenAsiakirja = page.getByTestId('viimeinen-asiakirja-hakijalta');

  await expect(viimeinenAsiakirja).toBeHidden();
  await kaikkiSelvitykset.click();
  await expect(viimeinenAsiakirja).toBeVisible();
});
