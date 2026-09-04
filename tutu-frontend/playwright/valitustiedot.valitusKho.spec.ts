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

test('KHO:n ratkaisu, radiovalinnat näytetään jos valitettu, valinta tallentuu ja on tyhjennettävissä', async ({
  page,
}) => {
  const ratkaisuRadioGroup = page.getByTestId(
    'valituskho-ratkaisu-radio-group',
  );
  const ratkaisuClearButton = page.getByTestId(
    'valituskho-ratkaisu-radio-group-clear-button',
  );

  await expect(ratkaisuRadioGroup).toBeHidden();

  await page.getByTestId('valituskho-valitettu-checkbox').click();

  await expect(ratkaisuRadioGroup).toBeVisible();
  await expect(ratkaisuClearButton).toBeHidden();

  const ratkaisuValues = [
    'EiValituslupaa',
    'HakijanVaatimusHylatty',
    'UudelleenOPHKasittelyyn',
    'KhoErilainenPaatos',
    'KhoKasittelyRauennut',
  ];

  for (const value of ratkaisuValues) {
    await expect(
      ratkaisuRadioGroup.locator(`input[type="radio"][value="${value}"]`),
    ).toBeVisible();
  }

  await expectRequestData(
    page,
    '/valitustiedot',
    ratkaisuRadioGroup
      .locator('input[type="radio"][value="HakijanVaatimusHylatty"]')
      .click(),
    {
      valitusKHO: { ratkaisu: 'HakijanVaatimusHylatty' },
    },
  );

  await expect(
    ratkaisuRadioGroup.locator(
      'input[type="radio"][value="HakijanVaatimusHylatty"]',
    ),
  ).toBeChecked();
  await expect(ratkaisuClearButton).toBeVisible();

  await expectRequestData(
    page,
    '/valitustiedot',
    ratkaisuRadioGroup
      .locator('input[type="radio"][value="KhoKasittelyRauennut"]')
      .click(),
    {
      valitusKHO: { ratkaisu: 'KhoKasittelyRauennut' },
    },
  );

  await expect(
    ratkaisuRadioGroup.locator(
      'input[type="radio"][value="HakijanVaatimusHylatty"]',
    ),
  ).not.toBeChecked();
  await expect(
    ratkaisuRadioGroup.locator(
      'input[type="radio"][value="KhoKasittelyRauennut"]',
    ),
  ).toBeChecked();

  const saveButton = page.getByTestId('save-ribbon-button');
  const [clearRequest] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/valitustiedot') && req.method() === 'PUT',
    ),
    (async () => {
      await ratkaisuClearButton.click();
      await expectVisibleAndAttached(saveButton);
      await saveButton.click();
    })(),
  ]);
  expect(clearRequest.postDataJSON().valitusKHO.ratkaisu).toBeUndefined();

  await expect(ratkaisuClearButton).toBeHidden();
  for (const value of ratkaisuValues) {
    await expect(
      ratkaisuRadioGroup.locator(`input[type="radio"][value="${value}"]`),
    ).not.toBeChecked();
  }
});

test('KHO:n lisätietokenttä näytetään kun ratkaisu on valittu, tallentuu ja tyhjenee kun ratkaisun poistaa', async ({
  page,
}) => {
  const ratkaisuRadioGroup = page.getByTestId(
    'valituskho-ratkaisu-radio-group',
  );
  const ratkaisuClearButton = page.getByTestId(
    'valituskho-ratkaisu-radio-group-clear-button',
  );
  const ratkaisuLisatietoInput = page.getByTestId(
    'valituskho-ratkaisulisatieto-input',
  );

  await page.getByTestId('valituskho-valitettu-checkbox').click();

  await expect(ratkaisuLisatietoInput).toBeHidden();

  await ratkaisuRadioGroup
    .locator('input[type="radio"][value="HakijanVaatimusHylatty"]')
    .click();

  await expect(ratkaisuLisatietoInput).toBeVisible();

  await expectRequestData(
    page,
    '/valitustiedot',
    ratkaisuLisatietoInput
      .getByRole('textbox')
      .fill('Tarkempi selitys ratkaisusta'),
    {
      valitusKHO: { ratkaisuLisatieto: 'Tarkempi selitys ratkaisusta' },
    },
  );

  const saveButton = page.getByTestId('save-ribbon-button');
  const [clearRequest] = await Promise.all([
    page.waitForRequest(
      (req) => req.url().includes('/valitustiedot') && req.method() === 'PUT',
    ),
    (async () => {
      await ratkaisuClearButton.click();
      await expectVisibleAndAttached(saveButton);
      await saveButton.click();
    })(),
  ]);

  const requestBody = clearRequest.postDataJSON();
  expect(requestBody.valitusKHO.ratkaisu).toBeUndefined();
  expect(requestBody.valitusKHO.ratkaisuLisatieto).toBeUndefined();

  await expect(ratkaisuLisatietoInput).toBeHidden();
});

test('KHO:n ratkaisu piilotetaan ja tyhjennetään kun valitus poistetaan', async ({
  page,
}) => {
  const valitettuCheckbox = page.getByTestId('valituskho-valitettu-checkbox');
  const ratkaisuRadioGroup = page.getByTestId(
    'valituskho-ratkaisu-radio-group',
  );
  const ratkaisuLisatietoInput = page.getByTestId(
    'valituskho-ratkaisulisatieto-input',
  );

  await valitettuCheckbox.click();
  await ratkaisuRadioGroup
    .locator('input[type="radio"][value="KhoErilainenPaatos"]')
    .click();
  await ratkaisuLisatietoInput
    .getByRole('textbox')
    .fill('Tarkempi selitys ratkaisusta');

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
  expect(requestBody.valitusKHO.ratkaisu).toBeUndefined();
  expect(requestBody.valitusKHO.ratkaisuLisatieto).toBeUndefined();

  await expect(ratkaisuRadioGroup).toBeHidden();
  await expect(ratkaisuLisatietoInput).toBeHidden();
});
