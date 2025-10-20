import { test, expect } from '@playwright/test';
import { mockAll, mockPaatos } from '@/playwright/mocks';

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPaatos(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/paatostiedot',
  );
});

const matchUpdate = (url: string, method: string) =>
  url.includes('/paatos/1.2.246.562.10.00000000001') && method === 'POST';

test('Valittaessa 4 Riittävät opinnot, tulee opintojen lisäyksen jälkeen oikea otsikko', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=4 Riittävät opinnot');

  await tasoOption.click();

  await expect(
    page.getByTestId('lisaa-tutkinto-tai-opinto-button'),
  ).toBeVisible();
  await page.getByTestId('lisaa-tutkinto-tai-opinto-button').click();

  await expect(page.locator('h3').last()).toHaveText('Opinnot 1');
});

test('Rinnastettavien tutkintojen tai opintojen lisäys ja poisto toimii ja lähettää kutsun backendille', async ({
  page,
}) => {
  const ratkaisutyyppiInput = page.getByTestId('paatos-ratkaisutyyppi');
  const paatostyyppiInput = page.getByTestId('paatos-paatostyyppi-dropdown');
  await expect(ratkaisutyyppiInput).toHaveText('Päätös');
  await expect(paatostyyppiInput).toBeVisible();

  await paatostyyppiInput.click();
  await expect(paatostyyppiInput).toBeVisible();

  const tasoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=3 Tietty tutkinto tai opinnot');

  await tasoOption.click();

  await expect(
    page.getByTestId('lisaa-tutkinto-tai-opinto-button'),
  ).toBeVisible();
  await page.getByTestId('lisaa-tutkinto-tai-opinto-button').click();

  await expect(page.locator('h3').last()).toHaveText('Tutkinto tai opinnot 1');

  const tutkintoDropdown = page.getByTestId(
    'rinnastettava-tutkinto-tai-opinto-select',
  );
  await expect(tutkintoDropdown).toBeVisible();
  await tutkintoDropdown.click();

  const tutkintoOption = page
    .locator('ul[role="listbox"] li[role="option"]')
    .locator('text=TODO');

  const [req] = await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    tutkintoOption.click(),
  ]);
  expect(
    req.postDataJSON().paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot[0]
      .tutkintoTaiOpinto,
  ).toEqual('testi');

  const myonteinenPaatosRadioGroup = page.getByTestId(
    'paatos-myonteinenPaatos-radio-group',
  );

  await expect(myonteinenPaatosRadioGroup).toBeVisible();
  await myonteinenPaatosRadioGroup.scrollIntoViewIfNeeded();

  const [myonteinenPaatosReq] = await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    myonteinenPaatosRadioGroup
      .locator('input[type="radio"][value="true"]')
      .click(),
  ]);

  const myonteinenPaatosPostData = myonteinenPaatosReq.postDataJSON();
  expect(
    myonteinenPaatosPostData.paatosTiedot[0]
      .rinnastettavatTutkinnotTaiOpinnot[0].myonteinenPaatos,
  ).toEqual(true);

  await expect(
    page.getByTestId('poista-tutkinto-tai-opinto-button'),
  ).toBeVisible();

  const [poistaTutkintoReq] = await Promise.all([
    page.waitForRequest((req1) => matchUpdate(req1.url(), req1.method())),
    page.getByTestId('poista-tutkinto-tai-opinto-button').click(),
  ]);

  const tutkintoTasoPostData = poistaTutkintoReq.postDataJSON();
  console.log(tutkintoTasoPostData);
  expect(
    tutkintoTasoPostData.paatosTiedot[0].rinnastettavatTutkinnotTaiOpinnot,
  ).toEqual([]);
});
