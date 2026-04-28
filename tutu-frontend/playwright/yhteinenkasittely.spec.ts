import { test, expect } from '@playwright/test';

import { translate } from './helpers/translate';
import { mockAll } from './mocks';

test.beforeEach(mockAll);

test('Yhteinen käsittely näkyy oikein', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
  );

  const otsikkoTeksti = await translate(
    page,
    'hakemus.yhteinenkasittely.otsikko',
  );

  const otsikko = page.getByTestId('yhteinenkasittely-otsikko');
  await expect(otsikko).toHaveText(otsikkoTeksti);

  const uusiKasittely = await translate(
    page,
    'hakemus.yhteinenkasittely.uusiYhteinenKasittely',
  );

  await expect(page.getByTestId('uusi-yhteinen-kasittely-btn')).toHaveText(
    uusiKasittely,
  );

  await expect(page.getByTestId('kysymys-q1')).toBeVisible();

  await page.getByTestId('kysymys-q1').click();

  const textbox = page.getByRole('textbox');
  await expect(textbox).toBeVisible();
  await textbox.fill('Testivastaus');

  const lahetaVastaus = await translate(
    page,
    'hakemus.yhteinenkasittely.lahetaVastaus',
  );

  await page.getByRole('button', { name: lahetaVastaus }).click();

  await expect(textbox).toHaveValue('Testivastaus');
});

test('Yhteisen käsittelyn luominen', async ({ page }) => {
  await page.goto(
    '/tutu-frontend/hakemus/1.2.246.562.10.00000000001/yhteinenkasittely',
  );

  const uusiKasittely = page.getByTestId('uusi-yhteinen-kasittely-btn');
  await uusiKasittely.click();

  const tyopariSelect = page.getByTestId(
    'yhteinenkasittely-uusiKasittely-tyopari',
  );
  await tyopariSelect.click();
  const tyopariOption = page.locator(
    "xpath=//li[@data-value='1.2.246.562.24.999999999999']",
  );
  await tyopariOption.click();

  const kysymysInput = page
    .getByTestId('yhteinenkasittely-uusiKasittely-kysymys')
    .locator('textarea')
    .first();
  await kysymysInput.fill('Kysymys content');

  const sendButton = page.getByTestId('yhteinenkasittely-uusiKasittely-laheta');
  await sendButton.click();

  // Verify
  const uusiKasittelyRivi = page
    .locator("xpath=//p[text()='Kysymys content']")
    .first();
  await expect(uusiKasittelyRivi).toBeVisible();
});
