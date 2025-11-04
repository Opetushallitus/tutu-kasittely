import { test, expect, Locator } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import { selectOptionFromDropdown } from '@/playwright/helpers/testUtils';
import { Serializable } from 'playwright-core/types/structs';
import { Kelpoisuus } from '@/src/lib/types/paatos';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

test('Valittaessa 2 Kelpoisuus, ja muutettaessa jatkovalintoja, näytetään käyttäjälle oikea otsikko ja valittavat kentät, ja lähetetään POST -kutsut backendille', async ({
  page,
}) => {
  const selectOption = async (
    menuButton: Locator,
    optionText: string,
  ): Promise<Kelpoisuus> => {
    return selectOptionFromDropdown(
      page,
      menuButton,
      optionText,
      '/paatos/1.2.246.562.10.00000000001',
    ).then((data: Serializable) => data.paatosTiedot[0].kelpoisuudet[0]);
  };

  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  const sovellettuLakiSelect = page.getByTestId(
    'paatos-sovellettulaki-dropdown',
  );
  const kelpoisuusSelect = page.getByTestId('kelpoisuus-select');
  const opetettavaAineSelect = page.getByTestId('opetettavaAine-select');
  const muuAmmattiInput = page.getByTestId('muuAmmmattikuvaus-input');
  await expect(page.getByTestId('paatos-ratkaisutyyppi')).toHaveText('Päätös');

  await selectOption(paatostyyppiInput, '2 Kelpoisuus');

  await expect(kelpoisuusSelect).not.toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(sovellettuLakiSelect, 'Päätös UO');
  await expect(page.locator('h3').last()).toHaveText('Kelpoisuus 1');
  await expect(kelpoisuusSelect).toBeVisible();
  await expect(opetettavaAineSelect).not.toBeVisible();

  let postDataJson = await selectOption(
    kelpoisuusSelect,
    'Aineenopettaja perusopetuksessa',
  );
  expect(postDataJson.kelpoisuus).toEqual(
    'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
  );

  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(sovellettuLakiSelect, 'Päätös AP/SEUT');

  await selectOption(kelpoisuusSelect, 'Aineenopettaja lukiossa');
  await expect(opetettavaAineSelect).toBeVisible();
  await expect(muuAmmattiInput).not.toBeVisible();

  postDataJson = await selectOption(opetettavaAineSelect, 'biologia');
  expect(postDataJson.opetettavaAine).toEqual(
    'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
  );

  postDataJson = await selectOption(
    page.getByTestId('direktiivitaso-select'),
    'b - 1384/2015 pätevyystaso 2',
  );
  expect(postDataJson.direktiivitaso).toEqual('b_1384_2015_patevyystaso_2');

  postDataJson = await selectOption(
    page.getByTestId('kansallisestiVaadittavaDirektiivitaso-select'),
    'c - 1384/2015 pätevyystaso 3',
  );
  expect(postDataJson.kansallisestiVaadittavaDirektiivitaso).toEqual(
    'c_1384_2015_patevyystaso_3',
  );

  let [req] = await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page
      .getByTestId('direktiivitasoLisatieto-input')
      .getByRole('textbox')
      .fill('Tämä on lisätieto'),
  ]);
  expect(
    req.postDataJSON().paatosTiedot[0].kelpoisuudet[0].direktiivitasoLisatiedot,
  ).toEqual('Tämä on lisätieto');

  const kelpoisuus = await selectOption(kelpoisuusSelect, 'Muu ammatti');
  expect(kelpoisuus.kelpoisuus).toEqual('Muu ammatti');
  expect(kelpoisuus.opetettavaAine).toBeUndefined();
  expect(kelpoisuus.muuAmmmattikuvaus).toBeUndefined();
  expect(kelpoisuus.direktiivitaso).toBeUndefined();
  expect(kelpoisuus.kansallisestiVaadittavaDirektiivitaso).toBeUndefined();
  expect(kelpoisuus.direktiivitasoLisatiedot).toBeUndefined();
  await expect(opetettavaAineSelect).not.toBeVisible();
  await expect(muuAmmattiInput).toBeVisible();
  [req] = await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    muuAmmattiInput.getByRole('textbox').fill('Muu ammatti lisätieto'),
  ]);
  expect(
    req.postDataJSON().paatosTiedot[0].kelpoisuudet[0].muuAmmmattikuvaus,
  ).toEqual('Muu ammatti lisätieto');
});
