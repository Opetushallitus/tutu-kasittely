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

test('Sivutus: Seuraava-nappi näyttää seuraavan hakemuksen', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await mockHakemus(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('hakukentta').locator('input').fill('Aalt');

  await searchButtonClick(page);

  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();

  await page
    .getByRole('button', {
      name: await translate(page, 'hakemuslista.seuraava'),
    })
    .click();

  await expect(page.getByTestId('hakemusotsikko-hakija')).toHaveText(
    'Aaltonen, Arvo',
  );
});

test('Tarkat hakuehdot: oppilaitos-suodatin lähettää parametrin pyyntöön', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('tarkat-hakuehdot').click();

  await page
    .getByTestId('haku-oppilaitos')
    .locator('input')
    .fill('Butan Amattikoulu');

  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().includes('hakemus/haku')),
    searchButtonClick(page),
  ]);

  expect(new URL(request.url()).searchParams.get('oppilaitos')).toBe(
    'Butan Amattikoulu',
  );
  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();
});

test('Tarkat hakuehdot: kelpoisuus-suodatin lähettää parametrin pyyntöön', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('tarkat-hakuehdot').click();

  await page.getByTestId('haku-kelpoisuus').click();

  const luokanopettajaText = await translate(
    page,
    'haku.kelpoisuus.luokanopettaja',
  );
  await page
    .getByRole('option', { name: luokanopettajaText, exact: true })
    .click();

  const [request] = await Promise.all([
    page.waitForRequest((req) => req.url().includes('hakemus/haku')),
    searchButtonClick(page),
  ]);

  expect(new URL(request.url()).searchParams.get('kelpoisuus')).toBe(
    'Opetusalan ammatit_Luokanopettaja',
  );
  await expect(page.getByTestId('search-results-ribbon')).toBeVisible();
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

test('Kelpoisuus-hakuehto: chipin X poistaa valinnan avaamatta dropdownia, kentän tyhjennys-nappi toimii', async ({
  page,
}) => {
  await mockHakemusHaku(page);
  await page.goto(`/tutu-frontend/hakemus/${HAKEMUS_OID}/perustiedot`);

  await page.getByTestId('tarkat-hakuehdot').click();

  const kelpoisuusSelect = page.getByTestId('haku-kelpoisuus');
  const chip = kelpoisuusSelect.locator('.MuiChip-root');
  const luokanopettajaText = await translate(
    page,
    'haku.kelpoisuus.luokanopettaja',
  );

  // Valitaan kelpoisuus
  await kelpoisuusSelect.click();
  await page
    .getByRole('option', { name: luokanopettajaText, exact: true })
    .click();
  await expect(chip).toBeVisible();
  // Wait for the dropdown to fully close before interacting with the chip
  await expect(page.getByRole('listbox')).toBeHidden();

  // Chipin X poistaa valinnan eikä avaa dropdownia uudelleen
  await kelpoisuusSelect.getByTestId('chip-delete-icon').click();
  await expect(chip).toBeHidden();
  await expect(page.getByRole('listbox')).toBeHidden();

  // Valitaan uudelleen kentän tyhjennys-nappia varten
  await kelpoisuusSelect.click();
  await page
    .getByRole('option', { name: luokanopettajaText, exact: true })
    .click();
  await expect(chip).toBeVisible();
  await expect(page.getByRole('listbox')).toBeHidden();

  // Kentän tyhjennys-nappi poistaa valinnan
  await kelpoisuusSelect
    .locator('xpath=..')
    .getByRole('button', { name: 'clear' })
    .click();
  await expect(chip).toBeHidden();
});
