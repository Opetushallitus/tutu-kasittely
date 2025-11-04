import { test, expect, Page, Locator } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';
import { PaatosTieto } from '@/src/lib/types/paatos';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

const selectOption = async (
  page: Page,
  menuButton: Locator,
  optionText: string,
): Promise<PaatosTieto> => {
  await menuButton.click();
  const option = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator(`text=${optionText}`)
    .last();
  return await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    option.click(),
  ]).then((data) => data[0].postDataJSON().paatosTiedot[0]);
};

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

  let postDataJson = await selectOption(
    page,
    kelpoisuusSelect,
    'Aineenopettaja perusopetuksessa',
  );
  expect(postDataJson.kelpoisuudet[0].kelpoisuus).toEqual(
    'Opetusalan ammatit_Aineenopettaja perusopetuksessa',
  );

  await expect(opetettavaAineSelect).not.toBeVisible();

  await selectOption(page, sovellettuLakiSelect, 'Päätös AP/SEUT');

  await selectOption(page, kelpoisuusSelect, 'Aineenopettaja lukiossa');
  await expect(opetettavaAineSelect).toBeVisible();
  await expect(muuAmmattiInput).not.toBeVisible();

  postDataJson = await selectOption(page, opetettavaAineSelect, 'biologia');
  expect(postDataJson.kelpoisuudet[0].opetettavaAine).toEqual(
    'Opetusalan ammatit_Aineenopettaja lukiossa_biologia',
  );

  postDataJson = await selectOption(
    page,
    page.getByTestId('direktiivitaso-select'),
    'b - 1384/2015 pätevyystaso 2',
  );
  expect(postDataJson.kelpoisuudet[0].direktiivitaso).toEqual(
    'b_1384_2015_patevyystaso_2',
  );

  postDataJson = await selectOption(
    page,
    page.getByTestId('kansallisestiVaadittavaDirektiivitaso-select'),
    'c - 1384/2015 pätevyystaso 3',
  );
  expect(
    postDataJson.kelpoisuudet[0].kansallisestiVaadittavaDirektiivitaso,
  ).toEqual('c_1384_2015_patevyystaso_3');

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

  postDataJson = await selectOption(page, kelpoisuusSelect, 'Muu ammatti');
  const kelpoisuus = postDataJson.kelpoisuudet[0];
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
  //await expect(
  //  page.getByTestId('lisaa-kelpoisuus-button'),
  //).toBeVisible();
});
