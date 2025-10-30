import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';

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
  await expect(cellsOfEce.nth(3).locator('textarea').first()).toHaveValue(
    'Jotain kuvausta',
  );
  await expect(page.getByTestId('asiakirjamalli-delete-ece')).toBeVisible();

  const cellsOfNuffic = page
    .getByTestId('asiakirjamallit-tutkinnoista-nuffic')
    .locator('td');
  await expect(cellsOfNuffic.nth(0)).toHaveText('Nuffic');
  await expect(
    cellsOfNuffic.nth(2).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfNuffic.nth(3).locator('textarea').first()).toBeEmpty();
  await expect(page.getByTestId('asiakirjamalli-delete-nuffic')).toBeVisible();

  const cellsOfAacrao = page
    .getByTestId('asiakirjamallit-tutkinnoista-aacrao')
    .locator('td');
  await expect(cellsOfAacrao.nth(0)).toHaveText('Aacrao');
  await expect(
    cellsOfAacrao.nth(2).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfAacrao.nth(3).locator('textarea').first()).toHaveValue(
    'Jotain muuta kuvausta',
  );
  await expect(page.getByTestId('asiakirjamalli-delete-aacrao')).toBeVisible();

  await expect(
    page.getByTestId('asiakirjamalli-delete-UK_enic'),
  ).not.toBeVisible();
  await expect(
    page.getByTestId('asiakirjamalli-delete-naric_portal'),
  ).not.toBeVisible();
  await expect(page.getByTestId('asiakirjamalli-delete-muu')).not.toBeVisible();
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

  await cellsOfEce.nth(2).locator('input[type="radio"]').click();

  const cellsOfUkEnic = page
    .getByTestId('asiakirjamallit-tutkinnoista-UK_enic')
    .locator('td');

  await cellsOfUkEnic.nth(3).locator('textarea').first().fill('Uusi kuvaus');

  await page.getByTestId('asiakirjamalli-delete-aacrao').click();

  const saveButton = page.getByTestId('save-ribbon-button');
  await expect(saveButton).toBeVisible();

  const [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        req.method() === 'PUT',
    ),
    saveButton.click(),
  ]);

  const requestData = request.postDataJSON();
  expect(
    requestData.asiakirja.asiakirjamallitTutkinnoista.ece.vastaavuus,
  ).toEqual(false);
  expect(
    requestData.asiakirja.asiakirjamallitTutkinnoista.UK_enic.kuvaus,
  ).toEqual('Uusi kuvaus');
  expect(
    requestData.asiakirja.asiakirjamallitTutkinnoista.aacrao,
  ).toBeUndefined();
});
