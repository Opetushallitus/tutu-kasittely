import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';
import { clickSaveAndWaitForPUT } from '@/playwright/helpers/saveHelpers';

test.beforeEach(async ({ page }) => {
  await Promise.all([
    mockBasicForHakemus({ page }),
    mockUser(page),
    mockHakemus(page),
    mockLiitteet(page),
  ]);
});

test('Asiakirjamallit vastaavista tutkinnoista näkyvät taulukossa', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(
    page.getByTestId('asiakirjamalleja-vastaavista-tutkinnoista-otsikko'),
  ).toBeVisible();

  const cellsOfEce = page
    .getByTestId('asiakirjamallit-tutkinnoista-ece')
    .locator('td');
  await expect(cellsOfEce.nth(0)).toHaveText('ECE');
  await expect(
    cellsOfEce.nth(1).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfEce.nth(2).locator('textarea').first()).toHaveValue(
    'Jotain kuvausta',
  );
  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-ece-clear-button'),
  ).toBeVisible();

  const cellsOfNuffic = page
    .getByTestId('asiakirjamallit-tutkinnoista-nuffic')
    .locator('td');
  await expect(cellsOfNuffic.nth(0)).toHaveText('Nuffic');
  await expect(
    cellsOfNuffic.nth(1).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfNuffic.nth(2).locator('textarea').first()).toBeEmpty();
  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-nuffic-clear-button'),
  ).toBeVisible();

  const cellsOfAacrao = page
    .getByTestId('asiakirjamallit-tutkinnoista-aacrao')
    .locator('td');
  await expect(cellsOfAacrao.nth(0)).toHaveText('Aacrao');
  await expect(
    cellsOfAacrao.nth(1).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfAacrao.nth(2).locator('textarea').first()).toHaveValue(
    'Jotain muuta kuvausta',
  );
  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-aacrao-clear-button'),
  ).toBeVisible();

  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-UK_enic-clear-button'),
  ).not.toBeVisible();
  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-naric_portal-clear-button'),
  ).not.toBeVisible();
  await expect(
    page.getByTestId('asiakirjamalli-vastaavuus-muu-clear-button'),
  ).not.toBeVisible();
});

test('Asiakirjamallien modifioinneista lähtee pyynnöt backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(
    page.getByTestId('asiakirjamalleja-vastaavista-tutkinnoista-otsikko'),
  ).toBeVisible();

  const cellsOfEce = page
    .getByTestId('asiakirjamallit-tutkinnoista-ece')
    .locator('td');

  // Click radio button (local state update)
  await cellsOfEce.nth(1).locator('input[type="radio"][value="false"]').click();

  // Click save and wait for PUT request
  let request = await clickSaveAndWaitForPUT(page, '/hakemus/');
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.ece.vastaavuus,
  ).toEqual(false);

  const cellsOfUkEnic = page
    .getByTestId('asiakirjamallit-tutkinnoista-UK_enic')
    .locator('td');

  // Fill textarea (local state update)
  await cellsOfUkEnic.nth(2).locator('textarea').first().fill('Uusi kuvaus');

  // Click save and wait for PUT request
  request = await clickSaveAndWaitForPUT(page, '/hakemus/');
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.UK_enic.kuvaus,
  ).toEqual('Uusi kuvaus');
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.UK_enic
      .vastaavuus,
  ).toEqual(true);

  // Click clear button (local state update)
  await page
    .getByTestId('asiakirjamalli-vastaavuus-aacrao-clear-button')
    .click();

  // Click save and wait for PUT request
  request = await clickSaveAndWaitForPUT(page, '/hakemus/');
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.aacrao,
  ).toBeUndefined();
});
