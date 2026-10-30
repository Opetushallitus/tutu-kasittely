import { readFile } from 'fs/promises';

import { expect, Page, Request, Route, test } from '@playwright/test';

import { expectErrorToast } from '@/playwright/helpers/tekstipohjaTestUtils';
import { mockInit, mockSuccessfullLists, mockUser } from '@/playwright/mocks';

// Claude Codea käytetty testipohjan generoimiseen

const CSV_URL = '**/tutu-backend/api/tilastot/tilastokeskus-csv*';
const CSV_BODY = 'hakemustunnus;henkilotunnus\nOPH-1;010190-123A\n';
// Kiinteä "tänään", jotta oletuspäivämäärät ovat deterministiset
const TODAY = new Date(2025, 5, 15, 12, 0, 0);

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(TODAY);
  await mockInit(page);
  await mockUser(page);
  await gotoTilastot(page);
});

const gotoTilastot = async (page: Page) => {
  await page.goto('/tutu-frontend/tilastot');
  await expect(page.getByTestId('tilastot-lataa')).toBeVisible();
};

const mockTilastoCsv = async (
  page: Page,
  { status = 200, body = CSV_BODY }: { status?: number; body?: string } = {},
) => {
  const requests: Array<Request> = [];
  await page.route(CSV_URL, async (route: Route) => {
    requests.push(route.request());
    await route.fulfill({
      status,
      contentType: status === 200 ? 'text/csv' : 'text/plain',
      body,
    });
  });
  return requests;
};

const pvmInput = (page: Page, testId: string) =>
  page.getByTestId(testId).locator('input');

const setPvm = async (page: Page, testId: string, pvm: string) => {
  const input = pvmInput(page, testId);
  await input.fill(pvm);
  await input.press('Tab');
};

const clickAndExpectDownload = async (page: Page) => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('tilastot-lataa').click(),
  ]);
  return download;
};

const trackDownloads = (page: Page) => {
  let count = 0;
  page.on('download', () => {
    count++;
  });
  return () => count;
};

// Muotoillaan selaimen aikavyöhykkeellä (playwright.config.ts: timezoneId),
// ei Node-prosessin, joka on CI:ssä UTC
const localDate = (iso: string | null) =>
  new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Helsinki' }).format(
    new Date(iso!),
  );

const dayLocator = (page: Page, paiva: string) =>
  page.locator(
    `.react-datepicker__day--${paiva}:not(.react-datepicker__day--outside-month)`,
  );

test.describe('Perusnäkymä', () => {
  test('Tilastot-sivu latautuu', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('tilastot.otsikko');
    await expect(page.locator('h2')).toHaveText('tilastot.tilastokeskukselle');
    await expect(page.getByText('tilastot.aikavali.ohje')).toBeVisible();
    await expect(page.getByText('tilastot.alkupvm')).toBeVisible();
    await expect(page.getByText('tilastot.loppupvm')).toBeVisible();
    await expect(page.getByTestId('tilastot-alkupvm')).toBeVisible();
    await expect(page.getByTestId('tilastot-loppupvm')).toBeVisible();
    await expect(page.getByTestId('tilastot-lataa')).toBeEnabled();
  });

  test('Päivämäärien oletusarvot ovat vuoden alku ja tämä päivä', async ({
    page,
  }) => {
    await expect(pvmInput(page, 'tilastot-alkupvm')).toHaveValue('01.01.2025');
    await expect(pvmInput(page, 'tilastot-loppupvm')).toHaveValue('15.06.2025');
  });

  test('Etusivulta pääsee Tilastot-sivulle', async ({ page }) => {
    await mockSuccessfullLists({ page });
    await page.goto('/tutu-frontend/');
    await expect(page.getByTestId('hakemus-list')).toBeVisible();

    await page.getByRole('link', { name: 'tilastot.otsikko' }).click();

    await expect(page).toHaveURL(/\/tutu-frontend\/tilastot$/);
    await expect(page.getByTestId('tilastot-lataa')).toBeVisible();
  });

  test('Sivu latautuu ruotsinkieliselle käyttäjälle', async ({ page }) => {
    await mockUser(page, 'sv');
    await gotoTilastot(page);
    await expect(page.locator('h2')).toHaveText('tilastot.tilastokeskukselle');
  });
});

