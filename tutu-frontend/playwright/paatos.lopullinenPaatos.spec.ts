import { expect, test } from '@playwright/test';

import {
  expectDataFromDropdownSelection,
  expectRequestData,
} from '@/playwright/helpers/testUtils';
import {
  mockEsittelijat,
  mockGetAndPut,
  mockInit,
  mockLopullisenPaatoksenHakemus,
  mockUser,
} from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockInit(page);
  await mockEsittelijat(page);
  await mockUser(page);
  await mockLopullisenPaatoksenHakemus(page);
  await page.route('**/tutu-backend/api/hakemus/*/tutkinto/', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    });
  });
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.11.00000000001/paatostiedot',
  );
});

test('Päätöskentät näkyvät oikein ja muutosten tallennus lähettää PUT-kutsun backendille', async ({
  page,
}) => {
  await mockGetAndPut(page, '**/tutu-backend/api/paatos/*', {});
  const suoritettuRadioGroup = page.getByTestId(
    'paatos-korvaavatToimenpiteet-suoritettu-radio-group',
  );
  const lopullinenPaatosRadioGroup = page.getByTestId(
    'paatos-korvaavatToimenpiteet-lopullinenPaatos-radio-group',
  );
  const esittelijanHuomiotInput = page.getByTestId(
    'korvaavatToimenpiteet-esittelijanHuomiot-input',
  );
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const sovellettulakiInput = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );

  const paatosText = 'hakemus.paatos.paatostyyppi.lopullinenPaatos';
  const peruutusTaiRaukeaminenText =
    'hakemus.paatos.ratkaisutyyppi.peruutusTaiRaukeaminen';
  const sovellettuLakiAp = 'hakemus.paatos.sovellettuLaki.ap';

  await expect(page.getByTestId('korvaavatToimenpiteet-otsikko')).toBeVisible();
  await expect(suoritettuRadioGroup).toBeVisible();
  await expect(lopullinenPaatosRadioGroup).toBeHidden();
  await expect(esittelijanHuomiotInput).toBeHidden();
  await expect(sovellettulakiInput).toBeHidden();
  await expect(ratkaisutyyppiInput).toBeVisible();

  // Suoritettu, myönteinen päätös
  await suoritettuRadioGroup
    .locator('input[type="radio"][value="true"]')
    .click();
  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(sovellettulakiInput).toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    sovellettulakiInput.first(),
    sovellettuLakiAp,
    '/paatos/',
    {
      ratkaisutyyppi: 'Paatos',
      paatosTiedot: [
        {
          paatosTyyppi: 'LopullinenPaatos',
          myonteinenPaatos: true,
          sovellettuLaki: 'ap',
        },
      ],
    },
  );
  await expect(sovellettulakiInput).toHaveText(sovellettuLakiAp);

  // Suoritettu, kielteinen päätös
  await suoritettuRadioGroup
    .locator('input[type="radio"][value="false"]')
    .click();
  await expect(lopullinenPaatosRadioGroup).toBeVisible();
  await expect(esittelijanHuomiotInput).toBeVisible();
  await expect(sovellettulakiInput).toBeHidden();

  await esittelijanHuomiotInput.getByRole('textbox').fill('huomio!');
  await expectRequestData(
    page,
    '/paatos/',
    lopullinenPaatosRadioGroup
      .locator('input[type="radio"][value="true"]')
      .click(),
    {
      ratkaisutyyppi: 'Paatos',
      paatosTiedot: [
        {
          paatosTyyppi: 'LopullinenPaatos',
          myonteinenPaatos: false,
          esittelijanHuomioitaToimenpiteista: 'huomio!',
        },
      ],
    },
  );

  await expect(ratkaisutyyppiInput).toHaveText(paatosText);
  await expect(sovellettulakiInput).toBeVisible();

  // Hakija peruuttanut
  await expectRequestData(
    page,
    '/paatos/',
    lopullinenPaatosRadioGroup
      .locator('input[type="radio"][value="false"]')
      .click(),
    {
      ratkaisutyyppi: 'PeruutusTaiRaukeaminen',
      paatosTiedot: [
        {
          paatosTyyppi: 'LopullinenPaatos',
          esittelijanHuomioitaToimenpiteista: 'huomio!',
        },
      ],
    },
  );
  await expect(esittelijanHuomiotInput.getByRole('textbox')).toHaveText(
    'huomio!',
  );
  await expect(ratkaisutyyppiInput).toHaveText(peruutusTaiRaukeaminenText);
  await expect(sovellettulakiInput).toBeHidden();
});
