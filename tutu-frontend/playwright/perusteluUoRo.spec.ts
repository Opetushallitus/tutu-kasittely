import { expect, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { clickSaveAndVerifyPayload } from '@/playwright/helpers/saveHelpers';
import { setupPerusteluRoute } from '@/playwright/helpers/routeHandlers';

test.beforeEach(mockAll);

test('UO/RO-perustelun kentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/uoro/',
  );
  await expect(page.getByTestId('perustelu-layout-otsikko')).toHaveText(
    'Tiettyä kelpoisuutta koskevan UO/RO -päätöksen perustelut',
  );
  await expect(page.getByText('Erot koulutuksen sisällössä')).toBeVisible();

  // Lasketaan checkboxit sivulla:
  const checkboxes = page.locator('[data-testid^="checkbox-"]');
  await expect
    .poll(async () => await checkboxes.count(), { timeout: 15000 })
    .toEqual(32);
  await expect(checkboxes.first()).toBeVisible();

  const otmMuuEro = page.getByTestId('checkbox-otmMuuEro');
  await otmMuuEro.scrollIntoViewIfNeeded();
  const otmMuuEroCheckbox = otmMuuEro.locator('input[type="checkbox"]');
  await expect(otmMuuEroCheckbox).toBeVisible();
  await otmMuuEroCheckbox.check();
  await expect(otmMuuEroCheckbox).toBeChecked();
  await expect(page.getByTestId('otmMuuEroSelite')).toBeVisible();

  const otmMuuEroSeliteField = page
    .getByTestId('otmMuuEroSelite')
    .locator('textarea:not([readonly])');

  await otmMuuEroSeliteField.scrollIntoViewIfNeeded();
  await expect(otmMuuEroSeliteField).toBeVisible();

  await otmMuuEroSeliteField.fill('Härköneeeeeen');

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    uoRoSisalto: {
      otmMuuEro: true,
      otmMuuEroSelite: 'Härköneeeeeen',
    },
  });
});

test('UO/RO-perustelun sovellettu tilanne -kentät toimivat oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await setupPerusteluRoute(page, {
    id: 'mock-perustelu-id',
    hakemusId: 'mock-hakemus-id',
    lahdeLahtomaanKansallinenLahde: false,
    lahdeLahtomaanVirallinenVastaus: false,
    lahdeKansainvalinenHakuteosTaiVerkkosivusto: false,
    selvitysTutkinnonMyontajastaJaTutkinnonVirallisuudesta: '',
    selvitysTutkinnonAsemastaLahtomaanJarjestelmassa: '',
    luotu: '2025-09-02T16:08:42.083643',
    luoja: 'Hakemuspalvelu',
    uoRoSisalto: {},
  });

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/uoro/',
  );
  await expect(page.getByText('Sovellettu tilanne')).toBeVisible();

  const sovellettuLuokanopettaja = page.getByTestId(
    'checkbox-sovellettuLuokanopettaja',
  );
  await sovellettuLuokanopettaja.scrollIntoViewIfNeeded();
  const sovellettuLuokanopettajaCheckbox = sovellettuLuokanopettaja.locator(
    'input[type="checkbox"]',
  );
  await expect(sovellettuLuokanopettajaCheckbox).toBeVisible();
  await sovellettuLuokanopettajaCheckbox.check();
  await expect(sovellettuLuokanopettajaCheckbox).toBeChecked();

  const sovellettuLuokanopettajaRadioGroup = page.getByTestId(
    'radio-group-sovellettuLuokanopettaja',
  );

  await expect(sovellettuLuokanopettajaRadioGroup).toBeVisible();
  await sovellettuLuokanopettajaRadioGroup.scrollIntoViewIfNeeded();

  const firstOptionLabel = sovellettuLuokanopettajaRadioGroup
    .locator('label:has(input[type="radio"]:not([disabled]))')
    .first();
  await expect(firstOptionLabel).toBeVisible();

  await firstOptionLabel.click();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    uoRoSisalto: {
      sovellettuLuokanopettaja: {
        checked: true,
        value: 'A',
      },
    },
  });

  await sovellettuLuokanopettajaCheckbox.uncheck();

  await clickSaveAndVerifyPayload(page, '/perustelu/', {
    uoRoSisalto: {
      sovellettuLuokanopettaja: {
        checked: false,
        value: null,
      },
    },
  });
});