test.describe('Päivämäärävalinnat', () => {
  test('Alkupäivän voi muuttaa kirjoittamalla', async ({ page }) => {
    await setPvm(page, 'tilastot-alkupvm', '15.03.2025');
    await expect(pvmInput(page, 'tilastot-alkupvm')).toHaveValue('15.03.2025');
  });

  test('Loppupäivän voi muuttaa kirjoittamalla', async ({ page }) => {
    await setPvm(page, 'tilastot-loppupvm', '31.12.2025');
    await expect(pvmInput(page, 'tilastot-loppupvm')).toHaveValue('31.12.2025');
  });

  test('Päivän voi valita kalenterista', async ({ page }) => {
    await pvmInput(page, 'tilastot-alkupvm').click();
    await expect(page.locator('.react-datepicker')).toBeVisible();

    await dayLocator(page, '015').click();

    await expect(pvmInput(page, 'tilastot-alkupvm')).toHaveValue('15.01.2025');
    await expect(page.locator('.react-datepicker')).toHaveCount(0);
  });

  test('Kalenterissa voi selata kuukausia', async ({ page }) => {
    await pvmInput(page, 'tilastot-alkupvm').click();
    const kuukausi = page.locator('.react-datepicker__current-month');
    const alku = await kuukausi.textContent();

    await page.getByLabel('kalenteri.seuraava-kuukausi').click();
    await expect(kuukausi).not.toHaveText(alku!);

    await page.getByLabel('kalenteri.edellinen-kuukausi').click();
    await expect(kuukausi).toHaveText(alku!);
  });

  test('Alkupäivää ei voi valita loppupäivän jälkeen', async ({ page }) => {
    await setPvm(page, 'tilastot-alkupvm', '01.06.2025');
    await setPvm(page, 'tilastot-loppupvm', '10.06.2025');

    await pvmInput(page, 'tilastot-alkupvm').click();

    await expect(dayLocator(page, '010')).not.toHaveClass(/--disabled/);
    await expect(dayLocator(page, '011')).toHaveClass(/--disabled/);
  });

  test('Loppupäivää ei voi valita alkupäivää ennen', async ({ page }) => {
    await setPvm(page, 'tilastot-alkupvm', '10.06.2025');

    await pvmInput(page, 'tilastot-loppupvm').click();

    await expect(dayLocator(page, '009')).toHaveClass(/--disabled/);
    await expect(dayLocator(page, '010')).not.toHaveClass(/--disabled/);
  });
});

test.describe('CSV:n lataus', () => {
  test('Lataus kutsuu backendiä valitulla aikavälillä', async ({ page }) => {
    const requests = await mockTilastoCsv(page);
    await setPvm(page, 'tilastot-alkupvm', '01.01.2025');
    await setPvm(page, 'tilastot-loppupvm', '31.03.2025');

    await clickAndExpectDownload(page);

    expect(requests).toHaveLength(1);
    const request = requests[0];
    const url = new URL(request.url());
    expect(request.method()).toBe('GET');
    expect(url.pathname).toMatch(/\/tilastot\/tilastokeskus-csv$/);
    expect(localDate(url.searchParams.get('alkuPvm'))).toBe('2025-01-01');
    // react-datepicker säilyttää aiemmin valitun päivän kellonajan, joten
    // loppupvm (oletuksena "nyt") verrataan vain päivämääräosaan
    expect(localDate(url.searchParams.get('loppuPvm'))).toBe('2025-03-31');
    expect(request.headers()['accept']).toBe('text/csv');
  });

  test('Lataus toimii oletuspäivämäärillä', async ({ page }) => {
    const requests = await mockTilastoCsv(page);

    await clickAndExpectDownload(page);

    const url = new URL(requests[0].url());
    expect(localDate(url.searchParams.get('alkuPvm'))).toBe('2025-01-01');
    expect(url.searchParams.has('loppuPvm')).toBe(true);
  });

  test('Ladattu tiedosto on nimeltään tilastokeskus.csv ja sisältää datan', async ({
    page,
  }) => {
    await mockTilastoCsv(page);

    const download = await clickAndExpectDownload(page);

    expect(download.suggestedFilename()).toBe('tilastokeskus.csv');
    const path = await download.path();
    expect(await readFile(path, 'utf-8')).toBe(CSV_BODY);
  });

  test('Muutettu aikaväli välittyy seuraavaan lataukseen', async ({ page }) => {
    const requests = await mockTilastoCsv(page);

    await clickAndExpectDownload(page);
    await setPvm(page, 'tilastot-alkupvm', '15.03.2025');
    await clickAndExpectDownload(page);

    expect(requests).toHaveLength(2);
    expect(
      localDate(new URL(requests[1].url()).searchParams.get('alkuPvm')),
    ).toBe('2025-03-15');
  });

  test('Tyhjä CSV (vain otsikkorivi) latautuu', async ({ page }) => {
    await mockTilastoCsv(page, { body: 'hakemustunnus;henkilotunnus\n' });

    const download = await clickAndExpectDownload(page);

    expect(await readFile(await download.path(), 'utf-8')).toBe(
      'hakemustunnus;henkilotunnus\n',
    );
  });
});

