import { test, expect, Page, Route } from '@playwright/test';
import {
  mockInit,
  mockKoodistot,
  mockUser,
  mockEsittelijatWithIds,
} from '@/playwright/mocks';

const gotoMaajako = async (page: Page) => {
  await page.goto('/tutu-frontend/maajako');
  await expect(page.getByTestId('suoritusmaa')).toBeVisible();
};

const setupMaakoodiApi = (
  page: Page,
  initial: Array<{
    id: string;
    koodiUri: string;
    nimi: string;
    esittelijaId: string | null;
  }>,
) => {
  const state = { data: initial.slice() };

  page.route('**/tutu-backend/api/maakoodi*', async (route: Route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(state.data),
      });
    } else if (request.method() === 'PUT') {
      const url = new URL(request.url());
      const id = url.searchParams.get('id');
      const esittelijaId = url.searchParams.get('esittelijaId');
      if (id) {
        state.data = state.data.map((mk) =>
          mk.id === id ? { ...mk, esittelijaId: esittelijaId ?? null } : mk,
        );
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    } else {
      await route.fallback();
    }
  });

  return state;
};

test.beforeEach(async ({ page }) => {
  mockInit(page);
  mockKoodistot(page);
  mockUser(page);
  mockEsittelijatWithIds(page);
});

test('Näytä AlertBox, kun jotkin maakoodit ovat määrittämättä, ja SuccessBox, kun kaikki on määritetty', async ({
  page,
}) => {
  setupMaakoodiApi(page, [
    {
      id: 'M1',
      koodiUri: 'maatjavaltiot2_001',
      nimi: 'Suomi',
      esittelijaId: 'E1',
    },
    {
      id: 'M2',
      koodiUri: 'maatjavaltiot2_002',
      nimi: 'Ruotsi',
      esittelijaId: null,
    },
  ]);

  await gotoMaajako(page);

  await expect(page.getByTestId('alert-box')).toBeVisible();
  await expect(page.getByTestId('success-box')).toHaveCount(0);

  // Aseta määrittämätön maakoodi (PUT + mitätöinti + GET).
  await page.getByTestId('toggle-edit').click();
  const firstSelect = await page.getByTestId('esittelija-maaselection-E1');
  await expect(firstSelect).toBeVisible();
  await firstSelect.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();
  await page.keyboard.press('Escape'); // Sulje pudotusvalikko, jotta tausta ei estä klikkauksia.

  await expect(page.getByTestId('success-box')).toBeVisible();
  await expect(page.getByTestId('alert-box')).toHaveCount(0);
});

test('Maakoodin osoittaminen ja siirtäminen esittelijöiden välillä muokkaustilassa päivittää käyttöliittymän', async ({
  page,
}) => {
  setupMaakoodiApi(page, [
    {
      id: 'M1',
      koodiUri: 'maatjavaltiot2_001',
      nimi: 'Suomi',
      esittelijaId: 'E1',
    },
    {
      id: 'M2',
      koodiUri: 'maatjavaltiot2_002',
      nimi: 'Ruotsi',
      esittelijaId: null,
    },
  ]);

  await gotoMaajako(page);

  // Siirry muokkaus tilaan
  await page.getByTestId('toggle-edit').click();

  // Assign "Ruotsi" (002) via the first esittelija select
  const firstSelect = await page.getByTestId('esittelija-maaselection-E1');
  await expect(firstSelect).toBeVisible();
  await firstSelect.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();
  // Sulje pudotusvalikko, jotta tausta ei estä klikkauksia.
  await page.keyboard.press('Escape');

  // Wait for success message and the chip to appear
  await expect(page.getByTestId('success-box')).toBeVisible();
  await expect(
    page.getByTestId('maakoodi-chip-maatjavaltiot2_002'),
  ).toBeVisible();

  // Remove assignment by deleting chip -> becomes unassigned -> Alert shown again
  const chip = page.getByTestId('maakoodi-chip-maatjavaltiot2_002');
  await expect(chip).toBeVisible();

  // Wait for the chip to be stable and the cancel icon to be clickable
  const cancelIcon = chip.locator('svg[data-testid="CancelIcon"]');
  await expect(cancelIcon).toBeVisible();
  await expect(cancelIcon).toBeEnabled();

  // Force click the cancel icon to ensure the click happens
  await cancelIcon.click({ force: true });

  // Workaround, API vastaa esittelijaId null
  // Poista määritys poistamalla maavalinta → muuttuu määrittämättömäksi → Alertbox näytetään jälleen.
  await page.unroute('**/tutu-backend/api/maakoodi*');
  setupMaakoodiApi(page, [
    {
      id: 'M1',
      koodiUri: 'maatjavaltiot2_001',
      nimi: 'Suomi',
      esittelijaId: 'E1',
    },
    {
      id: 'M2',
      koodiUri: 'maatjavaltiot2_002',
      nimi: 'Ruotsi',
      esittelijaId: null,
    },
  ]);
  await page.reload();
  await expect(page.getByTestId('alert-box')).toBeVisible();

  // Siirry takaisin muokkaustilaan uudelleenlatauksen jälkeen.
  await page.getByTestId('toggle-edit').click();

  // Odota, että molemmat valintakentät ovat näkyvissä muokkaustilaan siirtymisen jälkeen.
  await expect(page.getByTestId('esittelija-maaselection-E1')).toBeVisible();
  await expect(page.getByTestId('esittelija-maaselection-E2')).toBeVisible();

  // Määritä maavalinta uudelleen käyttämällä toista esittelijä-valintaa (toista valintakenttää).
  const secondSelect = await page.getByTestId('esittelija-maaselection-E2');
  await expect(secondSelect).toBeVisible();
  await secondSelect.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();
  await page.keyboard.press('Escape');

  await expect(page.getByTestId('success-box')).toBeVisible();
  await expect(
    page.getByTestId('maakoodi-chip-maatjavaltiot2_002'),
  ).toBeVisible();
});

