import { expect, Page, test } from '@playwright/test';

import { translate } from '@/playwright/helpers/translate';
import { mockAll } from '@/playwright/mocks';
import { HakemusListItem } from '@/src/lib/types/hakemusListItem';
import { Paginated } from '@/src/lib/types/paginated';

const HAKEMUS_OID = '1.2.246.562.10.00000000001';
const RESULT_OID_1 = '1.2.246.562.11.10000000001';
const RESULT_OID_2 = '1.2.246.562.11.10000000002';

const searchResultsPage1: Paginated<HakemusListItem> = {
  items: [
    {
      asiatunnus: 'OPH-001-2025',
      hakija: {
        etunimet: 'Aino',
        sukunimi: 'Aalto',
      },
      saapumisPvm: '2025-04-14T10:59:04.597Z',
      hakemusOid: RESULT_OID_1,
      hakemusKoskee: 1,
      esittelijaOid: '1.2.246.562.24.999999999999',
      esittelijaKutsumanimi: 'Esittelijä',
      esittelijaSukunimi: 'Esittelijä',
      kasittelyVaihe: 'AlkukasittelyKesken',
      muokattu: null,
    },
    {
      asiatunnus: 'OPH-002-2025',
      hakija: {
        etunimet: 'Arvo',
        sukunimi: 'Aaltonen',
      },
      saapumisPvm: '2025-05-14T10:59:04.597Z',
      hakemusOid: RESULT_OID_2,
      hakemusKoskee: 1,
      esittelijaOid: null,
      esittelijaKutsumanimi: 'Esittelijä',
      esittelijaSukunimi: 'Esittelijä',
      kasittelyVaihe: 'AlkukasittelyKesken',
      muokattu: null,
    },
  ],
  totalCount: 2,
  page: 1,
  pageSize: 20,
  totalPages: 1,
};

const searchResultsMultiPage = {
  ...searchResultsPage1,
  totalCount: 25,
  totalPages: 2,
};

const mockHakemusHaku = async (
  page: Page,
  body: object = searchResultsPage1,
) => {
  await page.route('**/tutu-backend/api/hakemus/haku*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(body),
    });
  });
};

const mockHakemus = async (page: Page) => {
  await page.route(
    `**/tutu-backend/api/hakemus/${RESULT_OID_1}`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hakemusOid: RESULT_OID_1,
          hakija: {
            etunimet: 'Aino',
            kutsumanimi: 'Aino',
            sukunimi: 'Aalto',
            kansalaisuus: [],
            syntymaaika: '1990-01-01',
            asuinmaa: { fi: 'Suomi', sv: 'Finland', en: 'Finland' },
            katuosoite: '',
            postinumero: '',
            postitoimipaikka: '',
            kotikunta: { fi: 'Helsinki', sv: 'Helsingfors', en: 'Helsinki' },
            yksiloityVTJ: false,
          },
          hakemusKoskee: 1,
          asiatunnus: 'OPH-001-2025',
          saapumisPvm: '2025-04-14T10:59:04.597Z',
          esittelyPvm: null,
          paatosPvm: null,
          esittelijaOid: null,
          ataruHakemuksenTila: 'KasittelyMaksettu',
          kasittelyVaihe: 'AlkukasittelyKesken',
          muutosHistoria: [],
          taydennyspyyntoLahetetty: null,
          yhteistutkinto: false,
          sisalto: [],
          liitteidenTilat: [],
          asiakirja: { apHakemus: false },
          lomakeOid: '',
          lomakeId: 0,
          lomakkeenKieli: 'fi',
        }),
      });
    },
  );

  await page.route(
    `**/tutu-backend/api/hakemus/${RESULT_OID_2}`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hakemusOid: RESULT_OID_2,
          hakija: {
            etunimet: 'Arvo',
            kutsumanimi: 'Arvo',
            sukunimi: 'Aaltonen',
            kansalaisuus: [],
            syntymaaika: '1990-01-01',
            asuinmaa: { fi: 'Suomi', sv: 'Finland', en: 'Finland' },
            katuosoite: '',
            postinumero: '',
            postitoimipaikka: '',
            kotikunta: { fi: 'Helsinki', sv: 'Helsingfors', en: 'Helsinki' },
            yksiloityVTJ: false,
          },
          hakemusKoskee: 1,
          asiatunnus: 'OPH-002-2025',
          saapumisPvm: '2025-04-14T10:59:04.597Z',
          esittelyPvm: null,
          paatosPvm: null,
          esittelijaOid: null,
          ataruHakemuksenTila: 'KasittelyMaksettu',
          kasittelyVaihe: 'AlkukasittelyKesken',
          muutosHistoria: [],
          taydennyspyyntoLahetetty: null,
          yhteistutkinto: false,
          sisalto: [],
          liitteidenTilat: [],
          asiakirja: { apHakemus: false },
          lomakeOid: '',
          lomakeId: 0,
          lomakkeenKieli: 'fi',
        }),
      });
    },
  );
};

