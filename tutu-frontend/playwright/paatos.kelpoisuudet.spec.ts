import { test, expect } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import {
  expectDataFromDropdownSelection,
  expectRequestData,
  selectOption,
} from '@/playwright/helpers/testUtils';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

test('Valittaessa 2 Kelpoisuus, ja muutettaessa jatkovalintoja, näytetään käyttäjälle oikea otsikko ja valittavat kentät, ja lähetetään POST -kutsut backendille', async ({
  page,
}) => {
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const sovellettuLakiSelect = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );
  const kelpoisuusSelect = page.getByTestId('kelpoisuus-select');
  const opetettavaAineSelect = page.getByTestId('opetettavaAine-select');
  const muuAmmattiInput = page.getByTestId('muuAmmmattikuvaus-input');
  await expect(page.getByTestId('paatos-ratkaisutyyppi')).toHaveText('Päätös');

  await selectOption(page, paatostyyppiInput, '2 Kelpoisuus');

  await expect(kelpoisuusSelect).not.toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(page, sovellettuLakiSelect, 'Päätös UO');
  await expect(page.locator('h3').last()).toHaveText('Kelpoisuus 1');
  await expect(kelpoisuusSelect).toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    kelpoisuusSelect,
    'Aineenopettaja perusopetuksessa',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
            },
          ],
        },
      ],
    },
  );

  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(page, sovellettuLakiSelect, 'Päätös AP/SEUT');
  await selectOption(page, kelpoisuusSelect, 'Aineenopettaja lukiossa');
  await expect(opetettavaAineSelect).toBeVisible();
  await expect(muuAmmattiInput).not.toBeVisible();

  await expectDataFromDropdownSelection(
    page,
    opetettavaAineSelect,
    'biologia',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('direktiivitaso-select'),
    'b - 1384/2015 pätevyystaso 2',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
              direktiivitaso: 'b_1384_2015_patevyystaso_2',
            },
          ],
        },
      ],
    },
  );

  await expectDataFromDropdownSelection(
    page,
    page.getByTestId('kansallisestiVaadittavaDirektiivitaso-select'),
    'c - 1384/2015 pätevyystaso 3',
    '/paatos/',
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Opetusalan ammatit_Aineenopettaja lukiossa',
              opetettavaAine:
                'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
              direktiivitaso: 'b_1384_2015_patevyystaso_2',
              kansallisestiVaadittavaDirektiivitaso:
                'c_1384_2015_patevyystaso_3',
            },
          ],
        },
      ],
    },
  );

  await expectRequestData(
    page,
    '/paatos/',
    page
      .getByTestId('direktiivitasoLisatieto-input')
      .getByRole('textbox')
      .fill('Tämä on lisätieto'),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              direktiivitasoLisatiedot: 'Tämä on lisätieto',
            },
          ],
        },
      ],
    },
  );

  await selectOption(page, kelpoisuusSelect, 'Muu ammatti');
  await expect(opetettavaAineSelect).not.toBeVisible();
  await expect(muuAmmattiInput).toBeVisible();

  await expectRequestData(
    page,
    '/paatos/',
    muuAmmattiInput.getByRole('textbox').fill('Muu ammatti lisätieto'),
    {
      paatosTiedot: [
        {
          paatosTyyppi: 'Kelpoisuus',
          kelpoisuudet: [
            {
              kelpoisuus: 'Muu ammatti',
              muuAmmmattikuvaus: 'Muu ammatti lisätieto',
            },
          ],
        },
      ],
    },
  );
});