test.describe('CSV:n latausvirheet', () => {
  test('Palvelinvirhe näyttää virhetoastin eikä lataa tiedostoa', async ({
    page,
  }) => {
    await mockTilastoCsv(page, { status: 500, body: 'virhe' });

    const downloads = trackDownloads(page);

    await page.getByTestId('tilastot-lataa').click();

    await expectErrorToast(page, 'virhe.tilastoCsvLataus');
    expect(downloads()).toBe(0);
    await expect(page.getByTestId('tilastot-lataa')).toBeEnabled();
  });

  test('Backendin virheen origin näkyy toastissa', async ({ page }) => {
    await page.route(CSV_URL, async (route: Route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ origin: 'tilastokeskusCsv', message: 'virhe' }),
      });
    });

    await page.getByTestId('tilastot-lataa').click();

    await expectErrorToast(
      page,
      'virhe.tilastoCsvLataus virhe.tilastokeskusCsv',
    );
  });

  test('Oikeusvirhe (403) yritetään kerran uudelleen ja näyttää virhetoastin', async ({
    page,
  }) => {
    const requests = await mockTilastoCsv(page, { status: 403, body: '' });

    const downloads = trackDownloads(page);

    await page.getByTestId('tilastot-lataa').click();

    await expectErrorToast(page, 'virhe.tilastoCsvLataus');
    expect(downloads()).toBe(0);
    expect(requests).toHaveLength(2);
  });

  test('Onnistunut lataus ei näytä virhetoastia', async ({ page }) => {
    await mockTilastoCsv(page);

    await clickAndExpectDownload(page);

    await expect(page.getByTestId('toast-alert')).toHaveCount(0);
  });

  test('Lataus onnistuu virheen jälkeen uudelleenyrityksellä', async ({
    page,
  }) => {
    let kutsut = 0;
    await page.route(CSV_URL, async (route: Route) => {
      kutsut++;
      if (kutsut === 1) {
        await route.fulfill({ status: 500, body: 'virhe' });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'text/csv',
          body: CSV_BODY,
        });
      }
    });

    await page.getByTestId('tilastot-lataa').click();
    await expectErrorToast(page, 'virhe.tilastoCsvLataus');

    const download = await clickAndExpectDownload(page);
    expect(download.suggestedFilename()).toBe('tilastokeskus.csv');
  });
});

test.describe('Latauksen aikainen tila', () => {
  test('Painike on pois käytöstä latauksen ajan ja pyyntö lähtee kerran', async ({
    page,
  }) => {
    let pyyntoja = 0;
    let vapauta: () => void = () => {};
    const odota = new Promise<void>((resolve) => {
      vapauta = resolve;
    });
    await page.route(CSV_URL, async (route: Route) => {
      pyyntoja++;
      await odota;
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        body: CSV_BODY,
      });
    });
    const nappi = page.getByTestId('tilastot-lataa');

    await nappi.click();
    await expect(nappi).toBeDisabled();

    const download = page.waitForEvent('download');
    vapauta();
    await download;

    await expect(nappi).toBeEnabled();
    expect(pyyntoja).toBe(1);
  });

  test('Painike on taas käytössä virheen jälkeen', async ({ page }) => {
    await mockTilastoCsv(page, { status: 500, body: 'virhe' });
    const nappi = page.getByTestId('tilastot-lataa');

    await nappi.click();

    await expectErrorToast(page, 'virhe.tilastoCsvLataus');
    await expect(nappi).toBeEnabled();
  });
});