const searchButtonClick = async (page: Page) => {
  const haeButton = page.getByRole('button', {
    name: await translate(page, 'haku.hae'),
  });

  await haeButton.click();
};

const closeButtonClick = async (page: Page) => {
  const suljeButton = page.getByRole('button', {
    name: await translate(page, 'haku.suljeJaPalaaHakemukseesi'),
  });

  await suljeButton.click();
};

test.beforeEach(mockAll);

test('Tyhjän haun tekeminen ei avaa hakutulosnauhaa', async ({ page }) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await searchButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeHidden();
});

test('Hakutulos-nauhassa näkyy korteissa hakijoiden nimet ja asiatunnukset', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  const ribbonCards = page.getByTestId('ribbon-card');
  // Originaali + 2 hakutulosta
  await expect(ribbonCards).toHaveCount(3);
  await expect(page.getByText('Aalto, Aino')).toBeVisible();
  await expect(page.getByText('Aaltonen, Arvo')).toBeVisible();
  await expect(page.getByText('OPH-001-2025')).toBeVisible();
  await expect(page.getByText('OPH-002-2025')).toBeVisible();
});

test('Tuloskortin klikkaaminen lataa sen hakemuksen tiedot näkymään', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await mockHakemus(page);

  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);
  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  // Näytetään ensimmäinen tulos heti
  await expect(page.getByTestId('hakemusotsikko-hakija')).toHaveText(
    'Aalto, Aino',
  );

  await page.getByText('Aaltonen, Arvo').click();

  await expect(page.getByTestId('hakemusotsikko-hakija')).toHaveText(
    'Aaltonen, Arvo',
  );
});

test('Nauhan sulkeminen piilottaa nauhan ja poistaa URL-parametrit', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();
  await expect(page).toHaveURL(/[?&]haku=/);

  await closeButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeHidden();
  await expect(page).not.toHaveURL(/[?&]haku=/);
});

test('URL-parametri ?haku= avaa nauhan automaattisesti', async ({ page }) => {
  await mockHakemusHaku(page);
  await page.goto(
    `/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot?haku=Aalt`,
  );

  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();
  await expect(page.getByText('Aalto, Aino')).toBeVisible();
});

test('Sivutus: Seuraava-nappi lähettää pyynnön sivulle 2', async ({ page }) => {
  await mockHakemusHaku(page, searchResultsMultiPage);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('hakemus/haku') &&
        req.url().includes('page=2') &&
        req.url().includes('haku=Aalt'),
    ),
    page
      .getByRole('button', {
        name: await translate(page, 'hakemuslista.seuraava'),
      })
      .click(),
  ]);

  expect(new URL(request.url()).searchParams.get('page')).toBe('2');
});

test('Aktiivinen välilehti säilyy palatessa alkuperäiseen hakemukseen', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await mockHakemus(page);

  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/tutkinnot`);

  await expect(page.getByRole('tab', { name: 'Tutkinnot' })).toHaveClass(
    /Mui-selected/,
  );

  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();
  await page.getByText('Aalto, Aino').click();

  await expect(page.getByTestId('hakemusotsikko-hakija')).toHaveText(
    'Aalto, Aino',
  );

  await closeButtonClick(page);

  // Alkuperäinen hakemus näkyy ja aktiivisena on edelleen "Tutkinnot"-välilehti
  await expect(page.getByTestId('hakemusotsikko-hakija')).toHaveText(
    'Heittotähti, Heikki Hemuli',
  );

  await expect(page.getByRole('tab', { name: 'Tutkinnot' })).toHaveClass(
    /Mui-selected/,
  );
});
