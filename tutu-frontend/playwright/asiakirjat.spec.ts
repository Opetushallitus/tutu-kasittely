import { expect, Page, Route, test } from '@playwright/test';
import {
  mockUser,
  mockBasicForHakemus,
  mockLiitteet,
} from '@/playwright/mocks';
import { getHakemus } from './fixtures/hakemus1/index';
import { HakemusKoskee } from '@/src/lib/types/hakemus.js';

export const mockHakemus = (page: Page, hakemusKoskee?: HakemusKoskee) => {
  return page.route('**/tutu-backend/api/hakemus/*', async (route: Route) => {
    const hakemus = getHakemus(hakemusKoskee);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(hakemus),
    });
  });
};

test.describe('Tavalliset hakemukset', () => {
  test.beforeEach(async ({ page }) => {
    await mockBasicForHakemus({ page });
    await mockUser(page);
    await mockHakemus(page);
    await mockLiitteet(page);
  });

  test('Asiakirjat näkyvät taulukossa', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );

    const asiakirjaId1 = '#asiakirja__f0974a8c-ff0e-4702-b62c-58f69047e25fx';
    const asiakirjaId2 = '#asiakirja__c95d7c76-5a4c-4ce5-a173-5c848664e6ed';
    const asiakirjaId3 = '#asiakirja__7046e83e-b780-42c4-bbd5-a55b798050dd';
    const asiakirjaId4 = '#asiakirja__582be518-e3ea-4692-8a2c-8370b40213e5';
    const asiakirjaId5 = '#asiakirja__f0974a8c-ff0e-4702-b62c-58f69047e25f';
    const asiakirjaId6 = '#asiakirja__0443f1ca-6fd0-4919-812f-eaed4ae87933';

    const asiakirjarivit = page.locator('.asiakirja-row');
    const hakemuksenLuontiaika = '14.05.2025 10:59';
    const myohempiLiittenLisaysaika = '16.05.2025 10:59';

    await expect(asiakirjarivit).toHaveCount(6);

    const row1_otsake_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__otsake`),
    ).toContainText(
      'Henkilötietojen liitteet: Todistus kansalaisuudesta (esimerkiksi passin henkilötietosivu tai ote väestötietojärjestelmästä)',
    );
    const row1_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite1.txt');
    const row1_saapumisaika_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__saapumisaika`),
    ).toContainText(myohempiLiittenLisaysaika);
    const row1_uusiliite_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__uusi-liite`),
    ).toBeAttached();
    const row1_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkastamatta');

    const row2_otsake_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Tutkintotodistus');
    const row2_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite2.txt');
    const row2_saapumisaika_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row2_uusiliite_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row2_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkistettu');

    const row3_otsake_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Opintosuoritusote');
    const row3_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite3.txt');
    const row3_saapumisaika_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row3_uusiliite_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row3_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Liite puuttuu');

    const row4_otsake_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Muu liite');
    const row4_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite4.txt');
    const row4_saapumisaika_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row4_uusiliite_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__uusi-liite`),
    ).toBeAttached();
    const row4_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkastamatta');

    const row5_otsake_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Lisäliite');
    const row5_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite5.txt');
    const row5_saapumisaika_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row5_uusiliite_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row5_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Puutteellinen liite');

    const row6_otsake_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Liitä käännökset');
    const row6_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite6.txt');
    const row6_saapumisaika_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row6_uusiliite_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row6_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__tarkistuksen-tila`),
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

      row6_otsake_check,
      row6_tiedostonimi_check,
      row6_saapumisaika_check,
      row6_uusiliite_check,
      row6_tarkistuksentila_check,
    ]);
  });

  test('Näytetään Viimeinen asiakirja hakijalta jos Kaikki selvitykset saatu chekattu', async ({
    page,
  }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );
    const kaikkiSelvitykset = page.getByTestId('kaikki-selvitykset-saatu');
    const viimeinenAsiakirja = page.getByTestId(
      'viimeinen-asiakirja-hakijalta',
    );

    await expect(viimeinenAsiakirja).toBeHidden();
    await kaikkiSelvitykset.click();
    await expect(viimeinenAsiakirja).toBeVisible();
  });
});

test.describe('Lopullinen päätös hakemukset', () => {
  test.beforeEach(async ({ page }) => {
    await mockBasicForHakemus({ page });
    await mockUser(page);
    await mockHakemus(page, HakemusKoskee.LOPULLINEN_PAATOS);
    await mockLiitteet(page);
  });

  test('Asiakirjat näkyvät taulukossa', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );

    const asiakirjaId1 = '#asiakirja__f0974a8c-ff0e-4702-b62c-58f69047e25fx';
    const asiakirjaId2 = '#asiakirja__c95d7c76-5a4c-4ce5-a173-5c848664e6ed';
    const asiakirjaId3 = '#asiakirja__7046e83e-b780-42c4-bbd5-a55b798050dd';
    const asiakirjaId4 = '#asiakirja__582be518-e3ea-4692-8a2c-8370b40213e5';
    const asiakirjaId5 = '#asiakirja__f0974a8c-ff0e-4702-b62c-58f69047e25f';
    const asiakirjaId6 = '#asiakirja__0443f1ca-6fd0-4919-812f-eaed4ae87933';

    const asiakirjarivit = page.locator('.asiakirja-row');
    const hakemuksenLuontiaika = '14.05.2025 10:59';
    const myohempiLiittenLisaysaika = '16.05.2025 10:59';

    await expect(asiakirjarivit).toHaveCount(6);

    const row1_otsake_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__otsake`),
    ).toContainText(
      'Henkilötietojen liitteet: Todistus kansalaisuudesta (esimerkiksi passin henkilötietosivu tai ote väestötietojärjestelmästä)',
    );
    const row1_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite1.txt');
    const row1_saapumisaika_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__saapumisaika`),
    ).toContainText(myohempiLiittenLisaysaika);
    const row1_uusiliite_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__uusi-liite`),
    ).toBeAttached();
    const row1_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId1} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkastamatta');

    const row2_otsake_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Tutkintotodistus');
    const row2_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite2.txt');
    const row2_saapumisaika_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row2_uusiliite_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row2_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId2} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkistettu');

    const row3_otsake_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Opintosuoritusote');
    const row3_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite3.txt');
    const row3_saapumisaika_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row3_uusiliite_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row3_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId3} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Liite puuttuu');
    const row4_otsake_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Muu liite');
    const row4_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite4.txt');
    const row4_saapumisaika_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row4_uusiliite_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__uusi-liite`),
    ).toBeAttached();
    const row4_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId4} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Tarkastamatta');

    const row5_otsake_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Lisäliite');
    const row5_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite5.txt');
    const row5_saapumisaika_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row5_uusiliite_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row5_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId5} .asiakirja-row__tarkistuksen-tila`),
    ).toContainText('Puutteellinen liite');

    const row6_otsake_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__otsake`),
    ).toContainText('Tutkinto 1: Liitä käännökset');
    const row6_tiedostonimi_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__tiedostonimi`),
    ).toContainText('testiliite6.txt');
    const row6_saapumisaika_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__saapumisaika`),
    ).toContainText(hakemuksenLuontiaika);
    const row6_uusiliite_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__uusi-liite`),
    ).not.toBeAttached();
    const row6_tarkistuksentila_check = expect(
      page.locator(`${asiakirjaId6} .asiakirja-row__tarkistuksen-tila`),
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
      row6_otsake_check,
      row6_tiedostonimi_check,
      row6_saapumisaika_check,
      row6_uusiliite_check,
      row6_tarkistuksentila_check,
    ]);
  });

  test('Ei Näytetä Viimeinen asiakirja hakijalta', async ({ page }) => {
    await page.goto(
      '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
    );
    const kaikkiSelvitykset = page.getByTestId('kaikki-selvitykset-saatu');
    const viimeinenAsiakirja = page.getByTestId(
      'viimeinen-asiakirja-hakijalta',
    );

    await kaikkiSelvitykset.click();
    await expect(viimeinenAsiakirja).not.toBeAttached();
  });
});
