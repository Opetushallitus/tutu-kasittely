import { expect, Page, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import * as dateFns from 'date-fns';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';

const matchUpdate = (url: string, method: string) =>
  url.includes('/perustelu/1.2.246.562.10.00000000001') && method === 'PUT';

const matchingDate = () => {
  const testDate = new Date(2025, 8, 26, 0, 0, 0, 0);
  return dateFns.format(testDate, DATE_TIME_STANDARD_PLACEHOLDER);
};

const mockPerustelu = (page: Page) => {
  return page.route(
    `**/perustelu/1.2.246.562.10.00000000001`,
    async (route) => {
      const perustelu = getPerustelu();
      const method = route.request().method();

      if (method === 'PUT') {
        const putData = route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(putData),
        });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...perustelu,
          }),
        });
      }
    },
  );
};

test.beforeEach(async ({ page }) => {
  await mockAll({ page });
  await mockPerustelu(page);
});

test('Lausuntokentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );
  await expect(page.getByTestId('perustelu-layout-otsikko')).toHaveText(
    'Lausuntopyynnöt',
  );
  const lausuntopyyntoLisatietoInput = page.getByTestId(
    'pyyntojenLisatiedot-input',
  );
  const lausuntoSisaltoInput = page.getByTestId('lausunnonSisalto-input');
  await expect(lausuntopyyntoLisatietoInput).toHaveValue('pyynö');
  await expect(lausuntoSisaltoInput).toHaveValue('sisältö');

  await expect(page.getByTestId('lausuntopyynto-otsikko-1')).toHaveText(
    'Lausuntopyyntö 1',
  );
  const lausunnonAntaja1 = page.getByTestId('lausunnon-antaja-1');
  const lahetetty1 = page.getByTestId('lausuntoPyyntoLahetetty-calendar-1');
  const vastattu1 = page.getByTestId('lausuntoPyyntoVastattu-calendar-1');

  await expect(lausunnonAntaja1).toHaveValue('Kostaja');
  await expect(lahetetty1.locator('input')).toHaveValue('01.09.2025');
  await expect(vastattu1.locator('input')).toHaveValue('30.09.2025');

  await expect(page.getByTestId('lausuntopyynto-otsikko-2')).toHaveText(
    'Lausuntopyyntö 2',
  );
  await expect(page.getByTestId('lausunnon-antaja-2')).toHaveValue(
    'Aas Weckström',
  );
  await expect(
    page.getByTestId('lausuntoPyyntoLahetetty-calendar-2').locator('input'),
  ).toHaveValue('01.11.2025');
  await expect(
    page.getByTestId('lausuntoPyyntoVastattu-calendar-2').locator('input'),
  ).toHaveValue('30.11.2025');

  await lausuntopyyntoLisatietoInput.fill('lisääää');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntoPyyntojenLisatiedot).toEqual(
      'lisääää',
    ),
  );

  // Wait for mutation state to settle after save
  await page.waitForTimeout(100);

  await lausuntoSisaltoInput.fill('sisältöä elämähän');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausunnonSisalto).toEqual('sisältöä elämähän'),
  );

  // Wait for mutation state to settle after save
  await page.waitForTimeout(100);

  await lausunnonAntaja1.fill('Esko Mörkö');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].lausunnonAntaja).toEqual(
      'Esko Mörkö',
    ),
  );

  // Wait for mutation state to settle after save
  await page.waitForTimeout(100);

  await lahetetty1.click();
  await page.locator('.react-datepicker__day--026').click();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].lahetetty).toEqual(
      matchingDate(),
    ),
  );

  // Wait for mutation state to settle after save
  await page.waitForTimeout(100);

  await vastattu1.click();
  await page.locator('.react-datepicker__day--026').click();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].saapunut).toEqual(
      matchingDate(),
    ),
  );
});

test('Lausuntopyyntöjen lisäys ja poisto toimivat oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );
  await page.getByTestId('lisaa-lausuntopyynto-button').click();
  await expect(page.getByTestId('lausuntopyynto-otsikko-3')).toHaveText(
    'Lausuntopyyntö 3',
  );

  await page.getByTestId('lausunnon-antaja-3').fill('Pertti Keinonen');

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) => {
    const pyynnot = req[0].postDataJSON().lausuntopyynnot;
    expect(pyynnot.length).toEqual(3);
    expect(pyynnot[0].lausunnonAntaja).toEqual('Kostaja');
    expect(pyynnot[1].lausunnonAntaja).toEqual('Aas Weckström');
    expect(pyynnot[2].lausunnonAntaja).toEqual('Pertti Keinonen');
  });

  await page.getByTestId('poista-lausuntopyynto-button-2').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await page.getByTestId('modal-confirm-button').click();

  await expect(page.getByRole('button', { name: 'Tallenna' })).toBeVisible();
  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByRole('button', { name: 'Tallenna' }).click(),
  ]).then((req) => {
    const pyynnot = req[0].postDataJSON().lausuntopyynnot;
    expect(pyynnot.length).toEqual(2);
    expect(pyynnot[0].lausunnonAntaja).toEqual('Kostaja');
    expect(pyynnot[1].lausunnonAntaja).toEqual('Pertti Keinonen');
  });
});
