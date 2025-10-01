import { expect, Page, test } from '@playwright/test';
import { mockAll } from '@/playwright/mocks';
import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import * as dateFns from 'date-fns';
import { DATE_TIME_STANDARD_PLACEHOLDER } from '@/src/constants/constants';

test.beforeEach(mockAll);

const matchUpdate = (url: string, method: string) =>
  url.includes('/perustelu/1.2.246.562.10.00000000001') && method === 'POST';

const matchingDate = () => {
  const testDate = new Date(2025, 8, 26, 0, 0, 0, 0);
  return dateFns.format(testDate, DATE_TIME_STANDARD_PLACEHOLDER);
};

const mockPerustelu = (page: Page) => {
  return page.route(
    `**/perustelu/1.2.246.562.10.00000000001`,
    async (route) => {
      const perustelu = getPerustelu();
      if (route.request().method() === 'GET') {
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

test('Lausuntokentät näkyvät oikein ja kenttien muutos lähettää POST-kutsun backendille', async ({
  page,
}) => {
  mockPerustelu(page);
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

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    lausuntopyyntoLisatietoInput.fill('lisääää'),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntoPyyntojenLisatiedot).toEqual(
      'lisääää',
    ),
  );

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    lausuntoSisaltoInput.fill('sisältöä elämähän'),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausunnonSisalto).toEqual('sisältöä elämähän'),
  );

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    lausunnonAntaja1.fill('Esko Mörkö'),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].lausunnonAntaja).toEqual(
      'Esko Mörkö',
    ),
  );

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    lahetetty1.click(),
    page.locator('.react-datepicker__day--026').click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].lahetetty).toEqual(
      matchingDate(),
    ),
  );

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    vastattu1.click(),
    page.locator('.react-datepicker__day--026').click(),
  ]).then((req) =>
    expect(req[0].postDataJSON().lausuntopyynnot[0].saapunut).toEqual(
      matchingDate(),
    ),
  );
});

test('Lausuntopyyntöjen lisäys ja poisto toimivat oikein', async ({ page }) => {
  mockPerustelu(page);
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/perustelu/yleiset/lausunto/',
  );
  await page.getByTestId('lisaa-lausuntopyynto-button').click();
  await expect(page.getByTestId('lausuntopyynto-otsikko-3')).toHaveText(
    'Lausuntopyyntö 3',
  );

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    page.getByTestId('lausunnon-antaja-3').fill('Pertti Keinonen'),
  ]).then((req) => {
    const pyynnot = req[0].postDataJSON().lausuntopyynnot;
    expect(pyynnot.length).toEqual(3);
    expect(pyynnot[0].lausunnonAntaja).toEqual('Kostaja');
    expect(pyynnot[1].lausunnonAntaja).toEqual('Aas Weckström');
    expect(pyynnot[2].lausunnonAntaja).toEqual('Pertti Keinonen');
  });

  await page.getByTestId('poista-lausuntopyynto-button-2').click();
  await expect(page.getByTestId('modal-component')).toBeVisible();

  await Promise.all([
    page.waitForRequest((req) => matchUpdate(req.url(), req.method())),
    (async () => {
      await page.getByTestId('modal-confirm-button').click();
    })(),
  ]).then((req) => {
    const pyynnot = req[0].postDataJSON().lausuntopyynnot;
    expect(pyynnot.length).toEqual(2);
    expect(pyynnot[0].lausunnonAntaja).toEqual('Kostaja');
    expect(pyynnot[1].lausunnonAntaja).toEqual('Pertti Keinonen');
  });
});