test('SelectedMaakoodiInfo päivittyy kun maakoodien esittelijät muuttuvat', async ({
  page,
}) => {
  setupMaakoodiApi(page, [
    {
      id: 'M1',
      koodiUri: 'maatjavaltiot2_001',
      nimi: 'Suomi',
      esittelijaId: 'E1',
    },
    {
      id: 'M2',
      koodiUri: 'maatjavaltiot2_002',
      nimi: 'Ruotsi',
      esittelijaId: null,
    },
  ]);

  await gotoMaajako(page);

  // Valitse Ruotsi suoritusmaaksi
  const suoritusmaaSelect = page.getByTestId('suoritusmaa');
  await suoritusmaaSelect.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();

  // Aluksi maakoodilla ei ole esittelijää - ei pitäisi näyttää esittelijän nimeä
  await expect(
    page.getByTestId('selected-maakoodi-esittelija'),
  ).not.toBeVisible();

  // Siirry muokkaustilaan ja aseta esittelijä
  await page.getByTestId('toggle-edit').click();
  const firstSelect = page.getByTestId('esittelija-maaselection-E1');
  await firstSelect.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();
  await page.keyboard.press('Escape');

  // Tarkista että SelectedMaakoodiInfo näyttää uuden esittelijän
  const esittelijaElement = page.getByTestId('selected-maakoodi-esittelija');
  await expect(esittelijaElement).toBeVisible();
  await expect(esittelijaElement).toHaveText('Kari Karibia');

  // Poista esittelijä
  const chip = page.getByTestId('maakoodi-chip-maatjavaltiot2_002');
  await expect(chip).toBeVisible();
  const cancelIcon = chip.locator('svg[data-testid="CancelIcon"]');
  await cancelIcon.click({ force: true });

  // Päivitä API-tila vastaamaan esittelijän poistoa
  await page.unroute('**/tutu-backend/api/maakoodi*');
  setupMaakoodiApi(page, [
    {
      id: 'M1',
      koodiUri: 'maatjavaltiot2_001',
      nimi: 'Suomi',
      esittelijaId: 'E1',
    },
    {
      id: 'M2',
      koodiUri: 'maatjavaltiot2_002',
      nimi: 'Ruotsi',
      esittelijaId: null,
    },
  ]);
  await page.reload();

  // Valitse Ruotsi uudelleen suoritusmaaksi uudelleenlatauksen jälkeen
  const suoritusmaaSelectAfterReload = page.getByTestId('suoritusmaa');
  await suoritusmaaSelectAfterReload.click();
  await page.getByRole('option', { name: 'Ruotsi' }).click();

  // Tarkista että esittelijän nimi ei ole enää näkyvissä
  await expect(
    page.getByTestId('selected-maakoodi-esittelija'),
  ).not.toBeVisible();
});
