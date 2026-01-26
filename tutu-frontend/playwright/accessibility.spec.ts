import AxeBuilder from '@axe-core/playwright';
import { Page, expect, test } from '@playwright/test';

import { getPerustelu } from '@/playwright/fixtures/perustelu1';
import { mockAll } from '@/playwright/mocks';

import { translate } from './helpers/translate';

const expectPageAccessibilityOk = async (page: Page) => {
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
  expect(accessibilityScanResults.violations).toEqual([]);
};

test.beforeEach(mockAll);

test('Saavutettavuus listanäkymä ok', async ({ page }) => {
  await page.goto('/');
  const otsikko = await translate(page, 'hakemuslista.otsikko');
  await expect(page.locator('h1')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustiedot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustiedot');
  const otsikko = await translate(page, 'hakemus.perustiedot.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus asiakirjat ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/asiakirjat');
  const otsikko = await translate(page, 'hakemus.asiakirjat.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus tutkinnot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/tutkinnot');
  const otsikko = await translate(page, 'hakemus.tutkinnot.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut yleiset ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/yleiset/perustelut');
  const otsikko = await translate(page, 'hakemus.perustelu.yleiset.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut yleiset lausuntotiedot ok', async ({
  page,
}) => {
  test.skip();
  await page.route(`**/tutu-backend/api/perustelu/**`, async (route) => {
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
  });
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/yleiset/lausunto');
  const otsikko = await translate(
    page,
    'hakemus.perustelu.lausuntotiedot.lausuntopyynnot',
  );
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut uoro ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/uoro');
  const otsikko = await translate(page, 'hakemus.perustelu.uoro.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus perustelut ap ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/perustelu/ap');
  const otsikko = await translate(page, 'hakemus.perustelu.ap.otsikko');
  await expect(page.locator('h2')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus päätös ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/paatostiedot');
  const otsikko = await translate(page, 'hakemus.paatos.otsikko');
  await expect(page.locator('h1')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});

test('Saavutettavuus valitustiedot ok', async ({ page }) => {
  test.skip();
  await page.goto('/tutu-frontend/hakemus/oid/valitustiedot');
  const otsikko = await translate(page, 'hakemus.valitustiedot.otsikko');
  await expect(page.locator('h1')).toHaveText(otsikko);
  await expectPageAccessibilityOk(page);
});
