import { expect, test } from '@playwright/test';
import * as dateFns from 'date-fns';

import {
  expectRequestData,
  expectVisibleAndAttached,
} from '@/playwright/helpers/testUtils';
import { mockAll } from '@/playwright/mocks';

const HAKEMUS_OID = '1.2.246.562.10.00000000001';
const VALITUSTIEDOT_URL = `/tutu-frontend/hakemus/${HAKEMUS_OID}/valitustiedot`;

test.beforeEach(async ({ page }) => {
  await mockAll({ page });

  await page.route(
    '**/tutu-backend/api/hakemus/*/valitustiedot**',
    async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: route.request().postData() ?? '{}',
        });
        return;
      }
      await route.fallback();
    },
  );

  await page.goto(VALITUSTIEDOT_URL);
});

test('KHO valitettu, valintaruutu näyttää ja piilottaa päivämääräkentät, ja tallentaa muutokset', async ({
  page,
}) => {
  const valitettuCheckbox = page.getByTestId('valituskho-valitettu-checkbox');
  const valitusPvmCalendar = page.getByTestId('valituskho-valituspvm-calendar');
  const ratkaisuPvmCalendar = page.getByTestId(
    'valituskho-ratkaisupvm-calendar',
  );

  await expect(valitettuCheckbox).not.toBeChecked();
  await expect(valitusPvmCalendar).toBeHidden();
  await expect(ratkaisuPvmCalendar).toBeHidden();

  await expectRequestData(page, '/valitustiedot', valitettuCheckbox.click(), {
    valitusKHO: { valitettu: true },
  });

  await expect(valitettuCheckbox).toBeChecked();
  await expect(valitusPvmCalendar).toBeVisible();
  await expect(ratkaisuPvmCalendar).toBeVisible();

  const saveButton = page.getByTestId('save-ribbon-button');
  const [uncheckRequest] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/valitustiedot') && req.method() === 'PUT',
    ),
    (async () => {
      await valitettuCheckbox.click();
      await expectVisibleAndAttached(saveButton);
      await saveButton.click();
    })(),
  ]);

  const requestBody = uncheckRequest.postDataJSON();
  expect(requestBody.valitusKHO.valitettu).toBe(false);
  expect(requestBody.valitusKHO.valitusPvm).toBeUndefined();
  expect(requestBody.valitusKHO.ratkaisuPvm).toBeUndefined();

  await expect(valitettuCheckbox).not.toBeChecked();
  await expect(valitusPvmCalendar).toBeHidden();
});

test('KHO ratkaisupäivä on lukittu kunnes valituspäivä on valittu', async ({
  page,
}) => {
  await page.getByTestId('valituskho-valitettu-checkbox').click();

  const valitusPvmInput = page
    .getByTestId('valituskho-valituspvm-calendar')
    .locator('input');
  const ratkaisuPvmInput = page
    .getByTestId('valituskho-ratkaisupvm-calendar')
    .locator('input');

  await expect(ratkaisuPvmInput).toBeDisabled();

  await expectRequestData(
    page,
    '/valitustiedot',
    (async () => {
      await valitusPvmInput.click();
      await page.locator('.react-datepicker__day--today').click();
      await page.locator('body').click({ position: { x: 1, y: 1 } });
    })(),
    {
      valitusKHO: {
        valitusPvm: expect.any(String),
      },
    },
  );

  await expect(valitusPvmInput).toHaveValue(
    dateFns.format(new Date(), 'dd.MM.yyyy'),
  );
  await expect(ratkaisuPvmInput).toBeEnabled();

  await expectRequestData(
    page,
    '/valitustiedot',
    (async () => {
      await ratkaisuPvmInput.click();
      await page.locator('.react-datepicker__day--today').click();
      await page.locator('body').click({ position: { x: 1, y: 1 } });
    })(),
    {
      valitusKHO: {
        ratkaisuPvm: expect.any(String),
      },
    },
  );

  await expect(ratkaisuPvmInput).toHaveValue(
    dateFns.format(new Date(), 'dd.MM.yyyy'),
  );
});

test('KHO valitusPvm tyhjentäminen tyhjentää myös ratkaisuPvm', async ({
  page,
}) => {
  await page.getByTestId('valituskho-valitettu-checkbox').click();

  const valituspvmInput = page
    .getByTestId('valituskho-valituspvm-calendar')
    .locator('input');
  const ratkaisupvmInput = page
    .getByTestId('valituskho-ratkaisupvm-calendar')
    .locator('input');

  await valituspvmInput.click();
  await page.locator('.react-datepicker__day--today').click();
  await page.locator('body').click({ position: { x: 1, y: 1 } });

  await ratkaisupvmInput.click();
  await page.locator('.react-datepicker__day--today').click();
  await page.locator('body').click({ position: { x: 1, y: 1 } });

  const saveButton = page.getByTestId('save-ribbon-button');
  const [clearRequest] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/valitustiedot') && req.method() === 'PUT',
    ),
    (async () => {
      await valituspvmInput.click();
      await valituspvmInput.selectText();
      await page.keyboard.press('Backspace');
      await page.locator('body').click({ position: { x: 1, y: 1 } });
      await expectVisibleAndAttached(saveButton);
      await saveButton.click();
    })(),
  ]);

  const requestBody = clearRequest.postDataJSON();
  expect(requestBody.valitusKHO.valitusPvm).toBeUndefined();
  expect(requestBody.valitusKHO.ratkaisuPvm).toBeUndefined();

  await expect(valituspvmInput).toHaveValue('');
  await expect(ratkaisupvmInput).toHaveValue('');
  await expect(ratkaisupvmInput).toBeDisabled();
});
