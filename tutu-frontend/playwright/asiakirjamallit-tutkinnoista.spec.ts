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

  const cellsOfNuffic = page
    .getByTestId('asiakirjamallit-tutkinnoista-nuffic')
    .locator('td');
  await expect(cellsOfNuffic.nth(0)).toHaveText('Nuffic');
  await expect(
    cellsOfNuffic.nth(2).locator('.MuiRadio-root.Mui-checked'),
  ).toBeVisible();
  await expect(cellsOfNuffic.nth(3).locator('input[type="text"]')).toBeEmpty();

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
});
