import { expect, test } from '@playwright/test';
import {
  mockBasicForHakemus,
  mockHakemus,
  mockLiitteet,
  mockUser,
} from '@/playwright/mocks';

test.beforeEach(mockBasicForHakemus);

test('Asiakirjamallit vastaavista tutkinnoista näkyvät taulukossa', async ({
  page,
}) => {
  mockUser(page);
  mockHakemus(page);
  await mockLiitteet(page);

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
  await expect(cellsOfEce.nth(3).locator('input[type="text"]')).toHaveValue(
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
  await expect(cellsOfNuffic.nth(3).locator('input[type="text"]')).toBeEmpty();
  await expect(page.getByTestId('asiakirjamalli-delete-nuffic')).toBeVisible();

  const cellsOfAacrao = page
    .getByTestId('asiakirjamallit-tutkinnoista-aacrao')
    .locator('td');
  await expect(cellsOfAacrao.nth(0)).toHaveText('Aacrao');
  await expect(
    cellsOfAacrao.nth(2).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfAacrao.nth(3).locator('input[type="text"]')).toHaveValue(
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
  mockUser(page);
  mockHakemus(page);
  await mockLiitteet(page);

  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/asiakirjat',
  );

  await expect(
    page.getByTestId('asiakirjamalleja-vastaavista-tutkinnoista-otsikko'),
  ).toBeVisible();

  const cellsOfEce = page
    .getByTestId('asiakirjamallit-tutkinnoista-ece')
    .locator('td');

  let [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        req.method() === 'PATCH',
    ),
    cellsOfEce.nth(2).locator('input[type="radio"]').click(),
  ]);
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.ece.vastaavuus,
  ).toEqual(false);

  const cellsOfUkEnic = page
    .getByTestId('asiakirjamallit-tutkinnoista-UK_enic')
    .locator('td');
  [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        req.method() === 'PATCH',
    ),
    cellsOfUkEnic.nth(3).locator('input[type="text"]').fill('Uusi kuvaus'),
  ]);
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.UK_enic.kuvaus,
  ).toEqual('Uusi kuvaus');
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.UK_enic
      .vastaavuus,
  ).toEqual(false);

  [request] = await Promise.all([
    page.waitForRequest(
      (req) =>
        req.url().includes('/hakemus/1.2.246.562.10.00000000001') &&
        req.method() === 'PATCH',
    ),
    page.getByTestId('asiakirjamalli-delete-aacrao').click(),
  ]);
  expect(
    request.postDataJSON().asiakirja.asiakirjamallitTutkinnoista.aacrao,
  ).toBeUndefined();
});
